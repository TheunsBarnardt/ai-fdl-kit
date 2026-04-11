<!-- AUTO-GENERATED FROM production-planning.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Production Planning

> Production planning tool that consolidates demand from sales orders and material requests, explodes multi-level BOMs, and generates work orders and procurement requests for manufacturing.

**Category:** Manufacturing · **Version:** 1.0.0 · **Tags:** production-planning · mrp · demand-planning · manufacturing · material-requirements

## What this does

Production planning tool that consolidates demand from sales orders and material requests, explodes multi-level BOMs, and generates work orders and procurement requests for manufacturing.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **company** *(text, required)* — Company
- **posting_date** *(date, required)* — Posting Date
- **get_items_from** *(select, required)* — Get Items From
- **pp_status** *(select, required)* — Status
- **sales_orders** *(json, optional)* — Sales Orders
- **material_requests** *(json, optional)* — Material Requests
- **po_items** *(json, optional)* — Items to Manufacture
- **sub_assembly_items** *(json, optional)* — Sub-Assembly Items
- **mr_items** *(json, optional)* — Items to Procure
- **combine_items** *(boolean, optional)* — Combine Items
- **combine_sub_items** *(boolean, optional)* — Combine Sub-Assembly Items
- **include_non_stock_items** *(boolean, optional)* — Include Non-Stock Items
- **consider_minimum_order_qty** *(boolean, optional)* — Consider Minimum Order Quantity
- **include_safety_stock** *(boolean, optional)* — Include Safety Stock
- **total_planned_qty** *(number, optional)* — Total Planned Quantity
- **total_produced_qty** *(number, optional)* — Total Produced Quantity
- **reserve_stock** *(boolean, optional)* — Reserve Stock

## What must be true

- **fetch_demand_sources:** Items are fetched from either sales orders or material requests based on user selection, with configurable filters for date range, item group, customer, and warehouse.
- **combine_duplicate_items:** When combine_items is enabled, duplicate items across multiple demand sources are consolidated by item code, summing their quantities into a single planned row.
- **multi_level_bom_explosion:** The system explodes multi-level BOMs to identify sub-assembly items that must be manufactured before the final product. Each sub-assembly is listed with its own BOM and required quantity.
- **sub_assembly_sourcing:** Sub-assemblies can be sourced via in-house manufacturing (creating work orders) or subcontracting (creating purchase orders to external suppliers), configured per sub-assembly item.
- **material_request_planning:** For items that need procurement, the system calculates required quantities considering existing stock, ordered quantities, and reserved quantities, unless the user overrides with actual quantities.
- **safety_stock_inclusion:** When include_safety_stock is enabled, the safety stock quantity defined on each item is added to the procurement requirement to maintain minimum inventory levels.
- **work_order_creation:** Work orders are created from planned items with BOM, warehouse, and quantity populated automatically. One work order per planned item row.

## Success & failure scenarios

**✅ Success paths**

- **Fetch Material Requests** — when get_items_from eq "material_request"; user applies filters for date range or item group, then Material requests matching the filter criteria are loaded into the plan.
- **Get Sub Assembly Items** — when items to manufacture are populated; at least one item has a multi-level BOM, then Sub-assembly items identified with manufacturing or subcontracting sourcing.
- **Create Work Orders** — when pp_status in ["not_started","in_process"]; po_items table has at least one row, then Work orders created for all planned manufacturing items.
- **Create Material Requests** — when pp_status in ["not_started","in_process"]; mr_items table has at least one row, then Material requests created per warehouse for all procurement items.
- **Create Subcontracted Purchase Orders** — when sub_assembly_items has items with subcontracting sourcing type, then Subcontracted purchase orders created for outsourced sub-assemblies.

**❌ Failure paths**

- **Fetch Sales Orders** — when get_items_from eq "sales_order"; user applies filters for date range, customer, or item group, then Sales orders matching the filter criteria are loaded into the plan. *(error: `PP_INVALID_SALES_ORDER`)*
- **Get Items To Manufacture** — when demand sources (sales orders or material requests) are populated, then Items to manufacture are extracted and consolidated from demand sources. *(error: `PP_NO_BOM_FOR_ITEM`)*

## Errors it can return

- `PP_NO_BOM_FOR_ITEM` — No active BOM found for one or more items. Create and submit a BOM before planning production.
- `PP_INVALID_SALES_ORDER` — One or more selected sales orders are not in a valid state for production planning.
- `PP_NO_PENDING_ITEMS` — No pending items found matching the selected filters. Adjust filters and try again.

## Connects to

- **bill-of-materials** *(required)* — Production planning requires BOMs to explode material requirements
- **work-orders-job-cards** *(required)* — Work orders are the primary output of production planning
- **sales-order-lifecycle** *(recommended)* — Sales orders are a primary demand source for production planning
- **purchase-order-lifecycle** *(recommended)* — Purchase orders are created for procurement items and subcontracting
- **subcontracting** *(optional)* — Sub-assemblies can be outsourced via subcontracting orders

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+3** since baseline (76 → 79)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/manufacturing/production-planning/) · **Spec source:** [`production-planning.blueprint.yaml`](./production-planning.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
