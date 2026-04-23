---
title: "Bond Etp Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details. 12 fields. 3 outcomes. 3 error cod"
---

# Bond Etp Eod Data Delivery Blueprint

> End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details

| | |
|---|---|
| **Feature** | `bond-etp-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, bond-etp, bonds, ftp, dissemination, fixed-width, csv, non-live |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bond-etp-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [bond-etp-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/bond-etp-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day bond ETP data files |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD files |
| `account_manager` | Account Manager | human | Market Data team member who manages subscriber onboarding and data agreements |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `record_type` | text | Yes | Record Type |  |
| `record_sub_type` | text | Yes | Record Sub Type |  |
| `run_date` | date | Yes | Run Date |  |
| `filler_header` | text | No | Filler Header |  |
| `trade_date` | date | Yes | Trade Date |  |
| `trade_time` | text | Yes | Trade Time |  |
| `instrument` | text | Yes | Instrument |  |
| `yield` | number | Yes | Yield |  |
| `nominal` | number | Yes | Nominal |  |
| `consideration` | number | Yes | Consideration |  |
| `trade_type` | text | Yes | Trade Type |  |
| `settlement` | date | Yes | Settlement |  |

## Rules

- **data_format:**
  - **format:** fixed_width_flat_file and CSV
  - **encoding:** ASCII
  - **field_types:**
    - **A:** Alpha only
    - **N:** Numeric only (integer shown as N(I))
    - **AN:** Alphanumeric
    - **D:** 8-byte date CCYYMMDD
    - **B:** Boolean — T for True, F for False
  - **padding:**
    - **alpha:** space (ASCII 32) right-padded
    - **numeric:** decimal point consumes 1 byte, fixed position
- **delivery:**
  - **channel:** FTP
  - **frequency:** daily
- **subscription:**
  - **requires_written_request:** true
  - **requires_data_agreement:** true
- **instrument_identification:**
  - **unique_instrument_number:** true
- **csv_format:**
  - **delimiter:** ,
  - **columns:** 8
  - **header_rows:** 4

## Outcomes

### Successful_fixed_width_delivery (Priority: 10)

**Given:**
- subscriber is licensed and provisioned with IDP credentials
- trading day has completed on bond electronic trading platform

**Then:**
- exchange operations generates BET 01 fixed-width records
- file compressed as ddap.sprd.{alphacode}.BETP.zip and delivered via FTP
- **emit_event** event: `data.delivery.completed`

**Result:** subscriber receives fixed-width bond ETP trade detail data

### Successful_csv_delivery (Priority: 11)

**Given:**
- subscriber is licensed and provisioned with IDP credentials
- trading day has completed on bond electronic trading platform

**Then:**
- exchange operations generates CSV report BondETP_DailyTradeDetail_{yyyymmdd}
- file placed in ddap.sprd.{alphacode} folder via FTP
- **emit_event** event: `data.delivery.completed`

**Result:** subscriber receives CSV bond ETP trade detail data

### Subscriber_provisioned (Priority: 12)

**Given:**
- prospective subscriber has contacted Market Data team in writing
- data agreement (JDA) obligations are met

**Then:**
- Account Manager confirms format preference and intended use
- Customer Services provides IDP credentials
- subscriber tests access

**Result:** subscriber has working FTP access to bond ETP data files

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DELIVERY_FAILED` | 500 | End-of-day bond ETP data file delivery failed | No |
| `INVALID_CREDENTIALS` | 500 | IDP authentication failed — contact Customer Services | No |
| `DATASET_NOT_PROVISIONED` | 500 | Requested dataset has not been provisioned for this subscriber | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.delivery.completed` | Bond ETP trade detail data delivered for the day | `run_date`, `format`, `file_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-eod-data-delivery | extends | Inherits shared FTP fixed-width EOD delivery specification |
| equities-eod-data-delivery | optional | Equities EOD data uses same FTP delivery infrastructure |
| bonds-eod-data-delivery | recommended | Full bonds market data provides broader bond market coverage |

## AGI Readiness

### Goals

#### Reliable Bond Etp Eod Data Delivery

End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details

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
| successful_fixed_width_delivery | `autonomous` | - | - |
| successful_csv_delivery | `autonomous` | - | - |
| subscriber_provisioned | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  HEADER:
    - name: record_type
      start: 1
      length: 4
      type: A
      end: 4
    - name: record_sub_type
      start: 5
      length: 4
      type: AN
      end: 8
    - name: run_date
      start: 9
      length: 8
      type: D
      end: 16
    - name: filler
      start: 17
      length: 20
      type: AN
      end: 36
  BET_01:
    - name: trade_date
      start: 37
      length: 8
      type: D
      end: 44
    - name: trade_time
      start: 45
      length: 8
      type: D
      end: 52
    - name: instrument
      start: 53
      length: 8
      type: AN
      end: 60
    - name: yield
      start: 61
      length: 27
      type: N
      end: 87
    - name: nominal
      start: 88
      length: 21
      type: N
      end: 108
    - name: consideration
      start: 109
      length: 24
      type: N
      end: 132
    - name: trade_type
      start: 133
      length: 40
      type: A
      end: 172
    - name: settlement
      start: 173
      length: 8
      type: D
      end: 180
record_type_map:
  BET: Bond ETP Daily Trade Detail
delivery_products:
  BETP_zip:
    filename_pattern: ddap.sprd.{alphacode}.BETP.zip
    frequency: daily
    channel: FTP
    format: fixed_width
    description: Bond ETP fixed-width trade detail records
  BETP_csv:
    filename_pattern: BondETP_DailyTradeDetail_{yyyymmdd}
    frequency: daily
    channel: FTP
    format: CSV
    location: ddap.sprd.{alphacode}/
    description: Bond ETP CSV trade detail report
    csv_columns:
      - trade_date
      - trade_time
      - instrument
      - yield
      - nominal
      - consideration
      - trade_type
      - settlement
file_prefix_map:
  BETP: Bond Electronic Trading Platform
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bond Etp Eod Data Delivery Blueprint",
  "description": "End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details. 12 fields. 3 outcomes. 3 error cod",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, bond-etp, bonds, ftp, dissemination, fixed-width, csv, non-live"
}
</script>
