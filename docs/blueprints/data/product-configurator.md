---
title: "Product Configurator Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering. . 8 fields"
---

# Product Configurator Blueprint

> Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering.


| | |
|---|---|
| **Feature** | `product-configurator` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | product-configuration, variants, attributes, pricing, matrix-ordering |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/product-configurator.blueprint.yaml) |
| **JSON API** | [product-configurator.json]({{ site.baseurl }}/api/blueprints/data/product-configurator.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `product_manager` | Product Manager | human | Defines product attributes, values, variants, and pricing rules |
| `buyer` | Buyer | human | Selects product configuration during ordering |
| `system` | Variant Engine | system | Generates, manages, and prices product variants |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `attribute_name` | text | Yes | Attribute Name |  |
| `variant_creation_mode` | select | Yes | Variant Creation Mode |  |
| `display_type` | select | Yes | Display Type |  |
| `attribute_values` | json | Yes | Attribute Values |  |
| `extra_price` | number | No | Extra Price |  |
| `is_custom` | boolean | No | Custom Input |  |
| `exclusion_rules` | json | No | Exclusion Rules |  |
| `product_add_mode` | select | No | Add Mode |  |

## States

**State field:** `configuration_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unconfigured` | Yes |  |
| `configurable` |  |  |
| `fully_generated` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unconfigured` | `configurable` | product_manager |  |
|  | `configurable` | `fully_generated` | system |  |

## Rules

- **multi_checkbox_requires_no_variant:**
  - **description:** Multi-checkbox display type can only be used with no_variant creation mode, since multiple selections cannot map to a single variant.

- **variant_mode_immutable_once_used:**
  - **description:** The variant creation mode cannot be changed after attribute lines have been created — doing so would invalidate existing variants.

- **exclusion_prevents_invalid_combos:**
  - **description:** Excluded combinations are greyed out in the configurator UI and cannot be selected by the buyer.

- **dynamic_variants_created_on_order:**
  - **description:** For dynamic-mode attributes, the system checks if the selected combination already exists as a variant. If not, it creates one at the time of ordering.

- **no_variant_extra_price_on_line:**
  - **description:** No-variant attributes add their extra_price directly to the order line total rather than creating a separate product with different list price.

- **archived_variants_preserved:**
  - **description:** Variants that no longer match active combinations are archived (hidden) rather than deleted, preserving historical order references.

- **single_value_auto_assigned:**
  - **description:** Attribute lines with only one value are automatically assigned to all variants without requiring buyer selection.

- **price_updates_in_real_time:**
  - **description:** As the buyer selects attribute values, the displayed price updates immediately to reflect any extra prices from the selection.


## Outcomes

### Product_configured_via_picker (Priority: 1)

**Given:**
- buyer opens a configurable product in an order
- product has attributes with multiple values

**Then:**
- **emit_event** event: `product.configurator.opened`

**Result:** Configurator displays attribute lines sorted by sequence, each with its display type (radio, pills, color, etc.), exclusions greyed out, and running price total.


### Excluded_combination_blocked (Priority: 1) — Error: `CONFIGURATOR_EXCLUDED_COMBO`

**Given:**
- buyer selects an attribute value that conflicts with another selection

**Then:**
- **notify** — Conflicting value greyed out or de-selected

**Result:** Invalid combination prevented before order line creation

### Variant_selected_always_mode (Priority: 2)

**Given:**
- buyer selects a combination of attribute values
- all attributes use always-create mode
- the combination is not excluded

**Then:**
- **set_field** target: `order_line_product` — Existing variant assigned to the order line
- **emit_event** event: `product.variant.selected`

**Result:** Pre-existing variant added to order at computed price

### Variant_created_dynamic_mode (Priority: 3)

**Given:**
- buyer selects a combination with dynamic-mode attributes
- no existing variant matches the selected combination

**Then:**
- **create_record** target: `product_variant` — New variant created with the selected attribute values
- **set_field** target: `order_line_product` — Newly created variant assigned to the order line
- **emit_event** event: `product.variant.created`

**Result:** New variant generated on-the-fly and added to order

### No_variant_attributes_applied (Priority: 4)

**Given:**
- buyer selects no_variant attributes (e.g., custom engraving text)

**Then:**
- **set_field** target: `order_line_description` — Attribute values appended to line description
- **set_field** target: `order_line_price` — Extra prices from no_variant selections added to line total

**Result:** Attribute selections tracked on order line without creating a new variant

### Matrix_bulk_order (Priority: 5)

**Given:**
- buyer opens a product in matrix mode
- product has two configurable attribute dimensions

**Then:**
- **emit_event** event: `product.matrix.opened`

**Result:** Grid displayed with row/column headers for each attribute value. Buyer enters quantities in each cell. Each non-zero cell creates an order line for that variant combination.


### Custom_value_entered (Priority: 6)

**Given:**
- attribute value is marked as custom input
- buyer enters free-text value

**Then:**
- **create_record** target: `custom_attribute_value` — Custom value stored separately linked to the order line

**Result:** Custom value appears in order line description for fulfillment

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONFIGURATOR_EXCLUDED_COMBO` | 400 | This combination of options is not available. | No |
| `CONFIGURATOR_VARIANT_MODE_LOCKED` | 403 | Variant creation mode cannot be changed after attributes are in use. | No |
| `CONFIGURATOR_MULTI_REQUIRES_NO_VARIANT` | 400 | Multi-checkbox display requires no-variant creation mode. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `product.configurator.opened` | Configurator UI opened for a product | `product_template_id`, `available_attributes` |
| `product.variant.selected` | Buyer selected an existing variant combination | `product_id`, `attribute_values`, `price` |
| `product.variant.created` | New variant dynamically created from buyer's selection | `product_id`, `attribute_values` |
| `product.matrix.opened` | Matrix ordering grid opened for bulk variant selection | `product_template_id`, `row_attribute`, `column_attribute` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| quotation-order-management | required | Configured products are added as lines on sales orders |
| ecommerce-store | optional | Product configurator displayed on website product pages |
| pos-core | optional | Product variants selected at POS terminal |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 20
  entry_points:
    - addons/product/models/product_attribute.py
    - addons/product/models/product_template.py
    - addons/sale/controllers/product_configurator.py
    - addons/sale_product_matrix/models/product_template.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Product Configurator Blueprint",
  "description": "Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering.\n. 8 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "product-configuration, variants, attributes, pricing, matrix-ordering"
}
</script>
