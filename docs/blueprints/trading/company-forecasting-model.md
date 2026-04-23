---
title: "Company Forecasting Model Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Forecast company financials — revenue, operating costs, working capital, capital investment — using top-down, bottom-up, and hybrid methods with scenario analys"
---

# Company Forecasting Model Blueprint

> Forecast company financials — revenue, operating costs, working capital, capital investment — using top-down, bottom-up, and hybrid methods with scenario analysis

| | |
|---|---|
| **Feature** | `company-forecasting-model` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, forecasting, scenario-analysis, financial-modeling, revenue-projection, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/company-forecasting-model.blueprint.yaml) |
| **JSON API** | [company-forecasting-model.json]({{ site.baseurl }}/api/blueprints/trading/company-forecasting-model.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `forecaster` | Company Forecasting Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Forecast model identifier |  |
| `entity_id` | text | Yes | Entity identifier |  |
| `approach` | select | Yes | top_down \| bottom_up \| hybrid |  |
| `horizon_years` | number | Yes | Forecast horizon in years |  |

## Rules

- **forecast_objects:**
  - **regular_disclosures:** Revenue, margins, capex, working capital
  - **avoid_invisibles:** Do not forecast items not reported or unstable
- **approaches:**
  - **top_down:** Macro -> industry -> company
  - **bottom_up:** Store/unit/SKU -> company
  - **hybrid:** Bottom-up for near years, top-down for terminal
- **horizon_selection:**
  - **factors:** Business cycle, visibility, analyst purpose
  - **typical:** 3-5 explicit years; then fade to terminal
- **revenue_projection:**
  - **unit_based:** Price x volume by segment
  - **growth_decay:** High growth fades to GDP-consistent terminal
  - **market_share:** Industry growth x share trend
- **cost_projection:**
  - **cogs:** Gross margin stable or drift to peer median
  - **sga:** Scale with revenue, fixed component
  - **tax:** Statutory rate adjusted for permanent differences
- **working_capital_projection:**
  - **method:** Days-based (DSO/DIO/DPO) linked to revenue and COGS
  - **cyclical:** Allow widening in downturns
- **capex_and_depreciation:**
  - **maintenance_capex:** Replaces worn assets; approximates depreciation
  - **growth_capex:** Drives future revenue expansion
- **scenario_analysis:**
  - **base:** Most probable path
  - **bull:** Upside given favourable assumptions
  - **bear:** Stress case with adverse conditions
- **validation:**
  - **model_required:** model_id present
  - **valid_approach:** approach in allowed set
  - **positive_horizon:** horizon_years > 0

## Outcomes

### Generate_forecast (Priority: 1)

_Build multi-year forecast under chosen approach_

**Given:**
- `model_id` (input) exists
- `entity_id` (input) exists
- `approach` (input) in `top_down,bottom_up,hybrid`
- `horizon_years` (input) gt `0`

**Then:**
- **call_service** target: `forecaster`
- **emit_event** event: `forecast.generated`

### Invalid_approach (Priority: 10) — Error: `FORECAST_INVALID_APPROACH`

_Unsupported approach_

**Given:**
- `approach` (input) not_in `top_down,bottom_up,hybrid`

**Then:**
- **emit_event** event: `forecast.rejected`

### Invalid_horizon (Priority: 11) — Error: `FORECAST_INVALID_HORIZON`

_Horizon non-positive_

**Given:**
- `horizon_years` (input) lte `0`

**Then:**
- **emit_event** event: `forecast.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FORECAST_INVALID_APPROACH` | 400 | approach must be top_down, bottom_up, or hybrid | No |
| `FORECAST_INVALID_HORIZON` | 400 | horizon_years must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `forecast.generated` |  | `model_id`, `entity_id`, `approach`, `horizon_years`, `scenarios` |
| `forecast.rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| company-business-model-analysis | required |  |
| industry-competitive-analysis | required |  |
| equity-valuation-ddm | recommended |  |

## AGI Readiness

### Goals

#### Reliable Company Forecasting Model

Forecast company financials — revenue, operating costs, working capital, capital investment — using top-down, bottom-up, and hybrid methods with scenario analysis

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
| `company_business_model_analysis` | company-business-model-analysis | fail |
| `industry_competitive_analysis` | industry-competitive-analysis | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| generate_forecast | `autonomous` | - | - |
| invalid_approach | `autonomous` | - | - |
| invalid_horizon | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Company Forecasting Model Blueprint",
  "description": "Forecast company financials — revenue, operating costs, working capital, capital investment — using top-down, bottom-up, and hybrid methods with scenario analys",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, forecasting, scenario-analysis, financial-modeling, revenue-projection, cfa-level-1"
}
</script>
