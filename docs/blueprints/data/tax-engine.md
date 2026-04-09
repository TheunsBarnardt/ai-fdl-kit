---
title: "Tax Engine Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping. . 14 fields. 8"
---

# Tax Engine Blueprint

> Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.


| | |
|---|---|
| **Feature** | `tax-engine` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | tax-computation, vat, sales-tax, fiscal-position, cash-basis |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/tax-engine.blueprint.yaml) |
| **JSON API** | [tax-engine.json]({{ site.baseurl }}/api/blueprints/data/tax-engine.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `tax_admin` | Tax Administrator | human | Configures tax rates, groups, repartition lines, and fiscal positions |
| `system` | Tax Engine | system | Computes tax amounts on transactions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `tax_name` | text | Yes | Tax Name |  |
| `amount_type` | select | Yes | Computation Type |  |
| `tax_amount` | number | Yes | Tax Rate/Amount |  |
| `type_tax_use` | select | Yes | Tax Scope |  |
| `price_include` | boolean | No | Included in Price |  |
| `tax_exigibility` | select | Yes | Tax Exigibility |  |
| `cash_basis_transition_account` | text | No | Cash Basis Transition Account |  |
| `children_taxes` | json | No | Child Taxes |  |
| `sequence` | number | Yes | Computation Order |  |
| `invoice_repartition_lines` | json | Yes | Invoice Repartition |  |
| `refund_repartition_lines` | json | Yes | Refund Repartition |  |
| `custom_formula` | text | No | Custom Formula |  |
| `fiscal_position_name` | text | Yes | Fiscal Position Name |  |
| `tax_mapping_rules` | json | Yes | Tax Mapping Rules |  |

## Rules

- **tax_name_unique_per_scope:**
  - **description:** Tax names must be unique within the same company, tax scope (sale/purchase), and country.

- **group_tax_children_ordered:**
  - **description:** Child taxes within a group are applied in sequence order. Each child's base is the original base (not the accumulated result).

- **cash_basis_requires_reconcile_account:**
  - **description:** Cash-basis taxes require a transition account that supports reconciliation to hold the tax amount until payment.

- **price_include_adjusts_base:**
  - **description:** When tax is included in price, the base is calculated by reverse- computing: base = price / (1 + tax_rate). The tax amount is the difference between price and base.

- **division_type_always_included:**
  - **description:** Division-type taxes are always price-inclusive by definition. The formula is: tax = price - (price / (1 + rate/100)).

- **formula_safe_evaluation:**
  - **description:** Custom formula taxes are evaluated in a sandboxed environment. Only approved variables (base, price_unit, quantity, product) are available. No system access or imports allowed.

- **fiscal_position_auto_mapping:**
  - **description:** When a fiscal position is set on a transaction, all tax lines are automatically remapped according to the position's tax mapping rules.

- **repartition_must_sum_to_100:**
  - **description:** Invoice and refund repartition line factors must sum to 100% for accurate tax distribution across accounts.


## Outcomes

### Tax_computed_percent (Priority: 1)

**Given:**
- `amount_type` (db) eq `percent`
- a transaction line has a base amount, quantity, and tax assigned

**Then:**
- **set_field** target: `tax_amount_result` — tax = base * quantity * (rate / 100)
- **set_field** target: `total_included` — base + tax_amount
- **set_field** target: `total_excluded` — base amount unchanged

**Result:** Tax calculated as percentage of base and added to total

### Invalid_formula (Priority: 1) — Error: `TAX_INVALID_FORMULA`

**Given:**
- tax formula contains unsafe or invalid syntax

**Then:**
- **notify** — Formula validation error shown

**Result:** Tax configuration rejected until formula is corrected

### Tax_computed_fixed (Priority: 2)

**Given:**
- `amount_type` (db) eq `fixed`

**Then:**
- **set_field** target: `tax_amount_result` — tax = fixed_amount * quantity

**Result:** Fixed tax amount applied per unit regardless of price

### Tax_computed_group (Priority: 3)

**Given:**
- `amount_type` (db) eq `group`
- group has one or more child taxes

**Then:**
- **call_service** target: `tax_engine` — Recursively compute each child tax in sequence order. Each child uses the original base amount (not accumulated). Results are aggregated across all children.


**Result:** Combined tax from all child taxes in the group

### Tax_computed_price_inclusive (Priority: 4)

**Given:**
- tax is marked as price-inclusive

**Then:**
- **set_field** target: `base_amount` — base = price / (1 + rate/100) — reverse-computed from total
- **set_field** target: `tax_amount_result` — tax = price - base
- **set_field** target: `total_excluded` — reverse-computed base (lower than displayed price)

**Result:** Tax extracted from the inclusive price, base adjusted downward

### Tax_computed_formula (Priority: 5)

**Given:**
- `amount_type` (db) eq `code`
- a valid formula expression is configured

**Then:**
- **call_service** target: `tax_engine` — Formula evaluated in sandbox with variables: base, price_unit, quantity, product. Result used as tax amount.


**Result:** Tax computed from custom formula

### Fiscal_position_applied (Priority: 6)

**Given:**
- a fiscal position is assigned to the transaction
- the position has tax mapping rules

**Then:**
- **set_field** target: `applicable_taxes` — Source taxes replaced with mapped destination taxes

**Result:** Tax lines reflect the customer's jurisdiction-specific rates

### Cash_basis_deferred (Priority: 7)

**Given:**
- `tax_exigibility` (db) eq `on_payment`
- invoice is posted but payment not yet received

**Then:**
- **set_field** target: `tax_account` — Tax amount held in transition account instead of final tax account

**Result:** Tax liability deferred until payment. On payment reconciliation, amount moves from transition account to final tax account.


## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TAX_INVALID_FORMULA` | 400 | The tax formula contains invalid syntax or unauthorized operations. | No |
| `TAX_DUPLICATE_NAME` | 409 | A tax with this name already exists for this scope and country. | No |
| `TAX_CASH_BASIS_NO_ACCOUNT` | 400 | Cash-basis taxes require a reconcilable transition account. | No |
| `TAX_REPARTITION_UNBALANCED` | 400 | Repartition line factors do not sum to 100%. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tax.computed` | Tax calculation completed for a transaction line | `tax_id`, `base_amount`, `tax_amount`, `total_included`, `total_excluded` |
| `tax.cash_basis.transferred` | Cash-basis tax moved from transition account to final account on payment | `tax_id`, `invoice_id`, `payment_id`, `amount` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| invoicing-payments | required | Tax engine computes taxes on every invoice line |
| pos-core | required | POS order lines use tax engine for price calculation |
| quotation-order-management | required | Sales order lines use tax engine for pricing |
| ecommerce-store | required | Product prices on website include/exclude tax per configuration |

## AGI Readiness

### Goals

#### Reliable Tax Engine

Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `invoicing_payments` | invoicing-payments | degrade |
| `pos_core` | pos-core | degrade |
| `quotation_order_management` | quotation-order-management | degrade |
| `ecommerce_store` | ecommerce-store | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| tax_computed_percent | `autonomous` | - | - |
| tax_computed_fixed | `autonomous` | - | - |
| tax_computed_group | `autonomous` | - | - |
| tax_computed_price_inclusive | `autonomous` | - | - |
| tax_computed_formula | `autonomous` | - | - |
| fiscal_position_applied | `autonomous` | - | - |
| cash_basis_deferred | `autonomous` | - | - |
| invalid_formula | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 15
  entry_points:
    - addons/account/models/account_tax.py
    - addons/account_tax_python/models/account_tax.py
    - addons/account/models/account_fiscal_position.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Tax Engine Blueprint",
  "description": "Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.\n. 14 fields. 8",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "tax-computation, vat, sales-tax, fiscal-position, cash-basis"
}
</script>
