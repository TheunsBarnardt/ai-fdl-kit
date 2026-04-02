---
title: "Data Table Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Sortable, filterable, paginated data table with column management, row selection, inline editing, bulk actions, and CSV export. 9 fields. 9 outcomes. 4 error co"
---

# Data Table Blueprint

> Sortable, filterable, paginated data table with column management, row selection, inline editing, bulk actions, and CSV export

| | |
|---|---|
| **Feature** | `data-table` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | table, data-grid, sorting, filtering, pagination, inline-editing, bulk-actions, export |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/data-table.blueprint.yaml) |
| **JSON API** | [data-table.json]({{ site.baseurl }}/api/blueprints/ui/data-table.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `columns` | json | Yes | Column Definitions | Validations: required |
| `data_source` | json | Yes | Data Source Configuration | Validations: required |
| `page_size` | number | No | Page Size | Validations: min, max |
| `current_page` | number | No | Current Page |  |
| `selected_rows` | json | No | Selected Row IDs |  |
| `sort_by` | text | No | Sort Column Key |  |
| `sort_order` | select | No | Sort Order |  |
| `filters` | json | No | Active Filters |  |
| `selection_mode` | select | No | Selection Mode |  |

## Rules

- **columns:**
  - **max_columns:** 50
  - **resizable:** true
  - **reorderable:** true
  - **min_width_px:** 50
- **performance:**
  - **virtual_scrolling_threshold:** 1000
  - **debounce_filter_ms:** 300
  - **debounce_search_ms:** 300
- **persistence:**
  - **column_preferences_per_user:** true
  - **filter_state_in_url:** true
  - **storage:** localStorage
- **pagination:**
  - **server_side:** true
  - **page_size_options:** 10, 25, 50, 100
  - **show_total_count:** true
- **export:**
  - **formats:** csv
  - **max_export_rows:** 10000
  - **include_filtered_only:** true

## Outcomes

### Table_rendered (Priority: 1)

**Given:**
- column definitions are provided
- data source is configured and returns data

**Then:**
- **set_field** target: `current_page` value: `1` — Initialize to first page
- **emit_event** event: `table.rendered`

**Result:** Data table displays with columns, rows, and pagination controls

### Column_sorted (Priority: 2)

**Given:**
- user clicks a sortable column header

**Then:**
- **set_field** target: `sort_by` — Set sort column to clicked column key
- **set_field** target: `sort_order` — Toggle between asc and desc, or set to asc for new column
- **set_field** target: `current_page` value: `1` — Reset to first page on sort change
- **emit_event** event: `table.sorted`

**Result:** Table re-renders with data sorted by the selected column

### Filter_applied (Priority: 3)

**Given:**
- user enters a filter value on a filterable column
- filter debounce period (300ms) has elapsed

**Then:**
- **set_field** target: `filters` — Add or update filter for the column
- **set_field** target: `current_page` value: `1` — Reset to first page on filter change
- **emit_event** event: `table.filtered`

**Result:** Table displays only rows matching the filter criteria

### Row_selected (Priority: 4)

**Given:**
- selection mode is single or multi
- user clicks a row or selection checkbox

**Then:**
- **set_field** target: `selected_rows` — Add or remove row ID from selection array
- **emit_event** event: `table.row_selected`

**Result:** Row visually highlighted, selection state updated

### Bulk_action_executed (Priority: 5)

**Given:**
- one or more rows are selected
- user triggers a bulk action (delete, export, status change)

**Then:**
- **call_service** target: `bulk_action_handler` — Execute the selected action on all selected rows
- **set_field** target: `selected_rows` — Clear selection after action completes
- **emit_event** event: `table.bulk_action`

**Result:** Bulk action applied to all selected rows, selection cleared

### Inline_edit_saved (Priority: 6)

**Given:**
- user double-clicks an editable cell
- user modifies the value and confirms (Enter or blur)
- new value passes column validation

**Then:**
- **set_field** target: `data_source` — Update the cell value in the data source
- **emit_event** event: `table.cell_edited`

**Result:** Cell value updated, row refreshed

### Inline_edit_invalid (Priority: 7) — Error: `TABLE_CELL_VALIDATION_FAILED`

**Given:**
- user modifies a cell value
- new value fails column validation rules

**Then:**
- **emit_event** event: `table.cell_edit_failed`

**Result:** Validation error shown inline, cell reverts to original value

### Export_completed (Priority: 8)

**Given:**
- user triggers CSV export
- total exportable rows are within the 10000 limit

**Then:**
- **call_service** target: `export_handler` — Generate CSV from visible columns and filtered data
- **emit_event** event: `table.exported`

**Result:** CSV file downloaded to the user's device

### Export_too_large (Priority: 9) — Error: `TABLE_EXPORT_TOO_LARGE`

**Given:**
- `total_rows` (computed) gt `10000`

**Then:**
- **emit_event** event: `table.export_failed`

**Result:** User informed to apply filters to reduce the data set before exporting

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TABLE_CELL_VALIDATION_FAILED` | 422 | The entered value is not valid for this column | Yes |
| `TABLE_EXPORT_TOO_LARGE` | 400 | Too many rows to export. Please apply filters to reduce the data set. | Yes |
| `TABLE_DATA_SOURCE_ERROR` | 500 | Failed to load table data from the data source | Yes |
| `TABLE_COLUMN_NOT_SORTABLE` | 400 | This column does not support sorting | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `table.rendered` | Data table rendered with initial data | `total_rows`, `page_size`, `column_count` |
| `table.sorted` | Table data sorted by a column | `sort_by`, `sort_order` |
| `table.filtered` | Table data filtered | `filters`, `result_count` |
| `table.row_selected` | A row was selected or deselected | `row_id`, `selected_rows`, `selection_count` |
| `table.bulk_action` | A bulk action was executed on selected rows | `action_type`, `affected_row_ids`, `result` |
| `table.cell_edited` | A cell value was edited inline | `row_id`, `column_key`, `old_value`, `new_value` |
| `table.cell_edit_failed` | An inline cell edit failed validation | `row_id`, `column_key`, `value`, `error` |
| `table.exported` | Table data was exported | `format`, `row_count`, `column_count` |
| `table.export_failed` | Table export failed due to row limit | `total_rows`, `max_allowed` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pagination | required | Data tables require pagination for large data sets |
| search-and-filtering | recommended | Server-side filtering integrates with the search and filtering feature |
| accessibility | recommended | Tables must be keyboard navigable and screen reader compatible |
| internationalization | optional | Column headers, filter labels, and pagination text may need translation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Data Table Blueprint",
  "description": "Sortable, filterable, paginated data table with column management, row selection, inline editing, bulk actions, and CSV export. 9 fields. 9 outcomes. 4 error co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "table, data-grid, sorting, filtering, pagination, inline-editing, bulk-actions, export"
}
</script>
