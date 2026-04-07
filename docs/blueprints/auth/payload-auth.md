---
title: "Payload Auth Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies. 15 fields. 14 outcomes. 6 error codes. rules"
---

# Payload Auth Blueprint

> Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies

| | |
|---|---|
| **Feature** | `payload-auth` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | cms, headless, jwt, sessions, api-key, pbkdf2, account-locking, email-verification, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/payload-auth.blueprint.yaml) |
| **JSON API** | [payload-auth.json]({{ site.baseurl }}/api/blueprints/auth/payload-auth.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | End user authenticating via email/password, username/password, or API key |
| `auth_service` | Auth Service | system | Payload auth engine — handles JWT signing, session management, password hashing |
| `email_service` | Email Service | system | Pluggable email adapter for sending verification and password reset emails |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes | Email | Validations: required, email, unique |
| `username` | text | No | Username |  |
| `password` | password | Yes | Password | Validations: minLength |
| `salt` | hidden | No |  |  |
| `hash` | hidden | No |  |  |
| `reset_password_token` | token | No |  |  |
| `reset_password_expiration` | datetime | No |  |  |
| `login_attempts` | number | No |  |  |
| `lock_until` | datetime | No |  |  |
| `verification_token` | token | No |  |  |
| `verified` | boolean | No |  |  |
| `sessions` | json | No |  |  |
| `enable_api_key` | boolean | No |  |  |
| `api_key` | token | No |  |  |
| `api_key_index` | hidden | No |  |  |

## Rules

- **security:**
  - **password_hashing:**
    - **algorithm:** PBKDF2
    - **digest:** SHA-256
    - **iterations:** 25000
    - **key_length:** 512
    - **salt_length:** 32
  - **timing_safe_comparison:** true
  - **account_locking:**
    - **max_login_attempts:** 0
    - **lock_duration:** 30m
    - **auto_unlock:** true
    - **revoke_recent_sessions_on_lock:** true
  - **jwt:**
    - **algorithm:** HS256
    - **default_expiration:** 2h
    - **library:** jose
  - **sessions:**
    - **enabled_by_default:** true
    - **id_format:** UUID v4
    - **auto_cleanup_expired:** true
  - **cookies:**
    - **http_only:** true
    - **secure:** configurable
    - **same_site:** configurable
    - **name_pattern:** {cookiePrefix}-token
  - **csrf:**
    - **validates_origin_header:** true
    - **validates_sec_fetch_site:** true
    - **allows:** same-origin, same-site, none
  - **api_key_encryption:**
    - **algorithm:** AES-256-CTR
    - **iv_length:** 16
  - **email_verification:**
    - **enabled_by_default:** false
    - **blocks_login_when_unverified:** true
    - **auto_verified_on_password_reset:** true
- **access:**
  - **auth_fields_hidden:** true
  - **sessions_read_own_only:** true
  - **api_key_encrypted_at_rest:** true

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| token_expiration |  |  |

## Outcomes

### Login_account_locked (Priority: 2) — Error: `AUTH_ACCOUNT_LOCKED`

**Given:**
- `lock_until` (db) gt `now`

**Result:** User informed account is locked due to too many failed attempts

### Login_unverified_email (Priority: 3) — Error: `AUTH_EMAIL_UNVERIFIED`

**Given:**
- email verification is enabled for this collection
- `verified` (db) eq `false`

**Result:** User informed their email is not verified

### Reset_password_expired (Priority: 3) — Error: `AUTH_TOKEN_EXPIRED`

**Given:**
- `reset_password_expiration` (db) lte `now`

**Result:** User informed the reset token has expired

### Login_invalid_credentials (Priority: 5) — Error: `AUTH_INVALID_CREDENTIALS`

**Given:**
- ANY: `email` (db) not_exists OR password does not match stored hash

**Then:**
- **set_field** target: `login_attempts` value: `login_attempts + 1` when: `login_attempts >= 0` — Increment failed attempt counter

**Result:** Generic authentication error — does not reveal whether email exists

### Login_success (Priority: 10) | Transaction: atomic

**Given:**
- `email` (input) exists
- `password` (input) exists
- credentials match a user record (timing-safe comparison)
- account is not locked
- email is verified (if verification enabled)

**Then:**
- **set_field** target: `login_attempts` value: `0` — Reset failed attempt counter
- **emit_event** event: `auth.login`
- JWT token signed with user fields marked saveToJWT
- Session created with UUID and expiration (if sessions enabled)
- Token set as HttpOnly cookie

**Result:** User receives JWT token, user object, and expiration timestamp

### Logout_success (Priority: 10)

**Given:**
- user is authenticated

**Then:**
- **invalidate** target: `session` — Remove session from user's sessions array
- **emit_event** event: `auth.logout`

**Result:** Session removed, auth cookie cleared

### Forgot_password_sent (Priority: 10)

**Given:**
- `email` (input) exists

**Then:**
- **set_field** target: `reset_password_token` value: `random 20-byte hex token`
- **set_field** target: `reset_password_expiration` value: `now + 1h`
- **notify** to: `user` — Email with reset link (customizable HTML/subject)

**Result:** Success response regardless of whether email exists (prevents enumeration)

### Reset_password_success (Priority: 10) | Transaction: atomic

**Given:**
- `reset_password_token` (input) exists
- `reset_password_expiration` (db) gt `now`

**Then:**
- New salt and hash generated from provided password
- **set_field** target: `reset_password_token` value: `null`
- **set_field** target: `verified` value: `true` — Auto-verify user on password reset
- New JWT token and session created

**Result:** Password updated, user logged in with new token

### Verify_email_success (Priority: 10)

**Given:**
- `verification_token` (input) exists
- token matches stored verification token

**Then:**
- **set_field** target: `verified` value: `true`
- **set_field** target: `verification_token` value: `null`
- **emit_event** event: `auth.verify`

**Result:** User email verified, can now log in

### Refresh_token_success (Priority: 10)

**Given:**
- user has valid JWT (not expired or about to expire)
- session ID in JWT matches an active session (if sessions enabled)

**Then:**
- New JWT token signed with same user data
- Session expiration extended

**Result:** New token returned with updated expiration

### Unlock_account (Priority: 10)

**Given:**
- requesting user has unlock permission
- `login_attempts` (db) gt `0`

**Then:**
- **set_field** target: `login_attempts` value: `0`
- **set_field** target: `lock_until` value: `null`

**Result:** Account unlocked, login attempts reset

### Register_first_user (Priority: 10)

**Given:**
- no users exist in the auth collection

**Then:**
- User created with provided data
- **set_field** target: `verified` value: `true` — Auto-verify first user
- JWT token and session created

**Result:** First user registered and logged in automatically

### Me_current_user (Priority: 10)

**Given:**
- user is authenticated via any strategy

**Result:** Returns current user object, token expiration, and strategy name

### Api_key_auth (Priority: 10)

**Given:**
- Authorization header contains '{collectionSlug} API-Key {key}'
- HMAC-SHA256 of key matches stored apiKeyIndex
- email is verified (if verification enabled)

**Result:** User authenticated with _strategy set to 'api-key'

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_INVALID_CREDENTIALS` | 401 | The email or password provided is incorrect | Yes |
| `AUTH_ACCOUNT_LOCKED` | 401 | This account has been locked due to too many failed login attempts | No |
| `AUTH_EMAIL_UNVERIFIED` | 401 | You must verify your email before logging in | No |
| `AUTH_FORBIDDEN` | 403 | You are not allowed to perform this action | No |
| `AUTH_TOKEN_EXPIRED` | 401 | The token has expired. Please request a new one | Yes |
| `AUTH_UNAUTHORIZED` | 401 | You must be logged in to perform this action | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `auth.login` | Emitted after successful login — triggers afterLogin hooks | `user_id`, `email`, `timestamp`, `strategy`, `ip_address` |
| `auth.logout` | Emitted after logout — triggers afterLogout hooks | `user_id`, `timestamp` |
| `auth.verify` | Emitted when email verification succeeds | `user_id`, `email`, `timestamp` |
| `auth.forgot_password` | Emitted after forgot password token generated — triggers afterForgotPassword hooks | `user_id`, `email`, `token`, `timestamp` |
| `auth.reset_password` | Emitted after password is successfully reset | `user_id`, `email`, `timestamp` |
| `auth.refresh` | Emitted after token refresh — triggers afterRefresh hooks | `user_id`, `token`, `timestamp` |
| `auth.unlock` | Emitted when an account is unlocked | `user_id`, `email`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-access-control | required | Auth provides the user identity that access control evaluates |
| payload-collections | required | Auth-enabled collections are standard Payload collections with auth fields added |
| payload-preferences | optional | Authenticated users can store UI preferences |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x (Next.js-based)
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
  orm: Drizzle (SQL) / Mongoose (MongoDB)
auth_strategies:
  - name: local-jwt
    description: Email/password with PBKDF2 hashing and JWT tokens
  - name: api-key
    description: HMAC-indexed API key with AES-256-CTR encryption at rest
  - name: custom
    description: Pluggable strategy array for OAuth, SAML, etc.
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Auth Blueprint",
  "description": "Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies. 15 fields. 14 outcomes. 6 error codes. rules",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, headless, jwt, sessions, api-key, pbkdf2, account-locking, email-verification, payload"
}
</script>
