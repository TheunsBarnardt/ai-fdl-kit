---
title: "Broker General Maintenance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office general maintenance covering user-specific master records, online and batch print control, end-user reporting, instrument information, remote printe"
---

# Broker General Maintenance Blueprint

> Back-office general maintenance covering user-specific master records, online and batch print control, end-user reporting, instrument information, remote printer maintenance, report request...

| | |
|---|---|
| **Feature** | `broker-general-maintenance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, general-maintenance, reporting, printing, instruments, reference-data, tables |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-general-maintenance.blueprint.yaml) |
| **JSON API** | [broker-general-maintenance.json]({{ site.baseurl }}/api/blueprints/trading/broker-general-maintenance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `report_user` | End-User Report Requester | human |  |
| `printer_administrator` | Remote Printer Administrator | human |  |
| `reference_data_steward` | Reference Data Steward | human |  |
| `back_office_system` | Back-Office System | system |  |
| `batch_scheduler` | Overnight Batch Scheduler | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes | User Identifier |  |
| `broker_code` | text | Yes | Broker Firm Code |  |
| `option_code` | text | Yes | Menu Option Code |  |
| `print_job_id` | text | No | Print Job Identifier |  |
| `print_job_type` | select | No | Print Job Type |  |
| `print_job_status` | select | No | Print Job Status |  |
| `print_class` | text | No | Printer Class |  |
| `printer_id` | text | No | Remote Printer Identifier |  |
| `printer_location` | text | No | Printer Location |  |
| `report_code` | text | No | End-User Report Code |  |
| `report_parameters` | json | No | Report Parameters |  |
| `report_request_status` | select | No | Report Request Status |  |
| `requested_at` | datetime | No | Request Submitted Time |  |
| `output_destination` | select | No | Output Destination |  |
| `instrument_code` | text | No | Instrument Code |  |
| `instrument_name` | text | No | Instrument Full Name |  |
| `instrument_type` | select | No | Instrument Type |  |
| `is_quoted` | boolean | No | Listed / Quoted Flag |  |
| `isin_code` | text | No | ISIN Code |  |
| `nominal_value` | number | No | Nominal Value |  |
| `instrument_status` | select | No | Instrument Status |  |
| `table_code` | text | No | User Table Code |  |
| `table_row_key` | text | No | User Table Row Key |  |
| `table_row_value` | text | No | User Table Row Value |  |
| `effective_from` | date | No | Effective From Date |  |
| `effective_to` | date | No | Effective To Date |  |

## States

**State field:** `print_job_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `queued` | Yes |  |
| `printing` |  |  |
| `completed` |  | Yes |
| `cancelled` |  | Yes |
| `reinstated` |  |  |

## Rules

- **data_integrity:**
  - **option_scoping:** Every menu option is scoped to a broker firm and user; cross-broker data leakage is forbidden
  - **instrument_uniqueness:** Instrument code must be unique within the broker firm; ISIN captured where available
  - **table_row_uniqueness:** User table rows are keyed by (broker_code, table_code, table_row_key); duplicates rejected
  - **referential_integrity:** Instruments referenced by open positions or historical deals cannot be deleted
  - **effective_dating:** Reference table rows support effective-from and effective-to dates; overlapping ranges are blocked
  - **audit_trail:** All maintenance changes logged with user, timestamp, old/new values; retained for at least 36 months
- **security:**
  - **access_control:** Access to each menu option gated by resource access control facility; per-option and per-field view/update rights
  - **print_segregation:** Print job cancellation and reinstatement restricted to authorised operators; self-service reprint must not expose other users' reports
  - **printer_class_restriction:** End-users may only send output to printer classes their profile is authorised for
  - **report_parameter_validation:** All end-user report parameters validated against a schema; free-form SQL or expression injection is forbidden
- **compliance:**
  - **popia_personal_information:** Reports that materialise personal information must enforce POPIA lawful-basis and minimisation rules
  - **popia_output_channel:** Output destinations holding personal information must be access-controlled and auditable
  - **recordkeeping:** Report requests, parameters, and output recipients logged for regulatory recordkeeping
- **business:**
  - **online_batch_split:** Schedules and delivery dockets may be produced either online or in the overnight batch; users choose per request
  - **job_lifecycle:** Print jobs may be cancelled before the batch window and reinstated while still queued
  - **unquoted_instruments:** Broker may capture unquoted instruments locally; quoted instruments are sourced from market data reference
  - **special_tables:** A subset of tables is system-maintained (special tables); user tables are broker-maintained
  - **remote_printers:** Printers are grouped by class; routing is by class not by physical device
  - **report_request_loading:** End-user reports are submitted as parameterised requests that execute in a controlled process queue

## Outcomes

### Request_online_or_batch_print (Priority: 1) | Transaction: atomic

_Operator submits a schedule or delivery docket request for online or overnight batch print_

**Given:**
- `print_job_type` (input) in `schedule,delivery_docket,deed`
- `user_authorised_for_option` (db) eq `true`

**Then:**
- **create_record**
- **set_field** target: `print_job_status` value: `queued`
- **emit_event** event: `print_job.requested`

### Cancel_queued_print_job (Priority: 2) | Transaction: atomic

_Operator cancels a queued print job before the batch window closes_

**Given:**
- `print_job_status` (db) eq `queued`

**Then:**
- **transition_state** field: `print_job_status` from: `queued` to: `cancelled`
- **emit_event** event: `print_job.cancelled`

### Reject_invalid_print_job_state (Priority: 3) — Error: `GM_PRINT_JOB_INVALID_STATE`

_Prevent cancel or reinstate actions on completed jobs_

**Given:**
- `print_job_status` (db) in `completed,cancelled`

**Then:**
- **emit_event** event: `print_job.cancelled`

### Submit_end_user_report_request (Priority: 4) | Transaction: atomic

_End-user submits a parameterised report request through the report request loader_

**Given:**
- `report_code` (input) exists
- `report_parameters_valid` (computed) eq `true`
- `destination_authorised` (computed) eq `true`

**Then:**
- **create_record**
- **set_field** target: `report_request_status` value: `queued`
- **emit_event** event: `report_request.submitted`

### Reject_unauthorised_report_destination (Priority: 5) — Error: `GM_REPORT_UNAUTHORISED_DESTINATION`

_Block report output routed to a destination the user is not permitted to use_

**Given:**
- `destination_authorised` (computed) eq `false`

**Then:**
- **emit_event** event: `report_request.submitted`

### Load_unquoted_instrument (Priority: 6) | Transaction: atomic

_Reference data steward loads a locally-captured unquoted instrument_

**Given:**
- `user_role` (session) eq `reference_data_steward`
- `is_quoted` (input) eq `false`
- `instrument_code` (db) not_exists

**Then:**
- **create_record**
- **emit_event** event: `instrument.created`

### Reject_duplicate_instrument (Priority: 7) — Error: `GM_INSTRUMENT_DUPLICATE`

_Prevent a duplicate instrument code within the broker firm_

**Given:**
- `instrument_code` (db) exists

**Then:**
- **emit_event** event: `instrument.created`

### Block_instrument_deletion_with_history (Priority: 8) — Error: `GM_INSTRUMENT_DELETE_BLOCKED`

_Prevent deletion of instruments referenced by open positions or historical deals_

**Given:**
- `has_historical_activity` (db) eq `true`

**Then:**
- **emit_event** event: `instrument.deleted`

### Maintain_remote_printer (Priority: 9) | Transaction: atomic

_Printer administrator creates or updates a remote printer entry within a printer class_

**Given:**
- `user_role` (session) eq `printer_administrator`
- `print_class` (input) exists

**Then:**
- **set_field** target: `printer_id` value: `updated`
- **emit_event** event: `printer.updated`

### Upsert_user_table_row (Priority: 10) | Transaction: atomic

_Reference data steward upserts a row into a broker-maintained user table_

**Given:**
- `user_role` (session) eq `reference_data_steward`
- `effective_range_valid` (computed) eq `true`

**Then:**
- **set_field** target: `table_row_value` value: `updated`
- **emit_event** event: `table.row_upserted`

### Reject_overlapping_table_effective_dates (Priority: 11) — Error: `GM_TABLE_EFFECTIVE_OVERLAP`

_Block table row whose effective date range overlaps an existing row_

**Given:**
- `effective_range_overlap` (db) eq `true`

**Then:**
- **emit_event** event: `table.row_upserted`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GM_OPTION_FORBIDDEN` | 403 | User is not authorised for this menu option | No |
| `GM_PRINT_JOB_NOT_FOUND` | 404 | Print job not found or outside the reprint retention window | No |
| `GM_PRINT_JOB_INVALID_STATE` | 409 | Print job cannot be cancelled or reinstated in its current state | No |
| `GM_REPORT_PARAMETER_INVALID` | 400 | Report parameter failed validation | No |
| `GM_REPORT_UNAUTHORISED_DESTINATION` | 403 | Output destination is not permitted for this user | No |
| `GM_INSTRUMENT_DUPLICATE` | 409 | Instrument code already exists for this broker | No |
| `GM_INSTRUMENT_DELETE_BLOCKED` | 409 | Instrument cannot be deleted, referenced by positions or historical deals | No |
| `GM_TABLE_ROW_DUPLICATE` | 409 | Table row already exists for this broker, table, and key | No |
| `GM_TABLE_EFFECTIVE_OVERLAP` | 409 | Effective date range overlaps an existing row | No |
| `GM_PRINTER_CLASS_UNKNOWN` | 404 | Printer class is not defined for this broker | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `print_job.requested` |  | `print_job_id`, `print_job_type`, `broker_code`, `user_id`, `timestamp` |
| `print_job.cancelled` |  | `print_job_id`, `cancelled_by`, `timestamp` |
| `print_job.reinstated` |  | `print_job_id`, `reinstated_by`, `timestamp` |
| `report_request.submitted` |  | `report_code`, `report_parameters`, `user_id`, `requested_at` |
| `report_request.completed` |  | `report_code`, `user_id`, `output_destination`, `row_count`, `completed_at` |
| `instrument.created` |  | `instrument_code`, `instrument_type`, `broker_code`, `created_by`, `timestamp` |
| `instrument.updated` |  | `instrument_code`, `field_name`, `old_value`, `new_value`, `updated_by`, `timestamp` |
| `instrument.deleted` |  | `instrument_code`, `deleted_by`, `timestamp` |
| `printer.updated` |  | `printer_id`, `print_class`, `updated_by`, `timestamp` |
| `table.row_upserted` |  | `table_code`, `table_row_key`, `broker_code`, `updated_by`, `timestamp` |
| `table.row_deleted` |  | `table_code`, `table_row_key`, `broker_code`, `deleted_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | recommended |  |
| broker-back-office-dissemination | recommended |  |
| popia-compliance | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  MENUA: General Maintenance Menu
  AHDIN: Audit Trail New Account
  BCNTL: Online-Batch Print Control
  BROKM: Broker Maintenance
  BROKT: Broker Tax Information
  COMPR: Common Error Report Maintenance
  CSDPC: Change of Controlled Client CSDP Details
  CSDPN: Change of Proprietary CSDP Details
  CSDPV: Display of Unverified CSDP Details
  GLIGR: Inspectorate GL Maintenance
  INSTM: Instruments
  MOD10: Check Digits Modulus 10
  RPROC: Browse Process Requests and Report Request Loading
  ODQRY: End-User Reporting
  PRMNT: Remote Printer Maintenance
  REPRT: Mark Tags For Reprinting
  TRMNT: Pay Transfer Instructions
  TSECM: Transfer Secretaries
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker General Maintenance Blueprint",
  "description": "Back-office general maintenance covering user-specific master records, online and batch print control, end-user reporting, instrument information, remote printe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, general-maintenance, reporting, printing, instruments, reference-data, tables"
}
</script>
