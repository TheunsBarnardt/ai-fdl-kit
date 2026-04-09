---
title: "Support Tickets Sla Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim"
---

# Support Tickets Sla Blueprint

> Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim handling.


| | |
|---|---|
| **Feature** | `support-tickets-sla` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | support, tickets, sla, issue-tracking, warranty, customer-service, helpdesk |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/support-tickets-sla.blueprint.yaml) |
| **JSON API** | [support-tickets-sla.json]({{ site.baseurl }}/api/blueprints/workflow/support-tickets-sla.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `subject` | text | Yes | Subject |  |
| `status` | select | Yes | Issue Status |  |
| `priority` | select | Yes | Priority |  |
| `issue_type` | text | No | Issue Type |  |
| `customer` | text | No | Customer |  |
| `raised_by` | email | No | Raised By |  |
| `description` | rich_text | No | Description |  |
| `resolution` | rich_text | No | Resolution |  |
| `first_responded_on` | datetime | No | First Responded On |  |
| `resolution_date` | datetime | No | Resolution Date |  |
| `opening_date` | date | Yes | Opening Date |  |
| `service_level_agreement` | text | No | Service Level Agreement |  |
| `response_by` | datetime | No | Response By |  |
| `resolution_by` | datetime | No | Resolution By |  |
| `agreement_status` | select | No | Agreement Status |  |
| `first_response_time` | number | No | First Response Time (seconds) |  |
| `avg_response_time` | number | No | Average Response Time (seconds) |  |
| `service_level` | text | Yes | Service Level Name |  |
| `enabled` | boolean | No | Enabled |  |
| `default_sla` | boolean | No | Default SLA |  |
| `entity_type` | select | No | Entity Type |  |
| `entity` | text | No | Entity |  |
| `priorities` | json | No | SLA Priorities |  |
| `support_and_resolution` | json | No | Support Hours |  |
| `holiday_list` | text | No | Holiday List |  |
| `apply_sla_for_resolution` | boolean | No | Apply SLA for Resolution |  |
| `condition` | text | No | SLA Condition |  |
| `warranty_customer` | text | No | Warranty Customer |  |
| `item_code` | text | No | Item Code |  |
| `serial_no` | text | No | Serial Number |  |
| `complaint` | text | No | Complaint |  |
| `warranty_status` | select | No | Warranty Status |  |
| `complaint_date` | date | No | Complaint Date |  |
| `warranty_resolution_date` | date | No | Warranty Resolution Date |  |
| `warranty_resolution` | text | No | Warranty Resolution |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `open` | Yes |  |
| `replied` |  |  |
| `on_hold` |  |  |
| `resolved` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `open` | `replied` |  |  |
|  | `replied` | `on_hold` |  |  |
|  | `open` | `on_hold` |  |  |
|  | `on_hold` | `open` |  |  |
|  | `replied` | `resolved` |  |  |
|  | `open` | `resolved` |  |  |
|  | `resolved` | `closed` |  |  |
|  | `resolved` | `open` |  |  |

## Rules

- **sla_auto_assignment:**
  - **description:** SLA is auto-assigned based on entity matching hierarchy: specific customer > customer group > territory > default SLA.

- **sla_deadline_calculation:**
  - **description:** Response and resolution deadlines are calculated from SLA priority settings and working hours, excluding holidays.

- **holiday_exclusion:**
  - **description:** Holiday list exclusions extend SLA deadlines by skipping non-working days in the calculation.

- **agreement_status_auto_set:**
  - **description:** Agreement status is auto-set to Fulfilled if resolved within SLA deadlines, or Failed if any deadline is exceeded.

- **first_response_tracking:**
  - **description:** First response time is tracked from issue creation to the first reply, and compared against the SLA response deadline.

- **multiple_sla_priority:**
  - **description:** Multiple SLAs can exist; priority-based selection ensures the most specific applicable SLA is applied.

- **warranty_serial_link:**
  - **description:** Warranty claims are linked to serial numbers and items, validating that the serial is under warranty.


## Outcomes

### Create_issue

**Given:**
- subject and opening_date are provided

**Then:**
- **create_record** target: `issue` — Issue created with Open status
- **emit_event** event: `issue.created`

**Result:** Support issue created and SLA assignment triggered

### Assign_sla — Error: `ISSUE_SLA_NOT_FOUND`

**Given:**
- issue exists and is Open
- at least one matching SLA is enabled

**Then:**
- **set_field** target: `service_level_agreement` — Most specific matching SLA assigned
- **set_field** target: `response_by` — Response deadline calculated from SLA and working hours
- **set_field** target: `resolution_by` — Resolution deadline calculated from SLA and working hours
- **emit_event** event: `issue.sla_assigned`

**Result:** SLA assigned with calculated response and resolution deadlines

### Track_response_time

**Given:**
- issue exists and first_responded_on is not set
- a reply is posted to the issue

**Then:**
- **set_field** target: `first_responded_on` — Timestamp of first response recorded
- **set_field** target: `first_response_time` — Duration from creation to first response calculated
- **emit_event** event: `issue.first_response`

**Result:** First response time recorded and compared against SLA

### Resolve_issue

**Given:**
- issue exists and is not Closed
- resolution description is provided

**Then:**
- **set_field** target: `status` value: `Resolved`
- **set_field** target: `resolution_date` — Current timestamp
- **set_field** target: `agreement_status` — Set to Fulfilled or Failed based on SLA comparison
- **emit_event** event: `issue.resolved`

**Result:** Issue resolved with SLA status determined

### Close_issue — Error: `ISSUE_ALREADY_CLOSED`

**Given:**
- issue is in Resolved status

**Then:**
- **set_field** target: `status` value: `Closed`

**Result:** Issue closed after resolution confirmation

### Escalate_issue

**Given:**
- response_by or resolution_by deadline has passed
- issue is not Resolved or Closed

**Then:**
- **set_field** target: `agreement_status` value: `Failed`
- **emit_event** event: `issue.sla_failed`

**Result:** SLA marked as failed and escalation triggered

### Create_warranty_claim — Error: `WARRANTY_SERIAL_INVALID`

**Given:**
- warranty_customer and item_code are provided
- serial_no is valid and under warranty

**Then:**
- **create_record** target: `warranty_claim` — Warranty claim created with Open status
- **emit_event** event: `warranty.claimed`

**Result:** Warranty claim created and linked to serial number

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ISSUE_SLA_NOT_FOUND` | 404 | No matching service level agreement found for this issue. | No |
| `ISSUE_ALREADY_CLOSED` | 400 | This issue is already closed and cannot be modified. | No |
| `WARRANTY_SERIAL_INVALID` | 400 | The specified serial number is invalid or not found. | No |
| `WARRANTY_EXPIRED` | 400 | The warranty period for this serial number has expired. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `issue.created` | Fired when a new support issue is created | `subject`, `priority`, `customer`, `raised_by` |
| `issue.sla_assigned` | Fired when an SLA is assigned to an issue | `subject`, `service_level_agreement`, `response_by`, `resolution_by` |
| `issue.first_response` | Fired when the first response is recorded | `subject`, `first_response_time`, `response_by` |
| `issue.resolved` | Fired when an issue is resolved | `subject`, `resolution_date`, `agreement_status` |
| `issue.sla_failed` | Fired when SLA deadlines are exceeded | `subject`, `priority`, `response_by`, `resolution_by` |
| `warranty.claimed` | Fired when a warranty claim is created | `warranty_customer`, `item_code`, `serial_no`, `complaint` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| customer-supplier-management | recommended | Customer data used for SLA entity matching |
| serial-batch-tracking | optional | Serial numbers used for warranty claim validation |

## AGI Readiness

### Goals

#### Reliable Support Tickets Sla

Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim handling.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_issue | `supervised` | - | - |
| assign_sla | `autonomous` | - | - |
| track_response_time | `autonomous` | - | - |
| resolve_issue | `autonomous` | - | - |
| close_issue | `autonomous` | - | - |
| escalate_issue | `autonomous` | - | - |
| create_warranty_claim | `supervised` | - | - |

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
  "name": "Support Tickets Sla Blueprint",
  "description": "Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "support, tickets, sla, issue-tracking, warranty, customer-service, helpdesk"
}
</script>
