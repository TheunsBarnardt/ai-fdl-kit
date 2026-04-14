<!-- AUTO-GENERATED FROM password-reset.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Password Reset

> Allow users to reset their password via email verification

**Category:** Auth · **Version:** 1.0.0 · **Tags:** password · reset · recovery · security · email

## What this does

Allow users to reset their password via email verification

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **email** *(email, required)* — Email Address
- **token** *(token, required)*
- **new_password** *(password, required)* — New Password
- **confirm_new_password** *(password, required)* — Confirm New Password

## What must be true

- **security → token → type:** cryptographic_random
- **security → token → length_bytes:** 32
- **security → token → hash_before_storage:** true
- **security → token → algorithm:** sha256
- **security → token_expiry → minutes:** 60
- **security → single_use:** true
- **security → invalidate_previous:** true
- **security → rate_limit → window_seconds:** 3600
- **security → rate_limit → max_requests:** 3
- **security → rate_limit → scope:** per_email
- **security → rate_limit_global → window_seconds:** 3600
- **security → rate_limit_global → max_requests:** 20
- **security → rate_limit_global → scope:** per_ip
- **security → password_history → check_previous:** false
- **security → password_history → count:** 0
- **security → invalidate_sessions_on_reset:** true
- **email → case_sensitive:** false
- **email → trim_whitespace:** true
- **email → enumeration_prevention:** true
- **password_comparison → constant_time:** true

## Success & failure scenarios

**✅ Success paths**

- **Reset Requested Unknown Email** — when Email not found in database, then show SAME message as successful request (enumeration prevention).
- **Reset Requested** — when Email is valid format; User exists in database, then show "If an account with that email exists, we've sent a password reset link.".

**❌ Failure paths**

- **Request Rate Limited** — when More than 3 reset requests per hour for this email OR More than 20 reset requests per hour from this IP, then show "If an account with that email exists, we've sent a password reset link." (same as success — don't reveal rate limiting). *(error: `RESET_RATE_LIMITED`)*
- **Token Invalid** — when Token hash not found in database OR Token has already been used, then show "This reset link is invalid. Please request a new one." with link to /forgot-password. *(error: `RESET_TOKEN_INVALID`)*
- **Token Expired** — when token_hash exists; Token has expired (older than 60 minutes), then show "This reset link has expired. Please request a new one." with link to /forgot-password. *(error: `RESET_TOKEN_EXPIRED`)*
- **Password Reused** — when New password matches one of the last N passwords, then show "Please choose a password you haven't used recently". *(error: `RESET_PASSWORD_REUSED`)*
- **Password Reset Success** — when Token is present in URL; SHA-256 hash of token matches a DB record; Token has not expired; Token has not been used (single-use); Password meets requirements; Confirm matches new password, then redirect to /login with "Password reset successful. Please sign in with your new password.". *(error: `RESET_PASSWORD_WEAK`)*

## Business flows

**Request Happy Path** — User requests a password reset link

1. **validate_fields** — Check email format
1. **normalize_email** — Lowercase and trim
1. **lookup_user_by_email** — Find user in database
1. **check_rate_limit** — Verify not too many requests
1. **invalidate_previous_tokens** — Cancel any existing reset tokens
1. **generate_reset_token** — Create crypto random token, store hash in DB
1. **send_reset_email** — Email the reset link with token
1. **emit**
1. **show_message**

**Request Email Not Found** — Email not in system — but we don't reveal that

1. **emit**
1. **show_message**

**Reset Happy Path** — User submits new password with valid token

1. **validate_fields** — Check password requirements and match
1. **validate_reset_token** — Hash the URL token, look up in DB, check expiry
1. **check_password_history** — Optional: ensure new password differs from recent ones
1. **hash_new_password** — bcrypt.hash(new_password, salt_rounds)
1. **update_user_password** — Save new hash to database
1. **invalidate_reset_token** — Mark token as used — single use
1. **invalidate_all_sessions** — Log out all active sessions for this user
1. **emit**
1. **send_confirmation_email** — Notify user their password was changed
1. **redirect**

**Token Invalid** — Token expired, already used, or tampered with

1. **emit**
1. **show_error**
1. **show_link**

**Token Expired** — Token is valid but past expiry

1. **emit**
1. **show_error**
1. **show_link**

**Password Reused** — New password matches a recent password

1. **show_error**

**Rate Limited** — Too many reset requests

1. **show_message**

## Errors it can return

- `RESET_VALIDATION_ERROR` — Please check your input and try again
- `RESET_TOKEN_INVALID` — This reset link is invalid. Please request a new one.
- `RESET_TOKEN_EXPIRED` — This reset link has expired. Please request a new one.
- `RESET_PASSWORD_WEAK` — Password does not meet security requirements
- `RESET_PASSWORD_MISMATCH` — Passwords do not match
- `RESET_PASSWORD_REUSED` — Please choose a password you haven't used recently
- `RESET_RATE_LIMITED` — Please wait before requesting another reset

## Events

**`password_reset.requested`** — User requested a password reset email
  Payload: `user_id`, `email`, `timestamp`, `ip_address`, `token_expires_at`

**`password_reset.success`** — Password was successfully changed
  Payload: `user_id`, `email`, `timestamp`, `ip_address`

**`password_reset.token_invalid`** — Invalid or tampered token was submitted
  Payload: `token_hash`, `timestamp`, `ip_address`

**`password_reset.token_expired`** — Expired token was submitted
  Payload: `user_id`, `timestamp`, `ip_address`

**`password_reset.email_not_found`** — Reset requested for non-existent email
  Payload: `email`, `timestamp`, `ip_address`

## Connects to

- **login** *(required)* — After reset, user logs in with new password
- **signup** *(recommended)* — User might not have an account yet
- **email-verification** *(optional)* — Uses similar email token pattern — can share infrastructure

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `███████░░░` | 7/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████████` | 10/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/password-reset/) · **Spec source:** [`password-reset.blueprint.yaml`](./password-reset.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
