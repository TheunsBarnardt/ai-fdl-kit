---
title: "Equity Valuation Ddm Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value equity with dividend discount models — single-stage Gordon growth, two-stage, three-stage, H-model — and determine when each fits a firm's growth pattern."
---

# Equity Valuation Ddm Blueprint

> Value equity with dividend discount models — single-stage Gordon growth, two-stage, three-stage, H-model — and determine when each fits a firm's growth pattern

| | |
|---|---|
| **Feature** | `equity-valuation-ddm` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, valuation, ddm, gordon-growth, multistage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-valuation-ddm.blueprint.yaml) |
| **JSON API** | [equity-valuation-ddm.json]({{ site.baseurl }}/api/blueprints/trading/equity-valuation-ddm.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ddm_engine` | Dividend Discount Valuation Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `valuation_id` | text | Yes | Valuation identifier |  |
| `model_variant` | select | Yes | gordon \| two_stage \| three_stage \| h_model \| fcfe |  |
| `cost_of_equity` | number | Yes | Required return on equity (decimal) |  |
| `terminal_growth` | number | Yes | Long-run growth rate (decimal) |  |

## Rules

- **gordon_growth:**
  - **formula:** V0 = D1 / (r - g)
  - **constraint:** g < r and g constant in perpetuity
  - **sensitivity:** Very sensitive to r - g; small changes swing value materially
- **two_stage_model:**
  - **formula:** PV of high-growth dividends + terminal value at end of high-growth
  - **use_case:** Firm with finite high-growth horizon
- **three_stage_model:**
  - **phases:** Initial, transition with linearly declining growth, terminal
- **h_model:**
  - **formula:** V0 = D0*(1+g_L)/(r-g_L) + D0*H*(g_H - g_L)/(r - g_L)
  - **interpretation:** Approximates linear fade from g_H to g_L over 2H years
- **preferred_stock:**
  - **formula:** V0 = D / r when non-callable, non-convertible, perpetual
- **fcfe_model:**
  - **formula:** PV of Free Cash Flow to Equity discounted at cost of equity
  - **preferred_when:** Dividends not paid or differ from capacity
- **dividend_capacity:**
  - **formula:** Sustainable growth = ROE * (1 - payout)
  - **interpretation:** Higher retention and ROE support higher growth
- **validation:**
  - **valuation_required:** valuation_id present
  - **valid_variant:** model_variant in allowed set
  - **g_less_than_r:** terminal_growth < cost_of_equity

## Outcomes

### Value_equity_via_ddm (Priority: 1)

_Compute intrinsic value under chosen DDM variant_

**Given:**
- `valuation_id` (input) exists
- `model_variant` (input) in `gordon,two_stage,three_stage,h_model,fcfe`
- `cost_of_equity` (input) gt `0`

**Then:**
- **call_service** target: `ddm_engine`
- **emit_event** event: `ddm.valued`

### Invalid_variant (Priority: 10) — Error: `DDM_INVALID_VARIANT`

_Unsupported DDM variant_

**Given:**
- `model_variant` (input) not_in `gordon,two_stage,three_stage,h_model,fcfe`

**Then:**
- **emit_event** event: `ddm.valuation_rejected`

### Invalid_growth (Priority: 11) — Error: `DDM_GROWTH_EXCEEDS_RATE`

_Terminal growth exceeds cost of equity_

**Given:**
- `terminal_growth` (input) gte `cost_of_equity`

**Then:**
- **emit_event** event: `ddm.valuation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DDM_INVALID_VARIANT` | 400 | model_variant must be gordon, two_stage, three_stage, h_model, or fcfe | No |
| `DDM_GROWTH_EXCEEDS_RATE` | 400 | terminal_growth must be strictly less than cost_of_equity | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ddm.valued` |  | `valuation_id`, `variant`, `intrinsic_value`, `implied_upside` |
| `ddm.valuation_rejected` |  | `valuation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-return-roe | required |  |
| equity-valuation-multiples | recommended |  |
| enterprise-value-asset-based | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Valuation Ddm Blueprint",
  "description": "Value equity with dividend discount models — single-stage Gordon growth, two-stage, three-stage, H-model — and determine when each fits a firm's growth pattern.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, valuation, ddm, gordon-growth, multistage, cfa-level-1"
}
</script>
