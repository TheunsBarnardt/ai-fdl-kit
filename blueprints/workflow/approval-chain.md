<!-- AUTO-GENERATED FROM approval-chain.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Approval Chain

> Multi-level approval workflow with sequential/parallel approvers, delegation, auto-approve rules, timeout escalation, and audit history.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** approval · workflow · multi-level · delegation · escalation · audit-trail

## What this does

Multi-level approval workflow with sequential/parallel approvers, delegation, auto-approve rules, timeout escalation, and audit history.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **request_id** *(text, required)* — Request ID
- **request_type** *(text, required)* — Request Type
- **requester_id** *(text, required)* — Requester
- **title** *(text, required)* — Request Title
- **description** *(rich_text, optional)* — Request Description
- **approval_levels** *(json, required)* — Approval Levels
- **status** *(select, required)* — Overall Status
- **current_level** *(number, optional)* — Current Approval Level
- **approval_history** *(json, optional)* — Approval History
- **delegations** *(json, optional)* — Active Delegations
- **auto_approve_rules** *(json, optional)* — Auto-Approve Rules

## What must be true

- **approval_strategy:** Each level defines a strategy: "all" requires every approver to approve, "any" requires at least one, "first" accepts the first response (approve or reject). The strategy is evaluated per level independently.
- **timeout_escalation:** If no approver at a level responds within timeout_hours, the request is escalated. Escalation routes to the configured escalation_target or the next level's approvers.
- **delegation:** An approver can delegate their approval authority to another user for a specified period. The delegate's decisions carry the same weight as the original approver's. Delegations expire automatically after valid_until.
- **immutable_history:** Once an approval action is recorded in approval_history, it cannot be modified or deleted. Each entry includes approver, action, comment, and timestamp for audit compliance.
- **auto_approve:** Configurable rules can automatically approve a level without human intervention (e.g., requests under a certain amount or from specific roles). Auto-approved entries are logged in history with actor "system".
- **withdrawal_rules:** A requester can withdraw their request at any point before the final approval. Withdrawal is recorded in history and notifies all involved approvers.
- **no_self_approval:** A requester cannot approve their own request. If the requester appears in an approval level's approver list, they are skipped for that level.

## Success & failure scenarios

**✅ Success paths**

- **Request Submitted** — when requester is authenticated; At least one approval level is configured; Request title is provided, then Request submitted and routed to first approval level.
- **Level Approved All Strategy** — when current level strategy is 'all'; all approvers at the current level have approved, then Current level approved; request advances to next level or completes.
- **Level Approved Any Strategy** — when current level strategy is 'any'; at least one approver at the current level has approved, then Current level approved by any single approver; advances.
- **Level Approved First Strategy** — when current level strategy is 'first'; first approver at the current level has responded with approve, then First response accepted; level complete.
- **Request Fully Approved** — when all approval levels have been approved; current_level equals total number of levels, then Request fully approved across all levels.
- **Request Rejected** — when an approver at any level rejects the request, then Request rejected and requester informed.
- **Approval Escalated** — when timeout_hours exceeded for current level; no sufficient approvals received, then Approval escalated to designated authority.
- **Approval Delegated** — when approver has configured a valid delegation; delegation is within its valid_until period, then Approval authority delegated; delegate can act on behalf of approver.
- **Auto Approved** — when request matches configured auto-approve rules for current level, then Level auto-approved by system based on configured rules.

**❌ Failure paths**

- **Self Approval Blocked** — when approver_id equals requester_id, then Self-approval rejected. *(error: `APPROVAL_SELF_APPROVAL`)*

## Errors it can return

- `APPROVAL_NOT_FOUND` — The approval request does not exist.
- `APPROVAL_ALREADY_DECIDED` — This approval level has already been decided.
- `APPROVAL_NOT_AUTHORIZED` — You are not an authorized approver for this level.
- `APPROVAL_SELF_APPROVAL` — You cannot approve your own request.
- `APPROVAL_ALREADY_WITHDRAWN` — This request has already been withdrawn.
- `APPROVAL_INVALID_LEVEL` — The specified approval level configuration is invalid.

## Events

**`approval.requested`** — A new approval request was submitted
  Payload: `request_id`, `request_type`, `requester_id`, `approval_levels`

**`approval.approved`** — An approval level or the full request was approved
  Payload: `request_id`, `level`, `approver_id`, `timestamp`

**`approval.rejected`** — An approval request was rejected
  Payload: `request_id`, `level`, `approver_id`, `reason`, `timestamp`

**`approval.escalated`** — An approval timed out and was escalated
  Payload: `request_id`, `level`, `timeout_hours`, `escalation_target_id`

**`approval.delegated`** — Approval authority was delegated to another user
  Payload: `request_id`, `from_approver_id`, `to_delegate_id`

## Connects to

- **task-management** *(optional)* — Tasks requiring sign-off can trigger an approval chain
- **expense-approval** *(extends)* — Expense approval is a specific instance of a generic approval chain
- **email-notifications** *(recommended)* — Notify approvers and requesters of status changes
- **role-based-access** *(recommended)* — Approver roles and delegation permissions require access control

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/approval-chain/) · **Spec source:** [`approval-chain.blueprint.yaml`](./approval-chain.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
