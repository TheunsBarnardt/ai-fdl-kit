---
title: "Fsa Ratio Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply activity, liquidity, solvency, profitability, and valuation ratios with DuPont decomposition to compare firm performance across peers and time. 6 fields. "
---

# Fsa Ratio Analysis Blueprint

> Apply activity, liquidity, solvency, profitability, and valuation ratios with DuPont decomposition to compare firm performance across peers and time

| | |
|---|---|
| **Feature** | `fsa-ratio-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, ratio-analysis, dupont, activity-ratios, solvency-ratios, profitability, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-ratio-analysis.blueprint.yaml) |
| **JSON API** | [fsa-ratio-analysis.json]({{ site.baseurl }}/api/blueprints/trading/fsa-ratio-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ratio_engine` | Financial Ratio Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `period` | text | Yes | Reporting period |  |
| `revenue` | number | Yes | Revenue |  |
| `net_income` | number | Yes | Net income |  |
| `total_assets` | number | Yes | Total assets |  |
| `total_equity` | number | Yes | Total equity |  |

## Rules

- **activity_ratios:**
  - **inventory_turnover:** COGS / avg inventory
  - **receivables_turnover:** Revenue / avg receivables
  - **payables_turnover:** Purchases / avg payables
  - **total_asset_turnover:** Revenue / avg total assets
- **liquidity_ratios:**
  - **current_ratio:** CA / CL
  - **quick_ratio:** (CA - inventory) / CL
  - **cash_ratio:** (Cash + MS) / CL
  - **defensive_interval:** (Cash + MS + receivables) / daily cash expenses
- **solvency_ratios:**
  - **debt_to_assets:** Total debt / total assets
  - **debt_to_equity:** Total debt / total equity
  - **financial_leverage:** Avg total assets / avg total equity
  - **interest_coverage:** EBIT / interest expense
- **profitability_ratios:**
  - **gross_margin:** Gross profit / revenue
  - **operating_margin:** Operating income / revenue
  - **net_margin:** Net income / revenue
  - **roa:** Net income / avg total assets
  - **roe:** Net income / avg equity
- **dupont_decomposition:**
  - **three_step_roe:** ROE = net margin x asset turnover x financial leverage
  - **five_step_roe:** ROE = tax burden x interest burden x EBIT margin x asset turnover x leverage
  - **use:** Isolate driver of ROE change — operations vs financing
- **valuation_ratios:**
  - **pe:** Price / EPS
  - **pb:** Price / book value per share
  - **ps:** Price / sales per share
  - **ev_ebitda:** Enterprise value / EBITDA
- **validation:**
  - **entity_required:** entity_id present
  - **positive_totals:** total_assets > 0 and total_equity > 0

## Outcomes

### Compute_ratios (Priority: 1)

_Compute full ratio set with DuPont_

**Given:**
- `entity_id` (input) exists
- `total_assets` (input) gt `0`
- `total_equity` (input) gt `0`

**Then:**
- **call_service** target: `ratio_engine`
- **emit_event** event: `ratio.computed`

### Invalid_totals (Priority: 10) — Error: `RATIO_INVALID_TOTAL`

_Non-positive totals_

**Given:**
- ANY: `total_assets` (input) lte `0` OR `total_equity` (input) lte `0`

**Then:**
- **emit_event** event: `ratio.rejected`

### Missing_entity (Priority: 11) — Error: `RATIO_ENTITY_MISSING`

_Entity id missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `ratio.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RATIO_INVALID_TOTAL` | 400 | total_assets and total_equity must be positive | No |
| `RATIO_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ratio.computed` |  | `computation_id`, `entity_id`, `period`, `roe`, `roa`, `leverage`, `dupont_breakdown` |
| `ratio.rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-income-statement | required |  |
| fsa-balance-sheet | required |  |
| fsa-cash-flow | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Ratio Analysis Blueprint",
  "description": "Apply activity, liquidity, solvency, profitability, and valuation ratios with DuPont decomposition to compare firm performance across peers and time. 6 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, ratio-analysis, dupont, activity-ratios, solvency-ratios, profitability, cfa-level-1"
}
</script>
