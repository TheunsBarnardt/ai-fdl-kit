---
title: "Invoicing Payments Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Invoicing and payment lifecycle: customer invoices, vendor bills, credit notes, receipts, payment registration, multi-currency, and follow-up. . 18 fields. 6 ou"
---

# Invoicing Payments Blueprint

> Invoicing and payment lifecycle: customer invoices, vendor bills, credit notes, receipts, payment registration, multi-currency, and follow-up.


| | |
|---|---|
| **Feature** | `invoicing-payments` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | invoicing, payments, billing, credit-notes, multi-currency, accounting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/payment/invoicing-payments.blueprint.yaml) |
| **JSON API** | [invoicing-payments.json]({{ site.baseurl }}/api/blueprints/payment/invoicing-payments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `accountant` | Accountant | human | Creates, validates, and posts invoices; registers payments |
| `customer` | Customer | human | Receives invoices, makes payments via portal or bank transfer |
| `vendor` | Vendor | human | Sends bills that are recorded and paid |
| `system` | Accounting System | system | Computes balances, reconciles payments, tracks due dates |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `move_type` | select | Yes | Document Type |  |
| `invoice_state` | select | Yes | State |  |
| `payment_state` | select | Yes | Payment State |  |
| `partner_id` | text | Yes | Customer/Vendor |  |
| `invoice_date` | date | Yes | Invoice Date |  |
| `invoice_date_due` | date | Yes | Due Date |  |
| `amount_untaxed` | number | Yes | Untaxed Amount |  |
| `amount_tax` | number | Yes | Tax Amount |  |
| `amount_total` | number | Yes | Total Amount |  |
| `amount_residual` | number | Yes | Amount Due |  |
| `currency_id` | text | Yes | Currency |  |
| `journal_id` | text | Yes | Journal |  |
| `payment_term_id` | text | No | Payment Terms |  |
| `fiscal_position_id` | text | No | Fiscal Position |  |
| `invoice_lines` | json | Yes | Invoice Lines |  |
| `payment_amount` | number | Yes | Payment Amount |  |
| `payment_method` | select | Yes | Payment Method |  |
| `payment_reference` | text | No | Payment Reference |  |

## States

**State field:** `invoice_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `posted` |  |  |
| `cancel` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `posted` | accountant | All required fields populated, amounts balanced |
|  | `posted` | `draft` | accountant | Must not be in a state requiring cancellation request |
|  | `draft,posted` | `cancel` | accountant |  |

## Rules

- **balanced_journal_entry:**
  - **description:** Total debits must equal total credits in every journal entry
- **draft_only_editable:**
  - **description:** Only draft invoices can be edited; posted invoices are locked
- **reset_clears_attachments:**
  - **description:** Resetting to draft removes generated PDFs and report attachments
- **payment_term_computes_due_date:**
  - **description:** Due date automatically calculated from invoice date and payment terms
- **fiscal_position_maps_taxes:**
  - **description:** Fiscal position automatically remaps tax lines based on customer jurisdiction
- **multi_currency_rate_at_date:**
  - **description:** Multi-currency invoices use the exchange rate at invoice date for conversion. Payment reconciliation computes exchange differences.

- **lock_date_prevents_posting:**
  - **description:** Cannot post entries dated before the company accounting lock date
- **sequence_numbering:**
  - **description:** Posted invoices receive a sequential number that cannot be reused

## Outcomes

### Invoice_posted (Priority: 1)

**Given:**
- accountant creates a draft invoice with lines
- all lines have valid accounts and amounts

**Then:**
- **transition_state** field: `invoice_state` from: `draft` to: `posted`
- **set_field** target: `invoice_number` — Sequential number assigned from journal sequence
- **emit_event** event: `account.invoice.posted`

**Result:** Invoice posted to accounting, number assigned, available on customer portal

### Posting_blocked_lock_date (Priority: 1) — Error: `INVOICE_BEFORE_LOCK_DATE`

**Given:**
- invoice date is before the company accounting lock date

**Then:**
- **notify** — Show lock date and prevent posting

**Result:** Invoice cannot be posted until date is after lock date

### Payment_registered (Priority: 2)

**Given:**
- invoice is posted with outstanding balance
- accountant registers a payment

**Then:**
- **create_record** target: `payment` — Payment record created and linked to invoice
- **set_field** target: `amount_residual` — Residual amount reduced by payment
- **set_field** target: `payment_state` — Updated to partial, in_payment, or paid based on remaining balance
- **emit_event** event: `account.payment.registered`

**Result:** Payment recorded, invoice balance updated accordingly

### Invoice_fully_paid (Priority: 3)

**Given:**
- total payments match or exceed invoice amount

**Then:**
- **set_field** target: `payment_state` value: `paid`
- **emit_event** event: `account.invoice.paid`

**Result:** Invoice marked as fully paid, no remaining balance

### Credit_note_created (Priority: 4)

**Given:**
- accountant reverses a posted invoice

**Then:**
- **create_record** target: `credit_note` — Credit note (out_refund or in_refund) created referencing original
- **emit_event** event: `account.credit_note.created`

**Result:** Credit note created and optionally reconciled against original invoice

### Payment_link_sent (Priority: 5)

**Given:**
- invoice is posted with outstanding balance
- accountant generates a payment link

**Then:**
- **emit_event** event: `account.payment_link.sent`

**Result:** Customer receives link to pay online via portal

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVOICE_BEFORE_LOCK_DATE` | 400 | Cannot post an entry dated before the accounting lock date. | No |
| `INVOICE_UNBALANCED` | 400 | The journal entry is not balanced. Debits must equal credits. | No |
| `INVOICE_NO_LINES` | 400 | Cannot post an invoice with no lines. | No |
| `INVOICE_ALREADY_POSTED` | 403 | This invoice has already been posted and cannot be edited. | No |
| `PAYMENT_EXCEEDS_BALANCE` | 400 | Payment amount exceeds the remaining balance on this invoice. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `account.invoice.posted` | Invoice validated and posted to the ledger | `invoice_id`, `move_type`, `partner_id`, `amount_total` |
| `account.invoice.paid` | Invoice fully paid | `invoice_id`, `partner_id`, `amount_total` |
| `account.payment.registered` | Payment recorded against an invoice | `payment_id`, `invoice_id`, `amount`, `payment_method` |
| `account.credit_note.created` | Credit note created to reverse an invoice | `credit_note_id`, `original_invoice_id`, `amount` |
| `account.payment_link.sent` | Payment link generated and sent to customer | `invoice_id`, `payment_link_url`, `partner_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| tax-engine | required | Tax computation on every invoice line |
| bank-reconciliation | required | Bank statement lines reconciled against invoice payments |
| quotation-order-management | optional | Invoices generated from confirmed sales orders |
| pos-core | optional | POS session closing generates accounting entries |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 40
  entry_points:
    - addons/account/models/account_move.py
    - addons/account/models/account_payment.py
    - addons/account_payment/models/account_payment.py
    - addons/account/models/account_move_line.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Invoicing Payments Blueprint",
  "description": "Invoicing and payment lifecycle: customer invoices, vendor bills, credit notes, receipts, payment registration, multi-currency, and follow-up.\n. 18 fields. 6 ou",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "invoicing, payments, billing, credit-notes, multi-currency, accounting"
}
</script>
