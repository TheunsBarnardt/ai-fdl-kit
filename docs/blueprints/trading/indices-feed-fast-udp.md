---
title: "Indices Feed Fast Udp Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Real-time indices via FAST UDP multicast with TCP replay from FTSE.. 1 fields. 2 outcomes. 2 error codes. rules: delivery"
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


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Indices Feed Fast Udp Blueprint",
  "description": "Real-time indices via FAST UDP multicast with TCP replay from FTSE.. 1 fields. 2 outcomes. 2 error codes. rules: delivery",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": ""
}
</script>
