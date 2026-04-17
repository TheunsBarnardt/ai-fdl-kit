---
title: "Corporate Capital Structure Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Determine optimal capital structure using Modigliani-Miller propositions, static trade-off theory, and pecking order theory — balancing tax shield, bankruptcy c"
---

# Corporate Capital Structure Blueprint

> Determine optimal capital structure using Modigliani-Miller propositions, static trade-off theory, and pecking order theory — balancing tax shield, bankruptcy costs, and signalling

| | |
|---|---|
| **Feature** | `corporate-capital-structure` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, capital-structure, modigliani-miller, wacc, leverage, tax-shield, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/corporate-capital-structure.blueprint.yaml) |
| **JSON API** | [corporate-capital-structure.json]({{ site.baseurl }}/api/blueprints/trading/corporate-capital-structure.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `capital_structure_analyst` | Capital Structure Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `debt_weight` | number | Yes | D / (D + E) |  |
| `cost_of_debt` | number | Yes | Pre-tax cost of debt (decimal) |  |
| `cost_of_equity` | number | Yes | Cost of equity (decimal) |  |
| `tax_rate` | number | Yes | Marginal corporate tax rate (decimal) |  |

## Rules

- **wacc:**
  - **formula:** WACC = (D/V) * r_d * (1 - t) + (E/V) * r_e
  - **interpretation:** Blended required return weighted by capital structure
- **mm_without_taxes:**
  - **proposition_1:** Firm value independent of capital structure
  - **proposition_2:** Cost of equity rises linearly with leverage
  - **assumptions:** No taxes, no bankruptcy costs, no agency costs, symmetric information
- **mm_with_taxes:**
  - **proposition_1:** Value increases with debt by the tax shield: V_levered = V_unlevered + t * D
  - **proposition_2:** Cost of equity still rises with leverage but after-tax WACC falls
- **static_trade_off:**
  - **benefit:** Interest tax shield raises firm value
  - **cost:** Expected bankruptcy / financial distress costs rise with leverage
  - **optimum:** Marginal tax benefit equals marginal distress cost
- **pecking_order:**
  - **ordering:** Internal funds -> debt -> equity
  - **rationale:** Asymmetric information penalises external equity issuance
- **factors_influencing_structure:** Business risk and cash flow stability, Tax regime, Agency costs and governance, Asymmetric information and signalling, Market conditions and investor demand, Regulatory requirements
- **validation:**
  - **entity_required:** entity_id present
  - **valid_weights:** 0 <= debt_weight <= 1
  - **valid_rates:** all rates between 0 and 1

## Outcomes

### Compute_wacc (Priority: 1)

_Compute after-tax WACC_

**Given:**
- `entity_id` (input) exists
- `debt_weight` (input) gte `0`
- `debt_weight` (input) lte `1`

**Then:**
- **call_service** target: `capital_structure_analyst`
- **emit_event** event: `capital.wacc_computed`

### Invalid_weights (Priority: 10) — Error: `CS_INVALID_WEIGHT`

_Debt weight out of range_

**Given:**
- ANY: `debt_weight` (input) lt `0` OR `debt_weight` (input) gt `1`

**Then:**
- **emit_event** event: `capital.wacc_rejected`

### Missing_entity (Priority: 11) — Error: `CS_ENTITY_MISSING`

_Entity id missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `capital.wacc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CS_INVALID_WEIGHT` | 400 | debt_weight must lie between 0 and 1 | No |
| `CS_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `capital.wacc_computed` |  | `computation_id`, `entity_id`, `wacc`, `tax_shield_value`, `distress_cost_estimate` |
| `capital.wacc_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-allocation-npv-irr | recommended |  |
| corporate-stakeholders | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Corporate Capital Structure Blueprint",
  "description": "Determine optimal capital structure using Modigliani-Miller propositions, static trade-off theory, and pecking order theory — balancing tax shield, bankruptcy c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, capital-structure, modigliani-miller, wacc, leverage, tax-shield, cfa-level-1"
}
</script>
