---
title: "Gdpr Data Export Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Complete workspace data export for GDPR right-to-portability, compliance archival, and migration purposes, producing a JSONL stream with optional ZIP packaging "
---

# Gdpr Data Export Blueprint

> Complete workspace data export for GDPR right-to-portability, compliance archival, and migration purposes, producing a JSONL stream with optional ZIP packaging of all messages, files, users,...

| | |
|---|---|
| **Feature** | `gdpr-data-export` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gdpr, data-portability, export, bulk-export, compliance, migration, jsonl |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/gdpr-data-export.blueprint.yaml) |
| **JSON API** | [gdpr-data-export.json]({{ site.baseurl }}/api/blueprints/data/gdpr-data-export.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Initiates and monitors export jobs; downloads completed archives |
| `export_job` | Export Job | system | Background worker that streams JSONL records and packages attachments |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `include_attachments` | boolean | Yes | Whether file attachments referenced in messages are bundled into the export |  |
| `include_profile_pictures` | boolean | Yes | Whether user and bot profile images are included in the export |  |
| `include_archived_channels` | boolean | Yes | Whether archived channels and their message history are exported |  |
| `include_roles_and_schemes` | boolean | Yes | Whether permission role definitions and scheme assignments are exported |  |
| `create_archive` | boolean | Yes | When true the output is a ZIP archive; when false raw JSONL is streamed |  |
| `output_path` | text | Yes | Filesystem path where the export file or directory is written |  |

## States

**State field:** `export_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `running` |  |  |
| `completed` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `running` | export_job |  |
|  | `running` | `completed` | export_job |  |
|  | `running` | `failed` | export_job |  |

## Rules

- **rule_01:** Records are written in JSONL format (one JSON object per line) for streaming and incremental processing.
- **rule_02:** Export processes entity types sequentially — version metadata, roles/schemes, teams, channels, users, bots, posts, emoji, direct channels, direct posts — to maintain referential integrity.
- **rule_03:** Posts include their reactions, thread relationships (via root_id/parent_id), and file attachment references.
- **rule_04:** Soft-deleted records (users, posts, channels) are included in the export with their deletion timestamps.
- **rule_05:** File attachments and profile pictures are copied into a data/ subdirectory within the export archive.
- **rule_06:** If a file cannot be copied, the error is logged in a warnings.txt file in the archive root, but the export continues; individual file failures do not abort the job.
- **rule_07:** When ZIP output is requested, JSONL data, attachments, profile pictures, and warnings are packaged into a single archive.
- **rule_08:** Custom emoji SVG files are exported to an exported_emoji/ directory.
- **rule_09:** All exported user records include notification preferences, display settings, and privacy-relevant profile fields.
- **rule_10:** Progress is tracked per entity type and reported in job metadata for monitoring.

## Outcomes

### Export_failed (Priority: 5) — Error: `EXPORT_FAILED`

**Given:**
- export encounters an unrecoverable error (e.g., disk full, database error)

**Then:**
- **set_field** target: `job.status` value: `failed`
- **emit_event** event: `export.failed`

**Result:** Export aborted; partial output may exist at output_path

### Export_with_warnings (Priority: 8)

**Given:**
- export completes but one or more files could not be copied

**Then:**
- **set_field** target: `job.status` value: `completed`
- **create_record** target: `warnings_file` — warnings.txt written to archive root listing each failed file and reason
- **emit_event** event: `export.completed_with_warnings`

**Result:** Export complete; administrator should review warnings.txt for missing files

### Export_started (Priority: 10)

**Given:**
- actor is system administrator
- output_path is writable

**Then:**
- **create_record** target: `export_job` — Job record created; background worker begins processing
- **emit_event** event: `export.started`

**Result:** Export job running; administrator can monitor progress

### Export_completed (Priority: 10)

**Given:**
- export job processes all entity types successfully

**Then:**
- **set_field** target: `job.status` value: `completed`
- **emit_event** event: `export.completed`

**Result:** Complete export archive available at output_path

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EXPORT_FAILED` | 500 | The data export encountered an error. Please check server logs and try again. | No |
| `EXPORT_PERMISSION_DENIED` | 403 | Only system administrators can run data exports. | No |
| `EXPORT_OUTPUT_PATH_UNAVAILABLE` | 503 | The export output path is not writable. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `export.started` | Data export job initiated | `job_id`, `actor_id`, `include_attachments`, `include_archived`, `timestamp` |
| `export.completed` | Export archive successfully produced | `job_id`, `output_path`, `file_size_bytes`, `warning_count`, `timestamp` |
| `export.completed_with_warnings` | Export completed but some files could not be included | `job_id`, `warning_count`, `output_path`, `timestamp` |
| `export.failed` | Export job failed before completion | `job_id`, `error_reason`, `timestamp` |
| `export.progress` | Export job progress update (entity type completed) | `job_id`, `entity_type`, `records_written`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| user-deactivation-archiving | recommended | GDPR export should be run before permanent user deletion to satisfy portability requests |
| data-retention-policies | recommended | Retention deletion removes content from future exports; export before retention window closes |
| compliance-exports | optional | Compliance export targets specific message ranges; full data export covers the entire workspace |
| audit-logging | required | Export initiation and completion are recorded in the audit trail |

## AGI Readiness

### Goals

#### Reliable Gdpr Data Export

Complete workspace data export for GDPR right-to-portability, compliance archival, and migration purposes, producing a JSONL stream with optional ZIP packaging of all messages, files, users,...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `audit_logging` | audit-logging | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| export_started | `autonomous` | - | - |
| export_completed | `autonomous` | - | - |
| export_with_warnings | `autonomous` | - | - |
| export_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/public/model/bulk_export.go
    - server/channels/app/bulk_export.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gdpr Data Export Blueprint",
  "description": "Complete workspace data export for GDPR right-to-portability, compliance archival, and migration purposes, producing a JSONL stream with optional ZIP packaging ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gdpr, data-portability, export, bulk-export, compliance, migration, jsonl"
}
</script>
