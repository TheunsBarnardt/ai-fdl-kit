<!-- AUTO-GENERATED FROM broker-deal-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Deal Management

> Internal back-office deal management covering allocation, release, extensions, direct deals, pre-dated deals, deal adjustments, and contract note generation for equity trades

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · deal-allocation · trade-release · contract-notes · same-day-allocation · next-day-allocation · popia

## What this does

Internal back-office deal management covering allocation, release, extensions, direct deals, pre-dated deals, deal adjustments, and contract note generation for equity trades

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **deal_reference** *(text, required)* — Deal Reference Number
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, required)* — Settlement Date
- **instrument_code** *(text, required)* — Instrument Code
- **buy_sell_indicator** *(select, required)* — Buy/Sell Indicator
- **principal_agent_indicator** *(select, required)* — Principal/Agent Indicator
- **quantity** *(number, required)* — Quantity
- **price** *(number, required)* — Price
- **average_price** *(number, optional)* — Average Price
- **consideration** *(number, required)* — Consideration
- **allocation_account** *(text, required)* — Allocation Account Code
- **client_account** *(text, optional)* — Client Account Code
- **trading_account** *(text, optional)* — Trading Account
- **ring_fenced_indicator** *(boolean, optional)* — Ring-Fenced Term Indicator
- **rand_indicator** *(boolean, optional)* — Rand Indicator
- **allocation_type** *(select, required)* — Allocation Type
- **override_price** *(number, optional)* — Override Price
- **deal_status** *(select, required)* — Deal Status
- **adjustment_reason** *(text, optional)* — Adjustment Reason
- **contract_note_number** *(text, optional)* — Contract Note Number
- **released_by** *(text, optional)* — Released By Operator
- **released_at** *(datetime, optional)* — Release Timestamp
- **upload_batch_id** *(text, optional)* — Upload Batch Identifier

## What must be true

- **data_integrity → allocation_balance:** Allocation accounts must balance back to zero after all allocations are released on trade day
- **data_integrity → ring_fenced_segregation:** Ring-fenced and non-ring-fenced batches must remain in balance; deal terms cannot be altered post-capture
- **data_integrity → unique_deal_reference:** Deal reference must be unique within the broker firm and trade date
- **data_integrity → audit_trail:** All deal changes logged with operator, timestamp, and pre/post values; retained for a minimum of 60 months for regulatory review
- **data_integrity → upload_validation:** Uploaded allocations validated against market trades before acceptance
- **security → access_control:** Screen-level access enforced via resource access control facility
- **security → segregation_of_duties:** Deal adjustments require supervisor approval; operator cannot self-approve adjustments
- **security → release_authority:** Real-time release restricted to authorised operators per trading desk
- **compliance → popia:** Client identifying data on deals must satisfy POPIA lawful-basis and minimisation requirements
- **compliance → exchange_reporting:** Deals must be reported to the exchange within regulatory timeframes
- **compliance → contract_note_delivery:** Contract notes must be issued to clients per exchange rules and recordkeeping requirements
- **compliance → default_account_cleanup:** Deals posted to a default account due to invalid allocation must be booked out to correct client account via pre-dated deals
- **business → same_day_allocation:** Same-day allocation (SDALL) is only permitted on released market trades on allocation accounts; price computed as real-time average or operator override
- **business → next_day_allocation:** Next-day allocation (NXTAL) processes open allocation-account positions the day after trade
- **business → pre_dated_deals:** Pre-dated deals (DLPRE) are used to correct prior-day allocations and move positions between accounts
- **business → deal_extensions:** Deal extensions (DLEXT) capture additional terms against an existing market trade without altering its reference
- **business → direct_deals:** Direct deals (DLDIR) capture off-market or non-allocated trades; deal terms carried forward from trading system when accessed via allocation summary
- **business → real_time_release:** Trades, allocations, and extensions may be released intraday via RTREL; unreleased items process in overnight batch
- **business → deal_adjustments:** Deal adjustments (DLADJ) permit correction of captured terms prior to settlement and require a documented reason
- **business → contract_notes:** Contract notes are generated per client per deal after allocation and release

## Success & failure scenarios

**✅ Success paths**

- **Real Time Allocation Actual Price** — when deal_status eq "captured"; allocation_type eq "actual", then move deal_status captured → allocated; emit deal.allocated. _Why: Operator allocates a market trade at actual price via direct allocation summary._
- **Real Time Allocation Average Price** — when allocation_type eq "average", then set price = "average_price"; move deal_status captured → allocated; emit deal.allocated. _Why: Operator allocates grouped market trades at average price for same instrument and side._
- **Release Trade Real Time** — when deal_status eq "allocated"; user_role in ["broker_operator","deal_supervisor"], then move deal_status allocated → released; set released_at = "now"; emit deal.released. _Why: Operator releases allocated deals intraday so they post to the ledger before overnight batch._
- **Same Day Allocation** — when allocation_account_type eq "DA"; market_trades_released eq true, then call service; move deal_status captured → allocated; emit deal.allocated. _Why: Calculate real-time average on released allocation-account trades and allocate at average or override price._
- **Next Day Allocation** — when allocation_account_type eq "DA"; open_positions exists, then create_record; emit deal.allocated. _Why: Process open allocation-account positions the next trading day._
- **Pre Dated Deal Correction** — when user_role eq "broker_operator"; original_trade_date exists, then create_record; emit deal.pre_dated_created. _Why: Book out positions from default account to correct client account via pre-dated deal._
- **Deal Adjustment** — when user_role eq "deal_supervisor"; adjustment_reason exists, then move deal_status allocated → adjusted; emit deal.adjusted. _Why: Supervisor adjusts a captured deal with a documented reason prior to settlement._
- **Generate Contract Notes** — when deal_status eq "released", then create_record; emit deal.contract_note_generated. _Why: Generate contract notes for each client account after deal release._

**❌ Failure paths**

- **Reject Unbalanced Release** — when allocation_balance neq 0, then emit deal.rejected. _Why: Prevent release when the allocation account does not balance to zero._ *(error: `DEAL_ALLOCATION_UNBALANCED`)*
- **Reject Operator Adjustment** — when user_role neq "deal_supervisor", then emit deal.rejected. _Why: Prevent non-supervisor users from adjusting deals._ *(error: `DEAL_ADJUSTMENT_REQUIRES_SUPERVISOR`)*

## Errors it can return

- `DEAL_ALLOCATION_UNBALANCED` — Allocation account does not balance to zero after release
- `DEAL_REFERENCE_DUPLICATE` — Deal reference already exists for this trade date
- `DEAL_RELEASE_FORBIDDEN` — Operator not authorised to release trades for this desk
- `DEAL_ADJUSTMENT_REQUIRES_SUPERVISOR` — Deal adjustment requires supervisor approval
- `DEAL_TERMS_IMMUTABLE` — Deal terms carried from trading system cannot be modified
- `DEAL_INVALID_ALLOCATION_ACCOUNT` — Allocation account is invalid or deactivated
- `DEAL_PRE_DATED_FORBIDDEN` — Pre-dated deal outside permitted backdating window
- `DEAL_UPLOAD_VALIDATION_FAILED` — Uploaded allocation failed validation against market trades

## Events

**`deal.captured`**
  Payload: `deal_reference`, `trade_date`, `instrument_code`, `quantity`, `price`, `captured_by`

**`deal.allocated`**
  Payload: `deal_reference`, `allocation_account`, `client_account`, `quantity`, `allocated_by`, `timestamp`

**`deal.released`**
  Payload: `deal_reference`, `released_by`, `released_at`

**`deal.extension_added`**
  Payload: `deal_reference`, `extension_terms`, `added_by`, `timestamp`

**`deal.adjusted`**
  Payload: `deal_reference`, `adjustment_reason`, `adjusted_by`, `timestamp`

**`deal.pre_dated_created`**
  Payload: `deal_reference`, `original_trade_date`, `new_allocation_account`, `created_by`

**`deal.contract_note_generated`**
  Payload: `deal_reference`, `contract_note_number`, `client_account`, `generated_at`

**`deal.rejected`**
  Payload: `deal_reference`, `rejection_reason`, `rejected_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-deal-management/) · **Spec source:** [`broker-deal-management.blueprint.yaml`](./broker-deal-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
