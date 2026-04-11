<!-- AUTO-GENERATED FROM contract-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Contract Management

> Contract lifecycle management with signing workflow, date-driven status transitions, fulfilment tracking, and template-based term generation.

**Category:** Crm · **Version:** 1.0.0 · **Tags:** contract · agreement · fulfilment · signing · compliance

## What this does

Contract lifecycle management with signing workflow, date-driven status transitions, fulfilment tracking, and template-based term generation.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **party_type** *(select, required)* — Party Type
- **party_name** *(text, required)* — Party Name
- **contract_status** *(select, required)* — Contract Status
- **is_signed** *(boolean, optional)* — Is Signed
- **signed_on** *(datetime, optional)* — Signed On
- **signed_by_company** *(text, optional)* — Signed By (Company Representative)
- **signee** *(text, optional)* — Signee (Counterparty)
- **start_date** *(date, required)* — Start Date
- **end_date** *(date, optional)* — End Date
- **contract_template** *(text, optional)* — Contract Template
- **contract_terms** *(rich_text, optional)* — Contract Terms
- **requires_fulfilment** *(boolean, optional)* — Requires Fulfilment
- **fulfilment_status** *(select, optional)* — Fulfilment Status
- **fulfilment_deadline** *(date, optional)* — Fulfilment Deadline
- **fulfilment_terms** *(json, optional)* — Fulfilment Terms
- **document_type** *(select, optional)* — Linked Document Type
- **document_name** *(text, optional)* — Linked Document Name
- **ip_address** *(text, optional)* — IP Address

## What must be true

- **end_date_after_start:** If an end date is provided, it must be on or after the start date.
- **unsigned_until_signed:** Contracts remain in Unsigned status until the is_signed flag is set to true.
- **active_status_date_driven:** Active status is automatically computed when start_date <= today and (end_date is null or end_date >= today) and the contract is signed.
- **inactive_outside_range:** Contracts outside their active date range are automatically set to Inactive.
- **indefinite_contracts:** Contracts with no end_date remain active indefinitely until explicitly cancelled.
- **fulfilment_checklist:** Fulfilment is tracked via checklist items in fulfilment_terms. Each item has a requirement, fulfilled flag, and optional notes.
- **lapsed_on_missed_deadline:** When the fulfilment deadline passes with incomplete fulfilment items, the fulfilment status is set to Lapsed.
- **signed_by_auto_set:** The signed_by_company field is automatically set to the current user when the contract is submitted/signed.
- **contract_terms_templating:** Contract terms support template rendering with party context variables (party name, address, dates) for dynamic document generation.
- **daily_status_update_job:** A daily background job evaluates all contracts and updates their status based on current date against start_date and end_date.

## Success & failure scenarios

**✅ Success paths**

- **Create Contract** — when contract owner provides party type, party name, and start date; party_name exists, then New contract created and ready for review and signing.
- **Sign Contract** — when contract is in Unsigned status; signee reviews and agrees to terms, then Contract is signed and status will transition based on date range.
- **Track Fulfilment** — when contract has requires_fulfilment set to true; contract owner updates fulfilment term items, then Fulfilment status updated based on completed checklist items.
- **Cancel Contract** — when contract is not already cancelled; contract owner initiates cancellation, then Contract is cancelled and no longer active.
- **Lapse Contract** — when contract has requires_fulfilment set to true; Fulfilment deadline has passed; fulfilment_terms has incomplete items, then Contract fulfilment has lapsed due to missed deadline.
- **Renew Contract** — when contract is in Active or Inactive status; contract owner creates a renewal, then New contract created as a renewal of the original.

**❌ Failure paths**

- **End Before Start Rejected** — when end_date exists; End date is before start date, then Contract rejected — end date cannot be before start date. *(error: `CONTRACT_END_BEFORE_START`)*
- **Already Cancelled Rejected** — when contract_status eq "Cancelled", then Action rejected — contract is already cancelled. *(error: `CONTRACT_ALREADY_CANCELLED`)*

## Errors it can return

- `CONTRACT_END_BEFORE_START` — Contract end date cannot be before the start date.
- `CONTRACT_ALREADY_CANCELLED` — This contract has already been cancelled and cannot be modified.

## Connects to

- **customer-supplier-management** *(required)* — Contracts are linked to customer, supplier, or employee party records
- **sales-order-lifecycle** *(optional)* — Contracts may be linked to sales orders or purchase orders
- **lead-opportunity-pipeline** *(optional)* — Won opportunities may result in contract creation

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/crm/contract-management/) · **Spec source:** [`contract-management.blueprint.yaml`](./contract-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
