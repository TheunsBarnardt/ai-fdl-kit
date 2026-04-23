---
title: "Multinational Operations L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Translate foreign-currency transactions and financial statements — functional-currency test, current-rate vs temporal methods, hyperinflationary economies, effe"
---

# Multinational Operations L2 Blueprint

> Translate foreign-currency transactions and financial statements — functional-currency test, current-rate vs temporal methods, hyperinflationary economies, effective tax rate

| | |
|---|---|
| **Feature** | `multinational-operations-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, multinational, fx-translation, functional-currency, hyperinflation, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/multinational-operations-l2.blueprint.yaml) |
| **JSON API** | [multinational-operations-l2.json]({{ site.baseurl }}/api/blueprints/trading/multinational-operations-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_translator` | FX Translation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Foreign entity identifier |  |
| `method` | select | Yes | current_rate \| temporal \| hyperinflationary |  |

## Rules

- **foreign_currency_transactions:**
  - **initial_measurement:** Spot rate on transaction date
  - **settlement_gain_loss:** Rate change between transaction and settlement; P&L
  - **monetary_items_remeasurement:** Year-end closing rate; P&L impact
  - **non_monetary_at_cost:** Historical rate retained
- **functional_currency_determination:**
  - **primary_indicators:** Currency that influences sales prices, labour, materials, financing
  - **secondary_indicators:** Day-to-day operating cash flow currency
  - **change_in_functional_currency:** Prospective; no restatement
- **current_rate_method:**
  - **use_when:** Functional currency ≠ parent's presentation currency (foreign functional)
  - **asset_liability_rate:** Current (closing) rate
  - **revenue_expense_rate:** Weighted-average rate
  - **equity_rate:** Historical rate
  - **translation_gain_loss:** Cumulative Translation Adjustment in OCI; recycled to P&L on disposal
- **temporal_method:**
  - **use_when:** Functional currency = parent's presentation currency (parent functional, local books in foreign)
  - **monetary_current_rate:** Cash, receivables, payables
  - **non_monetary_historical:** Inventory at lower of cost or NRV at historical rate; PPE at historical
  - **revenue_expense:** Historical rate for items tied to non-monetary; average for others
  - **cogs_depreciation:** Historical rate matching non-monetary assets
  - **remeasurement_gain_loss:** Recognised in P&L
- **hyperinflationary_economies:**
  - **definition:** Cumulative 3-year inflation ≥ 100%
  - **ifrs_approach:** Restate local statements for inflation, then translate at current rate
  - **gaap_approach:** Use temporal method as if functional currency were parent's
- **analytical_implications:**
  - **current_rate_leverage:** Unchanged; ratios translate cleanly
  - **temporal_leverage:** Can distort ratios because non-monetary items stay at historical rate
  - **effective_tax_rate:** Can deviate from statutory due to jurisdiction mix and translation effects
  - **sales_growth:** Disclose organic vs FX components
- **validation:**
  - **entity_required:** entity_id present
  - **valid_method:** method in [current_rate, temporal, hyperinflationary]

## Outcomes

### Translate_entity (Priority: 1)

_Translate foreign entity financial statements_

**Given:**
- `entity_id` (input) exists
- `method` (input) in `current_rate,temporal,hyperinflationary`

**Then:**
- **call_service** target: `fx_translator`
- **emit_event** event: `fx_translation.completed`

### Invalid_method (Priority: 10) — Error: `FX_INVALID_METHOD`

_Unsupported translation method_

**Given:**
- `method` (input) not_in `current_rate,temporal,hyperinflationary`

**Then:**
- **emit_event** event: `fx_translation.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FX_INVALID_METHOD` | 400 | method must be current_rate, temporal, or hyperinflationary | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx_translation.completed` |  | `entity_id`, `method`, `translation_gain_loss`, `cumulative_cta` |
| `fx_translation.rejected` |  | `entity_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| currency-exchange-equilibrium-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Multinational Operations L2

Translate foreign-currency transactions and financial statements — functional-currency test, current-rate vs temporal methods, hyperinflationary economies, effective tax rate

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
| translate_entity | `autonomous` | - | - |
| invalid_method | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multinational Operations L2 Blueprint",
  "description": "Translate foreign-currency transactions and financial statements — functional-currency test, current-rate vs temporal methods, hyperinflationary economies, effe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, multinational, fx-translation, functional-currency, hyperinflation, cfa-level-2"
}
</script>
