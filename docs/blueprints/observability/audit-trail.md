---
title: "Audit Trail Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Immutable field-level change tracking for any record with automatic capture on every write, configurable per-model opt-in, and sensitive field exclusion. 11 fie"
---

# Audit Trail Blueprint

> Immutable field-level change tracking for any record with automatic capture on every write, configurable per-model opt-in, and sensitive field exclusion

| | |
|---|---|
| **Feature** | `audit-trail` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | audit-trail, change-log, history, field-tracking, immutable, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/observability/audit-trail.blueprint.yaml) |
| **JSON API** | [audit-trail.json]({{ site.baseurl }}/api/blueprints/observability/audit-trail.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `audit_id` | text | Yes | Audit Entry ID |  |
| `entity_type` | text | Yes | Entity Type |  |
| `entity_id` | text | Yes | Entity ID |  |
| `field_name` | text | No | Field Name |  |
| `old_value` | json | No | Old Value |  |
| `new_value` | json | No | New Value |  |
| `changed_by` | text | Yes | Changed By |  |
| `changed_at` | datetime | Yes | Changed At |  |
| `change_type` | select | Yes | Change Type |  |
| `change_source` | text | No | Change Source |  |
| `request_id` | text | No | Request ID |  |

## Rules

- **capture:**
  - **automatic:** true
  - **no_manual_entries:** true
  - **trigger:** on_write
  - **per_field:** true
- **immutability:**
  - **append_only:** true
  - **no_update:** true
  - **no_delete:** true
  - **tamper_detection:** optional
- **configuration:**
  - **opt_in_per_model:** true
  - **exclude_fields:** configurable
  - **excluded_field_placeholder:** [REDACTED]
- **storage:**
  - **retention_days:** configurable
  - **partition_by:** entity_type
  - **index_fields:** entity_type, entity_id, changed_at, changed_by
- **querying:**
  - **filter_by_entity:** true
  - **filter_by_field:** true
  - **filter_by_user:** true
  - **filter_by_date_range:** true
  - **sort_order:** changed_at_desc
  - **paginated:** true

## Outcomes

### Change_recorded (Priority: 1)

**Given:**
- a write operation (create, update, or delete) occurs on an audited model
- the changed fields are not in the exclusion list

**Then:**
- **create_record** target: `audit_entry` — Create immutable audit entry with entity, field, old/new values, user, and timestamp
- **emit_event** event: `audit_trail.recorded`

**Result:** Field-level change recorded in the audit trail

### Change_recorded_with_exclusion (Priority: 2)

**Given:**
- a write operation occurs on an audited model
- some changed fields are in the exclusion list

**Then:**
- **create_record** target: `audit_entry` — Create audit entry with excluded field values replaced by [REDACTED]
- **emit_event** event: `audit_trail.recorded`

**Result:** Change recorded with sensitive field values redacted

### History_retrieved (Priority: 3)

**Given:**
- a user requests the audit history for an entity
- the user has permission to view audit records

**Then:**
- **emit_event** event: `audit_trail.queried`

**Result:** Paginated audit history returned for the requested entity

### History_empty (Priority: 4)

**Given:**
- a user requests audit history for an entity
- no audit entries exist for the entity

**Result:** Empty result set returned indicating no changes have been recorded

### Audit_access_denied (Priority: 10) — Error: `AUDIT_ACCESS_DENIED`

**Given:**
- a user requests audit history
- the user does not have permission to view audit records

**Result:** Error returned indicating insufficient permissions

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUDIT_ACCESS_DENIED` | 403 | You do not have permission to view audit records | No |
| `AUDIT_ENTITY_NOT_TRACKED` | 404 | Audit trail is not enabled for this entity type | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `audit_trail.recorded` | A change was recorded in the audit trail | `audit_id`, `entity_type`, `entity_id`, `change_type`, `changed_by` |
| `audit_trail.queried` | Audit history was queried by a user | `entity_type`, `entity_id`, `queried_by`, `result_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| soft-delete | recommended | Deletion events should be captured in the audit trail |
| pagination | required | Audit history queries must be paginated for performance |
| search-and-filtering | optional | Audit entries can be searched and filtered by entity, user, and date |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Audit Trail Blueprint",
  "description": "Immutable field-level change tracking for any record with automatic capture on every write, configurable per-model opt-in, and sensitive field exclusion. 11 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "audit-trail, change-log, history, field-tracking, immutable, compliance"
}
</script>
