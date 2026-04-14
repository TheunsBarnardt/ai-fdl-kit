<!-- AUTO-GENERATED FROM data-retention-policies.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Data Retention Policies

> Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace or channel.

**Category:** Data · **Version:** 1.0.0 · **Tags:** retention · data-governance · gdpr · deletion · compliance · purge

## What this does

Hierarchical message and file deletion policies that automatically remove content older than configured retention periods, with granular overrides per workspace or channel.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **policy_id** *(hidden, required)* — Unique identifier for this retention policy
- **display_name** *(text, required)* — Human-readable label for the policy
- **post_duration_days** *(number, optional)* — Number of days to retain messages; null means messages are never deleted by this
- **team_ids** *(json, optional)* — Array of team IDs this policy applies to (for team-scoped policies)
- **channel_ids** *(json, optional)* — Array of channel IDs this policy applies to (for channel-scoped policies)
- **global_message_retention_hours** *(number, optional)* — Global fallback retention duration in hours for all messages not covered by a sp
- **global_file_retention_hours** *(number, optional)* — Global fallback retention duration in hours for all file uploads not covered by
- **deletion_job_start_time** *(text, optional)* — Daily scheduled time for the deletion job to run (e
- **batch_size** *(number, optional)* — Number of records processed per deletion batch to limit database lock contention

## What must be true

- **rule_01:** Retention is hierarchical — channel-level policies override team-level policies, which override the global default.
- **rule_02:** If a channel is covered by both a team policy and a channel policy, the channel policy takes precedence.
- **rule_03:** A post_duration_days value of null means "never delete"; this is distinct from zero which is invalid.
- **rule_04:** Both message retention and file retention can be independently enabled or disabled at the global level.
- **rule_05:** Deletion runs in batches with a configurable inter-batch delay to avoid excessive database load.
- **rule_06:** The deletion job soft-deletes content by setting a delete_at timestamp; physical removal is handled separately.
- **rule_07:** Pinned messages may be optionally exempted from deletion via a preserve_pinned_posts global flag.
- **rule_08:** Team IDs and channel IDs must be validated to exist at the time the policy is created or patched.
- **rule_09:** When a policy is deleted, all team and channel assignments are removed in the same transaction; affected scopes revert to the global default.

## Success & failure scenarios

**✅ Success paths**

- **Policy Created** — when actor is system administrator; display_name is provided; post_duration_days is null or a positive integer; team_ids and channel_ids reference existing workspaces and channels, then Policy active; affected content will be deleted at the next scheduled job run.
- **Policy Patched** — when actor is system administrator; policy exists, then Policy changes take effect at the next scheduled deletion run.
- **Retention Deletion Run** — when scheduled deletion job fires at the configured time; at least one retention policy (global or specific) has message or file deletion enabled, then Expired content removed; compliance with retention obligations maintained.
- **Policy Deleted** — when actor is system administrator, then Affected workspaces and channels revert to global retention defaults.

**❌ Failure paths**

- **Policy Invalid Duration** — when post_duration_days is provided as zero or a negative number, then Policy creation or patch rejected. *(error: `RETENTION_INVALID_DURATION`)*

## Errors it can return

- `RETENTION_INVALID_DURATION` — Retention duration must be a positive number of days or null (no deletion).
- `RETENTION_INVALID_TEAM` — One or more specified teams do not exist.
- `RETENTION_INVALID_CHANNEL` — One or more specified channels do not exist.
- `RETENTION_POLICY_NOT_FOUND` — Retention policy not found.
- `RETENTION_NOT_LICENSED` — Granular retention policies require an enterprise license.

## Events

**`retention.policy_created`** — A new retention policy was created
  Payload: `policy_id`, `display_name`, `post_duration_days`, `scope`, `actor_id`, `timestamp`

**`retention.policy_updated`** — Retention policy settings were modified
  Payload: `policy_id`, `changed_fields`, `actor_id`, `timestamp`

**`retention.policy_deleted`** — Retention policy was deleted
  Payload: `policy_id`, `actor_id`, `timestamp`

**`retention.deletion_completed`** — Scheduled retention deletion job completed
  Payload: `messages_deleted`, `files_deleted`, `duration_ms`, `timestamp`

## Connects to

- **compliance-exports** *(recommended)* — Compliance exports capture message records before retention deletes them
- **legal-hold** *(recommended)* — Legal holds should exempt records from retention deletion
- **audit-logging** *(required)* — All retention policy CRUD operations are recorded in the audit log

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/data-retention-policies/) · **Spec source:** [`data-retention-policies.blueprint.yaml`](./data-retention-policies.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
