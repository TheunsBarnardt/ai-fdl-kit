<!-- AUTO-GENERATED FROM oauth-provider.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Oauth Provider

> OAuth 2.0 authorization server for issuing tokens to third-party applications

**Category:** Integration · **Version:** 1.0.0 · **Tags:** oauth · authorization · tokens · api · security · third-party · integration

## What this does

OAuth 2.0 authorization server for issuing tokens to third-party applications

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client ID
- **client_secret_hash** *(text, optional)* — Client Secret Hash
- **redirect_uris** *(json, required)* — Redirect URIs
- **allowed_scopes** *(multiselect, required)* — Allowed Scopes
- **grant_types** *(multiselect, required)* — Grant Types
- **app_name** *(text, required)* — Application Name
- **app_logo** *(url, optional)* — Application Logo URL

## What must be true

- **authorization_code → code_expiry_seconds:** 600
- **authorization_code → code_length:** 32
- **authorization_code → single_use:** true
- **authorization_code → pkce → required_for_public_clients:** true
- **authorization_code → pkce → challenge_methods:** S256
- **tokens → access_token → format:** jwt
- **tokens → access_token → expiry_seconds:** 3600
- **tokens → access_token → signing_algorithm:** RS256
- **tokens → refresh_token → expiry_days:** 30
- **tokens → refresh_token → rotate_on_use:** true
- **tokens → refresh_token → revoke_family_on_reuse:** true
- **tokens → token_length:** 64
- **client_registration → secret_hashing:** bcrypt
- **client_registration → secret_display:** once
- **client_registration → require_https_redirect:** true
- **client_registration → localhost_exception:** true
- **consent → show_scopes:** true
- **consent → remember_consent:** true
- **consent → consent_expiry_days:** 90
- **rate_limit → token_endpoint → window_seconds:** 60
- **rate_limit → token_endpoint → max_requests:** 30
- **rate_limit → token_endpoint → scope:** per_client
- **rate_limit → authorize_endpoint → window_seconds:** 60
- **rate_limit → authorize_endpoint → max_requests:** 20
- **rate_limit → authorize_endpoint → scope:** per_user

## Success & failure scenarios

**✅ Success paths**

- **Client Registered** — when Application name provided; At least one redirect URI provided; At least one grant type selected, then return client_id and client_secret (secret shown once only).
- **Consent Granted** — when User approved the authorization request; Client is registered and active, then redirect to redirect_uri with authorization code.
- **Token Issued** — when Valid authorization code or client credentials provided; Client is registered and active, then return access_token, refresh_token, token_type, and expires_in.
- **Token Revoked** — when Token provided for revocation; Client requesting revocation is authenticated, then return 200 OK (always succeed — RFC 7009).

**❌ Failure paths**

- **Rate Limited** — when More than 30 token requests per minute from this client, then return 429 with "Too many requests. Please slow down.". *(error: `OAUTH_RATE_LIMITED`)*
- **Invalid Client** — when Client ID not found in registered applications, then return 401 with "Invalid client credentials". *(error: `OAUTH_INVALID_CLIENT`)*
- **Invalid Redirect Uri** — when Redirect URI does not match any registered URI for this client, then show error page (NEVER redirect to unregistered URI). *(error: `OAUTH_INVALID_REDIRECT`)*
- **Pkce Required** — when Client is a public application (no secret); PKCE code challenge not provided, then return 400 with "PKCE is required for public clients". *(error: `OAUTH_PKCE_REQUIRED`)*
- **Authorization Code Expired** — when Code exists in database; Code was issued more than 10 minutes ago, then return 400 with "Authorization code has expired". *(error: `OAUTH_CODE_EXPIRED`)*
- **Refresh Token Reuse Detected** — when Refresh token provided; This refresh token has already been used (possible theft), then return 401 and revoke all tokens in the family. *(error: `OAUTH_TOKEN_REUSE`)*

## Errors it can return

- `OAUTH_INVALID_CLIENT` — Invalid client credentials
- `OAUTH_INVALID_REDIRECT` — Invalid redirect URI
- `OAUTH_PKCE_REQUIRED` — PKCE code challenge is required for public clients
- `OAUTH_CODE_EXPIRED` — Authorization code has expired. Please try again.
- `OAUTH_TOKEN_REUSE` — Token has been revoked for security reasons
- `OAUTH_RATE_LIMITED` — Too many requests. Please slow down.
- `OAUTH_INVALID_SCOPE` — One or more requested scopes are not allowed
- `OAUTH_CONSENT_DENIED` — User denied the authorization request

## Connects to

- **login** *(required)* — Users must authenticate before authorizing third-party apps
- **api-gateway** *(recommended)* — Gateway validates access tokens on API requests
- **webhook-ingestion** *(optional)* — Third-party apps may register webhooks after authorization

## Quality fitness 🟢 92/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████████` | 10/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/oauth-provider/) · **Spec source:** [`oauth-provider.blueprint.yaml`](./oauth-provider.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
