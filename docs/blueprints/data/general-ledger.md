---
title: "General Ledger Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting. 18 fi"
---

# General Ledger Blueprint

> Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting

| | |
|---|---|
| **Feature** | `general-ledger` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | accounting, general-ledger, chart-of-accounts, double-entry, erp, cost-center |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/general-ledger.blueprint.yaml) |
| **JSON API** | [general-ledger.json]({{ site.baseurl }}/api/blueprints/data/general-ledger.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_name` | text | Yes | Account Name | Validations: minLength, maxLength |
| `account_number` | text | No | Account Number | Validations: pattern |
| `parent_account` | text | No | Parent Account |  |
| `is_group` | boolean | Yes | Is Group |  |
| `account_type` | select | No | Account Type |  |
| `root_type` | select | Yes | Root Type |  |
| `account_currency` | text | Yes | Account Currency | Validations: pattern |
| `disabled` | boolean | No | Disabled |  |
| `freeze_account` | boolean | No | Freeze Account |  |
| `account` | text | Yes | Account |  |
| `debit` | number | Yes | Debit | Validations: min |
| `credit` | number | Yes | Credit | Validations: min |
| `posting_date` | date | Yes | Posting Date |  |
| `voucher_type` | text | Yes | Voucher Type |  |
| `voucher_no` | text | Yes | Voucher No |  |
| `party_type` | select | No | Party Type |  |
| `party` | text | No | Party |  |
| `cost_center` | text | No | Cost Center |  |

## Rules

- **hierarchical_chart:**
  - **description:** Chart of accounts is hierarchical. Accounts are organized in a nested tree structure with group and leaf nodes. Group accounts cannot have direct GL entries.

- **balanced_entries:**
  - **description:** Total debit must equal total credit for every GL entry set (voucher). Unbalanced entries are rejected.

- **cost_center_required:**
  - **description:** Profit and Loss accounts (Income and Expense root types) require a cost center to be specified for dimensional reporting.

- **party_required:**
  - **description:** Receivable and Payable account types require party_type and party to be specified for sub-ledger tracking.

- **frozen_account_protection:**
  - **description:** Frozen accounts block all debit and credit modifications unless the user has freeze override permission.

- **period_closing:**
  - **description:** Closed accounting periods block GL posting. No entries are allowed in a closed period.

- **disabled_account:**
  - **description:** Disabled accounts cannot be used in new transactions.

- **account_deletion:**
  - **description:** Deleting an account is only allowed when it has zero GL entries.


## Outcomes

### Create_account (Priority: 10)

**Given:**
- `account_name` exists
- `root_type` in `asset,liability,income,expense,equity`

**Then:**
- **create_record** target: `chart_of_accounts` — Create new account in the chart of accounts hierarchy
- **emit_event** event: `account.created`

**Result:** New account is created in the chart of accounts under the specified parent

### Post_gl_entry (Priority: 11) — Error: `GL_BALANCE_MISMATCH` | Transaction: atomic

**Given:**
- `account` exists
- account is not frozen and not disabled
- posting date falls within an open accounting period

**Then:**
- **create_record** target: `gl_entries` — Create debit and credit GL entry rows ensuring total debit equals total credit
- **emit_event** event: `gl.entry_posted`

**Result:** GL entries are posted with balanced debit and credit totals

### Reverse_gl_entries (Priority: 12) | Transaction: atomic

**Given:**
- `voucher_no` exists
- original GL entries exist for the specified voucher

**Then:**
- **create_record** target: `gl_entries` — Create reversal entries swapping debit and credit amounts
- **emit_event** event: `gl.entry_reversed`

**Result:** Original GL entries are reversed with offsetting debit and credit entries

### Create_journal_entry (Priority: 13) — Error: `GL_BALANCE_MISMATCH` | Transaction: atomic

**Given:**
- at least two account lines are provided
- total debit equals total credit across all lines
- all referenced accounts are active and not frozen

**Then:**
- **create_record** target: `journal_entry` — Create journal entry with multiple debit and credit lines
- **create_record** target: `gl_entries` — Post GL entries for each journal entry line
- **emit_event** event: `gl.entry_posted`

**Result:** Journal entry is created and GL entries are posted for all account lines

### Freeze_account (Priority: 14)

**Given:**
- `account_name` exists
- user has account freeze permission

**Then:**
- **set_field** target: `freeze_account` — Account freeze flag set to true
- **emit_event** event: `account.frozen`

**Result:** Account is frozen and no further GL entries can be posted to it without override permission

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GL_BALANCE_MISMATCH` | 400 | Total debit does not equal total credit for this entry. | No |
| `GL_ACCOUNT_FROZEN` | 403 | Cannot post to a frozen account without freeze override permission. | No |
| `GL_PERIOD_CLOSED` | 403 | Cannot post GL entries in a closed accounting period. | No |
| `GL_COST_CENTER_REQUIRED` | 400 | Cost center is required for profit and loss accounts. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `gl.entry_posted` | GL entries are created for a voucher | `voucher_type`, `voucher_no`, `account`, `debit`, `credit`, `posting_date` |
| `gl.entry_reversed` | GL entries for a voucher are reversed | `voucher_type`, `voucher_no`, `reversal_voucher_no` |
| `account.created` | New account is added to the chart of accounts | `account_name`, `account_number`, `root_type`, `parent_account` |
| `account.frozen` | Account is frozen to prevent further postings | `account_name`, `account_number`, `frozen_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-purchase-invoicing | required | Invoice submission posts GL entries |
| payment-processing | required | Payment submission posts GL entries |

## AGI Readiness

### Goals

#### Reliable General Ledger

Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `sales_purchase_invoicing` | sales-purchase-invoicing | degrade |
| `payment_processing` | payment-processing | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_account | `supervised` | - | - |
| post_gl_entry | `autonomous` | - | - |
| reverse_gl_entries | `autonomous` | - | - |
| create_journal_entry | `supervised` | - | - |
| freeze_account | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python, Frappe Framework, MariaDB/PostgreSQL
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "General Ledger Blueprint",
  "description": "Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting. 18 fi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "accounting, general-ledger, chart-of-accounts, double-entry, erp, cost-center"
}
</script>
