---
title: "Workshop Directory Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Maintain a registry of approved external workshops and service providers for fleet maintenance, including contact details, service specialisations, pricing, per"
---

# Workshop Directory Blueprint

> Maintain a registry of approved external workshops and service providers for fleet maintenance, including contact details, service specialisations, pricing, performance ratings, and contract status.

| | |
|---|---|
| **Feature** | `workshop-directory` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, workshop, service-provider, maintenance, directory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/workshop-directory.blueprint.yaml) |
| **JSON API** | [workshop-directory.json]({{ site.baseurl }}/api/blueprints/workflow/workshop-directory.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Registers and manages approved workshops; records performance ratings |
| `procurement_manager` | Procurement Manager | human | Negotiates and records service agreements and pricing |
| `technician` | Technician | human | Selects a workshop when logging a service event |
| `system` | System | system | Tracks contract expiry dates and triggers renewal reminders |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `workshop_name` | text | Yes | Workshop Name |  |
| `legal_name` | text | No | Legal / Registered Name |  |
| `registration_number` | text | No | Business Registration Number |  |
| `contact_person` | text | No | Primary Contact Person |  |
| `phone` | phone | No | Phone Number |  |
| `email` | email | No | Email Address |  |
| `address` | text | No | Physical Address |  |
| `service_types` | multiselect | Yes | Service Types Offered |  |
| `vehicle_categories_supported` | multiselect | No | Vehicle Categories Supported |  |
| `standard_labour_rate` | number | No | Standard Labour Rate (per hour) |  |
| `currency` | text | No | Currency |  |
| `contract_start_date` | date | No | Contract Start Date |  |
| `contract_end_date` | date | No | Contract End Date |  |
| `average_rating` | number | No | Average Performance Rating |  |
| `total_services_logged` | number | No | Total Services Logged |  |
| `notes` | text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `contract_expiring` |  |  |
| `suspended` |  |  |
| `blacklisted` |  | Yes |
| `inactive` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `contract_expiring` | system |  |
|  | `contract_expiring` | `active` | procurement_manager |  |
|  | `active` | `suspended` | fleet_manager |  |
|  | `suspended` | `active` | fleet_manager |  |
|  | `suspended` | `blacklisted` | fleet_manager |  |
|  | `active` | `inactive` | fleet_manager |  |

## Rules

- **unique_name:**
  - **description:** Workshop name must be unique in the directory
- **service_type_required:**
  - **description:** At least one service type must be specified for a workshop to be registered
- **active_only_for_service:**
  - **description:** Only workshops with Active status can be selected on maintenance log or service records
- **labour_rate_positive:**
  - **description:** Standard labour rate must be positive if provided
- **blacklist_permanent:**
  - **description:** A blacklisted workshop cannot be reactivated — a new record must be created if re-engagement is required
- **contract_dates_valid:**
  - **description:** Contract end date must be after contract start date when both are provided
- **rating_scale:**
  - **description:** Performance ratings are on a 1 to 5 scale; average_rating is computed from individual service ratings

## Outcomes

### Workshop_blacklisted (Priority: 6)

**Given:**
- status is suspended
- fleet manager confirms permanent removal

**Then:**
- **set_field** target: `status` value: `blacklisted`
- **emit_event** event: `workshop.blacklisted`

**Result:** Workshop is permanently removed from the approved list; any pending service records must be reassigned

### Contract_expired (Priority: 7)

**Given:**
- contract_end_date is set
- days until contract_end_date is less than or equal to advance_notice_days

**Then:**
- **set_field** target: `status` value: `contract_expiring`
- **notify** — Notify procurement manager to renew the service agreement
- **emit_event** event: `workshop.contract_expiring`

**Result:** Procurement manager is reminded to renew or terminate the workshop contract

### Workshop_suspended (Priority: 8)

**Given:**
- status is active
- fleet manager provides suspension reason

**Then:**
- **set_field** target: `status` value: `suspended`
- **notify** — Notify procurement manager of the suspension
- **emit_event** event: `workshop.suspended`

**Result:** Workshop is marked suspended; technicians cannot select it for new service records

### Workshop_rated (Priority: 9)

**Given:**
- a service log entry references this workshop
- a rating between 1 and 5 is submitted for the service

**Then:**
- **set_field** target: `total_services_logged` — Increment by 1
- **set_field** target: `average_rating` — Recalculate running average from all ratings
- **emit_event** event: `workshop.service_rated`

**Result:** New rating is incorporated into the workshop's average performance score

### Workshop_registered (Priority: 10)

**Given:**
- workshop_name is unique
- at least one service_type is provided

**Then:**
- **set_field** target: `status` value: `active`
- **set_field** target: `total_services_logged` value: `0`
- **emit_event** event: `workshop.registered`

**Result:** Workshop is added to the approved directory and available for service record selection

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WORKSHOP_DUPLICATE_NAME` | 409 | A workshop with this name already exists in the directory. | No |
| `WORKSHOP_NOT_ACTIVE` | 422 | The selected workshop is not currently active. Please choose an approved service provider. | No |
| `WORKSHOP_INVALID_RATING` | 400 | Performance rating must be between 1 and 5. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `workshop.registered` | A new service provider has been added to the approved workshop directory | `workshop_name`, `service_types`, `contract_end_date` |
| `workshop.service_rated` | A performance rating has been recorded for a workshop service | `workshop_name`, `service_rating`, `new_average_rating`, `total_services_logged` |
| `workshop.suspended` | A workshop has been temporarily suspended from receiving new work | `workshop_name`, `suspension_reason`, `suspended_by` |
| `workshop.contract_expiring` | A workshop's service agreement is approaching its expiry date | `workshop_name`, `contract_end_date`, `days_remaining` |
| `workshop.blacklisted` | A workshop has been permanently removed from the approved provider list | `workshop_name`, `blacklist_reason`, `blacklisted_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-maintenance-log | recommended | Workshop records are referenced on each service log entry |
| scheduled-maintenance | optional | Scheduled maintenance tasks can be pre-assigned to a preferred workshop |

## AGI Readiness

### Goals

#### Reliable Workshop Directory

Maintain a registry of approved external workshops and service providers for fleet maintenance, including contact details, service specialisations, pricing, performance ratings, and contract status.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| workshop_registered | `autonomous` | - | - |
| workshop_rated | `autonomous` | - | - |
| workshop_suspended | `human_required` | - | - |
| contract_expired | `autonomous` | - | - |
| workshop_blacklisted | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 2
  entry_points:
    - erpnext/assets/doctype/asset_maintenance_team/asset_maintenance_team.py
    - erpnext/assets/doctype/asset_repair/asset_repair.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Workshop Directory Blueprint",
  "description": "Maintain a registry of approved external workshops and service providers for fleet maintenance, including contact details, service specialisations, pricing, per",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, workshop, service-provider, maintenance, directory"
}
</script>
