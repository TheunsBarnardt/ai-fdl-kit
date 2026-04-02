---
title: "Scheduling Calendar Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Calendar event management with bookings, availability tracking, recurring events (RRULE), conflict detection, timezone-aware storage, and configurable time slot"
---

# Scheduling Calendar Blueprint

> Calendar event management with bookings, availability tracking, recurring events (RRULE), conflict detection, timezone-aware storage, and configurable time slot granularity.


| | |
|---|---|
| **Feature** | `scheduling-calendar` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | calendar, scheduling, events, bookings, availability, recurring, timezone |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/scheduling-calendar.blueprint.yaml) |
| **JSON API** | [scheduling-calendar.json]({{ site.baseurl }}/api/blueprints/workflow/scheduling-calendar.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `organizer` | Organizer | human | Creates and manages calendar events and bookings |
| `attendee` | Attendee | human | Receives invitations and responds to event requests |
| `system` | Calendar Engine | system | Handles conflict detection, recurrence expansion, and reminders |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | text | Yes | Event ID |  |
| `title` | text | Yes | Event Title | Validations: required, maxLength |
| `start_time` | datetime | Yes | Start Time | Validations: required |
| `end_time` | datetime | Yes | End Time | Validations: required |
| `all_day` | boolean | No | All Day Event |  |
| `recurrence_rule` | text | No | Recurrence Rule |  |
| `recurrence_exceptions` | json | No | Recurrence Exceptions |  |
| `location` | text | No | Location |  |
| `attendees` | json | No | Attendees |  |
| `status` | select | Yes | Event Status |  |
| `reminder_minutes` | json | No | Reminders |  |
| `buffer_minutes` | number | No | Buffer Time (minutes) |  |
| `organizer_id` | text | Yes | Organizer |  |
| `timezone` | text | No | Display Timezone |  |

## Rules

- **no_double_booking:**
  - **description:** No two confirmed events for the same attendee may overlap in time. The system checks start_time/end_time (including buffer) against all existing confirmed events for each attendee before creating or updating an event.

- **timezone_handling:**
  - **description:** All times are stored in UTC. Display conversion uses the event's timezone field or the user's profile timezone. DST transitions are handled by the IANA timezone database.

- **recurring_events:**
  - **description:** Recurrence rules follow RFC 5545 RRULE syntax supporting FREQ values: DAILY, WEEKLY, MONTHLY, YEARLY. Exceptions are stored as explicit date exclusions. Editing a single occurrence creates an exception and a standalone override event.

- **slot_granularity:**
  - **description:** Booking slots snap to 15-minute boundaries. Events cannot start or end at arbitrary minutes; they round to the nearest 15-minute mark (00, 15, 30, 45).

- **buffer_enforcement:**
  - **description:** When buffer_minutes is set, conflict detection extends the event window by the buffer amount on both sides. Back-to-back events must respect the larger buffer of the two adjacent events.

- **end_after_start:**
  - **description:** end_time must always be after start_time. For all-day events, end_time defaults to start_time + 24 hours if not explicitly set.


## Outcomes

### Event_created (Priority: 1)

**Given:**
- organizer is authenticated
- `title` (input) exists
- `start_time` (input) exists
- no time conflict exists for the organizer or any attendee

**Then:**
- **create_record** target: `calendar_events` — New event created with confirmed or tentative status
- **emit_event** event: `event.created`
- **notify** — Invitation sent to all attendees

**Result:** Event created and attendees notified

### Event_updated (Priority: 2)

**Given:**
- organizer is authenticated and owns the event
- updated time slot has no conflicts for any attendee

**Then:**
- **set_field** target: `updated fields` value: `new values`
- **emit_event** event: `event.updated`
- **notify** — Attendees notified of event changes

**Result:** Event updated and attendees notified of changes

### Event_canceled (Priority: 3)

**Given:**
- organizer is authenticated and owns the event
- `status` (db) neq `canceled`

**Then:**
- **transition_state** field: `status` from: `current_status` to: `canceled`
- **emit_event** event: `event.canceled`
- **notify** — All attendees notified of cancellation

**Result:** Event canceled and all participants notified

### Booking_requested (Priority: 4)

**Given:**
- attendee selects an available time slot
- slot aligns with 15-minute granularity
- no conflict with existing bookings

**Then:**
- **create_record** target: `calendar_events` — Booking created with tentative status pending organizer confirmation
- **emit_event** event: `booking.requested`
- **notify** — Organizer notified of booking request

**Result:** Booking request submitted for organizer approval

### Booking_confirmed (Priority: 5)

**Given:**
- organizer reviews a tentative booking
- time slot is still available (no conflict since request)

**Then:**
- **transition_state** field: `status` from: `tentative` to: `confirmed`
- **emit_event** event: `booking.confirmed`
- **notify** — Attendee notified of confirmed booking

**Result:** Booking confirmed and both parties notified

### Conflict_detected (Priority: 6) — Error: `CALENDAR_CONFLICT`

**Given:**
- requested time range overlaps with an existing confirmed event
- overlap includes buffer time if configured

**Result:** Event creation or update rejected due to time conflict

### Invalid_recurrence (Priority: 7) — Error: `CALENDAR_INVALID_RRULE`

**Given:**
- recurrence_rule does not conform to RFC 5545 RRULE syntax

**Result:** Event rejected with invalid recurrence rule error

### Invalid_time_range (Priority: 8) — Error: `CALENDAR_INVALID_TIME`

**Given:**
- `end_time` (input) lte `start_time`

**Result:** Event rejected because end time must be after start time

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CALENDAR_CONFLICT` | 409 | The requested time conflicts with an existing event. | No |
| `CALENDAR_INVALID_RRULE` | 400 | The recurrence rule is not valid RFC 5545 RRULE syntax. | No |
| `CALENDAR_INVALID_TIME` | 400 | End time must be after start time. | No |
| `CALENDAR_EVENT_NOT_FOUND` | 404 | The requested calendar event does not exist. | No |
| `CALENDAR_ACCESS_DENIED` | 403 | You do not have permission to modify this event. | No |
| `CALENDAR_SLOT_MISALIGNED` | 400 | Event times must align to 15-minute boundaries. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `event.created` | A new calendar event was created | `event_id`, `title`, `organizer_id`, `start_time`, `end_time` |
| `event.updated` | A calendar event was modified | `event_id`, `changed_fields`, `organizer_id` |
| `event.canceled` | A calendar event was canceled | `event_id`, `organizer_id`, `attendee_ids` |
| `booking.requested` | An attendee requested a booking slot | `event_id`, `attendee_id`, `start_time`, `end_time` |
| `booking.confirmed` | An organizer confirmed a booking request | `event_id`, `attendee_id`, `organizer_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| task-management | optional | Task due dates and milestones can sync to calendar events |
| approval-chain | optional | Event bookings for shared resources may require approval |
| email-notifications | recommended | Send event invitations and reminders via email |
| push-notifications | optional | Send real-time reminder notifications before events |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Scheduling Calendar Blueprint",
  "description": "Calendar event management with bookings, availability tracking, recurring events (RRULE), conflict detection, timezone-aware storage, and configurable time slot",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "calendar, scheduling, events, bookings, availability, recurring, timezone"
}
</script>
