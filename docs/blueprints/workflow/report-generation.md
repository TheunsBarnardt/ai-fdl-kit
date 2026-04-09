---
title: "Report Generation Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Scheduled and on-demand report generation with PDF, Excel, and CSV output, background processing, caching, email delivery, and cron scheduling. . 13 fields. 6 o"
---

# Report Generation Blueprint

> Scheduled and on-demand report generation with PDF, Excel, and CSV output, background processing, caching, email delivery, and cron scheduling.


| | |
|---|---|
| **Feature** | `report-generation` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | reports, pdf, excel, csv, scheduled-jobs, data-export, background-processing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/report-generation.blueprint.yaml) |
| **JSON API** | [report-generation.json]({{ site.baseurl }}/api/blueprints/workflow/report-generation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `report_requester` | Report Requester | human | Requests on-demand reports or configures scheduled reports |
| `report_engine` | Report Engine | system | Processes report templates, queries data, and generates output files |
| `scheduler` | Scheduler | system | Triggers scheduled report generation based on cron expressions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `report_id` | text | Yes | Report ID | Validations: pattern |
| `name` | text | Yes | Report Name | Validations: minLength, maxLength |
| `template` | text | Yes | Report Template |  |
| `data_source` | text | Yes | Data Source |  |
| `parameters` | json | No | Query Parameters |  |
| `format` | select | Yes | Output Format |  |
| `schedule` | text | No | Cron Schedule | Validations: pattern |
| `recipients` | json | No | Email Recipients |  |
| `status` | select | Yes | Status |  |
| `file_url` | url | No | Generated File URL |  |
| `file_size_bytes` | number | No | File Size (bytes) |  |
| `generated_at` | datetime | No | Generated At |  |
| `expires_at` | datetime | No | Cache Expires At |  |

## Rules

- **max_file_size:**
  - **description:** Generated report files must not exceed 100 MB. If the output exceeds this limit, the report fails with an error and suggests narrowing parameters or splitting into multiple reports.

- **background_processing:**
  - **description:** Reports that are estimated to take longer than 5 seconds must be processed in a background job. The requester receives immediate acknowledgment with a report ID for status polling.

- **cache_recent_reports:**
  - **description:** Completed reports are cached for 1 hour. Requests with identical template, data source, and parameters within the cache window return the cached file instead of regenerating.

- **parameterized_queries_only:**
  - **description:** All data source queries must use parameterized inputs to prevent injection attacks. Raw user input must never be interpolated into query strings.

- **schedule_validation:**
  - **description:** Cron schedule expressions must be valid five-field cron format. Minimum allowed interval is 15 minutes to prevent excessive load.

- **recipient_notification:**
  - **description:** When recipients are configured, the generated report is emailed as an attachment (under 25 MB) or as a download link (over 25 MB).


## Outcomes

### On_demand_report_generated (Priority: 1)

**Given:**
- user requests a report with template, data source, and parameters
- no cached report exists for the same parameters

**Then:**
- **transition_state** field: `status` from: `pending` to: `processing`
- **call_service** target: `report_engine` — Execute parameterized query and render report in requested format
- **transition_state** field: `status` from: `processing` to: `completed`
- **set_field** target: `file_url` — Store URL to generated file
- **set_field** target: `generated_at` — Record generation timestamp
- **set_field** target: `expires_at` — Set cache expiry to 1 hour from generation
- **emit_event** event: `report.generated`

**Result:** Report generated in background and download URL provided to requester

### Cached_report_returned (Priority: 2)

**Given:**
- user requests a report with template, data source, and parameters
- a cached report exists for identical parameters
- `expires_at` (db) gt `now`

**Then:**
- **set_field** target: `status` value: `cached`
- **emit_event** event: `report.cache_hit`

**Result:** Cached report returned immediately without regeneration

### Scheduled_report_triggered (Priority: 3)

**Given:**
- cron schedule fires for a configured report
- `schedule` (db) exists

**Then:**
- **call_service** target: `report_engine` — Generate report using stored template and parameters
- **notify** — Send report to all configured recipients
- **emit_event** event: `report.scheduled.completed`

**Result:** Scheduled report generated and delivered to all recipients

### Report_delivered_to_recipients (Priority: 4)

**Given:**
- report generation completes successfully
- `recipients` (db) exists

**Then:**
- **notify** — Email report as attachment or download link based on file size
- **emit_event** event: `report.delivered`

**Result:** Report delivered to all configured recipients via email

### Report_exceeds_size_limit (Priority: 5) — Error: `REPORT_SIZE_EXCEEDED`

**Given:**
- report generation produces output exceeding 100 MB

**Then:**
- **transition_state** field: `status` from: `processing` to: `failed`
- **emit_event** event: `report.failed`

**Result:** Report generation fails with size limit exceeded error

### Report_generation_fails (Priority: 6) — Error: `REPORT_GENERATION_FAILED`

**Given:**
- report engine encounters an error during generation

**Then:**
- **transition_state** field: `status` from: `processing` to: `failed`
- **emit_event** event: `report.failed`

**Result:** Report generation fails and requester is notified with error details

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPORT_SIZE_EXCEEDED` | 413 | Generated report exceeds the 100 MB size limit. Narrow parameters or split into multiple reports. | No |
| `REPORT_GENERATION_FAILED` | 500 | An error occurred while generating the report. Check data source and template configuration. | No |
| `REPORT_TEMPLATE_NOT_FOUND` | 404 | The specified report template does not exist. | No |
| `REPORT_DATA_SOURCE_ERROR` | 500 | Failed to connect to or query the specified data source. | No |
| `REPORT_INVALID_SCHEDULE` | 400 | Cron schedule expression is invalid or interval is below the 15-minute minimum. | No |
| `REPORT_INVALID_PARAMETERS` | 400 | One or more query parameters are invalid or missing required values. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `report.generated` | A report was successfully generated | `report_id`, `name`, `format`, `file_url`, `file_size_bytes` |
| `report.cache_hit` | A cached report was returned instead of regenerating | `report_id`, `generated_at`, `expires_at` |
| `report.scheduled.completed` | A scheduled report was generated and delivered | `report_id`, `name`, `format`, `recipient_count` |
| `report.delivered` | A report was delivered to recipients via email | `report_id`, `recipients`, `delivery_method` |
| `report.failed` | Report generation failed due to an error | `report_id`, `reason`, `error_details` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| automation-rules | optional | Automation rules can trigger on-demand reports based on record events |
| task-management | optional | Report generation jobs can be tracked as background tasks |
| dashboard-analytics | recommended | Dashboard widgets may offer report export functionality |

## AGI Readiness

### Goals

#### Reliable Report Generation

Scheduled and on-demand report generation with PDF, Excel, and CSV output, background processing, caching, email delivery, and cron scheduling.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| on_demand_report_generated | `autonomous` | - | - |
| cached_report_returned | `autonomous` | - | - |
| scheduled_report_triggered | `autonomous` | - | - |
| report_delivered_to_recipients | `autonomous` | - | - |
| report_exceeds_size_limit | `autonomous` | - | - |
| report_generation_fails | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Report Generation Blueprint",
  "description": "Scheduled and on-demand report generation with PDF, Excel, and CSV output, background processing, caching, email delivery, and cron scheduling.\n. 13 fields. 6 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "reports, pdf, excel, csv, scheduled-jobs, data-export, background-processing"
}
</script>
