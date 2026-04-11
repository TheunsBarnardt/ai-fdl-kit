<!-- AUTO-GENERATED FROM product-configurator.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Product Configurator

> Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering.

**Category:** Data · **Version:** 1.0.0 · **Tags:** product-configuration · variants · attributes · pricing · matrix-ordering

## What this does

Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **attribute_name** *(text, required)* — Attribute Name
- **variant_creation_mode** *(select, required)* — Variant Creation Mode
- **display_type** *(select, required)* — Display Type
- **attribute_values** *(json, required)* — Attribute Values
- **extra_price** *(number, optional)* — Extra Price
- **is_custom** *(boolean, optional)* — Custom Input
- **exclusion_rules** *(json, optional)* — Exclusion Rules
- **product_add_mode** *(select, optional)* — Add Mode

## What must be true

- **multi_checkbox_requires_no_variant:** Multi-checkbox display type can only be used with no_variant creation mode, since multiple selections cannot map to a single variant.
- **variant_mode_immutable_once_used:** The variant creation mode cannot be changed after attribute lines have been created — doing so would invalidate existing variants.
- **exclusion_prevents_invalid_combos:** Excluded combinations are greyed out in the configurator UI and cannot be selected by the buyer.
- **dynamic_variants_created_on_order:** For dynamic-mode attributes, the system checks if the selected combination already exists as a variant. If not, it creates one at the time of ordering.
- **no_variant_extra_price_on_line:** No-variant attributes add their extra_price directly to the order line total rather than creating a separate product with different list price.
- **archived_variants_preserved:** Variants that no longer match active combinations are archived (hidden) rather than deleted, preserving historical order references.
- **single_value_auto_assigned:** Attribute lines with only one value are automatically assigned to all variants without requiring buyer selection.
- **price_updates_in_real_time:** As the buyer selects attribute values, the displayed price updates immediately to reflect any extra prices from the selection.

## Success & failure scenarios

**✅ Success paths**

- **Product Configured Via Picker** — when buyer opens a configurable product in an order; product has attributes with multiple values, then Configurator displays attribute lines sorted by sequence, each with its display type (radio, pills, color, etc.), exclusions greyed out, and running price total.
- **Variant Selected Always Mode** — when buyer selects a combination of attribute values; all attributes use always-create mode; the combination is not excluded, then Pre-existing variant added to order at computed price.
- **Variant Created Dynamic Mode** — when buyer selects a combination with dynamic-mode attributes; no existing variant matches the selected combination, then New variant generated on-the-fly and added to order.
- **No Variant Attributes Applied** — when buyer selects no_variant attributes (e.g., custom engraving text), then Attribute selections tracked on order line without creating a new variant.
- **Matrix Bulk Order** — when buyer opens a product in matrix mode; product has two configurable attribute dimensions, then Grid displayed with row/column headers for each attribute value. Buyer enters quantities in each cell. Each non-zero cell creates an order line for that variant combination.
- **Custom Value Entered** — when attribute value is marked as custom input; buyer enters free-text value, then Custom value appears in order line description for fulfillment.

**❌ Failure paths**

- **Excluded Combination Blocked** — when buyer selects an attribute value that conflicts with another selection, then Invalid combination prevented before order line creation. *(error: `CONFIGURATOR_EXCLUDED_COMBO`)*

## Errors it can return

- `CONFIGURATOR_EXCLUDED_COMBO` — This combination of options is not available.
- `CONFIGURATOR_VARIANT_MODE_LOCKED` — Variant creation mode cannot be changed after attributes are in use.
- `CONFIGURATOR_MULTI_REQUIRES_NO_VARIANT` — Multi-checkbox display requires no-variant creation mode.

## Connects to

- **quotation-order-management** *(required)* — Configured products are added as lines on sales orders
- **ecommerce-store** *(optional)* — Product configurator displayed on website product pages
- **pos-core** *(optional)* — Product variants selected at POS terminal

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/product-configurator/) · **Spec source:** [`product-configurator.blueprint.yaml`](./product-configurator.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
