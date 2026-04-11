<!-- AUTO-GENERATED FROM payload-collections.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Collections

> Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection

**Category:** Data · **Version:** 1.0.0 · **Tags:** cms · headless · crud · collections · pagination · filtering · hooks · bulk-operations · payload

## What this does

Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **id** *(text, required)*
- **created_at** *(datetime, required)*
- **updated_at** *(datetime, required)*
- **slug** *(text, required)* — Collection Slug

## What must be true

- **data → pagination → default_limit:** 10
- **data → pagination → available_limits:** 5, 10, 25, 50, 100
- **data → pagination → page_numbering:** 1-indexed
- **data → pagination → disable_with_limit_zero:** true
- **data → query_operators:** equals, not_equals, like, contains, in, not_in, exists, greater_than, greater_than_equal, less_than, less_than_equal, all, within, intersects, near
- **data → logical_operators:** and, or, nor
- **data → sort → format:** field or -field (prefix with - for descending)
- **data → sort → multiple:** true
- **data → sort → default:** -createdAt
- **data → field_selection → select_include:** true
- **data → field_selection → select_exclude:** true
- **data → relationship_population → depth_control:** true
- **data → relationship_population → default_depth:** 2
- **data → relationship_population → selective_populate:** true
- **data → timestamps → auto_created_at:** true
- **data → timestamps → auto_updated_at:** true
- **data → soft_delete → trash_support:** true
- **data → soft_delete → auto_filter_trashed:** true
- **hooks → lifecycle_order → create:** beforeOperation, beforeValidate, beforeChange, database write, afterChange, afterOperation
- **hooks → lifecycle_order → read:** beforeOperation, database query, afterRead, beforeRead, afterOperation
- **hooks → lifecycle_order → update:** beforeOperation, beforeValidate, beforeChange, database write, afterChange, afterOperation
- **hooks → lifecycle_order → delete:** beforeOperation, beforeDelete, database delete, afterDelete, afterOperation
- **hooks → field_level_hooks:** true
- **hooks → transaction_support:** true

## Success & failure scenarios

**✅ Success paths**

- **Create Document** — when user has create access for this collection; data passes field validation, then Created document returned with populated relationships (per depth setting).
- **Find Documents** — when user has read access for this collection, then Paginated response with docs array, totalDocs, totalPages, page, hasNextPage, hasPrevPage, limit.
- **Find By Id** — when user has read access for this collection; id exists, then Single document returned with populated relationships.
- **Update By Id** — when user has update access for this collection; id exists; data passes field validation; document is not locked by another user (or overrideLock:true), then Updated document returned.
- **Bulk Update** — when user has update access for this collection; where clause matches one or more documents, then BulkOperationResult with docs array and errors array (partial success supported).
- **Delete By Id** — when user has delete access for this collection; id exists; document is not locked (or overrideLock:true), then Deleted document returned.
- **Bulk Delete** — when user has delete access for this collection; where clause matches one or more documents, then BulkOperationResult with deleted docs and any errors.
- **Duplicate Document** — when user has create access for this collection; Source document ID to duplicate from, then New document created as clone of source.
- **Count Documents** — when user has read access for this collection, then Returns totalDocs count matching the where clause.
- **Find Distinct** — when user has read access; field parameter specifies which field to get unique values for, then Paginated list of unique field values matching the query.
- **Restore Version** — when user has update access; versioning is enabled for this collection; version ID exists, then Document restored to specified version state.
- **Doc Access Check** — when user is authenticated, then Returns permission object with create/read/update/delete booleans and field-level access for each field.

**❌ Failure paths**

- **Access Denied** — when access function returns false; disableErrors is not set, then 403 Forbidden error. *(error: `COLLECTION_FORBIDDEN`)*
- **Find By Id Not Found** — when id not_exists, then 404 error indicating document does not exist. *(error: `COLLECTION_NOT_FOUND`)*

## Errors it can return

- `COLLECTION_NOT_FOUND` — The requested document was not found
- `COLLECTION_FORBIDDEN` — You are not allowed to perform this action
- `COLLECTION_VALIDATION_ERROR` — The data provided did not pass validation
- `COLLECTION_LOCKED` — This document is currently being edited by another user
- `COLLECTION_QUERY_ERROR` — The query contains invalid field paths or operators

## Connects to

- **payload-auth** *(optional)* — Collections can be auth-enabled to add login/registration capabilities
- **payload-access-control** *(required)* — Every collection operation checks access control functions
- **payload-versions** *(optional)* — Collections can enable versioning for draft/publish and history
- **payload-uploads** *(optional)* — Collections can be upload-enabled for file management
- **payload-document-locking** *(optional)* — Collections support document locking to prevent concurrent edits

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/payload-collections/) · **Spec source:** [`payload-collections.blueprint.yaml`](./payload-collections.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
