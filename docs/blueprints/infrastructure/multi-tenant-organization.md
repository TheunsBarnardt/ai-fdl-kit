---
title: "Multi Tenant Organization Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Multi-tenant organization model with isolated data, user management, and role-based access control. 14 fields. 5 outcomes. 4 error codes. rules: company_uuid_re"
---

# Multi Tenant Organization Blueprint

> Multi-tenant organization model with isolated data, user management, and role-based access control

| | |
|---|---|
| **Feature** | `multi-tenant-organization` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | multi-tenant, organization, company, isolation, rbac, users |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/multi-tenant-organization.blueprint.yaml) |
| **JSON API** | [multi-tenant-organization.json]({{ site.baseurl }}/api/blueprints/infrastructure/multi-tenant-organization.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `org_owner` | Organization Owner | human | Owner who created and controls the organization |
| `admin` | Administrator | human | Admin managing users and settings within the org |
| `member` | Member | human | Regular user within the organization |
| `system` | System | system | Platform-level enforcement of tenant isolation |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `org_id` | text | Yes | Organization ID |  |
| `name` | text | Yes | Organization Name |  |
| `slug` | text | Yes | URL Slug |  |
| `owner_uuid` | text | Yes | Owner |  |
| `description` | text | No | Description |  |
| `website_url` | url | No | Website |  |
| `phone` | phone | No | Phone |  |
| `currency` | text | No | Default Currency |  |
| `country` | text | No | Country |  |
| `timezone` | text | No | Timezone |  |
| `plan` | text | No | Subscription Plan |  |
| `options` | json | No | Feature Flags |  |
| `status` | select | Yes | Status |  |
| `type` | text | No | Organization Type |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `suspended` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `suspended` | system |  |
|  | `suspended` | `active` | admin |  |
|  | `suspended` | `cancelled` | org_owner |  |

## Rules

- **company_uuid_required:** Each record (order, driver, vehicle, etc.) must be associated with exactly one organization via company_uuid
- **no_cross_tenant:** API requests must always include a valid organization context; cross-tenant access is forbidden
- **unique_slug:** Organization slugs must be globally unique and URL-safe
- **owner_immutable:** The organization owner always has full access and cannot be removed
- **membership_tracking:** User membership is tracked via a company_users join record
- **rbac:** Role-based access control (RBAC) enforces per-resource permissions within the organization
- **suspended_no_api:** Suspended organizations lose API access and cannot create new records
- **data_isolation:** Data for one organization must never appear in API responses for another
- **invite_based_onboarding:** Invitation-based member onboarding requires an invite link with expiry
- **timezone_usage:** Timezone settings are used for all date/time displays and scheduled operations

## Outcomes

### Org_created (Priority: 1)

**Given:**
- `name` (input) exists
- `owner_uuid` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `org.created`

**Result:** Organization created with owner as first admin member

### Cross_tenant_access_blocked (Priority: 1) — Error: `ORG_CROSS_TENANT_ACCESS`

**Given:**
- request references a resource belonging to a different organization

**Result:** Access denied — resource not found in your organization

### Member_invited (Priority: 2)

**Given:**
- inviting user is admin of the organization
- email provided

**Then:**
- **create_record**
- **emit_event** event: `org.member_invited`

**Result:** Invitation sent to email address

### Member_joined (Priority: 3)

**Given:**
- valid invite link accepted by user

**Then:**
- **create_record**
- **emit_event** event: `org.member_joined`

**Result:** User added as a member of the organization

### Org_suspended (Priority: 4)

**Given:**
- account policy violation or payment failure detected

**Then:**
- **set_field** target: `status` value: `suspended`
- **emit_event** event: `org.suspended`

**Result:** Organization suspended; all API access revoked

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORG_CROSS_TENANT_ACCESS` | 404 | The requested resource was not found. | No |
| `ORG_SUSPENDED` | 403 | Your organization account is currently suspended. Please contact support. | No |
| `ORG_DUPLICATE_SLUG` | 409 | An organization with this name already exists. | No |
| `ORG_INVITE_EXPIRED` | 410 | This invitation link has expired or has already been used. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `org.created` | Fired when a new organization is created | `org_id`, `name`, `owner_uuid`, `plan` |
| `org.member_invited` | Fired when a member is invited to the organization | `org_id`, `invited_email`, `role` |
| `org.member_joined` | Fired when a user accepts an invitation and joins | `org_id`, `user_uuid`, `role` |
| `org.member_removed` | Fired when a member is removed from the organization | `org_id`, `user_uuid` |
| `org.suspended` | Fired when an organization is suspended | `org_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fleet-public-api | required | API authentication is scoped to organization credentials |
| order-lifecycle-webhooks | required | Webhooks are isolated per organization |
| fleet-customer-contacts | recommended | Contacts are scoped to the organization |

## AGI Readiness

### Goals

#### Reliable Multi Tenant Organization

Multi-tenant organization model with isolated data, user management, and role-based access control

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fleet_public_api` | fleet-public-api | fail |
| `order_lifecycle_webhooks` | order-lifecycle-webhooks | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| org_created | `supervised` | - | - |
| member_invited | `autonomous` | - | - |
| member_joined | `autonomous` | - | - |
| org_suspended | `human_required` | - | - |
| cross_tenant_access_blocked | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Tenant Organization Blueprint",
  "description": "Multi-tenant organization model with isolated data, user management, and role-based access control. 14 fields. 5 outcomes. 4 error codes. rules: company_uuid_re",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "multi-tenant, organization, company, isolation, rbac, users"
}
</script>
