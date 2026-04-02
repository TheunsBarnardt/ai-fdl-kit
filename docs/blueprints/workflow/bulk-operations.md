---
title: "Bulk Operations Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Batch update, delete, and export operations for large record sets with progress tracking, atomic or best-effort execution, and error logging. . 16 fields. 8 out"
---

# Bulk Operations Blueprint

> Batch update, delete, and export operations for large record sets with progress tracking, atomic or best-effort execution, and error logging.


| | |
|---|---|
| **Feature** | `bulk-operations` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | bulk, batch-processing, mass-update, mass-delete, data-export, background-jobs, progress-tracking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/bulk-operations.blueprint.yaml) |
| **JSON API** | [bulk-operations.json]({{ site.baseurl }}/api/blueprints/workflow/bulk-operations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `operator` | Operator | human | Initiates bulk operations and monitors progress |
| `batch_processor` | Batch Processor | system | Executes bulk operations in background with progress reporting |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `operation_id` | text | Yes | Operation ID | Validations: pattern |
| `operation_type` | select | Yes | Operation Type |  |
| `entity_type` | text | Yes | Entity Type |  |
| `selection_mode` | select | Yes | Selection Mode |  |
| `selected_ids` | json | No | Selected Record IDs |  |
| `filter_criteria` | json | No | Filter Criteria |  |
| `changes` | json | No | Changes to Apply |  |
| `execution_mode` | select | Yes | Execution Mode |  |
| `status` | select | Yes | Status |  |
| `total_count` | number | Yes | Total Records | Validations: min, max |
| `processed_count` | number | No | Processed Records | Validations: min |
| `success_count` | number | No | Successful Records | Validations: min |
| `error_count` | number | No | Failed Records | Validations: min |
| `error_log` | json | No | Error Log |  |
| `confirmed_by` | text | No | Confirmed By |  |
| `confirmed_at` | datetime | No | Confirmed At |  |

## Rules

- **max_batch_size:**
  - **description:** A single bulk operation may process a maximum of 10,000 records. Requests exceeding this limit must be rejected with an error suggesting the user split the operation into smaller batches.

- **background_processing_with_progress:**
  - **description:** All bulk operations must run in background jobs. The system provides real-time progress updates (processed_count, error_count) that clients can poll or receive via server-sent events.

- **atomic_or_best_effort:**
  - **description:** In atomic mode, all changes are wrapped in a transaction and rolled back if any record fails. In best-effort mode, failures are logged and processing continues with remaining records.

- **confirmation_for_destructive_operations:**
  - **description:** Delete and archive operations require explicit confirmation before execution. The system presents a summary (record count, affected entities) and requires the operator to confirm the action.

- **changes_required_for_updates:**
  - **description:** Bulk update operations must include a non-empty changes object specifying which fields to modify and their new values.

- **selection_required:**
  - **description:** Either selected_ids (for explicit selection) or filter_criteria (for dynamic selection) must be provided. Both cannot be empty.

- **error_log_retention:**
  - **description:** Error logs for failed records must include the record ID, error code, and error message. Logs are retained for 30 days after operation completion.


## Outcomes

### Bulk_update_executed (Priority: 1)

**Given:**
- `operation_type` (input) eq `update`
- records are selected by IDs or filter criteria
- `changes` (input) exists
- `total_count` (computed) lte `10000`

**Then:**
- **transition_state** field: `status` from: `confirmed` to: `processing`
- **call_service** target: `batch_processor` — Apply changes to each selected record with progress tracking
- **transition_state** field: `status` from: `processing` to: `completed`
- **emit_event** event: `bulk.operation.completed`

**Result:** All selected records updated with specified changes

### Bulk_delete_confirmed (Priority: 2)

**Given:**
- `operation_type` (input) in `delete,archive`
- records are selected by IDs or filter criteria

**Then:**
- **transition_state** field: `status` from: `pending_confirmation` to: `pending_confirmation` — Present confirmation dialog with record count and impact summary
- **emit_event** event: `bulk.confirmation.required`

**Result:** Destructive operation awaits explicit confirmation before execution

### Bulk_delete_executed (Priority: 3)

**Given:**
- `operation_type` (input) in `delete,archive`
- `status` (db) eq `confirmed`

**Then:**
- **transition_state** field: `status` from: `confirmed` to: `processing`
- **call_service** target: `batch_processor` — Delete or archive each selected record with progress tracking
- **transition_state** field: `status` from: `processing` to: `completed`
- **emit_event** event: `bulk.operation.completed`

**Result:** Selected records deleted or archived after confirmation

### Bulk_export_executed (Priority: 4)

**Given:**
- `operation_type` (input) eq `export`
- records are selected by IDs or filter criteria

**Then:**
- **transition_state** field: `status` from: `confirmed` to: `processing`
- **call_service** target: `batch_processor` — Export selected records to file with progress tracking
- **transition_state** field: `status` from: `processing` to: `completed`
- **emit_event** event: `bulk.export.completed`

**Result:** Selected records exported to downloadable file

### Operation_completed_with_errors (Priority: 5)

**Given:**
- `execution_mode` (input) eq `best_effort`
- one or more records fail during processing

**Then:**
- **transition_state** field: `status` from: `processing` to: `completed_with_errors`
- **set_field** target: `error_log` — Record ID, error code, and message for each failed record
- **emit_event** event: `bulk.operation.completed_with_errors`

**Result:** Operation completes but with partial failures logged in error log

### Atomic_operation_rolled_back (Priority: 6) — Error: `BULK_ATOMIC_ROLLBACK`

**Given:**
- `execution_mode` (input) eq `atomic`
- any record fails during processing

**Then:**
- **transition_state** field: `status` from: `processing` to: `failed`
- **set_field** target: `error_log` — Record the failure that caused the rollback
- **emit_event** event: `bulk.operation.rolled_back`

**Result:** Entire operation rolled back due to failure in atomic mode

### Batch_size_exceeded (Priority: 7) — Error: `BULK_SIZE_EXCEEDED`

**Given:**
- `total_count` (computed) gt `10000`

**Result:** Operation rejected because record count exceeds maximum batch size

### Operation_cancelled (Priority: 8)

**Given:**
- operator cancels the operation while it is processing

**Then:**
- **transition_state** field: `status` from: `processing` to: `cancelled`
- **emit_event** event: `bulk.operation.cancelled`

**Result:** Operation cancelled; already-processed records are not rolled back in best-effort mode

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BULK_SIZE_EXCEEDED` | 400 | Batch size exceeds the maximum of 10,000 records. Split into smaller operations. | No |
| `BULK_ATOMIC_ROLLBACK` | 500 | Atomic operation rolled back due to a failure. No records were modified. | No |
| `BULK_NO_SELECTION` | 400 | No records selected. Provide either record IDs or filter criteria. | No |
| `BULK_MISSING_CHANGES` | 400 | Bulk update requires a non-empty changes object specifying fields to modify. | No |
| `BULK_CONFIRMATION_REQUIRED` | 403 | Destructive operation requires explicit confirmation before execution. | No |
| `BULK_OPERATION_NOT_FOUND` | 404 | The specified bulk operation ID does not exist. | No |
| `BULK_ENTITY_TYPE_INVALID` | 400 | The specified entity type does not exist or does not support bulk operations. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bulk.operation.completed` | Bulk operation completed successfully | `operation_id`, `operation_type`, `total_count`, `success_count`, `error_count` |
| `bulk.operation.completed_with_errors` | Bulk operation completed in best-effort mode with some failures | `operation_id`, `total_count`, `success_count`, `error_count`, `error_log` |
| `bulk.operation.rolled_back` | Atomic bulk operation rolled back due to failure | `operation_id`, `operation_type`, `failed_record_id`, `error_details` |
| `bulk.operation.cancelled` | Bulk operation was cancelled by the operator | `operation_id`, `processed_count`, `total_count` |
| `bulk.confirmation.required` | Destructive bulk operation is awaiting confirmation | `operation_id`, `operation_type`, `total_count`, `entity_type` |
| `bulk.export.completed` | Bulk export operation completed with downloadable file | `operation_id`, `total_count`, `file_url` |
| `bulk.progress.updated` | Progress update during bulk operation processing | `operation_id`, `processed_count`, `total_count`, `error_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| task-management | recommended | Bulk operations run as background tasks with progress tracking |
| data-table | recommended | Data tables provide the UI for selecting records and initiating bulk operations |
| report-generation | optional | Bulk export operations may use report templates for formatted output |
| automation-rules | optional | Automation rules can trigger bulk operations based on events |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bulk Operations Blueprint",
  "description": "Batch update, delete, and export operations for large record sets with progress tracking, atomic or best-effort execution, and error logging.\n. 16 fields. 8 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bulk, batch-processing, mass-update, mass-delete, data-export, background-jobs, progress-tracking"
}
</script>
