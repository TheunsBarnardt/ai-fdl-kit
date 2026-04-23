---
title: "Inventory Accounting Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply FIFO, LIFO, and weighted-average cost-flow methods to compute COGS and ending inventory, convert LIFO to FIFO, and evaluate the impact on ratios and valua"
---

# Inventory Accounting Blueprint

> Apply FIFO, LIFO, and weighted-average cost-flow methods to compute COGS and ending inventory, convert LIFO to FIFO, and evaluate the impact on ratios and valuation

| | |
|---|---|
| **Feature** | `inventory-accounting` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, inventory, fifo, lifo, weighted-average, lifo-reserve, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/inventory-accounting.blueprint.yaml) |
| **JSON API** | [inventory-accounting.json]({{ site.baseurl }}/api/blueprints/trading/inventory-accounting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inventory_analyst` | Inventory Accounting Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `method` | select | Yes | fifo \| lifo \| weighted_average \| specific_identification |  |
| `beginning_inventory` | number | Yes | Beginning inventory at cost |  |
| `purchases` | json | Yes | Period purchases with quantity and unit cost |  |
| `units_sold` | number | Yes | Units sold during period |  |

## Rules

- **cost_flow_methods:**
  - **fifo:** First-in, first-out — COGS reflects oldest costs, ending inventory reflects newest
  - **lifo:** Last-in, first-out — COGS reflects newest costs, ending inventory reflects oldest (US GAAP only)
  - **weighted_average:** Average cost per unit applied to COGS and ending inventory
  - **specific_identification:** Used for unique items (vehicles, real estate)
- **inflation_effects:**
  - **rising_prices_fifo:** Higher ending inventory, lower COGS, higher gross profit and taxes
  - **rising_prices_lifo:** Lower ending inventory, higher COGS, lower gross profit and taxes
  - **lifo_liquidation:** Selling below production -> old low costs flow through, inflating margins
- **lifo_reserve:**
  - **definition:** FIFO inventory - LIFO inventory
  - **conversion:**
    - **inventory_to_fifo:** LIFO inventory + LIFO reserve
    - **cogs_to_fifo:** LIFO COGS - change in LIFO reserve
- **valuation_adjustments:**
  - **ifrs:** Lower of cost or net realisable value (NRV)
  - **us_gaap:** Lower of cost or NRV (for FIFO and WA); lower of cost or market (LIFO)
  - **reversals:** IFRS allows reversal; US GAAP does not
- **ratio_impact:**
  - **inventory_turnover:** LIFO firms show higher turnover (lower inventory)
  - **gross_margin:** FIFO firms show higher margins in inflation
- **validation:**
  - **entity_required:** entity_id present
  - **valid_method:** method in allowed set
  - **units_non_negative:** units_sold >= 0

## Outcomes

### Compute_cogs_inventory (Priority: 1)

_Compute COGS and ending inventory under chosen method_

**Given:**
- `entity_id` (input) exists
- `method` (input) in `fifo,lifo,weighted_average,specific_identification`
- `units_sold` (input) gte `0`

**Then:**
- **call_service** target: `inventory_analyst`
- **emit_event** event: `inventory.computed`

### Invalid_method (Priority: 10) — Error: `INV_INVALID_METHOD`

_Unsupported inventory method_

**Given:**
- `method` (input) not_in `fifo,lifo,weighted_average,specific_identification`

**Then:**
- **emit_event** event: `inventory.computation_rejected`

### Missing_entity (Priority: 11) — Error: `INV_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `inventory.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INV_INVALID_METHOD` | 400 | method must be fifo, lifo, weighted_average, or specific_identification | No |
| `INV_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inventory.computed` |  | `computation_id`, `entity_id`, `method`, `cogs`, `ending_inventory`, `lifo_reserve_change` |
| `inventory.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-balance-sheet | required |  |
| fsa-income-statement | recommended |  |

## AGI Readiness

### Goals

#### Reliable Inventory Accounting

Apply FIFO, LIFO, and weighted-average cost-flow methods to compute COGS and ending inventory, convert LIFO to FIFO, and evaluate the impact on ratios and valuation

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
| compute_cogs_inventory | `autonomous` | - | - |
| invalid_method | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Inventory Accounting Blueprint",
  "description": "Apply FIFO, LIFO, and weighted-average cost-flow methods to compute COGS and ending inventory, convert LIFO to FIFO, and evaluate the impact on ratios and valua",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, inventory, fifo, lifo, weighted-average, lifo-reserve, cfa-level-1"
}
</script>
