---
title: "Index Data Feeds Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Real-time index calculation and dissemination (equity indices, sector indices, style indices, thematic indices). 8 fields. 4 outcomes. 2 error codes. rules: cal"
---

# Index Data Feeds Blueprint

> Real-time index calculation and dissemination (equity indices, sector indices, style indices, thematic indices)

| | |
|---|---|
| **Feature** | `index-data-feeds` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | indices, index-data, market-barometer, performance-tracking, real-time-calc |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/index-data-feeds.blueprint.yaml) |
| **JSON API** | [index-data-feeds.json]({{ site.baseurl }}/api/blueprints/trading/index-data-feeds.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `index_committee` | Index Committee | human |  |
| `index_calculation_engine` | Index Calculation Engine | system |  |
| `data_vendor` | Data Vendor / Index Provider | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `index_code` | text | Yes | Index Code (e.g. ALSI, TOP40, FINI, RAFI) |  |
| `index_name` | text | Yes | Index Name |  |
| `index_type` | select | Yes | Type (Equity, Sector, Style, Thematic, Factor) |  |
| `base_date` | date | Yes | Base Date (index inception) |  |
| `base_level` | number | Yes | Base Level (starting point, typically 1000 or 10000) |  |
| `constituent_count` | number | No | Number of Constituents |  |
| `current_level` | number | Yes | Current Index Level |  |
| `change_pct` | number | No | Change (%) from prior close |  |

## Rules

- **calculation:**
  - **constituent_selection:** Constituents selected per published methodology (market cap, liquidity, sector weights)
  - **weighting:** Indices are typically market-cap weighted or equal-weighted per methodology
  - **rebalance:** Rebalancing frequency defined per index (quarterly, semi-annual, annual)
  - **corporate_actions:** Index adjusted for splits, dividends (price-return vs total-return variants)
- **dissemination:**
  - **real_time:** Index levels calculated and disseminated in real-time during trading hours
  - **calculation_frequency:** Indices updated at least every 5 seconds during trading
  - **price_source:** Index prices sourced from latest traded/quoted prices only
- **variants:**
  - **price_return:** Excludes dividend income; tracks pure price appreciation
  - **total_return:** Includes reinvested dividends; shows total investor return

## Outcomes

### Calculate_index_level (Priority: 1)

_Calculate current index level from constituent prices_

**Given:**
- `constituent_count` (system) gt `0`

**Then:**
- **call_service** target: `index_calculation_engine`
- **emit_event** event: `index.calculated`

### Disseminate_index_data (Priority: 2)

_Disseminate index level and analytics to subscribers_

**Given:**
- `current_level` (system) exists

**Then:**
- **emit_event** event: `index.disseminated`

### Rebalance_constituents (Priority: 3)

_Perform periodic rebalancing of index constituents_

**Given:**
- `rebalance_frequency` (system) exists

**Then:**
- **emit_event** event: `index.rebalanced`

### Adjust_corporate_action (Priority: 4)

_Adjust index for corporate actions (splits, special dividends)_

**Given:**
- `ca_type` (system) exists

**Then:**
- **emit_event** event: `index.adjusted`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INDEX_CALCULATION_FAILED` | 500 | Index level calculation failed | No |
| `CONSTITUENT_DATA_MISSING` | 400 | Missing price data for one or more constituents | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `index.calculated` |  | `index_code`, `current_level`, `change_pct`, `calculation_time` |
| `index.disseminated` |  | `index_code`, `current_level`, `subscribers_count` |
| `index.rebalanced` |  | `index_code`, `rebalance_date`, `constituent_changes` |
| `index.adjusted` |  | `index_code`, `adjustment_reason`, `adjustment_factor` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| reference-data-management | required |  |
| market-data-mitch-udp | recommended |  |

## AGI Readiness

### Goals

#### Reliable Index Data Feeds

Real-time index calculation and dissemination (equity indices, sector indices, style indices, thematic indices)

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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `reference_data_management` | reference-data-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| calculate_index_level | `autonomous` | - | - |
| disseminate_index_data | `autonomous` | - | - |
| rebalance_constituents | `autonomous` | - | - |
| adjust_corporate_action | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
index_families:
  - family: Headline
    indices:
      - ALSI
      - TOP40
      - FINI40
      - RAFI40
  - family: Sector
    indices:
      - Financial
      - Industrial
      - Resource
      - Technology
  - family: Style
    indices:
      - Value
      - Growth
      - MomentumSmallCap
  - family: Thematic
    indices:
      - SustainabilityIndex
      - ClimateAwareIndex
  - family: Factor
    indices:
      - DividendYield
      - LowVolatility
      - Quality
calculation_rules:
  market_cap_weight: Weight = (Constituent Market Cap) / (Sum of All Market Caps)
  equal_weight: Weight = 1 / (Number of Constituents)
  float_adjusted: Weight based on free-float market cap (excludes locked-up shares)
  capped_weight: Maximum weight per constituent (e.g., 10% cap per large-cap)
corporate_action_adjustments:
  - event: StockSplit
    adjustment: Divisor change to maintain index continuity
  - event: RightsIssue
    adjustment: Price adjustment for dilution
  - event: Dividend
    adjustment: For total-return variant; price-return unaffected
  - event: Delisting
    adjustment: Constituent removed; reweight remaining
dissemination_schedule:
  - frequency: real_time
    interval_sec: 5
    trading_hours_only: true
  - frequency: eod
    time: 17:00
    publication_time: 17:15
  - frequency: historical
    granularity: daily
index_variants:
  - variant: price_return
    description: Excludes dividends
  - variant: total_return
    description: Includes reinvested dividends
  - variant: gross_return
    description: Before withholding tax
  - variant: net_return
    description: After withholding tax
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Index Data Feeds Blueprint",
  "description": "Real-time index calculation and dissemination (equity indices, sector indices, style indices, thematic indices). 8 fields. 4 outcomes. 2 error codes. rules: cal",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "indices, index-data, market-barometer, performance-tracking, real-time-calc"
}
</script>
