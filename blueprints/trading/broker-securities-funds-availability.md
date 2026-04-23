<!-- AUTO-GENERATED FROM broker-securities-funds-availability.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Securities Funds Availability

> Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement across proprietary and controlled accounts

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · settlement · clearing · pre-trade · risk · availability · trading-limits

## What this does

Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement across proprietary and controlled accounts

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **batch_date** *(date, required)* — Batch Date
- **source_indicator** *(select, required)* — Source (Batch or Intraday)
- **account_group** *(select, required)* — Account Group (BOA / Controlled / Proprietary)
- **purchase_sale_indicator** *(select, required)* — Purchase or Sale Indicator
- **settlement_date** *(date, required)* — Settlement Date
- **instrument_code** *(text, optional)* — Instrument Code
- **account_code** *(text, required)* — Account Code
- **account_type** *(text, required)* — Account Type
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **deal_id** *(text, optional)* — Deal Identifier
- **trade_type** *(text, optional)* — Trade Type
- **foreign_indicator** *(boolean, optional)* — Foreign Currency Settlement Flag
- **sale_quantity** *(number, optional)* — Sale Quantity
- **quantity_short** *(number, optional)* — Quantity Short
- **demat_scrip_available** *(number, optional)* — Dematerialised Scrip Available
- **purchase_qty_on_suspense** *(number, optional)* — Purchase Quantity on Suspense Account
- **slb_collateral_qty_due** *(number, optional)* — Stock Lending and Collateral Quantity Due
- **entitlements_qty_due** *(number, optional)* — Entitlements Quantity Due
- **purchase_qty_due** *(number, optional)* — Purchase Quantity Due
- **qty_allocated_to_sales** *(number, optional)* — Quantity Allocated to Sales
- **purchase_amount** *(number, optional)* — Purchase Amount
- **amount_short** *(number, optional)* — Amount Short
- **total_amount_short** *(number, optional)* — Total Amount Short
- **entitlement_amount_due** *(number, optional)* — Entitlement Amount Due
- **sale_amount_due** *(number, optional)* — Sale Amount Due
- **amount_allocated_to_purchases** *(number, optional)* — Amount Allocated to Purchases
- **cash_balance** *(number, optional)* — Available Cash Balance
- **securities_holding_qty** *(number, optional)* — Securities Holding Quantity
- **trading_limit** *(number, optional)* — Account Trading Limit
- **limit_utilisation** *(number, optional)* — Current Trading Limit Utilisation
- **availability_status** *(select, required)* — Availability Check Status

## What must be true

- **data_integrity → batch_calculation_schedule:** Batch availability calculations run on T, T+1, T+2 and T+3 evenings; intraday run at 12h00 for T+4 deals
- **data_integrity → proprietary_aggregation:** Proprietary availability is calculated across ALL proprietary accounts aggregated, not per individual account
- **data_integrity → controlled_client_scope:** Controlled client calculations are produced daily T to T+3 and intraday on T+4
- **data_integrity → proprietary_scope:** Proprietary account calculations are produced on T+2 and T+3
- **data_integrity → display_freshness:** Displayed data is as at the specified batch or intraday time, and is NOT real-time allocation
- **availability_formulas → quantity_short:** quantity_short = sale_quantity + (demat_scrip_available + purchase_qty_on_suspense + slb_collateral_qty_due + entitlements_qty_due + purchase_qty_due - qty_allocated_to_sales)
- **availability_formulas → amount_short:** amount_short = purchase_amount - (entitlement_amount_due + sale_amount_due - amount_allocated_to_purchases)
- **availability_formulas → allocation_order:** Allocate available securities to sales and available funds to purchases from smallest to largest, as a running total until exhausted
- **pre_trade → cash_sufficiency:** Purchase orders require cash_balance >= purchase_amount + projected settlement obligations
- **pre_trade → securities_sufficiency:** Sale orders require securities_holding_qty >= sale_quantity net of pending allocations
- **pre_trade → trading_limit_enforcement:** Order value + limit_utilisation must not exceed trading_limit for the account
- **pre_trade → real_time_lookup:** Real-time position lookup must reflect intraday deals and allocations, not only the last batch
- **account_groupings → boa:** Broker Own Accounts — accounts with institution type BOA, typically account type C
- **account_groupings → controlled:** Controlled client accounts — account types C, B, CB, CL, CS, LL, A, AB, AF, AL, AN, AS, Q, QL, QN, QS
- **account_groupings → proprietary:** Proprietary accounts — account types S, DA, N, EC, ER, EN, ES, LB, LK, LP, QD, RS, PT, D, OB
- **security → access_control:** Screen and API access controlled per role; view permissions distinct from override permissions
- **security → segregation_of_duties:** Overriding a failed availability check requires risk officer role
- **compliance → popia_alignment:** Account and client data touched during availability checks follows POPIA protections defined in the popia-compliance blueprint
- **compliance → audit_trail:** Every availability check and any override are logged with user, timestamp, inputs and result
- **business → failed_trade_prevention:** Availability messages feed the clearing system so loan requirements, margins and penalties can be computed for potential failed trades
- **business → short_sale_flagging:** Sales with quantity_short > 0 are flagged for stock borrow or corrective action before settlement
- **business → purchase_funding_flagging:** Purchases with amount_short > 0 are flagged for funding before settlement

## Success & failure scenarios

**✅ Success paths**

- **Pre Trade Cash Sufficient** — when purchase_sale_indicator eq "P"; cash_balance gte "purchase_amount"; limit_utilisation lte "trading_limit", then set availability_status = "passed"; move availability_status pending → passed; emit availability.check.passed. _Why: Purchase order passes pre-trade funds availability check._
- **Pre Trade Securities Sufficient** — when purchase_sale_indicator eq "S"; securities_holding_qty gte "sale_quantity", then set availability_status = "passed"; move availability_status pending → passed; emit availability.check.passed. _Why: Sale order passes pre-trade securities availability check._
- **Real Time Position Lookup** — when account_code exists; instrument_code exists, then call service; emit availability.check.requested. _Why: Back-office system returns real-time aggregated position for an account and instrument._
- **Settlement Cycle Batch Run** — when batch_date exists; source_indicator in ["B","I"], then call service; emit availability.batch_completed. _Why: Scheduled batch extracts availability for open allocations to feed the clearing system._
- **Override Failed Check** — when user_role eq "risk_officer"; availability_status eq "failed", then emit availability.override_applied. _Why: Risk officer overrides a failed availability check with documented reason._

**❌ Failure paths**

- **Pre Trade Insufficient Funds** — when purchase_sale_indicator eq "P"; cash_balance lt "purchase_amount", then set availability_status = "failed"; move availability_status pending → failed; emit availability.check.failed; emit availability.funding_shortfall_detected. _Why: Purchase order fails because available cash does not cover the purchase amount._ *(error: `SFA_INSUFFICIENT_FUNDS`)*
- **Pre Trade Insufficient Securities** — when purchase_sale_indicator eq "S"; securities_holding_qty lt "sale_quantity", then set availability_status = "failed"; move availability_status pending → failed; emit availability.check.failed; emit availability.short_position_detected. _Why: Sale order fails because available securities do not cover the sale quantity._ *(error: `SFA_INSUFFICIENT_SECURITIES`)*
- **Trading Limit Exceeded** — when limit_utilisation gt "trading_limit", then set availability_status = "failed"; move availability_status pending → failed; emit availability.trading_limit_breached; emit availability.check.failed. _Why: Order is rejected because it would breach the account trading limit._ *(error: `SFA_TRADING_LIMIT_EXCEEDED`)*
- **Reject Non Risk Override** — when user_role neq "risk_officer", then emit availability.check.failed. _Why: Prevent non-risk-officer roles from overriding a failed availability check._ *(error: `SFA_OVERRIDE_FORBIDDEN`)*

## Errors it can return

- `SFA_INSUFFICIENT_SECURITIES` — Insufficient securities available to cover the sale
- `SFA_INSUFFICIENT_FUNDS` — Insufficient funds available to cover the purchase
- `SFA_TRADING_LIMIT_EXCEEDED` — Order exceeds the account trading limit
- `SFA_INVALID_BATCH_DATE` — Batch date must align with a valid settlement cycle run
- `SFA_INVALID_ACCOUNT_GROUP` — Account group is not supported for this enquiry
- `SFA_OVERRIDE_FORBIDDEN` — Only a risk officer role may override a failed availability check
- `SFA_POSITION_LOOKUP_FAILED` — Real-time position lookup is temporarily unavailable

## Events

**`availability.check.requested`**
  Payload: `account_code`, `instrument_code`, `purchase_sale_indicator`, `quantity`, `timestamp`

**`availability.check.passed`**
  Payload: `account_code`, `instrument_code`, `deal_id`, `timestamp`

**`availability.check.failed`**
  Payload: `account_code`, `instrument_code`, `deal_id`, `reason`, `quantity_short`, `amount_short`, `timestamp`

**`availability.short_position_detected`**
  Payload: `account_code`, `instrument_code`, `settlement_date`, `quantity_short`, `timestamp`

**`availability.funding_shortfall_detected`**
  Payload: `account_code`, `settlement_date`, `amount_short`, `timestamp`

**`availability.trading_limit_breached`**
  Payload: `account_code`, `trading_limit`, `limit_utilisation`, `attempted_amount`, `timestamp`

**`availability.override_applied`**
  Payload: `account_code`, `deal_id`, `overridden_by`, `reason`, `timestamp`

**`availability.batch_completed`**
  Payload: `batch_date`, `source_indicator`, `account_group`, `records_processed`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **broker-client-data-upload** *(recommended)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-securities-funds-availability/) · **Spec source:** [`broker-securities-funds-availability.blueprint.yaml`](./broker-securities-funds-availability.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
