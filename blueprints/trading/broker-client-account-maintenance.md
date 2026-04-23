<!-- AUTO-GENERATED FROM broker-client-account-maintenance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Client Account Maintenance

> Internal back-office account maintenance for clients, agents, and stock accounts including alpha lookup, relationships, addresses, tax/legal records, freezes, and memos

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · account-maintenance · clients · agents · stock-accounts · tax · kyc · popia

## What this does

Internal back-office account maintenance for clients, agents, and stock accounts including alpha lookup, relationships, addresses, tax/legal records, freezes, and memos

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_code** *(text, required)* — Account Code
- **account_type** *(select, required)* — Account Type
- **alpha_short_name** *(text, required)* — Alpha Short Name
- **full_name** *(text, required)* — Account Full Name
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **advisor_code** *(text, optional)* — Advisor Code
- **mandate_type** *(select, optional)* — Managed Mandate Type
- **controlled_account_flag** *(boolean, required)* — Controlled Account Flag
- **id_number** *(text, optional)* — SA ID Number
- **passport_number** *(text, optional)* — Passport Number
- **tax_reference_number** *(text, optional)* — Tax Reference Number
- **fatca_status** *(select, optional)* — FATCA Status
- **crs_reportable** *(boolean, optional)* — CRS Reportable
- **it3b_exclusion** *(boolean, optional)* — IT3B Tax Certificate Exclusion
- **physical_address** *(text, required)* — Physical Address
- **postal_address** *(text, optional)* — Postal Address
- **email_address** *(email, optional)* — Email Address
- **cellphone_number** *(phone, optional)* — Cellphone Number
- **bank_account_number** *(text, optional)* — Bank Account Number
- **bank_branch_code** *(text, optional)* — Bank Branch Code
- **account_status** *(select, required)* — Account Status
- **freeze_reason** *(text, optional)* — Freeze Reason
- **deactivation_date** *(date, optional)* — Deactivation Date
- **memo_text** *(rich_text, optional)* — Memorandum Text

## What must be true

- **data_integrity → alpha_code_auto_generation:** Short alpha code auto-derived from surname+initials or first 20 chars of name; broker may override
- **data_integrity → account_uniqueness:** Account code must be unique within broker firm
- **data_integrity → referential_integrity:** Deletion forbidden if account has historical deals, financial entries, or open positions
- **data_integrity → audit_trail_retention:** All changes logged with user, timestamp, old/new values; retained for at least 36 months
- **security → access_control:** User access controlled at screen level via resource access control facility
- **security → segregation_of_duties:** Freeze/unfreeze requires supervisor role; operator cannot self-approve
- **security → field_level_auth:** View vs update permissions configurable per screen and per field
- **compliance → popia_consent:** Personal information capture requires documented lawful basis; POPIA compliance required
- **compliance → popia_breach_notification:** Unauthorized access or disclosure triggers regulator and data-subject notification per POPIA s.22
- **compliance → sars_address:** Physical address fields must meet tax-authority requirements
- **compliance → fatca_crs:** US-person and CRS-reportable status recorded on tax/legal maintenance screen
- **compliance → kyc_verification:** Client account verification completed before trading is enabled
- **business → account_types:** Client, agent, stock, allocation, nominee, trustee — each governs downstream processing
- **business → controlled_accounts:** Controlled client credit balances swept nightly to broker trust account
- **business → supplementary_names:** Copy contract notes and statements can be mailed to supplementary addresses
- **business → shorty_codes:** Shorty name codes may be loaded for quick reference on trading screens
- **business → freeze_blocks_trading:** Frozen accounts cannot have new deals allocated or financial entries processed

## Success & failure scenarios

**✅ Success paths**

- **Create New Client Account** — when account_type eq "client"; full_name exists; physical_address exists, then create_record; set account_status = "pending_verification"; emit account.created. _Why: Operator loads a new client account with required KYC fields._
- **Verify And Activate Account** — when account_status eq "pending_verification"; kyc_documents_complete eq true, then move account_status pending_verification → active; emit account.activated. _Why: Supervisor verifies KYC documents and activates account for trading._
- **Freeze Account** — when user_role eq "account_supervisor"; freeze_reason exists, then move account_status active → frozen; emit account.frozen. _Why: Supervisor freezes an account with a documented reason._
- **Update Tax Legal Record** — when user_role eq "compliance_officer", then set fatca_status = "updated"; set crs_reportable = "updated"; emit account.tax_status_changed. _Why: Compliance officer records FATCA and CRS status._
- **Alpha Lookup** — when search_term exists, then call service. _Why: Generic alpha look-up by partial name, optionally filtered by type/branch/partner._

**❌ Failure paths**

- **Reject Duplicate Account** — when account_code exists, then emit account.created. _Why: Prevent duplicate account codes within a broker firm._ *(error: `ACCOUNT_DUPLICATE`)*
- **Reject Operator Freeze** — when user_role neq "account_supervisor", then emit account.frozen. _Why: Prevent non-supervisor users from freezing accounts._ *(error: `ACCOUNT_FREEZE_FORBIDDEN`)*
- **Block Deletion With History** — when has_historical_activity eq true, then emit account.updated. _Why: Prevent deletion of accounts that hold historical activity._ *(error: `ACCOUNT_DELETE_BLOCKED`)*

## Errors it can return

- `ACCOUNT_DUPLICATE` — Account code already exists for this broker
- `ACCOUNT_INVALID_ALPHA` — Alpha short name cannot be derived, please supply manually
- `ACCOUNT_VERIFICATION_REQUIRED` — Account must be verified before activation
- `ACCOUNT_DELETE_BLOCKED` — Account cannot be deleted, historical activity exists
- `ACCOUNT_FREEZE_FORBIDDEN` — Only a supervisor role may freeze or unfreeze an account
- `ACCOUNT_POPIA_VIOLATION` — Personal information capture failed POPIA lawful-basis check

## Events

**`account.created`**
  Payload: `account_code`, `account_type`, `broker_code`, `created_by`, `timestamp`

**`account.activated`**
  Payload: `account_code`, `activated_by`, `timestamp`

**`account.frozen`**
  Payload: `account_code`, `freeze_reason`, `frozen_by`, `timestamp`

**`account.unfrozen`**
  Payload: `account_code`, `unfrozen_by`, `timestamp`

**`account.deactivated`**
  Payload: `account_code`, `deactivated_by`, `timestamp`

**`account.updated`**
  Payload: `account_code`, `field_name`, `old_value`, `new_value`, `updated_by`, `timestamp`

**`account.tax_status_changed`**
  Payload: `account_code`, `fatca_status`, `crs_reportable`, `changed_by`

## Connects to

- **broker-client-data-upload** *(extends)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-client-account-maintenance/) · **Spec source:** [`broker-client-account-maintenance.blueprint.yaml`](./broker-client-account-maintenance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
