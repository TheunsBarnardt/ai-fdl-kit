---
title: "Sales Purchase Invoicing Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement. 13 fields. 5 outcom"
---

# Sales Purchase Invoicing Blueprint

> Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement

| | |
|---|---|
| **Feature** | `sales-purchase-invoicing` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | accounting, invoicing, sales, purchase, erp, double-entry, returns, credit-limit |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/sales-purchase-invoicing.blueprint.yaml) |
| **JSON API** | [sales-purchase-invoicing.json]({{ site.baseurl }}/api/blueprints/payment/sales-purchase-invoicing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `accounts_user` | Accounts User | human | Creates and submits invoices |
| `accounts_manager` | Accounts Manager | human | Approves credit limit overrides and cancellations |
| `accounting_system` | Accounting System | system | Posts GL entries and tracks outstanding balances |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `invoice_type` | select | Yes |  |  |
| `customer_or_supplier` | text | Yes |  | Validations: minLength |
| `posting_date` | date | Yes |  |  |
| `items` | json | Yes |  |  |
| `currency` | text | Yes |  | Validations: pattern |
| `conversion_rate` | number | Yes |  | Validations: min |
| `taxes` | json | No |  |  |
| `grand_total` | number | Yes |  | Validations: min |
| `outstanding_amount` | number | Yes |  | Validations: min |
| `status` | select | Yes |  |  |
| `is_return` | boolean | No |  |  |
| `return_against` | text | No |  |  |
| `payment_terms` | json | No |  |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `paid` |  | Yes |
| `partly_paid` |  |  |
| `overdue` |  |  |
| `return` |  | Yes |
| `credit_note_issued` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` | accounts_user |  |
|  | `submitted` | `paid` | accounting_system | outstanding_amount == 0 |
|  | `submitted` | `partly_paid` | accounting_system | outstanding_amount > 0 and outstanding_amount < grand_total |
|  | `submitted` | `overdue` | accounting_system |  |
|  | `partly_paid` | `paid` | accounting_system | outstanding_amount == 0 |
|  | `partly_paid` | `overdue` | accounting_system |  |
|  | `submitted` | `return` | accounts_user |  |
|  | `submitted` | `credit_note_issued` | accounts_user |  |
|  | `draft` | `cancelled` | accounts_user |  |
|  | `submitted` | `cancelled` | accounts_manager |  |

## Rules

- **double_entry_posting:**
  - **description:** Double-entry GL entries are created automatically on invoice submission. Every debit has a matching credit entry in the general ledger.

- **outstanding_calculation:**
  - **description:** Outstanding amount is calculated as grand total minus total payments minus write-off amounts. Updated automatically when payments are received.

- **return_reference:**
  - **description:** Return invoices must reference the original invoice via the return_against field. Return quantity cannot exceed the original invoiced quantity.

- **warehouse_requirement:**
  - **description:** Stock items require a warehouse to be specified in each line item. Non-stock items and service items are exempt.

- **credit_limit_check:**
  - **description:** Credit limit is checked on sales invoice submission. If the customer outstanding plus this invoice exceeds the credit limit, submission is blocked unless overridden by an accounts manager.

- **tax_computation:**
  - **description:** Tax amounts are computed per the tax template and applied row-by-row with cumulative or row-total methods.

- **currency_conversion:**
  - **description:** Conversion rate must be fetched for the posting date when the invoice currency differs from the company currency.

- **cancellation_reversal:**
  - **description:** Cancelled invoices reverse all GL entries and update outstanding amounts on linked documents.

- **overdue_detection:**
  - **description:** Overdue status is set automatically when the due date passes with an outstanding balance remaining.


## Outcomes

### Credit_limit_exceeded (Priority: 1) — Error: `INVOICE_CREDIT_EXCEEDED`

**Given:**
- invoice type is Sales Invoice
- `grand_total` gt `0`
- customer total outstanding plus this invoice exceeds credit limit

**Then:**
- **notify** — Inform user that credit limit would be exceeded

**Result:** Invoice submission is blocked due to credit limit breach

### Submit_invoice | Transaction: atomic

**Given:**
- invoice is in Draft status
- all required fields are populated
- `items` exists

**Then:**
- **transition_state** field: `status` from: `draft` to: `submitted`
- **emit_event** event: `invoice.submitted`
- **create_record** target: `gl_entries` — Create double-entry GL postings for each line and tax row

**Result:** Invoice is submitted with GL entries posted and outstanding amount set to grand total

### Receive_payment

**Given:**
- invoice is in Submitted or Partly Paid status
- `outstanding_amount` gt `0`

**Then:**
- **set_field** target: `outstanding_amount` — Recalculated as grand_total minus total_paid minus total_write_off
- **emit_event** event: `invoice.paid` when: `outstanding_amount == 0`

**Result:** Outstanding amount is reduced and status transitions to Paid or Partly Paid accordingly

### Create_return — Error: `INVOICE_RETURN_QTY_EXCEEDED`

**Given:**
- original invoice is in Submitted or Paid status
- `is_return` eq `true`
- `return_against` exists

**Then:**
- **create_record** target: `return_invoice` — Create return invoice with negative quantities
- **emit_event** event: `invoice.return_created`

**Result:** Return invoice is created, reversing GL entries and adjusting outstanding on original invoice

### Cancel_invoice — Error: `INVOICE_ALREADY_CANCELLED`

**Given:**
- invoice is in Draft or Submitted status
- no payments have been allocated against this invoice

**Then:**
- **transition_state** field: `status` from: `submitted` to: `cancelled`
- **emit_event** event: `invoice.cancelled`
- **create_record** target: `gl_entries` — Reverse all GL entries for this invoice

**Result:** Invoice is cancelled with all GL entries reversed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVOICE_WAREHOUSE_REQUIRED` | 400 | Warehouse is required for stock items in invoice line items. | No |
| `INVOICE_CREDIT_EXCEEDED` | 403 | Customer credit limit would be exceeded by this invoice. | No |
| `INVOICE_RETURN_QTY_EXCEEDED` | 400 | Return quantity exceeds the quantity available on the original invoice. | No |
| `INVOICE_ALREADY_CANCELLED` | 409 | This invoice has already been cancelled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `invoice.submitted` | Invoice transitions from Draft to Submitted with GL entries posted | `invoice_id`, `invoice_type`, `customer_or_supplier`, `grand_total`, `posting_date` |
| `invoice.paid` | Outstanding amount reaches zero after payment allocation | `invoice_id`, `paid_amount`, `outstanding_amount` |
| `invoice.overdue` | Due date passes with outstanding balance remaining | `invoice_id`, `customer_or_supplier`, `outstanding_amount`, `due_date` |
| `invoice.cancelled` | Invoice is cancelled and GL entries reversed | `invoice_id`, `invoice_type`, `grand_total` |
| `invoice.return_created` | Return invoice is created against an original | `invoice_id`, `return_invoice_id`, `return_amount` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payment-processing | required | Payments must be allocated against invoices to clear outstanding balances |
| general-ledger | required | Invoice submission creates double-entry GL postings |
| tax-engine | required | Tax calculation is applied to invoice line items |
| sales-order-lifecycle | recommended | Sales invoices are often created from sales orders |

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
  "name": "Sales Purchase Invoicing Blueprint",
  "description": "Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement. 13 fields. 5 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "accounting, invoicing, sales, purchase, erp, double-entry, returns, credit-limit"
}
</script>
