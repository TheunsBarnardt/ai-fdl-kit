---
title: "Chp Outbound Payments Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Electrum Clearing House Payments — outbound payment operations including RTC, PayShap, CBPR+, EFT credit transfers, bulk payments, direct debits, returns, and c"
---

# Chp Outbound Payments Blueprint

> Electrum Clearing House Payments — outbound payment operations including RTC, PayShap, CBPR+, EFT credit transfers, bulk payments, direct debits, returns, and cancellations

| | |
|---|---|
| **Feature** | `chp-outbound-payments` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | payments, clearing-house, rtc, payshap, cbpr-plus, eft, outbound, south-africa, bankservafrica, electrum |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/chp-outbound-payments.blueprint.yaml) |
| **JSON API** | [chp-outbound-payments.json]({{ site.baseurl }}/api/blueprints/integration/chp-outbound-payments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `partner_system` | Partner System | system | Financial institution sending payments via Electrum's API |
| `electrum` | Electrum Platform | external | Electrum platform orchestrating payment processing through the national payment system |
| `bankservafrica` | BankservAfrica | external | BankservAfrica scheme operator for South African payment clearing |
| `creditor_bank` | Creditor Bank | external | Receiving/creditor financial institution |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `uetr` | token | Yes | UETR |  |
| `end_to_end_identification` | text | Yes | End-to-End Identification | Validations: maxLength |
| `transaction_reference` | text | Yes | Transaction Reference |  |
| `creditor_account_number` | text | Yes | Creditor Account Number |  |
| `creditor_account_type` | select | No | Creditor Account Type |  |
| `creditor_bank_code` | text | No | Creditor Bank Code |  |
| `debtor_account_number` | text | Yes | Debtor Account Number |  |
| `debtor_account_type` | select | No | Debtor Account Type |  |
| `amount_value` | number | Yes | Amount | Validations: min |
| `amount_currency` | text | Yes | Currency |  |
| `payment_scheme` | select | Yes | Payment Scheme |  |
| `payment_information` | text | No | Payment Information |  |
| `remittance_information` | text | No | Remittance Information |  |
| `instruction_priority` | text | No | Instruction Priority |  |
| `mandate_reference` | text | No | Mandate Reference |  |
| `return_reason` | text | No | Return Reason |  |
| `cancellation_type` | text | No | Cancellation Type |  |

## States

**State field:** `transaction_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `submitted` |  |  |
| `processing` |  |  |
| `completed` |  | Yes |
| `rejected` |  | Yes |
| `returned` |  | Yes |
| `cancelled` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initiated` | `submitted` | electrum |  |
|  | `submitted` | `processing` | bankservafrica |  |
|  | `processing` | `completed` | creditor_bank |  |
|  | `processing` | `rejected` | bankservafrica |  |
|  | `submitted` | `rejected` | bankservafrica |  |
|  | `completed` | `returned` | partner_system |  |
|  | `processing` | `cancelled` | partner_system |  |
|  | `initiated` | `failed` | electrum |  |
|  | `submitted` | `failed` | electrum |  |

## Rules

- **async_processing:**
  - **http_202_acknowledgement:** All outbound operations return HTTP 202 — responses are delivered asynchronously via partner API callbacks
- **authentication:**
  - **oauth2_required:** OAuth 2.0 authentication required for all API operations
- **idempotency:**
  - **duplicate_handling:** Idempotent processing for retries — duplicate requests return HTTP 409 Conflict with original error echoed
- **sla_constraints:**
  - **payshap_end_to_end:** PayShap: 10 second end-to-end for proxy resolution and payment
  - **rtc_end_to_end:** RTC: 60 second end-to-end
- **uetr:**
  - **universally_unique:** UETR must be universally unique for end-to-end tracking across all participants
- **error_response:**
  - **schema:** ErrorDetail
  - **required_fields:** message (required), detail (optional)
- **identifier_determination:**
  - **payshap_only:** PayShap requires identifier determination before credit transfer — Electrum delivers report to partner's /identifiers/outbound/identifier-determination-report endpoint

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| acknowledgement | immediate |  |
| payshap_end_to_end | 10s |  |
| rtc_end_to_end | 60s |  |

## Outcomes

### Credit_transfer_initiated (Priority: 1)

**Given:**
- Partner is authenticated via OAuth 2.0
- `payment_scheme` (input) in `ZA_RTC,ZA_RPP`
- `amount_value` (input) gte `0`

**Then:**
- **call_service** target: `electrum_api.outbound_credit_transfer` — POST /transactions/outbound/credit-transfer
- **emit_event** event: `outbound.credit_transfer.initiated`
- **transition_state** field: `transaction_status` to: `initiated`

**Result:** HTTP 202 returned — credit transfer accepted for async processing

### Credit_transfer_success (Priority: 2)

**Given:**
- Outbound credit transfer was initiated
- Positive response received from scheme via creditor bank

**Then:**
- **call_service** target: `electrum_api.deliver_credit_transfer_response` — Electrum delivers response to partner's /transactions/outbound/credit-transfer-response
- **emit_event** event: `outbound.credit_transfer.response_received`
- **transition_state** field: `transaction_status` from: `processing` to: `completed`

**Result:** Credit transfer completed — partner receives positive response at callback endpoint

### Credit_transfer_rejected (Priority: 3)

**Given:**
- Outbound credit transfer was initiated
- Negative response received from scheme or creditor bank

**Then:**
- **call_service** target: `electrum_api.deliver_credit_transfer_response` — Electrum delivers rejection to partner's /transactions/outbound/credit-transfer-response
- **emit_event** event: `outbound.credit_transfer.response_received`
- **transition_state** field: `transaction_status` from: `processing` to: `rejected`

**Result:** Credit transfer rejected — partner receives negative response with reason at callback endpoint

### Bulk_credit_transfer_initiated (Priority: 4)

**Given:**
- Partner is authenticated via OAuth 2.0
- `amount_value` (input) gte `0`

**Then:**
- **call_service** target: `electrum_api.outbound_bulk_credit_transfer` — POST /transactions/outbound/bulk/credit-transfer
- **emit_event** event: `outbound.bulk_credit_transfer.initiated`
- **transition_state** field: `transaction_status` to: `initiated`

**Result:** HTTP 202 returned — bulk credit transfer accepted for async processing

### Direct_debit_initiated (Priority: 5)

**Given:**
- Partner is authenticated via OAuth 2.0
- `mandate_reference` (input) exists
- `amount_value` (input) gte `0`

**Then:**
- **call_service** target: `electrum_api.outbound_direct_debit` — POST /transactions/outbound/direct-debit
- **emit_event** event: `outbound.direct_debit.initiated`
- **transition_state** field: `transaction_status` to: `initiated`

**Result:** HTTP 202 returned — direct debit accepted for async processing

### Payment_return_initiated (Priority: 6)

**Given:**
- Partner is authenticated via OAuth 2.0
- `return_reason` (input) exists
- Original inbound payment exists and is eligible for return

**Then:**
- **call_service** target: `electrum_api.outbound_payment_return` — POST /transactions/outbound/payment-return
- **emit_event** event: `outbound.payment_return.initiated`
- **transition_state** field: `transaction_status` to: `initiated`

**Result:** HTTP 202 returned — payment return accepted for async processing

### Payment_cancellation_initiated (Priority: 7)

**Given:**
- Partner is authenticated via OAuth 2.0
- `cancellation_type` (input) exists
- Prior payment instruction exists and is eligible for cancellation

**Then:**
- **call_service** target: `electrum_api.outbound_payment_cancellation` — POST /transactions/outbound/payment-cancellation
- **emit_event** event: `outbound.payment_cancellation.initiated`
- **transition_state** field: `transaction_status` to: `initiated`

**Result:** HTTP 202 returned — cancellation request accepted; resolution delivered to partner's inbound cancellation resolution endpoint

### Status_query_sent (Priority: 8)

**Given:**
- Partner is authenticated via OAuth 2.0
- `uetr` (input) exists

**Then:**
- **call_service** target: `electrum_api.outbound_status_request` — POST /transactions/outbound/credit-transfer/status-request or /transactions/outbound/bulk/credit-transfer/status-request
- **emit_event** event: `outbound.status_request.sent`

**Result:** Status request sent — current transaction state returned

### Outbound_technical_error (Priority: 9) — Error: `OUTBOUND_SERVER_ERROR`

**Given:**
- Outbound request was initiated
- Technical error occurs during Electrum processing

**Then:**
- **emit_event** event: `outbound.credit_transfer.response_received`
- **transition_state** field: `transaction_status` from: `initiated` to: `failed`

**Result:** Technical error — partner receives error response via callback with ErrorDetail schema

### Outbound_duplicate_request (Priority: 10) — Error: `OUTBOUND_CONFLICT`

**Given:**
- Partner sends an outbound request
- Request is a duplicate of a previously processed request

**Then:**
- **set_field** target: `http_status` value: `409`

**Result:** HTTP 409 Conflict returned — original error echoed in response body

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OUTBOUND_BAD_REQUEST` | 400 | Invalid request payload or missing required fields | No |
| `OUTBOUND_UNAUTHORIZED` | 401 | OAuth 2.0 authentication failed or token expired | No |
| `OUTBOUND_FORBIDDEN` | 403 | Insufficient permissions for the requested operation | No |
| `OUTBOUND_NOT_FOUND` | 404 | Requested resource or transaction not found | No |
| `OUTBOUND_METHOD_NOT_ALLOWED` | 400 | HTTP method not allowed for this endpoint | No |
| `OUTBOUND_CONFLICT` | 409 | Duplicate request detected — original error echoed in response | No |
| `OUTBOUND_UNPROCESSABLE` | 422 | Request is syntactically valid but cannot be processed | No |
| `OUTBOUND_RATE_LIMITED` | 429 | Rate limit exceeded — retry after backoff | No |
| `OUTBOUND_SERVER_ERROR` | 500 | Internal server error on Electrum platform | No |
| `OUTBOUND_SERVICE_UNAVAILABLE` | 500 | Electrum service temporarily unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `outbound.credit_transfer.initiated` |  | `uetr`, `end_to_end_identification`, `transaction_reference`, `payment_scheme`, `amount_value`, `amount_currency` |
| `outbound.credit_transfer.response_received` |  | `uetr`, `end_to_end_identification`, `transaction_status` |
| `outbound.bulk_credit_transfer.initiated` |  | `uetr`, `transaction_reference`, `payment_scheme`, `amount_value` |
| `outbound.bulk_credit_transfer.response_received` |  | `uetr`, `transaction_status` |
| `outbound.direct_debit.initiated` |  | `uetr`, `end_to_end_identification`, `mandate_reference`, `amount_value` |
| `outbound.direct_debit.response_received` |  | `uetr`, `transaction_status` |
| `outbound.payment_return.initiated` |  | `uetr`, `end_to_end_identification`, `return_reason`, `amount_value` |
| `outbound.payment_cancellation.initiated` |  | `uetr`, `end_to_end_identification`, `cancellation_type` |
| `outbound.status_request.sent` |  | `uetr`, `end_to_end_identification` |
| `outbound.identifier.report_received` |  | `uetr`, `end_to_end_identification` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| chp-inbound-payments | recommended | Inbound payment processing — receiving payments from the national payment system |
| chp-request-to-pay | optional | Request-to-pay operations via PayShap |
| chp-eft | recommended | EFT-specific payment operations |
| chp-account-management | recommended | Account verification and management for CHP participants |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://example.com/path/payments/api/v1
  auth: OAuth 2.0
  content_type: application/json
  openapi_spec: https://docs.electrumsoftware.com/_spec/openapi/elpapi/elpapi.json
  endpoints:
    credit_transfer: POST /transactions/outbound/credit-transfer
    credit_transfer_response_callback: POST /transactions/outbound/credit-transfer-response
    fi_to_fi_credit_transfer: POST /transactions/outbound/fi-to-fi-credit-transfer
    fi_to_fi_credit_transfer_response_callback: POST /transactions/outbound/fi-to-fi-credit-transfer-response
    bulk_credit_transfer: POST /transactions/outbound/bulk/credit-transfer
    bulk_credit_transfer_response_callback: POST /transactions/outbound/bulk/credit-transfer-response
    direct_debit: POST /transactions/outbound/direct-debit
    direct_debit_response_callback: POST /transactions/outbound/direct-debit-response
    payment_return: POST /transactions/outbound/payment-return
    payment_return_response_callback: POST /transactions/outbound/payment-return-response
    payment_cancellation: POST /transactions/outbound/payment-cancellation
    credit_transfer_status: POST /transactions/outbound/credit-transfer/status-request
    bulk_credit_transfer_status: POST /transactions/outbound/bulk/credit-transfer/status-request
    identifier_determination_callback: POST /identifiers/outbound/identifier-determination-report
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Chp Outbound Payments Blueprint",
  "description": "Electrum Clearing House Payments — outbound payment operations including RTC, PayShap, CBPR+, EFT credit transfers, bulk payments, direct debits, returns, and c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "payments, clearing-house, rtc, payshap, cbpr-plus, eft, outbound, south-africa, bankservafrica, electrum"
}
</script>
