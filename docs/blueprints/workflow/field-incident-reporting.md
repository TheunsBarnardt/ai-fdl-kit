---
title: "Field Incident Reporting Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Allow drivers and fleet staff to report field issues and incidents against vehicles, orders, or locations. 14 fields. 5 outcomes. 3 error codes. rules: critical"
---

# Field Incident Reporting Blueprint

> Allow drivers and fleet staff to report field issues and incidents against vehicles, orders, or locations

| | |
|---|---|
| **Feature** | `field-incident-reporting` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, incident, issue, reporting, field, safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/field-incident-reporting.blueprint.yaml) |
| **JSON API** | [field-incident-reporting.json]({{ site.baseurl }}/api/blueprints/workflow/field-incident-reporting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Driver reporting an issue from the field |
| `fleet_manager` | Fleet Manager | human | Manager reviewing and resolving incidents |
| `assigned_agent` | Assigned Agent | human | Staff member assigned to investigate and resolve the incident |
| `system` | System | system | Incident tracking and escalation automation |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `issue_id` | text | Yes | Issue ID |  |
| `driver_uuid` | text | No | Driver |  |
| `vehicle_uuid` | text | No | Vehicle |  |
| `assigned_to_uuid` | text | No | Assigned To |  |
| `reported_by_uuid` | text | Yes | Reported By |  |
| `type` | select | Yes | Issue Type |  |
| `category` | text | No | Category |  |
| `report` | rich_text | Yes | Incident Report |  |
| `priority` | select | Yes | Priority |  |
| `location` | json | No | Incident Location |  |
| `tags` | json | No | Tags |  |
| `meta` | json | No | Additional Data |  |
| `resolved_at` | datetime | No | Resolved At |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `open` | Yes |  |
| `pending` |  |  |
| `in_review` |  |  |
| `resolved` |  | Yes |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `open` | `pending` | system |  |
|  | `pending` | `in_review` | fleet_manager |  |
|  | `in_review` | `resolved` | assigned_agent |  |
|  | `resolved` | `closed` | fleet_manager |  |
|  | `open` | `closed` | fleet_manager |  |

## Rules

- **critical_immediate_notification:** Critical priority incidents trigger immediate notifications to fleet managers
- **subject_required:** An incident must reference either a driver or vehicle (or both)
- **auto_capture_location:** GPS location is captured automatically from the driver's current position when reporting
- **accident_compliance:** Incidents involving accidents must be flagged for insurance and compliance review
- **resolution_required:** Resolved incidents must include a resolution description before closing
- **auto_escalation:** Unresolved critical incidents escalate automatically after a configurable time period
- **audit_transitions:** All incident status changes are logged with actor, timestamp, and notes
- **photo_attachments:** Photos can be attached to incident reports as file references
- **org_scoped:** Incidents are visible only to the reporter's organization
- **driver_own_incidents:** Driver can only view and edit their own reported incidents

## Outcomes

### Incident_reported (Priority: 1)

**Given:**
- `report` (input) exists
- `type` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `incident.reported`

**Result:** Incident report created and submitted for review

### Critical_incident_escalated (Priority: 2)

**Given:**
- `priority` (input) eq `critical`

**Then:**
- **emit_event** event: `incident.critical_escalated`

**Result:** Critical incident immediately escalated to fleet managers

### Incident_assigned (Priority: 3)

**Given:**
- `assigned_to_uuid` (input) exists

**Then:**
- **set_field** target: `status` value: `in_review`
- **emit_event** event: `incident.assigned`

**Result:** Incident assigned to agent for investigation

### Incident_resolved (Priority: 4)

**Given:**
- `status` (db) eq `in_review`
- resolution description provided

**Then:**
- **set_field** target: `status` value: `resolved`
- **set_field** target: `resolved_at` value: `now`
- **emit_event** event: `incident.resolved`

**Result:** Incident marked as resolved with documentation

### Incident_closed_without_action (Priority: 5)

**Given:**
- incident is duplicate or invalid

**Then:**
- **set_field** target: `status` value: `closed`
- **emit_event** event: `incident.closed`

**Result:** Incident closed without action

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INCIDENT_MISSING_SUBJECT` | 422 | An incident must reference a driver or vehicle. | No |
| `INCIDENT_NOT_FOUND` | 404 | Incident not found. | No |
| `INCIDENT_ALREADY_CLOSED` | 409 | This incident is already closed. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `incident.reported` | Fired when a new incident is submitted | `issue_id`, `reported_by_uuid`, `type`, `priority`, `location` |
| `incident.critical_escalated` | Fired immediately when a critical priority incident is reported | `issue_id`, `type`, `driver_uuid`, `vehicle_uuid`, `location` |
| `incident.assigned` | Fired when an incident is assigned to an agent | `issue_id`, `assigned_to_uuid` |
| `incident.resolved` | Fired when an incident is resolved | `issue_id`, `assigned_to_uuid`, `resolved_at` |
| `incident.closed` | Fired when an incident is closed | `issue_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-profile | required | Incidents are linked to the reporting driver |
| vehicle-fleet-registry | required | Incidents can be linked to specific vehicles |
| realtime-driver-tracking | recommended | Driver GPS location captured with incident report |

## AGI Readiness

### Goals

#### Reliable Field Incident Reporting

Allow drivers and fleet staff to report field issues and incidents against vehicles, orders, or locations

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `driver_profile` | driver-profile | degrade |
| `vehicle_fleet_registry` | vehicle-fleet-registry | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| incident_reported | `autonomous` | - | - |
| critical_incident_escalated | `autonomous` | - | - |
| incident_assigned | `autonomous` | - | - |
| incident_resolved | `autonomous` | - | - |
| incident_closed_without_action | `autonomous` | - | - |

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
  "name": "Field Incident Reporting Blueprint",
  "description": "Allow drivers and fleet staff to report field issues and incidents against vehicles, orders, or locations. 14 fields. 5 outcomes. 3 error codes. rules: critical",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, incident, issue, reporting, field, safety"
}
</script>
