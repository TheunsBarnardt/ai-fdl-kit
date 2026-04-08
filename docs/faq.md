---
title: FAQ
layout: default
nav_order: 11
description: "Frequently asked questions about FDL: YAML knowledge, supported languages, business processes, AI tool compatibility, and more."
---

# FAQ

**Do I need to know YAML?**
No. The `/fdl-create` and `/fdl-extract` commands handle everything through plain-language questions. You only see YAML if you choose to edit blueprints directly.

**Can I extract from an existing codebase?**
Yes. `/fdl-extract-code` reads a local folder or clones a git repo, then analyzes models, routes, middleware, validators, services, error handling, events, and tests. Works with any tech stack. For large repos, use `/fdl-extract-code-feature` to select only the features you want.

**Does this only work with Claude?**
No. The blueprints are standard YAML files — any AI tool can read them. You can paste a blueprint into ChatGPT, Copilot, Gemini, or any other AI. The slash commands are Claude Code skills that make the experience smoother, but the blueprints themselves are AI-agnostic. The [JSON API]({{ site.baseurl }}/api/registry.json) makes blueprints even easier for AI tools to fetch.

**What languages and frameworks are supported?**
All of them. Blueprints describe what the feature does, not how to build it. Next.js, Express, Laravel, Angular, React, Vue, C#/.NET, Rust, Python/Django, Go, Ruby on Rails, Flutter, Swift, and anything else.

**Can I use this for business processes, not just UI features?**
Yes. Blueprints support actors, state machines, SLAs, and approval chains. See the [expense-approval]({{ site.baseurl }}/blueprints/data/expense-approval/) blueprint for a full example.

**Can I extract rules from existing documents?**
Yes. `/fdl-extract` reads PDFs, Word docs, text files, and even images of flowcharts.

**Can I extract from a website or API docs?**
Yes. `/fdl-extract-web` crawls documentation websites (even JS-rendered ones) using Chrome. It discovers OpenAPI specs and Postman collections automatically.

**What if I don't know what feature I want?**
Use `/fdl-brainstorm`. Describe your problem in plain language and Claude walks you through structured questions — what problem it solves, what success looks like, what can go wrong — until the feature shape is clear. It then hands off to `/fdl-create` with a complete spec.

**Can I use blueprints with ChatGPT or Gemini directly?**
Yes. Run `/fdl-build-yaml` with your app description — it exports a self-contained YAML build pack that any AI tool can use. Choose full, chunked (for small context windows), or compact (~60% smaller) format. Upload the file to ChatGPT, Gemini, or any AI and it generates code from the blueprints.

**How do I set up FDL in Cursor, Windsurf, or Copilot?**
Run `/fdl-install cursor` (or `windsurf`, `copilot`, `gemini`, `continue`, `cline`, `kiro`, `amazonq`, `codex`). It writes the right config file for your tool so it knows how to find and use blueprints. Supports 9 AI coding tools.

**Do I need to manually validate and commit after changes?**
No. `/fdl-auto-evolve` handles it automatically — validates all blueprints, regenerates docs and the JSON API, and creates a single atomic commit. It runs automatically after `/fdl-create` and `/fdl-extract-code`, or you can trigger it manually.

**How is this different from just asking AI to "build login"?**
Without FDL, the AI guesses. With FDL, there's a complete specification: 5 failed attempts = lockout, 15-minute duration, constant-time password comparison, generic error messages. Nothing is left to chance.
