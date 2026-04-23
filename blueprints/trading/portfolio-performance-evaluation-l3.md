<!-- AUTO-GENERATED FROM portfolio-performance-evaluation-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Portfolio Performance Evaluation L3

> Portfolio performance evaluation — return attribution (BHB, Brinson-Fachler), FI attribution, risk attribution, benchmark quality, appraisal measures, capture ratios, and skill evaluation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · performance-attribution · brinson-hood-beebower · information-ratio · sharpe-ratio · benchmark-quality · capture-ratio · drawdown · cfa-level-3

## What this does

Portfolio performance evaluation — return attribution (BHB, Brinson-Fachler), FI attribution, risk attribution, benchmark quality, appraisal measures, capture ratios, and skill evaluation

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **evaluation_type** *(select, required)* — return_attribution | risk_attribution | benchmark_evaluation | appraisal | skill_evaluation

## What must be true

- **equity_return_attribution → bhb_model:** Brinson-Hood-Beebower: decomposes active return into allocation effect + selection effect + interaction
- **equity_return_attribution → allocation_effect:** (W_p − W_b) × (R_b_sector − R_b_total); value added from over/underweighting sectors
- **equity_return_attribution → selection_effect:** W_b × (R_p_sector − R_b_sector); value added from security selection within sector
- **equity_return_attribution → interaction:** (W_p − W_b) × (R_p_sector − R_b_sector); often combined with selection
- **equity_return_attribution → brinson_fachler:** Allocation effect = (W_p − W_b) × (R_b_sector − R_b_total); cleaner attribution for non-zero benchmark weights
- **fi_return_attribution → decomposition:** Income effect + duration/yield curve effect + spread effect + currency effect
- **fi_return_attribution → income:** Coupon income as fraction of portfolio value
- **fi_return_attribution → duration_effect:** Duration × rate change attribution
- **fi_return_attribution → spread_effect:** Spread duration × spread change; sector-specific
- **fi_return_attribution → currency:** FX return contribution for non-domestic bonds
- **fi_return_attribution → residual:** Unexplained component; security selection residual
- **risk_attribution → factor_attribution:** Decompose active risk into factor-based and residual (security-specific) components
- **risk_attribution → marginal_contribution:** Each position's marginal contribution to total active risk
- **risk_attribution → risk_budget_efficiency:** Compare risk consumed vs expected alpha per unit of risk
- **macro_micro_attribution → macro:** Asset allocation decisions: contribution of SAA and TAA vs policy benchmark
- **macro_micro_attribution → micro:** Manager decisions within asset class: contribution of selection vs asset class benchmark
- **macro_micro_attribution → layering:** Multi-level: total fund → asset class → manager → security
- **benchmark_selection → asset_based:** Index matching investable universe; rules-based; transparent; measurable
- **benchmark_selection → liability_based:** PV of liabilities as benchmark; relevant for LDI mandates
- **benchmark_selection → benchmark_quality:** Unambiguous, investable, measurable, appropriate, reflective of manager opportunity set, agreed upon in advance
- **benchmark_selection → decomposition_check:** Verify benchmark has similar factor exposures to manager's stated style
- **benchmarking_alternatives → hedge_funds:** Absolute return; peer group; factor model; each has limitations
- **benchmarking_alternatives → real_estate:** NCREIF; appraisal-based; illiquidity premium benchmark
- **benchmarking_alternatives → private_equity:** PME (public market equivalent); IRR vs benchmark; TVPI vs peer quartile
- **benchmarking_alternatives → commodities:** Bloomberg Commodity Index; S&P GSCI; differ by sector weights and roll methodology
- **appraisal_measures → sharpe_ratio:** Excess return / total volatility; absolute risk measure; penalizes all volatility
- **appraisal_measures → information_ratio:** Active return / tracking error; relative risk measure; key for benchmark-relative managers
- **appraisal_measures → treynor_ratio:** Excess return / beta; appropriate if portfolio is part of larger well-diversified fund
- **appraisal_measures → m_squared:** Return earned if volatility matched benchmark; comparable across managers
- **appraisal_measures → appraisal_ratio:** Alpha / specific risk; measures manager's stock selection skill; Jensen's alpha / TE residual
- **appraisal_measures → skill_vs_luck:** Skill requires statistical significance; t-stat of IR; need 3+ years; or 36+ months
- **capture_ratios → up_capture:** Manager return in up markets / benchmark return in up markets; want > 100%
- **capture_ratios → down_capture:** Manager return in down markets / benchmark return in down markets; want < 100%
- **capture_ratios → capture_ratio_quality:** Asymmetric: high up-capture + low down-capture = excellent; reverse = poor
- **drawdown_analysis → max_drawdown:** Peak-to-trough decline; measures worst historical loss experience
- **drawdown_analysis → drawdown_duration:** Time from peak to recovery of peak; long duration indicates slow recovery
- **drawdown_analysis → drawdown_frequency:** How often drawdowns occur; indicates tail risk frequency
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_evaluation:** evaluation_type in [return_attribution, risk_attribution, benchmark_evaluation, appraisal, skill_evaluation]

## Success & failure scenarios

**✅ Success paths**

- **Evaluate Performance** — when portfolio_id exists; evaluation_type in ["return_attribution","risk_attribution","benchmark_evaluation","appraisal","skill_evaluation"], then call service; emit performance.evaluated. _Why: Evaluate portfolio performance using specified evaluation type._

**❌ Failure paths**

- **Invalid Evaluation** — when evaluation_type not_in ["return_attribution","risk_attribution","benchmark_evaluation","appraisal","skill_evaluation"], then emit performance.rejected. _Why: Unsupported evaluation type._ *(error: `PERF_INVALID_EVALUATION`)*

## Errors it can return

- `PERF_INVALID_EVALUATION` — evaluation_type must be one of return_attribution, risk_attribution, benchmark_evaluation, appraisal, skill_evaluation

## Events

**`performance.evaluated`**
  Payload: `portfolio_id`, `evaluation_type`, `information_ratio`, `sharpe_ratio`, `up_capture`, `down_capture`, `max_drawdown`

**`performance.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **investment-manager-selection-l3** *(recommended)*
- **trade-strategy-execution-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/portfolio-performance-evaluation-l3/) · **Spec source:** [`portfolio-performance-evaluation-l3.blueprint.yaml`](./portfolio-performance-evaluation-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
