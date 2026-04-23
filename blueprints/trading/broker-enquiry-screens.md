<!-- AUTO-GENERATED FROM broker-enquiry-screens.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Enquiry Screens

> Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics, and portfolio holdings

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · enquiry · read-only · client-positions · balances · financial-history · portfolio · trade-statistics

## What this does

Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics, and portfolio holdings

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_code** *(text, required)* — Account Code
- **instrument_code** *(text, optional)* — Instrument / Share Code
- **deal_number** *(text, optional)* — Deal Number
- **trade_date_from** *(date, optional)* — Trade Date From
- **trade_date_to** *(date, optional)* — Trade Date To
- **enquiry_screen** *(select, required)* — Enquiry Screen Code
- **buy_sell_indicator** *(select, optional)* — Buy / Sell Indicator
- **quantity** *(number, optional)* — Quantity
- **price** *(number, optional)* — Price
- **consideration** *(number, optional)* — Consideration
- **settlement_date** *(date, optional)* — Settlement Date
- **balance_type** *(select, optional)* — Balance Type
- **currency_code** *(text, optional)* — Currency Code
- **transfer_from_account** *(text, optional)* — Transfer From Account
- **transfer_to_account** *(text, optional)* — Transfer To Account
- **transfer_amount** *(number, optional)* — Transfer Amount
- **portfolio_as_at_date** *(date, optional)* — Portfolio Valuation Date
- **average_price** *(number, optional)* — Average Price
- **charges_total** *(number, optional)* — Charges Total
- **trade_statistics_period** *(select, optional)* — Trade Statistics Period

## What must be true

- **data_integrity → read_consistency:** Enquiry screens reflect ledger state as at last completed batch; intraday deals shown with pending flag
- **data_integrity → drill_down_linkage:** Summary lines must resolve to a single underlying deal, scrip movement, or financial entry record
- **data_integrity → balance_reconciliation:** Cash and scrip balances across enquiry screens must tie back to the general ledger control totals
- **security → access_control:** Screen-level and account-level access controlled by back-office resource access facility
- **security → account_scope:** Users may only query accounts within their assigned branch, partner, or advisor scope
- **security → supervisor_override:** Cross-scope enquiries require supervisor role and are audit-logged
- **security → transfer_dual_control:** Balance transfer actions require operator capture plus supervisor release
- **compliance → popia_minimum_necessary:** Enquiry responses must mask personal information not needed for the operational task
- **compliance → audit_trail:** Every enquiry logged with user, account queried, screen, timestamp, and IP for regulatory inspection
- **compliance → data_retention:** Enquiry access logs retained for at least 36 months
- **business → open_positions_view:** Open deals, open scrip, and settlement obligations surfaced on a single positions-and-history menu
- **business → deal_summary_drilldown:** Deal summaries drill down to specified deal and specified scrip records for full audit detail
- **business → portfolio_valuation:** Securities positions valued using post-release average price and current market price
- **business → balance_transfer:** Intra-account balance transfers permitted on the balance screen, inter-account transfers blocked and routed to cash management
- **business → trade_statistics:** Charge and trade statistics aggregated by instrument, period, and account

## Success & failure scenarios

**✅ Success paths**

- **View Open Positions And History** — when account_code exists; account_in_scope eq true, then call service; emit enquiry.executed. _Why: User opens the positions-and-history menu for a valid in-scope account._
- **Drill Into Specified Deal** — when deal_number exists, then call service; emit enquiry.drilldown. _Why: User drills from open-deals summary into a specified deal record._
- **View Account Balance** — when enquiry_screen eq "ACBAL", then call service; emit enquiry.executed. _Why: User displays current cash and scrip balance for the account._
- **Capture Balance Transfer** — when enquiry_screen eq "ACBAL"; transfer_amount gt 0; available_balance gte 0, then create_record; emit balance.transfer_captured. _Why: Operator captures an intra-account balance transfer for supervisor release._
- **View Portfolio Valuation** — when portfolio_as_at_date exists, then call service; emit portfolio.valuation_viewed. _Why: User views securities positions valued at post-release average and market price._
- **View Financial History** — when trade_date_from exists; trade_date_to exists, then call service; emit enquiry.executed. _Why: User queries deal and financial history over a date range._
- **View Trade Statistics** — when trade_statistics_period exists, then call service; emit trade_statistics.viewed. _Why: User views charge and trade statistics aggregated by period._

**❌ Failure paths**

- **Reject Out Of Scope Enquiry** — when account_in_scope eq false, then emit enquiry.scope_violation. _Why: Block enquiries on accounts outside the user's branch or advisor scope._ *(error: `ENQUIRY_FORBIDDEN_SCOPE`)*
- **Reject Unreleased Transfer** — when user_role neq "broker_supervisor"; transfer_released eq true, then emit balance.transfer_captured. _Why: Block balance transfer posting without supervisor release._ *(error: `BALANCE_TRANSFER_FORBIDDEN`)*
- **Reject Invalid Date Range** — when trade_date_from gt "trade_date_to", then emit enquiry.executed. _Why: Reject enquiries where date range is inverted or exceeds maximum window._ *(error: `ENQUIRY_INVALID_DATE_RANGE`)*

## Errors it can return

- `ENQUIRY_ACCOUNT_NOT_FOUND` — Account does not exist or is not within your access scope
- `ENQUIRY_FORBIDDEN_SCOPE` — Access denied, account outside your branch or advisor scope
- `ENQUIRY_INVALID_DATE_RANGE` — Trade date range is invalid or exceeds maximum permitted window
- `ENQUIRY_DATA_STALE` — Enquiry data temporarily unavailable, ledger batch in progress
- `BALANCE_TRANSFER_FORBIDDEN` — Balance transfer requires supervisor release
- `BALANCE_TRANSFER_INSUFFICIENT` — Insufficient available balance for requested transfer
- `ENQUIRY_POPIA_MASK_REQUIRED` — Response suppressed, personal information masking rules not satisfied

## Events

**`enquiry.executed`**
  Payload: `user_id`, `account_code`, `enquiry_screen`, `timestamp`

**`enquiry.drilldown`**
  Payload: `user_id`, `account_code`, `deal_number`, `from_screen`, `to_screen`, `timestamp`

**`enquiry.scope_violation`**
  Payload: `user_id`, `account_code`, `enquiry_screen`, `timestamp`

**`balance.transfer_captured`**
  Payload: `account_code`, `transfer_amount`, `balance_type`, `captured_by`, `timestamp`

**`balance.transfer_released`**
  Payload: `account_code`, `transfer_amount`, `released_by`, `timestamp`

**`portfolio.valuation_viewed`**
  Payload: `user_id`, `account_code`, `portfolio_as_at_date`, `timestamp`

**`trade_statistics.viewed`**
  Payload: `user_id`, `account_code`, `trade_statistics_period`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(optional)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-enquiry-screens/) · **Spec source:** [`broker-enquiry-screens.blueprint.yaml`](./broker-enquiry-screens.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
