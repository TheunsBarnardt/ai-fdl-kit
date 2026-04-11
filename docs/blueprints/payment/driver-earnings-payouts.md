---
title: "Driver Earnings Payouts Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Track driver earnings per trip, manage payout schedules, and process driver compensation. 14 fields. 5 outcomes. 3 error codes. rules: auto_create_on_completion"
---

# Driver Earnings Payouts Blueprint

> Track driver earnings per trip, manage payout schedules, and process driver compensation

| | |
|---|---|
| **Feature** | `driver-earnings-payouts` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | fleet, driver, earnings, payouts, compensation, settlement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/driver-earnings-payouts.blueprint.yaml) |
| **JSON API** | [driver-earnings-payouts.json]({{ site.baseurl }}/api/blueprints/payment/driver-earnings-payouts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Administrator managing driver compensation |
| `driver` | Driver | human | Driver earning compensation for completed trips |
| `system` | Payroll Engine | system | Automated earnings calculation and payout processing |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `earning_id` | text | Yes | Earning ID |  |
| `driver_uuid` | text | Yes | Driver |  |
| `order_uuid` | text | No | Order |  |
| `amount` | number | Yes | Gross Amount (minor units) |  |
| `deductions` | number | No | Deductions (minor units) |  |
| `net_amount` | number | No | Net Amount (minor units) |  |
| `currency` | text | Yes | Currency (ISO 4217) |  |
| `earning_type` | select | Yes | Earning Type |  |
| `payout_uuid` | text | No | Payout Batch |  |
| `payout_method` | select | No | Payout Method |  |
| `payout_reference` | text | No | Payout Reference |  |
| `period_start` | date | No | Period Start |  |
| `period_end` | date | No | Period End |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `approved` |  |  |
| `processing` |  |  |
| `paid` |  | Yes |
| `failed` |  | Yes |
| `withheld` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `approved` | fleet_manager |  |
|  | `approved` | `processing` | system |  |
|  | `processing` | `paid` | system |  |
|  | `processing` | `failed` | system |  |
|  | `pending` | `withheld` | fleet_manager |  |

## Rules

- **auto_create_on_completion:** Earnings are created automatically when an order is completed
- **configurable_commission:** The platform commission percentage is configurable per organization and driver tier
- **net_calculation:** Net amount is calculated as gross amount minus all applicable deductions
- **minor_currency_units:** All monetary values are stored in minor currency units
- **driver_earnings_visibility:** Drivers can view their earnings history and pending payout balance
- **batch_payouts:** Payouts are batched by configurable period (daily, weekly, or on-demand)
- **retry_failed:** Failed payouts must be retried or escalated to manual review
- **reverse_on_cancellation:** Earnings linked to cancelled or failed orders are automatically reversed
- **processor_reference:** Payout records must reference the external transaction ID from the payment processor
- **access_control:** Driver earnings are never accessible to other drivers or unauthorized parties

## Outcomes

### Earning_created (Priority: 1)

**Given:**
- order.completed event received
- `driver_uuid` (db) exists

**Then:**
- **create_record**
- **emit_event** event: `earnings.created`

**Result:** Trip earning record created for driver

### Earning_reversed_on_cancellation (Priority: 1)

**Given:**
- order.cancelled event received after earning was created

**Then:**
- **create_record**
- **emit_event** event: `earnings.reversed`

**Result:** Earning reversed due to order cancellation

### Earning_approved (Priority: 2)

**Given:**
- `status` (db) eq `pending`

**Then:**
- **set_field** target: `status` value: `approved`
- **emit_event** event: `earnings.approved`

**Result:** Earning approved and added to next payout batch

### Payout_processed (Priority: 3)

**Given:**
- payout period end date reached or on-demand triggered
- approved earnings exist for driver

**Then:**
- **set_field** target: `status` value: `paid`
- **emit_event** event: `earnings.payout_completed`

**Result:** Driver payout processed and funds transferred

### Payout_failed (Priority: 4) — Error: `EARNINGS_PAYOUT_FAILED`

**Given:**
- payment processor returns failure during payout

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `earnings.payout_failed`

**Result:** Payout failed; requires manual review

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EARNINGS_PAYOUT_FAILED` | 422 | Your payout could not be processed. Please check your bank details. | No |
| `EARNINGS_INSUFFICIENT_BALANCE` | 422 | Payout amount is below the minimum threshold. | No |
| `EARNINGS_INVALID_BANK_DETAILS` | 422 | Payout failed — invalid bank account details. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `earnings.created` | Fired when a trip earning is created for a driver | `earning_id`, `driver_uuid`, `order_uuid`, `amount`, `currency` |
| `earnings.approved` | Fired when an earning is approved for payout | `earning_id`, `driver_uuid`, `net_amount`, `currency` |
| `earnings.payout_completed` | Fired when a payout is successfully processed | `driver_uuid`, `payout_uuid`, `net_amount`, `currency`, `payout_method` |
| `earnings.payout_failed` | Fired when a payout fails | `driver_uuid`, `payout_uuid`, `error` |
| `earnings.reversed` | Fired when an earning is reversed due to cancellation | `original_earning_id`, `driver_uuid`, `amount`, `currency` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Earnings are triggered by order completion |
| trip-billing-invoicing | required | Trip revenue is the basis for driver earnings |
| driver-profile | required | Earnings are attributed to a specific driver |

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
  "name": "Driver Earnings Payouts Blueprint",
  "description": "Track driver earnings per trip, manage payout schedules, and process driver compensation. 14 fields. 5 outcomes. 3 error codes. rules: auto_create_on_completion",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, driver, earnings, payouts, compensation, settlement"
}
</script>
