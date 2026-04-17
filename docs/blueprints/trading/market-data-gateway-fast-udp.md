---
title: "Market Data Gateway Fast Udp Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Real-time market data via FAST UDP multicast with TCP recovery and replay channels.. 1 fields. 2 outcomes. 2 error codes. rules: delivery"
---

# Market Data Gateway Fast Udp Blueprint

> Real-time market data via FAST UDP multicast with TCP recovery and replay channels.

| | |
|---|---|
| **Feature** | `market-data-gateway-fast-udp` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-data-gateway-fast-udp.blueprint.yaml) |
| **JSON API** | [market-data-gateway-fast-udp.json]({{ site.baseurl }}/api/blueprints/trading/market-data-gateway-fast-udp.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Market data subscriber |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `instrument_id` | text | Yes | Security ID |  |

## Rules

- **delivery:**
  - **multicast:** Real-time UDP multicast feeds A and B
  - **recovery:** TCP recovery channel for trade history and snapshots
  - **replay:** TCP replay channel for message recovery

## Outcomes

### Logon_successful (Priority: 1)

_Client successfully authenticates_

**Given:**
- `credentials_valid` (request) eq `true`

**Then:**
- **emit_event** event: `session.established`

**Result:** Session active

### Market_data_published (Priority: 2)

_Market data updates published_

**Given:**
- `data_available` (system) eq `true`

**Then:**
- **emit_event** event: `market.data_published`

**Result:** Data disseminated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_FAILED` | 401 | Authentication failed | No |
| `SESSION_ERROR` | 500 | Session error | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.established` |  | `user_id` |
| `market.data_published` |  | `security_id` |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data Gateway Fast Udp Blueprint",
  "description": "Real-time market data via FAST UDP multicast with TCP recovery and replay channels.. 1 fields. 2 outcomes. 2 error codes. rules: delivery",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": ""
}
</script>
