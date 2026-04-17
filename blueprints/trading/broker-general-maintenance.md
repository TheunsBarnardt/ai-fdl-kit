<!-- AUTO-GENERATED FROM broker-general-maintenance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker General Maintenance

> Back-office general maintenance covering user-specific master records, online and batch print control, end-user reporting, instrument information, remote printer maintenance, report request...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · general-maintenance · reporting · printing · instruments · reference-data · tables

## What this does

Back-office general maintenance covering user-specific master records, online and batch print control, end-user reporting, instrument information, remote printer maintenance, report request...

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(text, required)* — User Identifier
- **broker_code** *(text, required)* — Broker Firm Code
- **option_code** *(text, required)* — Menu Option Code
- **print_job_id** *(text, optional)* — Print Job Identifier
- **print_job_type** *(select, optional)* — Print Job Type
- **print_job_status** *(select, optional)* — Print Job Status
- **print_class** *(text, optional)* — Printer Class
- **printer_id** *(text, optional)* — Remote Printer Identifier
- **printer_location** *(text, optional)* — Printer Location
- **report_code** *(text, optional)* — End-User Report Code
- **report_parameters** *(json, optional)* — Report Parameters
- **report_request_status** *(select, optional)* — Report Request Status
- **requested_at** *(datetime, optional)* — Request Submitted Time
- **output_destination** *(select, optional)* — Output Destination
- **instrument_code** *(text, optional)* — Instrument Code
- **instrument_name** *(text, optional)* — Instrument Full Name
- **instrument_type** *(select, optional)* — Instrument Type
- **is_quoted** *(boolean, optional)* — Listed / Quoted Flag
- **isin_code** *(text, optional)* — ISIN Code
- **nominal_value** *(number, optional)* — Nominal Value
- **instrument_status** *(select, optional)* — Instrument Status
- **table_code** *(text, optional)* — User Table Code
- **table_row_key** *(text, optional)* — User Table Row Key
- **table_row_value** *(text, optional)* — User Table Row Value
- **effective_from** *(date, optional)* — Effective From Date
- **effective_to** *(date, optional)* — Effective To Date

## What must be true

- **data_integrity → option_scoping:** Every menu option is scoped to a broker firm and user; cross-broker data leakage is forbidden
- **data_integrity → instrument_uniqueness:** Instrument code must be unique within the broker firm; ISIN captured where available
- **data_integrity → table_row_uniqueness:** User table rows are keyed by (broker_code, table_code, table_row_key); duplicates rejected
- **data_integrity → referential_integrity:** Instruments referenced by open positions or historical deals cannot be deleted
- **data_integrity → effective_dating:** Reference table rows support effective-from and effective-to dates; overlapping ranges are blocked
- **data_integrity → audit_trail:** All maintenance changes logged with user, timestamp, old/new values; retained for at least 36 months
- **security → access_control:** Access to each menu option gated by resource access control facility; per-option and per-field view/update rights
- **security → print_segregation:** Print job cancellation and reinstatement restricted to authorised operators; self-service reprint must not expose other users' reports
- **security → printer_class_restriction:** End-users may only send output to printer classes their profile is authorised for
- **security → report_parameter_validation:** All end-user report parameters validated against a schema; free-form SQL or expression injection is forbidden
- **compliance → popia_personal_information:** Reports that materialise personal information must enforce POPIA lawful-basis and minimisation rules
- **compliance → popia_output_channel:** Output destinations holding personal information must be access-controlled and auditable
- **compliance → recordkeeping:** Report requests, parameters, and output recipients logged for regulatory recordkeeping
- **business → online_batch_split:** Schedules and delivery dockets may be produced either online or in the overnight batch; users choose per request
- **business → job_lifecycle:** Print jobs may be cancelled before the batch window and reinstated while still queued
- **business → unquoted_instruments:** Broker may capture unquoted instruments locally; quoted instruments are sourced from market data reference
- **business → special_tables:** A subset of tables is system-maintained (special tables); user tables are broker-maintained
- **business → remote_printers:** Printers are grouped by class; routing is by class not by physical device
- **business → report_request_loading:** End-user reports are submitted as parameterised requests that execute in a controlled process queue

## Success & failure scenarios

**✅ Success paths**

- **Request Online Or Batch Print** — when print_job_type in ["schedule","delivery_docket","deed"]; user_authorised_for_option eq true, then create_record; set print_job_status = "queued"; emit print_job.requested. _Why: Operator submits a schedule or delivery docket request for online or overnight batch print._
- **Cancel Queued Print Job** — when print_job_status eq "queued", then move print_job_status queued → cancelled; emit print_job.cancelled. _Why: Operator cancels a queued print job before the batch window closes._
- **Submit End User Report Request** — when report_code exists; report_parameters_valid eq true; destination_authorised eq true, then create_record; set report_request_status = "queued"; emit report_request.submitted. _Why: End-user submits a parameterised report request through the report request loader._
- **Load Unquoted Instrument** — when user_role eq "reference_data_steward"; is_quoted eq false; instrument_code not_exists, then create_record; emit instrument.created. _Why: Reference data steward loads a locally-captured unquoted instrument._
- **Maintain Remote Printer** — when user_role eq "printer_administrator"; print_class exists, then set printer_id = "updated"; emit printer.updated. _Why: Printer administrator creates or updates a remote printer entry within a printer class._
- **Upsert User Table Row** — when user_role eq "reference_data_steward"; effective_range_valid eq true, then set table_row_value = "updated"; emit table.row_upserted. _Why: Reference data steward upserts a row into a broker-maintained user table._

**❌ Failure paths**

- **Reject Invalid Print Job State** — when print_job_status in ["completed","cancelled"], then emit print_job.cancelled. _Why: Prevent cancel or reinstate actions on completed jobs._ *(error: `GM_PRINT_JOB_INVALID_STATE`)*
- **Reject Unauthorised Report Destination** — when destination_authorised eq false, then emit report_request.submitted. _Why: Block report output routed to a destination the user is not permitted to use._ *(error: `GM_REPORT_UNAUTHORISED_DESTINATION`)*
- **Reject Duplicate Instrument** — when instrument_code exists, then emit instrument.created. _Why: Prevent a duplicate instrument code within the broker firm._ *(error: `GM_INSTRUMENT_DUPLICATE`)*
- **Block Instrument Deletion With History** — when has_historical_activity eq true, then emit instrument.deleted. _Why: Prevent deletion of instruments referenced by open positions or historical deals._ *(error: `GM_INSTRUMENT_DELETE_BLOCKED`)*
- **Reject Overlapping Table Effective Dates** — when effective_range_overlap eq true, then emit table.row_upserted. _Why: Block table row whose effective date range overlaps an existing row._ *(error: `GM_TABLE_EFFECTIVE_OVERLAP`)*

## Errors it can return

- `GM_OPTION_FORBIDDEN` — User is not authorised for this menu option
- `GM_PRINT_JOB_NOT_FOUND` — Print job not found or outside the reprint retention window
- `GM_PRINT_JOB_INVALID_STATE` — Print job cannot be cancelled or reinstated in its current state
- `GM_REPORT_PARAMETER_INVALID` — Report parameter failed validation
- `GM_REPORT_UNAUTHORISED_DESTINATION` — Output destination is not permitted for this user
- `GM_INSTRUMENT_DUPLICATE` — Instrument code already exists for this broker
- `GM_INSTRUMENT_DELETE_BLOCKED` — Instrument cannot be deleted, referenced by positions or historical deals
- `GM_TABLE_ROW_DUPLICATE` — Table row already exists for this broker, table, and key
- `GM_TABLE_EFFECTIVE_OVERLAP` — Effective date range overlaps an existing row
- `GM_PRINTER_CLASS_UNKNOWN` — Printer class is not defined for this broker

## Events

**`print_job.requested`**
  Payload: `print_job_id`, `print_job_type`, `broker_code`, `user_id`, `timestamp`

**`print_job.cancelled`**
  Payload: `print_job_id`, `cancelled_by`, `timestamp`

**`print_job.reinstated`**
  Payload: `print_job_id`, `reinstated_by`, `timestamp`

**`report_request.submitted`**
  Payload: `report_code`, `report_parameters`, `user_id`, `requested_at`

**`report_request.completed`**
  Payload: `report_code`, `user_id`, `output_destination`, `row_count`, `completed_at`

**`instrument.created`**
  Payload: `instrument_code`, `instrument_type`, `broker_code`, `created_by`, `timestamp`

**`instrument.updated`**
  Payload: `instrument_code`, `field_name`, `old_value`, `new_value`, `updated_by`, `timestamp`

**`instrument.deleted`**
  Payload: `instrument_code`, `deleted_by`, `timestamp`

**`printer.updated`**
  Payload: `printer_id`, `print_class`, `updated_by`, `timestamp`

**`table.row_upserted`**
  Payload: `table_code`, `table_row_key`, `broker_code`, `updated_by`, `timestamp`

**`table.row_deleted`**
  Payload: `table_code`, `table_row_key`, `broker_code`, `deleted_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(recommended)*
- **broker-back-office-dissemination** *(recommended)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-general-maintenance/) · **Spec source:** [`broker-general-maintenance.blueprint.yaml`](./broker-general-maintenance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
