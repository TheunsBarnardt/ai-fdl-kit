---
title: "Legal Hold Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal requ"
---

# Legal Hold Blueprint

> Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal request, overriding any data retention...

| | |
|---|---|
| **Feature** | `legal-hold` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | legal-hold, ediscovery, litigation, preservation, compliance, regulatory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/legal-hold.blueprint.yaml) |
| **JSON API** | [legal-hold.json]({{ site.baseurl }}/api/blueprints/data/legal-hold.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `legal_admin` | Legal Administrator | human | Creates and manages legal holds; defines custodians and date ranges |
| `system_admin` | System Administrator | human | Grants legal admin access; configures hold storage destinations |
| `retention_system` | Retention System | system | Checks hold status before deleting any content |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `hold_id` | hidden | Yes | Unique identifier for this legal hold |  |
| `name` | text | Yes | Human-readable label describing the legal matter | Validations: maxLength |
| `custodian_user_ids` | json | Yes | Array of user IDs whose content is subject to preservation |  |
| `channel_ids` | json | No | Optional array of channel IDs to scope the hold; empty means all channels for th |  |
| `start_at` | datetime | No | Earliest message timestamp covered by this hold (inclusive) |  |
| `end_at` | datetime | No | Latest message timestamp covered by this hold (inclusive); null means ongoing |  |
| `include_files` | boolean | Yes | Whether file attachments sent by custodians are also preserved |  |
| `export_path` | text | No | Storage destination where preserved content is archived for legal review |  |

## States

**State field:** `hold_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `released` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `released` | legal_admin |  |

## Rules

- **rule_01:** An active legal hold overrides any data retention policy; covered content must not be deleted regardless of its age.
- **rule_02:** Content covered by a hold is determined by the intersection of custodian identities, channel scope, and date range.
- **rule_03:** When the hold is released, covered content immediately becomes subject to the applicable retention policy; content already past the retention window must be evaluated for immediate deletion.
- **rule_04:** A hold does not affect the users' ability to continue messaging; they are not notified that a hold exists unless required by law.
- **rule_05:** Holds are logged in the audit trail with the identity of the legal administrator who created or released them.
- **rule_06:** Multiple holds may overlap; content is preserved as long as at least one active hold covers it.
- **rule_07:** File attachments are included only when include_files is true; the hold is independently configurable for messages and files.
- **rule_08:** The hold preservation archive is stored in a separate, access-controlled location independent of the primary message store.
- **rule_09:** Releasing a hold should trigger a review to determine whether retained content must be deleted to comply with data retention obligations.

## Outcomes

### Deletion_blocked_by_hold (Priority: 1)

**Given:**
- retention job or administrator attempts to delete content
- content is within the date range and custodian scope of at least one active hold

**Then:**
- **emit_event** event: `legal_hold.deletion_blocked`

**Result:** Deletion skipped for held content; other non-held content proceeds normally

### Overlapping_hold_maintained (Priority: 5)

**Given:**
- one hold covering content is released
- at least one other active hold still covers the same content

**Result:** Content remains preserved because the remaining hold is still active

### Hold_created (Priority: 10)

**Given:**
- actor is legal administrator
- custodian_user_ids are valid active users
- name is provided

**Then:**
- **create_record** target: `legal_hold` — Hold record created; retention system begins excluding covered content from deletion
- **emit_event** event: `legal_hold.created`

**Result:** All covered content is immediately protected from any automated or manual deletion

### Hold_content_exported (Priority: 10)

**Given:**
- legal administrator requests export of held content
- hold is active

**Then:**
- **create_record** target: `hold_export` — Preserved content packaged into archive at export_path
- **emit_event** event: `legal_hold.exported`

**Result:** Archive of held content available for legal review

### Hold_released (Priority: 10)

**Given:**
- legal administrator releases the hold
- legal matter is resolved

**Then:**
- **set_field** target: `hold.status` value: `released`
- **emit_event** event: `legal_hold.released`

**Result:** Content previously held is now subject to normal retention policies

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LEGAL_HOLD_NOT_FOUND` | 404 | Legal hold not found. | No |
| `LEGAL_HOLD_INVALID_CUSTODIAN` | 400 | One or more specified users do not exist. | No |
| `LEGAL_HOLD_ALREADY_RELEASED` | 409 | This hold has already been released. | No |
| `LEGAL_HOLD_NOT_LICENSED` | 403 | Legal hold requires an enterprise compliance license. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `legal_hold.created` | A new legal hold was placed | `hold_id`, `name`, `custodian_count`, `channel_count`, `actor_id`, `timestamp` |
| `legal_hold.released` | A legal hold was lifted | `hold_id`, `actor_id`, `timestamp` |
| `legal_hold.deletion_blocked` | Retention deletion was skipped because content is under a legal hold | `hold_id`, `content_id`, `content_type`, `timestamp` |
| `legal_hold.exported` | Held content packaged into an export archive for legal review | `hold_id`, `export_path`, `record_count`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| data-retention-policies | required | Legal holds override retention deletion; the two systems must coordinate |
| compliance-exports | recommended | Held content can be exported in compliance formats for eDiscovery |
| audit-logging | required | All hold creation, release, and export operations are recorded in the audit log |

## AGI Readiness

### Goals

#### Reliable Legal Hold

Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal request, overriding any data retention...

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
| `data_retention_policies` | data-retention-policies | degrade |
| `audit_logging` | audit-logging | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| hold_created | `supervised` | - | - |
| deletion_blocked_by_hold | `human_required` | - | - |
| hold_content_exported | `autonomous` | - | - |
| hold_released | `autonomous` | - | - |
| overlapping_hold_maintained | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 2
  entry_points:
    - server/channels/app/data_retention.go
    - server/public/model/data_retention_policy.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Legal Hold Blueprint",
  "description": "Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal requ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "legal-hold, ediscovery, litigation, preservation, compliance, regulatory"
}
</script>
