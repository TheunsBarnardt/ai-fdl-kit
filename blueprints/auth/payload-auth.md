<!-- AUTO-GENERATED FROM payload-auth.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Auth

> Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies

**Category:** Auth · **Version:** 1.0.0 · **Tags:** cms · headless · jwt · sessions · api-key · pbkdf2 · account-locking · email-verification · payload

## What this does

Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **email** *(email, required)* — Email
- **username** *(text, optional)* — Username
- **password** *(password, required)* — Password
- **salt** *(hidden, optional)* — Salt
- **hash** *(hidden, optional)* — Hash
- **reset_password_token** *(token, optional)* — Reset Password Token
- **reset_password_expiration** *(datetime, optional)* — Reset Password Expiration
- **login_attempts** *(number, optional)* — Login Attempts
- **lock_until** *(datetime, optional)* — Lock Until
- **verification_token** *(token, optional)* — Verification Token
- **verified** *(boolean, optional)* — Verified
- **sessions** *(json, optional)* — Sessions
- **enable_api_key** *(boolean, optional)* — Enable Api Key
- **api_key** *(token, optional)* — Api Key
- **api_key_index** *(hidden, optional)* — Api Key Index

## What must be true

- **security → password_hashing → algorithm:** PBKDF2
- **security → password_hashing → digest:** SHA-256
- **security → password_hashing → iterations:** 25000
- **security → password_hashing → key_length:** 512
- **security → password_hashing → salt_length:** 32
- **security → timing_safe_comparison:** true
- **security → account_locking → max_login_attempts:** 0
- **security → account_locking → lock_duration:** 30m
- **security → account_locking → auto_unlock:** true
- **security → account_locking → revoke_recent_sessions_on_lock:** true
- **security → jwt → algorithm:** HS256
- **security → jwt → default_expiration:** 2h
- **security → jwt → library:** jose
- **security → sessions → enabled_by_default:** true
- **security → sessions → id_format:** UUID v4
- **security → sessions → auto_cleanup_expired:** true
- **security → cookies → http_only:** true
- **security → cookies → secure:** configurable
- **security → cookies → same_site:** configurable
- **security → cookies → name_pattern:** {cookiePrefix}-token
- **security → csrf → validates_origin_header:** true
- **security → csrf → validates_sec_fetch_site:** true
- **security → csrf → allows:** same-origin, same-site, none
- **security → api_key_encryption → algorithm:** AES-256-CTR
- **security → api_key_encryption → iv_length:** 16
- **security → email_verification → enabled_by_default:** false
- **security → email_verification → blocks_login_when_unverified:** true
- **security → email_verification → auto_verified_on_password_reset:** true
- **access → auth_fields_hidden:** true
- **access → sessions_read_own_only:** true
- **access → api_key_encrypted_at_rest:** true

## Success & failure scenarios

**✅ Success paths**

- **Login Success** — when User provides email (or username if loginWithUsername enabled); User provides password; credentials match a user record (timing-safe comparison); account is not locked; email is verified (if verification enabled), then User receives JWT token, user object, and expiration timestamp.
- **Logout Success** — when user is authenticated, then Session removed, auth cookie cleared.
- **Forgot Password Sent** — when email exists, then Success response regardless of whether email exists (prevents enumeration).
- **Reset Password Success** — when reset_password_token exists; Token has not expired, then Password updated, user logged in with new token.
- **Verify Email Success** — when verification_token exists; token matches stored verification token, then User email verified, can now log in.
- **Refresh Token Success** — when user has valid JWT (not expired or about to expire); session ID in JWT matches an active session (if sessions enabled), then New token returned with updated expiration.
- **Unlock Account** — when requesting user has unlock permission; login_attempts gt 0, then Account unlocked, login attempts reset.
- **Register First User** — when no users exist in the auth collection, then First user registered and logged in automatically.
- **Me Current User** — when user is authenticated via any strategy, then Returns current user object, token expiration, and strategy name.

**❌ Failure paths**

- **Login Account Locked** — when Account lock has not expired, then User informed account is locked due to too many failed attempts. *(error: `AUTH_ACCOUNT_LOCKED`)*
- **Login Unverified Email** — when email verification is enabled for this collection; verified eq false, then User informed their email is not verified. *(error: `AUTH_EMAIL_UNVERIFIED`)*
- **Reset Password Expired** — when reset_password_expiration lte "now", then User informed the reset token has expired. *(error: `AUTH_TOKEN_EXPIRED`)*
- **Login Invalid Credentials** — when No user found with provided email OR password does not match stored hash, then Generic authentication error — does not reveal whether email exists. *(error: `AUTH_INVALID_CREDENTIALS`)*
- **Api Key Auth** — when Authorization header contains '{collectionSlug} API-Key {key}'; HMAC-SHA256 of key matches stored apiKeyIndex; email is verified (if verification enabled), then User authenticated with _strategy set to 'api-key'. *(error: `AUTH_UNAUTHORIZED`)*

## Errors it can return

- `AUTH_INVALID_CREDENTIALS` — The email or password provided is incorrect
- `AUTH_ACCOUNT_LOCKED` — This account has been locked due to too many failed login attempts
- `AUTH_EMAIL_UNVERIFIED` — You must verify your email before logging in
- `AUTH_FORBIDDEN` — You are not allowed to perform this action
- `AUTH_TOKEN_EXPIRED` — The token has expired. Please request a new one
- `AUTH_UNAUTHORIZED` — You must be logged in to perform this action

## Events

**`auth.login`** — Emitted after successful login — triggers afterLogin hooks
  Payload: `user_id`, `email`, `timestamp`, `strategy`, `ip_address`

**`auth.logout`** — Emitted after logout — triggers afterLogout hooks
  Payload: `user_id`, `timestamp`

**`auth.verify`** — Emitted when email verification succeeds
  Payload: `user_id`, `email`, `timestamp`

**`auth.forgot_password`** — Emitted after forgot password token generated — triggers afterForgotPassword hooks
  Payload: `user_id`, `email`, `token`, `timestamp`

**`auth.reset_password`** — Emitted after password is successfully reset
  Payload: `user_id`, `email`, `timestamp`

**`auth.refresh`** — Emitted after token refresh — triggers afterRefresh hooks
  Payload: `user_id`, `token`, `timestamp`

**`auth.unlock`** — Emitted when an account is unlocked
  Payload: `user_id`, `email`, `timestamp`

## Connects to

- **payload-access-control** *(required)* — Auth provides the user identity that access control evaluates
- **payload-collections** *(required)* — Auth-enabled collections are standard Payload collections with auth fields added
- **payload-preferences** *(optional)* — Authenticated users can store UI preferences

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 12 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/payload-auth/) · **Spec source:** [`payload-auth.blueprint.yaml`](./payload-auth.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
