---
title: "Market Data Feed Fast Udp Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Abstract: shared FAST UDP multicast + TCP recovery/replay specification for real-time market data feeds. Extended by market-data-gateway, indices, and regulator"
---

# Market Data Feed Fast Udp Blueprint

> Abstract: shared FAST UDP multicast + TCP recovery/replay specification for real-time market data feeds. Extended by market-data-gateway, indices, and regulatory-news blueprints.

| | |
|---|---|
| **Feature** | `market-data-feed-fast-udp` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, fast-protocol, udp-multicast, tcp-recovery, real-time, live-feed |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-data-feed-fast-udp.blueprint.yaml) |
| **JSON API** | [market-data-feed-fast-udp.json]({{ site.baseurl }}/api/blueprints/trading/market-data-feed-fast-udp.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_consumer` | Data Consumer | human | Licensed client connecting to the multicast or TCP recovery channels |
| `feed_gateway` | Feed Gateway | system | Exchange gateway publishing FAST-encoded UDP multicast streams |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `credentials_valid` | boolean | Yes | Whether the client's authentication credentials are valid |  |
| `user_id` | text | Yes | Authenticated user identifier |  |
| `security_id` | text | No | Security or instrument identifier being subscribed to |  |

## Rules

- **delivery:**
  - **multicast:** Real-time UDP multicast feeds A and B (primary + redundant)
  - **recovery:** TCP recovery channel for missed messages and trade history snapshots
  - **replay:** TCP replay channel for on-demand message recovery
- **protocol:**
  - **encoding:** FAST (Fix Adapted for STreaming) binary encoding
  - **transport:** UDP for multicast, TCP for recovery and replay
- **session:**
  - **logon_required:** Client must authenticate before receiving data
  - **heartbeat:** Heartbeat messages must be sent on idle sessions
- **failover:**
  - **rule:** Client must subscribe to both Feed A and Feed B and deduplicate by sequence number

## Outcomes

### Logon_successful (Priority: 1)

_Client successfully authenticates and establishes a data session_

**Given:**
- `credentials_valid` (request) eq `true`

**Then:**
- **emit_event** event: `session.established`

**Result:** Session active — client can receive real-time feed data

### Auth_failed (Priority: 1) — Error: `AUTH_FAILED`

_Client credentials rejected — session not established_

**Given:**
- `credentials_valid` (request) eq `false`

**Result:** Client cannot connect — check credentials

### Market_data_published (Priority: 2)

_Real-time data updates published to subscribed clients via multicast_

**Given:**
- `data_available` (system) eq `true`

**Then:**
- **emit_event** event: `feed.data_published`

**Result:** Data disseminated to all subscribed consumers

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_FAILED` | 401 | Authentication failed — check credentials and try again. | No |
| `SESSION_ERROR` | 500 | Session error — reconnect or contact support. | No |
| `SEQUENCE_GAP` | 500 | Sequence gap detected — use TCP recovery channel to fill missing messages. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.established` | Client authenticated and session opened | `user_id` |
| `feed.data_published` | Real-time feed data published to multicast group | `security_id`, `sequence_number` |
| `session.heartbeat` | Heartbeat sent to keep session alive | `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-gateway-fast-udp | optional | Market data gateway — equities and derivatives |
| indices-feed-fast-udp | optional | Indices feed via FTSE |
| regulatory-news-feed-fast | optional | Regulatory news via FAST multicast |

## AGI Readiness

### Goals

#### Reliable Fast Udp Feed

Deliver real-time market data via FAST UDP multicast with sub-millisecond latency

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| message_loss_rate | 0% | Messages lost vs total published (clients use recovery for gaps) |
| latency | < 1ms | Gateway publish to consumer receive |

**Constraints:**

- **performance** (non-negotiable): Must not introduce latency above exchange SLA

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- on AUTH_FAILED threshold breach

**Escalation Triggers:**

- `session_error_rate > 1%`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| throughput | latency_consistency | UDP multicast maximises throughput; TCP recovery handles gaps |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| logon_successful | `autonomous` | - | - |
| market_data_published | `autonomous` | - | - |
| auth_failed | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data Feed Fast Udp Blueprint",
  "description": "Abstract: shared FAST UDP multicast + TCP recovery/replay specification for real-time market data feeds. Extended by market-data-gateway, indices, and regulator",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, fast-protocol, udp-multicast, tcp-recovery, real-time, live-feed"
}
</script>
