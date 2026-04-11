<!-- AUTO-GENERATED FROM payload-access-control.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Access Control

> Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results

**Category:** Access · **Version:** 1.0.0 · **Tags:** cms · access-control · permissions · rbac · field-level · document-level · where-clause · payload

## What this does

Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **access_result** *(json, required)* — Access Result
- **permission_object** *(json, required)* — Permission Object

## What must be true

- **access → collection_level_operations:** create, read, update, delete, admin, readVersions, unlock
- **access → global_level_operations:** read, update, readVersions
- **access → field_level_operations:** create, read, update
- **access → access_function_signature → input:** {req, id?, data?}
- **access → access_function_signature → output:** boolean | Where clause | Promise<boolean | Where>
- **access → where_clause_merging:** When access returns a Where clause, it is AND-merged with the user query
- **access → where_clause_merging → enables_row_level_security:** true
- **access → default_access_function:** Boolean(req.user)
- **access → override_access:** Bypasses all access checks — used by admin operations, scheduled tasks, webhooks
- **access → override_access → flag:** overrideAccess: true
- **access → disable_errors:** Returns empty results instead of throwing Forbidden on access denial
- **access → disable_errors → flag:** disableErrors: true
- **security → field_level_access_context:** doc (full document), siblingData (parent object), blockData (nearest block parent), req (request with user), id (document ID)
- **security → block_reference_permissions:** true

## Success & failure scenarios

**✅ Success paths**

- **Access Denied Silent** — when access function returns false; disableErrors is set to true, then Empty result set returned (no error thrown).
- **Field Access Denied** — when field-level access function returns false for a specific field, then Field silently excluded — no error, field just absent from response.
- **Access Granted Boolean** — when access function returns true, then Operation proceeds with no additional query constraints.
- **Access Granted Where** — when access function returns a Where clause object, then Operation proceeds with row-level filtering applied.
- **Doc Access Check** — when user requests permission check via /access/:id endpoint, then Complete permission object returned with boolean flags for each operation and each field.
- **Admin Panel Access** — when user attempts to access admin panel for a collection, then User granted or denied access to this collection in the admin UI.

**❌ Failure paths**

- **Access Denied** — when access function returns false; disableErrors is not set, then 403 Forbidden error thrown. *(error: `ACCESS_FORBIDDEN`)*

## Errors it can return

- `ACCESS_FORBIDDEN` — You are not allowed to perform this action
- `ACCESS_UNAUTHORIZED` — You must be logged in to perform this action

## Connects to

- **payload-auth** *(required)* — Access control depends on authenticated user identity from auth system
- **payload-collections** *(required)* — Access functions are configured per collection
- **payload-globals** *(required)* — Globals have their own access control configuration

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/payload-access-control/) · **Spec source:** [`payload-access-control.blueprint.yaml`](./payload-access-control.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
