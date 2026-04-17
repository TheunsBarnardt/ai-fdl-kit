---
title: "Jse Trading Operational Rules Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "JSE trading operational rules covering order types, time-in-force, auction session matching, self-match prevention, trade conformance. 3 fields. 3 outcomes. 2 e"
---

# Jse Trading Operational Rules Blueprint

> JSE trading operational rules covering order types, time-in-force, auction session matching, self-match prevention, trade conformance

| | |
|---|---|
| **Feature** | `jse-trading-operational-rules` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | jse-rules, operational-rules, order-management, auction, conformance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/jse-trading-operational-rules.blueprint.yaml) |
| **JSON API** | [jse-trading-operational-rules.json]({{ site.baseurl }}/api/blueprints/trading/jse-trading-operational-rules.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rule_category` | select | Yes | Rule Category |  |
| `effective_date` | date | Yes | Effective Date |  |
| `application_scope` | select | No | Scope (Equity, Derivatives, Bonds) |  |

## Rules

- **order_types:**
  - **market_order:** Immediate execution at best available price
  - **limit_order:** Execution at specified price or better
  - **market_to_limit:** Market execution; unfilled portion becomes limit order
  - **iceberg:** Visible tranche only; hidden balance replenishes as visible fills
  - **pegged_order:** Price pegged to bid/ask; dynamic tracking of market
- **time_in_force:**
  - **day:** Order valid for trading day only; cancels at close
  - **gtc:** Good Till Cancelled; remains active until filled or cancelled
  - **ioc:** Immediate Or Cancel; unfilled portion cancelled immediately
  - **fok:** Fill Or Kill; entire order must fill or entire order cancelled
  - **gtt:** Good Till Time; active until specified time/date
- **auction:**
  - **opening_auction:** Pre-market price discovery; volume aggregation; single-price clearing
  - **closing_auction:** End-of-day final price; prevents manipulation near close
  - **intraday_auction:** Halt-related auctions for instrument resumption
- **self_match:**
  - **prevention_rule:** System rejects orders that would create self-trade (same account cross)
  - **exceptions:** Permitted for portfolio rebalancing with specific approval
- **conformance:**
  - **trade_reporting:** All trades reported to regulator within specified timeline
  - **data_validation:** Trade details validated against master data before acceptance
  - **dispute_resolution:** Trade matching disputes resolved per standard procedures

## Outcomes

### Enforce_order_type_rules (Priority: 1)

_Enforce order type submission and execution rules_

**Given:**
- `rule_category` (input) eq `order_types`

**Then:**
- **emit_event** event: `order_validated`

### Prevent_self_match (Priority: 2)

_Prevent self-matching trades_

**Given:**
- `rule_category` (input) eq `self_match`

**Then:**
- **emit_event** event: `self_match_prevented`

### Validate_trade_conformance (Priority: 3)

_Validate trade against conformance rules_

**Given:**
- `application_scope` (input) exists

**Then:**
- **emit_event** event: `trade_conformed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SELF_MATCH_DETECTED` | 409 | Order would create self-match | No |
| `CONFORMANCE_VIOLATION` | 422 | Trade violates conformance rules | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.validated` |  | `order_id`, `order_type`, `tif` |
| `self_match.prevented` |  | `order_id`, `account_code` |
| `trade.conformed` |  | `trade_id`, `conformance_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trading-gateway-fix | required |  |
| post-trade-gateway-fix | required |  |
| reference-data-management | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
order_type_codes:
  - code: 1
    name: Market
  - code: 2
    name: Limit
  - code: 4
    name: MarketToLimit
  - code: E
    name: Iceberg
  - code: P
    name: Pegged
tif_codes:
  - code: 0
    name: Day
  - code: 1
    name: GTC
  - code: 3
    name: IOC
  - code: 4
    name: FOK
  - code: 6
    name: GTT
auction_types:
  - type: OpeningAuction
    time: 08:00
    clearing: single_price
  - type: ClosingAuction
    time: 16:50
    clearing: single_price
  - type: HaltAuction
    trigger: trading_halt
    duration: until_resume
self_match_exceptions:
  - exception: PortfolioRebalancing
    approval_required: true
  - exception: ArbitrageActivity
    approval_required: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Jse Trading Operational Rules Blueprint",
  "description": "JSE trading operational rules covering order types, time-in-force, auction session matching, self-match prevention, trade conformance. 3 fields. 3 outcomes. 2 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "jse-rules, operational-rules, order-management, auction, conformance"
}
</script>
