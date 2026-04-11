<!-- AUTO-GENERATED FROM oauth-oidc-client-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Oauth Oidc Client Management

> Client registration, configuration, and protocol mappers

**Category:** Integration · **Version:** 1.0.0 · **Tags:** oauth2 · oidc · client-registration

## What this does

Client registration, configuration, and protocol mappers

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client ID
- **redirect_uris** *(text, required)* — Redirect URIs

## What must be true

- **core:** OAuth2/OIDC client management

## Success & failure scenarios

**✅ Success paths**

- **Client Registered** — when client_id exists null, then Client registered.

## Errors it can return

- `INVALID_CLIENT` — Invalid client configuration

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/oauth-oidc-client-management/) · **Spec source:** [`oauth-oidc-client-management.blueprint.yaml`](./oauth-oidc-client-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
