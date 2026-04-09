---
title: "Quality Management System Blueprint"
layout: default
parent: "Quality"
grand_parent: Blueprint Catalog
description: "Quality management with goals, periodic reviews, hierarchical procedures, feedback collection, and corrective/preventive action tracking for continuous improvem"
---

# Quality Management System Blueprint

> Quality management with goals, periodic reviews, hierarchical procedures, feedback collection, and corrective/preventive action tracking for continuous improvement.


| | |
|---|---|
| **Feature** | `quality-management-system` |
| **Category** | Quality |
| **Version** | 1.0.0 |
| **Tags** | quality-management, quality-goals, quality-review, quality-procedures, corrective-action, preventive-action, feedback, continuous-improvement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/quality/quality-management-system.blueprint.yaml) |
| **JSON API** | [quality-management-system.json]({{ site.baseurl }}/api/blueprints/quality/quality-management-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `goal` | text | Yes | Quality Goal |  |
| `frequency` | select | No | Review Frequency |  |
| `objectives` | json | Yes | Quality Objectives |  |
| `review_goal` | text | No | Review Goal |  |
| `review_date` | date | No | Review Date |  |
| `review_status` | select | No | Review Status |  |
| `reviews` | json | No | Review Results |  |
| `procedure_name` | text | No | Procedure Name |  |
| `is_group` | boolean | No | Is Group |  |
| `parent_procedure` | text | No | Parent Procedure |  |
| `process_owner` | text | No | Process Owner |  |
| `processes` | json | No | Child Processes |  |
| `document_type` | select | No | Feedback Document Type |  |
| `feedback_template` | text | No | Feedback Template |  |
| `parameters` | json | No | Feedback Parameters |  |
| `corrective_preventive` | select | No | Action Type |  |
| `action_status` | select | No | Action Status |  |
| `resolutions` | json | No | Resolutions |  |

## Rules

- **reviews_auto_created:**
  - **description:** Quality reviews are auto-created by a scheduled job based on the goal frequency setting (Daily, Weekly, Monthly, Quarterly).

- **review_status_aggregated:**
  - **description:** Review status is aggregated from child objective statuses. All objectives must pass for the review to pass.

- **procedure_tree_structure:**
  - **description:** Quality procedures form a nested hierarchy (tree structure) via parent_procedure references. Group procedures contain children.

- **feedback_from_template:**
  - **description:** Feedback parameters are populated from the selected feedback template, defining which aspects to rate.

- **action_status_aggregated:**
  - **description:** Quality action status is aggregated from its resolution statuses. The action is Completed only when all resolutions are Completed.

- **quarterly_review_schedule:**
  - **description:** Quarterly reviews are triggered in January, April, July, and October when frequency is set to Quarterly.


## Outcomes

### Create_quality_goal

**Given:**
- goal description and objectives with targets are provided

**Then:**
- **create_record** target: `quality_goal` — Quality goal created with objectives
- **emit_event** event: `goal.created`

**Result:** Quality goal created with measurable objectives and review schedule

### Auto_create_review

**Given:**
- quality goal exists with frequency other than None
- scheduled review date has arrived

**Then:**
- **create_record** target: `quality_review` — Review auto-created with objectives from goal
- **emit_event** event: `review.auto_created`

**Result:** Quality review auto-created with target values from goal

### Evaluate_review — Error: `QMS_REVIEW_GOAL_NOT_FOUND`

**Given:**
- quality review exists with actual values entered for all objectives

**Then:**
- **set_field** target: `review_status` — Status set based on objective pass/fail evaluation
- **emit_event** event: `review.passed` when: `review_status == "Passed"`
- **emit_event** event: `review.failed` when: `review_status == "Failed"`

**Result:** Review evaluated and status determined from objective results

### Create_procedure_hierarchy — Error: `QMS_PROCEDURE_PARENT_CONFLICT`

**Given:**
- procedure_name and process_owner are provided

**Then:**
- **create_record** target: `quality_procedure` — Quality procedure created in hierarchy

**Result:** Quality procedure created, nested under parent if specified

### Collect_feedback

**Given:**
- document_type is specified
- feedback_template exists if provided

**Then:**
- **create_record** target: `quality_feedback` — Feedback record created with parameters from template
- **emit_event** event: `feedback.submitted`

**Result:** Feedback collected with ratings per parameter

### Create_corrective_action

**Given:**
- corrective_preventive is set to Corrective
- at least one resolution is defined

**Then:**
- **create_record** target: `quality_action` — Corrective action created with Open status
- **emit_event** event: `action.completed` when: `action_status == "Completed"`

**Result:** Corrective action created to address identified quality issue

### Create_preventive_action

**Given:**
- corrective_preventive is set to Preventive
- at least one resolution is defined

**Then:**
- **create_record** target: `quality_action` — Preventive action created with Open status
- **emit_event** event: `action.completed` when: `action_status == "Completed"`

**Result:** Preventive action created to prevent potential quality issues

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QMS_PROCEDURE_PARENT_CONFLICT` | 400 | A procedure cannot be its own parent or create a circular hierarchy. | No |
| `QMS_REVIEW_GOAL_NOT_FOUND` | 404 | The referenced quality goal for this review does not exist. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `goal.created` | Fired when a quality goal is created | `goal`, `frequency`, `objectives` |
| `review.auto_created` | Fired when a review is auto-created by schedule | `review_goal`, `review_date`, `objectives` |
| `review.passed` | Fired when a quality review passes | `review_goal`, `review_date` |
| `review.failed` | Fired when a quality review fails | `review_goal`, `review_date` |
| `action.completed` | Fired when a corrective or preventive action is completed | `corrective_preventive`, `resolutions` |
| `feedback.submitted` | Fired when quality feedback is submitted | `document_type`, `parameters` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| quality-inspection | recommended | Inspections feed into quality goals and trigger corrective actions |

## AGI Readiness

### Goals

#### Reliable Quality Management System

Quality management with goals, periodic reviews, hierarchical procedures, feedback collection, and corrective/preventive action tracking for continuous improvement.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| thoroughness | speed | quality checks must be comprehensive to catch defects early |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_quality_goal | `supervised` | - | - |
| auto_create_review | `supervised` | - | - |
| evaluate_review | `autonomous` | - | - |
| create_procedure_hierarchy | `supervised` | - | - |
| collect_feedback | `autonomous` | - | - |
| create_corrective_action | `supervised` | - | - |
| create_preventive_action | `supervised` | - | - |

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
  "name": "Quality Management System Blueprint",
  "description": "Quality management with goals, periodic reviews, hierarchical procedures, feedback collection, and corrective/preventive action tracking for continuous improvem",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quality-management, quality-goals, quality-review, quality-procedures, corrective-action, preventive-action, feedback, continuous-improvement"
}
</script>
