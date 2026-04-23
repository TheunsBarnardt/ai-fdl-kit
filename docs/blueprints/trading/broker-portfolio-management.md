---
title: "Broker Portfolio Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home ho"
---

# Broker Portfolio Management Blueprint

> Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home holdings, valuation statements,...

| | |
|---|---|
| **Feature** | `broker-portfolio-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, portfolio, holdings, valuation, performance-measurement, unlisted-securities, at-home-holdings, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-portfolio-management.blueprint.yaml) |
| **JSON API** | [broker-portfolio-management.json]({{ site.baseurl }}/api/blueprints/trading/broker-portfolio-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `portfolio_administrator` | Portfolio Administrator | human | Maintains client portfolio master data, advisors, investment types |
| `client_advisor` | Client Advisor | human | Holds advisor code assigned to one or more client portfolios |
| `compliance_officer` | Compliance Officer | human |  |
| `portfolio_system` | Portfolio Calculation System | system |  |
| `trading_back_office` | Trading Back-Office System | system | Source of trade transactions that update portfolio holdings |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_portfolio_code` | text | Yes | Client Portfolio Code |  |
| `branch_code` | text | Yes | Branch Code |  |
| `partner_code` | text | Yes | Partner Code |  |
| `advisor_code` | text | Yes | Advisor Code |  |
| `investment_type_code` | text | No | Investment Type Code |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `instrument_class` | select | Yes | Instrument Class |  |
| `unlisted_sector_code` | text | No | Unlisted Sector Code |  |
| `holding_quantity` | number | Yes | Holding Quantity |  |
| `holding_cost` | number | Yes | Holding Cost |  |
| `market_value` | number | No | Current Market Value |  |
| `at_home_indicator` | boolean | No | At Home Indicator |  |
| `at_home_quantity` | number | No | Quantity Held At Home |  |
| `at_home_cost` | number | No | Cost of Holdings Held At Home |  |
| `bond_clean_price_flag` | boolean | No | Value Bonds At Clean Price |  |
| `benchmark_index_code` | text | No | Benchmark Index Code |  |
| `portfolio_status` | select | Yes | Portfolio Status |  |
| `language_indicator` | select | No | Statement Language Indicator |  |
| `valuation_date` | date | No | Valuation Date |  |
| `opening_value` | number | No | Opening Valuation Value |  |
| `closing_value` | number | No | Closing Valuation Value |  |
| `performance_return_pct` | number | No | Period Performance Return Percentage |  |
| `cash_movement_total` | number | No | Net Cash Movement In Period |  |
| `dividend_income` | number | No | Dividend And Earnings Income |  |
| `closed_date` | date | No | Portfolio Closed Date |  |

## States

**State field:** `portfolio_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `active` |  |  |
| `suspended` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `active` | portfolio_administrator |  |
|  | `active` | `suspended` | compliance_officer |  |
|  | `suspended` | `active` | compliance_officer |  |
|  | `active` | `closed` | portfolio_administrator |  |

## Rules

- **data_integrity:**
  - **holdings_auto_update:** Holdings update automatically from trading back-office transactions, manual load only for at-home and unlisted
  - **unique_portfolio_code:** Client portfolio code must be unique within the broker firm
  - **instrument_reference:** Every holding must reference an active instrument record on the instruments master
  - **unlisted_sector_mandatory:** Unlisted securities and assets must be linked to an unlisted sector code, otherwise default sector applied
  - **audit_trail:** All master-data and holding changes logged with user, timestamp, old/new values
- **security:**
  - **resource_access_control:** Each screen controlled via resource access control facility, view vs update permissions separate
  - **segregation_of_duties:** Portfolio closure and suspension require separate actor from day-to-day maintenance operator
  - **no_pii_on_statements_logs:** Valuation statements must not log full ID or tax numbers in system logs
- **compliance:**
  - **popia_personal_info:** Client name, address, and holdings are personal information under POPIA and require documented lawful basis
  - **popia_cross_border:** Statements must not be emailed across borders without client consent and adequate-protection check per POPIA s.72
  - **statement_retention:** Valuation statements retained for minimum regulatory period (typically 5 years)
  - **tax_classification:** Dividend and earnings data tagged for IT3B tax-certificate production
- **business:**
  - **grouping_hierarchy:** Portfolios grouped by Broker > Branch > Partner > Advisor > Client for all reports and statements
  - **investment_type_grouping:** Portfolios additionally grouped by user-defined investment type codes for enquiry views
  - **at_home_cost_default:** If no cost supplied when receiving at-home scrip, cost defaults to previous trading-day close market value
  - **bond_valuation_method:** Bonds may be valued at clean price or all-in price per broker preference flag
  - **performance_vs_index:** Portfolio return measured against selected benchmark index over the valuation period
  - **valuation_sequence:** Valuation statements produced in Broker, Branch, Partner, Advisor, then alpha or numeric client sequence

## Outcomes

### Register_client_portfolio (Priority: 1) | Transaction: atomic

_Administrator registers a new client portfolio with required grouping codes_

**Given:**
- `client_portfolio_code` (input) exists
- `branch_code` (input) exists
- `partner_code` (input) exists
- `advisor_code` (input) exists

**Then:**
- **create_record**
- **set_field** target: `portfolio_status` value: `pending`
- **emit_event** event: `portfolio.created`

### Reject_duplicate_portfolio (Priority: 2) — Error: `PORTFOLIO_DUPLICATE`

_Prevent duplicate portfolio codes within broker_

**Given:**
- `client_portfolio_code` (db) exists

**Then:**
- **emit_event** event: `portfolio.created`

### Reject_unknown_advisor (Priority: 3) — Error: `PORTFOLIO_INVALID_ADVISOR`

_Advisor code must exist on advisor master_

**Given:**
- `advisor_code` (db) not_exists

**Then:**
- **emit_event** event: `portfolio.created`

### Update_holding_from_trade (Priority: 4)

_Trading back-office transaction automatically updates portfolio holding quantity and cost_

**Given:**
- `source` (system) eq `trading_back_office`
- `portfolio_status` (db) eq `active`

**Then:**
- **set_field** target: `holding_quantity` value: `updated`
- **set_field** target: `holding_cost` value: `updated`
- **emit_event** event: `portfolio.holding_updated`

### Record_at_home_holding (Priority: 5) | Transaction: atomic

_Operator records an at-home holding, cost defaults to previous close when blank_

**Given:**
- `at_home_quantity` (input) gt `0`
- `at_home_quantity` (input) lte `holding_quantity`

**Then:**
- **set_field** target: `at_home_indicator` value: `true`
- **set_field** target: `at_home_cost` value: `default_previous_close`
- **emit_event** event: `portfolio.at_home_recorded`

### Reject_excess_at_home_quantity (Priority: 6) — Error: `PORTFOLIO_AT_HOME_NEGATIVE`

_At-home quantity may not exceed total holding_

**Given:**
- `at_home_quantity` (input) gt `holding_quantity`

**Then:**
- **emit_event** event: `portfolio.at_home_recorded`

### Produce_valuation_statement (Priority: 7) | Transaction: atomic

_System produces a client valuation statement for a given valuation date_

**Given:**
- `portfolio_status` (db) eq `active`
- `valuation_date` (input) exists

**Then:**
- **call_service** target: `valuation_calculator`
- **set_field** target: `closing_value` value: `calculated`
- **emit_event** event: `portfolio.valuation_produced`

### Reject_valuation_without_prices (Priority: 8) — Error: `PORTFOLIO_VALUATION_NO_PRICE`

_Block valuation when any holding has no current price_

**Given:**
- `missing_price_count` (computed) gt `0`

**Then:**
- **emit_event** event: `portfolio.valuation_produced`

### Calculate_performance_vs_benchmark (Priority: 9)

_Calculate period return and compare to configured benchmark index_

**Given:**
- `benchmark_index_code` (db) exists
- `opening_value` (db) gt `0`

**Then:**
- **call_service** target: `performance_measurement_engine`
- **set_field** target: `performance_return_pct` value: `calculated`
- **emit_event** event: `portfolio.performance_calculated`

### Reject_performance_without_benchmark (Priority: 10) — Error: `PORTFOLIO_PERFORMANCE_NO_BENCHMARK`

_Performance measurement requires benchmark index_

**Given:**
- `benchmark_index_code` (db) not_exists

**Then:**
- **emit_event** event: `portfolio.performance_calculated`

### Close_portfolio (Priority: 11) | Transaction: atomic

_Administrator closes a portfolio at end of client relationship_

**Given:**
- `portfolio_status` (db) eq `active`
- `user_role` (session) eq `portfolio_administrator`

**Then:**
- **transition_state** field: `portfolio_status` from: `active` to: `closed`
- **set_field** target: `closed_date` value: `today`
- **emit_event** event: `portfolio.closed`

### Block_update_on_closed_portfolio (Priority: 12) — Error: `PORTFOLIO_CLOSED_UPDATE_FORBIDDEN`

_Prevent any changes on a closed portfolio_

**Given:**
- `portfolio_status` (db) eq `closed`

**Then:**
- **emit_event** event: `portfolio.holding_updated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORTFOLIO_DUPLICATE` | 409 | Client portfolio code already exists | No |
| `PORTFOLIO_INVALID_ADVISOR` | 400 | Advisor code not found on advisor master table | No |
| `PORTFOLIO_INSTRUMENT_UNKNOWN` | 404 | Instrument code not found on instrument master | No |
| `PORTFOLIO_AT_HOME_NEGATIVE` | 422 | At-home quantity may not exceed total holding quantity | No |
| `PORTFOLIO_VALUATION_NO_PRICE` | 422 | Valuation cannot be produced, no market price available for one or more instruments | No |
| `PORTFOLIO_PERFORMANCE_NO_BENCHMARK` | 422 | Performance measurement requires a benchmark index to be configured | No |
| `PORTFOLIO_POPIA_VIOLATION` | 422 | Personal information capture failed POPIA lawful-basis check | No |
| `PORTFOLIO_CLOSED_UPDATE_FORBIDDEN` | 409 | Closed portfolio cannot be modified | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.created` |  | `client_portfolio_code`, `branch_code`, `partner_code`, `advisor_code`, `created_by`, `timestamp` |
| `portfolio.activated` |  | `client_portfolio_code`, `activated_by`, `timestamp` |
| `portfolio.holding_updated` |  | `client_portfolio_code`, `instrument_code`, `old_quantity`, `new_quantity`, `source`, `timestamp` |
| `portfolio.at_home_recorded` |  | `client_portfolio_code`, `instrument_code`, `at_home_quantity`, `at_home_cost`, `recorded_by` |
| `portfolio.valuation_produced` |  | `client_portfolio_code`, `valuation_date`, `closing_value`, `run_id` |
| `portfolio.performance_calculated` |  | `client_portfolio_code`, `valuation_date`, `performance_return_pct`, `benchmark_index_code`, `benchmark_return_pct` |
| `portfolio.suspended` |  | `client_portfolio_code`, `suspended_by`, `reason`, `timestamp` |
| `portfolio.closed` |  | `client_portfolio_code`, `closed_date`, `closed_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-client-data-upload | recommended |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Portfolio Management

Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home holdings, valuation statements,...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| register_client_portfolio | `autonomous` | - | - |
| reject_duplicate_portfolio | `supervised` | - | - |
| reject_unknown_advisor | `supervised` | - | - |
| update_holding_from_trade | `supervised` | - | - |
| record_at_home_holding | `autonomous` | - | - |
| reject_excess_at_home_quantity | `supervised` | - | - |
| produce_valuation_statement | `autonomous` | - | - |
| reject_valuation_without_prices | `supervised` | - | - |
| calculate_performance_vs_benchmark | `autonomous` | - | - |
| reject_performance_without_benchmark | `supervised` | - | - |
| close_portfolio | `autonomous` | - | - |
| block_update_on_closed_portfolio | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  MENUP: Portfolio Main Menu
  CLTM: Client Portfolio Maintenance
  ARMNT: Account Relationships
  OPMN: Processing Parameter Maintenance
  T.ADV: Advisor Codes Table
  T.ITC: Investment Type Codes Table
  T.VSC: Unlisted Sector Table
  INSTM: Instruments Master
  UNMN: Unlisted Assets Maintenance
  UNDV: Unlisted Dividends and Earnings
  HLDG: Portfolio Holdings Maintenance
  EQPF: Equity and Unit Trust Valuation Enquiry
  GLPF: Bond Portfolio Enquiry
  OPPF: Option Portfolio Enquiry
  SMPF: Summary Portfolio Enquiry
  UNPF: Unlisted Portfolio Enquiry
  HLDS: Holdings List Enquiry
  HLDE: Holdings Enquiry Extension
  SHLT: Shareholder Enquiry
  HIST: Portfolio History Enquiry
  ORDR: Orders and Deals Enquiry
  AMOD: Portfolio Modelling
  EMOD: Portfolio Model Edit Facility
  DMOD: Portfolio Model Display
  RPROC: Browse Process Requests
  RPRT: Valuation Print Release
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Portfolio Management Blueprint",
  "description": "Internal back-office portfolio management for client investment holdings across equities, warrants, bonds, unit trusts and unlisted assets, including at-home ho",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, portfolio, holdings, valuation, performance-measurement, unlisted-securities, at-home-holdings, popia"
}
</script>
