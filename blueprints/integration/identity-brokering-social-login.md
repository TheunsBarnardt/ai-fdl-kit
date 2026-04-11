<!-- AUTO-GENERATED FROM identity-brokering-social-login.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Identity Brokering Social Login

> External identity provider integration and social login

**Category:** Integration · **Version:** 1.0.0 · **Tags:** identity-brokering · social-login

## What this does

External identity provider integration and social login

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **provider_alias** *(text, required)* — Provider Alias
- **client_id** *(text, required)* — Client ID

## What must be true

- **core:** Identity provider delegation

## Success & failure scenarios

**✅ Success paths**

- **User Authenticated** — when provider_alias exists null, then External authentication successful.

## Errors it can return

- `BROKER_ERROR` — External authentication failed

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/identity-brokering-social-login/) · **Spec source:** [`identity-brokering-social-login.blueprint.yaml`](./identity-brokering-social-login.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
