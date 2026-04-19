---
title: "Performance Attribution Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "GIPS-compliant TWR daily returns and Brinson-Fachler attribution decomposing excess return into allocation, selection, and interaction. 11 fields. 5 outcomes. 3"
---

# Performance Attribution Blueprint

> GIPS-compliant TWR daily returns and Brinson-Fachler attribution decomposing excess return into allocation, selection, and interaction

| | |
|---|---|
| **Feature** | `performance-attribution` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | performance, attribution, twr, gips, brinson-fachler, benchmark, returns |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/performance-attribution.blueprint.yaml) |
| **JSON API** | [performance-attribution.json]({{ site.baseurl }}/api/blueprints/trading/performance-attribution.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio Identifier |  |
| `benchmark` | text | Yes | Benchmark Identifier |  |
| `period_start` | date | Yes | Period Start |  |
| `period_end` | date | Yes | Period End |  |
| `twr` | number | No | Time-Weighted Return |  |
| `benchmark_return` | number | No | Benchmark Return |  |
| `allocation_effect` | number | No | Allocation Effect |  |
| `selection_effect` | number | No | Selection Effect |  |
| `interaction_effect` | number | No | Interaction Effect |  |
| `cash_flows` | json | No | External Cash Flows |  |
| `data_gaps` | json | No | Missing Data Points |  |

## Rules

- **twr:**
  - **description:** MUST: Daily time-weighted returns chain-linked geometrically; adjust for external cash flows on the day they occur (Modified Dietz or true TWR)
  - **frequency:** daily
  - **method:** true_twr
- **gips:**
  - **description:** MUST: Returns compliant with GIPS — no dollar-weighting, composite construction documented, dispersion disclosed
  - **composite_required:** true
- **benchmark_declared:**
  - **description:** MUST: Benchmark declared in IPS; changes require client notice and effective-date accounting
- **brinson_fachler:**
  - **description:** MUST: Attribution uses Brinson-Fachler (sector-relative) decomposition; sum of effects equals excess return
- **cash_flow_timing:**
  - **description:** MUST: Large external cash flows (> 10% of portfolio) trigger sub-period split to avoid return distortion
  - **threshold_pct:** 10
- **data_quality:**
  - **description:** MUST: Pricing and weights validated before attribution runs; missing data produces a flagged gap, not a zero
- **reporting:**
  - **description:** MUST: Attribution reports include period, composite, gross and net returns, benchmark, and effects

## Outcomes

### Calculation_failed (Priority: 1) — Error: `PERFORMANCE_CALCULATION_FAILED`

_Numerical failure in return or attribution computation_

**Given:**
- calculation returned NaN or chain-link divergence

**Then:**
- **notify** target: `performance_team`
- **emit_event** event: `performance.calculation_failed`

**Result:** Performance team investigates

### Benchmark_mismatch (Priority: 2) — Error: `PERFORMANCE_BENCHMARK_MISMATCH`

_Portfolio benchmark does not match the IPS-declared benchmark_

**Given:**
- benchmark differs from the IPS benchmark

**Then:**
- **notify** target: `compliance_officer`
- **emit_event** event: `performance.benchmark_mismatch`

**Result:** Attribution blocked pending reconciliation

### Data_gap_detected (Priority: 3) — Error: `PERFORMANCE_DATA_GAP`

_Pricing or weights missing for at least one day in the period_

**Given:**
- one or more required data points are missing

**Then:**
- **emit_event** event: `performance.data_gap_detected`

**Result:** Gap flagged; attribution continues with documented exclusions

### Returns_calculated_successfully (Priority: 10) | Transaction: atomic

_Daily TWR computed and chain-linked to produce period return_

**Given:**
- all daily pricing points are available
- external cash flows have been captured

**Then:**
- **set_field** target: `twr` value: `computed`
- **emit_event** event: `performance.returns_calculated`

**Result:** TWR persisted

### Attribution_computed (Priority: 10) | Transaction: atomic

_Brinson-Fachler attribution decomposed into allocation, selection, and interaction_

**Given:**
- portfolio returns calculated
- benchmark returns available

**Then:**
- **set_field** target: `allocation_effect` value: `computed`
- **set_field** target: `selection_effect` value: `computed`
- **set_field** target: `interaction_effect` value: `computed`
- **emit_event** event: `performance.attribution_computed`

**Result:** Attribution report available

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PERFORMANCE_BENCHMARK_MISMATCH` | 409 | Portfolio benchmark does not match the declared IPS benchmark. | No |
| `PERFORMANCE_DATA_GAP` | 422 | Required pricing or weights data are missing. | Yes |
| `PERFORMANCE_CALCULATION_FAILED` | 500 | Performance calculation could not complete. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `performance.returns_calculated` | Daily returns chain-linked | `portfolio_id`, `period_start`, `period_end`, `twr` |
| `performance.attribution_computed` | Brinson-Fachler attribution produced | `portfolio_id`, `allocation_effect`, `selection_effect`, `interaction_effect` |
| `performance.benchmark_mismatch` | Benchmark does not match IPS | `portfolio_id`, `declared`, `supplied` |
| `performance.data_gap_detected` | Data gap in period | `portfolio_id`, `gap_count` |
| `performance.calculation_failed` | Performance computation failed | `portfolio_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gips-standards-l3 | required | Attribution methodology must satisfy GIPS standards |
| client-risk-profiling-ips | required | IPS declares the benchmark used for attribution |
| observability-metrics | recommended | Calculation latency and gap rate are operational SLIs |

## AGI Readiness

### Goals

#### Faithful Attribution

Produce GIPS-compliant returns and Brinson-Fachler attribution that reconciles exactly to excess return

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| reconciliation_error | < 0.0001 | Absolute difference between sum of effects and excess return |
| data_gap_rate | < 1% | Percentage of days with data gaps |

**Constraints:**

- **regulatory** (non-negotiable): GIPS compliance non-negotiable

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before publishing quarterly or annual reports

**Escalation Triggers:**

- `benchmark_mismatch`
- `calculation_failed`

### Verification

**Invariants:**

- sum of allocation, selection, interaction equals excess return within tolerance
- TWR is chain-linked geometrically
- benchmark used matches IPS

### Coordination

**Protocol:** `request_response`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| returns_calculated_successfully | `autonomous` | - | - |
| attribution_computed | `autonomous` | - | - |
| calculation_failed | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Performance Attribution Blueprint",
  "description": "GIPS-compliant TWR daily returns and Brinson-Fachler attribution decomposing excess return into allocation, selection, and interaction. 11 fields. 5 outcomes. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "performance, attribution, twr, gips, brinson-fachler, benchmark, returns"
}
</script>
