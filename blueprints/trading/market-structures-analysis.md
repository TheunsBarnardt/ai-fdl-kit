<!-- AUTO-GENERATED FROM market-structures-analysis.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Market Structures Analysis

> Classify an industry by market structure — perfect competition, monopolistic competition, oligopoly, or monopoly — and infer pricing power, entry barriers, and profitability implications

**Category:** Trading · **Version:** 1.0.0 · **Tags:** economics · microeconomics · market-structure · perfect-competition · monopoly · cfa-level-1

## What this does

Classify an industry by market structure — perfect competition, monopolistic competition, oligopoly, or monopoly — and infer pricing power, entry barriers, and profitability implications

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **number_of_sellers** *(select, required)* — many | many_differentiated | few | one
- **product_differentiation** *(select, required)* — homogeneous | differentiated
- **barriers_to_entry** *(select, required)* — none | low | high | very_high
- **pricing_power** *(select, optional)* — price_taker | limited | substantial | price_maker

## What must be true

- **four_structures → perfect_competition → sellers:** many
- **four_structures → perfect_competition → product:** homogeneous
- **four_structures → perfect_competition → entry:** none
- **four_structures → perfect_competition → pricing:** price_taker
- **four_structures → perfect_competition → demand:** perfectly_elastic
- **four_structures → perfect_competition → long_run_profit:** zero_economic_profit
- **four_structures → monopolistic_competition → sellers:** many
- **four_structures → monopolistic_competition → product:** differentiated
- **four_structures → monopolistic_competition → entry:** low
- **four_structures → monopolistic_competition → pricing:** limited
- **four_structures → monopolistic_competition → demand:** downward_sloping_elastic
- **four_structures → monopolistic_competition → long_run_profit:** zero_economic_profit
- **four_structures → oligopoly → sellers:** few
- **four_structures → oligopoly → product:** either
- **four_structures → oligopoly → entry:** high
- **four_structures → oligopoly → pricing:** substantial
- **four_structures → oligopoly → demand:** kinked_or_game_theoretic
- **four_structures → oligopoly → long_run_profit:** can_persist_with_barriers
- **four_structures → monopoly → sellers:** one
- **four_structures → monopoly → product:** unique
- **four_structures → monopoly → entry:** very_high
- **four_structures → monopoly → pricing:** price_maker
- **four_structures → monopoly → demand:** market_demand
- **four_structures → monopoly → long_run_profit:** positive_with_barriers
- **key_questions:** How many firms compete?, Are products identical or differentiated?, Are there barriers to entry?, Do firms compete on price or other dimensions?
- **investment_implications → perfect_competition:** Commodity-like returns; no sustainable margin
- **investment_implications → monopolistic_competition:** Brand moats; temporary economic profit
- **investment_implications → oligopoly:** Game theory dominates; coordination risk
- **investment_implications → monopoly:** Highest margins but regulatory/antitrust risk
- **applications → retail_banking:** Monopolistic competition among branded banks
- **applications → airlines:** Oligopoly with few major carriers on key routes
- **applications → utilities:** Regulated monopoly with fixed ROE
- **applications → agricultural_commodities:** Perfect competition for homogeneous products
- **validation → valid_number:** number_of_sellers in {many, many_differentiated, few, one}
- **validation → valid_differentiation:** product_differentiation in {homogeneous, differentiated}
- **validation → valid_barriers:** barriers_to_entry in {none, low, high, very_high}

## Success & failure scenarios

**✅ Success paths**

- **Classify Structure** — when number_of_sellers exists; product_differentiation exists; barriers_to_entry exists, then call service; emit market.structure_classified. _Why: Assign an industry to one of four market structures._

**❌ Failure paths**

- **Invalid Classification** — when classification_valid eq false, then emit market.classification_rejected. _Why: Inputs do not map to a known structure._ *(error: `MARKET_STRUCTURE_UNMATCHED`)*

## Errors it can return

- `MARKET_STRUCTURE_UNMATCHED` — Inputs do not map to a recognised market structure

## Events

**`market.structure_classified`**
  Payload: `industry_id`, `structure`, `pricing_power`, `implied_profitability`

**`market.classification_rejected`**
  Payload: `industry_id`, `reason_code`

## Connects to

- **profit-maximization-breakeven** *(required)*
- **monopolistic-competition** *(recommended)*
- **oligopoly-pricing** *(recommended)*
- **monopoly-pricing** *(recommended)*
- **market-concentration-measures** *(recommended)*

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/market-structures-analysis/) · **Spec source:** [`market-structures-analysis.blueprint.yaml`](./market-structures-analysis.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
