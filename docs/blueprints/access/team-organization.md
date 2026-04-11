---
title: "Team Organization Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Multi-tenant organization and team management with member invitations and data isolation. 12 fields. 9 outcomes. 7 error codes. rules: data_isolation, slugs, in"
---

# Team Organization Blueprint

> Multi-tenant organization and team management with member invitations and data isolation

| | |
|---|---|
| **Feature** | `team-organization` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | multi-tenancy, organizations, teams, workspaces, invitations, collaboration, saas |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/team-organization.blueprint.yaml) |
| **JSON API** | [team-organization.json]({{ site.baseurl }}/api/blueprints/access/team-organization.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `org_id` | text | Yes | Organization ID |  |
| `org_name` | text | Yes | Organization Name | Validations: required, minLength, maxLength |
| `org_slug` | text | Yes | Organization Slug | Validations: required, pattern |
| `plan` | select | Yes | Plan | Validations: required |
| `owner_id` | text | Yes | Owner User ID | Validations: required |
| `member_user_id` | text | Yes | Member User ID |  |
| `member_role` | select | Yes | Member Role |  |
| `invite_email` | email | Yes | Invite Email | Validations: required, email |
| `invite_token` | token | Yes | Invite Token |  |
| `invited_at` | datetime | Yes | Invited At |  |
| `accepted_at` | datetime | No | Accepted At |  |
| `invite_status` | select | Yes | Invite Status |  |

## Rules

- **data_isolation:**
  - **tenant_scope:** org_id
  - **enforce_at:** query_layer
  - **row_level_security:** true
- **slugs:**
  - **globally_unique:** true
  - **immutable_after_creation:** false
  - **reserved:** api, admin, app, www, help, support, billing, status
- **invitations:**
  - **token_length_bytes:** 32
  - **expiry_hours:** 72
  - **max_pending_per_org:** 100
  - **resend_cooldown_minutes:** 5
- **roles:**
  - **hierarchy:** owner, admin, member, viewer
  - **owner_minimum:** 1
  - **owner_transfer_requires_confirmation:** true
- **limits:**
  - **free:**
    - **max_members:** 5
    - **max_teams:** 1
  - **starter:**
    - **max_members:** 25
    - **max_teams:** 5
  - **pro:**
    - **max_members:** 100
    - **max_teams:** 25
  - **enterprise:**
    - **max_members:** unlimited
    - **max_teams:** unlimited

## Outcomes

### Org_created (Priority: 1) | Transaction: atomic

**Given:**
- `org_name` (input) exists
- `org_slug` (input) exists
- `org_slug` (db) not_exists

**Then:**
- **create_record** target: `organizations` — Create the organization record
- **create_record** target: `org_members` — Add creator as owner of the new organization
- **emit_event** event: `org.created`

**Result:** organization created with the creator as owner

### Slug_taken (Priority: 2) — Error: `ORG_SLUG_TAKEN`

**Given:**
- `org_slug` (db) exists

**Result:** show "This organization URL is already taken"

### Member_invited (Priority: 3) | Transaction: atomic

**Given:**
- `invite_email` (input) exists
- `invite_email` (db) not_exists
- `member_count` (computed) lt `plan_member_limit`

**Then:**
- **create_record** target: `org_invitations` — Create pending invitation with secure token
- **notify** — Send invitation email with accept/decline link
- **emit_event** event: `member.invited`

**Result:** invitation sent to the provided email address

### Member_limit_reached (Priority: 4) — Error: `ORG_MEMBER_LIMIT`

**Given:**
- `member_count` (computed) gte `plan_member_limit`

**Result:** show "Your plan's member limit has been reached. Upgrade to add more members."

### Invite_accepted (Priority: 5) — Error: `INVITE_ALREADY_ACCEPTED` | Transaction: atomic

**Given:**
- `invite_token` (input) exists
- `invite_status` (db) eq `pending`
- `invited_at` (db) gt `now - 72h`

**Then:**
- **set_field** target: `invite_status` value: `accepted` — Mark invitation as accepted
- **set_field** target: `accepted_at` value: `now` — Record acceptance timestamp
- **create_record** target: `org_members` — Add user as member with the invited role
- **emit_event** event: `member.joined`

**Result:** user added to the organization with the assigned role

### Invite_expired (Priority: 6) — Error: `INVITE_EXPIRED`

**Given:**
- `invited_at` (db) lt `now - 72h`

**Then:**
- **set_field** target: `invite_status` value: `expired` — Mark invitation as expired

**Result:** show "This invitation has expired. Please request a new one."

### Invite_declined (Priority: 7)

**Given:**
- `invite_token` (input) exists
- `invite_status` (db) eq `pending`

**Then:**
- **set_field** target: `invite_status` value: `declined` — Mark invitation as declined
- **emit_event** event: `member.invite_declined`

**Result:** invitation declined

### Member_removed (Priority: 8) | Transaction: atomic

**Given:**
- `target_member` (db) exists
- `target_member_role` (db) neq `owner`

**Then:**
- **delete_record** target: `org_members` — Remove member from organization
- **emit_event** event: `member.removed`

**Result:** member removed from the organization

### Member_role_changed (Priority: 9)

**Given:**
- `target_member` (db) exists
- `new_role` (input) exists

**Then:**
- **set_field** target: `member_role` value: `new_role` — Update member's role
- **emit_event** event: `member.role_changed`

**Result:** member role updated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORG_SLUG_TAKEN` | 409 | This organization URL is already taken | No |
| `ORG_MEMBER_LIMIT` | 403 | Member limit reached for your current plan | No |
| `INVITE_EXPIRED` | 410 | This invitation has expired | No |
| `INVITE_ALREADY_ACCEPTED` | 409 | This invitation has already been accepted | No |
| `MEMBER_ALREADY_EXISTS` | 409 | This user is already a member of the organization | No |
| `OWNER_TRANSFER_REQUIRED` | 403 | Cannot remove the last owner. Transfer ownership first. | No |
| `INSUFFICIENT_ORG_PERMISSION` | 403 | You do not have permission to perform this action in this organization | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `org.created` | New organization created | `org_id`, `org_name`, `org_slug`, `owner_id`, `plan`, `timestamp` |
| `member.invited` | Member invitation sent | `org_id`, `invite_email`, `invited_by`, `member_role`, `timestamp` |
| `member.joined` | Member accepted invitation and joined the organization | `org_id`, `user_id`, `member_role`, `invited_by`, `timestamp` |
| `member.removed` | Member removed from the organization | `org_id`, `user_id`, `removed_by`, `timestamp` |
| `member.role_changed` | Member role updated within the organization | `org_id`, `user_id`, `old_role`, `new_role`, `changed_by`, `timestamp` |
| `member.invite_declined` | Member declined the invitation | `org_id`, `invite_email`, `timestamp` |
| `org.plan_changed` | Organization plan upgraded or downgraded | `org_id`, `old_plan`, `new_plan`, `changed_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| role-based-access | recommended | Roles within an organization map to RBAC permission checks |
| signup | required | Users must have an account before joining an organization |
| audit-logging | recommended | Organization membership changes should be logged |
| data-privacy-compliance | optional | Organizations may need GDPR/CCPA data isolation compliance |

## AGI Readiness

### Goals

#### Reliable Team Organization

Multi-tenant organization and team management with member invitations and data isolation

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
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
| `signup` | signup | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| org_created | `supervised` | - | - |
| slug_taken | `autonomous` | - | - |
| member_invited | `autonomous` | - | - |
| member_limit_reached | `autonomous` | - | - |
| invite_accepted | `autonomous` | - | - |
| invite_expired | `autonomous` | - | - |
| invite_declined | `autonomous` | - | - |
| member_removed | `human_required` | - | - |
| member_role_changed | `supervised` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: dashboard_with_sidebar
max_width: 1200px
actions:
  primary:
    label: Create Organization
    type: submit
  secondary:
    label: Invite Member
    type: button
fields_order:
  - org_name
  - org_slug
  - plan
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Team Organization Blueprint",
  "description": "Multi-tenant organization and team management with member invitations and data isolation. 12 fields. 9 outcomes. 7 error codes. rules: data_isolation, slugs, in",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "multi-tenancy, organizations, teams, workspaces, invitations, collaboration, saas"
}
</script>
