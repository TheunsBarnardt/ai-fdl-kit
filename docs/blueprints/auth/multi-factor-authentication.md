---
title: "Multi Factor Authentication Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify posse"
---

# Multi Factor Authentication Blueprint

> TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify possession of the registered...

| | |
|---|---|
| **Feature** | `multi-factor-authentication` |
| **Category** | Auth |
| **Version** | 2.0.0 |
| **Tags** | mfa, totp, two-factor, otp, authenticator, security |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/multi-factor-authentication.blueprint.yaml) |
| **JSON API** | [multi-factor-authentication.json]({{ site.baseurl }}/api/blueprints/auth/multi-factor-authentication.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Enrolls and uses their authenticator app during login |
| `system_admin` | System Administrator | human | Enforces MFA globally or resets MFA for locked-out users |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `secret` | token | Yes | Base32-encoded shared TOTP secret (160-bit, cryptographically random) |  |
| `qr_code` | file | No | PNG QR code encoding the otpauth:// URI for authenticator app enrollment |  |
| `totp_code` | text | Yes | 6-digit time-based one-time password submitted by the user | Validations: pattern |
| `mfa_active` | boolean | Yes | Whether MFA is currently enabled for the user |  |
| `used_timestamps` | json | No | Array of recently used TOTP time windows to prevent code reuse |  |

## States

**State field:** `mfa_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `disabled` | Yes |  |
| `enrollment_pending` |  |  |
| `active` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `disabled` | `enrollment_pending` | user |  |
|  | `enrollment_pending` | `active` | user |  |
|  | `active` | `disabled` | user |  |
|  | `active` | `disabled` | system_admin |  |

## Rules

- **rule_01:** The TOTP algorithm follows RFC 6238 with a 30-second time step and a validation window of ±1 code (approximately 90 seconds tolerance) to accommodate clock skew.
- **rule_02:** Each validated code is recorded to prevent replay attacks within the same time window.
- **rule_03:** Only users authenticated via local email or directory (LDAP) credentials may activate MFA; SSO (SAML, OAuth) users cannot, as MFA is delegated to their identity provider.
- **rule_04:** When MFA enforcement is enabled globally, users who have not enrolled are blocked from all operations except MFA enrollment endpoints.
- **rule_05:** Bots and service accounts are exempt from MFA enforcement.
- **rule_06:** A 160-bit secret is generated using a cryptographically secure random source and never transmitted after initial enrollment.
- **rule_07:** Deactivating MFA clears both the secret and the used-timestamp list atomically.

## Outcomes

### Mfa_not_available_for_sso_user (Priority: 3) — Error: `MFA_NOT_SUPPORTED_FOR_SSO`

**Given:**
- user authenticated via SAML or OAuth attempts to activate MFA

**Result:** Activation blocked; MFA must be configured at the identity provider

### Mfa_code_replayed (Priority: 4) — Error: `MFA_CODE_ALREADY_USED`

**Given:**
- TOTP code is mathematically valid
- code's time window is already present in used_timestamps

**Result:** Login rejected to prevent replay attack

### Mfa_code_invalid (Priority: 5) — Error: `INVALID_OTP`

**Given:**
- user has active MFA
- submitted TOTP code is incorrect or outside the valid time window

**Then:**
- **set_field** target: `user.failed_attempts` — Failed attempt counter incremented

**Result:** Login rejected; user prompted to retry with a fresh code

### Mfa_enrollment_initiated (Priority: 10)

**Given:**
- MFA is enabled in system configuration
- user is authenticated via email or directory credentials
- user does not already have active MFA

**Then:**
- **create_record** target: `mfa_secret` — Cryptographically random 20-byte secret stored; QR code URI generated
- **emit_event** event: `auth.mfa_enrollment_started`

**Result:** QR code and manual entry key returned to the user for authenticator app enrollment

### Mfa_activation_success (Priority: 10)

**Given:**
- user is in enrollment_pending state
- submitted TOTP code is valid and has not been used in the current window

**Then:**
- **set_field** target: `user.mfa_active` value: `true`
- **set_field** target: `used_timestamps` — Current time window recorded to prevent immediate replay
- **emit_event** event: `auth.mfa_activated`

**Result:** MFA active; future logins require a valid TOTP code

### Mfa_verified (Priority: 10)

**Given:**
- user has active MFA
- primary credential validated
- submitted TOTP code is valid for current or adjacent time window
- code has not been used before in this window

**Then:**
- **set_field** target: `used_timestamps` — Code's time window added to anti-replay list
- **create_record** target: `session` — Session created after both factors verified
- **emit_event** event: `mfa.verified`

**Result:** User fully authenticated; session established

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_OTP` | 401 | The verification code you entered is incorrect. Please try again. | No |
| `MFA_CODE_ALREADY_USED` | 409 | This code has already been used. Please wait for a new code. | No |
| `MFA_NOT_ENABLED` | 403 | Multi-factor authentication is not enabled on this server. | No |
| `MFA_NOT_SUPPORTED_FOR_SSO` | 403 | Multi-factor authentication is managed by your identity provider. | No |
| `MFA_ALREADY_ACTIVE` | 409 | Multi-factor authentication is already enabled for this account. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mfa.verified` | MFA verification successful | `user_id`, `session_id` |
| `auth.mfa_enrollment_started` | User initiated MFA enrollment; secret generated | `user_id`, `timestamp` |
| `auth.mfa_activated` | MFA successfully enrolled after first code verification | `user_id`, `timestamp` |
| `auth.mfa_failed` | Invalid or replayed TOTP code submitted | `user_id`, `reason`, `attempt_count`, `timestamp` |
| `auth.mfa_deactivated` | MFA removed from user account | `user_id`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| session-management | required | Sessions are only created after both primary credential and MFA are verified |
| ldap-authentication-sync | recommended | LDAP users are the primary population for MFA enforcement alongside email users |
| saml-sso | optional | SAML users are excluded from MFA; the feature relationship documents this boundary |

## AGI Readiness

### Goals

#### Reliable Multi Factor Authentication

MFA with OTP, WebAuthn, and recovery codes

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| mfa_verified | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/keycloak/keycloak
  project: Keycloak
  tech_stack: Java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Factor Authentication Blueprint",
  "description": "TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify posse",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "mfa, totp, two-factor, otp, authenticator, security"
}
</script>
