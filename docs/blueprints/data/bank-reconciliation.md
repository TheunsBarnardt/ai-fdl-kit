---
title: "Bank Reconciliation Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management. . 21 fields. 8 outcomes"
---

# Bank Reconciliation Blueprint

> Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management.


| | |
|---|---|
| **Feature** | `bank-reconciliation` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | bank-reconciliation, statement-import, matching, accounting, write-off |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/bank-reconciliation.blueprint.yaml) |
| **JSON API** | [bank-reconciliation.json]({{ site.baseurl }}/api/blueprints/data/bank-reconciliation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `accountant` | Accountant | human | Imports statements, reviews matches, resolves discrepancies |
| `system` | Reconciliation Engine | system | Auto-matches statement lines, applies reconciliation models |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `statement_name` | text | Yes | Statement Reference |  |
| `statement_date` | date | Yes | Statement Date |  |
| `journal_id` | text | Yes | Bank Journal |  |
| `balance_start` | number | Yes | Starting Balance |  |
| `balance_end` | number | Yes | Ending Balance |  |
| `balance_end_real` | number | No | Bank-Reported Ending Balance |  |
| `is_complete` | boolean | No | Statement Complete |  |
| `is_valid` | boolean | No | Statement Valid |  |
| `line_amount` | number | Yes | Amount |  |
| `line_date` | date | Yes | Transaction Date |  |
| `payment_ref` | text | No | Payment Reference |  |
| `partner_id` | text | No | Partner |  |
| `transaction_type` | text | No | Transaction Type |  |
| `is_reconciled` | boolean | No | Reconciled |  |
| `amount_residual` | number | No | Residual Amount |  |
| `model_name` | text | Yes | Model Name |  |
| `model_trigger` | select | Yes | Trigger Type |  |
| `match_journal_ids` | json | No | Journal Filter |  |
| `match_amount_type` | select | No | Amount Condition |  |
| `match_label_pattern` | text | No | Label Pattern |  |
| `model_line_amount_type` | select | Yes | Write-off Amount Type |  |

## Rules

- **statement_continuity:**
  - **description:** A statement is valid only if its starting balance matches the ending balance of the previous statement for the same journal. The first statement is always valid.

- **completeness_check:**
  - **description:** A statement is complete when the computed ending balance (start + posted lines) matches the bank-reported ending balance.

- **currency_aware_matching:**
  - **description:** Reconciliation uses currency-specific zero-check for residual amounts. A line is reconciled when residual is zero within the currency's rounding precision.

- **multi_currency_rate_conversion:**
  - **description:** When statement currency differs from journal or company currency, amounts are converted using the bank's implied rate for that transaction, not the system's daily rate.

- **auto_model_conditions:**
  - **description:** Auto-reconciliation models only apply when ALL conditions match: journal filter, amount range, label pattern, and partner filter.

- **partial_then_full:**
  - **description:** Reconciliation proceeds as partial matches first. When all partial matches for a set of lines zero out, they are grouped into a full reconciliation for reporting.

- **exchange_difference_generated:**
  - **description:** When reconciling multi-currency entries, exchange rate differences are automatically recorded as separate journal entries.


## Outcomes

### Statement_imported (Priority: 1)

**Given:**
- accountant imports a bank statement file (CSV, OFX, CAMT, etc.)

**Then:**
- **create_record** target: `bank_statement` — Statement created with header data (date, balances)
- **create_record** target: `statement_lines` — Individual transaction lines created from import data
- **emit_event** event: `bank.statement.imported`

**Result:** Statement lines ready for matching and reconciliation

### Statement_invalid (Priority: 1) — Error: `BANK_STATEMENT_INVALID`

**Given:**
- statement starting balance does not match previous statement ending balance

**Then:**
- **set_field** target: `is_valid` value: `false`

**Result:** Statement flagged as invalid for accountant review

### Line_auto_reconciled (Priority: 2)

**Given:**
- a reconciliation model with auto trigger exists
- statement line matches all model conditions (amount, label, partner)

**Then:**
- **create_record** target: `journal_entry` — Counterpart journal entries created per model rules
- **set_field** target: `is_reconciled` value: `true`
- **emit_event** event: `bank.line.auto_reconciled`

**Result:** Statement line automatically matched and reconciled

### Line_manually_matched (Priority: 3)

**Given:**
- accountant selects a statement line
- accountant matches it to one or more open journal entries

**Then:**
- **create_record** target: `partial_reconcile` — Partial reconciliation linking statement line to journal entries
- **set_field** target: `amount_residual` — Residual amount reduced by matched amount
- **emit_event** event: `bank.line.manually_reconciled`

**Result:** Statement line partially or fully reconciled with existing entries

### Full_reconciliation_achieved (Priority: 4)

**Given:**
- all partial reconciliations for a set of entries zero out

**Then:**
- **create_record** target: `full_reconcile` — Full reconciliation record groups all related partial matches
- **emit_event** event: `bank.reconciliation.complete`

**Result:** Entries fully reconciled and marked for reporting

### Write_off_created (Priority: 5)

**Given:**
- statement line amount does not exactly match any open entry
- accountant applies a reconciliation model to write off the difference

**Then:**
- **create_record** target: `write_off_entry` — Journal entry for the difference amount posted to configured account
- **set_field** target: `is_reconciled` value: `true`

**Result:** Difference written off and line fully reconciled

### Exchange_difference_recorded (Priority: 6)

**Given:**
- multi-currency reconciliation creates a rate difference

**Then:**
- **create_record** target: `exchange_diff_entry` — Automatic journal entry recording the exchange rate gain or loss

**Result:** Exchange difference posted to gain/loss account

### Reconciliation_undone (Priority: 7)

**Given:**
- accountant undoes a reconciliation on a statement line

**Then:**
- **delete_record** target: `partial_reconcile` — Partial reconciliation records removed
- **set_field** target: `is_reconciled` value: `false`
- **set_field** target: `amount_residual` — Residual amount restored

**Result:** Line returned to unreconciled state

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BANK_STATEMENT_INVALID` | 400 | Starting balance does not match the previous statement's ending balance. | No |
| `BANK_STATEMENT_INCOMPLETE` | 400 | Computed ending balance does not match the bank-reported balance. | No |
| `BANK_LINE_ALREADY_RECONCILED` | 400 | This statement line is already fully reconciled. | No |
| `BANK_CURRENCY_MISMATCH` | 400 | Foreign currency amount required when transaction currency differs from journal currency. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bank.statement.imported` | Bank statement imported from file | `statement_id`, `journal_id`, `line_count`, `balance_start`, `balance_end` |
| `bank.line.auto_reconciled` | Statement line automatically matched by reconciliation model | `line_id`, `model_id`, `matched_entries` |
| `bank.line.manually_reconciled` | Statement line manually matched by accountant | `line_id`, `matched_entry_ids`, `remaining_residual` |
| `bank.reconciliation.complete` | Full reconciliation achieved for a set of entries | `full_reconcile_id`, `line_ids` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| invoicing-payments | required | Statement lines reconciled against invoice payment entries |
| tax-engine | optional | Cash-basis tax entries triggered by payment reconciliation |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: ERP system
  tech_stack: Python + JavaScript/OWL
  files_traced: 20
  entry_points:
    - addons/account/models/account_bank_statement.py
    - addons/account/models/account_bank_statement_line.py
    - addons/account/models/account_reconcile_model.py
    - addons/account/models/account_partial_reconcile.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bank Reconciliation Blueprint",
  "description": "Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management.\n. 21 fields. 8 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bank-reconciliation, statement-import, matching, accounting, write-off"
}
</script>
