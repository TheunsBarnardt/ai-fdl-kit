---
title: "Drop Copy Gateway Fix Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Drop Copy Gateway providing FIX 5.0 SP2 protocol for near-real-time trade stream dissemination. 6 fields. 2 outcomes. 3 error codes. rules: protocol, trade_repo"
---

# Drop Copy Gateway Fix Blueprint

> Drop Copy Gateway providing FIX 5.0 SP2 protocol for near-real-time trade stream dissemination

| | |
|---|---|
| **Feature** | `drop-copy-gateway-fix` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, drop-copy, trade-dissemination |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/drop-copy-gateway-fix.blueprint.yaml) |
| **JSON API** | [drop-copy-gateway-fix.json]({{ site.baseurl }}/api/blueprints/trading/drop-copy-gateway-fix.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `execution_id` | text | Yes | Execution identifier |  |
| `order_id` | text | Yes | Order ID |  |
| `instrument_id` | text | Yes | Security identifier |  |
| `side` | select | Yes | Trade direction |  |
| `execution_qty` | number | Yes | Executed quantity |  |
| `execution_price` | number | Yes | Execution price |  |

## Rules

- **protocol:**
  - **fix_version:** FIX 5.0 Service Pack 2
  - **direction:** Server-to-client (receive-only)
  - **message_format:** Binary FIXT-formatted messages
- **trade_reporting:**
  - **message_type:** Execution Report with full party details
  - **timing:** Near real-time delivery
  - **completeness:** All executed trades disseminated

## Outcomes

### Trade_execution (Priority: 1)

_Trade matches on exchange_

**Given:**
- Buy and sell orders match

**Then:**
- Generate Execution Report

**Result:** Trade available for dissemination

### Trade_dissemination (Priority: 5)

_Trade reported to subscribers_

**Given:**
- Execution Report generated

**Then:**
- Send to drop copy clients

**Result:** Trade delivered

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONNECTION_FAILED` | 500 | Cannot establish connection | No |
| `HEARTBEAT_TIMEOUT` | 503 | No heartbeat from counterparty | No |
| `RECOVERY_UNAVAILABLE` | 503 | Recovery channel unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trade.executed` |  | `execution_id`, `order_id`, `side` |
| `trade.disseminated` |  | `execution_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-failure-recovery | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
message_types:
  administrative:
    - LOGON
    - LOGOUT
    - HEARTBEAT
  trading:
    - EXECUTION_REPORT
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Drop Copy Gateway Fix Blueprint",
  "description": "Drop Copy Gateway providing FIX 5.0 SP2 protocol for near-real-time trade stream dissemination. 6 fields. 2 outcomes. 3 error codes. rules: protocol, trade_repo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, drop-copy, trade-dissemination"
}
</script>
