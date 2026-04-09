<p align="center">
  <img src="docs/assets/logo.svg" alt="ai-fdl-kit — The AI Feature Definition Kit" width="720">
</p>

<h1 align="center">ai-fdl-kit</h1>
<p align="center"><strong>The AI Feature Definition Language</strong> — portable YAML blueprints for software features, consumable by any AI coding tool.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-fdl-kit"><img src="https://img.shields.io/npm/v/ai-fdl-kit.svg?color=cb3837&label=npm" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="MIT"></a>
  <a href="blueprints/"><img src="https://img.shields.io/badge/blueprints-203-blue" alt="Blueprints"></a>
  <a href="https://theunsbarnardt.github.io/ai-fdl-kit/using-with-other-ai/"><img src="https://img.shields.io/badge/AI_Tools-Claude_|_ChatGPT_|_Copilot_|_Cursor-purple.svg" alt="AI Tools"></a>
  <a href="https://theunsbarnardt.github.io/ai-fdl-kit/"><img src="https://img.shields.io/badge/docs-github_pages-green.svg" alt="Docs"></a>
</p>

---

## One command, any project, no clone

```bash
npx ai-fdl-kit init --tool cursor
```

Bootstraps FDL into your existing project — schema, config, AI tool instructions — without cloning anything. Your project gets ~3 small files. The ~200 community blueprints stay remote and are pulled on demand.

```bash
npx ai-fdl-kit list              # browse the remote catalog
npx ai-fdl-kit pull auth/login   # copy a blueprint locally
npx ai-fdl-kit check             # validate + completeness gate
```

**Define features as YAML blueprints. Generate complete implementations for any framework. Extract architectural patterns from any codebase, API docs, or business document.**

ai-fdl-kit is an open-source system for writing "blueprints" — YAML specifications that describe software features completely. You define the *what* (fields, rules, outcomes, errors, events). Any AI tool — Claude, ChatGPT, Copilot, Cursor, Gemini — reads the blueprint and generates a correct, complete implementation for your chosen language and framework.

No code. No YAML knowledge needed. The CLI + conversational skills handle everything in plain English.

---

## What Problems Does This Solve?

- **Every developer rebuilds the same features from scratch.** Login, signup, password reset — something always gets missed.
- **When you ask AI to "build login", it guesses.** There's no shared definition of what "login" actually needs.
- **Business rules live in people's heads.** When it's time to build software, critical rules get lost.

**FDL solves all three.** A blueprint is the single source of truth for a feature — what data it needs, what rules govern it, what should happen in every scenario.

---

## How It Works

| Method | When to use it | Command |
|--------|---------------|---------|
| **Build a full app** | Describe your app in plain English | `/fdl-build "nextjs POS with OTP login"` |
| **Brainstorm a feature** | You have a problem, not a solution | `/fdl-brainstorm` |
| **Create from scratch** | You know what feature you want | `/fdl-create checkout payment` |
| **Extract from a document** | You have a BRD, policy doc, or SOP | `/fdl-extract docs/policy.pdf` |
| **Extract from a website** | API docs, developer portal | `/fdl-extract-web https://docs.example.com/api` |
| **Extract from code** | Existing codebase or git repo | `/fdl-extract-code ./src/auth login auth` |
| **Extract features selectively** | Large repo, pick only what you want | `/fdl-extract-code-feature https://github.com/org/repo` |
| **Generate code** | You have a blueprint, want code | `/fdl-generate login nextjs` |
| **Export for other AI tools** | Use blueprints with ChatGPT, Gemini, etc. | `/fdl-build-yaml "my app description"` |
| **Install for AI tools** | Set up Cursor, Windsurf, Copilot, etc. | `/fdl-install cursor` |
| **Auto-evolve** | Validate, regenerate docs, and commit | `/fdl-auto-evolve` |

---

## Getting Started

### Option 1 — No clone, use the CLI in any project ✨ recommended

```bash
cd your-existing-project
npx ai-fdl-kit init --tool cursor    # or windsurf, copilot, gemini, cline, ...
```

That's it. The CLI writes:
- `blueprints/` — where your feature specs live
- `schema/blueprint.schema.yaml` — for IDE autocomplete
- `fdl.config.yaml` — project config
- `.cursor/rules/fdl.mdc` (or equivalent for your AI tool) — tells the AI how to read blueprints

Then ask your AI tool: *"Build login using the auth/login blueprint"* — it fetches the blueprint over HTTP from the remote registry and generates code for your stack.

### Option 2 — Clone the full repo (for contributors and blueprint authors)

```bash
git clone https://github.com/TheunsBarnardt/ai-fdl-kit.git
cd ai-fdl-kit
npm install
```

Then open Claude Code and use the conversational skills:

```
/fdl-build "nextjs app with login and POS"   # Build a full app (recommended)
/fdl-brainstorm                              # Socratic elicitation if the idea is vague
/fdl-create login auth                        # Create a single blueprint
/fdl-generate login nextjs                    # Generate code from a blueprint
/fdl-extract-code ./src auth                 # Reverse-engineer features from existing code
```

---

## Static API for AI Tools

Every blueprint is available as JSON — no scraping needed:

```
GET /api/registry.json              — index of all 203 blueprints
GET /api/blueprints/auth/login.json — complete blueprint as JSON
```

Paste into ChatGPT: `https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints/auth/login.json`

[Browse the API registry](https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json)

---

## What Else You Gain

Blueprints aren't just templates — they encode transferable architectural patterns:

- **Auth Pack** — Rate limiting, token lifecycle, enumeration prevention
- **Integration Pack** — Async callbacks, idempotency, hardware state machines
- **UI Pack** — Registry architecture, MCP server integration, drag-and-drop
- **CMS Pack** — Lifecycle hooks, row-level security, draft/publish workflows
- **Visual Editor Pack** — Collision detection, undo/redo, plugin systems
- **ERP Pack** — POS sessions, tax computation, bank reconciliation, automation rules
- **Workflow Pack** — Approval chains, SLA enforcement, event-driven automation
- **Wealth Management Pack** — Portfolio valuations, market data feeds, document management, multi-account hierarchies, real-time pricing integration
- **Onboarding Pack** — Client and advisor registration, multi-step onboarding workflows, proposal/quotation generation, state machines, DocuSign integration

---

## AGI-Readiness Layer

Blueprints can include an optional `agi` section that makes them consumable by autonomous AI agents:

| Sub-section | Purpose | Example |
|------------|---------|---------|
| **Goals** | Business objectives with measurable success criteria | `"Authenticate users with < 2% lockout rate"` |
| **Autonomy** | Human involvement level | `human_in_loop`, `supervised`, `semi_autonomous`, `fully_autonomous` |
| **Verification** | Invariants, acceptance tests, monitoring thresholds | Self-verifying specs agents can validate |
| **Composability** | Declared capabilities, boundaries, and tradeoffs | `"prefer security over performance"` |
| **Evolution** | Adaptive triggers and deprecation schedules | `"if error_rate > 1%, add circuit breaker"` |

The AGI section is entirely optional — existing blueprints work unchanged. See [`blueprints/auth/login.blueprint.yaml`](blueprints/auth/login.blueprint.yaml) for a complete example.

---

## Documentation

Full documentation at **[theunsbarnardt.github.io/ai-fdl-kit](https://theunsbarnardt.github.io/ai-fdl-kit/)**:

- [All Eleven Commands](https://theunsbarnardt.github.io/ai-fdl-kit/commands/) — detailed reference
- [Blueprint Format](https://theunsbarnardt.github.io/ai-fdl-kit/blueprint-format/) — what's inside a blueprint
- [Blueprint Catalog](https://theunsbarnardt.github.io/ai-fdl-kit/catalog/) — browse all 203 blueprints
- [Combining Blueprints](https://theunsbarnardt.github.io/ai-fdl-kit/combining/) — build complex systems
- [Real-World Examples](https://theunsbarnardt.github.io/ai-fdl-kit/examples/) — 8 walkthroughs
- [Using with ChatGPT & Others](https://theunsbarnardt.github.io/ai-fdl-kit/using-with-other-ai/) — no Claude required
- [FAQ](https://theunsbarnardt.github.io/ai-fdl-kit/faq/)

---

## License

MIT
