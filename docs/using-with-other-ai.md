---
title: Using with Other AI Tools
layout: default
nav_order: 8
description: "Use FDL blueprints with ChatGPT, Copilot, Gemini, or any AI tool. No Claude Code required — paste a URL or use the JSON API."
---

# Using with ChatGPT, Copilot, and Other AI Tools

You don't need Claude Code or even this repo installed. Blueprints are plain YAML — any AI can read them.

---

## Option A: Use the JSON API

Every blueprint is available as JSON. Paste a URL into any AI chat:

```
Read this blueprint and generate a React Native + Express + MongoDB implementation:
https://theunsbarnardt.github.io/claude-fdl/api/blueprints/auth/login.json
```

Browse all available blueprints:
[`/api/registry.json`]({{ site.baseurl }}/api/registry.json)

---

## Option B: Combine multiple blueprints

```
I'm building a mobile POS app with React Native and MongoDB.

Read these blueprints and generate the full implementation:
- https://theunsbarnardt.github.io/claude-fdl/api/blueprints/auth/biometric-auth.json
- https://theunsbarnardt.github.io/claude-fdl/api/blueprints/payment/pos-core.json
- https://theunsbarnardt.github.io/claude-fdl/api/blueprints/payment/loyalty-coupons.json
- https://theunsbarnardt.github.io/claude-fdl/api/blueprints/payment/invoicing-payments.json

Generate: models, API routes, React Native screens, and business logic.
```

---

## Option C: Copy-paste the YAML directly

If the AI can't fetch URLs, open the raw YAML file on GitHub, copy its contents, and paste it into the chat with your generation instructions.

---

## No install, no clone, no CLI required

The blueprints are the specification — any AI that can read YAML or JSON can generate from them.
