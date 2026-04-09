---
title: "Payload Access Control Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results. 2 fields. 7 outcom"
---

# Payload Access Control Blueprint

> Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results

| | |
|---|---|
| **Feature** | `payload-access-control` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | cms, access-control, permissions, rbac, field-level, document-level, where-clause, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/payload-access-control.blueprint.yaml) |
| **JSON API** | [payload-access-control.json]({{ site.baseurl }}/api/blueprints/access/payload-access-control.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `authenticated_user` | Authenticated User | human | Any user authenticated via JWT, API key, or custom strategy |
| `anonymous_user` | Anonymous User | human | Unauthenticated visitor — access functions receive null user |
| `access_engine` | Access Engine | system | Evaluates access functions and merges results with database queries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `access_result` | json | Yes | Access Result |  |
| `permission_object` | json | Yes | Permission Object |  |

## Rules

- **access:**
  - **collection_level_operations:** create, read, update, delete, admin, readVersions, unlock
  - **global_level_operations:** read, update, readVersions
  - **field_level_operations:** create, read, update
  - **access_function_signature:**
    - **input:** {req, id?, data?}
    - **output:** boolean | Where clause | Promise<boolean | Where>
  - **where_clause_merging:**
    - **description:** When access returns a Where clause, it is AND-merged with the user query
    - **enables_row_level_security:** true
  - **default_access_function:** Boolean(req.user)
  - **override_access:**
    - **flag:** overrideAccess: true
    - **description:** Bypasses all access checks — used by admin operations, scheduled tasks, webhooks
  - **disable_errors:**
    - **flag:** disableErrors: true
    - **description:** Returns empty results instead of throwing Forbidden on access denial
- **security:**
  - **field_level_access_context:** doc (full document), siblingData (parent object), blockData (nearest block parent), req (request with user), id (document ID)
  - **block_reference_permissions:** true

## Outcomes

### Access_denied (Priority: 1) — Error: `ACCESS_FORBIDDEN`

**Given:**
- access function returns false
- disableErrors is not set

**Result:** 403 Forbidden error thrown

### Access_denied_silent (Priority: 2)

**Given:**
- access function returns false
- disableErrors is set to true

**Result:** Empty result set returned (no error thrown)

### Field_access_denied (Priority: 5)

**Given:**
- field-level access function returns false for a specific field

**Then:**
- field excluded from response (read access denied)
- field value ignored in input (create/update access denied)

**Result:** Field silently excluded — no error, field just absent from response

### Access_granted_boolean (Priority: 10)

**Given:**
- access function returns true

**Result:** Operation proceeds with no additional query constraints

### Access_granted_where (Priority: 10)

**Given:**
- access function returns a Where clause object

**Then:**
- Where clause merged with user query via combineQueries()
- database query only returns documents matching both user query AND access filter

**Result:** Operation proceeds with row-level filtering applied

### Doc_access_check (Priority: 10)

**Given:**
- user requests permission check via /access/:id endpoint

**Then:**
- all collection-level access functions evaluated
- all field-level access functions evaluated

**Result:** Complete permission object returned with boolean flags for each operation and each field

### Admin_panel_access (Priority: 10)

**Given:**
- user attempts to access admin panel for a collection

**Then:**
- admin access function evaluated: ({req}) => boolean

**Result:** User granted or denied access to this collection in the admin UI

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCESS_FORBIDDEN` | 403 | You are not allowed to perform this action | No |
| `ACCESS_UNAUTHORIZED` | 401 | You must be logged in to perform this action | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `access.denied` | Emitted when access is denied — useful for audit logging | `user_id`, `collection_slug`, `operation`, `timestamp` |
| `access.evaluated` | Emitted after access evaluation completes | `user_id`, `collection_slug`, `operation`, `result_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-auth | required | Access control depends on authenticated user identity from auth system |
| payload-collections | required | Access functions are configured per collection |
| payload-globals | required | Globals have their own access control configuration |

## AGI Readiness

### Goals

#### Reliable Payload Access Control

Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | usability | access control must enforce least-privilege principle |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `payload_auth` | payload-auth | fail |
| `payload_collections` | payload-collections | fail |
| `payload_globals` | payload-globals | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| access_granted_boolean | `autonomous` | - | - |
| access_granted_where | `autonomous` | - | - |
| access_denied | `autonomous` | - | - |
| access_denied_silent | `autonomous` | - | - |
| field_access_denied | `autonomous` | - | - |
| doc_access_check | `autonomous` | - | - |
| admin_panel_access | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
access_patterns:
  - name: Public read, auth write
    description: read returns true, create/update/delete return Boolean(req.user)
  - name: Owner-only
    description: read/update/delete return Where clause filtering by userId field
  - name: Role-based
    description: Access function checks req.user.role against allowed roles
  - name: Field-level redaction
    description: Sensitive fields have read access returning false for non-admin users
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Access Control Blueprint",
  "description": "Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results. 2 fields. 7 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, access-control, permissions, rbac, field-level, document-level, where-clause, payload"
}
</script>
