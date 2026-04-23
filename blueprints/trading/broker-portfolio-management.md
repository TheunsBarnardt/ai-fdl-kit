<!-- AUTO-GENERATED FROM broker-portfolio-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Portfolio Management

> Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home holdings, valuation statements,...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · portfolio · holdings · valuation · performance-measurement · unlisted-securities · at-home-holdings · popia

## What this does

Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home holdings, valuation statements,...

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_portfolio_code** *(text, required)* — Client Portfolio Code
- **branch_code** *(text, required)* — Branch Code
- **partner_code** *(text, required)* — Partner Code
- **advisor_code** *(text, required)* — Advisor Code
- **investment_type_code** *(text, optional)* — Investment Type Code
- **instrument_code** *(text, required)* — Instrument Code
- **instrument_class** *(select, required)* — Instrument Class
- **unlisted_sector_code** *(text, optional)* — Unlisted Sector Code
- **holding_quantity** *(number, required)* — Holding Quantity
- **holding_cost** *(number, required)* — Holding Cost
- **market_value** *(number, optional)* — Current Market Value
- **at_home_indicator** *(boolean, optional)* — At Home Indicator
- **at_home_quantity** *(number, optional)* — Quantity Held At Home
- **at_home_cost** *(number, optional)* — Cost of Holdings Held At Home
- **bond_clean_price_flag** *(boolean, optional)* — Value Bonds At Clean Price
- **benchmark_index_code** *(text, optional)* — Benchmark Index Code
- **portfolio_status** *(select, required)* — Portfolio Status
- **language_indicator** *(select, optional)* — Statement Language Indicator
- **valuation_date** *(date, optional)* — Valuation Date
- **opening_value** *(number, optional)* — Opening Valuation Value
- **closing_value** *(number, optional)* — Closing Valuation Value
- **performance_return_pct** *(number, optional)* — Period Performance Return Percentage
- **cash_movement_total** *(number, optional)* — Net Cash Movement In Period
- **dividend_income** *(number, optional)* — Dividend And Earnings Income
- **closed_date** *(date, optional)* — Portfolio Closed Date

## What must be true

- **data_integrity → holdings_auto_update:** Holdings update automatically from trading back-office transactions, manual load only for at-home and unlisted
- **data_integrity → unique_portfolio_code:** Client portfolio code must be unique within the broker firm
- **data_integrity → instrument_reference:** Every holding must reference an active instrument record on the instruments master
- **data_integrity → unlisted_sector_mandatory:** Unlisted securities and assets must be linked to an unlisted sector code, otherwise default sector applied
- **data_integrity → audit_trail:** All master-data and holding changes logged with user, timestamp, old/new values
- **security → resource_access_control:** Each screen controlled via resource access control facility, view vs update permissions separate
- **security → segregation_of_duties:** Portfolio closure and suspension require separate actor from day-to-day maintenance operator
- **security → no_pii_on_statements_logs:** Valuation statements must not log full ID or tax numbers in system logs
- **compliance → popia_personal_info:** Client name, address, and holdings are personal information under POPIA and require documented lawful basis
- **compliance → popia_cross_border:** Statements must not be emailed across borders without client consent and adequate-protection check per POPIA s.72
- **compliance → statement_retention:** Valuation statements retained for minimum regulatory period (typically 5 years)
- **compliance → tax_classification:** Dividend and earnings data tagged for IT3B tax-certificate production
- **business → grouping_hierarchy:** Portfolios grouped by Broker > Branch > Partner > Advisor > Client for all reports and statements
- **business → investment_type_grouping:** Portfolios additionally grouped by user-defined investment type codes for enquiry views
- **business → at_home_cost_default:** If no cost supplied when receiving at-home scrip, cost defaults to previous trading-day close market value
- **business → bond_valuation_method:** Bonds may be valued at clean price or all-in price per broker preference flag
- **business → performance_vs_index:** Portfolio return measured against selected benchmark index over the valuation period
- **business → valuation_sequence:** Valuation statements produced in Broker, Branch, Partner, Advisor, then alpha or numeric client sequence

## Success & failure scenarios

**✅ Success paths**

- **Register Client Portfolio** — when client_portfolio_code exists; branch_code exists; partner_code exists; advisor_code exists, then create_record; set portfolio_status = "pending"; emit portfolio.created. _Why: Administrator registers a new client portfolio with required grouping codes._
- **Update Holding From Trade** — when source eq "trading_back_office"; portfolio_status eq "active", then set holding_quantity = "updated"; set holding_cost = "updated"; emit portfolio.holding_updated. _Why: Trading back-office transaction automatically updates portfolio holding quantity and cost._
- **Record At Home Holding** — when at_home_quantity gt 0; at_home_quantity lte "holding_quantity", then set at_home_indicator = true; set at_home_cost = "default_previous_close"; emit portfolio.at_home_recorded. _Why: Operator records an at-home holding, cost defaults to previous close when blank._
- **Produce Valuation Statement** — when portfolio_status eq "active"; valuation_date exists, then call service; set closing_value = "calculated"; emit portfolio.valuation_produced. _Why: System produces a client valuation statement for a given valuation date._
- **Calculate Performance Vs Benchmark** — when benchmark_index_code exists; opening_value gt 0, then call service; set performance_return_pct = "calculated"; emit portfolio.performance_calculated. _Why: Calculate period return and compare to configured benchmark index._
- **Close Portfolio** — when portfolio_status eq "active"; user_role eq "portfolio_administrator", then move portfolio_status active → closed; set closed_date = "today"; emit portfolio.closed. _Why: Administrator closes a portfolio at end of client relationship._

**❌ Failure paths**

- **Reject Duplicate Portfolio** — when client_portfolio_code exists, then emit portfolio.created. _Why: Prevent duplicate portfolio codes within broker._ *(error: `PORTFOLIO_DUPLICATE`)*
- **Reject Unknown Advisor** — when advisor_code not_exists, then emit portfolio.created. _Why: Advisor code must exist on advisor master._ *(error: `PORTFOLIO_INVALID_ADVISOR`)*
- **Reject Excess At Home Quantity** — when at_home_quantity gt "holding_quantity", then emit portfolio.at_home_recorded. _Why: At-home quantity may not exceed total holding._ *(error: `PORTFOLIO_AT_HOME_NEGATIVE`)*
- **Reject Valuation Without Prices** — when missing_price_count gt 0, then emit portfolio.valuation_produced. _Why: Block valuation when any holding has no current price._ *(error: `PORTFOLIO_VALUATION_NO_PRICE`)*
- **Reject Performance Without Benchmark** — when benchmark_index_code not_exists, then emit portfolio.performance_calculated. _Why: Performance measurement requires benchmark index._ *(error: `PORTFOLIO_PERFORMANCE_NO_BENCHMARK`)*
- **Block Update On Closed Portfolio** — when portfolio_status eq "closed", then emit portfolio.holding_updated. _Why: Prevent any changes on a closed portfolio._ *(error: `PORTFOLIO_CLOSED_UPDATE_FORBIDDEN`)*

## Errors it can return

- `PORTFOLIO_DUPLICATE` — Client portfolio code already exists
- `PORTFOLIO_INVALID_ADVISOR` — Advisor code not found on advisor master table
- `PORTFOLIO_INSTRUMENT_UNKNOWN` — Instrument code not found on instrument master
- `PORTFOLIO_AT_HOME_NEGATIVE` — At-home quantity may not exceed total holding quantity
- `PORTFOLIO_VALUATION_NO_PRICE` — Valuation cannot be produced, no market price available for one or more instruments
- `PORTFOLIO_PERFORMANCE_NO_BENCHMARK` — Performance measurement requires a benchmark index to be configured
- `PORTFOLIO_POPIA_VIOLATION` — Personal information capture failed POPIA lawful-basis check
- `PORTFOLIO_CLOSED_UPDATE_FORBIDDEN` — Closed portfolio cannot be modified

## Events

**`portfolio.created`**
  Payload: `client_portfolio_code`, `branch_code`, `partner_code`, `advisor_code`, `created_by`, `timestamp`

**`portfolio.activated`**
  Payload: `client_portfolio_code`, `activated_by`, `timestamp`

**`portfolio.holding_updated`**
  Payload: `client_portfolio_code`, `instrument_code`, `old_quantity`, `new_quantity`, `source`, `timestamp`

**`portfolio.at_home_recorded`**
  Payload: `client_portfolio_code`, `instrument_code`, `at_home_quantity`, `at_home_cost`, `recorded_by`

**`portfolio.valuation_produced`**
  Payload: `client_portfolio_code`, `valuation_date`, `closing_value`, `run_id`

**`portfolio.performance_calculated`**
  Payload: `client_portfolio_code`, `valuation_date`, `performance_return_pct`, `benchmark_index_code`, `benchmark_return_pct`

**`portfolio.suspended`**
  Payload: `client_portfolio_code`, `suspended_by`, `reason`, `timestamp`

**`portfolio.closed`**
  Payload: `client_portfolio_code`, `closed_date`, `closed_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-client-data-upload** *(recommended)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-portfolio-management/) · **Spec source:** [`broker-portfolio-management.blueprint.yaml`](./broker-portfolio-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
