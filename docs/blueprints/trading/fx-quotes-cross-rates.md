---
title: "Fx Quotes Cross Rates Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Interpret direct and indirect FX quotes, convert between base/quote currencies, compute cross rates, and apply bid-ask spreads to client-side execution. 4 field"
---

# Fx Quotes Cross Rates Blueprint

> Interpret direct and indirect FX quotes, convert between base/quote currencies, compute cross rates, and apply bid-ask spreads to client-side execution

| | |
|---|---|
| **Feature** | `fx-quotes-cross-rates` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, foreign-exchange, fx-quote, cross-rate, bid-ask, spot-rate, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fx-quotes-cross-rates.blueprint.yaml) |
| **JSON API** | [fx-quotes-cross-rates.json]({{ site.baseurl }}/api/blueprints/trading/fx-quotes-cross-rates.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_pricing_engine` | FX Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pair` | text | Yes | Currency pair (e.g., EUR/USD) |  |
| `bid` | number | Yes | Market bid price |  |
| `ask` | number | Yes | Market ask price |  |
| `notional` | number | No | Trade notional in base currency |  |

## Rules

- **quote_conventions:**
  - **pair_notation:** base/quote — 1 unit of base currency expressed in quote currency
  - **direct_quote:** Domestic currency per unit of foreign (e.g., USD per EUR for a US investor)
  - **indirect_quote:** Foreign currency per unit of domestic
- **bid_ask_mechanics:**
  - **bid:** Dealer buys base at bid (client sells base at bid)
  - **ask:** Dealer sells base at ask (client buys base at ask)
  - **spread:** ask - bid; wider for EM, illiquid pairs, volatile conditions
  - **client_side:** Client always transacts at the worse side of the spread
- **cross_rate_formula:**
  - **via_common_currency:** A/C = A/B * B/C
  - **inverse:** C/A = 1 / (A/B * B/C)
- **cross_with_bid_ask:**
  - **calculation:** Cross bid = bid(A/B) * bid(B/C); cross ask = ask(A/B) * ask(B/C)
- **triangular_arbitrage:**
  - **opportunity:** If market cross != implied cross beyond spread, arbitrage exists
- **validation:**
  - **pair_required:** pair present
  - **valid_prices:** 0 < bid <= ask

## Outcomes

### Compute_cross_rate (Priority: 1)

_Produce bid/ask quotes for client execution_

**Given:**
- `pair` (input) exists
- `bid` (input) gt `0`
- `ask` (input) gt `0`

**Then:**
- **call_service** target: `fx_pricing_engine`
- **emit_event** event: `fx.quote_computed`

### Invalid_prices (Priority: 10) — Error: `FX_INVALID_PRICE`

_Bid/ask inconsistent_

**Given:**
- ANY: `bid` (input) lte `0` OR `ask` (input) lte `0`

**Then:**
- **emit_event** event: `fx.quote_rejected`

### Missing_pair (Priority: 11) — Error: `FX_PAIR_MISSING`

_Currency pair missing_

**Given:**
- `pair` (input) not_exists

**Then:**
- **emit_event** event: `fx.quote_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FX_INVALID_PRICE` | 400 | bid and ask must be positive | No |
| `FX_PAIR_MISSING` | 400 | pair is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx.quote_computed` |  | `quote_id`, `pair`, `bid`, `ask`, `mid`, `spread_bps` |
| `fx.quote_rejected` |  | `quote_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forward-rates-interest-rate-parity | recommended |  |
| exchange-rate-regimes | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fx Quotes Cross Rates Blueprint",
  "description": "Interpret direct and indirect FX quotes, convert between base/quote currencies, compute cross rates, and apply bid-ask spreads to client-side execution. 4 field",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, foreign-exchange, fx-quote, cross-rate, bid-ask, spot-rate, cfa-level-1"
}
</script>
