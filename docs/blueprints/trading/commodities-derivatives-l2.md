---
title: "Commodities Derivatives L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse commodities and derivatives — sector characteristics, spot and futures pricing, theories of futures returns, roll return, contango and backwardation, co"
---

# Commodities Derivatives L2 Blueprint

> Analyse commodities and derivatives — sector characteristics, spot and futures pricing, theories of futures returns, roll return, contango and backwardation, commodity swaps, and indexes

| | |
|---|---|
| **Feature** | `commodities-derivatives-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternative-investments, commodities, futures, roll-return, contango, backwardation, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/commodities-derivatives-l2.blueprint.yaml) |
| **JSON API** | [commodities-derivatives-l2.json]({{ site.baseurl }}/api/blueprints/trading/commodities-derivatives-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `commodity_analyst` | Commodity Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `commodity_id` | text | Yes | Commodity identifier |  |
| `analysis_type` | select | Yes | pricing \| futures_return \| index \| swap |  |

## Rules

- **commodity_sectors:**
  - **energy:** Oil, natural gas, coal; inelastic demand, supply shocks; OPEC
  - **industrial_metals:** Copper, aluminium; China demand driven
  - **precious_metals:** Gold, silver; store of value; low industrial correlation
  - **livestock:** Hogs, cattle; perishable; seasonal
  - **grains:** Corn, wheat, soy; seasonal supply; storage cost
  - **softs:** Coffee, cocoa, sugar, cotton; weather dependent
- **valuation_of_commodities:**
  - **cost_of_production:** Minimum long-run price floor
  - **value_of_end_use:** Derived from downstream product price
  - **dcf:** Net present value of cash flows generated
  - **comparables:** Historical price ratios, cross-commodity spreads
- **commodity_futures_markets:**
  - **hedgers:** Producers short futures; consumers long futures
  - **speculators:** Provide liquidity; earn risk premium
  - **normal_backwardation:** Hedgers (short) pay speculators risk premium; futures below expected spot
- **spot_and_futures_pricing:**
  - **full_carry:** F0 = S0 × e^{(r + c − y)T} where c=storage cost, y=convenience yield
  - **convenience_yield:** Non-monetary benefit from holding physical (supply disruption buffer)
  - **normal_contango:** F > expected spot (no convenience yield, storage cost high)
  - **normal_backwardation:** F < expected spot (convenience yield high; supply scarcity)
- **theories_of_futures_returns:**
  - **insurance_theory:** Futures return = risk-free + risk premium from hedger demand
  - **hedging_pressure:** Net hedger position determines sign of risk premium
  - **theory_of_storage:** Convenience yield drives backwardation
  - **segmented_markets:** Commodity returns uncorrelated with equity — diversification
- **components_of_futures_returns:**
  - **spot_return:** Change in spot price
  - **roll_yield:** From rolling expiring to next contract
  - **collateral_return:** Return on margin collateral (T-bills)
  - **total_return:** Spot + roll + collateral
- **roll_return:**
  - **contango:** Futures above spot; rolling losses as high-priced futures replace low spot
  - **backwardation:** Futures below spot; rolling gains
- **commodity_swaps:**
  - **total_return_swap:** Receive commodity return; pay fixed or floating
  - **basis_swap:** Exchange one commodity return for another
  - **variance_volatility_swap:** Bet on realised variance vs strike
- **commodity_indexes:**
  - **gsci:** Production-weighted; heavy in energy
  - **bloomberg_commodity:** Diversified; rules-based diversification caps
  - **rebalancing:** Calendar rebalancing generates buy-low, sell-high
  - **rolling_schedule:** Systematic roll from front to next contract
- **validation:**
  - **commodity_required:** commodity_id present
  - **valid_analysis:** analysis_type in [pricing, futures_return, index, swap]

## Outcomes

### Analyse_commodity (Priority: 1)

_Analyse commodity or derivative_

**Given:**
- `commodity_id` (input) exists
- `analysis_type` (input) in `pricing,futures_return,index,swap`

**Then:**
- **call_service** target: `commodity_analyst`
- **emit_event** event: `commodity.analysed`

### Invalid_analysis (Priority: 10) — Error: `COMMODITY_INVALID_ANALYSIS`

_Unsupported analysis type_

**Given:**
- `analysis_type` (input) not_in `pricing,futures_return,index,swap`

**Then:**
- **emit_event** event: `commodity.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMMODITY_INVALID_ANALYSIS` | 400 | analysis_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `commodity.analysed` |  | `commodity_id`, `analysis_type`, `spot_price`, `futures_price`, `roll_return`, `total_return` |
| `commodity.rejected` |  | `commodity_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forward-commitments-valuation-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Commodities Derivatives L2 Blueprint",
  "description": "Analyse commodities and derivatives — sector characteristics, spot and futures pricing, theories of futures returns, roll return, contango and backwardation, co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternative-investments, commodities, futures, roll-return, contango, backwardation, cfa-level-2"
}
</script>
