---
title: "Approval Chain Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Multi-level approval workflow with sequential/parallel approvers, delegation, auto-approve rules, timeout escalation, and audit history. . 11 fields. 10 outcome"
---

# Approval Chain Blueprint

> Multi-level approval workflow with sequential/parallel approvers, delegation, auto-approve rules, timeout escalation, and audit history.


| | |
|---|---|
| **Feature** | `approval-chain` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | approval, workflow, multi-level, delegation, escalation, audit-trail |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/approval-chain.blueprint.yaml) |
| **JSON API** | [approval-chain.json]({{ site.baseurl }}/api/blueprints/workflow/approval-chain.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `requester` | Requester | human | Submits a request that requires one or more levels of approval |
| `approver` | Approver | human | Reviews and approves or rejects requests at their assigned level |
| `delegate` | Delegate | human | Acts on behalf of an approver who has delegated authority |
| `escalation_target` | Escalation Target | human | Receives escalated requests when approval times out |
| `system` | Approval Engine | system | Manages approval flow, timeout detection, escalation, and auto-approve logic |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `request_id` | text | Yes | Request ID |  |
| `request_type` | text | Yes | Request Type | Validations: required |
| `requester_id` | text | Yes | Requester |  |
| `title` | text | Yes | Request Title | Validations: required, maxLength |
| `description` | rich_text | No | Request Description |  |
| `approval_levels` | json | Yes | Approval Levels | Validations: required |
| `status` | select | Yes | Overall Status |  |
| `current_level` | number | No | Current Approval Level |  |
| `approval_history` | json | No | Approval History |  |
| `delegations` | json | No | Active Delegations |  |
| `auto_approve_rules` | json | No | Auto-Approve Rules |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `pending` |  |  |
| `in_review` |  |  |
| `approved` |  | Yes |
| `rejected` |  | Yes |
| `escalated` |  |  |
| `withdrawn` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `pending` | requester |  |
|  | `pending` | `in_review` | system |  |
|  | `in_review` | `in_review` | system | current level approved but more levels remain |
|  | `in_review` | `approved` | approver | final level approved |
|  | `in_review` | `rejected` | approver |  |
|  | `in_review` | `escalated` | system | timeout_hours exceeded without response |
|  | `escalated` | `in_review` | escalation_target |  |
|  | `pending` | `withdrawn` | requester |  |
|  | `in_review` | `withdrawn` | requester |  |

## Rules

- **approval_strategy:**
  - **description:** Each level defines a strategy: "all" requires every approver to approve, "any" requires at least one, "first" accepts the first response (approve or reject). The strategy is evaluated per level independently.

- **timeout_escalation:**
  - **description:** If no approver at a level responds within timeout_hours, the request is escalated. Escalation routes to the configured escalation_target or the next level's approvers.

- **delegation:**
  - **description:** An approver can delegate their approval authority to another user for a specified period. The delegate's decisions carry the same weight as the original approver's. Delegations expire automatically after valid_until.

- **immutable_history:**
  - **description:** Once an approval action is recorded in approval_history, it cannot be modified or deleted. Each entry includes approver, action, comment, and timestamp for audit compliance.

- **auto_approve:**
  - **description:** Configurable rules can automatically approve a level without human intervention (e.g., requests under a certain amount or from specific roles). Auto-approved entries are logged in history with actor "system".

- **withdrawal_rules:**
  - **description:** A requester can withdraw their request at any point before the final approval. Withdrawal is recorded in history and notifies all involved approvers.

- **no_self_approval:**
  - **description:** A requester cannot approve their own request. If the requester appears in an approval level's approver list, they are skipped for that level.


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| level_response_time | 48h | escalate to next approver in hierarchy or designated escalation_target |
| total_approval_time | 168h | notify system administrator |

## Outcomes

### Request_submitted (Priority: 1)

**Given:**
- requester is authenticated
- `approval_levels` (input) exists
- `title` (input) exists

**Then:**
- **transition_state** field: `status` from: `draft` to: `pending`
- **emit_event** event: `approval.requested`
- **notify** — First-level approvers notified of pending request

**Result:** Request submitted and routed to first approval level

### Level_approved_all_strategy (Priority: 2)

**Given:**
- current level strategy is 'all'
- all approvers at the current level have approved

**Then:**
- **set_field** target: `current_level` value: `current_level + 1`
- **emit_event** event: `approval.approved`

**Result:** Current level approved; request advances to next level or completes

### Level_approved_any_strategy (Priority: 3)

**Given:**
- current level strategy is 'any'
- at least one approver at the current level has approved

**Then:**
- **set_field** target: `current_level` value: `current_level + 1`
- **emit_event** event: `approval.approved`

**Result:** Current level approved by any single approver; advances

### Level_approved_first_strategy (Priority: 4)

**Given:**
- current level strategy is 'first'
- first approver at the current level has responded with approve

**Then:**
- **set_field** target: `current_level` value: `current_level + 1`
- **emit_event** event: `approval.approved`

**Result:** First response accepted; level complete

### Request_fully_approved (Priority: 5)

**Given:**
- all approval levels have been approved
- current_level equals total number of levels

**Then:**
- **transition_state** field: `status` from: `in_review` to: `approved`
- **emit_event** event: `approval.approved`
- **notify** — Requester notified of full approval

**Result:** Request fully approved across all levels

### Request_rejected (Priority: 6)

**Given:**
- an approver at any level rejects the request

**Then:**
- **transition_state** field: `status` from: `in_review` to: `rejected`
- **emit_event** event: `approval.rejected`
- **notify** — Requester notified of rejection with reason

**Result:** Request rejected and requester informed

### Approval_escalated (Priority: 7)

**Given:**
- timeout_hours exceeded for current level
- no sufficient approvals received

**Then:**
- **transition_state** field: `status` from: `in_review` to: `escalated`
- **emit_event** event: `approval.escalated`
- **notify** — Escalation target and requester notified of timeout

**Result:** Approval escalated to designated authority

### Approval_delegated (Priority: 8)

**Given:**
- approver has configured a valid delegation
- delegation is within its valid_until period

**Then:**
- **emit_event** event: `approval.delegated`
- **notify** — Delegate notified of approval responsibility

**Result:** Approval authority delegated; delegate can act on behalf of approver

### Auto_approved (Priority: 9)

**Given:**
- request matches configured auto-approve rules for current level

**Then:**
- **set_field** target: `current_level` value: `current_level + 1`
- **emit_event** event: `approval.approved`

**Result:** Level auto-approved by system based on configured rules

### Self_approval_blocked (Priority: 10) — Error: `APPROVAL_SELF_APPROVAL`

**Given:**
- approver_id equals requester_id

**Result:** Self-approval rejected

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `APPROVAL_NOT_FOUND` | 404 | The approval request does not exist. | No |
| `APPROVAL_ALREADY_DECIDED` | 409 | This approval level has already been decided. | No |
| `APPROVAL_NOT_AUTHORIZED` | 403 | You are not an authorized approver for this level. | No |
| `APPROVAL_SELF_APPROVAL` | 403 | You cannot approve your own request. | No |
| `APPROVAL_ALREADY_WITHDRAWN` | 409 | This request has already been withdrawn. | No |
| `APPROVAL_INVALID_LEVEL` | 400 | The specified approval level configuration is invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `approval.requested` | A new approval request was submitted | `request_id`, `request_type`, `requester_id`, `approval_levels` |
| `approval.approved` | An approval level or the full request was approved | `request_id`, `level`, `approver_id`, `timestamp` |
| `approval.rejected` | An approval request was rejected | `request_id`, `level`, `approver_id`, `reason`, `timestamp` |
| `approval.escalated` | An approval timed out and was escalated | `request_id`, `level`, `timeout_hours`, `escalation_target_id` |
| `approval.delegated` | Approval authority was delegated to another user | `request_id`, `from_approver_id`, `to_delegate_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| task-management | optional | Tasks requiring sign-off can trigger an approval chain |
| expense-approval | extends | Expense approval is a specific instance of a generic approval chain |
| email-notifications | recommended | Notify approvers and requesters of status changes |
| role-based-access | recommended | Approver roles and delegation permissions require access control |

## AGI Readiness

### Goals

#### Efficient Approval

Process approval requests quickly while maintaining compliance and audit integrity

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| approval_cycle_time | < 24h for standard requests | Time from submission to final decision |
| escalation_rate | < 10% | Percentage of requests that hit timeout escalation |
| audit_completeness | 100% | All decisions have recorded approver, timestamp, and reason |

**Constraints:**

- **regulatory** (non-negotiable): Approval history must be immutable — no retroactive changes to decisions
- **security** (non-negotiable): Approvers can only act on requests within their authorized scope

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before overriding a rejection at any level
- before changing approval chain configuration
- before delegating approval authority across departments

**Escalation Triggers:**

- `pending_duration_hours > 48`
- `rejection_override_count > 3`

### Verification

**Invariants:**

- every approval decision has an identified approver and timestamp
- rejected requests cannot proceed without explicit override
- delegation chains cannot create circular approval loops
- auto-approve rules only apply within configured thresholds

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| sequential approval | a request requiring 3 levels of approval | all 3 approvers approve in sequence | request status transitions to approved after final approval |
| timeout escalation | a request pending for longer than SLA | timeout threshold is reached | request escalated to next-level approver with notification |
| delegation | an approver delegates to a substitute | the substitute approves the request | audit trail records both original approver and delegate |

### Coordination

**Protocol:** `orchestrated`

**Exposes:**

| Capability | Contract |
|------------|----------|
| `approval_decision` | accepts {request_id, request_type, metadata}, returns {decision, approver, timestamp} |

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `email_notification` | email-notifications | queue |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| auto_approve | `autonomous` | - | 5 |
| escalate_request | `autonomous` | - | - |
| override_rejection | `human_required` | - | - |
| modify_approval_chain | `human_required` | - | - |
| delegate_authority | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Approval Chain Blueprint",
  "description": "Multi-level approval workflow with sequential/parallel approvers, delegation, auto-approve rules, timeout escalation, and audit history.\n. 11 fields. 10 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "approval, workflow, multi-level, delegation, escalation, audit-trail"
}
</script>
