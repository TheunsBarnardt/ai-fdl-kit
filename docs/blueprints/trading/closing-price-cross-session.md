---
title: "Closing Price Cross Session Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Closing Price Cross (CPX) session enables market participants to trade in the central order book at the official closing price once determined. Introduces new T"
---

# Closing Price Cross Session Blueprint

> Closing Price Cross (CPX) session enables market participants to trade in the central order book
at the official closing price once determined. Introduces new Time in Force (TIF) of CPX for
order direction, with two new trading sessions: Closing Price Publication (CPP) and Closing
Price Cross (CPX). CPX session initially pilot-phase for segment ZA01 only.


| | |
|---|---|
| **Feature** | `closing-price-cross-session` |
| **Category** | Trading |
| **Version** | 1.0 |
| **Tags** | equity-market, trading-session, order-management, closing-price |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/closing-price-cross-session.blueprint.yaml) |
| **JSON API** | [closing-price-cross-session.json]({{ site.baseurl }}/api/blueprints/trading/closing-price-cross-session.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_participant` | Market Participant | human |  |
| `jse_trading_system` | JSE Trading System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | token | Yes |  |  |
| `order_type` | select | Yes |  |  |
| `order_tif` | select | Yes |  |  |
| `order_price` | number | No |  |  |
| `quantity` | number | Yes |  |  |
| `segment` | select | Yes |  |  |
| `session_status` | select | Yes |  |  |
| `published_closing_price` | number | Yes |  |  |
| `closing_price_has_decimals` | boolean | Yes |  |  |
| `order_status` | select | Yes |  |  |
| `amendment_type` | select | No |  |  |

## States

**State field:** `session_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `cpp_session` |  |  |
| `cpx_session` |  |  |
| `post_close` |  |  |

## Outcomes

### 0 (Priority: 1)

_CPX session begins after CPP completion and published closing price exists_

**Given:**
- `closing_price_published` (system) exists
- `cpp_session_completed` (system) exists
- `segment` (db) eq `ZA01`

**Then:**
- **transition_state** field: `session_status` from: `cpp_session` to: `cpx_session`

### 1 (Priority: 2)

_New orders with valid TIF types (CPX, IOC, FOK, DAY, GTT, GTC, GTD) are accepted during CPX session_

**Given:**
- `session_status` (system) eq `cpx_session`
- `order_tif` (input) in `CPX,IOC,FOK,DAY,GTT,GTC,GTD`

**Then:**
- **set_field** target: `order_status` value: `accepted`

### 2 (Priority: 3)

_Market orders with valid TIF are accepted and converted to limit orders if not fully matched_

**Given:**
- `session_status` (system) eq `cpx_session`
- `order_type` (input) eq `MARKET`
- `order_tif` (input) in `CPX,IOC,FOK,DAY,GTT,GTC,GTD`

**Then:**
- **set_field** target: `order_status` value: `accepted_to_orderbook`
- **emit_event** event: `cpx.market_order_accepted`

### 3 (Priority: 4)

_Limit orders accepted only if price exactly matches published closing price_

**Given:**
- `session_status` (system) eq `cpx_session`
- `order_type` (input) eq `LIMIT`
- `order_price` (input) eq `published_closing_price`

**Then:**
- **set_field** target: `order_status` value: `accepted_to_orderbook`

### 4 (Priority: 5)

_Limit orders rejected when published closing price contains decimals_

**Given:**
- `session_status` (system) eq `cpx_session`
- `order_type` (input) eq `LIMIT`
- `closing_price_has_decimals` (system) eq `true`

**Then:**
- **set_field** target: `order_status` value: `rejected`
- **emit_event** event: `cpx.limit_order_rejected_decimal_price`

### 5 (Priority: 6)

_Specific order types rejected during CPX session_

**Given:**
- `session_status` (system) eq `cpx_session`
- ANY: `order_tif` (input) in `GFA,GFX,OPG,ATC` OR `order_type` (input) in `STOP,STOP_LIMIT,HIDDEN_LIMIT`

**Then:**
- **set_field** target: `order_status` value: `rejected`

### 6 (Priority: 7)

_Price amendments rejected once CPX session begins_

**Given:**
- `session_status` (system) eq `cpx_session`
- `amendment_type` (input) eq `PRICE`

**Then:**
- **set_field** target: `amendment_status` value: `rejected`

### 7 (Priority: 8)

_No new orders allowed during CPP session, only cancellations_

**Given:**
- `session_status` (system) eq `cpp_session`
- `action_type` (input) eq `NEW_ORDER`

**Then:**
- **set_field** target: `action_status` value: `rejected`

### 8 (Priority: 9)

_CPP session starts after closing auction or continuous trading completion_

**Given:**
- `auction_completed` (system) exists
- `auction_extensions_resolved` (system) eq `true`

**Then:**
- **transition_state** field: `session_status` from: `continuous_trading` to: `cpp_session`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CPX_SESSION_NO_CLOSING_PRICE` |  | CPX session cannot start - no published closing price available | No |
| `CPX_INVALID_ORDER_TYPE` |  | Order type not allowed during CPX session | No |
| `CPX_LIMIT_ORDER_PRICE_MISMATCH` |  | Limit order price does not match published closing price | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-market-trading | required |  |
| order-management | required |  |
| circuit-breaker-system | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Closing Price Cross Session Blueprint",
  "description": "Closing Price Cross (CPX) session enables market participants to trade in the central order book\nat the official closing price once determined. Introduces new T",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-market, trading-session, order-management, closing-price"
}
</script>
