---
title: "Safety First Shortfall Risk Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Roy's safety-first criterion — select the portfolio that minimises the probability of return falling below a threshold by maximising the safety-first rati"
---

# Safety First Shortfall Risk Blueprint

> Apply Roy's safety-first criterion — select the portfolio that minimises the probability of return falling below a threshold by maximising the safety-first ratio

| | |
|---|---|
| **Feature** | `safety-first-shortfall-risk` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, portfolio-mathematics, safety-first, shortfall-risk, roy-criterion, sharpe-ratio, downside-risk, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/safety-first-shortfall-risk.blueprint.yaml) |
| **JSON API** | [safety-first-shortfall-risk.json]({{ site.baseurl }}/api/blueprints/trading/safety-first-shortfall-risk.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_engine` | Portfolio Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `candidate_portfolios` | json | Yes | Array of {portfolio_id, expected_return, std_dev} |  |
| `threshold_return` | number | Yes | Minimum acceptable return R_L (shortfall level) |  |
| `risk_free_rate` | number | No | If threshold = risk_free_rate, SFRatio reduces to Sharpe ratio |  |

## Rules

- **core_formulas:**
  - **safety_first_ratio:** SFRatio = (E(R_P) - R_L) / sigma_P
  - **shortfall_probability_normal:** P(R_P < R_L) = Normal_CDF(-SFRatio)
  - **sharpe_equivalence:** When R_L = R_f, SFRatio = Sharpe ratio
- **roy_criterion:**
  - **objective:** Choose the portfolio that maximises SFRatio (minimises shortfall probability)
  - **steps:** 1. Calculate SFRatio for each candidate portfolio, 2. Select the portfolio with the highest SFRatio, 3. Under normality, this minimises P(R_P < R_L)
  - **normality_assumption:** Closed-form shortfall probability assumes normally distributed returns
- **interpretation:**
  - **positive_sfratio:** Expected return exceeds threshold; shortfall probability < 50%
  - **zero_sfratio:** Expected return equals threshold; shortfall probability = 50%
  - **negative_sfratio:** Expected return below threshold; shortfall probability > 50%
  - **distance_in_sigmas:** SFRatio measures how many standard deviations the mean lies above the threshold
- **comparison_to_sharpe:**
  - **sharpe:** Sharpe = (E(R_P) - R_f) / sigma_P — excess return per unit of total risk
  - **sfratio:** SFRatio generalises Sharpe to any threshold R_L, not just R_f
  - **identical_when:** SFRatio == Sharpe when R_L = R_f
- **applications:**
  - **pension_funds:** R_L = required return to meet liabilities; minimise probability of underfunding
  - **dc_plans:** R_L = inflation-adjusted target; select allocation that minimises real-return shortfall
  - **hedge_funds:** R_L = absolute-return floor; communicate downside risk to LPs
- **validation:**
  - **std_dev_positive:** Portfolio standard deviation must be greater than zero; SFRatio is undefined for zero-volatility portfolios
  - **candidates_non_empty:** candidate_portfolios array must contain at least one entry
  - **normality_flagged:** Flag non-normal return distributions where closed-form shortfall probability is unreliable

## Outcomes

### Compute_sfratio_and_select (Priority: 1)

_Compute SFRatio for each candidate and select the maximum_

**Given:**
- `candidate_portfolios` (input) exists
- `threshold_return` (input) exists

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.safety_first_selected`

### Compute_shortfall_probability (Priority: 2)

_Assuming normality, compute P(R_P < R_L) = Phi(-SFRatio)_

**Given:**
- `candidate_portfolios` (input) exists

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.shortfall_probability_calculated`

### Zero_std_dev (Priority: 10) — Error: `SF_STDDEV_ZERO`

_Portfolio std dev is zero — SFRatio undefined_

**Given:**
- `std_dev_positive` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.safety_first_rejected`

### Empty_candidates (Priority: 11) — Error: `SF_NO_CANDIDATES`

_No candidate portfolios provided_

**Given:**
- `candidate_portfolios` (input) not_exists

**Then:**
- **emit_event** event: `portfolio.safety_first_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SF_STDDEV_ZERO` | 422 | SFRatio undefined when portfolio standard deviation is zero | No |
| `SF_NO_CANDIDATES` | 400 | At least one candidate portfolio required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.safety_first_selected` |  | `selected_portfolio_id`, `sfratio`, `shortfall_probability`, `threshold_return` |
| `portfolio.shortfall_probability_calculated` |  | `portfolio_id`, `sfratio`, `shortfall_probability` |
| `portfolio.safety_first_rejected` |  | `request_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-expected-return | required |  |
| portfolio-variance-covariance | required |  |
| target-downside-deviation | recommended |  |
| measures-of-dispersion | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  threshold_return: 0.02
  portfolios:
    - id: A
      expected_return: 0.12
      std_dev: 0.15
      sfratio: 0.667
    - id: B
      expected_return: 0.14
      std_dev: 0.16
      sfratio: 0.75
    - id: C
      expected_return: 0.16
      std_dev: 0.2
      sfratio: 0.7
  selected: B
  interpretation: Highest SFRatio → lowest probability of falling below the 2% threshold
sharpe_relationship:
  when_threshold_equals_rf: SFRatio reduces to Sharpe ratio
  example: R_L = 0.03 = R_f → SFRatio_A = (0.12-0.03)/0.15 = 0.60 = Sharpe_A
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Safety First Shortfall Risk Blueprint",
  "description": "Apply Roy's safety-first criterion — select the portfolio that minimises the probability of return falling below a threshold by maximising the safety-first rati",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, portfolio-mathematics, safety-first, shortfall-risk, roy-criterion, sharpe-ratio, downside-risk, cfa-level-1"
}
</script>
