<!-- AUTO-GENERATED FROM broker-negotiable-brokerage.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Negotiable Brokerage

> Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokerage scale tables keyed by instrument...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · brokerage · commission · rate-schedule · contract-note · pricing · trading

## What this does

Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokerage scale tables keyed by instrument...

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **scale_code** *(text, required)* — Negotiated Brokerage Scale Code
- **charge_structure_code** *(text, required)* — Charge Structure Code
- **charge_structure_description** *(text, optional)* — Charge Structure Description
- **rate_type** *(select, required)* — Percentage or Cents Indicator
- **from_date** *(date, required)* — Effective From Date
- **to_date** *(date, optional)* — Expiry Date
- **basic_charge** *(number, optional)* — Basic Charge
- **scale_start** *(number, required)* — Scale Lower Limit
- **scale_end** *(number, required)* — Scale Upper Limit
- **commission_amount** *(number, optional)* — Commission Rate or Cents Per Share
- **minimum_rand_amount** *(number, optional)* — Minimum Charge Amount
- **rate_status** *(select, required)* — Rate Lifecycle Status
- **deactivated_flag** *(boolean, optional)* — Deactivated Flag
- **client_account_code** *(text, optional)* — Client Account Code
- **assigned_scale_code** *(text, optional)* — Client Assigned Scale Code
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **relationship_code** *(text, optional)* — Relationship Code
- **approved_by** *(text, optional)* — Approver Identifier
- **approved_at** *(datetime, optional)* — Approval Timestamp
- **contract_note_override_rate** *(number, optional)* — Contract Note Override Rate
- **override_reason** *(text, optional)* — Override Reason

## What must be true

- **data_integrity → scale_code_format:** Scale code is up to 3 alphanumeric characters, unique per broker
- **data_integrity → complete_structure_coverage:** A scale must define an entry for every charge structure code to guarantee a rate exists for any instrument traded
- **data_integrity → sliding_scale_terminator:** The final band in a sliding scale must terminate at a configured maximum ceiling (e.g. <id-number>.99)
- **data_integrity → effective_date_future:** from_date must be greater than or equal to the system process date
- **data_integrity → non_overlapping_bands:** Scale bands for a given scale_code and charge_structure_code must not overlap; scale_start of band N+1 must exceed scale_end of band N
- **data_integrity → decimal_precision:** Commission rate carries up to 4 decimal places; basic_charge and minimum_rand_amount carry 2 decimal places
- **security → rate_change_authorization:** New rate or rate change requires rate_administrator role
- **security → segregation_of_duties:** Loader and approver must be different users
- **security → bulk_assignment_window:** Bulk assignment to client accounts may only run after end-of-trading cut-off
- **security → audit_trail:** All rate table and client assignment changes logged with user, timestamp, old and new values
- **compliance → disclosure_on_contract_note:** Negotiated commission and basic charge must be itemised on the client contract note
- **compliance → fair_treatment_of_customers:** Rate assignments documented in client mandate; no discriminatory pricing without mandate justification
- **compliance → popia_personal_pricing:** Per-client rate records are personal information and must comply with POPIA lawful-basis and retention rules
- **business → rate_calculation_types:** Rate type P applies a percentage to trade consideration; rate type C applies cents per share to traded volume
- **business → minimum_charge_fallback:** Where minimum_rand_amount is configured, the calculated commission is the greater of computed commission and the minimum charge
- **business → default_scale_fallback:** If a client has no assigned_scale_code, the default broker scale is used
- **business → supersession_by_future_date:** Loading a new rate with a future from_date against the same scale_code and charge_structure_code auto-deactivates the prior rate on that date
- **business → per_client_override:** Client assigned_scale_code overrides the default scale for all charge structures unless a specific contract note override is recorded
- **business → contract_note_override:** A one-off contract-note override may be recorded with reason; overrides are logged and require supervisor approval
- **business → bulk_assignment_scope:** Bulk assignment can target a branch, a branch-plus-partner combination, or an account-plus-relationship-code combination
- **business → reduced_rate_instruments:** Specific instrument charge structures (e.g. alternative exchange equities) may carry a reduced rate via a dedicated scale entry

## Success & failure scenarios

**✅ Success paths**

- **Propose New Negotiable Scale** — when user_role eq "rate_administrator"; scale_code exists; charge_structure_code exists; from_date gte "today", then create_record; set rate_status = "proposed"; emit rate.scale.proposed. _Why: Rate administrator proposes a new negotiable brokerage scale entry._
- **Approve Negotiable Scale** — when user_role eq "account_supervisor"; rate_status eq "proposed"; approver_is_loader eq false, then move rate_status proposed → approved; set approved_by = "current_user"; set approved_at = "now"; emit rate.scale.approved. _Why: Supervisor approves a proposed scale, distinct from the loader._
- **Activate On Effective Date** — when rate_status eq "approved"; from_date lte "today", then move rate_status approved → active; emit rate.scale.activated; emit rate.scale.superseded. _Why: System activates an approved scale when its effective date is reached and archives the prior scale for the same key._
- **Assign Scale To Client** — when client_account_code exists; assigned_scale_code exists, then set assigned_scale_code = "input_value"; emit rate.client.assigned. _Why: Assign a negotiated scale code to a single client account._
- **Bulk Assign Scale** — when scale_code exists; branch_code exists OR relationship_code exists; end_of_trading_cutoff_passed eq true, then call service; emit rate.client.bulk_assigned. _Why: Bulk assignment of a scale code across a branch, partner, or related account set after end-of-trading cut-off._
- **Apply Contract Note Override** — when contract_note_override_rate exists; override_reason exists; approved_by exists, then set contract_note_override_rate = "input_value"; emit rate.contract_note.override_applied. _Why: Apply a one-off negotiated rate override to a specific contract note with documented reason and supervisor approval._
- **Apply Minimum Charge** — when computed_commission lt "minimum_rand_amount", then set commission_amount = "minimum_rand_amount"; emit rate.minimum.applied. _Why: Contract note engine substitutes minimum charge when computed commission falls below configured minimum._
- **Archive Superseded Scale** — when rate_status eq "active"; superseded eq true, then move rate_status active → archived; set deactivated_flag = true; emit rate.scale.archived. _Why: Archive a scale when a newer scale with later effective date activates._

**❌ Failure paths**

- **Reject Past Dated Rate** — when from_date lt "today", then emit rate.scale.proposed. _Why: Reject a rate whose effective date is in the past._ *(error: `RATE_INVALID_DATE`)*
- **Reject Overlapping Bands** — when bands_contiguous eq false, then emit rate.scale.proposed. _Why: Reject scales whose bands overlap or leave gaps._ *(error: `RATE_BANDS_OVERLAP`)*
- **Reject Bulk Assignment In Trading Window** — when end_of_trading_cutoff_passed eq false, then emit rate.client.bulk_assigned. _Why: Block bulk assignment during the live trading window._ *(error: `RATE_ASSIGNMENT_WINDOW`)*
- **Reject Unjustified Override** — when override_reason not_exists OR approved_by not_exists, then emit rate.contract_note.override_applied. _Why: Reject contract note overrides lacking reason or approver._ *(error: `RATE_OVERRIDE_UNJUSTIFIED`)*

## Errors it can return

- `RATE_SCALE_DUPLICATE` — Scale code already exists for this charge structure and effective date
- `RATE_INVALID_DATE` — Effective date must be today or in the future
- `RATE_BANDS_OVERLAP` — Scale bands overlap or leave gaps; bands must be contiguous and non-overlapping
- `RATE_STRUCTURE_INCOMPLETE` — Scale must cover every required charge structure code
- `RATE_UNAUTHORIZED` — Only a rate administrator may load or change negotiated scales
- `RATE_APPROVAL_REQUIRED` — Rate cannot activate without supervisor approval
- `RATE_ASSIGNMENT_WINDOW` — Bulk assignment may only run after end-of-trading cut-off
- `RATE_OVERRIDE_UNJUSTIFIED` — Contract note override requires a documented reason and supervisor approval
- `RATE_CLIENT_NOT_FOUND` — Client account does not exist for scale assignment
- `RATE_MINIMUM_VIOLATION` — Computed commission is below the configured minimum charge

## Events

**`rate.scale.proposed`**
  Payload: `scale_code`, `charge_structure_code`, `from_date`, `proposed_by`, `timestamp`

**`rate.scale.approved`**
  Payload: `scale_code`, `charge_structure_code`, `approved_by`, `timestamp`

**`rate.scale.activated`**
  Payload: `scale_code`, `charge_structure_code`, `from_date`, `timestamp`

**`rate.scale.archived`**
  Payload: `scale_code`, `charge_structure_code`, `archived_by`, `timestamp`

**`rate.scale.superseded`**
  Payload: `scale_code`, `charge_structure_code`, `new_from_date`, `timestamp`

**`rate.client.assigned`**
  Payload: `client_account_code`, `assigned_scale_code`, `assigned_by`, `timestamp`

**`rate.client.bulk_assigned`**
  Payload: `scale_code`, `branch_code`, `partner_code`, `account_code`, `relationship_code`, `count`, `assigned_by`, `timestamp`

**`rate.contract_note.override_applied`**
  Payload: `client_account_code`, `trade_reference`, `override_rate`, `override_reason`, `approved_by`, `timestamp`

**`rate.minimum.applied`**
  Payload: `client_account_code`, `trade_reference`, `computed_commission`, `minimum_rand_amount`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-client-data-upload** *(recommended)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-negotiable-brokerage/) · **Spec source:** [`broker-negotiable-brokerage.blueprint.yaml`](./broker-negotiable-brokerage.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
