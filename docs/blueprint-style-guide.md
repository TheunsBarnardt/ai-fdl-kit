---
layout: default
title: Blueprint Style Guide
nav_order: 10
---

# Blueprint Style Guide

Conventions for authoring high-quality FDL blueprints. Following these patterns produces blueprints that score well on the fitness scorer and pass the completeness checker cleanly.

## Naming Conventions

| Element | Convention | Example | Enforced By |
|---------|------------|---------|-------------|
| Feature name | kebab-case | `password-reset` | Schema regex `^[a-z][a-z0-9-]*$` |
| Field name | snake_case | `first_name` | Schema regex `^[a-z][a-z0-9_]*$` |
| Error code | UPPER_SNAKE_CASE | `LOGIN_INVALID_CREDENTIALS` | Schema regex `^[A-Z][A-Z0-9_]*$` |
| Event name | dot.notation | `auth.login.success` | Schema regex |
| Actor ID | snake_case | `finance_manager` | Schema regex `^[a-z][a-z0-9_]*$` |
| File name | `{feature}.blueprint.yaml` | `login.blueprint.yaml` | Convention |

## Description

- Minimum 15 characters (enforced by completeness checker)
- Must not repeat the feature name verbatim
- Should explain **what** the feature does and **who** it serves
- Aim for 40-70 characters for best fitness score

```yaml
# Bad
description: Login

# Good
description: Authenticate a user with email and password
```

## Rules

Organize rules into **categorized objects** with at least 2 rules per category. Common categories:

| Category | Purpose |
|----------|---------|
| `security` | OWASP-aligned security requirements |
| `validation` | Input validation rules |
| `permissions` | Authorization and access control |
| `rate_limiting` | Rate limits and throttling |
| `business` | Business logic constraints |
| `data` | Data handling and storage rules |
| `audit` | Logging and compliance requirements |

```yaml
rules:
  security:
    - "Use constant-time comparison for password verification"
    - "Never reveal whether an account exists"
  validation:
    - "Email must be a valid format"
    - "Password must meet minimum length"
```

## Outcomes

See [Outcome Naming Conventions](outcome-naming-conventions.md) for naming patterns.

### Structure

Every outcome should have:

1. **`given[]`** — conditions (structured preferred over plain text)
2. **`then[]`** — side effects (structured actions preferred)
3. **`result`** — human-readable description of what happens
4. **`priority`** — evaluation order (lower = checked first)

```yaml
outcomes:
  rate_limited:
    priority: 0
    error: LOGIN_RATE_LIMITED
    given:
      - field: request_count
        source: system
        operator: gt
        value: 100
    then:
      - action: emit_event
        event: auth.rate_limit.exceeded
        payload: [ip_address, timestamp]
    result: "Request rejected due to rate limiting"

  successful:
    priority: 10
    given:
      - field: email
        source: db
        operator: exists
    then:
      - action: set_field
        target: failed_login_attempts
        value: 0
      - action: emit_event
        event: auth.login.success
        payload: [user_id, email, timestamp]
    result: "User is authenticated and session created"
```

### Outcomes vs Flows

| Use Case | Use `outcomes` | Use `flows` | Use Both |
|----------|---------------|-------------|----------|
| Technical features (login, CRUD) | Yes | No | - |
| Business processes (approvals) | Yes | Yes | Yes |
| Workflow documentation only | No | Yes | - |

## Error Codes

- Define all errors in the `errors[]` array
- Bind every error code to at least one outcome using `error:`
- Include a user-facing `message` for every error
- Include an HTTP `status` code

```yaml
errors:
  - code: LOGIN_INVALID_CREDENTIALS
    status: 401
    message: "Invalid email or password"
  - code: LOGIN_ACCOUNT_LOCKED
    status: 423
    message: "Account temporarily locked"
```

## Fields

- Every field needs `name`, `type`, and `required`
- Add `label` for all user-facing fields
- Add `validation[]` rules — fields without validation are flagged

```yaml
fields:
  - name: email
    type: email
    required: true
    label: "Email Address"
    validation:
      - type: required
        message: "Email is required"
      - type: email
        message: "Please enter a valid email"
```

## Relationships

- Use typed relationships with `reason` explanations
- Types: `required`, `recommended`, `optional`, `extends`
- Cross-references are validated — `required` targets must exist

```yaml
related:
  - feature: password-reset
    type: recommended
    reason: "Users who fail login may need to reset"
```

## AGI Section

Expected by category:

| Category | Autonomy Level | Typical Goals |
|----------|---------------|---------------|
| auth, security | `supervised` / `human_in_loop` | Identity verification, access control |
| data, infrastructure | `semi_autonomous` | Data processing, resource management |
| ai | `fully_autonomous` | ML inference, model management |
| payment | `human_in_loop` | Transaction processing |
| workflow | `supervised` | Process orchestration |

Include at minimum: `goals`, `autonomy`, `verification` (with invariants).

## Fitness Score Targets

| Score Range | Quality | Action |
|-------------|---------|--------|
| 90-100 | Excellent | No action needed |
| 80-89 | Good | Minor improvements |
| 70-79 | Acceptable | Add missing outcomes or relationships |
| 60-69 | Needs work | Likely missing error paths or AGI section |
| Below 60 | Poor | Major sections missing |

Run `node scripts/fitness.js blueprints/category/feature.blueprint.yaml` to see a detailed breakdown.

## Multi-File Generation Conventions

When AI generates code from a blueprint, it produces multiple files. This table documents the standard file roles and paths per framework:

### File Roles by Framework

| Role | Next.js | Express | Python/FastAPI | Laravel |
|------|---------|---------|---------------|---------|
| model | `src/models/{feature}.ts` | `src/models/{feature}.ts` | `app/models/{feature}.py` | `app/Models/{Feature}.php` |
| service | `src/services/{feature}.ts` | `src/services/{feature}.ts` | `app/services/{feature}.py` | `app/Services/{Feature}Service.php` |
| controller | `src/app/api/{feature}/route.ts` | `src/routes/{feature}.ts` | `app/routers/{feature}.py` | `app/Http/Controllers/{Feature}Controller.php` |
| page | `src/app/{feature}/page.tsx` | N/A | N/A | `resources/views/{feature}/index.blade.php` |
| component | `src/components/{Feature}.tsx` | N/A | N/A | N/A |
| test | `__tests__/{feature}.test.ts` | `tests/{feature}.test.ts` | `tests/test_{feature}.py` | `tests/Feature/{Feature}Test.php` |
| migration | `prisma/migrations/` | `prisma/migrations/` | `alembic/versions/` | `database/migrations/` |
| types | `src/types/{feature}.ts` | `src/types/{feature}.ts` | `app/schemas/{feature}.py` | N/A |

### What Each Side Effect Action Generates

| `then[]` Action | Files Generated |
|----------------|----------------|
| `create_record` | Model file + database migration + service method |
| `emit_event` | Event bus setup + event handler file |
| `transition_state` | State machine logic in service layer |
| `notify` | Notification service + message template |
| `call_service` | External service client + interface/types |
| `set_field` | Field update logic in service layer |
| `invalidate` | Cache invalidation logic in service layer |

### Outcome Prerequisites

Outcomes can include a `prerequisites` field — an array of strings explaining what state must exist before the outcome is evaluated. This helps AI understand evaluation order:

```yaml
outcomes:
  invalid_credentials:
    priority: 4
    prerequisites:
      - "User record loaded from database by email"
      - "Password hash computed from input"
    given:
      - field: user
        source: db
        operator: not_exists
```

Prerequisites are auto-generated by `node scripts/propagate-prerequisites.js` based on `given[]` data sources.

### Event Payload Schema

Events can include a `payload_schema` alongside the plain `payload` array, providing typed field definitions with data sources:

```yaml
events:
  - name: auth.login.success
    payload: [user_id, email, timestamp]
    payload_schema:
      - field: user_id
        type: string
        source: db.users
      - field: email
        type: email
        source: input
      - field: timestamp
        type: datetime
        source: system
```

This tells AI exactly where each payload field comes from, eliminating guesswork during code generation.
