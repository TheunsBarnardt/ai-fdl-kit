<!-- AUTO-GENERATED FROM chp-outbound-payments.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Clearing House Outbound Payments

> Clearing house outbound payment operations including credit transfers, bulk payments, direct debits, returns, and cancellations

**Category:** Integration · **Version:** 1.0.0 · **Tags:** payments · clearing-house · outbound · credit-transfer · direct-debit

## What this does

Clearing house outbound payment operations including credit transfers, bulk payments, direct debits, returns, and cancellations

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **uetr** *(token, required)* — UETR
- **end_to_end_identification** *(text, required)* — End-to-End Identification
- **transaction_reference** *(text, required)* — Transaction Reference
- **creditor_account_number** *(text, required)* — Creditor Account Number
- **creditor_account_type** *(select, optional)* — Creditor Account Type
- **creditor_bank_code** *(text, optional)* — Creditor Bank Code
- **debtor_account_number** *(text, required)* — Debtor Account Number
- **debtor_account_type** *(select, optional)* — Debtor Account Type
- **amount_value** *(number, required)* — Amount
- **amount_currency** *(text, required)* — Currency
- **payment_scheme** *(select, required)* — Payment Scheme
- **payment_information** *(text, optional)* — Payment Information
- **remittance_information** *(text, optional)* — Remittance Information
- **instruction_priority** *(text, optional)* — Instruction Priority
- **mandate_reference** *(text, optional)* — Mandate Reference
- **return_reason** *(text, optional)* — Return Reason
- **cancellation_type** *(text, optional)* — Cancellation Type

## What must be true

- **async_processing → http_202_acknowledgement:** All outbound operations return HTTP 202 — responses are delivered asynchronously via partner API callbacks
- **authentication → oauth2_required:** OAuth 2.0 authentication required for all API operations
- **idempotency → duplicate_handling:** Idempotent processing for retries — duplicate requests return HTTP 409 Conflict with original error echoed
- **sla_constraints → payshap_end_to_end:** PayShap: 10 second end-to-end for proxy resolution and payment
- **sla_constraints → rtc_end_to_end:** RTC: 60 second end-to-end
- **uetr → universally_unique:** UETR must be universally unique for end-to-end tracking across all participants
- **error_response → schema:** ErrorDetail
- **error_response → required_fields:** message (required), detail (optional)
- **identifier_determination → payshap_only:** PayShap requires identifier determination before credit transfer — Electrum delivers report to partner's /identifiers/outbound/identifier-determination-report endpoint

## Success & failure scenarios

**✅ Success paths**

- **Credit Transfer Initiated** — when Partner is authenticated via OAuth 2.0; Payment scheme is RTC or PayShap; Amount is zero or greater, then HTTP 202 returned — credit transfer accepted for async processing.
- **Credit Transfer Success** — when Outbound credit transfer was initiated; Positive response received from scheme via creditor bank, then Credit transfer completed — partner receives positive response at callback endpoint.
- **Credit Transfer Rejected** — when Outbound credit transfer was initiated; Negative response received from scheme or creditor bank, then Credit transfer rejected — partner receives negative response with reason at callback endpoint.
- **Bulk Credit Transfer Initiated** — when Partner is authenticated via OAuth 2.0; Amount is zero or greater, then HTTP 202 returned — bulk credit transfer accepted for async processing.
- **Direct Debit Initiated** — when Partner is authenticated via OAuth 2.0; Mandate reference is provided for the direct debit; Amount is zero or greater, then HTTP 202 returned — direct debit accepted for async processing.
- **Payment Return Initiated** — when Partner is authenticated via OAuth 2.0; Return reason is provided; Original inbound payment exists and is eligible for return, then HTTP 202 returned — payment return accepted for async processing.
- **Payment Cancellation Initiated** — when Partner is authenticated via OAuth 2.0; Cancellation type is specified; Prior payment instruction exists and is eligible for cancellation, then HTTP 202 returned — cancellation request accepted; resolution delivered to partner's inbound cancellation resolution endpoint.
- **Status Query Sent** — when Partner is authenticated via OAuth 2.0; UETR of the target transaction is provided, then Status request sent — current transaction state returned.

**❌ Failure paths**

- **Outbound Technical Error** — when Outbound request was initiated; Technical error occurs during Electrum processing, then Technical error — partner receives error response via callback with ErrorDetail schema. *(error: `OUTBOUND_SERVER_ERROR`)*
- **Outbound Duplicate Request** — when Partner sends an outbound request; Request is a duplicate of a previously processed request, then HTTP 409 Conflict returned — original error echoed in response body. *(error: `OUTBOUND_CONFLICT`)*

## Errors it can return

- `OUTBOUND_BAD_REQUEST` — Invalid request payload or missing required fields
- `OUTBOUND_UNAUTHORIZED` — OAuth 2.0 authentication failed or token expired
- `OUTBOUND_FORBIDDEN` — Insufficient permissions for the requested operation
- `OUTBOUND_NOT_FOUND` — Requested resource or transaction not found
- `OUTBOUND_METHOD_NOT_ALLOWED` — HTTP method not allowed for this endpoint
- `OUTBOUND_CONFLICT` — Duplicate request detected — original error echoed in response
- `OUTBOUND_UNPROCESSABLE` — Request is syntactically valid but cannot be processed
- `OUTBOUND_RATE_LIMITED` — Rate limit exceeded — retry after backoff
- `OUTBOUND_SERVER_ERROR` — Internal server error on Electrum platform
- `OUTBOUND_SERVICE_UNAVAILABLE` — Electrum service temporarily unavailable

## Connects to

- **chp-inbound-payments** *(recommended)* — Inbound payment processing — receiving payments from the national payment system
- **chp-request-to-pay** *(optional)* — Request-to-pay operations via PayShap
- **chp-eft** *(recommended)* — EFT-specific payment operations
- **chp-account-management** *(recommended)* — Account verification and management for CHP participants

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/clearing-house-outbound-payments/) · **Spec source:** [`clearing-house-outbound-payments.blueprint.yaml`](./clearing-house-outbound-payments.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
