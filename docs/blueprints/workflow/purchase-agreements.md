---
title: "Purchase Agreements Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronizat"
---

# Purchase Agreements Blueprint

> Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronization.


| | |
|---|---|
| **Feature** | `purchase-agreements` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | procurement, blanket-order, call-for-tender, vendor-management, purchasing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/purchase-agreements.blueprint.yaml) |
| **JSON API** | [purchase-agreements.json]({{ site.baseurl }}/api/blueprints/workflow/purchase-agreements.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `procurement_officer` | Procurement Officer | human | Creates agreements, evaluates tenders, selects vendors |
| `vendor` | Vendor | human | Submits bids for tenders and fulfills blanket order requests |
| `system` | Procurement System | system | Generates POs from agreements, syncs supplier catalog |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `agreement_type` | select | Yes | Agreement Type |  |
| `agreement_name` | text | Yes | Agreement Reference |  |
| `agreement_state` | select | Yes | State |  |
| `vendor_id` | text | No | Vendor |  |
| `currency_id` | text | Yes | Currency |  |
| `date_start` | date | No | Start Date |  |
| `date_end` | date | No | End Date |  |
| `agreement_lines` | json | Yes | Agreement Lines |  |
| `line_product_id` | text | Yes | Product |  |
| `line_quantity` | number | Yes | Agreed Quantity |  |
| `line_price_unit` | number | Yes | Agreed Price |  |
| `quantity_ordered` | number | No | Quantity Ordered |  |
| `purchase_order_count` | number | No | Generated POs |  |
| `representative_id` | text | No | Purchase Representative |  |

## States

**State field:** `agreement_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `confirmed` |  |  |
| `done` |  | Yes |
| `cancel` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `confirmed` | procurement_officer | Must have at least one line. For blanket orders, all lines must have price > 0 and quantity > 0.  |
|  | `confirmed` | `done` | procurement_officer | All generated purchase orders must be in a final state (not draft, sent, or awaiting approval).  |
|  | `draft,confirmed` | `cancel` | procurement_officer |  |
|  | `cancel` | `draft` | procurement_officer |  |

## Rules

- **blanket_order_requires_positive_prices:**
  - **description:** When confirming a blanket order, every line must have a unit price greater than zero and a quantity greater than zero.

- **end_date_after_start:**
  - **description:** End date must be on or after start date when both are set
- **cannot_close_with_pending_pos:**
  - **description:** An agreement cannot be closed (done) while there are purchase orders in draft, sent, or awaiting-approval states linked to it.

- **supplier_catalog_sync_on_confirm:**
  - **description:** Confirming a blanket order creates supplier catalog entries linking the vendor to each product at the agreed price.

- **supplier_catalog_cleanup_on_close:**
  - **description:** Closing or cancelling an agreement removes the supplier catalog entries it created, restoring previous vendor pricing.

- **type_immutable_after_draft:**
  - **description:** Agreement type and company cannot be changed after leaving draft state. Changing in draft regenerates the reference number.

- **delete_only_draft_or_cancel:**
  - **description:** Agreements can only be deleted in draft or cancelled state
- **vendor_duplicate_warning:**
  - **description:** When selecting a vendor for a blanket order, the system warns if an active blanket order already exists for that vendor (suggests completing the existing one first).


## Outcomes

### Agreement_confirmed (Priority: 1)

**Given:**
- procurement officer sets vendor and agreement lines
- all lines have valid products, quantities, and prices

**Then:**
- **transition_state** field: `agreement_state` from: `draft` to: `confirmed`
- **create_record** target: `supplier_catalog_entries` — Vendor-product-price links created in supplier catalog
- **emit_event** event: `purchase.agreement.confirmed`

**Result:** Agreement active, vendor pricing synchronized, POs can be generated

### Close_blocked_pending_pos (Priority: 1) — Error: `AGREEMENT_PENDING_POS`

**Given:**
- procurement officer attempts to close the agreement
- one or more linked POs are still in draft/sent/approval state

**Then:**
- **notify** — Show list of pending POs that must be finalized

**Result:** Agreement cannot be closed until all POs are final

### Purchase_order_generated (Priority: 2)

**Given:**
- agreement is in confirmed state
- procurement officer creates a purchase order from the agreement

**Then:**
- **create_record** target: `purchase_order` — New PO created with products and prices from agreement lines
- **set_field** target: `quantity_ordered` — Ordered quantity updated based on confirmed POs
- **emit_event** event: `purchase.agreement.po_generated`

**Result:** Purchase order created with pre-negotiated terms

### Confirm_invalid_lines (Priority: 2) — Error: `AGREEMENT_INVALID_LINES`

**Given:**
- blanket order has lines with zero price or zero quantity

**Then:**
- **notify** — Highlight lines with invalid pricing

**Result:** Confirmation blocked until all lines have valid prices and quantities

### Agreement_closed (Priority: 3)

**Given:**
- all generated POs are in final state
- procurement officer closes the agreement

**Then:**
- **transition_state** field: `agreement_state` from: `confirmed` to: `done`
- **delete_record** target: `supplier_catalog_entries` — Agreement-specific supplier catalog entries cleaned up
- **emit_event** event: `purchase.agreement.closed`

**Result:** Agreement closed, vendor catalog restored to prior state

### Agreement_cancelled (Priority: 4)

**Given:**
- procurement officer cancels the agreement

**Then:**
- **transition_state** field: `agreement_state` to: `cancel`
- **call_service** target: `purchase_order_service` — All linked draft purchase orders also cancelled
- **delete_record** target: `supplier_catalog_entries` — Supplier catalog entries removed
- **emit_event** event: `purchase.agreement.cancelled`

**Result:** Agreement and linked draft POs cancelled

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AGREEMENT_PENDING_POS` | 400 | Cannot close agreement while purchase orders are pending. Finalize or cancel them first. | No |
| `AGREEMENT_INVALID_LINES` | 400 | All agreement lines must have a positive price and quantity. | No |
| `AGREEMENT_END_BEFORE_START` | 400 | Agreement end date must be on or after the start date. | No |
| `AGREEMENT_DELETE_NOT_DRAFT` | 403 | Only draft or cancelled agreements can be deleted. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `purchase.agreement.confirmed` | Agreement activated and vendor pricing synchronized | `agreement_id`, `vendor_id`, `line_count` |
| `purchase.agreement.po_generated` | Purchase order generated from an agreement | `agreement_id`, `purchase_order_id`, `vendor_id` |
| `purchase.agreement.closed` | Agreement closed after fulfillment | `agreement_id`, `total_ordered` |
| `purchase.agreement.cancelled` | Agreement cancelled | `agreement_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| invoicing-payments | required | Generated POs lead to vendor bills in accounting |
| automation-rules | optional | Automate PO generation when stock falls below reorder point |

## AGI Readiness

### Goals

#### Reliable Purchase Agreements

Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronization.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `invoicing_payments` | invoicing-payments | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| agreement_confirmed | `autonomous` | - | - |
| purchase_order_generated | `autonomous` | - | - |
| agreement_closed | `autonomous` | - | - |
| agreement_cancelled | `supervised` | - | - |
| close_blocked_pending_pos | `human_required` | - | - |
| confirm_invalid_lines | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 10
  entry_points:
    - addons/purchase_requisition/models/purchase_requisition.py
    - addons/purchase_requisition/models/purchase_requisition_line.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Purchase Agreements Blueprint",
  "description": "Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronizat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "procurement, blanket-order, call-for-tender, vendor-management, purchasing"
}
</script>
