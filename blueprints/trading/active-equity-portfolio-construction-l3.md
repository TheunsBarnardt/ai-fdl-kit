<!-- AUTO-GENERATED FROM active-equity-portfolio-construction-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Active Equity Portfolio Construction L3

> Active equity portfolio construction — building blocks, risk measures, risk budgeting, position sizing, long/short strategies, market-neutral, and implicit costs

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · equity · active-equity · portfolio-construction · risk-budgeting · long-short · market-neutral · tracking-error · cfa-level-3

## What this does

Active equity portfolio construction — building blocks, risk measures, risk budgeting, position sizing, long/short strategies, market-neutral, and implicit costs

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **construction_type** *(select, required)* — long_only | long_short | long_extension | market_neutral

## What must be true

- **building_blocks → alpha:** Return attributed to manager skill; idiosyncratic to individual security selection
- **building_blocks → factor_exposure:** Systematic risk tilts (value, momentum, quality); rewarded but not unique to manager
- **building_blocks → sizing:** Position size should reflect conviction, alpha, and marginal contribution to risk
- **benchmark_relative_risk → tracking_error:** Standard deviation of active return; primary measure of active risk
- **benchmark_relative_risk → active_share:** Sum of absolute weight deviations / 2; measures degree of differentiation from index
- **benchmark_relative_risk → closet_indexing:** Low active share + high fee = value destruction; active share < 60% is warning sign
- **benchmark_relative_risk → high_conviction:** High active share + high tracking error = concentrated; requires skill to justify
- **objectives_constraints → absolute_risk:** Total portfolio volatility; relevant for standalone portfolios
- **objectives_constraints → relative_risk:** Tracking error vs benchmark; relevant for benchmark-relative mandates
- **objectives_constraints → risk_target:** Set by client risk tolerance; manager cannot exceed without mandate breach
- **objectives_constraints → liquidity_constraint:** Position size limited by daily trading volume; avoid illiquid concentrations
- **objectives_constraints → leverage:** Borrowing amplifies return and risk; introduces margin call risk; increases drawdown potential
- **risk_budget → allocation:** Divide total active risk budget across securities and factors
- **risk_budget → marginal_contribution:** Each position's contribution to portfolio active risk; optimize efficiency
- **risk_budget → information_ratio:** Alpha per unit of active risk; maximize IR across positions
- **risk_budget → formal_constraints:** Sector limits, position limits, factor exposure limits
- **implicit_costs → market_impact:** Large orders move prices adversely; impact rises with position size as % of ADV
- **implicit_costs → slippage_estimation:** Slippage ≈ (1/2) × daily volatility × order size / ADV
- **implicit_costs → aum_capacity:** Larger AUM = larger orders = higher market impact; alpha decays with scale
- **implicit_costs → turnover:** High turnover increases market impact and commissions; net of costs IR often lower
- **well_constructed_portfolio → criteria:** Consistent with mandate; diversified; efficient use of risk budget; cost-aware; liquid
- **well_constructed_portfolio → wrong_bets:** Unintended factor tilts waste risk budget on unrewarded risk
- **well_constructed_portfolio → conviction_sizing:** Larger positions for highest-conviction ideas; smaller for low-conviction
- **long_only → merits:** No short-selling costs; simpler; suitable for most institutional mandates
- **long_only → constraint:** Can only profit from long ideas; cannot isolate alpha by shorting overvalued stocks
- **long_only → max_active_weight:** Limited to index weight; small-cap index stocks get small maximum short
- **long_short → structure:** Unencumbered longs and shorts; profit from both rising and falling stocks
- **long_short → gross_exposure:** Sum of long and short exposure; measures total leverage
- **long_short → net_exposure:** Long − short; net market exposure; determines beta
- **long_short → benefits:** Full expression of short alpha; higher active share; alpha portable via shorts
- **long_short → drawbacks:** Short-selling costs (borrow fee, opportunity cost); forced covering in squeezes
- **long_extension → structure:** 130/30 or 140/40; invest 100% long + additional 30-40% short; net = 100%
- **long_extension → benefit:** More active share than long-only; short ideas generate additional alpha
- **long_extension → constraint:** Regulatory limits in many jurisdictions; harder to implement in less liquid markets
- **market_neutral → structure:** Equal long and short; near-zero beta; isolates stock-selection alpha
- **market_neutral → use_case:** Pure alpha; low correlation to equity market; hedge fund structure
- **market_neutral → risks:** Long-short spread compression; short squeeze; factor exposure unintended
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_construction:** construction_type in [long_only, long_short, long_extension, market_neutral]

## Success & failure scenarios

**✅ Success paths**

- **Construct Active Portfolio** — when portfolio_id exists; construction_type in ["long_only","long_short","long_extension","market_neutral"], then call service; emit active_portfolio.constructed. _Why: Construct active equity portfolio using specified construction approach._

**❌ Failure paths**

- **Invalid Construction** — when construction_type not_in ["long_only","long_short","long_extension","market_neutral"], then emit active_portfolio.rejected. _Why: Unsupported construction type._ *(error: `CONSTRUCTION_INVALID_TYPE`)*

## Errors it can return

- `CONSTRUCTION_INVALID_TYPE` — construction_type must be one of long_only, long_short, long_extension, market_neutral

## Events

**`active_portfolio.constructed`**
  Payload: `portfolio_id`, `construction_type`, `active_share`, `tracking_error`, `expected_information_ratio`

**`active_portfolio.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **active-equity-strategies-l3** *(required)*
- **equity-portfolio-management-overview-l3** *(required)*

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/active-equity-portfolio-construction-l3/) · **Spec source:** [`active-equity-portfolio-construction-l3.blueprint.yaml`](./active-equity-portfolio-construction-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
