---
title: "Farmland Timberland Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Invest in farmland and timberland for combined income from crop/lumber sales and land appreciation, with biological growth providing optionality on harvest timi"
---

# Farmland Timberland Investments Blueprint

> Invest in farmland and timberland for combined income from crop/lumber sales and land appreciation, with biological growth providing optionality on harvest timing

| | |
|---|---|
| **Feature** | `farmland-timberland-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | natural-resources, farmland, timberland, real-assets, biological-growth, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/farmland-timberland-investments.blueprint.yaml) |
| **JSON API** | [farmland-timberland-investments.json]({{ site.baseurl }}/api/blueprints/trading/farmland-timberland-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `land_analyst` | Land Investment Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `land_id` | text | Yes | Land investment identifier |  |
| `land_type` | select | Yes | farmland \| timberland \| raw_land |  |
| `region` | text | No | Geographic region |  |

## Rules

- **sources_of_return:**
  - **income:** Crop sales (row, permanent) or timber harvest
  - **appreciation:** Land value growth
  - **biological_growth:** Trees grow volume and value with age — defer-harvest optionality
- **farmland_specifics:**
  - **row_crops:** Annual rotation; price exposure to corn, soy, wheat
  - **permanent_crops:** Nuts, fruits; longer horizon, higher capex
  - **leasing:** Cash lease (fixed) or crop share (variable income)
- **timberland_specifics:**
  - **harvest_optionality:** Defer cutting in weak prices; value compounds via growth
  - **species_mix:** Softwood vs. hardwood; end-market differs
- **inflation_hedging:**
  - **rule:** Both asset classes provide partial inflation hedge via commodity prices and land value
- **risks:**
  - **weather:** Droughts, storms, disease
  - **commodity_prices:** Farm income sensitive to spot agricultural prices
  - **political:** Land-use rules, export controls, water rights
- **validation:**
  - **land_required:** land_id present
  - **valid_type:** land_type in [farmland, timberland, raw_land]

## Outcomes

### Analyse_land (Priority: 1)

_Analyse farmland or timberland investment_

**Given:**
- `land_id` (input) exists
- `land_type` (input) in `farmland,timberland,raw_land`

**Then:**
- **call_service** target: `land_analyst`
- **emit_event** event: `land.analysed`

### Invalid_type (Priority: 10) — Error: `LAND_INVALID_TYPE`

_Unsupported land type_

**Given:**
- `land_type` (input) not_in `farmland,timberland,raw_land`

**Then:**
- **emit_event** event: `land.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LAND_INVALID_TYPE` | 400 | land_type must be farmland, timberland, or raw_land | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `land.analysed` |  | `land_id`, `land_type`, `income_yield`, `appreciation`, `biological_growth` |
| `land.analysis_rejected` |  | `land_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| natural-resources-commodities | recommended |  |
| alt-investments-features-categories | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Farmland Timberland Investments Blueprint",
  "description": "Invest in farmland and timberland for combined income from crop/lumber sales and land appreciation, with biological growth providing optionality on harvest timi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "natural-resources, farmland, timberland, real-assets, biological-growth, cfa-level-1"
}
</script>
