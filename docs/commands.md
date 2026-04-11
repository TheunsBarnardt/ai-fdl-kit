---
title: Commands
layout: default
nav_order: 2
description: "All eleven FDL commands: build apps, brainstorm features, create blueprints, extract from documents/websites/code, generate implementations, export portable build packs, and deploy to any AI tool."
---

# All Eleven Commands

FDL provides eleven Claude Code slash commands. You never need to write YAML — these commands handle everything through plain-language conversation.

---

## `/fdl-build` — Build a full app from a description (flagship)

Describe your entire app in plain English. FDL searches its blueprint library, suggests related features you might be missing, warns about gaps, and generates the complete codebase.

```
/fdl-build "nextjs app with shadcn and mongoose, OTP login, full POS system"
/fdl-build "express API for expense approval with email notifications"
/fdl-build "flutter mobile app with biometric login and product catalog"
```

**What happens:**
1. Claude parses your description into a tech stack (framework, UI, database) and feature list
2. It searches the blueprint library and finds matching blueprints
3. If multiple blueprints overlap (e.g., 3 types of authentication), it explains the difference and asks which one fits
4. It presents a **grouped checklist** of all features — core, required dependencies, recommended additions, and optional extras — with reasons for each suggestion
5. It warns about missing pieces: "You have POS but no tax engine — order totals won't include tax"
6. For features with no existing blueprint, it offers to create one (via `/fdl-create`), extract from docs, or skip
7. Once confirmed, it generates all features in dependency order with shared infrastructure and cross-feature integration
8. Final summary shows all generated files, what needs manual setup (env vars, API keys), and how to run

**This is the recommended starting point** — it guides you toward a complete, production-ready system.

---

## `/fdl-create` — Create a blueprint from a conversation

Tell Claude what feature you want. It asks plain-language questions, offers smart defaults, and generates the blueprint behind the scenes.

```
/fdl-create checkout payment
/fdl-create file-upload data
/fdl-create expense-approval workflow
/fdl-create roles access
```

**What happens:**
1. Claude asks 1-2 questions about what the feature should do
2. It presents a plain-English summary: "Here's what I'll create..."
3. You confirm or adjust
4. Blueprint file is created and validated automatically

**You never see YAML.** Claude handles all the technical details.

---

## `/fdl-extract` — Extract rules from an existing document

Have a business requirements document, company policy, SOP, or process diagram? Upload it and Claude extracts the rules into a blueprint.

```
/fdl-extract docs/expense-policy.pdf expense-approval workflow
/fdl-extract requirements/checkout-spec.docx checkout payment
/fdl-extract process/onboarding-flow.png onboarding ui
```

**Supported document types:** PDF, Word (.docx), text files, Markdown, images (flowcharts, diagrams)

**What happens:**
1. Claude reads your document and identifies the rules, constraints, and logic
2. It presents what it found: "I found these rules: ..."
3. You confirm, adjust, or add missing rules
4. Blueprint is created with traceability back to the source document

---

## `/fdl-extract-web` — Extract from a documentation website

API docs, developer portals, integration guides — Claude crawls the site and extracts everything into blueprints.

```
/fdl-extract-web https://docs.electrumsoftware.com/epc/public/epc-overview epc-payments integration
/fdl-extract-web https://docs.stripe.com/api stripe-payments payment
```

**What happens:**
1. Claude opens Chrome, maps all navigation tabs (Documentation, API Reference, Security, etc.)
2. Discovers OpenAPI specs and Postman collections automatically
3. Crawls each page, extracts API operations, fields, rules, security, and error codes
4. Presents a summary of all discovered operations
5. You confirm which ones to include
6. Blueprint(s) created with source URL traceability

**Works with JS-rendered sites** (Docusaurus, ReadMe, Redocly, Swagger UI) using Chrome.

---

## `/fdl-extract-code` — Reverse-engineer an existing codebase

Have a working app? Extract the exact business rules into blueprints — then regenerate for a different framework.

```
/fdl-extract-code ./src/auth login auth
/fdl-extract-code https://github.com/payloadcms/payload.git
/fdl-extract-code /path/to/project feature-name category
```

**What happens:**
1. Claude reads your models, routes, middleware, validators, services, and tests
2. It traces business rules back to their source files
3. Presents what it found with file references
4. You confirm, and it creates blueprints with full source traceability

**Works with any tech stack** — Express, Django, Rails, Spring, Laravel, FastAPI, Next.js, Go, Rust, .NET, and more.

---

## `/fdl-extract-code-feature` — Selectively extract features from large repos

For large repos where you only want specific features — not the entire codebase.

```
/fdl-extract-code-feature https://github.com/puckeditor/puck
/fdl-extract-code-feature https://github.com/odoo/odoo
/fdl-extract-code-feature ./my-large-project
```

**What happens:**
1. Claude clones/scans the repo and identifies discrete features
2. Presents a checkbox menu: "Which features do you want blueprints for?"
3. You select only the features you need
4. For each selected feature, it traces the code boundary and extracts behavioral logic
5. Blueprints are created as portable, framework-agnostic specs

---

## `/fdl-generate` — Generate code from a blueprint

Once you have a blueprint, generate a complete implementation for any language and framework.

```
/fdl-generate login nextjs
/fdl-generate signup express
/fdl-generate login angular
/fdl-generate expense-approval python
/fdl-generate pos-core react-native
```

**What happens:**
1. Claude auto-detects known stack companions (shadcn, tailwind, clerk, prisma, drizzle, nextauth) and data sources (google-calendar, stripe, twilio, resend, s3, maps) from the prompt
2. Claude reads the blueprint(s) via the deterministic `blueprints/INDEX.md` lookup — no globbing
3. **Asks once about third-party skills** — you can paste install commands or URLs from [skills.sh](https://skills.sh), [anthropics/skills](https://github.com/anthropics/skills), or [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills). Example: `npx skills add https://github.com/shadcn/ui --skill shadcn`. Say "skip" to use only what was auto-detected.
4. Asks about your setup: database, styling, project structure
5. Generates a complete, working implementation with all blueprint rules enforced
6. Rate limiting, error handling, security, validation — all built in
7. The final summary lists every detected stack companion, data source, and user-provided skill with the install commands you need to run

**Supports all languages and frameworks:** Next.js, Express, Laravel, Angular, React, Vue, C#/.NET, Rust, Python/Django, Go, Ruby on Rails, Flutter, Swift, and anything else.

**Third-party skill integration:** FDL never auto-installs or auto-searches skill catalogs. Auto-detection matches a fixed set of popular stacks; everything else comes from one explicit question during the run. Install commands always go into the summary for you to execute — skill installation is a user decision, not an implicit one.

---

## `/fdl-brainstorm` — Explore what you want before committing (discovery)

Not sure what feature you need? Describe the problem and Claude walks you through structured questions until the shape is clear — then hands off to `/fdl-create` with a complete spec.

```
/fdl-brainstorm I need something for handling user uploads
/fdl-brainstorm I want to stop bots from spamming my form
/fdl-brainstorm What are the different ways to handle expense approvals?
```

**What happens:**
1. Claude reads `blueprints/INDEX.md` and runs the lookup script for candidate features — deterministic, no globbing
2. Scans your idea for known stack-companion and data-source signals (shadcn, google-calendar, etc.)
3. Asks "What problem does this solve for the user?" — focuses on the problem, not the solution
4. Clarifies success criteria: "How would you know this feature is working correctly?"
5. Surfaces failure modes: invalid input, unauthorized access, rate limits, partial failures
6. **Asks about third-party skills** — you can paste install commands or URLs from [skills.sh](https://skills.sh) or other skill catalogs (e.g., `npx skills add https://github.com/shadcn/ui --skill shadcn`), or just say "none" to use only what was auto-detected
7. Proposes 2-3 approaches across two axes: blueprint shape (CRUD / state machine / full workflow) and delegate-vs-own (use a skill pack or build it in-house)
8. Walks through each design section iteratively — data, success path, failure paths, security, related features
9. You approve the full design before anything is created
10. Hands off to `/fdl-create` with the complete specification, carrying forward any chosen skill delegations as tags so `/fdl-generate` wires them idiomatically downstream

**Use this when you have a problem, not a solution** — brainstorm finds the right blueprint shape for you.

---

## `/fdl-build-yaml` — Export a portable build pack for any AI tool

Same discovery flow as `/fdl-build`, but instead of generating code, it exports a self-contained YAML build pack that ChatGPT, Gemini, Copilot, or any other AI can use to generate code.

```
/fdl-build-yaml "nextjs app with shadcn and mongoose, OTP login, full POS system"
/fdl-build-yaml "express API for expense approval workflow with email notifications"
/fdl-build-yaml "flutter mobile app with biometric login and product catalog"
```

**What happens:**
1. Phases 1-5 are identical to `/fdl-build` — parse intent, search blueprints, disambiguate, present checklist, resolve gaps
2. You choose an export format:
   - **Full file** — single YAML with all blueprints in dependency order (best for most AI tools)
   - **Chunked** — split into small files for AI tools with limited context windows (ChatGPT free tier, etc.)
   - **Compact** — stripped to ~60% size, keeps only what's needed for code generation
3. Export includes dependency order, stack detection, generation order, and a generation prompt that teaches the receiving AI how to interpret blueprints
4. File is saved to `exports/` and displayed in chat

**This is how you use FDL without Claude Code** — export once, paste into any AI tool.

---

## `/fdl-install` — Deploy FDL to Cursor, Windsurf, Copilot & more

Sets up your AI coding tool to understand FDL blueprints. Writes the right config file for each tool so it knows how to find, read, and generate code from blueprints.

```
/fdl-install                    # Interactive menu
/fdl-install cursor             # Cursor
/fdl-install windsurf           # Windsurf
/fdl-install copilot            # GitHub Copilot
/fdl-install gemini             # Gemini CLI
/fdl-install continue           # Continue
/fdl-install cline              # Cline
/fdl-install kiro               # Kiro (AWS)
/fdl-install amazonq            # Amazon Q Developer
/fdl-install codex              # OpenAI Codex CLI
/fdl-install --all              # All tools at once
```

**What happens:**
1. Detects whether blueprints are local or remote (determines how the AI tool will fetch them)
2. Generates compact FDL instructions — how to find blueprints, interpret outcomes, and generate code
3. Writes to the tool-specific config file (e.g., `.cursor/rules/fdl.mdc`, `.github/copilot-instructions.md`)
4. Creates required directories if they don't exist
5. If FDL instructions already exist for that tool, asks whether to update or skip

**Supports 9 AI tools** — after install, ask your AI tool to "build login using the auth/login blueprint" and it just works.

---

## `/fdl-auto-evolve` — Auto-validate, regenerate docs, and commit

After creating or modifying blueprints, this command validates everything, regenerates the documentation site and JSON API, and creates a single atomic commit.

```
/fdl-auto-evolve                # Normal mode
/fdl-auto-evolve --dry-run      # Preview changes without committing
/fdl-auto-evolve --verbose      # Detailed output
```

**What happens:**
1. Runs schema validation (`node scripts/validate.js`) — stops immediately if any blueprint is invalid
2. Runs semantic validation (`node scripts/completeness-check.js`) — catches TODOs, empty sections, broken references
3. Regenerates `docs/blueprints/` pages and `docs/api/` JSON files
4. Detects which blueprints changed via git diff
5. Updates metadata (README badge, llms.txt counts)
6. Creates a single atomic commit listing all modified blueprints

**Runs automatically** after `/fdl-extract-code` and `/fdl-create` complete. You can also trigger it manually.

---

## Combining Commands

The fastest way to build a full app:
```
/fdl-build "nextjs app with login and POS"   # Describe your app → get everything
```

Or work with individual blueprints:
```
/fdl-create login auth          # Create the spec
/fdl-generate login nextjs      # Generate Next.js code
/fdl-generate login express     # Same spec, different framework
```

Eleven commands. From conversation to working application.
