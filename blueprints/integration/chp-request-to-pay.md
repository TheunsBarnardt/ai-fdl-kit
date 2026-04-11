<!-- AUTO-GENERATED FROM chp-request-to-pay.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Clearing House Request To Pay

> Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing

**Category:** Integration · **Version:** 1.0.0 · **Tags:** rtp · request-to-pay · refund · payments · clearing-house

## What this does

Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **uetr** *(token, required)* — UETR
- **end_to_end_identification** *(text, required)* — End-to-End Identification
- **creditor_account_number** *(text, required)* — Creditor Account Number
- **debtor_party_name** *(text, required)* — Debtor Party Name
- **debtor_party_identification** *(text, optional)* — Debtor Party Identification
- **amount_value** *(number, optional)* — Amount Value
- **amount_currency** *(text, required)* — Amount Currency
- **amount_range_min** *(number, optional)* — Amount Range Minimum
- **amount_range_max** *(number, optional)* — Amount Range Maximum
- **expiry_date_time** *(datetime, optional)* — Expiry Date/Time
- **remittance_information** *(text, optional)* — Remittance Information
- **rtp_status** *(select, optional)* — RTP Status
- **cancellation_reason** *(text, optional)* — Cancellation Reason
- **refund_amount** *(number, optional)* — Refund Amount

## What must be true

- **scheme → payshap_only:** Only the ZA_RPP (PayShap) scheme is supported for RTP
- **scheme → async_model:** All RTP processing is asynchronous — requests and responses travel on separate HTTP calls
- **scheme → end_to_end_time_limit:** PayShap mandates a 10-second end-to-end time limit for message processing
- **amount → exact_or_range:** An RTP can specify either an exact amount (amount_value) or an amount range (amount_range_min / amount_range_max), not both
- **amount → currency_required:** amount_currency is always required (ISO 4217)
- **cancellation → already_paid:** Cancellation may fail if the debtor has already paid — status ALREADY_PAID returned
- **cancellation → before_expiry:** Cancellations are only meaningful before the RTP expires
- **refund → original_amount_default:** If refund_amount is omitted, the original transaction amount is used
- **refund → original_debtor_default:** If debtor details are omitted, the creditor of the original transaction becomes the debtor of the refund
- **refund → prior_transaction_required:** A refund must reference a prior successful financial transaction
- **expiry → configurable:** RTP expiry is configurable via the expiryDateTime field (ISO 8601)

## Success & failure scenarios

**✅ Success paths**

- **Outbound Rtp Initiated** — when Partner system is authenticated; UETR is provided; Creditor account number is provided; Currency code is provided, then Outbound RTP submitted to Electrum and forwarded to debtor bank via PayShap.
- **Outbound Rtp Paid** — when RTP is currently in presented state; Debtor authorises and completes payment, then Debtor paid the RTP — response delivered to partner via callback.
- **Outbound Rtp Rejected** — when RTP is currently in presented state; Debtor rejects the request to pay, then Debtor rejected the RTP — response delivered to partner via callback.
- **Outbound Rtp Expired** — when RTP is currently in presented state; RTP expiry time has passed, then RTP expired without a response from the debtor.
- **Inbound Rtp Received** — when Electrum delivers inbound RTP from another institution; UETR is provided in the inbound message; Debtor party name is provided, then Inbound RTP delivered to partner for processing — partner responds via callback.
- **Rtp Cancellation Success** — when RTP is in presented state and eligible for cancellation; Cancellation request submitted before payment, then RTP cancellation succeeded — transaction marked as cancelled.
- **Rtp Cancellation Already Paid** — when RTP has already been paid; Cancellation request submitted after payment, then Cancellation failed — debtor has already paid the RTP (status ALREADY_PAID).
- **Refund Initiated** — when Partner system is authenticated; A prior successful financial transaction exists for the given reference; UETR referencing the original transaction is provided, then Refund initiated against a prior successful transaction — uses original amount and creditor as debtor if not specified.
- **Refund Completed** — when Refund initiation was submitted; Refund successfully processed by the scheme, then Refund completed — response delivered to partner via callback.

## Business flows

**Outbound Rtp** — Partner initiates a request-to-pay to a debtor via PayShap

1. **POST to Electrum /transactions/outbound/request-to-pay with RTP details** *(partner_system)*
1. **Validate and forward RTP through PayShap (ZA_RPP) scheme** *(electrum)*
1. **Route RTP to debtor bank** *(bankservafrica)*
1. **Present RTP to debtor for authorisation** *(debtor_bank)*
1. **POST response to partner's /transactions/outbound/request-to-pay-response** *(electrum)*

**Inbound Rtp** — Electrum delivers an inbound RTP from another institution to the partner

1. **POST to partner's /transactions/inbound/request-to-pay** *(electrum)*
1. **Process inbound RTP and determine response** *(partner_system)*
1. **POST response to Electrum /transactions/inbound/request-to-pay-response** *(partner_system)*

**Outbound Cancellation** — Partner cancels a previously initiated outbound RTP

1. **POST to Electrum /transactions/outbound/request-to-pay/cancellation-request** *(partner_system)*
1. **Forward cancellation through PayShap scheme** *(electrum)*
1. **POST cancellation response to partner's callback endpoint** *(electrum)*

**Inbound Cancellation** — Electrum delivers a cancellation request for an inbound RTP

1. **POST to partner's /transactions/inbound/request-to-pay/cancellation-request** *(electrum)*
1. **Process cancellation and respond** *(partner_system)*

**Inbound Status Request** — Electrum requests the status of an inbound RTP from the partner

1. **POST to partner's /transactions/inbound/request-to-pay/status-request** *(electrum)*
1. **Return current RTP status** *(partner_system)*

**Refund** — Partner initiates a refund for a prior successful transaction

1. **POST to Electrum /transactions/outbound/refund-initiation** *(partner_system)*
1. **Process refund through PayShap scheme** *(electrum)*
1. **POST refund response to partner's /transactions/outbound/refund-initiation-response** *(electrum)*

## Errors it can return

- `RTP_BAD_REQUEST` — The request body is malformed or missing required fields
- `RTP_UNAUTHORIZED` — Authentication credentials are missing or invalid
- `RTP_FORBIDDEN` — The caller does not have permission to perform this operation
- `RTP_NOT_FOUND` — The requested RTP transaction was not found
- `RTP_UNPROCESSABLE` — The request is well-formed but contains semantic errors
- `RTP_RATE_LIMITED` — Too many requests — rate limit exceeded
- `RTP_SERVER_ERROR` — An unexpected error occurred on the server
- `RTP_SERVICE_UNAVAILABLE` — The service is temporarily unavailable

## Connects to

- **chp-inbound-payments** *(required)* — RTP payments result in inbound credit transfers
- **chp-outbound-payments** *(required)* — RTP responses delivered via outbound callbacks
- **chp-account-management** *(recommended)* — Proxy resolution for PayShap addressing

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/clearing-house-request-to-pay/) · **Spec source:** [`clearing-house-request-to-pay.blueprint.yaml`](./clearing-house-request-to-pay.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
