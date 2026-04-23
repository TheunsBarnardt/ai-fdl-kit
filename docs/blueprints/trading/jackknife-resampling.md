---
title: "Jackknife Resampling Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statist"
---

# Jackknife Resampling Blueprint

> Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statistic without parametric assumptions

| | |
|---|---|
| **Feature** | `jackknife-resampling` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, resampling, jackknife, leave-one-out, bias-correction, standard-error, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/jackknife-resampling.blueprint.yaml) |
| **JSON API** | [jackknife-resampling.json]({{ site.baseurl }}/api/blueprints/trading/jackknife-resampling.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `simulation_engine` | Resampling Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observed_sample` | json | Yes | Array of n observations |  |
| `statistic` | select | Yes | mean \| median \| variance \| std_dev \| correlation \| custom |  |
| `compute` | select | No | bias \| standard_error \| confidence_interval \| all |  |

## Rules

- **core_mechanics:**
  - **process:** Construct n leave-one-out subsamples by omitting each observation in turn; compute the statistic on each
  - **without_replacement:** Each jackknife subsample has size n-1 with one unique observation removed (NOT random resampling)
  - **deterministic:** Unlike bootstrap, jackknife produces the same result every run for a given sample
- **key_formulas:**
  - **jackknife_replicates:** theta_hat_(i) = statistic applied to sample with observation i removed
  - **jackknife_mean:** theta_hat_mean = (1/n) * sum_i theta_hat_(i)
  - **bias_estimate:** bias_jack = (n - 1) * (theta_hat_mean - theta_hat_full)
  - **bias_corrected:** theta_hat_BC = theta_hat_full - bias_jack = n*theta_hat_full - (n-1)*theta_hat_mean
  - **jackknife_variance:** Var_jack = ((n-1)/n) * sum_i (theta_hat_(i) - theta_hat_mean)^2
  - **jackknife_se:** SE_jack = sqrt(Var_jack)
- **differences_vs_bootstrap:**
  - **sampling:**
    - **bootstrap:** Random sampling WITH replacement; produces B random resamples
    - **jackknife:** Deterministic leave-one-out; produces exactly n subsamples
  - **coverage:**
    - **bootstrap:** Samples entire subset space stochastically
    - **jackknife:** Visits only n of the 2^n possible subsets
  - **purpose:**
    - **bootstrap:** Sampling distribution approximation; complex CIs
    - **jackknife:** Simple bias and variance estimation; computationally cheap
- **strengths:**
  - **bias_reduction:** Directly targets and removes the leading-order bias of the estimator
  - **computational_efficiency:** Only n evaluations required vs thousands for bootstrap
  - **deterministic_reproducibility:** Identical output each run; no random seeds
- **limitations:**
  - **statistic_smoothness:** Fails for non-smooth statistics such as the median or quantiles
  - **less_accurate_se:** Typically less accurate standard errors than bootstrap
  - **assumes_small_perturbation:** Leave-one-out approximates infinitesimal perturbation; breaks down for influential observations
- **applications:**
  - **factor_model_bias:** Jackknife alpha/beta estimates across holdings
  - **sharpe_ratio_uncertainty:** Jackknife SE of Sharpe ratio using historical returns
  - **credit_model_validation:** Leave-one-firm-out stability testing of scoring models
  - **outlier_diagnosis:** Large theta_hat_(i) - theta_hat_full indicates influential observation i
- **validation:**
  - **sample_size:** n >= 3 (need at least one observation to remove and still estimate)
  - **statistic_smoothness:** Warn if statistic is known to be non-smooth (e.g., median)

## Outcomes

### Run_jackknife (Priority: 1)

_Execute n leave-one-out replicates and aggregate_

**Given:**
- `observed_sample` (input) exists
- `sample_size` (computed) gte `3`

**Then:**
- **call_service** target: `simulation_engine`
- **emit_event** event: `simulation.jackknife_completed`

### Compute_bias_correction (Priority: 2)

_Apply jackknife bias correction to the full-sample statistic_

**Given:**
- `compute` (input) in `bias,all`

**Then:**
- **call_service** target: `simulation_engine`
- **emit_event** event: `simulation.jackknife_bias_corrected`

### Small_sample (Priority: 10) — Error: `JACKKNIFE_SAMPLE_TOO_SMALL`

_n < 3 — jackknife undefined_

**Given:**
- `sample_size` (computed) lt `3`

**Then:**
- **emit_event** event: `simulation.jackknife_rejected`

### Non_smooth_statistic (Priority: 11)

_Statistic is known to be non-smooth; jackknife unreliable_

**Given:**
- `statistic` (input) in `median,quantile`

**Then:**
- **emit_event** event: `simulation.jackknife_warning`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `JACKKNIFE_SAMPLE_TOO_SMALL` | 400 | Jackknife requires at least 3 observations | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `simulation.jackknife_completed` |  | `jackknife_id`, `statistic_value`, `bias_estimate`, `standard_error`, `n` |
| `simulation.jackknife_bias_corrected` |  | `jackknife_id`, `original_estimate`, `bias_correction`, `corrected_estimate` |
| `simulation.jackknife_warning` |  | `jackknife_id`, `warning_message` |
| `simulation.jackknife_rejected` |  | `jackknife_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bootstrap-resampling | required |  |
| standard-error-sample-mean | recommended |  |
| central-limit-theorem | recommended |  |

## AGI Readiness

### Goals

#### Reliable Jackknife Resampling

Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statistic without parametric assumptions

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `bootstrap_resampling` | bootstrap-resampling | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| run_jackknife | `autonomous` | - | - |
| compute_bias_correction | `autonomous` | - | - |
| small_sample | `autonomous` | - | - |
| non_smooth_statistic | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  sample:
    - 0.08
    - 0.12
    - -0.03
    - 0.05
    - 0.1
  sample_mean_full: 0.064
  leave_one_out_means:
    - 0.06
    - 0.05
    - 0.0875
    - 0.0675
    - 0.055
  jackknife_se_formula: sqrt((n-1)/n * sum((theta_(i) - theta_mean)^2))
bootstrap_comparison:
  cost_per_run: n evaluations vs B >= 1000 for bootstrap
  use_when: Sample size moderate; statistic is smooth; speed matters
  avoid_when: Quantile-based statistics or very small n
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Jackknife Resampling Blueprint",
  "description": "Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statist",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, resampling, jackknife, leave-one-out, bias-correction, standard-error, cfa-level-1"
}
</script>
