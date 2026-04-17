---
title: "Portfolio Expected Return Variance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute portfolio expected return, variance, and standard deviation using asset weights, covariances, and correlations, and show how diversification reduces non"
---

# Portfolio Expected Return Variance Blueprint

> Compute portfolio expected return, variance, and standard deviation using asset weights, covariances, and correlations, and show how diversification reduces non-systematic risk

| | |
|---|---|
| **Feature** | `portfolio-expected-return-variance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, mean-variance, covariance, correlation, diversification, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-expected-return-variance.blueprint.yaml) |
| **JSON API** | [portfolio-expected-return-variance.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-expected-return-variance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `port_stats` | Portfolio Statistics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `calc_id` | text | Yes | Calculation identifier |  |
| `weights` | json | Yes | Asset weights (sum to 1) |  |
| `expected_returns` | json | Yes | Expected returns per asset |  |
| `covariance_matrix` | json | Yes | Covariance matrix |  |

## Rules

- **expected_return:**
  - **formula:** E(Rp) = sum(w_i * E(R_i))
- **two_asset_variance:**
  - **formula:** var(Rp) = w1^2 * var1 + w2^2 * var2 + 2*w1*w2*cov(1,2)
  - **correlation_link:** cov = rho * sd1 * sd2
- **n_asset_variance:**
  - **formula:** var(Rp) = sum_i sum_j w_i * w_j * cov(i,j)
  - **matrix_form:** var(Rp) = w^T * Sigma * w
- **diversification:**
  - **principle:** Correlation < 1 produces sd(Rp) less than weighted average of sd_i
  - **limit:** Systematic risk cannot be diversified away
- **validation:**
  - **calc_required:** calc_id present
  - **weights_sum_to_one:** sum(weights) == 1 (within tolerance)
  - **matrix_dimensions_match:** covariance_matrix is NxN matching returns vector

## Outcomes

### Compute_portfolio_stats (Priority: 1)

_Compute portfolio expected return and variance_

**Given:**
- `calc_id` (input) exists
- `weights` (input) exists
- `covariance_matrix` (input) exists

**Then:**
- **call_service** target: `port_stats`
- **emit_event** event: `portfolio.stats_computed`

### Invalid_inputs (Priority: 10) — Error: `PORT_STATS_MISSING_INPUTS`

_Missing required inputs_

**Given:**
- ANY: `weights` (input) not_exists OR `covariance_matrix` (input) not_exists

**Then:**
- **emit_event** event: `portfolio.stats_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORT_STATS_MISSING_INPUTS` | 400 | weights and covariance_matrix are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.stats_computed` |  | `calc_id`, `expected_return`, `variance`, `std_dev` |
| `portfolio.stats_rejected` |  | `calc_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-efficient-frontier | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Expected Return Variance Blueprint",
  "description": "Compute portfolio expected return, variance, and standard deviation using asset weights, covariances, and correlations, and show how diversification reduces non",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, mean-variance, covariance, correlation, diversification, cfa-level-1"
}
</script>
