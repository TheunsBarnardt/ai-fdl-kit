---
title: "Alt Investments Performance Appraisal Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Appraise alternative-investment performance accounting for illiquidity, stale pricing, non-normal return distributions, benchmark selection, and comparability w"
---

# Alt Investments Performance Appraisal Blueprint

> Appraise alternative-investment performance accounting for illiquidity, stale pricing, non-normal return distributions, benchmark selection, and comparability with traditional assets

| | |
|---|---|
| **Feature** | `alt-investments-performance-appraisal` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternatives, performance-appraisal, smoothing, benchmarks, pme, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/alt-investments-performance-appraisal.blueprint.yaml) |
| **JSON API** | [alt-investments-performance-appraisal.json]({{ site.baseurl }}/api/blueprints/trading/alt-investments-performance-appraisal.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `alt_perf_engine` | Alt Performance Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `appraisal_id` | text | Yes | Appraisal identifier |  |
| `fund_type` | select | Yes | private_equity \| private_debt \| real_estate \| hedge_fund |  |
| `benchmark` | text | Yes | Benchmark reference |  |

## Rules

- **performance_challenges:**
  - **illiquidity:** Market prices unavailable; NAV relies on appraisals
  - **non_normality:** Skewed, fat-tailed returns; mean-variance inadequate
  - **survivorship_bias:** Failed funds drop out of indices inflating averages
  - **backfill_bias:** New entrants backfill favourable history
- **comparability_traditional:**
  - **issue:** Public indices priced daily; alts appraisal-based — direct comparison overstates alts Sharpe
  - **adjustment:** Unsmooth returns before comparing, or use PME techniques
- **pme_methods:**
  - **kaplan_schoar:** Sum of discounted distributions / sum of discounted contributions vs. public market
  - **direct_alpha:** IRR of PE cash flows minus public-index IRR of same flows
- **appropriate_metrics:**
  - **irr:** Money-weighted for private funds (GP controls timing)
  - **moic:** Multiple on invested capital; supplements IRR
  - **twr:** Time-weighted for hedge funds where investor controls flows
- **validation:**
  - **appraisal_required:** appraisal_id present
  - **valid_fund_type:** fund_type in allowed set

## Outcomes

### Appraise_performance (Priority: 1)

_Compute performance with illiquidity and bias adjustments_

**Given:**
- `appraisal_id` (input) exists
- `fund_type` (input) in `private_equity,private_debt,real_estate,hedge_fund`

**Then:**
- **call_service** target: `alt_perf_engine`
- **emit_event** event: `alt.performance_appraised`

### Invalid_fund_type (Priority: 10) — Error: `PERF_INVALID_FUND_TYPE`

_Unsupported fund type_

**Given:**
- `fund_type` (input) not_in `private_equity,private_debt,real_estate,hedge_fund`

**Then:**
- **emit_event** event: `alt.performance_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PERF_INVALID_FUND_TYPE` | 400 | fund_type must be private_equity, private_debt, real_estate, or hedge_fund | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alt.performance_appraised` |  | `appraisal_id`, `net_irr`, `moic`, `pme_ratio`, `benchmark_delta` |
| `alt.performance_rejected` |  | `appraisal_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-return-calculations | required |  |
| alt-investments-features-categories | required |  |

## AGI Readiness

### Goals

#### Reliable Alt Investments Performance Appraisal

Appraise alternative-investment performance accounting for illiquidity, stale pricing, non-normal return distributions, benchmark selection, and comparability with traditional assets

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
| `alt_investments_return_calculations` | alt-investments-return-calculations | fail |
| `alt_investments_features_categories` | alt-investments-features-categories | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| appraise_performance | `autonomous` | - | - |
| invalid_fund_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Alt Investments Performance Appraisal Blueprint",
  "description": "Appraise alternative-investment performance accounting for illiquidity, stale pricing, non-normal return distributions, benchmark selection, and comparability w",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternatives, performance-appraisal, smoothing, benchmarks, pme, cfa-level-1"
}
</script>
