---
title: "Sampling Methods Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading represent"
---

# Sampling Methods Blueprint

> Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading representativeness against cost and speed

| | |
|---|---|
| **Feature** | `sampling-methods` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, sampling, probability-sampling, stratified-sampling, cluster-sampling, sampling-error, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/sampling-methods.blueprint.yaml) |
| **JSON API** | [sampling-methods.json]({{ site.baseurl }}/api/blueprints/trading/sampling-methods.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sampling_engine` | Sampling / Survey Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `population_size` | number | No | Total size of the population (N) |  |
| `sample_size` | number | Yes | Desired sample size (n) |  |
| `method` | select | Yes | simple_random \| stratified_random \| cluster \| convenience \| judgmental |  |
| `strata_definitions` | json | No | Array of {stratum_id, population_share, sample_share} for stratified designs |  |
| `clusters` | json | No | Array of cluster IDs with member counts for cluster sampling |  |

## Rules

- **probability_methods:**
  - **simple_random:** Each member of the population has equal probability of selection; gold standard for representativeness
  - **stratified_random:** Population divided into mutually exclusive subgroups (strata); random samples drawn from each stratum proportionally
  - **cluster_sampling:** Population divided into clusters; a random subset of CLUSTERS selected, all members of selected clusters measured
- **non_probability_methods:**
  - **convenience:** Selection based on accessibility; fast and cheap but prone to selection bias
  - **judgmental:** Expert selects what is believed to be representative; useful for small populations with clear criteria
- **sampling_error:**
  - **definition:** Difference between sample statistic and the true population parameter it estimates
  - **decomposition:** Random (unbiased) error decreases with n; systematic (bias) error does not
- **stratified_advantages:**
  - **precision:** Lower variance than simple random for same n if strata are internally homogeneous
  - **subgroup_inference:** Guaranteed representation of each stratum
- **cluster_tradeoffs:**
  - **cost:** Lower field cost when clusters are geographically compact
  - **precision:** Higher sampling error than simple random of same size if clusters are heterogeneous
- **investment_applications:**
  - **index_construction:** Stratified sampling across sectors/countries to mirror a benchmark with fewer holdings
  - **survey_research:** Investor surveys stratified by wealth tier
  - **credit_portfolio_audits:** Cluster sampling by branch for loan file audits
  - **alternative_data:** Convenience samples from web scraping — always flag selection bias
- **validation:**
  - **sample_size_positive:** sample_size >= 1
  - **method_supported:** method in {simple_random, stratified_random, cluster, convenience, judgmental}
  - **strata_sum_to_population:** Sum of stratum population_shares = 1 (or counts sum to N)

## Outcomes

### Draw_simple_random (Priority: 1)

_Random selection with equal probability_

**Given:**
- `method` (input) eq `simple_random`

**Then:**
- **call_service** target: `sampling_engine`
- **emit_event** event: `sampling.sample_drawn`

### Draw_stratified (Priority: 2)

_Proportional allocation across strata_

**Given:**
- `method` (input) eq `stratified_random`
- `strata_definitions` (input) exists

**Then:**
- **call_service** target: `sampling_engine`
- **emit_event** event: `sampling.sample_drawn`

### Draw_cluster (Priority: 3)

_Select clusters then enumerate_

**Given:**
- `method` (input) eq `cluster`
- `clusters` (input) exists

**Then:**
- **call_service** target: `sampling_engine`
- **emit_event** event: `sampling.sample_drawn`

### Missing_strata (Priority: 10) — Error: `SAMPLE_STRATA_MISSING`

_Stratified design missing strata definitions_

**Given:**
- `method` (input) eq `stratified_random`
- `strata_definitions` (input) not_exists

**Then:**
- **emit_event** event: `sampling.sample_rejected`

### Invalid_method (Priority: 11) — Error: `SAMPLE_METHOD_INVALID`

_Unsupported sampling method_

**Given:**
- `method_supported` (computed) eq `false`

**Then:**
- **emit_event** event: `sampling.sample_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SAMPLE_STRATA_MISSING` | 400 | Stratified sampling requires strata definitions with population shares | No |
| `SAMPLE_METHOD_INVALID` | 400 | Sampling method must be one of simple_random, stratified_random, cluster, convenience, judgmental | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sampling.sample_drawn` |  | `sample_id`, `method`, `sample_size`, `strata_count`, `estimated_sampling_error` |
| `sampling.sample_rejected` |  | `sample_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| central-limit-theorem | recommended |  |
| bootstrap-resampling | recommended |  |

## AGI Readiness

### Goals

#### Reliable Sampling Methods

Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading representativeness against cost and speed

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| draw_simple_random | `autonomous` | - | - |
| draw_stratified | `autonomous` | - | - |
| draw_cluster | `autonomous` | - | - |
| missing_strata | `autonomous` | - | - |
| invalid_method | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
stratified_example:
  strata:
    - id: small_cap
      population_share: 0.2
      sample_share: 0.2
    - id: mid_cap
      population_share: 0.3
      sample_share: 0.3
    - id: large_cap
      population_share: 0.5
      sample_share: 0.5
  total_sample_size: 200
  notes: Proportional allocation mirrors population mix
comparison_table:
  simple_random:
    representativeness: high
    cost: high
    sampling_error: moderate
  stratified:
    representativeness: high
    cost: moderate
    sampling_error: low
  cluster:
    representativeness: moderate
    cost: low
    sampling_error: high
  convenience:
    representativeness: low
    cost: low
    sampling_error: unquantifiable
  judgmental:
    representativeness: depends
    cost: low
    sampling_error: unquantifiable
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sampling Methods Blueprint",
  "description": "Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading represent",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, sampling, probability-sampling, stratified-sampling, cluster-sampling, sampling-error, cfa-level-1"
}
</script>
