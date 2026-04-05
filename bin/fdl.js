#!/usr/bin/env node

/**
 * ai-fdl-kit CLI
 *
 * One command to bootstrap FDL in any existing project — no clone required.
 *
 * Usage:
 *   npx ai-fdl-kit init [--tool <cursor|windsurf|copilot|...>]
 *   npx ai-fdl-kit install <tool>
 *   npx ai-fdl-kit list [--category <cat>]
 *   npx ai-fdl-kit show <category>/<feature>
 *   npx ai-fdl-kit pull <category>/<feature>
 *   npx ai-fdl-kit validate [file]
 *   npx ai-fdl-kit check [file]
 *   npx ai-fdl-kit version
 *   npx ai-fdl-kit help
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, "..");
const CWD = process.cwd();

const REMOTE_API = "https://theunsbarnardt.github.io/ai-fdl-kit/api";
const REPO_URL = "https://github.com/TheunsBarnardt/ai-fdl-kit";

// ─── Tiny color helpers (no chalk dependency) ─────────────

const supportsColor = process.stdout.isTTY && process.env.NO_COLOR == null;
const c = (code, s) => (supportsColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = (s) => c("1", s);
const dim = (s) => c("2", s);
const red = (s) => c("31", s);
const green = (s) => c("32", s);
const yellow = (s) => c("33", s);
const blue = (s) => c("34", s);
const cyan = (s) => c("36", s);

function print(msg) {
  process.stdout.write(msg + "\n");
}

function printErr(msg) {
  process.stderr.write(msg + "\n");
}

function die(msg, code = 1) {
  printErr(red("✗ ") + msg);
  process.exit(code);
}

// ─── Package metadata ─────────────────────────────────────

function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf-8"));
}

// ─── HTTP fetch with native Node ──────────────────────────

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return await res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return await res.text();
}

// ─── AI tool install targets ──────────────────────────────

const AI_TOOLS = {
  cursor: {
    name: "Cursor",
    path: ".cursor/rules/fdl.mdc",
    wrap: (body) =>
      `---\ndescription: FDL — AI Feature Definition Language blueprints\nalwaysApply: true\n---\n${body}\n`,
    append: false,
  },
  windsurf: {
    name: "Windsurf",
    path: ".windsurf/rules/fdl.md",
    wrap: (body) => body + "\n",
    append: false,
  },
  copilot: {
    name: "GitHub Copilot",
    path: ".github/copilot-instructions.md",
    wrap: (body) => body + "\n",
    append: true,
  },
  gemini: {
    name: "Gemini CLI",
    path: ".gemini/GEMINI.md",
    wrap: (body) => body + "\n",
    append: true,
  },
  continue: {
    name: "Continue",
    path: ".continue/rules/fdl.md",
    wrap: (body) => body + "\n",
    append: false,
  },
  cline: {
    name: "Cline",
    path: ".clinerules",
    wrap: (body) => body + "\n",
    append: true,
  },
  kiro: {
    name: "Kiro",
    path: ".kiro/steering/fdl.md",
    wrap: (body) => body + "\n",
    append: false,
  },
  amazonq: {
    name: "Amazon Q",
    path: ".aws/amazonq/instructions.md",
    wrap: (body) => body + "\n",
    append: true,
  },
  codex: {
    name: "OpenAI Codex CLI",
    path: ".codex/prompts/fdl.md",
    wrap: (body) => body + "\n",
    append: false,
  },
  claude: {
    name: "Claude Code",
    path: ".claude/CLAUDE.md",
    wrap: (body) => body + "\n",
    append: true,
  },
};

function compactInstructions({ hasLocalBlueprints }) {
  const source = hasLocalBlueprints
    ? "Local blueprints in the `blueprints/` directory of this project (prefer local; fall back to remote)."
    : `Remote API at ${REMOTE_API}/`;
  return `# FDL — AI Feature Definition Language

This project uses **ai-fdl-kit** for feature specifications. Blueprints are YAML files defining software features as acceptance criteria, fields, rules, and error codes — independent of any tech stack.

## Blueprint source

${source}

## How to find a blueprint

**Local:** \`blueprints/{category}/{feature}.blueprint.yaml\`
Categories: auth, data, access, ui, integration, notification, payment, workflow, inventory, manufacturing, crm, asset, project, quality, procurement, ai, trading, infrastructure, observability

**Remote fallback:**
1. \`GET ${REMOTE_API}/registry.json\` — list all blueprints
2. \`GET ${REMOTE_API}/blueprints/{category}/{feature}.json\` — fetch a specific one

## How to generate code from a blueprint

1. Load the blueprint (local or remote)
2. Read \`outcomes\` — acceptance criteria, sorted by \`priority\` (lower = checked first)
3. Read \`rules\` — constraints (security, business logic) — \`MUST:\` > \`SHOULD:\` > \`MAY:\`
4. Read \`fields\` — data model
5. Read \`errors\` — error responses with user-safe messages
6. Generate code that satisfies ALL outcomes for the target framework

## Priority = execution order
Lower priority number = checked first (guard clauses). Higher = success path.

## Structured conditions
- \`source: input\` — request body
- \`source: db\` — database lookup
- \`source: session\` — authenticated session state
- \`any:\` — OR group (at least one must match)
- Top-level \`given[]\` items are AND

## Structured side effects
- \`action: set_field\` — update field/variable
- \`action: emit_event\` — publish event
- \`action: transition_state\` — state-machine move
- \`action: create_record\` / \`delete_record\` — DB write
- \`action: call_service\` — external call

## Terminal discipline
When authoring new blueprints:
- Every blueprint MUST validate against the schema AND pass the completeness check
- No placeholder text (TODO, TBD, "fill this in")
- Every outcome bound to an \`error:\` must reference a code in \`errors[]\`
- Every blueprint must model both success and failure outcomes

See ${REPO_URL} for the full specification.
`;
}

// ─── Commands ─────────────────────────────────────────────

function cmdVersion() {
  const pkg = readPackageJson();
  print(`${bold(pkg.name)} v${pkg.version}`);
}

function cmdHelp() {
  const pkg = readPackageJson();
  print(`
${bold("ai-fdl-kit")} — AI Feature Definition Language toolkit  ${dim("v" + pkg.version)}

${bold("USAGE")}
  ${cyan("fdl")} <command> [options]

${bold("COMMANDS")}
  ${green("init")}              Bootstrap FDL in this project (schema, config, AI tool instructions)
  ${green("install")} <tool>    Add FDL instructions for an AI tool (${Object.keys(AI_TOOLS).join(", ")})
  ${green("list")}              List available blueprints from the remote registry
  ${green("show")} <feature>    Fetch and print a blueprint (category/name, e.g. auth/login)
  ${green("pull")} <feature>    Copy a remote blueprint into local blueprints/
  ${green("validate")} [file]   Run the schema validator (all blueprints or a single file)
  ${green("check")} [file]      Validate + completeness check
  ${green("version")}           Print version
  ${green("help")}              Show this help

${bold("EXAMPLES")}
  ${dim("# Bootstrap a new project with Cursor integration")}
  ${cyan("npx ai-fdl-kit init --tool cursor")}

  ${dim("# Browse what's available")}
  ${cyan("npx ai-fdl-kit list")}
  ${cyan("npx ai-fdl-kit list --category auth")}

  ${dim("# Grab a community blueprint")}
  ${cyan("npx ai-fdl-kit pull auth/login")}

  ${dim("# Validate your own blueprints")}
  ${cyan("npx ai-fdl-kit check")}

${bold("DOCS")}  ${REPO_URL}
`);
}

async function cmdInit(args) {
  const toolFlag = getFlag(args, "--tool");
  const skipInstall = args.includes("--no-install");
  print(bold("\n🏗  Initializing ai-fdl-kit in this project...\n"));

  // 1. Create blueprints directory
  const bpDir = path.join(CWD, "blueprints");
  if (!fs.existsSync(bpDir)) {
    fs.mkdirSync(bpDir, { recursive: true });
    print(`  ${green("✓")} created ${dim("blueprints/")}`);
  } else {
    print(`  ${yellow("•")} ${dim("blueprints/")} already exists`);
  }

  // 2. Copy schema from package into project (for IDE autocomplete)
  const schemaDir = path.join(CWD, "schema");
  fs.mkdirSync(schemaDir, { recursive: true });
  const schemaSrc = path.join(PKG_ROOT, "schema", "blueprint.schema.yaml");
  const schemaDest = path.join(schemaDir, "blueprint.schema.yaml");
  if (fs.existsSync(schemaSrc)) {
    if (!fs.existsSync(schemaDest)) {
      fs.copyFileSync(schemaSrc, schemaDest);
      print(`  ${green("✓")} copied ${dim("schema/blueprint.schema.yaml")}`);
    } else {
      print(`  ${yellow("•")} ${dim("schema/blueprint.schema.yaml")} already exists`);
    }
  }

  // 3. Write fdl.config.yaml
  const configPath = path.join(CWD, "fdl.config.yaml");
  if (!fs.existsSync(configPath)) {
    const config = `# ai-fdl-kit project configuration
# See ${REPO_URL}

# Local blueprint directory (relative to this file)
blueprints_dir: blueprints

# Remote API for pulling community blueprints
remote_api: ${REMOTE_API}

# Categories used in this project. Add more as needed.
categories:
  - auth
  - data
  - access
  - ui
  - integration
  - notification
  - payment
  - workflow

# Validation behavior
validation:
  # Fail the command if any blueprint is incomplete (placeholders, empty outcomes)
  strict_completeness: true
  # Require every blueprint to have at least one success AND one failure outcome
  require_failure_paths: true
`;
    fs.writeFileSync(configPath, config, "utf-8");
    print(`  ${green("✓")} wrote ${dim("fdl.config.yaml")}`);
  } else {
    print(`  ${yellow("•")} ${dim("fdl.config.yaml")} already exists`);
  }

  // 4. Append to .gitignore
  const gitignorePath = path.join(CWD, ".gitignore");
  const gitignoreMarker = "# ai-fdl-kit";
  const gitignoreBlock = `\n${gitignoreMarker}\n.fdl/cache/\n*.proposed.blueprint.yaml\n`;
  let gitignoreContents = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, "utf-8")
    : "";
  if (!gitignoreContents.includes(gitignoreMarker)) {
    fs.writeFileSync(gitignorePath, gitignoreContents + gitignoreBlock, "utf-8");
    print(`  ${green("✓")} updated ${dim(".gitignore")}`);
  }

  // 5. Install AI tool instructions (if requested)
  if (!skipInstall) {
    const tool = toolFlag || detectAITool();
    if (tool && AI_TOOLS[tool]) {
      installForTool(tool);
    } else if (tool) {
      print(`  ${yellow("•")} unknown tool "${tool}" — skipping install (run ${cyan("fdl install <tool>")} later)`);
    } else {
      print(`  ${dim("(no AI tool detected — run ${cyan('fdl install <tool>')} later)")}`);
    }
  }

  // 6. Done
  print(`\n${bold(green("✓ ai-fdl-kit initialized"))}\n`);
  print(bold("Next steps:"));
  print(`  ${cyan("fdl list")}              ${dim("# browse available blueprints")}`);
  print(`  ${cyan("fdl pull auth/login")}   ${dim("# copy a blueprint locally")}`);
  print(`  ${cyan("fdl check")}             ${dim("# validate your blueprints")}`);
  print(`  ${dim("Docs: " + REPO_URL)}\n`);
}

function detectAITool() {
  if (fs.existsSync(path.join(CWD, ".cursor"))) return "cursor";
  if (fs.existsSync(path.join(CWD, ".windsurf"))) return "windsurf";
  if (fs.existsSync(path.join(CWD, ".github"))) return "copilot";
  if (fs.existsSync(path.join(CWD, ".continue"))) return "continue";
  if (fs.existsSync(path.join(CWD, ".gemini"))) return "gemini";
  if (fs.existsSync(path.join(CWD, ".claude"))) return "claude";
  return null;
}

function installForTool(toolKey) {
  const tool = AI_TOOLS[toolKey];
  if (!tool) die(`unknown AI tool: ${toolKey}. Options: ${Object.keys(AI_TOOLS).join(", ")}`);

  const hasLocalBlueprints = fs.existsSync(path.join(CWD, "blueprints"));
  const body = compactInstructions({ hasLocalBlueprints });
  const content = tool.wrap(body);
  const dest = path.join(CWD, tool.path);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  if (tool.append && fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest, "utf-8");
    if (existing.includes("# FDL — AI Feature Definition Language")) {
      print(`  ${yellow("•")} ${tool.name} already has FDL instructions (${dim(tool.path)})`);
      return;
    }
    fs.writeFileSync(dest, existing + "\n\n" + content, "utf-8");
    print(`  ${green("✓")} appended FDL section to ${dim(tool.path)} (${tool.name})`);
  } else {
    fs.writeFileSync(dest, content, "utf-8");
    print(`  ${green("✓")} wrote ${dim(tool.path)} (${tool.name})`);
  }
}

function cmdInstall(args) {
  const [toolKey] = args;
  if (!toolKey) die("usage: fdl install <tool>\n  tools: " + Object.keys(AI_TOOLS).join(", "));
  installForTool(toolKey);
  print(`\n${bold(green("✓ installed"))} for ${AI_TOOLS[toolKey].name}`);
}

async function cmdList(args) {
  const categoryFilter = getFlag(args, "--category");
  print(dim(`\nFetching registry from ${REMOTE_API}/registry.json ...`));
  const registry = await fetchJson(`${REMOTE_API}/registry.json`).catch((err) => {
    die(`Failed to fetch registry: ${err.message}`);
  });

  const byCategory = {};
  const blueprints = Array.isArray(registry.blueprints)
    ? registry.blueprints
    : Object.values(registry.blueprints || {});

  for (const bp of blueprints) {
    if (!bp) continue;
    const cat = bp.category || "uncategorized";
    if (categoryFilter && cat !== categoryFilter) continue;
    (byCategory[cat] ||= []).push(bp);
  }

  print("");
  const categories = Object.keys(byCategory).sort();
  if (categories.length === 0) {
    print(yellow("  no blueprints matched"));
    return;
  }
  let total = 0;
  for (const cat of categories) {
    print(bold(cyan(`  ${cat}`)));
    for (const bp of byCategory[cat].sort((a, b) => (a.feature || "").localeCompare(b.feature || ""))) {
      const name = bp.feature || bp.name || "(unnamed)";
      const desc = (bp.description || "").slice(0, 70);
      print(`    ${green(name.padEnd(38))} ${dim(desc)}`);
      total++;
    }
    print("");
  }
  print(dim(`  ${total} blueprint${total === 1 ? "" : "s"}\n`));
}

async function cmdShow(args) {
  const [ref] = args;
  if (!ref || !ref.includes("/")) die("usage: fdl show <category>/<feature>");
  const [category, feature] = ref.split("/");
  const url = `${REMOTE_API}/blueprints/${category}/${feature}.json`;
  print(dim(`\nFetching ${url} ...\n`));
  const bp = await fetchJson(url).catch((err) => die(`Failed: ${err.message}`));
  print(JSON.stringify(bp, null, 2));
}

async function cmdPull(args) {
  const [ref] = args;
  if (!ref || !ref.includes("/")) die("usage: fdl pull <category>/<feature>");
  const [category, feature] = ref.split("/");

  const url = `${REMOTE_API}/blueprints/${category}/${feature}.json`;
  print(dim(`\nFetching ${url} ...`));
  const bp = await fetchJson(url).catch((err) => die(`Failed: ${err.message}`));

  // Convert to YAML using js representation (simple — blueprints are mostly plain data)
  const yaml = toYaml(bp);
  const destDir = path.join(CWD, "blueprints", category);
  fs.mkdirSync(destDir, { recursive: true });
  const destFile = path.join(destDir, `${feature}.blueprint.yaml`);
  if (fs.existsSync(destFile)) {
    die(`file already exists: blueprints/${category}/${feature}.blueprint.yaml (delete it first if you want to re-pull)`);
  }
  fs.writeFileSync(destFile, yaml, "utf-8");
  print(`\n${green("✓")} pulled ${bold(ref)} → ${dim(`blueprints/${category}/${feature}.blueprint.yaml`)}\n`);
}

// Minimal YAML stringifier — good enough for blueprint round-trips.
// Falls back to calling the installed `yaml` package if available for fidelity.
function toYaml(obj) {
  try {
    // Prefer the real yaml library when present
    const yamlLib = require(path.join(PKG_ROOT, "node_modules", "yaml"));
    return yamlLib.stringify(obj);
  } catch {
    return naiveYaml(obj, 0);
  }
}

function naiveYaml(value, depth) {
  const pad = "  ".repeat(depth);
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") {
    if (value.includes("\n") || value.match(/[:#{}\[\]&*!|>'"%@`]/)) {
      return JSON.stringify(value);
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return "\n" + value.map((v) => `${pad}- ${naiveYaml(v, depth + 1).trimStart()}`).join("\n");
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    return (
      (depth === 0 ? "" : "\n") +
      keys
        .map((k) => {
          const v = value[k];
          const rendered = naiveYaml(v, depth + 1);
          if (rendered.startsWith("\n")) return `${pad}${k}:${rendered}`;
          return `${pad}${k}: ${rendered}`;
        })
        .join("\n")
    );
  }
  return String(value);
}

function cmdValidate(args) {
  const validateScript = path.join(PKG_ROOT, "scripts", "validate.js");
  if (!fs.existsSync(validateScript)) die("validate.js not found in package");
  const result = spawnSync("node", [validateScript, ...args], {
    stdio: "inherit",
    cwd: CWD,
  });
  process.exit(result.status || 0);
}

function cmdCheck(args) {
  const validateScript = path.join(PKG_ROOT, "scripts", "validate.js");
  const completenessScript = path.join(PKG_ROOT, "scripts", "completeness-check.js");
  if (!fs.existsSync(validateScript) || !fs.existsSync(completenessScript)) {
    die("validate.js or completeness-check.js not found in package");
  }
  print(bold("\n▶ Schema validation"));
  const r1 = spawnSync("node", [validateScript, ...args], { stdio: "inherit", cwd: CWD });
  if (r1.status !== 0) process.exit(r1.status);
  print(bold("\n▶ Completeness check"));
  const r2 = spawnSync("node", [completenessScript, ...args], { stdio: "inherit", cwd: CWD });
  process.exit(r2.status || 0);
}

// ─── CLI entry ────────────────────────────────────────────

function getFlag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return null;
  return args[i + 1];
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    cmdHelp();
    return;
  }
  if (command === "version" || command === "--version" || command === "-v") {
    cmdVersion();
    return;
  }

  try {
    switch (command) {
      case "init":
        await cmdInit(rest);
        break;
      case "install":
        cmdInstall(rest);
        break;
      case "list":
      case "ls":
        await cmdList(rest);
        break;
      case "show":
      case "view":
        await cmdShow(rest);
        break;
      case "pull":
      case "get":
        await cmdPull(rest);
        break;
      case "validate":
        cmdValidate(rest);
        break;
      case "check":
        cmdCheck(rest);
        break;
      default:
        die(`unknown command: ${command}\nRun ${cyan("fdl help")} for usage.`);
    }
  } catch (err) {
    die(err.message || String(err));
  }
}

main();
