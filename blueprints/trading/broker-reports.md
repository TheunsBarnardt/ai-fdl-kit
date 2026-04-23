<!-- AUTO-GENERATED FROM broker-reports.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Reports

> Standard broker reporting subsystem covering contract notes, statements, portfolio valuations, tax certificates, scheduled batch generation, and multi-channel delivery

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · reports · contract-notes · statements · portfolio-valuation · tax-certificates · batch-scheduling · delivery

## What this does

Standard broker reporting subsystem covering contract notes, statements, portfolio valuations, tax certificates, scheduled batch generation, and multi-channel delivery

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **report_id** *(text, required)* — Report Identifier
- **report_code** *(text, required)* — Report Code
- **report_type** *(select, required)* — Report Type
- **report_name** *(text, required)* — Report Name
- **description** *(text, optional)* — Description
- **schedule_frequency** *(select, required)* — Schedule Frequency
- **schedule_day** *(number, optional)* — Schedule Day
- **schedule_time** *(text, optional)* — Schedule Time
- **run_date** *(date, required)* — Run Date
- **period_start** *(date, optional)* — Period Start
- **period_end** *(date, optional)* — Period End
- **account_code** *(text, optional)* — Account Code
- **account_range** *(text, optional)* — Account Range
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **output_format** *(select, required)* — Output Format
- **delivery_channel** *(select, required)* — Delivery Channel
- **delivery_address** *(text, optional)* — Delivery Address
- **email_address** *(email, optional)* — Email Address
- **physical_address** *(text, optional)* — Physical Address
- **tax_year** *(text, optional)* — Tax Year
- **tax_certificate_type** *(select, optional)* — Tax Certificate Type
- **tax_reference_number** *(text, optional)* — Tax Reference Number
- **it3b_exclusion** *(boolean, optional)* — IT3B Exclusion Flag
- **cgt_basis** *(select, optional)* — CGT Cost Basis Method
- **valuation_date** *(date, optional)* — Portfolio Valuation Date
- **base_currency** *(text, optional)* — Base Currency
- **include_zero_balances** *(boolean, optional)* — Include Zero Balances
- **consolidated** *(boolean, optional)* — Consolidated Statement
- **copy_count** *(number, optional)* — Copy Count
- **priority** *(select, optional)* — Batch Priority
- **report_status** *(select, required)* — Report Status
- **generated_at** *(datetime, optional)* — Generated Timestamp
- **delivered_at** *(datetime, optional)* — Delivered Timestamp
- **delivery_reference** *(text, optional)* — Delivery Reference
- **file_size_bytes** *(number, optional)* — File Size (bytes)
- **page_count** *(number, optional)* — Page Count
- **error_message** *(text, optional)* — Error Message
- **retry_count** *(number, optional)* — Retry Count
- **requested_by** *(text, optional)* — Requested By

## What must be true

- **standard_reports → catalog:** System ships a catalog of standard reports: contract notes, daily/monthly statements, portfolio valuations, cash and stock position, deal journals, commission, and tax certificates
- **standard_reports → contract_notes:** Contract notes generated per executed deal, delivered same-day per regulatory requirement
- **standard_reports → statements:** Client statements generated daily, weekly, monthly, or on demand covering cash movements, deals, and open positions
- **standard_reports → portfolio_valuations:** Portfolio valuations priced at mark-to-market using end-of-day closing prices with configurable base currency
- **standard_reports → tax_certificates:** IT3B interest/dividend tax certificates and CGT realised-gain certificates generated annually per tax year
- **scheduling → frequencies:** Supported frequencies: daily, weekly, monthly, quarterly, yearly, on-demand
- **scheduling → calendar:** Respects trading-calendar holidays; scheduled runs skip non-business days and roll to next eligible day
- **scheduling → batch_windows:** Batches run in defined overnight windows with configurable priority and retry policy
- **scheduling → idempotency:** Re-running a scheduled report for the same period produces identical output, safe to retry
- **delivery → channels:** Supported channels: hardcopy print, XML feed, electronic (email with secure attachment, SFTP, portal download)
- **delivery → hardcopy:** Hardcopy delivery routed to print spool with mailing address from account master
- **delivery → xml_feed:** XML delivery packaged per published schema and pushed to configured endpoint with signed manifest
- **delivery → electronic:** Email delivery uses password-protected attachment or secure-portal link, never plaintext PII in body
- **delivery → delivery_confirmation:** Delivery receipts recorded with timestamp, channel, and reference
- **delivery → retry_policy:** Failed delivery retried with exponential backoff up to configured maximum attempts
- **tax_compliance → tax_authority_format:** Tax certificate output conforms to tax-authority electronic-submission specification
- **tax_compliance → tax_year_boundary:** Tax year boundaries honour South African tax-year (1 March – end February)
- **tax_compliance → it3b_exclusion:** Accounts flagged it3b_exclusion are excluded from IT3B generation but still reported internally
- **tax_compliance → cgt_methods:** CGT supports FIFO, weighted-average, and specific-identification cost-basis methods
- **tax_compliance → certificate_retention:** Tax certificates retained for at least five years per tax-authority recordkeeping rules
- **security → access_control:** Report generation and delivery configuration controlled per role; clients see only own reports
- **security → pii_masking:** Personal-information fields masked in logs; raw output encrypted at rest
- **security → popia_consent:** Electronic delivery requires recorded client consent and current contact details
- **security → segregation_of_duties:** Schedule configuration and approval separated from report generation execution
- **data_integrity → source_snapshot:** Reports generated against a point-in-time snapshot of deals, positions, and prices for reproducibility
- **data_integrity → audit_trail:** Every report run records requester, parameters, output hash, and delivery outcome
- **data_integrity → referential_integrity:** Reports cannot be deleted while referenced by regulatory submission records

## Success & failure scenarios

**✅ Success paths**

- **Request Standard Report** — when report_code exists; output_format in ["hardcopy","xml","electronic"]; delivery_channel exists, then create_record; set report_status = "requested"; emit report.requested. _Why: Operator requests a standard report from the catalog with parameters._
- **Schedule Recurring Batch** — when schedule_frequency in ["daily","weekly","monthly","quarterly","yearly"]; report_code exists, then create_record; emit report.scheduled. _Why: Schedule a report to run on a recurring frequency._
- **Generate Contract Note** — when report_type eq "contract_note"; account_code exists, then move report_status queued → generating; set generated_at = "now"; emit report.generated. _Why: Generate a contract note for an executed deal._
- **Generate Portfolio Valuation** — when report_type eq "portfolio_valuation"; valuation_date exists, then call service; set report_status = "generated"; emit report.generated. _Why: Generate a mark-to-market portfolio valuation as at a valuation date._
- **Generate It3b Tax Certificate** — when tax_certificate_type eq "IT3B"; tax_year exists; it3b_exclusion neq true, then create_record; set report_status = "generated"; emit report.tax_certificate_issued. _Why: Generate an IT3B interest/dividend tax certificate for a tax year._
- **Generate Cgt Certificate** — when tax_certificate_type eq "CGT"; cgt_basis in ["FIFO","weighted_average","specific_identification"], then create_record; emit report.tax_certificate_issued. _Why: Generate CGT realised-gains certificate using configured cost-basis method._
- **Deliver Hardcopy** — when delivery_channel eq "hardcopy"; physical_address exists, then move report_status generated → delivering; call service; emit report.delivery_started. _Why: Route generated report to hardcopy print spool using mailing address._
- **Deliver Xml Feed** — when delivery_channel eq "xml"; output_format eq "xml", then call service; set report_status = "delivered"; emit report.delivered. _Why: Package report as XML and push to configured endpoint with signed manifest._
- **Deliver Electronic** — when delivery_channel eq "electronic"; email_address exists; delivery_consent eq true, then call service; set delivered_at = "now"; emit report.delivered. _Why: Deliver report electronically via secure email or portal link._
- **Retry Failed Delivery** — when report_status eq "failed"; retry_count lt 5, then set retry_count = "incremented"; move report_status failed → delivering; emit report.delivery_started. _Why: Retry a failed delivery with exponential backoff up to configured limit._

**❌ Failure paths**

- **Reject Invalid Schedule** — when schedule_frequency not_in ["daily","weekly","monthly","quarterly","yearly","on_demand"], then emit report.requested. _Why: Reject schedule requests with unsupported frequency or missing parameters._ *(error: `REPORT_SCHEDULE_INVALID`)*
- **Reject It3b For Excluded Account** — when tax_certificate_type eq "IT3B"; it3b_exclusion eq true, then emit report.generation_failed. _Why: Prevent IT3B generation for accounts flagged as excluded._ *(error: `REPORT_IT3B_EXCLUDED`)*
- **Reject Electronic Without Consent** — when delivery_channel eq "electronic"; delivery_consent neq true, then emit report.delivery_failed. _Why: Block electronic delivery when client consent is not recorded._ *(error: `REPORT_DELIVERY_CONSENT_MISSING`)*
- **Handle Generation Failure** — when generation_error exists, then move report_status generating → failed; emit report.generation_failed. _Why: Capture generation failures and mark report as failed._ *(error: `REPORT_GENERATION_FAILED`)*

## Errors it can return

- `REPORT_NOT_FOUND` — Report definition not found
- `REPORT_SCHEDULE_INVALID` — Schedule frequency or parameters are invalid
- `REPORT_PERIOD_INVALID` — Reporting period is invalid or spans a closed financial period
- `REPORT_ACCOUNT_NOT_FOUND` — One or more requested accounts do not exist
- `REPORT_GENERATION_FAILED` — Report generation failed, see error log for details
- `REPORT_DELIVERY_FAILED` — Delivery channel rejected the report
- `REPORT_DELIVERY_CONSENT_MISSING` — Electronic delivery requires recorded client consent
- `REPORT_TAX_YEAR_INVALID` — Tax year is not a recognised tax-authority tax year
- `REPORT_IT3B_EXCLUDED` — Account is flagged as excluded from IT3B generation
- `REPORT_POPIA_VIOLATION` — Report parameters or delivery channel failed POPIA check
- `REPORT_UNAUTHORIZED` — User lacks permission to generate or receive this report

## Events

**`report.requested`**
  Payload: `report_id`, `report_code`, `requested_by`, `parameters`, `timestamp`

**`report.scheduled`**
  Payload: `report_id`, `schedule_frequency`, `next_run_date`, `timestamp`

**`report.queued`**
  Payload: `report_id`, `run_date`, `priority`, `timestamp`

**`report.generation_started`**
  Payload: `report_id`, `run_date`, `timestamp`

**`report.generated`**
  Payload: `report_id`, `output_format`, `page_count`, `file_size_bytes`, `timestamp`

**`report.generation_failed`**
  Payload: `report_id`, `error_message`, `retry_count`, `timestamp`

**`report.delivery_started`**
  Payload: `report_id`, `delivery_channel`, `delivery_address`, `timestamp`

**`report.delivered`**
  Payload: `report_id`, `delivery_channel`, `delivery_reference`, `timestamp`

**`report.delivery_failed`**
  Payload: `report_id`, `delivery_channel`, `error_message`, `retry_count`, `timestamp`

**`report.tax_certificate_issued`**
  Payload: `report_id`, `tax_certificate_type`, `tax_year`, `account_code`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(optional)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-reports/) · **Spec source:** [`broker-reports.blueprint.yaml`](./broker-reports.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
