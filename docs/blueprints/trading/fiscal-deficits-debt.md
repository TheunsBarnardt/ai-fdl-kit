---
title: "Fiscal Deficits Debt Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Measure government deficits and national debt — distinguishing cyclical from structural components — and evaluate sustainability using debt-to-GDP dynamics and "
---

# Fiscal Deficits Debt Blueprint

> Measure government deficits and national debt — distinguishing cyclical from structural components — and evaluate sustainability using debt-to-GDP dynamics and interest burden

| | |
|---|---|
| **Feature** | `fiscal-deficits-debt` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, fiscal-deficit, national-debt, debt-sustainability, structural-balance, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fiscal-deficits-debt.blueprint.yaml) |
| **JSON API** | [fiscal-deficits-debt.json]({{ site.baseurl }}/api/blueprints/trading/fiscal-deficits-debt.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fiscal_analyst` | Fiscal Sustainability Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Country or monetary union |  |
| `fiscal_balance_pct_gdp` | number | Yes | Fiscal balance as percent of GDP (negative = deficit) |  |
| `debt_to_gdp` | number | Yes | Gross public debt as percent of GDP |  |
| `average_interest_rate` | number | No | Weighted average interest rate on outstanding debt |  |
| `real_growth_rate` | number | No | Real GDP growth rate (percent) |  |
| `primary_balance` | number | No | Primary balance (excluding interest) as percent of GDP |  |

## Rules

- **deficit_definitions:**
  - **headline_deficit:** Total government spending minus revenue
  - **primary_deficit:** Excludes interest payments
  - **structural_deficit:** Cyclically adjusted — what deficit would be at full employment
  - **cyclical_deficit:** Headline minus structural
- **debt_dynamics:**
  - **debt_to_gdp_change:** delta d = (r - g) * d + primary_deficit
  - **stabilising_primary_balance:** PB* = (r - g) * d / 100
  - **sustainability_condition:** Primary balance at least (r - g) * d / 100
  - **favourable_regime:** g > r -> debt/GDP declines even with modest primary deficits
- **burden_of_debt:**
  - **interest_burden:** Interest as percent of revenue indicates debt service capacity
  - **crowding_out:** High public debt can crowd out private investment via higher rates
  - **intergenerational_transfer:** Future taxpayers bear cost of today's deficits
- **ricardian_equivalence:**
  - **claim:** Rational agents save more today to offset future tax rises -> deficits don't stimulate
  - **caveats:** Empirically weak — liquidity constraints and myopic agents blunt the mechanism
- **applications:**
  - **sovereign_rating:** Rating agencies weight debt/GDP, primary balance, and growth
  - **fx_forecasting:** Twin deficits (fiscal + current account) often weaken currency
  - **bond_allocation:** High debt/GDP -> steeper yield curve and wider spreads
- **validation:**
  - **jurisdiction_required:** jurisdiction present
  - **debt_non_negative:** debt_to_gdp >= 0
  - **reasonable_values:** |fiscal_balance_pct_gdp| <= 50

## Outcomes

### Assess_fiscal_health (Priority: 1)

_Compute sustainability metrics_

**Given:**
- `jurisdiction` (input) exists
- `debt_to_gdp` (input) exists

**Then:**
- **call_service** target: `fiscal_analyst`
- **emit_event** event: `fiscal.health_assessed`

### Unsustainable_trajectory (Priority: 2)

_Debt dynamics imply rising debt/GDP indefinitely_

**Given:**
- `unsustainable_flag` (computed) eq `true`

**Then:**
- **emit_event** event: `fiscal.sustainability_warning`

### Missing_debt_data (Priority: 10) — Error: `FISCAL_DEBT_MISSING`

_Debt-to-GDP missing_

**Given:**
- `debt_to_gdp` (input) not_exists

**Then:**
- **emit_event** event: `fiscal.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FISCAL_DEBT_MISSING` | 400 | debt_to_gdp is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fiscal.health_assessed` |  | `assessment_id`, `jurisdiction`, `debt_to_gdp`, `primary_balance`, `stabilising_pb`, `sustainability_flag` |
| `fiscal.sustainability_warning` |  | `assessment_id`, `jurisdiction`, `debt_to_gdp`, `gap` |
| `fiscal.assessment_rejected` |  | `assessment_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fiscal-policy-framework | required |  |
| fiscal-implementation-challenges | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
debt_dynamics_example:
  r: 3
  g: 1.5
  d: 100
  stabilising_pb: (3 - 1.5) * 100 / 100 = 1.5% of GDP
  current_pb: -2
  gap: 3.5
  note: Requires fiscal tightening of 3.5 pp of GDP to stabilise debt
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fiscal Deficits Debt Blueprint",
  "description": "Measure government deficits and national debt — distinguishing cyclical from structural components — and evaluate sustainability using debt-to-GDP dynamics and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, fiscal-deficit, national-debt, debt-sustainability, structural-balance, cfa-level-1"
}
</script>
