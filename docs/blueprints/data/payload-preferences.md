---
title: "Payload Preferences Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Per-user preferences storage for admin UI state including collapsed fields, tab positions, column visibility, sort order, and list view settings. 3 fields. 4 ou"
---

# Payload Preferences Blueprint

> Per-user preferences storage for admin UI state including collapsed fields, tab positions, column visibility, sort order, and list view settings

| | |
|---|---|
| **Feature** | `payload-preferences` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, preferences, user-settings, ui-state, personalization, admin-panel, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/payload-preferences.blueprint.yaml) |
| **JSON API** | [payload-preferences.json]({{ site.baseurl }}/api/blueprints/data/payload-preferences.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `admin_user` | Admin User | human | Authenticated user whose UI preferences are stored |
| `admin_panel` | Admin Panel | system | Payload admin UI that reads and writes preferences |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user` | json | Yes | Preference Owner |  |
| `key` | text | Yes | Preference Key |  |
| `value` | json | Yes | Preference Value |  |

## Rules

- **data:**
  - **key_value_storage:** true
  - **composite_key:** user + key
  - **preference_types:**
    - **collapsed_fields:** string array of collapsed field paths
    - **tab_indices:** array of {path: tabIndex} objects
    - **field_state:** {collapsed: string[], tabIndex: number} per field
    - **document_preferences:** {fields: {[key]: fieldState}}
    - **column_preferences:** [{accessor, active}] for list view columns
    - **collection_preferences:**
      - **columns:** column visibility and order
      - **edit_view_type:** 'default' | 'live-preview'
      - **group_by:** field to group list by
      - **limit:** items per page
      - **list_view_type:** 'folders' | 'list'
      - **preset:** saved query preset ID
      - **sort:** sort field
- **access:**
  - **per_user_isolation:** true
  - **hidden_from_admin:** true

## Outcomes

### Preference_isolation (Priority: 1)

**Given:**
- user attempts to access another user's preferences

**Result:** Empty result returned — access silently denied through WHERE clause filtering

### Get_preference (Priority: 10)

**Given:**
- user is authenticated
- `key` (input) exists

**Then:**
- query filtered to current user's preferences only

**Result:** Preference value returned for the given key, or null if not set

### Set_preference (Priority: 10)

**Given:**
- user is authenticated
- `key` (input) exists
- `value` (input) exists

**Then:**
- user field auto-set from req.user via beforeValidate hook
- **set_field** target: `value` value: `provided JSON value` — Upsert preference — create or update

**Result:** Preference saved for the current user

### Delete_preference (Priority: 10)

**Given:**
- user is authenticated
- `key` (input) exists

**Then:**
- **delete_record** target: `preference entry` — Remove preference for current user and key

**Result:** Preference deleted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PREFERENCE_VALIDATION_ERROR` | 400 | The preference value did not pass validation | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `preference.updated` | Emitted when a user preference is created or updated | `user_id`, `key`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-auth | required | Preferences are per-user — requires authentication to identify the user |
| payload-collections | required | Preferences stored in the auto-created payload-preferences collection |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
rest_endpoints:
  - method: GET
    path: /api/_preferences/:key
    operation: findOne
  - method: POST
    path: /api/_preferences/:key
    operation: update
  - method: DELETE
    path: /api/_preferences/:key
    operation: delete
auto_created_entities:
  - name: payload-preferences
    type: collection
    description: Hidden system collection storing per-user preferences
    hidden: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Preferences Blueprint",
  "description": "Per-user preferences storage for admin UI state including collapsed fields, tab positions, column visibility, sort order, and list view settings. 3 fields. 4 ou",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, preferences, user-settings, ui-state, personalization, admin-panel, payload"
}
</script>
