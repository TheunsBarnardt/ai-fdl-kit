<!-- AUTO-GENERATED FROM sales-purchase-invoicing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sales Purchase Invoicing

> Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement

**Category:** Payment · **Version:** 1.0.0 · **Tags:** accounting · invoicing · sales · purchase · erp · double-entry · returns · credit-limit

## What this does

Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **invoice_type** *(select, required)* — Invoice Type
- **customer_or_supplier** *(text, required)* — Customer Or Supplier
- **posting_date** *(date, required)* — Posting Date
- **items** *(json, required)* — Items
- **currency** *(text, required)* — Currency
- **conversion_rate** *(number, required)* — Conversion Rate
- **taxes** *(json, optional)* — Taxes
- **grand_total** *(number, required)* — Grand Total
- **outstanding_amount** *(number, required)* — Outstanding Amount
- **status** *(select, required)* — Status
- **is_return** *(boolean, optional)* — Is Return
- **return_against** *(text, optional)* — Return Against
- **payment_terms** *(json, optional)* — Payment Terms

## What must be true

- **double_entry_posting:** Double-entry GL entries are created automatically on invoice submission. Every debit has a matching credit entry in the general ledger.
- **outstanding_calculation:** Outstanding amount is calculated as grand total minus total payments minus write-off amounts. Updated automatically when payments are received.
- **return_reference:** Return invoices must reference the original invoice via the return_against field. Return quantity cannot exceed the original invoiced quantity.
- **warehouse_requirement:** Stock items require a warehouse to be specified in each line item. Non-stock items and service items are exempt.
- **credit_limit_check:** Credit limit is checked on sales invoice submission. If the customer outstanding plus this invoice exceeds the credit limit, submission is blocked unless overridden by an accounts manager.
- **tax_computation:** Tax amounts are computed per the tax template and applied row-by-row with cumulative or row-total methods.
- **currency_conversion:** Conversion rate must be fetched for the posting date when the invoice currency differs from the company currency.
- **cancellation_reversal:** Cancelled invoices reverse all GL entries and update outstanding amounts on linked documents.
- **overdue_detection:** Overdue status is set automatically when the due date passes with an outstanding balance remaining.

## Success & failure scenarios

**✅ Success paths**

- **Submit Invoice** — when invoice is in Draft status; all required fields are populated; At least one line item is present, then Invoice is submitted with GL entries posted and outstanding amount set to grand total.
- **Receive Payment** — when invoice is in Submitted or Partly Paid status; Invoice has remaining balance, then Outstanding amount is reduced and status transitions to Paid or Partly Paid accordingly.

**❌ Failure paths**

- **Credit Limit Exceeded** — when invoice type is Sales Invoice; grand_total gt 0; customer total outstanding plus this invoice exceeds credit limit, then Invoice submission is blocked due to credit limit breach. *(error: `INVOICE_CREDIT_EXCEEDED`)*
- **Create Return** — when original invoice is in Submitted or Paid status; Invoice is flagged as a return; Original invoice reference is provided, then Return invoice is created, reversing GL entries and adjusting outstanding on original invoice. *(error: `INVOICE_RETURN_QTY_EXCEEDED`)*
- **Cancel Invoice** — when invoice is in Draft or Submitted status; no payments have been allocated against this invoice, then Invoice is cancelled with all GL entries reversed. *(error: `INVOICE_ALREADY_CANCELLED`)*

## Errors it can return

- `INVOICE_WAREHOUSE_REQUIRED` — Warehouse is required for stock items in invoice line items.
- `INVOICE_CREDIT_EXCEEDED` — Customer credit limit would be exceeded by this invoice.
- `INVOICE_RETURN_QTY_EXCEEDED` — Return quantity exceeds the quantity available on the original invoice.
- `INVOICE_ALREADY_CANCELLED` — This invoice has already been cancelled.

## Events

**`invoice.submitted`** — Invoice transitions from Draft to Submitted with GL entries posted
  Payload: `invoice_id`, `invoice_type`, `customer_or_supplier`, `grand_total`, `posting_date`

**`invoice.paid`** — Outstanding amount reaches zero after payment allocation
  Payload: `invoice_id`, `paid_amount`, `outstanding_amount`

**`invoice.overdue`** — Due date passes with outstanding balance remaining
  Payload: `invoice_id`, `customer_or_supplier`, `outstanding_amount`, `due_date`

**`invoice.cancelled`** — Invoice is cancelled and GL entries reversed
  Payload: `invoice_id`, `invoice_type`, `grand_total`

**`invoice.return_created`** — Return invoice is created against an original
  Payload: `invoice_id`, `return_invoice_id`, `return_amount`

## Connects to

- **payment-processing** *(required)* — Payments must be allocated against invoices to clear outstanding balances
- **general-ledger** *(required)* — Invoice submission creates double-entry GL postings
- **tax-engine** *(required)* — Tax calculation is applied to invoice line items
- **sales-order-lifecycle** *(recommended)* — Sales invoices are often created from sales orders

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 13 fields
- `T4` **sequential-priority** — added priority to 4 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/sales-purchase-invoicing/) · **Spec source:** [`sales-purchase-invoicing.blueprint.yaml`](./sales-purchase-invoicing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
