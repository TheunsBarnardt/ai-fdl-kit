<!-- AUTO-GENERATED FROM automation-rules.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Automation Rules

> Event-driven automation engine that triggers actions based on record lifecycle events, field changes, time-based schedules, incoming messages, and external webhooks with condition filtering.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** automation · triggers · event-driven · scheduled-actions · webhooks · workflow-engine

## What this does

Event-driven automation engine that triggers actions based on record lifecycle events, field changes, time-based schedules, incoming messages, and external webhooks with condition filtering.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **rule_name** *(text, required)* — Rule Name
- **target_model** *(text, required)* — Target Record Type
- **trigger_type** *(select, required)* — Trigger Type
- **trigger_fields** *(json, optional)* — Watched Fields
- **trigger_field_value** *(text, optional)* — Trigger Value
- **filter_condition** *(json, optional)* — Filter Condition
- **pre_filter_condition** *(json, optional)* — Before-Update Filter
- **time_delay** *(number, optional)* — Time Delay
- **time_delay_unit** *(select, optional)* — Delay Unit
- **time_date_field** *(text, optional)* — Date Field
- **actions** *(json, required)* — Actions
- **action_type** *(select, required)* — Action Type
- **webhook_uuid** *(text, optional)* — Webhook Endpoint ID
- **rule_active** *(boolean, required)* — Active

## What must be true

- **message_triggers_require_mail_model:** Message-received and message-sent triggers are only valid on record types that support messaging/threading.
- **on_change_only_code_actions:** The on_change trigger (UI field change) can only execute code-type actions, not emails, SMS, or record creation.
- **trigger_field_tracking:** When specific trigger fields are set, the rule only fires if at least one of those fields actually changed in the update operation.
- **before_after_domain_transition:** Pre-filter and post-filter conditions together define a state transition: record must have matched the before-filter and must now match the after-filter for the rule to fire.
- **webhook_uuid_immutable:** Webhook endpoint identifiers cannot be changed after creation to ensure external integrations remain stable.
- **time_trigger_cron_scheduling:** Time-based rules are evaluated via periodic scheduled jobs. The delay is calculated from the specified date field on each record.
- **no_recursive_automation:** Actions executed by an automation rule do not trigger other automation rules to prevent infinite loops (guard flag set).

## Success & failure scenarios

**✅ Success paths**

- **Rule Triggered On Field Change** — when an existing record is updated; one of the watched trigger fields changed; record matched the before-filter BEFORE the change; record matches the after-filter AFTER the change, then Actions executed based on the specific field transition.
- **Rule Triggered On Stage Set** — when record's stage/state/priority/tag/user field is set to the trigger value, then Actions fire when the specific value is reached.
- **Rule Triggered On Time** — when the scheduled job runs; records exist where the date field + delay has passed; those records match the filter condition, then Time-delayed actions execute on all qualifying records.
- **Rule Triggered By Webhook** — when external system sends HTTP request to the webhook endpoint; webhook UUID matches an active rule, then External event triggers internal automation.
- **Action Sends Email** — when rule fires and action type is send_email, then Automated email sent to the record's contacts.
- **Action Updates Field** — when rule fires and action type is set_field, then Record field updated automatically.
- **Rule Condition Not Met** — when trigger event occurs but record does not match filter conditions, then Rule skipped, no actions executed.

**❌ Failure paths**

- **Rule Triggered On Create** — when a new record is created matching the target model; trigger type is on_create or on_create_or_write; the new record matches the filter condition (if set), then Actions executed automatically on the new record. *(error: `AUTOMATION_CODE_EXECUTION_ERROR`)*
- **Rule Triggered On Message** — when a message is received on (or sent from) a record; the record type supports messaging; trigger type is on_message_received or on_message_sent, then Incoming/outgoing message triggers automated response. *(error: `AUTOMATION_MESSAGE_TRIGGER_INVALID`)*

## Errors it can return

- `AUTOMATION_INVALID_MODEL` — The target record type does not exist or is not accessible.
- `AUTOMATION_MESSAGE_TRIGGER_INVALID` — Message triggers are only available for record types that support messaging.
- `AUTOMATION_CODE_EXECUTION_ERROR` — An error occurred while executing the automation code action.
- `AUTOMATION_WEBHOOK_NOT_FOUND` — No active automation rule found for this webhook endpoint.

## Connects to

- **quotation-order-management** *(optional)* — Automate actions on sales orders (e.g., auto-assign team on creation)
- **odoo-expense-approval** *(optional)* — Automate expense workflow steps (e.g., auto-approve under threshold)

## Quality fitness 🟡 73/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/automation-rules/) · **Spec source:** [`automation-rules.blueprint.yaml`](./automation-rules.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
