---
title: "Oauth Social Login Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Social sign-in via OAuth2/OIDC with account linking and profile sync. 11 fields. 8 outcomes. 7 error codes. rules: security, account_linking, profile_sync. AGI:"
---

# Oauth Social Login Blueprint

> Social sign-in via OAuth2/OIDC with account linking and profile sync

| | |
|---|---|
| **Feature** | `oauth-social-login` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, oauth, oidc, social-login, identity, federation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/oauth-social-login.blueprint.yaml) |
| **JSON API** | [oauth-social-login.json]({{ site.baseurl }}/api/blueprints/auth/oauth-social-login.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `provider` | select | Yes | Identity Provider | Validations: required, oneOf |
| `provider_user_id` | text | Yes | Provider User ID |  |
| `access_token` | token | No | OAuth Access Token |  |
| `refresh_token` | token | No | OAuth Refresh Token |  |
| `id_token` | token | No | OIDC ID Token |  |
| `linked_at` | datetime | No | Account Linked At |  |
| `provider_email` | email | No | Provider Email |  |
| `provider_name` | text | No | Provider Display Name |  |
| `provider_avatar_url` | url | No | Provider Avatar URL |  |
| `state_parameter` | token | Yes | CSRF State Parameter |  |
| `code_verifier` | token | Yes | PKCE Code Verifier |  |

## Rules

- **security:**
  - **oauth_flow:** authorization_code
  - **pkce:**
    - **enabled:** true
    - **method:** S256
    - **code_verifier_length:** 128
  - **state_parameter:**
    - **required:** true
    - **entropy_bytes:** 32
    - **expiry_seconds:** 600
  - **token_storage:**
    - **encrypt_at_rest:** true
    - **encryption:** aes_256_gcm
  - **callback_url:**
    - **strict_validation:** true
    - **https_required:** true
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_ip
- **account_linking:**
  - **match_by_email:** true
  - **require_confirmation:** true
  - **allow_multiple_providers:** true
  - **allow_unlink:** true
- **profile_sync:**
  - **sync_on_login:** true
  - **fields:** email, name, avatar_url
  - **overwrite_existing:** false
- **providers:**
  - **google:**
    - **scopes:** openid, email, profile
    - **auth_url:** https://accounts.google.com/o/oauth2/v2/auth
    - **token_url:** https://oauth2.googleapis.com/token
  - **github:**
    - **scopes:** user:email, read:user
    - **auth_url:** https://github.com/login/oauth/authorize
    - **token_url:** https://github.com/login/oauth/access_token
  - **apple:**
    - **scopes:** name, email
    - **auth_url:** https://appleid.apple.com/auth/authorize
    - **token_url:** https://appleid.apple.com/auth/token
    - **response_mode:** form_post
  - **microsoft:**
    - **scopes:** openid, email, profile
    - **auth_url:** https://login.microsoftonline.com/common/oauth2/v2.0/authorize
    - **token_url:** https://login.microsoftonline.com/common/oauth2/v2.0/token

## Outcomes

### Rate_limited (Priority: 1) — Error: `OAUTH_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `10`

**Result:** show "Too many login attempts. Please wait a moment."

### Invalid_state (Priority: 2) — Error: `OAUTH_INVALID_STATE`

**Given:**
- ANY: `state_parameter` (request) not_exists OR `state_parameter` (request) neq `stored_state`

**Then:**
- **emit_event** event: `oauth.csrf_detected`

**Result:** show "Authentication failed. Please try again." (CSRF protection triggered)

### Invalid_provider (Priority: 3) — Error: `OAUTH_INVALID_PROVIDER`

**Given:**
- `provider` (input) not_in `google,github,apple,microsoft`

**Result:** show "Unsupported login provider"

### Token_exchange_failed (Priority: 4) — Error: `OAUTH_TOKEN_EXCHANGE_FAILED`

**Given:**
- `authorization_code` (request) exists
- `token_response` (computed) not_exists

**Then:**
- **emit_event** event: `oauth.token_failed`

**Result:** show "Authentication failed. Please try again."

### Account_link_existing (Priority: 5) | Transaction: atomic

**Given:**
- `provider_email` (computed) exists
- `local_account` (db) exists
- `provider_link` (db) not_exists
- `link_confirmed` (input) eq `true`

**Then:**
- **create_record** target: `oauth_link` — Create link between local account and social provider
- **set_field** target: `linked_at` value: `now`
- **emit_event** event: `oauth.linked`

**Result:** account linked — redirect to application

### New_user_registration (Priority: 6) | Transaction: atomic

**Given:**
- `local_account` (db) not_exists
- `provider_email` (computed) exists

**Then:**
- **create_record** target: `user` — Create new local user from provider profile
- **create_record** target: `oauth_link` — Link new account to social provider
- **create_record** target: `session` — Create authenticated session
- **emit_event** event: `oauth.authorized`

**Result:** new account created and linked — redirect to onboarding or dashboard

### Returning_user_login (Priority: 10) | Transaction: atomic

**Given:**
- `provider_link` (db) exists
- `local_account` (db) exists
- `status` (db) neq `disabled`

**Then:**
- **create_record** target: `session` — Create authenticated session
- **set_field** target: `provider_email` value: `provider_profile.email` when: `profile_sync_enabled == true` — Sync email from provider if changed
- **set_field** target: `provider_name` value: `provider_profile.name` when: `profile_sync_enabled == true`
- **emit_event** event: `oauth.authorized`

**Result:** redirect to dashboard

### Unlink_provider (Priority: 11) | Transaction: atomic

**Given:**
- `provider_link` (db) exists
- `alternative_auth_method` (db) exists

**Then:**
- **delete_record** target: `oauth_link` — Remove link between local account and social provider
- **emit_event** event: `oauth.unlinked`

**Result:** provider unlinked — user retains other authentication methods

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OAUTH_RATE_LIMITED` | 429 | Too many login attempts. Please wait a moment. | Yes |
| `OAUTH_INVALID_STATE` | 403 | Authentication failed. Please try again. | Yes |
| `OAUTH_INVALID_PROVIDER` | 400 | Unsupported login provider | No |
| `OAUTH_TOKEN_EXCHANGE_FAILED` | 503 | Authentication failed. Please try again. | Yes |
| `OAUTH_ACCOUNT_DISABLED` | 403 | This account has been disabled. Please contact support. | No |
| `OAUTH_EMAIL_NOT_PROVIDED` | 400 | Email permission is required. Please grant email access and try again. | Yes |
| `OAUTH_UNLINK_LAST_METHOD` | 400 | Cannot remove your only login method. Add a password or another provider first. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `oauth.authorized` | User authenticated via social provider | `user_id`, `provider`, `provider_user_id`, `timestamp`, `is_new_user` |
| `oauth.linked` | Social provider linked to existing account | `user_id`, `provider`, `provider_user_id`, `timestamp` |
| `oauth.unlinked` | Social provider unlinked from account | `user_id`, `provider`, `timestamp` |
| `oauth.csrf_detected` | CSRF attack detected via invalid state parameter | `ip_address`, `provider`, `timestamp` |
| `oauth.token_failed` | Token exchange with provider failed | `provider`, `timestamp`, `error_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | recommended | Social login is an alternative to password-based login |
| signup | recommended | Social login can create new accounts automatically |
| session-management | recommended | Sessions created via OAuth need tracking and revocation |
| multi-factor-auth | optional | MFA can be required even after social authentication |

## AGI Readiness

### Goals

#### Reliable Oauth Social Login

Social sign-in via OAuth2/OIDC with account linking and profile sync

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| invalid_state | `autonomous` | - | - |
| invalid_provider | `autonomous` | - | - |
| token_exchange_failed | `supervised` | - | - |
| account_link_existing | `autonomous` | - | - |
| new_user_registration | `autonomous` | - | - |
| returning_user_login | `autonomous` | - | - |
| unlink_provider | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 420px
show_logo: true
provider_buttons:
  style: branded
  layout: stacked
  order:
    - google
    - github
    - apple
    - microsoft
  full_width: true
account_linking:
  show_confirmation_dialog: true
  show_linked_providers: true
actions:
  primary:
    label: Continue with {provider}
    type: button
    full_width: true
divider:
  show: true
  text: or
  position: between_social_and_email
accessibility:
  aria_live_region: true
  provider_button_labels: true
loading:
  show_spinner: true
  disable_button: true
  redirect_message: Redirecting to {provider}...
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Oauth Social Login Blueprint",
  "description": "Social sign-in via OAuth2/OIDC with account linking and profile sync. 11 fields. 8 outcomes. 7 error codes. rules: security, account_linking, profile_sync. AGI:",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, oauth, oidc, social-login, identity, federation"
}
</script>
