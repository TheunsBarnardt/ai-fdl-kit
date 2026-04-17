---
title: "Alt Investments Return Calculations Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute alternative-investment returns using IRR, MOIC, DPI, RVPI, TVPI, and time-weighted returns with attention to committed vs. invested capital and cash-flo"
---

# Alt Investments Return Calculations Blueprint

> Compute alternative-investment returns using IRR, MOIC, DPI, RVPI, TVPI, and time-weighted returns with attention to committed vs. invested capital and cash-flow timing

| | |
|---|---|
| **Feature** | `alt-investments-return-calculations` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternatives, irr, moic, dpi, tvpi, performance-metrics, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/alt-investments-return-calculations.blueprint.yaml) |
| **JSON API** | [alt-investments-return-calculations.json]({{ site.baseurl }}/api/blueprints/trading/alt-investments-return-calculations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `alt_return_calc` | Alt Return Calculator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `calc_id` | text | Yes | Calculation identifier |  |
| `metric` | select | Yes | irr \| moic \| dpi \| rvpi \| tvpi \| twr |  |
| `cash_flows` | json | Yes | Array of dated cash flows |  |

## Rules

- **irr:**
  - **definition:** Discount rate at which NPV of cash flows equals zero
  - **suitability:** Private funds where GP controls timing
  - **pitfalls:** Multiple or no solution when cash-flow signs change; reinvestment assumption at IRR
- **moic:**
  - **formula:** (Realised + Unrealised Value) / Invested Capital
  - **interpretation:** Gross money multiple, ignores time
- **dpi:**
  - **formula:** Distributions Paid / Paid-In Capital
  - **interpretation:** Realised multiple; cash already returned to LPs
- **rvpi:**
  - **formula:** Residual NAV / Paid-In Capital
  - **interpretation:** Unrealised multiple; what is still in the fund
- **tvpi:**
  - **formula:** DPI + RVPI
  - **interpretation:** Total value relative to paid-in capital
- **twr:**
  - **rule:** Geometric linking of subperiod returns removes cash-flow timing effects
  - **use_case:** Hedge funds and liquid alts where investor controls timing
- **j_curve:**
  - **pattern:** Early negative IRR from fees and markdowns before exits; reverses as value realised
- **validation:**
  - **calc_required:** calc_id present
  - **valid_metric:** metric in allowed set
  - **cash_flows_provided:** cash_flows non-empty

## Outcomes

### Compute_return (Priority: 1)

_Compute selected return metric_

**Given:**
- `calc_id` (input) exists
- `metric` (input) in `irr,moic,dpi,rvpi,tvpi,twr`
- `cash_flows` (input) exists

**Then:**
- **call_service** target: `alt_return_calc`
- **emit_event** event: `alt.return_computed`

### Invalid_metric (Priority: 10) — Error: `RETURN_INVALID_METRIC`

_Unsupported metric_

**Given:**
- `metric` (input) not_in `irr,moic,dpi,rvpi,tvpi,twr`

**Then:**
- **emit_event** event: `alt.return_calc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RETURN_INVALID_METRIC` | 400 | metric must be irr, moic, dpi, rvpi, tvpi, or twr | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alt.return_computed` |  | `calc_id`, `metric`, `value`, `cash_flow_count` |
| `alt.return_calc_rejected` |  | `calc_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-performance-appraisal | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Alt Investments Return Calculations Blueprint",
  "description": "Compute alternative-investment returns using IRR, MOIC, DPI, RVPI, TVPI, and time-weighted returns with attention to committed vs. invested capital and cash-flo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternatives, irr, moic, dpi, tvpi, performance-metrics, cfa-level-1"
}
</script>
