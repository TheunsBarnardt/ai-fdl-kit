---
title: "Quotation Order Management Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Sales quotation-to-order lifecycle including quote creation, PDF generation, portal sharing, digital signature, prepayment, order confirmation, and invoicing. ."
---

# Quotation Order Management Blueprint

> Sales quotation-to-order lifecycle including quote creation, PDF generation, portal sharing, digital signature, prepayment, order confirmation, and invoicing.


| | |
|---|---|
| **Feature** | `quotation-order-management` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | sales, quotation, order-management, invoicing, pdf-builder |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/quotation-order-management.blueprint.yaml) |
| **JSON API** | [quotation-order-management.json]({{ site.baseurl }}/api/blueprints/workflow/quotation-order-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `salesperson` | Salesperson | human | Creates quotes, negotiates with customer, confirms orders |
| `customer` | Customer | human | Reviews quotes, signs, pays, and receives goods/services |
| `sales_manager` | Sales Manager | human | Reviews pipeline, manages team targets, handles overrides |
| `system` | System | system | Computes prices, generates PDFs, sends emails, tracks expiry |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_state` | select | Yes | Order State |  |
| `partner_id` | text | Yes | Customer |  |
| `order_lines` | json | Yes | Order Lines |  |
| `amount_untaxed` | number | Yes | Untaxed Amount |  |
| `amount_tax` | number | Yes | Tax Amount |  |
| `amount_total` | number | Yes | Total Amount |  |
| `validity_date` | date | No | Expiration Date |  |
| `date_order` | datetime | Yes | Order Date |  |
| `commitment_date` | datetime | No | Delivery Date |  |
| `pricelist_id` | text | No | Pricelist |  |
| `payment_term_id` | text | No | Payment Terms |  |
| `invoice_status` | select | No | Invoice Status |  |
| `require_signature` | boolean | No | Require Signature |  |
| `require_payment` | boolean | No | Require Prepayment |  |
| `prepayment_percent` | number | No | Prepayment Percentage | Validations: min, max |
| `signed_by` | text | No | Signed By |  |
| `signed_on` | datetime | No | Signed On |  |
| `is_locked` | boolean | No | Locked |  |
| `product_id` | text | Yes | Product |  |
| `product_uom_qty` | number | Yes | Quantity |  |
| `price_unit` | number | Yes | Unit Price |  |
| `discount` | number | No | Discount % |  |
| `display_type` | select | No | Line Type |  |
| `is_downpayment` | boolean | No | Is Down Payment |  |

## States

**State field:** `order_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `sent` |  |  |
| `sale` |  |  |
| `cancel` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `sent` | salesperson |  |
|  | `draft,sent` | `sale` | salesperson | All product lines must have a valid product and unit of measure. If prepayment is required, payment must be received.  |
|  | `draft,sent,sale` | `cancel` | salesperson | Order must not be locked |
|  | `cancel` | `draft` | salesperson |  |

## Rules

- **confirmation_requires_valid_lines:**
  - **description:** Each product line must have a product and unit of measure assigned. Section, subsection, note, and downpayment lines are exempt.

- **prepayment_percent_range:**
  - **description:** Prepayment percentage must be between 0% and 100% when prepayment is required
- **locked_order_immutable:**
  - **description:** A locked order cannot be cancelled or modified until unlocked by a manager
- **confirmed_lines_not_deletable:**
  - **description:** Lines on a confirmed order cannot be deleted, except for uninvoiced downpayment lines and display-only lines (sections, notes).

- **analytic_distribution_required:**
  - **description:** Analytic distribution must be valid on all lines before order confirmation
- **draft_revert_clears_signature:**
  - **description:** Reverting to draft clears the customer's digital signature
- **auto_lock_on_confirm:**
  - **description:** Orders are automatically locked after confirmation to prevent accidental edits
- **pricelist_drives_pricing:**
  - **description:** Line prices are computed from the assigned pricelist rules at order creation

## Outcomes

### Quotation_sent (Priority: 1)

**Given:**
- salesperson creates a quotation with customer and product lines
- salesperson sends the quotation via email

**Then:**
- **transition_state** field: `order_state` from: `draft` to: `sent`
- **emit_event** event: `sale.quotation.sent`

**Result:** Customer receives quotation via email with portal link

### Cancel_blocked_locked (Priority: 1) — Error: `SALE_ORDER_LOCKED`

**Given:**
- salesperson attempts to cancel a locked order

**Then:**
- **notify** — Inform that order must be unlocked first

**Result:** Cancellation prevented until manager unlocks the order

### Confirmation_invalid_lines (Priority: 1) — Error: `SALE_INVALID_LINES`

**Given:**
- salesperson attempts to confirm order
- one or more product lines missing product or unit of measure

**Then:**
- **notify** — Highlight lines with missing data

**Result:** Confirmation blocked until all lines are valid

### Order_confirmed (Priority: 2)

**Given:**
- quotation is in draft or sent state
- all product lines are valid
- customer has signed (if signature required)
- prepayment received (if prepayment required)

**Then:**
- **transition_state** field: `order_state` from: `sent` to: `sale`
- **set_field** target: `date_order` — Confirmation timestamp set to current time
- **set_field** target: `is_locked` value: `true`
- **emit_event** event: `sale.order.confirmed`

**Result:** Order confirmed, locked, and ready for fulfillment

### Order_cancelled (Priority: 3)

**Given:**
- order is not locked
- salesperson cancels the order

**Then:**
- **transition_state** field: `order_state` to: `cancel`
- **call_service** target: `invoice_service` — Cancel all linked draft invoices
- **emit_event** event: `sale.order.cancelled`

**Result:** Order cancelled, related draft invoices voided

### Order_reset_to_draft (Priority: 4)

**Given:**
- order is in cancelled or sent state
- salesperson resets to draft

**Then:**
- **transition_state** field: `order_state` to: `draft`
- **set_field** target: `signed_by` value: `null`
- **set_field** target: `signed_on` value: `null`

**Result:** Order is editable again, previous signature cleared

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SALE_ORDER_LOCKED` | 403 | This order is locked and cannot be modified. Ask a manager to unlock it. | No |
| `SALE_INVALID_LINES` | 400 | Some order lines are incomplete. Ensure all product lines have a product and unit assigned. | No |
| `SALE_CONFIRMATION_DATE_REQUIRED` | 400 | A confirmed order requires a confirmation date. | No |
| `SALE_LINE_DELETE_CONFIRMED` | 403 | Cannot delete lines from a confirmed order. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sale.quotation.sent` | Quotation emailed to customer | `order_id`, `partner_id`, `amount_total` |
| `sale.order.confirmed` | Quotation confirmed as a sales order | `order_id`, `partner_id`, `amount_total` |
| `sale.order.cancelled` | Order cancelled by salesperson | `order_id` |
| `sale.order.locked` | Order locked to prevent modifications | `order_id` |
| `sale.order.unlocked` | Order unlocked by manager for editing | `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| loyalty-coupons | optional | Loyalty rewards and coupon codes applied to sales orders |
| product-configurator | optional | Configurable products selected via attribute picker on order lines |
| invoicing-payments | required | Confirmed orders generate invoices for payment collection |
| tax-engine | required | Tax computation on every order line |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 35
  entry_points:
    - addons/sale/models/sale_order.py
    - addons/sale/models/sale_order_line.py
    - addons/sale_management/models/sale_order.py
    - addons/sale_pdf_quote_builder/models/sale_order.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Quotation Order Management Blueprint",
  "description": "Sales quotation-to-order lifecycle including quote creation, PDF generation, portal sharing, digital signature, prepayment, order confirmation, and invoicing.\n.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sales, quotation, order-management, invoicing, pdf-builder"
}
</script>
