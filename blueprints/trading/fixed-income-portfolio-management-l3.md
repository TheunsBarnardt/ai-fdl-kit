<!-- AUTO-GENERATED FROM fixed-income-portfolio-management-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fixed Income Portfolio Management L3

> Fixed-income portfolio management overview — roles of FI, mandate types, portfolio measures, liquidity, return decomposition, leverage, and taxation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · fixed-income · bond-portfolio · duration · spread-risk · leverage · fi-mandates · return-decomposition · cfa-level-3

## What this does

Fixed-income portfolio management overview — roles of FI, mandate types, portfolio measures, liquidity, return decomposition, leverage, and taxation

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **mandate_type** *(select, required)* — liability_based | total_return | esg_constrained

## What must be true

- **roles_of_fi → diversification:** Low or negative correlation with equities during risk-off; flight to quality
- **roles_of_fi → regular_cash_flows:** Known coupon and principal payments; suitable for liability matching
- **roles_of_fi → inflation_hedging:** TIPS provide direct inflation protection; real yields are observable
- **roles_of_fi → capital_preservation:** High-quality short-duration bonds preserve capital in bear markets
- **mandate_types → liability_based:** Asset cash flows match liability cash flows; duration matching; immunization
- **mandate_types → total_return:** Maximize return vs benchmark; pure index or enhanced indexing
- **mandate_types → esg_constrained:** Exclude issuers failing ESG criteria; may track adjusted benchmark
- **portfolio_measures → yield_to_maturity:** Aggregate YTM; fair approximation of expected return if held to maturity
- **portfolio_measures → duration:** Interest rate sensitivity; modified duration, effective duration, key rate duration
- **portfolio_measures → convexity:** Second-order price sensitivity to rate changes; positive convexity is beneficial
- **portfolio_measures → spread_duration:** Sensitivity of price to spread changes; key for credit portfolios
- **portfolio_measures → dts:** Duration Times Spread; measure of credit risk contribution; better than spread duration alone
- **correlations_between_sectors → govt_ig:** Investment-grade corporates highly correlated with govts; spread is primary differentiator
- **correlations_between_sectors → hy_equities:** High yield correlates more with equities than govts; spread risk dominates rate risk
- **correlations_between_sectors → em_bonds:** Mix of local rate risk and spread risk; correlation with DM varies by stress regime
- **bond_liquidity → most_liquid:** On-the-run sovereign bonds; benchmark corp issues; current coupon MBS
- **bond_liquidity → least_liquid:** Off-the-run govts; small corp issues; structured products; high yield
- **bond_liquidity → liquidity_factors:** Issue size, issuer frequency, time since issuance, credit quality, structure
- **bond_liquidity → portfolio_implications:** Illiquid bonds widen bid-ask; harder to rebalance; require liquidity buffer
- **return_decomposition → coupon:** Coupon income as % of bond price
- **return_decomposition → rolldown:** Return from bond rolling down yield curve toward maturity (when curve is upward sloping)
- **return_decomposition → rate_change:** Duration × (−Δyield)
- **return_decomposition → spread_change:** Spread duration × (−Δspread)
- **return_decomposition → currency:** FX return for non-domestic bonds
- **return_decomposition → total:** Sum of coupon + rolldown + rate change + spread change + currency
- **leverage → using_leverage:** Amplifies returns and risks; suitable when expected return > financing cost
- **leverage → methods:** Repo agreements, futures, total return swaps, structured notes
- **leverage → repo:** Sell bond with agreement to repurchase; short-term financing at repo rate
- **leverage → leverage_risks:** Margin calls in stress; forced selling amplifies losses; counterparty risk
- **leverage → leverage_ratio:** Portfolio / equity; leverage ratio = (borrowed funds + equity) / equity
- **fi_taxation → accrued_interest:** Taxable as ordinary income when received
- **fi_taxation → capital_gains:** Tax on price appreciation; short-term vs long-term treatment varies by jurisdiction
- **fi_taxation → discount_bonds:** OID amortization may be ordinary income; varies by jurisdiction
- **fi_taxation → vehicle_selection:** Mutual funds vs ETFs vs separately managed accounts; different tax treatment
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_mandate:** mandate_type in [liability_based, total_return, esg_constrained]

## Success & failure scenarios

**✅ Success paths**

- **Manage Fi Portfolio** — when portfolio_id exists; mandate_type in ["liability_based","total_return","esg_constrained"], then call service; emit fi_portfolio.managed. _Why: Manage fixed-income portfolio within specified mandate type._

**❌ Failure paths**

- **Invalid Mandate** — when mandate_type not_in ["liability_based","total_return","esg_constrained"], then emit fi_portfolio.rejected. _Why: Unsupported mandate type._ *(error: `FI_INVALID_MANDATE`)*

## Errors it can return

- `FI_INVALID_MANDATE` — mandate_type must be one of liability_based, total_return, esg_constrained

## Events

**`fi_portfolio.managed`**
  Payload: `portfolio_id`, `mandate_type`, `duration`, `yield_to_maturity`, `spread_duration`, `leverage_ratio`

**`fi_portfolio.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **liability-driven-index-strategies-l3** *(recommended)*
- **capital-market-expectations-asset-class-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fixed-income-portfolio-management-l3/) · **Spec source:** [`fixed-income-portfolio-management-l3.blueprint.yaml`](./fixed-income-portfolio-management-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
