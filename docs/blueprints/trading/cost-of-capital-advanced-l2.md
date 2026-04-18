---
title: "Cost Of Capital Advanced L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Estimate cost of capital — top-down and bottom-up factors, cost of debt, equity risk premium (historical vs forward), and cost of equity via DDM, BYPRP, and ris"
---

# Cost Of Capital Advanced L2 Blueprint

> Estimate cost of capital — top-down and bottom-up factors, cost of debt, equity risk premium (historical vs forward), and cost of equity via DDM, BYPRP, and risk-based models

| | |
|---|---|
| **Feature** | `cost-of-capital-advanced-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, cost-of-capital, erp, cost-of-equity, cost-of-debt, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cost-of-capital-advanced-l2.blueprint.yaml) |
| **JSON API** | [cost-of-capital-advanced-l2.json]({{ site.baseurl }}/api/blueprints/trading/cost-of-capital-advanced-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `coc_estimator` | Cost of Capital Estimator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `capital_component` | select | Yes | debt \| equity \| weighted |  |

## Rules

- **top_down_factors:**
  - **capital_availability:** Liquidity, rate cycle, credit conditions
  - **inflation:** Higher inflation → higher nominal rates
  - **country_risk:** Sovereign risk premium adjustment
  - **exchange_rate_risk:** FX volatility affects foreign-currency funding
  - **economic_growth:** Risk-free rate co-moves with growth expectations
- **bottom_up_factors:**
  - **industry:** Sector beta and default risk
  - **size:** Small-size premium evidence
  - **leverage:** Debt/equity mix affects both equity beta and default risk
  - **asset_profile:** Asset-light vs asset-heavy operational leverage
  - **volatility:** Earnings and cash flow volatility
- **cost_of_debt_methods:**
  - **traded_debt:** Use yield to maturity on outstanding bonds
  - **non_traded:** Synthetic rating via interest coverage and size; comparable issuer yields
  - **bank_debt:** Effective rate on loans; adjust for compensating balances and fees
  - **leases:** IFRS 16 lease liability discount rate
  - **international:** Adjust for currency and jurisdiction risk
- **erp_historical:**
  - **method:** Average excess of equity over risk-free over long history
  - **inputs:** Arithmetic vs geometric mean; choice of risk-free; survivorship bias
  - **limitations:** Backward-looking; stationarity assumption contestable
- **erp_forward_looking:**
  - **implied_erp_ddm:** Solve k_e from current price and expected dividends; subtract Rf
  - **macro_approach:** Expected real earnings growth + inflation − bond yield
  - **survey_based:** CFO and analyst surveys
- **cost_of_equity:**
  - **ddm:** k_e = D1/P0 + g
  - **bond_yield_plus_risk_premium:** k_e = YTM + small equity premium (3-5%)
  - **risk_based_capm:** Rf + β*(ERP); adjust β with leverage for target capital structure
  - **fama_french:** Rf + β_MKT*ERP + β_SMB*SMB + β_HML*HML
  - **pastor_stambaugh_liquidity:** Add liquidity premium
  - **private_companies:** Build-up: Rf + ERP + size premium + specific-company premium
- **international_considerations:**
  - **country_risk_premium:** Sovereign spread or volatility-adjusted
  - **damodaran_framework:** CRP = sovereign spread × (σ_equity/σ_bond)
  - **lambda_exposure:** Firm-specific exposure to country risk
- **validation:**
  - **company_required:** company_id present
  - **valid_component:** capital_component in [debt, equity, weighted]

## Outcomes

### Estimate_coc (Priority: 1)

_Estimate cost of capital component_

**Given:**
- `company_id` (input) exists
- `capital_component` (input) in `debt,equity,weighted`

**Then:**
- **call_service** target: `coc_estimator`
- **emit_event** event: `coc.estimated`

### Invalid_component (Priority: 10) — Error: `COC_INVALID_COMPONENT`

_Unsupported capital component_

**Given:**
- `capital_component` (input) not_in `debt,equity,weighted`

**Then:**
- **emit_event** event: `coc.estimation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COC_INVALID_COMPONENT` | 400 | capital_component must be debt, equity, or weighted | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `coc.estimated` |  | `company_id`, `capital_component`, `point_estimate`, `range` |
| `coc.estimation_rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multiple-regression-basics-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cost Of Capital Advanced L2 Blueprint",
  "description": "Estimate cost of capital — top-down and bottom-up factors, cost of debt, equity risk premium (historical vs forward), and cost of equity via DDM, BYPRP, and ris",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, cost-of-capital, erp, cost-of-equity, cost-of-debt, cfa-level-2"
}
</script>
