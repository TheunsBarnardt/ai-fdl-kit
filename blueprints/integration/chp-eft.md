<!-- AUTO-GENERATED FROM chp-eft.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Clearing House Eft

> Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system error correction

**Category:** Integration · **Version:** 1.0.0 · **Tags:** eft · payments · clearing-house · credits · debits · returns · system-error-correction

## What this does

Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system error correction

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **uetr** *(token, required)* — UETR
- **end_to_end_identification** *(text, required)* — End-to-End Identification
- **creditor_account_number** *(text, required)* — Creditor Account Number
- **debtor_account_number** *(text, required)* — Debtor Account Number
- **user_branch** *(text, required)* — User Branch
- **user_account** *(text, required)* — User Account
- **homing_branch** *(text, required)* — Homing Branch
- **homing_account** *(text, required)* — Homing Account
- **amount_value** *(number, required)* — Amount
- **amount_currency** *(text, required)* — Currency
- **payment_scheme** *(select, required)* — Payment Scheme
- **entry_class** *(select, optional)* — Entry Class
- **record_identifier** *(select, optional)* — Record Identifier
- **mandate_reference** *(text, optional)* — Mandate Reference
- **return_reason** *(text, optional)* — Return Reason
- **action_date** *(date, optional)* — Action Date
- **user_reference** *(text, required)* — User Reference

## What must be true

- **asynchronous_processing → http_202:** All EFT operations return HTTP 202 Accepted — results delivered asynchronously via callbacks
- **asynchronous_processing → acknowledgement_time:** Partner must acknowledge inbound requests within 1 second
- **idempotency → required:** All operations must be processed idempotently
- **idempotency → key:** uetr serves as the idempotency key for all EFT operations
- **settlement → batch_processing:** EFT transactions are batch-processed through clearing house — not real-time
- **settlement → action_date:** Settlement occurs on the specified action_date
- **inbound_credits → endpoint:** POST /transactions/inbound/credit-transfer
- **inbound_credits → immediate_impact:** Inbound credits have immediate financial impact on the partner's customer
- **inbound_debits → endpoint:** POST /transactions/inbound/direct-debit
- **inbound_debits → immediate_impact:** Inbound debits have immediate financial impact on the partner's customer
- **outbound_credits → endpoint:** POST /transactions/outbound/credit-transfer
- **outbound_credits → scheme:** ZA_EFT
- **outbound_debits → endpoint:** POST /transactions/outbound/direct-debit
- **outbound_debits → schemes:** ZA_EFT, ZA_AC, ZA_RMS
- **outbound_debits → mandate_required:** Direct debits require a valid mandate reference
- **on_us_debits:** Special case where debtor and creditor are at the same institution
- **on_us_debits → endpoint:** Uses same direct debit endpoints with on-us processing
- **returns → inbound_endpoint:** POST /transactions/inbound/payment-return
- **returns → outbound_endpoint:** POST /transactions/outbound/payment-return
- **returns → original_reference:** Returns must reference the original transaction
- **returns → reason_required:** A valid ReasonCode from the 24-value enum must be provided
- **cancellation → endpoint:** POST /transactions/outbound/payment-cancellation
- **cancellation → schemes:** ZA_EFT, ZA_AC
- **cancellation → resolution:** Platform delivers cancellation resolution via callback
- **sec:** System Error Correction — used to correct errors in previously submitted EFT transactions
- **sec → tracking:** SEC request and response records tracked via Events API
- **sec → sub_services:** SYSTEM_ERROR_CORRECTION, SYSTEM_ERROR_CORRECTION_RESPONSE
- **sec → original_reference:** SEC corrections require matching the original transaction
- **reason_codes:** 24-value ReasonCode enum for returns and rejections

## Success & failure scenarios

**✅ Success paths**

- **Eft Outbound Credit Initiated** — when Partner system is authenticated; Credit amount is positive; Creditor account is specified; Payment scheme is ZA_EFT for outbound credits, then Outbound EFT credit accepted (HTTP 202) — settlement result delivered via callback.
- **Eft Outbound Debit Initiated** — when Partner system is authenticated; Debit amount is positive; Debtor account is specified; Mandate reference is provided for direct debit; Payment scheme is valid for outbound debits, then Outbound EFT debit accepted (HTTP 202) — settlement result delivered via callback.
- **Eft Inbound Credit Received** — when Platform sends inbound credit notification; Creditor account at partner institution is specified; Credit amount is positive, then Inbound EFT credit processed — beneficiary account credited.
- **Eft Inbound Debit Received** — when Platform sends inbound debit notification; Debtor account at partner institution is specified; Debit amount is positive, then Inbound EFT debit processed — account holder debited.
- **Eft Outbound Return Initiated** — when Partner system is authenticated; Original transaction reference is provided; Return reason code is specified, then Outbound return accepted (HTTP 202) — returning a prior inbound transaction.
- **Eft Inbound Return Received** — when Platform sends inbound return notification; Original transaction reference is provided; Return reason code is specified, then Inbound return processed — prior outbound transaction reversed.
- **Eft Cancellation Initiated** — when Partner system is authenticated; Original transaction reference is provided; Cancellation supported for EFT and AC schemes, then Payment cancellation request accepted (HTTP 202) — resolution delivered via callback.
- **Eft Cancellation Resolved** — when Platform delivers cancellation resolution via callback; Original transaction reference is provided, then Cancellation resolution received — transaction status updated.
- **Eft Sec Initiated** — when An error is identified in a previously submitted EFT transaction; Original transaction reference is provided for correction, then SEC request submitted — correction tracked via Events API with SubService SYSTEM_ERROR_CORRECTION.

**❌ Failure paths**

- **Eft Technical Error** — when Request payload fails validation OR Referenced transaction does not exist OR Operation not permitted for the current transaction state, then EFT operation failed due to technical error — see error code for details. *(error: `EFT_UNPROCESSABLE`)*

## Errors it can return

- `EFT_BAD_REQUEST` — Request payload is invalid or missing required fields
- `EFT_UNAUTHORIZED` — Authentication failed — invalid or missing credentials
- `EFT_FORBIDDEN` — Insufficient permissions for the requested EFT operation
- `EFT_NOT_FOUND` — Referenced transaction or resource does not exist
- `EFT_CONFLICT` — Duplicate request — transaction with this uetr already exists
- `EFT_UNPROCESSABLE` — Request is well-formed but cannot be processed (invalid state, business rule violation)
- `EFT_RATE_LIMITED` — Too many requests — rate limit exceeded
- `EFT_SERVER_ERROR` — Internal server error during EFT processing
- `EFT_SERVICE_UNAVAILABLE` — EFT service temporarily unavailable

## Connects to

- **chp-inbound-payments** *(required)*
- **chp-outbound-payments** *(required)*
- **chp-account-management** *(recommended)*

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/clearing-house-eft/) · **Spec source:** [`clearing-house-eft.blueprint.yaml`](./clearing-house-eft.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
