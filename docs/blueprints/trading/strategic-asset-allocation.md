---
title: "Strategic Asset Allocation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Set long-horizon strategic asset allocation using capital market expectations, investor IPS, and portfolio construction principles, and describe new development"
---

# Strategic Asset Allocation Blueprint

> Set long-horizon strategic asset allocation using capital market expectations, investor IPS, and portfolio construction principles, and describe new developments and ESG integration

| | |
|---|---|
| **Feature** | `strategic-asset-allocation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, strategic-allocation, cme, rebalancing, esg-integration, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/strategic-asset-allocation.blueprint.yaml) |
| **JSON API** | [strategic-asset-allocation.json]({{ site.baseurl }}/api/blueprints/trading/strategic-asset-allocation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `saa_engine` | Strategic Asset Allocation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `saa_id` | text | Yes | SAA identifier |  |
| `horizon_years` | number | Yes | Investment horizon in years |  |
| `rebalance_frequency` | select | Yes | calendar \| threshold \| hybrid |  |

## Rules

- **saa_principles:**
  - **core_idea:** Establish long-run asset mix consistent with IPS objectives and constraints
  - **policy_portfolio:** SAA becomes benchmark; deviations reflect tactical tilts
- **capital_market_expectations:**
  - **inputs:** Expected returns, volatilities, correlations for asset classes
  - **sources:** Historical data, building-block approach, equilibrium models
- **portfolio_construction_principles:**
  - **diversification:** Across assets, sectors, geographies
  - **risk_budget:** Allocate ex-ante risk to each exposure
  - **cost_awareness:** Minimise fees, taxes, market impact
- **rebalancing_policy:**
  - **calendar:** Fixed dates — simple, no path dependence
  - **threshold:** Deviation band triggers trade — captures vol efficiently
  - **hybrid:** Calendar with tolerance bands
- **new_developments:**
  - **liability_driven:** Match assets to liabilities for DB pensions and insurers
  - **risk_parity:** Equal risk contribution across assets
  - **factor_investing:** Target priced factor exposures directly
  - **alternative_beta:** Systematic alt risk premia
- **esg_integration:**
  - **approaches:** Exclusion, best-in-class, integration, thematic, impact
- **validation:**
  - **saa_required:** saa_id present
  - **positive_horizon:** horizon_years > 0
  - **valid_frequency:** rebalance_frequency in [calendar, threshold, hybrid]

## Outcomes

### Build_saa (Priority: 1)

_Build strategic asset allocation_

**Given:**
- `saa_id` (input) exists
- `horizon_years` (input) gt `0`
- `rebalance_frequency` (input) in `calendar,threshold,hybrid`

**Then:**
- **call_service** target: `saa_engine`
- **emit_event** event: `saa.built`

### Invalid_frequency (Priority: 10) — Error: `SAA_INVALID_FREQUENCY`

_Unsupported rebalance frequency_

**Given:**
- `rebalance_frequency` (input) not_in `calendar,threshold,hybrid`

**Then:**
- **emit_event** event: `saa.rejected`

### Invalid_horizon (Priority: 11) — Error: `SAA_INVALID_HORIZON`

_Non-positive horizon_

**Given:**
- `horizon_years` (input) lte `0`

**Then:**
- **emit_event** event: `saa.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SAA_INVALID_FREQUENCY` | 400 | rebalance_frequency must be calendar, threshold, or hybrid | No |
| `SAA_INVALID_HORIZON` | 400 | horizon_years must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `saa.built` |  | `saa_id`, `allocation`, `expected_return`, `expected_volatility` |
| `saa.rejected` |  | `saa_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| investment-policy-statement-ips | required |  |
| portfolio-efficient-frontier | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Strategic Asset Allocation Blueprint",
  "description": "Set long-horizon strategic asset allocation using capital market expectations, investor IPS, and portfolio construction principles, and describe new development",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, strategic-allocation, cme, rebalancing, esg-integration, cfa-level-1"
}
</script>
