---
title: Commands
layout: default
nav_order: 2
description: "The seven FDL commands: build full apps, create blueprints, extract from documents/websites/code, and generate implementations for any framework."
---

# The Seven Commands

FDL provides seven Claude Code slash commands. You never need to write YAML — these commands handle everything through plain-language conversation.

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
1. Claude reads the blueprint (all fields, rules, outcomes, errors, events)
2. Asks about your setup: database, styling, project structure
3. Generates a complete, working implementation with all rules enforced
4. Rate limiting, error handling, security, validation — all built in

**Supports all languages and frameworks:** Next.js, Express, Laravel, Angular, React, Vue, C#/.NET, Rust, Python/Django, Go, Ruby on Rails, Flutter, Swift, and anything else.

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

Seven commands. From conversation to working application.
