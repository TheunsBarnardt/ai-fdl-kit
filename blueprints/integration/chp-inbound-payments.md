<!-- AUTO-GENERATED FROM chp-inbound-payments.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Clearing House Inbound Payments

> Clearing house inbound payment processing — receiving credit transfers and direct debits from the national payment system

**Category:** Integration · **Version:** 1.0.0 · **Tags:** payments · clearing-house · inbound · credit-transfer · direct-debit · real-time · api

## What this does

Clearing house inbound payment processing — receiving credit transfers and direct debits from the national payment system

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **uetr** *(token, required)* — Universal End-to-End Transaction Reference
- **end_to_end_identification** *(text, required)* — End-to-End Identification
- **transaction_identification** *(text, optional)* — Transaction Identification
- **instruction_identification** *(text, optional)* — Instruction Identification
- **message_identification** *(text, required)* — Message Identification
- **creation_date_time** *(datetime, required)* — Creation Date/Time
- **bank_settlement_amount_value** *(number, required)* — Settlement Amount
- **bank_settlement_amount_currency** *(text, required)* — Settlement Currency
- **settlement_date** *(date, optional)* — Settlement Date
- **creditor_account_number** *(text, required)* — Creditor Account Number
- **creditor_account_proxy** *(text, optional)* — Creditor Account Proxy
- **creditor_legal_name** *(text, optional)* — Creditor Legal Name
- **debtor_account_number** *(text, optional)* — Debtor Account Number
- **debtor_legal_name** *(text, optional)* — Debtor Legal Name
- **payment_scheme** *(select, required)* — Payment Scheme
- **remittance_information** *(text, optional)* — Remittance Information
- **transaction_status** *(select, optional)* — Transaction Status
- **status_reason** *(text, optional)* — Status Reason

## What must be true

- **acknowledgement → max_response_time:** 1s
- **acknowledgement → requirement:** All HTTP requests from platform must be acknowledged within 1 second
- **acknowledgement → async_model:** Acknowledge with HTTP 202, process asynchronously, then POST result back to platform
- **timing → payshap_proxy_resolution:** 10s end-to-end
- **timing → payshap_payment_completion:** 10s end-to-end
- **timing → rtc_payment_completion:** 60s end-to-end
- **idempotency → requirement:** Processing must be idempotent — duplicate requests identified by uetr must not affect the outcome
- **authentication → method:** OAuth 2.0
- **authentication → requirement:** OAuth credentials required for all API interactions between partner and platform
- **error_handling → technical_errors:** Respond with 4xx/5xx HTTP status and ErrorDetail payload (message required, detail optional)
- **error_handling → negative_outcomes:** Negative business outcomes (e.g. rejected authorisation) are distinct from technical errors
- **error_handling → error_detail_format:** ErrorDetail object with required 'message' field and optional 'detail' field
- **account_validation → account_mirroring:** If partner uses Electrum account mirroring, Electrum validates accounts before forwarding
- **account_validation → proxy_management:** If partner uses Electrum proxy management, Electrum resolves PayShap proxies before forwarding
- **inbound_rtc_payshap → step_1_proxy:** PayShap only — Electrum sends POST /identifiers/inbound/identifier-determination to partner
- **inbound_rtc_payshap → step_2_authorisation:** Electrum sends credit transfer authorisation to partner (async or sync endpoint)
- **inbound_rtc_payshap → step_2_async_endpoint:** POST /transactions/inbound/credit-transfer-authorisation
- **inbound_rtc_payshap → step_2_sync_endpoint:** POST /transactions/inbound/credit-transfer-authorisation-sync
- **inbound_rtc_payshap → step_3_response:** Partner responds with POST to Electrum /transactions/inbound/credit-transfer-authorisation-response
- **inbound_rtc_payshap → step_4_completion:** Electrum sends POST /transactions/inbound/credit-transfer-completion to partner
- **inbound_eft → credit_transfer:** Electrum sends POST /transactions/inbound/credit-transfer — immediate financial impact
- **inbound_eft → credit_transfer_response:** Partner responds with POST to Electrum /transactions/inbound/credit-transfer-response
- **inbound_direct_debit → direct_debit:** Electrum sends POST /transactions/inbound/direct-debit
- **inbound_direct_debit → direct_debit_response:** Partner responds with POST to Electrum /transactions/inbound/direct-debit-response

## Success & failure scenarios

**✅ Success paths**

- **Identifier Determination Received** — when Payment scheme is PayShap; Proxy identifier is present in the request, then Proxy resolved to creditor account — Electrum proceeds with authorisation.
- **Credit Transfer Authorisation Received** — when Payment scheme is RTC or PayShap; Universal end-to-end transaction reference is present; Settlement amount is non-negative, then Authorisation request acknowledged with HTTP 202 — partner begins processing.
- **Credit Transfer Authorisation Approved** — when Transaction is currently being processed; Partner validates creditor account and approves the transfer, then Credit transfer authorisation approved — awaiting completion from Electrum.
- **Credit Transfer Authorisation Rejected** — when Transaction is currently being processed; Partner determines the transfer cannot be approved (invalid account, compliance, etc.), then Credit transfer authorisation rejected — reason provided in response.
- **Credit Transfer Completion Received** — when Transaction was previously approved; Completion references a known transaction, then Credit transfer completed — funds are settled and payment is final.
- **Eft Credit Transfer Received** — when Payment scheme is EFT; Universal end-to-end transaction reference is present; Settlement amount is non-negative, then EFT credit transfer received and applied — immediate financial impact.
- **Eft Direct Debit Received** — when Payment scheme is EFT; Debtor account to be debited is specified; Debit amount is positive, then EFT direct debit request received — partner processes debit against debtor account.

**❌ Failure paths**

- **Inbound Timeout** — when Transaction is in processing state; Partner fails to acknowledge the request within 1 second, then Acknowledgement timeout — Electrum may treat as negative response. *(error: `INBOUND_TIMEOUT`)*
- **Inbound Technical Error** — when Transaction is in processing state; Technical error occurs during payment processing, then Technical error — respond with appropriate HTTP status and ErrorDetail payload. *(error: `INBOUND_SERVER_ERROR`)*

## Errors it can return

- `INBOUND_BAD_REQUEST` — Malformed request payload
- `INBOUND_UNAUTHORIZED` — Invalid OAuth credentials
- `INBOUND_FORBIDDEN` — Insufficient permissions for the requested operation
- `INBOUND_NOT_FOUND` — Transaction or resource not found
- `INBOUND_UNPROCESSABLE` — Validation error in request data
- `INBOUND_RATE_LIMITED` — Too many requests — rate limit exceeded
- `INBOUND_SERVER_ERROR` — Internal processing error
- `INBOUND_SERVICE_UNAVAILABLE` — Service temporarily unavailable
- `INBOUND_TIMEOUT` — Acknowledgement not received within 1 second

## Connects to

- **chp-outbound-payments** *(recommended)* — Outbound payment responses are delivered via partner API callbacks
- **chp-request-to-pay** *(optional)* — Inbound RTP requests use similar patterns
- **chp-eft** *(recommended)* — EFT credit transfers and direct debits share this inbound flow
- **chp-account-management** *(recommended)* — Account mirror and proxy management affect inbound routing

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/clearing-house-inbound-payments/) · **Spec source:** [`clearing-house-inbound-payments.blueprint.yaml`](./clearing-house-inbound-payments.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
