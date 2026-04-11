<!-- AUTO-GENERATED FROM bulk-operations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bulk Operations

> Batch update, delete, and export operations for large record sets with progress tracking, atomic or best-effort execution, and error logging.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** bulk · batch-processing · mass-update · mass-delete · data-export · background-jobs · progress-tracking

## What this does

Batch update, delete, and export operations for large record sets with progress tracking, atomic or best-effort execution, and error logging.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **operation_id** *(text, required)* — Operation ID
- **operation_type** *(select, required)* — Operation Type
- **entity_type** *(text, required)* — Entity Type
- **selection_mode** *(select, required)* — Selection Mode
- **selected_ids** *(json, optional)* — Selected Record IDs
- **filter_criteria** *(json, optional)* — Filter Criteria
- **changes** *(json, optional)* — Changes to Apply
- **execution_mode** *(select, required)* — Execution Mode
- **status** *(select, required)* — Status
- **total_count** *(number, required)* — Total Records
- **processed_count** *(number, optional)* — Processed Records
- **success_count** *(number, optional)* — Successful Records
- **error_count** *(number, optional)* — Failed Records
- **error_log** *(json, optional)* — Error Log
- **confirmed_by** *(text, optional)* — Confirmed By
- **confirmed_at** *(datetime, optional)* — Confirmed At

## What must be true

- **max_batch_size:** A single bulk operation may process a maximum of 10,000 records. Requests exceeding this limit must be rejected with an error suggesting the user split the operation into smaller batches.
- **background_processing_with_progress:** All bulk operations must run in background jobs. The system provides real-time progress updates (processed_count, error_count) that clients can poll or receive via server-sent events.
- **atomic_or_best_effort:** In atomic mode, all changes are wrapped in a transaction and rolled back if any record fails. In best-effort mode, failures are logged and processing continues with remaining records.
- **confirmation_for_destructive_operations:** Delete and archive operations require explicit confirmation before execution. The system presents a summary (record count, affected entities) and requires the operator to confirm the action.
- **changes_required_for_updates:** Bulk update operations must include a non-empty changes object specifying which fields to modify and their new values.
- **selection_required:** Either selected_ids (for explicit selection) or filter_criteria (for dynamic selection) must be provided. Both cannot be empty.
- **error_log_retention:** Error logs for failed records must include the record ID, error code, and error message. Logs are retained for 30 days after operation completion.

## Success & failure scenarios

**✅ Success paths**

- **Bulk Update Executed** — when operation_type eq "update"; records are selected by IDs or filter criteria; changes exists; total_count lte 10000, then All selected records updated with specified changes.
- **Bulk Delete Confirmed** — when operation_type in ["delete","archive"]; records are selected by IDs or filter criteria, then Destructive operation awaits explicit confirmation before execution.
- **Bulk Delete Executed** — when operation_type in ["delete","archive"]; status eq "confirmed", then Selected records deleted or archived after confirmation.
- **Bulk Export Executed** — when operation_type eq "export"; records are selected by IDs or filter criteria, then Selected records exported to downloadable file.
- **Operation Completed With Errors** — when execution_mode eq "best_effort"; one or more records fail during processing, then Operation completes but with partial failures logged in error log.
- **Operation Cancelled** — when operator cancels the operation while it is processing, then Operation cancelled; already-processed records are not rolled back in best-effort mode.

**❌ Failure paths**

- **Atomic Operation Rolled Back** — when execution_mode eq "atomic"; any record fails during processing, then Entire operation rolled back due to failure in atomic mode. *(error: `BULK_ATOMIC_ROLLBACK`)*
- **Batch Size Exceeded** — when total_count gt 10000, then Operation rejected because record count exceeds maximum batch size. *(error: `BULK_SIZE_EXCEEDED`)*

## Errors it can return

- `BULK_SIZE_EXCEEDED` — Batch size exceeds the maximum of 10,000 records. Split into smaller operations.
- `BULK_ATOMIC_ROLLBACK` — Atomic operation rolled back due to a failure. No records were modified.
- `BULK_NO_SELECTION` — No records selected. Provide either record IDs or filter criteria.
- `BULK_MISSING_CHANGES` — Bulk update requires a non-empty changes object specifying fields to modify.
- `BULK_CONFIRMATION_REQUIRED` — Destructive operation requires explicit confirmation before execution.
- `BULK_OPERATION_NOT_FOUND` — The specified bulk operation ID does not exist.
- `BULK_ENTITY_TYPE_INVALID` — The specified entity type does not exist or does not support bulk operations.

## Connects to

- **task-management** *(recommended)* — Bulk operations run as background tasks with progress tracking
- **data-table** *(recommended)* — Data tables provide the UI for selecting records and initiating bulk operations
- **report-generation** *(optional)* — Bulk export operations may use report templates for formatted output
- **automation-rules** *(optional)* — Automation rules can trigger bulk operations based on events

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/bulk-operations/) · **Spec source:** [`bulk-operations.blueprint.yaml`](./bulk-operations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
