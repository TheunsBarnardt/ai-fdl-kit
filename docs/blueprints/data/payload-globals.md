---
title: "Payload Globals Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Singleton document management for site-wide settings, navigation, headers, and footers with versioning and access control. 3 fields. 5 outcomes. 3 error codes. "
---

# Payload Globals Blueprint

> Singleton document management for site-wide settings, navigation, headers, and footers with versioning and access control

| | |
|---|---|
| **Feature** | `payload-globals` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, globals, singleton, settings, configuration, site-wide, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/payload-globals.blueprint.yaml) |
| **JSON API** | [payload-globals.json]({{ site.baseurl }}/api/blueprints/data/payload-globals.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `admin` | Admin | human | Administrator managing global settings |
| `api_client` | API Client | system | REST or GraphQL client reading global data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `slug` | text | Yes | Global Slug | Validations: required, pattern |
| `created_at` | datetime | Yes |  |  |
| `updated_at` | datetime | Yes |  |  |

## Rules

- **data:**
  - **singleton_pattern:** true
  - **no_id_field:** true
  - **hooks_supported:** beforeOperation, beforeRead, afterRead, beforeValidate, beforeChange, afterChange
  - **versioning_supported:** true
  - **localization_supported:** true
- **access:**
  - **operations:** read, update, readVersions

## Outcomes

### Find_global (Priority: 10)

**Given:**
- user has read access for this global

**Then:**
- beforeOperation hooks execute
- document retrieved from database
- afterRead hooks execute
- draft replaced if available and requested

**Result:** Single global document returned with populated relationships

### Update_global (Priority: 10) | Transaction: atomic

**Given:**
- user has update access for this global
- data passes field validation
- document is not locked by another user

**Then:**
- beforeValidate hooks execute
- beforeChange hooks execute
- document updated in database
- version created if versioning enabled
- afterChange hooks execute

**Result:** Updated global document returned

### Find_global_versions (Priority: 10)

**Given:**
- user has readVersions access
- versioning is enabled for this global

**Result:** Paginated list of version history

### Restore_global_version (Priority: 10) | Transaction: atomic

**Given:**
- user has update access
- versioning is enabled
- version ID exists

**Then:**
- global restored to specified version state
- new version created recording the restore

**Result:** Global restored to previous version

### Global_doc_access (Priority: 10)

**Given:**
- user is authenticated

**Result:** Returns permission object with read/update/readVersions booleans and field-level access

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GLOBAL_FORBIDDEN` | 403 | You are not allowed to access this global | No |
| `GLOBAL_VALIDATION_ERROR` | 400 | The data provided did not pass validation | Yes |
| `GLOBAL_DUPLICATE` | 500 | A global with this slug already exists | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `global.update` | Emitted after a global document is updated | `global_slug`, `user_id`, `timestamp` |
| `global.read` | Emitted on global read — triggers afterRead hooks | `global_slug`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-collections | optional | Globals complement collections — collections for multiple docs, globals for singletons |
| payload-access-control | required | Globals have their own access control configuration |
| payload-versions | optional | Globals support the same versioning system as collections |
| payload-document-locking | optional | Globals support document locking |

## AGI Readiness

### Goals

#### Reliable Payload Globals

Singleton document management for site-wide settings, navigation, headers, and footers with versioning and access control

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

- before making irreversible changes

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
| `payload_access_control` | payload-access-control | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| find_global | `autonomous` | - | - |
| update_global | `supervised` | - | - |
| find_global_versions | `autonomous` | - | - |
| restore_global_version | `autonomous` | - | - |
| global_doc_access | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
rest_endpoints:
  - method: GET
    path: /api/globals/{slug}
    operation: findOne
  - method: POST
    path: /api/globals/{slug}
    operation: update
  - method: GET
    path: /api/globals/{slug}/versions
    operation: findVersions
  - method: GET
    path: /api/globals/{slug}/versions/:id
    operation: findVersionByID
  - method: POST
    path: /api/globals/{slug}/versions/:id
    operation: restoreVersion
  - method: POST
    path: /api/globals/{slug}/access
    operation: docAccess
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Globals Blueprint",
  "description": "Singleton document management for site-wide settings, navigation, headers, and footers with versioning and access control. 3 fields. 5 outcomes. 3 error codes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, globals, singleton, settings, configuration, site-wide, payload"
}
</script>
