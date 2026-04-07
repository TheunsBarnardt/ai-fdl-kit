---
title: "Payload Document Locking Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Automatic document locking to prevent concurrent editing with configurable lock duration and override capability. 3 fields. 7 outcomes. 1 error codes. rules: lo"
---

# Payload Document Locking Blueprint

> Automatic document locking to prevent concurrent editing with configurable lock duration and override capability

| | |
|---|---|
| **Feature** | `payload-document-locking` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, locking, concurrent-editing, document-lock, pessimistic-locking, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/payload-document-locking.blueprint.yaml) |
| **JSON API** | [payload-document-locking.json]({{ site.baseurl }}/api/blueprints/data/payload-document-locking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `editor` | Editor | human | User currently editing a document and holding the lock |
| `other_user` | Other User | human | Another user attempting to edit a locked document |
| `lock_system` | Lock System | system | Payload's automatic lock management system |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `document` | json | Yes | Locked Document Reference |  |
| `global_slug` | text | No | Locked Global Slug |  |
| `user` | json | Yes | Lock Owner |  |

## Rules

- **locking:**
  - **enabled_by_default:** true
  - **configurable_per_collection:** true
  - **disable_option:** lockDocuments: false
  - **lock_duration:**
    - **default:** 5m
    - **auto_release:** true
  - **requires_auth_collection:** true
  - **auto_created_collection:** payload-locked-documents
- **access:**
  - **create:** defaultAccess (must be authenticated)
  - **read:** defaultAccess
  - **update:** defaultAccess
  - **delete:** defaultAccess

## Outcomes

### Lock_conflict (Priority: 3) — Error: `DOCUMENT_LOCKED`

**Given:**
- user attempts to edit a document
- document is locked by another user
- lock has not expired

**Result:** User informed document is being edited by another user

### Lock_expired (Priority: 4)

**Given:**
- document has a lock record
- lock duration has exceeded the configured maximum

**Then:**
- lock treated as released

**Result:** Document available for editing by any user

### Lock_override (Priority: 5)

**Given:**
- user has appropriate permissions
- overrideLock flag is set on the operation

**Then:**
- existing lock removed
- operation proceeds as normal

**Result:** Lock overridden, operation completed

### Lock_acquired (Priority: 10)

**Given:**
- user opens a document for editing
- document is not currently locked by another user

**Then:**
- **create_record** target: `payload-locked-documents` — Lock record created with document reference and user

**Result:** Document locked — other users see it as being edited

### Lock_released (Priority: 10)

**Given:**
- user finishes editing (navigates away or explicitly releases)

**Then:**
- **delete_record** target: `payload-locked-documents` — Lock record removed

**Result:** Document unlocked and available for others

### Lock_on_delete (Priority: 10)

**Given:**
- document is being deleted

**Then:**
- associated lock record removed

**Result:** Lock cleaned up with document deletion

### Lock_status_check (Priority: 10)

**Given:**
- includeLockStatus flag set on findByID operation

**Result:** Lock status returned alongside document data — includes who locked it and when

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DOCUMENT_LOCKED` | 423 | This document is currently being edited by another user | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `document.locked` | Emitted when a document is locked for editing | `collection_slug`, `document_id`, `user_id`, `timestamp` |
| `document.unlocked` | Emitted when a document lock is released | `collection_slug`, `document_id`, `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-collections | required | Locking applies to collection documents |
| payload-globals | optional | Globals also support document locking |
| payload-auth | required | Lock requires authenticated user to track lock ownership |
| payload-access-control | required | Lock override requires appropriate permissions |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
auto_created_entities:
  - name: payload-locked-documents
    type: collection
    description: Hidden system collection storing active document locks
    hidden: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Document Locking Blueprint",
  "description": "Automatic document locking to prevent concurrent editing with configurable lock duration and override capability. 3 fields. 7 outcomes. 1 error codes. rules: lo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, locking, concurrent-editing, document-lock, pessimistic-locking, payload"
}
</script>
