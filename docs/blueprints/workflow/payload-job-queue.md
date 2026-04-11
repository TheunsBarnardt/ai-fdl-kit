---
title: "Payload Job Queue Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Built-in job queue with tasks, workflows, cron scheduling, retry with backoff, concurrency control, and sub-task orchestration. 13 fields. 10 outcomes. 4 error "
---

# Payload Job Queue Blueprint

> Built-in job queue with tasks, workflows, cron scheduling, retry with backoff, concurrency control, and sub-task orchestration

| | |
|---|---|
| **Feature** | `payload-job-queue` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | cms, jobs, queue, tasks, workflows, cron, retry, concurrency, scheduling, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/payload-job-queue.blueprint.yaml) |
| **JSON API** | [payload-job-queue.json]({{ site.baseurl }}/api/blueprints/workflow/payload-job-queue.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `queue_client` | Queue Client | system | Application code or API endpoint that enqueues jobs |
| `job_runner` | Job Runner | system | Worker that picks up and executes queued jobs |
| `scheduler` | Cron Scheduler | system | Cron-based trigger that creates jobs on a schedule |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `task_slug` | text | No | Task Slug |  |
| `workflow_slug` | text | No | Workflow Slug |  |
| `input` | json | No | Job Input |  |
| `task_status` | json | No | Task Status Map |  |
| `completed_at` | datetime | No | Completion Timestamp |  |
| `total_tried` | number | No | Total Attempts |  |
| `has_error` | boolean | No | Has Error |  |
| `error` | json | No | Error Details |  |
| `log` | json | No | Execution Log |  |
| `queue` | text | No | Queue Name |  |
| `wait_until` | datetime | No | Delay Until |  |
| `processing` | boolean | No | Currently Processing |  |
| `concurrency_key` | text | No | Concurrency Key |  |

## States

**State field:** `processing`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `queued` | Yes |  |
| `processing` |  |  |
| `completed` |  | Yes |
| `failed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `queued` | `processing` | job_runner |  |
|  | `processing` | `completed` | job_runner |  |
|  | `processing` | `queued` | job_runner | retries remaining and backoff wait calculated |
|  | `processing` | `failed` | job_runner | no retries remaining |
|  | `queued` | `cancelled` | queue_client |  |

## Rules

- **execution:**
  - **processing_order:** FIFO by default, configurable per queue
  - **retry:**
    - **max_attempts:** configurable per task/workflow
    - **backoff_strategies:** fixed, exponential
    - **restore_logic:** configurable — can restore job state before retry
  - **concurrency:**
    - **modes:** exclusive, supersedes
    - **requires_opt_in:** true
  - **sub_tasks:**
    - **inline_execution:** true
    - **independent_retry:** true
    - **independent_concurrency:** true
  - **auto_run:**
    - **cron_based:** true
    - **not_for_serverless:** true
- **scheduling:**
  - **cron_expressions:** true
  - **before_schedule_hooks:** true
  - **after_schedule_hooks:** true
  - **stats_tracking:** true
- **access:**
  - **queue_permission:** access.queue — controls who can add jobs
  - **run_permission:** access.run — controls who can trigger job execution
  - **cancel_permission:** access.cancel — controls who can cancel jobs
  - **default:** authenticated users only

## Outcomes

### Job_failed_permanently (Priority: 3)

**Given:**
- job handler throws an error
- no retry attempts remaining

**Then:**
- **set_field** target: `has_error` value: `true`
- error details stored in error field
- onFail callback executed if configured

**Result:** Job marked as permanently failed

### Concurrency_exclusive (Priority: 3)

**Given:**
- concurrency control enabled
- another job with same concurrency key is processing
- mode is exclusive

**Result:** New job waits in queue until running job completes

### Concurrency_supersedes (Priority: 3)

**Given:**
- concurrency control enabled
- older pending jobs exist with same concurrency key
- mode is supersedes

**Then:**
- older pending jobs cancelled

**Result:** Only the newest job runs, older ones cancelled

### Job_retry (Priority: 5)

**Given:**
- job handler throws an error
- retry attempts remaining (totalTried < maxRetries)

**Then:**
- backoff wait time calculated (fixed or exponential)
- **set_field** target: `wait_until` value: `now + backoff_duration`
- **set_field** target: `total_tried` value: `total_tried + 1`
- job returns to queued state

**Result:** Job scheduled for retry after backoff period

### Queue_job (Priority: 10)

**Given:**
- user has queue access
- task or workflow slug is valid
- input matches task input schema (if defined)

**Then:**
- **create_record** target: `payload-jobs collection` — Job record created with queued status
- waitUntil set if delayed execution requested

**Result:** Job ID returned, job queued for execution

### Run_jobs (Priority: 10)

**Given:**
- user has run access (or endpoint called by cron)
- pending jobs exist in the specified queue

**Then:**
- jobs picked up in processing order
- processing flag set to true
- task/workflow handler executed with job context
- on success: completedAt set, processing cleared
- on failure: retry logic evaluated, error stored

**Result:** Jobs executed, results stored in task_status

### Run_job_by_id (Priority: 10) — Error: `JOB_INVALID_INPUT`

**Given:**
- user has run access
- job ID exists and is not completed

**Then:**
- specific job executed regardless of queue order

**Result:** Single job executed and result returned

### Cancel_job (Priority: 10)

**Given:**
- user has cancel access
- job is in queued state (not yet processing)

**Then:**
- **set_field** target: `has_error` value: `true` — Mark as errored to prevent execution

**Result:** Job cancelled, will not be retried

### Job_success (Priority: 10)

**Given:**
- job handler completes without error

**Then:**
- **set_field** target: `completed_at` value: `now`
- output stored in task_status
- onSuccess callback executed if configured

**Result:** Job marked as completed

### Handle_schedules (Priority: 10)

**Given:**
- cron expression matches current time
- schedule is enabled

**Then:**
- beforeSchedule hook executed
- new job created in queue
- afterSchedule hook executed
- stats global updated with last run timestamp

**Result:** Scheduled job created and queued

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `JOB_NOT_FOUND` | 404 | The requested job was not found | No |
| `JOB_ACCESS_DENIED` | 403 | You do not have permission to perform this job operation | No |
| `JOB_INVALID_INPUT` | 400 | The job input does not match the expected schema | No |
| `JOB_EXECUTION_ERROR` | 500 | An error occurred while executing the job | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `job.queued` | Emitted when a new job is added to the queue | `job_id`, `task_slug`, `workflow_slug`, `queue`, `user_id` |
| `job.started` | Emitted when a job begins execution | `job_id`, `task_slug`, `timestamp` |
| `job.completed` | Emitted when a job completes successfully | `job_id`, `task_slug`, `timestamp`, `output` |
| `job.failed` | Emitted when a job fails (may retry or permanently fail) | `job_id`, `task_slug`, `timestamp`, `error`, `total_tried` |
| `job.cancelled` | Emitted when a job is cancelled | `job_id`, `task_slug`, `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-versions | optional | Scheduled publishing uses the job queue to publish/unpublish at future times |
| payload-access-control | required | Queue, run, and cancel operations are access-controlled |
| payload-collections | required | Jobs stored in the payload-jobs auto-created collection |

## AGI Readiness

### Goals

#### Reliable Payload Job Queue

Built-in job queue with tasks, workflows, cron scheduling, retry with backoff, concurrency control, and sub-task orchestration

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `payload_access_control` | payload-access-control | degrade |
| `payload_collections` | payload-collections | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| queue_job | `autonomous` | - | - |
| run_jobs | `autonomous` | - | - |
| run_job_by_id | `autonomous` | - | - |
| cancel_job | `supervised` | - | - |
| job_retry | `autonomous` | - | - |
| job_failed_permanently | `autonomous` | - | - |
| job_success | `autonomous` | - | - |
| handle_schedules | `autonomous` | - | - |
| concurrency_exclusive | `autonomous` | - | - |
| concurrency_supersedes | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
rest_endpoints:
  - method: GET
    path: /api/payload-jobs/run
    operation: run_jobs
    description: Execute pending jobs — designed for cron triggers (e.g., Vercel cron)
  - method: POST
    path: /api/payload-job-schedules/handle
    operation: handle_schedules
auto_created_entities:
  - name: payload-jobs
    type: collection
    description: Stores all job instances
  - name: payload-jobs-stats
    type: global
    description: Tracks scheduled job run timestamps per queue/task/workflow
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Job Queue Blueprint",
  "description": "Built-in job queue with tasks, workflows, cron scheduling, retry with backoff, concurrency control, and sub-task orchestration. 13 fields. 10 outcomes. 4 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, jobs, queue, tasks, workflows, cron, retry, concurrency, scheduling, payload"
}
</script>
