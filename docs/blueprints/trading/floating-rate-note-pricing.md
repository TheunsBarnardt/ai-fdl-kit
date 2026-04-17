---
title: "Floating Rate Note Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Floating rate note pricing using discount margin methodology and swap zero curve.. 4 fields. 1 outcomes. 1 error codes. rules: pricing"
---

# Floating Rate Note Pricing Blueprint

> Floating rate note pricing using discount margin methodology and swap zero curve.

| | |
|---|---|
| **Feature** | `floating-rate-note-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | bonds, floating-rate, frn, pricing, money-market, jibar |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/floating-rate-note-pricing.blueprint.yaml) |
| **JSON API** | [floating-rate-note-pricing.json]({{ site.baseurl }}/api/blueprints/trading/floating-rate-note-pricing.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `notional` | number | Yes | Notional Amount |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `maturity_date` | date | Yes | Maturity Date |  |
| `market_spread` | number | Yes | Market Spread |  |

## Rules

- **pricing:**
  - **forward_rate:** Fwd_rate = (DF(t)/DF(t+1) - 1) × 365/days
  - **coupon_payment:** Coupon = Nominal × (Forward_Rate + Issue_Spread) × days/365
  - **frn_price:** Price = Sum[DF_zero × (Coupon_i + Principal)]

## Outcomes

### Frn_priced

_Calculate FRN all-in price using discount margin method_

**Given:**
- `market_spread` (input) exists
- `maturity_date` (input) exists

**Then:**
- **set_field** target: `all_in_price` value: `discounted cash flows`
- **emit_event** event: `frn.price.calculated`

**Result:** FRN all-in price calculated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_SPREAD` | 400 | Spread values must be non-negative | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bond-pricing-models | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Floating Rate Note Pricing Blueprint",
  "description": "Floating rate note pricing using discount margin methodology and swap zero curve.. 4 fields. 1 outcomes. 1 error codes. rules: pricing",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bonds, floating-rate, frn, pricing, money-market, jibar"
}
</script>
