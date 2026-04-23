---
title: "Multifactor Models L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply multifactor models — APT, macroeconomic, fundamental (Fama-French), fixed-income factor models, return and risk attribution, portfolio construction and st"
---

# Multifactor Models L2 Blueprint

> Apply multifactor models — APT, macroeconomic, fundamental (Fama-French), fixed-income factor models, return and risk attribution, portfolio construction and strategic decisions

| | |
|---|---|
| **Feature** | `multifactor-models-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, multifactor-models, apt, fama-french, factor-investing, risk-attribution, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/multifactor-models-l2.blueprint.yaml) |
| **JSON API** | [multifactor-models-l2.json]({{ site.baseurl }}/api/blueprints/trading/multifactor-models-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `factor_analyst` | Factor Model Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `model_type` | select | Yes | macro \| fundamental \| statistical \| fixed_income |  |

## Rules

- **apt_framework:**
  - **key_insight:** Returns driven by systematic factor surprises; arbitrage enforces pricing
  - **formula:** E(R) = Rf + Σ λ_k × β_k where λ_k is factor risk premium
  - **no_free_lunch:** Well-diversified portfolios with no factor exposure earn risk-free rate
- **types_of_factors:**
  - **macroeconomic:** GDP surprise, inflation surprise, credit spread, term spread
  - **fundamental:** Value (HML), size (SMB), momentum, quality, low-volatility
  - **statistical:** PCA-derived components; less intuitive
- **fama_french:**
  - **three_factor:** Market β + SMB (size) + HML (value)
  - **five_factor:** Adds profitability (RMW) and investment (CMA)
  - **application:** Alpha relative to factor model vs CAPM alpha
- **fundamental_factor_structure:**
  - **standardised_sensitivity:** Z-score of characteristic (P/B, ROE, etc.)
  - **cross_sectional_regression:** Factor returns estimated each period
  - **active_exposure:** Portfolio sensitivity vs benchmark
- **fixed_income_multifactor:**
  - **factors:** Level, slope, curvature, credit spread, volatility
  - **duration:** Dominant factor; key rate exposures capture non-parallel
- **return_attribution:**
  - **active_return:** Portfolio return − benchmark return
  - **factor_contribution:** Active β × factor return
  - **specific_return:** Residual after factor explanation
- **risk_attribution:**
  - **active_risk:** Tracking error
  - **factor_risk:** Portion of TE from factor exposures
  - **specific_risk:** Idiosyncratic, diversifiable
  - **information_ratio:** Active return / active risk
- **portfolio_construction:**
  - **factor_tilt:** Overweight desired factor exposures
  - **factor_neutralisation:** Zero net exposure to unwanted factors
  - **risk_targeting:** Constrain tracking error
- **strategic_portfolio_decisions:**
  - **factor_timing:** Cyclical factor premia (value outperforms late cycle)
  - **diversification:** Factor diversification reduces concentration
  - **liability_matching:** Duration and credit factors for asset-liability
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_model:** model_type in [macro, fundamental, statistical, fixed_income]

## Outcomes

### Apply_factor_model (Priority: 1)

_Apply multifactor model to portfolio_

**Given:**
- `portfolio_id` (input) exists
- `model_type` (input) in `macro,fundamental,statistical,fixed_income`

**Then:**
- **call_service** target: `factor_analyst`
- **emit_event** event: `factor_model.applied`

### Invalid_model (Priority: 10) — Error: `FACTOR_INVALID_MODEL`

_Unsupported factor model type_

**Given:**
- `model_type` (input) not_in `macro,fundamental,statistical,fixed_income`

**Then:**
- **emit_event** event: `factor_model.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FACTOR_INVALID_MODEL` | 400 | model_type must be one of the supported factor model types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `factor_model.applied` |  | `portfolio_id`, `model_type`, `factor_exposures`, `active_return`, `tracking_error`, `ir` |
| `factor_model.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| backtesting-simulation-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Multifactor Models L2

Apply multifactor models — APT, macroeconomic, fundamental (Fama-French), fixed-income factor models, return and risk attribution, portfolio construction and strategic decisions

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| apply_factor_model | `autonomous` | - | - |
| invalid_model | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multifactor Models L2 Blueprint",
  "description": "Apply multifactor models — APT, macroeconomic, fundamental (Fama-French), fixed-income factor models, return and risk attribution, portfolio construction and st",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, multifactor-models, apt, fama-french, factor-investing, risk-attribution, cfa-level-2"
}
</script>
