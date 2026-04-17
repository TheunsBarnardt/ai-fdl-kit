---
title: "Business Cycle Phases Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify the current business cycle phase — recovery, expansion, slowdown, or recession — using GDP growth, unemployment, inflation, and policy signals. 5 field"
---

# Business Cycle Phases Blueprint

> Classify the current business cycle phase — recovery, expansion, slowdown, or recession — using GDP growth, unemployment, inflation, and policy signals

| | |
|---|---|
| **Feature** | `business-cycle-phases` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, business-cycle, recession, expansion, phase-classification, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/business-cycle-phases.blueprint.yaml) |
| **JSON API** | [business-cycle-phases.json]({{ site.baseurl }}/api/blueprints/trading/business-cycle-phases.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `macro_engine` | Macroeconomic Analysis Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `gdp_growth` | number | Yes | Annualised real GDP growth rate (percent) |  |
| `unemployment_rate` | number | No | Current unemployment rate (percent) |  |
| `inflation_rate` | number | No | Current inflation rate (percent) |  |
| `output_gap` | number | No | Output gap (actual minus potential GDP, percent) |  |
| `capacity_utilisation` | number | No | Capacity utilisation rate (percent) |  |

## Rules

- **four_phases:**
  - **recovery:**
    - **description:** Initial rebound from trough — GDP growth turns positive
    - **unemployment:** High but peaking
    - **inflation:** Low and stable
    - **policy:** Accommodative
  - **expansion:**
    - **description:** Sustained above-trend growth
    - **unemployment:** Falling toward NAIRU
    - **inflation:** Rising gradually
    - **policy:** Neutral to tightening
  - **slowdown:**
    - **description:** Growth decelerates; output gap closing
    - **unemployment:** At cycle low; starting to rise
    - **inflation:** Often elevated
    - **policy:** Tight
  - **recession:**
    - **description:** Two consecutive quarters of negative GDP growth (rule of thumb)
    - **unemployment:** Rising sharply
    - **inflation:** Falling with demand
    - **policy:** Cutting aggressively
- **leads_and_lags:**
  - **leading:** Stock market, yield curve, orders, building permits
  - **coincident:** GDP, industrial production, personal income, retail sales
  - **lagging:** Unemployment rate, CPI, inventories-to-sales
- **investor_behavior:**
  - **recovery:** Cyclicals and small caps outperform
  - **expansion:** Quality growth, industrials lead
  - **slowdown:** Defensives, low-beta rotate in
  - **recession:** Long-duration bonds, gold, staples
- **applications:**
  - **sector_rotation:** Shift equity weights by phase to align with leaders
  - **credit_positioning:** Widen credit exposure in recovery, tighten into slowdown
  - **factor_timing:** Value tends to lead in recovery; quality in slowdown
- **validation:**
  - **gdp_growth_present:** gdp_growth required
  - **unemployment_bounds:** 0 <= unemployment_rate <= 100
  - **inflation_reasonable:** -10 <= inflation_rate <= 50

## Outcomes

### Classify_phase (Priority: 1)

_Assign the current cycle phase_

**Given:**
- `gdp_growth` (input) exists

**Then:**
- **call_service** target: `macro_engine`
- **emit_event** event: `macro.phase_classified`

### Recession_detected (Priority: 2)

_Two consecutive quarters of negative GDP growth_

**Given:**
- `recession_triggered` (computed) eq `true`

**Then:**
- **emit_event** event: `macro.recession_alert`

### Missing_growth (Priority: 10) — Error: `CYCLE_GDP_MISSING`

_GDP growth missing_

**Given:**
- `gdp_growth` (input) not_exists

**Then:**
- **emit_event** event: `macro.phase_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CYCLE_GDP_MISSING` | 400 | gdp_growth is required to classify a cycle phase | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `macro.phase_classified` |  | `classification_id`, `phase`, `confidence`, `supporting_signals` |
| `macro.recession_alert` |  | `alert_id`, `quarters_negative`, `magnitude` |
| `macro.phase_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| economic-indicators | required |  |
| credit-cycles | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
phase_signal_matrix:
  recovery:
    gdp: positive_accelerating
    unemployment: falling_from_peak
    inflation: rising
  expansion:
    gdp: above_trend
    unemployment: at_nairu
    inflation: stable_rising
  slowdown:
    gdp: below_trend_positive
    unemployment: bottoming
    inflation: peaking
  recession:
    gdp: negative
    unemployment: rising
    inflation: falling
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Business Cycle Phases Blueprint",
  "description": "Classify the current business cycle phase — recovery, expansion, slowdown, or recession — using GDP growth, unemployment, inflation, and policy signals. 5 field",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, business-cycle, recession, expansion, phase-classification, cfa-level-1"
}
</script>
