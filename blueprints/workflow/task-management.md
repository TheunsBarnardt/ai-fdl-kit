<!-- AUTO-GENERATED FROM task-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Task Management

> Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** tasks · kanban · project-management · subtasks · dependencies · workload

## What this does

Task lifecycle management with kanban board, subtask hierarchies, dependency tracking, priority-based scheduling, and workload balancing across assignees.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **title** *(text, required)* — Task Title
- **description** *(rich_text, optional)* — Description
- **assignee_id** *(text, optional)* — Assignee
- **reporter_id** *(text, required)* — Reporter
- **status** *(select, required)* — Status
- **priority** *(select, required)* — Priority
- **due_date** *(date, optional)* — Due Date
- **tags** *(json, optional)* — Tags
- **project_id** *(text, optional)* — Project
- **estimated_hours** *(number, optional)* — Estimated Hours
- **actual_hours** *(number, optional)* — Actual Hours
- **parent_task_id** *(text, optional)* — Parent Task
- **blocked_by** *(json, optional)* — Blocked By

## What must be true

- **overdue_detection:** System checks tasks with a due_date against the current date. Tasks past their due date with status not in (done, canceled) are flagged as overdue and trigger a notification.
- **auto_assign:** When a task is created without an assignee and project-level auto-assign rules exist, the system assigns based on role matching, current workload, and round-robin rotation.
- **workload_balancing:** The system tracks each assignee's total estimated_hours for non-terminal tasks. Auto-assignment prefers the assignee with the lowest active workload.
- **dependency_tracking:** A task with blocked_by references cannot transition to in_progress until all referenced tasks reach done status. Circular dependencies are rejected at creation time.
- **subtask_rollup:** A parent task cannot be marked done until all its subtasks are in a terminal state (done or canceled). Progress percentage is computed from subtask completion ratio.
- **priority_escalation:** Urgent-priority tasks that remain in todo for more than 24 hours are escalated by notifying the project lead.

## Success & failure scenarios

**✅ Success paths**

- **Task Status Changed** — when task exists; requested status transition is valid per state machine; actor has permission for this transition, then Task status updated and kanban board reflects the change.
- **Task Completed** — when task is in in_review status; reviewer approves the work; all subtasks are in a terminal state, then Task marked as done and removed from active board.
- **Task Overdue Detected** — when Due date is in the past; Task is still active, then Overdue task flagged and stakeholders notified.
- **Task Blocked By Dependency** — when Task has dependency references; at least one blocked_by task is not in done status, then Task automatically blocked until dependencies resolve.

**❌ Failure paths**

- **Task Created** — when reporter is authenticated; Task title is provided, then Task created and visible on the kanban board. *(error: `TASK_SUBTASKS_INCOMPLETE`)*
- **Task Assigned** — when task exists and is not in a terminal state; Assignee is specified, then Task assigned to the specified user. *(error: `TASK_ALREADY_ASSIGNED`)*
- **Invalid Transition** — when requested status transition is not allowed by state machine, then Transition rejected with error message. *(error: `TASK_INVALID_TRANSITION`)*
- **Circular Dependency Rejected** — when adding blocked_by reference would create a circular dependency, then Dependency rejected to prevent deadlock. *(error: `TASK_CIRCULAR_DEPENDENCY`)*

## Errors it can return

- `TASK_NOT_FOUND` — The requested task does not exist.
- `TASK_INVALID_TRANSITION` — The requested status transition is not allowed.
- `TASK_CIRCULAR_DEPENDENCY` — This dependency would create a circular reference.
- `TASK_SUBTASKS_INCOMPLETE` — Cannot complete task while subtasks are still active.
- `TASK_ALREADY_ASSIGNED` — This task is already assigned to another user.
- `TASK_ACCESS_DENIED` — You do not have permission to modify this task.

## Events

**`task.created`** — A new task was created
  Payload: `task_id`, `title`, `reporter_id`, `project_id`

**`task.assigned`** — A task was assigned to a user
  Payload: `task_id`, `assignee_id`, `reporter_id`

**`task.status_changed`** — A task transitioned to a new status
  Payload: `task_id`, `old_status`, `new_status`, `actor_id`

**`task.completed`** — A task was marked as done
  Payload: `task_id`, `assignee_id`, `actual_hours`, `completed_at`

**`task.overdue`** — A task passed its due date without completion
  Payload: `task_id`, `assignee_id`, `due_date`, `days_overdue`

## Connects to

- **approval-chain** *(optional)* — Tasks requiring sign-off can use the approval chain workflow
- **scheduling-calendar** *(optional)* — Task due dates and milestones can sync to calendar events
- **bulk-operations** *(optional)* — Bulk status updates or reassignment across multiple tasks
- **state-machine** *(optional)* — Task status transitions can be modeled as a configurable state machine
- **email-notifications** *(recommended)* — Notify assignees and reporters of task changes via email
- **role-based-access** *(recommended)* — Control who can create, assign, and transition tasks

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/task-management/) · **Spec source:** [`task-management.blueprint.yaml`](./task-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
