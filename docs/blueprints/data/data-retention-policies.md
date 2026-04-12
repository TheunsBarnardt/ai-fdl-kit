---
title: "Data Retention Policies Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace"
---

# Data Retention Policies Blueprint

> Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace or channel.


| | |
|---|---|
| **Feature** | `data-retention-policies` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | retention, data-governance, gdpr, deletion, compliance, purge |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/data-retention-policies.blueprint.yaml) |
| **JSON API** | [data-retention-policies.json]({{ site.baseurl }}/api/blueprints/data/data-retention-policies.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Creates and manages retention policies; configures global defaults |
| `retention_job` | Retention Job | system | Scheduled background worker that identifies and deletes expired content |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `policy_id` | hidden | Yes | Unique identifier for this retention policy |  |
| `display_name` | text | Yes | Human-readable label for the policy | Validations: maxLength |
| `post_duration_days` | number | No | Number of days to retain messages; null means messages are never deleted by this | Validations: min |
| `team_ids` | json | No | Array of team IDs this policy applies to (for team-scoped policies) |  |
| `channel_ids` | json | No | Array of channel IDs this policy applies to (for channel-scoped policies) |  |
| `global_message_retention_hours` | number | No | Global fallback retention duration in hours for all messages not covered by a sp | Validations: min |
| `global_file_retention_hours` | number | No | Global fallback retention duration in hours for all file uploads not covered by | Validations: min |
| `deletion_job_start_time` | text | No | Daily scheduled time for the deletion job to run (e |  |
| `batch_size` | number | No | Number of records processed per deletion batch to limit database lock contention |  |

## States

**State field:** `policy_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `deleted` | system_admin |  |

## Rules

- **rule_01:** Retention is hierarchical — channel-level policies override team-level policies, which override the global default.
- **rule_02:** If a channel is covered by both a team policy and a channel policy, the channel policy takes precedence.
- **rule_03:** A post_duration_days value of null means "never delete"; this is distinct from zero which is invalid.
- **rule_04:** Both message retention and file retention can be independently enabled or disabled at the global level.
- **rule_05:** Deletion runs in batches with a configurable inter-batch delay to avoid excessive database load.
- **rule_06:** The deletion job soft-deletes content by setting a delete_at timestamp; physical removal is handled separately.
- **rule_07:** Pinned messages may be optionally exempted from deletion via a preserve_pinned_posts global flag.
- **rule_08:** Team IDs and channel IDs must be validated to exist at the time the policy is created or patched.
- **rule_09:** When a policy is deleted, all team and channel assignments are removed in the same transaction; affected scopes revert to the global default.

## Outcomes

### Policy_invalid_duration (Priority: 2) — Error: `RETENTION_INVALID_DURATION`

**Given:**
- post_duration_days is provided as zero or a negative number

**Result:** Policy creation or patch rejected

### Policy_created (Priority: 10)

**Given:**
- actor is system administrator
- display_name is provided
- post_duration_days is null or a positive integer
- team_ids and channel_ids reference existing workspaces and channels

**Then:**
- **create_record** target: `retention_policy` — Policy record created with team and channel assignments
- **emit_event** event: `retention.policy_created`

**Result:** Policy active; affected content will be deleted at the next scheduled job run

### Policy_patched (Priority: 10)

**Given:**
- actor is system administrator
- policy exists

**Then:**
- **set_field** target: `policy` — Duration, team assignments, and channel assignments updated
- **emit_event** event: `retention.policy_updated`

**Result:** Policy changes take effect at the next scheduled deletion run

### Retention_deletion_run (Priority: 10)

**Given:**
- scheduled deletion job fires at the configured time
- at least one retention policy (global or specific) has message or file deletion enabled

**Then:**
- **delete_record** target: `expired_messages` — Messages older than the applicable retention period are soft-deleted in batches
- **delete_record** target: `expired_files` — File records older than the applicable file retention period are soft-deleted in batches
- **emit_event** event: `retention.deletion_completed`

**Result:** Expired content removed; compliance with retention obligations maintained

### Policy_deleted (Priority: 10)

**Given:**
- actor is system administrator

**Then:**
- **delete_record** target: `retention_policy` — Policy and all team/channel assignments removed atomically
- **emit_event** event: `retention.policy_deleted`

**Result:** Affected workspaces and channels revert to global retention defaults

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RETENTION_INVALID_DURATION` | 400 | Retention duration must be a positive number of days or null (no deletion). | No |
| `RETENTION_INVALID_TEAM` | 400 | One or more specified teams do not exist. | No |
| `RETENTION_INVALID_CHANNEL` | 400 | One or more specified channels do not exist. | No |
| `RETENTION_POLICY_NOT_FOUND` | 404 | Retention policy not found. | No |
| `RETENTION_NOT_LICENSED` | 403 | Granular retention policies require an enterprise license. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `retention.policy_created` | A new retention policy was created | `policy_id`, `display_name`, `post_duration_days`, `scope`, `actor_id`, `timestamp` |
| `retention.policy_updated` | Retention policy settings were modified | `policy_id`, `changed_fields`, `actor_id`, `timestamp` |
| `retention.policy_deleted` | Retention policy was deleted | `policy_id`, `actor_id`, `timestamp` |
| `retention.deletion_completed` | Scheduled retention deletion job completed | `messages_deleted`, `files_deleted`, `duration_ms`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| compliance-exports | recommended | Compliance exports capture message records before retention deletes them |
| legal-hold | recommended | Legal holds should exempt records from retention deletion |
| audit-logging | required | All retention policy CRUD operations are recorded in the audit log |

## AGI Readiness

### Goals

#### Reliable Data Retention Policies

Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace or channel.


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
- before permanently deleting records

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
| policy_created | `supervised` | - | - |
| policy_patched | `autonomous` | - | - |
| retention_deletion_run | `human_required` | - | - |
| policy_invalid_duration | `autonomous` | - | - |
| policy_deleted | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 4
  entry_points:
    - server/public/model/data_retention_policy.go
    - server/channels/app/data_retention.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Data Retention Policies Blueprint",
  "description": "Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "retention, data-governance, gdpr, deletion, compliance, purge"
}
</script>
