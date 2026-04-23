<!-- AUTO-GENERATED FROM broker-scrip-procedures.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Scrip Procedures

> Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgement, pledge management, and scrip...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · scrip · settlement · safekeeping · csd · lodgement · dematerialisation · float-control · bank-pledge

## What this does

Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgement, pledge management, and scrip...

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **scrip_reference** *(text, required)* — Scrip Reference Number
- **scrip_type** *(select, required)* — Scrip Type
- **security_code** *(text, required)* — Security Code
- **certificate_number** *(text, optional)* — Certificate Number
- **quantity** *(number, required)* — Share Quantity
- **registered_holder** *(text, optional)* — Registered Holder Name
- **account_code** *(text, required)* — Client Account Code
- **deal_reference** *(text, optional)* — Deal Reference
- **location_code** *(select, required)* — Scrip Location Code
- **scrip_status** *(select, required)* — Scrip Status
- **received_date** *(date, required)* — Received Date
- **received_from** *(text, optional)* — Received From Counterparty
- **transfer_deed_number** *(text, optional)* — Transfer Deed Number
- **transfer_deed_type** *(select, optional)* — Transfer Deed Type
- **balance_receipt_number** *(text, optional)* — Balance Receipt Number
- **lodged_with** *(select, optional)* — Lodged With
- **lodgement_reference** *(text, optional)* — Lodgement Reference
- **pledge_reference** *(text, optional)* — Pledge Reference
- **pledge_bank** *(text, optional)* — Pledging Bank
- **dispatch_method** *(select, optional)* — Dispatch Method
- **dispatch_date** *(date, optional)* — Dispatch Date
- **safe_custody_reference** *(text, optional)* — Safe Custody Reference
- **contra_reference** *(text, optional)* — Contra Reference
- **float_count_date** *(date, optional)* — Float Count Date
- **counted_quantity** *(number, optional)* — Counted Quantity
- **system_quantity** *(number, optional)* — System Quantity
- **variance_quantity** *(number, optional)* — Variance Quantity
- **memo_text** *(rich_text, optional)* — Scrip Memo

## What must be true

- **data_integrity → scrip_uniqueness:** Scrip reference must be unique within broker firm and cannot be reused after release or dispatch
- **data_integrity → certificate_integrity:** Certificate number plus security code must match issuer records before registration
- **data_integrity → quantity_match:** Captured quantity must equal the sum of allocated quantities across linked deals
- **data_integrity → location_audit:** Every scrip movement logs origin location, destination location, timestamp, and actor
- **data_integrity → record_retention:** Scrip movement history retained for at least seven years to satisfy recordkeeping rules
- **security → segregation_of_duties:** Operator who receives scrip may not also release from safe custody or pledge without a supervisor override
- **security → physical_handling:** Physical scrip handled only by designated scrip clerks in a dual-control environment
- **security → dematerialised_access:** Electronic pledge operations require supervisor role and are recorded with audit trail
- **compliance → exchange_control:** Foreign-holder scrip flagged and handled under applicable exchange-control regulations
- **compliance → popia_client_data:** Registered-holder names and account linkages treated as personal information under POPIA
- **compliance → fica_counterparty:** Counterparty identity verified before accepting scrip received from non-regulated parties
- **compliance → aml_monitoring:** Unusual patterns of physical scrip movement reported to compliance
- **business → scrip_types:** Valid scrip types are certificate, certified deed, white deed form CM42, blue deed form CM41, balance receipt, transfer receipt
- **business → location_codes:** Each physical location of scrip assigned a unique code so the broker always knows where scrip resides
- **business → contra_settlement:** Scrip received against a sale must be contra-matched to the corresponding counter-side; unmatched contras block settlement
- **business → float_balancing:** Daily scrip count per security and per location must reconcile to system quantity; variances raise a float-control exception
- **business → registration_flow:** Scrip sent to transfer secretary for registration, monitored until receipt ex-company, then moved to final destination
- **business → safe_custody_sweep:** Client scrip not earmarked for delivery moves to safe custody by end of settlement window
- **business → pledge_release:** Pledged scrip cannot be released to client or safe custody until pledge is formally withdrawn by the pledgee bank

## Success & failure scenarios

**✅ Success paths**

- **Receive Scrip Against Sale** — when scrip_type in ["certificate","certified_deed","white_deed","blue_deed","balance_receipt","transfer_receipt"]; security_code exists; quantity gt 0; deal_reference exists, then create_record; set scrip_status = "received"; emit scrip.received. _Why: Scrip clerk captures scrip received from a counterparty against an open sale, creating a register entry and initial receipt event._
- **Allocate Scrip To Purchase** — when scrip_status eq "received"; deal_reference exists, then move scrip_status received → allocated; emit scrip.allocated. _Why: Scrip clerk allocates received scrip against a matching open purchase._
- **Send For Registration** — when scrip_status eq "allocated", then set location_code = "at_transfer_secretary"; emit scrip.sent_for_registration. _Why: Clerk sends allocated scrip to the transfer secretary for registration in the new holder's name._
- **Record Registered Scrip** — when certificate_number exists; registered_holder exists, then move scrip_status allocated → registered; emit scrip.registered. _Why: Back-office records receipt ex-company once transfer secretary returns the registered certificate._
- **Lodge With Central Depository** — when scrip_status eq "registered"; lodged_with eq "central_depository", then move scrip_status registered → lodged; set location_code = "at_central_depository"; emit scrip.lodged. _Why: Registered scrip lodged with the central securities depository for dematerialisation._
- **Move To Safe Custody** — when scrip_status eq "registered", then move scrip_status registered → in_safe_custody; set location_code = "safe_custody"; emit scrip.lodged. _Why: Registered scrip not earmarked for delivery is swept into safe custody._
- **Pledge Scrip To Bank** — when user_role eq "scrip_supervisor"; pledge_bank exists, then move scrip_status registered → pledged; emit scrip.pledged. _Why: Supervisor pledges registered or lodged scrip to a custodian bank._
- **Release Scrip From Safekeeping** — when user_role eq "scrip_supervisor"; scrip_status in ["in_safe_custody","lodged","pledged"], then move scrip_status in_safe_custody → released; emit scrip.released_from_safekeeping. _Why: Supervisor releases scrip from safe custody, lodgement, or pledge once business reason documented._
- **Dispatch Scrip To Client** — when scrip_status eq "registered"; dispatch_method in ["registered_post","courier","counter_collection"], then move scrip_status registered → dispatched; emit scrip.dispatched. _Why: Registered scrip dispatched by registered post or courier to the client._
- **Balance Scrip Float** — when counted_quantity exists; system_quantity exists, then set variance_quantity = "computed"; emit scrip.float_counted. _Why: Daily scrip count reconciles physical quantity at each location to system quantity._

**❌ Failure paths**

- **Reject Duplicate Scrip** — when scrip_reference exists, then emit scrip.received. _Why: Prevent the same certificate or balance receipt being loaded twice._ *(error: `SCRIP_DUPLICATE`)*
- **Reject Unregistered Lodgement** — when scrip_status in ["received","allocated"], then emit scrip.lodged. _Why: Prevent lodgement, safe custody, or pledge of unregistered scrip._ *(error: `SCRIP_NOT_REGISTERED`)*
- **Reject Release With Active Pledge** — when pledge_reference exists; scrip_status eq "pledged", then emit scrip.released_from_safekeeping. _Why: Block release of scrip while an active pledge record exists and has not been withdrawn._ *(error: `SCRIP_PLEDGE_ACTIVE`)*
- **Raise Float Variance Exception** — when variance_quantity neq 0, then emit scrip.float_counted. _Why: Float count variance raises an exception and blocks end-of-day until investigated._ *(error: `SCRIP_FLOAT_VARIANCE`)*

## Errors it can return

- `SCRIP_DUPLICATE` — Scrip reference already exists in the register
- `SCRIP_TYPE_INVALID` — Scrip type is not recognised
- `SCRIP_QUANTITY_MISMATCH` — Captured quantity does not match allocated quantities
- `SCRIP_LOCATION_UNKNOWN` — Location code is not defined in the scrip location master
- `SCRIP_CONTRA_UNMATCHED` — No matching contra found for this scrip receipt
- `SCRIP_NOT_REGISTERED` — Scrip must be registered before lodgement, safe custody, or pledge
- `SCRIP_RELEASE_FORBIDDEN` — Scrip release requires scrip supervisor role
- `SCRIP_PLEDGE_ACTIVE` — Scrip cannot be released while an active pledge exists
- `SCRIP_FLOAT_VARIANCE` — Float count does not reconcile to system quantity

## Events

**`scrip.received`**
  Payload: `scrip_reference`, `scrip_type`, `security_code`, `quantity`, `account_code`, `received_from`, `timestamp`

**`scrip.allocated`**
  Payload: `scrip_reference`, `deal_reference`, `account_code`, `allocated_by`, `timestamp`

**`scrip.sent_for_registration`**
  Payload: `scrip_reference`, `transfer_secretary`, `sent_by`, `timestamp`

**`scrip.registered`**
  Payload: `scrip_reference`, `registered_holder`, `certificate_number`, `timestamp`

**`scrip.lodged`**
  Payload: `scrip_reference`, `lodged_with`, `lodgement_reference`, `lodged_by`, `timestamp`

**`scrip.released_from_safekeeping`**
  Payload: `scrip_reference`, `location_code`, `released_by`, `timestamp`

**`scrip.pledged`**
  Payload: `scrip_reference`, `pledge_bank`, `pledge_reference`, `pledged_by`, `timestamp`

**`scrip.pledge_withdrawn`**
  Payload: `scrip_reference`, `pledge_reference`, `withdrawn_by`, `timestamp`

**`scrip.dispatched`**
  Payload: `scrip_reference`, `dispatch_method`, `dispatch_date`, `dispatched_by`

**`scrip.float_counted`**
  Payload: `security_code`, `location_code`, `counted_quantity`, `system_quantity`, `variance_quantity`, `counted_by`, `timestamp`

**`scrip.contra_matched`**
  Payload: `scrip_reference`, `contra_reference`, `matched_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-scrip-procedures/) · **Spec source:** [`broker-scrip-procedures.blueprint.yaml`](./broker-scrip-procedures.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
