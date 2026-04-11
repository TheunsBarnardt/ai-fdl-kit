<!-- AUTO-GENERATED FROM data-import-export.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Data Import Export

> Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling

**Category:** Data · **Version:** 1.0.0 · **Tags:** import · export · csv · excel · json · bulk-data · etl · background-processing

## What this does

Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **file** *(file, required)* — Import File
- **format** *(select, required)* — File Format
- **mapping** *(json, optional)* — Column-to-Field Mapping
- **on_error** *(select, optional)* — Error Handling Strategy
- **status** *(select, required)* — Job Status
- **error_log** *(json, optional)* — Error Log
- **row_count** *(number, optional)* — Total Row Count
- **success_count** *(number, optional)* — Successfully Processed Rows
- **failure_count** *(number, optional)* — Failed Rows
- **export_format** *(select, optional)* — Export Format
- **export_filters** *(json, optional)* — Export Filters
- **download_url** *(url, optional)* — Export Download URL

## What must be true

- **import → max_file_size_bytes:** 52428800
- **import → max_rows:** 100000
- **import → background_threshold_rows:** 1000
- **import → validate_before_insert:** true
- **import → duplicate_detection:** configurable
- **import → supported_encodings:** utf-8, utf-16, latin-1
- **column_mapping → auto_detect:** true
- **column_mapping → case_insensitive:** true
- **column_mapping → unmapped_columns:** ignore
- **export → max_records:** 500000
- **export → streaming:** true
- **export → download_url_expiry_hours:** 24
- **error_handling → skip_mode:** log_and_continue
- **error_handling → fail_mode:** abort_and_rollback
- **error_handling → error_log_max_entries:** 10000

## Success & failure scenarios

**✅ Success paths**

- **Import Completed** — when a valid import file is uploaded; all rows pass validation, then All rows imported successfully; status set to completed.
- **Import Partial** — when a valid import file is uploaded; some rows fail validation; on_error strategy is 'skip', then Valid rows imported; failed rows logged in error_log; status set to partial.
- **Export Completed** — when an export request is submitted with valid parameters; records matching the filters exist, then Export file generated and download URL returned.

**❌ Failure paths**

- **Import Failed** — when the file is corrupted or in an unsupported format OR a row fails validation and on_error strategy is 'fail', then Import aborted; all changes rolled back; error details provided. *(error: `IMPORT_FAILED`)*
- **Import File Too Large** — when Uploaded file exceeds 50 MB limit, then Error returned indicating file size limit. *(error: `IMPORT_FILE_TOO_LARGE`)*

## Errors it can return

- `IMPORT_FAILED` — Import failed; check error log for details
- `IMPORT_FILE_TOO_LARGE` — Import file exceeds the maximum allowed size of 50 MB
- `IMPORT_INVALID_FORMAT` — File format is not supported or file is corrupted
- `IMPORT_MAPPING_INVALID` — Column mapping references fields that do not exist
- `EXPORT_NO_RECORDS` — No records match the export filters

## Connects to

- **file-storage** *(required)* — Import files and export outputs are stored in cloud storage
- **pagination** *(optional)* — Export may paginate through large datasets during generation
- **audit-trail** *(recommended)* — Import and export operations should be recorded for compliance

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/data-import-export/) · **Spec source:** [`data-import-export.blueprint.yaml`](./data-import-export.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
