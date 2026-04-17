---
title: "Swap Pricing Valuation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price interest-rate, currency, and equity swaps at inception (par swap rate) and value during life using spot-curve discounting and replicating portfolios of bo"
---

# Swap Pricing Valuation Blueprint

> Price interest-rate, currency, and equity swaps at inception (par swap rate) and value during life using spot-curve discounting and replicating portfolios of bonds

| | |
|---|---|
| **Feature** | `swap-pricing-valuation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, swap-pricing, par-swap-rate, swap-valuation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/swap-pricing-valuation.blueprint.yaml) |
| **JSON API** | [swap-pricing-valuation.json]({{ site.baseurl }}/api/blueprints/trading/swap-pricing-valuation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `swap_pricer` | Swap Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `swap_id` | text | Yes | Swap identifier |  |
| `swap_family` | select | Yes | ir_swap \| currency_swap \| equity_swap |  |
| `tenor_years` | number | Yes | Swap tenor in years |  |
| `notional` | number | Yes | Notional amount |  |

## Rules

- **par_swap_rate:**
  - **formula:** c = (1 - P(T)) / sum(P(t_i) * delta_i)
  - **interpretation:** Fixed coupon that makes PV of fixed leg equal PV of floating leg at inception
- **swap_as_bonds:**
  - **fixed_payer:** Long floating-rate bond + short fixed-rate bond
  - **fixed_receiver:** Short floating-rate bond + long fixed-rate bond
- **valuation_during_life:**
  - **fixed_rate_swap_value:** V_fix = PV(remaining fixed) - PV(remaining floating)
  - **floating_reset:** Floating leg resets to par at each reset date
- **currency_swap_inception:**
  - **requirement:** PV of both currency legs equal at inception using FX and local curves
- **equity_swap_valuation:**
  - **fixed_receiver:** Pay equity return, receive fixed; value depends on equity index move and discount curve
- **counterparty_valuation_adjustments:**
  - **cva:** Credit Valuation Adjustment — cost of counterparty default
  - **dva:** Debit Valuation Adjustment — own default
  - **fva:** Funding Valuation Adjustment — funding cost of uncollateralised
- **validation:**
  - **swap_required:** swap_id present
  - **valid_family:** swap_family in [ir_swap, currency_swap, equity_swap]
  - **positive_tenor:** tenor_years > 0
  - **positive_notional:** notional > 0

## Outcomes

### Price_swap (Priority: 1)

_Compute par swap rate at inception or mark-to-market value_

**Given:**
- `swap_id` (input) exists
- `swap_family` (input) in `ir_swap,currency_swap,equity_swap`
- `tenor_years` (input) gt `0`
- `notional` (input) gt `0`

**Then:**
- **call_service** target: `swap_pricer`
- **emit_event** event: `swap.priced`

### Invalid_family (Priority: 10) — Error: `SWAP_PRICE_INVALID_FAMILY`

_Unsupported family_

**Given:**
- `swap_family` (input) not_in `ir_swap,currency_swap,equity_swap`

**Then:**
- **emit_event** event: `swap.pricing_rejected`

### Invalid_tenor (Priority: 11) — Error: `SWAP_PRICE_INVALID_TENOR`

_Non-positive tenor_

**Given:**
- `tenor_years` (input) lte `0`

**Then:**
- **emit_event** event: `swap.pricing_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SWAP_PRICE_INVALID_FAMILY` | 400 | swap_family must be ir_swap, currency_swap, or equity_swap | No |
| `SWAP_PRICE_INVALID_TENOR` | 400 | tenor_years must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `swap.priced` |  | `pricing_id`, `swap_id`, `par_rate`, `mark_to_market` |
| `swap.pricing_rejected` |  | `pricing_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| swaps-contracts-features | required |  |
| derivatives-arbitrage-replication | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Swap Pricing Valuation Blueprint",
  "description": "Price interest-rate, currency, and equity swaps at inception (par swap rate) and value during life using spot-curve discounting and replicating portfolios of bo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, swap-pricing, par-swap-rate, swap-valuation, cfa-level-1"
}
</script>
