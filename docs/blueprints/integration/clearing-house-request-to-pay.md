---
title: "Clearing House Request To Pay Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing. 14 fields. 9 outcomes. 8 er"
---

# Clearing House Request To Pay Blueprint

> Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing

| | |
|---|---|
| **Feature** | `clearing-house-request-to-pay` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | rtp, request-to-pay, refund, payments, clearing-house |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/chp-request-to-pay.blueprint.yaml) |
| **JSON API** | [clearing-house-request-to-pay.json]({{ site.baseurl }}/api/blueprints/integration/clearing-house-request-to-pay.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `partner_system` | Partner System | system | Financial institution integrating with Electrum for PayShap RTP |
| `payment_platform` | Payment Orchestration Platform | external | Clearing house platform that orchestrates RTP messaging |
| `clearing_house` | Clearing House Operator | external | Clearing house scheme operator managing the real-time payments network |
| `debtor_bank` | Debtor Bank | external | Financial institution holding the debtor's account |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `uetr` | token | Yes | UETR |  |
| `end_to_end_identification` | text | Yes | End-to-End Identification | Validations: maxLength |
| `creditor_account_number` | text | Yes | Creditor Account Number |  |
| `debtor_party_name` | text | Yes | Debtor Party Name | Validations: maxLength |
| `debtor_party_identification` | text | No | Debtor Party Identification |  |
| `amount_value` | number | No | Amount Value |  |
| `amount_currency` | text | Yes | Amount Currency |  |
| `amount_range_min` | number | No | Amount Range Minimum |  |
| `amount_range_max` | number | No | Amount Range Maximum |  |
| `expiry_date_time` | datetime | No | Expiry Date/Time |  |
| `remittance_information` | text | No | Remittance Information |  |
| `rtp_status` | select | No | RTP Status |  |
| `cancellation_reason` | text | No | Cancellation Reason |  |
| `refund_amount` | number | No | Refund Amount |  |

## States

**State field:** `rtp_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `presented` |  |  |
| `paid` |  | Yes |
| `rejected` |  | Yes |
| `cancelled` |  | Yes |
| `expired` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initiated` | `presented` | electrum |  |
|  | `presented` | `paid` | debtor_bank |  |
|  | `presented` | `rejected` | debtor_bank |  |
|  | `presented` | `cancelled` | partner_system |  |
|  | `presented` | `expired` | electrum |  |

## Rules

- **scheme:**
  - **payshap_only:** Only the ZA_RPP (PayShap) scheme is supported for RTP
  - **async_model:** All RTP processing is asynchronous — requests and responses travel on separate HTTP calls
  - **end_to_end_time_limit:** PayShap mandates a 10-second end-to-end time limit for message processing
- **amount:**
  - **exact_or_range:** An RTP can specify either an exact amount (amount_value) or an amount range (amount_range_min / amount_range_max), not both
  - **currency_required:** amount_currency is always required (ISO 4217)
- **cancellation:**
  - **already_paid:** Cancellation may fail if the debtor has already paid — status ALREADY_PAID returned
  - **before_expiry:** Cancellations are only meaningful before the RTP expires
- **refund:**
  - **original_amount_default:** If refund_amount is omitted, the original transaction amount is used
  - **original_debtor_default:** If debtor details are omitted, the creditor of the original transaction becomes the debtor of the refund
  - **prior_transaction_required:** A refund must reference a prior successful financial transaction
- **expiry:**
  - **configurable:** RTP expiry is configurable via the expiryDateTime field (ISO 8601)

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| payshap_end_to_end | 10s |  |

## Flows

### Outbound_rtp

Partner initiates a request-to-pay to a debtor via PayShap

1. **POST to Electrum /transactions/outbound/request-to-pay with RTP details** (partner_system)
1. **Validate and forward RTP through PayShap (ZA_RPP) scheme** (electrum)
1. **Route RTP to debtor bank** (bankservafrica)
1. **Present RTP to debtor for authorisation** (debtor_bank)
1. **POST response to partner's /transactions/outbound/request-to-pay-response** (electrum)

### Inbound_rtp

Electrum delivers an inbound RTP from another institution to the partner

1. **POST to partner's /transactions/inbound/request-to-pay** (electrum)
1. **Process inbound RTP and determine response** (partner_system)
1. **POST response to Electrum /transactions/inbound/request-to-pay-response** (partner_system)

### Outbound_cancellation

Partner cancels a previously initiated outbound RTP

1. **POST to Electrum /transactions/outbound/request-to-pay/cancellation-request** (partner_system)
1. **Forward cancellation through PayShap scheme** (electrum)
1. **POST cancellation response to partner's callback endpoint** (electrum)

### Inbound_cancellation

Electrum delivers a cancellation request for an inbound RTP

1. **POST to partner's /transactions/inbound/request-to-pay/cancellation-request** (electrum)
1. **Process cancellation and respond** (partner_system)

### Inbound_status_request

Electrum requests the status of an inbound RTP from the partner

1. **POST to partner's /transactions/inbound/request-to-pay/status-request** (electrum)
1. **Return current RTP status** (partner_system)

### Refund

Partner initiates a refund for a prior successful transaction

1. **POST to Electrum /transactions/outbound/refund-initiation** (partner_system)
1. **Process refund through PayShap scheme** (electrum)
1. **POST refund response to partner's /transactions/outbound/refund-initiation-response** (electrum)

## Outcomes

### Outbound_rtp_initiated (Priority: 1)

**Given:**
- Partner system is authenticated
- `uetr` (input) exists
- `creditor_account_number` (input) exists
- `amount_currency` (input) exists

**Then:**
- **call_service** target: `electrum_chp.outbound_rtp` — POST /transactions/outbound/request-to-pay
- **transition_state** field: `rtp_status` from: `initiated` to: `presented`
- **emit_event** event: `rtp.outbound.initiated`

**Result:** Outbound RTP submitted to Electrum and forwarded to debtor bank via PayShap

### Outbound_rtp_paid (Priority: 2)

**Given:**
- `rtp_status` (db) eq `presented`
- Debtor authorises and completes payment

**Then:**
- **transition_state** field: `rtp_status` from: `presented` to: `paid`
- **emit_event** event: `rtp.outbound.response_received`

**Result:** Debtor paid the RTP — response delivered to partner via callback

### Outbound_rtp_rejected (Priority: 3)

**Given:**
- `rtp_status` (db) eq `presented`
- Debtor rejects the request to pay

**Then:**
- **transition_state** field: `rtp_status` from: `presented` to: `rejected`
- **emit_event** event: `rtp.outbound.response_received`

**Result:** Debtor rejected the RTP — response delivered to partner via callback

### Outbound_rtp_expired (Priority: 4)

**Given:**
- `rtp_status` (db) eq `presented`
- `expiry_date_time` (db) lt `now`

**Then:**
- **transition_state** field: `rtp_status` from: `presented` to: `expired`
- **emit_event** event: `rtp.outbound.response_received`

**Result:** RTP expired without a response from the debtor

### Inbound_rtp_received (Priority: 5)

**Given:**
- Electrum delivers inbound RTP from another institution
- `uetr` (input) exists
- `debtor_party_name` (input) exists

**Then:**
- **emit_event** event: `rtp.inbound.received`
- **call_service** target: `partner_system.process_inbound_rtp` — POST to partner's /transactions/inbound/request-to-pay

**Result:** Inbound RTP delivered to partner for processing — partner responds via callback

### Rtp_cancellation_success (Priority: 6)

**Given:**
- `rtp_status` (db) eq `presented`
- Cancellation request submitted before payment

**Then:**
- **transition_state** field: `rtp_status` from: `presented` to: `cancelled`
- **emit_event** event: `rtp.cancellation.requested`
- **emit_event** event: `rtp.cancellation.response_received`

**Result:** RTP cancellation succeeded — transaction marked as cancelled

### Rtp_cancellation_already_paid (Priority: 7)

**Given:**
- `rtp_status` (db) eq `paid`
- Cancellation request submitted after payment

**Then:**
- **emit_event** event: `rtp.cancellation.response_received`

**Result:** Cancellation failed — debtor has already paid the RTP (status ALREADY_PAID)

### Refund_initiated (Priority: 8)

**Given:**
- Partner system is authenticated
- A prior successful financial transaction exists for the given reference
- `uetr` (input) exists

**Then:**
- **call_service** target: `electrum_chp.refund_initiation` — POST /transactions/outbound/refund-initiation
- **emit_event** event: `rtp.refund.initiated`

**Result:** Refund initiated against a prior successful transaction — uses original amount and creditor as debtor if not specified

### Refund_completed (Priority: 9)

**Given:**
- Refund initiation was submitted
- Refund successfully processed by the scheme

**Then:**
- **emit_event** event: `rtp.refund.response_received`

**Result:** Refund completed — response delivered to partner via callback

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RTP_BAD_REQUEST` | 400 | The request body is malformed or missing required fields | No |
| `RTP_UNAUTHORIZED` | 401 | Authentication credentials are missing or invalid | No |
| `RTP_FORBIDDEN` | 403 | The caller does not have permission to perform this operation | No |
| `RTP_NOT_FOUND` | 404 | The requested RTP transaction was not found | No |
| `RTP_UNPROCESSABLE` | 422 | The request is well-formed but contains semantic errors | No |
| `RTP_RATE_LIMITED` | 429 | Too many requests — rate limit exceeded | No |
| `RTP_SERVER_ERROR` | 500 | An unexpected error occurred on the server | No |
| `RTP_SERVICE_UNAVAILABLE` | 500 | The service is temporarily unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rtp.outbound.initiated` | Partner initiated an outbound request-to-pay | `uetr`, `end_to_end_identification`, `creditor_account_number`, `amount_value`, `amount_currency` |
| `rtp.outbound.response_received` | Response received for an outbound RTP (paid, rejected, expired) | `uetr`, `rtp_status`, `amount_value`, `amount_currency` |
| `rtp.inbound.received` | Inbound RTP received from another institution via Electrum | `uetr`, `end_to_end_identification`, `debtor_party_name`, `amount_value`, `amount_currency` |
| `rtp.inbound.responded` | Partner responded to an inbound RTP | `uetr`, `rtp_status` |
| `rtp.cancellation.requested` | Cancellation requested for an RTP | `uetr`, `cancellation_reason` |
| `rtp.cancellation.response_received` | Cancellation response received | `uetr`, `rtp_status` |
| `rtp.refund.initiated` | Refund initiated for a prior successful transaction | `uetr`, `refund_amount`, `amount_currency` |
| `rtp.refund.response_received` | Refund response received | `uetr`, `refund_amount`, `amount_currency` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| chp-inbound-payments | required | RTP payments result in inbound credit transfers |
| chp-outbound-payments | required | RTP responses delivered via outbound callbacks |
| chp-account-management | recommended | Proxy resolution for PayShap addressing |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://example.com/path/payments/api/v1
  auth: OAuth 2.0
  content_type: application/json
  openapi_spec: https://docs.electrumsoftware.com/_spec/openapi/elpapi/elpapi.json
  endpoints:
    outbound_rtp: POST /transactions/outbound/request-to-pay
    outbound_rtp_response: POST /transactions/outbound/request-to-pay-response (callback)
    inbound_rtp: POST /transactions/inbound/request-to-pay (callback)
    inbound_rtp_response: POST /transactions/inbound/request-to-pay-response
    outbound_cancellation: POST /transactions/outbound/request-to-pay/cancellation-request
    outbound_cancellation_response: POST /transactions/outbound/request-to-pay/cancellation-response (callback)
    inbound_cancellation: POST /transactions/inbound/request-to-pay/cancellation-request (callback)
    inbound_status_request: POST /transactions/inbound/request-to-pay/status-request (callback)
    refund_initiation: POST /transactions/outbound/refund-initiation
    refund_initiation_response: POST /transactions/outbound/refund-initiation-response (callback)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Clearing House Request To Pay Blueprint",
  "description": "Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing. 14 fields. 9 outcomes. 8 er",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rtp, request-to-pay, refund, payments, clearing-house"
}
</script>
