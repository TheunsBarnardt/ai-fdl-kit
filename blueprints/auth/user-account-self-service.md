<!-- AUTO-GENERATED FROM user-account-self-service.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Account Self Service

> User self-service account and credential management

**Category:** Auth · **Version:** 1.0.0 · **Tags:** account-management

## What this does

User self-service account and credential management

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **email** *(email, required)* — Email
- **current_password** *(password, required)* — Current Password

## What must be true

- **core:** Account self-service operations

## Success & failure scenarios

**✅ Success paths**

- **Profile Updated** — when email exists null, then Profile updated.

## Errors it can return

- `INVALID_PASSWORD` — Invalid password

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/user-account-self-service/) · **Spec source:** [`user-account-self-service.blueprint.yaml`](./user-account-self-service.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
