<!-- AUTO-GENERATED FROM chp-account-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Clearing House Account Management

> Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification

**Category:** Integration · **Version:** 1.0.0 · **Tags:** clearing-house · proxy · account-verification · cdv · account-mirror · payments

## What this does

Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_number** *(text, required)* — Account Number
- **account_name** *(text, optional)* — Account Name
- **account_currency** *(text, optional)* — Account Currency
- **account_type** *(select, optional)* — Account Type
- **account_status** *(select, optional)* — Account Status
- **proxy_type** *(select, optional)* — Proxy Type
- **proxy_value** *(text, required)* — Proxy Value
- **proxy_namespace** *(text, optional)* — Proxy Namespace
- **owner_legal_name** *(text, optional)* — Owner Legal Name
- **owner_known_as_name** *(text, optional)* — Owner Known-As Name
- **owner_type** *(select, optional)* — Owner Type
- **owner_identification** *(text, optional)* — Owner Identification Number
- **owner_identification_scheme** *(select, optional)* — Owner Identification Scheme
- **bank_code** *(text, optional)* — Bank Code
- **branch_code** *(text, optional)* — Branch Code
- **record_identifier** *(text, optional)* — Record Identifier
- **iban** *(text, optional)* — IBAN
- **bicfi** *(text, optional)* — BIC/SWIFT Code

## What must be true

- **account_mirror → use_case_a:** Platform as Secondary Store — partner manages proxies, platform mirrors for faster routing
- **account_mirror → use_case_b:** Platform as Primary Store — platform manages proxies, partner mirrors for local resolution
- **account_mirror → use_case_c:** No Platform Mirror — partner handles all proxy and account resolution directly
- **account_mirror → use_case_d:** Platform as Account Mirror — for select institutions
- **account_mirror → sync_required:** Account mirror must be kept synchronized with partner's master data
- **account_mirror → update_schemas:** Updates sent via AccountUpdateRequest and AccountAdditionalIdUpdateRequest schemas
- **payshap_proxy → uniqueness:** One proxy maps to exactly one account — duplicate registrations are rejected
- **payshap_proxy → resolution_mandatory:** Proxy resolution is mandatory for inbound digital payments
- **payshap_proxy → identifier_determination_inbound:** POST /identifiers/inbound/identifier-determination
- **payshap_proxy → identifier_determination_outbound:** POST /identifiers/outbound/identifier-determination-report
- **avsr:** Real-Time Account Verification Service — confirms account can receive funds
- **avsr → outbound:** Partner sends verification request to platform
- **avsr → inbound:** Platform sends verification request to partner
- **avsr → time_limit:** Verification responses must be returned within scheme time limits
- **cdv:** Check Digit Verification for bank accounts
- **cdv → validation_required:** Account numbers must pass check digit validation before payment initiation
- **account_types → standard:** Account types follow clearing house standards: OTHER, CURRENT, SAVINGS, TRANSMISSION, BOND, SUBSCRIPTION_SHARE
- **identification → person_codes:** PersonIdentificationCode enum: ARNU, CCPT, CUST, DRLC, EMPL, NIDN, SOSE, TELE, TXID, POID
- **identification → organisation_codes:** OrganisationIdentificationCode enum: BANK, CBID, CHID, CINC, COID, and others per ISO 20022
- **identification → address_types:** Supported address types: ADDR, PBOX, HOME, BIZZ, MLTO, DLVY

## Success & failure scenarios

**✅ Success paths**

- **Proxy Resolved** — when A proxy identifier is provided in the request; Proxy type is a valid identifier type, then Proxy resolved to bank account — routing information returned for payment processing.
- **Proxy Registered** — when Proxy identifier provided for registration; Target account number provided; Proxy is not already registered to another account, then New proxy registered — identifier now maps to the specified bank account.
- **Proxy Deregistered** — when Proxy identifier provided for deregistration; Proxy mapping exists in the registry, then Proxy deregistered — identifier no longer maps to any account.
- **Account Mirror Updated** — when Account number provided in update request; Account is in an updatable state, then Account data synchronized to platform mirror — routing information up to date.
- **Account Mirror Deleted** — when Account number provided for deletion; Account currently exists in the mirror, then Account removed from platform mirror — no longer available for routing.
- **Avsr Verification Success** — when Account number provided for verification; Target bank identified by clearing system member ID, then Account verified — confirmed to exist and able to receive funds.
- **Cdv Validation Passed** — when Account number provided for CDV check; Branch code provided for check digit algorithm selection, then Account number passes CDV — format and check digits are valid.

**❌ Failure paths**

- **Proxy Not Found** — when A proxy identifier is provided; No account mapping exists for the given proxy, then Proxy resolution failed — no account found for the given identifier. *(error: `PROXY_NOT_FOUND`)*
- **Proxy Already Registered** — when Proxy identifier provided for registration; Proxy is already registered to another account, then Proxy registration rejected — identifier is already mapped to another account. *(error: `PROXY_ALREADY_REGISTERED`)*
- **Avsr Verification Failed** — when Account number provided for verification; AVS-R response indicates account cannot receive funds, then Account verification failed — account does not exist or cannot receive funds. *(error: `AVS_VERIFICATION_FAILED`)*
- **Cdv Validation Failed** — when Account number provided for CDV check; Account number fails check digit algorithm validation, then Account number fails CDV — invalid format or check digits. *(error: `CDV_VALIDATION_FAILED`)*

## Errors it can return

- `ACCOUNT_BAD_REQUEST` — Invalid account request — check required fields and formats
- `ACCOUNT_UNAUTHORIZED` — Authentication failed — invalid or missing credentials
- `ACCOUNT_NOT_FOUND` — Account not found in the system
- `ACCOUNT_CONFLICT` — Account conflict — duplicate proxy registration or record collision
- `ACCOUNT_UNPROCESSABLE` — Account request could not be processed — validation errors
- `CDV_VALIDATION_FAILED` — Account number failed check digit verification
- `PROXY_NOT_FOUND` — No account found for the given proxy
- `PROXY_ALREADY_REGISTERED` — Proxy is already registered to another account
- `AVS_VERIFICATION_FAILED` — Account verification failed

## Connects to

- **chp-inbound-payments** *(required)* — Account validation and proxy resolution required for inbound routing
- **chp-outbound-payments** *(required)* — CDV validation before outbound payments
- **chp-request-to-pay** *(recommended)* — Proxy resolution for request-to-pay addressing
- **chp-eft** *(recommended)* — Account validation for EFT transactions

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/clearing-house-account-management/) · **Spec source:** [`clearing-house-account-management.blueprint.yaml`](./clearing-house-account-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
