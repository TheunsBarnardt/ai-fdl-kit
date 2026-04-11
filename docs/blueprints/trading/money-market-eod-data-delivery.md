---
title: "Money Market Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates. 36 fields. 3 o"
---

# Money Market Eod Data Delivery Blueprint

> End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

| | |
|---|---|
| **Feature** | `money-market-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, money-market, isin, reference-data, ftp, dissemination, fixed-width, non-live |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/money-market-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [money-market-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/money-market-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives money market instrument data files |
| `exchange_operations` | Exchange Operations | system | National Numbering Agent system that issues ISINs and generates data files |
| `customer_services` | Customer Services | human | Provisions subscriber credentials and dataset access |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `instrument_numeric_key` | number | Yes | Instrument Numeric Key |  |
| `record_type` | text | Yes | Record Type |  |
| `sub_type` | text | Yes | Sub Type |  |
| `continuation_sequence_number` | number | Yes | Continuation Sequence Number |  |
| `run_date` | date | Yes | Run Date |  |
| `isin` | text | Yes | Isin |  |
| `filler_header` | text | No | Filler Header |  |
| `instrument_alpha_code` | text | Yes | Instrument Alpha Code |  |
| `mmd01_isin` | text | Yes | Mmd01 Isin |  |
| `issuer_name` | text | Yes | Issuer Name |  |
| `mmi_type` | text | Yes | Mmi Type |  |
| `mmi_category` | text | Yes | Mmi Category |  |
| `short_name` | text | Yes | Short Name |  |
| `long_name` | text | Yes | Long Name |  |
| `instrument_status` | select | Yes | Instrument Status |  |
| `issued_amount` | number | No | Issued Amount |  |
| `issue_date` | date | No | Issue Date |  |
| `coupon_rate` | number | No | Coupon Rate |  |
| `coupon_frequency_interval` | text | No | Coupon Frequency Interval |  |
| `coupon_payment_cycle` | text | No | Coupon Payment Cycle |  |
| `isin_maturity_date` | date | No | Isin Maturity Date |  |
| `isin_coupon_payment_day` | number | No | Isin Coupon Payment Day |  |
| `coupon_compounding_frequency` | text | No | Coupon Compounding Frequency |  |
| `coupon_reset_frequency` | text | No | Coupon Reset Frequency |  |
| `coupon_reset_start_date` | date | No | Coupon Reset Start Date |  |
| `coupon_source` | text | No | Coupon Source |  |
| `coupon_variance_from_source` | number | No | Coupon Variance From Source |  |
| `coupon_variance_unit` | select | No | Coupon Variance Unit |  |
| `currency` | text | No | Currency |  |
| `floor_rate` | number | No | Floor Rate |  |
| `cap_rate` | number | No | Cap Rate |  |
| `mmd02_instrument_alpha_code` | text | No | Mmd02 Instrument Alpha Code |  |
| `reset_date` | date | No | Reset Date |  |
| `reset_rate` | number | No | Reset Rate |  |
| `mmd03_instrument_alpha_code` | text | No | Mmd03 Instrument Alpha Code |  |
| `payment_date` | date | No | Payment Date |  |

## Rules

- **data_format:**
  - **format:** fixed_width_flat_file
  - **encoding:** ASCII
  - **record_lengths:**
    - **MMD_01:** 318
    - **MMD_02:** up to 534 (variable, depends on number of reset date/rate pairs)
    - **MMD_03:** up to 214 (variable, depends on number of payment dates)
- **delivery:**
  - **channel:** FTP
- **subscription:**
  - **requires_written_request:** true
  - **requires_license_agreement:** true
- **nna_role:**
  - **issues_isins:** true
  - **standard:** ISO 6166
  - **isin_format:** 12-character alpha-numerical code
- **mmi_categories:**
  - **category_1:** Discount Based
  - **category_2:** Vanilla
  - **category_3:** Variable Coupon Rates
  - **category_4:** Structured Securities
- **matured_retention:**
  - **retention_period:** 6 months after maturity or cancellation
- **coupon_date_rules:**
  - **applicable_categories:** 2, 3
  - **conditional:** Only required when coupon payment frequency is ISDF (Issuer Defined)
  - **max_repetitions:** 120
  - **max_rows:** 6
  - **items_per_row:** 20
- **zaronia_note:** ZARONIA FRN coupon rate is optional — not required for NNA ISIN obligation

## Outcomes

### Successful_eod_delivery (Priority: 10)

**Given:**
- subscriber is licensed and provisioned
- business day processing is complete

**Then:**
- exchange operations generates MMD records for all active and recently matured instruments
- files compressed as MM.Zip and delivered via FTP by 19:00
- **emit_event** event: `data.delivery.completed`

**Result:** subscriber receives complete money market instrument reference data

### Successful_intraday_delivery (Priority: 11)

**Given:**
- subscriber is licensed and provisioned
- variable coupon rate changes have been published for category 3 instruments

**Then:**
- exchange operations generates MMP records for changed instruments only
- files compressed as MMI15.Zip and delivered via FTP by 15:45

**Result:** subscriber receives intraday priority coupon rate updates

### Subscriber_provisioned (Priority: 12)

**Given:**
- prospective subscriber has contacted Market Data Department
- license agreement is signed

**Then:**
- Customer Services provides credentials before 11am on go-live day
- subscriber tests access

**Result:** subscriber has working FTP access to money market data files

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DELIVERY_FAILED` | 500 | Money market data file delivery failed | No |
| `INVALID_CREDENTIALS` | 500 | Authentication failed — contact Customer Services | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.delivery.completed` | Money market data files delivered for the day | `run_date`, `file_name`, `instrument_count` |
| `data.intraday.published` | Intraday priority coupon rate update published | `run_date`, `instrument_count`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bonds-eod-data-delivery | optional | Bonds market data covers related fixed-income instruments |

## AGI Readiness

### Goals

#### Reliable Money Market Eod Data Delivery

End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

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
| successful_eod_delivery | `autonomous` | - | - |
| successful_intraday_delivery | `autonomous` | - | - |
| subscriber_provisioned | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  LEADING:
    - name: instrument_numeric_key
      start: 1
      length: 10
      type: N
      end: 10
    - name: record_type
      start: 11
      length: 3
      type: T
      end: 13
    - name: sub_type
      start: 14
      length: 2
      type: T
      end: 15
    - name: continuation_sequence_number
      start: 16
      length: 2
      type: N
      end: 17
    - name: run_date
      start: 18
      length: 8
      type: DATE
      end: 25
    - name: isin
      start: 26
      length: 12
      type: T
      end: 37
    - name: filler
      start: 38
      length: 2
      type: T
      end: 39
  MMD_01:
    - name: instrument_alpha_code
      start: 40
      length: 14
      type: T
      end: 53
    - name: isin
      start: 54
      length: 12
      type: T
      end: 65
    - name: issuer_name
      start: 66
      length: 35
      type: T
      end: 100
    - name: mmi_type
      start: 101
      length: 5
      type: T
      end: 105
    - name: mmi_category
      start: 106
      length: 1
      type: T
      end: 106
    - name: short_name
      start: 107
      length: 40
      type: T
      end: 146
    - name: long_name
      start: 147
      length: 70
      type: T
      end: 216
    - name: instrument_status
      start: 217
      length: 1
      type: T
      end: 217
    - name: issued_amount
      start: 218
      length: 16
      type: T
      end: 233
    - name: issue_date
      start: 234
      length: 10
      type: T
      end: 243
    - name: coupon_rate
      start: 244
      length: 16
      type: T
      end: 259
    - name: coupon_frequency_interval
      start: 260
      length: 4
      type: T
      end: 263
    - name: coupon_payment_cycle
      start: 264
      length: 4
      type: T
      end: 267
    - name: isin_maturity_date
      start: 268
      length: 10
      type: T
      end: 277
    - name: isin_coupon_payment_day
      start: 278
      length: 2
      type: N
      end: 279
    - name: coupon_compounding_frequency
      start: 280
      length: 4
      type: T
      end: 283
    - name: coupon_reset_frequency
      start: 284
      length: 4
      type: T
      end: 287
    - name: coupon_reset_start_date
      start: 288
      length: 10
      type: T
      end: 297
    - name: coupon_source
      start: 298
      length: 8
      type: T
      end: 305
    - name: coupon_variance_from_source
      start: 306
      length: 16
      type: T
      end: 321
    - name: coupon_variance_unit
      start: 322
      length: 1
      type: T
      end: 322
    - name: currency
      start: 323
      length: 3
      type: T
      end: 325
    - name: floor_rate
      start: 326
      length: 16
      type: T
      end: 341
    - name: cap_rate
      start: 342
      length: 16
      type: T
      end: 357
  MMD_02:
    - name: instrument_alpha_code
      start: 40
      length: 14
      type: T
      end: 53
    - name: reset_date_1
      start: 54
      length: 10
      type: T
      end: 63
    - name: reset_rate_1
      start: 64
      length: 16
      type: T
      end: 79
    - name: reset_date_2
      start: 80
      length: 10
      type: T
      end: 89
    - name: reset_rate_2
      start: 90
      length: 16
      type: T
      end: 105
  MMD_03:
    - name: instrument_alpha_code
      start: 40
      length: 14
      type: T
      end: 53
    - name: payment_date_1
      start: 54
      length: 10
      type: T
      end: 63
    - name: payment_date_2
      start: 64
      length: 10
      type: T
      end: 73
  MMP:
    - name: instrument_alpha_code
      start: 40
      length: 14
      type: T
      end: 53
    - name: isin
      start: 54
      length: 12
      type: T
      end: 65
    - name: issuer_name
      start: 66
      length: 35
      type: T
      end: 100
    - name: mmi_type
      start: 101
      length: 5
      type: T
      end: 105
    - name: mmi_category
      start: 106
      length: 1
      type: T
      end: 106
    - name: short_name
      start: 107
      length: 40
      type: T
      end: 146
    - name: long_name
      start: 147
      length: 70
      type: T
      end: 216
    - name: instrument_status
      start: 217
      length: 1
      type: T
      end: 217
    - name: issued_amount
      start: 218
      length: 16
      type: T
      end: 233
    - name: issue_date
      start: 234
      length: 10
      type: T
      end: 243
    - name: coupon_rate
      start: 244
      length: 16
      type: T
      end: 259
    - name: coupon_frequency_interval
      start: 260
      length: 4
      type: T
      end: 263
    - name: coupon_payment_cycle
      start: 264
      length: 4
      type: T
      end: 267
    - name: isin_maturity_date
      start: 268
      length: 10
      type: T
      end: 277
    - name: isin_coupon_payment_day
      start: 278
      length: 2
      type: N
      end: 279
    - name: coupon_compounding_frequency
      start: 280
      length: 4
      type: T
      end: 283
    - name: coupon_reset_frequency
      start: 284
      length: 4
      type: T
      end: 287
    - name: coupon_reset_start_date
      start: 288
      length: 10
      type: T
      end: 297
    - name: coupon_source
      start: 298
      length: 8
      type: T
      end: 305
    - name: coupon_variance_from_source
      start: 306
      length: 16
      type: T
      end: 321
    - name: coupon_variance_unit
      start: 322
      length: 1
      type: T
      end: 322
    - name: currency
      start: 323
      length: 3
      type: T
      end: 325
    - name: floor_rate
      start: 326
      length: 16
      type: T
      end: 341
    - name: cap_rate
      start: 342
      length: 16
      type: T
      end: 357
    - name: timestamp_date
      start: 358
      length: 8
      type: N
      end: 365
    - name: timestamp_time
      start: 366
      length: 6
      type: N
      end: 371
    - name: previously_published_indicator
      start: 372
      length: 1
      type: T
      end: 372
record_type_map:
  MMD: Money Market Daily — instrument reference, coupon resets, payment dates
  MMP: Money Market Priority — intraday variable coupon rate changes (category 3
    only)
mmi_type_map:
  BA: Bankers Acceptances
  BL: Bills
  CPB: Commercial Paper Bills / Capital Project Bills
  PN: Promissory Notes
  TB: Treasury Bills
  NOT: Notes
  BB: Bridging Bonds
  DEB: Debentures
  NCD: Negotiable Certificates Of Deposit
  LNCD: Linked Negotiable Certificates of Deposit
  CLN: Credit Linked Notes
  FRN: Floating Rate Notes
  CB: Call Bonds
  ZB: Zero Bonds
  MRN: Mixed Rate Notes
  SRN: Step-Up/Down Rate Notes
delivery_products:
  MM_zip:
    filename_pattern: MM.Zip
    delivery_time: 19:00
    frequency: daily
    channel: FTP
    description: All active and recently matured money market instruments
    records:
      - MMD 01
      - MMD 02
      - MMD 03
  MMI15_zip:
    filename_pattern: MMI15.Zip
    delivery_time: 15:45
    frequency: daily
    channel: FTP
    description: Intraday priority instrument reference data — variable coupon rates
    records:
      - MMP
interval_frequency_codes:
  DAYC: Daily Payment Cycle
  ANNU: Annually Payment Cycle
  MNTH: Monthly Payment Cycle
  QUTR: Quarterly Payment Cycle
  SEMI: Half Yearly Payment Cycle
  TERM: On Maturity Of The MMI
  WEEK: Weekly Payment Cycle
  DALY: Daily
  ISDF: Issuer Defined
  ADHC: Ad Hoc
  NONE: None
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Money Market Eod Data Delivery Blueprint",
  "description": "End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates. 36 fields. 3 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, money-market, isin, reference-data, ftp, dissemination, fixed-width, non-live"
}
</script>
