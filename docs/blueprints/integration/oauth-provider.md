---
title: "Oauth Provider Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "OAuth 2.0 authorization server for issuing tokens to third-party applications. 7 fields. 10 outcomes. 8 error codes. rules: authorization_code, tokens, client_r"
---

# Oauth Provider Blueprint

> OAuth 2.0 authorization server for issuing tokens to third-party applications

| | |
|---|---|
| **Feature** | `oauth-provider` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | oauth, authorization, tokens, api, security, third-party, integration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/oauth-provider.blueprint.yaml) |
| **JSON API** | [oauth-provider.json]({{ site.baseurl }}/api/blueprints/integration/oauth-provider.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | Yes | Client ID | Validations: required, pattern |
| `client_secret_hash` | text | No | Client Secret Hash | Validations: minLength |
| `redirect_uris` | json | Yes | Redirect URIs | Validations: required |
| `allowed_scopes` | multiselect | Yes | Allowed Scopes | Validations: required |
| `grant_types` | multiselect | Yes | Grant Types | Validations: required |
| `app_name` | text | Yes | Application Name | Validations: required, minLength, maxLength |
| `app_logo` | url | No | Application Logo URL | Validations: url |

## Rules

- **authorization_code:**
  - **code_expiry_seconds:** 600
  - **code_length:** 32
  - **single_use:** true
  - **pkce:**
    - **required_for_public_clients:** true
    - **challenge_methods:** S256
- **tokens:**
  - **access_token:**
    - **format:** jwt
    - **expiry_seconds:** 3600
    - **signing_algorithm:** RS256
  - **refresh_token:**
    - **expiry_days:** 30
    - **rotate_on_use:** true
    - **revoke_family_on_reuse:** true
  - **token_length:** 64
- **client_registration:**
  - **secret_hashing:** bcrypt
  - **secret_display:** once
  - **require_https_redirect:** true
  - **localhost_exception:** true
- **consent:**
  - **show_scopes:** true
  - **remember_consent:** true
  - **consent_expiry_days:** 90
- **rate_limit:**
  - **token_endpoint:**
    - **window_seconds:** 60
    - **max_requests:** 30
    - **scope:** per_client
  - **authorize_endpoint:**
    - **window_seconds:** 60
    - **max_requests:** 20
    - **scope:** per_user

## Outcomes

### Rate_limited (Priority: 1) — Error: `OAUTH_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `30`

**Result:** return 429 with "Too many requests. Please slow down."

### Invalid_client (Priority: 2) — Error: `OAUTH_INVALID_CLIENT`

**Given:**
- `client_id` (input) not_exists

**Result:** return 401 with "Invalid client credentials"

### Invalid_redirect_uri (Priority: 3) — Error: `OAUTH_INVALID_REDIRECT`

**Given:**
- `redirect_uri` (input) not_in `registered_redirect_uris`

**Result:** show error page (NEVER redirect to unregistered URI)

### Pkce_required (Priority: 4) — Error: `OAUTH_PKCE_REQUIRED`

**Given:**
- `client_type` (db) eq `public`
- `code_challenge` (input) not_exists

**Result:** return 400 with "PKCE is required for public clients"

### Authorization_code_expired (Priority: 5) — Error: `OAUTH_CODE_EXPIRED`

**Given:**
- `authorization_code` (db) exists
- `code_created_at` (db) lt `now - 10m`

**Then:**
- **delete_record** target: `authorization_code` — Remove expired code

**Result:** return 400 with "Authorization code has expired"

### Refresh_token_reuse_detected (Priority: 6) — Error: `OAUTH_TOKEN_REUSE` | Transaction: atomic

**Given:**
- `refresh_token` (input) exists
- `refresh_token_used` (db) eq `true`

**Then:**
- **invalidate** target: `token_family` — Revoke all tokens in this family — potential compromise
- **emit_event** event: `oauth.token_reuse_detected`

**Result:** return 401 and revoke all tokens in the family

### Client_registered (Priority: 7) | Transaction: atomic

**Given:**
- `app_name` (input) exists
- `redirect_uris` (input) exists
- `grant_types` (input) exists

**Then:**
- **create_record** target: `client` — Create client with generated client_id and hashed secret
- **emit_event** event: `oauth.client_registered`

**Result:** return client_id and client_secret (secret shown once only)

### Consent_granted (Priority: 8) | Transaction: atomic

**Given:**
- `user_consent` (input) eq `true`
- `client_id` (db) exists

**Then:**
- **create_record** target: `authorization_code` — Generate single-use authorization code (10-min expiry)
- **emit_event** event: `oauth.authorized`

**Result:** redirect to redirect_uri with authorization code

### Token_issued (Priority: 9) | Transaction: atomic

**Given:**
- `authorization_code` (input) exists
- `client_id` (db) exists

**Then:**
- **create_record** target: `access_token` — Generate JWT access token (1-hour expiry)
- **create_record** target: `refresh_token` — Generate refresh token (30-day expiry)
- **delete_record** target: `authorization_code` — Consume the authorization code (single use)
- **emit_event** event: `oauth.token_issued`

**Result:** return access_token, refresh_token, token_type, and expires_in

### Token_revoked (Priority: 10) | Transaction: atomic

**Given:**
- `token` (input) exists
- `client_id` (input) exists

**Then:**
- **invalidate** target: `token` — Mark token as revoked
- **emit_event** event: `oauth.token_revoked`

**Result:** return 200 OK (always succeed — RFC 7009)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OAUTH_INVALID_CLIENT` | 401 | Invalid client credentials | No |
| `OAUTH_INVALID_REDIRECT` | 400 | Invalid redirect URI | No |
| `OAUTH_PKCE_REQUIRED` | 400 | PKCE code challenge is required for public clients | Yes |
| `OAUTH_CODE_EXPIRED` | 400 | Authorization code has expired. Please try again. | Yes |
| `OAUTH_TOKEN_REUSE` | 401 | Token has been revoked for security reasons | No |
| `OAUTH_RATE_LIMITED` | 429 | Too many requests. Please slow down. | Yes |
| `OAUTH_INVALID_SCOPE` | 400 | One or more requested scopes are not allowed | Yes |
| `OAUTH_CONSENT_DENIED` | 403 | User denied the authorization request | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `oauth.client_registered` | New OAuth client application registered | `client_id`, `app_name`, `allowed_scopes`, `grant_types`, `timestamp` |
| `oauth.authorized` | User granted authorization to a client application | `client_id`, `user_id`, `scopes`, `timestamp` |
| `oauth.token_issued` | Access and refresh tokens issued to a client | `client_id`, `user_id`, `scopes`, `token_type`, `timestamp` |
| `oauth.token_revoked` | Token revoked by client or user | `client_id`, `user_id`, `token_type`, `timestamp` |
| `oauth.token_reuse_detected` | Refresh token reuse detected — possible token theft | `client_id`, `user_id`, `token_family_id`, `timestamp`, `ip_address` |
| `oauth.consent_revoked` | User revoked consent for a client application | `client_id`, `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | Users must authenticate before authorizing third-party apps |
| api-gateway | recommended | Gateway validates access tokens on API requests |
| webhook-ingestion | optional | Third-party apps may register webhooks after authorization |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Oauth Provider Blueprint",
  "description": "OAuth 2.0 authorization server for issuing tokens to third-party applications. 7 fields. 10 outcomes. 8 error codes. rules: authorization_code, tokens, client_r",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "oauth, authorization, tokens, api, security, third-party, integration"
}
</script>
