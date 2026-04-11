<!-- AUTO-GENERATED FROM sales-purchase-invoicing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sales Purchase Invoicing

> Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement

**Category:** Payment · **Version:** 1.0.0 · **Tags:** accounting · invoicing · sales · purchase · erp · double-entry · returns · credit-limit

## What this does

Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **invoice_type** *(select, required)*
- **customer_or_supplier** *(text, required)*
- **posting_date** *(date, required)*
- **items** *(json, required)*
- **currency** *(text, required)*
- **conversion_rate** *(number, required)*
- **taxes** *(json, optional)*
- **grand_total** *(number, required)*
- **outstanding_amount** *(number, required)*
- **status** *(select, required)*
- **is_return** *(boolean, optional)*
- **return_against** *(text, optional)*
- **payment_terms** *(json, optional)*

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

## Connects to

- **payment-processing** *(required)* — Payments must be allocated against invoices to clear outstanding balances
- **general-ledger** *(required)* — Invoice submission creates double-entry GL postings
- **tax-engine** *(required)* — Tax calculation is applied to invoice line items
- **sales-order-lifecycle** *(recommended)* — Sales invoices are often created from sales orders

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/sales-purchase-invoicing/) · **Spec source:** [`sales-purchase-invoicing.blueprint.yaml`](./sales-purchase-invoicing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
