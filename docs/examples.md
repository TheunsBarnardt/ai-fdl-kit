---
title: Real-World Examples
layout: default
nav_order: 7
description: "8 step-by-step FDL examples: login systems, policy extraction, API integration, codebase reverse-engineering, CMS extraction, visual editor features, and mobile POS."
---

# Real-World Examples

## Example 1: Build a login system for your Next.js app

```
/fdl-create login auth
```
> Claude asks: "Should accounts lock after failed attempts?" You say yes, 5 attempts, 15-minute lockout.

```
/fdl-generate login nextjs
```
> Claude asks: "Use mock data or Prisma?" You pick Prisma.
> Generates 5 files: page, server action, business logic, types, form component.
> Rate limiting, lockout, secure cookies, enumeration prevention — all built in.

---

## Example 2: Turn a policy document into working software

Your company has an expense approval policy in a PDF:
- Expenses over $25 need receipts
- Managers approve first
- Expenses over $1,000 need finance approval too
- Must be processed within 30 days

```
/fdl-extract docs/expense-policy.pdf expense-approval workflow
```
> Claude reads the PDF, extracts all the rules, shows you what it found.

```
/fdl-generate expense-approval nextjs
```
> Now you have a working expense approval system with the exact rules from the PDF.

---

## Example 3: Extract an API integration from documentation

You need to integrate with a payment platform:

```
/fdl-extract-web https://docs.electrumsoftware.com/epc/public/epc-overview epc-payments integration
```
> Claude opens Chrome, maps 12 sidebar pages, crawls each one.
> Extracts: 6 inbound webhooks, 4 outbound API calls, JWT security, CDV account validation, PayShap proxy resolution, and transaction lifecycle states.

```
/fdl-generate epc-payments express
```
> Complete integration layer with webhook handlers, API client, JWT signing, and error handling.

---

## Example 4: Reverse-engineer an existing codebase

You have a working Express app with authentication:

```
/fdl-extract-code ./src/auth login auth
```
> Claude reads your models, routes, middleware, validators, and tests.
> Finds: 8 fields from Prisma schema, rate limiting (5 attempts / 15 min), JWT config, 12 test cases as acceptance criteria.

```
/fdl-generate login nextjs
```
> Same exact business rules, now implemented in Next.js — nothing lost in translation.

---

## Example 5: Build a complete auth system

```
/fdl-create login auth
/fdl-create signup auth
/fdl-create password-reset auth
/fdl-generate login nextjs
/fdl-generate signup nextjs
/fdl-generate password-reset nextjs
```

Six commands. Complete authentication with login, registration, password reset, email verification, rate limiting, account lockout, and secure sessions.

---

## Example 6: Extract an entire CMS from its codebase

```
/fdl-extract-code https://github.com/payloadcms/payload.git
```
> Claude clones the repo, analyzes 200+ source files across 9 feature areas.
> Finds: JWT + API key auth, full CRUD with lifecycle hooks, image processing, draft/publish workflow, function-based access control, job queue with retry and concurrency, document locking, and user preferences.

Now use those patterns for something entirely different:

```
/fdl-generate payload-collections express
```
> Full CRUD API with lifecycle hooks, pagination, query filtering, and bulk operations.

The blueprints capture the *architecture*, not the CMS.

---

## Example 7: Selectively extract features from a visual editor

```
/fdl-extract-code-feature https://github.com/puckeditor/puck
```
> Claude scans 279 files, identifies 12 features.
> You select: drag-and-drop, component registry, undo/redo, content tree, viewport.
> 5 portable blueprints created, all cross-referenced.

```
/fdl-generate drag-drop-editor svelte
/fdl-generate component-registry svelte
/fdl-generate undo-redo svelte
```
> SvelteKit page builder with the same architectural patterns as Puck — but in Svelte.

---

## Example 8: Full POS + eCommerce with palm vein auth and bank payments

**Step 1: Biometric auth layer**
```
/fdl-generate biometric-auth react-native
/fdl-generate palm-vein react-native
/fdl-generate login react-native
```

**Step 2: POS system**
```
/fdl-generate pos-core react-native
/fdl-generate self-order-kiosk react-native
/fdl-generate loyalty-coupons express
```

**Step 3: eCommerce storefront**
```
/fdl-generate ecommerce-store react-native
/fdl-generate product-configurator react-native
/fdl-generate quotation-order-management express
```

**Step 4: Payment and accounting backbone**
```
/fdl-generate chp-inbound-payments express
/fdl-generate chp-outbound-payments express
/fdl-generate invoicing-payments express
/fdl-generate tax-engine express
/fdl-generate bank-reconciliation express
```

15+ blueprints, one cohesive system. Customer scans palm vein, browses products, applies loyalty rewards, pays via bank, gets an invoice — while the store manager runs the POS with cash reconciliation and accounting integration.
