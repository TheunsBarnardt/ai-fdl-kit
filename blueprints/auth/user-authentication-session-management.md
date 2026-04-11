<!-- AUTO-GENERATED FROM user-authentication-session-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Authentication Session Management

> Authentication flows, session management, brute-force protection

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · sessions

## What this does

Authentication flows, session management, brute-force protection

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **username** *(text, required)* — Username
- **password** *(password, required)* — Password

## What must be true

- **core:** Authentication and session lifecycle

## Success & failure scenarios

**✅ Success paths**

- **Auth Success** — when username exists null, then User authenticated.

## Errors it can return

- `INVALID_CREDENTIALS` — Invalid credentials

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/user-authentication-session-management/) · **Spec source:** [`user-authentication-session-management.blueprint.yaml`](./user-authentication-session-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
