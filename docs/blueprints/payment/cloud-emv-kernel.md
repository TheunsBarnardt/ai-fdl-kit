---
title: "Cloud Emv Kernel Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Server-side EMV L2 kernel — processes SPoC-forwarded card data from thin-client terminals; handles chip/tap/stripe authorization, tokenisation, PIN verification"
---

# Cloud Emv Kernel Blueprint

> Server-side EMV L2 kernel — processes SPoC-forwarded card data from thin-client terminals; handles chip/tap/stripe authorization, tokenisation, PIN verification

| | |
|---|---|
| **Feature** | `cloud-emv-kernel` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | emv, kernel, card, cloud, tokenisation, spoc, pci |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/cloud-emv-kernel.blueprint.yaml) |
| **JSON API** | [cloud-emv-kernel.json]({{ site.baseurl }}/api/blueprints/payment/cloud-emv-kernel.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pgw` | Payments Gateway | system | Forwards SPoC-encrypted card payload to kernel for processing |
| `card_reader` | SPoC card reader | external | On-device passthrough — captures and encrypts card data |
| `card_network` | Card network | external | Issuer host for authorization |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `transaction_id` | token | Yes |  |  |
| `amount` | number | Yes |  |  |
| `currency` | text | Yes |  |  |
| `method` | select | Yes |  |  |
| `card_data_encrypted` | text | Yes | SPoC-encrypted payload from the device reader |  |
| `pin_block_encrypted` | text | No | DUKPT-wrapped PIN block (chip only) |  |

## Rules

- **security:** MUST: decryption of card_data_encrypted happens inside HSM boundary, MUST: clear-text PAN never leaves the HSM — only tokenised references cross process boundaries, MUST: PIN verification uses DUKPT; PIN block never logged
- **pci:** MUST: kernel runs in PCI-DSS Level 1 certified environment

## Outcomes

### Invalid_data (Priority: 5) — Error: `EMV_INVALID_DATA`

**Given:**
- card_data_encrypted fails to decrypt or parse

**Result:** 400 — malformed request

### Network_unavailable (Priority: 30) — Error: `EMV_NETWORK_UNAVAILABLE`

**Given:**
- card network unreachable after retry

**Then:**
- **emit_event** event: `emv.network_unavailable`

**Result:** 503 — try again later

### Pin_failed (Priority: 40) — Error: `EMV_PIN_FAILED`

**Given:**
- PIN verification fails

**Result:** 422 — PIN wrong

### Declined (Priority: 50) — Error: `EMV_DECLINED`

**Given:**
- issuer returns decline

**Then:**
- **emit_event** event: `emv.declined`

**Result:** 402 — card declined

### Authorised (Priority: 100)

**Given:**
- issuer approves; kernel returns auth code

**Then:**
- **emit_event** event: `emv.authorised`

**Result:** Returns auth code + token reference

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EMV_INVALID_DATA` | 400 | Card data could not be read | No |
| `EMV_DECLINED` | 422 | Card declined | No |
| `EMV_PIN_FAILED` | 422 | Incorrect PIN | No |
| `EMV_NETWORK_UNAVAILABLE` | 503 | Card network unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `emv.authorised` |  |  |
| `emv.declined` |  |  |
| `emv.network_unavailable` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Handles cardholder data (financial PII under POPIA) |
| payments-gateway-api | required | PGW is the sole caller of the cloud EMV kernel |
| emv-card-reader | required | Device-side SPoC reader that feeds this kernel |

## AGI Readiness

### Goals

#### Reliable Cloud Emv Kernel

Server-side EMV L2 kernel — processes SPoC-forwarded card data from thin-client terminals; handles chip/tap/stripe authorization, tokenisation, PIN verification

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
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `popia_compliance` | popia-compliance | fail |
| `payments_gateway_api` | payments-gateway-api | fail |
| `emv_card_reader` | emv-card-reader | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| authorised | `autonomous` | - | - |
| declined | `autonomous` | - | - |
| pin_failed | `autonomous` | - | - |
| invalid_data | `autonomous` | - | - |
| network_unavailable | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cloud Emv Kernel Blueprint",
  "description": "Server-side EMV L2 kernel — processes SPoC-forwarded card data from thin-client terminals; handles chip/tap/stripe authorization, tokenisation, PIN verification",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "emv, kernel, card, cloud, tokenisation, spoc, pci"
}
</script>
