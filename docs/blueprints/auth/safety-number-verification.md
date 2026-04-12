---
title: "Safety Number Verification Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change even"
---

# Safety Number Verification Blueprint

> Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change events

| | |
|---|---|
| **Feature** | `safety-number-verification` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | identity, key-verification, fingerprint, trust, end-to-end-encryption, key-transparency |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/safety-number-verification.blueprint.yaml) |
| **JSON API** | [safety-number-verification.json]({{ site.baseurl }}/api/blueprints/auth/safety-number-verification.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_identifier` | text | Yes | Service Identifier |  |
| `identity_key` | token | Yes | Identity Key |  |
| `fingerprint` | token | Yes | Identity Key Fingerprint |  |
| `identity_type` | select | Yes | Identity Type |  |
| `sender_certificate` | token | No | Sender Certificate |  |

## Rules

- **identity_keys:** Each account holds one public identity key per identity type; these keys are set at registration and may change only when explicitly rotated by the user, The server must store and return the full 33-byte serialised identity key so that clients can compute the safety number independently, When an identity key changes the server must not silently reuse the old fingerprint; clients must re-verify after any key rotation, Signed pre-key signatures must be validated against the account's identity key when keys are uploaded or a new device is linked, preventing key substitution attacks
- **fingerprint_checks:** Batch identity key checks accept up to 1000 entries per request; each entry carries a service identifier and a 4-byte fingerprint, The server computes the SHA-256 hash of each stored identity key, extracts the 4 most-significant bytes, and compares them to the client-supplied fingerprint using a constant-time comparison, Only entries where the fingerprint does not match are returned in the response; a match means the client's view is consistent with the server's view
- **sender_certificates:** Sender certificates are short-lived (configurable expiry, typically 24 hours) and signed by a server-held private key; they embed the account UUID, device ID, and public identity key, Clients verify the sender certificate signature against the known server public key to confirm messages originate from the claimed sender, Key transparency proofs may supplement fingerprint checks by providing a publicly auditable, append-only log of identity key bindings

## Outcomes

### Invalid_request (Priority: 2) — Error: `IDENTITY_CHECK_INVALID_REQUEST`

**Given:**
- ANY: request contains more than 1000 elements OR `fingerprint` (input) not_exists OR a service identifier field is malformed

**Result:** HTTP 422 is returned; client must correct the request before retrying

### Signed_prekey_invalid (Priority: 3) — Error: `IDENTITY_PREKEY_INVALID_SIGNATURE`

**Given:**
- a signed pre-key or last-resort key is uploaded
- the signature on the key does not verify against the account's stored identity key

**Then:**
- **emit_event** event: `identity.prekey_validation_failed`

**Result:** HTTP 422 is returned; the key upload is rejected to prevent key substitution

### Identity_key_not_found (Priority: 4)

**Given:**
- the service identifier in the request does not correspond to any registered account

**Then:**
- **emit_event** event: `identity.lookup_failed`

**Result:** The entry is omitted from the mismatch response; clients treat absent entries as unknown contacts rather than mismatches

### Fingerprint_mismatch (Priority: 5)

**Given:**
- batch identity check request contains at least one element
- at least one submitted fingerprint does not match the server-stored identity key for its service identifier

**Then:**
- **emit_event** event: `identity.key_mismatch`

**Result:** HTTP 200 is returned; the response body contains only the mismatched entries with their current server-side identity keys so the client can detect key changes

### Fingerprint_match (Priority: 10)

**Given:**
- batch identity check request contains at least one element
- every submitted fingerprint matches the server-stored identity key fingerprint for that service identifier

**Then:**
- **emit_event** event: `identity.verified`

**Result:** HTTP 200 is returned with an empty elements array; the client's view is consistent with the server's view

### Sender_certificate_issued (Priority: 10)

**Given:**
- authenticated device requests a sender certificate
- device has a valid registered identity key

**Then:**
- **create_record** target: `sender_certificate_cache`
- **emit_event** event: `identity.certificate_issued`

**Result:** A signed certificate binding the account UUID, device ID, and identity key is returned; the certificate is valid for the configured TTL

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IDENTITY_CHECK_INVALID_REQUEST` | 422 | Identity check request is malformed; check fingerprint sizes and identifier formats | No |
| `IDENTITY_PREKEY_INVALID_SIGNATURE` | 422 | Pre-key signature does not match the account identity key | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `identity.verified` | A batch identity check confirmed all submitted fingerprints match the server-stored keys | `service_identifier`, `identity_type` |
| `identity.key_mismatch` | At least one submitted fingerprint did not match the stored identity key, indicating a possible key change | `service_identifier`, `identity_key`, `identity_type` |
| `identity.lookup_failed` | The requested service identifier was not found in the account store during a batch identity check | `service_identifier` |
| `identity.certificate_issued` | A short-lived sender certificate was issued to an authenticated device | `service_identifier`, `device_id`, `expires_at` |
| `identity.prekey_validation_failed` | A signed pre-key upload was rejected because its signature was invalid | `service_identifier`, `device_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| e2e-key-exchange | required | Identity keys established during key exchange are the source of truth that safety number verification checks |
| phone-number-registration | required | Identity keys are created and stored at registration; the registered account must exist for verification to operate |
| sealed-sender-delivery | recommended | Sender certificates produced by this feature are embedded in sealed-sender messages so recipients can verify sender identity |
| multi-device-linking | recommended | Each linked device registers its own pre-keys but shares the account identity key; key verification spans all devices on the account |

## AGI Readiness

### Goals

#### Reliable Safety Number Verification

Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change events

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
| `e2e_key_exchange` | e2e-key-exchange | fail |
| `phone_number_registration` | phone-number-registration | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| fingerprint_match | `autonomous` | - | - |
| fingerprint_mismatch | `autonomous` | - | - |
| identity_key_not_found | `autonomous` | - | - |
| invalid_request | `autonomous` | - | - |
| sender_certificate_issued | `autonomous` | - | - |
| signed_prekey_invalid | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Safety Number Verification Blueprint",
  "description": "Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change even",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "identity, key-verification, fingerprint, trust, end-to-end-encryption, key-transparency"
}
</script>
