---
title: "Order Types Execution Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify and validate trading orders — market, limit, stop, stop-limit — along with validity and clearing instructions that govern execution behaviour. 6 fields"
---

# Order Types Execution Blueprint

> Classify and validate trading orders — market, limit, stop, stop-limit — along with validity and clearing instructions that govern execution behaviour

| | |
|---|---|
| **Feature** | `order-types-execution` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, orders, market-microstructure, execution, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/order-types-execution.blueprint.yaml) |
| **JSON API** | [order-types-execution.json]({{ site.baseurl }}/api/blueprints/trading/order-types-execution.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `order_validator` | Order Validation Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Order identifier |  |
| `side` | select | Yes | buy \| sell |  |
| `order_type` | select | Yes | market \| limit \| stop \| stop_limit |  |
| `limit_price` | number | No | Limit price (required for limit / stop_limit) |  |
| `stop_price` | number | No | Stop trigger price (required for stop / stop_limit) |  |
| `time_in_force` | select | Yes | day \| gtc \| ioc \| fok \| gtd |  |

## Rules

- **order_types:**
  - **market:** Execute immediately at best available price; price uncertain
  - **limit:** Execute at limit price or better; execution uncertain
  - **stop:** Becomes market when stop triggered; used to cut losses
  - **stop_limit:** Becomes limit when stop triggered; both price and execution uncertain
- **time_in_force:**
  - **day:** Cancels at end of trading day
  - **gtc:** Good till cancelled
  - **ioc:** Immediate-or-cancel; partial fills allowed
  - **fok:** Fill-or-kill; complete or cancel
  - **gtd:** Good till date
- **execution_instructions:**
  - **all_or_none:** No partial fills
  - **iceberg:** Hide quantity; display only a tip
  - **hidden:** Not displayed in book
- **clearing_instructions:**
  - **normal:** Standard T+2 settlement
  - **cash:** Same-day settlement
  - **next_day:** T+1
- **validation:**
  - **order_required:** order_id present
  - **valid_type:** order_type in allowed set
  - **limit_price_for_limit:** limit_price required when order_type in [limit, stop_limit]
  - **stop_price_for_stop:** stop_price required when order_type in [stop, stop_limit]

## Outcomes

### Validate_order (Priority: 1)

_Accept a well-formed order for routing_

**Given:**
- `order_id` (input) exists
- `side` (input) in `buy,sell`
- `order_type` (input) in `market,limit,stop,stop_limit`
- `time_in_force` (input) in `day,gtc,ioc,fok,gtd`

**Then:**
- **call_service** target: `order_validator`
- **emit_event** event: `order.accepted`

### Invalid_type (Priority: 10) — Error: `ORDER_INVALID_TYPE`

_Unsupported order type_

**Given:**
- `order_type` (input) not_in `market,limit,stop,stop_limit`

**Then:**
- **emit_event** event: `order.rejected`

### Missing_limit_price (Priority: 11) — Error: `ORDER_MISSING_LIMIT_PRICE`

_Limit or stop-limit order missing limit price_

**Given:**
- ALL: `order_type` (input) in `limit,stop_limit` AND `limit_price` (input) not_exists

**Then:**
- **emit_event** event: `order.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_INVALID_TYPE` | 400 | order_type must be market, limit, stop, or stop_limit | No |
| `ORDER_MISSING_LIMIT_PRICE` | 400 | limit_price is required for limit and stop_limit orders | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.accepted` |  | `order_id`, `side`, `order_type`, `time_in_force` |
| `order.rejected` |  | `order_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| financial-markets-functions | recommended |  |
| positions-leverage-margin | recommended |  |

## AGI Readiness

### Goals

#### Reliable Order Types Execution

Classify and validate trading orders — market, limit, stop, stop-limit — along with validity and clearing instructions that govern execution behaviour

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| validate_order | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |
| missing_limit_price | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Types Execution Blueprint",
  "description": "Classify and validate trading orders — market, limit, stop, stop-limit — along with validity and clearing instructions that govern execution behaviour. 6 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, orders, market-microstructure, execution, cfa-level-1"
}
</script>
