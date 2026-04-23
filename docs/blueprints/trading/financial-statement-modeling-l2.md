---
title: "Financial Statement Modeling L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Build a three-statement financial model — revenue forecast, operating and non-operating cost build-up, pro forma income statement, cash flow and balance sheet, "
---

# Financial Statement Modeling L2 Blueprint

> Build a three-statement financial model — revenue forecast, operating and non-operating cost build-up, pro forma income statement, cash flow and balance sheet, behavioural-bias checks

| | |
|---|---|
| **Feature** | `financial-statement-modeling-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, financial-model, three-statement, forecasting, behavioural-bias, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/financial-statement-modeling-l2.blueprint.yaml) |
| **JSON API** | [financial-statement-modeling-l2.json]({{ site.baseurl }}/api/blueprints/trading/financial-statement-modeling-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `financial_modeler` | Financial Modeler | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model identifier |  |
| `forecast_horizon` | number | Yes | Years of explicit forecast |  |

## Rules

- **model_overview:**
  - **top_down_bottom_up:** Top-down (macro → industry → company); bottom-up (segments → products → customers)
  - **explicit_terminal:** Discrete forecast period plus terminal value assumption
- **income_statement_modeling:**
  - **revenue:** Volume × price by product/segment; industry growth × market share
  - **cogs:** Gross margin %, per-unit cost, or variable + fixed split
  - **sga:** Fixed vs variable; operating leverage visible here
  - **non_operating:** Interest expense from debt schedule; FX gains/losses
  - **taxes:** Effective rate = statutory × adjustments for permanent differences
  - **other_items:** Equity-method earnings, minority interest, restructuring
- **balance_sheet_modeling:**
  - **working_capital:** Days-sales-outstanding, days-inventory, days-payables
  - **ppe_rollforward:** Beg PP&E + capex − depreciation = end PP&E
  - **debt_schedule:** Beg debt + issuance − repayments = end debt; feeds interest expense
  - **equity_rollforward:** Beg equity + NI − dividends ± share issuance/repurchase
- **cash_flow_modeling:**
  - **cfo_indirect:** NI + non-cash adjustments − working capital investment
  - **cfi:** Capex + acquisitions − divestitures
  - **cff:** Debt issuance/repayment + equity issuance − dividends
- **valuation_inputs:**
  - **operating_metrics:** Revenue, margins, ROIC
  - **growth_fade:** Decay competitive advantage toward industry norms
  - **terminal_assumptions:** Long-run growth ≤ GDP
- **behavioural_biases:**
  - **overconfidence:** Narrow forecast intervals; actual results exceed expected dispersion
  - **illusion_of_control:** Assuming precise numeric output controls outcome
  - **conservatism_bias:** Anchoring to prior forecast, under-reacting to new info
  - **representativeness:** Assuming recent trends persist
  - **confirmation_bias:** Weighting inputs that support prior view
- **validation:**
  - **model_required:** model_id present
  - **horizon_positive:** forecast_horizon > 0

## Outcomes

### Build_model (Priority: 1)

_Build three-statement financial model_

**Given:**
- `model_id` (input) exists
- `forecast_horizon` (input) gt `0`

**Then:**
- **call_service** target: `financial_modeler`
- **emit_event** event: `fsm.built`

### Invalid_horizon (Priority: 10) — Error: `FSM_INVALID_HORIZON`

_Invalid forecast horizon_

**Given:**
- `forecast_horizon` (input) lte `0`

**Then:**
- **emit_event** event: `fsm.build_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FSM_INVALID_HORIZON` | 400 | forecast_horizon must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fsm.built` |  | `model_id`, `forecast_horizon`, `implied_value`, `key_assumptions` |
| `fsm.build_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-integration-l2 | required |  |
| financial-report-quality-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Financial Statement Modeling L2

Build a three-statement financial model — revenue forecast, operating and non-operating cost build-up, pro forma income statement, cash flow and balance sheet, behavioural-bias checks

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
| `fsa_integration_l2` | fsa-integration-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| build_model | `autonomous` | - | - |
| invalid_horizon | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Financial Statement Modeling L2 Blueprint",
  "description": "Build a three-statement financial model — revenue forecast, operating and non-operating cost build-up, pro forma income statement, cash flow and balance sheet, ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, financial-model, three-statement, forecasting, behavioural-bias, cfa-level-2"
}
</script>
