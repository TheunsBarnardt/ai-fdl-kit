<!-- AUTO-GENERATED FROM capital-market-expectations-asset-class-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Capital Market Expectations Asset Class L3

> Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · capital-market-expectations · fixed-income-forecasting · equity-forecasting · real-estate · singer-terhaar · cfa-level-3

## What this does

Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **forecast_id** *(text, required)* — Forecast identifier
- **asset_class** *(select, required)* — fixed_income | equity | real_estate | fx | volatility

## What must be true

- **fi_forecasting_approaches → dcf:** YTM ≈ expected return if horizon ≈ Macaulay duration; capital gain/loss and reinvestment effects offset
- **fi_forecasting_approaches → horizon_vs_duration:** Short horizon → capital gain/loss dominates; long horizon → reinvestment dominates
- **fi_forecasting_approaches → building_blocks:** Expected return = risk-free rate + term premium + credit premium + liquidity premium
- **fi_building_blocks → risk_free:** Short-term default-free rate; tied to central bank policy rate; normalize when negative
- **fi_building_blocks → term_premium:** Proportional to duration; time-varying; driven by inflation uncertainty, recession-hedge ability, supply/demand, cycle
- **fi_building_blocks → credit_premium:** Embedded in spread net of expected defaults; countercyclical for IG; default clusters in recessions
- **fi_building_blocks → liquidity_premium:** Spread of non-sovereign vs sovereign for equivalent quality; increases with illiquidity factors
- **fi_building_blocks → credit_barbell:** Concentrate credit exposure at short maturities; take duration via long-maturity govts
- **em_bond_risks → economic:** Fiscal deficit >4% GDP, debt/GDP >70-80%, CA deficit >4%, FX reserves <100% of ST debt
- **em_bond_risks → political_legal:** Willingness to pay; property rights; history of restructuring/default
- **em_bond_risks → thresholds:** Foreign debt >50% GDP or >200% CA receipts is danger zone
- **equity_forecasting → historical:** Long-run average may be biased by survivorship, sample period, starting valuation
- **equity_forecasting → grinold_kroner:** E(R) = D/P + g + repricing ≈ dividend yield + nominal earnings growth + P/E change
- **equity_forecasting → risk_premium:** E(R) = risk-free + equity risk premium; ERP = equity return − bond return (historical or forward)
- **equity_forecasting → singer_terhaar:** RP = φ × RP_global_integrated + (1-φ) × RP_segmented; φ = degree of integration
- **equity_forecasting → integration_ranges:** DM equities: φ=0.75-0.90; EM equities/bonds: φ=0.50-0.75; real estate: ~0.50-0.75
- **em_equity_risks → governance:** Weak disclosure, accounting standards, minority shareholder protections
- **em_equity_risks → political:** Nationalization, regulatory seizure, capital controls, currency inconvertibility
- **em_equity_risks → informational:** Less efficient pricing; country risk dominates industry risk in EM
- **real_estate_forecasting → cap_rate_model:** E(R) = cap rate + NOI growth rate − %Δcap rate (analogous to Grinold-Kroner)
- **real_estate_forecasting → noi_growth:** Long-run NOI growth ≈ GDP growth; inflation component separable
- **real_estate_forecasting → smoothing_bias:** Appraisal-based returns are smoothed; understate true volatility and contemporaneous correlation
- **real_estate_forecasting → unsmoothing:** Apply time-series model to recover true volatility; required before risk modelling
- **real_estate_forecasting → boom_bust:** Overbuilding → excess supply → long absorption; supply inelastic short term
- **fx_forecasting → ppp:** Long-run: inflation differential determines FX trend; short-run: deviations persist
- **fx_forecasting → current_account:** Persistent CA deficit → currency depreciation; trade competitiveness channel
- **fx_forecasting → capital_flows:** Higher real rates attract capital → currency appreciation; carry trade
- **fx_forecasting → uip:** E(ΔFX) = interest rate differential; implies no excess return to carry in equilibrium
- **volatility_forecasting → sample_vcv:** Historical sample VCV; simple but unstable with many assets
- **volatility_forecasting → factor_vcv:** Multi-factor model constrains VCV; reduces estimation error; more stable
- **volatility_forecasting → shrinkage:** Blend sample VCV and factor/target VCV; reduces extreme estimates
- **volatility_forecasting → smoothed_returns:** Unsmooth appraisal/PE returns before computing VCV; else understate true risk
- **volatility_forecasting → arch:** ARCH/GARCH models time-varying volatility; conditional variance clusters in turbulent periods
- **black_litterman → step1:** Start from market-cap equilibrium returns (reverse optimization from CAPM)
- **black_litterman → step2:** Express analyst views as expected return deviations with confidence levels
- **black_litterman → step3:** Blend equilibrium and views proportionally to confidence → updated expected returns
- **black_litterman → step4:** Run MVO with updated returns; produces diversified, intuitive portfolios
- **black_litterman → advantage:** Eliminates corner solutions and extreme weights common in unconstrained MVO
- **validation → forecast_required:** forecast_id present
- **validation → valid_asset:** asset_class in [fixed_income, equity, real_estate, fx, volatility]

## Success & failure scenarios

**✅ Success paths**

- **Develop Asset Class Forecast** — when forecast_id exists; asset_class in ["fixed_income","equity","real_estate","fx","volatility"], then call service; emit cme.asset_class.developed. _Why: Develop expected return forecast for a specified asset class._

**❌ Failure paths**

- **Invalid Asset Class** — when asset_class not_in ["fixed_income","equity","real_estate","fx","volatility"], then emit cme.asset_class.rejected. _Why: Unsupported asset class._ *(error: `CME_INVALID_ASSET_CLASS`)*

## Errors it can return

- `CME_INVALID_ASSET_CLASS` — asset_class must be one of fixed_income, equity, real_estate, fx, volatility

## Events

**`cme.asset_class.developed`**
  Payload: `forecast_id`, `asset_class`, `expected_return`, `risk_premium`, `methodology`

**`cme.asset_class.rejected`**
  Payload: `forecast_id`, `reason_code`

## Connects to

- **capital-market-expectations-macro-l3** *(required)*

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/capital-market-expectations-asset-class-l3/) · **Spec source:** [`capital-market-expectations-asset-class-l3.blueprint.yaml`](./capital-market-expectations-asset-class-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
