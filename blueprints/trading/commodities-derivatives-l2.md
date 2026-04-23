<!-- AUTO-GENERATED FROM commodities-derivatives-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Commodities Derivatives L2

> Analyse commodities and derivatives — sector characteristics, spot and futures pricing, theories of futures returns, roll return, contango and backwardation, commodity swaps, and indexes

**Category:** Trading · **Version:** 1.0.0 · **Tags:** alternative-investments · commodities · futures · roll-return · contango · backwardation · cfa-level-2

## What this does

Analyse commodities and derivatives — sector characteristics, spot and futures pricing, theories of futures returns, roll return, contango and backwardation, commodity swaps, and indexes

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **commodity_id** *(text, required)* — Commodity identifier
- **analysis_type** *(select, required)* — pricing | futures_return | index | swap

## What must be true

- **commodity_sectors → energy:** Oil, natural gas, coal; inelastic demand, supply shocks; OPEC
- **commodity_sectors → industrial_metals:** Copper, aluminium; China demand driven
- **commodity_sectors → precious_metals:** Gold, silver; store of value; low industrial correlation
- **commodity_sectors → livestock:** Hogs, cattle; perishable; seasonal
- **commodity_sectors → grains:** Corn, wheat, soy; seasonal supply; storage cost
- **commodity_sectors → softs:** Coffee, cocoa, sugar, cotton; weather dependent
- **valuation_of_commodities → cost_of_production:** Minimum long-run price floor
- **valuation_of_commodities → value_of_end_use:** Derived from downstream product price
- **valuation_of_commodities → dcf:** Net present value of cash flows generated
- **valuation_of_commodities → comparables:** Historical price ratios, cross-commodity spreads
- **commodity_futures_markets → hedgers:** Producers short futures; consumers long futures
- **commodity_futures_markets → speculators:** Provide liquidity; earn risk premium
- **commodity_futures_markets → normal_backwardation:** Hedgers (short) pay speculators risk premium; futures below expected spot
- **spot_and_futures_pricing → full_carry:** F0 = S0 × e^{(r + c − y)T} where c=storage cost, y=convenience yield
- **spot_and_futures_pricing → convenience_yield:** Non-monetary benefit from holding physical (supply disruption buffer)
- **spot_and_futures_pricing → normal_contango:** F > expected spot (no convenience yield, storage cost high)
- **spot_and_futures_pricing → normal_backwardation:** F < expected spot (convenience yield high; supply scarcity)
- **theories_of_futures_returns → insurance_theory:** Futures return = risk-free + risk premium from hedger demand
- **theories_of_futures_returns → hedging_pressure:** Net hedger position determines sign of risk premium
- **theories_of_futures_returns → theory_of_storage:** Convenience yield drives backwardation
- **theories_of_futures_returns → segmented_markets:** Commodity returns uncorrelated with equity — diversification
- **components_of_futures_returns → spot_return:** Change in spot price
- **components_of_futures_returns → roll_yield:** From rolling expiring to next contract
- **components_of_futures_returns → collateral_return:** Return on margin collateral (T-bills)
- **components_of_futures_returns → total_return:** Spot + roll + collateral
- **roll_return → contango:** Futures above spot; rolling losses as high-priced futures replace low spot
- **roll_return → backwardation:** Futures below spot; rolling gains
- **commodity_swaps → total_return_swap:** Receive commodity return; pay fixed or floating
- **commodity_swaps → basis_swap:** Exchange one commodity return for another
- **commodity_swaps → variance_volatility_swap:** Bet on realised variance vs strike
- **commodity_indexes → gsci:** Production-weighted; heavy in energy
- **commodity_indexes → bloomberg_commodity:** Diversified; rules-based diversification caps
- **commodity_indexes → rebalancing:** Calendar rebalancing generates buy-low, sell-high
- **commodity_indexes → rolling_schedule:** Systematic roll from front to next contract
- **validation → commodity_required:** commodity_id present
- **validation → valid_analysis:** analysis_type in [pricing, futures_return, index, swap]

## Success & failure scenarios

**✅ Success paths**

- **Analyse Commodity** — when commodity_id exists; analysis_type in ["pricing","futures_return","index","swap"], then call service; emit commodity.analysed. _Why: Analyse commodity or derivative._

**❌ Failure paths**

- **Invalid Analysis** — when analysis_type not_in ["pricing","futures_return","index","swap"], then emit commodity.rejected. _Why: Unsupported analysis type._ *(error: `COMMODITY_INVALID_ANALYSIS`)*

## Errors it can return

- `COMMODITY_INVALID_ANALYSIS` — analysis_type must be one of the supported types

## Events

**`commodity.analysed`**
  Payload: `commodity_id`, `analysis_type`, `spot_price`, `futures_price`, `roll_return`, `total_return`

**`commodity.rejected`**
  Payload: `commodity_id`, `reason_code`

## Connects to

- **natural-resources-commodities** *(recommended)* — Natural resources and commodities L1 coverage is the prerequisite foundation for this L2 derivatives treatment
- **forward-commitments-valuation-l2** *(recommended)*

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/commodities-derivatives-l2/) · **Spec source:** [`commodities-derivatives-l2.blueprint.yaml`](./commodities-derivatives-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
