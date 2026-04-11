<!-- AUTO-GENERATED FROM expense-approval.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Expense Approval

> Submit and approve employee expense reports with receipt validation

**Category:** Data · **Version:** 1.0.0 · **Tags:** expense · approval · workflow · finance · reimbursement

## What this does

Submit and approve employee expense reports with receipt validation

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **title** *(text, required)* — Expense Title
- **amount** *(number, required)* — Amount
- **currency** *(select, required)* — Currency
- **category** *(select, required)* — Expense Category
- **date_incurred** *(date, required)* — Date of Expense
- **description** *(rich_text, required)* — Description & Business Justification
- **receipt** *(file, optional)* — Receipt
- **status** *(select, required)* — Status
- **rejection_reason** *(text, optional)* — Rejection Reason
- **submitted_by** *(hidden, required)* — Submitted By
- **approved_by** *(hidden, optional)* — Approved By

## What must be true

- **approval → finance_threshold:** 1000
- **approval → max_single_expense:** 50000
- **receipt → required_above:** 25
- **receipt → accepted_formats:** pdf, png, jpg, jpeg
- **receipt → max_size_mb:** 10
- **submission → max_age_days:** 90
- **submission → duplicate_detection:** true
- **security → rate_limit → window_seconds:** 3600
- **security → rate_limit → max_requests:** 20
- **security → rate_limit → scope:** per_user
- **audit → log_all_transitions:** true
- **audit → retention_days:** 2555

## Success & failure scenarios

**✅ Success paths**

- **Expense Submitted** — when user is authenticated; Title is provided; Amount is at least $0.01; Amount does not exceed $50,000; Category is a valid option; Expense is within the last 90 days; Description has at least 10 characters (minLength); Receipt is attached when amount > $25; Not rate limited (max 20 per hour per user), then expense appears in manager's review queue.
- **Manager Approves Under Threshold** — when Reviewer has manager role for the submitting employee; Expense is in submitted status; Amount is at or below finance threshold, then expense is queued for payment.
- **Manager Approves Over Threshold** — when Reviewer has manager role; status eq "submitted"; Amount exceeds finance threshold, then expense is escalated to finance for review.
- **Finance Approves** — when reviewer_role eq "finance_manager"; status eq "pending_finance"; department has remaining budget for this expense, then expense is queued for payment processing.
- **Payment Processed** — when status eq "approved"; payment system is available, then employee receives reimbursement via direct deposit or payroll.
- **Sla Breached** — when Manager review exceeds 48 hours; Finance review exceeds 72 hours; End-to-end exceeds 30 days, then escalation path activated per SLA rules.

**❌ Failure paths**

- **Expense Rejected** — when reviewer_role in ["manager","finance_manager"]; status in ["submitted","pending_finance"]; Rejection reason is mandatory, then employee can revise (status back to draft) and resubmit. *(error: `EXPENSE_INVALID_TRANSITION`)*
- **Payment Failed** — when payment system returns error, then expense stays in approved status, finance investigates. *(error: `EXPENSE_PAYMENT_FAILED`)*

## Business flows

**Submit Expense** — Employee submits a new expense report

1. **validate_fields** *(employee)* — Validate all required fields and formats
1. **check_receipt_required** *(system)* — Require receipt upload if amount exceeds $25
1. **detect_duplicate_expense** *(system)* — Warn if a similar expense already exists
1. **transition_state** *(employee)* — Move status from draft → submitted
1. **send_notification** *(system)* — Email the direct manager that a new expense needs review
1. **emit**

**Manager Review** — Manager reviews and approves or rejects the expense

1. **load_expense_with_receipt** *(manager)* — Manager opens the expense report with all attachments
1. **review_justification** *(manager)* — Verify the expense has a legitimate business purpose
1. **approve_or_reject** *(manager)* — Manager approves or rejects (rejection requires reason)
1. **check_finance_threshold** *(system)* — Route to finance if over $1,000, otherwise auto-approve
1. **emit**

**Finance Review** — Finance manager reviews high-value expenses

1. **load_expense_with_history** *(finance_manager)* — Review expense with audit trail and manager approval
1. **check_department_budget** *(finance_manager)* — Verify department has remaining budget for this expense
1. **approve_or_reject** *(finance_manager)* — Finance approves or rejects
1. **emit**

**Rejection Flow** — Expense rejected by a reviewer

1. **validate_rejection_reason** — Rejection reason is mandatory
1. **transition_state** — Move status to rejected
1. **send_notification** *(system)* — Email the employee with rejection reason
1. **emit**

**Payment Flow** — System processes approved expense for reimbursement

1. **create_payment_record** *(payment_system)* — Create reimbursement entry in payroll system
1. **execute_payment** *(payment_system)* — Process via direct deposit or payroll
1. **transition_state** — Move status to paid
1. **send_notification** *(system)* — Confirm reimbursement to the employee
1. **emit**

**Receipt Missing** — Receipt required but not attached

1. **show_error**

**Payment Failed** — Payment processing failed

1. **emit**
1. **send_notification** *(system)* — Alert finance team of payment failure
1. **show_error**

## Errors it can return

- `EXPENSE_VALIDATION_ERROR` — Please check your input and try again
- `EXPENSE_RECEIPT_REQUIRED` — A receipt is required for expenses over $25
- `EXPENSE_DUPLICATE_DETECTED` — A similar expense already exists. Please review before submitting.
- `EXPENSE_NOT_FOUND` — Expense report not found
- `EXPENSE_INVALID_TRANSITION` — This action is not allowed in the current status
- `EXPENSE_UNAUTHORIZED` — You do not have permission to perform this action
- `EXPENSE_BUDGET_EXCEEDED` — This expense would exceed the department budget. Please contact finance.
- `EXPENSE_PAYMENT_FAILED` — Payment processing failed. Finance has been notified.
- `EXPENSE_RATE_LIMITED` — Too many submissions. Please try again later.

## Connects to

- **login** *(required)* — Users must be authenticated to submit expenses
- **roles-permissions** *(recommended)* — Manager and finance roles determine who can approve
- **notifications** *(recommended)* — Email and in-app notifications at each step
- **file-upload** *(required)* — Receipt upload functionality
- **audit-log** *(recommended)* — All transitions logged for compliance

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `███████░░░` | 7/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 2 fields
- `T4` **sequential-priority** — added priority to 2 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/expense-approval/) · **Spec source:** [`expense-approval.blueprint.yaml`](./expense-approval.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
