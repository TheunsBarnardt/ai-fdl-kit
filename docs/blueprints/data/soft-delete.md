---
title: "Soft Delete Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Trash/archive/restore pattern with soft deletion, configurable retention periods, automatic purging, and cascade rules for related records. 5 fields. 6 outcomes"
---

# Soft Delete Blueprint

> Trash/archive/restore pattern with soft deletion, configurable retention periods, automatic purging, and cascade rules for related records

| | |
|---|---|
| **Feature** | `soft-delete` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | soft-delete, trash, archive, restore, purge, retention, data-lifecycle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/soft-delete.blueprint.yaml) |
| **JSON API** | [soft-delete.json]({{ site.baseurl }}/api/blueprints/data/soft-delete.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `deleted_at` | datetime | No | Deleted At |  |
| `deleted_by` | text | No | Deleted By |  |
| `restore_before` | datetime | No | Auto-Purge Date |  |
| `deletion_type` | select | Yes | Deletion Type |  |
| `deletion_reason` | text | No | Deletion Reason | Validations: maxLength |

## Rules

- **default_query_behavior:**
  - **exclude_soft_deleted:** true
  - **soft_delete_scope:** per_model
- **retention:**
  - **default_retention_days:** 30
  - **configurable_per_model:** true
  - **restore_before_auto_set:** true
- **cascade:**
  - **strategy:** configurable
  - **default:** cascade
  - **restore_cascades:** true
- **permanent_delete:**
  - **admin_only:** true
  - **requires_soft_delete_first:** true
  - **irreversible:** true
- **purge_job:**
  - **schedule:** daily
  - **batch_size:** 1000
- **unique_constraints:**
  - **scoped_to_active:** true

## Outcomes

### Record_soft_deleted (Priority: 1)

**Given:**
- user requests deletion of a record
- the record exists and is not already soft-deleted
- user has permission to delete the record

**Then:**
- **set_field** target: `deleted_at` — Set to current timestamp
- **set_field** target: `deleted_by` — Set to the requesting user's ID
- **set_field** target: `restore_before` — Set to deleted_at + retention period
- **emit_event** event: `record.soft_deleted`

**Result:** Record marked as deleted; excluded from default queries; restorable until purge date

### Record_restored (Priority: 2)

**Given:**
- user requests restoration of a soft-deleted record
- the record exists and is currently soft-deleted
- the restore_before date has not passed
- user has permission to restore the record

**Then:**
- **set_field** target: `deleted_at` value: `null`
- **set_field** target: `deleted_by` value: `null`
- **set_field** target: `restore_before` value: `null`
- **emit_event** event: `record.restored`

**Result:** Record restored to active state; visible in default queries again

### Record_permanently_purged (Priority: 3)

**Given:**
- ANY: the auto-purge job runs and restore_before has passed OR an admin explicitly requests permanent deletion of a soft-deleted record

**Then:**
- **delete_record** — Permanently remove the record and its data from the database
- **emit_event** event: `record.purged`

**Result:** Record permanently removed; cannot be restored

### Delete_already_deleted (Priority: 4) — Error: `RECORD_ALREADY_DELETED`

**Given:**
- user requests deletion of a record
- the record is already soft-deleted

**Result:** Error returned indicating the record is already in the trash

### Restore_expired (Priority: 5) — Error: `RECORD_RESTORE_EXPIRED`

**Given:**
- user requests restoration of a soft-deleted record
- the restore_before date has passed

**Result:** Error returned indicating the retention period has expired

### Permanent_delete_not_soft_deleted (Priority: 6) — Error: `RECORD_NOT_SOFT_DELETED`

**Given:**
- admin requests permanent deletion of a record
- the record is not currently soft-deleted

**Result:** Error returned; record must be soft-deleted before permanent deletion

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RECORD_ALREADY_DELETED` | 409 | Record is already in the trash | No |
| `RECORD_RESTORE_EXPIRED` | 410 | Retention period has expired; record can no longer be restored | No |
| `RECORD_NOT_SOFT_DELETED` | 400 | Record must be soft-deleted before it can be permanently purged | No |
| `PERMANENT_DELETE_UNAUTHORIZED` | 403 | Only administrators can permanently delete records | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `record.soft_deleted` | A record was soft-deleted and moved to the trash | `entity_type`, `entity_id`, `deleted_by`, `restore_before` |
| `record.restored` | A soft-deleted record was restored to active state | `entity_type`, `entity_id`, `restored_by` |
| `record.purged` | A record was permanently purged from the database | `entity_type`, `entity_id`, `purge_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| audit-trail | required | All delete, restore, and purge operations must be tracked in the audit trail |
| search-and-filtering | recommended | Search must respect soft-delete scoping to exclude trashed records by default |

## AGI Readiness

### Goals

#### Reliable Soft Delete

Trash/archive/restore pattern with soft deletion, configurable retention periods, automatic purging, and cascade rules for related records

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `audit_trail` | audit-trail | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| record_soft_deleted | `human_required` | - | - |
| record_restored | `autonomous` | - | - |
| record_permanently_purged | `human_required` | - | - |
| delete_already_deleted | `human_required` | - | - |
| restore_expired | `autonomous` | - | - |
| permanent_delete_not_soft_deleted | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Soft Delete Blueprint",
  "description": "Trash/archive/restore pattern with soft deletion, configurable retention periods, automatic purging, and cascade rules for related records. 5 fields. 6 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "soft-delete, trash, archive, restore, purge, retention, data-lifecycle"
}
</script>
