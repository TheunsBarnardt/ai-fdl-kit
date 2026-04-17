---
title: "Geopolitical Risk Types Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Categorize geopolitical risk by velocity (event, exogenous, thematic) and assess its investment impact via likelihood, velocity, and portfolio effect. 5 fields."
---

# Geopolitical Risk Types Blueprint

> Categorize geopolitical risk by velocity (event, exogenous, thematic) and assess its investment impact via likelihood, velocity, and portfolio effect

| | |
|---|---|
| **Feature** | `geopolitical-risk-types` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, geopolitics, risk-analysis, event-risk, exogenous-risk, thematic-risk, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/geopolitical-risk-types.blueprint.yaml) |
| **JSON API** | [geopolitical-risk-types.json]({{ site.baseurl }}/api/blueprints/trading/geopolitical-risk-types.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `geo_risk_analyst` | Geopolitical Risk Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario_id` | text | Yes | Risk scenario identifier |  |
| `risk_type` | select | Yes | event \| exogenous \| thematic |  |
| `likelihood` | number | No | Probability (0 to 1) |  |
| `velocity` | select | No | high \| medium \| low |  |
| `portfolio_impact` | json | No | Expected P&L impact across asset classes |  |

## Rules

- **risk_types:**
  - **event_risk:** Discrete, scheduled events — elections, referenda, summits
  - **exogenous_risk:** Sudden unexpected shocks — war, coup, terror attack, natural disaster
  - **thematic_risk:** Slow-building structural shifts — climate, demographics, deglobalization
- **assessment_dimensions:**
  - **likelihood:** Probability the risk materialises
  - **velocity:** Speed with which it affects markets
  - **breadth:** How broadly it transmits (local, regional, global)
  - **persistence:** How long the impact lasts
- **manifestations:**
  - **direct:** Asset price moves, flight to quality, FX gaps
  - **indirect:** Supply chain disruption, input cost shocks, regulatory change
  - **correlation_spike:** Risk assets reprice together during crises
- **investment_response:**
  - **hedges:** Options, CDS, safe-haven FX, commodity overlays
  - **diversification:** Multi-region, multi-sector exposure
  - **liquidity_buffer:** Maintain cash for redeployment
- **validation:**
  - **valid_risk_type:** risk_type in {event, exogenous, thematic}
  - **valid_likelihood:** 0 <= likelihood <= 1 when provided

## Outcomes

### Score_risk (Priority: 1)

_Classify risk and assign portfolio actions_

**Given:**
- `scenario_id` (input) exists
- `risk_type` (input) in `event,exogenous,thematic`

**Then:**
- **call_service** target: `geo_risk_analyst`
- **emit_event** event: `geopolitics.risk_scored`

### High_impact_warning (Priority: 2)

_Flag high likelihood + high velocity risks_

**Given:**
- `risk_flag` (computed) eq `true`

**Then:**
- **emit_event** event: `geopolitics.risk_warning`

### Invalid_type (Priority: 10) — Error: `GEO_RISK_INVALID_TYPE`

_Unsupported risk type_

**Given:**
- `risk_type` (input) not_in `event,exogenous,thematic`

**Then:**
- **emit_event** event: `geopolitics.risk_rejected`

### Missing_scenario (Priority: 11) — Error: `GEO_RISK_SCENARIO_MISSING`

_Scenario missing_

**Given:**
- `scenario_id` (input) not_exists

**Then:**
- **emit_event** event: `geopolitics.risk_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEO_RISK_INVALID_TYPE` | 400 | risk_type must be event, exogenous, or thematic | No |
| `GEO_RISK_SCENARIO_MISSING` | 400 | scenario_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `geopolitics.risk_scored` |  | `score_id`, `risk_type`, `likelihood`, `velocity`, `recommended_action` |
| `geopolitics.risk_warning` |  | `score_id`, `reason`, `suggested_hedges` |
| `geopolitics.risk_rejected` |  | `score_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| geopolitical-analysis-framework | required |  |
| international-trade-framework | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geopolitical Risk Types Blueprint",
  "description": "Categorize geopolitical risk by velocity (event, exogenous, thematic) and assess its investment impact via likelihood, velocity, and portfolio effect. 5 fields.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, geopolitics, risk-analysis, event-risk, exogenous-risk, thematic-risk, cfa-level-1"
}
</script>
