---
title: "Interest Rate Derivatives Trading Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Interest rate derivatives trading with NUTRON API, conformance, and settlement. 8 fields. 3 outcomes. 4 error codes. rules: trading"
---

# Interest Rate Derivatives Trading Blueprint

> Interest rate derivatives trading with NUTRON API, conformance, and settlement

| | |
|---|---|
| **Feature** | `interest-rate-derivatives-trading` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, fixed-income |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/interest-rate-derivatives-trading.blueprint.yaml) |
| **JSON API** | [interest-rate-derivatives-trading.json]({{ site.baseurl }}/api/blueprints/trading/interest-rate-derivatives-trading.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contract_code` | text | Yes | Contract code |  |
| `contract_type` | select | Yes | Type |  |
| `expiry_date` | date | Yes | Expiry date |  |
| `position_quantity` | number | Yes | Quantity |  |
| `order_price` | number | Yes | Price |  |
| `order_type` | select | Yes | Order type |  |
| `tif` | select | Yes | Time in force |  |
| `settlement_type` | select | Yes | Settlement method |  |

## Rules

- **trading:**
  - **session_management:** Continuous 08:00-17:00 SAST. Opening auction 07:50-08:00. Closing auction at EOD.
Volatility auctions triggered by circuit breaker. Normal book continuous session.
Reported trading allowed; must match within bands. Trade negotiation sessions available.

  - **order_insert:** Order insert (msg 56) with contract code, quantity, price, TIF, order type.
Validation checks: contract exists, quantity > 0, price valid, margin sufficient.

  - **price_controls:** Circuit breaker at tolerance threshold from dynamic reference price.
Static ref = previous close; dynamic ref updated throughout day.
Price bands enforce minimum tick size and maximum lot size.

  - **settlement:** Futures: Daily MTM settlement to margin account. Options: Physical or cash settlement.
Repo: T+0 or T+n per agreement; collateral transfer via banking system.


## Outcomes

### Order_insert_success (Priority: 1)

**Given:**
- `contract_code` (input) exists
- `position_quantity` (input) gt `0`
- `order_price` (input) gte `0`

**Then:**
- **create_record**
- **emit_event** event: `order.accepted`

**Result:** Order accepted; active in order book

### Circuit_breaker_halt (Priority: 2) — Error: `CIRCUIT_BREAKER_TRIGGERED`

**Given:**
- `price_change_pct` (computed) gte `circuit_breaker_tolerance`

**Then:**
- **emit_event** event: `circuit_breaker.triggered`

**Result:** Volatility auction initiated

### Order_fill_on_match (Priority: 10)

**Given:**
- `order_status` (db) eq `active`
- `incoming_trade_price` (input) eq `order_price`

**Then:**
- **emit_event** event: `order.filled`
- **create_record**

**Result:** Order matched and filled; trade recorded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_VALIDATION_FAILED` | 400 | Order parameters violate market rules | No |
| `INSUFFICIENT_MARGIN` | 403 | Account margin below required threshold | No |
| `CONTRACT_NOT_FOUND` | 404 | Requested contract does not exist | No |
| `CIRCUIT_BREAKER_TRIGGERED` | 503 | Trading halted; volatility auction in progress | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.submitted` |  | `order_id`, `contract_code`, `quantity` |
| `order.accepted` |  | `order_id`, `status` |
| `order.filled` |  | `order_id`, `filled_quantity`, `price` |
| `trade.executed` |  | `trade_id`, `contract_code`, `quantity`, `price` |
| `settlement.marked_to_market` |  | `position_id`, `mtm_price`, `pnl` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-market-overview | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Interest Rate Derivatives Trading Blueprint",
  "description": "Interest rate derivatives trading with NUTRON API, conformance, and settlement. 8 fields. 3 outcomes. 4 error codes. rules: trading",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, fixed-income"
}
</script>
