---
title: Blueprint Format
layout: default
nav_order: 3
description: "What's inside an FDL blueprint: fields, rules, outcomes, errors, events, actors, states, SLA, flows, and more."
---

# What's Inside a Blueprint?

You don't need to understand this to use FDL (the commands handle it for you), but here's what a blueprint contains:

| Section | What it does | Example |
|---------|-------------|---------|
| **fields** | Data the feature collects | Email, password, amount, file upload |
| **rules** | Business logic and security | "Lock account after 5 failed attempts" |
| **outcomes** | What should happen in each scenario | "Given valid credentials, then create session" |
| **errors** | What to show when things go wrong | "Invalid email or password" (never reveals which) |
| **events** | Signals for other systems | "login.success" triggers audit log |
| **actors** | Who's involved (for workflows) | Employee, Manager, Finance, System |
| **states** | Status lifecycle (for workflows) | draft → submitted → approved → paid |
| **sla** | Time limits (for workflows) | "Manager must review within 48 hours" |
| **related** | How features connect | Login requires signup, recommends password-reset |
| **flows** | Step-by-step procedures | Useful for business process documentation |

---

## Outcomes vs Flows

FDL has two ways to describe what a feature does:

**Outcomes** (recommended) describe **what must be true**:
> "Given the user exists and the password matches, then a session is created and the login.success event fires."

**Flows** describe **what steps to follow**:
> "Step 1: Validate fields. Step 2: Look up user. Step 3: Compare password."

**Why outcomes are better for AI:** When you tell AI *what* must be true instead of *how* to do it, it picks the best implementation for your framework. Outcomes are like acceptance criteria — flows are like recipes.

**When to use flows:** For business processes where humans need documented procedures (expense approvals, employee onboarding).

---

## Structured Conditions

Outcomes can use structured conditions that are unambiguous and machine-parseable:

```
INSTEAD OF:  "amount is over $1,000 and status is submitted"
USE:         field: amount, source: input, operator: gt, value: 1000
             field: status, source: db, operator: eq, value: submitted
```

**Key features:**
- **AND/OR logic** — top-level conditions are AND; use `any:` for OR groups
- **Priority** — outcomes are checked in order (rate limit first, success last)
- **Data sources** — each condition knows where its data comes from (input, db, request, session, system)
- **Structured side effects** — actions like `set_field`, `emit_event`, `transition_state`, `notify`
- **Operators with type contracts** — each operator has defined accepted types
- **Error binding** — outcomes bind to specific error codes
- **Transaction boundaries** — `transaction: true` marks side effects as atomic
- **Expression language** — `when:` conditions: `failed_login_attempts >= 5`, `amount > 1000 and status == "submitted"`

Plain text conditions still work alongside structured ones — use whichever is clearer.

---

## Naming Conventions

| Element | Convention | Example |
|---------|----------|---------|
| Features | kebab-case | `password-reset` |
| Fields | snake_case | `first_name` |
| Error codes | UPPER_SNAKE_CASE | `LOGIN_INVALID_CREDENTIALS` |
| Events | dot.notation | `login.success` |
| Actors | snake_case | `finance_manager` |
| Files | `{feature}.blueprint.yaml` | `login.blueprint.yaml` |

---

## Field Types

`text`, `email`, `password`, `number`, `boolean`, `date`, `datetime`, `phone`, `url`, `file`, `select`, `multiselect`, `hidden`, `token`, `rich_text`, `json`

---

## Operator Type Contracts

| Operator | Accepts | Semantics |
|----------|---------|-----------|
| `eq` | string, number, boolean | Strict equality |
| `neq` | string, number, boolean | Strict inequality |
| `gt`, `gte` | number, duration | Greater than / or equal |
| `lt`, `lte` | number, duration | Less than / or equal |
| `in`, `not_in` | array | Value in/not in list |
| `matches` | string (regex) | Regex test |
| `exists`, `not_exists` | (none) | Null check |

---

## Relationship Types

| Type | Meaning |
|------|---------|
| `required` | Feature cannot work without this |
| `recommended` | Should have |
| `optional` | Nice to have |
| `extends` | Builds on another feature |
