---
title: "Saml Sso Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords. . 10 fields. 5 outc"
---

# Saml Sso Blueprint

> SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.


| | |
|---|---|
| **Feature** | `saml-sso` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | saml, sso, federation, identity-provider, enterprise-auth |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/saml-sso.blueprint.yaml) |
| **JSON API** | [saml-sso.json]({{ site.baseurl }}/api/blueprints/auth/saml-sso.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Initiates login and is redirected to the identity provider |
| `identity_provider` | Identity Provider | external | External SAML IdP that authenticates users and issues assertions |
| `system_admin` | System Administrator | human | Configures SAML settings and certificate management |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `idp_metadata_url` | url | Yes | URL of the identity provider's SAML metadata XML endpoint |  |
| `idp_certificate` | file | Yes | Public certificate of the identity provider for signature verification |  |
| `service_provider_certificate` | file | No | Service provider public certificate sent to IdP for encryption |  |
| `service_provider_private_key` | file | No | Service provider private key used to decrypt SAML assertions |  |
| `attribute_email` | text | Yes | SAML assertion attribute name that maps to user email |  |
| `attribute_username` | text | Yes | SAML assertion attribute name that maps to username |  |
| `attribute_first_name` | text | No | SAML assertion attribute name that maps to first name |  |
| `attribute_last_name` | text | No | SAML assertion attribute name that maps to last name |  |
| `enable_sync_with_ldap` | boolean | No | When true, SAML user profiles are also synced against an LDAP directory |  |
| `relay_state` | token | No | Opaque token generated per authentication request to prevent CSRF in the SAML fl |  |

## States

**State field:** `auth_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `redirect_pending` | Yes |  |
| `assertion_received` |  |  |
| `authenticated` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `redirect_pending` | `assertion_received` | identity_provider |  |
|  | `assertion_received` | `authenticated` | system |  |
|  | `assertion_received` | `failed` | system |  |

## Rules

- **rule_01:** Users authenticated via SAML do not have or use a local password; password authentication is bypassed.
- **rule_02:** User profile attributes (email, username, first name, last name) are populated from SAML assertion attributes on each login.
- **rule_03:** A relay_state token is generated per authentication request and validated on callback to prevent CSRF attacks.
- **rule_04:** SAML users cannot activate TOTP multi-factor authentication; MFA is delegated to the identity provider.
- **rule_05:** Sessions created from SAML logins are marked as SSO sessions and may have a distinct session length configured separately from password-based sessions.
- **rule_06:** When LDAP sync is enabled alongside SAML, user attributes are additionally reconciled against the LDAP directory after assertion validation.
- **rule_07:** IdP metadata (certificates, endpoints) can be fetched automatically from a metadata URL or uploaded manually.
- **rule_08:** Certificate rotation requires updating both the IdP certificate in configuration and the service provider certificate exchange with the IdP.

## Outcomes

### Sso_login_relay_state_invalid (Priority: 2) — Error: `SAML_INVALID_RELAY_STATE`

**Given:**
- callback received from identity provider
- relay_state does not match any pending authentication request

**Result:** Login rejected to prevent CSRF replay attack

### Sso_login_invalid_signature (Priority: 3) — Error: `SAML_INVALID_SIGNATURE`

**Given:**
- assertion received from identity provider
- signature verification against IdP certificate fails

**Then:**
- **emit_event** event: `auth.saml_login_failed`

**Result:** Login rejected; user sees authentication error

### Sso_login_missing_attributes (Priority: 3) — Error: `SAML_MISSING_ATTRIBUTES`

**Given:**
- assertion signature is valid
- required attribute mappings (email or username) are absent in the assertion

**Then:**
- **emit_event** event: `auth.saml_login_failed`

**Result:** Login rejected; administrator must fix attribute mapping configuration

### Mfa_not_available_for_saml (Priority: 5) — Error: `MFA_NOT_SUPPORTED_FOR_SSO`

**Given:**
- user authenticated via SAML attempts to enable TOTP MFA

**Result:** MFA activation blocked; user must configure MFA at the identity provider level

### Sso_login_success (Priority: 10)

**Given:**
- SAML is enabled in system configuration
- user initiated login and was redirected to the identity provider
- identity provider posted a valid signed assertion with required attributes
- relay_state token matches the pending authentication request

**Then:**
- **create_record** target: `session` — SSO session created with SAML identity marker and configured SSO session length
- **emit_event** event: `auth.saml_login_success`

**Result:** User is authenticated and redirected to the application

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SAML_INVALID_SIGNATURE` | 401 | Authentication failed. Please contact your administrator. | No |
| `SAML_MISSING_ATTRIBUTES` | 401 | Authentication failed due to a configuration error. Please contact your administrator. | No |
| `SAML_INVALID_RELAY_STATE` | 401 | Authentication request is invalid or has expired. Please try again. | No |
| `SAML_NOT_ENABLED` | 401 | Single sign-on is not configured on this server. | No |
| `MFA_NOT_SUPPORTED_FOR_SSO` | 403 | Multi-factor authentication is managed by your identity provider. | No |
| `SAML_CERTIFICATE_ERROR` | 401 | Identity provider certificate is missing or invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `auth.saml_login_success` | User successfully authenticated via SAML SSO | `user_id`, `email`, `session_id`, `timestamp` |
| `auth.saml_login_failed` | SAML authentication attempt failed | `reason`, `ip_address`, `timestamp` |
| `auth.saml_user_provisioned` | New user account created from SAML assertion on first login | `user_id`, `email`, `actor`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| session-management | required | SSO login produces a session with SSO-specific lifecycle settings |
| ldap-authentication-sync | optional | SAML can coexist with LDAP sync for attribute enrichment |
| multi-factor-authentication | optional | MFA is not applicable for SAML users; delegated to the IdP |

## AGI Readiness

### Goals

#### Reliable Saml Sso

SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.


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
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `session_management` | session-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| sso_login_success | `autonomous` | - | - |
| sso_login_invalid_signature | `autonomous` | - | - |
| sso_login_missing_attributes | `autonomous` | - | - |
| sso_login_relay_state_invalid | `autonomous` | - | - |
| mfa_not_available_for_saml | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/channels/app/authentication.go
    - server/einterfaces/saml.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Saml Sso Blueprint",
  "description": "SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.\n. 10 fields. 5 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "saml, sso, federation, identity-provider, enterprise-auth"
}
</script>
