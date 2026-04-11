<!-- AUTO-GENERATED FROM payload-document-locking.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Document Locking

> Automatic document locking to prevent concurrent editing with configurable lock duration and override capability

**Category:** Data · **Version:** 1.0.0 · **Tags:** cms · locking · concurrent-editing · document-lock · pessimistic-locking · payload

## What this does

Automatic document locking to prevent concurrent editing with configurable lock duration and override capability

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **document** *(json, required)* — Locked Document Reference
- **global_slug** *(text, optional)* — Locked Global Slug
- **user** *(json, required)* — Lock Owner

## What must be true

- **locking → enabled_by_default:** true
- **locking → configurable_per_collection:** true
- **locking → disable_option:** lockDocuments: false
- **locking → lock_duration → default:** 5m
- **locking → lock_duration → auto_release:** true
- **locking → requires_auth_collection:** true
- **locking → auto_created_collection:** payload-locked-documents
- **access → create:** defaultAccess (must be authenticated)
- **access → read:** defaultAccess
- **access → update:** defaultAccess
- **access → delete:** defaultAccess

## Success & failure scenarios

**✅ Success paths**

- **Lock Expired** — when document has a lock record; lock duration has exceeded the configured maximum, then Document available for editing by any user.
- **Lock Override** — when user has appropriate permissions; overrideLock flag is set on the operation, then Lock overridden, operation completed.
- **Lock Acquired** — when user opens a document for editing; document is not currently locked by another user, then Document locked — other users see it as being edited.
- **Lock Released** — when user finishes editing (navigates away or explicitly releases), then Document unlocked and available for others.
- **Lock On Delete** — when document is being deleted, then Lock cleaned up with document deletion.
- **Lock Status Check** — when includeLockStatus flag set on findByID operation, then Lock status returned alongside document data — includes who locked it and when.

**❌ Failure paths**

- **Lock Conflict** — when user attempts to edit a document; document is locked by another user; lock has not expired, then User informed document is being edited by another user. *(error: `DOCUMENT_LOCKED`)*

## Errors it can return

- `DOCUMENT_LOCKED` — This document is currently being edited by another user

## Connects to

- **payload-collections** *(required)* — Locking applies to collection documents
- **payload-globals** *(optional)* — Globals also support document locking
- **payload-auth** *(required)* — Lock requires authenticated user to track lock ownership
- **payload-access-control** *(required)* — Lock override requires appropriate permissions

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/payload-document-locking/) · **Spec source:** [`payload-document-locking.blueprint.yaml`](./payload-document-locking.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
