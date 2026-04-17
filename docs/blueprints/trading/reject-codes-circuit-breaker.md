---
title: "Reject Codes Circuit Breaker Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "New reject code 1227 for IOC (Immediate-or-Cancel) and FOK (Fill-or-Kill) orders that expire due to circuit breaker threshold breaches. Ensures clear feedback t"
---

# Reject Codes Circuit Breaker Blueprint

> New reject code 1227 for IOC (Immediate-or-Cancel) and FOK (Fill-or-Kill) orders that expire
due to circuit breaker threshold breaches. Ensures clear feedback to traders when orders are
rejected due to circuit breaker activation in equity, equity derivative, and currency
derivative markets. Introduced in JSE Release 7.8.


| | |
|---|---|
| **Feature** | `reject-codes-circuit-breaker` |
| **Category** | Trading |
| **Version** | 1.0 |
| **Tags** | error-handling, order-validation, circuit-breaker, release-7.8 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/reject-codes-circuit-breaker.blueprint.yaml) |
| **JSON API** | [reject-codes-circuit-breaker.json]({{ site.baseurl }}/api/blueprints/trading/reject-codes-circuit-breaker.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trading_participant` | Trading Participant | human |  |
| `jse_trading_system` | JSE Trading System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | token | Yes |  |  |
| `order_type` | select | Yes |  |  |
| `reject_code` | number | Yes |  |  |
| `circuit_breaker_threshold_breached` | boolean | Yes |  |  |
| `protocol_type` | select | Yes |  |  |
| `market` | select | Yes |  |  |
| `order_status` | select | Yes |  |  |
| `reject_reason` | select | Yes |  |  |

## Outcomes

### 0 (Priority: 1)

_IOC/FOK order expires and reject code 1227 sent when circuit breaker threshold breached_

**Given:**
- `order_type` (input) in `IOC,FOK`
- `circuit_breaker_threshold_breached` (system) eq `true`

**Then:**
- **set_field** target: `reject_code` value: `1227`

### 1 (Priority: 2)

_Native protocol users receive reject code 1227 in Execution Report Reject Code field_

**Given:**
- `protocol_type` (system) eq `NATIVE`
- `reject_reason` (system) eq `CIRCUIT_BREAKER_BREACH`

**Then:**
- **emit_event** event: `order.rejection_sent`

### 2 (Priority: 3)

_FIX protocol users receive reject code 1227 in Tag 103 (OrdRejReason)_

**Given:**
- `protocol_type` (system) eq `FIX`
- `reject_reason` (system) eq `CIRCUIT_BREAKER_BREACH`

**Then:**
- **emit_event** event: `order.rejection_sent`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REJECT_CODE_1227_CIRCUIT_BREAKER` |  | IOC/FOK order rejected: Circuit breaker threshold breached | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| circuit-breaker-system | required |  |
| order-validation | required |  |
| ioc-fok-orders | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Reject Codes Circuit Breaker Blueprint",
  "description": "New reject code 1227 for IOC (Immediate-or-Cancel) and FOK (Fill-or-Kill) orders that expire\ndue to circuit breaker threshold breaches. Ensures clear feedback t",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "error-handling, order-validation, circuit-breaker, release-7.8"
}
</script>
