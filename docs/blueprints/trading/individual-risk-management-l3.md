---
title: "Individual Risk Management L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk manag"
---

# Individual Risk Management L3 Blueprint

> Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk management strategy

| | |
|---|---|
| **Feature** | `individual-risk-management-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, private-wealth, human-capital, life-insurance, annuities, individual-risk, longevity-risk, premature-death-risk, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/individual-risk-management-l3.blueprint.yaml) |
| **JSON API** | [individual-risk-management-l3.json]({{ site.baseurl }}/api/blueprints/trading/individual-risk-management-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `wealth_manager` | Wealth Manager | human |  |
| `private_client` | Private Client | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | Yes | Client identifier |  |
| `risk_type` | select | Yes | earnings \| premature_death \| longevity \| property \| liability \| health |  |

## Rules

- **human_capital:**
  - **definition:** PV of expected future labor income; largest asset for most working-age individuals
  - **bond_like:** Stable employment (civil servant, academic) → bond-like HC; less equity in financial portfolio
  - **equity_like:** Variable income (entrepreneur, salesperson) → equity-like HC; more bonds needed
  - **declining:** HC declines as individual ages; financial capital must grow to replace
  - **geographic:** HC illiquid and concentrated in one job market; financial portfolio should diversify
- **financial_capital:**
  - **definition:** Total value of financial assets (savings, investments, pension, real estate)
  - **relationship:** FC = accumulated savings from HC over time; retirement FC = sufficient to fund withdrawals
- **economic_net_worth:**
  - **definition:** Human capital + financial capital − PV of consumption goals − financial liabilities
  - **holistic_balance_sheet:** Include HC, pension rights, insurance on asset side; spending obligations on liability side
  - **change_drivers:** Wealth creation (saving) − consumption − risk events
- **risk_management_framework:**
  - **risk_identification:** Identify all material individual risk exposures
  - **risk_assessment:** Quantify exposure; frequency and severity
  - **risk_mitigation:** Insurance, diversification, reserves, avoidance
  - **risk_monitoring:** Annual review; update as life stage changes
- **financial_stages_of_life:**
  - **education:** Negative HC realization; pre-earning stage; low financial capital
  - **early_career:** High HC, low FC; maximize savings; need life insurance for dependents
  - **mid_career:** Peak earnings; accumulation; reduce insurance need as FC grows
  - **pre_retirement:** Peak FC; HC declining; shift portfolio to lower risk; long-term care planning
  - **retirement:** HC zero; draw down FC; longevity risk primary; annuities may be suitable
- **individual_risk_exposures:**
  - **earnings_risk:** Job loss, disability; income stream interrupted; hedge with disability insurance
  - **premature_death:** Dependents lose future HC; hedge with life insurance; amount = PV of future support
  - **longevity_risk:** Outlive assets; hedge with annuities; increases with health improvements
  - **property_risk:** Loss of physical assets; hedge with property/casualty insurance
  - **liability_risk:** Legal claims; hedge with liability insurance; umbrella policy
  - **health_risk:** Medical costs; hedge with health insurance; long-term care insurance
- **life_insurance:**
  - **term:** Pays death benefit only during policy term; no cash value; cheapest; pure insurance
  - **whole_life:** Permanent; builds cash value; expensive; guaranteed premiums
  - **universal_life:** Flexible premiums; adjustable death benefit; cash value linked to crediting rate
  - **variable_life:** Death benefit and cash value linked to investment performance; market risk
  - **insurance_need:** Human capital of deceased + outstanding liabilities − financial capital of survivor
  - **net_premium:** PV of expected death benefit payments; actuarially fair premium
  - **gross_premium:** Net premium + expense loading; actual premium charged
- **annuities:**
  - **definition:** Contract providing periodic payments; hedge against longevity risk
  - **fixed_annuity:** Guaranteed payments; no market risk; inflation risk
  - **variable_annuity:** Payments linked to investment portfolio; market risk borne by annuitant
  - **immediate:** Payments begin immediately; lump sum purchase
  - **deferred:** Accumulation phase then payout; tax-deferred growth
  - **classification:** Life annuity, period certain, joint-and-survivor; determines payout duration
  - **appropriateness:** Most suitable for individuals with longevity risk and no bequest motive; less for those wanting estate
- **risk_management_implementation:**
  - **optimal_strategy:** Balance risk reduction benefit against cost (premium, lost flexibility)
  - **human_capital_effect:** As HC declines (approaching retirement), need for life insurance falls; longevity insurance rises
  - **asset_allocation:** Human capital type affects optimal financial portfolio; bond-like HC → more equity
  - **insurance_program:** Integrate all insurance coverages; avoid gaps and overlap
- **validation:**
  - **client_required:** client_id present
  - **valid_risk:** risk_type in [earnings, premature_death, longevity, property, liability, health]

## Outcomes

### Manage_individual_risk (Priority: 1)

_Develop risk management strategy for individual client risk exposure_

**Given:**
- `client_id` (input) exists
- `risk_type` (input) in `earnings,premature_death,longevity,property,liability,health`

**Then:**
- **call_service** target: `wealth_manager`
- **emit_event** event: `individual_risk.managed`

### Invalid_risk (Priority: 10) — Error: `INDIVIDUAL_RISK_INVALID_TYPE`

_Unsupported individual risk type_

**Given:**
- `risk_type` (input) not_in `earnings,premature_death,longevity,property,liability,health`

**Then:**
- **emit_event** event: `individual_risk.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INDIVIDUAL_RISK_INVALID_TYPE` | 400 | risk_type must be one of earnings, premature_death, longevity, property, liability, health | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `individual_risk.managed` |  | `client_id`, `risk_type`, `insurance_amount`, `annuity_amount`, `expected_economic_net_worth` |
| `individual_risk.rejected` |  | `client_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| private-wealth-management-overview-l3 | required |  |
| private-wealth-topics-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Individual Risk Management L3

Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk management strategy

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
| `private_wealth_management_overview_l3` | private-wealth-management-overview-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| manage_individual_risk | `autonomous` | - | - |
| invalid_risk | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Individual Risk Management L3 Blueprint",
  "description": "Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk manag",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, private-wealth, human-capital, life-insurance, annuities, individual-risk, longevity-risk, premature-death-risk, cfa-level-3"
}
</script>
