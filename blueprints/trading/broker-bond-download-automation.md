<!-- AUTO-GENERATED FROM broker-bond-download-automation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Bond Download Automation

> Automated scheduled download of bond instrument datasets from a bond-data-feed-provider, including error monitoring, adhoc request handling, and a file processing pipeline for verified distribution

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · bond · automation · scheduled-job · batch · file-pipeline · monitoring

## What this does

Automated scheduled download of bond instrument datasets from a bond-data-feed-provider, including error monitoring, adhoc request handling, and a file processing pipeline for verified distribution

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **request_id** *(text, required)* — Download Request ID
- **instrument_alpha** *(text, required)* — Instrument Alpha Code
- **instrument_version** *(text, required)* — Instrument Version
- **instrument_type** *(select, required)* — Instrument Type
- **run_frequency** *(select, required)* — Run Frequency
- **adhoc_flag** *(boolean, required)* — Adhoc Request Flag
- **business_date** *(date, required)* — Business Date
- **scheduled_time** *(datetime, required)* — Scheduled Run Time
- **download_status** *(select, required)* — Download Status
- **started_at** *(datetime, optional)* — Run Started At
- **completed_at** *(datetime, optional)* — Run Completed At
- **dataset_name** *(text, optional)* — Produced Dataset Name
- **dataset_checksum** *(text, optional)* — Dataset Checksum
- **record_count** *(number, optional)* — Record Count
- **retry_count** *(number, optional)* — Retry Count
- **error_code** *(text, optional)* — Error Code
- **error_message** *(text, optional)* — Error Message
- **verified_flag** *(boolean, optional)* — Dataset Verified Flag
- **distribution_status** *(select, optional)* — Distribution Status
- **requested_by** *(text, optional)* — Requested By

## What must be true

- **scheduling → daily_batch:** Daily batch orchestrator triggers instrument download steps at configured window; no manual intervention required on the happy path
- **scheduling → adhoc_same_day:** Adhoc requests must only be loaded on the day the files are required for; same-day-only execution prevents stale dataset production
- **scheduling → adhoc_flag:** A run-frequency flag marks a request as adhoc so batch jobs route it through the adhoc pipeline
- **scheduling → single_instrument_per_request:** Each adhoc request covers exactly one instrument type; multi-instrument requests must be split
- **scheduling → mandatory_alpha_and_version:** Instrument alpha and version are mandatory on every adhoc request
- **processing → dataset_verification:** Produced dataset files must be verified (checksum + record-count sanity) before distribution
- **processing → distribution_handoff:** Once verified, the standard downstream distribution process handles the file; the automation must not duplicate distribution
- **processing → idempotency:** Re-running a completed request for the same business date and instrument must not produce a second dataset
- **monitoring → error_alerting:** Every failure emits a monitoring event with instrument, business date, error code, and retry count
- **monitoring → retry_policy:** Transient provider errors retry with exponential backoff up to a configured ceiling; exhausted retries escalate to operations
- **monitoring → sla_window:** Scheduled downloads must complete within the configured batch SLA window or escalate
- **compliance → audit_trail:** Every scheduled and adhoc run is logged with requester, timestamp, and resulting dataset identifiers; retained for at least 36 months
- **compliance → vendor_neutrality:** Provider connection details are configuration, not code; switching to another bond-data-feed-provider must not require code changes
- **compliance → no_pii_in_dataset:** Bond instrument datasets must not contain personal information; any PII found triggers quarantine

## Success & failure scenarios

**✅ Success paths**

- **Schedule Adhoc Download** — when instrument_alpha exists; instrument_version exists; adhoc_flag eq true; business_date eq "today", then create_record; set download_status = "scheduled"; emit bond_download.scheduled. _Why: Operator registers an adhoc bond download request for the current business date._
- **Execute Scheduled Download** — when download_status eq "scheduled"; scheduled_time lte "now", then move download_status scheduled → running; call service; emit bond_download.started. _Why: Scheduler triggers a scheduled download and the service retrieves the dataset from the provider._
- **Complete And Verify Dataset** — when download_status eq "running"; dataset_checksum exists; record_count gt 0, then set verified_flag = true; move download_status running → completed; emit bond_download.verified; emit bond_download.completed; call service; emit bond_download.distributed. _Why: Downloaded dataset passes checksum and record-count verification, then hands off to distribution._
- **Sla Breach Alert** — when download_status eq "running"; started_at lt "now - 60m", then notify via email; emit bond_download.sla_breached. _Why: Scheduled download exceeds configured SLA window without completion._

**❌ Failure paths**

- **Reject Adhoc Wrong Date** — when adhoc_flag eq true; business_date neq "today", then emit bond_download.failed. _Why: Prevent adhoc requests loaded for a business date other than today._ *(error: `BOND_DOWNLOAD_ADHOC_WRONG_DATE`)*
- **Reject Invalid Instrument** — when instrument_alpha not_exists OR instrument_version not_exists, then emit bond_download.failed. _Why: Reject requests missing mandatory instrument identifiers._ *(error: `BOND_DOWNLOAD_INVALID_INSTRUMENT`)*
- **Fail On Provider Unavailable** — when download_status eq "running"; provider_reachable eq false, then move download_status running → failed; emit bond_download.failed; emit bond_download.retried. _Why: Provider is unreachable; transition run to failed and queue a retry._ *(error: `BOND_DOWNLOAD_PROVIDER_UNAVAILABLE`)*
- **Verification Failure Quarantine** — when download_status eq "running"; dataset_checksum not_exists OR record_count lte 0, then set verified_flag = false; move download_status running → failed; notify via email; emit bond_download.failed. _Why: Dataset fails verification; block distribution and escalate._ *(error: `BOND_DOWNLOAD_VERIFICATION_FAILED`)*
- **Reject Duplicate Completed** — when existing_completed_request exists, then emit bond_download.failed. _Why: Prevent producing a second dataset for the same instrument and business date._ *(error: `BOND_DOWNLOAD_DUPLICATE`)*
- **Escalate Retries Exhausted** — when retry_count gte 5; download_status eq "failed", then notify via email; emit bond_download.failed. _Why: Maximum retries reached without success; escalate to operations._ *(error: `BOND_DOWNLOAD_RETRIES_EXHAUSTED`)*

## Errors it can return

- `BOND_DOWNLOAD_PROVIDER_UNAVAILABLE` — Bond data feed provider is not reachable
- `BOND_DOWNLOAD_TIMEOUT` — Bond data download exceeded the configured timeout
- `BOND_DOWNLOAD_INVALID_INSTRUMENT` — Instrument alpha or version is missing or invalid
- `BOND_DOWNLOAD_ADHOC_WRONG_DATE` — Adhoc request may only be loaded on the business date it targets
- `BOND_DOWNLOAD_VERIFICATION_FAILED` — Produced dataset failed verification checks
- `BOND_DOWNLOAD_DUPLICATE` — A completed download already exists for this instrument and business date
- `BOND_DOWNLOAD_RETRIES_EXHAUSTED` — Download failed after maximum retry attempts

## Events

**`bond_download.scheduled`**
  Payload: `request_id`, `instrument_alpha`, `instrument_version`, `business_date`, `adhoc_flag`, `requested_by`

**`bond_download.started`**
  Payload: `request_id`, `instrument_alpha`, `started_at`

**`bond_download.completed`**
  Payload: `request_id`, `instrument_alpha`, `dataset_name`, `record_count`, `dataset_checksum`, `completed_at`

**`bond_download.failed`**
  Payload: `request_id`, `instrument_alpha`, `error_code`, `error_message`, `retry_count`

**`bond_download.retried`**
  Payload: `request_id`, `instrument_alpha`, `retry_count`

**`bond_download.verified`**
  Payload: `request_id`, `dataset_name`, `dataset_checksum`

**`bond_download.distributed`**
  Payload: `request_id`, `dataset_name`, `distribution_status`

**`bond_download.sla_breached`**
  Payload: `request_id`, `instrument_alpha`, `scheduled_time`, `elapsed_minutes`

## Connects to

- **broker-client-account-maintenance** *(recommended)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-bond-download-automation/) · **Spec source:** [`broker-bond-download-automation.blueprint.yaml`](./broker-bond-download-automation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
