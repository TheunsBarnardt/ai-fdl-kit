---
title: "Instrument Classification Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and char"
---

# Instrument Classification Blueprint

> Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and characteristics.

| | |
|---|---|
| **Feature** | `instrument-classification` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | instruments, classification, derivatives, bonds, equities, structured-products, reference-data |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/instrument-classification.blueprint.yaml) |
| **JSON API** | [instrument-classification.json]({{ site.baseurl }}/api/blueprints/trading/instrument-classification.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_data_provider` | Market Data Provider | system |  |
| `trading_system` | Trading System | system |  |
| `market_participant` | Market Participant | external |  |
| `exchange_authority` | Exchange Authority | system |  |
| `clearing_house` | Clearing House | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `instrument_type_code` | text | Yes | Instrument Type Code |  |
| `instrument_name` | text | Yes | Instrument Name |  |
| `contract_code` | text | No | Contract Code |  |
| `isin` | text | No | ISIN |  |
| `underlying_asset` | text | No | Underlying Asset |  |
| `expiry_date` | date | No | Expiry Date |  |
| `strike_price` | number | No | Strike Price |  |
| `contract_size` | number | No | Contract Size |  |
| `settlement_type` | select | No | Settlement Type |  |
| `trading_currency` | text | No | Trading Currency |  |
| `market_segment` | select | No | Market Segment |  |

## States

**State field:** `instrument_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `[object Object]` | Yes |  |
| `[object Object]` |  |  |
| `[object Object]` |  |  |
| `[object Object]` |  |  |
| `[object Object]` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `new` | `pre_listing` | exchange_authority | Reference data complete and trading parameters defined |
|  | `pre_listing` | `active_trading` | trading_system | Opening date reached |
|  | `active_trading` | `suspended` | exchange_authority | Corporate action or compliance issue |
|  | `suspended` | `active_trading` | trading_system | Suspension reason resolved |
|  | `active_trading` | `delisted` | exchange_authority | Expiry date reached or regulatory delisting |

## Rules

- **equity_derivatives:**
  - **futures_single_stock:** Single stock futures settled physically or cash
  - **futures_index:** Index futures on JSE indices with mini and standard sizes
  - **options_equity:** Equity options with American or European exercise
  - **options_index:** Index options with standard strike intervals
  - **warrant_equity:** Call and put warrants on single stocks
  - **cfds_equity:** Margined contracts settled in cash
- **fixed_income_instruments:**
  - **vanilla_bonds:** Fixed coupon bonds with semi-annual payments
  - **floating_rate_notes:** Coupon linked to floating rate index (JIBAR-based)
  - **amortising_bonds:** Nominal reducing over time with quarterly reductions
  - **inflation_linked:** Principal and coupon adjusted for CPI
  - **commercial_paper:** Short-term money market paper issued at discount
  - **perpetuities:** Instruments with no maturity date
  - **credit_linked_notes:** Bonds with embedded credit derivatives
  - **convertible_bonds:** Bonds convertible into equity at specified price
- **structured_products:**
  - **equity_structured_notes:** Debt instruments financing equity purchases
  - **callable_bonds:** Issuer has redemption right before maturity
  - **putable_bonds:** Bondholder has sell-back right before maturity
  - **basket_products:** Underlying comprises multiple assets
  - **exotic_options:** Non-standard options on stocks or indices
- **currency_derivatives:**
  - **currency_futures:** Futures on currency pairs (USDZAR, etc.)
  - **currency_options:** Options on currency pairs
  - **currency_cfds:** Margined currency contracts
  - **quanto_derivatives:** Derivatives with embedded FX conversion
- **reference_data_requirements:**
  - **contract_code_format:** Alphanumeric format derived from expiry, underlying, settlement
  - **isin_requirement:** All tradable instruments assigned unique ISIN
  - **tick_structure:** Defined tick sizes by price range
  - **settlement_period:** T+3 for equities; T+0 to T+2 for derivatives
  - **market_segments:** Main Board, AltX, BOND, Derivatives, Warrant

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| reference_data_publication | 1 day |  |
| contract_code_assignment | 1 day |  |

## Outcomes

### Instrument_created (Priority: 1) — Error: `INSTRUMENT_CREATED`

_New instrument created and added to reference data system_

**Given:**
- New instrument approved for listing
- `instrument_type_code` (input) exists
- `underlying_asset` (input) exists
- `contract_size` (input) gt `0`

**Then:**
- **create_record** target: `instruments`
- **transition_state** field: `instrument_status` from: `new` to: `pre_listing`
- **emit_event** event: `instrument.created`

**Result:** Instrument created in reference data

### Contract_code_assigned (Priority: 2) — Error: `CONTRACT_CODE_ASSIGNED`

_Contract code generated and published to market participants_

**Given:**
- Instrument in pre_listing status
- All contract code components available
- ANY: `instrument_type_code` (db) matches `FUTURE|OPTION`

**Then:**
- **create_record** target: `contract_codes`
- **emit_event** event: `contract_code.assigned`

**Result:** Contract code generated and published

### Trading_parameters_configured (Priority: 3) — Error: `TRADING_PARAMETERS_CONFIGURED`

_Trading parameters including tick size and price limits configured_

**Given:**
- Instrument in pre_listing status
- `contract_size` (input) exists

**Then:**
- **emit_event** event: `trading_parameters.configured`
- **notify**

**Result:** Trading parameters configured

### Instrument_trading_opened (Priority: 4) — Error: `INSTRUMENT_TRADING_OPENED`

_Instrument opened for trading in specified market segment_

**Given:**
- Instrument in pre_listing status
- Opening date reached
- All approvals obtained

**Then:**
- **transition_state** field: `instrument_status` from: `pre_listing` to: `active_trading`
- **emit_event** event: `instrument.trading_opened`

**Result:** Instrument begins trading

### Corporate_action_declared (Priority: 5) — Error: `CORPORATE_ACTION_DECLARED`

_Corporate action declared and reference data updated with ex-markers_

**Given:**
- Instrument is active_trading
- Corporate action declared
- ANY: `corporate_action_type` (input) matches `dividend|rights|bonus`

**Then:**
- **emit_event** event: `corporate_action.declared`

**Result:** Corporate action reference data updated

### Instrument_suspended (Priority: 6) — Error: `INSTRUMENT_SUSPENDED`

_Trading suspended for corporate action processing or compliance_

**Given:**
- Instrument is active_trading
- Corporate action ex-date reached

**Then:**
- **transition_state** field: `instrument_status` from: `active_trading` to: `suspended`
- **emit_event** event: `instrument.suspended`

**Result:** Trading suspended for corporate action

### Instrument_trading_resumed (Priority: 7) — Error: `INSTRUMENT_TRADING_RESUMED`

_Trading resumed after suspension or corporate action processing_

**Given:**
- Instrument is suspended
- Suspension reason resolved

**Then:**
- **transition_state** field: `instrument_status` from: `suspended` to: `active_trading`
- **emit_event** event: `instrument.trading_resumed`

**Result:** Trading resumed

### Instrument_expired (Priority: 8) — Error: `INSTRUMENT_EXPIRED`

_Instrument delisted after expiry date reached and final settlement completed_

**Given:**
- Instrument is active_trading
- Expiry date has been reached
- `instrument_type_code` (db) matches `FUTURE|OPTION|WARRANT`

**Then:**
- **transition_state** field: `instrument_status` from: `active_trading` to: `delisted`
- **emit_event** event: `instrument.expired`

**Result:** Instrument delisted after expiry

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSTRUMENT_CREATED` | 409 | Instrument created and added to reference data | No |
| `CONTRACT_CODE_ASSIGNED` | 409 | Contract code generated and published | No |
| `TRADING_PARAMETERS_CONFIGURED` | 409 | Trading parameters configured | No |
| `INSTRUMENT_TRADING_OPENED` | 409 | Instrument opened for trading | No |
| `CORPORATE_ACTION_DECLARED` | 422 | Corporate action declared | No |
| `INSTRUMENT_SUSPENDED` | 423 | Trading suspended | No |
| `INSTRUMENT_TRADING_RESUMED` | 409 | Trading resumed | No |
| `INSTRUMENT_EXPIRED` | 409 | Instrument expired and delisted | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `instrument.created` |  | `instrument_type_code`, `underlying_asset`, `contract_size` |
| `contract_code.assigned` |  | `contract_code`, `isin`, `instrument_type_code` |
| `trading_parameters.configured` |  | `instrument_type_code`, `tick_size`, `contract_size` |
| `instrument.trading_opened` |  | `instrument_type_code`, `opening_date`, `market_segment` |
| `corporate_action.declared` |  | `instrument_type_code`, `ex_date`, `record_date` |
| `instrument.suspended` |  | `instrument_type_code`, `suspension_date`, `reason` |
| `instrument.trading_resumed` |  | `instrument_type_code`, `resumption_date` |
| `instrument.expired` |  | `instrument_type_code`, `expiry_date`, `settlement_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| listings-requirements | required |  |
| settlement-and-clearing | recommended |  |
| market-data-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Instrument Classification

Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and characteristics.

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
| `listings_requirements` | listings-requirements | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| instrument_created | `supervised` | - | - |
| contract_code_assigned | `autonomous` | - | - |
| trading_parameters_configured | `autonomous` | - | - |
| instrument_trading_opened | `autonomous` | - | - |
| corporate_action_declared | `autonomous` | - | - |
| instrument_suspended | `human_required` | - | - |
| instrument_trading_resumed | `autonomous` | - | - |
| instrument_expired | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
instrument_types:
  SFS:
    code: SFS
    name: Single Stock Futures
    characteristics:
      - Physical or cash settlement
      - Monthly/Quarterly expiry
    listing_requirements:
      - Underlying must be liquid JSE-listed equity
      - Minimum notional value
  IFS:
    code: IFS
    name: Index Futures
    characteristics:
      - Cash-settled
      - Quarterly expiry
      - Standard and Mini sizes available
    listing_requirements:
      - Available on all major JSE indices
  EQO:
    code: EQO
    name: Equity Options
    characteristics:
      - European or American exercise
      - Strike intervals vary by price
      - Monthly expiry
    listing_requirements:
      - Underlying security must be sufficiently liquid
  IXO:
    code: IXO
    name: Index Options
    characteristics:
      - European exercise
      - Strike intervals 50-250 points
      - Monthly/Quarterly
    listing_requirements:
      - Available on JSE indices
  WNT:
    code: WNT
    name: Warrants
    characteristics:
      - Call and Put types
      - Issuer-defined strikes and ratios
      - Months to years maturity
    listing_requirements:
      - Warrant issuer must be approved financial institution
  BND:
    code: BND
    name: Vanilla Bonds
    characteristics:
      - Fixed coupon semi-annual
      - Fixed maturity date
      - T+1 or T+3 settlement
    listing_requirements:
      - Financial statements required
      - Prospectus/listing particulars
  FRN:
    code: FRN
    name: Floating Rate Notes
    characteristics:
      - Coupon linked to JIBAR plus spread
      - Quarterly/semi-annual reset
      - Medium-term maturity
    listing_requirements:
      - Issuer creditworthiness assessment required
  CPI:
    code: CPI
    name: Inflation-Linked Bonds
    characteristics:
      - Principal and coupon indexed to CPI
      - Real yield fixed
      - Medium to long-term
    listing_requirements:
      - Financial statements and inflation history
  CP:
    code: CP
    name: Commercial Paper
    characteristics:
      - Short-term less than 365 days
      - Issued at discount
      - Money market segment
    listing_requirements:
      - May be unrated or rated
reference_data_files:
  InstrumentsEquity:
    csv_file: InstrumentsEquity.csv
    content: Equities and preference shares with description and sector
    frequency: Daily
  InstrumentsFuture:
    csv_file: InstrumentsFuture.csv
    content: All futures contracts with underlying and settlement details
    frequency: Daily
  InstrumentsOption:
    csv_file: InstrumentsOption.csv
    content: Equity and index options with strike and expiry data
    frequency: Daily
  WarrantsDetail:
    csv_file: WarrantsDetail.csv
    content: Warrant specifications including strike, ratio, and issuer
    frequency: Daily
  CorporateActionIndicator:
    csv_file: CorporateActionIndicatorTable.csv
    content: Ex-markers and annotations per instrument
    frequency: Daily
  TickStructures:
    csv_file: TickStructureEntries.csv
    content: Tick sizes per price range by instrument
    frequency: Daily
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Instrument Classification Blueprint",
  "description": "Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and char",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "instruments, classification, derivatives, bonds, equities, structured-products, reference-data"
}
</script>
