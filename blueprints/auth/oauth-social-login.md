<!-- AUTO-GENERATED FROM oauth-social-login.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Oauth Social Login

> Social sign-in via OAuth2/OIDC with account linking and profile sync

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · oauth · oidc · social-login · identity · federation

## What this does

Social sign-in via OAuth2/OIDC with account linking and profile sync

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **provider** *(select, required)* — Identity Provider
- **provider_user_id** *(text, required)* — Provider User ID
- **access_token** *(token, optional)* — OAuth Access Token
- **refresh_token** *(token, optional)* — OAuth Refresh Token
- **id_token** *(token, optional)* — OIDC ID Token
- **linked_at** *(datetime, optional)* — Account Linked At
- **provider_email** *(email, optional)* — Provider Email
- **provider_name** *(text, optional)* — Provider Display Name
- **provider_avatar_url** *(url, optional)* — Provider Avatar URL
- **state_parameter** *(token, required)* — CSRF State Parameter
- **code_verifier** *(token, required)* — PKCE Code Verifier

## What must be true

- **security → oauth_flow:** authorization_code
- **security → pkce → enabled:** true
- **security → pkce → method:** S256
- **security → pkce → code_verifier_length:** 128
- **security → state_parameter → required:** true
- **security → state_parameter → entropy_bytes:** 32
- **security → state_parameter → expiry_seconds:** 600
- **security → token_storage → encrypt_at_rest:** true
- **security → token_storage → encryption:** aes_256_gcm
- **security → callback_url → strict_validation:** true
- **security → callback_url → https_required:** true
- **security → rate_limit → window_seconds:** 60
- **security → rate_limit → max_requests:** 10
- **security → rate_limit → scope:** per_ip
- **account_linking → match_by_email:** true
- **account_linking → require_confirmation:** true
- **account_linking → allow_multiple_providers:** true
- **account_linking → allow_unlink:** true
- **profile_sync → sync_on_login:** true
- **profile_sync → fields:** email, name, avatar_url
- **profile_sync → overwrite_existing:** false
- **providers → google → scopes:** openid, email, profile
- **providers → google → auth_url:** https://accounts.google.com/o/oauth2/v2/auth
- **providers → google → token_url:** https://oauth2.googleapis.com/token
- **providers → github → scopes:** user:email, read:user
- **providers → github → auth_url:** https://github.com/login/oauth/authorize
- **providers → github → token_url:** https://github.com/login/oauth/access_token
- **providers → apple → scopes:** name, email
- **providers → apple → auth_url:** https://appleid.apple.com/auth/authorize
- **providers → apple → token_url:** https://appleid.apple.com/auth/token
- **providers → apple → response_mode:** form_post
- **providers → microsoft → scopes:** openid, email, profile
- **providers → microsoft → auth_url:** https://login.microsoftonline.com/common/oauth2/v2.0/authorize
- **providers → microsoft → token_url:** https://login.microsoftonline.com/common/oauth2/v2.0/token

## Success & failure scenarios

**✅ Success paths**

- **Account Link Existing** — when Provider returned a verified email; A local account exists with the same email; This provider is not yet linked to the local account; User confirmed account linking, then account linked — redirect to application.
- **New User Registration** — when No local account with this email; Provider returned a verified email, then new account created and linked — redirect to onboarding or dashboard.
- **Returning User Login** — when Provider is already linked to a local account; local_account exists; Account is not disabled, then redirect to dashboard.
- **Unlink Provider** — when Provider link exists; User has at least one other auth method (password or another provider), then provider unlinked — user retains other authentication methods.

**❌ Failure paths**

- **Rate Limited** — when More than 10 OAuth requests in 60 seconds from this IP, then show "Too many login attempts. Please wait a moment.". *(error: `OAUTH_RATE_LIMITED`)*
- **Invalid State** — when State parameter missing from callback OR State parameter does not match stored value, then show "Authentication failed. Please try again." (CSRF protection triggered). *(error: `OAUTH_INVALID_STATE`)*
- **Invalid Provider** — when Unsupported identity provider, then show "Unsupported login provider". *(error: `OAUTH_INVALID_PROVIDER`)*
- **Token Exchange Failed** — when authorization_code exists; Token exchange with provider failed, then show "Authentication failed. Please try again.". *(error: `OAUTH_TOKEN_EXCHANGE_FAILED`)*

## Errors it can return

- `OAUTH_RATE_LIMITED` — Too many login attempts. Please wait a moment.
- `OAUTH_INVALID_STATE` — Authentication failed. Please try again.
- `OAUTH_INVALID_PROVIDER` — Unsupported login provider
- `OAUTH_TOKEN_EXCHANGE_FAILED` — Authentication failed. Please try again.
- `OAUTH_ACCOUNT_DISABLED` — This account has been disabled. Please contact support.
- `OAUTH_EMAIL_NOT_PROVIDED` — Email permission is required. Please grant email access and try again.
- `OAUTH_UNLINK_LAST_METHOD` — Cannot remove your only login method. Add a password or another provider first.

## Events

**`oauth.authorized`** — User authenticated via social provider
  Payload: `user_id`, `provider`, `provider_user_id`, `timestamp`, `is_new_user`

**`oauth.linked`** — Social provider linked to existing account
  Payload: `user_id`, `provider`, `provider_user_id`, `timestamp`

**`oauth.unlinked`** — Social provider unlinked from account
  Payload: `user_id`, `provider`, `timestamp`

**`oauth.csrf_detected`** — CSRF attack detected via invalid state parameter
  Payload: `ip_address`, `provider`, `timestamp`

**`oauth.token_failed`** — Token exchange with provider failed
  Payload: `provider`, `timestamp`, `error_code`

## Connects to

- **login** *(recommended)* — Social login is an alternative to password-based login
- **signup** *(recommended)* — Social login can create new accounts automatically
- **session-management** *(recommended)* — Sessions created via OAuth need tracking and revocation
- **multi-factor-auth** *(optional)* — MFA can be required even after social authentication

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `████████░░` | 8/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/oauth-social-login/) · **Spec source:** [`oauth-social-login.blueprint.yaml`](./oauth-social-login.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
