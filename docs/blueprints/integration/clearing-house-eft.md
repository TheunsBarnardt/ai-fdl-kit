---
title: "Clearing House Eft Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system err"
---

# Clearing House Eft Blueprint

> Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system error correction

| | |
|---|---|
| **Feature** | `clearing-house-eft` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | eft, payments, clearing-house, credits, debits, returns, system-error-correction |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/chp-eft.blueprint.yaml) |
| **JSON API** | [clearing-house-eft.json]({{ site.baseurl }}/api/blueprints/integration/clearing-house-eft.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `partner_system` | Partner System | system | Financial institution integrating with payment platform for EFT processing |
| `payment_platform` | Payment Orchestration Platform | external | Payment orchestration platform that mediates between partner and clearing house |
| `clearing_house` | Clearing House Operator | external | Automated clearing house operator for EFT batch settlement |
| `counterparty_bank` | Counterparty Bank | external | The other financial institution in the EFT transaction |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `uetr` | token | Yes | UETR |  |
| `end_to_end_identification` | text | Yes | End-to-End Identification | Validations: maxLength |
| `creditor_account_number` | text | Yes | Creditor Account Number |  |
| `debtor_account_number` | text | Yes | Debtor Account Number |  |
| `user_branch` | text | Yes | User Branch |  |
| `user_account` | text | Yes | User Account |  |
| `homing_branch` | text | Yes | Homing Branch |  |
| `homing_account` | text | Yes | Homing Account |  |
| `amount_value` | number | Yes | Amount | Validations: required |
| `amount_currency` | text | Yes | Currency |  |
| `payment_scheme` | select | Yes | Payment Scheme |  |
| `entry_class` | select | No | Entry Class |  |
| `record_identifier` | select | No | Record Identifier |  |
| `mandate_reference` | text | No | Mandate Reference |  |
| `return_reason` | text | No | Return Reason |  |
| `action_date` | date | No | Action Date |  |
| `user_reference` | text | Yes | User Reference |  |

## States

**State field:** `eft_transaction_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `submitted` |  |  |
| `processing` |  |  |
| `settled` |  | Yes |
| `returned` |  | Yes |
| `cancelled` |  | Yes |
| `unpaid` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initiated` | `submitted` | electrum |  |
|  | `submitted` | `processing` | bankservafrica |  |
|  | `processing` | `settled` | bankservafrica |  |
|  | `processing` | `unpaid` | counterparty_bank |  |
|  | `settled` | `returned` | counterparty_bank |  |
|  | `initiated` | `cancelled` | partner_system |  |
|  | `submitted` | `cancelled` | partner_system |  |
|  | `initiated` | `failed` | electrum |  |
|  | `submitted` | `failed` | electrum |  |

## Rules

- **asynchronous_processing:**
  - **http_202:** All EFT operations return HTTP 202 Accepted — results delivered asynchronously via callbacks
  - **acknowledgement_time:** Partner must acknowledge inbound requests within 1 second
- **idempotency:**
  - **required:** All operations must be processed idempotently
  - **key:** uetr serves as the idempotency key for all EFT operations
- **settlement:**
  - **batch_processing:** EFT transactions are batch-processed through clearing house — not real-time
  - **action_date:** Settlement occurs on the specified action_date
- **inbound_credits:**
  - **endpoint:** POST /transactions/inbound/credit-transfer
  - **immediate_impact:** Inbound credits have immediate financial impact on the partner's customer
- **inbound_debits:**
  - **endpoint:** POST /transactions/inbound/direct-debit
  - **immediate_impact:** Inbound debits have immediate financial impact on the partner's customer
- **outbound_credits:**
  - **endpoint:** POST /transactions/outbound/credit-transfer
  - **scheme:** ZA_EFT
- **outbound_debits:**
  - **endpoint:** POST /transactions/outbound/direct-debit
  - **schemes:** ZA_EFT, ZA_AC, ZA_RMS
  - **mandate_required:** Direct debits require a valid mandate reference
- **on_us_debits:**
  - **description:** Special case where debtor and creditor are at the same institution
  - **endpoint:** Uses same direct debit endpoints with on-us processing
- **returns:**
  - **inbound_endpoint:** POST /transactions/inbound/payment-return
  - **outbound_endpoint:** POST /transactions/outbound/payment-return
  - **original_reference:** Returns must reference the original transaction
  - **reason_required:** A valid ReasonCode from the 24-value enum must be provided
- **cancellation:**
  - **endpoint:** POST /transactions/outbound/payment-cancellation
  - **schemes:** ZA_EFT, ZA_AC
  - **resolution:** Platform delivers cancellation resolution via callback
- **sec:**
  - **description:** System Error Correction — used to correct errors in previously submitted EFT transactions
  - **tracking:** SEC request and response records tracked via Events API
  - **sub_services:** SYSTEM_ERROR_CORRECTION, SYSTEM_ERROR_CORRECTION_RESPONSE
  - **original_reference:** SEC corrections require matching the original transaction
- **reason_codes:**
  - **description:** 24-value ReasonCode enum for returns and rejections

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| acknowledgement | 1s |  |

## Outcomes

### Eft_outbound_credit_initiated (Priority: 1)

**Given:**
- Partner system is authenticated
- `amount_value` (input) gt `0`
- `creditor_account_number` (input) exists
- `payment_scheme` (input) eq `ZA_EFT`

**Then:**
- **call_service** target: `electrum_api.outbound_credit_transfer` — POST /transactions/outbound/credit-transfer with scheme ZA_EFT
- **transition_state** field: `eft_transaction_status` to: `initiated`
- **emit_event** event: `eft.credit.outbound_initiated`

**Result:** Outbound EFT credit accepted (HTTP 202) — settlement result delivered via callback

### Eft_outbound_debit_initiated (Priority: 2)

**Given:**
- Partner system is authenticated
- `amount_value` (input) gt `0`
- `debtor_account_number` (input) exists
- `mandate_reference` (input) exists
- `payment_scheme` (input) in `ZA_EFT,ZA_AC,ZA_RMS`

**Then:**
- **call_service** target: `electrum_api.outbound_direct_debit` — POST /transactions/outbound/direct-debit
- **transition_state** field: `eft_transaction_status` to: `initiated`
- **emit_event** event: `eft.debit.outbound_initiated`

**Result:** Outbound EFT debit accepted (HTTP 202) — settlement result delivered via callback

### Eft_inbound_credit_received (Priority: 3)

**Given:**
- Platform sends inbound credit notification
- `creditor_account_number` (input) exists
- `amount_value` (input) gt `0`

**Then:**
- **call_service** target: `partner_api.process_inbound_credit` — POST /transactions/inbound/credit-transfer — immediate financial impact
- **emit_event** event: `eft.credit.inbound_received`

**Result:** Inbound EFT credit processed — beneficiary account credited

### Eft_inbound_debit_received (Priority: 4)

**Given:**
- Platform sends inbound debit notification
- `debtor_account_number` (input) exists
- `amount_value` (input) gt `0`

**Then:**
- **call_service** target: `partner_api.process_inbound_debit` — POST /transactions/inbound/direct-debit — immediate financial impact
- **emit_event** event: `eft.debit.inbound_received`

**Result:** Inbound EFT debit processed — account holder debited

### Eft_outbound_return_initiated (Priority: 5)

**Given:**
- Partner system is authenticated
- `uetr` (input) exists
- `return_reason` (input) exists

**Then:**
- **call_service** target: `electrum_api.outbound_payment_return` — POST /transactions/outbound/payment-return referencing the original transaction
- **transition_state** field: `eft_transaction_status` from: `settled` to: `returned`
- **emit_event** event: `eft.return.outbound_initiated`

**Result:** Outbound return accepted (HTTP 202) — returning a prior inbound transaction

### Eft_inbound_return_received (Priority: 6)

**Given:**
- Platform sends inbound return notification
- `uetr` (input) exists
- `return_reason` (input) exists

**Then:**
- **call_service** target: `partner_api.process_inbound_return` — POST /transactions/inbound/payment-return for a prior outbound transaction
- **transition_state** field: `eft_transaction_status` from: `settled` to: `returned`
- **emit_event** event: `eft.return.inbound_received`

**Result:** Inbound return processed — prior outbound transaction reversed

### Eft_cancellation_initiated (Priority: 7)

**Given:**
- Partner system is authenticated
- `uetr` (input) exists
- `payment_scheme` (input) in `ZA_EFT,ZA_AC`

**Then:**
- **call_service** target: `electrum_api.outbound_payment_cancellation` — POST /transactions/outbound/payment-cancellation
- **emit_event** event: `eft.cancellation.initiated`

**Result:** Payment cancellation request accepted (HTTP 202) — resolution delivered via callback

### Eft_cancellation_resolved (Priority: 8)

**Given:**
- Platform delivers cancellation resolution via callback
- `uetr` (input) exists

**Then:**
- **transition_state** field: `eft_transaction_status` from: `initiated` to: `cancelled`
- **emit_event** event: `eft.cancellation.resolved`

**Result:** Cancellation resolution received — transaction status updated

### Eft_sec_initiated (Priority: 9)

**Given:**
- An error is identified in a previously submitted EFT transaction
- `uetr` (input) exists

**Then:**
- **call_service** target: `electrum_api.sec_request` — Submit System Error Correction request — tracked via Events API
- **emit_event** event: `eft.sec.request_sent`

**Result:** SEC request submitted — correction tracked via Events API with SubService SYSTEM_ERROR_CORRECTION

### Eft_technical_error (Priority: 10) — Error: `EFT_UNPROCESSABLE`

**Given:**
- ANY: Request payload fails validation OR Referenced transaction does not exist OR Operation not permitted for the current transaction state

**Then:**
- **transition_state** field: `eft_transaction_status` from: `initiated` to: `failed`
- **emit_event** event: `eft.sec.response_received`

**Result:** EFT operation failed due to technical error — see error code for details

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EFT_BAD_REQUEST` | 400 | Request payload is invalid or missing required fields | No |
| `EFT_UNAUTHORIZED` | 401 | Authentication failed — invalid or missing credentials | No |
| `EFT_FORBIDDEN` | 403 | Insufficient permissions for the requested EFT operation | No |
| `EFT_NOT_FOUND` | 404 | Referenced transaction or resource does not exist | No |
| `EFT_CONFLICT` | 409 | Duplicate request — transaction with this uetr already exists | No |
| `EFT_UNPROCESSABLE` | 422 | Request is well-formed but cannot be processed (invalid state, business rule violation) | No |
| `EFT_RATE_LIMITED` | 429 | Too many requests — rate limit exceeded | Yes |
| `EFT_SERVER_ERROR` | 500 | Internal server error during EFT processing | Yes |
| `EFT_SERVICE_UNAVAILABLE` | 500 | EFT service temporarily unavailable | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `eft.credit.inbound_received` | Inbound EFT credit received from counterparty bank | `uetr`, `end_to_end_identification`, `amount_value`, `creditor_account_number` |
| `eft.credit.outbound_initiated` | Outbound EFT credit initiated by partner | `uetr`, `end_to_end_identification`, `amount_value`, `creditor_account_number` |
| `eft.debit.inbound_received` | Inbound EFT debit received from counterparty bank | `uetr`, `end_to_end_identification`, `amount_value`, `debtor_account_number` |
| `eft.debit.outbound_initiated` | Outbound EFT debit initiated by partner | `uetr`, `end_to_end_identification`, `amount_value`, `debtor_account_number`, `payment_scheme` |
| `eft.return.inbound_received` | Inbound return received for a prior outbound transaction | `uetr`, `return_reason`, `amount_value` |
| `eft.return.outbound_initiated` | Outbound return initiated for a prior inbound transaction | `uetr`, `return_reason`, `amount_value` |
| `eft.cancellation.initiated` | Payment cancellation request submitted | `uetr`, `payment_scheme` |
| `eft.cancellation.resolved` | Payment cancellation resolution received | `uetr` |
| `eft.sec.request_sent` | System Error Correction request submitted | `uetr` |
| `eft.sec.response_received` | System Error Correction response received | `uetr` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| chp-inbound-payments | required |  |
| chp-outbound-payments | required |  |
| chp-account-management | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://example.com/path/payments/api/v1
  auth: OAuth 2.0
  content_type: application/json
  openapi_spec: https://docs.electrumsoftware.com/_spec/openapi/elpapi/elpapi.json
esm:
  description: EFT Settlement Module — clearing house batch settlement system
  record_types:
    - PAYMENT
    - UNPAID_INPUT
    - UNPAID_OUTPUT
    - RECALL_OUTPUT
    - SEC_REQUEST
    - SEC_RESPONSE
    - HOMED_BACK
  payment_types:
    - CREDIT
    - DEBIT
  directions:
    - INBOUND
    - OUTBOUND
    - ON_US
  sub_services:
    - SAME_DAY
    - ONE_DAY
    - TWO_DAY
    - RECALLS
    - SYSTEM_ERROR_CORRECTION
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Clearing House Eft Blueprint",
  "description": "Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "eft, payments, clearing-house, credits, debits, returns, system-error-correction"
}
</script>
