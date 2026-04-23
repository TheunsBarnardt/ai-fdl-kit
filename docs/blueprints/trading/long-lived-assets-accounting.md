---
title: "Long Lived Assets Accounting Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Account for long-lived assets — acquisition, depreciation/amortisation, impairment, revaluation, derecognition — across IFRS and US GAAP frameworks. 5 fields. 3"
---

# Long Lived Assets Accounting Blueprint

> Account for long-lived assets — acquisition, depreciation/amortisation, impairment, revaluation, derecognition — across IFRS and US GAAP frameworks

| | |
|---|---|
| **Feature** | `long-lived-assets-accounting` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, long-lived-assets, depreciation, amortisation, impairment, capitalisation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/long-lived-assets-accounting.blueprint.yaml) |
| **JSON API** | [long-lived-assets-accounting.json]({{ site.baseurl }}/api/blueprints/trading/long-lived-assets-accounting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `lla_analyst` | Long-Lived Asset Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_id` | text | Yes | Asset identifier |  |
| `cost` | number | Yes | Original cost |  |
| `useful_life_years` | number | Yes | Estimated useful life (years) |  |
| `salvage_value` | number | No | Salvage / residual value |  |
| `depreciation_method` | select | Yes | straight_line \| declining_balance \| units_of_production |  |

## Rules

- **capitalisation_rules:**
  - **acquisition:** Include purchase price + transport, installation, testing
  - **capitalised_interest:** Interest during construction capitalised (IFRS and US GAAP)
  - **development_costs:** IFRS capitalises if criteria met; US GAAP expenses except software
- **depreciation_methods:**
  - **straight_line:** (Cost - salvage) / useful life
  - **declining_balance:** Rate * beginning net book value — accelerated
  - **units_of_production:** (Cost - salvage) * units produced / total expected units
- **impairment:**
  - **ifrs_trigger:** Recoverable amount (max of fair value less costs and value-in-use) < carrying amount
  - **gaap_trigger_two_step:** Undiscounted CF test first; then write down to fair value
  - **reversal:** IFRS allows impairment reversal (except goodwill); US GAAP does not
- **revaluation_model:**
  - **ifrs_option:** Carry at fair value; gains to OCI / revaluation surplus
  - **us_gaap:** Not permitted for PP&E or intangibles
- **derecognition:**
  - **sale_or_disposal:** Remove asset and accumulated depreciation; recognise gain/loss
  - **disclosure:** Major disposals require separate reporting under IFRS 5
- **ratio_impact:**
  - **shorter_life:** Higher depreciation -> lower net income, lower assets, higher turnover
  - **impairment_charge:** One-time hit to earnings; lowers asset base going forward
- **validation:**
  - **asset_required:** asset_id present
  - **positive_cost:** cost > 0
  - **positive_life:** useful_life_years > 0
  - **valid_method:** depreciation_method in allowed set

## Outcomes

### Compute_depreciation (Priority: 1)

_Compute periodic depreciation and net book value_

**Given:**
- `asset_id` (input) exists
- `cost` (input) gt `0`
- `useful_life_years` (input) gt `0`
- `depreciation_method` (input) in `straight_line,declining_balance,units_of_production`

**Then:**
- **call_service** target: `lla_analyst`
- **emit_event** event: `lla.depreciation_computed`

### Invalid_inputs (Priority: 10) — Error: `LLA_INVALID_INPUTS`

_Invalid inputs_

**Given:**
- ANY: `cost` (input) lte `0` OR `useful_life_years` (input) lte `0`

**Then:**
- **emit_event** event: `lla.computation_rejected`

### Invalid_method (Priority: 11) — Error: `LLA_INVALID_METHOD`

_Unsupported depreciation method_

**Given:**
- `depreciation_method` (input) not_in `straight_line,declining_balance,units_of_production`

**Then:**
- **emit_event** event: `lla.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LLA_INVALID_INPUTS` | 400 | cost and useful_life_years must be positive | No |
| `LLA_INVALID_METHOD` | 400 | depreciation_method must be straight_line, declining_balance, or units_of_production | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `lla.depreciation_computed` |  | `computation_id`, `asset_id`, `periodic_depreciation`, `accumulated_depreciation`, `net_book_value` |
| `lla.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-balance-sheet | required |  |
| fsa-income-statement | recommended |  |

## AGI Readiness

### Goals

#### Reliable Long Lived Assets Accounting

Account for long-lived assets — acquisition, depreciation/amortisation, impairment, revaluation, derecognition — across IFRS and US GAAP frameworks

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
| `fsa_balance_sheet` | fsa-balance-sheet | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_depreciation | `autonomous` | - | - |
| invalid_inputs | `autonomous` | - | - |
| invalid_method | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Long Lived Assets Accounting Blueprint",
  "description": "Account for long-lived assets — acquisition, depreciation/amortisation, impairment, revaluation, derecognition — across IFRS and US GAAP frameworks. 5 fields. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, long-lived-assets, depreciation, amortisation, impairment, capitalisation, cfa-level-1"
}
</script>
