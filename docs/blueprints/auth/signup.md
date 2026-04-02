---
title: "Signup Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Register a new user account with email and password. 6 fields. 5 outcomes. 6 error codes. rules: security, account, email"
---

# Signup Blueprint

> Register a new user account with email and password

| | |
|---|---|
| **Feature** | `signup` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | registration, onboarding, account-creation, identity, saas |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/auth/signup.blueprint.yaml) |
| **JSON API** | [signup.json]({{ site.baseurl }}/api/blueprints/auth/signup.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `first_name` | text | Yes | First Name | Validations: required, minLength, maxLength, pattern |
| `last_name` | text | Yes | Last Name | Validations: required, minLength, maxLength, pattern |
| `email` | email | Yes | Email Address | Validations: required, email, maxLength, unique |
| `password` | password | Yes | Password | Validations: required, minLength, maxLength, pattern |
| `confirm_password` | password | Yes | Confirm Password | Validations: required, match |
| `terms_accepted` | boolean | Yes | I agree to the Terms of Service and Privacy Policy | Validations: required |

## Rules

- **security:**
  - **password_hashing:**
    - **algorithm:** bcrypt
    - **salt_rounds:** 12
  - **rate_limit:**
    - **window_seconds:** 3600
    - **max_requests:** 5
    - **scope:** per_ip
  - **email_enumeration_prevention:**
    - **enabled:** true
  - **bot_protection:**
    - **type:** none
- **account:**
  - **default_role:** user
  - **email_verified_on_signup:** false
  - **auto_login_after_signup:** false
- **email:**
  - **case_sensitive:** false
  - **trim_whitespace:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `SIGNUP_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `5`

**Result:** show "Too many attempts. Please try again later."

### Validation_failed (Priority: 2) — Error: `SIGNUP_VALIDATION_ERROR`

**Given:**
- any field fails its validation rules

**Result:** show per-field error messages inline

### Bot_detected (Priority: 3) — Error: `SIGNUP_RATE_LIMITED`

**Given:**
- ANY: `honeypot` (input) exists OR `captcha` (input) eq `false`

**Then:**
- **emit_event** event: `signup.bot_detected`

**Result:** show generic rate limit error (don't reveal bot detection triggered)

### Email_already_registered (Priority: 4) — Error: `SIGNUP_EMAIL_TAKEN`

**Given:**
- `email` (db) exists

**Then:**
- **emit_event** event: `signup.duplicate_email`
- **notify** to: `existing_user` — Alert the existing account holder

**Result:** show SAME success response as new signup (enumeration prevention)

### Successful_signup (Priority: 10) | Transaction: atomic

**Given:**
- `first_name` (input) matches `^[\p{L}\s'-]+$`
- `last_name` (input) matches `^[\p{L}\s'-]+$`
- `email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `email` (db) not_exists
- `password` (input) matches `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$`
- `confirm_password` (input) eq `password`
- `terms_accepted` (input) eq `true`

**Then:**
- **create_record** target: `user` — Create user with hashed password (bcrypt, 12 rounds), role 'user', email_verified false
- **notify** to: `user` — Send email verification link
- **emit_event** event: `signup.success`

**Result:** redirect to confirmation page with "Account created! Please check your email to verify."

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SIGNUP_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |
| `SIGNUP_EMAIL_TAKEN` | 409 | Unable to create account. Please try a different email or sign in. | Yes |
| `SIGNUP_RATE_LIMITED` | 429 | Too many attempts. Please try again later. | No |
| `SIGNUP_TERMS_NOT_ACCEPTED` | 422 | You must accept the terms to create an account | Yes |
| `SIGNUP_PASSWORD_WEAK` | 422 | Password does not meet security requirements | Yes |
| `SIGNUP_PASSWORD_MISMATCH` | 422 | Passwords do not match | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `signup.success` | New account created successfully | `user_id`, `email`, `timestamp`, `ip_address`, `user_agent` |
| `signup.duplicate_email` | Signup attempted with an existing email | `email`, `timestamp`, `ip_address` |
| `signup.bot_detected` | Bot protection triggered during signup | `ip_address`, `timestamp`, `detection_method` |
| `signup.verification_sent` | Verification email dispatched | `user_id`, `email`, `timestamp`, `expires_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | After signup, user needs to log in |
| email-verification | required | New accounts must verify their email |
| password-reset | recommended | Users who just signed up may still need password reset |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 480px
show_logo: true
fields_order:
  - first_name
  - last_name
  - email
  - password
  - confirm_password
  - terms_accepted
field_grouping:
  - group: name
    fields:
      - first_name
      - last_name
    layout: side_by_side
actions:
  primary:
    label: Create account
    type: submit
    full_width: true
links:
  - label: Already have an account? Sign in
    target: login
    position: below_form
  - label: Terms of Service
    target: terms
    position: inline_with_checkbox
    external: true
  - label: Privacy Policy
    target: privacy
    position: inline_with_checkbox
    external: true
accessibility:
  autofocus: first_name
  autocomplete:
    first_name: given-name
    last_name: family-name
    email: email
    password: new-password
    confirm_password: new-password
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
  route: /signup
  layout: (auth)
  server_action: true
  middleware_redirect: /dashboard
express:
  route: /api/auth/signup
  middleware:
    - rate-limit
    - cors
laravel:
  guard: web
  middleware:
    - guest
  notification: VerifyEmail
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Signup Blueprint",
  "description": "Register a new user account with email and password. 6 fields. 5 outcomes. 6 error codes. rules: security, account, email",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "registration, onboarding, account-creation, identity, saas"
}
</script>
