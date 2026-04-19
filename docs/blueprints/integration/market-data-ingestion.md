---
title: "Market Data Ingestion Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "In-house market data store ingesting from multiple vendor feeds via FIX/FAST, REST, and webhooks with normalized schema and dedupe. 10 fields. 5 outcomes. 3 err"
---

# Market Data Ingestion Blueprint

> In-house market data store ingesting from multiple vendor feeds via FIX/FAST, REST, and webhooks with normalized schema and dedupe

| | |
|---|---|
| **Feature** | `market-data-ingestion` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | market-data, fix, fast, vendor-feed, quotes, snapshots, ingestion |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/market-data-ingestion.blueprint.yaml) |
| **JSON API** | [market-data-ingestion.json]({{ site.baseurl }}/api/blueprints/integration/market-data-ingestion.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vendor` | text | Yes | Vendor Identifier |  |
| `symbol` | text | Yes | Instrument Symbol |  |
| `ccy` | text | Yes | Currency |  |
| `bid` | number | No | Bid Price |  |
| `ask` | number | No | Ask Price |  |
| `last` | number | No | Last Trade Price |  |
| `vol` | number | No | Volume |  |
| `ts_utc` | datetime | Yes | Vendor Timestamp (UTC) |  |
| `feed_protocol` | select | Yes | Feed Protocol |  |
| `snapshot_type` | select | No | Snapshot Type |  |

## Rules

- **adapter_pattern:**
  - **description:** MUST: Vendor-agnostic adapter layer normalizes every incoming quote to internal schema (vendor, symbol, ccy, bid, ask, last, vol, ts_utc)
  - **adapter_interface:** QuoteAdapter
  - **vendors_pluggable:** true
- **deduplication:**
  - **description:** MUST: Dedupe by composite key (vendor + symbol + ts_utc). Idempotent writes.
  - **key_fields:** vendor, symbol, ts_utc
- **staleness:**
  - **description:** MUST: Alert if feed lag exceeds 5 seconds on any active subscription
  - **max_lag_seconds:** 5
- **persistence:**
  - **description:** MUST: Persist intraday ticks for 30 days and EOD snapshots for 10 years
  - **intraday_retention_days:** 30
  - **eod_retention_years:** 10
- **auth:**
  - **description:** MUST: Vendor credentials stored in secrets manager, rotated quarterly. Never hardcoded.
  - **rotation_cadence:** quarterly
- **schema_validation:**
  - **description:** MUST: Reject malformed quotes with missing required fields; log to dead-letter queue
  - **dlq_enabled:** true

## Outcomes

### Vendor_auth_failed (Priority: 1) — Error: `MARKETDATA_VENDOR_AUTH_FAILED`

_Authentication to vendor feed failed_

**Given:**
- vendor returned 401 or FIX logon reject

**Then:**
- **notify** target: `market_data_team`
- **emit_event** event: `marketdata.auth_failed`

**Result:** Feed subscription disabled until credentials refreshed

### Feed_stale (Priority: 2) — Error: `MARKETDATA_FEED_STALE`

_Vendor feed lag exceeded staleness threshold_

**Given:**
- now minus ts_utc exceeds 5 seconds

**Then:**
- **notify** target: `market_data_team`
- **emit_event** event: `marketdata.feed_stale`

**Result:** Subscribers notified; trading may switch to fallback vendor

### Duplicate_detected (Priority: 3)

_Incoming quote matches an existing (vendor, symbol, ts_utc) tuple_

**Given:**
- quote with same vendor, symbol, and ts_utc already exists

**Then:**
- **emit_event** event: `marketdata.duplicate_discarded`

**Result:** Duplicate ignored; idempotent ingestion preserved

### Quote_ingested_successfully (Priority: 10) | Transaction: atomic

_A well-formed quote was normalized and persisted_

**Given:**
- `symbol` (input) exists
- `vendor` (input) exists
- `ts_utc` (input) exists

**Then:**
- **create_record** target: `quote_store`
- **emit_event** event: `marketdata.quote_ingested`

**Result:** Quote persisted and available to subscribers

### Snapshot_stored (Priority: 10)

_Intraday or EOD snapshot written successfully_

**Given:**
- `snapshot_type` (input) in `intraday,eod`

**Then:**
- **emit_event** event: `marketdata.snapshot_stored`

**Result:** Snapshot persisted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKETDATA_FEED_STALE` | 503 | Market data feed is stale. | Yes |
| `MARKETDATA_VENDOR_AUTH_FAILED` | 401 | Vendor authentication failed. | No |
| `MARKETDATA_SCHEMA_INVALID` | 400 | Incoming quote failed schema validation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `marketdata.quote_ingested` | Quote normalized and stored | `vendor`, `symbol`, `ts_utc` |
| `marketdata.snapshot_stored` | Intraday or EOD snapshot persisted | `vendor`, `symbol`, `snapshot_type`, `ts_utc` |
| `marketdata.feed_stale` | Vendor feed exceeded staleness threshold | `vendor`, `symbol`, `lag_seconds` |
| `marketdata.duplicate_discarded` | Duplicate quote ignored | `vendor`, `symbol`, `ts_utc` |
| `marketdata.auth_failed` | Vendor authentication failed | `vendor` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| immutable-audit-log | recommended | Vendor auth failures and schema violations should be audited |
| observability-metrics | required | Feed lag and ingest rate must feed SLO dashboards |

## AGI Readiness

### Goals

#### Reliable Market Data

Provide fresh, deduplicated, vendor-agnostic quotes to downstream trading and pricing systems

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| feed_freshness_p99 | < 5s | 99th percentile lag from vendor timestamp to availability |
| duplicate_rate | < 0.01% | Fraction of incoming quotes detected as duplicates but still stored |

**Constraints:**

- **availability** (non-negotiable): Feed uptime >= 99.9% during market hours
- **cost** (negotiable): Prefer multi-vendor failover to single-vendor premium tier

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before disabling a vendor feed permanently

**Escalation Triggers:**

- `vendor_auth_failed`
- `feed_stale`

### Verification

**Invariants:**

- every stored quote has (vendor, symbol, ts_utc) unique
- no quote is older than retention window
- vendor credentials never appear in logs

### Coordination

**Protocol:** `pub_sub`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| quote_ingested_successfully | `autonomous` | - | - |
| snapshot_stored | `autonomous` | - | - |
| feed_stale | `autonomous` | - | - |
| vendor_auth_failed | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data Ingestion Blueprint",
  "description": "In-house market data store ingesting from multiple vendor feeds via FIX/FAST, REST, and webhooks with normalized schema and dedupe. 10 fields. 5 outcomes. 3 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, fix, fast, vendor-feed, quotes, snapshots, ingestion"
}
</script>
