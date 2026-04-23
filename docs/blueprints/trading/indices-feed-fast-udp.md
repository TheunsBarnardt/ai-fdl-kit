---
title: "Indices Feed Fast Udp Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Real-time indices via FAST UDP multicast with TCP replay from FTSE.. 1 fields. 2 outcomes. 2 error codes. rules: delivery. AGI: supervised"
---

# Indices Feed Fast Udp Blueprint

> Real-time indices via FAST UDP multicast with TCP replay from FTSE.

| | |
|---|---|
| **Feature** | `indices-feed-fast-udp` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/indices-feed-fast-udp.blueprint.yaml) |
| **JSON API** | [indices-feed-fast-udp.json]({{ site.baseurl }}/api/blueprints/trading/indices-feed-fast-udp.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Indices subscriber |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `index_id` | text | Yes | Index Symbol |  |

## Rules

- **delivery:**
  - **multicast:** Real-time UDP multicast
  - **replay:** TCP replay channel

## Outcomes

### Logon_successful (Priority: 1)

_Client authenticates_

**Given:**
- `credentials_valid` (request) eq `true`

**Then:**
- **emit_event** event: `session.established`

**Result:** Session active

### Index_updated (Priority: 2)

_Index value updated_

**Given:**
- `index_data_available` (system) eq `true`

**Then:**
- **emit_event** event: `index.updated`

**Result:** Index refresh published

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_FAILED` | 401 | Authentication failed | No |
| `LOGON_LIMIT` | 429 | Login limit exceeded | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.established` |  | `user_id` |
| `index.updated` |  | `index_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-feed-fast-udp | extends | Inherits shared FAST UDP multicast and TCP recovery/replay specification |

## AGI Readiness

### Goals

#### Reliable Indices Feed Fast Udp

Real-time indices via FAST UDP multicast with TCP replay from FTSE.

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
| logon_successful | `autonomous` | - | - |
| index_updated | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Indices Feed Fast Udp Blueprint",
  "description": "Real-time indices via FAST UDP multicast with TCP replay from FTSE.. 1 fields. 2 outcomes. 2 error codes. rules: delivery. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": ""
}
</script>
