<!-- AUTO-GENERATED FROM payload-versions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Versions

> Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status

**Category:** Data · **Version:** 1.0.0 · **Tags:** cms · versioning · drafts · publish · autosave · restore · scheduled-publish · localization · payload

## What this does

Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **status** *(select, required)* — Publication Status
- **version** *(json, required)* — Version Data
- **parent** *(text, required)* — Parent Document ID
- **snapshot** *(boolean, optional)* — Is Snapshot
- **published_locale** *(text, optional)* — Published Locale
- **latest** *(boolean, optional)* — Is Latest Version
- **autosave** *(boolean, optional)* — Is Autosave Version

## What must be true

- **versioning → max_versions_per_document:** 100
- **versioning → cleanup_strategy:** delete oldest versions beyond max
- **versioning → autosave → enabled:** configurable per collection
- **versioning → autosave → default_interval:** 2000ms
- **versioning → autosave → behavior:** updates latest version in place instead of creating new version
- **versioning → autosave → validate_on_save:** configurable
- **versioning → draft_behavior → saves_to_versions_table:** true
- **versioning → draft_behavior → required_fields_optional_in_draft:** true
- **versioning → draft_behavior → auto_replace_with_draft:** true
- **versioning → scheduled_publishing → enabled:** configurable via schedulePublish option
- **versioning → scheduled_publishing → executes_with_user_permissions:** true
- **versioning → scheduled_publishing → supports_unpublish:** true
- **versioning → localized_versioning → per_locale_status:** experimental (localizeStatus)
- **versioning → localized_versioning → snapshot_on_locale_publish:** true
- **retention → retain_deleted_versions:** configurable

## Success & failure scenarios

**✅ Success paths**

- **Enforce Max Versions** — when new version created; total versions exceed maxPerDoc limit, then Version count kept within configured maximum.
- **Save Draft** — when user has update access for this collection; versioning with drafts is enabled, then Document saved as draft — not publicly visible.
- **Publish Document** — when user has update access; document passes validation, then Document is now publicly accessible.
- **Unpublish Document** — when user has update access; status eq "published", then Document reverted to draft status.
- **Autosave Draft** — when autosave is enabled for this collection; document has unsaved changes, then Changes auto-saved without creating a new version entry.
- **Find Versions** — when user has readVersions access, then Paginated list of version history for a document.
- **Restore Version** — when user has update access; version ID exists in history, then Document restored to the state of the selected version.
- **Schedule Publish** — when scheduled publishing is enabled; user specifies a future publish date, then Document will be automatically published at the scheduled time.

## Errors it can return

- `VERSION_NOT_FOUND` — The requested version was not found
- `VERSION_ACCESS_DENIED` — You do not have permission to view version history

## Connects to

- **payload-collections** *(required)* — Versions are per-collection — each collection can enable versioning independently
- **payload-globals** *(optional)* — Globals also support versioning with the same system
- **payload-job-queue** *(optional)* — Scheduled publishing uses the job queue system
- **payload-access-control** *(required)* — readVersions access function controls who can view version history

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/payload-versions/) · **Spec source:** [`payload-versions.blueprint.yaml`](./payload-versions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
