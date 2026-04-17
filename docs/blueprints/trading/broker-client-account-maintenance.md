---
title: "Broker Client Account Maintenance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Internal back-office account maintenance for clients, agents, and stock accounts including alpha lookup, relationships, addresses, tax/legal records, freezes, a"
---

# Broker Client Account Maintenance Blueprint

> Internal back-office account maintenance for clients, agents, and stock accounts including alpha lookup, relationships, addresses, tax/legal records, freezes, and memos

| | |
|---|---|
| **Feature** | `broker-client-account-maintenance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, account-maintenance, clients, agents, stock-accounts, tax, kyc, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-client-account-maintenance.blueprint.yaml) |
| **JSON API** | [broker-client-account-maintenance.json]({{ site.baseurl }}/api/blueprints/trading/broker-client-account-maintenance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `account_supervisor` | Account Supervisor | human |  |
| `back_office_system` | Back-Office System | system |  |
| `compliance_officer` | Compliance Officer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_code` | text | Yes | Account Code |  |
| `account_type` | select | Yes | Account Type |  |
| `alpha_short_name` | text | Yes | Alpha Short Name |  |
| `full_name` | text | Yes | Account Full Name |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `advisor_code` | text | No | Advisor Code |  |
| `mandate_type` | select | No | Managed Mandate Type |  |
| `controlled_account_flag` | boolean | Yes | Controlled Account Flag |  |
| `id_number` | text | No | SA ID Number |  |
| `passport_number` | text | No | Passport Number |  |
| `tax_reference_number` | text | No | Tax Reference Number |  |
| `fatca_status` | select | No | FATCA Status |  |
| `crs_reportable` | boolean | No | CRS Reportable |  |
| `it3b_exclusion` | boolean | No | IT3B Tax Certificate Exclusion |  |
| `physical_address` | text | Yes | Physical Address |  |
| `postal_address` | text | No | Postal Address |  |
| `email_address` | email | No | Email Address |  |
| `cellphone_number` | phone | No | Cellphone Number |  |
| `bank_account_number` | text | No | Bank Account Number |  |
| `bank_branch_code` | text | No | Bank Branch Code |  |
| `account_status` | select | Yes | Account Status |  |
| `freeze_reason` | text | No | Freeze Reason |  |
| `deactivation_date` | date | No | Deactivation Date |  |
| `memo_text` | rich_text | No | Memorandum Text |  |

## States

**State field:** `account_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending_verification` | Yes |  |
| `active` |  |  |
| `frozen` |  |  |
| `deactivated` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending_verification` | `active` | account_supervisor |  |
|  | `active` | `frozen` | broker_operator |  |
|  | `frozen` | `active` | account_supervisor |  |
|  | `active` | `deactivated` | account_supervisor |  |

## Rules

- **data_integrity:**
  - **alpha_code_auto_generation:** Short alpha code auto-derived from surname+initials or first 20 chars of name; broker may override
  - **account_uniqueness:** Account code must be unique within broker firm
  - **referential_integrity:** Deletion forbidden if account has historical deals, financial entries, or open positions
  - **audit_trail_retention:** All changes logged with user, timestamp, old/new values; retained for at least 36 months
- **security:**
  - **access_control:** User access controlled at screen level via resource access control facility
  - **segregation_of_duties:** Freeze/unfreeze requires supervisor role; operator cannot self-approve
  - **field_level_auth:** View vs update permissions configurable per screen and per field
- **compliance:**
  - **popia_consent:** Personal information capture requires documented lawful basis; POPIA compliance required
  - **popia_breach_notification:** Unauthorized access or disclosure triggers regulator and data-subject notification per POPIA s.22
  - **sars_address:** Physical address fields must meet tax-authority requirements
  - **fatca_crs:** US-person and CRS-reportable status recorded on tax/legal maintenance screen
  - **kyc_verification:** Client account verification completed before trading is enabled
- **business:**
  - **account_types:** Client, agent, stock, allocation, nominee, trustee — each governs downstream processing
  - **controlled_accounts:** Controlled client credit balances swept nightly to broker trust account
  - **supplementary_names:** Copy contract notes and statements can be mailed to supplementary addresses
  - **shorty_codes:** Shorty name codes may be loaded for quick reference on trading screens
  - **freeze_blocks_trading:** Frozen accounts cannot have new deals allocated or financial entries processed

## Outcomes

### Create_new_client_account (Priority: 1) | Transaction: atomic

_Operator loads a new client account with required KYC fields_

**Given:**
- `account_type` (input) eq `client`
- `full_name` (input) exists
- `physical_address` (input) exists

**Then:**
- **create_record**
- **set_field** target: `account_status` value: `pending_verification`
- **emit_event** event: `account.created`

### Reject_duplicate_account (Priority: 2) — Error: `ACCOUNT_DUPLICATE`

_Prevent duplicate account codes within a broker firm_

**Given:**
- `account_code` (db) exists

**Then:**
- **emit_event** event: `account.created`

### Verify_and_activate_account (Priority: 3) | Transaction: atomic

_Supervisor verifies KYC documents and activates account for trading_

**Given:**
- `account_status` (db) eq `pending_verification`
- `kyc_documents_complete` (db) eq `true`

**Then:**
- **transition_state** field: `account_status` from: `pending_verification` to: `active`
- **emit_event** event: `account.activated`

### Freeze_account (Priority: 4) | Transaction: atomic

_Supervisor freezes an account with a documented reason_

**Given:**
- `user_role` (session) eq `account_supervisor`
- `freeze_reason` (input) exists

**Then:**
- **transition_state** field: `account_status` from: `active` to: `frozen`
- **emit_event** event: `account.frozen`

### Reject_operator_freeze (Priority: 5) — Error: `ACCOUNT_FREEZE_FORBIDDEN`

_Prevent non-supervisor users from freezing accounts_

**Given:**
- `user_role` (session) neq `account_supervisor`

**Then:**
- **emit_event** event: `account.frozen`

### Update_tax_legal_record (Priority: 6)

_Compliance officer records FATCA and CRS status_

**Given:**
- `user_role` (session) eq `compliance_officer`

**Then:**
- **set_field** target: `fatca_status` value: `updated`
- **set_field** target: `crs_reportable` value: `updated`
- **emit_event** event: `account.tax_status_changed`

### Block_deletion_with_history (Priority: 7) — Error: `ACCOUNT_DELETE_BLOCKED`

_Prevent deletion of accounts that hold historical activity_

**Given:**
- `has_historical_activity` (db) eq `true`

**Then:**
- **emit_event** event: `account.updated`

### Alpha_lookup (Priority: 8)

_Generic alpha look-up by partial name, optionally filtered by type/branch/partner_

**Given:**
- `search_term` (input) exists

**Then:**
- **call_service** target: `account_search_index`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCOUNT_DUPLICATE` | 409 | Account code already exists for this broker | No |
| `ACCOUNT_INVALID_ALPHA` | 400 | Alpha short name cannot be derived, please supply manually | No |
| `ACCOUNT_VERIFICATION_REQUIRED` | 409 | Account must be verified before activation | No |
| `ACCOUNT_DELETE_BLOCKED` | 409 | Account cannot be deleted, historical activity exists | No |
| `ACCOUNT_FREEZE_FORBIDDEN` | 403 | Only a supervisor role may freeze or unfreeze an account | No |
| `ACCOUNT_POPIA_VIOLATION` | 422 | Personal information capture failed POPIA lawful-basis check | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `account.created` |  | `account_code`, `account_type`, `broker_code`, `created_by`, `timestamp` |
| `account.activated` |  | `account_code`, `activated_by`, `timestamp` |
| `account.frozen` |  | `account_code`, `freeze_reason`, `frozen_by`, `timestamp` |
| `account.unfrozen` |  | `account_code`, `unfrozen_by`, `timestamp` |
| `account.deactivated` |  | `account_code`, `deactivated_by`, `timestamp` |
| `account.updated` |  | `account_code`, `field_name`, `old_value`, `new_value`, `updated_by`, `timestamp` |
| `account.tax_status_changed` |  | `account_code`, `fatca_status`, `crs_reportable`, `changed_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-data-upload | extends |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  ACALF: Account Code Generic Alpha Look-Up
  AHDIM: Account Trail of Changes
  RELAC: Account Relationship Links
  CLMNT: Client Account Maintenance
  ADMNT: Address Maintenance
  LTMNT: Legal and Tax Maintenance
  NAMNT: Supplementary Names and Addresses
  ARMNT: Account Relationships
  CLVER: Client Account Verification
  BLMNT: Balance Record Maintenance
  BNKAC: Bank Account Details
  FUACC: Freeze Unfreeze Accounts
  MEMNT: Memorandum Line Maintenance
  AGMNT: Agent Account Maintenance
  STMNT: Stock Account Maintenance
  SNMNT: Shorty Name Maintenance
  TRMNT: Transfer Instructions Maintenance
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Client Account Maintenance Blueprint",
  "description": "Internal back-office account maintenance for clients, agents, and stock accounts including alpha lookup, relationships, addresses, tax/legal records, freezes, a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, account-maintenance, clients, agents, stock-accounts, tax, kyc, popia"
}
</script>
