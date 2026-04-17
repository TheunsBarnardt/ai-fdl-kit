---
title: "Network Configuration Guide Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Network configuration requirements for JSE trading and market data connectivity including multicast routing and failover mechanisms. 3 fields. 2 outcomes. 2 err"
---

# Network Configuration Guide Blueprint

> Network configuration requirements for JSE trading and market data connectivity including multicast routing and failover mechanisms

| | |
|---|---|
| **Feature** | `network-configuration-guide` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | connectivity, network, multicast, configuration, trading |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/network-configuration-guide.blueprint.yaml) |
| **JSON API** | [network-configuration-guide.json]({{ site.baseurl }}/api/blueprints/trading/network-configuration-guide.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `connection_topology` | select | Yes | Network topology configuration |  |
| `tls_minimum_version` | select | Yes | Minimum TLS version for secure connections |  |
| `bgp_enabled` | boolean | Yes | Enable BGP for automatic failover routing |  |

## Rules

- **network_protocols:**
  - **private_order_trade_data:** TCP for private order and trade data delivery
  - **market_data_delivery:** UDP Multicast for real-time market data (Feed-A and Feed-B)
  - **routing_protocol:** BGP (Border Gateway Protocol) for automatic failover routing
- **tls_security:**
  - **minimum_version:** TLS 1.1 or above required for FTPS connections
  - **prohibited_versions:** SSL 2.0, SSL 3.0, TLS 1.0 are prohibited

## Outcomes

### Network_topology_selected (Priority: 1)

**Given:**
- `connection_topology` (input) exists

**Then:**
- **emit_event** event: `network.topology.configured`

**Result:** Network topology selected and ready for configuration

### Network_configuration_complete (Priority: 10)

**Given:**
- `connection_topology` (input) exists
- `bgp_enabled` (input) eq `true`

**Then:**
- **emit_event** event: `network.configuration.complete`

**Result:** All network configuration requirements satisfied

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NETWORK_CONFIG_INCOMPLETE` | 400 | Network configuration parameters missing or invalid | No |
| `TLS_VERSION_UNSUPPORTED` | 400 | TLS version unsupported; minimum TLS 1.1 required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `network.topology.configured` | Network topology configuration established | `topology`, `timestamp` |
| `network.configuration.complete` | All network configuration steps completed | `topology`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-connectivity-standards | required | Client network must comply with JSE standards |
| connectivity-testing-lcon | required | Network must be tested via Live Connectivity Test |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Network Configuration Guide Blueprint",
  "description": "Network configuration requirements for JSE trading and market data connectivity including multicast routing and failover mechanisms. 3 fields. 2 outcomes. 2 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "connectivity, network, multicast, configuration, trading"
}
</script>
