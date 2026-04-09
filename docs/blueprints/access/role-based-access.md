---
title: "Role Based Access Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Role-based access control with hierarchical permission inheritance. 7 fields. 8 outcomes. 5 error codes. rules: hierarchy, system_roles, permissions. AGI: super"
---

# Role Based Access Blueprint

> Role-based access control with hierarchical permission inheritance

| | |
|---|---|
| **Feature** | `role-based-access` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | rbac, permissions, roles, authorization, hierarchy, security, access-control |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/role-based-access.blueprint.yaml) |
| **JSON API** | [role-based-access.json]({{ site.baseurl }}/api/blueprints/access/role-based-access.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `role_id` | text | Yes | Role ID | Validations: required, pattern |
| `role_name` | text | Yes | Role Name | Validations: required, minLength, maxLength |
| `description` | text | No | Description | Validations: maxLength |
| `permissions` | json | Yes | Permissions | Validations: required |
| `parent_role` | text | No | Parent Role |  |
| `is_system_role` | boolean | No | System Role |  |
| `is_active` | boolean | No | Active |  |

## Rules

- **hierarchy:**
  - **inheritance_direction:** upward
  - **max_depth:** 10
  - **circular_reference_check:** true
- **system_roles:**
  - **protected:** super_admin, admin
  - **super_admin_bypass:** true
- **permissions:**
  - **format:** resource.action
  - **wildcard_support:** true
  - **case_sensitive:** false
  - **deduplication:** true
- **assignment:**
  - **max_roles_per_user:** 20
  - **effective_permissions:** union

## Outcomes

### Permission_denied_no_role (Priority: 1) — Error: `ACCESS_DENIED`

**Given:**
- `user_roles` (db) not_exists

**Then:**
- **emit_event** event: `access.denied`

**Result:** deny access with "You do not have permission to perform this action"

### Permission_denied (Priority: 2) — Error: `ACCESS_DENIED`

**Given:**
- `required_permission` (computed) not_in `effective_permissions`
- `is_super_admin` (computed) eq `false`

**Then:**
- **emit_event** event: `access.denied`

**Result:** deny access with "You do not have permission to perform this action"

### Role_not_found (Priority: 3) — Error: `ROLE_NOT_FOUND`

**Given:**
- `target_role` (db) not_exists

**Result:** show "The specified role does not exist"

### System_role_delete_blocked (Priority: 4) — Error: `SYSTEM_ROLE_PROTECTED`

**Given:**
- `is_system_role` (db) eq `true`

**Result:** show "System roles cannot be deleted or modified"

### Permission_granted (Priority: 5)

**Given:**
- ANY: `is_super_admin` (computed) eq `true` OR `required_permission` (computed) in `effective_permissions`

**Then:**
- **emit_event** event: `access.granted`

**Result:** allow access to the requested resource

### Permission_invalid (Priority: 6) — Error: `PERMISSION_INVALID`

**Given:**
- `permission` (input) not_exists

**Result:** show "The specified permission is not valid"

### Role_assigned (Priority: 10)

**Given:**
- `target_role` (db) exists
- `target_role` (db) neq `already_assigned`

**Then:**
- **create_record** target: `user_roles` — Create role assignment record
- **emit_event** event: `role.assigned`

**Result:** role successfully assigned to user

### Role_revoked (Priority: 11)

**Given:**
- `target_role` (db) exists
- `assignment` (db) exists

**Then:**
- **delete_record** target: `user_roles` — Remove role assignment record
- **emit_event** event: `role.revoked`

**Result:** role successfully revoked from user

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCESS_DENIED` | 403 | You do not have permission to perform this action | No |
| `ROLE_NOT_FOUND` | 404 | The specified role does not exist | No |
| `PERMISSION_INVALID` | 422 | The specified permission is not valid | No |
| `SYSTEM_ROLE_PROTECTED` | 403 | System roles cannot be deleted or modified | No |
| `ROLE_HIERARCHY_CYCLE` | 422 | Setting this parent role would create a circular reference | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `access.granted` | Permission check passed — access allowed | `user_id`, `resource`, `action`, `timestamp`, `matched_permission` |
| `access.denied` | Permission check failed — access denied | `user_id`, `resource`, `action`, `required_permission`, `timestamp`, `ip_address` |
| `role.assigned` | Role assigned to a user | `user_id`, `role_id`, `assigned_by`, `timestamp` |
| `role.revoked` | Role removed from a user | `user_id`, `role_id`, `revoked_by`, `timestamp` |
| `role.created` | New role created in the system | `role_id`, `role_name`, `created_by`, `timestamp` |
| `role.updated` | Role permissions or metadata modified | `role_id`, `changes`, `updated_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | User must be authenticated before role-based access checks apply |
| audit-logging | recommended | Access grants and denials should be logged for compliance |
| team-organization | optional | Roles can be scoped per organization or team |

## AGI Readiness

### Goals

#### Reliable Role Based Access

Role-based access control with hierarchical permission inheritance

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

- before permanently deleting records

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

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `login` | login | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| permission_denied_no_role | `autonomous` | - | - |
| permission_denied | `autonomous` | - | - |
| permission_granted | `autonomous` | - | - |
| role_assigned | `autonomous` | - | - |
| role_not_found | `autonomous` | - | - |
| role_revoked | `human_required` | - | - |
| system_role_delete_blocked | `human_required` | - | - |
| permission_invalid | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: table_with_detail
max_width: 960px
actions:
  primary:
    label: Create Role
    type: submit
  secondary:
    label: Assign Role
    type: button
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Role Based Access Blueprint",
  "description": "Role-based access control with hierarchical permission inheritance. 7 fields. 8 outcomes. 5 error codes. rules: hierarchy, system_roles, permissions. AGI: super",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rbac, permissions, roles, authorization, hierarchy, security, access-control"
}
</script>
