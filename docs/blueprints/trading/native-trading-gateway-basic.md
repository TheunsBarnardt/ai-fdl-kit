---
title: "Native Trading Gateway Basic Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Basic Native Trading Gateway protocol for standard equity order submission and execution tracking. 6 fields. 2 outcomes. 4 error codes. rules: protocol, order_h"
---

# Native Trading Gateway Basic Blueprint

> Basic Native Trading Gateway protocol for standard equity order submission and execution tracking

| | |
|---|---|
| **Feature** | `native-trading-gateway-basic` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | native-protocol, equity-orders |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/native-trading-gateway-basic.blueprint.yaml) |
| **JSON API** | [native-trading-gateway-basic.json]({{ site.baseurl }}/api/blueprints/trading/native-trading-gateway-basic.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_order_id` | text | Yes | Client order reference |  |
| `instrument_id` | text | Yes | Instrument identifier |  |
| `order_side` | select | Yes | Order direction |  |
| `order_quantity` | number | Yes | Order quantity |  |
| `order_type` | select | Yes | Order type |  |
| `price` | number | No | Limit price |  |

## Rules

- **protocol:**
  - **binary_format:** Binary little-endian protocol
  - **session_based:** Client authentication via CompID and password
  - **heartbeat_requirement:** Periodic heartbeat maintains session
- **order_handling:**
  - **order_types:** Market and Limit orders
  - **time_in_force:** DAY, GTC, IOC, FOK

## Outcomes

### Validation (Priority: 1)

_Validates message format_

**Given:**
- Order received

**Then:**
- Check format and data types

**Result:** Accepted or rejected

### Execution (Priority: 5)

_Order executes against liquidity_

**Given:**
- Validation passes

**Then:**
- Execute trade

**Result:** Trade executed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_MESSAGE` | 400 | Message format validation failed | No |
| `SESSION_NOT_ESTABLISHED` | 401 | Client not authenticated | No |
| `INSTRUMENT_NOT_FOUND` | 404 | Unknown instrument | No |
| `SYSTEM_UNAVAILABLE` | 503 | Gateway unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.submitted` |  | `client_order_id` |
| `order.filled` |  | `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-failure-recovery | required |  |

## AGI Readiness

### Goals

#### Reliable Native Trading Gateway Basic

Basic Native Trading Gateway protocol for standard equity order submission and execution tracking

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

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `client_failure_recovery` | client-failure-recovery | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| validation | `autonomous` | - | - |
| execution | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
message_types:
  administrative:
    - LOGON
    - LOGOUT
    - HEARTBEAT
  orders:
    - NEW_ORDER
    - ORDER_CANCEL_REQUEST
  responses:
    - EXECUTION_REPORT
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Native Trading Gateway Basic Blueprint",
  "description": "Basic Native Trading Gateway protocol for standard equity order submission and execution tracking. 6 fields. 2 outcomes. 4 error codes. rules: protocol, order_h",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "native-protocol, equity-orders"
}
</script>
