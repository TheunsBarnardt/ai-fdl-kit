---
title: "Automation Rules Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Event-driven automation engine that triggers actions based on record lifecycle events, field changes, time-based schedules, incoming messages, and external webh"
---

# Automation Rules Blueprint

> Event-driven automation engine that triggers actions based on record lifecycle events, field changes, time-based schedules, incoming messages, and external webhooks with condition filtering.


| | |
|---|---|
| **Feature** | `automation-rules` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | automation, triggers, event-driven, scheduled-actions, webhooks, workflow-engine |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/automation-rules.blueprint.yaml) |
| **JSON API** | [automation-rules.json]({{ site.baseurl }}/api/blueprints/workflow/automation-rules.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `automation_admin` | Automation Admin | human | Creates and manages automation rules, conditions, and actions |
| `system` | Automation Engine | system | Monitors events, evaluates conditions, executes actions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rule_name` | text | Yes | Rule Name |  |
| `target_model` | text | Yes | Target Record Type |  |
| `trigger_type` | select | Yes | Trigger Type |  |
| `trigger_fields` | json | No | Watched Fields |  |
| `trigger_field_value` | text | No | Trigger Value |  |
| `filter_condition` | json | No | Filter Condition |  |
| `pre_filter_condition` | json | No | Before-Update Filter |  |
| `time_delay` | number | No | Time Delay |  |
| `time_delay_unit` | select | No | Delay Unit |  |
| `time_date_field` | text | No | Date Field |  |
| `actions` | json | Yes | Actions |  |
| `action_type` | select | Yes | Action Type |  |
| `webhook_uuid` | text | No | Webhook Endpoint ID |  |
| `rule_active` | boolean | Yes | Active |  |

## Rules

- **message_triggers_require_mail_model:**
  - **description:** Message-received and message-sent triggers are only valid on record types that support messaging/threading.

- **on_change_only_code_actions:**
  - **description:** The on_change trigger (UI field change) can only execute code-type actions, not emails, SMS, or record creation.

- **trigger_field_tracking:**
  - **description:** When specific trigger fields are set, the rule only fires if at least one of those fields actually changed in the update operation.

- **before_after_domain_transition:**
  - **description:** Pre-filter and post-filter conditions together define a state transition: record must have matched the before-filter and must now match the after-filter for the rule to fire.

- **webhook_uuid_immutable:**
  - **description:** Webhook endpoint identifiers cannot be changed after creation to ensure external integrations remain stable.

- **time_trigger_cron_scheduling:**
  - **description:** Time-based rules are evaluated via periodic scheduled jobs. The delay is calculated from the specified date field on each record.

- **no_recursive_automation:**
  - **description:** Actions executed by an automation rule do not trigger other automation rules to prevent infinite loops (guard flag set).


## Outcomes

### Rule_triggered_on_create (Priority: 1)

**Given:**
- a new record is created matching the target model
- trigger type is on_create or on_create_or_write
- the new record matches the filter condition (if set)

**Then:**
- **call_service** target: `action_executor` — Execute configured actions (email, field update, code, etc.)
- **emit_event** event: `automation.rule.fired`

**Result:** Actions executed automatically on the new record

### Rule_triggered_on_field_change (Priority: 2)

**Given:**
- an existing record is updated
- one of the watched trigger fields changed
- record matched the before-filter BEFORE the change
- record matches the after-filter AFTER the change

**Then:**
- **call_service** target: `action_executor` — Execute configured actions on the changed record
- **emit_event** event: `automation.rule.fired`

**Result:** Actions executed based on the specific field transition

### Rule_triggered_on_stage_set (Priority: 3)

**Given:**
- record's stage/state/priority/tag/user field is set to the trigger value

**Then:**
- **call_service** target: `action_executor` — Execute configured actions

**Result:** Actions fire when the specific value is reached

### Rule_triggered_on_time (Priority: 4)

**Given:**
- the scheduled job runs
- records exist where the date field + delay has passed
- those records match the filter condition

**Then:**
- **call_service** target: `action_executor` — Execute actions on all matching records in batch
- **emit_event** event: `automation.rule.scheduled_batch`

**Result:** Time-delayed actions execute on all qualifying records

### Rule_triggered_by_webhook (Priority: 5)

**Given:**
- external system sends HTTP request to the webhook endpoint
- webhook UUID matches an active rule

**Then:**
- **call_service** target: `action_executor` — Parse webhook payload and execute code action with payload available as context variable

- **emit_event** event: `automation.webhook.received`

**Result:** External event triggers internal automation

### Rule_triggered_on_message (Priority: 6)

**Given:**
- a message is received on (or sent from) a record
- the record type supports messaging
- trigger type is on_message_received or on_message_sent

**Then:**
- **call_service** target: `action_executor` — Execute actions with message content available in context

**Result:** Incoming/outgoing message triggers automated response

### Action_sends_email (Priority: 7)

**Given:**
- rule fires and action type is send_email

**Then:**
- **notify** — Email sent using configured template with record data merged

**Result:** Automated email sent to the record's contacts

### Action_updates_field (Priority: 8)

**Given:**
- rule fires and action type is set_field

**Then:**
- **set_field** target: `configured_field` — Field value set to configured static or computed value

**Result:** Record field updated automatically

### Rule_condition_not_met (Priority: 10)

**Given:**
- trigger event occurs but record does not match filter conditions

**Result:** Rule skipped, no actions executed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTOMATION_INVALID_MODEL` | 400 | The target record type does not exist or is not accessible. | No |
| `AUTOMATION_MESSAGE_TRIGGER_INVALID` | 400 | Message triggers are only available for record types that support messaging. | No |
| `AUTOMATION_CODE_EXECUTION_ERROR` | 500 | An error occurred while executing the automation code action. | No |
| `AUTOMATION_WEBHOOK_NOT_FOUND` | 404 | No active automation rule found for this webhook endpoint. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `automation.rule.fired` | An automation rule was triggered and its actions executed | `rule_id`, `trigger_type`, `record_id`, `actions_executed` |
| `automation.rule.scheduled_batch` | Time-based rule executed on a batch of records | `rule_id`, `record_count` |
| `automation.webhook.received` | External webhook triggered an automation rule | `rule_id`, `webhook_uuid`, `source_ip` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| quotation-order-management | optional | Automate actions on sales orders (e.g., auto-assign team on creation) |
| odoo-expense-approval | optional | Automate expense workflow steps (e.g., auto-approve under threshold) |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: ERP system
  tech_stack: Python + JavaScript/OWL
  files_traced: 15
  entry_points:
    - addons/base_automation/models/base_automation.py
    - addons/base_automation/models/ir_actions_server.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Automation Rules Blueprint",
  "description": "Event-driven automation engine that triggers actions based on record lifecycle events, field changes, time-based schedules, incoming messages, and external webh",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "automation, triggers, event-driven, scheduled-actions, webhooks, workflow-engine"
}
</script>
