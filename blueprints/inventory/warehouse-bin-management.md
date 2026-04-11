<!-- AUTO-GENERATED FROM warehouse-bin-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Warehouse Bin Management

> Warehouse hierarchy and bin management with nested trees, quantity tracking, putaway rules, and perpetual inventory GL integration.

**Category:** Inventory · **Version:** 1.0.0 · **Tags:** warehouse · bin-management · putaway · inventory · stock-balance · projected-qty

## What this does

Warehouse hierarchy and bin management with nested trees, quantity tracking, putaway rules, and perpetual inventory GL integration.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **warehouse_name** *(text, required)* — Warehouse Name
- **company** *(text, required)* — Company
- **parent_warehouse** *(text, optional)* — Parent Warehouse
- **warehouse_type** *(text, optional)* — Warehouse Type
- **disabled** *(boolean, optional)* — Disabled
- **is_group** *(boolean, optional)* — Is Group
- **is_rejected_warehouse** *(boolean, optional)* — Is Rejected Warehouse
- **default_in_transit_warehouse** *(text, optional)* — Default In-Transit Warehouse
- **account** *(text, optional)* — Warehouse Account
- **item_code** *(text, required)* — Item Code
- **warehouse** *(text, required)* — Warehouse
- **actual_qty** *(number, optional)* — Actual Quantity
- **ordered_qty** *(number, optional)* — Ordered Quantity
- **reserved_qty** *(number, optional)* — Reserved Quantity
- **reserved_qty_for_production** *(number, optional)* — Reserved for Production
- **projected_qty** *(number, optional)* — Projected Quantity
- **planned_qty** *(number, optional)* — Planned Quantity
- **stock_value** *(number, optional)* — Stock Value
- **valuation_rate** *(number, optional)* — Valuation Rate
- **putaway_item_code** *(text, required)* — Putaway Item Code
- **putaway_warehouse** *(text, required)* — Putaway Warehouse
- **capacity** *(number, required)* — Warehouse Capacity
- **priority** *(number, required)* — Putaway Priority
- **stock_capacity** *(number, optional)* — Available Stock Capacity

## What must be true

- **warehouse_tree_hierarchy:** Warehouses form a nested tree structure via parent_warehouse references. Group warehouses (is_group = true) can contain child warehouses but cannot hold stock directly. Leaf warehouses hold actual stock.
- **warehouse_deletion_protection:** A warehouse cannot be deleted if it has any stock ledger entries, bin records with non-zero quantities, or child warehouses. The system must verify all dependencies before allowing deletion.
- **bin_projected_qty_formula:** Projected quantity is computed as: actual_qty + ordered_qty + indented_qty + planned_qty - reserved_qty - reserved_qty_for_production - reserved_qty_for_sub_contract. This formula provides a forward-looking availability estimate.
- **putaway_uniqueness:** Putaway rules must be unique per item-warehouse combination. Duplicate rules for the same item and warehouse are rejected.
- **putaway_capacity_validation:** Putaway rule capacity must exceed the current stock quantity in the warehouse. The system validates that the defined capacity is achievable.
- **putaway_allocation_logic:** When applying putaway rules, stock is distributed to warehouses by priority (lowest number first), then by available capacity. If the highest-priority warehouse is full, overflow goes to the next.
- **perpetual_inventory_gl_link:** Each warehouse is linked to a GL account for perpetual inventory. Stock value changes in the bin are reflected as GL entries in the linked account.

## Success & failure scenarios

**✅ Success paths**

- **Create Warehouse** — when user provides a warehouse name and company; parent warehouse exists if specified; warehouse name is unique within the company, then Warehouse created and available for stock transactions.
- **Update Bin Quantities** — when a stock transaction is processed affecting an item-warehouse combination, then Bin quantities and values reflect the latest stock position.
- **Delete Warehouse** — when warehouse has no stock ledger entries; warehouse has no child warehouses; all bin quantities are zero, then Warehouse deleted from the system.
- **Disable Warehouse** — when user disables a warehouse; warehouse has no pending transactions, then Warehouse disabled and excluded from future transactions.

**❌ Failure paths**

- **Warehouse Has Stock** — when user attempts to delete or disable a warehouse; warehouse has non-zero bin quantities or stock ledger entries, then Deletion blocked because warehouse still contains stock. *(error: `WAREHOUSE_HAS_STOCK`)*
- **Warehouse Has Children** — when user attempts to delete a group warehouse; warehouse has child warehouses, then Deletion blocked because warehouse has child nodes. *(error: `WAREHOUSE_HAS_CHILDREN`)*
- **Apply Putaway Rule** — when incoming stock receipt has putaway rules defined for the item; at least one target warehouse has available capacity, then Incoming stock automatically distributed to warehouses per putaway rules. *(error: `PUTAWAY_DUPLICATE_RULE`)*

## Errors it can return

- `WAREHOUSE_HAS_STOCK` — Cannot delete warehouse: it contains stock or has ledger entries.
- `WAREHOUSE_HAS_CHILDREN` — Cannot delete warehouse: it has child warehouses in the hierarchy.
- `WAREHOUSE_WRONG_COMPANY` — Warehouse does not belong to the specified company.
- `PUTAWAY_DUPLICATE_RULE` — A putaway rule already exists for this item-warehouse combination.
- `PUTAWAY_INSUFFICIENT_CAPACITY` — Putaway capacity must be greater than the current stock in the warehouse.

## Connects to

- **stock-entry-movements** *(required)* — Stock entries are the primary source of bin quantity changes
- **serial-batch-tracking** *(recommended)* — Serial and batch tracking integrates with warehouse stock positions

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/inventory/warehouse-bin-management/) · **Spec source:** [`warehouse-bin-management.blueprint.yaml`](./warehouse-bin-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
