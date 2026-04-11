<!-- AUTO-GENERATED FROM project-task-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Project Task Management

> Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calculated from tasks.

**Category:** Project · **Version:** 1.0.0 · **Tags:** project · task · timesheet · milestone · dependency · billing · time-tracking

## What this does

Project and task management with hierarchical tasks, dependency tracking, milestones, templates, and timesheet-based billable time tracking. Progress auto-calculated from tasks.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **project_name** *(text, required)* — Project Name
- **company** *(text, required)* — Company
- **project_status** *(select, required)* — Project Status
- **is_active** *(select, required)* — Is Active
- **percent_complete** *(number, optional)* — Percent Complete
- **expected_start_date** *(date, optional)* — Expected Start Date
- **expected_end_date** *(date, optional)* — Expected End Date
- **actual_start_date** *(date, optional)* — Actual Start Date
- **actual_end_date** *(date, optional)* — Actual End Date
- **estimated_costing** *(number, optional)* — Estimated Costing
- **total_costing_amount** *(number, optional)* — Total Costing Amount
- **total_billing_amount** *(number, optional)* — Total Billing Amount
- **project_template** *(text, optional)* — Project Template
- **cost_center** *(text, optional)* — Cost Center
- **subject** *(text, required)* — Task Subject
- **project** *(text, optional)* — Project
- **task_status** *(select, required)* — Task Status
- **priority** *(select, optional)* — Priority
- **task_expected_start_date** *(date, optional)* — Task Expected Start Date
- **task_expected_end_date** *(date, optional)* — Task Expected End Date
- **progress** *(number, optional)* — Task Progress
- **depends_on** *(json, optional)* — Task Dependencies
- **is_milestone** *(boolean, optional)* — Is Milestone
- **is_group** *(boolean, optional)* — Is Group
- **parent_task** *(text, optional)* — Parent Task
- **assigned_to** *(text, optional)* — Assigned To
- **task_description** *(rich_text, optional)* — Task Description
- **employee** *(text, required)* — Employee
- **total_hours** *(number, optional)* — Total Hours
- **total_billable_hours** *(number, optional)* — Total Billable Hours
- **total_billed_hours** *(number, optional)* — Total Billed Hours
- **total_costing_amount_timesheet** *(number, optional)* — Timesheet Costing Amount
- **total_billable_amount** *(number, optional)* — Total Billable Amount
- **time_logs** *(json, optional)* — Time Logs

## What must be true

- **task_dependency_enforcement:** Task dependencies enforce sequential completion. A task cannot be marked Completed until all tasks in its depends_on list are Completed.
- **overdue_auto_set:** Task status is automatically set to Overdue when the task_expected_end_date is earlier than today and the task is not yet Completed or Cancelled.
- **project_percent_from_tasks:** Project percent_complete is auto-calculated as the weighted average of progress across all child tasks.
- **template_creates_tasks:** Selecting a project template auto-creates tasks from the predefined template structure with relative dates.
- **timesheet_billable_tracking:** Timesheets track billable vs non-billable hours separately. Billing and costing rates are applied per activity type.
- **activity_costing_rates:** Activity costing assigns rates per activity type, allowing different billing and costing rates for different work types.
- **task_hierarchy:** Tasks form a hierarchy via parent_task. Group tasks aggregate progress from their children.
- **milestone_deliverables:** Milestone tasks mark key deliverables in the project timeline and are highlighted in project views.

## Success & failure scenarios

**✅ Success paths**

- **Create Project** — when project_name and company are provided, then New project created and ready for task assignment.
- **Create Task** — when subject is provided; project exists if specified, then Task created and linked to project.
- **Assign Task** — when task exists and is not Completed or Cancelled; assigned_to is provided, then Task assigned to team member.
- **Complete Project** — when project exists and is in Open status; all tasks are Completed or Cancelled, then Project marked as Completed.

**❌ Failure paths**

- **Create From Template** — when project_name and company are provided; project_template exists and is valid, then Project created with pre-defined tasks from template. *(error: `PROJECT_TEMPLATE_NOT_FOUND`)*
- **Log Time** — when employee and time_logs with from_time and to_time are provided; time log entries do not overlap with existing timesheets, then Time logged against project and task. *(error: `TIMESHEET_OVERLAP`)*
- **Complete Task** — when task exists and is in Open, Working, or Pending Review status; all tasks in depends_on are Completed, then Task marked as Completed and project progress updated. *(error: `TASK_DEPENDENCY_INCOMPLETE`)*

## Errors it can return

- `TASK_DEPENDENCY_INCOMPLETE` — Cannot complete this task. One or more dependent tasks are not yet completed.
- `TASK_CIRCULAR_DEPENDENCY` — Circular dependency detected. A task cannot depend on itself or create a dependency loop.
- `TIMESHEET_OVERLAP` — Time log entries overlap with an existing timesheet for this employee.
- `PROJECT_TEMPLATE_NOT_FOUND` — The specified project template does not exist.

## Connects to

- **sales-order-lifecycle** *(optional)* — Projects can be linked to sales orders for billing
- **sales-purchase-invoicing** *(optional)* — Timesheets can be billed via sales invoices

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/project/project-task-management/) · **Spec source:** [`project-task-management.blueprint.yaml`](./project-task-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
