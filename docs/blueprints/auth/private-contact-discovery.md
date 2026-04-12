---
title: "Private Contact Discovery Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Issue short-lived HMAC-derived credentials that authenticate clients with an external privacy-preserving contact discovery service without exposing plaintext co"
---

# Private Contact Discovery Blueprint

> Issue short-lived HMAC-derived credentials that authenticate clients with an external privacy-preserving contact discovery service without exposing plaintext contact lists to the server

| | |
|---|---|
| **Feature** | `private-contact-discovery` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | privacy, contacts, discovery, phone-number, credentials, psi |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/private-contact-discovery.blueprint.yaml) |
| **JSON API** | [private-contact-discovery.json]({{ site.baseurl }}/api/blueprints/auth/private-contact-discovery.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_identifier` | token | Yes | Account Identifier |  |
| `discovery_username` | token | No | Discovery Username |  |
| `discovery_password` | token | No | Discovery Password |  |
| `token_expiry_seconds` | number | No | Token TTL (seconds) |  |

## Rules

- **authentication:**
  - **require_active_session:** true
- **credential_derivation:**
  - **algorithm:** HMAC
  - **user_derivation_key:** true
  - **prepend_username:** false
  - **expiry_controlled_by:** server
  - **default_ttl_seconds:** 86400
- **privacy:**
  - **plaintext_numbers_never_reach_server:** true
  - **contact_list_not_stored:** true
- **rate_limiting:**
  - **scope:** per_account

## Outcomes

### Unauthenticated (Priority: 1) — Error: `CONTACT_DISCOVERY_UNAUTHENTICATED`

**Given:**
- `account_identifier` (session) not_exists

**Result:** Request rejected with 401 Unauthorized

### Rate_limited (Priority: 2) — Error: `CONTACT_DISCOVERY_RATE_LIMITED`

**Given:**
- per-account credential issuance rate limit is exhausted

**Then:**
- **emit_event** event: `contact_discovery.rate_limited`

**Result:** Request rejected with 429 Too Many Requests and Retry-After header

### Credentials_issued (Priority: 10)

**Given:**
- `account_identifier` (session) exists

**Then:**
- **create_record** target: `credentials` — Generate a time-limited HMAC credential pair bound to the account identifier
- **emit_event** event: `contact_discovery.credentials_issued`

**Result:** Returns a JSON object with username and password credentials valid for the external contact discovery service

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONTACT_DISCOVERY_UNAUTHENTICATED` | 401 | Authentication required to access contact discovery. | No |
| `CONTACT_DISCOVERY_RATE_LIMITED` | 429 | Too many contact discovery requests. Please wait before trying again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `contact_discovery.credentials_issued` | Short-lived contact discovery credentials were successfully generated for an account | `account_identifier`, `token_expiry_seconds` |
| `contact_discovery.rate_limited` | A contact discovery credential request was rejected due to rate limiting | `account_identifier` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | User must hold a valid authenticated session before requesting discovery credentials |
| rate-limiting-abuse-prevention | required | Credential issuance endpoints are protected by leaky-bucket rate limiting |
| e2e-key-exchange | recommended | Contact discovery is typically combined with key exchange to bootstrap end-to-end encrypted conversations |
| identity-lookup | optional | Identity lookup may consume contact discovery results to resolve account identifiers |

## AGI Readiness

### Goals

#### Reliable Private Contact Discovery

Issue short-lived HMAC-derived credentials that authenticate clients with an external privacy-preserving contact discovery service without exposing plaintext contact lists to the server

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
| `rate_limiting_abuse_prevention` | rate-limiting-abuse-prevention | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| credentials_issued | `autonomous` | - | - |
| unauthenticated | `autonomous` | - | - |
| rate_limited | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Contact Discovery Blueprint",
  "description": "Issue short-lived HMAC-derived credentials that authenticate clients with an external privacy-preserving contact discovery service without exposing plaintext co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "privacy, contacts, discovery, phone-number, credentials, psi"
}
</script>
