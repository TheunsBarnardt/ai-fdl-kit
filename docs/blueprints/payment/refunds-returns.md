---
title: "Refunds Returns Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking.. 13 fields. 9 outcomes. 5 error "
---

# Refunds Returns Blueprint

> Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking.

| | |
|---|---|
| **Feature** | `refunds-returns` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | refunds, returns, rma, store-credit, restocking, e-commerce |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/refunds-returns.blueprint.yaml) |
| **JSON API** | [refunds-returns.json]({{ site.baseurl }}/api/blueprints/payment/refunds-returns.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `return_id` | text | Yes | Return ID | Validations: pattern |
| `order_id` | text | Yes | Original Order ID |  |
| `customer_id` | text | Yes | Customer ID |  |
| `items` | json | Yes | Return Items |  |
| `reason` | select | Yes | Return Reason |  |
| `refund_type` | select | Yes | Refund Type |  |
| `refund_amount` | number | Yes | Refund Amount | Validations: min |
| `refund_method` | select | Yes | Refund Method |  |
| `status` | select | Yes | Return Status |  |
| `return_tracking` | text | No | Return Tracking Number |  |
| `return_label_url` | url | No | Return Shipping Label |  |
| `restocked` | boolean | No | Items Restocked |  |
| `notes` | text | No | Internal Notes |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `approved` |  |  |
| `processing` |  |  |
| `completed` |  | Yes |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `approved` | support_agent | Order is within return window and reason is valid |
|  | `requested` | `rejected` | support_agent | Order outside return window, item not eligible, or policy violation |
|  | `approved` | `processing` | system | Return tracking shows delivered |
|  | `processing` | `completed` | warehouse_staff | Item condition verified |

## Rules

- **return_window:**
  - **description:** Returns must be requested within 30 days of order delivery. Defective items may be returned within 90 days.

- **refund_amount_cap:**
  - **description:** Refund amount cannot exceed the original order total. Partial refunds are calculated from returned item line totals.

- **original_payment_refund:**
  - **description:** Refunds to the original payment method use the same payment processor and token. If the original method is unavailable (expired card, closed account), store credit is issued instead.

- **restocking_fee:**
  - **description:** A restocking fee (typically 10-15%) may apply for non-defective returns where the item has been opened. Defective and wrong-item returns are exempt from restocking fees.

- **return_shipping:**
  - **description:** Prepaid return shipping labels are generated for approved returns. Shipping cost is covered by the merchant for defective or wrong items; customer pays for change-of-mind returns.

- **inspection_required:**
  - **description:** Returned items are inspected before refund is issued. Items must match the declared condition. Discrepancies may result in reduced refund amount.

- **auto_approve_policy:**
  - **description:** Returns for orders under a configurable threshold (e.g., $25) with reason "defective" or "wrong_item" may be auto-approved without manual review.


## Outcomes

### Return_requested (Priority: 1)

**Given:**
- customer submits a return request
- order is within the return window
- items are eligible for return

**Then:**
- **create_record** target: `return` — Return record created with requested status
- **emit_event** event: `refund.requested`
- **notify** — Confirmation email sent to customer

**Result:** Return request submitted and pending review

### Return_outside_window (Priority: 1) — Error: `RETURN_WINDOW_EXPIRED`

**Given:**
- customer requests a return
- order delivery date is beyond the return window

**Then:**
- **notify** — Inform customer the return window has closed

**Result:** Return cannot be processed, window expired

### Return_approved (Priority: 2)

**Given:**
- `status` eq `requested`
- support agent reviews and approves the request

**Then:**
- **transition_state** field: `status` from: `requested` to: `approved`
- **set_field** target: `return_label_url` — Prepaid shipping label generated
- **emit_event** event: `refund.approved`
- **notify** — Approval notification with return shipping label

**Result:** Return approved, shipping label issued to customer

### Refund_exceeds_order (Priority: 2) — Error: `REFUND_EXCEEDS_ORDER_TOTAL`

**Given:**
- `refund_amount` (input) gt `order_total`

**Then:**
- **notify** — Refund amount capped at order total

**Result:** Refund amount cannot exceed the original order total

### Return_auto_approved (Priority: 3)

**Given:**
- `status` eq `requested`
- `refund_amount` (input) lte `25`
- ANY: `reason` eq `defective` OR `reason` eq `wrong_item`

**Then:**
- **transition_state** field: `status` from: `requested` to: `approved`
- **set_field** target: `return_label_url` — Prepaid shipping label generated automatically
- **emit_event** event: `refund.approved`

**Result:** Low-value defective/wrong-item return auto-approved

### Return_rejected (Priority: 4)

**Given:**
- `status` eq `requested`
- return does not meet policy requirements

**Then:**
- **transition_state** field: `status` from: `requested` to: `rejected`
- **emit_event** event: `refund.rejected`
- **notify** — Rejection notification with explanation

**Result:** Return request denied with reason provided to customer

### Return_received (Priority: 5)

**Given:**
- `status` eq `approved`
- return tracking shows package delivered to warehouse

**Then:**
- **transition_state** field: `status` from: `approved` to: `processing`
- **emit_event** event: `return.received`

**Result:** Returned package received, inspection in progress

### Return_shipped (Priority: 6)

**Given:**
- `status` eq `approved`
- customer ships the return package

**Then:**
- **set_field** target: `return_tracking` — Tracking number recorded
- **emit_event** event: `return.shipped`

**Result:** Return shipment in transit

### Refund_completed (Priority: 7) | Transaction: atomic

**Given:**
- `status` eq `processing`
- items pass inspection

**Then:**
- **transition_state** field: `status` from: `processing` to: `completed`
- **set_field** target: `restocked` value: `true` — Items returned to inventory if in sellable condition
- **emit_event** event: `refund.processed`
- **notify** — Refund confirmation sent to customer

**Result:** Refund issued, items restocked, return completed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RETURN_WINDOW_EXPIRED` | 400 | The return window for this order has expired. | No |
| `RETURN_ITEM_NOT_ELIGIBLE` | 400 | One or more items in this order are not eligible for return. | No |
| `REFUND_EXCEEDS_ORDER_TOTAL` | 400 | The refund amount cannot exceed the original order total. | No |
| `RETURN_ALREADY_PROCESSED` | 409 | A return has already been processed for these items. | No |
| `REFUND_PAYMENT_FAILED` | 500 | Unable to process refund to the original payment method. Store credit will be issued instead. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `refund.requested` | Customer submitted a return and refund request | `return_id`, `order_id`, `customer_id`, `items`, `reason` |
| `refund.approved` | Return request approved by support or auto-approved | `return_id`, `order_id`, `refund_amount`, `refund_method` |
| `refund.processed` | Refund issued to customer | `return_id`, `order_id`, `refund_amount`, `refund_method` |
| `refund.rejected` | Return request denied | `return_id`, `order_id`, `reason` |
| `return.shipped` | Customer shipped the return package | `return_id`, `return_tracking`, `carrier` |
| `return.received` | Return package received at warehouse | `return_id`, `tracking_number`, `received_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cart-checkout | required | Returns reference original orders placed through checkout |
| payment-methods | required | Refunds issued to original payment method |
| invoicing-payments | optional | Credit notes generated for refunded invoices |
| shipping-calculation | optional | Return shipping label generation and cost calculation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Refunds Returns Blueprint",
  "description": "Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking.. 13 fields. 9 outcomes. 5 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "refunds, returns, rma, store-credit, restocking, e-commerce"
}
</script>
