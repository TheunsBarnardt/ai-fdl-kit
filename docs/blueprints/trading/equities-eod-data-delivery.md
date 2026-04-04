---
title: "Equities Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions "
---

# Equities Eod Data Delivery Blueprint

> End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions for listed securities

| | |
|---|---|
| **Feature** | `equities-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, equities, ftp, dissemination, fixed-width, non-live, corporate-actions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/trading/equities-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [equities-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/equities-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day equity data files |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD files |
| `customer_services` | Customer Services | human | Provisions subscriber credentials and dataset access before go-live |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sector_code` | text | Yes |  |  |
| `instrument_alpha_code` | text | Yes |  |  |
| `record_type` | text | Yes |  |  |
| `sub_type` | text | Yes |  |  |
| `continuation_sequence_number` | number | Yes |  |  |
| `run_date` | date | Yes |  |  |
| `board` | text | Yes |  |  |
| `market` | text | Yes |  |  |
| `exchange` | text | Yes |  |  |
| `instrument_numeric_code` | number | Yes |  |  |
| `traded_indicator` | boolean | No |  |  |
| `closing_price` | number | No |  |  |
| `volume_traded` | number | No |  |  |
| `high_trade_price` | number | No |  |  |
| `low_trade_price` | number | No |  |  |
| `dividend_yield` | number | No |  |  |
| `earnings_yield` | number | No |  |  |
| `last_best_bid` | number | No |  |  |
| `last_best_offer` | number | No |  |  |
| `closing_price_change_cents` | number | No |  |  |
| `closing_price_change_pct` | number | No |  |  |
| `gain_loss_indicator` | text | No |  |  |
| `share_price_type` | select | No |  |  |
| `index_constituent` | boolean | No |  |  |
| `instrument_status` | text | No |  |  |
| `instrument_type_code` | text | No |  |  |
| `reit_distribution_yield` | number | No |  |  |
| `value_traded` | number | No |  |  |
| `price_earnings_ratio` | number | No |  |  |
| `last_traded_price` | number | No |  |  |
| `number_of_trades` | number | No |  |  |
| `opening_trade_price` | number | No |  |  |
| `moving_12m_high_price` | number | No |  |  |
| `moving_12m_high_price_date` | date | No |  |  |
| `moving_12m_low_price` | number | No |  |  |
| `moving_12m_low_price_date` | date | No |  |  |
| `ex_dividend_indicator` | boolean | No |  |  |
| `tradability_indicator_alpha` | select | No |  |  |
| `tradability_indicator_numeric` | select | No |  |  |
| `market_capitalisation` | number | No |  |  |
| `dividend_cover` | number | No |  |  |
| `new_high_indicator` | boolean | No |  |  |
| `new_low_indicator` | boolean | No |  |  |
| `closing_price_year_ago` | number | No |  |  |
| `closing_price_3m_ago` | number | No |  |  |
| `total_shares_listed` | number | No |  |  |
| `delivery_channel` | select | Yes |  |  |
| `dataset_name` | text | Yes |  |  |
| `user_id` | text | Yes |  |  |

## States

**State field:** `delivery_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `active` |  |  |
| `suspended` |  |  |
| `terminated` |  | Yes |

## Rules

- **identification:** MUST: Use instrument_numeric_code as the permanent instrument identifier in all systems, MUST NOT: Use instrument_alpha_code as a permanent key — it MAY be reused after delisting, SHOULD: Store both alpha and numeric codes, but key all joins on numeric code
- **delivery:** MUST: Authenticate with user_id, password, and dataset_name before accessing FTP, SHOULD: Test FTP access as soon as credentials are received from Customer Services, MUST: Subscribe to required record types in writing before go-live, SHOULD: Select only record types relevant to the subscriber's use case to minimise processing overhead
- **file_format:** MUST: Parse the 41-char leading record header before interpreting any data payload, MUST: Use continuation_sequence_number to reconstruct multi-record payloads, SHOULD: Handle filler fields (reserved for future use) by ignoring content, MUST: Interpret run_date using CCYYMMDD format
- **statistics:** MUST: New trades (on-book and published off-book) increment volume, value, and number_of_trades for trade date T, MUST: Same-day cancellations decrement volume, value, and number_of_trades for T, MUST: Next-day cancellations decrement volume, value, and number_of_trades for T-1, MUST: On-book trades and NX trades affect high/low price; off-book published trades do NOT affect high/low price, MAY: Apply statistical rules only to on-book and published off-book trade types — exclude internal/private off-book trades
- **sectors:** SHOULD: Use ICB (Industry Classification Benchmark) sector codes for instrument classification, MAY: Use DS05 record print sequence numbers for media-layout ordering of sectors and instruments
- **corporate_actions:** SHOULD: Process CA 01 records for dividend, rights offer, share split, and conversion events, SHOULD: Process CA 02 records for meeting diary (annual general meetings, etc.), MUST: Apply withholding tax percentage and foreign tax fields when processing dividend payments
- **dummy_lines:** SHOULD: Detect dummy lines by checking for 'DUMMY' in the ISIN field of EN/ENE records, MAY: Include dummy line instruments in index replication calculations as instructed by index provider

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| closing_price_delivery | 18:30 |  |
| ezip_delivery | 20:30 |  |
| ezip_early_delivery | 19:00 |  |
| snapshot_delivery | 13:00 |  |

## Outcomes

### Subscriber_provisioned (Priority: 1)

**Given:**
- subscription agreement is in place
- subscriber has requested specific record types in writing

**Then:**
- **create_record**
- **transition_state** field: `delivery_status` from: `pending` to: `active`
- **notify** target: `data_subscriber`
- **emit_event** event: `eod_data.subscriber_activated`

**Result:** Subscriber receives credentials and begins receiving daily EOD files

### Authentication_failed (Priority: 1) — Error: `EOD_AUTH_FAILED`

**Given:**
- `user_id` (input) not_exists

**Result:** FTP authentication rejected — credentials not recognised

### Eod_file_delivered (Priority: 2)

**Given:**
- trading day has ended
- exchange dissemination run has completed

**Then:**
- **create_record**
- **emit_event** event: `eod_data.file_available`

**Result:** EOD file (E.Zip or EE.Zip) available on FTP for all active subscribers

### File_not_available (Priority: 2) — Error: `EOD_FILE_NOT_READY`

**Given:**
- requested run_date file has not yet been generated

**Result:** File not available — check delivery schedule and retry after scheduled delivery time

### File_parsed_successfully (Priority: 3) | Transaction: atomic

**Given:**
- subscriber downloads EOD ZIP file
- file is not corrupted

**Then:**
- **set_field** target: `parse_status` value: `success`
- **emit_event** event: `eod_data.file_parsed`

**Result:** All records extracted and stored for downstream processing

### Invalid_record_format (Priority: 3) — Error: `EOD_RECORD_PARSE_ERROR`

**Given:**
- record does not match expected fixed-width layout for record_type + sub_type

**Then:**
- **emit_event** event: `eod_data.parse_error`

**Result:** Record rejected and logged for investigation

### Instrument_stats_processed (Priority: 4)

**Given:**
- record_type is DE or DEE
- sub_type is 01 through 07

**Then:**
- **set_field** target: `closing_price` value: `from record position 50-58`
- **set_field** target: `volume_traded` value: `from record position 59-71`
- **set_field** target: `instrument_numeric_code` value: `from record position 42-48`
- **emit_event** event: `eod_data.instrument_stats_stored`

**Result:** Daily instrument statistics stored and available for query

### Corporate_action_processed (Priority: 5) | Transaction: atomic

**Given:**
- record_type is CA
- sub_type is 01 or 02

**Then:**
- **create_record**
- **emit_event** event: `eod_data.corporate_action_received`

**Result:** Corporate action stored and flagged for portfolio adjustment

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EOD_AUTH_FAILED` | 401 | Authentication failed. Please verify your credentials with your account manager. | No |
| `EOD_FILE_NOT_READY` | 503 | The requested data file is not yet available. Please check the delivery schedule and retry. | No |
| `EOD_RECORD_PARSE_ERROR` | 422 | A record could not be parsed. Please check the record layout specification for the record type. | No |
| `EOD_UNKNOWN_RECORD_TYPE` | 422 | An unrecognised record type was encountered. Please verify you are using the current specification version. | No |
| `EOD_SUBSCRIPTION_INACTIVE` | 403 | Your data subscription is not active. Please contact your account manager. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `eod_data.subscriber_activated` | New subscriber provisioned and go-live confirmed | `user_id`, `dataset_name`, `go_live_date` |
| `eod_data.file_available` | EOD dissemination file posted to FTP | `file_name`, `run_date`, `delivery_channel` |
| `eod_data.file_parsed` | Subscriber successfully parsed an EOD file | `run_date`, `record_count`, `record_types_found` |
| `eod_data.instrument_stats_stored` | Daily instrument statistics record processed and stored | `run_date`, `instrument_numeric_code`, `closing_price` |
| `eod_data.corporate_action_received` | Corporate action record processed for an instrument | `instrument_numeric_code`, `action_type`, `effective_date` |
| `eod_data.parse_error` | A record failed to parse — logged for investigation | `run_date`, `record_type`, `sub_type`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-feeds | recommended | Complements real-time feeds — EOD delivery provides closing prices, statistics, and corporate actions for batch processing and historical analysis |
| fix-message-persistence | optional | FIX persistence patterns apply to EOD flat-file storage — same append-only, sequence-keyed storage model |
| data-import-export | recommended | EOD ZIP files require structured import pipeline matching fixed-width record layouts |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
delivery_dashboard:
  fields:
    - run_date
    - file_name
    - delivery_status
    - record_count
  layout: table
  notes: Show last 30 days of deliveries with parse status and record counts per type
instrument_snapshot:
  fields:
    - instrument_alpha_code
    - instrument_numeric_code
    - closing_price
    - volume_traded
    - high_trade_price
    - low_trade_price
    - dividend_yield
    - market_capitalisation
  layout: detail
  notes: Use instrument_numeric_code as the primary key for all lookups
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equities Eod Data Delivery Blueprint",
  "description": "End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, equities, ftp, dissemination, fixed-width, non-live, corporate-actions"
}
</script>
