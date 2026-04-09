---
title: "Single Sign On Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning. 13 fields. 7 outcomes. 8 error codes. rules: security, jit_provisioning, session. AGI: supervised"
---

# Single Sign On Blueprint

> Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning

| | |
|---|---|
| **Feature** | `single-sign-on` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, sso, saml, oidc, enterprise, identity, federation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/single-sign-on.blueprint.yaml) |
| **JSON API** | [single-sign-on.json]({{ site.baseurl }}/api/blueprints/auth/single-sign-on.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `idp_entity_id` | text | Yes | IdP Entity ID | Validations: required, maxLength |
| `metadata_url` | url | No | IdP Metadata URL | Validations: url |
| `certificate` | text | Yes | X.509 Certificate | Validations: required |
| `attribute_mapping` | json | Yes | Attribute Mapping |  |
| `enabled` | boolean | Yes | SSO Enabled |  |
| `sso_protocol` | select | Yes | SSO Protocol | Validations: required, oneOf |
| `organization_id` | text | Yes | Organization ID | Validations: required |
| `default_role` | text | No | Default Role for JIT-Provisioned Users |  |
| `domain_whitelist` | text | No | Allowed Email Domains |  |
| `sign_requests` | boolean | No | Sign Authentication Requests |  |
| `sp_entity_id` | text | Yes | Service Provider Entity ID |  |
| `acs_url` | url | Yes | Assertion Consumer Service URL | Validations: required, url |
| `slo_url` | url | No | Single Logout URL |  |

## Rules

- **security:**
  - **assertion_validation:**
    - **verify_signature:** true
    - **verify_issuer:** true
    - **verify_audience:** true
    - **verify_destination:** true
    - **verify_conditions:** true
    - **clock_skew_seconds:** 120
    - **replay_prevention:** true
  - **certificate_management:**
    - **allow_multiple_certs:** true
    - **validate_expiry:** true
    - **expiry_warning_days:** 30
    - **min_key_size_bits:** 2048
  - **encryption:**
    - **encrypt_assertions:** false
    - **sign_requests:** true
    - **algorithm:** RSA_SHA256
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 20
    - **scope:** per_organization
- **jit_provisioning:**
  - **enabled:** true
  - **default_role:** member
  - **sync_attributes_on_login:** true
  - **deactivate_on_removal:** false
- **session:**
  - **bridge_idp_session:** true
  - **max_session_hours:** 8
  - **force_reauth_on_sensitive_action:** true
- **saml:**
  - **binding:** urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect
  - **name_id_format:** urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
  - **authn_context:** urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
- **oidc:**
  - **response_type:** code
  - **scopes:** openid, email, profile
  - **pkce_required:** true
  - **token_endpoint_auth:** client_secret_post

## Outcomes

### Rate_limited (Priority: 1) — Error: `SSO_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `20`

**Result:** show "Too many authentication attempts. Please wait a moment."

### Sso_not_configured (Priority: 2) — Error: `SSO_NOT_CONFIGURED`

**Given:**
- ANY: `sso_config` (db) not_exists OR `enabled` (db) eq `false`

**Result:** show "SSO is not configured for your organization. Please contact your administrator."

### Invalid_assertion (Priority: 3) — Error: `SSO_INVALID_ASSERTION`

**Given:**
- ANY: `assertion_signature` (computed) neq `valid` OR `assertion_audience` (computed) neq `sp_entity_id` OR `assertion_not_on_or_after` (computed) lt `now`

**Then:**
- **emit_event** event: `sso.failed`

**Result:** show "Authentication failed. Please try again or contact your administrator."

### Replay_attack_detected (Priority: 4) — Error: `SSO_REPLAY_DETECTED`

**Given:**
- `assertion_id` (computed) exists

**Then:**
- **emit_event** event: `sso.replay_detected`

**Result:** show "Authentication failed. Please try again."

### Domain_not_allowed (Priority: 5) — Error: `SSO_DOMAIN_NOT_ALLOWED`

**Given:**
- `domain_whitelist` (db) exists
- `user_email_domain` (computed) not_in `domain_whitelist`

**Then:**
- **emit_event** event: `sso.failed`

**Result:** show "Your email domain is not authorized for this organization."

### Jit_provision_new_user (Priority: 6) | Transaction: atomic

**Given:**
- `assertion_valid` (computed) eq `true`
- `local_user` (db) not_exists
- `jit_provisioning_enabled` (db) eq `true`

**Then:**
- **create_record** target: `user` — Create local user from IdP attributes via JIT provisioning
- **set_field** target: `role` value: `default_role` — Assign default organization role
- **create_record** target: `session` — Create authenticated session
- **emit_event** event: `sso.provisioned`
- **emit_event** event: `sso.authenticated`

**Result:** new user provisioned and authenticated — redirect to application

### Existing_user_login (Priority: 10) | Transaction: atomic

**Given:**
- `assertion_valid` (computed) eq `true`
- `local_user` (db) exists
- `status` (db) neq `disabled`

**Then:**
- **set_field** target: `user_attributes` value: `idp_attributes` when: `sync_attributes_on_login == true` — Sync user attributes from IdP (name, email, groups)
- **create_record** target: `session` — Create authenticated session bridged to IdP session
- **emit_event** event: `sso.authenticated`

**Result:** redirect to application

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SSO_RATE_LIMITED` | 429 | Too many authentication attempts. Please wait a moment. | Yes |
| `SSO_NOT_CONFIGURED` | 404 | SSO is not configured for your organization | No |
| `SSO_INVALID_ASSERTION` | 401 | Authentication failed. Please try again or contact your administrator. | Yes |
| `SSO_REPLAY_DETECTED` | 403 | Authentication failed. Please try again. | Yes |
| `SSO_DOMAIN_NOT_ALLOWED` | 403 | Your email domain is not authorized for this organization. | No |
| `SSO_CERTIFICATE_EXPIRED` | 500 | SSO configuration error. Please contact your administrator. | No |
| `SSO_PROVISIONING_DISABLED` | 403 | Automatic account provisioning is not enabled. Contact your administrator. | No |
| `SSO_ACCOUNT_DISABLED` | 403 | This account has been disabled. Please contact your administrator. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sso.authenticated` | User authenticated via SSO | `user_id`, `organization_id`, `protocol`, `timestamp` |
| `sso.provisioned` | New user provisioned via JIT from IdP | `user_id`, `organization_id`, `idp_entity_id`, `timestamp` |
| `sso.failed` | SSO authentication attempt failed | `organization_id`, `idp_entity_id`, `timestamp`, `reason` |
| `sso.replay_detected` | SAML assertion replay attack detected | `organization_id`, `assertion_id`, `timestamp`, `ip_address` |
| `sso.certificate_expiring` | IdP signing certificate nearing expiry | `organization_id`, `certificate_expiry`, `days_remaining` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | recommended | SSO is an alternative to password-based login for enterprise users |
| oauth-social-login | optional | Organizations may use OAuth for non-enterprise social login alongside SSO |
| session-management | recommended | SSO sessions need tracking, bridging, and revocation |
| multi-factor-auth | optional | MFA may be enforced at the IdP level or additionally at SP |
| logout | required | Single logout (SLO) must terminate both SP and IdP sessions |

## AGI Readiness

### Goals

#### Reliable Single Sign On

Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning

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
| `logout` | logout | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| sso_not_configured | `autonomous` | - | - |
| invalid_assertion | `autonomous` | - | - |
| replay_attack_detected | `autonomous` | - | - |
| domain_not_allowed | `autonomous` | - | - |
| jit_provision_new_user | `autonomous` | - | - |
| existing_user_login | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 480px
show_logo: true
login_discovery:
  email_domain_detection: true
  prompt: Enter your work email to continue
admin_configuration:
  show_metadata_upload: true
  show_manual_config: true
  show_test_connection: true
  show_certificate_status: true
actions:
  primary:
    label: Continue with SSO
    type: submit
    full_width: true
links:
  - label: Sign in with password instead
    target: login
    position: below_form
accessibility:
  autofocus: email
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  redirect_message: Redirecting to your identity provider...
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Single Sign On Blueprint",
  "description": "Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning. 13 fields. 7 outcomes. 8 error codes. rules: security, jit_provisioning, session. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, sso, saml, oidc, enterprise, identity, federation"
}
</script>
