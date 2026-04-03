---
title: "Audit Logging Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Immutable, append-only audit trail with tamper detection and compliance-ready querying. 13 fields. 5 outcomes. 4 error codes. rules: immutability, tamper_detect"
---

# Audit Logging Blueprint

> Immutable, append-only audit trail with tamper detection and compliance-ready querying

| | |
|---|---|
| **Feature** | `audit-logging` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | audit, logging, compliance, security, immutable, trail, monitoring, forensics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/observability/audit-logging.blueprint.yaml) |
| **JSON API** | [audit-logging.json]({{ site.baseurl }}/api/blueprints/observability/audit-logging.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `audit_id` | text | Yes | Audit Entry ID |  |
| `actor_id` | text | Yes | Actor ID | Validations: required |
| `actor_type` | select | Yes | Actor Type | Validations: required |
| `action` | text | Yes | Action | Validations: required, pattern |
| `resource_type` | text | Yes | Resource Type | Validations: required |
| `resource_id` | text | Yes | Resource ID | Validations: required |
| `changes` | json | No | Changes |  |
| `ip_address` | text | Yes | IP Address | Validations: required |
| `user_agent` | text | No | User Agent | Validations: maxLength |
| `timestamp` | datetime | Yes | Timestamp |  |
| `hash` | text | Yes | Entry Hash |  |
| `previous_hash` | text | Yes | Previous Entry Hash |  |
| `metadata` | json | No | Metadata |  |

## Rules

- **immutability:**
  - **append_only:** true
  - **no_update:** true
  - **no_delete:** true
  - **soft_delete_prohibited:** true
- **tamper_detection:**
  - **algorithm:** sha256
  - **hash_chain:** true
  - **genesis_seed:** fdl-audit-genesis-v1
  - **verification_schedule:** daily
- **retention:**
  - **default_days:** 2555
  - **minimum_days:** 365
  - **deletion_method:** crypto_shred
- **storage:**
  - **separate_database:** true
  - **write_ahead_log:** true
  - **compression:** true
  - **indexing:** actor_id, action, resource_type, resource_id, timestamp
- **query:**
  - **max_results_per_page:** 100
  - **require_date_range:** true
  - **max_date_range_days:** 90
  - **export_formats:** json, csv

## Outcomes

### Entry_created (Priority: 1) | Transaction: atomic

**Given:**
- `actor_id` (computed) exists
- `action` (input) exists
- `resource_type` (input) exists
- `resource_id` (input) exists

**Then:**
- **set_field** target: `timestamp` value: `now` — Set server-side UTC timestamp
- **set_field** target: `hash` value: `sha256(previous_hash + entry_data)` — Compute hash chain entry
- **create_record** target: `audit_log` — Append entry to the immutable audit log
- **emit_event** event: `audit.entry_created`

**Result:** audit entry appended to the immutable log

### Query_range_exceeded (Priority: 2) — Error: `AUDIT_QUERY_RANGE_EXCEEDED`

**Given:**
- `date_range_days` (computed) gt `90`

**Result:** show "Please narrow your date range to 90 days or fewer"

### Chain_tamper_detected (Priority: 3) — Error: `AUDIT_TAMPER_DETECTED`

**Given:**
- `chain_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `audit.tamper_detected`
- **notify** — Alert security team immediately

**Result:** report tamper detection with details of the first broken link

### Query_results (Priority: 5)

**Given:**
- `date_range` (input) exists
- `date_range_days` (computed) lte `90`

**Result:** return paginated audit entries matching the filter criteria

### Chain_integrity_verified (Priority: 6)

**Given:**
- `chain_valid` (computed) eq `true`

**Result:** return integrity verification report with status pass

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUDIT_IMMUTABLE` | 403 | Audit records cannot be modified or deleted | No |
| `AUDIT_QUERY_RANGE_EXCEEDED` | 422 | Date range must not exceed 90 days | Yes |
| `AUDIT_TAMPER_DETECTED` | 500 | Audit log integrity check failed — possible tampering detected | No |
| `AUDIT_WRITE_FAILED` | 500 | Failed to write audit entry. The operation has been rolled back. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `audit.entry_created` | New audit log entry appended | `audit_id`, `actor_id`, `action`, `resource_type`, `resource_id`, `timestamp` |
| `audit.tamper_detected` | Hash chain integrity check failed — possible tampering | `first_invalid_entry_id`, `expected_hash`, `actual_hash`, `timestamp` |
| `audit.retention_purge` | Entries beyond retention period crypto-shredded | `purged_count`, `oldest_entry_date`, `timestamp` |
| `audit.export_completed` | Audit log export completed | `export_id`, `format`, `record_count`, `date_range`, `requested_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | recommended | Authentication events should be captured in the audit trail |
| role-based-access | recommended | Permission changes and access decisions should be audited |
| data-privacy-compliance | recommended | GDPR/CCPA compliance requires audit trails for data access |
| team-organization | optional | Audit entries can be scoped per organization for multi-tenancy |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: table_with_filters
max_width: 1400px
actions:
  primary:
    label: Search Logs
    type: submit
  secondary:
    label: Export
    type: button
fields_order:
  - timestamp
  - actor_id
  - action
  - resource_type
  - resource_id
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Audit Logging Blueprint",
  "description": "Immutable, append-only audit trail with tamper detection and compliance-ready querying. 13 fields. 5 outcomes. 4 error codes. rules: immutability, tamper_detect",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "audit, logging, compliance, security, immutable, trail, monitoring, forensics"
}
</script>
