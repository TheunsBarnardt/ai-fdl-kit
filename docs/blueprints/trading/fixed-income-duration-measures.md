---
title: "Fixed Income Duration Measures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute Macaulay, modified, effective, money, and price-value-of-a-basis-point measures of bond interest-rate risk and choose the appropriate measure per instru"
---

# Fixed Income Duration Measures Blueprint

> Compute Macaulay, modified, effective, money, and price-value-of-a-basis-point measures of bond interest-rate risk and choose the appropriate measure per instrument

| | |
|---|---|
| **Feature** | `fixed-income-duration-measures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, duration, macaulay, modified-duration, effective-duration, pvbp, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-duration-measures.blueprint.yaml) |
| **JSON API** | [fixed-income-duration-measures.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-duration-measures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `duration_engine` | Duration Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `duration_type` | select | Yes | macaulay \| modified \| effective \| money \| pvbp |  |
| `has_embedded_option` | boolean | No | Does bond have embedded options |  |

## Rules

- **macaulay_duration:**
  - **definition:** Weighted average time to receive cash flows (years)
  - **formula:** sum(t * PV_CF_t) / price
- **modified_duration:**
  - **formula:** Macaulay / (1 + YTM/periods)
  - **use:** Approximates percentage price change per 100 bps yield move
- **approximate_modified:**
  - **formula:** (P_down - P_up) / (2 * P0 * delta_y)
  - **use:** Numerical approximation valid for option-free bonds
- **effective_duration:**
  - **formula:** (P_down - P_up) / (2 * P0 * delta_curve)
  - **use:** Required for bonds with embedded options; curve shifts, not yield
- **money_duration:**
  - **formula:** Modified duration * price
  - **use:** Dollar change per 100 bps; position sizing
- **pvbp:**
  - **formula:** Money duration / 10000
  - **use:** Price change per 1 basis point; trading desks
- **key_rate_duration:**
  - **definition:** Sensitivity to specific point on the curve
  - **use:** Decompose curve risk for non-parallel shifts
- **portfolio_duration:**
  - **formula:** Market-value-weighted average of constituent durations
  - **caveat:** Assumes parallel yield curve shifts
- **validation:**
  - **bond_required:** bond_id present
  - **valid_type:** duration_type in allowed set

## Outcomes

### Compute_duration (Priority: 1)

_Compute requested duration measure_

**Given:**
- `bond_id` (input) exists
- `duration_type` (input) in `macaulay,modified,effective,money,pvbp`

**Then:**
- **call_service** target: `duration_engine`
- **emit_event** event: `duration.computed`

### Invalid_type (Priority: 10) — Error: `DUR_INVALID_TYPE`

_Unsupported duration measure_

**Given:**
- `duration_type` (input) not_in `macaulay,modified,effective,money,pvbp`

**Then:**
- **emit_event** event: `duration.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DUR_INVALID_TYPE` | 400 | duration_type must be macaulay, modified, effective, money, or pvbp | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `duration.computed` |  | `computation_id`, `bond_id`, `duration_type`, `value` |
| `duration.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-convexity-measures | required |  |
| fixed-income-bond-pricing | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Duration Measures Blueprint",
  "description": "Compute Macaulay, modified, effective, money, and price-value-of-a-basis-point measures of bond interest-rate risk and choose the appropriate measure per instru",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, duration, macaulay, modified-duration, effective-duration, pvbp, cfa-level-1"
}
</script>
