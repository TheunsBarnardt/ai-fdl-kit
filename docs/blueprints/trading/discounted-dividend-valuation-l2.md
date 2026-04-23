---
title: "Discounted Dividend Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value equity via discounted dividends — Gordon Growth, two-stage and three-stage DDM, H-model, spreadsheet modelling, sustainable growth rate, and PRAT decompos"
---

# Discounted Dividend Valuation L2 Blueprint

> Value equity via discounted dividends — Gordon Growth, two-stage and three-stage DDM, H-model, spreadsheet modelling, sustainable growth rate, and PRAT decomposition

| | |
|---|---|
| **Feature** | `discounted-dividend-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, ddm, gordon-growth, h-model, sustainable-growth, prat, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/discounted-dividend-valuation-l2.blueprint.yaml) |
| **JSON API** | [discounted-dividend-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/discounted-dividend-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ddm_valuator` | Dividend Discount Model Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `model_type` | select | Yes | gordon \| two_stage \| three_stage \| h_model \| spreadsheet |  |

## Rules

- **present_value_models:**
  - **general_dcf:** V0 = Σ CFt / (1+r)^t
  - **ddm_framework:** V0 = Σ Dt / (1+r)^t; terminal dividend value
  - **fcfe:** Use when dividends differ materially from capacity
  - **residual_income:** Use when FCF negative and dividends low
- **single_stage_gordon_growth:**
  - **formula:** V0 = D1 / (k_e − g)
  - **assumptions:** Constant growth g < k_e in perpetuity
  - **pvgo:** P0 = E1/k_e + PVGO; backs out growth contribution
  - **applications:** Mature stable dividend payers, indices, utilities
  - **limitations:** Sensitive to (k_e − g); undefined if g ≥ k_e
- **multistage_ddm:**
  - **two_stage:** Explicit high-growth period then constant growth perpetuity
  - **terminal_value:** V_n = D_{n+1} / (k_e − g_L)
  - **three_stage:** High growth → declining → stable (mirrors product life cycle)
  - **h_model:** Linear decline from g_S to g_L over 2H years; V0 = D0(1+g_L)/(k−g_L) + D0*H*(g_S−g_L)/(k−g_L)
  - **spreadsheet_general:** Explicit finite forecast + terminal; flexible for changing dividends
- **terminal_value_methods:**
  - **gordon_terminal:** Perpetuity with long-run g
  - **multiple_based:** P/E or P/B at horizon date
  - **convergence:** Long-run g converges to nominal GDP
- **sustainable_growth:**
  - **definition:** g = b × ROE where b = retention ratio
  - **prat_decomposition:** g = P × R × A × T (profit margin × retention × asset turnover × leverage)
  - **implication:** Forecast ROE and payout to derive g
  - **dupont_link:** PRAT is the extended DuPont with retention
- **required_return_inputs:**
  - **capm:** k_e = Rf + β(ERP)
  - **build_up:** Rf + ERP + size + specific
  - **bond_yield_plus:** YTM + risk premium 3-5%
- **validation:**
  - **company_required:** company_id present
  - **valid_model:** model_type in allowed set
  - **growth_lt_required_return:** g < k_e required for Gordon Growth

## Outcomes

### Value_with_ddm (Priority: 1)

_Value equity using selected DDM variant_

**Given:**
- `company_id` (input) exists
- `model_type` (input) in `gordon,two_stage,three_stage,h_model,spreadsheet`

**Then:**
- **call_service** target: `ddm_valuator`
- **emit_event** event: `ddm.valued`

### Invalid_model (Priority: 10) — Error: `DDM_INVALID_MODEL`

_Unsupported DDM variant_

**Given:**
- `model_type` (input) not_in `gordon,two_stage,three_stage,h_model,spreadsheet`

**Then:**
- **emit_event** event: `ddm.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DDM_INVALID_MODEL` | 400 | model_type must be one of the supported DDM variants | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ddm.valued` |  | `company_id`, `model_type`, `intrinsic_value`, `implied_growth`, `pvgo` |
| `ddm.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-valuation-ddm | recommended | DDM L1 provides the foundational dividend discount concepts extended by this L2 treatment |
| equity-present-value | recommended | Equity present value L1 is the prerequisite discounting framework applied here at depth |
| equity-valuation-applications-l2 | required |  |
| cost-of-capital-advanced-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Discounted Dividend Valuation L2

Value equity via discounted dividends — Gordon Growth, two-stage and three-stage DDM, H-model, spreadsheet modelling, sustainable growth rate, and PRAT decomposition

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
| `equity_valuation_applications_l2` | equity-valuation-applications-l2 | fail |
| `cost_of_capital_advanced_l2` | cost-of-capital-advanced-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| value_with_ddm | `autonomous` | - | - |
| invalid_model | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Discounted Dividend Valuation L2 Blueprint",
  "description": "Value equity via discounted dividends — Gordon Growth, two-stage and three-stage DDM, H-model, spreadsheet modelling, sustainable growth rate, and PRAT decompos",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, ddm, gordon-growth, h-model, sustainable-growth, prat, cfa-level-2"
}
</script>
