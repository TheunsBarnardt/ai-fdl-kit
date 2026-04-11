---
title: "Password Reset Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Allow users to reset their password via email verification. 4 fields. 7 outcomes. 7 error codes. rules: security, email, password_comparison. AGI: supervised"
---

# Password Reset Blueprint

> Allow users to reset their password via email verification

| | |
|---|---|
| **Feature** | `password-reset` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | password, reset, recovery, security, email |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/password-reset.blueprint.yaml) |
| **JSON API** | [password-reset.json]({{ site.baseurl }}/api/blueprints/auth/password-reset.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes | Email Address | Validations: required, email, maxLength |
| `token` | token | Yes |  | Validations: required |
| `new_password` | password | Yes | New Password | Validations: required, minLength, maxLength, pattern |
| `confirm_new_password` | password | Yes | Confirm New Password | Validations: required, match |

## Rules

- **security:**
  - **token:**
    - **type:** cryptographic_random
    - **length_bytes:** 32
    - **hash_before_storage:** true
    - **algorithm:** sha256
  - **token_expiry:**
    - **minutes:** 60
  - **single_use:** true
  - **invalidate_previous:** true
  - **rate_limit:**
    - **window_seconds:** 3600
    - **max_requests:** 3
    - **scope:** per_email
  - **rate_limit_global:**
    - **window_seconds:** 3600
    - **max_requests:** 20
    - **scope:** per_ip
  - **password_history:**
    - **check_previous:** false
    - **count:** 0
  - **invalidate_sessions_on_reset:** true
- **email:**
  - **case_sensitive:** false
  - **trim_whitespace:** true
  - **enumeration_prevention:** true
- **password_comparison:**
  - **constant_time:** true

## Flows

### Request_happy_path

User requests a password reset link

1. **validate_fields** — Check email format
1. **normalize_email** — Lowercase and trim
1. **lookup_user_by_email** — Find user in database
1. **check_rate_limit** — Verify not too many requests
1. **invalidate_previous_tokens** — Cancel any existing reset tokens
1. **generate_reset_token** — Create crypto random token, store hash in DB
1. **send_reset_email** — Email the reset link with token
1. **emit**
1. **show_message**

### Request_email_not_found

Email not in system — but we don't reveal that

1. **emit**
1. **show_message**

### Reset_happy_path

User submits new password with valid token

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

### Token_invalid

Token expired, already used, or tampered with

1. **emit**
1. **show_error**
1. **show_link**

### Token_expired

Token is valid but past expiry

1. **emit**
1. **show_error**
1. **show_link**

### Password_reused

New password matches a recent password

1. **show_error**

### Rate_limited

Too many reset requests

1. **show_message**

## Outcomes

### Request_rate_limited (Priority: 1) — Error: `RESET_RATE_LIMITED`

**Given:**
- ANY: `email_request_count` (computed) gt `3` OR `ip_request_count` (computed) gt `20`

**Result:** show "If an account with that email exists, we've sent a password reset link." (same as success — don't reveal rate limiting)

### Reset_requested_unknown_email (Priority: 2)

**Given:**
- `user` (db) not_exists

**Then:**
- **emit_event** event: `password_reset.email_not_found`

**Result:** show SAME message as successful request (enumeration prevention)

### Reset_requested (Priority: 3) | Transaction: atomic

**Given:**
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `user` (db) exists

**Then:**
- **invalidate** target: `reset_tokens` — Invalidate all previous reset tokens
- **create_record** target: `reset_token` — Generate crypto.randomBytes(32), store SHA-256 hash, expires in 60 min
- **notify** to: `user` — Send reset link with raw token
- **emit_event** event: `password_reset.requested`

**Result:** show "If an account with that email exists, we've sent a password reset link."

### Token_invalid (Priority: 4) — Error: `RESET_TOKEN_INVALID`

**Given:**
- ANY: `token_hash` (db) not_exists OR `token_used` (db) eq `true`

**Then:**
- **emit_event** event: `password_reset.token_invalid`

**Result:** show "This reset link is invalid. Please request a new one." with link to /forgot-password

### Token_expired (Priority: 5) — Error: `RESET_TOKEN_EXPIRED`

**Given:**
- `token_hash` (db) exists
- `token_created_at` (db) lt `now - 60 minutes`

**Then:**
- **emit_event** event: `password_reset.token_expired`

**Result:** show "This reset link has expired. Please request a new one." with link to /forgot-password

### Password_reused (Priority: 6) — Error: `RESET_PASSWORD_REUSED`

**Given:**
- `new_password` (computed) in `recent_password_hashes`

**Result:** show "Please choose a password you haven't used recently"

### Password_reset_success (Priority: 10) — Error: `RESET_PASSWORD_WEAK` | Transaction: atomic

**Given:**
- `token` (input) exists
- `token_hash` (db) exists
- `token_created_at` (db) gte `now - 60 minutes`
- `token_used` (db) eq `false`
- `new_password` (input) matches `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$`
- `confirm_new_password` (input) eq `new_password`

**Then:**
- **set_field** target: `password_hash` value: `bcrypt(new_password, 12)` — Hash new password with bcrypt (12 rounds)
- **set_field** target: `token_used` value: `true` — Mark token as used (single-use)
- **invalidate** target: `sessions` — Invalidate ALL active sessions for this user
- **notify** to: `user` — Confirm password was changed
- **emit_event** event: `password_reset.success`

**Result:** redirect to /login with "Password reset successful. Please sign in with your new password."

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RESET_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |
| `RESET_TOKEN_INVALID` | 400 | This reset link is invalid. Please request a new one. | No |
| `RESET_TOKEN_EXPIRED` | 400 | This reset link has expired. Please request a new one. | No |
| `RESET_PASSWORD_WEAK` | 422 | Password does not meet security requirements | Yes |
| `RESET_PASSWORD_MISMATCH` | 422 | Passwords do not match | Yes |
| `RESET_PASSWORD_REUSED` | 422 | Please choose a password you haven't used recently | Yes |
| `RESET_RATE_LIMITED` | 429 | Please wait before requesting another reset | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `password_reset.requested` | User requested a password reset email | `user_id`, `email`, `timestamp`, `ip_address`, `token_expires_at` |
| `password_reset.success` | Password was successfully changed | `user_id`, `email`, `timestamp`, `ip_address` |
| `password_reset.token_invalid` | Invalid or tampered token was submitted | `token_hash`, `timestamp`, `ip_address` |
| `password_reset.token_expired` | Expired token was submitted | `user_id`, `timestamp`, `ip_address` |
| `password_reset.email_not_found` | Reset requested for non-existent email | `email`, `timestamp`, `ip_address` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | After reset, user logs in with new password |
| signup | recommended | User might not have an account yet |
| email-verification | optional | Uses similar email token pattern — can share infrastructure |

## AGI Readiness

### Goals

#### Reliable Password Reset

Allow users to reset their password via email verification

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `login` | login | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| request_rate_limited | `autonomous` | - | - |
| reset_requested_unknown_email | `autonomous` | - | - |
| reset_requested | `autonomous` | - | - |
| token_invalid | `autonomous` | - | - |
| token_expired | `autonomous` | - | - |
| password_reused | `autonomous` | - | - |
| password_reset_success | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
screens:
  request:
    layout: single_column_centered
    max_width: 420px
    show_logo: true
    title: Reset your password
    subtitle: Enter your email and we'll send you a reset link
    fields_order:
      - email
    actions:
      primary:
        label: Send reset link
        type: submit
        full_width: true
    links:
      - label: Back to sign in
        target: login
        position: below_form
  reset:
    layout: single_column_centered
    max_width: 420px
    show_logo: true
    title: Set new password
    subtitle: Enter your new password below
    fields_order:
      - new_password
      - confirm_new_password
    actions:
      primary:
        label: Reset password
        type: submit
        full_width: true
accessibility:
  autofocus_request: email
  autofocus_reset: new_password
  autocomplete:
    new_password: new-password
    confirm_new_password: new-password
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  prevent_double_submit: true
password_strength:
  show_meter: true
  show_requirements: true
```

</details>

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
nextjs:
  routes:
    request: /forgot-password
    reset: /reset-password
  layout: (auth)
  server_action: true
payload_cms:
  collection: users
  auth:
    forgotPassword:
      generateEmailHTML: true
    verify: false
laravel:
  routes:
    request: /forgot-password
    reset: /reset-password/{token}
  middleware:
    - guest
  notification: ResetPassword
  broker: users
express:
  routes:
    request: /api/auth/forgot-password
    reset: /api/auth/reset-password
  middleware:
    - rate-limit
    - cors
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Password Reset Blueprint",
  "description": "Allow users to reset their password via email verification. 4 fields. 7 outcomes. 7 error codes. rules: security, email, password_comparison. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "password, reset, recovery, security, email"
}
</script>
