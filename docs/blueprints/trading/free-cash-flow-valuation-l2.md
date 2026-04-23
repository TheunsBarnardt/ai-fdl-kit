---
title: "Free Cash Flow Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value equity via free cash flow — FCFF and FCFE definitions, computation from net income/CFO/EBIT/EBITDA, single-stage, two-stage, three-stage models, and ESG i"
---

# Free Cash Flow Valuation L2 Blueprint

> Value equity via free cash flow — FCFF and FCFE definitions, computation from net income/CFO/EBIT/EBITDA, single-stage, two-stage, three-stage models, and ESG integration in FCF

| | |
|---|---|
| **Feature** | `free-cash-flow-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, fcff, fcfe, free-cash-flow, dcf, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/free-cash-flow-valuation-l2.blueprint.yaml) |
| **JSON API** | [free-cash-flow-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/free-cash-flow-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fcf_valuator` | Free Cash Flow Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `cash_flow_type` | select | Yes | fcff \| fcfe |  |

## Rules

- **fcff_definition:**
  - **formula:** FCFF = NI + NCC + Int(1-t) − FCInv − WCInv
  - **use_when:** Capital structure changing or value of firm needed; discounted at WACC
- **fcfe_definition:**
  - **formula:** FCFE = NI + NCC − FCInv − WCInv + Net Borrowing
  - **alt_from_fcff:** FCFE = FCFF − Int(1-t) + Net Borrowing
  - **use_when:** Stable capital structure; discounted at cost of equity
- **computing_fcff:**
  - **from_net_income:** Add back NCC, after-tax interest; subtract investment
  - **from_cfo:** FCFF = CFO + Int(1-t) − FCInv
  - **from_ebit:** FCFF = EBIT(1-t) + Dep − FCInv − WCInv
  - **from_ebitda:** FCFF = EBITDA(1-t) + Dep*t − FCInv − WCInv
- **forecasting:**
  - **sales_driven:** Project margins, capex, working capital ratios
  - **components_separately:** Forecast each FCF component
  - **historical_growth:** Extrapolate but check for sustainability
- **single_stage_model:**
  - **formula:** V0 = FCFF1 / (WACC − g) or FCFE1 / (k_e − g)
  - **international_application:** Adjust for currency and inflation
- **two_stage_model:**
  - **fixed_growth:** High-growth period followed by stable perpetuity
  - **declining_growth:** Stage 1 growth declines linearly to long-run g
- **three_stage_model:**
  - **structure:** High → transition → mature
  - **use_when:** Firm in middle of life cycle
- **esg_integration:**
  - **revenue_adjustments:** Climate transition risk reduces forecast
  - **cost_adjustments:** Carbon taxes, compliance costs
  - **discount_rate_adjustments:** Higher WACC for elevated ESG risk
- **non_operating_assets:**
  - **treatment:** Add market value of non-operating assets to operating value
  - **examples:** Excess cash, marketable securities, idle land
- **sensitivity:**
  - **inputs:** g, WACC, margins, reinvestment rate
  - **output:** Tornado chart of value sensitivity
- **validation:**
  - **company_required:** company_id present
  - **valid_type:** cash_flow_type in [fcff, fcfe]

## Outcomes

### Value_with_fcf (Priority: 1)

_Value equity using FCF model_

**Given:**
- `company_id` (input) exists
- `cash_flow_type` (input) in `fcff,fcfe`

**Then:**
- **call_service** target: `fcf_valuator`
- **emit_event** event: `fcf.valued`

### Invalid_type (Priority: 10) — Error: `FCF_INVALID_TYPE`

_Unsupported cash flow type_

**Given:**
- `cash_flow_type` (input) not_in `fcff,fcfe`

**Then:**
- **emit_event** event: `fcf.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FCF_INVALID_TYPE` | 400 | cash_flow_type must be fcff or fcfe | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fcf.valued` |  | `company_id`, `cash_flow_type`, `intrinsic_value`, `terminal_value`, `sensitivity` |
| `fcf.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| discounted-dividend-valuation-l2 | recommended |  |
| cost-of-capital-advanced-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Free Cash Flow Valuation L2

Value equity via free cash flow — FCFF and FCFE definitions, computation from net income/CFO/EBIT/EBITDA, single-stage, two-stage, three-stage models, and ESG integration in FCF

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
| `cost_of_capital_advanced_l2` | cost-of-capital-advanced-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| value_with_fcf | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Free Cash Flow Valuation L2 Blueprint",
  "description": "Value equity via free cash flow — FCFF and FCFE definitions, computation from net income/CFO/EBIT/EBITDA, single-stage, two-stage, three-stage models, and ESG i",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, fcff, fcfe, free-cash-flow, dcf, cfa-level-2"
}
</script>
