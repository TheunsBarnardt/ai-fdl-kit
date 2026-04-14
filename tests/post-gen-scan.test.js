import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { scan } from '../scripts/post-gen-scan.js';

// ─── Helpers ──────────────────────────────────────────────────────────────

function writeBlueprint(dir, json) {
  const path = join(dir, 'blueprint.json');
  writeFileSync(path, JSON.stringify(json));
  return path;
}

function writeCode(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
}

function mkTempProject() {
  const root = mkdtempSync(join(tmpdir(), 'fdl-postgen-'));
  const codeDir = join(root, 'src');
  mkdirSync(codeDir, { recursive: true });
  return { root, codeDir };
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('post-gen-scan', () => {
  let tmp;
  before(() => { tmp = mkTempProject(); });
  after(() => { rmSync(tmp.root, { recursive: true, force: true }); });

  it('flags TODO markers as critical', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'login.ts': 'export function login() {\n  // TODO: implement password verification\n  return null;\n}\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const todos = report.findings.filter((f) => f.rule === 'no-placeholder-marker');
    assert.equal(todos.length, 1);
    assert.equal(todos[0].severity, 'critical');
    assert.equal(todos[0].line, 2);
  });

  it('flags mock/stub/fake identifiers outside test paths', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'login.ts': 'const mockUser = { id: 1 };\nexport const fakeToken = "abc";\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const placeholders = report.findings.filter((f) => f.rule === 'no-placeholder-identifier');
    assert.equal(placeholders.length, 2);
    assert.ok(placeholders.every((f) => f.severity === 'critical'));
  });

  it('allows mock/stub/fake identifiers inside test paths', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'login.test.ts': 'const mockUser = { id: 1 };\nconst fakeToken = "abc";\n',
      '__tests__/helpers.ts': 'export const mockClient = {};\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const placeholders = report.findings.filter((f) => f.rule === 'no-placeholder-identifier');
    assert.equal(placeholders.length, 0);
  });

  it('flags endpoint literals not declared in api.http.path (the 2026-04-12 incident replay)', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      // Generator invented `/api/v1/sessions` — the exact failure mode the gate must catch.
      'session.ts': 'await fetch("/api/v1/sessions", { method: "POST" });\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const undeclared = report.findings.filter((f) => f.rule === 'undeclared-endpoint');
    assert.equal(undeclared.length, 1, `findings: ${JSON.stringify(report.findings)}`);
    assert.equal(undeclared[0].severity, 'critical');
    assert.match(undeclared[0].message, /\/api\/v1\/sessions/);
  });

  it('passes endpoint literals that match a declared api.http.path', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'session.ts': 'await fetch("/auth/login", { method: "POST" });\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const undeclared = report.findings.filter((f) => f.rule === 'undeclared-endpoint');
    assert.equal(undeclared.length, 0);
  });

  it('flags secret patterns (sk-, AKIA, JWT) as critical', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'config' });
    writeCode(project.codeDir, {
      // Synthetic placeholder that matches the `sk-` pattern shape — not a real key.
      'config.ts': 'export const KEY = "sk-' + 'A'.repeat(30) + '";\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const secrets = report.findings.filter((f) => f.rule === 'no-secret-leak');
    assert.equal(secrets.length, 1);
    assert.equal(secrets[0].severity, 'critical');
    assert.equal(secrets[0].evidence, '<redacted>', 'secret evidence must never be echoed back');
  });

  it('flags localhost / example.com / test@test.com sample data', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'config' });
    writeCode(project.codeDir, {
      'app.ts': 'export const API = "http://localhost:3000";\nexport const EMAIL = "test@test.com";\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const samples = report.findings.filter((f) => f.rule === 'no-sample-data');
    assert.equal(samples.length, 2);
    assert.ok(samples.every((f) => f.severity === 'critical'));
  });

  it('returns 0 findings on a clean implementation', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'login.ts': [
        'import { hash } from "./hash";',
        '',
        'export async function login(email: string, password: string) {',
        '  const user = await db.user.findUnique({ where: { email } });',
        '  if (!user) throw new Error("INVALID_CREDENTIALS");',
        '  const ok = await hash.verify(user.passwordHash, password);',
        '  if (!ok) throw new Error("INVALID_CREDENTIALS");',
        '  return { userId: user.id };',
        '}',
        '',
      ].join('\n'),
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    assert.equal(report.findings.length, 0, `expected clean but got ${JSON.stringify(report.findings, null, 2)}`);
    assert.equal(report.summary.critical, 0);
  });

  it('does not run endpoint check when no api.http.path is declared', () => {
    const project = mkTempProject();
    // System-driven feature — no api block, so endpoint pinning is N/A.
    const bp = writeBlueprint(project.root, { feature: 'cron-sync' });
    writeCode(project.codeDir, {
      'sync.ts': 'await fetch("/some/internal/route");\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const undeclared = report.findings.filter((f) => f.rule === 'undeclared-endpoint');
    assert.equal(undeclared.length, 0);
  });

  it('skips ignored path prefixes (/components/, /lib/, etc.) when checking endpoints', () => {
    const project = mkTempProject();
    const bp = writeBlueprint(project.root, { feature: 'login', api: { http: { method: 'POST', path: '/auth/login' } } });
    writeCode(project.codeDir, {
      'page.tsx': 'import { Button } from "@/components/ui/button";\nimport { cn } from "@/lib/utils";\n',
    });

    const report = scan({ code: project.codeDir, blueprints: [bp] });
    rmSync(project.root, { recursive: true, force: true });

    const undeclared = report.findings.filter((f) => f.rule === 'undeclared-endpoint');
    assert.equal(undeclared.length, 0, `import paths should not trigger endpoint check: ${JSON.stringify(undeclared)}`);
  });
});
