---
title: "Commodity Derivatives Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates. 31 fields. 2 out"
---

# Commodity Derivatives Eod Data Delivery Blueprint

> End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

| | |
|---|---|
| **Feature** | `commodity-derivatives-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, commodity-derivatives, agricultural, ftp, dissemination, fixed-width, non-live |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/commodity-derivatives-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [commodity-derivatives-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/commodity-derivatives-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day commodity derivatives data files |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD files |
| `customer_services` | Customer Services | human | Provisions subscriber credentials and dataset access before go-live |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_number` | number | Yes |  |  |
| `contract_type` | text | Yes |  |  |
| `instrument_type` | text | Yes |  |  |
| `record_type` | text | Yes |  |  |
| `record_sub_type` | text | Yes |  |  |
| `run_date` | date | Yes |  |  |
| `filler_header` | text | No |  |  |
| `instrument` | text | No |  |  |
| `date` | date | No |  |  |
| `strike_price` | number | No |  |  |
| `option_type` | text | No |  |  |
| `spot_price` | number | No |  |  |
| `closing_bid` | number | No |  |  |
| `closing_offer` | number | No |  |  |
| `mtm` | number | No |  |  |
| `first_price` | number | No |  |  |
| `last_price` | number | No |  |  |
| `high_price` | number | No |  |  |
| `low_price` | number | No |  |  |
| `number_of_deals` | number | No |  |  |
| `volume` | number | No |  |  |
| `value_traded` | number | No |  |  |
| `open_interest` | number | No |  |  |
| `volatility` | number | No |  |  |
| `traded_indicator` | boolean | No |  |  |
| `total_contracts` | number | No |  |  |
| `total_deals` | number | No |  |  |
| `total_value` | number | No |  |  |
| `total_open_interest` | number | No |  |  |
| `total_margin_on_deposit` | number | No |  |  |
| `interest_on_initial_margin` | number | No |  |  |

## Rules

- **data_format:**
  - **format:** fixed_width_flat_file
  - **encoding:** ASCII
  - **field_types:**
    - **A:** Alpha only
    - **N:** Numeric only (integer shown as N(I))
    - **AN:** Alphanumeric
    - **DATE:** 8-byte date CCYYMMDD
    - **B:** Boolean — T for True, F for False
  - **padding:**
    - **alpha:** space (ASCII 32) right-padded
    - **numeric:** decimal point consumes 1 byte, fixed position
  - **filler:** space characters (ASCII 32) reserved for future expansion
- **delivery:**
  - **channel:** FTP
  - **schedule:** MUST deliver all products at 18:00 daily
  - **frequency:** daily
- **subscription:**
  - **requires_written_request:** true
  - **requires_license_agreement:** true
- **market_identification:**
  - **market_number:** 2
  - **market_identifier:** APM
  - **market_name:** Commodity Derivatives Market
- **contract_types:**
  - **F:** Future
  - **Y:** Option
- **currency_note:** Records with Instrument type AFRCOMM are traded and cleared in USD

## Outcomes

### Successful_delivery

**Given:**
- subscriber is licensed and provisioned with IDP credentials
- trading day has completed

**Then:**
- exchange operations generates fixed-width flat files for all subscribed record types
- files are compressed and delivered via FTP at 18:00
- **emit_event** event: `data.delivery.completed`

**Result:** subscriber receives complete end-of-day commodity derivatives data

### Subscriber_provisioned

**Given:**
- prospective subscriber has contacted Market Data Department in writing
- license agreement is signed

**Then:**
- Customer Services provides IDP user ID, dataset name, and password
- subscriber tests access to confirm successful connection

**Result:** subscriber has working FTP access to commodity derivatives data files

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DELIVERY_FAILED` | 500 | End-of-day data file delivery failed | No |
| `INVALID_CREDENTIALS` | 500 | IDP authentication failed — contact Customer Services | No |
| `DATASET_NOT_PROVISIONED` | 500 | Requested dataset has not been provisioned for this subscriber | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.delivery.completed` | All subscribed commodity derivatives record types delivered for the day | `run_date`, `record_types`, `file_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equities-eod-data-delivery | optional | Equities EOD data uses same FTP delivery infrastructure |
| interest-rates-derivatives-eod-data-delivery | optional | Interest rates derivatives uses identical record structure with different prefixes |

## AGI Readiness

### Goals

#### Reliable Commodity Derivatives Eod Data Delivery

End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

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
      type: N(I)
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
  DAP_01:
    - name: instrument
      start: 49
      length: 4
      type: A
      end: 52
    - name: date
      start: 53
      length: 8
      type: DATE
      end: 60
    - name: strike_price
      start: 61
      length: 17
      type: N
      end: 77
    - name: option_type
      start: 78
      length: 1
      type: A
      end: 78
    - name: spot_price
      start: 79
      length: 17
      type: N
      end: 95
    - name: closing_bid
      start: 96
      length: 17
      type: N
      end: 112
    - name: closing_offer
      start: 113
      length: 17
      type: N
      end: 129
    - name: mtm
      start: 130
      length: 17
      type: N
      end: 146
    - name: first_price
      start: 147
      length: 17
      type: N
      end: 163
    - name: last_price
      start: 164
      length: 17
      type: N
      end: 180
    - name: high_price
      start: 181
      length: 17
      type: N
      end: 197
    - name: low_price
      start: 198
      length: 17
      type: N
      end: 214
    - name: number_of_deals
      start: 215
      length: 14
      type: N(I)
      end: 228
    - name: volume
      start: 229
      length: 14
      type: N(I)
      end: 242
    - name: value_traded
      start: 243
      length: 21
      type: N
      end: 263
    - name: open_interest
      start: 264
      length: 14
      type: N(I)
      end: 277
    - name: volatility
      start: 278
      length: 11
      type: N
      end: 288
    - name: filler
      start: 289
      length: 51
      type: A
      end: 339
  SAP_01:
    - name: total_contracts
      start: 49
      length: 14
      type: N(I)
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N(I)
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N(I)
      end: 111
    - name: filler
      start: 112
      length: 51
      type: A
      end: 162
  OAP_01:
    - name: total_contracts
      start: 49
      length: 14
      type: N(I)
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N(I)
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N(I)
      end: 111
    - name: filler
      start: 112
      length: 51
      type: A
      end: 162
  DAP_02:
    - name: instrument
      start: 49
      length: 4
      type: A
      end: 52
    - name: date
      start: 53
      length: 8
      type: DATE
      end: 60
    - name: strike_price
      start: 61
      length: 17
      type: N
      end: 77
    - name: option_type
      start: 78
      length: 1
      type: A
      end: 78
    - name: traded_indicator
      start: 79
      length: 1
      type: B
      end: 79
    - name: spot_price
      start: 80
      length: 17
      type: N
      end: 96
    - name: closing_bid
      start: 97
      length: 17
      type: N
      end: 113
    - name: closing_offer
      start: 114
      length: 17
      type: N
      end: 130
    - name: mtm
      start: 131
      length: 17
      type: N
      end: 147
    - name: first_price
      start: 148
      length: 17
      type: N
      end: 164
    - name: last_price
      start: 165
      length: 17
      type: N
      end: 181
    - name: high_price
      start: 182
      length: 17
      type: N
      end: 198
    - name: low_price
      start: 199
      length: 17
      type: N
      end: 215
    - name: number_of_deals
      start: 216
      length: 14
      type: N(I)
      end: 229
    - name: volume
      start: 230
      length: 14
      type: N(I)
      end: 243
    - name: value_traded
      start: 244
      length: 21
      type: N
      end: 264
    - name: open_interest
      start: 265
      length: 14
      type: N(I)
      end: 278
    - name: volatility
      start: 279
      length: 11
      type: N
      end: 289
    - name: filler
      start: 290
      length: 51
      type: A
      end: 340
  SAP_02:
    - name: total_contracts
      start: 49
      length: 14
      type: N(I)
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N(I)
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N(I)
      end: 111
    - name: filler
      start: 112
      length: 51
      type: A
      end: 162
  OAP_02:
    - name: total_contracts
      start: 49
      length: 14
      type: N(I)
      end: 62
    - name: total_deals
      start: 63
      length: 14
      type: N(I)
      end: 76
    - name: total_value
      start: 77
      length: 21
      type: N
      end: 97
    - name: total_open_interest
      start: 98
      length: 14
      type: N(I)
      end: 111
    - name: total_margin_on_deposit
      start: 112
      length: 21
      type: N
      end: 132
    - name: filler
      start: 133
      length: 51
      type: A
      end: 183
  MAP_01:
    - name: instrument
      start: 49
      length: 4
      type: A
      end: 52
    - name: date
      start: 53
      length: 8
      type: DATE
      end: 60
    - name: strike_price
      start: 61
      length: 17
      type: N
      end: 77
    - name: option_type
      start: 78
      length: 1
      type: A
      end: 78
    - name: spot_price
      start: 79
      length: 17
      type: N
      end: 95
    - name: closing_bid
      start: 96
      length: 17
      type: N
      end: 112
    - name: closing_offer
      start: 113
      length: 17
      type: N
      end: 129
    - name: mtm
      start: 130
      length: 17
      type: N
      end: 146
    - name: high_price
      start: 147
      length: 17
      type: N
      end: 163
    - name: low_price
      start: 164
      length: 17
      type: N
      end: 180
    - name: volume
      start: 181
      length: 14
      type: N(I)
      end: 194
    - name: open_interest
      start: 195
      length: 14
      type: N(I)
      end: 208
    - name: volatility
      start: 209
      length: 11
      type: N
      end: 219
    - name: filler
      start: 220
      length: 51
      type: A
      end: 270
  RAP_01:
    - name: interest_on_initial_margin
      start: 49
      length: 11
      type: N
      end: 59
    - name: filler
      start: 60
      length: 51
      type: A
      end: 110
record_type_map:
  DAP: Daily Commodity Derivatives Traded Statistics
  DAPE: Daily Commodity Derivatives Early Statistics
  SAP: Daily Commodity Derivatives Type Totals
  OAP: Daily Commodity Derivatives Overall Totals
  MAP: Mark to Market
  RAP: Interest Rates (margin rates)
delivery_products:
  AD_zip:
    filename_pattern: DDAP.SPRD.{alphacode}.AD.zip
    delivery_time: 18:00
    frequency: daily
    channel: FTP
    description: All commodity derivatives EOD records
    records:
      - DAP Sub Type 01 — Daily Traded Statistics
      - DAP Sub Type 02 — Daily Full Market Statistics
      - SAP Sub Type 01 — Daily Traded Type Totals
      - SAP Sub Type 02 — Daily Full Market Type Totals
      - OAP Sub Type 01 — Daily Traded Overall Totals
      - OAP Sub Type 02 — Daily Full Market Overall Totals
      - MAP Sub Type 01 — Mark to Market
      - RAP Sub Type 01 — Interest Rates
file_prefix_map:
  AD: Commodity Derivatives (Agricultural) standard delivery
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Commodity Derivatives Eod Data Delivery Blueprint",
  "description": "End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates. 31 fields. 2 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, commodity-derivatives, agricultural, ftp, dissemination, fixed-width, non-live"
}
</script>
