<!-- AUTO-GENERATED FROM broker-institution-dissemination.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Institution Dissemination

> Overnight dissemination of broker back-office data (accounts, balances, deals, transactions, entitlements) to subscribed institutional clients for reconciliation.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** dissemination · institutional · reconciliation · fixed-width · overnight-batch · popia

## What this does

Overnight dissemination of broker back-office data (accounts, balances, deals, transactions, entitlements) to subscribed institutional clients for reconciliation.

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **institution_code** *(text, required)* — Institution Code
- **broker_code** *(text, required)* — Broker Code
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **portfolio_indicator** *(select, optional)* — Portfolio Indicator
- **authorisation_status** *(select, required)* — Broker Authorisation Status
- **authorisation_date** *(date, optional)* — Authorisation Date
- **dataset_name** *(text, required)* — Allocated Dataset Name
- **delivery_user_id** *(text, required)* — Delivery User ID
- **delivery_password** *(password, required)* — Delivery Password
- **delivery_protocol** *(select, required)* — Delivery Protocol
- **file_date** *(date, required)* — File Batch Date
- **record_count** *(number, required)* — Number of Detail Records
- **selection_flags** *(json, optional)* — Per-Request Selection Flags (account/balance/deal/instrument/etc.)

## What must be true

- **general → rule_1:** Institution must submit a written request to Customer Support to be scheduled on the dissemination process (DISINS).
- **general → rule_2:** Each institution is allocated a dedicated dataset; data for multiple brokers may be aggregated into that dataset.
- **general → rule_3:** Each disseminated broker must have explicit written authorisation on file before their data is released to an institution.
- **general → rule_4:** All records in the file are fixed-width, 173 characters, blank-filled.
- **general → rule_5:** Every file begins with a header record (machine date/time, batch date) and ends with a trailer record (record count).
- **general → rule_6:** All balance amounts are multiplied by 100 and represented as whole numbers; sign character (+, -, or space) precedes the amount.
- **general → rule_7:** Each detail record begins with SYSTEM ('BD') followed by a 2-digit CARD-CDE identifying the record layout.
- **general → rule_8:** Passwords must be at least 8 characters, alphanumeric, unique per user, and must not contain common words or personal identifiers.
- **general → rule_9:** Password resume/reset requires a signed letterhead request, callback verification, and is performed only by Open Systems.
- **general → rule_10:** Selections in the DISINS request are hierarchical: BRANCH/PARTNER and PF-IND are applied first, then record-type selection flags.
- **general → rule_11:** Disclosure of broker client personal information to an institution is a POPIA processing activity; lawful basis and data-subject notification must be established before the feed is enabled.
- **general → rule_12:** The institution must retain the file only as long as needed for reconciliation and must apply equivalent protection to the PII it contains.
- **general → rule_13:** Cross-border transfer of the file to an institution outside South Africa requires POPIA section 72 conditions to be met.
- **general → rule_14:** Feeds must be auditable: every scheduled run, file produced, and file retrieval must be logged with timestamp, dataset, institution, and record count.
- **general → rule_15:** Broker authorisation may be revoked in writing; next overnight run must exclude the revoked broker's data.

## Success & failure scenarios

**✅ Success paths**

- **Schedule Created** — when authorisation_status eq "authorised"; institution_code exists, then create_record; emit dissemination.schedule.created. _Why: Customer Support schedules DISINS for an authorised institution with selection flags._
- **Overnight File Generated** — when batch_window eq "overnight", then create_record; emit dissemination.file.generated. _Why: Overnight batch produces the fixed-width file with header, detail records per selection, and trailer._
- **File Retrieved** — when file_status eq "ready"; credential_match eq true, then set file_status = "retrieved"; emit dissemination.file.retrieved. _Why: Institution retrieves the generated file from the allocated dataset over the configured protocol._
- **Reconciliation Completed** — when file_status eq "retrieved", then emit dissemination.reconciliation.completed. _Why: Institution reconciles deal and transaction records to in-house books and reports match status._
- **Authorisation Revoked** — when authorisation_status eq "revoked", then move authorisation_status authorised → revoked; notify via email; emit dissemination.authorisation.revoked. _Why: When a broker revokes authorisation, the next batch excludes that broker's data and the institution is notified._

**❌ Failure paths**

- **Schedule Requires Authorisation** — when authorisation_status neq "authorised", then emit dissemination.authorisation.revoked. _Why: A dissemination schedule cannot be created unless the broker has authorised the institution._ *(error: `DISSEM_BROKER_NOT_AUTHORISED`)*
- **Schedule Requires Popia Basis** — when popia_lawful_basis not_exists, then notify via email. _Why: Schedule creation is blocked if no lawful basis for PII disclosure to the institution is on file._ *(error: `DISSEM_POPIA_CONSENT_MISSING`)*
- **Trailer Record Count Mismatch** — when trailer_count neq "detail_count", then notify via email. _Why: If the trailer count does not equal the number of detail records written, the file is flagged and not released._ *(error: `DISSEM_RECORD_COUNT_MISMATCH`)*
- **Credentials Rejected** — when delivery_user_id exists; credential_match eq false, then emit dissemination.credential.reset. _Why: File retrieval with invalid credentials is refused and logged._ *(error: `DISSEM_CREDENTIALS_INVALID`)*

## Business flows

**Onboarding** — Institution onboarding for dissemination feed.

1. **step** *(institution)*
1. **step** *(customer_support)*
1. **step** *(open_systems)*
1. **step** *(customer_support)*
1. **step** *(institution)*

**Daily Cycle** — Daily overnight dissemination cycle.

1. **step** *(dissemination_engine)*
1. **step** *(dissemination_engine)*
1. **step** *(institution)*
1. **step** *(institution)*
1. **step** *(institution)*

## Errors it can return

- `DISSEM_BROKER_NOT_AUTHORISED` — Institution is not authorised to receive data for the requested broker.
- `DISSEM_INSTITUTION_NOT_REGISTERED` — Institution code is not registered for dissemination.
- `DISSEM_CREDENTIALS_INVALID` — The supplied credentials are not valid for file retrieval.
- `DISSEM_PASSWORD_POLICY` — Password does not meet complexity requirements.
- `DISSEM_FILE_NOT_READY` — Overnight file has not yet been generated for the requested batch date.
- `DISSEM_RECORD_COUNT_MISMATCH` — Trailer record count does not match number of detail records.
- `DISSEM_POPIA_CONSENT_MISSING` — Lawful basis for disclosing broker client personal information has not been recorded.
- `DISSEM_SCHEDULE_CONFLICT` — A dissemination schedule already exists for this institution and broker combination.

## Events

**`dissemination.schedule.created`**
  Payload: `institution_code`, `broker_code`, `selection_flags`, `scheduled_by`

**`dissemination.authorisation.granted`**
  Payload: `broker_code`, `institution_code`, `authorisation_date`

**`dissemination.authorisation.revoked`**
  Payload: `broker_code`, `institution_code`, `revoked_date`, `reason`

**`dissemination.file.generated`**
  Payload: `institution_code`, `file_date`, `dataset_name`, `record_count`

**`dissemination.file.retrieved`**
  Payload: `institution_code`, `file_date`, `retrieved_at`, `user_id`

**`dissemination.reconciliation.completed`**
  Payload: `institution_code`, `file_date`, `matched_count`, `unmatched_count`

**`dissemination.credential.reset`**
  Payload: `user_id`, `reset_by`, `reset_at`

## Connects to

- **popia-compliance** *(required)*
- **broker-client-account-maintenance** *(recommended)*
- **broker-deal-capture** *(recommended)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-corporate-actions** *(optional)*
- **broker-portfolio-management** *(optional)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-institution-dissemination/) · **Spec source:** [`broker-institution-dissemination.blueprint.yaml`](./broker-institution-dissemination.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
