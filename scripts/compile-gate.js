#!/usr/bin/env node

/**
 * compile-gate.js
 *
 * Gate 2 of the post-gen pipeline. Runs the target ecosystem's
 * authoritative type-check / compile command against generated code
 * and reports a structured pass/fail.
 *
 * Usage:
 *   node scripts/compile-gate.js --code <dir> [--target <id>] [--json]
 *
 * Targets (auto-detected from the code dir if --target is omitted):
 *   ts | tsx | node-ts  → npx tsc --noEmit
 *   python              → python -m py_compile (or pyright if installed)
 *   go                  → go build ./...
 *   dart | flutter      → dart analyze
 *   js                  → node --check on each file (syntax only)
 *
 * Exit codes:
 *   0 — clean compile
 *   2 — compile / type errors found
 *   3 — usage / IO error / no compatible target detected
 *
 * Report shape (--json):
 *   { target, command, exit_code, findings: [{file?, line?, rule, severity, message}], summary }
 *
 * Why this exists: Gate 1 (post-gen-scan) catches placeholder text;
 * Gate 2 catches code that won't compile or type-check. Together they
 * eliminate the two cheapest defect classes before the AI PR review
 * (Gate 3) ever runs.
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative, extname } from 'path';
import { spawnSync } from 'child_process';

// ─── Target detection ─────────────────────────────────────────────────────

function detectTarget(codeDir) {
  if (existsSync(join(codeDir, 'tsconfig.json'))) return 'ts';
  if (existsSync(join(codeDir, 'pubspec.yaml'))) return 'dart';
  if (existsSync(join(codeDir, 'go.mod'))) return 'go';
  if (existsSync(join(codeDir, 'pyproject.toml')) || existsSync(join(codeDir, 'requirements.txt'))) return 'python';
  // Fallback heuristics by file extension presence.
  const exts = collectExtensions(codeDir);
  if (exts.has('.ts') || exts.has('.tsx')) return 'ts';
  if (exts.has('.dart')) return 'dart';
  if (exts.has('.go')) return 'go';
  if (exts.has('.py')) return 'python';
  if (exts.has('.js') || exts.has('.jsx') || exts.has('.mjs') || exts.has('.cjs')) return 'js';
  return null;
}

function collectExtensions(dir, out = new Set(), depth = 0) {
  if (depth > 6) return out;
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.git') || e === 'dist' || e === 'build') continue;
    const full = join(dir, e);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) collectExtensions(full, out, depth + 1);
    else out.add(extname(e).toLowerCase());
  }
  return out;
}

// ─── Per-target runners ───────────────────────────────────────────────────
// Each runner returns `{ command, findings, exitCode }`. A finding shape is
// `{ file?, line?, rule, severity, message }`. All compile errors are
// `severity: 'critical'`.

function runTypescript(codeDir) {
  const command = 'npx --no-install tsc --noEmit -p .';
  const result = spawnSync('npx', ['--no-install', 'tsc', '--noEmit', '-p', '.'], {
    cwd: codeDir,
    encoding: 'utf-8',
  });
  if (result.error && result.error.code === 'ENOENT') {
    return toolUnavailable('tsc', command, 'npm i -D typescript');
  }
  return parseTscOutput(command, result, codeDir);
}

function parseTscOutput(command, result, codeDir) {
  const exitCode = result.status ?? 1;
  const findings = [];
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const text = stdout + '\n' + stderr;
  // tsc output: `path/to/file.ts(LINE,COL): error TSxxxx: message`
  const lineRe = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/gm;
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    findings.push({
      file: relative(process.cwd(), join(codeDir, m[1])),
      line: parseInt(m[2], 10),
      rule: m[5],
      severity: m[4] === 'error' ? 'critical' : 'warn',
      message: m[6].trim(),
    });
  }
  // If exit was non-zero but no parseable lines, surface the raw stderr as
  // a single finding so the user gets actionable output.
  if (exitCode !== 0 && findings.length === 0) {
    findings.push({
      rule: 'compile-failed',
      severity: 'critical',
      message: (stderr || stdout || 'tsc exited non-zero with no output').trim().split('\n').slice(0, 5).join(' | '),
    });
  }
  return { command, findings, exitCode };
}

function runPython(codeDir) {
  // Prefer pyright when available; fall back to py_compile.
  const pyright = spawnSync('pyright', ['--version'], { encoding: 'utf-8' });
  if (!pyright.error) return runPyright(codeDir);
  return runPyCompile(codeDir);
}

function runPyright(codeDir) {
  const command = 'pyright .';
  const result = spawnSync('pyright', ['.'], { cwd: codeDir, encoding: 'utf-8' });
  const exitCode = result.status ?? 1;
  const findings = [];
  // pyright lines: `  /abs/path/file.py:LINE:COL - error: message`
  const lineRe = /^\s*(.+?):(\d+):(\d+)\s+-\s+(error|warning|information):\s+(.+)$/gm;
  const text = (result.stdout || '') + '\n' + (result.stderr || '');
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    findings.push({
      file: relative(process.cwd(), m[1]),
      line: parseInt(m[2], 10),
      rule: 'pyright',
      severity: m[4] === 'error' ? 'critical' : 'warn',
      message: m[5].trim(),
    });
  }
  if (exitCode !== 0 && findings.length === 0) {
    findings.push({ rule: 'compile-failed', severity: 'critical', message: (result.stderr || result.stdout || 'pyright failed').trim() });
  }
  return { command, findings, exitCode };
}

function runPyCompile(codeDir) {
  const command = 'python -m py_compile <every .py>';
  const files = listFilesByExt(codeDir, ['.py']);
  if (files.length === 0) return { command, findings: [], exitCode: 0 };
  const result = spawnSync('python', ['-m', 'py_compile', ...files], { cwd: codeDir, encoding: 'utf-8' });
  if (result.error && result.error.code === 'ENOENT') {
    return toolUnavailable('python', command, 'install Python 3.x');
  }
  const exitCode = result.status ?? 1;
  const findings = [];
  if (exitCode !== 0) {
    // py_compile uses stderr like:  File "x.py", line N\n    ...\nSyntaxError: ...
    const fileRe = /File\s+"([^"]+)",\s+line\s+(\d+)[\s\S]*?(SyntaxError|IndentationError|TabError):\s+(.+?)(?:\n|$)/g;
    const text = result.stderr || result.stdout || '';
    let m;
    while ((m = fileRe.exec(text)) !== null) {
      findings.push({
        file: relative(process.cwd(), m[1]),
        line: parseInt(m[2], 10),
        rule: m[3],
        severity: 'critical',
        message: m[4].trim(),
      });
    }
    if (findings.length === 0) {
      findings.push({ rule: 'compile-failed', severity: 'critical', message: (result.stderr || 'py_compile failed').trim().split('\n').slice(0, 3).join(' | ') });
    }
  }
  return { command, findings, exitCode };
}

function runGo(codeDir) {
  const command = 'go build ./...';
  const result = spawnSync('go', ['build', './...'], { cwd: codeDir, encoding: 'utf-8' });
  if (result.error && result.error.code === 'ENOENT') {
    return toolUnavailable('go', command, 'install Go from https://go.dev/dl/');
  }
  const exitCode = result.status ?? 1;
  const findings = [];
  // go build error lines: `path/file.go:LINE:COL: message`
  const lineRe = /^(.+?\.go):(\d+):(\d+):\s+(.+)$/gm;
  const text = (result.stdout || '') + '\n' + (result.stderr || '');
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    findings.push({
      file: relative(process.cwd(), join(codeDir, m[1])),
      line: parseInt(m[2], 10),
      rule: 'go-build',
      severity: 'critical',
      message: m[4].trim(),
    });
  }
  if (exitCode !== 0 && findings.length === 0) {
    findings.push({ rule: 'compile-failed', severity: 'critical', message: (result.stderr || 'go build failed').trim().split('\n').slice(0, 3).join(' | ') });
  }
  return { command, findings, exitCode };
}

function runDart(codeDir) {
  const command = 'dart analyze .';
  const result = spawnSync('dart', ['analyze', '.'], { cwd: codeDir, encoding: 'utf-8' });
  if (result.error && result.error.code === 'ENOENT') {
    return toolUnavailable('dart', command, 'install Dart/Flutter SDK');
  }
  const exitCode = result.status ?? 1;
  const findings = [];
  // dart analyze line: `  error • message at path:LINE:COL • code`
  const lineRe = /^\s*(error|warning|info)\s+•\s+(.+?)\s+at\s+(.+?):(\d+):(\d+)\s+•\s+(\S+)/gm;
  const text = (result.stdout || '') + '\n' + (result.stderr || '');
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    findings.push({
      file: relative(process.cwd(), join(codeDir, m[3])),
      line: parseInt(m[4], 10),
      rule: m[6],
      severity: m[1] === 'error' ? 'critical' : 'warn',
      message: m[2].trim(),
    });
  }
  if (exitCode !== 0 && findings.length === 0) {
    findings.push({ rule: 'compile-failed', severity: 'critical', message: (result.stderr || 'dart analyze failed').trim() });
  }
  return { command, findings, exitCode };
}

function runJsSyntax(codeDir) {
  const command = 'node --check <every .js>';
  const files = listFilesByExt(codeDir, ['.js', '.mjs', '.cjs']);
  if (files.length === 0) return { command, findings: [], exitCode: 0 };
  const findings = [];
  let worstExit = 0;
  for (const f of files) {
    const result = spawnSync('node', ['--check', f], { encoding: 'utf-8' });
    if ((result.status ?? 0) !== 0) {
      worstExit = result.status || 1;
      const text = result.stderr || '';
      // node --check stderr: `path:line\n...\nSyntaxError: message`
      const m = text.match(/(.+?):(\d+)\n[\s\S]*?(SyntaxError|TypeError|ReferenceError):\s+(.+)/);
      if (m) {
        findings.push({ file: relative(process.cwd(), f), line: parseInt(m[2], 10), rule: m[3], severity: 'critical', message: m[4].trim() });
      } else {
        findings.push({ file: relative(process.cwd(), f), rule: 'syntax-error', severity: 'critical', message: text.trim().split('\n')[0] || 'node --check failed' });
      }
    }
  }
  return { command, findings, exitCode: worstExit };
}

function toolUnavailable(tool, command, install) {
  return {
    command,
    exitCode: 0,
    findings: [{
      rule: 'tool-unavailable',
      severity: 'warn',
      message: `${tool} is not installed — compile gate skipped. Install: ${install}`,
    }],
  };
}

function listFilesByExt(dir, exts, out = [], depth = 0) {
  if (depth > 6) return out;
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.git') || e === 'dist' || e === 'build') continue;
    const full = join(dir, e);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) listFilesByExt(full, exts, out, depth + 1);
    else if (exts.includes(extname(e).toLowerCase())) out.push(full);
  }
  return out;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

const RUNNERS = {
  ts: runTypescript,
  tsx: runTypescript,
  'node-ts': runTypescript,
  python: runPython,
  go: runGo,
  dart: runDart,
  flutter: runDart,
  js: runJsSyntax,
};

export function compile({ code, target }) {
  const codeDir = resolve(code);
  const tgt = target || detectTarget(codeDir);
  if (!tgt) {
    return {
      target: null,
      command: null,
      exit_code: 3,
      findings: [{ rule: 'no-target-detected', severity: 'warn', message: 'no compatible compile target detected (no tsconfig.json, pubspec.yaml, go.mod, pyproject.toml, or recognized source extensions)' }],
      summary: { critical: 0, warn: 1, info: 0 },
    };
  }
  const runner = RUNNERS[tgt];
  if (!runner) {
    return {
      target: tgt,
      command: null,
      exit_code: 3,
      findings: [{ rule: 'unsupported-target', severity: 'warn', message: `target '${tgt}' is not supported by compile-gate` }],
      summary: { critical: 0, warn: 1, info: 0 },
    };
  }
  const { command, findings, exitCode } = runner(codeDir);
  const summary = { critical: 0, warn: 0, info: 0 };
  for (const f of findings) summary[f.severity] = (summary[f.severity] || 0) + 1;
  return { target: tgt, command, exit_code: exitCode, findings, summary };
}

function severityToExit(report) {
  if (report.summary.critical > 0) return 2;
  if (report.exit_code === 3) return 3;
  return 0;
}

function formatHuman(report) {
  const lines = [];
  lines.push(`compile-gate — target=${report.target ?? 'none'} command=${report.command ?? 'n/a'}`);
  lines.push('');
  if (report.findings.length === 0) {
    lines.push('✓ clean — 0 findings');
    return lines.join('\n');
  }
  for (const f of report.findings) {
    const loc = f.file ? `${f.file}${f.line ? `:${f.line}` : ''}` : '<no-file>';
    lines.push(`${f.severity.toUpperCase().padEnd(8)} ${loc}  [${f.rule}]  ${f.message}`);
  }
  lines.push('');
  lines.push(`summary: ${report.summary.critical} critical, ${report.summary.warn} warn, ${report.summary.info} info`);
  return lines.join('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { code: null, target: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--code') args.code = argv[++i];
    else if (a === '--target') args.target = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function usage() {
  return [
    'Usage: node scripts/compile-gate.js --code <dir> [--target ts|python|go|dart|js] [--json]',
    '',
    'Auto-detects target from tsconfig.json / pubspec.yaml / go.mod / pyproject.toml,',
    'else falls back to file-extension presence.',
    '',
    'Exit codes: 0 clean, 2 compile errors, 3 usage / no target / unsupported target',
  ].join('\n');
}

function main() {
  let args;
  try { args = parseArgs(process.argv); }
  catch (e) { process.stderr.write(`${e.message}\n${usage()}\n`); process.exit(3); }
  if (args.help || !args.code) {
    process.stdout.write(`${usage()}\n`);
    process.exit(args.help ? 0 : 3);
  }
  const report = compile(args);
  if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else process.stdout.write(formatHuman(report) + '\n');
  process.exit(severityToExit(report));
}

const isMain = import.meta.url === `file://${process.argv[1]}` ||
               import.meta.url.endsWith(process.argv[1]);
if (isMain) main();
