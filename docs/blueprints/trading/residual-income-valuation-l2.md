---
title: "Residual Income Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value equity via residual income — RI definition, general RI model, single-stage and multistage RI, persistence, clean surplus violations, and accounting adjust"
---

# Residual Income Valuation L2 Blueprint

> Value equity via residual income — RI definition, general RI model, single-stage and multistage RI, persistence, clean surplus violations, and accounting adjustments

| | |
|---|---|
| **Feature** | `residual-income-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, residual-income, eva, clean-surplus, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/residual-income-valuation-l2.blueprint.yaml) |
| **JSON API** | [residual-income-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/residual-income-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ri_valuator` | Residual Income Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `ri_model` | select | Yes | single_stage \| multistage \| general |  |

## Rules

- **residual_income_definition:**
  - **formula:** RI = NI − k_e × Equity
  - **economic_meaning:** Earnings above required return on equity capital
  - **eva_link:** EVA = NOPAT − WACC × Invested Capital
- **general_rim:**
  - **formula:** V0 = B0 + Σ RI_t / (1+k_e)^t
  - **interpretation:** Value = book value + present value of future residual income
- **fundamental_drivers:**
  - **abnormal_roe:** (ROE − k_e) generates positive RI
  - **persistence:** How long competitive advantage lasts
  - **book_value_growth:** Reinvestment scales abnormal earnings
- **single_stage_ri:**
  - **formula:** V0 = B0 + (ROE − k_e) × B0 / (k_e − g)
  - **use_when:** ROE-k_e and g constant in perpetuity
- **multistage_ri:**
  - **structure:** Explicit RI period + persistence factor for terminal
  - **persistence_factor:** ω: 0 = immediate decay, 1 = perpetual
  - **terminal_value:** Premium-over-book that fades to zero or constant level
- **relationship_to_other_models:**
  - **ddm_equivalence:** Mathematically equivalent given clean surplus
  - **fcf_equivalence:** Different recognition timing; same value
  - **rim_strengths:** Heavy weight on book value (less terminal sensitivity)
- **strengths_weaknesses:**
  - **strengths:** Less reliance on terminal value; uses accounting data; works for non-dividend payers and negative FCF firms
  - **weaknesses:** Requires clean accounting; sensitive to ROE persistence; complex adjustments
- **guidelines_for_use:**
  - **appropriate:** No dividends; negative near-term FCF; uncertain terminal value
  - **inappropriate:** Significant clean-surplus violations; non-recurring earnings dominate
- **accounting_considerations:**
  - **clean_surplus_violations:** OCI items bypass income; adjust for FX, pension, AFS securities
  - **intangibles:** Capitalisation vs expensing affects book value and ROE
  - **non_recurring:** Strip from RI forecast
  - **aggressive_accounting:** Identify and reverse
  - **international:** IFRS vs US GAAP differences in revaluation, intangibles
- **validation:**
  - **company_required:** company_id present
  - **valid_model:** ri_model in [single_stage, multistage, general]

## Outcomes

### Value_with_ri (Priority: 1)

_Value equity using residual income model_

**Given:**
- `company_id` (input) exists
- `ri_model` (input) in `single_stage,multistage,general`

**Then:**
- **call_service** target: `ri_valuator`
- **emit_event** event: `ri.valued`

### Invalid_model (Priority: 10) — Error: `RI_INVALID_MODEL`

_Unsupported RI model variant_

**Given:**
- `ri_model` (input) not_in `single_stage,multistage,general`

**Then:**
- **emit_event** event: `ri.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RI_INVALID_MODEL` | 400 | ri_model must be one of the supported variants | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ri.valued` |  | `company_id`, `ri_model`, `intrinsic_value`, `premium_to_book`, `persistence_factor` |
| `ri.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| discounted-dividend-valuation-l2 | recommended |  |
| free-cash-flow-valuation-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Residual Income Valuation L2 Blueprint",
  "description": "Value equity via residual income — RI definition, general RI model, single-stage and multistage RI, persistence, clean surplus violations, and accounting adjust",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, residual-income, eva, clean-surplus, cfa-level-2"
}
</script>
