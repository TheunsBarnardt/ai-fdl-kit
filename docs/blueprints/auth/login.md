---
title: "Login Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Authenticate a user with email and password. 3 fields. 6 outcomes. 6 error codes. rules: security, session, email"
---

# Login Blueprint

> Authenticate a user with email and password

| | |
|---|---|
| **Feature** | `login` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, session, security, identity, saas |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/login.blueprint.yaml) |
| **JSON API** | [login.json]({{ site.baseurl }}/api/blueprints/auth/login.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes | Email Address | Validations: required, email, maxLength |
| `password` | password | Yes | Password | Validations: required, minLength, maxLength |
| `remember_me` | boolean | No | Remember me |  |

## Rules

- **security:**
  - **max_attempts:** 5
  - **lockout_duration_minutes:** 15
  - **lockout_scope:** per_email
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_ip
  - **password_comparison:**
    - **constant_time:** true
  - **credential_error_handling:**
    - **generic_message:** true
- **session:**
  - **type:** jwt
  - **access_token:**
    - **expiry_minutes:** 15
  - **refresh_token:**
    - **expiry_days:** 7
    - **rotate_on_use:** true
  - **remember_me_expiry_days:** 30
  - **extend_on_activity:** true
  - **secure_flags:**
    - **http_only:** true
    - **secure:** true
    - **same_site:** strict
- **email:**
  - **require_verified:** true
  - **case_sensitive:** false
  - **trim_whitespace:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `LOGIN_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `10`

**Result:** show "Too many login attempts. Please wait a moment."

### Account_locked (Priority: 2) — Error: `LOGIN_ACCOUNT_LOCKED`

**Given:**
- `failed_login_attempts` (db) gte `5`
- `locked_until` (db) gt `now`

**Then:**
- **emit_event** event: `login.locked`

**Result:** show "Account temporarily locked. Please try again later."

### Account_disabled (Priority: 3) — Error: `LOGIN_ACCOUNT_DISABLED`

**Given:**
- `status` (db) eq `disabled`

**Result:** show "This account has been disabled. Please contact support."

### Invalid_credentials (Priority: 4) — Error: `LOGIN_INVALID_CREDENTIALS` | Transaction: atomic

**Given:**
- ANY: `user` (db) not_exists OR `password` (input) neq `stored_hash`

**Then:**
- **set_field** target: `failed_login_attempts` value: `increment` — Increment failed attempt counter
- **emit_event** event: `login.failed`
- **set_field** target: `locked_until` value: `now + 15m` when: `failed_login_attempts >= 5` — Lock account if attempts reach 5
- **emit_event** event: `login.locked` when: `failed_login_attempts >= 5`

**Result:** show "Invalid email or password" (SAME message for both cases — enumeration prevention)

### Email_not_verified (Priority: 5) — Error: `LOGIN_EMAIL_NOT_VERIFIED`

**Given:**
- `email_verified` (db) eq `false`

**Then:**
- **emit_event** event: `login.unverified`

**Result:** redirect to /verify-email with message "Please verify your email before logging in"

### Successful_login (Priority: 10) | Transaction: atomic

**Given:**
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `user` (db) exists
- `password` (input) eq `stored_hash`
- `status` (db) neq `disabled`
- `email_verified` (db) eq `true`

**Then:**
- **set_field** target: `failed_login_attempts` value: `0` — Reset attempt counter on success
- **create_record** target: `session` — Create JWT access token (15-min) + refresh token (7-day, or 30-day if remember_me)
- **emit_event** event: `login.success`

**Result:** redirect to /dashboard

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LOGIN_INVALID_CREDENTIALS` | 401 | Invalid email or password | Yes |
| `LOGIN_ACCOUNT_LOCKED` | 423 | Account temporarily locked. Please try again later. | No |
| `LOGIN_EMAIL_NOT_VERIFIED` | 403 | Please verify your email address to continue | No |
| `LOGIN_ACCOUNT_DISABLED` | 403 | This account has been disabled. Please contact support. | No |
| `LOGIN_RATE_LIMITED` | 429 | Too many login attempts. Please wait a moment. | Yes |
| `LOGIN_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `login.success` | User successfully authenticated | `user_id`, `email`, `timestamp`, `ip_address`, `user_agent`, `session_id` |
| `login.failed` | Authentication attempt failed | `email`, `timestamp`, `ip_address`, `user_agent`, `attempt_count`, `reason` |
| `login.locked` | Account locked due to too many failures | `email`, `user_id`, `timestamp`, `lockout_until`, `attempt_count` |
| `login.unverified` | Login blocked — email not verified | `user_id`, `email`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| signup | required | User must exist before they can log in |
| password-reset | recommended | Users will forget passwords |
| email-verification | recommended | Required when rules.email.require_verified is true |
| logout | required | Every login needs a logout |
| biometric-auth | optional | Palm vein scan as an alternative to password login |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 420px
show_logo: true
fields_order:
  - email
  - password
  - remember_me
actions:
  primary:
    label: Sign in
    type: submit
    full_width: true
links:
  - label: Forgot password?
    target: password-reset
    position: below_password_field
  - label: Don't have an account? Sign up
    target: signup
    position: below_form
accessibility:
  autofocus: email
  autocomplete:
    email: username
    password: current-password
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
  route: /login
  layout: (auth)
  server_action: true
  middleware_redirect: /dashboard
express:
  route: /api/auth/login
  middleware:
    - rate-limit
    - cors
laravel:
  guard: web
  middleware:
    - guest
  throttle: 5,1
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Login Blueprint",
  "description": "Authenticate a user with email and password. 3 fields. 6 outcomes. 6 error codes. rules: security, session, email",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, session, security, identity, saas"
}
</script>
