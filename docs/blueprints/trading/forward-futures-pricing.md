---
title: "Forward Futures Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price forwards and futures using cost-of-carry, income/yield adjustments, storage costs, and convenience yield for financial and commodity underlyings. 5 fields"
---

# Forward Futures Pricing Blueprint

> Price forwards and futures using cost-of-carry, income/yield adjustments, storage costs, and convenience yield for financial and commodity underlyings

| | |
|---|---|
| **Feature** | `forward-futures-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, forward-pricing, futures-pricing, cost-of-carry, convenience-yield, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/forward-futures-pricing.blueprint.yaml) |
| **JSON API** | [forward-futures-pricing.json]({{ site.baseurl }}/api/blueprints/trading/forward-futures-pricing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fwd_pricer` | Forward / Futures Pricer | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pricing_id` | text | Yes | Pricing identifier |  |
| `asset_type` | select | Yes | equity \| bond \| currency \| commodity |  |
| `spot_price` | number | Yes | Spot price |  |
| `risk_free_rate` | number | Yes | Risk-free rate (decimal) |  |
| `time_to_expiry` | number | Yes | Time to expiry in years |  |

## Rules

- **cost_of_carry:**
  - **general:** F0 = S0 * (1 + r - benefits + costs)^T
  - **equity_div:** F0 = S0 * e^((r - q)*T) for continuous dividend yield
  - **fx:** F0 = S0 * e^((r_domestic - r_foreign)*T)
  - **commodity_storage:** F0 = S0 * e^((r + storage - convenience)*T)
- **contango_backwardation:**
  - **contango:** F > S; typical for costly-to-store commodities
  - **backwardation:** F < S; supply shortage or convenience premium
- **value_of_forward_during_life:**
  - **long_value:** V_t = (F_t - F_0) * discount_factor_to_expiry
  - **short_value:** Opposite sign
- **convergence:**
  - **rule:** F -> S as T -> 0 (no arbitrage)
  - **basis:** F - S drifts toward zero at expiry
- **futures_vs_forward_pricing:**
  - **identical_when:** Rates deterministic and continuous compounding
  - **differ_when:** Rates stochastic; covariance with underlying matters
- **no_arbitrage_check:**
  - **violation:** If F > cost-of-carry price: cash-and-carry arbitrage — buy spot, sell futures, carry
  - **reverse:** If F < cost-of-carry price: reverse cash-and-carry — short spot, buy futures
- **validation:**
  - **pricing_required:** pricing_id present
  - **valid_asset:** asset_type in allowed set
  - **positive_time:** time_to_expiry > 0

## Outcomes

### Price_forward_future (Priority: 1)

_Compute arbitrage-free forward/futures price_

**Given:**
- `pricing_id` (input) exists
- `asset_type` (input) in `equity,bond,currency,commodity`
- `spot_price` (input) gt `0`
- `time_to_expiry` (input) gt `0`

**Then:**
- **call_service** target: `fwd_pricer`
- **emit_event** event: `forward.priced`

### Invalid_asset (Priority: 10) — Error: `FWD_PRICE_INVALID_ASSET`

_Unsupported asset class_

**Given:**
- `asset_type` (input) not_in `equity,bond,currency,commodity`

**Then:**
- **emit_event** event: `forward.pricing_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FWD_PRICE_INVALID_ASSET` | 400 | asset_type must be equity, bond, currency, or commodity | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `forward.priced` |  | `pricing_id`, `asset_type`, `forward_price`, `basis` |
| `forward.pricing_rejected` |  | `pricing_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forwards-futures-contracts | required |  |
| derivatives-arbitrage-replication | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Forward Futures Pricing Blueprint",
  "description": "Price forwards and futures using cost-of-carry, income/yield adjustments, storage costs, and convenience yield for financial and commodity underlyings. 5 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, forward-pricing, futures-pricing, cost-of-carry, convenience-yield, cfa-level-1"
}
</script>
