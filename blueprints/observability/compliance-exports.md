<!-- AUTO-GENERATED FROM compliance-exports.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Compliance Exports

> Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and compliance archival.

**Category:** Observability · **Version:** 1.0.0 · **Tags:** compliance · ediscovery · export · actiance · globalrelay · regulatory

## What this does

Scheduled and on-demand export of communication records in regulatory-grade formats (CSV, Actiance XML, GlobalRelay email) for eDiscovery, legal review, and compliance archival.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **job_id** *(hidden, required)* — Unique identifier for the compliance export job
- **description** *(text, required)* — Human-readable label for this export job
- **start_at** *(datetime, optional)* — Start of the time range for exported messages (inclusive)
- **end_at** *(datetime, optional)* — End of the time range for exported messages (inclusive)
- **keywords** *(text, optional)* — Space or comma-delimited keywords to filter messages; empty means all messages
- **emails** *(text, optional)* — Comma-delimited email addresses to filter messages by participant
- **export_format** *(select, required)* — Output format for the compliance archive
- **job_type** *(select, required)* — Whether this job is scheduled (daily) or created on demand
- **status** *(select, required)* — Current execution state of the job
- **count** *(number, optional)* — Number of message records processed by the job

## What must be true

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

## Success & failure scenarios

**✅ Success paths**

- **Export Job Created** — when actor is compliance officer or system administrator; compliance feature is licensed; description is provided, then Job queued; background worker will begin processing asynchronously.
- **Export Completed** — when export job is running; all matching messages have been paginated and written to the archive, then Archive file available for download at the configured location.
- **Export Downloaded** — when actor is compliance officer or administrator; job status is finished; archive file exists on the server, then Archive file streamed to the requester.

**❌ Failure paths**

- **Export Not Licensed** — when compliance feature is not licensed on this server, then Request rejected with 501 Not Implemented. *(error: `COMPLIANCE_NOT_LICENSED`)*
- **Export File Missing** — when job status is finished; archive file no longer exists on the server filesystem, then Download rejected; administrator must re-run the export job. *(error: `COMPLIANCE_FILE_NOT_FOUND`)*

## Errors it can return

- `COMPLIANCE_NOT_LICENSED` — Compliance exports require an enterprise license.
- `COMPLIANCE_FILE_NOT_FOUND` — The export file is no longer available. Please re-run the export.
- `COMPLIANCE_JOB_FAILED` — The export job encountered an error. Please check server logs and try again.
- `COMPLIANCE_INVALID_REQUEST` — Invalid compliance export parameters.

## Events

**`compliance.export_created`** — A compliance export job was created
  Payload: `job_id`, `description`, `export_format`, `actor_id`, `timestamp`

**`compliance.export_completed`** — Export archive successfully generated
  Payload: `job_id`, `record_count`, `file_path`, `duration_ms`, `timestamp`

**`compliance.export_failed`** — Export job failed during processing
  Payload: `job_id`, `error_reason`, `timestamp`

**`compliance.export_downloaded`** — Export archive downloaded by a compliance officer
  Payload: `job_id`, `actor_id`, `file_size_bytes`, `timestamp`

## Connects to

- **audit-logging** *(required)* — All compliance export operations are recorded in the audit log
- **data-retention-policies** *(recommended)* — Retention policies determine how long messages remain available for export
- **legal-hold** *(recommended)* — Legal holds prevent retention deletion of records pending in compliance exports

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/observability/compliance-exports/) · **Spec source:** [`compliance-exports.blueprint.yaml`](./compliance-exports.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
