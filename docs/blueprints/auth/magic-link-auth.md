---
title: "Magic Link Auth Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Passwordless email login via single-use magic links. 6 fields. 8 outcomes. 6 error codes. rules: security, email. AGI: supervised"
---

# Magic Link Auth Blueprint

> Passwordless email login via single-use magic links

| | |
|---|---|
| **Feature** | `magic-link-auth` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, passwordless, magic-link, email, security, identity |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/magic-link-auth.blueprint.yaml) |
| **JSON API** | [magic-link-auth.json]({{ site.baseurl }}/api/blueprints/auth/magic-link-auth.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes | Email Address | Validations: required, email, maxLength |
| `token_hash` | hidden | Yes | Token Hash |  |
| `expires_at` | datetime | Yes | Token Expires At |  |
| `used_at` | datetime | No | Token Used At |  |
| `ip_address` | text | No | Requester IP Address |  |
| `user_agent` | text | No | Requester User Agent | Validations: maxLength |

## Rules

- **security:**
  - **token:**
    - **entropy_bytes:** 32
    - **hash_algorithm:** sha256
    - **expiry_minutes:** 15
    - **single_use:** true
  - **ip_binding:**
    - **enabled:** false
    - **warn_on_ip_mismatch:** true
  - **rate_limit:**
    - **window_seconds:** 300
    - **max_requests:** 3
    - **scope:** per_email
    - **cooldown_seconds:** 60
  - **rate_limit_global:**
    - **window_seconds:** 60
    - **max_requests:** 20
    - **scope:** per_ip
  - **enumeration_prevention:**
    - **generic_response:** true
    - **constant_time_response:** true
  - **max_active_tokens_per_email:** 3
- **email:**
  - **case_sensitive:** false
  - **trim_whitespace:** true
  - **link_format:** {base_url}/auth/magic-link/verify?token={token}
  - **subject:** Your sign-in link
  - **from_name:** Application

## Outcomes

### Rate_limited_per_email (Priority: 1) — Error: `MAGIC_LINK_RATE_LIMITED`

**Given:**
- `email_request_count` (computed) gt `3`

**Result:** show "If an account exists with this email, we sent a sign-in link." (same message — enumeration prevention)

### Rate_limited_per_ip (Priority: 2) — Error: `MAGIC_LINK_RATE_LIMITED`

**Given:**
- `ip_request_count` (computed) gt `20`

**Result:** show "Too many requests. Please wait a moment."

### Send_magic_link (Priority: 5) — Error: `MAGIC_LINK_VALIDATION_ERROR` | Transaction: atomic

**Given:**
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `user` (db) exists
- `status` (db) neq `disabled`

**Then:**
- **delete_record** target: `oldest_active_token` when: `active_token_count >= 3` — Invalidate oldest active token if limit exceeded
- **create_record** target: `magic_link_token` — Generate token, store hash, set 15-minute expiry
- **notify** — Send email with magic link
- **emit_event** event: `magic_link.sent`

**Result:** show "If an account exists with this email, we sent a sign-in link." (same message always)

### Send_magic_link_no_account (Priority: 6) — Error: `MAGIC_LINK_ACCOUNT_DISABLED`

**Given:**
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `user` (db) not_exists

**Result:** show "If an account exists with this email, we sent a sign-in link." (SAME message — enumeration prevention)

### Token_expired (Priority: 7) — Error: `MAGIC_LINK_EXPIRED`

**Given:**
- `token_hash` (computed) eq `stored_token_hash`
- `expires_at` (db) lte `now`

**Then:**
- **emit_event** event: `magic_link.expired`

**Result:** show "This sign-in link has expired. Please request a new one."

### Token_already_used (Priority: 8) — Error: `MAGIC_LINK_ALREADY_USED`

**Given:**
- `token_hash` (computed) eq `stored_token_hash`
- `used_at` (db) exists

**Then:**
- **emit_event** event: `magic_link.reuse_attempt`

**Result:** show "This sign-in link has already been used. Please request a new one."

### Token_invalid (Priority: 9) — Error: `MAGIC_LINK_INVALID`

**Given:**
- `token_hash` (computed) neq `stored_token_hash`

**Result:** show "Invalid sign-in link. Please request a new one."

### Verify_magic_link (Priority: 10) | Transaction: atomic

**Given:**
- `token_hash` (computed) eq `stored_token_hash`
- `expires_at` (db) gt `now`
- `used_at` (db) not_exists
- `status` (db) neq `disabled`

**Then:**
- **set_field** target: `used_at` value: `now` — Mark token as used (single-use)
- **create_record** target: `session` — Create authenticated session
- **set_field** target: `email_verified` value: `true` when: `email_verified == false` — Implicitly verify email — user proved ownership
- **emit_event** event: `magic_link.verified`

**Result:** redirect to dashboard

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MAGIC_LINK_RATE_LIMITED` | 429 | Too many requests. Please wait a moment. | Yes |
| `MAGIC_LINK_EXPIRED` | 401 | This sign-in link has expired. Please request a new one. | Yes |
| `MAGIC_LINK_ALREADY_USED` | 401 | This sign-in link has already been used. Please request a new one. | Yes |
| `MAGIC_LINK_INVALID` | 401 | Invalid sign-in link. Please request a new one. | Yes |
| `MAGIC_LINK_ACCOUNT_DISABLED` | 403 | This account has been disabled. Please contact support. | No |
| `MAGIC_LINK_VALIDATION_ERROR` | 422 | Please enter a valid email address | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `magic_link.sent` | Magic link email sent to user | `user_id`, `email`, `timestamp`, `ip_address`, `expires_at` |
| `magic_link.verified` | Magic link token successfully verified and session created | `user_id`, `email`, `timestamp`, `ip_address`, `session_id` |
| `magic_link.expired` | User attempted to use an expired magic link | `email`, `timestamp` |
| `magic_link.reuse_attempt` | User attempted to reuse an already-consumed magic link | `email`, `timestamp`, `ip_address` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | recommended | Magic link is an alternative to password-based login |
| signup | required | User account must exist to receive a magic link |
| email-verification | optional | Magic link implicitly verifies email ownership |
| session-management | recommended | Sessions created via magic link need tracking and revocation |
| multi-factor-auth | optional | MFA can be required as additional factor after magic link |

## AGI Readiness

### Goals

#### Reliable Magic Link Auth

Passwordless email login via single-use magic links

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
| `signup` | signup | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited_per_email | `autonomous` | - | - |
| rate_limited_per_ip | `autonomous` | - | - |
| send_magic_link | `autonomous` | - | - |
| send_magic_link_no_account | `autonomous` | - | - |
| token_expired | `autonomous` | - | - |
| token_already_used | `autonomous` | - | - |
| token_invalid | `autonomous` | - | - |
| verify_magic_link | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 420px
show_logo: true
request_form:
  fields_order:
    - email
  show_explanation: true
success_state:
  show_email_sent_icon: true
  show_check_inbox_message: true
  show_resend_link: true
  resend_cooldown_seconds: 60
actions:
  primary:
    label: Send sign-in link
    type: submit
    full_width: true
  resend:
    label: Resend link
    type: button
    disabled_until_cooldown: true
links:
  - label: Sign in with password instead
    target: login
    position: below_form
accessibility:
  autofocus: email
  autocomplete:
    email: email
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  prevent_double_submit: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Magic Link Auth Blueprint",
  "description": "Passwordless email login via single-use magic links. 6 fields. 8 outcomes. 6 error codes. rules: security, email. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, passwordless, magic-link, email, security, identity"
}
</script>
