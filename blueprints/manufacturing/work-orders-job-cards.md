<!-- AUTO-GENERATED FROM work-orders-job-cards.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Work Orders Job Cards

> Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and production completion.

**Category:** Manufacturing · **Version:** 1.0.0 · **Tags:** work-order · job-card · production · manufacturing · shop-floor · time-tracking

## What this does

Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and production completion.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **production_item** *(text, required)* — Item to Manufacture
- **bom_no** *(text, required)* — BOM Number
- **qty** *(number, required)* — Quantity to Manufacture
- **wo_status** *(select, required)* — Work Order Status
- **planned_start_date** *(datetime, required)* — Planned Start Date
- **actual_start_date** *(datetime, optional)* — Actual Start Date
- **actual_end_date** *(datetime, optional)* — Actual End Date
- **required_items** *(json, optional)* — Required Items
- **wo_operations** *(json, optional)* — Work Order Operations
- **source_warehouse** *(text, required)* — Source Warehouse
- **fg_warehouse** *(text, required)* — Finished Goods Warehouse
- **wip_warehouse** *(text, required)* — Work-in-Progress Warehouse
- **produced_qty** *(number, optional)* — Produced Quantity
- **material_transferred_for_manufacturing** *(number, optional)* — Material Transferred
- **skip_transfer** *(boolean, optional)* — Skip Material Transfer
- **reserve_stock** *(boolean, optional)* — Reserve Stock
- **use_multi_level_bom** *(boolean, optional)* — Use Multi-Level BOM
- **planned_operating_cost** *(number, optional)* — Planned Operating Cost
- **actual_operating_cost** *(number, optional)* — Actual Operating Cost
- **work_order** *(text, required)* — Work Order Reference
- **operation** *(text, required)* — Operation
- **for_quantity** *(number, required)* — For Quantity
- **jc_status** *(select, required)* — Job Card Status
- **time_logs** *(json, optional)* — Time Logs
- **manufactured_qty** *(number, optional)* — Manufactured Quantity
- **workstation** *(text, required)* — Workstation
- **hour_rate** *(number, optional)* — Hour Rate
- **total_time_in_mins** *(number, optional)* — Total Time (Minutes)
- **jc_items** *(json, optional)* — Consumed Materials

## What must be true

- **bom_must_be_active:** Work order can only be submitted if the referenced BOM is in submitted status and marked as active. Draft or cancelled BOMs are rejected.
- **overproduction_limit:** Produced quantity cannot exceed the ordered quantity plus the configured overproduction tolerance percentage. Excess production is rejected.
- **job_cards_auto_created:** When a work order with operations is submitted, job cards are automatically created for each operation defined in the BOM.
- **time_log_no_overlap:** Time logs on the same workstation cannot overlap. The system validates from_time and to_time against existing logs for the workstation.
- **sequential_operations:** When operations are marked as sequential, each operation's job card can only start after the previous operation's job card is completed.
- **material_transfer_required:** Raw materials must be transferred from source warehouse to WIP warehouse before manufacturing can begin, unless skip_transfer is enabled on the work order.
- **quality_inspection_required:** If the BOM specifies inspection_required, a quality inspection record must be created and approved before the work order can be completed.
- **no_cancel_with_production:** A work order with produced_qty greater than zero cannot be cancelled. It must be stopped or closed instead.

## Success & failure scenarios

**✅ Success paths**

- **Create Work Order** — when user provides production item, BOM, quantity, and warehouse details, then Work order is created in draft with materials populated from BOM.
- **Create Job Card** — when work order is submitted with operations; operation has a workstation and time defined, then Job card is created and linked to the work order operation.
- **Transfer Material** — when wo_status in ["not_started","in_process"]; skip_transfer eq false, then Raw materials transferred from source warehouse to WIP warehouse.
- **Stop Production** — when wo_status eq "in_process", then Production is halted; work order can be resumed or closed later.

**❌ Failure paths**

- **Submit Work Order** — when wo_status eq "draft"; bom_no exists; referenced BOM is submitted and active, then Work order is submitted with job cards created for each operation. *(error: `WO_BOM_INVALID`)*
- **Log Time** — when jc_status in ["open","work_in_progress"]; time log from_time and to_time do not overlap with existing logs on the workstation, then Time log is recorded and job card status updated to work in progress. *(error: `JC_TIME_OVERLAP`)*
- **Complete Manufacturing** — when wo_status eq "in_process"; all job cards are completed; produced_qty meets ordered qty, then Work order completed, finished goods moved to target warehouse. *(error: `WO_OVERPRODUCTION`)*

## Errors it can return

- `WO_BOM_INVALID` — Referenced BOM must be submitted and active before the work order can proceed.
- `WO_OVERPRODUCTION` — Produced quantity exceeds the allowed limit (order quantity plus overproduction tolerance).
- `WO_CANCEL_WITH_PRODUCTION` — Cannot cancel a work order that has already produced items. Stop or close it instead.
- `JC_TIME_OVERLAP` — Time log overlaps with an existing entry on the same workstation.
- `JC_SEQUENCE_VIOLATION` — Previous operation must be completed before starting this sequential operation.
- `JC_INSPECTION_REQUIRED` — Quality inspection must be completed and approved before finishing this job card.

## Connects to

- **bill-of-materials** *(required)* — Work orders consume BOMs to determine materials and operations
- **stock-entry-movements** *(required)* — Material transfers and manufacture entries use stock entry documents
- **production-planning** *(recommended)* — Production planning auto-creates work orders from planned items
- **quality-inspection** *(optional)* — Quality inspections validate manufactured goods before completion

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/manufacturing/work-orders-job-cards/) · **Spec source:** [`work-orders-job-cards.blueprint.yaml`](./work-orders-job-cards.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
