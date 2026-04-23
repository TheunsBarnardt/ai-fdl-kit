---
title: "Terminal Thin Client Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Android thin-client payment terminal — base UI + palm-vein capture with on-device 1:N match + card reader SPoC passthrough + PGW API client; no rail SDKs or EMV"
---

# Terminal Thin Client Blueprint

> Android thin-client payment terminal — base UI + palm-vein capture with on-device 1:N match + card reader SPoC passthrough + PGW API client; no rail SDKs or EMV kernel on-device

| | |
|---|---|
| **Feature** | `terminal-thin-client` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | terminal, thin-client, android, kotlin, palm, spoc, pgw-client |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/terminal-thin-client.blueprint.yaml) |
| **JSON API** | [terminal-thin-client.json]({{ site.baseurl }}/api/blueprints/payment/terminal-thin-client.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `merchant` | Merchant / Cashier | human |  |
| `customer` | Customer | human |  |
| `palm_scanner` | Built-in Palm Scanner | external |  |
| `card_reader` | Built-in SPoC card reader | external |  |
| `pgw` | Payments Gateway | external | Central PGW that terminal calls via /v1/* |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | token | Yes | Attested device identifier |  |
| `merchant_id` | text | Yes |  |  |
| `amount` | number | Yes |  |  |
| `method` | select | Yes |  |  |
| `palm_template_id` | token | No | Opaque palm template id (local; resolved via PGW) |  |

## Rules

- **privacy:** MUST: palm templates never leave the device (POPIA s.26), MUST: 1:N palm match runs on-device; only matched template_id crosses the network
- **security:** MUST: terminal ↔ PGW connection is mTLS with device attestation on every call, MUST: card data never stored on device; SPoC-encrypted and forwarded immediately
- **offline:** SHOULD: UI displays 'cannot accept payments offline' when PGW unreachable — no on-device decisioning

## Outcomes

### Pgw_unreachable (Priority: 10)

**Given:**
- PGW request fails after retry

**Then:**
- **emit_event** event: `terminal.pgw_unreachable`

**Result:** UI shows offline banner; no payment attempted

### Palm_no_match (Priority: 20)

**Given:**
- on-device 1:N match finds no template

**Result:** UI asks to rescan or use card

### Palm_payment_initiated (Priority: 100)

**Given:**
- merchant entered amount
- customer chose palm method
- on-device palm match returned template_id

**Then:**
- **call_service** target: `pgw.palm_sessions_resolve`
- **call_service** target: `pgw.create_payment`

**Result:** PGW returns settlement status; terminal shows receipt prompt

### Card_payment_initiated (Priority: 110)

**Given:**
- merchant entered amount
- customer chose card method
- SPoC reader returned encrypted card payload

**Then:**
- **call_service** target: `pgw.create_payment`

**Result:** PGW runs EMV kernel and returns auth status

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `terminal.payment_started` |  |  |
| `terminal.pgw_unreachable` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Handles biometric templates and cardholder data |
| payments-gateway-api | required | Terminal is a thin client of the PGW |
| palm-vein | required | Palm-vein SDK for capture and on-device matching |
| device-attestation | required | TPM-backed attestation on every PGW call |
| biometric-auth | required | Shared enrolment + auth semantics |

## AGI Readiness

### Goals

#### Reliable Terminal Thin Client

Android thin-client payment terminal — base UI + palm-vein capture with on-device 1:N match + card reader SPoC passthrough + PGW API client; no rail SDKs or EMV kernel on-device

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `popia_compliance` | popia-compliance | fail |
| `payments_gateway_api` | payments-gateway-api | fail |
| `palm_vein` | palm-vein | fail |
| `device_attestation` | device-attestation | fail |
| `biometric_auth` | biometric-auth | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| palm_payment_initiated | `autonomous` | - | - |
| card_payment_initiated | `autonomous` | - | - |
| pgw_unreachable | `autonomous` | - | - |
| palm_no_match | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Terminal Thin Client Blueprint",
  "description": "Android thin-client payment terminal — base UI + palm-vein capture with on-device 1:N match + card reader SPoC passthrough + PGW API client; no rail SDKs or EMV",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "terminal, thin-client, android, kotlin, palm, spoc, pgw-client"
}
</script>
