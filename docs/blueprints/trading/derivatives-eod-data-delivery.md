---
title: "Derivatives Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Abstract: shared FTP fixed-width flat file delivery specification for end-of-day exchange derivatives data. Extended by equity, currency, interest-rate, commodi"
---

# Derivatives Eod Data Delivery Blueprint

> Abstract: shared FTP fixed-width flat file delivery specification for end-of-day exchange derivatives data. Extended by equity, currency, interest-rate, commodity, and bond-ETP blueprints.

| | |
|---|---|
| **Feature** | `derivatives-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, ftp, dissemination, fixed-width, non-live, derivatives |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [derivatives-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day derivatives data files via FTP |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD files |
| `customer_services` | Customer Services | human | Provisions subscriber credentials and dataset access before go-live |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_number` | number | Yes | Exchange market number identifying the instrument class |  |
| `contract_type` | text | Yes | Contract type code (F=Future, Y=Option, etc.) |  |
| `instrument_type` | text | Yes | Instrument type identifier |  |
| `record_type` | text | Yes | Record type code determining the file layout |  |
| `record_sub_type` | text | Yes | Record sub-type for further layout discrimination |  |
| `run_date` | date | Yes | Business date the data represents (CCYYMMDD) |  |
| `instrument` | text | No | Instrument identifier |  |
| `file_name` | text | No | Delivered flat file name |  |

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
- **delivery:**
  - **channel:** FTP
  - **primary_time:** 20:30
  - **frequency:** daily
- **subscription:**
  - **requires_written_request:** true
  - **requires_license_agreement:** true
  - **provisioning:** Customer Services provides IDP user ID, dataset name, and password
- **redelivery:**
  - **policy:** Exchange Operations redelivers on request if files are corrupted or missing
  - **contact:** Subscriber contacts Customer Services to initiate redelivery
- **immutability:**
  - **rule:** EOD files are immutable once published — corrections trigger a new file with a redelivery flag

## Outcomes

### Delivery_failed (Priority: 1) — Error: `DELIVERY_FAILED`

_File generation or FTP transfer failed_

**Given:**
- EOD batch error or FTP transfer error occurs

**Then:**
- **emit_event** event: `data.eod.delivery_failed`

**Result:** Delivery failed — Exchange Operations initiates redelivery procedure

### Invalid_credentials (Priority: 2) — Error: `INVALID_CREDENTIALS`

_Subscriber FTP credentials rejected_

**Given:**
- IDP authentication fails for subscriber

**Result:** Subscriber cannot connect — contact Customer Services to reset credentials

### Successful_delivery (Priority: 10)

_All subscribed record types delivered to subscriber after trading day closes_

**Given:**
- subscriber is licensed and provisioned with IDP credentials
- trading day has completed and EOD batch has run

**Then:**
- **emit_event** event: `data.eod.delivered`

**Result:** Subscriber receives complete end-of-day derivatives data via FTP

### Subscriber_provisioned (Priority: 11)

_New subscriber granted FTP access after completing license and setup_

**Given:**
- prospective subscriber has contacted Market Data Department in writing
- license agreement is signed

**Then:**
- **emit_event** event: `data.subscriber.provisioned`

**Result:** Subscriber has working FTP access and can connect to retrieve files

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DELIVERY_FAILED` | 500 | End-of-day data file delivery failed. Exchange Operations will redeliver. | No |
| `INVALID_CREDENTIALS` | 401 | IDP authentication failed — contact Customer Services. | No |
| `DATASET_NOT_PROVISIONED` | 403 | Requested dataset has not been provisioned for this subscriber. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.eod.delivered` | All subscribed record types for a given market delivered for the business day | `run_date`, `market_number`, `record_types`, `file_name` |
| `data.eod.delivery_failed` | EOD file delivery failed — redelivery process initiated | `run_date`, `market_number`, `reason` |
| `data.subscriber.provisioned` | New subscriber provisioned with FTP access to a dataset | `subscriber_id`, `dataset_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-derivatives-eod-data-delivery | optional | Equity derivatives instrument family |
| currency-derivatives-eod-data-delivery | optional | Currency derivatives instrument family |
| interest-rates-derivatives-eod-data-delivery | optional | Interest rate derivatives instrument family |
| commodity-derivatives-eod-data-delivery | optional | Commodity derivatives instrument family |
| bond-etp-eod-data-delivery | optional | Bond ETP instrument family |

## AGI Readiness

### Goals

#### Reliable Eod Data Delivery

Deliver complete, accurate end-of-day derivatives data files to licensed subscribers via FTP

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| delivery_success_rate | >= 99.9% | Successful deliveries divided by total scheduled deliveries |
| delivery_timeliness | < 30 min after EOD batch | Time from batch completion to file availability on FTP |

**Constraints:**

- **regulatory** (non-negotiable): All deliveries must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before redelivery of corrected files

**Escalation Triggers:**

- `delivery_failure_rate > 0.1%`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | speed | Incomplete or corrupt EOD files cause downstream settlement failures |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| successful_delivery | `autonomous` | - | - |
| subscriber_provisioned | `supervised` | - | - |
| delivery_failed | `supervised` | - | - |
| invalid_credentials | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Eod Data Delivery Blueprint",
  "description": "Abstract: shared FTP fixed-width flat file delivery specification for end-of-day exchange derivatives data. Extended by equity, currency, interest-rate, commodi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, ftp, dissemination, fixed-width, non-live, derivatives"
}
</script>
