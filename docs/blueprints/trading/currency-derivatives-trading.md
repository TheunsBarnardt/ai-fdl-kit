---
title: "Currency Derivatives Trading Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "FX derivatives trading with forwards, swaps, options, close-out auctions. 8 fields. 4 outcomes. 4 error codes. rules: trading"
---

# Currency Derivatives Trading Blueprint

> FX derivatives trading with forwards, swaps, options, close-out auctions

| | |
|---|---|
| **Feature** | `currency-derivatives-trading` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, fx, currency |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/currency-derivatives-trading.blueprint.yaml) |
| **JSON API** | [currency-derivatives-trading.json]({{ site.baseurl }}/api/blueprints/trading/currency-derivatives-trading.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `currency_pair` | text | Yes | Currency pair (USDZAR, EURZAR) |  |
| `contract_code` | text | Yes | Contract code |  |
| `contract_type` | select | Yes | Type |  |
| `expiry_date` | date | Yes | Expiry date |  |
| `forward_rate` | number | No | Forward rate |  |
| `notional_amount` | number | Yes | Notional amount |  |
| `order_type` | select | Yes | Order type |  |
| `settlement_type` | select | Yes | Settlement method |  |

## Rules

- **trading:**
  - **fxm_sessions:** Continuous 08:00-17:00 SAST. Opening auction 07:50-08:00.
FX close out auction mandatory at 17:00 each business day.
Volatility auctions on price circuit breaker.

  - **forward_trading:** Quoted as outright rate (spot + forward points). Tenor basis: SP, TN, 1W-12M+.
Settlement via banking (SWIFT, local nostro). T+n settlement per tenor.

  - **fx_swap_trading:** Buy spot + sell forward (or reverse). Near leg T+0, far leg T+n.
Basis quoted as swap points. Interest differential accrued per spec.

  - **option_trading:** European style FX options. Calls and puts on forwards/spot.
Strike in exchange rate. Exercise at expiry if ITM; automatic settlement.

  - **close_out_auction:** Daily 17:00 FX close out. Finalizes day's positions. EOD rates published 17:15.
Spot rates published 10:00, 11:30, EOD. All used for daily MTM.


## Outcomes

### Fx_forward_order_insert (Priority: 1)

**Given:**
- `currency_pair` (input) in `USDZAR,EURZAR,GBPZAR`
- `notional_amount` (input) gt `0`
- `forward_rate` (input) gt `0`

**Then:**
- **create_record**
- **emit_event** event: `order.submitted`

**Result:** FX forward order accepted in order book

### Fx_swap_initiation (Priority: 2)

**Given:**
- `contract_type` (input) eq `W`
- `notional_amount` (input) gt `0`

**Then:**
- **create_record**
- **create_record**
- **emit_event** event: `swap.initiated`

**Result:** Swap created; both legs queued for settlement

### Fx_close_out_auction_uncross (Priority: 5)

**Given:**
- `market_session` (system) eq `FX_CLOSE_OUT`
- `uncross_price` (computed) exists

**Then:**
- **set_field** target: `eod_settlement_price` value: `uncross_price`
- **emit_event** event: `close_out_auction.ended`

**Result:** FX close out auction determines EOD rates; positions marked to market

### Banking_settlement_confirmed (Priority: 9)

**Given:**
- `settlement_status` (db) eq `initiated`
- `banking_confirmation` (input) exists

**Then:**
- **transition_state** field: `settlement_status` from: `initiated` to: `confirmed`
- **emit_event** event: `settlement.spot_initiated`

**Result:** Settlement confirmed; proceeds to completion on settlement date

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURRENCY_PAIR_NOT_SUPPORTED` | 400 | Currency pair not actively traded | No |
| `INVALID_TENOR` | 400 | Settlement tenor not available | No |
| `FX_SETTLEMENT_FAILED` | 500 | Banking system failed to settle FX delivery | No |
| `CLOSE_OUT_AUCTION_FAILED` | 500 | FX close out auction engine error | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.submitted` |  | `order_id`, `currency_pair`, `amount` |
| `forward.initiated` |  | `forward_id`, `pair`, `rate`, `tenor` |
| `swap.initiated` |  | `swap_id`, `near_leg`, `far_leg` |
| `settlement.spot_initiated` |  | `settlement_id`, `amount`, `rate` |
| `close_out_auction.ended` |  | `currency_pair`, `close_out_rate` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-market-overview | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Derivatives Trading Blueprint",
  "description": "FX derivatives trading with forwards, swaps, options, close-out auctions. 8 fields. 4 outcomes. 4 error codes. rules: trading",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, fx, currency"
}
</script>
