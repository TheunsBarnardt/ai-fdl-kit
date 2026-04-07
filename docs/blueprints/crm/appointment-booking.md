---
title: "Appointment Booking Blueprint"
layout: default
parent: "Crm"
grand_parent: Blueprint Catalog
description: "Self-service appointment scheduling with availability slot management, email verification, agent assignment, and calendar event integration. . 18 fields. 11 out"
---

# Appointment Booking Blueprint

> Self-service appointment scheduling with availability slot management, email verification, agent assignment, and calendar event integration.


| | |
|---|---|
| **Feature** | `appointment-booking` |
| **Category** | Crm |
| **Version** | 1.0.0 |
| **Tags** | appointment, scheduling, booking, calendar, self-service |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/crm/appointment-booking.blueprint.yaml) |
| **JSON API** | [appointment-booking.json]({{ site.baseurl }}/api/blueprints/crm/appointment-booking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `visitor` | Visitor | human | External person booking an appointment via the public form |
| `agent` | Agent | human | Internal team member assigned to handle the appointment |
| `system` | System | system | Validates availability, sends verification emails, assigns agents, creates calendar events |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `appointment_status` | select | Yes | Appointment Status |  |
| `customer_name` | text | Yes | Customer Name | Validations: required |
| `customer_email` | email | Yes | Customer Email | Validations: required, email |
| `customer_phone_number` | phone | No | Customer Phone |  |
| `customer_details` | text | No | Customer Details |  |
| `scheduled_time` | datetime | Yes | Scheduled Time |  |
| `party_type` | select | No | Party Type |  |
| `party` | text | No | Party |  |
| `calendar_event` | text | No | Calendar Event |  |
| `enable_scheduling` | boolean | No | Enable Appointment Scheduling |  |
| `advance_booking_days` | number | No | Advance Booking Days | Validations: min |
| `appointment_duration` | number | No | Appointment Duration (minutes) | Validations: min |
| `number_of_agents` | number | No | Number of Agents | Validations: min |
| `agent_list` | json | No | Agent List |  |
| `holiday_list` | text | No | Holiday List |  |
| `email_reminders` | boolean | No | Send Email Reminders |  |
| `success_redirect_url` | url | No | Success Redirect URL |  |
| `availability_slots` | json | No | Availability Slots |  |

## States

**State field:** `appointment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Unverified` | Yes |  |
| `Open` |  |  |
| `Closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Unverified` | `Open` | system |  |
|  | `Open` | `Closed` | agent |  |

## Rules

- **slot_availability_enforcement:**
  - **description:** Before creating an appointment, the system checks that the requested time slot is available. The maximum concurrent appointments per slot is limited by the number_of_agents setting.

- **email_verification_flow:**
  - **description:** Appointments from unknown visitors (no existing lead/customer match) start in Unverified status. A verification email is sent and the appointment is only promoted to Open after confirmation.

- **auto_create_lead:**
  - **description:** When a verified appointment has no matching lead or customer, a new Lead record is automatically created from the visitor's details.

- **agent_assignment:**
  - **description:** Agents are auto-assigned based on the latest opportunity owner for the party, or by least current workload if no prior relationship exists.

- **calendar_event_creation:**
  - **description:** A calendar event is created with both the party and the assigned agent/employee as participants upon appointment confirmation.

- **availability_time_validation:**
  - **description:** Availability slot from_time must be earlier than to_time. Slots cannot overlap within the same day of the week.

- **slot_duration_divisibility:**
  - **description:** Each availability slot duration must be evenly divisible by the appointment_duration setting to avoid partial time blocks.

- **holiday_exclusion:**
  - **description:** Dates in the configured holiday list are excluded from available booking dates. Visitors cannot book on holidays.


## Outcomes

### Create_appointment (Priority: 1)

**Given:**
- visitor provides name, email, and desired time
- requested time slot has availability

**Then:**
- **create_record** — Appointment created in Unverified or Open status
- **emit_event** event: `appointment.created`

**Result:** Appointment is created and queued for verification if visitor is unknown

### Slot_unavailable (Priority: 1) — Error: `APPOINTMENT_SLOT_UNAVAILABLE`

**Given:**
- requested time slot has no remaining agent capacity

**Then:**
- **notify** — Show available alternative time slots

**Result:** Booking blocked — no available agents for the requested slot

### Verification_failed (Priority: 1) — Error: `APPOINTMENT_VERIFICATION_FAILED`

**Given:**
- verification token is invalid or expired

**Then:**
- **notify** — Prompt visitor to request a new verification email

**Result:** Email verification failed — token invalid or expired

### Slot_duration_invalid (Priority: 1) — Error: `APPOINTMENT_SLOT_DURATION_INVALID`

**Given:**
- availability slot duration is not evenly divisible by appointment_duration

**Then:**
- **notify** — Show that slot duration must be a multiple of appointment duration

**Result:** Settings rejected — slot duration must be divisible by appointment duration

### Slot_time_invalid (Priority: 1) — Error: `APPOINTMENT_SLOT_TIME_INVALID`

**Given:**
- availability slot from_time is not earlier than to_time

**Then:**
- **notify** — Show that from_time must be before to_time

**Result:** Settings rejected — from_time must be earlier than to_time

### Verify_email (Priority: 2)

**Given:**
- appointment is in Unverified status
- visitor clicks the email verification link

**Then:**
- **transition_state** field: `appointment_status` from: `Unverified` to: `Open`
- **emit_event** event: `appointment.verified`

**Result:** Appointment is verified and promoted to Open status

### Assign_agent (Priority: 3)

**Given:**
- appointment is in Open status
- agent list is configured in settings

**Then:**
- **set_field** target: `party` — Assign agent based on prior relationship or least workload
- **emit_event** event: `appointment.agent_assigned`

**Result:** Agent is assigned to handle the appointment

### Create_calendar_event (Priority: 4)

**Given:**
- appointment is in Open status
- agent has been assigned

**Then:**
- **create_record** — Calendar event with party and agent as participants
- **set_field** target: `calendar_event` — Link calendar event reference to appointment

**Result:** Calendar event created with all participants notified

### Book_slot (Priority: 5)

**Given:**
- visitor selects an available date and time
- slot has fewer current bookings than number_of_agents

**Then:**
- **set_field** target: `scheduled_time` — Slot reserved for the visitor

**Result:** Time slot is reserved for the appointment

### Cancel_appointment (Priority: 6)

**Given:**
- appointment is in Open status
- agent or visitor requests cancellation

**Then:**
- **transition_state** field: `appointment_status` from: `Open` to: `Closed`
- **delete_record** — Remove the linked calendar event

**Result:** Appointment is cancelled and calendar event removed

### Send_reminder (Priority: 10)

**Given:**
- appointment is in Open status
- email_reminders is enabled in settings
- reminder send time has been reached

**Then:**
- **call_service** target: `email_service` — Send appointment reminder to visitor and agent
- **emit_event** event: `appointment.reminder_sent`

**Result:** Reminder email sent to both visitor and assigned agent

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `APPOINTMENT_SLOT_UNAVAILABLE` | 409 | The requested time slot is fully booked. Please choose a different time. | No |
| `APPOINTMENT_VERIFICATION_FAILED` | 400 | Email verification failed. The link may have expired. Please request a new verification email. | No |
| `APPOINTMENT_SLOT_DURATION_INVALID` | 400 | Availability slot duration must be evenly divisible by the appointment duration setting. | No |
| `APPOINTMENT_SLOT_TIME_INVALID` | 400 | Availability slot start time must be earlier than end time. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `appointment.created` | New appointment booking submitted | `appointment_id`, `customer_email`, `scheduled_time` |
| `appointment.verified` | Visitor confirmed email and appointment is active | `appointment_id`, `customer_email` |
| `appointment.agent_assigned` | Agent assigned to handle the appointment | `appointment_id`, `agent_id` |
| `appointment.reminder_sent` | Reminder email sent before the appointment | `appointment_id`, `customer_email` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| lead-opportunity-pipeline | recommended | Verified appointments auto-create leads for unknown visitors |
| customer-supplier-management | optional | Appointments may be linked to existing customer records |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python/Frappe Framework
  files_traced: 5
  entry_points:
    - erpnext/crm/doctype/appointment/appointment.py
    - erpnext/crm/doctype/appointment_booking_settings/appointment_booking_settings.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Appointment Booking Blueprint",
  "description": "Self-service appointment scheduling with availability slot management, email verification, agent assignment, and calendar event integration.\n. 18 fields. 11 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "appointment, scheduling, booking, calendar, self-service"
}
</script>
