---
title: "Currency Derivatives Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters. 37 fields."
---

# Currency Derivatives Eod Data Delivery Blueprint

> End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters

| | |
|---|---|
| **Feature** | `currency-derivatives-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, currency-derivatives, forex, ftp, dissemination, fixed-width, non-live, mtm |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/currency-derivatives-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [currency-derivatives-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/currency-derivatives-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day currency derivatives data files |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD files |
| `customer_services` | Customer Services | human | Provisions subscriber credentials and dataset access before go-live |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_number` | number | Yes | Market Number |  |
| `contract_type` | text | Yes | Contract Type |  |
| `instrument_type` | text | Yes | Instrument Type |  |
| `record_type` | text | Yes | Record Type |  |
| `record_sub_type` | text | Yes | Record Sub Type |  |
| `run_date` | date | Yes | Run Date |  |
| `filler_header` | text | No | Filler Header |  |
| `instrument` | text | No | Instrument |  |
| `date` | date | No | Date |  |
| `strike_price` | number | No | Strike Price |  |
| `option_type` | text | No | Option Type |  |
| `spot_price` | number | No | Spot Price |  |
| `closing_bid` | number | No | Closing Bid |  |
| `closing_offer` | number | No | Closing Offer |  |
| `mtm` | number | No | Mtm |  |
| `first_price` | number | No | First Price |  |
| `last_price` | number | No | Last Price |  |
| `high_price` | number | No | High Price |  |
| `low_price` | number | No | Low Price |  |
| `number_of_deals` | number | No | Number Of Deals |  |
| `volume_traded` | number | No | Volume Traded |  |
| `value_traded` | number | No | Value Traded |  |
| `open_interest` | number | No | Open Interest |  |
| `volatility` | number | No | Volatility |  |
| `isin` | text | No | Isin |  |
| `instrument_id` | number | No | Instrument Id |  |
| `dcd05_contract_code` | text | No | Dcd05 Contract Code |  |
| `dcd05_open_interest` | number | No | Dcd05 Open Interest |  |
| `dcd05_contracts_traded` | number | No | Dcd05 Contracts Traded |  |
| `interest_on_initial_margin_fxm` | number | No | Interest On Initial Margin Fxm |  |
| `jibar_one_month_yield` | number | No | Jibar One Month Yield |  |
| `jibar_three_month_yield` | number | No | Jibar Three Month Yield |  |
| `jibar_six_month_yield` | number | No | Jibar Six Month Yield |  |
| `jibar_nine_month_yield` | number | No | Jibar Nine Month Yield |  |
| `jibar_twelve_month_yield` | number | No | Jibar Twelve Month Yield |  |
| `prime_rate` | number | No | Prime Rate |  |
| `cpi` | number | No | Cpi |  |

## Rules

- **data_format:**
  - **format:** fixed_width_flat_file
  - **encoding:** ASCII
- **delivery:**
  - **channel:** FTP
  - **primary_time:** 20:30
  - **frequency:** daily
- **subscription:**
  - **requires_written_request:** true
  - **requires_license_agreement:** true
- **market_identification:**
  - **market_number:** 6
  - **market_identifier:** FX
  - **market_name:** Currency Derivatives Market
- **contract_types:**
  - **F:** Future
  - **Y:** Option
- **instrument_identifiers:**
  - **contract_code:** Alphanumeric — e.g. 01DEC15 AUDZAR ANYDAY
  - **isin:** ZAF prefix for futures, ZAF<letter> for options
  - **instrument_id:** Unique number across all instruments in all markets

## Outcomes

### Successful_delivery (Priority: 10)

**Given:**
- subscriber is licensed and provisioned with IDP credentials
- trading day has completed

**Then:**
- exchange operations generates fixed-width flat files for all subscribed record types
- files compressed and delivered via FTP per schedule
- **emit_event** event: `data.delivery.completed`

**Result:** subscriber receives complete end-of-day currency derivatives data

### Subscriber_provisioned (Priority: 11)

**Given:**
- prospective subscriber has contacted Market Data Department in writing
- license agreement is signed

**Then:**
- Customer Services provides IDP user ID, dataset name, and password
- subscriber tests access

**Result:** subscriber has working FTP access to currency derivatives data files

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DELIVERY_FAILED` | 500 | End-of-day data file delivery failed | No |
| `INVALID_CREDENTIALS` | 500 | IDP authentication failed — contact Customer Services | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.delivery.completed` | All subscribed currency derivatives record types delivered | `run_date`, `record_types`, `file_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-eod-data-delivery | extends | Inherits shared FTP fixed-width EOD delivery specification |
| equity-derivatives-eod-data-delivery | optional | Equity derivatives uses identical record structure with different prefixes |
| interest-rates-derivatives-eod-data-delivery | optional | Interest rates derivatives uses similar structure |

## AGI Readiness

### Goals

#### Reliable Currency Derivatives Eod Data Delivery

End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters

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
| successful_delivery | `autonomous` | - | - |
| subscriber_provisioned | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  LEADING:
    - name: market_number
      start: 1
      length: 1
      type: N
      end: 1
    - name: contract_type
      start: 2
      length: 1
      type: A
      end: 2
    - name: instrument_type
      start: 3
      length: 10
      type: A
      end: 12
    - name: record_type
      start: 13
      length: 4
      type: A
      end: 16
    - name: record_sub_type
      start: 17
      length: 4
      type: AN
      end: 20
    - name: run_date
      start: 21
      length: 8
      type: DATE
      end: 28
    - name: filler
      start: 29
      length: 20
      type: A
      end: 48
  DCD_01:
    - name: instrument
      start: 49
      length: 7
      type: A
      end: 55
    - name: date
      start: 56
      length: 8
      type: D
      end: 63
    - name: strike_price
      start: 64
      length: 17
      type: N
      end: 80
    - name: option_type
      start: 81
      length: 1
      type: A
      end: 81
    - name: spot_price
      start: 82
      length: 17
      type: N
      end: 98
    - name: closing_bid
      start: 99
      length: 17
      type: N
      end: 115
    - name: closing_offer
      start: 116
      length: 17
      type: N
      end: 132
    - name: mtm
      start: 133
      length: 17
      type: N
      end: 149
    - name: first_price
      start: 150
      length: 17
      type: N
      end: 166
    - name: last_price
      start: 167
      length: 17
      type: N
      end: 183
    - name: high_price
      start: 184
      length: 17
      type: N
      end: 200
    - name: low_price
      start: 201
      length: 17
      type: N
      end: 217
    - name: number_of_deals
      start: 218
      length: 14
      type: N
      end: 231
    - name: volume_traded
      start: 232
      length: 14
      type: N
      end: 245
    - name: value_traded
      start: 246
      length: 21
      type: N
      end: 266
    - name: open_interest
      start: 267
      length: 14
      type: N
      end: 280
    - name: volatility
      start: 281
      length: 11
      type: N
      end: 291
    - name: isin
      start: 292
      length: 13
      type: AN
      end: 304
    - name: instrument_id
      start: 305
      length: 17
      type: N
      end: 321
  DCD_05:
    - name: contract_code
      start: 49
      length: 50
      type: AN
      end: 98
    - name: open_interest
      start: 99
      length: 14
      type: N
      end: 112
    - name: contracts_traded
      start: 113
      length: 14
      type: N
      end: 126
    - name: isin
      start: 127
      length: 13
      type: AN
      end: 139
    - name: instrument_id
      start: 140
      length: 17
      type: N
      end: 156
  MCD_02:
    - name: derivatives_instrument_type
      start: 49
      length: 60
      type: A
      end: 108
    - name: contract_code
      start: 109
      length: 50
      type: AN
      end: 158
    - name: call_put_future
      start: 159
      length: 6
      type: A
      end: 164
    - name: deals
      start: 165
      length: 14
      type: N
      end: 178
    - name: contracts_traded
      start: 179
      length: 14
      type: N
      end: 192
    - name: nominal_value
      start: 193
      length: 21
      type: N
      end: 213
    - name: delta_value
      start: 214
      length: 21
      type: N
      end: 234
    - name: delta_value_sign
      start: 235
      length: 1
      type: A
      end: 235
    - name: premium_value
      start: 236
      length: 21
      type: N
      end: 256
    - name: open_interest
      start: 257
      length: 14
      type: N
      end: 270
    - name: contracts_deals
      start: 271
      length: 14
      type: N
      end: 284
    - name: isin
      start: 285
      length: 13
      type: AN
      end: 297
    - name: instrument_id
      start: 298
      length: 17
      type: N
      end: 314
  SCD_02:
    - name: total_contracts
      start: 49
      length: 14
      type: N
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N
      end: 111
  OCD_02:
    - name: total_contracts
      start: 49
      length: 14
      type: N
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N
      end: 111
    - name: total_margin_on_deposit
      start: 112
      length: 21
      type: N
      end: 132
  MCD_03:
    - name: contract_code
      start: 49
      length: 50
      type: AN
      end: 98
    - name: derivatives_instrument_type
      start: 99
      length: 60
      type: A
      end: 158
    - name: strike_price
      start: 159
      length: 17
      type: N
      end: 175
    - name: call_put_future
      start: 176
      length: 6
      type: A
      end: 181
    - name: future_expiry_date
      start: 182
      length: 8
      type: D
      end: 189
    - name: option_expiry_date
      start: 190
      length: 8
      type: D
      end: 197
    - name: mtm_price
      start: 198
      length: 17
      type: N
      end: 214
    - name: mtm_yield
      start: 215
      length: 17
      type: N
      end: 231
    - name: mtm_volatility
      start: 232
      length: 17
      type: N
      end: 248
    - name: spot
      start: 249
      length: 17
      type: N
      end: 265
    - name: isin
      start: 266
      length: 13
      type: AN
      end: 278
    - name: instrument_id
      start: 279
      length: 17
      type: N
      end: 295
  MCD_01:
    - name: contract_code
      start: 49
      length: 50
      type: AN
      end: 98
    - name: derivatives_instrument_type
      start: 99
      length: 60
      type: A
      end: 158
    - name: strike_price
      start: 159
      length: 17
      type: N
      end: 175
    - name: call_put_future
      start: 176
      length: 6
      type: A
      end: 181
    - name: future_expiry_date
      start: 182
      length: 8
      type: D
      end: 189
    - name: option_expiry_date
      start: 190
      length: 8
      type: D
      end: 197
    - name: mtm_price
      start: 198
      length: 17
      type: N
      end: 214
    - name: mtm_yield
      start: 215
      length: 17
      type: N
      end: 231
    - name: mtm_volatility
      start: 232
      length: 17
      type: N
      end: 248
    - name: previous_mtm_price
      start: 249
      length: 17
      type: N
      end: 265
    - name: previous_mtm_yield
      start: 266
      length: 17
      type: N
      end: 282
    - name: previous_mtm_volatility
      start: 283
      length: 17
      type: N
      end: 299
    - name: delta
      start: 300
      length: 21
      type: N
      end: 320
    - name: first_price
      start: 321
      length: 17
      type: N
      end: 337
    - name: last_price
      start: 338
      length: 17
      type: N
      end: 354
    - name: high_price
      start: 355
      length: 17
      type: N
      end: 371
    - name: low_price
      start: 372
      length: 17
      type: N
      end: 388
    - name: spot
      start: 389
      length: 17
      type: N
      end: 405
    - name: isin
      start: 406
      length: 13
      type: AN
      end: 418
    - name: instrument_id
      start: 419
      length: 17
      type: N
      end: 435
  RCD_01:
    - name: interest_on_initial_margin_fxm
      start: 49
      length: 11
      type: N
      end: 59
    - name: jibar_one_month_yield
      start: 60
      length: 11
      type: N
      end: 70
    - name: jibar_three_month_yield
      start: 71
      length: 11
      type: N
      end: 81
    - name: jibar_six_month_yield
      start: 82
      length: 11
      type: N
      end: 92
    - name: jibar_nine_month_yield
      start: 93
      length: 11
      type: N
      end: 103
    - name: jibar_twelve_month_yield
      start: 104
      length: 11
      type: N
      end: 114
    - name: jibar_three_month_discount
      start: 115
      length: 11
      type: N
      end: 125
    - name: rand_overnight_deposit_rate
      start: 126
      length: 11
      type: N
      end: 136
    - name: sarb_interbank_call_rate
      start: 137
      length: 11
      type: N
      end: 147
    - name: call_deposit_index
      start: 148
      length: 11
      type: N
      end: 158
    - name: three_month_call_deposit_index
      start: 159
      length: 11
      type: N
      end: 169
    - name: six_month_call_deposit_index
      start: 170
      length: 11
      type: N
      end: 180
    - name: twelve_month_call_deposit_index
      start: 181
      length: 11
      type: N
      end: 191
    - name: stefi
      start: 192
      length: 11
      type: N
      end: 202
    - name: prime_rate
      start: 203
      length: 11
      type: N
      end: 213
    - name: cpi
      start: 214
      length: 11
      type: N
      end: 224
record_type_map:
  DCD: Daily Currency Derivatives Traded Statistics
  MCD: Currency Derivatives Market Statistics / MTM
  SCD: Daily Currency Derivatives Type Totals
  OCD: Daily Currency Derivatives Overall Totals
  RCD: South African Rates (10:00/11:30/EOD)
  ACD: Risk Parameters
  CCD: Close Out Rates / Rand Spot
  ICD: Margin Requirements
  XCD: Detailed Instruments
delivery_products:
  CD_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CD.zip
    delivery_time: 20:30
    frequency: daily
    channel: FTP
    description: Main currency derivatives EOD file
    records:
      - DCD 01
      - DCD 05
      - SCD 02
      - OCD 02
      - MCD 01
      - MCD 02
      - RCD 03
      - ACD 01
      - ICD 01
      - XCD 01
  CD15_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CD15.zip
    delivery_time: 16:00
    frequency: daily
    channel: FTP
    description: Early MTM
    records:
      - MCD 03
  CD10_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CD10.zip
    delivery_time: 10:15
    frequency: daily
    channel: FTP
    records:
      - RCD 01
  CD11_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CD11.zip
    delivery_time: 11:30
    frequency: daily
    channel: FTP
    records:
      - RCD 02
      - CCD 02
  CD17_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CD17.zip
    delivery_time: 16:15
    frequency: quarterly
    channel: FTP
    description: Quarterly close out rates
    records:
      - CCD 01
  CDRS_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.CDRS.zip
    delivery_time: 16:10
    frequency: daily
    channel: FTP
    description: Rand Spot and Daily Close Out Rates
    records:
      - CCD 03
      - CCD 04
file_prefix_map:
  CD: Currency Derivatives standard delivery
  CD15: Currency Derivatives early MTM
  CD10: Currency Derivatives SA Rates 10:00
  CD11: Currency Derivatives SA Rates 11:30 + Rand Spot
  CD17: Currency Derivatives quarterly close out
  CDRS: Currency Derivatives Rand Spot + Daily Close Out
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Derivatives Eod Data Delivery Blueprint",
  "description": "End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters. 37 fields.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, currency-derivatives, forex, ftp, dissemination, fixed-width, non-live, mtm"
}
</script>
