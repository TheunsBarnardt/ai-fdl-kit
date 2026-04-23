---
title: "Industry Competitive Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify industry structure, apply Porter's five forces, assess external PEST influences, and characterise competitive positioning along cost and differentiatio"
---

# Industry Competitive Analysis Blueprint

> Classify industry structure, apply Porter's five forces, assess external PEST influences, and characterise competitive positioning along cost and differentiation axes

| | |
|---|---|
| **Feature** | `industry-competitive-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, industry-analysis, porter-five-forces, competitive-positioning, pest, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/industry-competitive-analysis.blueprint.yaml) |
| **JSON API** | [industry-competitive-analysis.json]({{ site.baseurl }}/api/blueprints/trading/industry-competitive-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `industry_analyst` | Industry & Competitive Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `industry_id` | text | Yes | Industry identifier or classification code |  |
| `classification_scheme` | select | No | gics \| icb \| naics \| sic \| custom |  |
| `lifecycle_stage` | select | No | embryonic \| growth \| shakeout \| mature \| declining |  |
| `concentration` | select | No | fragmented \| concentrated \| monopolistic \| oligopolistic |  |

## Rules

- **classification_schemes:**
  - **gics:** Global Industry Classification Standard (MSCI / S&P)
  - **icb:** Industry Classification Benchmark (FTSE)
  - **naics:** North American Industry Classification
  - **sic:** Legacy Standard Industrial Classification
  - **custom:** Analyst-defined peer groups
- **lifecycle_stages:**
  - **embryonic:** Slow growth, high prices, high risk
  - **growth:** Rapid demand, low competition, expanding margins
  - **shakeout:** Slowing growth, intensifying rivalry
  - **mature:** Slow growth, high consolidation
  - **declining:** Negative growth, overcapacity
- **porter_five_forces:**
  - **rivalry:** Concentration, growth rate, fixed costs, exit barriers
  - **new_entrants:** Barriers — scale, capital, regulation, brand
  - **substitutes:** Price-performance of alternatives
  - **supplier_power:** Concentration, switching costs, forward integration
  - **buyer_power:** Concentration, price sensitivity, backward integration
- **external_influences_pest:**
  - **political:** Government stability, taxation, trade policy
  - **economic:** Growth, inflation, rates, currency
  - **social:** Demographics, preferences, education
  - **technological:** Innovation cycles, productivity gains
- **competitive_positioning:**
  - **cost_leadership:** Scale, process efficiency, low prices
  - **differentiation:** Brand, quality, service, innovation
  - **focus:** Niche segments where broader players under-serve
- **validation:**
  - **industry_required:** industry_id present

## Outcomes

### Analyze_industry (Priority: 1)

_Produce an industry structure and positioning profile_

**Given:**
- `industry_id` (input) exists

**Then:**
- **call_service** target: `industry_analyst`
- **emit_event** event: `industry.analyzed`

### Missing_industry (Priority: 10) — Error: `IND_MISSING_ID`

_Industry identifier missing_

**Given:**
- `industry_id` (input) not_exists

**Then:**
- **emit_event** event: `industry.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IND_MISSING_ID` | 400 | industry_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `industry.analyzed` |  | `analysis_id`, `industry_id`, `lifecycle_stage`, `concentration`, `forces_score` |
| `industry.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| company-business-model-analysis | required |  |
| company-forecasting-model | recommended |  |

## AGI Readiness

### Goals

#### Reliable Industry Competitive Analysis

Classify industry structure, apply Porter's five forces, assess external PEST influences, and characterise competitive positioning along cost and differentiation axes

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyze_industry | `autonomous` | - | - |
| missing_industry | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Industry Competitive Analysis Blueprint",
  "description": "Classify industry structure, apply Porter's five forces, assess external PEST influences, and characterise competitive positioning along cost and differentiatio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, industry-analysis, porter-five-forces, competitive-positioning, pest, cfa-level-1"
}
</script>
