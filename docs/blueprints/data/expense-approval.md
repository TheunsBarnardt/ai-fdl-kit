---
title: "Expense Approval Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Submit and approve employee expense reports with receipt validation. 11 fields. 8 outcomes. 9 error codes. rules: approval, receipt, submission"
---

# Expense Approval Blueprint

> Submit and approve employee expense reports with receipt validation

| | |
|---|---|
| **Feature** | `expense-approval` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | expense, approval, workflow, finance, reimbursement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/expense-approval.blueprint.yaml) |
| **JSON API** | [expense-approval.json]({{ site.baseurl }}/api/blueprints/data/expense-approval.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `employee` | Employee | human | Submits expense reports for reimbursement |
| `manager` | Direct Manager | human | First-level approval for all expenses |
| `finance_manager` | Finance Manager | human | Second-level approval required for expenses over threshold |
| `payment_system` | Payment System | system | Processes approved reimbursements via payroll or direct deposit |
| `audit_system` | Audit Logger | system | Records all state transitions for compliance |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `title` | text | Yes | Expense Title | Validations: required, maxLength |
| `amount` | number | Yes | Amount | Validations: required, min, max |
| `currency` | select | Yes | Currency |  |
| `category` | select | Yes | Expense Category |  |
| `date_incurred` | date | Yes | Date of Expense | Validations: required, custom |
| `description` | rich_text | Yes | Description & Business Justification | Validations: required, minLength |
| `receipt` | file | No | Receipt | Validations: custom |
| `status` | select | Yes | Status |  |
| `rejection_reason` | text | No | Rejection Reason |  |
| `submitted_by` | hidden | Yes |  |  |
| `approved_by` | hidden | No |  |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `manager_approved` |  |  |
| `pending_finance` |  |  |
| `approved` |  |  |
| `rejected` |  | Yes |
| `paid` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
| submit | `draft` | `submitted` | employee |  |
| manager_approve | `submitted` | `manager_approved` | manager |  |
| escalate_to_finance | `manager_approved` | `pending_finance` | system | amount > rules.approval.finance_threshold |
| finance_approve | `pending_finance` | `approved` | finance_manager |  |
| auto_approve | `manager_approved` | `approved` | system | amount <= rules.approval.finance_threshold |
| reject | `submitted,pending_finance` | `rejected` | manager,finance_manager |  |
| revise | `rejected` | `draft` | employee |  |
| process_payment | `approved` | `paid` | payment_system |  |

## Rules

- **approval:**
  - **finance_threshold:** 1000
  - **max_single_expense:** 50000
- **receipt:**
  - **required_above:** 25
  - **accepted_formats:** pdf, png, jpg, jpeg
  - **max_size_mb:** 10
- **submission:**
  - **max_age_days:** 90
  - **duplicate_detection:** true
- **security:**
  - **rate_limit:**
    - **window_seconds:** 3600
    - **max_requests:** 20
    - **scope:** per_user
- **audit:**
  - **log_all_transitions:** true
  - **retention_days:** 2555

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| manager_review | 48h | notify_department_head |
| finance_review | 72h | notify_cfo |
| payment_processing | 5d |  |
| overall_completion | 30d |  |

## Flows

### Submit_expense

Employee submits a new expense report

1. **validate_fields** (employee) — Validate all required fields and formats
1. **check_receipt_required** (system) — Require receipt upload if amount exceeds $25
1. **detect_duplicate_expense** (system) — Warn if a similar expense already exists
1. **transition_state** (employee) — Move status from draft → submitted
1. **send_notification** (system) — Email the direct manager that a new expense needs review
1. **emit**

### Manager_review

Manager reviews and approves or rejects the expense

1. **load_expense_with_receipt** (manager) — Manager opens the expense report with all attachments
1. **review_justification** (manager) — Verify the expense has a legitimate business purpose
1. **approve_or_reject** (manager) — Manager approves or rejects (rejection requires reason)
1. **check_finance_threshold** (system) — Route to finance if over $1,000, otherwise auto-approve
1. **emit**

### Finance_review

Finance manager reviews high-value expenses

1. **load_expense_with_history** (finance_manager) — Review expense with audit trail and manager approval
1. **check_department_budget** (finance_manager) — Verify department has remaining budget for this expense
1. **approve_or_reject** (finance_manager) — Finance approves or rejects
1. **emit**

### Rejection_flow

Expense rejected by a reviewer

1. **validate_rejection_reason** — Rejection reason is mandatory
1. **transition_state** — Move status to rejected
1. **send_notification** (system) — Email the employee with rejection reason
1. **emit**

### Payment_flow

System processes approved expense for reimbursement

1. **create_payment_record** (payment_system) — Create reimbursement entry in payroll system
1. **execute_payment** (payment_system) — Process via direct deposit or payroll
1. **transition_state** — Move status to paid
1. **send_notification** (system) — Confirm reimbursement to the employee
1. **emit**

### Receipt_missing

Receipt required but not attached

1. **show_error**

### Payment_failed

Payment processing failed

1. **emit**
1. **send_notification** (system) — Alert finance team of payment failure
1. **show_error**

## Outcomes

### Expense_rejected (Priority: 5) — Error: `EXPENSE_INVALID_TRANSITION` | Transaction: atomic

**Given:**
- `reviewer_role` in `manager,finance_manager`
- `status` in `submitted,pending_finance`
- `rejection_reason` exists

**Then:**
- status transitions to rejected
- employee is notified with rejection reason
- expense.rejected event is emitted

**Result:** employee can revise (status back to draft) and resubmit

### Expense_submitted (Priority: 10) | Transaction: atomic

**Given:**
- user is authenticated
- `title` exists
- `amount` gte `0.01`
- `amount` lte `50000`
- `category` in `travel,meals,supplies,software,equipment,other`
- `date_incurred` gte `today - 90 days`
- `description` gte `10`
- `receipt` exists
- `request_count` lte `20`

**Then:**
- status transitions from draft to submitted
- direct manager is notified via email
- expense.submitted event is emitted
- all state transitions are logged for audit (actor, timestamp, IP)

**Result:** expense appears in manager's review queue

### Manager_approves_under_threshold (Priority: 10) | Transaction: atomic

**Given:**
- `reviewer_role` eq `manager`
- `status` eq `submitted`
- `amount` lte `1000`

**Then:**
- status transitions to approved (auto-skip finance)
- expense.manager_reviewed event is emitted

**Result:** expense is queued for payment

### Manager_approves_over_threshold (Priority: 10) | Transaction: atomic

**Given:**
- `reviewer_role` eq `manager`
- `status` eq `submitted`
- `amount` gt `1000`

**Then:**
- status transitions to pending_finance
- expense.manager_reviewed event is emitted

**Result:** expense is escalated to finance for review

### Finance_approves (Priority: 10) | Transaction: atomic

**Given:**
- `reviewer_role` eq `finance_manager`
- `status` eq `pending_finance`
- department has remaining budget for this expense

**Then:**
- status transitions to approved
- expense.approved event is emitted

**Result:** expense is queued for payment processing

### Payment_processed (Priority: 10) | Transaction: atomic

**Given:**
- `status` eq `approved`
- payment system is available

**Then:**
- reimbursement is created in payroll system
- status transitions to paid
- employee is notified of reimbursement
- expense.paid event is emitted

**Result:** employee receives reimbursement via direct deposit or payroll

### Payment_failed — Error: `EXPENSE_PAYMENT_FAILED`

**Given:**
- payment system returns error

**Then:**
- expense.payment_failed event is emitted
- finance team is alerted

**Result:** expense stays in approved status, finance investigates

### Sla_breached

**Given:**
- `time_in_submitted` gt `48h`
- `time_in_pending_finance` gt `72h`
- `time_since_submitted` gt `30d`

**Then:**
- expense.sla_breached event is emitted
- escalation notification sent (department head or CFO)

**Result:** escalation path activated per SLA rules

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EXPENSE_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |
| `EXPENSE_RECEIPT_REQUIRED` | 422 | A receipt is required for expenses over $25 | Yes |
| `EXPENSE_DUPLICATE_DETECTED` | 409 | A similar expense already exists. Please review before submitting. | Yes |
| `EXPENSE_NOT_FOUND` | 404 | Expense report not found | No |
| `EXPENSE_INVALID_TRANSITION` | 422 | This action is not allowed in the current status | No |
| `EXPENSE_UNAUTHORIZED` | 403 | You do not have permission to perform this action | No |
| `EXPENSE_BUDGET_EXCEEDED` | 422 | This expense would exceed the department budget. Please contact finance. | No |
| `EXPENSE_PAYMENT_FAILED` | 500 | Payment processing failed. Finance has been notified. | No |
| `EXPENSE_RATE_LIMITED` | 429 | Too many submissions. Please try again later. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `expense.submitted` | New expense submitted for approval | `expense_id`, `submitted_by`, `amount`, `category`, `timestamp` |
| `expense.manager_reviewed` | Manager completed review (approve or reject) | `expense_id`, `reviewer_id`, `decision`, `amount`, `timestamp` |
| `expense.approved` | Expense fully approved (all levels) | `expense_id`, `approved_by`, `amount`, `timestamp` |
| `expense.rejected` | Expense rejected at any level | `expense_id`, `rejected_by`, `reason`, `amount`, `timestamp` |
| `expense.paid` | Reimbursement processed successfully | `expense_id`, `user_id`, `amount`, `payment_method`, `timestamp` |
| `expense.payment_failed` | Reimbursement processing failed | `expense_id`, `user_id`, `amount`, `error_detail`, `timestamp` |
| `expense.sla_breached` | An SLA deadline was exceeded | `expense_id`, `sla_name`, `expected_duration`, `actual_duration`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | Users must be authenticated to submit expenses |
| roles-permissions | recommended | Manager and finance roles determine who can approve |
| notifications | recommended | Email and in-app notifications at each step |
| file-upload | required | Receipt upload functionality |
| audit-log | recommended | All transitions logged for compliance |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
screens:
  submit:
    layout: single_column
    max_width: 600px
    title: Submit Expense
    fields_order:
      - title
      - amount
      - currency
      - category
      - date_incurred
      - description
      - receipt
    actions:
      primary:
        label: Submit for Approval
        type: submit
      secondary:
        - label: Save Draft
          action: save_draft
  review:
    layout: two_column
    title: Review Expense
    left_column:
      - title
      - amount
      - currency
      - category
      - date_incurred
      - description
    right_column:
      - receipt
      - status
      - submitted_by
    actions:
      primary:
        label: Approve
        type: submit
        style: success
      secondary:
        - label: Reject
          action: reject
          style: danger
          requires_reason: true
  list:
    layout: table
    title: My Expenses
    columns:
      - title
      - amount
      - category
      - date_incurred
      - status
    filters:
      - status
      - category
      - date_range
    sort_default: date_incurred_desc
accessibility:
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  prevent_double_submit: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Expense Approval Blueprint",
  "description": "Submit and approve employee expense reports with receipt validation. 11 fields. 8 outcomes. 9 error codes. rules: approval, receipt, submission",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "expense, approval, workflow, finance, reimbursement"
}
</script>
