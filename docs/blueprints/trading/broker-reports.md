---
title: "Broker Reports Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Standard broker reporting subsystem covering contract notes, statements, portfolio valuations, tax certificates, scheduled batch generation, and multi-channel d"
---

# Broker Reports Blueprint

> Standard broker reporting subsystem covering contract notes, statements, portfolio valuations, tax certificates, scheduled batch generation, and multi-channel delivery

| | |
|---|---|
| **Feature** | `broker-reports` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, reports, contract-notes, statements, portfolio-valuation, tax-certificates, batch-scheduling, delivery |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-reports.blueprint.yaml) |
| **JSON API** | [broker-reports.json]({{ site.baseurl }}/api/blueprints/trading/broker-reports.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `report_scheduler` | Report Scheduler | system |  |
| `batch_runner` | Batch Report Runner | system |  |
| `compliance_officer` | Compliance Officer | human |  |
| `delivery_gateway` | Delivery Gateway | system |  |
| `tax_authority` | Tax Authority | external |  |
| `client` | Client | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `report_id` | text | Yes | Report Identifier |  |
| `report_code` | text | Yes | Report Code |  |
| `report_type` | select | Yes | Report Type |  |
| `report_name` | text | Yes | Report Name |  |
| `description` | text | No | Description |  |
| `schedule_frequency` | select | Yes | Schedule Frequency |  |
| `schedule_day` | number | No | Schedule Day |  |
| `schedule_time` | text | No | Schedule Time |  |
| `run_date` | date | Yes | Run Date |  |
| `period_start` | date | No | Period Start |  |
| `period_end` | date | No | Period End |  |
| `account_code` | text | No | Account Code |  |
| `account_range` | text | No | Account Range |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `output_format` | select | Yes | Output Format |  |
| `delivery_channel` | select | Yes | Delivery Channel |  |
| `delivery_address` | text | No | Delivery Address |  |
| `email_address` | email | No | Email Address |  |
| `physical_address` | text | No | Physical Address |  |
| `tax_year` | text | No | Tax Year |  |
| `tax_certificate_type` | select | No | Tax Certificate Type |  |
| `tax_reference_number` | text | No | Tax Reference Number |  |
| `it3b_exclusion` | boolean | No | IT3B Exclusion Flag |  |
| `cgt_basis` | select | No | CGT Cost Basis Method |  |
| `valuation_date` | date | No | Portfolio Valuation Date |  |
| `base_currency` | text | No | Base Currency |  |
| `include_zero_balances` | boolean | No | Include Zero Balances |  |
| `consolidated` | boolean | No | Consolidated Statement |  |
| `copy_count` | number | No | Copy Count |  |
| `priority` | select | No | Batch Priority |  |
| `report_status` | select | Yes | Report Status |  |
| `generated_at` | datetime | No | Generated Timestamp |  |
| `delivered_at` | datetime | No | Delivered Timestamp |  |
| `delivery_reference` | text | No | Delivery Reference |  |
| `file_size_bytes` | number | No | File Size (bytes) |  |
| `page_count` | number | No | Page Count |  |
| `error_message` | text | No | Error Message |  |
| `retry_count` | number | No | Retry Count |  |
| `requested_by` | text | No | Requested By |  |

## States

**State field:** `report_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `queued` |  |  |
| `generating` |  |  |
| `generated` |  |  |
| `delivering` |  |  |
| `delivered` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `queued` | report_scheduler |  |
|  | `queued` | `generating` | batch_runner |  |
|  | `generating` | `generated` | batch_runner |  |
|  | `generated` | `delivering` | delivery_gateway |  |
|  | `delivering` | `delivered` | delivery_gateway |  |
|  | `generating` | `failed` | batch_runner |  |
|  | `delivering` | `failed` | delivery_gateway |  |

## Rules

- **standard_reports:**
  - **catalog:** System ships a catalog of standard reports: contract notes, daily/monthly statements, portfolio valuations, cash and stock position, deal journals, commission, and tax certificates
  - **contract_notes:** Contract notes generated per executed deal, delivered same-day per regulatory requirement
  - **statements:** Client statements generated daily, weekly, monthly, or on demand covering cash movements, deals, and open positions
  - **portfolio_valuations:** Portfolio valuations priced at mark-to-market using end-of-day closing prices with configurable base currency
  - **tax_certificates:** IT3B interest/dividend tax certificates and CGT realised-gain certificates generated annually per tax year
- **scheduling:**
  - **frequencies:** Supported frequencies: daily, weekly, monthly, quarterly, yearly, on-demand
  - **calendar:** Respects trading-calendar holidays; scheduled runs skip non-business days and roll to next eligible day
  - **batch_windows:** Batches run in defined overnight windows with configurable priority and retry policy
  - **idempotency:** Re-running a scheduled report for the same period produces identical output, safe to retry
- **delivery:**
  - **channels:** Supported channels: hardcopy print, XML feed, electronic (email with secure attachment, SFTP, portal download)
  - **hardcopy:** Hardcopy delivery routed to print spool with mailing address from account master
  - **xml_feed:** XML delivery packaged per published schema and pushed to configured endpoint with signed manifest
  - **electronic:** Email delivery uses password-protected attachment or secure-portal link, never plaintext PII in body
  - **delivery_confirmation:** Delivery receipts recorded with timestamp, channel, and reference
  - **retry_policy:** Failed delivery retried with exponential backoff up to configured maximum attempts
- **tax_compliance:**
  - **tax_authority_format:** Tax certificate output conforms to tax-authority electronic-submission specification
  - **tax_year_boundary:** Tax year boundaries honour South African tax-year (1 March – end February)
  - **it3b_exclusion:** Accounts flagged it3b_exclusion are excluded from IT3B generation but still reported internally
  - **cgt_methods:** CGT supports FIFO, weighted-average, and specific-identification cost-basis methods
  - **certificate_retention:** Tax certificates retained for at least five years per tax-authority recordkeeping rules
- **security:**
  - **access_control:** Report generation and delivery configuration controlled per role; clients see only own reports
  - **pii_masking:** Personal-information fields masked in logs; raw output encrypted at rest
  - **popia_consent:** Electronic delivery requires recorded client consent and current contact details
  - **segregation_of_duties:** Schedule configuration and approval separated from report generation execution
- **data_integrity:**
  - **source_snapshot:** Reports generated against a point-in-time snapshot of deals, positions, and prices for reproducibility
  - **audit_trail:** Every report run records requester, parameters, output hash, and delivery outcome
  - **referential_integrity:** Reports cannot be deleted while referenced by regulatory submission records

## Outcomes

### Request_standard_report (Priority: 1) | Transaction: atomic

_Operator requests a standard report from the catalog with parameters_

**Given:**
- `report_code` (input) exists
- `output_format` (input) in `hardcopy,xml,electronic`
- `delivery_channel` (input) exists

**Then:**
- **create_record**
- **set_field** target: `report_status` value: `requested`
- **emit_event** event: `report.requested`

### Schedule_recurring_batch (Priority: 2) | Transaction: atomic

_Schedule a report to run on a recurring frequency_

**Given:**
- `schedule_frequency` (input) in `daily,weekly,monthly,quarterly,yearly`
- `report_code` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `report.scheduled`

### Reject_invalid_schedule (Priority: 3) — Error: `REPORT_SCHEDULE_INVALID`

_Reject schedule requests with unsupported frequency or missing parameters_

**Given:**
- `schedule_frequency` (input) not_in `daily,weekly,monthly,quarterly,yearly,on_demand`

**Then:**
- **emit_event** event: `report.requested`

### Generate_contract_note (Priority: 4) | Transaction: atomic

_Generate a contract note for an executed deal_

**Given:**
- `report_type` (input) eq `contract_note`
- `account_code` (input) exists

**Then:**
- **transition_state** field: `report_status` from: `queued` to: `generating`
- **set_field** target: `generated_at` value: `now`
- **emit_event** event: `report.generated`

### Generate_portfolio_valuation (Priority: 5) | Transaction: atomic

_Generate a mark-to-market portfolio valuation as at a valuation date_

**Given:**
- `report_type` (input) eq `portfolio_valuation`
- `valuation_date` (input) exists

**Then:**
- **call_service** target: `pricing_snapshot`
- **set_field** target: `report_status` value: `generated`
- **emit_event** event: `report.generated`

### Generate_it3b_tax_certificate (Priority: 6) | Transaction: atomic

_Generate an IT3B interest/dividend tax certificate for a tax year_

**Given:**
- `tax_certificate_type` (input) eq `IT3B`
- `tax_year` (input) exists
- `it3b_exclusion` (db) neq `true`

**Then:**
- **create_record**
- **set_field** target: `report_status` value: `generated`
- **emit_event** event: `report.tax_certificate_issued`

### Reject_it3b_for_excluded_account (Priority: 7) — Error: `REPORT_IT3B_EXCLUDED`

_Prevent IT3B generation for accounts flagged as excluded_

**Given:**
- `tax_certificate_type` (input) eq `IT3B`
- `it3b_exclusion` (db) eq `true`

**Then:**
- **emit_event** event: `report.generation_failed`

### Generate_cgt_certificate (Priority: 8) | Transaction: atomic

_Generate CGT realised-gains certificate using configured cost-basis method_

**Given:**
- `tax_certificate_type` (input) eq `CGT`
- `cgt_basis` (input) in `FIFO,weighted_average,specific_identification`

**Then:**
- **create_record**
- **emit_event** event: `report.tax_certificate_issued`

### Deliver_hardcopy (Priority: 9)

_Route generated report to hardcopy print spool using mailing address_

**Given:**
- `delivery_channel` (input) eq `hardcopy`
- `physical_address` (db) exists

**Then:**
- **transition_state** field: `report_status` from: `generated` to: `delivering`
- **call_service** target: `print_spool`
- **emit_event** event: `report.delivery_started`

### Deliver_xml_feed (Priority: 10) | Transaction: atomic

_Package report as XML and push to configured endpoint with signed manifest_

**Given:**
- `delivery_channel` (input) eq `xml`
- `output_format` (input) eq `xml`

**Then:**
- **call_service** target: `xml_feed_gateway`
- **set_field** target: `report_status` value: `delivered`
- **emit_event** event: `report.delivered`

### Deliver_electronic (Priority: 11) | Transaction: atomic

_Deliver report electronically via secure email or portal link_

**Given:**
- `delivery_channel` (input) eq `electronic`
- `email_address` (db) exists
- `delivery_consent` (db) eq `true`

**Then:**
- **call_service** target: `secure_delivery_gateway`
- **set_field** target: `delivered_at` value: `now`
- **emit_event** event: `report.delivered`

### Reject_electronic_without_consent (Priority: 12) — Error: `REPORT_DELIVERY_CONSENT_MISSING`

_Block electronic delivery when client consent is not recorded_

**Given:**
- `delivery_channel` (input) eq `electronic`
- `delivery_consent` (db) neq `true`

**Then:**
- **emit_event** event: `report.delivery_failed`

### Retry_failed_delivery (Priority: 13)

_Retry a failed delivery with exponential backoff up to configured limit_

**Given:**
- `report_status` (db) eq `failed`
- `retry_count` (db) lt `5`

**Then:**
- **set_field** target: `retry_count` value: `incremented`
- **transition_state** field: `report_status` from: `failed` to: `delivering`
- **emit_event** event: `report.delivery_started`

### Handle_generation_failure (Priority: 14) — Error: `REPORT_GENERATION_FAILED`

_Capture generation failures and mark report as failed_

**Given:**
- `generation_error` (system) exists

**Then:**
- **transition_state** field: `report_status` from: `generating` to: `failed`
- **emit_event** event: `report.generation_failed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPORT_NOT_FOUND` | 404 | Report definition not found | No |
| `REPORT_SCHEDULE_INVALID` | 400 | Schedule frequency or parameters are invalid | No |
| `REPORT_PERIOD_INVALID` | 400 | Reporting period is invalid or spans a closed financial period | No |
| `REPORT_ACCOUNT_NOT_FOUND` | 404 | One or more requested accounts do not exist | No |
| `REPORT_GENERATION_FAILED` | 500 | Report generation failed, see error log for details | No |
| `REPORT_DELIVERY_FAILED` | 503 | Delivery channel rejected the report | No |
| `REPORT_DELIVERY_CONSENT_MISSING` | 422 | Electronic delivery requires recorded client consent | No |
| `REPORT_TAX_YEAR_INVALID` | 400 | Tax year is not a recognised tax-authority tax year | No |
| `REPORT_IT3B_EXCLUDED` | 409 | Account is flagged as excluded from IT3B generation | No |
| `REPORT_POPIA_VIOLATION` | 422 | Report parameters or delivery channel failed POPIA check | No |
| `REPORT_UNAUTHORIZED` | 403 | User lacks permission to generate or receive this report | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `report.requested` |  | `report_id`, `report_code`, `requested_by`, `parameters`, `timestamp` |
| `report.scheduled` |  | `report_id`, `schedule_frequency`, `next_run_date`, `timestamp` |
| `report.queued` |  | `report_id`, `run_date`, `priority`, `timestamp` |
| `report.generation_started` |  | `report_id`, `run_date`, `timestamp` |
| `report.generated` |  | `report_id`, `output_format`, `page_count`, `file_size_bytes`, `timestamp` |
| `report.generation_failed` |  | `report_id`, `error_message`, `retry_count`, `timestamp` |
| `report.delivery_started` |  | `report_id`, `delivery_channel`, `delivery_address`, `timestamp` |
| `report.delivered` |  | `report_id`, `delivery_channel`, `delivery_reference`, `timestamp` |
| `report.delivery_failed` |  | `report_id`, `delivery_channel`, `error_message`, `retry_count`, `timestamp` |
| `report.tax_certificate_issued` |  | `report_id`, `tax_certificate_type`, `tax_year`, `account_code`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
report_catalog:
  CONTRACT_NOTE: Contract note per executed deal
  DAILY_STATEMENT: Daily cash and stock statement
  MONTHLY_STATEMENT: Monthly consolidated statement
  PORTFOLIO_VALUATION: Mark-to-market portfolio valuation
  CASH_POSITION: Client cash position listing
  STOCK_POSITION: Client stock position listing
  DEAL_JOURNAL: Deal journal by period
  COMMISSION_REPORT: Commission and fee breakdown
  IT3B_CERTIFICATE: Interest and dividend tax certificate
  CGT_CERTIFICATE: Capital gains tax realised-gains certificate
output_formats:
  hardcopy: Printed document routed to mailing address
  xml: XML document conforming to published schema
  electronic: Secure email attachment or portal link
  pdf: PDF rendering for viewing and archival
  csv: Tabular export for downstream analysis
delivery_channels:
  print: Physical mail via print spool
  email: Secure email with password-protected attachment
  portal: Client self-service download portal
  sftp: Scheduled SFTP push to configured endpoint
  xml_feed: Push to configured XML ingestion endpoint
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Reports Blueprint",
  "description": "Standard broker reporting subsystem covering contract notes, statements, portfolio valuations, tax certificates, scheduled batch generation, and multi-channel d",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, reports, contract-notes, statements, portfolio-valuation, tax-certificates, batch-scheduling, delivery"
}
</script>
