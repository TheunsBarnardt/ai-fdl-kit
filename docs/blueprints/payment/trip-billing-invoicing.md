---
title: "Trip Billing Invoicing Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Calculate and manage trip-based billing, service rates, and invoice generation for completed deliveries. 18 fields. 5 outcomes. 4 error codes. rules: completion"
---

# Trip Billing Invoicing Blueprint

> Calculate and manage trip-based billing, service rates, and invoice generation for completed deliveries

| | |
|---|---|
| **Feature** | `trip-billing-invoicing` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | fleet, billing, invoice, payment, service-rate, transaction |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/trip-billing-invoicing.blueprint.yaml) |
| **JSON API** | [trip-billing-invoicing.json]({{ site.baseurl }}/api/blueprints/payment/trip-billing-invoicing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Creates orders and triggers billing |
| `customer` | Customer | human | Entity billed for the delivery service |
| `system` | Billing Engine | system | Automated rate calculation and invoice generation |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `transaction_id` | text | Yes | Transaction ID |  |
| `order_uuid` | text | Yes | Order |  |
| `customer_uuid` | text | Yes | Customer |  |
| `service_quote_uuid` | text | No | Service Quote |  |
| `purchase_rate_uuid` | text | No | Applied Rate |  |
| `gateway` | text | No | Payment Gateway |  |
| `gateway_transaction_id` | text | No | Gateway Transaction ID |  |
| `amount` | number | Yes | Amount (minor units) |  |
| `currency` | text | Yes | Currency (ISO 4217) |  |
| `description` | text | No | Description |  |
| `type` | select | Yes | Transaction Type |  |
| `status` | select | Yes | Status |  |
| `service_name` | text | No | Service Name |  |
| `service_type` | select | No | Rate Type |  |
| `base_fee` | number | No | Base Fee (minor units) |  |
| `per_meter_fee` | number | No | Per-Meter Fee |  |
| `cod_amount` | number | No | COD Amount |  |
| `cod_currency` | text | No | COD Currency |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `processing` |  |  |
| `paid` |  | Yes |
| `failed` |  | Yes |
| `refunded` |  | Yes |
| `voided` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `processing` | system |  |
|  | `processing` | `paid` | system |  |
|  | `processing` | `failed` | system |  |
|  | `paid` | `refunded` | dispatcher |  |
|  | `pending` | `voided` | dispatcher |  |

## Rules

- **completion_triggers_billing:** Trip billing is calculated at order completion using the matched service rate
- **rate_matching:** Service rates are matched by service area, zone, and order configuration
- **rate_calculation_methods:** Rate calculation methods: flat fee, per-meter, or custom algorithm
- **peak_hour_surcharges:** Peak-hour surcharges are applied automatically based on dispatch time
- **cod_tracking:** Cash-on-delivery (COD) amounts are tracked separately from service fees
- **minor_currency_units:** All monetary amounts are stored in minor currency units to avoid floating-point errors
- **full_audit_trail:** Transactions are linked to the order, customer, and service quote for audit
- **refund_limit:** Refunds can only be issued for paid transactions and must not exceed the original amount
- **voided_closed:** Voided invoices cannot be reopened; a new transaction must be created
- **tax_compliance:** Tax calculation must comply with the organization's configured tax rules and jurisdiction

## Outcomes

### Bill_calculated (Priority: 1)

**Given:**
- order.completed event received
- service rate is configured for the order type and area

**Then:**
- **create_record**
- **emit_event** event: `billing.calculated`

**Result:** Trip cost calculated and invoice created

### No_service_rate_found (Priority: 1) — Error: `BILLING_NO_RATE_FOUND`

**Given:**
- no service rate matches the order type, area, and configuration

**Result:** Billing failed — no matching service rate configured

### Payment_successful (Priority: 2)

**Given:**
- `status` (db) eq `processing`
- payment gateway confirms success

**Then:**
- **set_field** target: `status` value: `paid`
- **emit_event** event: `billing.payment_received`

**Result:** Payment confirmed and order fully settled

### Payment_failed (Priority: 3) — Error: `BILLING_PAYMENT_FAILED`

**Given:**
- payment gateway returns failure

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `billing.payment_failed`

**Result:** Payment failed; retry or alternative payment method required

### Refund_issued (Priority: 4)

**Given:**
- `status` (db) eq `paid`

**Then:**
- **create_record**
- **emit_event** event: `billing.refund_issued`

**Result:** Refund transaction created and processed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BILLING_PAYMENT_FAILED` | 422 | Payment could not be processed. Please try again or use a different payment method. | No |
| `BILLING_NO_RATE_FOUND` | 422 | No service rate is configured for this order type and area. | No |
| `BILLING_REFUND_EXCEEDS_ORIGINAL` | 422 | Refund amount cannot exceed the original charge. | No |
| `BILLING_INVALID_CURRENCY` | 422 | The specified currency is not supported. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `billing.calculated` | Fired when a trip bill is calculated at order completion | `transaction_id`, `order_uuid`, `amount`, `currency`, `service_name` |
| `billing.payment_received` | Fired when payment is confirmed | `transaction_id`, `order_uuid`, `amount`, `currency`, `gateway` |
| `billing.payment_failed` | Fired when a payment attempt fails | `transaction_id`, `order_uuid`, `error` |
| `billing.refund_issued` | Fired when a refund is processed | `transaction_id`, `order_uuid`, `refund_amount`, `currency` |
| `billing.invoice_voided` | Fired when an invoice is voided | `transaction_id`, `order_uuid` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Billing is triggered on order completion |
| service-area-management | required | Service rates are bound to service areas |
| driver-earnings-payouts | recommended | Driver earnings are derived from trip billing |
| fleet-customer-contacts | recommended | Customer billing details come from contact management |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip Billing Invoicing Blueprint",
  "description": "Calculate and manage trip-based billing, service rates, and invoice generation for completed deliveries. 18 fields. 5 outcomes. 4 error codes. rules: completion",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, billing, invoice, payment, service-rate, transaction"
}
</script>
