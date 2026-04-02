---
title: Blueprint Catalog
layout: default
nav_order: 5
has_children: true
description: "Browse all 45 FDL blueprints organized by category: auth, access, data, integration, payment, UI, and workflow."
---

# Blueprint Catalog

FDL ships with 45 production-ready blueprints. Each one encodes battle-tested architectural patterns that transfer to entirely different problems.

Browse by category:

| Category | Blueprints | What's inside |
|----------|-----------|---------------|
| [Auth]({{ site.baseurl }}/blueprints/auth/) | Login, signup, password reset, logout, email verification, biometric, Payload auth | Security patterns: rate limiting, token lifecycle, enumeration prevention |
| [Access Control]({{ site.baseurl }}/blueprints/access/) | Payload access control | Row-level security, field-level redaction, permission introspection |
| [Data]({{ site.baseurl }}/blueprints/data/) | CRUD, versioning, uploads, preferences, product config, tax engine, and more | Lifecycle hooks, state machines, recursive computation |
| [Integration]({{ site.baseurl }}/blueprints/integration/) | CHP payments, palm vein, blockradar, plugin overrides | Async callbacks, idempotency, hardware state machines |
| [Payment]({{ site.baseurl }}/blueprints/payment/) | POS core, invoicing, loyalty/coupons | Session isolation, multi-method payments, reward engines |
| [UI]({{ site.baseurl }}/blueprints/ui/) | Visual editor, component registry, eCommerce, shadcn CLI/components, kiosk | Registry architecture, drag-and-drop, responsive viewport |
| [Workflow]({{ site.baseurl }}/blueprints/workflow/) | Expense approval, automation rules, job queues, quotation management, purchase agreements | Approval chains, SLA enforcement, event-driven automation |

---

## Static API

Every blueprint is also available as JSON for AI tools:

- **Registry:** [`/api/registry.json`]({{ site.baseurl }}/api/registry.json) — index of all blueprints
- **Per-blueprint:** `/api/blueprints/{category}/{feature}.json`

Example: [`/api/blueprints/auth/login.json`]({{ site.baseurl }}/api/blueprints/auth/login.json)
