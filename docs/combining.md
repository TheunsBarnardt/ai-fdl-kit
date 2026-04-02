---
title: Combining Blueprints
layout: default
nav_order: 6
description: "Combine FDL blueprints to build complex systems: plugin marketplaces, payment gateways, SaaS platforms, visual editors, and more."
---

# Combining Blueprints

Individual blueprints are useful. **Combining them is where it gets interesting.**

| You want to build... | Combine these blueprints |
|----------------------|--------------------------|
| **Plugin marketplace with approval** | `shadcn-cli` (registry + CLI) + `expense-approval` (state machine + roles) + `login` (rate limiting) |
| **Payment gateway** | `chp-outbound-payments` (orchestration) + `login` (API key auth) + `chp-account-management` (verification) |
| **Hardware enrollment system** | `biometric-auth` (multi-enrollment + fallback) + `signup` (registration flow) + `email-verification` (claim verification) |
| **SaaS onboarding wizard** | `signup` (account creation) + `email-verification` (confirm ownership) + `expense-approval` (step-by-step workflow pattern) |
| **IoT device management platform** | `palm-vein` (hardware state machine) + `shadcn-cli` (registry for device drivers) + `chp-account-management` (proxy resolution for device IDs) |
| **Loan origination system** | `expense-approval` (multi-step approval + SLAs) + `chp-outbound-payments` (disbursement) + `login` (secure access) |
| **Headless CMS** | `payload-collections` (CRUD + hooks) + `payload-auth` (multi-strategy auth) + `payload-access-control` (row-level security) + `payload-versions` (draft/publish) |
| **Multi-tenant SaaS with content** | `payload-collections` (data layer) + `payload-access-control` (tenant isolation via WHERE) + `payload-auth` (API keys for integrations) + `expense-approval` (approval workflows) |
| **Background job processing platform** | `payload-job-queue` (task orchestration + retry + concurrency) + `payload-auth` (API key auth for triggers) + `login` (rate limiting for endpoints) |
| **Document collaboration platform** | `payload-collections` (CRUD) + `payload-document-locking` (prevent concurrent edits) + `payload-versions` (history + restore) + `payload-uploads` (file attachments) |
| **Visual page builder** | `drag-drop-editor` (DnD composition) + `component-registry` (pluggable blocks) + `content-tree` (hierarchical storage) + `undo-redo` (history) + `responsive-viewport` (preview) |
| **Form builder** | `component-registry` (field type registry) + `drag-drop-editor` (arrange fields) + `field-transforms` (dynamic field logic) + `plugin-overrides` (custom field renderers) |
| **Dashboard/report composer** | `drag-drop-editor` (widget placement) + `component-registry` (chart/table widgets) + `editor-state` (centralized state) + `responsive-viewport` (responsive preview) |
| **Email template editor** | `component-registry` (email blocks) + `drag-drop-editor` (compose layouts) + `content-tree` (serialize to HTML) + `plugin-overrides` (custom block editors) |
| **IDE/code editor layout** | `plugin-overrides` (panel system) + `editor-state` (centralized state with slices) + `responsive-viewport` (viewport management) + `undo-redo` (action history) |
| **Mobile retail POS with biometrics** | `pos-core` (session + orders) + `biometric-auth` (palm vein login) + `loyalty-coupons` (rewards) + `chp-outbound-payments` (bank payments) + `invoicing-payments` (accounting) |
| **Full eCommerce platform** | `ecommerce-store` (catalog + cart + checkout) + `product-configurator` (variants) + `quotation-order-management` (order lifecycle) + `invoicing-payments` (billing) + `tax-engine` (multi-rate tax) |
| **ERP accounting suite** | `invoicing-payments` (invoices + bills) + `tax-engine` (computation) + `bank-reconciliation` (statement matching) + `odoo-expense-approval` (expense workflow) + `purchase-agreements` (procurement) |
| **Business process automation platform** | `automation-rules` (trigger → action engine) + `odoo-expense-approval` (approval workflows) + `quotation-order-management` (order lifecycle) + `loyalty-coupons` (incentive campaigns) |

---

## How Combining Works

Take the registry architecture from `shadcn-cli` + the state machine from `expense-approval` + the rate limiting from `login` — and you have the spec for a plugin marketplace with approval workflows and abuse prevention. No single blueprint exists for that, but the patterns compose.

```
/fdl-generate shadcn-cli nextjs
/fdl-generate expense-approval nextjs
/fdl-generate login nextjs
```

Three commands. The generated code shares consistent patterns because each blueprint defines the same kinds of things: fields, rules, outcomes, errors, and events.

---

## Recreating or Customizing

Every blueprint can be recreated from scratch with different rules:

```
/fdl-create login auth
/fdl-create expense-approval workflow
```

Your answers shape the blueprint — different lockout thresholds, different password rules, different approval chains. Same architectural patterns, your business rules.
