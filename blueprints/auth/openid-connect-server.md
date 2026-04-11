<!-- AUTO-GENERATED FROM openid-connect-server.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openid Connect Server

> OAuth 2.0 and OpenID Connect identity provider with token issuance

**Category:** Auth · **Version:** 1.0.0 · **Tags:** oauth2 · oidc

## What this does

OAuth 2.0 and OpenID Connect identity provider with token issuance

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client ID
- **scope** *(text, required)* — Scopes
- **redirect_uri** *(url, required)* — Redirect URI

## What must be true

- **core:** OIDC protocol compliance

## Success & failure scenarios

**✅ Success paths**

- **Authorization Success** — when client_id exists null, then Authorization code issued.

**❌ Failure paths**

- **Invalid Client** — when client_id neq "registered", then Invalid client. *(error: `INVALID_CLIENT`)*

## Errors it can return

- `INVALID_CLIENT` — Client not found

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/openid-connect-server/) · **Spec source:** [`openid-connect-server.blueprint.yaml`](./openid-connect-server.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
