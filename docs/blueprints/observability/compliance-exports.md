---
title: "Compliance Exports Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and com"
---

# Compliance Exports Blueprint

> Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and compliance archival.


| | |
|---|---|
| **Feature** | `compliance-exports` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | compliance, ediscovery, export, actiance, globalrelay, regulatory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/observability/compliance-exports.blueprint.yaml) |
| **JSON API** | [compliance-exports.json]({{ site.baseurl }}/api/blueprints/observability/compliance-exports.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `compliance_officer` | Compliance Officer | human | Creates export jobs, downloads reports, reviews compliance records |
| `system_admin` | System Administrator | human | Configures compliance settings and GlobalRelay delivery parameters |
| `export_job` | Export Job | system | Background worker that generates export archives |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `job_id` | hidden | Yes | Unique identifier for the compliance export job |  |
| `description` | text | Yes | Human-readable label for this export job |  |
| `start_at` | datetime | No | Start of the time range for exported messages (inclusive) |  |
| `end_at` | datetime | No | End of the time range for exported messages (inclusive) |  |
| `keywords` | text | No | Space or comma-delimited keywords to filter messages; empty means all messages |  |
| `emails` | text | No | Comma-delimited email addresses to filter messages by participant |  |
| `export_format` | select | Yes | Output format for the compliance archive |  |
| `job_type` | select | Yes | Whether this job is scheduled (daily) or created on demand |  |
| `status` | select | Yes | Current execution state of the job |  |
| `count` | number | No | Number of message records processed by the job |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `created` | Yes |  |
| `running` |  |  |
| `finished` |  | Yes |
| `failed` |  | Yes |
| `removed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `created` | `running` | export_job |  |
|  | `running` | `finished` | export_job |  |
|  | `running` | `failed` | export_job |  |

## Rules

- **rule_01:** Compliance exports require an enterprise license with the compliance feature enabled.
- **rule_02:** Messages are exported in batches (default 30,000 records per batch) to prevent database lock contention.
- **rule_03:** Pagination uses a cursor combining the message timestamp and message ID to correctly handle ties when multiple messages share the same creation timestamp.
- **rule_04:** Deleted messages are included in exports with their deletion timestamp recorded; deletion does not suppress compliance records.
- **rule_05:** Keyword filtering is case-insensitive; multiple keywords are matched with OR logic.
- **rule_06:** CSV output sanitizes fields that begin with formula-injection characters (=, +, -) by prepending a single quote.
- **rule_07:** All timestamps in exports are formatted as RFC 3339.
- **rule_08:** GlobalRelay exports are delivered to the configured recipient address via SMTP; the customer type determines the SMTP server endpoint.
- **rule_09:** Daily exports run automatically at the configured time each day if enabled.
- **rule_10:** Export archives are stored in the configured compliance directory on the server filesystem.
- **rule_11:** Both channels and direct messages are exported; they are paginated separately.

## Outcomes

### Export_not_licensed (Priority: 1) — Error: `COMPLIANCE_NOT_LICENSED`

**Given:**
- compliance feature is not licensed on this server

**Result:** Request rejected with 501 Not Implemented

### Export_file_missing (Priority: 3) — Error: `COMPLIANCE_FILE_NOT_FOUND`

**Given:**
- job status is finished
- archive file no longer exists on the server filesystem

**Result:** Download rejected; administrator must re-run the export job

### Export_job_created (Priority: 10)

**Given:**
- actor is compliance officer or system administrator
- compliance feature is licensed
- description is provided

**Then:**
- **create_record** target: `compliance_job` — Job record created with unique ID and status = created
- **emit_event** event: `compliance.export_created`

**Result:** Job queued; background worker will begin processing asynchronously

### Export_completed (Priority: 10)

**Given:**
- export job is running
- all matching messages have been paginated and written to the archive

**Then:**
- **set_field** target: `job.status` value: `finished`
- **set_field** target: `job.count` — Total number of records exported recorded
- **emit_event** event: `compliance.export_completed`

**Result:** Archive file available for download at the configured location

### Export_downloaded (Priority: 10)

**Given:**
- actor is compliance officer or administrator
- job status is finished
- archive file exists on the server

**Then:**
- **emit_event** event: `compliance.export_downloaded`

**Result:** Archive file streamed to the requester

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMPLIANCE_NOT_LICENSED` | 403 | Compliance exports require an enterprise license. | No |
| `COMPLIANCE_FILE_NOT_FOUND` | 404 | The export file is no longer available. Please re-run the export. | No |
| `COMPLIANCE_JOB_FAILED` | 500 | The export job encountered an error. Please check server logs and try again. | No |
| `COMPLIANCE_INVALID_REQUEST` | 400 | Invalid compliance export parameters. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `compliance.export_created` | A compliance export job was created | `job_id`, `description`, `export_format`, `actor_id`, `timestamp` |
| `compliance.export_completed` | Export archive successfully generated | `job_id`, `record_count`, `file_path`, `duration_ms`, `timestamp` |
| `compliance.export_failed` | Export job failed during processing | `job_id`, `error_reason`, `timestamp` |
| `compliance.export_downloaded` | Export archive downloaded by a compliance officer | `job_id`, `actor_id`, `file_size_bytes`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| audit-logging | required | All compliance export operations are recorded in the audit log |
| data-retention-policies | recommended | Retention policies determine how long messages remain available for export |
| legal-hold | recommended | Legal holds prevent retention deletion of records pending in compliance exports |

## AGI Readiness

### Goals

#### Reliable Compliance Exports

Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and compliance archival.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| completeness | performance | observability gaps hide production issues |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `audit_logging` | audit-logging | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| export_job_created | `supervised` | - | - |
| export_completed | `autonomous` | - | - |
| export_downloaded | `autonomous` | - | - |
| export_not_licensed | `autonomous` | - | - |
| export_file_missing | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/public/model/compliance.go
    - server/channels/app/compliance.go
    - server/public/model/message_export.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Compliance Exports Blueprint",
  "description": "Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and com",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "compliance, ediscovery, export, actiance, globalrelay, regulatory"
}
</script>
