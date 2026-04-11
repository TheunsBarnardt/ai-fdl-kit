<!-- AUTO-GENERATED FROM quotation-order-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Quotation Order Management

> Sales quotation-to-order lifecycle including quote creation, PDF generation, portal sharing, digital signature, prepayment, order confirmation, and invoicing.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** sales · quotation · order-management · invoicing · pdf-builder

## What this does

Sales quotation-to-order lifecycle including quote creation, PDF generation, portal sharing, digital signature, prepayment, order confirmation, and invoicing.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_state** *(select, required)* — Order State
- **partner_id** *(text, required)* — Customer
- **order_lines** *(json, required)* — Order Lines
- **amount_untaxed** *(number, required)* — Untaxed Amount
- **amount_tax** *(number, required)* — Tax Amount
- **amount_total** *(number, required)* — Total Amount
- **validity_date** *(date, optional)* — Expiration Date
- **date_order** *(datetime, required)* — Order Date
- **commitment_date** *(datetime, optional)* — Delivery Date
- **pricelist_id** *(text, optional)* — Pricelist
- **payment_term_id** *(text, optional)* — Payment Terms
- **invoice_status** *(select, optional)* — Invoice Status
- **require_signature** *(boolean, optional)* — Require Signature
- **require_payment** *(boolean, optional)* — Require Prepayment
- **prepayment_percent** *(number, optional)* — Prepayment Percentage
- **signed_by** *(text, optional)* — Signed By
- **signed_on** *(datetime, optional)* — Signed On
- **is_locked** *(boolean, optional)* — Locked
- **product_id** *(text, required)* — Product
- **product_uom_qty** *(number, required)* — Quantity
- **price_unit** *(number, required)* — Unit Price
- **discount** *(number, optional)* — Discount %
- **display_type** *(select, optional)* — Line Type
- **is_downpayment** *(boolean, optional)* — Is Down Payment

## What must be true

- **confirmation_requires_valid_lines:** Each product line must have a product and unit of measure assigned. Section, subsection, note, and downpayment lines are exempt.
- **prepayment_percent_range:** Prepayment percentage must be between 0% and 100% when prepayment is required
- **locked_order_immutable:** A locked order cannot be cancelled or modified until unlocked by a manager
- **confirmed_lines_not_deletable:** Lines on a confirmed order cannot be deleted, except for uninvoiced downpayment lines and display-only lines (sections, notes).
- **analytic_distribution_required:** Analytic distribution must be valid on all lines before order confirmation
- **draft_revert_clears_signature:** Reverting to draft clears the customer's digital signature
- **auto_lock_on_confirm:** Orders are automatically locked after confirmation to prevent accidental edits
- **pricelist_drives_pricing:** Line prices are computed from the assigned pricelist rules at order creation

## Success & failure scenarios

**✅ Success paths**

- **Quotation Sent** — when salesperson creates a quotation with customer and product lines; salesperson sends the quotation via email, then Customer receives quotation via email with portal link.
- **Order Confirmed** — when quotation is in draft or sent state; all product lines are valid; customer has signed (if signature required); prepayment received (if prepayment required), then Order confirmed, locked, and ready for fulfillment.
- **Order Cancelled** — when order is not locked; salesperson cancels the order, then Order cancelled, related draft invoices voided.
- **Order Reset To Draft** — when order is in cancelled or sent state; salesperson resets to draft, then Order is editable again, previous signature cleared.

**❌ Failure paths**

- **Cancel Blocked Locked** — when salesperson attempts to cancel a locked order, then Cancellation prevented until manager unlocks the order. *(error: `SALE_ORDER_LOCKED`)*
- **Confirmation Invalid Lines** — when salesperson attempts to confirm order; one or more product lines missing product or unit of measure, then Confirmation blocked until all lines are valid. *(error: `SALE_INVALID_LINES`)*

## Errors it can return

- `SALE_ORDER_LOCKED` — This order is locked and cannot be modified. Ask a manager to unlock it.
- `SALE_INVALID_LINES` — Some order lines are incomplete. Ensure all product lines have a product and unit assigned.
- `SALE_CONFIRMATION_DATE_REQUIRED` — A confirmed order requires a confirmation date.
- `SALE_LINE_DELETE_CONFIRMED` — Cannot delete lines from a confirmed order.

## Connects to

- **loyalty-coupons** *(optional)* — Loyalty rewards and coupon codes applied to sales orders
- **product-configurator** *(optional)* — Configurable products selected via attribute picker on order lines
- **invoicing-payments** *(required)* — Confirmed orders generate invoices for payment collection
- **tax-engine** *(required)* — Tax computation on every order line

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/quotation-order-management/) · **Spec source:** [`quotation-order-management.blueprint.yaml`](./quotation-order-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
