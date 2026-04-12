---
title: "Voip Call Signaling Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "1:1 voice and video call signaling with TURN relay credential issuance and ICE candidate relay for authenticated accounts. 6 fields. 4 outcomes. 3 error codes. "
---

# Voip Call Signaling Blueprint

> 1:1 voice and video call signaling with TURN relay credential issuance and ICE candidate relay for authenticated accounts

| | |
|---|---|
| **Feature** | `voip-call-signaling` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | voip, calling, turn, ice, webrtc, relay, signaling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/voip-call-signaling.blueprint.yaml) |
| **JSON API** | [voip-call-signaling.json]({{ site.baseurl }}/api/blueprints/integration/voip-call-signaling.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `turn_username` | text | Yes | TURN Username |  |
| `turn_password` | token | Yes | TURN Password |  |
| `turn_ttl_seconds` | number | Yes | TURN TTL |  |
| `turn_urls` | json | Yes | TURN URLs |  |
| `turn_urls_with_ips` | json | No | TURN URLs With IPs |  |
| `turn_hostname` | text | No | TURN Hostname |  |

## Rules

- **access_control:**
  - **authenticated_only:** true
  - **note:** Only authenticated accounts may request TURN relay credentials
- **rate_limiting:**
  - **scope:** per_account
  - **note:** Per-account rate limiting is enforced on the relay credential endpoint to prevent credential farming
- **credential_proxy:**
  - **note:** TURN credentials are fetched from an external relay provider API; the server acts as a credential proxy and never stores long-lived TURN secrets in user-accessible storage
  - **no_logging:** true
  - **note2:** TURN credentials must not be logged or included in error responses to prevent credential leakage
- **dns_resolution:**
  - **server_side:** true
  - **ipv6_bracket_notation:** true
  - **note:** The server resolves the TURN relay hostname at request time via DNS; IPv6 addresses are returned in bracket notation inside URL strings
- **ab_experiment:**
  - **note:** A/B experiment enrollment may route accounts to an alternative relay configuration (different URLs, hostname, and IP list) to support testing and gradual rollout
- **error_handling:**
  - **propagate_provider_errors:** true
  - **metric_on_error:** true
  - **note:** If the external relay credential API returns a non-success response, the error is propagated to the client and a metric counter is incremented

## Outcomes

### Rate_limited (Priority: 1) — Error: `CALL_RELAY_RATE_LIMITED`

**Given:**
- Caller is authenticated
- Call endpoint rate limit is exceeded for this account

**Then:**
- **emit_event** event: `call_relay.rate_limited`

**Result:** Request rejected with rate-limit error

### Unauthenticated (Priority: 2) — Error: `CALL_RELAY_UNAUTHORIZED`

**Given:**
- Caller is not authenticated

**Result:** Request rejected as unauthorized

### Relay_provider_error (Priority: 3) — Error: `CALL_RELAY_PROVIDER_ERROR`

**Given:**
- Caller is authenticated and within rate limit
- External relay credential API returns a non-success HTTP status or connection fails

**Then:**
- **emit_event** event: `call_relay.provider_error`

**Result:** Internal server error returned to client; relay credentials not issued

### Relay_credentials_issued (Priority: 4)

**Given:**
- Caller is authenticated and within rate limit
- External relay credential API returns valid credentials

**Then:**
- **emit_event** event: `call_relay.credentials_issued`

**Result:** TURN relay credentials returned; response includes username, password, TTL, standard domain URLs, IP-embedded URLs, and hostname

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CALL_RELAY_RATE_LIMITED` | 429 | Too many relay credential requests. Please wait before trying again. | Yes |
| `CALL_RELAY_UNAUTHORIZED` | 401 | Authentication required to obtain call relay credentials. | No |
| `CALL_RELAY_PROVIDER_ERROR` | 500 | Unable to obtain relay credentials at this time. Please try again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `call_relay.credentials_issued` | TURN relay credentials were successfully issued for a 1:1 call | `account_id`, `turn_ttl_seconds` |
| `call_relay.rate_limited` | A relay credential request was rejected due to per-account rate limiting | `account_id` |
| `call_relay.provider_error` | The external relay credential provider returned an error or was unreachable | `account_id`, `http_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | TURN credential issuance requires a valid authenticated device session |
| device-management | required | The calling account must have an active registered device |
| group-call-signaling | optional | Group calls use a separate room-based credential flow built on top of the same TURN relay infrastructure |
| encrypted-profile-storage | optional | Profile access may be needed during call initiation to resolve the callee identity key |

## AGI Readiness

### Goals

#### Reliable Voip Call Signaling

1:1 voice and video call signaling with TURN relay credential issuance and ICE candidate relay for authenticated accounts

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `login` | login | degrade |
| `device_management` | device-management | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| unauthenticated | `autonomous` | - | - |
| relay_provider_error | `autonomous` | - | - |
| relay_credentials_issued | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Voip Call Signaling Blueprint",
  "description": "1:1 voice and video call signaling with TURN relay credential issuance and ICE candidate relay for authenticated accounts. 6 fields. 4 outcomes. 3 error codes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "voip, calling, turn, ice, webrtc, relay, signaling"
}
</script>
