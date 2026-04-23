<!-- AUTO-GENERATED FROM broker-prime-broking.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Prime Broking

> Prime brokerage workflow covering executing-broker and prime-broker relationship, trade give-ups, consolidated settlement, and client reporting across multiple executing brokers

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · prime-broking · give-up · settlement · clearing · custody · reporting

## What this does

Prime brokerage workflow covering executing-broker and prime-broker relationship, trade give-ups, consolidated settlement, and client reporting across multiple executing brokers

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **prime_account_code** *(text, required)* — Prime Account Code
- **client_code** *(text, required)* — Underlying Client Code
- **executing_broker_code** *(text, required)* — Executing Broker Code
- **prime_broker_code** *(text, required)* — Prime Broker Code
- **account_type** *(select, required)* — Account Type
- **controlled_flag** *(boolean, required)* — Controlled Account Flag
- **csdp_bp_id** *(text, required)* — CSDP BP Identifier
- **csdp_safekeeping_account** *(text, required)* — CSDP Safekeeping Account
- **prime_agreement_reference** *(text, required)* — Prime Brokerage Agreement Reference
- **give_up_reference** *(text, required)* — Give-Up Reference
- **deal_number** *(text, required)* — Executing Broker Deal Number
- **prime_deal_number** *(text, optional)* — Prime Broker Deal Number
- **instrument_code** *(text, required)* — Instrument Code
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, required)* — Settlement Date
- **quantity** *(number, required)* — Trade Quantity
- **price** *(number, required)* — Trade Price
- **consideration** *(number, required)* — Consideration
- **trade_side** *(select, required)* — Buy or Sell
- **give_up_status** *(select, required)* — Give-Up Status
- **rejection_reason** *(text, optional)* — Rejection Reason
- **netting_group** *(text, optional)* — Clearing Netting Group
- **commission_split** *(json, optional)* — Commission Split Between Brokers
- **client_statement_flag** *(boolean, optional)* — Include on Consolidated Client Statement

## What must be true

- **data_integrity → prime_account_uniqueness:** Prime account code unique per prime broker; links to exactly one underlying client
- **data_integrity → give_up_matching:** Give-up records must match executing-broker deal on instrument, quantity, price, trade date, and side
- **data_integrity → deal_immutability:** Once settled, deal records cannot be amended; adjustments must be booked as reversals
- **data_integrity → audit_trail_retention:** All account changes and give-up state transitions retained with user/timestamp for at least 5 years
- **security → segregation_of_duties:** Account setup and verification performed by different operator roles
- **security → resource_access_control:** Executing broker may view own deals only; prime broker may view all give-ups routed to them
- **security → mandate_verification:** Prime broker must hold signed prime brokerage agreement before accepting give-ups
- **compliance → popia_personal_information:** Underlying client personal information protected under POPIA; sharing between executing and prime broker requires documented lawful basis
- **compliance → exchange_control:** Cross-border give-ups must respect exchange-control segregation of resident and non-resident funds
- **compliance → market_conduct:** Trade give-ups reported to exchange within regulated cut-off windows
- **compliance → best_execution:** Executing broker retains best-execution obligation to underlying client regardless of give-up
- **business → account_types:** Non-controlled prime accounts held at prime broker; executing broker maintains mirror account for routing
- **business → csdp_details:** Prime broker CSDP details disseminated to executing brokers on account verification
- **business → consolidated_reporting:** Client receives single consolidated statement from prime broker covering trades from all executing brokers
- **business → netting:** Prime broker nets obligations per instrument per settlement date across all give-ups
- **business → financing:** Prime broker may finance controlled client positions; interest accrues on outstanding balances
- **business → commission_handling:** Executing broker retains execution commission; prime broker charges separate prime-brokerage fee

## Success & failure scenarios

**✅ Success paths**

- **Load Prime Account At Executing Broker** — when account_type eq "prime"; prime_broker_code exists; prime_agreement_reference exists, then create_record; set give_up_status = "pending"; emit prime.account.created. _Why: Executing broker sets up a non-controlled prime account pointing at the prime broker._
- **Verify Prime Account At Prime Broker** — when user_role eq "prime_broker"; prime_agreement_reference exists; csdp_bp_id exists, then set account_status = "verified"; call service; emit prime.account.verified. _Why: Prime broker verifies the prime account and disseminates CSDP details to the executing broker._
- **Request Trade Give Up** — when deal_number exists; prime_broker_code exists; give_up_status eq "pending", then move give_up_status pending → give_up_requested; emit prime.give_up.requested. _Why: Executing broker submits a give-up to the prime broker after trade execution._
- **Accept Give Up** — when user_role eq "prime_broker"; give_up_status eq "give_up_requested"; prime_account_code exists, then move give_up_status give_up_requested → accepted; create_record; emit prime.give_up.accepted. _Why: Prime broker accepts matching give-up and assumes settlement responsibility._
- **Consolidated Settlement** — when give_up_status eq "accepted"; settlement_date eq "today", then call service; move give_up_status accepted → settled; emit prime.settlement.completed. _Why: Prime broker nets accepted give-ups per instrument per settlement date and settles via CSDP._
- **Issue Consolidated Client Statement** — when client_statement_flag eq true, then create_record; notify via email; emit prime.statement.issued. _Why: Prime broker issues single consolidated statement covering all executing brokers for the period._

**❌ Failure paths**

- **Reject Account Without Mandate** — when prime_agreement_reference not_exists, then emit prime.give_up.rejected. _Why: Block account verification when no prime brokerage agreement exists._ *(error: `PRIME_MANDATE_MISSING`)*
- **Reject Mismatched Give Up** — when quantity neq "db_quantity" OR price neq "db_price" OR instrument_code neq "db_instrument", then move give_up_status give_up_requested → rejected; emit prime.give_up.rejected. _Why: Reject give-up when quantity, price, instrument, or trade date do not match executing-broker deal._ *(error: `GIVE_UP_MISMATCH`)*
- **Block Cross Prime View** — when user_prime_broker_code neq "deal_prime_broker_code", then emit prime.give_up.rejected. _Why: Prevent an executing broker from viewing give-ups routed to a different prime broker._ *(error: `PRIME_UNAUTHORISED_VIEW`)*

## Errors it can return

- `PRIME_ACCOUNT_NOT_FOUND` — Prime account does not exist at prime broker
- `PRIME_MANDATE_MISSING` — No active prime brokerage agreement between client and prime broker
- `GIVE_UP_MISMATCH` — Give-up details do not match executing-broker deal
- `GIVE_UP_DUPLICATE` — Give-up already recorded for this deal
- `GIVE_UP_REJECTED` — Prime broker rejected the give-up
- `CSDP_DETAILS_INVALID` — CSDP participant or safekeeping account invalid
- `PRIME_SETTLEMENT_FAILED` — Consolidated settlement instruction failed at custodian
- `PRIME_UNAUTHORISED_VIEW` — User not authorised to view deals routed to a different prime broker

## Events

**`prime.account.created`**
  Payload: `prime_account_code`, `client_code`, `executing_broker_code`, `prime_broker_code`, `created_by`, `timestamp`

**`prime.account.verified`**
  Payload: `prime_account_code`, `verified_by`, `csdp_bp_id`, `timestamp`

**`prime.give_up.requested`**
  Payload: `give_up_reference`, `deal_number`, `executing_broker_code`, `prime_broker_code`, `instrument_code`, `quantity`, `price`, `timestamp`

**`prime.give_up.accepted`**
  Payload: `give_up_reference`, `prime_deal_number`, `accepted_by`, `timestamp`

**`prime.give_up.rejected`**
  Payload: `give_up_reference`, `rejection_reason`, `rejected_by`, `timestamp`

**`prime.settlement.completed`**
  Payload: `prime_deal_number`, `settlement_date`, `netting_group`, `timestamp`

**`prime.statement.issued`**
  Payload: `client_code`, `statement_period`, `statement_reference`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-prime-broking/) · **Spec source:** [`broker-prime-broking.blueprint.yaml`](./broker-prime-broking.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
