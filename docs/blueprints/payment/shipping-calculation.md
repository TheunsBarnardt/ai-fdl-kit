---
title: "Shipping Calculation Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation.. 14 fields. 8 outcomes"
---

# Shipping Calculation Blueprint

> Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation.

| | |
|---|---|
| **Feature** | `shipping-calculation` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | shipping, rates, carriers, delivery, zones, logistics, e-commerce |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/payment/shipping-calculation.blueprint.yaml) |
| **JSON API** | [shipping-calculation.json]({{ site.baseurl }}/api/blueprints/payment/shipping-calculation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `shipment_id` | text | Yes | Shipment ID | Validations: pattern |
| `origin_address` | json | Yes | Origin Address |  |
| `destination_address` | json | Yes | Destination Address |  |
| `package_weight` | number | Yes | Package Weight (kg) | Validations: min |
| `package_dimensions` | json | Yes | Package Dimensions |  |
| `dimensional_weight` | number | No | Dimensional Weight (kg) |  |
| `carrier` | select | Yes | Shipping Carrier |  |
| `service_level` | select | Yes | Service Level |  |
| `rate` | number | Yes | Shipping Rate | Validations: min |
| `estimated_delivery` | date | No | Estimated Delivery Date |  |
| `tracking_number` | text | No | Tracking Number |  |
| `shipping_zone` | text | No | Shipping Zone |  |
| `free_shipping_eligible` | boolean | No | Free Shipping Eligible |  |
| `order_subtotal` | number | No | Order Subtotal |  |

## Rules

- **dimensional_weight_calculation:**
  - **description:** Dimensional (volumetric) weight is calculated as (length x width x height) / dimensional factor. The dimensional factor is typically 5000 for cm/kg. The billable weight is the greater of actual weight and dimensional weight.

- **zone_mapping:**
  - **description:** Shipping zones are determined by the origin and destination postal codes or country pairs. Zone definitions map to rate tiers. Domestic and international zones use separate rate tables.

- **free_shipping_threshold:**
  - **description:** Orders above a configurable subtotal threshold (e.g., $75) qualify for free standard shipping. Free shipping does not apply to express or overnight service levels.

- **carrier_rate_quotes:**
  - **description:** Real-time rate quotes are fetched from carrier APIs when available. Rates are cached for 15 minutes per origin/destination pair. If the carrier API is unavailable, fallback to stored rate tables.

- **delivery_estimation:**
  - **description:** Estimated delivery dates are calculated from carrier transit times, origin processing time (1 business day), and destination country customs clearance (2-5 business days for international).

- **restricted_destinations:**
  - **description:** Certain products cannot be shipped to restricted destinations (embargoed countries, hazmat restrictions). Validation occurs before rate calculation.

- **insurance_and_signature:**
  - **description:** Orders above a configurable value threshold (e.g., $500) automatically include shipping insurance and signature confirmation at no extra cost.


## Outcomes

### Rate_calculated (Priority: 1)

**Given:**
- origin and destination addresses are valid
- package weight and dimensions are provided
- destination is not restricted

**Then:**
- **set_field** target: `dimensional_weight` — Calculated from package dimensions
- **set_field** target: `shipping_zone` — Determined from origin/destination pair
- **set_field** target: `rate` — Rate calculated using billable weight and zone
- **set_field** target: `estimated_delivery` — Calculated from carrier transit times
- **emit_event** event: `shipping.rate_calculated`

**Result:** Shipping rate and estimated delivery calculated for all available service levels

### Restricted_destination (Priority: 1) — Error: `SHIPPING_RESTRICTED_DESTINATION`

**Given:**
- destination address is in a restricted or embargoed region

**Then:**
- **notify** — Inform customer that shipping to this destination is not available

**Result:** Cannot ship to the specified destination

### Free_shipping_applied (Priority: 2)

**Given:**
- `order_subtotal` (input) gte `75`
- `service_level` eq `standard`

**Then:**
- **set_field** target: `rate` value: `0`
- **set_field** target: `free_shipping_eligible` value: `true`

**Result:** Free standard shipping applied, order meets threshold

### Package_exceeds_limits (Priority: 2) — Error: `SHIPPING_PACKAGE_TOO_LARGE`

**Given:**
- package weight or dimensions exceed carrier maximum

**Then:**
- **notify** — Suggest freight shipping or splitting into multiple packages

**Result:** Package exceeds standard shipping limits

### Carrier_rate_fetched (Priority: 3)

**Given:**
- carrier API is available
- origin and destination are within carrier service area

**Then:**
- **call_service** target: `carrier_api` — Fetch real-time rate quote from carrier
- **set_field** target: `rate` — Updated with carrier-quoted rate
- **set_field** target: `estimated_delivery` — Updated with carrier-quoted transit time

**Result:** Real-time carrier rate quote applied

### Carrier_rate_fallback (Priority: 4)

**Given:**
- carrier API is unavailable or returns an error

**Then:**
- **set_field** target: `rate` — Calculated from stored rate tables as fallback
- **set_field** target: `estimated_delivery` — Estimated from standard transit time tables

**Result:** Fallback rate applied from stored rate tables

### Shipping_label_created (Priority: 5)

**Given:**
- order is confirmed and paid
- shipping rate has been calculated

**Then:**
- **call_service** target: `carrier_api` — Generate shipping label with carrier
- **set_field** target: `tracking_number` — Tracking number assigned by carrier
- **emit_event** event: `shipping.label_created`

**Result:** Shipping label generated with tracking number

### Tracking_updated (Priority: 6)

**Given:**
- carrier provides a tracking status update
- `tracking_number` exists

**Then:**
- **emit_event** event: `shipping.tracking_updated`

**Result:** Shipment tracking information updated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SHIPPING_RESTRICTED_DESTINATION` | 400 | Shipping is not available to the specified destination. | No |
| `SHIPPING_PACKAGE_TOO_LARGE` | 400 | Package exceeds maximum weight or dimension limits for this carrier. | No |
| `SHIPPING_ADDRESS_INVALID` | 400 | The shipping address could not be validated. Please check and try again. | No |
| `SHIPPING_CARRIER_UNAVAILABLE` | 503 | The selected carrier is currently unavailable. Please try a different shipping option. | No |
| `SHIPPING_NO_RATES_AVAILABLE` | 404 | No shipping rates are available for this origin/destination combination. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `shipping.rate_calculated` | Shipping rate calculated for a shipment | `shipment_id`, `carrier`, `service_level`, `rate`, `estimated_delivery` |
| `shipping.label_created` | Shipping label generated with carrier | `shipment_id`, `carrier`, `tracking_number`, `label_url` |
| `shipping.tracking_updated` | Shipment tracking status updated | `shipment_id`, `tracking_number`, `status`, `location`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cart-checkout | required | Shipping rates displayed during checkout flow |
| currency-conversion | optional | Shipping rates may need currency conversion for international orders |
| refunds-returns | optional | Return shipping label generation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Shipping Calculation Blueprint",
  "description": "Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation.. 14 fields. 8 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "shipping, rates, carriers, delivery, zones, logistics, e-commerce"
}
</script>
