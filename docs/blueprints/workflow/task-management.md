---
title: "Task Management Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees. . 13 "
---

# Task Management Blueprint

> Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees.


| | |
|---|---|
| **Feature** | `task-management` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | tasks, kanban, project-management, subtasks, dependencies, workload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/task-management.blueprint.yaml) |
| **JSON API** | [task-management.json]({{ site.baseurl }}/api/blueprints/workflow/task-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `reporter` | Reporter | human | Creates tasks and tracks their progress |
| `assignee` | Assignee | human | Works on assigned tasks and updates status |
| `reviewer` | Reviewer | human | Reviews completed work before marking tasks done |
| `system` | Task Engine | system | Handles overdue detection, auto-assignment, and dependency resolution |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `title` | text | Yes | Task Title | Validations: required, maxLength |
| `description` | rich_text | No | Description |  |
| `assignee_id` | text | No | Assignee |  |
| `reporter_id` | text | Yes | Reporter |  |
| `status` | select | Yes | Status |  |
| `priority` | select | Yes | Priority |  |
| `due_date` | date | No | Due Date |  |
| `tags` | json | No | Tags |  |
| `project_id` | text | No | Project |  |
| `estimated_hours` | number | No | Estimated Hours | Validations: min |
| `actual_hours` | number | No | Actual Hours | Validations: min |
| `parent_task_id` | text | No | Parent Task |  |
| `blocked_by` | json | No | Blocked By |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `todo` | Yes |  |
| `in_progress` |  |  |
| `in_review` |  |  |
| `done` |  | Yes |
| `blocked` |  |  |
| `canceled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `todo` | `in_progress` | assignee |  |
|  | `in_progress` | `in_review` | assignee |  |
|  | `in_review` | `done` | reviewer |  |
|  | `in_review` | `in_progress` | reviewer | reviewer requests changes |
|  | `todo` | `blocked` | system | blocked_by tasks are not all done |
|  | `blocked` | `todo` | system | all blocked_by tasks are done |
|  | `in_progress` | `blocked` | assignee |  |
|  | `blocked` | `in_progress` | assignee | blocker resolved |
|  | `todo` | `canceled` | reporter |  |
|  | `in_progress` | `canceled` | reporter |  |

## Rules

- **overdue_detection:**
  - **description:** System checks tasks with a due_date against the current date. Tasks past their due date with status not in (done, canceled) are flagged as overdue and trigger a notification.

- **auto_assign:**
  - **description:** When a task is created without an assignee and project-level auto-assign rules exist, the system assigns based on role matching, current workload, and round-robin rotation.

- **workload_balancing:**
  - **description:** The system tracks each assignee's total estimated_hours for non-terminal tasks. Auto-assignment prefers the assignee with the lowest active workload.

- **dependency_tracking:**
  - **description:** A task with blocked_by references cannot transition to in_progress until all referenced tasks reach done status. Circular dependencies are rejected at creation time.

- **subtask_rollup:**
  - **description:** A parent task cannot be marked done until all its subtasks are in a terminal state (done or canceled). Progress percentage is computed from subtask completion ratio.

- **priority_escalation:**
  - **description:** Urgent-priority tasks that remain in todo for more than 24 hours are escalated by notifying the project lead.


## Outcomes

### Task_created (Priority: 1)

**Given:**
- reporter is authenticated
- `title` (input) exists

**Then:**
- **create_record** target: `tasks` — New task record created with default status todo
- **emit_event** event: `task.created`

**Result:** Task created and visible on the kanban board

### Task_assigned (Priority: 2)

**Given:**
- task exists and is not in a terminal state
- `assignee_id` (input) exists

**Then:**
- **set_field** target: `assignee_id` value: `provided assignee_id`
- **emit_event** event: `task.assigned`
- **notify** — Assignee notified of new task assignment

**Result:** Task assigned to the specified user

### Task_status_changed (Priority: 3)

**Given:**
- task exists
- requested status transition is valid per state machine
- actor has permission for this transition

**Then:**
- **transition_state** field: `status` from: `current_status` to: `new_status`
- **emit_event** event: `task.status_changed`

**Result:** Task status updated and kanban board reflects the change

### Task_completed (Priority: 4)

**Given:**
- task is in in_review status
- reviewer approves the work
- all subtasks are in a terminal state

**Then:**
- **transition_state** field: `status` from: `in_review` to: `done`
- **emit_event** event: `task.completed`
- **notify** — Reporter and assignee notified of task completion

**Result:** Task marked as done and removed from active board

### Task_overdue_detected (Priority: 5)

**Given:**
- `due_date` (db) lt `now`
- `status` (db) not_in `done,canceled`

**Then:**
- **emit_event** event: `task.overdue`
- **notify** — Assignee and reporter notified of overdue task

**Result:** Overdue task flagged and stakeholders notified

### Task_blocked_by_dependency (Priority: 6)

**Given:**
- `blocked_by` (db) exists
- at least one blocked_by task is not in done status

**Then:**
- **transition_state** field: `status` from: `todo` to: `blocked`
- **emit_event** event: `task.status_changed`

**Result:** Task automatically blocked until dependencies resolve

### Invalid_transition (Priority: 10) — Error: `TASK_INVALID_TRANSITION`

**Given:**
- requested status transition is not allowed by state machine

**Result:** Transition rejected with error message

### Circular_dependency_rejected (Priority: 11) — Error: `TASK_CIRCULAR_DEPENDENCY`

**Given:**
- adding blocked_by reference would create a circular dependency

**Result:** Dependency rejected to prevent deadlock

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TASK_NOT_FOUND` | 404 | The requested task does not exist. | No |
| `TASK_INVALID_TRANSITION` | 400 | The requested status transition is not allowed. | No |
| `TASK_CIRCULAR_DEPENDENCY` | 400 | This dependency would create a circular reference. | No |
| `TASK_SUBTASKS_INCOMPLETE` | 409 | Cannot complete task while subtasks are still active. | No |
| `TASK_ALREADY_ASSIGNED` | 409 | This task is already assigned to another user. | No |
| `TASK_ACCESS_DENIED` | 403 | You do not have permission to modify this task. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `task.created` | A new task was created | `task_id`, `title`, `reporter_id`, `project_id` |
| `task.assigned` | A task was assigned to a user | `task_id`, `assignee_id`, `reporter_id` |
| `task.status_changed` | A task transitioned to a new status | `task_id`, `old_status`, `new_status`, `actor_id` |
| `task.completed` | A task was marked as done | `task_id`, `assignee_id`, `actual_hours`, `completed_at` |
| `task.overdue` | A task passed its due date without completion | `task_id`, `assignee_id`, `due_date`, `days_overdue` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| approval-chain | optional | Tasks requiring sign-off can use the approval chain workflow |
| scheduling-calendar | optional | Task due dates and milestones can sync to calendar events |
| bulk-operations | optional | Bulk status updates or reassignment across multiple tasks |
| state-machine | optional | Task status transitions can be modeled as a configurable state machine |
| email-notifications | recommended | Notify assignees and reporters of task changes via email |
| role-based-access | recommended | Control who can create, assign, and transition tasks |

## AGI Readiness

### Goals

#### Reliable Task Management

Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees.


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
| task_created | `supervised` | - | - |
| task_assigned | `autonomous` | - | - |
| task_status_changed | `supervised` | - | - |
| task_completed | `autonomous` | - | - |
| task_overdue_detected | `autonomous` | - | - |
| task_blocked_by_dependency | `human_required` | - | - |
| invalid_transition | `autonomous` | - | - |
| circular_dependency_rejected | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Task Management Blueprint",
  "description": "Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees.\n. 13 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "tasks, kanban, project-management, subtasks, dependencies, workload"
}
</script>
