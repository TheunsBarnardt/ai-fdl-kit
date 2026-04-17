---
title: "Sens Real Time News Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "SENS real-time regulatory news feed (NewsML format) for issuer announcements, trading halts, and corporate actions. 7 fields. 4 outcomes. 3 error codes. rules: "
---

# Sens Real Time News Blueprint

> SENS real-time regulatory news feed (NewsML format) for issuer announcements, trading halts, and corporate actions

| | |
|---|---|
| **Feature** | `sens-real-time-news` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | sens, regulatory-news, newsml, real-time, announcements, trading-halts |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/sens-real-time-news.blueprint.yaml) |
| **JSON API** | [sens-real-time-news.json]({{ site.baseurl }}/api/blueprints/trading/sens-real-time-news.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `issuer` | Issuer (Listed Company) | human |  |
| `news_distribution` | SENS News Distribution System | system |  |
| `market_surveillance` | Market Surveillance Officer | system |  |
| `exchange` | Exchange Operations | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `announcement_id` | text | Yes | SENS Announcement ID |  |
| `issuer_code` | text | Yes | Issuer Code |  |
| `headline` | text | Yes | Announcement Headline |  |
| `announcement_type` | select | Yes | Type (SENS, RNS, Trading Halt, Delisting, etc) |  |
| `announcement_text` | rich_text | Yes | Full Announcement Text |  |
| `trading_halt_flag` | boolean | No | Trading Halt Required |  |
| `effective_time` | datetime | Yes | Effective Time (UTC) |  |

## Rules

- **submission:**
  - **format_required:** Announcements must be in NewsML-G2 format with mandatory metadata
  - **issuer_authentication:** Submission must be authenticated from registered issuer account
- **distribution:**
  - **real_time_broadcast:** Announcement must be broadcast to all subscribers within 1 second of release
  - **archived:** All announcements archived for regulatory historical records (5+ years)
- **trading_halt:**
  - **halt_enforcement:** If trading_halt_flag=true, exchange must halt trading immediately
  - **halt_duration:** Trading halt minimum 5 minutes; max 30 minutes unless extended by regulator

## Outcomes

### Submit_announcement (Priority: 1) — Error: `ANNOUNCEMENT_SUBMIT_FAILED`

_Issuer submits SENS announcement_

**Given:**
- `announcement_id` (input) exists
- `issuer_code` (input) exists

**Then:**
- **call_service** target: `market_surveillance`
- **emit_event** event: `announcement.submitted`

### Broadcast_announcement (Priority: 2)

_SENS distributes announcement to all subscribers in real-time_

**Given:**
- `announcement_type` (system) eq `SENS`

**Then:**
- **emit_event** event: `announcement.broadcast`

### Execute_trading_halt (Priority: 3)

_Exchange halts trading for the issuer_

**Given:**
- `trading_halt_flag` (system) eq `true`

**Then:**
- **call_service** target: `exchange`
- **emit_event** event: `trading.halted`

### Resume_trading (Priority: 4)

_Exchange resumes trading after halt period_

**Given:**
- `halt_duration` (system) gte `300`

**Then:**
- **call_service** target: `exchange`
- **emit_event** event: `trading.resumed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ANNOUNCEMENT_SUBMIT_FAILED` | 400 | Announcement submission validation failed | No |
| `ISSUER_NOT_AUTHENTICATED` | 401 | Issuer not authenticated | No |
| `INVALID_NEWSML_FORMAT` | 422 | Announcement not in valid NewsML-G2 format | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `announcement.submitted` |  | `announcement_id`, `issuer_code`, `timestamp` |
| `announcement.broadcast` |  | `announcement_id`, `subscriber_count`, `broadcast_time` |
| `trading.halted` |  | `issuer_code`, `halt_reason`, `halt_start_time` |
| `trading.resumed` |  | `issuer_code`, `halt_duration_seconds` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-mitch-udp | recommended |  |
| trading-gateway-fix | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
announcement_types:
  - code: SENS
    name: SENS - Stock Exchange News Service
  - code: RNS
    name: RNS - Regulatory News Service
  - code: HALT
    name: Trading Halt
  - code: DELIST
    name: Delisting Notice
  - code: RESUM
    name: Trading Resume
  - code: CA
    name: Corporate Action Announcement
newsml_mandatory_fields:
  - field: HeadLine
    type: string
    max_length: 140
  - field: Body
    type: rich_text
  - field: IssuerID
    type: string
    length: 4
  - field: AnnouncementDateTime
    type: datetime
  - field: Release
    type: string
    values:
      - SENS
      - RNS
      - DELAYED
distribution_channels:
  - channel: real_time_feed
    protocol: HTTPS
    latency_max_ms: 1000
  - channel: email_alert
    latency_max_minutes: 1
  - channel: sms_alert
    latency_max_seconds: 30
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sens Real Time News Blueprint",
  "description": "SENS real-time regulatory news feed (NewsML format) for issuer announcements, trading halts, and corporate actions. 7 fields. 4 outcomes. 3 error codes. rules: ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sens, regulatory-news, newsml, real-time, announcements, trading-halts"
}
</script>
