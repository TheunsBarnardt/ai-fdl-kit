---
title: "Swaps Contracts Features Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Characterise interest-rate, currency, equity, and credit-default swaps — notional, payment legs, reset frequency, and collateralisation — and describe how swaps"
---

# Swaps Contracts Features Blueprint

> Characterise interest-rate, currency, equity, and credit-default swaps — notional, payment legs, reset frequency, and collateralisation — and describe how swaps transform cash-flow exposures

| | |
|---|---|
| **Feature** | `swaps-contracts-features` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, swaps, interest-rate-swap, currency-swap, equity-swap, cds, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/swaps-contracts-features.blueprint.yaml) |
| **JSON API** | [swaps-contracts-features.json]({{ site.baseurl }}/api/blueprints/trading/swaps-contracts-features.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `swap_engine` | Swap Contract Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `swap_id` | text | Yes | Swap identifier |  |
| `swap_family` | select | Yes | ir_swap \| currency_swap \| equity_swap \| credit_swap \| commodity_swap \| variance_swap |  |
| `notional` | number | Yes | Notional amount |  |
| `payer_leg` | select | No | fixed \| floating \| equity \| credit_protection |  |
| `receiver_leg` | select | No | fixed \| floating \| equity \| credit_protection |  |

## Rules

- **plain_vanilla_irs:**
  - **structure:** Fixed payer / fixed receiver vs floating leg
  - **reference:** SOFR, EURIBOR, TONAR
  - **reset:** Quarterly or semi-annual
  - **use:** Convert fixed debt to floating or vice versa
- **currency_swap:**
  - **structure:** Exchange principal and interest in two currencies
  - **uses:** FX funding; hedge cross-currency debt
  - **settlement:** Principal exchanged at start and maturity
- **equity_swap:**
  - **structure:** Pay fixed or floating; receive equity index return
  - **uses:** Synthetic equity exposure; avoid direct ownership taxes
- **credit_default_swap:**
  - **structure:** Protection buyer pays premium; seller compensates on credit event
  - **index_cds:** CDX and iTraxx cover baskets
  - **uses:** Hedge credit exposure; express views on credit
- **commodity_swap:**
  - **structure:** Fixed vs floating commodity price
  - **uses:** Corporate hedging of input/output prices
- **variance_volatility_swap:**
  - **structure:** Pay fixed variance/vol; receive realised
  - **uses:** Trade volatility directly without delta risk
- **counterparty_risk:**
  - **bilateral:** Subject to default of either party
  - **clearing:** CCPs standardise via margin and netting
  - **isda_master:** Industry standard documentation
- **validation:**
  - **swap_required:** swap_id present
  - **valid_family:** swap_family in allowed set
  - **positive_notional:** notional > 0

## Outcomes

### Record_swap (Priority: 1)

_Record swap structure and legs_

**Given:**
- `swap_id` (input) exists
- `swap_family` (input) in `ir_swap,currency_swap,equity_swap,credit_swap,commodity_swap,variance_swap`
- `notional` (input) gt `0`

**Then:**
- **call_service** target: `swap_engine`
- **emit_event** event: `swap.recorded`

### Invalid_family (Priority: 10) — Error: `SWAP_INVALID_FAMILY`

_Unsupported swap family_

**Given:**
- `swap_family` (input) not_in `ir_swap,currency_swap,equity_swap,credit_swap,commodity_swap,variance_swap`

**Then:**
- **emit_event** event: `swap.rejected`

### Invalid_notional (Priority: 11) — Error: `SWAP_INVALID_NOTIONAL`

_Non-positive notional_

**Given:**
- `notional` (input) lte `0`

**Then:**
- **emit_event** event: `swap.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SWAP_INVALID_FAMILY` | 400 | swap_family must be one of the supported families | No |
| `SWAP_INVALID_NOTIONAL` | 400 | notional must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `swap.recorded` |  | `swap_id`, `family`, `notional`, `payer_leg`, `receiver_leg` |
| `swap.rejected` |  | `swap_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| swap-pricing-valuation | required |  |
| derivatives-instrument-features | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Swaps Contracts Features Blueprint",
  "description": "Characterise interest-rate, currency, equity, and credit-default swaps — notional, payment legs, reset frequency, and collateralisation — and describe how swaps",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, swaps, interest-rate-swap, currency-swap, equity-swap, cds, cfa-level-1"
}
</script>
