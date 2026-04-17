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
newsml_specification:
  standard: NewsML-G2
  version: "2.9"
  conformance: power
  xml_encoding: Windows-1252
  timestamp_format: UTC ISO 8601 with milliseconds (CCYY-MM-DDTHH:MM:SS.sssZ)
announcement_types:
  - code: 17
    name: Name Change
    subtypes:
      - 520
  - code: 100
    name: Acquisition
    subtypes:
      - 224
      - 225
      - 218
      - 223
      - 405
  - code: 104
    name: Annual General Meeting
    subtypes:
      - 105
      - 222
      - 500
  - code: 107
    name: Capitalisation
    subtypes:
      - 228
      - 337
      - 111
  - code: 112
    name: Cautionary
    subtypes:
      - 113
      - 114
      - 348
  - code: 116
    name: Change to the Board
    subtypes:
      - 117
      - 339
      - 408
      - 119
      - 120
      - 121
      - 122
      - 229
  - code: 123
    name: Dealings
    subtypes:
      - 312
      - 317
      - 124
      - 125
      - 318
      - 363
      - 321
      - 232
      - 330
  - code: 129
    name: Disposal
    subtypes:
      - 130
      - 132
      - 131
      - 233
      - 406
  - code: 133
    name: Dividend/Interest
    subtypes:
      - 134
      - 506
      - 135
      - 136
      - 504
      - 505
      - 137
      - 138
  - code: 140
    name: Financial Results
    subtypes:
      - 510
      - 514
      - 141
      - 512
      - 142
      - 352
      - 143
      - 144
      - 515
      - 513
      - 145
      - 511
      - 366
  - code: 147
    name: General Meeting
    subtypes:
      - 473
      - 148
      - 149
      - 518
  - code: 150
    name: Instruments
    subtypes:
      - 152
      - 242
      - 243
  - code: 153
    name: Issue of Shares for Cash
    subtypes:
      - 154
      - 155
  - code: 156
    name: New Listing (Board/Instrument)
    subtypes:
      - 522
      - 245
      - 157
      - 523
      - 244
      - 521
      - 246
      - 524
      - 158
  - code: 160
    name: Merger
    subtypes:
      - 519
  - code: 163
    name: Offers
    subtypes:
      - 164
      - 165
      - 301
      - 166
      - 167
      - 347
      - 168
      - 307
      - 170
  - code: 171
    name: Redemption
    subtypes:
      - 172
      - 173
  - code: 175
    name: Related Party Transactions
    subtypes:
      - 176
      - 177
  - code: 178
    name: Scheme Meeting
    subtypes:
      - 179
      - 180
  - code: 181
    name: Scheme of Arrangement
    subtypes:
      - 528
      - 530
      - 529
  - code: 183
    name: Share Buyback
    subtypes:
      - 184
      - 185
  - code: 186
    name: Statements
    subtypes:
      - 187
      - 532
      - 481
      - 482
      - 483
      - 484
      - 533
      - 403
      - 365
      - 485
      - 188
      - 306
      - 409
      - 402
      - 486
      - 336
      - 190
      - 487
      - 488
  - code: 191
    name: Suspension
    subtypes:
      - 192
      - 193
  - code: 196
    name: Take-Over
    subtypes:
      - 195
      - 194
  - code: 197
    name: Termination
    subtypes:
      - 310
      - 361
  - code: 199
    name: Unbundling
    subtypes:
      - 538
      - 537
      - 536
  - code: 201
    name: Voluntary Winding-Up
    subtypes:
      - 539
  - code: 230
    name: Debt Instrument
    subtypes:
      - 464
      - 503
      - 465
      - 466
      - 467
      - 501
      - 468
      - 469
      - 470
      - 471
      - 293
      - 253
      - 231
      - 294
      - 472
      - 502
  - code: 239
    name: Change in Authorised share capital
    subtypes:
      - 240
      - 241
  - code: 250
    name: Sector transfer
    subtypes:
      - 531
  - code: 252
    name: General
    subtypes: []
  - code: 259
    name: Resource and Reserves
    subtypes: []
  - code: 260
    name: Rescue operation
    subtypes: []
  - code: 313
    name: Warrants
    subtypes: []
  - code: 325
    name: Sponsor/DA/Debt Sponsor/Auditor/Debt Officer
    subtypes: []
  - code: 329
    name: Payment to shareholders
    subtypes: []
  - code: 334
    name: FTSE/JSE Africa Index Series
    subtypes: []
  - code: 362
    name: Regulatory
    subtypes: []
  - code: 373
    name: Trading Halt
    subtypes: []
  - code: 461
    name: Credit Rating
    subtypes: []
  - code: 474
    name: Index and Index providers
    subtypes: []
  - code: 477
    name: Section 60 approval
    subtypes: []
  - code: 507
    name: ETF Distribution
    subtypes: []
  - code: 516
    name: Fraction Rate
    subtypes: []
newsml_mandatory_elements:
  - element: headline
    type: string
    max_length: 150
    source: SENS spec
  - element: body
    type: rich_text
    encoding: Windows-1252
  - element: issuer_id
    type: string
    length: 4
    description: JSE issuer alpha code
  - element: announcement_datetime
    type: datetime
    format: UTC ISO 8601
  - element: announcement_type_qcode
    type: select
    description: Type code from 0-539 range
  - element: announcement_sub_type_qcode
    type: select
    description: Subtype code
  - element: urgency
    type: select
    values:
      - 1
      - 4
    description: 1=price-sensitive, 4=non-price-sensitive
  - element: price_sensitivity_indicator
    type: select
    values:
      - Y
      - N
  - element: pub_status
    type: select
    values:
      - stat:usable
      - stat:canceled
newsml_optional_elements:
  - element: remote_content_href
    type: url
    description: PDF location on IDP FTP
  - element: remote_content_size
    type: number
    unit: bytes
  - element: company_org_id
    type: text
    description: Organisation ID for issuer
  - element: instrument_tidm
    type: text
    length: 4
    description: Ticker code
  - element: announcement_group_code
    type: text
    description: For non-issuer announcements
distribution_channels:
  - channel: real_time_feed
    protocol: FIX
    latency_max_ms: 500
    description: FIX News Message (Type B) embedded NewsML
  - channel: udp_broadcast
    protocol: FAST/UDP
    latency_max_ms: 1000
    description: Regulatory News Feed (Volume 8)
  - channel: http_api
    protocol: HTTPS
    latency_max_ms: 2000
    description: Real-time subscription via HTTP
idp_ftp_delivery:
  channel: Information Delivery Portal (IDP) FTP
  format: XML files or ZIP archives
  pdf_hosting: JSE senspdf.jse.co.za endpoint
corrections:
  cancellation:
    signal: CorTyp:Cncl
    pub_status: stat:canceled
    description: Cancellation message with reference to original announcement
  replacement:
    signal: CorTyp:Repl
    pub_status: stat:usable
    description: Replacement message with link to previous version
guid_format: urn:newsml:jse.co.za:CCYY-MM-DD:SENS:<AnnRefNo>:ITNI
announcement_id_format: CCYYMMDDNNNNNA (unique per day, never recycled)
icb_subsector_change:
  effective_date: 2021-03-23
  old_length: 4
  new_length: 8
  description: Industry Classification Benchmark structure update
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
