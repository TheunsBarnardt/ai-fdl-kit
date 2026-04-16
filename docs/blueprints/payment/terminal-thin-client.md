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
