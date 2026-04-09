---
title: "Payload Versions Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status. 7 fields. 8 outcomes. 2 e"
---

# Payload Versions Blueprint

> Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status

| | |
|---|---|
| **Feature** | `payload-versions` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, versioning, drafts, publish, autosave, restore, scheduled-publish, localization, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/payload-versions.blueprint.yaml) |
| **JSON API** | [payload-versions.json]({{ site.baseurl }}/api/blueprints/data/payload-versions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `editor` | Editor | human | Content editor creating drafts, publishing, and restoring versions |
| `scheduler` | Scheduler | system | Job-based scheduler for future publish/unpublish operations |
| `autosave_engine` | Autosave Engine | system | Interval-based autosave that updates the latest version in place |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `status` | select | Yes | Publication Status |  |
| `version` | json | Yes | Version Data |  |
| `parent` | text | Yes | Parent Document ID |  |
| `snapshot` | boolean | No | Is Snapshot |  |
| `published_locale` | text | No | Published Locale |  |
| `latest` | boolean | No | Is Latest Version |  |
| `autosave` | boolean | No | Is Autosave Version |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `published` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `published` | editor |  |
|  | `published` | `draft` | editor |  |

## Rules

- **versioning:**
  - **max_versions_per_document:** 100
  - **cleanup_strategy:** delete oldest versions beyond max
  - **autosave:**
    - **enabled:** configurable per collection
    - **default_interval:** 2000ms
    - **behavior:** updates latest version in place instead of creating new version
    - **validate_on_save:** configurable
  - **draft_behavior:**
    - **saves_to_versions_table:** true
    - **required_fields_optional_in_draft:** true
    - **auto_replace_with_draft:** true
  - **scheduled_publishing:**
    - **enabled:** configurable via schedulePublish option
    - **executes_with_user_permissions:** true
    - **supports_unpublish:** true
  - **localized_versioning:**
    - **per_locale_status:** experimental (localizeStatus)
    - **snapshot_on_locale_publish:** true
- **retention:**
  - **retain_deleted_versions:** configurable

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| autosave_interval |  |  |

## Outcomes

### Enforce_max_versions (Priority: 1)

**Given:**
- new version created
- total versions exceed maxPerDoc limit

**Then:**
- oldest versions beyond the limit deleted

**Result:** Version count kept within configured maximum

### Save_draft (Priority: 10)

**Given:**
- user has update access for this collection
- versioning with drafts is enabled

**Then:**
- **transition_state** field: `status` from: `*` to: `draft`
- version record created (or latest updated if autosave)

**Result:** Document saved as draft — not publicly visible

### Publish_document (Priority: 10) | Transaction: atomic

**Given:**
- user has update access
- document passes validation

**Then:**
- **transition_state** field: `status` from: `draft` to: `published`
- main collection document updated with published data
- version record created marking published state
- scheduled publish jobs cancelled if any

**Result:** Document is now publicly accessible

### Unpublish_document (Priority: 10)

**Given:**
- user has update access
- `status` (db) eq `published`

**Then:**
- **transition_state** field: `status` from: `published` to: `draft`
- latest version updated (no new version created)

**Result:** Document reverted to draft status

### Autosave_draft (Priority: 10)

**Given:**
- autosave is enabled for this collection
- document has unsaved changes

**Then:**
- latest version updated in place (not a new version)
- version marked with autosave:true flag

**Result:** Changes auto-saved without creating a new version entry

### Find_versions (Priority: 10)

**Given:**
- user has readVersions access

**Result:** Paginated list of version history for a document

### Restore_version (Priority: 10) | Transaction: atomic

**Given:**
- user has update access
- version ID exists in history

**Then:**
- version data merged with current document
- full update lifecycle executed (hooks, validation)
- new version created recording the restore
- original createdAt preserved

**Result:** Document restored to the state of the selected version

### Schedule_publish (Priority: 10)

**Given:**
- scheduled publishing is enabled
- user specifies a future publish date

**Then:**
- job created in payload-jobs queue
- job stores: target document, desired status, user, locale

**Result:** Document will be automatically published at the scheduled time

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VERSION_NOT_FOUND` | 404 | The requested version was not found | No |
| `VERSION_ACCESS_DENIED` | 403 | You do not have permission to view version history | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `version.created` | Emitted when a new version is saved | `collection_slug`, `document_id`, `version_id`, `status`, `user_id` |
| `version.published` | Emitted when a document is published | `collection_slug`, `document_id`, `version_id`, `locale`, `user_id` |
| `version.restored` | Emitted when a previous version is restored | `collection_slug`, `document_id`, `restored_version_id`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-collections | required | Versions are per-collection — each collection can enable versioning independently |
| payload-globals | optional | Globals also support versioning with the same system |
| payload-job-queue | optional | Scheduled publishing uses the job queue system |
| payload-access-control | required | readVersions access function controls who can view version history |

## AGI Readiness

### Goals

#### Reliable Payload Versions

Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status

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
| `payload_collections` | payload-collections | degrade |
| `payload_access_control` | payload-access-control | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| save_draft | `autonomous` | - | - |
| publish_document | `autonomous` | - | - |
| unpublish_document | `autonomous` | - | - |
| autosave_draft | `autonomous` | - | - |
| find_versions | `autonomous` | - | - |
| restore_version | `autonomous` | - | - |
| schedule_publish | `autonomous` | - | - |
| enforce_max_versions | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
database_structure:
  published_documents: main collection table
  versions: separate _versions collection/table per collection
  indexes:
    - parent
    - _status
    - updatedAt
    - latest
    - autosave
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Versions Blueprint",
  "description": "Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status. 7 fields. 8 outcomes. 2 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, versioning, drafts, publish, autosave, restore, scheduled-publish, localization, payload"
}
</script>
