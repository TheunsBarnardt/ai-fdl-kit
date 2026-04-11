<!-- AUTO-GENERATED FROM scheduling-calendar.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Scheduling Calendar

> Calendar event management with bookings, availability tracking, recurring events (RRULE), conflict detection, timezone-aware storage, and configurable time slot granularity.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** calendar · scheduling · events · bookings · availability · recurring · timezone

## What this does

Calendar event management with bookings, availability tracking, recurring events (RRULE), conflict detection, timezone-aware storage, and configurable time slot granularity.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **event_id** *(text, required)* — Event ID
- **title** *(text, required)* — Event Title
- **start_time** *(datetime, required)* — Start Time
- **end_time** *(datetime, required)* — End Time
- **all_day** *(boolean, optional)* — All Day Event
- **recurrence_rule** *(text, optional)* — Recurrence Rule
- **recurrence_exceptions** *(json, optional)* — Recurrence Exceptions
- **location** *(text, optional)* — Location
- **attendees** *(json, optional)* — Attendees
- **status** *(select, required)* — Event Status
- **reminder_minutes** *(json, optional)* — Reminders
- **buffer_minutes** *(number, optional)* — Buffer Time (minutes)
- **organizer_id** *(text, required)* — Organizer
- **timezone** *(text, optional)* — Display Timezone

## What must be true

- **no_double_booking:** No two confirmed events for the same attendee may overlap in time. The system checks start_time/end_time (including buffer) against all existing confirmed events for each attendee before creating or updating an event.
- **timezone_handling:** All times are stored in UTC. Display conversion uses the event's timezone field or the user's profile timezone. DST transitions are handled by the IANA timezone database.
- **recurring_events:** Recurrence rules follow RFC 5545 RRULE syntax supporting FREQ values: DAILY, WEEKLY, MONTHLY, YEARLY. Exceptions are stored as explicit date exclusions. Editing a single occurrence creates an exception and a standalone override event.
- **slot_granularity:** Booking slots snap to 15-minute boundaries. Events cannot start or end at arbitrary minutes; they round to the nearest 15-minute mark (00, 15, 30, 45).
- **buffer_enforcement:** When buffer_minutes is set, conflict detection extends the event window by the buffer amount on both sides. Back-to-back events must respect the larger buffer of the two adjacent events.
- **end_after_start:** end_time must always be after start_time. For all-day events, end_time defaults to start_time + 24 hours if not explicitly set.

## Success & failure scenarios

**✅ Success paths**

- **Event Created** — when organizer is authenticated; Event title is provided; Start time is provided; no time conflict exists for the organizer or any attendee, then Event created and attendees notified.
- **Event Updated** — when organizer is authenticated and owns the event; updated time slot has no conflicts for any attendee, then Event updated and attendees notified of changes.
- **Event Canceled** — when organizer is authenticated and owns the event; Event is not already canceled, then Event canceled and all participants notified.
- **Booking Requested** — when attendee selects an available time slot; slot aligns with 15-minute granularity; no conflict with existing bookings, then Booking request submitted for organizer approval.
- **Booking Confirmed** — when organizer reviews a tentative booking; time slot is still available (no conflict since request), then Booking confirmed and both parties notified.

**❌ Failure paths**

- **Conflict Detected** — when requested time range overlaps with an existing confirmed event; overlap includes buffer time if configured, then Event creation or update rejected due to time conflict. *(error: `CALENDAR_CONFLICT`)*
- **Invalid Recurrence** — when recurrence_rule does not conform to RFC 5545 RRULE syntax, then Event rejected with invalid recurrence rule error. *(error: `CALENDAR_INVALID_RRULE`)*
- **Invalid Time Range** — when End time is not after start time, then Event rejected because end time must be after start time. *(error: `CALENDAR_INVALID_TIME`)*

## Errors it can return

- `CALENDAR_CONFLICT` — The requested time conflicts with an existing event.
- `CALENDAR_INVALID_RRULE` — The recurrence rule is not valid RFC 5545 RRULE syntax.
- `CALENDAR_INVALID_TIME` — End time must be after start time.
- `CALENDAR_EVENT_NOT_FOUND` — The requested calendar event does not exist.
- `CALENDAR_ACCESS_DENIED` — You do not have permission to modify this event.
- `CALENDAR_SLOT_MISALIGNED` — Event times must align to 15-minute boundaries.

## Connects to

- **task-management** *(optional)* — Task due dates and milestones can sync to calendar events
- **approval-chain** *(optional)* — Event bookings for shared resources may require approval
- **email-notifications** *(recommended)* — Send event invitations and reminders via email
- **push-notifications** *(optional)* — Send real-time reminder notifications before events

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/scheduling-calendar/) · **Spec source:** [`scheduling-calendar.blueprint.yaml`](./scheduling-calendar.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
