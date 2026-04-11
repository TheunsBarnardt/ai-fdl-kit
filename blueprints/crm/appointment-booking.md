<!-- AUTO-GENERATED FROM appointment-booking.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Appointment Booking

> Self-service appointment scheduling with availability slot management, email verification, agent assignment, and calendar event integration.

**Category:** Crm · **Version:** 1.0.0 · **Tags:** appointment · scheduling · booking · calendar · self-service

## What this does

Self-service appointment scheduling with availability slot management, email verification, agent assignment, and calendar event integration.

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **appointment_status** *(select, required)* — Appointment Status
- **customer_name** *(text, required)* — Customer Name
- **customer_email** *(email, required)* — Customer Email
- **customer_phone_number** *(phone, optional)* — Customer Phone
- **customer_details** *(text, optional)* — Customer Details
- **scheduled_time** *(datetime, required)* — Scheduled Time
- **party_type** *(select, optional)* — Party Type
- **party** *(text, optional)* — Party
- **calendar_event** *(text, optional)* — Calendar Event
- **enable_scheduling** *(boolean, optional)* — Enable Appointment Scheduling
- **advance_booking_days** *(number, optional)* — Advance Booking Days
- **appointment_duration** *(number, optional)* — Appointment Duration (minutes)
- **number_of_agents** *(number, optional)* — Number of Agents
- **agent_list** *(json, optional)* — Agent List
- **holiday_list** *(text, optional)* — Holiday List
- **email_reminders** *(boolean, optional)* — Send Email Reminders
- **success_redirect_url** *(url, optional)* — Success Redirect URL
- **availability_slots** *(json, optional)* — Availability Slots

## What must be true

- **slot_availability_enforcement:** Before creating an appointment, the system checks that the requested time slot is available. The maximum concurrent appointments per slot is limited by the number_of_agents setting.
- **email_verification_flow:** Appointments from unknown visitors (no existing lead/customer match) start in Unverified status. A verification email is sent and the appointment is only promoted to Open after confirmation.
- **auto_create_lead:** When a verified appointment has no matching lead or customer, a new Lead record is automatically created from the visitor's details.
- **agent_assignment:** Agents are auto-assigned based on the latest opportunity owner for the party, or by least current workload if no prior relationship exists.
- **calendar_event_creation:** A calendar event is created with both the party and the assigned agent/employee as participants upon appointment confirmation.
- **availability_time_validation:** Availability slot from_time must be earlier than to_time. Slots cannot overlap within the same day of the week.
- **slot_duration_divisibility:** Each availability slot duration must be evenly divisible by the appointment_duration setting to avoid partial time blocks.
- **holiday_exclusion:** Dates in the configured holiday list are excluded from available booking dates. Visitors cannot book on holidays.

## Success & failure scenarios

**✅ Success paths**

- **Create Appointment** — when visitor provides name, email, and desired time; requested time slot has availability, then Appointment is created and queued for verification if visitor is unknown.
- **Verify Email** — when appointment is in Unverified status; visitor clicks the email verification link, then Appointment is verified and promoted to Open status.
- **Assign Agent** — when appointment is in Open status; agent list is configured in settings, then Agent is assigned to handle the appointment.
- **Create Calendar Event** — when appointment is in Open status; agent has been assigned, then Calendar event created with all participants notified.
- **Book Slot** — when visitor selects an available date and time; slot has fewer current bookings than number_of_agents, then Time slot is reserved for the appointment.
- **Cancel Appointment** — when appointment is in Open status; agent or visitor requests cancellation, then Appointment is cancelled and calendar event removed.
- **Send Reminder** — when appointment is in Open status; email_reminders is enabled in settings; reminder send time has been reached, then Reminder email sent to both visitor and assigned agent.

**❌ Failure paths**

- **Slot Unavailable** — when requested time slot has no remaining agent capacity, then Booking blocked — no available agents for the requested slot. *(error: `APPOINTMENT_SLOT_UNAVAILABLE`)*
- **Verification Failed** — when verification token is invalid or expired, then Email verification failed — token invalid or expired. *(error: `APPOINTMENT_VERIFICATION_FAILED`)*
- **Slot Duration Invalid** — when availability slot duration is not evenly divisible by appointment_duration, then Settings rejected — slot duration must be divisible by appointment duration. *(error: `APPOINTMENT_SLOT_DURATION_INVALID`)*
- **Slot Time Invalid** — when availability slot from_time is not earlier than to_time, then Settings rejected — from_time must be earlier than to_time. *(error: `APPOINTMENT_SLOT_TIME_INVALID`)*

## Errors it can return

- `APPOINTMENT_SLOT_UNAVAILABLE` — The requested time slot is fully booked. Please choose a different time.
- `APPOINTMENT_VERIFICATION_FAILED` — Email verification failed. The link may have expired. Please request a new verification email.
- `APPOINTMENT_SLOT_DURATION_INVALID` — Availability slot duration must be evenly divisible by the appointment duration setting.
- `APPOINTMENT_SLOT_TIME_INVALID` — Availability slot start time must be earlier than end time.

## Connects to

- **lead-opportunity-pipeline** *(recommended)* — Verified appointments auto-create leads for unknown visitors
- **customer-supplier-management** *(optional)* — Appointments may be linked to existing customer records

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/crm/appointment-booking/) · **Spec source:** [`appointment-booking.blueprint.yaml`](./appointment-booking.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
