---
title: "Device Attestation Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "TPM-backed device identity and per-call signed attestation — terminals prove their identity to the Payments Gateway on every request; rejected devices cannot tr"
---

# Device Attestation Blueprint

> TPM-backed device identity and per-call signed attestation — terminals prove their identity to the Payments Gateway on every request; rejected devices cannot transact

| | |
|---|---|
| **Feature** | `device-attestation` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | attestation, tpm, mtls, device-identity, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/device-attestation.blueprint.yaml) |
| **JSON API** | [device-attestation.json]({{ site.baseurl }}/api/blueprints/auth/device-attestation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal` | Payment terminal | system |  |
| `pgw` | Payments Gateway | system |  |
| `ca` | Device certificate authority | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | token | Yes | Opaque device identifier |  |
| `tpm_quote` | text | Yes | TPM-signed quote proving key resides in hardware |  |
| `public_key` | text | Yes | Device public key (attested) |  |

## Rules

- **security:** MUST: TPM quote verified against the device vendor's signing root, MUST: issued certificate has ≤ 90-day expiry, rotated automatically, MUST: revoked devices cannot complete attestation — CRL checked
- **privacy:** MUST: attestation includes no personal information; only device identity

## Outcomes

### Device_revoked (Priority: 3) — Error: `ATTEST_DEVICE_REVOKED`

**Given:**
- device on CRL

**Then:**
- **emit_event** event: `device.revoked_rejected`

**Result:** 403

### Invalid_quote (Priority: 5) — Error: `ATTEST_INVALID_QUOTE`

**Given:**
- TPM quote signature invalid

**Result:** 400

### Already_enrolled (Priority: 10) — Error: `ATTEST_ALREADY_ENROLLED`

**Given:**
- device_id already has an active cert

**Result:** 409 — rotate instead

### Attested (Priority: 100)

**Given:**
- TPM quote verifies against vendor root
- device not on revocation list

**Then:**
- **create_record**
- **emit_event** event: `device.attested`

**Result:** Short-lived device certificate issued

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ATTEST_INVALID_QUOTE` | 400 | Device attestation failed | No |
| `ATTEST_DEVICE_REVOKED` | 403 | Device is not authorised | No |
| `ATTEST_ALREADY_ENROLLED` | 409 | Device already enrolled | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.attested` |  |  |
| `device.revoked_rejected` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payments-gateway-api | required | Every PGW call must carry a valid attestation |
| terminal-fleet | required | Fleet management drives revocation and rotation |

## AGI Readiness

### Goals

#### Reliable Device Attestation

TPM-backed device identity and per-call signed attestation — terminals prove their identity to the Payments Gateway on every request; rejected devices cannot transact

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

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `payments_gateway_api` | payments-gateway-api | fail |
| `terminal_fleet` | terminal-fleet | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| attested | `autonomous` | - | - |
| invalid_quote | `autonomous` | - | - |
| device_revoked | `human_required` | - | - |
| already_enrolled | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Device Attestation Blueprint",
  "description": "TPM-backed device identity and per-call signed attestation — terminals prove their identity to the Payments Gateway on every request; rejected devices cannot tr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "attestation, tpm, mtls, device-identity, fleet"
}
</script>
