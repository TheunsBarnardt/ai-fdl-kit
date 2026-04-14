<!-- AUTO-GENERATED FROM shipping-calculation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Shipping Calculation

> Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** shipping · rates · carriers · delivery · zones · logistics · e-commerce

## What this does

Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **shipment_id** *(text, required)* — Shipment ID
- **origin_address** *(json, required)* — Origin Address
- **destination_address** *(json, required)* — Destination Address
- **package_weight** *(number, required)* — Package Weight (kg)
- **package_dimensions** *(json, required)* — Package Dimensions
- **dimensional_weight** *(number, optional)* — Dimensional Weight (kg)
- **carrier** *(select, required)* — Shipping Carrier
- **service_level** *(select, required)* — Service Level
- **rate** *(number, required)* — Shipping Rate
- **estimated_delivery** *(date, optional)* — Estimated Delivery Date
- **tracking_number** *(text, optional)* — Tracking Number
- **shipping_zone** *(text, optional)* — Shipping Zone
- **free_shipping_eligible** *(boolean, optional)* — Free Shipping Eligible
- **order_subtotal** *(number, optional)* — Order Subtotal

## What must be true

- **dimensional_weight_calculation:** Dimensional (volumetric) weight is calculated as (length x width x height) / dimensional factor. The dimensional factor is typically 5000 for cm/kg. The billable weight is the greater of actual weight and dimensional weight.
- **zone_mapping:** Shipping zones are determined by the origin and destination postal codes or country pairs. Zone definitions map to rate tiers. Domestic and international zones use separate rate tables.
- **free_shipping_threshold:** Orders above a configurable subtotal threshold (e.g., $75) qualify for free standard shipping. Free shipping does not apply to express or overnight service levels.
- **carrier_rate_quotes:** Real-time rate quotes are fetched from carrier APIs when available. Rates are cached for 15 minutes per origin/destination pair. If the carrier API is unavailable, fallback to stored rate tables.
- **delivery_estimation:** Estimated delivery dates are calculated from carrier transit times, origin processing time (1 business day), and destination country customs clearance (2-5 business days for international).
- **restricted_destinations:** Certain products cannot be shipped to restricted destinations (embargoed countries, hazmat restrictions). Validation occurs before rate calculation.
- **insurance_and_signature:** Orders above a configurable value threshold (e.g., $500) automatically include shipping insurance and signature confirmation at no extra cost.

## Success & failure scenarios

**✅ Success paths**

- **Rate Calculated** — when origin and destination addresses are valid; package weight and dimensions are provided; destination is not restricted, then Shipping rate and estimated delivery calculated for all available service levels.
- **Free Shipping Applied** — when order_subtotal gte 75; service_level eq "standard", then Free standard shipping applied, order meets threshold.
- **Carrier Rate Fetched** — when carrier API is available; origin and destination are within carrier service area, then Real-time carrier rate quote applied.
- **Carrier Rate Fallback** — when carrier API is unavailable or returns an error, then Fallback rate applied from stored rate tables.
- **Shipping Label Created** — when order is confirmed and paid; shipping rate has been calculated, then Shipping label generated with tracking number.
- **Tracking Updated** — when carrier provides a tracking status update; tracking_number exists, then Shipment tracking information updated.

**❌ Failure paths**

- **Restricted Destination** — when destination address is in a restricted or embargoed region, then Cannot ship to the specified destination. *(error: `SHIPPING_RESTRICTED_DESTINATION`)*
- **Package Exceeds Limits** — when package weight or dimensions exceed carrier maximum, then Package exceeds standard shipping limits. *(error: `SHIPPING_PACKAGE_TOO_LARGE`)*

## Errors it can return

- `SHIPPING_RESTRICTED_DESTINATION` — Shipping is not available to the specified destination.
- `SHIPPING_PACKAGE_TOO_LARGE` — Package exceeds maximum weight or dimension limits for this carrier.
- `SHIPPING_ADDRESS_INVALID` — The shipping address could not be validated. Please check and try again.
- `SHIPPING_CARRIER_UNAVAILABLE` — The selected carrier is currently unavailable. Please try a different shipping option.
- `SHIPPING_NO_RATES_AVAILABLE` — No shipping rates are available for this origin/destination combination.

## Events

**`shipping.rate_calculated`** — Shipping rate calculated for a shipment
  Payload: `shipment_id`, `carrier`, `service_level`, `rate`, `estimated_delivery`

**`shipping.label_created`** — Shipping label generated with carrier
  Payload: `shipment_id`, `carrier`, `tracking_number`, `label_url`

**`shipping.tracking_updated`** — Shipment tracking status updated
  Payload: `shipment_id`, `tracking_number`, `status`, `location`, `timestamp`

## Connects to

- **cart-checkout** *(required)* — Shipping rates displayed during checkout flow
- **currency-conversion** *(optional)* — Shipping rates may need currency conversion for international orders
- **refunds-returns** *(optional)* — Return shipping label generation

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/shipping-calculation/) · **Spec source:** [`shipping-calculation.blueprint.yaml`](./shipping-calculation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
