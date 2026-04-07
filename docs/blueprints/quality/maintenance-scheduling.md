---
title: "Maintenance Scheduling Blueprint"
layout: default
parent: "Quality"
grand_parent: Blueprint Catalog
description: "Maintenance scheduling and visit management with auto-generated visit dates, holiday avoidance, calendar events, and warranty status tracking for customer equip"
---

# Maintenance Scheduling Blueprint

> Maintenance scheduling and visit management with auto-generated visit dates, holiday avoidance, calendar events, and warranty status tracking for customer equipment.


| | |
|---|---|
| **Feature** | `maintenance-scheduling` |
| **Category** | Quality |
| **Version** | 1.0.0 |
| **Tags** | maintenance-schedule, maintenance-visit, preventive-maintenance, warranty, calendar-events, field-service |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/quality/maintenance-scheduling.blueprint.yaml) |
| **JSON API** | [maintenance-scheduling.json]({{ site.baseurl }}/api/blueprints/quality/maintenance-scheduling.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `customer` | text | Yes | Customer |  |
| `company` | text | Yes | Company |  |
| `items` | json | Yes | Schedule Items |  |
| `schedules` | json | No | Generated Schedules |  |
| `visit_date` | date | Yes | Visit Date |  |
| `visit_time` | text | No | Visit Time |  |
| `visit_customer` | text | Yes | Visit Customer |  |
| `visit_company` | text | Yes | Visit Company |  |
| `maintenance_type` | select | Yes | Maintenance Type |  |
| `maintenance_schedule` | text | No | Maintenance Schedule Reference |  |
| `completion_status` | select | Yes | Completion Status |  |
| `customer_feedback` | text | No | Customer Feedback |  |
| `purposes` | json | Yes | Visit Purposes |  |

## States

**State field:** `schedule_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` |  |  |
|  | `submitted` | `cancelled` |  |  |

## Rules

- **visit_dates_auto_generated:**
  - **description:** Visit dates are auto-generated based on the periodicity setting (Weekly, Monthly, Quarterly, Half Yearly, Yearly, or Random).

- **holiday_avoidance:**
  - **description:** Generated visit dates avoid company holidays. If a calculated date falls on a holiday, it is shifted to the previous working day.

- **serial_number_validation:**
  - **description:** Serial numbers specified in schedule items are validated against the item and checked for warranty status.

- **calendar_events_per_visit:**
  - **description:** Calendar events are created for each scheduled visit, assigned to the designated sales person or service person.

- **visit_updates_schedule:**
  - **description:** Completing a maintenance visit updates the corresponding schedule detail record with the actual completion date and status.

- **warranty_status_update:**
  - **description:** Warranty claim status and AMC expiry date are updated on the serial number based on visit completion.

- **cannot_cancel_with_later_visits:**
  - **description:** A maintenance visit cannot be cancelled if later visits in the same schedule already exist and are completed.

- **amc_expiry_update:**
  - **description:** AMC (Annual Maintenance Contract) expiry date is updated on the serial number record upon schedule submission.


## Outcomes

### Generate_schedule — Error: `SCHEDULE_NO_VISITS_GENERATED`

**Given:**
- customer, company, and items with date ranges and periodicity are provided
- date range is sufficient for at least one visit

**Then:**
- **set_field** target: `schedules` — Visit dates generated based on periodicity and holiday calendar
- **emit_event** event: `schedule.generated`

**Result:** Maintenance schedule generated with visit dates

### Submit_schedule — Error: `SCHEDULE_DATE_RANGE_TOO_SHORT`

**Given:**
- schedule exists in Draft status
- at least one visit date is generated

**Then:**
- **transition_state** field: `schedule_status` from: `draft` to: `submitted`
- **emit_event** event: `schedule.submitted`

**Result:** Schedule submitted and locked for execution

### Create_calendar_events

**Given:**
- schedule is in Submitted status
- sales_person or service_person is assigned

**Then:**
- **create_record** target: `calendar_events` — Calendar events created for each scheduled visit

**Result:** Calendar events created and assigned to service personnel

### Record_visit — Error: `VISIT_DATE_OUT_OF_RANGE`

**Given:**
- visit_date and visit_customer are provided
- purposes with service_person and work_done are provided

**Then:**
- **create_record** target: `maintenance_visit` — Maintenance visit recorded

**Result:** Maintenance visit recorded with work details

### Complete_visit

**Given:**
- maintenance visit exists
- all purposes have work_done recorded

**Then:**
- **set_field** target: `completion_status` value: `Fully Completed`
- **set_field** target: `schedule_detail_status` — Corresponding schedule detail updated
- **emit_event** event: `visit.completed`

**Result:** Visit marked complete and schedule updated

### Update_warranty_status

**Given:**
- visit is completed
- serial numbers are specified in visit purposes

**Then:**
- **set_field** target: `serial_warranty_status` — Warranty/AMC status updated on serial number
- **emit_event** event: `warranty.status_updated`

**Result:** Serial number warranty and AMC status updated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCHEDULE_NO_VISITS_GENERATED` | 400 | No visits could be generated for the specified date range and periodicity. | No |
| `SCHEDULE_DATE_RANGE_TOO_SHORT` | 400 | The date range is too short to generate visits with the specified periodicity. | No |
| `SCHEDULE_SERIAL_UNDER_WARRANTY` | 400 | The specified serial number is still under active warranty. | No |
| `VISIT_LATER_EXISTS` | 400 | Cannot cancel this visit because later visits in the schedule are already completed. | No |
| `VISIT_DATE_OUT_OF_RANGE` | 400 | The visit date falls outside the maintenance schedule date range. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `schedule.generated` | Fired when maintenance schedule visit dates are generated | `customer`, `items`, `total_visits` |
| `schedule.submitted` | Fired when a maintenance schedule is submitted | `customer`, `company`, `items` |
| `visit.completed` | Fired when a maintenance visit is completed | `visit_customer`, `visit_date`, `purposes` |
| `visit.cancelled` | Fired when a maintenance visit is cancelled | `visit_customer`, `visit_date` |
| `warranty.status_updated` | Fired when warranty status is updated from a visit | `serial_no`, `warranty_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| serial-batch-tracking | recommended | Serial numbers validated for warranty and AMC status |
| customer-supplier-management | recommended | Customer data used for schedule and visit management |
| support-tickets-sla | optional | Breakdown visits may link to support tickets |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Maintenance Scheduling Blueprint",
  "description": "Maintenance scheduling and visit management with auto-generated visit dates, holiday avoidance, calendar events, and warranty status tracking for customer equip",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "maintenance-schedule, maintenance-visit, preventive-maintenance, warranty, calendar-events, field-service"
}
</script>
