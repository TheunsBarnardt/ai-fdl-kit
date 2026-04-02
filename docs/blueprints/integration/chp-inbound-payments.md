---
title: "Chp Inbound Payments Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Electrum CHP inbound payment processing — receiving RTC, PayShap, and EFT credit transfers and direct debits from the national payment system. 18 fields. 9 outc"
---

# Chp Inbound Payments Blueprint

> Electrum CHP inbound payment processing — receiving RTC, PayShap, and EFT credit transfers and direct debits from the national payment system

| | |
|---|---|
| **Feature** | `chp-inbound-payments` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | payments, south-africa, rtc, payshap, eft, clearing-house, inbound, credit-transfer, direct-debit, real-time, api |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/chp-inbound-payments.blueprint.yaml) |
| **JSON API** | [chp-inbound-payments.json]({{ site.baseurl }}/api/blueprints/integration/chp-inbound-payments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `partner_system` | Partner System | system | The financial institution integrating with Electrum — receives and processes inbound payment requests |
| `electrum` | Electrum Platform | external | Electrum CHP platform that orchestrates inter-bank payment processing |
| `bankservafrica` | BankservAfrica | external | Scheme operator for RTC and PayShap (Rapid Payments Programme) in South Africa |
| `debtor_bank` | Debtor Bank | external | The sending/debtor financial institution initiating the payment |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `uetr` | token | Yes | Universal End-to-End Transaction Reference |  |
| `end_to_end_identification` | text | Yes | End-to-End Identification | Validations: maxLength |
| `transaction_identification` | text | No | Transaction Identification | Validations: maxLength |
| `instruction_identification` | text | No | Instruction Identification | Validations: maxLength |
| `message_identification` | text | Yes | Message Identification | Validations: maxLength |
| `creation_date_time` | datetime | Yes | Creation Date/Time |  |
| `bank_settlement_amount_value` | number | Yes | Settlement Amount | Validations: min |
| `bank_settlement_amount_currency` | text | Yes | Settlement Currency | Validations: pattern |
| `settlement_date` | date | No | Settlement Date |  |
| `creditor_account_number` | text | Yes | Creditor Account Number |  |
| `creditor_account_proxy` | text | No | Creditor Account Proxy |  |
| `creditor_legal_name` | text | No | Creditor Legal Name | Validations: maxLength |
| `debtor_account_number` | text | No | Debtor Account Number |  |
| `debtor_legal_name` | text | No | Debtor Legal Name | Validations: maxLength |
| `payment_scheme` | select | Yes | Payment Scheme |  |
| `remittance_information` | text | No | Remittance Information |  |
| `transaction_status` | select | No | Transaction Status |  |
| `status_reason` | text | No | Status Reason |  |

## States

**State field:** `transaction_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `received` | Yes |  |
| `processing` |  |  |
| `approved` |  |  |
| `rejected` |  | Yes |
| `completed` |  | Yes |
| `timed_out` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `received` | `processing` | partner_system |  |
|  | `processing` | `approved` | partner_system |  |
|  | `processing` | `rejected` | partner_system |  |
|  | `approved` | `completed` | electrum |  |
|  | `processing` | `timed_out` | electrum |  |
|  | `processing` | `failed` | partner_system |  |

## Rules

- **acknowledgement:**
  - **max_response_time:** 1s
  - **requirement:** All HTTP requests from Electrum must be acknowledged within 1 second
  - **async_model:** Acknowledge with HTTP 202, process asynchronously, then POST result back to Electrum
- **timing:**
  - **payshap_proxy_resolution:** 10s end-to-end
  - **payshap_payment_completion:** 10s end-to-end
  - **rtc_payment_completion:** 60s end-to-end
- **idempotency:**
  - **requirement:** Processing must be idempotent — duplicate requests identified by uetr must not affect the outcome
- **authentication:**
  - **method:** OAuth 2.0
  - **requirement:** OAuth credentials required for all API interactions between partner and Electrum
- **error_handling:**
  - **technical_errors:** Respond with 4xx/5xx HTTP status and ErrorDetail payload (message required, detail optional)
  - **negative_outcomes:** Negative business outcomes (e.g. rejected authorisation) are distinct from technical errors
  - **error_detail_format:** ErrorDetail object with required 'message' field and optional 'detail' field
- **account_validation:**
  - **account_mirroring:** If partner uses Electrum account mirroring, Electrum validates accounts before forwarding
  - **proxy_management:** If partner uses Electrum proxy management, Electrum resolves PayShap proxies before forwarding
- **inbound_rtc_payshap:**
  - **step_1_proxy:** PayShap only — Electrum sends POST /identifiers/inbound/identifier-determination to partner
  - **step_2_authorisation:** Electrum sends credit transfer authorisation to partner (async or sync endpoint)
  - **step_2_async_endpoint:** POST /transactions/inbound/credit-transfer-authorisation
  - **step_2_sync_endpoint:** POST /transactions/inbound/credit-transfer-authorisation-sync
  - **step_3_response:** Partner responds with POST to Electrum /transactions/inbound/credit-transfer-authorisation-response
  - **step_4_completion:** Electrum sends POST /transactions/inbound/credit-transfer-completion to partner
- **inbound_eft:**
  - **credit_transfer:** Electrum sends POST /transactions/inbound/credit-transfer — immediate financial impact
  - **credit_transfer_response:** Partner responds with POST to Electrum /transactions/inbound/credit-transfer-response
- **inbound_direct_debit:**
  - **direct_debit:** Electrum sends POST /transactions/inbound/direct-debit
  - **direct_debit_response:** Partner responds with POST to Electrum /transactions/inbound/direct-debit-response

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| acknowledgement | 1s | Electrum treats timeout as negative outcome |
| payshap_proxy_resolution | 10s | Transaction times out at scheme level |
| payshap_payment | 10s | Transaction times out at scheme level |
| rtc_payment | 60s | Transaction times out at scheme level |

## Outcomes

### Identifier_determination_received (Priority: 1)

**Given:**
- `payment_scheme` (input) eq `ZA_RPP`
- `creditor_account_proxy` (input) exists

**Then:**
- **call_service** target: `partner_api.resolve_proxy` — Resolve PayShap proxy to creditor account number
- **set_field** target: `creditor_account_number` value: `resolved_account`
- **emit_event** event: `inbound.identifier.determination_received`

**Result:** Proxy resolved to creditor account — Electrum proceeds with authorisation

### Credit_transfer_authorisation_received (Priority: 2)

**Given:**
- `payment_scheme` (input) in `ZA_RTC,ZA_RPP`
- `uetr` (input) exists
- `bank_settlement_amount_value` (input) gte `0`

**Then:**
- **transition_state** field: `transaction_status` from: `received` to: `processing`
- **emit_event** event: `inbound.credit_transfer.authorisation_received`

**Result:** Authorisation request acknowledged with HTTP 202 — partner begins processing

### Credit_transfer_authorisation_approved (Priority: 3)

**Given:**
- `transaction_status` (db) eq `processing`
- Partner validates creditor account and approves the transfer

**Then:**
- **transition_state** field: `transaction_status` from: `processing` to: `approved`
- **call_service** target: `electrum_api.authorisation_response` — POST authorisation response with APPROVED status to Electrum
- **emit_event** event: `inbound.credit_transfer.authorisation_responded`

**Result:** Credit transfer authorisation approved — awaiting completion from Electrum

### Credit_transfer_authorisation_rejected (Priority: 4)

**Given:**
- `transaction_status` (db) eq `processing`
- Partner determines the transfer cannot be approved (invalid account, compliance, etc.)

**Then:**
- **transition_state** field: `transaction_status` from: `processing` to: `rejected`
- **call_service** target: `electrum_api.authorisation_response` — POST authorisation response with REJECTED status and reason to Electrum
- **emit_event** event: `inbound.credit_transfer.authorisation_responded`

**Result:** Credit transfer authorisation rejected — reason provided in response

### Credit_transfer_completion_received (Priority: 5)

**Given:**
- `transaction_status` (db) eq `approved`
- `uetr` (input) exists

**Then:**
- **transition_state** field: `transaction_status` from: `approved` to: `completed`
- **emit_event** event: `inbound.credit_transfer.completed`

**Result:** Credit transfer completed — funds are settled and payment is final

### Eft_credit_transfer_received (Priority: 6)

**Given:**
- `payment_scheme` (input) eq `ZA_EFT`
- `uetr` (input) exists
- `bank_settlement_amount_value` (input) gte `0`

**Then:**
- **transition_state** field: `transaction_status` from: `received` to: `completed`
- **emit_event** event: `inbound.credit_transfer.received`

**Result:** EFT credit transfer received and applied — immediate financial impact

### Eft_direct_debit_received (Priority: 7)

**Given:**
- `payment_scheme` (input) eq `ZA_EFT`
- `debtor_account_number` (input) exists
- `bank_settlement_amount_value` (input) gt `0`

**Then:**
- **transition_state** field: `transaction_status` from: `received` to: `processing`
- **emit_event** event: `inbound.direct_debit.received`

**Result:** EFT direct debit request received — partner processes debit against debtor account

### Inbound_timeout (Priority: 8) — Error: `INBOUND_TIMEOUT`

**Given:**
- `transaction_status` (db) eq `processing`
- Partner fails to acknowledge the request within 1 second

**Then:**
- **transition_state** field: `transaction_status` from: `processing` to: `timed_out`

**Result:** Acknowledgement timeout — Electrum may treat as negative response

### Inbound_technical_error (Priority: 9) — Error: `INBOUND_SERVER_ERROR`

**Given:**
- `transaction_status` (db) eq `processing`
- Technical error occurs during payment processing

**Then:**
- **transition_state** field: `transaction_status` from: `processing` to: `failed`

**Result:** Technical error — respond with appropriate HTTP status and ErrorDetail payload

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INBOUND_BAD_REQUEST` | 400 | Malformed request payload | No |
| `INBOUND_UNAUTHORIZED` | 401 | Invalid OAuth credentials | No |
| `INBOUND_FORBIDDEN` | 403 | Insufficient permissions for the requested operation | No |
| `INBOUND_NOT_FOUND` | 404 | Transaction or resource not found | No |
| `INBOUND_UNPROCESSABLE` | 422 | Validation error in request data | No |
| `INBOUND_RATE_LIMITED` | 429 | Too many requests — rate limit exceeded | No |
| `INBOUND_SERVER_ERROR` | 500 | Internal processing error | No |
| `INBOUND_SERVICE_UNAVAILABLE` | 500 | Service temporarily unavailable | No |
| `INBOUND_TIMEOUT` | 429 | Acknowledgement not received within 1 second | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inbound.credit_transfer.authorisation_received` | PayShap/RTC credit transfer authorisation request received from Electrum | `uetr`, `end_to_end_identification`, `message_identification`, `payment_scheme`, `bank_settlement_amount_value`, `bank_settlement_amount_currency` |
| `inbound.credit_transfer.authorisation_responded` | Partner sent credit transfer authorisation response back to Electrum | `uetr`, `transaction_status`, `status_reason` |
| `inbound.credit_transfer.completed` | Credit transfer completion notification received from Electrum — payment is final | `uetr`, `end_to_end_identification`, `settlement_date` |
| `inbound.credit_transfer.received` | EFT credit transfer received from Electrum — immediate financial impact | `uetr`, `end_to_end_identification`, `bank_settlement_amount_value`, `bank_settlement_amount_currency` |
| `inbound.direct_debit.received` | EFT direct debit request received from Electrum | `uetr`, `end_to_end_identification`, `bank_settlement_amount_value`, `debtor_account_number` |
| `inbound.identifier.determination_received` | PayShap proxy resolution request received — resolve proxy to account number | `creditor_account_proxy`, `payment_scheme` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| chp-outbound-payments | recommended | Outbound payment responses are delivered via partner API callbacks |
| chp-request-to-pay | optional | Inbound RTP requests use similar patterns |
| chp-eft | recommended | EFT credit transfers and direct debits share this inbound flow |
| chp-account-management | recommended | Account mirror and proxy management affect inbound routing |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://example.com/path/payments/partner-api/v1
  auth: OAuth 2.0
  content_type: application/json
  openapi_spec: https://docs.electrumsoftware.com/_spec/openapi/elpapi/elpapi-partner.json
  partner_endpoints:
    identifier_determination: POST /identifiers/inbound/identifier-determination
    credit_transfer_authorisation_async: POST /transactions/inbound/credit-transfer-authorisation
    credit_transfer_authorisation_sync: POST /transactions/inbound/credit-transfer-authorisation-sync
    credit_transfer_completion: POST /transactions/inbound/credit-transfer-completion
    credit_transfer: POST /transactions/inbound/credit-transfer
    direct_debit: POST /transactions/inbound/direct-debit
  electrum_endpoints:
    credit_transfer_authorisation_response: POST /transactions/inbound/credit-transfer-authorisation-response
    credit_transfer_response: POST /transactions/inbound/credit-transfer-response
    direct_debit_response: POST /transactions/inbound/direct-debit-response
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Chp Inbound Payments Blueprint",
  "description": "Electrum CHP inbound payment processing — receiving RTC, PayShap, and EFT credit transfers and direct debits from the national payment system. 18 fields. 9 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "payments, south-africa, rtc, payshap, eft, clearing-house, inbound, credit-transfer, direct-debit, real-time, api"
}
</script>
