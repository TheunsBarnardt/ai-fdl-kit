<!-- AUTO-GENERATED FROM passive-equity-investing-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Passive Equity Investing L3

> Passive equity investment strategies — index construction, vehicle selection, replication methods, tracking error management, attribution, and investor engagement

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · equity · passive-investing · index-investing · etf · tracking-error · replication · factor-based-index · cfa-level-3

## What this does

Passive equity investment strategies — index construction, vehicle selection, replication methods, tracking error management, attribution, and investor engagement

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **replication_method** *(select, required)* — full_replication | stratified_sampling | optimization | blended

## What must be true

- **index_construction → market_cap_weighted:** Weights proportional to float-adjusted market cap; self-rebalancing; dominant methodology
- **index_construction → equal_weighted:** Equal weight to each constituent; high turnover; small-cap bias
- **index_construction → fundamental_weighted:** Weight by revenue, earnings, dividends; value tilt; less momentum
- **index_construction → factor_weighted:** Smart beta; tilt toward value, quality, momentum, low-vol, size
- **benchmark_selection → representativeness:** Benchmark must reflect investable opportunity set
- **benchmark_selection → tradability:** Constituent stocks must be liquid and purchasable
- **benchmark_selection → transparency:** Clear rules for inclusion, exclusion, and rebalancing
- **benchmark_selection → appropriateness:** Match investor objective; global vs regional vs sector
- **pooled_investment_vehicles → mutual_funds:** Daily NAV pricing; redeemable at NAV; potential tax drag from distributions
- **pooled_investment_vehicles → etfs:** Exchange-traded; intraday liquidity; creation-redemption mechanism minimizes tax drag
- **pooled_investment_vehicles → futures:** Cheap exposure; tracking error from basis; roll cost at expiry
- **pooled_investment_vehicles → total_return_swaps:** Receive index return; pay floating; counterparty risk; off-balance-sheet
- **replication_methods → full_replication:** Hold all index constituents at index weights; minimal tracking error; high cost for large indexes
- **replication_methods → stratified_sampling:** Divide index into cells by sector/size/country; hold representative securities from each cell
- **replication_methods → optimization:** Use factor model to minimize tracking error with subset of stocks; model-dependent
- **replication_methods → blended:** Full replication for liquid stocks; sampling for illiquid tail; balances cost and tracking
- **tracking_error → definition:** Standard deviation of active return (portfolio return − benchmark return)
- **tracking_error → sources:** Transaction costs, cash drag, sampling approximation, dividend timing, corporate actions
- **tracking_error → controlling:** Minimize unnecessary deviations; rebalance close to index; minimize cash drag
- **tracking_error → excess_return:** May be positive (securities lending, tax management) or negative (costs)
- **sources_of_return_risk → attribution:** Decompose return into factor exposures and residual; assess deviation from index
- **sources_of_return_risk → securities_lending:** Income from lending indexed shares; offsets fees; subject to recall risk
- **sources_of_return_risk → investor_activism:** Passive managers are large shareholders; increasing pressure to engage on governance
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_replication:** replication_method in [full_replication, stratified_sampling, optimization, blended]

## Success & failure scenarios

**✅ Success paths**

- **Implement Passive Portfolio** — when portfolio_id exists; replication_method in ["full_replication","stratified_sampling","optimization","blended"], then call service; emit passive.portfolio.implemented. _Why: Implement passive equity portfolio using specified replication method._

**❌ Failure paths**

- **Invalid Replication** — when replication_method not_in ["full_replication","stratified_sampling","optimization","blended"], then emit passive.portfolio.rejected. _Why: Unsupported replication method._ *(error: `PASSIVE_INVALID_REPLICATION`)*

## Errors it can return

- `PASSIVE_INVALID_REPLICATION` — replication_method must be one of full_replication, stratified_sampling, optimization, blended

## Events

**`passive.portfolio.implemented`**
  Payload: `portfolio_id`, `replication_method`, `tracking_error`, `securities_lending_income`

**`passive.portfolio.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **equity-portfolio-management-overview-l3** *(required)*
- **active-equity-strategies-l3** *(recommended)*

## Quality fitness 🟢 83/100

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
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/passive-equity-investing-l3/) · **Spec source:** [`passive-equity-investing-l3.blueprint.yaml`](./passive-equity-investing-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
