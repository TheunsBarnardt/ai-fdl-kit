---
title: "Regulatory News Feed Fast Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Real-time regulatory news via FAST UDP multicast with TCP replay.. 1 fields. 2 outcomes. 1 error codes. rules: delivery"
---

# Regulatory News Feed Fast Blueprint

> Real-time regulatory news via FAST UDP multicast with TCP replay.

| | |
|---|---|
| **Feature** | `regulatory-news-feed-fast` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regulatory-news-feed-fast.blueprint.yaml) |
| **JSON API** | [regulatory-news-feed-fast.json]({{ site.baseurl }}/api/blueprints/trading/regulatory-news-feed-fast.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Regulatory news subscriber |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `news_id` | text | Yes | News ID |  |

## Rules

- **delivery:**
  - **multicast:** Real-time UDP multicast feeds
  - **replay:** TCP replay channel

## Outcomes

### Logon_successful (Priority: 1)

_Client authenticates_

**Given:**
- `credentials_valid` (request) eq `true`

**Then:**
- **emit_event** event: `session.established`

**Result:** Session active

### News_published (Priority: 2)

_News published_

**Given:**
- `news_available` (system) eq `true`

**Then:**
- **emit_event** event: `news.published`

**Result:** News disseminated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_FAILED` | 401 | Authentication failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.established` |  | `user_id` |
| `news.published` |  | `news_id` |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regulatory News Feed Fast Blueprint",
  "description": "Real-time regulatory news via FAST UDP multicast with TCP replay.. 1 fields. 2 outcomes. 1 error codes. rules: delivery",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": ""
}
</script>
