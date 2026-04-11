<!-- AUTO-GENERATED FROM refunds-returns.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Refunds Returns

> Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** refunds · returns · rma · store-credit · restocking · e-commerce

## What this does

Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **return_id** *(text, required)* — Return ID
- **order_id** *(text, required)* — Original Order ID
- **customer_id** *(text, required)* — Customer ID
- **items** *(json, required)* — Return Items
- **reason** *(select, required)* — Return Reason
- **refund_type** *(select, required)* — Refund Type
- **refund_amount** *(number, required)* — Refund Amount
- **refund_method** *(select, required)* — Refund Method
- **status** *(select, required)* — Return Status
- **return_tracking** *(text, optional)* — Return Tracking Number
- **return_label_url** *(url, optional)* — Return Shipping Label
- **restocked** *(boolean, optional)* — Items Restocked
- **notes** *(text, optional)* — Internal Notes

## What must be true

- **return_window:** Returns must be requested within 30 days of order delivery. Defective items may be returned within 90 days.
- **refund_amount_cap:** Refund amount cannot exceed the original order total. Partial refunds are calculated from returned item line totals.
- **original_payment_refund:** Refunds to the original payment method use the same payment processor and token. If the original method is unavailable (expired card, closed account), store credit is issued instead.
- **restocking_fee:** A restocking fee (typically 10-15%) may apply for non-defective returns where the item has been opened. Defective and wrong-item returns are exempt from restocking fees.
- **return_shipping:** Prepaid return shipping labels are generated for approved returns. Shipping cost is covered by the merchant for defective or wrong items; customer pays for change-of-mind returns.
- **inspection_required:** Returned items are inspected before refund is issued. Items must match the declared condition. Discrepancies may result in reduced refund amount.
- **auto_approve_policy:** Returns for orders under a configurable threshold (e.g., $25) with reason "defective" or "wrong_item" may be auto-approved without manual review.

## Success & failure scenarios

**✅ Success paths**

- **Return Requested** — when customer submits a return request; order is within the return window; items are eligible for return, then Return request submitted and pending review.
- **Return Approved** — when status eq "requested"; support agent reviews and approves the request, then Return approved, shipping label issued to customer.
- **Return Auto Approved** — when status eq "requested"; refund_amount lte 25; reason eq "defective" OR reason eq "wrong_item", then Low-value defective/wrong-item return auto-approved.
- **Return Rejected** — when status eq "requested"; return does not meet policy requirements, then Return request denied with reason provided to customer.
- **Return Received** — when status eq "approved"; return tracking shows package delivered to warehouse, then Returned package received, inspection in progress.
- **Return Shipped** — when status eq "approved"; customer ships the return package, then Return shipment in transit.
- **Refund Completed** — when status eq "processing"; items pass inspection, then Refund issued, items restocked, return completed.

**❌ Failure paths**

- **Return Outside Window** — when customer requests a return; order delivery date is beyond the return window, then Return cannot be processed, window expired. *(error: `RETURN_WINDOW_EXPIRED`)*
- **Refund Exceeds Order** — when refund_amount gt "order_total", then Refund amount cannot exceed the original order total. *(error: `REFUND_EXCEEDS_ORDER_TOTAL`)*

## Errors it can return

- `RETURN_WINDOW_EXPIRED` — The return window for this order has expired.
- `RETURN_ITEM_NOT_ELIGIBLE` — One or more items in this order are not eligible for return.
- `REFUND_EXCEEDS_ORDER_TOTAL` — The refund amount cannot exceed the original order total.
- `RETURN_ALREADY_PROCESSED` — A return has already been processed for these items.
- `REFUND_PAYMENT_FAILED` — Unable to process refund to the original payment method. Store credit will be issued instead.

## Connects to

- **cart-checkout** *(required)* — Returns reference original orders placed through checkout
- **payment-methods** *(required)* — Refunds issued to original payment method
- **invoicing-payments** *(optional)* — Credit notes generated for refunded invoices
- **shipping-calculation** *(optional)* — Return shipping label generation and cost calculation

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/refunds-returns/) · **Spec source:** [`refunds-returns.blueprint.yaml`](./refunds-returns.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
