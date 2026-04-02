---
title: Home
layout: home
nav_order: 1
description: "FDL — Define software features as YAML blueprints, generate complete implementations for any framework. 45 production-ready blueprints for auth, payments, workflows, CMS, ERP, and more."
---

# Feature Definition Language (FDL)

**Define features as YAML blueprints. Generate complete implementations for any framework.**

FDL is an open-source system for writing "blueprints" — YAML specifications that describe software features completely. You define the *what* (fields, rules, outcomes, errors, events). Any AI tool — Claude, ChatGPT, Copilot, Gemini — reads the blueprint and generates a correct, complete implementation for your chosen language and framework.

No code. No YAML knowledge needed. Six CLI commands handle everything through plain-language conversation.

---

## What Problems Does This Solve?

**Every developer rebuilds the same features from scratch.** Login, signup, password reset, file upload — these features exist in every app. Every time they're rebuilt, something gets missed.

**When you ask AI to "build login", it guesses.** Different AI tools produce different results. There's no shared definition of what "login" actually needs.

**Business rules live in people's heads.** The expense approval policy is in a PDF somewhere. When it's time to build software, critical rules get lost.

**FDL solves all three.** A blueprint is the single source of truth — what data it needs, what rules govern it, what should happen in every scenario.

---

## How It Works

There are six ways to work with blueprints:

| Method | When to use it | Command |
|--------|---------------|---------|
| **Create from scratch** | You know what feature you want | `/fdl-create checkout payment` |
| **Extract from a document** | You have a BRD, policy doc, or SOP | `/fdl-extract docs/policy.pdf` |
| **Extract from a website** | API docs, developer portal | `/fdl-extract-web https://docs.example.com/api` |
| **Extract from code** | Existing codebase or git repo | `/fdl-extract-code ./src/auth login auth` |
| **Extract features selectively** | Large repo, pick only what you want | `/fdl-extract-code-feature https://github.com/org/repo` |
| **Generate code** | You have a blueprint, want code | `/fdl-generate login nextjs` |

[Learn more about commands]({{ site.baseurl }}/commands/)

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Claude Code](https://claude.ai/code) (CLI, desktop app, or VS Code extension)

### 1. Clone and install

```bash
git clone https://github.com/TheunsBarnardt/claude-fdl.git
cd claude-fdl
npm install
```

### 2. Create your first blueprint

```
/fdl-create login auth
```

### 3. Generate the code

```
/fdl-generate login nextjs
```

### 4. Validate (optional)

```bash
node scripts/validate.js
```

---

## Static API for AI Tools

Every blueprint is available as JSON for AI tools that can't fetch raw YAML from GitHub:

```
GET /api/registry.json              — index of all blueprints
GET /api/blueprints/auth/login.json — complete blueprint as JSON
```

[Browse the API registry]({{ site.baseurl }}/api/registry.json)

---

## Explore

- [The Six Commands]({{ site.baseurl }}/commands/) — detailed reference for each CLI command
- [Blueprint Format]({{ site.baseurl }}/blueprint-format/) — what's inside a blueprint
- [Blueprint Catalog]({{ site.baseurl }}/catalog/) — browse all 45 blueprints by category
- [Combining Blueprints]({{ site.baseurl }}/combining/) — build complex systems from simple specs
- [Real-World Examples]({{ site.baseurl }}/examples/) — 8 step-by-step walkthroughs
- [Using with ChatGPT, Copilot & Others]({{ site.baseurl }}/using-with-other-ai/) — no Claude Code required
- [FAQ]({{ site.baseurl }}/faq/) — common questions answered
