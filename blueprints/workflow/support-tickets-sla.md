<!-- AUTO-GENERATED FROM support-tickets-sla.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Support Tickets Sla

> Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim handling.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** support · tickets · sla · issue-tracking · warranty · customer-service · helpdesk

## What this does

Support ticket management with SLA tracking, priority-based response/resolution deadlines, working hours calculation with holiday exclusions, and warranty claim handling.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **subject** *(text, required)* — Subject
- **status** *(select, required)* — Issue Status
- **priority** *(select, required)* — Priority
- **issue_type** *(text, optional)* — Issue Type
- **customer** *(text, optional)* — Customer
- **raised_by** *(email, optional)* — Raised By
- **description** *(rich_text, optional)* — Description
- **resolution** *(rich_text, optional)* — Resolution
- **first_responded_on** *(datetime, optional)* — First Responded On
- **resolution_date** *(datetime, optional)* — Resolution Date
- **opening_date** *(date, required)* — Opening Date
- **service_level_agreement** *(text, optional)* — Service Level Agreement
- **response_by** *(datetime, optional)* — Response By
- **resolution_by** *(datetime, optional)* — Resolution By
- **agreement_status** *(select, optional)* — Agreement Status
- **first_response_time** *(number, optional)* — First Response Time (seconds)
- **avg_response_time** *(number, optional)* — Average Response Time (seconds)
- **service_level** *(text, required)* — Service Level Name
- **enabled** *(boolean, optional)* — Enabled
- **default_sla** *(boolean, optional)* — Default SLA
- **entity_type** *(select, optional)* — Entity Type
- **entity** *(text, optional)* — Entity
- **priorities** *(json, optional)* — SLA Priorities
- **support_and_resolution** *(json, optional)* — Support Hours
- **holiday_list** *(text, optional)* — Holiday List
- **apply_sla_for_resolution** *(boolean, optional)* — Apply SLA for Resolution
- **condition** *(text, optional)* — SLA Condition
- **warranty_customer** *(text, optional)* — Warranty Customer
- **item_code** *(text, optional)* — Item Code
- **serial_no** *(text, optional)* — Serial Number
- **complaint** *(text, optional)* — Complaint
- **warranty_status** *(select, optional)* — Warranty Status
- **complaint_date** *(date, optional)* — Complaint Date
- **warranty_resolution_date** *(date, optional)* — Warranty Resolution Date
- **warranty_resolution** *(text, optional)* — Warranty Resolution

## What must be true

- **sla_auto_assignment:** SLA is auto-assigned based on entity matching hierarchy: specific customer > customer group > territory > default SLA.
- **sla_deadline_calculation:** Response and resolution deadlines are calculated from SLA priority settings and working hours, excluding holidays.
- **holiday_exclusion:** Holiday list exclusions extend SLA deadlines by skipping non-working days in the calculation.
- **agreement_status_auto_set:** Agreement status is auto-set to Fulfilled if resolved within SLA deadlines, or Failed if any deadline is exceeded.
- **first_response_tracking:** First response time is tracked from issue creation to the first reply, and compared against the SLA response deadline.
- **multiple_sla_priority:** Multiple SLAs can exist; priority-based selection ensures the most specific applicable SLA is applied.
- **warranty_serial_link:** Warranty claims are linked to serial numbers and items, validating that the serial is under warranty.

## Success & failure scenarios

**✅ Success paths**

- **Create Issue** — when subject and opening_date are provided, then Support issue created and SLA assignment triggered.
- **Track Response Time** — when issue exists and first_responded_on is not set; a reply is posted to the issue, then First response time recorded and compared against SLA.
- **Resolve Issue** — when issue exists and is not Closed; resolution description is provided, then Issue resolved with SLA status determined.
- **Escalate Issue** — when response_by or resolution_by deadline has passed; issue is not Resolved or Closed, then SLA marked as failed and escalation triggered.

**❌ Failure paths**

- **Assign Sla** — when issue exists and is Open; at least one matching SLA is enabled, then SLA assigned with calculated response and resolution deadlines. *(error: `ISSUE_SLA_NOT_FOUND`)*
- **Close Issue** — when issue is in Resolved status, then Issue closed after resolution confirmation. *(error: `ISSUE_ALREADY_CLOSED`)*
- **Create Warranty Claim** — when warranty_customer and item_code are provided; serial_no is valid and under warranty, then Warranty claim created and linked to serial number. *(error: `WARRANTY_SERIAL_INVALID`)*

## Errors it can return

- `ISSUE_SLA_NOT_FOUND` — No matching service level agreement found for this issue.
- `ISSUE_ALREADY_CLOSED` — This issue is already closed and cannot be modified.
- `WARRANTY_SERIAL_INVALID` — The specified serial number is invalid or not found.
- `WARRANTY_EXPIRED` — The warranty period for this serial number has expired.

## Connects to

- **customer-supplier-management** *(recommended)* — Customer data used for SLA entity matching
- **serial-batch-tracking** *(optional)* — Serial numbers used for warranty claim validation

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

📈 **+4** since baseline (71 → 75)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T4` **sequential-priority** — added priority to 7 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/support-tickets-sla/) · **Spec source:** [`support-tickets-sla.blueprint.yaml`](./support-tickets-sla.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
