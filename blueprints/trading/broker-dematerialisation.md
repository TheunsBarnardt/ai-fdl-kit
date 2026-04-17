<!-- AUTO-GENERATED FROM broker-dematerialisation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Dematerialisation

> Back-office conversion of paper share certificates into electronic records via a central securities depository, with lodgement, nominee-name registration, scrip register updates, proprietary and...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · dematerialisation · scrip · nominee · csd · settlement · equities

## What this does

Back-office conversion of paper share certificates into electronic records via a central securities depository, with lodgement, nominee-name registration, scrip register updates, proprietary and...

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **batch_reference** *(text, required)* — Batch Reference Number
- **issuing_company** *(text, required)* — Issuing Company
- **share_class** *(text, required)* — Share Class
- **registered_holder** *(text, required)* — Registered Holder
- **non_resident_flag** *(boolean, required)* — Non-Resident Scrip Flag
- **certificate_number** *(text, required)* — Certificate Number
- **certificate_quantity** *(number, required)* — Certificate Quantity
- **document_type** *(select, required)* — Document Type
- **client_account_code** *(text, optional)* — Client Account Code
- **proprietary_flag** *(boolean, required)* — Proprietary Scrip Flag
- **nominee_account_code** *(text, required)* — Nominee Account Code
- **scrip_location** *(select, required)* — Scrip Location Code
- **lodgement_date** *(date, required)* — Lodgement Date
- **acknowledgement_receipt** *(text, optional)* — CSD Acknowledgement Receipt
- **csd_response** *(select, optional)* — CSD Response Outcome
- **rejection_reason** *(text, optional)* — Rejection Reason
- **scrip_status** *(select, required)* — Scrip Status
- **jurisdiction** *(select, required)* — Securities Jurisdiction
- **rematerialisation_quantity** *(number, optional)* — Rematerialisation Quantity
- **registration_code** *(text, optional)* — Registration Code
- **rematerialisation_receipt** *(text, optional)* — Rematerialisation Receipt Number

## What must be true

- **batching → max_documents_per_batch:** A batch may contain no more than 100 documents of title
- **batching → single_issuer:** All scrip in a batch must be for one issuing company only
- **batching → single_share_class:** All scrip in a batch must be for one share class only
- **batching → single_holder:** All scrip in a batch must be for one registered holder only
- **batching → non_resident_segregation:** Non-resident scrip must be lodged in a separate batch from resident scrip
- **batching → acceptable_documents:** Only share certificates and balance receipts may be included in a batch
- **batching → unique_reference:** Each batch must carry a broker-assigned unique reference number
- **lodgement → covering_letter_required:** Each batch lodged with the CSD must include scrip, a printed information report, and a covering letter
- **lodgement → acknowledgement_required:** Broker must receive and retain CSD acknowledgement for each batch lodged
- **lodgement → location_transfer:** Scrip sent to CSD must be transferred to the pending dematerialisation location before acknowledgement
- **segregation → proprietary_vs_client:** Nominee account must be analysed daily into proprietary, resident-client, and non-resident-client sub-totals
- **segregation → nominee_account_reserved:** Central nominee account is reserved exclusively for dematerialised scrip
- **segregation → daily_reconciliation:** All uncertificated balances must be reconciled with the CSD on a daily basis
- **rejection → unacceptable_scrip:** Unacceptable scrip (minor technicality) is returned and must be rectified and resubmitted
- **rejection → tainted_scrip:** Tainted scrip is retained by the transfer secretary; certified copy returned; handled under trace rules
- **rejection → rejection_transfer:** Rejected scrip must be moved out of pending dematerialisation location to invalid scrip account or original account
- **risk → ownership_verification:** Broker must verify client ownership of shares before submitting for dematerialisation
- **risk → validity_responsibility:** Broker is responsible to the CSD for the validity of all scrip lodged
- **risk → right_to_refuse:** Broker has no obligation to accept scrip where validity is in doubt
- **risk → physical_risk_point:** Broker carries risk on delivery until CSD issues acknowledgement receipt
- **risk → no_pre_demat_trading:** Selling on behalf of a client before dematerialisation completes adds borrowing risk and is discouraged
- **risk → settlement_rule:** Only dematerialised securities may be used to settle listed equity trades
- **client_own_name → direct_csd_approach:** Clients wishing to dematerialise in their own name must approach a CSD participant directly and cannot route through the broker
- **jurisdictional → multi_market_support:** System must support local and regional securities (e.g. SA and Namibian listings) with market-appropriate CSD routing
- **compliance → popia_compliance:** Client scrip records contain personal information and are subject to POPIA s.19 safeguards
- **compliance → audit_trail:** All location moves, acknowledgements, and rejections logged with user, timestamp, and batch reference

## Success & failure scenarios

**✅ Success paths**

- **Lodge Valid Batch** — when document_count lte 100; issuing_company exists; share_class exists; registered_holder exists, then set scrip_location = "pending_demat"; move scrip_status lodged → pending_demat; emit demat.batch_lodged; emit demat.pending_location_updated. _Why: Operator lodges a well-formed batch with the central depository and moves scrip to the pending dematerialisation location._
- **Mark Batch Dematerialised** — when csd_response eq "ok"; scrip_status eq "pending_demat", then move scrip_status pending_demat → dematerialised; set scrip_location = "csd"; emit demat.completed; emit scrip.register_reconciled. _Why: Operator marks scrip as successfully dematerialised on confirmation from the central depository and updates the nominee account balance._
- **Daily Nominee Reconciliation** — when reconciliation_trigger eq "end_of_day", then call service; emit scrip.register_reconciled. _Why: Back-office system reconciles the nominee account daily, producing proprietary, resident-client, and non-resident-client sub-totals._
- **Rematerialise Position** — when scrip_status eq "dematerialised"; rematerialisation_quantity gt 0; registration_code exists; rematerialisation_receipt exists, then move scrip_status dematerialised → rematerialised; emit scrip.rematerialised. _Why: Operator rematerialises a dematerialised position back into a paper certificate on client request._

**❌ Failure paths**

- **Reject Oversized Batch** — when document_count gt 100, then emit demat.rejected. _Why: Prevent lodgement of a batch containing more than 100 documents of title._ *(error: `DEMAT_BATCH_OVERSIZED`)*
- **Reject Mixed Holder Batch** — when distinct_holders gt 1 OR distinct_issuers gt 1 OR distinct_share_classes gt 1, then emit demat.rejected. _Why: Prevent lodgement of a batch containing multiple registered holders, issuers, or share classes._ *(error: `DEMAT_BATCH_MIXED_HOLDER`)*
- **Reject Non Resident Mix** — when has_resident_and_non_resident_mix eq true, then emit demat.rejected. _Why: Prevent non-resident scrip from being lodged in the same batch as resident scrip._ *(error: `DEMAT_NON_RESIDENT_MIXED`)*
- **Handle Rejected Scrip** — when csd_response eq "nok", then move scrip_status pending_demat → rejected; set scrip_location = "rejected"; emit demat.rejected. _Why: Operator reverses pending location when the central depository rejects scrip and routes it to an invalid scrip account for rectification._ *(error: `DEMAT_SCRIP_REJECTED`)*
- **Handle Tainted Scrip** — when csd_response eq "tainted", then move scrip_status pending_demat → tainted; emit demat.tainted. _Why: Transfer secretary retains tainted scrip; broker moves position to invalid account and initiates trace process._ *(error: `DEMAT_SCRIP_TAINTED`)*
- **Block Client Own Name Via Broker** — when own_name_request eq true, then notify via email. _Why: Prevent a client from dematerialising in their own name via the broker; they must approach a central depository participant directly._ *(error: `DEMAT_OWNERSHIP_UNVERIFIED`)*

## Errors it can return

- `DEMAT_BATCH_OVERSIZED` — Batch exceeds maximum of 100 documents of title
- `DEMAT_BATCH_MIXED_ISSUER` — Batch contains scrip from more than one issuing company
- `DEMAT_BATCH_MIXED_CLASS` — Batch contains more than one share class
- `DEMAT_BATCH_MIXED_HOLDER` — Batch contains more than one registered holder
- `DEMAT_NON_RESIDENT_MIXED` — Non-resident scrip must be lodged in a separate batch
- `DEMAT_CSD_ACKNOWLEDGEMENT_MISSING` — Central depository acknowledgement has not been received for this batch
- `DEMAT_SCRIP_REJECTED` — Scrip was rejected by the central depository and must be rectified
- `DEMAT_SCRIP_TAINTED` — Scrip is tainted and has been retained by the transfer secretary
- `DEMAT_INVALID_LOCATION_TRANSFER` — Scrip cannot be transferred out of the current location in its present state
- `DEMAT_OWNERSHIP_UNVERIFIED` — Client ownership of scrip could not be verified

## Events

**`demat.batch_lodged`**
  Payload: `batch_reference`, `issuing_company`, `share_class`, `registered_holder`, `document_count`, `lodged_by`, `timestamp`

**`demat.pending_location_updated`**
  Payload: `batch_reference`, `scrip_location`, `updated_by`, `timestamp`

**`demat.acknowledged`**
  Payload: `batch_reference`, `acknowledgement_receipt`, `received_at`

**`demat.completed`**
  Payload: `batch_reference`, `certificate_number`, `quantity`, `client_account_code`, `completed_at`

**`demat.rejected`**
  Payload: `batch_reference`, `certificate_number`, `rejection_reason`, `rejected_at`

**`demat.tainted`**
  Payload: `batch_reference`, `certificate_number`, `retained_by`, `timestamp`

**`scrip.rematerialised`**
  Payload: `client_account_code`, `issuing_company`, `quantity`, `registration_code`, `rematerialisation_receipt`, `timestamp`

**`scrip.register_reconciled`**
  Payload: `nominee_account_code`, `proprietary_total`, `resident_client_total`, `non_resident_client_total`, `reconciled_at`

## Connects to

- **broker-dematerialisation-upload** *(recommended)*
- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-dematerialisation/) · **Spec source:** [`broker-dematerialisation.blueprint.yaml`](./broker-dematerialisation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
