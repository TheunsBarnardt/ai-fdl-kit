---
title: "Project Task Management Blueprint"
layout: default
parent: "Project"
grand_parent: Blueprint Catalog
description: "Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calcu"
---

# Project Task Management Blueprint

> Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calculated from tasks.


| | |
|---|---|
| **Feature** | `project-task-management` |
| **Category** | Project |
| **Version** | 1.0.0 |
| **Tags** | project, task, timesheet, milestone, dependency, billing, time-tracking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/project/project-task-management.blueprint.yaml) |
| **JSON API** | [project-task-management.json]({{ site.baseurl }}/api/blueprints/project/project-task-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `project_name` | text | Yes | Project Name |  |
| `company` | text | Yes | Company |  |
| `project_status` | select | Yes | Project Status |  |
| `is_active` | select | Yes | Is Active |  |
| `percent_complete` | number | No | Percent Complete | Validations: min, max |
| `expected_start_date` | date | No | Expected Start Date |  |
| `expected_end_date` | date | No | Expected End Date |  |
| `actual_start_date` | date | No | Actual Start Date |  |
| `actual_end_date` | date | No | Actual End Date |  |
| `estimated_costing` | number | No | Estimated Costing | Validations: min |
| `total_costing_amount` | number | No | Total Costing Amount |  |
| `total_billing_amount` | number | No | Total Billing Amount |  |
| `project_template` | text | No | Project Template |  |
| `cost_center` | text | No | Cost Center |  |
| `subject` | text | Yes | Task Subject |  |
| `project` | text | No | Project |  |
| `task_status` | select | Yes | Task Status |  |
| `priority` | select | No | Priority |  |
| `task_expected_start_date` | date | No | Task Expected Start Date |  |
| `task_expected_end_date` | date | No | Task Expected End Date |  |
| `progress` | number | No | Task Progress | Validations: min, max |
| `depends_on` | json | No | Task Dependencies |  |
| `is_milestone` | boolean | No | Is Milestone |  |
| `is_group` | boolean | No | Is Group |  |
| `parent_task` | text | No | Parent Task |  |
| `assigned_to` | text | No | Assigned To |  |
| `task_description` | rich_text | No | Task Description |  |
| `employee` | text | Yes | Employee |  |
| `total_hours` | number | No | Total Hours | Validations: min |
| `total_billable_hours` | number | No | Total Billable Hours | Validations: min |
| `total_billed_hours` | number | No | Total Billed Hours |  |
| `total_costing_amount_timesheet` | number | No | Timesheet Costing Amount |  |
| `total_billable_amount` | number | No | Total Billable Amount |  |
| `time_logs` | json | No | Time Logs |  |

## States

**State field:** `project_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `open` | Yes |  |
| `completed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `open` | `completed` |  |  |
|  | `open` | `cancelled` |  |  |

## Rules

- **task_dependency_enforcement:**
  - **description:** Task dependencies enforce sequential completion. A task cannot be marked Completed until all tasks in its depends_on list are Completed.

- **overdue_auto_set:**
  - **description:** Task status is automatically set to Overdue when the task_expected_end_date is earlier than today and the task is not yet Completed or Cancelled.

- **project_percent_from_tasks:**
  - **description:** Project percent_complete is auto-calculated as the weighted average of progress across all child tasks.

- **template_creates_tasks:**
  - **description:** Selecting a project template auto-creates tasks from the predefined template structure with relative dates.

- **timesheet_billable_tracking:**
  - **description:** Timesheets track billable vs non-billable hours separately. Billing and costing rates are applied per activity type.

- **activity_costing_rates:**
  - **description:** Activity costing assigns rates per activity type, allowing different billing and costing rates for different work types.

- **task_hierarchy:**
  - **description:** Tasks form a hierarchy via parent_task. Group tasks aggregate progress from their children.

- **milestone_deliverables:**
  - **description:** Milestone tasks mark key deliverables in the project timeline and are highlighted in project views.


## Outcomes

### Create_project (Priority: 10)

**Given:**
- project_name and company are provided

**Then:**
- **create_record** target: `project` — Project created with Open status
- **emit_event** event: `project.created`

**Result:** New project created and ready for task assignment

### Create_from_template (Priority: 11) — Error: `PROJECT_TEMPLATE_NOT_FOUND`

**Given:**
- project_name and company are provided
- project_template exists and is valid

**Then:**
- **create_record** target: `project` — Project created from template
- **create_record** target: `tasks` — Tasks auto-created from template structure
- **emit_event** event: `project.created`

**Result:** Project created with pre-defined tasks from template

### Create_task (Priority: 12)

**Given:**
- subject is provided
- project exists if specified

**Then:**
- **create_record** target: `task` — Task created with Open status
- **emit_event** event: `task.created`

**Result:** Task created and linked to project

### Assign_task (Priority: 13)

**Given:**
- task exists and is not Completed or Cancelled
- assigned_to is provided

**Then:**
- **set_field** target: `assigned_to` — Task assigned to specified person

**Result:** Task assigned to team member

### Log_time (Priority: 14) — Error: `TIMESHEET_OVERLAP`

**Given:**
- employee and time_logs with from_time and to_time are provided
- time log entries do not overlap with existing timesheets

**Then:**
- **create_record** target: `timesheet` — Timesheet created with calculated hours and amounts
- **emit_event** event: `timesheet.submitted`

**Result:** Time logged against project and task

### Complete_task (Priority: 15) — Error: `TASK_DEPENDENCY_INCOMPLETE`

**Given:**
- task exists and is in Open, Working, or Pending Review status
- all tasks in depends_on are Completed

**Then:**
- **set_field** target: `task_status` value: `Completed`
- **set_field** target: `progress` value: `100`
- **emit_event** event: `task.completed`

**Result:** Task marked as Completed and project progress updated

### Complete_project (Priority: 16)

**Given:**
- project exists and is in Open status
- all tasks are Completed or Cancelled

**Then:**
- **transition_state** field: `project_status` from: `open` to: `completed`
- **set_field** target: `percent_complete` value: `100`
- **emit_event** event: `project.completed`

**Result:** Project marked as Completed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TASK_DEPENDENCY_INCOMPLETE` | 400 | Cannot complete this task. One or more dependent tasks are not yet completed. | No |
| `TASK_CIRCULAR_DEPENDENCY` | 400 | Circular dependency detected. A task cannot depend on itself or create a dependency loop. | No |
| `TIMESHEET_OVERLAP` | 409 | Time log entries overlap with an existing timesheet for this employee. | No |
| `PROJECT_TEMPLATE_NOT_FOUND` | 404 | The specified project template does not exist. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `project.created` | Fired when a new project is created | `project_name`, `company`, `expected_start_date`, `expected_end_date` |
| `project.completed` | Fired when a project is marked as completed | `project_name`, `total_costing_amount`, `total_billing_amount` |
| `task.created` | Fired when a new task is created | `subject`, `project`, `assigned_to`, `priority` |
| `task.completed` | Fired when a task is completed | `subject`, `project` |
| `task.overdue` | Fired when a task becomes overdue | `subject`, `project`, `expected_end_date` |
| `timesheet.submitted` | Fired when a timesheet is submitted | `employee`, `total_hours`, `total_billable_hours`, `project` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-order-lifecycle | optional | Projects can be linked to sales orders for billing |
| sales-purchase-invoicing | optional | Timesheets can be billed via sales invoices |

## AGI Readiness

### Goals

#### Reliable Project Task Management

Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calculated from tasks.


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
| visibility | simplicity | project tracking must provide accurate status for stakeholders |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_project | `supervised` | - | - |
| create_from_template | `supervised` | - | - |
| create_task | `supervised` | - | - |
| assign_task | `autonomous` | - | - |
| log_time | `autonomous` | - | - |
| complete_task | `autonomous` | - | - |
| complete_project | `autonomous` | - | - |

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
  "name": "Project Task Management Blueprint",
  "description": "Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calcu",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "project, task, timesheet, milestone, dependency, billing, time-tracking"
}
</script>
