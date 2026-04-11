---
title: "Email Verification Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Verify user email ownership via a one-time token link. 2 fields. 7 outcomes. 4 error codes. rules: security, email. AGI: supervised"
---

# Email Verification Blueprint

> Verify user email ownership via a one-time token link

| | |
|---|---|
| **Feature** | `email-verification` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | email, verification, security, identity, onboarding |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/email-verification.blueprint.yaml) |
| **JSON API** | [email-verification.json]({{ site.baseurl }}/api/blueprints/auth/email-verification.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `token` | token | Yes | Token | Validations: required |
| `email` | email | Yes | Email Address | Validations: required, email |

## Rules

- **security:**
  - **token:**
    - **type:** cryptographic_random
    - **length_bytes:** 32
    - **hash_before_storage:** true
    - **algorithm:** sha256
  - **token_expiry:**
    - **hours:** 24
  - **single_use:** true
  - **rate_limit_resend:**
    - **window_seconds:** 3600
    - **max_requests:** 3
    - **scope:** per_email
  - **rate_limit_verify:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_ip
- **email:**
  - **case_sensitive:** false
  - **trim_whitespace:** true
  - **enumeration_prevention:** true

## Outcomes

### Token_invalid (Priority: 1) — Error: `VERIFY_TOKEN_INVALID`

**Given:**
- ANY: `token_hash` (db) not_exists OR `token_used` (db) eq `true`

**Then:**
- **emit_event** event: `email_verification.token_invalid`

**Result:** show "This verification link is invalid." with option to request a new one

### Resend_rate_limited (Priority: 1) — Error: `VERIFY_RATE_LIMITED`

**Given:**
- `resend_count` (computed) gt `3`

**Result:** show "If an account with that email exists, we've sent a new verification link." (same as success)

### Token_expired (Priority: 2) — Error: `VERIFY_TOKEN_EXPIRED`

**Given:**
- `token_hash` (db) exists
- `token_created_at` (db) lt `now - 24 hours`

**Then:**
- **emit_event** event: `email_verification.token_expired`

**Result:** show "This verification link has expired." with option to request a new one

### Resend_unknown_email (Priority: 2)

**Given:**
- ANY: `user` (db) not_exists OR `email_verified` (db) eq `true`

**Result:** show SAME message as resend_success (enumeration prevention)

### Already_verified (Priority: 3)

**Given:**
- `email_verified` (db) eq `true`

**Result:** redirect to /login with message "Email already verified. Please sign in."

### Email_verified (Priority: 10) | Transaction: atomic

**Given:**
- `token` (input) exists
- `token_hash` (db) exists
- `token_created_at` (db) gte `now - 24 hours`
- `token_used` (db) eq `false`
- `status` (db) neq `disabled`

**Then:**
- **set_field** target: `email_verified` value: `true` — Mark email as verified
- **set_field** target: `token_used` value: `true` — Mark token as used (single-use)
- **emit_event** event: `email_verification.success`

**Result:** redirect to /login with message "Email verified! You can now sign in."

### Resend_success (Priority: 10) | Transaction: atomic

**Given:**
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `user` (db) exists
- `email_verified` (db) eq `false`

**Then:**
- **invalidate** target: `verification_tokens` — Invalidate previous verification tokens
- **create_record** target: `verification_token` — Generate crypto.randomBytes(32), store SHA-256 hash, expires in 24h
- **notify** to: `user` — Send new verification link
- **emit_event** event: `email_verification.resent`

**Result:** show "If an account with that email exists, we've sent a new verification link."

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VERIFY_TOKEN_INVALID` | 400 | This verification link is invalid. Please request a new one. | No |
| `VERIFY_TOKEN_EXPIRED` | 400 | This verification link has expired. Please request a new one. | No |
| `VERIFY_RATE_LIMITED` | 429 | Too many requests. Please wait before trying again. | No |
| `VERIFY_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `email_verification.success` | User successfully verified their email | `user_id`, `email`, `timestamp`, `ip_address` |
| `email_verification.token_invalid` | Invalid or tampered verification token submitted | `token_hash`, `timestamp`, `ip_address` |
| `email_verification.token_expired` | Expired verification token submitted | `user_id`, `timestamp`, `ip_address` |
| `email_verification.resent` | New verification email sent | `user_id`, `email`, `timestamp`, `expires_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| signup | required | Verification is triggered by signup |
| login | required | After verification, user logs in |

## AGI Readiness

### Goals

#### Reliable Email Verification

Verify user email ownership via a one-time token link

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
| `login` | login | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| token_invalid | `autonomous` | - | - |
| token_expired | `autonomous` | - | - |
| already_verified | `autonomous` | - | - |
| email_verified | `autonomous` | - | - |
| resend_rate_limited | `autonomous` | - | - |
| resend_unknown_email | `autonomous` | - | - |
| resend_success | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
screens:
  verify:
    layout: single_column_centered
    max_width: 420px
    show_logo: true
    title: Verifying your email...
  resend:
    layout: single_column_centered
    max_width: 420px
    show_logo: true
    title: Resend verification email
    subtitle: Enter your email and we'll send a new verification link
    fields_order:
      - email
    actions:
      primary:
        label: Resend verification email
        type: submit
        full_width: true
    links:
      - label: Back to sign in
        target: login
        position: below_form
accessibility:
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  prevent_double_submit: true
```

</details>

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
nextjs:
  routes:
    verify: /verify-email
    resend: /resend-verification
  layout: (auth)
  server_action: true
express:
  routes:
    verify: /api/auth/verify-email
    resend: /api/auth/resend-verification
  middleware:
    - rate-limit
    - cors
laravel:
  routes:
    verify: /verify-email/{token}
    resend: /resend-verification
  middleware:
    - guest
  notification: VerifyEmail
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Email Verification Blueprint",
  "description": "Verify user email ownership via a one-time token link. 2 fields. 7 outcomes. 4 error codes. rules: security, email. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "email, verification, security, identity, onboarding"
}
</script>
