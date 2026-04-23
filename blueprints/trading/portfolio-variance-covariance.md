<!-- AUTO-GENERATED FROM portfolio-variance-covariance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Portfolio Variance Covariance

> Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and diversification

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · portfolio-mathematics · portfolio-variance · covariance-matrix · markowitz · diversification · mpt · cfa-level-1

## What this does

Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and diversification

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **weights** *(json, required)* — Array of portfolio weights w_i (sum to 1)
- **covariance_matrix** *(json, required)* — n x n covariance matrix of returns; diagonal entries are variances
- **correlation_matrix** *(json, optional)* — Optional correlation matrix (used with stdevs to derive covariances)
- **std_devs** *(json, optional)* — Vector of asset standard deviations (required if using correlation_matrix)

## What must be true

- **core_formulas → two_asset_variance:** Var(Rp) = w1^2 * Var(R1) + w2^2 * Var(R2) + 2 * w1 * w2 * Cov(R1, R2)
- **core_formulas → three_asset_variance:** Var(Rp) = sum_i[w_i^2 * Var(R_i)] + 2 * sum_{i<j}[w_i * w_j * Cov(R_i, R_j)]
- **core_formulas → n_asset_variance:** Var(Rp) = sum_i sum_j [ w_i * w_j * Cov(R_i, R_j) ]
- **core_formulas → standard_deviation:** sigma(Rp) = sqrt(Var(Rp))
- **core_formulas → covariance_from_correlation:** Cov(R_i, R_j) = rho_ij * sigma_i * sigma_j
- **matrix_properties → symmetric:** Cov(R_i, R_j) = Cov(R_j, R_i); covariance matrix is symmetric
- **matrix_properties → diagonal_is_variance:** Cov(R_i, R_i) = Var(R_i)
- **matrix_properties → positive_semi_definite:** A valid covariance matrix is PSD: w'Sw >= 0 for all w
- **matrix_properties → distinct_covariances:** For n assets, there are n variances and n(n-1)/2 distinct off-diagonal covariances
- **diversification_insight → principle:** Portfolio variance is less than the weighted sum of asset variances when correlations < 1
- **diversification_insight → no_benefit:** rho = +1 → no diversification benefit; portfolio stdev = weighted stdev
- **diversification_insight → max_benefit:** rho = -1 → full hedging possible; portfolio variance can reach 0
- **diversification_insight → diversification_dominates_at_scale:** As n grows, covariance terms dominate variance terms; off-diagonal count is n(n-1)
- **worked_example → weights:** 0.5, 0.25, 0.25
- **worked_example → variances_pct_sq:** 400, 81, 441
- **worked_example → covariances → sp500_ltbond:** 45
- **worked_example → covariances → sp500_eafe:** 189
- **worked_example → covariances → ltbond_eafe:** 38
- **worked_example → portfolio_variance:** 195.875
- **worked_example → portfolio_std_dev_pct:** 14
- **investment_applications → efficient_frontier:** Minimise Var(Rp) for each target E(Rp); trace out efficient frontier
- **investment_applications → risk_parity:** Weight assets so each contributes equally to portfolio variance
- **investment_applications → stress_scenarios:** Apply crisis covariance matrices to gauge tail portfolio risk
- **validation → matrix_square:** covariance_matrix must be n x n
- **validation → matrix_symmetric:** |Cov[i][j] - Cov[j][i]| <= 1e-8 for all i, j
- **validation → weights_length_match:** length(weights) = n (matrix dimension)
- **validation → weights_sum_to_one:** |sum(weights) - 1| <= 1e-6

## Success & failure scenarios

**✅ Success paths**

- **Compute Variance** — when weights exists; covariance_matrix exists; inputs_valid eq true, then call service; emit portfolio.variance_calculated. _Why: Bilinear form w' Sigma w over the covariance matrix._
- **Compute From Correlation** — when correlation_matrix exists; std_devs exists, then call service; emit portfolio.variance_calculated. _Why: Derive covariance matrix from correlation matrix + std devs, then compute variance._

**❌ Failure paths**

- **Matrix Malformed** — when inputs_valid eq false, then emit portfolio.variance_rejected. _Why: Covariance matrix is not square or not symmetric._ *(error: `PORT_VAR_MATRIX_MALFORMED`)*
- **Dimension Mismatch** — when dimensions_match eq false, then emit portfolio.variance_rejected. _Why: Weight vector length does not match matrix dimension._ *(error: `PORT_VAR_DIMENSION_MISMATCH`)*

## Errors it can return

- `PORT_VAR_MATRIX_MALFORMED` — Covariance matrix must be square and symmetric
- `PORT_VAR_DIMENSION_MISMATCH` — Weights length must match covariance matrix dimension

## Events

**`portfolio.variance_calculated`**
  Payload: `portfolio_id`, `variance`, `std_dev`, `asset_count`, `diversification_ratio`

**`portfolio.variance_rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **portfolio-expected-return-variance** *(recommended)* — Portfolio-level expected return and variance calculations depend on the covariance inputs defined here
- **portfolio-expected-return** *(required)*
- **covariance-correlation** *(required)*
- **measures-of-dispersion** *(recommended)*
- **joint-probability-covariance** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/portfolio-variance-covariance/) · **Spec source:** [`portfolio-variance-covariance.blueprint.yaml`](./portfolio-variance-covariance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
