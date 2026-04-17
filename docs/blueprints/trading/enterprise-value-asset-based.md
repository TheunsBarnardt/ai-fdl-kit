---
title: "Enterprise Value Asset Based Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value firms using enterprise-value multiples (EV/EBITDA, EV/Sales, EV/Invested Capital) and asset-based methods, including when each is appropriate. 4 fields. 2"
---

# Enterprise Value Asset Based Blueprint

> Value firms using enterprise-value multiples (EV/EBITDA, EV/Sales, EV/Invested Capital) and asset-based methods, including when each is appropriate

| | |
|---|---|
| **Feature** | `enterprise-value-asset-based` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, valuation, enterprise-value, ev-ebitda, asset-based, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/enterprise-value-asset-based.blueprint.yaml) |
| **JSON API** | [enterprise-value-asset-based.json]({{ site.baseurl }}/api/blueprints/trading/enterprise-value-asset-based.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ev_engine` | Enterprise Value & Asset Valuation Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `valuation_id` | text | Yes | Valuation identifier |  |
| `method` | select | Yes | ev_ebitda \| ev_sales \| ev_ic \| asset_based |  |
| `equity_market_cap` | number | No | Equity market capitalisation |  |
| `net_debt` | number | No | Debt minus cash |  |

## Rules

- **enterprise_value:**
  - **formula:** EV = equity market cap + debt + preferred + minority interest - cash
  - **intuition:** Price a buyer pays for the whole firm, independent of capital structure
- **ev_multiples:**
  - **ev_ebitda:** Capital-structure-neutral; useful for cross-firm
  - **ev_sales:** When earnings are negative; stable across cycles
  - **ev_ic:** Return profile; complement to ROIC
- **asset_based_methods:**
  - **going_concern:** Net asset value = fair assets - fair liabilities
  - **liquidation:** Orderly or forced liquidation proceeds
  - **replacement_cost:** Cost to reproduce the firm's assets
- **suitable_cases:**
  - **asset_based_best_for:** Financial firms where assets are liquid and market-marked, Natural resource firms with appraised reserves, Holding companies with marketable holdings
  - **poor_fit:** Service firms with large intangible value, Brand-driven businesses
- **comparisons:**
  - **vs_dcf:** Multiples give relative value; DCF gives absolute
  - **vs_ddm:** EV works for debt-heavy firms where DDM struggles
- **validation:**
  - **valuation_required:** valuation_id present
  - **valid_method:** method in allowed set

## Outcomes

### Value_firm_via_ev (Priority: 1)

_Compute enterprise or asset-based value_

**Given:**
- `valuation_id` (input) exists
- `method` (input) in `ev_ebitda,ev_sales,ev_ic,asset_based`

**Then:**
- **call_service** target: `ev_engine`
- **emit_event** event: `ev.valued`

### Invalid_method (Priority: 10) — Error: `EV_INVALID_METHOD`

_Unsupported method_

**Given:**
- `method` (input) not_in `ev_ebitda,ev_sales,ev_ic,asset_based`

**Then:**
- **emit_event** event: `ev.valuation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EV_INVALID_METHOD` | 400 | method must be ev_ebitda, ev_sales, ev_ic, or asset_based | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ev.valued` |  | `valuation_id`, `method`, `implied_enterprise_value`, `implied_equity_value` |
| `ev.valuation_rejected` |  | `valuation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-valuation-multiples | recommended |  |
| equity-valuation-ddm | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Enterprise Value Asset Based Blueprint",
  "description": "Value firms using enterprise-value multiples (EV/EBITDA, EV/Sales, EV/Invested Capital) and asset-based methods, including when each is appropriate. 4 fields. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, valuation, enterprise-value, ev-ebitda, asset-based, cfa-level-1"
}
</script>
