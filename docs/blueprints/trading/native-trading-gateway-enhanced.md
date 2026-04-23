---
title: "Native Trading Gateway Enhanced Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Enhanced Native Trading Gateway protocol for derivative instrument trading with multi-leg order support and advanced quote management. 6 fields. 2 outcomes. 4 e"
---

# Native Trading Gateway Enhanced Blueprint

> Enhanced Native Trading Gateway protocol for derivative instrument trading with multi-leg order support and advanced quote management

| | |
|---|---|
| **Feature** | `native-trading-gateway-enhanced` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | native-protocol, derivatives, order-management, execution-reporting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/native-trading-gateway-enhanced.blueprint.yaml) |
| **JSON API** | [native-trading-gateway-enhanced.json]({{ site.baseurl }}/api/blueprints/trading/native-trading-gateway-enhanced.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_order_id` | text | Yes | Client order reference |  |
| `instrument_id` | text | Yes | Instrument security identifier |  |
| `order_side` | select | Yes | Trade direction |  |
| `order_quantity` | number | Yes | Order quantity in contracts |  |
| `order_type` | select | Yes | Order type |  |
| `price` | number | No | Limit price per contract |  |

## Rules

- **protocol_specification:**
  - **binary_format:** Binary little-endian protocol optimized for low-latency trading
  - **session_based:** Client authentication via CompID and password required before trading
  - **dual_channels:** Real-time channel for orders and execution; recovery channel for historical messages
  - **heartbeat_requirement:** Bidirectional heartbeat exchange maintains session liveness
- **message_validation:**
  - **two_layer_validation:** Level 1: format validation; Level 2: business rule validation
  - **required_fields_enforcement:** Missing required fields result in Reject message with error code
- **order_handling:**
  - **order_types:** Market, Limit, Stop, Cross orders; User-defined strategies
  - **time_in_force:** DAY, GTC, IOC, FOK
  - **order_operations:** Submit, cancel, cancel/replace, mass cancel operations
- **recovery:**
  - **missed_message_request:** Client sends Missed Message Request specifying sequence range
  - **message_replay:** Server streams historical messages in original sequence order

## Outcomes

### Validation (Priority: 1)

_Validates message format and data types_

**Given:**
- Order message received

**Then:**
- Check format and data types
- Verify required fields

**Result:** Message accepted or rejected

### Execution (Priority: 5)

_Order matches liquidity and executes_

**Given:**
- Validation passes
- Liquidity available

**Then:**
- Execute against counterparty
- Send Execution Report

**Result:** Trade executed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_MESSAGE` | 400 | Message format validation failed | No |
| `SESSION_NOT_ESTABLISHED` | 401 | Client not authenticated | No |
| `INSTRUMENT_NOT_FOUND` | 404 | Unknown instrument | No |
| `SYSTEM_UNAVAILABLE` | 503 | Gateway temporarily unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.submitted` |  | `client_order_id`, `instrument_id` |
| `order.filled` |  | `order_id`, `cum_qty` |
| `order.rejected` |  | `client_order_id`, `reject_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| native-trading-gateway-basic | extends | Builds on L1 foundations — prerequisite before this level's material |
| client-failure-recovery | required |  |

## AGI Readiness

### Goals

#### Reliable Native Trading Gateway Enhanced

Enhanced Native Trading Gateway protocol for derivative instrument trading with multi-leg order support and advanced quote management

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
    - REJECT
  orders:
    - NEW_ORDER
    - ORDER_CANCEL_REQUEST
    - ORDER_CANCEL_REPLACE_REQUEST
  responses:
    - EXECUTION_REPORT
    - ORDER_CANCEL_REJECT
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Native Trading Gateway Enhanced Blueprint",
  "description": "Enhanced Native Trading Gateway protocol for derivative instrument trading with multi-leg order support and advanced quote management. 6 fields. 2 outcomes. 4 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "native-protocol, derivatives, order-management, execution-reporting"
}
</script>
