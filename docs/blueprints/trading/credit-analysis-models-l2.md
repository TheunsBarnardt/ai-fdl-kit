---
title: "Credit Analysis Models L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Model credit risk — credit valuation adjustment, scores and ratings, structural and reduced-form models, credit spread analysis, and term structure of credit sp"
---

# Credit Analysis Models L2 Blueprint

> Model credit risk — credit valuation adjustment, scores and ratings, structural and reduced-form models, credit spread analysis, and term structure of credit spreads

| | |
|---|---|
| **Feature** | `credit-analysis-models-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, credit-risk, cva, structural-model, reduced-form-model, credit-spread, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/credit-analysis-models-l2.blueprint.yaml) |
| **JSON API** | [credit-analysis-models-l2.json]({{ site.baseurl }}/api/blueprints/trading/credit-analysis-models-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `credit_modeller` | Credit Risk Modeller | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `model_type` | select | Yes | cva \| structural \| reduced_form \| spread |  |

## Rules

- **credit_risk_components:**
  - **probability_of_default:** PD over horizon
  - **loss_given_default:** 1 − recovery rate
  - **exposure_at_default:** Outstanding amount at default
  - **expected_loss:** PD × LGD × EAD
- **credit_valuation_adjustment:**
  - **definition:** PV of expected loss from counterparty default
  - **formula:** CVA = Σ PD_t × LGD × EAD_t × DF_t
  - **use_in_valuation:** Risk-free price minus CVA = risky price
- **credit_scores_ratings:**
  - **consumer_scores:** FICO, vantage; statistical models
  - **corporate_ratings:** Moody's, S&P, Fitch; rating migration matrices
  - **rating_thresholds:** Investment grade vs high yield boundary
- **structural_models:**
  - **merton_framework:** Equity is call option on assets struck at debt face value
  - **inputs:** Asset value, asset volatility, debt face, time to maturity
  - **pd_formula:** N(−d2) where d2 from BSM
  - **strengths:** Economic intuition, unifies equity and debt
  - **weaknesses:** Asset value not observable; assumes lognormal assets
- **reduced_form_models:**
  - **framework:** Default as exogenous Poisson process with intensity λ
  - **inputs:** Hazard rate calibrated to observed credit spreads
  - **strengths:** Calibrates to market; flexible for complex products
  - **weaknesses:** No economic mechanism; relies on liquid market
- **credit_spread_analysis:**
  - **nominal_spread:** Yield − benchmark yield
  - **z_spread:** Constant spread to spot curve
  - **oas:** Spread after option adjustment
  - **asset_swap_spread:** Spread over swap curve
- **term_structure_of_spreads:**
  - **upward_sloping_typical:** Longer horizons higher cumulative default probability
  - **inverted_at_distress:** Near-term default risk priced into short end
  - **factors:** Macro, liquidity, supply
- **validation:**
  - **bond_required:** bond_id present
  - **valid_model:** model_type in [cva, structural, reduced_form, spread]

## Outcomes

### Model_credit (Priority: 1)

_Apply credit risk model_

**Given:**
- `bond_id` (input) exists
- `model_type` (input) in `cva,structural,reduced_form,spread`

**Then:**
- **call_service** target: `credit_modeller`
- **emit_event** event: `credit.modelled`

### Invalid_model (Priority: 10) — Error: `CREDIT_INVALID_MODEL`

_Unsupported credit model_

**Given:**
- `model_type` (input) not_in `cva,structural,reduced_form,spread`

**Then:**
- **emit_event** event: `credit.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_INVALID_MODEL` | 400 | model_type must be one of the supported credit models | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit.modelled` |  | `bond_id`, `model_type`, `pd`, `lgd`, `expected_loss`, `cva`, `oas` |
| `credit.rejected` |  | `bond_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| credit-default-swaps-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Credit Analysis Models L2 Blueprint",
  "description": "Model credit risk — credit valuation adjustment, scores and ratings, structural and reduced-form models, credit spread analysis, and term structure of credit sp",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, credit-risk, cva, structural-model, reduced-form-model, credit-spread, cfa-level-2"
}
</script>
