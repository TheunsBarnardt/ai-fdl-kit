---
title: "Vehicle Renewal Reminders Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Automatically generate and send renewal reminders for vehicle licenses, registrations, roadworthiness certificates, and insurance policies before they expire.. "
---

# Vehicle Renewal Reminders Blueprint

> Automatically generate and send renewal reminders for vehicle licenses, registrations, roadworthiness certificates, and insurance policies before they expire.

| | |
|---|---|
| **Feature** | `vehicle-renewal-reminders` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, reminders, compliance, renewal, notifications |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/vehicle-renewal-reminders.blueprint.yaml) |
| **JSON API** | [vehicle-renewal-reminders.json]({{ site.baseurl }}/api/blueprints/notification/vehicle-renewal-reminders.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Receives and acknowledges renewal reminders, takes action to renew |
| `system` | System | system | Daily scan that detects upcoming expiries and dispatches reminders |
| `operations_supervisor` | Operations Supervisor | human | Receives escalated overdue reminders when the fleet manager has not acted |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `reminder_type` | select | Yes | Reminder Type |  |
| `due_date` | date | Yes | Due / Expiry Date |  |
| `advance_notice_days` | number | Yes | Advance Notice (days) |  |
| `reminder_frequency_days` | number | No | Reminder Frequency (days) |  |
| `assigned_to` | text | Yes | Assigned To |  |
| `last_sent_date` | date | No | Last Reminder Sent |  |
| `acknowledged_by` | text | No | Acknowledged By |  |
| `acknowledged_date` | date | No | Acknowledged Date |  |
| `completion_date` | date | No | Completion Date |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `upcoming` | Yes |  |
| `due_soon` |  |  |
| `overdue` |  |  |
| `acknowledged` |  |  |
| `completed` |  | Yes |
| `waived` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `upcoming` | `due_soon` | system |  |
|  | `due_soon` | `acknowledged` | fleet_manager |  |
|  | `due_soon` | `overdue` | system |  |
|  | `acknowledged` | `completed` | fleet_manager |  |
|  | `acknowledged` | `overdue` | system |  |
|  | `overdue` | `completed` | fleet_manager |  |
|  | `any` | `waived` | fleet_manager |  |

## Rules

- **daily_scan:**
  - **description:** System runs a daily check to identify all renewal items where due_date minus today is less than or equal to advance_notice_days
- **reminder_frequency:**
  - **description:** A reminder notification is sent once per reminder_frequency_days until status is completed or waived
- **escalation_after_three:**
  - **description:** Overdue items are escalated to the operations supervisor after 3 unanswered reminders
- **overdue_transition:**
  - **description:** An item transitions to overdue when due_date has passed and status is not completed or waived
- **new_cycle_on_completion:**
  - **description:** Completing a renewal must supply a new due_date for the next cycle — a new reminder record is created automatically
- **reminder_types:**
  - **description:** Reminder types include at minimum: vehicle_license, registration_certificate, roadworthiness, insurance_policy

## Outcomes

### Item_turned_overdue (Priority: 5)

**Given:**
- due_date has passed
- status is not completed or waived

**Then:**
- **set_field** target: `status` value: `overdue`
- **notify** — Send overdue alert to fleet manager and operations supervisor
- **emit_event** event: `reminder.vehicle_renewal_overdue`

**Result:** Item is marked overdue and stakeholders are alerted

### Escalation_triggered (Priority: 6)

**Given:**
- status is due_soon or overdue
- number of reminders sent is greater than or equal to 3
- reminder has not been acknowledged

**Then:**
- **notify** — Send escalation notification to operations supervisor
- **emit_event** event: `reminder.vehicle_renewal_escalated`

**Result:** Operations supervisor is notified of the unactioned renewal

### Renewal_completed (Priority: 7)

**Given:**
- status is acknowledged, due_soon, or overdue
- completion_date is provided
- new due_date for next cycle is provided

**Then:**
- **set_field** target: `status` value: `completed`
- **set_field** target: `completion_date` value: `completion_date`
- **create_record** — Create new upcoming reminder record for the next renewal cycle with updated due_date
- **emit_event** event: `reminder.vehicle_renewal_completed`

**Result:** Current reminder is closed and a new reminder for the next cycle is created

### Reminder_acknowledged (Priority: 8)

**Given:**
- status is due_soon
- fleet manager confirms they are working on the renewal

**Then:**
- **set_field** target: `status` value: `acknowledged`
- **set_field** target: `acknowledged_by` value: `current_user`
- **set_field** target: `acknowledged_date` value: `today`

**Result:** Reminder status is updated and escalation clock is paused

### Reminder_resent (Priority: 9)

**Given:**
- status is due_soon or overdue
- today minus last_sent_date is greater than or equal to reminder_frequency_days
- status is not completed or waived

**Then:**
- **notify** — Re-send reminder notification to assigned_to user
- **set_field** target: `last_sent_date` value: `today`

**Result:** Follow-up reminder is sent to the assignee

### Reminder_triggered (Priority: 10)

**Given:**
- system daily scan runs
- due_date minus today is less than or equal to advance_notice_days
- status is upcoming

**Then:**
- **set_field** target: `status` value: `due_soon`
- **notify** — Send reminder notification to assigned_to user
- **set_field** target: `last_sent_date` value: `today`
- **emit_event** event: `reminder.vehicle_renewal_triggered`

**Result:** Assignee receives a notification with details of the upcoming expiry

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REMINDER_INVALID_DUE_DATE` | 400 | Due date must be a valid future date. | No |
| `REMINDER_MISSING_ASSIGNEE` | 400 | A renewal reminder must have an assigned responsible person. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `reminder.vehicle_renewal_triggered` | A renewal reminder has entered the advance notice window and the first notification was sent | `vehicle`, `reminder_type`, `due_date`, `days_remaining` |
| `reminder.vehicle_renewal_completed` | A renewal action was completed and a new reminder cycle was started | `vehicle`, `reminder_type`, `completion_date`, `next_due_date` |
| `reminder.vehicle_renewal_overdue` | A required renewal has not been completed by the due date | `vehicle`, `reminder_type`, `due_date` |
| `reminder.vehicle_renewal_escalated` | Repeated unanswered reminders have triggered escalation to a supervisor | `vehicle`, `reminder_type`, `due_date`, `reminders_sent` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-insurance | required | Insurance policy expiry dates are a primary source of renewal reminders |
| vehicle-registration | required | Registration expiry dates trigger renewal reminders |
| vehicle-documents | recommended | Document expiry dates (permits, roadworthiness) are managed alongside renewal reminders |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 2
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Renewal Reminders Blueprint",
  "description": "Automatically generate and send renewal reminders for vehicle licenses, registrations, roadworthiness certificates, and insurance policies before they expire.. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, reminders, compliance, renewal, notifications"
}
</script>
