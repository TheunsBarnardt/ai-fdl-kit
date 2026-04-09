---
title: "Data Import Export Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling."
---

# Data Import Export Blueprint

> Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling

| | |
|---|---|
| **Feature** | `data-import-export` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | import, export, csv, excel, json, bulk-data, etl, background-processing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/data-import-export.blueprint.yaml) |
| **JSON API** | [data-import-export.json]({{ site.baseurl }}/api/blueprints/data/data-import-export.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `file` | file | Yes | Import File | Validations: max |
| `format` | select | Yes | File Format |  |
| `mapping` | json | No | Column-to-Field Mapping |  |
| `on_error` | select | No | Error Handling Strategy |  |
| `status` | select | Yes | Job Status |  |
| `error_log` | json | No | Error Log |  |
| `row_count` | number | No | Total Row Count |  |
| `success_count` | number | No | Successfully Processed Rows |  |
| `failure_count` | number | No | Failed Rows |  |
| `export_format` | select | No | Export Format |  |
| `export_filters` | json | No | Export Filters |  |
| `download_url` | url | No | Export Download URL |  |

## Rules

- **import:**
  - **max_file_size_bytes:** 52428800
  - **max_rows:** 100000
  - **background_threshold_rows:** 1000
  - **validate_before_insert:** true
  - **duplicate_detection:** configurable
  - **supported_encodings:** utf-8, utf-16, latin-1
- **column_mapping:**
  - **auto_detect:** true
  - **case_insensitive:** true
  - **unmapped_columns:** ignore
- **export:**
  - **max_records:** 500000
  - **streaming:** true
  - **download_url_expiry_hours:** 24
- **error_handling:**
  - **skip_mode:** log_and_continue
  - **fail_mode:** abort_and_rollback
  - **error_log_max_entries:** 10000

## Outcomes

### Import_completed (Priority: 1)

**Given:**
- a valid import file is uploaded
- all rows pass validation

**Then:**
- **set_field** target: `status` value: `completed`
- **set_field** target: `success_count` — Set to total row count
- **emit_event** event: `import.completed`

**Result:** All rows imported successfully; status set to completed

### Import_partial (Priority: 2)

**Given:**
- a valid import file is uploaded
- some rows fail validation
- on_error strategy is 'skip'

**Then:**
- **set_field** target: `status` value: `partial`
- **set_field** target: `error_log` — Populate with details of each failed row
- **emit_event** event: `import.completed`

**Result:** Valid rows imported; failed rows logged in error_log; status set to partial

### Import_failed (Priority: 3) — Error: `IMPORT_FAILED`

**Given:**
- ANY: the file is corrupted or in an unsupported format OR a row fails validation and on_error strategy is 'fail'

**Then:**
- **set_field** target: `status` value: `failed`
- **set_field** target: `error_log` — Populate with failure details
- **emit_event** event: `import.failed`

**Result:** Import aborted; all changes rolled back; error details provided

### Export_completed (Priority: 4)

**Given:**
- an export request is submitted with valid parameters
- records matching the filters exist

**Then:**
- **set_field** target: `download_url` — Generate signed download URL for the exported file
- **emit_event** event: `export.completed`

**Result:** Export file generated and download URL returned

### Import_file_too_large (Priority: 10) — Error: `IMPORT_FILE_TOO_LARGE`

**Given:**
- `file` (input) gt `52428800`

**Result:** Error returned indicating file size limit

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IMPORT_FAILED` | 422 | Import failed; check error log for details | No |
| `IMPORT_FILE_TOO_LARGE` | 413 | Import file exceeds the maximum allowed size of 50 MB | No |
| `IMPORT_INVALID_FORMAT` | 400 | File format is not supported or file is corrupted | No |
| `IMPORT_MAPPING_INVALID` | 400 | Column mapping references fields that do not exist | No |
| `EXPORT_NO_RECORDS` | 404 | No records match the export filters | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `import.started` | An import job has been created and is queued for processing | `job_id`, `format`, `file_size_bytes`, `row_count` |
| `import.completed` | An import job finished processing (fully or partially) | `job_id`, `format`, `row_count`, `success_count`, `failure_count` |
| `import.failed` | An import job failed and was rolled back | `job_id`, `format`, `error_summary` |
| `export.completed` | An export job finished and the file is ready for download | `job_id`, `format`, `record_count`, `file_size_bytes` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| file-storage | required | Import files and export outputs are stored in cloud storage |
| pagination | optional | Export may paginate through large datasets during generation |
| audit-trail | recommended | Import and export operations should be recorded for compliance |

## AGI Readiness

### Goals

#### Reliable Data Import Export

Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `file_storage` | file-storage | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| import_completed | `autonomous` | - | - |
| import_partial | `autonomous` | - | - |
| import_failed | `autonomous` | - | - |
| export_completed | `autonomous` | - | - |
| import_file_too_large | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Data Import Export Blueprint",
  "description": "Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "import, export, csv, excel, json, bulk-data, etl, background-processing"
}
</script>
