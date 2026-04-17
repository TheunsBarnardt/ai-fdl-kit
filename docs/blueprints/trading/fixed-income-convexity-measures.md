---
title: "Fixed Income Convexity Measures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute convexity and effective convexity, apply second-order corrections to duration-based price estimates, and distinguish positive from negative convexity re"
---

# Fixed Income Convexity Measures Blueprint

> Compute convexity and effective convexity, apply second-order corrections to duration-based price estimates, and distinguish positive from negative convexity regimes

| | |
|---|---|
| **Feature** | `fixed-income-convexity-measures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, convexity, effective-convexity, negative-convexity, mbs, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-convexity-measures.blueprint.yaml) |
| **JSON API** | [fixed-income-convexity-measures.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-convexity-measures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `convexity_engine` | Convexity Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `convexity_type` | select | Yes | standard \| effective |  |
| `has_prepayment_option` | boolean | No | Bond has prepayment or call feature |  |

## Rules

- **convexity_definition:**
  - **standard:** Second derivative of price w.r.t. yield / price
  - **effective:** Second derivative w.r.t. benchmark curve shift / price
  - **formula_approx:** (P_down + P_up - 2*P0) / (P0 * delta_y^2)
- **price_change_approximation:**
  - **first_order:** delta_P/P ~= -Modified_D * delta_y
  - **second_order:** delta_P/P ~= -Mod_D * delta_y + 0.5 * Convexity * delta_y^2
- **positive_vs_negative:**
  - **positive:** Option-free bonds; price gains exceed losses for symmetric yield changes
  - **negative:**
    - **mbs:** Prepayments accelerate when rates drop — price truncated
    - **callable:** Issuer call caps upside
    - **putable:** Put floor; typically positive convexity
- **money_convexity:**
  - **formula:** Convexity * price
- **effective_convexity_use:**
  - **required_for:** MBS, callable bonds, putable bonds
- **convexity_adjustment_bps:**
  - **bond_strategy:** Higher convexity desirable; absorbs more volatility
- **validation:**
  - **bond_required:** bond_id present
  - **valid_type:** convexity_type in [standard, effective]

## Outcomes

### Compute_convexity (Priority: 1)

_Compute standard or effective convexity_

**Given:**
- `bond_id` (input) exists
- `convexity_type` (input) in `standard,effective`

**Then:**
- **call_service** target: `convexity_engine`
- **emit_event** event: `convexity.computed`

### Invalid_type (Priority: 10) — Error: `CVX_INVALID_TYPE`

_Unsupported convexity type_

**Given:**
- `convexity_type` (input) not_in `standard,effective`

**Then:**
- **emit_event** event: `convexity.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CVX_INVALID_TYPE` | 400 | convexity_type must be standard or effective | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `convexity.computed` |  | `computation_id`, `bond_id`, `convexity_type`, `value` |
| `convexity.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-duration-measures | required |  |
| fixed-income-mbs-abs | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Convexity Measures Blueprint",
  "description": "Compute convexity and effective convexity, apply second-order corrections to duration-based price estimates, and distinguish positive from negative convexity re",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, convexity, effective-convexity, negative-convexity, mbs, cfa-level-1"
}
</script>
