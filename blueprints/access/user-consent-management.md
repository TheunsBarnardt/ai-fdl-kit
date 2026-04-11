<!-- AUTO-GENERATED FROM user-consent-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Consent Management

> OAuth/OIDC consent tracking and enforcement

**Category:** Access · **Version:** 1.0.0 · **Tags:** consent · oauth2

## What this does

OAuth/OIDC consent tracking and enforcement

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client ID
- **scope** *(text, required)* — Scope

## What must be true

- **core:** Consent enforcement

## Success & failure scenarios

**✅ Success paths**

- **Consent Granted** — when client_id exists null, then Consent recorded.

## Errors it can return

- `CONSENT_DENIED` — Consent denied

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/user-consent-management/) · **Spec source:** [`user-consent-management.blueprint.yaml`](./user-consent-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
