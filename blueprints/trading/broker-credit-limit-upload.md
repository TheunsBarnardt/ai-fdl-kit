<!-- AUTO-GENERATED FROM broker-credit-limit-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Credit Limit Upload

> Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** credit-limit · bulk-upload · risk · approval-workflow · audit

## What this does

Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **upload_mode** *(select, required)* — Upload Mode
- **broker_code** *(text, required)* — Broker Code
- **batch_number** *(number, required)* — Batch Number
- **upload_name** *(text, required)* — Upload Name
- **run_date** *(date, required)* — Run Date
- **account_code** *(text, required)* — Account Code
- **credit_limit_type** *(select, required)* — Credit Limit Type
- **credit_limit_amount** *(number, required)* — Credit Limit Amount
- **currency** *(select, required)* — Currency
- **effective_date** *(date, optional)* — Effective Date
- **record_count** *(number, required)* — Number of Records
- **approval_status** *(select, required)* — Approval Status
- **supervisor_id** *(text, optional)* — Approving Supervisor

## What must be true

- **general → rule_1:** Maximum 1000 detail records per upload (1002 including header and trailer).
- **general → rule_2:** Header record type must be H, detail D, trailer T.
- **general → rule_3:** Batch number must be unique per broker and never reprocessed.
- **general → rule_4:** Credit limit amount must be greater than 0 unless limit type is PF.
- **general → rule_5:** When limit type is PF, credit limit amount MUST be zero.
- **general → rule_6:** Currency codes must be ISO 4217 valid codes.
- **general → rule_7:** Every limit change requires supervisor approval before it takes effect.
- **general → rule_8:** Effective date cannot be in the past; defaults to next business day if omitted.
- **general → rule_9:** Full refresh mode replaces all existing limits for the broker; delta mode updates only supplied accounts.
- **general → rule_10:** Every accepted or rejected record must be written to the audit trail with before/after values.
- **general → rule_11:** Failed records must not block successful records in the same batch.
- **general → rule_12:** A processing report must be produced detailing changes applied and errors encountered.

## Success & failure scenarios

**✅ Success paths**

- **Upload Limits Bulk** — when upload_name eq "UPLKB1"; record_count lte 1002; batch_number exists, then create_record; set approval_status = "pending"; emit credit.limit.upload.received. _Why: Broker submits a bulk credit limit upload file for processing._
- **Supervisor Approval Required** — when approval_status eq "pending", then notify via email; emit credit.limit.approval.requested. _Why: Validated batch is routed to a risk supervisor for approval before any limit change is applied._
- **Schedule Effective Date** — when approval_status eq "approved"; effective_date gte "today", then move approval_status approved → applied; emit credit.limit.scheduled. _Why: Approved limit changes are scheduled to take effect on the requested effective date._
- **Audit Trail** — when batch_number exists, then create_record; emit credit.limit.audit.written. _Why: Every limit change, approval, rejection, or error writes an immutable audit entry with before/after values._

**❌ Failure paths**

- **Validate Limit** — when credit_limit_amount lte 0 OR currency not_in ["ZAR","USD","EUR","GBP"] OR credit_limit_type not_in ["UP","ST","PF"], then emit credit.limit.record.rejected. _Why: Each detail record is validated for limit type, amount, and currency before acceptance._ *(error: `CREDIT_LIMIT_INVALID`)*

## Errors it can return

- `CREDIT_LIMIT_INVALID` — Credit limit record failed validation.
- `CREDIT_LIMIT_BATCH_DUPLICATE` — Batch number has already been processed.
- `CREDIT_LIMIT_COUNT_EXCEEDED` — Upload exceeds maximum record count.
- `CREDIT_LIMIT_HEADER_INVALID` — Upload header is invalid or missing required fields.
- `CREDIT_LIMIT_TRAILER_MISMATCH` — Trailer record count does not match detail records.
- `CREDIT_LIMIT_APPROVAL_REQUIRED` — Supervisor approval required before applying limit changes.
- `CREDIT_LIMIT_EFFECTIVE_DATE_INVALID` — Effective date must not be in the past.
- `CREDIT_LIMIT_CURRENCY_INVALID` — Currency code is not a recognised ISO 4217 value.

## Events

**`credit.limit.upload.received`**
  Payload: `broker_code`, `batch_number`, `record_count`, `upload_mode`

**`credit.limit.record.rejected`**
  Payload: `broker_code`, `account_code`, `credit_limit_amount`, `currency`

**`credit.limit.approval.requested`**
  Payload: `broker_code`, `batch_number`, `record_count`

**`credit.limit.approval.granted`**
  Payload: `broker_code`, `batch_number`, `supervisor_id`

**`credit.limit.approval.rejected`**
  Payload: `broker_code`, `batch_number`, `supervisor_id`

**`credit.limit.scheduled`**
  Payload: `broker_code`, `account_code`, `credit_limit_amount`, `effective_date`

**`credit.limit.applied`**
  Payload: `broker_code`, `account_code`, `credit_limit_amount`, `effective_date`

**`credit.limit.audit.written`**
  Payload: `broker_code`, `account_code`, `batch_number`, `approval_status`, `supervisor_id`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-credit-limit-upload/) · **Spec source:** [`broker-credit-limit-upload.blueprint.yaml`](./broker-credit-limit-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
