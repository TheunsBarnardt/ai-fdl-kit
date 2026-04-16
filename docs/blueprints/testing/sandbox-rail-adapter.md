---
title: "Sandbox Rail Adapter Blueprint"
layout: default
parent: "Testing"
grand_parent: Blueprint Catalog
description: "Contract-compatible mock RailAdapter — scripted success/decline/timeout/rate-limit scenarios, realistic latency profiles, webhook callbacks that mirror real rai"
---

# Sandbox Rail Adapter Blueprint

> Contract-compatible mock RailAdapter — scripted success/decline/timeout/rate-limit scenarios, realistic latency profiles, webhook callbacks that mirror real rails (pacs.002, PaymentStatusReport); d...

| | |
|---|---|
| **Feature** | `sandbox-rail-adapter` |
| **Category** | Testing |
| **Version** | 1.0.0 |
| **Tags** | sandbox, rail, adapter, mock, scenarios, webhooks, deterministic |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/testing/sandbox-rail-adapter.blueprint.yaml) |
| **JSON API** | [sandbox-rail-adapter.json]({{ site.baseurl }}/api/blueprints/testing/sandbox-rail-adapter.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pgw` | Payments Gateway (sandbox instance) | system |  |
| `rail_registry` | Rail Registry | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario` | select | Yes | Scenario for this specific call (can override profile) |  |
| `latency_ms` | number | No | Override base latency in ms |  |
| `correlation_id` | token | Yes | Deterministic replay key |  |

## Rules

- **contract:** MUST: implement every method of the RailAdapter contract identically to real rails — authorize, capture, refund, status, supports_currency, MUST: response schemas match real rails exactly, including error codes and webhook payloads (pacs.002, PaymentStatusReport)
- **determinism:** MUST: same correlation_id + scenario = same response every time
- **safety:** MUST: never forward calls to real rails, even by accident

## Outcomes

### Rate_limited (Priority: 20)

**Given:**
- scenario == rate_limit

**Result:** Returns rail-specific 429

### Timed_out (Priority: 30)

**Given:**
- scenario == timeout

**Result:** No response within rail SLA — PGW should emit PGW_RAIL_ERROR

### Declined (Priority: 50)

**Given:**
- scenario == decline

**Then:**
- **emit_event** event: `sandbox.rail.declined`

**Result:** Returns rail-specific decline code

### Approved (Priority: 100)

**Given:**
- scenario == approve

**Then:**
- **emit_event** event: `sandbox.rail.approved`

**Result:** Returns success with sandbox: true tag

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sandbox.rail.approved` |  |  |
| `sandbox.rail.declined` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| rail-registry | required | Registered as a first-class adapter in the sandbox registry |
| sandbox-environment | required | The sandbox environment exclusively routes through this adapter |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sandbox Rail Adapter Blueprint",
  "description": "Contract-compatible mock RailAdapter — scripted success/decline/timeout/rate-limit scenarios, realistic latency profiles, webhook callbacks that mirror real rai",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sandbox, rail, adapter, mock, scenarios, webhooks, deterministic"
}
</script>
