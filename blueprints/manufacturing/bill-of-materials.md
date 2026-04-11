<!-- AUTO-GENERATED FROM bill-of-materials.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bill Of Materials

> Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propagation.

**Category:** Manufacturing · **Version:** 1.0.0 · **Tags:** bom · manufacturing · raw-materials · cost-estimation · production

## What this does

Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propagation.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **item** *(text, required)* — Finished Good
- **quantity** *(number, required)* — Quantity
- **company** *(text, required)* — Company
- **items** *(json, required)* — Raw Materials
- **operations** *(json, optional)* — Manufacturing Operations
- **exploded_items** *(json, optional)* — Exploded Items
- **is_active** *(boolean, required)* — Active
- **is_default** *(boolean, optional)* — Default BOM
- **with_operations** *(boolean, optional)* — With Operations
- **rm_cost_as_per** *(select, required)* — Rate of Materials Based On
- **raw_material_cost** *(number, optional)* — Raw Material Cost
- **operating_cost** *(number, optional)* — Operating Cost
- **total_cost** *(number, optional)* — Total Cost
- **process_loss_percentage** *(number, optional)* — Process Loss Percentage
- **process_loss_qty** *(number, optional)* — Process Loss Quantity
- **transfer_material_against** *(select, optional)* — Transfer Material Against
- **track_semi_finished_goods** *(boolean, optional)* — Track Semi-Finished Goods
- **allow_alternative_item** *(boolean, optional)* — Allow Alternative Item
- **inspection_required** *(boolean, optional)* — Quality Inspection Required
- **currency** *(text, required)* — Currency
- **conversion_rate** *(number, optional)* — Conversion Rate
- **status** *(select, required)* — Status

## What must be true

- **no_circular_references:** BOM hierarchy must not contain circular references. System performs recursive tree traversal during validation to detect cycles where a child BOM directly or indirectly references the parent BOM.
- **items_table_not_empty:** The raw materials (items) table must contain at least one row. A BOM without materials cannot be submitted.
- **material_qty_positive:** Each raw material row must have a quantity greater than zero. Zero or negative quantities are rejected on save.
- **fixed_asset_not_allowed:** Fixed asset items cannot be added as raw materials in a BOM. Only stock and non-stock items are permitted.
- **operations_require_workstation:** Each operation row must specify a workstation and a time greater than zero minutes. Operations without workstation or time are invalid.
- **cost_propagation:** When a child BOM cost changes, the system propagates the updated cost upward to all parent BOMs that reference it, recalculating total cost at each level.
- **exploded_items_flatten:** Exploded items table flattens the entire multi-level BOM hierarchy into a single list of leaf-level raw materials with aggregated quantities, accounting for sub-assembly BOMs.
- **process_loss_cap:** Process loss percentage must be between 0 and 100 inclusive. The process loss quantity is computed as quantity times process loss percentage divided by 100.
- **cost_allocation_sum:** When secondary items (scrap or by-products) are defined, the cost allocation percentages between the finished good and all secondary items must sum to exactly 100%.
- **inactive_bom_linking:** An inactive BOM cannot be referenced by any active BOM or work order. Deactivating a BOM triggers validation of all dependent documents.

## Success & failure scenarios

**✅ Success paths**

- **Create Bom** — when user provides a finished good item, quantity, and at least one raw material, then BOM is created in draft status with calculated material costs.
- **Submit Bom** — when status eq "draft"; items table has at least one row; no circular references detected in BOM hierarchy, then BOM is submitted and available for use in work orders and production planning.
- **Calculate Cost** — when BOM exists with materials and optionally operations, then BOM costs are recalculated from current material rates and operation costs.
- **Explode Items** — when BOM contains sub-assembly items that have their own BOMs, then Exploded items table shows all leaf-level raw materials across the full BOM tree.
- **Update Cost Propagation** — when a child BOM cost has been updated; parent BOMs reference the updated child BOM, then All parent BOMs reflect the updated child BOM cost.
- **Replace Bom** — when old BOM exists and new BOM is submitted for the same item, then Old BOM is replaced by new BOM across all pending documents.

**❌ Failure paths**

- **Deactivate Bom** — when status eq "submitted"; no active work orders reference this BOM, then BOM is deactivated and cannot be used for new work orders. *(error: `BOM_INACTIVE_LINKED`)*

## Errors it can return

- `BOM_RECURSION_DETECTED` — Circular reference detected in BOM hierarchy. A BOM cannot reference itself directly or indirectly.
- `BOM_NO_MATERIALS` — BOM must contain at least one raw material before submission.
- `BOM_QTY_ZERO` — Each raw material must have a quantity greater than zero.
- `BOM_OPERATION_TIME_ZERO` — Each operation must have a time greater than zero minutes.
- `BOM_COST_ALLOCATION_MISMATCH` — Cost allocation between finished good and secondary items must sum to 100%.
- `BOM_INACTIVE_LINKED` — Cannot deactivate BOM while active BOMs or work orders reference it.

## Connects to

- **work-orders-job-cards** *(required)* — Work orders consume BOMs to plan and execute manufacturing
- **production-planning** *(recommended)* — Production planning uses BOMs to calculate material requirements
- **stock-entry-movements** *(recommended)* — Stock entries transfer materials based on BOM quantities

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/manufacturing/bill-of-materials/) · **Spec source:** [`bill-of-materials.blueprint.yaml`](./bill-of-materials.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
