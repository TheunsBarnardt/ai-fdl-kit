---
title: "Payload Collections Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection. 4 fields. 14 outcomes. 5 error codes. rul"
---

# Payload Collections Blueprint

> Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection

| | |
|---|---|
| **Feature** | `payload-collections` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, headless, crud, collections, pagination, filtering, hooks, bulk-operations, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/payload-collections.blueprint.yaml) |
| **JSON API** | [payload-collections.json]({{ site.baseurl }}/api/blueprints/data/payload-collections.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `api_client` | API Client | system | REST or GraphQL client consuming the Payload API |
| `admin_user` | Admin User | human | User with admin panel access managing collection documents |
| `hook_system` | Hook System | system | Lifecycle hook engine executing beforeValidate, beforeChange, afterChange, etc. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `id` | text | Yes |  |  |
| `created_at` | datetime | Yes |  |  |
| `updated_at` | datetime | Yes |  |  |
| `slug` | text | Yes | Collection Slug | Validations: required, pattern |

## Rules

- **data:**
  - **pagination:**
    - **default_limit:** 10
    - **available_limits:** 5, 10, 25, 50, 100
    - **page_numbering:** 1-indexed
    - **disable_with_limit_zero:** true
  - **query_operators:** equals, not_equals, like, contains, in, not_in, exists, greater_than, greater_than_equal, less_than, less_than_equal, all, within, intersects, near
  - **logical_operators:** and, or, nor
  - **sort:**
    - **format:** field or -field (prefix with - for descending)
    - **multiple:** true
    - **default:** -createdAt
  - **field_selection:**
    - **select_include:** true
    - **select_exclude:** true
  - **relationship_population:**
    - **depth_control:** true
    - **default_depth:** 2
    - **selective_populate:** true
  - **timestamps:**
    - **auto_created_at:** true
    - **auto_updated_at:** true
  - **soft_delete:**
    - **trash_support:** true
    - **auto_filter_trashed:** true
- **hooks:**
  - **lifecycle_order:**
    - **create:** beforeOperation, beforeValidate, beforeChange, database write, afterChange, afterOperation
    - **read:** beforeOperation, database query, afterRead, beforeRead, afterOperation
    - **update:** beforeOperation, beforeValidate, beforeChange, database write, afterChange, afterOperation
    - **delete:** beforeOperation, beforeDelete, database delete, afterDelete, afterOperation
  - **field_level_hooks:** true
  - **transaction_support:** true

## Outcomes

### Access_denied (Priority: 1) — Error: `COLLECTION_FORBIDDEN`

**Given:**
- access function returns false
- disableErrors is not set

**Result:** 403 Forbidden error

### Find_by_id_not_found (Priority: 5) — Error: `COLLECTION_NOT_FOUND`

**Given:**
- `id` (db) not_exists

**Result:** 404 error indicating document does not exist

### Create_document (Priority: 10) | Transaction: atomic

**Given:**
- user has create access for this collection
- data passes field validation

**Then:**
- beforeValidate hooks execute
- beforeChange hooks execute (collection and field level)
- **create_record** target: `collection document` — Insert document into database
- afterChange hooks execute with saved document
- **emit_event** event: `collection.create`

**Result:** Created document returned with populated relationships (per depth setting)

### Find_documents (Priority: 10)

**Given:**
- user has read access for this collection

**Then:**
- access control WHERE clause merged with user query
- trashed documents auto-filtered (unless trash:true in query)
- afterRead hooks execute on each document

**Result:** Paginated response with docs array, totalDocs, totalPages, page, hasNextPage, hasPrevPage, limit

### Find_by_id (Priority: 10)

**Given:**
- user has read access for this collection
- `id` (input) exists

**Then:**
- afterRead hooks execute on document
- lock status checked if includeLockStatus:true

**Result:** Single document returned with populated relationships

### Update_by_id (Priority: 10) | Transaction: atomic

**Given:**
- user has update access for this collection
- `id` (input) exists
- data passes field validation
- document is not locked by another user (or overrideLock:true)

**Then:**
- beforeValidate hooks execute with original document
- beforeChange hooks execute
- **set_field** target: `updated_at` value: `now`
- afterChange hooks execute with previous and new document

**Result:** Updated document returned

### Bulk_update (Priority: 10) | Transaction: atomic

**Given:**
- user has update access for this collection
- where clause matches one or more documents

**Then:**
- each matching document processed through full hook lifecycle

**Result:** BulkOperationResult with docs array and errors array (partial success supported)

### Delete_by_id (Priority: 10) | Transaction: atomic

**Given:**
- user has delete access for this collection
- `id` (input) exists
- document is not locked (or overrideLock:true)

**Then:**
- beforeDelete hooks execute
- **delete_record** target: `collection document` — Remove from database (or move to trash if trash enabled)
- afterDelete hooks execute with deleted document
- all associated versions deleted
- locked document record removed

**Result:** Deleted document returned

### Bulk_delete (Priority: 10)

**Given:**
- user has delete access for this collection
- where clause matches one or more documents

**Then:**
- each matching document processed through delete lifecycle

**Result:** BulkOperationResult with deleted docs and any errors

### Duplicate_document (Priority: 10)

**Given:**
- user has create access for this collection
- `id` (input) exists

**Then:**
- source document fetched
- new document created via create operation with duplicateFromID

**Result:** New document created as clone of source

### Count_documents (Priority: 10)

**Given:**
- user has read access for this collection

**Result:** Returns totalDocs count matching the where clause

### Find_distinct (Priority: 10)

**Given:**
- user has read access
- field parameter specifies which field to get unique values for

**Result:** Paginated list of unique field values matching the query

### Restore_version (Priority: 10)

**Given:**
- user has update access
- versioning is enabled for this collection
- version ID exists

**Then:**
- version data merged with current document
- full update lifecycle executed
- new version created recording the restore

**Result:** Document restored to specified version state

### Doc_access_check (Priority: 10)

**Given:**
- user is authenticated

**Result:** Returns permission object with create/read/update/delete booleans and field-level access for each field

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COLLECTION_NOT_FOUND` | 404 | The requested document was not found | No |
| `COLLECTION_FORBIDDEN` | 403 | You are not allowed to perform this action | No |
| `COLLECTION_VALIDATION_ERROR` | 400 | The data provided did not pass validation | Yes |
| `COLLECTION_LOCKED` | 423 | This document is currently being edited by another user | Yes |
| `COLLECTION_QUERY_ERROR` | 400 | The query contains invalid field paths or operators | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `collection.create` | Emitted after successful document creation — triggers afterChange hooks | `collection_slug`, `document_id`, `user_id`, `timestamp` |
| `collection.update` | Emitted after successful document update | `collection_slug`, `document_id`, `user_id`, `timestamp`, `changed_fields` |
| `collection.delete` | Emitted after successful document deletion | `collection_slug`, `document_id`, `user_id`, `timestamp` |
| `collection.read` | Emitted on document read — triggers afterRead hooks | `collection_slug`, `document_id`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-auth | optional | Collections can be auth-enabled to add login/registration capabilities |
| payload-access-control | required | Every collection operation checks access control functions |
| payload-versions | optional | Collections can enable versioning for draft/publish and history |
| payload-uploads | optional | Collections can be upload-enabled for file management |
| payload-document-locking | optional | Collections support document locking to prevent concurrent edits |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x (Next.js-based)
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
  orm: Drizzle (SQL) / Mongoose (MongoDB)
rest_endpoints:
  - method: GET
    path: /api/{slug}
    operation: find
  - method: POST
    path: /api/{slug}
    operation: create
  - method: PATCH
    path: /api/{slug}
    operation: bulk_update
  - method: DELETE
    path: /api/{slug}
    operation: bulk_delete
  - method: GET
    path: /api/{slug}/:id
    operation: findByID
  - method: PATCH
    path: /api/{slug}/:id
    operation: updateByID
  - method: DELETE
    path: /api/{slug}/:id
    operation: deleteByID
  - method: POST
    path: /api/{slug}/:id/duplicate
    operation: duplicate
  - method: GET
    path: /api/{slug}/count
    operation: count
  - method: GET
    path: /api/{slug}/versions
    operation: findVersions
  - method: GET
    path: /api/{slug}/versions/:id
    operation: findVersionByID
  - method: POST
    path: /api/{slug}/versions/:id
    operation: restoreVersion
  - method: POST
    path: /api/{slug}/access/:id?
    operation: docAccess
field_types:
  - text
  - email
  - textarea
  - number
  - checkbox
  - date
  - select
  - radio
  - upload
  - relationship
  - array
  - group
  - blocks
  - tabs
  - row
  - collapsible
  - code
  - json
  - richtext
  - point
  - join
  - ui
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Collections Blueprint",
  "description": "Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection. 4 fields. 14 outcomes. 5 error codes. rul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, headless, crud, collections, pagination, filtering, hooks, bulk-operations, payload"
}
</script>
