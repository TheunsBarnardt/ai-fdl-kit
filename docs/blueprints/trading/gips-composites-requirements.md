---
title: "Gips Composites Requirements Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Define GIPS composites, describe the requirements for composite construction, return calculation, disclosures, and presentation, and present minimum required it"
---

# Gips Composites Requirements Blueprint

> Define GIPS composites, describe the requirements for composite construction, return calculation, disclosures, and presentation, and present minimum required items on a compliant presentation

| | |
|---|---|
| **Feature** | `gips-composites-requirements` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, gips, composite-construction, performance-presentation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/gips-composites-requirements.blueprint.yaml) |
| **JSON API** | [gips-composites-requirements.json]({{ site.baseurl }}/api/blueprints/trading/gips-composites-requirements.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `composite_mgr` | Composite Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `composite_id` | text | Yes | Composite identifier |  |
| `composite_definition` | text | Yes | Strategy description |  |

## Rules

- **composite_definition:**
  - **rule:** Aggregation of one or more portfolios managed according to similar investment mandate, objective, or strategy
  - **all_inclusive:** All actual, fee-paying, discretionary portfolios managed to that strategy must be included
  - **non_discretionary:** Excluded from composites but included in firm total
- **carve_outs:**
  - **rule:** Only allowed if managed separately with own cash balance; cash allocations required
- **minimum_presentation_periods:**
  - **inception_to_5:** Five years minimum, or since inception if less
  - **build_to_10:** Add year-by-year until 10 years
- **required_statistics:**
  - **composite_return:** Annual returns for each period
  - **benchmark_return:** Appropriate benchmark for same periods
  - **dispersion:** Internal dispersion across portfolios in composite
  - **three_year_ex_post_standard_deviation:** After 36 months of monthly returns
  - **number_of_portfolios:** Count at period end (or n/a if <5)
  - **composite_assets:** At period end
  - **firm_assets_or_percentage:** Total firm AUM or composite percentage
- **required_disclosures:**
  - **compliance_statement:** Boilerplate claim
  - **benchmark_description:** Benchmark selection rationale
  - **fees:** Gross or net of fees; fee schedule
  - **use_of_leverage:** If applicable
  - **significant_events:** Material firm changes
- **validation:**
  - **composite_required:** composite_id present

## Outcomes

### Construct_composite (Priority: 1)

_Construct GIPS-compliant composite_

**Given:**
- `composite_id` (input) exists

**Then:**
- **call_service** target: `composite_mgr`
- **emit_event** event: `composite.constructed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GIPS_COMPOSITE_INVALID` | 400 | composite construction inputs invalid | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `composite.constructed` |  | `composite_id`, `portfolio_count`, `aum`, `benchmark`, `dispersion` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gips-compliance-fundamentals | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gips Composites Requirements Blueprint",
  "description": "Define GIPS composites, describe the requirements for composite construction, return calculation, disclosures, and presentation, and present minimum required it",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, gips, composite-construction, performance-presentation, cfa-level-1"
}
</script>
