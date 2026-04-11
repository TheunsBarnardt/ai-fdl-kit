<!-- AUTO-GENERATED FROM bank-reconciliation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bank Reconciliation

> Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management.

**Category:** Data · **Version:** 1.0.0 · **Tags:** bank-reconciliation · statement-import · matching · accounting · write-off

## What this does

Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **statement_name** *(text, required)* — Statement Reference
- **statement_date** *(date, required)* — Statement Date
- **journal_id** *(text, required)* — Bank Journal
- **balance_start** *(number, required)* — Starting Balance
- **balance_end** *(number, required)* — Ending Balance
- **balance_end_real** *(number, optional)* — Bank-Reported Ending Balance
- **is_complete** *(boolean, optional)* — Statement Complete
- **is_valid** *(boolean, optional)* — Statement Valid
- **line_amount** *(number, required)* — Amount
- **line_date** *(date, required)* — Transaction Date
- **payment_ref** *(text, optional)* — Payment Reference
- **partner_id** *(text, optional)* — Partner
- **transaction_type** *(text, optional)* — Transaction Type
- **is_reconciled** *(boolean, optional)* — Reconciled
- **amount_residual** *(number, optional)* — Residual Amount
- **model_name** *(text, required)* — Model Name
- **model_trigger** *(select, required)* — Trigger Type
- **match_journal_ids** *(json, optional)* — Journal Filter
- **match_amount_type** *(select, optional)* — Amount Condition
- **match_label_pattern** *(text, optional)* — Label Pattern
- **model_line_amount_type** *(select, required)* — Write-off Amount Type

## What must be true

- **statement_continuity:** A statement is valid only if its starting balance matches the ending balance of the previous statement for the same journal. The first statement is always valid.
- **completeness_check:** A statement is complete when the computed ending balance (start + posted lines) matches the bank-reported ending balance.
- **currency_aware_matching:** Reconciliation uses currency-specific zero-check for residual amounts. A line is reconciled when residual is zero within the currency's rounding precision.
- **multi_currency_rate_conversion:** When statement currency differs from journal or company currency, amounts are converted using the bank's implied rate for that transaction, not the system's daily rate.
- **auto_model_conditions:** Auto-reconciliation models only apply when ALL conditions match: journal filter, amount range, label pattern, and partner filter.
- **partial_then_full:** Reconciliation proceeds as partial matches first. When all partial matches for a set of lines zero out, they are grouped into a full reconciliation for reporting.
- **exchange_difference_generated:** When reconciling multi-currency entries, exchange rate differences are automatically recorded as separate journal entries.

## Success & failure scenarios

**✅ Success paths**

- **Statement Imported** — when accountant imports a bank statement file (CSV, OFX, CAMT, etc.), then Statement lines ready for matching and reconciliation.
- **Line Auto Reconciled** — when a reconciliation model with auto trigger exists; statement line matches all model conditions (amount, label, partner), then Statement line automatically matched and reconciled.
- **Line Manually Matched** — when accountant selects a statement line; accountant matches it to one or more open journal entries, then Statement line partially or fully reconciled with existing entries.
- **Full Reconciliation Achieved** — when all partial reconciliations for a set of entries zero out, then Entries fully reconciled and marked for reporting.
- **Write Off Created** — when statement line amount does not exactly match any open entry; accountant applies a reconciliation model to write off the difference, then Difference written off and line fully reconciled.
- **Exchange Difference Recorded** — when multi-currency reconciliation creates a rate difference, then Exchange difference posted to gain/loss account.
- **Reconciliation Undone** — when accountant undoes a reconciliation on a statement line, then Line returned to unreconciled state.

**❌ Failure paths**

- **Statement Invalid** — when statement starting balance does not match previous statement ending balance, then Statement flagged as invalid for accountant review. *(error: `BANK_STATEMENT_INVALID`)*

## Errors it can return

- `BANK_STATEMENT_INVALID` — Starting balance does not match the previous statement's ending balance.
- `BANK_STATEMENT_INCOMPLETE` — Computed ending balance does not match the bank-reported balance.
- `BANK_LINE_ALREADY_RECONCILED` — This statement line is already fully reconciled.
- `BANK_CURRENCY_MISMATCH` — Foreign currency amount required when transaction currency differs from journal currency.

## Connects to

- **invoicing-payments** *(required)* — Statement lines reconciled against invoice payment entries
- **tax-engine** *(optional)* — Cash-basis tax entries triggered by payment reconciliation

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/bank-reconciliation/) · **Spec source:** [`bank-reconciliation.blueprint.yaml`](./bank-reconciliation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
