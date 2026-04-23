---
title: "Portfolio Performance Measures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute Sharpe ratio, Treynor ratio, M-squared, Jensen's alpha, and security characteristic line to evaluate risk-adjusted performance against benchmarks. 6 fie"
---

# Portfolio Performance Measures Blueprint

> Compute Sharpe ratio, Treynor ratio, M-squared, Jensen's alpha, and security characteristic line to evaluate risk-adjusted performance against benchmarks

| | |
|---|---|
| **Feature** | `portfolio-performance-measures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, sharpe-ratio, treynor-ratio, jensens-alpha, m-squared, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-performance-measures.blueprint.yaml) |
| **JSON API** | [portfolio-performance-measures.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-performance-measures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `perf_calc` | Performance Measure Calculator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `perf_id` | text | Yes | Performance calc identifier |  |
| `portfolio_return` | number | Yes | Portfolio return |  |
| `portfolio_std` | number | No | Portfolio std dev |  |
| `portfolio_beta` | number | No | Portfolio beta |  |
| `benchmark_return` | number | Yes | Benchmark return |  |
| `risk_free_rate` | number | Yes | Risk-free rate |  |

## Rules

- **sharpe_ratio:**
  - **formula:** (Rp - Rf) / sd(Rp)
  - **use:** Total-risk-adjusted return; for standalone portfolio
- **treynor_ratio:**
  - **formula:** (Rp - Rf) / beta_p
  - **use:** Systematic-risk-adjusted; for diversified sub-portfolio
- **m_squared:**
  - **formula:** Rf + Sharpe_p * sd(Rm)
  - **interpretation:** Risk-adjusted performance stated as return at market risk level
- **jensens_alpha:**
  - **formula:** Rp - [Rf + beta_p * (Rm - Rf)]
  - **interpretation:** Excess return over CAPM-expected
- **security_characteristic_line:**
  - **definition:** Plot of asset excess return vs. market excess return; intercept is Jensen's alpha, slope is beta
- **validation:**
  - **perf_required:** perf_id present

## Outcomes

### Compute_performance (Priority: 1)

_Compute chosen performance measure_

**Given:**
- `perf_id` (input) exists

**Then:**
- **call_service** target: `perf_calc`
- **emit_event** event: `performance.measured`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PERF_MEASURE_INVALID` | 400 | measure inputs invalid | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `performance.measured` |  | `perf_id`, `sharpe`, `treynor`, `m_squared`, `jensens_alpha` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capm-security-market-line | required |  |

## AGI Readiness

### Goals

#### Reliable Portfolio Performance Measures

Compute Sharpe ratio, Treynor ratio, M-squared, Jensen's alpha, and security characteristic line to evaluate risk-adjusted performance against benchmarks

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
| `capm_security_market_line` | capm-security-market-line | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_performance | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Performance Measures Blueprint",
  "description": "Compute Sharpe ratio, Treynor ratio, M-squared, Jensen's alpha, and security characteristic line to evaluate risk-adjusted performance against benchmarks. 6 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, sharpe-ratio, treynor-ratio, jensens-alpha, m-squared, cfa-level-1"
}
</script>
