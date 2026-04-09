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
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equities-eod-data-delivery.blueprint.yaml) |
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
| `earnings_yield_sign` | text | No |  |  |
| `interest_payment_yield` | number | No |  |  |
| `capital_payment_yield` | number | No |  |  |
| `reit_distribution_yield` | number | No |  |  |
| `value_traded` | number | No |  |  |
| `value_traded_with_decimals` | number | No |  |  |
| `price_earnings_ratio` | number | No |  |  |
| `last_traded_price` | number | No |  |  |
| `number_of_trades` | number | No |  |  |
| `last_deal_traded_price` | number | No |  |  |
| `opening_trade_price` | number | No |  |  |
| `moving_12m_high_price` | number | No |  |  |
| `moving_12m_high_price_date` | date | No |  |  |
| `moving_12m_low_price` | number | No |  |  |
| `moving_12m_low_price_date` | date | No |  |  |
| `ex_dividend_indicator` | boolean | No |  |  |
| `dividend_yield_indicator` | text | No |  |  |
| `tradability_indicator_alpha` | select | No |  |  |
| `tradability_indicator_numeric` | select | No |  |  |
| `price_earnings_ratio_sign` | text | No |  |  |
| `market_capitalisation` | number | No |  |  |
| `dividend_cover` | number | No |  |  |
| `new_high_indicator` | boolean | No |  |  |
| `new_low_indicator` | boolean | No |  |  |
| `avg_value_traded_12m` | number | No |  |  |
| `avg_days_traded_12m` | number | No |  |  |
| `avg_volume_traded_12m` | number | No |  |  |
| `closing_price_year_ago` | number | No |  |  |
| `closing_price_3m_ago` | number | No |  |  |
| `total_shares_listed` | number | No |  |  |
| `dividend_cover_sign` | text | No |  |  |
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

## AGI Readiness

### Goals

#### Reliable Equities Eod Data Delivery

End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions for listed securities

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

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| subscriber_provisioned | `autonomous` | - | - |
| eod_file_delivered | `autonomous` | - | - |
| file_parsed_successfully | `autonomous` | - | - |
| instrument_stats_processed | `autonomous` | - | - |
| corporate_action_processed | `autonomous` | - | - |
| authentication_failed | `autonomous` | - | - |
| file_not_available | `autonomous` | - | - |
| invalid_record_format | `autonomous` | - | - |

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

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  leading_record:
    fields:
      - name: sector_code
        start: 1
        length: 8
        type: AN
        end: 8
      - name: instrument_alpha_code
        start: 9
        length: 6
        type: AN
        end: 14
      - name: record_type
        start: 15
        length: 3
        type: AN
        end: 17
      - name: sub_type
        start: 18
        length: 2
        type: AN
        end: 19
      - name: continuation_sequence_number
        start: 20
        length: 2
        type: N
        end: 21
      - name: run_date
        start: 22
        length: 8
        type: DATE
        end: 29
        format: CCYYMMDD
      - name: board
        start: 30
        length: 4
        type: AN
        end: 33
      - name: market
        start: 34
        length: 4
        type: AN
        end: 37
      - name: exchange
        start: 38
        length: 4
        type: AN
        end: 41
  DE_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: traded_indicator
        start: 49
        length: 1
        type: AN
        end: 49
      - name: instrument_closing_price
        start: 50
        length: 9
        type: N
        end: 58
      - name: instrument_volume_traded
        start: 59
        length: 13
        type: N
        end: 71
      - name: high_trade_price
        start: 72
        length: 9
        type: N
        end: 80
      - name: low_trade_price
        start: 81
        length: 9
        type: N
        end: 89
      - name: instrument_dividend_yield
        start: 90
        length: 7
        type: N
        end: 96
      - name: instrument_earnings_yield
        start: 97
        length: 8
        type: N
        end: 104
      - name: instrument_last_bid
        start: 105
        length: 9
        type: N
        end: 113
      - name: instrument_last_offer
        start: 114
        length: 9
        type: N
        end: 122
      - name: closing_price_change_cents
        start: 123
        length: 9
        type: N
        end: 131
      - name: pct_closing_price_change
        start: 132
        length: 7
        type: N
        end: 138
      - name: gain_loss_indicator
        start: 139
        length: 1
        type: AN
        end: 139
      - name: share_price_type
        start: 140
        length: 1
        type: AN
        end: 140
      - name: index_constituent
        start: 141
        length: 1
        type: AN
        end: 141
      - name: instrument_status
        start: 142
        length: 1
        type: AN
        end: 142
      - name: instrument_type_code
        start: 143
        length: 10
        type: N
        end: 152
      - name: earnings_yield_sign
        start: 153
        length: 1
        type: AN
        end: 153
      - name: interest_payment_yield
        start: 154
        length: 7
        type: N
        end: 160
      - name: capital_payment_yield
        start: 161
        length: 7
        type: N
        end: 167
      - name: reit_distribution_yield
        start: 168
        length: 7
        type: N
        end: 174
  DE_02:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: instrument_value_traded
        start: 49
        length: 11
        type: N
        end: 59
      - name: price_earnings_ratio
        start: 60
        length: 11
        type: N
        end: 70
      - name: last_traded_price
        start: 71
        length: 9
        type: N
        end: 79
      - name: instrument_number_of_trades
        start: 80
        length: 7
        type: N
        end: 86
      - name: last_deal_traded_price
        start: 87
        length: 9
        type: N
        end: 95
      - name: opening_trade_price
        start: 96
        length: 9
        type: N
        end: 104
      - name: moving_12m_high_trade_price
        start: 105
        length: 9
        type: N
        end: 113
      - name: moving_12m_high_price_date
        start: 114
        length: 8
        type: DATE
        end: 121
      - name: moving_12m_low_trade_price
        start: 122
        length: 9
        type: N
        end: 130
      - name: moving_12m_low_price_date
        start: 131
        length: 8
        type: DATE
        end: 138
      - name: filler
        start: 139
        length: 1
        type: AN
        end: 139
      - name: ex_dividend_indicator
        start: 140
        length: 1
        type: AN
        end: 140
      - name: dividend_yield_indicator
        start: 141
        length: 1
        type: AN
        end: 141
      - name: tradability_indicator_alpha
        start: 142
        length: 1
        type: AN
        end: 142
      - name: tradability_indicator_numeric
        start: 143
        length: 1
        type: N
        end: 143
      - name: price_earnings_ratio_sign
        start: 144
        length: 1
        type: AN
        end: 144
      - name: instrument_value_traded_2
        start: 145
        length: 13
        type: N
        end: 157
        notes: With decimals
  DE_03:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: market_capitalisation
        start: 49
        length: 14
        type: N
        end: 62
      - name: dividend_cover
        start: 63
        length: 7
        type: N
        end: 69
      - name: new_high_indicator
        start: 70
        length: 1
        type: AN
        end: 70
      - name: new_low_indicator
        start: 71
        length: 1
        type: AN
        end: 71
      - name: avg_value_traded_12m
        start: 72
        length: 13
        type: N
        end: 84
      - name: avg_days_traded_12m
        start: 85
        length: 9
        type: N
        end: 93
      - name: avg_volume_traded_12m
        start: 94
        length: 13
        type: N
        end: 106
      - name: closing_price_year_ago
        start: 107
        length: 9
        type: N
        end: 115
      - name: closing_price_3m_ago
        start: 116
        length: 9
        type: N
        end: 124
      - name: total_number_of_shares
        start: 125
        length: 15
        type: N
        end: 139
      - name: dividend_cover_sign
        start: 140
        length: 1
        type: AN
        end: 140
  DE_04:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: moving_12m_high_pe_ratio
        start: 49
        length: 9
        type: N
        end: 57
      - name: moving_12m_low_pe_ratio
        start: 58
        length: 9
        type: N
        end: 66
      - name: highest_dividend_yield_12m
        start: 67
        length: 7
        type: N
        end: 73
      - name: lowest_dividend_yield_12m
        start: 74
        length: 7
        type: N
        end: 80
      - name: highest_earnings_yield_12m
        start: 81
        length: 9
        type: N
        end: 89
      - name: lowest_earnings_yield_12m
        start: 90
        length: 9
        type: N
        end: 98
      - name: high_dividend_cover_12m
        start: 99
        length: 7
        type: N
        end: 105
      - name: low_dividend_cover_12m
        start: 106
        length: 7
        type: N
        end: 112
      - name: moving_12m_high_pe_sign
        start: 113
        length: 1
        type: AN
        end: 113
      - name: moving_12m_low_pe_sign
        start: 114
        length: 1
        type: AN
        end: 114
      - name: high_earnings_yield_sign_12m
        start: 115
        length: 1
        type: AN
        end: 115
      - name: low_earnings_yield_sign_12m
        start: 116
        length: 1
        type: AN
        end: 116
      - name: high_dividend_cover_sign_12m
        start: 117
        length: 1
        type: AN
        end: 117
      - name: low_dividend_cover_sign_12m
        start: 118
        length: 1
        type: AN
        end: 118
      - name: highest_reit_dist_yield_12m
        start: 119
        length: 7
        type: N
        end: 125
      - name: lowest_reit_dist_yield_12m
        start: 126
        length: 7
        type: N
        end: 132
  DE_05:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: instrument_short_name
        start: 49
        length: 15
        type: AN
        end: 63
      - name: company_name
        start: 64
        length: 55
        type: AN
        end: 118
      - name: instrument_report_name
        start: 119
        length: 24
        type: AN
        end: 142
      - name: sector_code
        start: 143
        length: 8
        type: AN
        end: 150
      - name: tidm
        start: 151
        length: 4
        type: AN
        end: 154
      - name: foreign_status_code
        start: 155
        length: 1
        type: AN
        end: 155
      - name: treated_as_domestic
        start: 156
        length: 1
        type: AN
        end: 156
  DE_06:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: last_traded_price
        start: 49
        length: 9
        type: N
        end: 57
      - name: last_date_traded
        start: 58
        length: 8
        type: DATE
        end: 65
      - name: overactive_volume_indicator
        start: 66
        length: 1
        type: AN
        end: 66
      - name: overactive_volume_value
        start: 67
        length: 13
        type: N
        end: 79
      - name: volume_density_value
        start: 80
        length: 13
        type: N
        end: 92
  DE_07:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: instrument_short_name
        start: 49
        length: 15
        type: AN
        end: 63
      - name: company_name
        start: 64
        length: 55
        type: AN
        end: 118
      - name: isin
        start: 119
        length: 12
        type: AN
        end: 130
      - name: company_numeric_code
        start: 131
        length: 4
        type: N
        end: 134
      - name: company_registration_number
        start: 135
        length: 20
        type: AN
        end: 154
      - name: company_income_tax_number
        start: 155
        length: 15
        type: AN
        end: 169
  DS_01:
    fields:
      - name: sector_code
        start: 42
        length: 8
        type: AN
        end: 49
      - name: sector_instruments_price_up
        start: 50
        length: 9
        type: N
        end: 58
      - name: sector_instruments_price_down
        start: 59
        length: 9
        type: N
        end: 67
      - name: sector_active_instruments
        start: 68
        length: 9
        type: N
        end: 76
      - name: sector_number_of_trades
        start: 77
        length: 9
        type: N
        end: 85
      - name: sector_number_of_instruments
        start: 86
        length: 5
        type: N
        end: 90
  DS_02:
    fields:
      - name: sector_code
        start: 42
        length: 8
        type: AN
        end: 49
      - name: sector_volume_traded
        start: 50
        length: 13
        type: N
        end: 62
      - name: sector_value_traded
        start: 63
        length: 15
        type: N
        end: 77
      - name: sector_market_capitalisation
        start: 78
        length: 14
        type: N
        end: 91
      - name: sector_dividend_yield
        start: 92
        length: 13
        type: N
        end: 104
      - name: sector_earnings_yield
        start: 105
        length: 13
        type: N
        end: 117
      - name: sector_avg_pe_ratio
        start: 118
        length: 13
        type: N
        end: 130
      - name: sector_instruments_new_high
        start: 131
        length: 9
        type: N
        end: 139
      - name: sector_instruments_new_low
        start: 140
        length: 9
        type: N
        end: 148
      - name: sector_earnings_yield_sign
        start: 149
        length: 1
        type: AN
        end: 149
      - name: sector_avg_pe_ratio_sign
        start: 150
        length: 1
        type: AN
        end: 150
      - name: sector_reit_distribution_yield
        start: 151
        length: 13
        type: N
        end: 163
  DO_01:
    fields:
      - name: market_total_volume_traded
        start: 42
        length: 13
        type: N
        end: 54
      - name: market_total_value_traded
        start: 55
        length: 15
        type: N
        end: 69
      - name: market_capitalisation
        start: 70
        length: 14
        type: N
        end: 83
      - name: market_number_of_instruments
        start: 84
        length: 9
        type: N
        end: 92
      - name: market_instruments_price_up
        start: 93
        length: 9
        type: N
        end: 101
      - name: market_instruments_price_down
        start: 102
        length: 9
        type: N
        end: 110
      - name: market_active_instruments
        start: 111
        length: 9
        type: N
        end: 119
      - name: market_instruments_new_high
        start: 120
        length: 9
        type: N
        end: 128
      - name: market_instruments_new_low
        start: 129
        length: 9
        type: N
        end: 137
      - name: market_number_of_trades
        start: 138
        length: 9
        type: N
        end: 146
  DO_02:
    fields:
      - name: market_dividend_yield
        start: 42
        length: 13
        type: N
        end: 54
      - name: market_earnings_yield
        start: 55
        length: 13
        type: N
        end: 67
      - name: market_pe_ratio
        start: 68
        length: 13
        type: N
        end: 80
      - name: total_listed_shares
        start: 81
        length: 15
        type: N
        end: 95
      - name: earnings_yield_sign
        start: 96
        length: 1
        type: AN
        end: 96
      - name: pe_ratio_sign
        start: 97
        length: 1
        type: AN
        end: 97
      - name: market_reit_distribution_yield
        start: 98
        length: 13
        type: N
        end: 110
  CR_01:
    fields:
      - name: statistics_date
        start: 42
        length: 8
        type: DATE
        end: 49
      - name: instrument_numeric_code
        start: 50
        length: 7
        type: N
        end: 56
      - name: filler_1
        start: 57
        length: 13
        type: N
        end: 69
      - name: filler_2
        start: 70
        length: 13
        type: N
        end: 82
      - name: high_trade_price
        start: 83
        length: 9
        type: N
        end: 91
      - name: low_trade_price
        start: 92
        length: 9
        type: N
        end: 100
      - name: volume_traded
        start: 101
        length: 13
        type: N
        end: 113
      - name: value_traded
        start: 114
        length: 13
        type: N
        end: 126
      - name: number_of_trades
        start: 127
        length: 7
        type: N
        end: 133
      - name: last_traded_price
        start: 134
        length: 9
        type: N
        end: 142
      - name: opening_trade_price
        start: 143
        length: 9
        type: N
        end: 151
  CR_02:
    fields:
      - name: statistics_date
        start: 42
        length: 8
        type: DATE
        end: 49
      - name: instrument_numeric_code
        start: 50
        length: 7
        type: N
        end: 56
      - name: instrument_alpha_code
        start: 57
        length: 6
        type: AN
        end: 62
      - name: isin
        start: 63
        length: 12
        type: AN
        end: 74
      - name: trade_type
        start: 75
        length: 3
        type: AN
        end: 77
      - name: broadcast_update_action
        start: 78
        length: 1
        type: AN
        end: 78
      - name: trade_price
        start: 79
        length: 9
        type: N
        end: 87
      - name: trade_volume
        start: 88
        length: 13
        type: N
        end: 100
      - name: original_trade_code
        start: 101
        length: 10
        type: AN
        end: 110
  EN_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: instrument_type_code
        start: 49
        length: 10
        type: N
        end: 58
      - name: price_prior_to_listing
        start: 59
        length: 6
        type: N
        end: 64
      - name: next_expected_declaration_date
        start: 65
        length: 8
        type: DATE
        end: 72
      - name: capital_introduced
        start: 73
        length: 15
        type: N
        end: 87
        format: "13.2"
      - name: capital_raised_prior_listing
        start: 88
        length: 13
        type: N
        end: 100
        format: "11.2"
      - name: charge_structure_code
        start: 101
        length: 2
        type: AN
        end: 102
  EN_02:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: effective_date
        start: 49
        length: 8
        type: DATE
        end: 56
      - name: instrument_short_name
        start: 57
        length: 14
        type: AN
        end: 70
      - name: company_name
        start: 71
        length: 55
        type: AN
        end: 125
      - name: company_numeric_code
        start: 126
        length: 4
        type: N
        end: 129
      - name: sector_code
        start: 130
        length: 8
        type: AN
        end: 137
      - name: instrument_status
        start: 138
        length: 1
        type: AN
        end: 138
      - name: isin
        start: 139
        length: 12
        type: AN
        end: 150
  ES_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: effective_date
        start: 49
        length: 8
        type: DATE
        end: 56
      - name: event_which_caused_change
        start: 57
        length: 3
        type: AN
        end: 59
      - name: shares_one_has
        start: 60
        length: 5
        type: N
        end: 64
      - name: shares_one_will_receive
        start: 65
        length: 5
        type: N
        end: 69
      - name: sequence
        start: 70
        length: 2
        type: N
        end: 71
      - name: isin
        start: 72
        length: 12
        type: AN
        end: 83
      - name: instructor_indicator
        start: 84
        length: 1
        type: AN
        end: 84
  EC_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: effective_date
        start: 49
        length: 8
        type: DATE
        end: 56
      - name: effective_time
        start: 57
        length: 6
        type: AN
        end: 62
      - name: instrument_status
        start: 63
        length: 1
        type: AN
        end: 63
      - name: status_info
        start: 64
        length: 6
        type: AN
        end: 69
  CO_01:
    fields:
      - name: company_numeric_code
        start: 42
        length: 4
        type: N
        end: 45
      - name: effective_date
        start: 46
        length: 8
        type: DATE
        end: 53
      - name: company_status
        start: 54
        length: 1
        type: AN
        end: 54
      - name: customer_short_name
        start: 55
        length: 15
        type: AN
        end: 69
      - name: company_name
        start: 70
        length: 55
        type: AN
        end: 124
      - name: transfer_secretary_code
        start: 125
        length: 5
        type: AN
        end: 129
  CS_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: effective_date
        start: 49
        length: 8
        type: AN
        end: 56
      - name: total_listed_shares
        start: 57
        length: 15
        type: N
        end: 71
      - name: share_price_type
        start: 72
        length: 1
        type: AN
        end: 72
      - name: new_shares_to_listed
        start: 73
        length: 15
        type: N
        end: 87
      - name: capital_structure_status
        start: 88
        length: 1
        type: AN
        end: 88
      - name: issue_price_per_share
        start: 89
        length: 13
        type: N
        end: 101
        format: "7.6"
      - name: total_capital_issued
        start: 102
        length: 15
        type: N
        end: 116
        format: "13.2"
      - name: record_date
        start: 117
        length: 8
        type: DATE
        end: 124
      - name: total_capital_raised
        start: 125
        length: 15
        type: N
        end: 139
        format: "13.2"
      - name: payment_date
        start: 140
        length: 8
        type: DATE
        end: 147
      - name: index_constituent
        start: 148
        length: 1
        type: AN
        end: 148
      - name: number_shares_listed_sign
        start: 149
        length: 1
        type: AN
        end: 149
  ED_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: declared_dividend_per_share
        start: 49
        length: 13
        type: N
        end: 61
        format: "7.6"
      - name: record_date
        start: 62
        length: 8
        type: DATE
        end: 69
      - name: payment_classification
        start: 70
        length: 6
        type: AN
        end: 75
      - name: dividend_payment_date
        start: 76
        length: 8
        type: DATE
        end: 83
      - name: dividend_number
        start: 84
        length: 10
        type: N
        end: 93
      - name: dividend_declaration_date
        start: 94
        length: 8
        type: DATE
        end: 101
      - name: instrument_adjusted_payment
        start: 102
        length: 13
        type: N
        end: 114
        format: "7.6"
      - name: financial_year_end
        start: 115
        length: 8
        type: AN
        end: 122
      - name: dividend_declaration_period
        start: 123
        length: 1
        type: AN
        end: 123
      - name: annualised_rolling_payment
        start: 124
        length: 15
        type: N
        end: 138
        format: "9.6"
      - name: dividend_flag
        start: 139
        length: 3
        type: AN
        end: 141
      - name: ca_serial_number
        start: 142
        length: 10
        type: N
        end: 151
  EE_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: declared_earnings_per_share
        start: 49
        length: 13
        type: N
        end: 61
        format: "7.6"
      - name: earnings_declaration_date
        start: 62
        length: 8
        type: DATE
        end: 69
      - name: adjusted_headline_earnings
        start: 70
        length: 13
        type: N
        end: 82
        format: "7.6"
      - name: financial_year_end
        start: 83
        length: 8
        type: AN
        end: 90
      - name: earnings_declaration_period
        start: 91
        length: 1
        type: N
        end: 91
      - name: annual_rolling_headline_eps
        start: 92
        length: 15
        type: N
        end: 106
        format: "9.6"
      - name: earnings_sign
        start: 107
        length: 1
        type: AN
        end: 107
      - name: revised_rolling_eps_sign
        start: 108
        length: 1
        type: AN
        end: 108
      - name: annual_rolling_eps_sign
        start: 109
        length: 1
        type: AN
        end: 109
      - name: filler
        start: 110
        length: 1
        type: AN
        end: 110
      - name: final_declared_earnings
        start: 111
        length: 15
        type: N
        end: 125
        format: "9.6"
      - name: final_declared_earnings_sign
        start: 126
        length: 1
        type: AN
        end: 126
  FY_01:
    fields:
      - name: instrument_numeric_code
        start: 42
        length: 7
        type: N
        end: 48
      - name: financial_year_end
        start: 49
        length: 8
        type: AN
        end: 56
      - name: declaration_type
        start: 57
        length: 2
        type: AN
        end: 58
      - name: total_for_financial_year
        start: 59
        length: 15
        type: N
        end: 73
      - name: declaration_total_sign
        start: 74
        length: 1
        type: AN
        end: 74
  SN_01:
    fields:
      - name: sector_code
        start: 42
        length: 8
        type: AN
        end: 49
      - name: effective_date
        start: 50
        length: 8
        type: DATE
        end: 57
      - name: sector_short_name
        start: 58
        length: 13
        type: AN
        end: 70
      - name: sector_afrikaans_short_name
        start: 71
        length: 13
        type: AN
        end: 83
      - name: parent_sector
        start: 84
        length: 8
        type: AN
        end: 91
      - name: filler
        start: 92
        length: 1
        type: AN
        end: 92
      - name: sector_status
        start: 93
        length: 1
        type: AN
        end: 93
  SN_02:
    fields:
      - name: sector_code
        start: 42
        length: 8
        type: AN
        end: 49
      - name: sector_name
        start: 50
        length: 40
        type: AN
        end: 89
      - name: sector_afrikaans_name
        start: 90
        length: 40
        type: AN
        end: 129
  CA_02:
    fields:
      - name: source_isin
        start: 42
        length: 12
        type: AN
        end: 53
      - name: source_alpha_code
        start: 54
        length: 6
        type: AN
        end: 59
      - name: source_short_name
        start: 60
        length: 14
        type: AN
        end: 73
      - name: source_tidm
        start: 74
        length: 4
        type: AN
        end: 77
      - name: source_sub_sector
        start: 78
        length: 8
        type: AN
        end: 85
      - name: source_dual_listed
        start: 86
        length: 1
        type: AN
        end: 86
      - name: source_issuer_name
        start: 87
        length: 55
        type: AN
        end: 141
      - name: declared_date
        start: 142
        length: 8
        type: DATE
        end: 149
      - name: meeting_date
        start: 150
        length: 8
        type: DATE
        end: 157
      - name: meeting_type_code
        start: 158
        length: 6
        type: AN
        end: 163
      - name: source_time
        start: 164
        length: 6
        type: AN
        end: 169
      - name: source_annual_report
        start: 170
        length: 1
        type: AN
        end: 170
      - name: source_circular
        start: 171
        length: 1
        type: AN
        end: 171
      - name: source_address
        start: 172
        length: 128
        type: AN
        end: 299
  record_type_map:
    DE: Daily Equity Instrument Statistics
    DEE: Daily Equity Instrument Statistics (Extended — same as DE with longer alpha
      codes)
    DS: Daily Sector Statistics
    DSE: Daily Sector Statistics (Extended)
    DO: Daily Overall Market Statistics
    DOE: Daily Overall Market Statistics (Extended)
    SA: Sector Annualised Statistics
    DD: Daily Overall Market Deal Statistics
    DT: Daily Top 20 Instruments Up/Down
    DR: Daily Warrants
    DRE: Daily Warrants (Extended)
    CR: Adjustments to Equity Market Statistics
    VA: Daily Top 20 By Value
    VO: Daily Top 20 By Volume
    NH: New Highs
    NHE: New Highs (Extended)
    NL: New Lows
    NLE: New Lows (Extended)
    NQ: Instrument Notes
    NQE: Instrument Notes (Extended)
    WE: Weekly Equity Instrument Statistics
    WS: Weekly Sector Statistics
    WL: Weekly Sector Deal Statistics
    WO: Weekly Overall Market Statistics
    DW: Weekly Overall Market Deal Statistics
    WT: Weekly Top 20 Instruments Up/Down
    WD: Weekly Dividends
    ME: Monthly Equity Instrument Statistics
    MS: Monthly Sector Statistics
    MO: Monthly Overall Market Statistics
    AT: Monthly Top 20 Instruments Up/Down
    MT: Monthly Sector Deal Statistics
    EN: Instrument Version Information
    ENE: Instrument Version Information (Extended)
    EK: Instrument Key Data
    EKE: Instrument Key Data (Extended)
    ES: Instrument Version Summary
    ESE: Instrument Version Summary (Extended)
    EC: Instrument Status Change
    ECE: Instrument Status Change (Extended)
    CO: Company Information
    COE: Company Information (Extended)
    CS: Capital Structure
    ED: Instrument Dividend
    EDE: Instrument Dividend (Extended)
    EE: Instrument Earnings
    EEE: Instrument Earnings (Extended)
    FY: Financial Year Summary
    FYE: Financial Year Summary (Extended)
    SN: Sector Information
    SNE: Sector Information (Extended)
    CA: Corporate Actions
  delivery_products:
    E_Zip:
      file_name: E.Zip
      frequency: daily
      delivery_time: 20:30
      channel: FTP
      notes: Main daily equity data file
    EE_Zip:
      file_name: EE.Zip
      frequency: daily
      delivery_time: 19:00
      channel: FTP
      notes: Early daily equity data file
  file_prefix_map:
    E: Equity (standard dissemination)
    EE: Equity Early (early dissemination — available 1.5 hours before E.Zip)
  snapshot_schedule:
    - time: 10:30
      content: Market snapshots of trades and values
    - time: 13:00
      content: Market snapshots of trades and values
    - time: 17:00+
      content: Market snapshots of trades and values (after market close)
    - time: 18:30
      content: Closing price information (first batch)
    - time: 20:00
      content: Closing price information (second batch)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equities Eod Data Delivery Blueprint",
  "description": "End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, equities, ftp, dissemination, fixed-width, non-live, corporate-actions"
}
</script>
