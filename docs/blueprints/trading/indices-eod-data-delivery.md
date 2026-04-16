---
title: "Indices Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-lev"
---

# Indices Eod Data Delivery Blueprint

> End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

| | |
|---|---|
| **Feature** | `indices-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, indices, ftse, index-data, constituents, valuations, tracker, fixed-width, non-live, ftp |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/indices-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [indices-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/indices-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient of FTSE-JSE Indices non-live market data |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system generating EOD index files |
| `index_provider` | Index Provider | external | Third-party index methodology owner |
| `account_manager` | Account Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_number` | text | Yes | Market Number |  |
| `contract_type` | text | Yes | Contract Type |  |
| `instrument_type` | text | Yes | Instrument Type |  |
| `record_type` | text | Yes | Record Type |  |
| `record_sub_type` | text | Yes | Record Sub Type |  |
| `sequence_number` | text | Yes | Sequence Number |  |
| `run_date` | date | Yes | Run Date |  |
| `filler` | text | No | Filler |  |
| `index_code` | text | No | Index Code |  |
| `index_name` | text | No | Index Name |  |
| `index_value_prior` | number | No | Index Value Prior |  |
| `index_value_current` | number | No | Index Value Current |  |
| `index_change` | number | No | Index Change |  |
| `index_change_percentage` | number | No | Index Change Percentage |  |
| `index_high` | number | No | Index High |  |
| `index_low` | number | No | Index Low |  |
| `index_ytd_change` | number | No | Index Ytd Change |  |
| `index_divisor` | number | No | Index Divisor |  |
| `index_capital_value` | number | No | Index Capital Value |  |
| `index_total_return` | number | No | Index Total Return |  |
| `total_return_index_value` | number | No | Total Return Index Value |  |
| `price_return_index_value` | number | No | Price Return Index Value |  |
| `net_total_return_index_value` | number | No | Net Total Return Index Value |  |
| `instrument_alpha_code` | text | No | Instrument Alpha Code |  |
| `instrument_isin` | text | No | Instrument Isin |  |
| `instrument_short_name` | text | No | Instrument Short Name |  |
| `number_of_shares_in_issue` | number | No | Number Of Shares In Issue |  |
| `free_float_factor` | number | No | Free Float Factor |  |
| `capping_factor` | number | No | Capping Factor |  |
| `investability_weight` | number | No | Investability Weight |  |
| `sector_code` | text | No | Sector Code |  |
| `sub_sector_code` | text | No | Sub Sector Code |  |
| `icb_industry` | text | No | Icb Industry |  |
| `icb_supersector` | text | No | Icb Supersector |  |
| `icb_sector` | text | No | Icb Sector |  |
| `icb_subsector` | text | No | Icb Subsector |  |
| `constituent_weight` | number | No | Constituent Weight |  |
| `constituent_index_weight` | number | No | Constituent Index Weight |  |
| `closing_price` | number | No | Closing Price |  |
| `market_cap` | number | No | Market Cap |  |
| `free_float_market_cap` | number | No | Free Float Market Cap |  |
| `tracker_index_code` | text | No | Tracker Index Code |  |
| `tracker_date` | date | No | Tracker Date |  |
| `opening_index_value` | number | No | Opening Index Value |  |
| `closing_index_value` | number | No | Closing Index Value |  |
| `index_level_change` | number | No | Index Level Change |  |
| `total_return_index_level` | number | No | Total Return Index Level |  |
| `amendment_effective_date` | date | No | Amendment Effective Date |  |
| `amendment_type` | text | No | Amendment Type |  |
| `old_shares_in_issue` | number | No | Old Shares In Issue |  |
| `new_shares_in_issue` | number | No | New Shares In Issue |  |
| `old_free_float` | number | No | Old Free Float |  |
| `new_free_float` | number | No | New Free Float |  |
| `old_capping_factor` | number | No | Old Capping Factor |  |
| `new_capping_factor` | number | No | New Capping Factor |  |
| `amendment_reason` | text | No | Amendment Reason |  |
| `ex_dividend_date` | date | No | Ex Dividend Date |  |
| `dividend_amount` | number | No | Dividend Amount |  |
| `dividend_currency` | text | No | Dividend Currency |  |
| `dividend_type` | select | No | Dividend Type |  |
| `dividend_withholding_tax` | number | No | Dividend Withholding Tax |  |
| `opening_shares` | number | No | Opening Shares |  |
| `opening_free_float` | number | No | Opening Free Float |  |
| `opening_capping` | number | No | Opening Capping |  |
| `opening_price` | number | No | Opening Price |  |
| `five_day_amendment_date` | date | No | Five Day Amendment Date |  |
| `five_day_effective_date` | date | No | Five Day Effective Date |  |
| `five_day_amendment_description` | text | No | Five Day Amendment Description |  |

## Rules

- **format:** MUST: Use fixed-width flat file format for all indices records, MUST: Include Leading Record header on every record (market_number, record_type, sub_type, sequence, run_date), MUST: Use 3-character record_type (D + family letter + file type letter), MUST: Use 2-character record_sub_type (01=Constituents, 02=Valuations, 03=Tracker1, 04=Tracker2, 05/07=Tracker3, 11=Opening, 14=FiveDay)
- **dissemination:** MUST: Generate Valuations, Constituents, and Tracker files at end of each trading day, MUST: Generate Opening Constituents file at start of each trading day, MUST: Generate Five-Day Tracker files for upcoming weighting amendments, MUST: Deliver all files via IDP FTP to entitled subscribers only
- **identification:** MUST: Use unique record_type per index family + file type combination, MUST: Use sequence numbers 01-04 for multi-row records, 01-99 for Tracker 3
- **data_integrity:** MUST: Include all constituents in Constituents file with weightings that sum correctly, MUST: Include weighting amendment reason in Tracker 2 records, MUST: Include ex-dividend details in Tracker 3 records
- **access_control:** MUST: Verify subscriber entitlement before file generation

## Outcomes

### Generate_valuations_eod (Priority: 1)

_Daily Valuations file generated for each index family at EOD_

**Given:**
- end of trading day reached
- all index calculations complete

**Then:**
- **create_record** — Fixed-width file with Leading Record + Sub Type 02 records
- **call_service** target: `idp_ftp_dissemination`
- **emit_event** event: `indices.valuations.disseminated`

### Generate_constituents_eod (Priority: 2)

_Daily Constituents file listing all stocks in each index_

**Given:**
- end of trading day reached

**Then:**
- **create_record** — Fixed-width file with Sub Type 01 records (sequences 01-04)
- **emit_event** event: `indices.constituents.disseminated`

### Generate_tracker_1_index_level (Priority: 3)

_Tracker 1 file with index-level data per index family_

**Given:**
- end of trading day reached

**Then:**
- **create_record** — Fixed-width file with Sub Type 03 records
- **emit_event** event: `indices.tracker_1.disseminated`

### Generate_tracker_2_weighting_amendments (Priority: 4)

_Tracker 2 file with stock-level weighting amendments_

**Given:**
- ANY: `constituent_shares_changed` (computed) eq `true` OR `free_float_changed` (computed) eq `true` OR `capping_factor_changed` (computed) eq `true`

**Then:**
- **create_record** — Fixed-width file with Sub Type 04 records
- **emit_event** event: `indices.tracker_2.disseminated`

### Generate_tracker_3_ex_dividend (Priority: 5)

_Tracker 3 file with ex-dividend changes_

**Given:**
- `ex_dividend_events_present` (computed) eq `true`

**Then:**
- **create_record** — Fixed-width file with Sub Type 05/07 and 06/08 records
- **emit_event** event: `indices.tracker_3.disseminated`

### Generate_opening_constituents (Priority: 6)

_Opening Constituents file with starting positions_

**Given:**
- start of trading day reached

**Then:**
- **create_record** — Fixed-width file with Sub Type 11 records
- **emit_event** event: `indices.opening_constituents.disseminated`

### Generate_five_day_tracker (Priority: 7)

_Five-day rolling tracker of upcoming weighting amendments_

**Given:**
- end of trading day reached
- amendments scheduled within next 5 business days

**Then:**
- **create_record** — Fixed-width file with Sub Type 14 records
- **emit_event** event: `indices.five_day_tracker.disseminated`

### Dissemination_failure (Priority: 8) — Error: `INDICES_FILE_GENERATION_FAILED`

_Fixed-width file generation or FTP dissemination fails_

**Given:**
- `ftp_transfer_status` (system) eq `failed`

**Then:**
- **notify** target: `exchange_operations`
- **emit_event** event: `indices.dissemination.failed`

### Subscriber_not_provisioned (Priority: 9) — Error: `INDICES_SUBSCRIBER_NOT_PROVISIONED`

_Subscriber attempts retrieval without entitlement_

**Given:**
- `subscriber_entitled` (db) eq `false`

**Then:**
- **emit_event** event: `indices.access_denied`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INDICES_SUBSCRIBER_NOT_PROVISIONED` | 403 | Subscriber not provisioned for FTSE-JSE indices data | No |
| `INDICES_FILE_GENERATION_FAILED` | 500 | Failed to generate indices EOD data file | No |
| `INDICES_INVALID_RECORD_TYPE` | 422 | Record type code does not match any known index family | No |
| `INDICES_MISSING_CONSTITUENTS` | 422 | Constituents data missing for index family | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equities-eod-data-delivery | recommended |  |
| equity-derivatives-eod-data-delivery | optional |  |
| currency-derivatives-eod-data-delivery | optional |  |

## AGI Readiness

### Goals

#### Reliable Indices Eod Data Delivery

End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

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
| generate_valuations_eod | `autonomous` | - | - |
| generate_constituents_eod | `autonomous` | - | - |
| generate_tracker_1_index_level | `autonomous` | - | - |
| generate_tracker_2_weighting_amendments | `autonomous` | - | - |
| generate_tracker_3_ex_dividend | `autonomous` | - | - |
| generate_opening_constituents | `autonomous` | - | - |
| generate_five_day_tracker | `autonomous` | - | - |
| dissemination_failure | `autonomous` | - | - |
| subscriber_not_provisioned | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
file_type_sub_type_mapping:
  "11":
    name: Opening Constituents
    description: Starting positions for day (sequences 01-04)
  "14":
    name: Five-Day Tracker
    description: Rolling 5-day view of upcoming weighting amendments (sequences 01-04)
  "01":
    name: Constituents
    description: Full list of stocks in index with weightings (sequences 01-04)
  "02":
    name: Valuations
    description: Index values, returns, and level changes (sequences 01-02)
  "03":
    name: Tracker 1 - Index Level Data
    description: Intraday and EOD index level tracking (sequences 01-02)
  "04":
    name: Tracker 2 - Stock Level Weighting Amendments
    description: Changes to shares in issue, free float, capping (sequences 01-04)
  "05":
    name: Tracker 3 - Ex-Dividend Changes (Set 1)
    description: Ex-dividend stock adjustments (sequences 01-99)
  "07":
    name: Tracker 3 - Ex-Dividend Changes (Set 2)
    description: Ex-dividend stock adjustments (sequences 01-99)
  "06":
    name: Tracker 3 - Ex-Dividend Details
    description: Detailed ex-dividend records (sequences 01-99)
  "08":
    name: Tracker 3 - Ex-Dividend Details
    description: Detailed ex-dividend records (sequences 01-99)
record_type_char_3_codes:
  V: Valuations
  C: Constituents
  T: Tracker
  O: Opening Constituents
  F: Five-Day Tracker
  P: Index Points
index_families:
  all_share:
    record_type_prefix: DA
    full_name: FTSE/JSE All Share Index
    sub_types:
      - "01"
      - "02"
      - "03"
      - "04"
      - 05/07
      - 06/08
      - "11"
      - "14"
  top_40:
    record_type_prefix: DT
    full_name: FTSE/JSE Top 40 Index
  mid_cap:
    record_type_prefix: DM
    full_name: FTSE/JSE Mid Cap Index
  small_cap:
    record_type_prefix: DS
    full_name: FTSE/JSE Small Cap Index
  fledgling:
    record_type_prefix: DG
    full_name: FTSE/JSE Fledgling Index
  resource_20:
    record_type_prefix: DR
    full_name: FTSE/JSE Resource 20 Index
  financial_15:
    record_type_prefix: DF
    full_name: FTSE/JSE Financial 15 Index
  industrial_25:
    record_type_prefix: DI
    full_name: FTSE/JSE Industrial 25 Index
  capped_all_share:
    record_type_prefix: DC
    full_name: FTSE/JSE Capped All Share Index
  rafi_capped:
    record_type_prefix: DA
    full_name: FTSE/JSE RAFI Capped Index
  equally_weighted_top_40:
    record_type_prefix: DQ
    full_name: FTSE/JSE Equally Weighted Top 40 Index
  ex_sa_30_zar:
    record_type_prefix: D1
    full_name: FTSE/JSE Africa Ex South Africa 30 Index (ZAR)
  all_africa_40_zar:
    record_type_prefix: D2
    full_name: FTSE/JSE Africa All Africa 40 Index (ZAR)
  ex_sa_30_usd:
    record_type_prefix: D3
    full_name: FTSE/JSE Africa Ex South Africa 30 Index (USD)
  all_africa_40_usd:
    record_type_prefix: D4
    full_name: FTSE/JSE Africa All Africa 40 Index (USD)
  capped_shariah_top_40:
    record_type_prefix: DE
    full_name: FTSE/JSE Capped Shariah Top 40 Index
  equally_weighted_resource_10:
    record_type_prefix: DT
    full_name: FTSE/JSE Equally Weighted Resource 10
  resource_10_capped:
    record_type_prefix: D8
    full_name: FTSE/JSE Resource 10 Capped Index
  equally_weighted_financial_15:
    record_type_prefix: DU
    full_name: FTSE/JSE Equally Weighted Financial 15
  equally_weighted_industrial_25:
    record_type_prefix: DV
    full_name: FTSE/JSE Equally Weighted Industrial 25
  top_40_dividend:
    record_type_prefix: DZ
    full_name: FTSE/JSE Top 40 Dividend Index
    sub_types:
      - "01"
    special: Index Points Data File only
  minimum_variance_top_40:
    record_type_prefix: D6
    full_name: FTSE Minimum Variance Top 40
  minimum_variance_all_share:
    record_type_prefix: D5
    full_name: FTSE Minimum Variance All Share
  responsible_investment:
    record_type_prefix: D9
    full_name: FTSE/JSE Responsible Investment Index
  responsible_investment_top_30:
    record_type_prefix: D0
    full_name: FTSE/JSE Responsible Investment Top 30
index_family_categories:
  core:
    - All Share (DFV/DFC/DFA/DFT/DFO/DFF variants)
    - Top 40
    - Mid Cap
    - Small Cap
    - Fledgling
  sector:
    - Resource 20
    - Financial 15
    - Industrial 25
  capped:
    - Capped All Share
    - Capped Shariah Top 40
    - Resource 10 Capped
    - RAFI Capped
  style:
    - Value (DYV)
    - Growth
    - Style Top 40
    - Style Others
  equally_weighted:
    - Equally Weighted Top 40
    - Equally Weighted Resource 10
    - Equally Weighted Financial 15
    - Equally Weighted Industrial 25
  dividend_plus:
    - Dividend Plus variants (DDV/DDC/DDT/DDO/DDF)
    - Top 40 Dividend
  preference_share:
    - Preference Share variants (DRV/DRC/DRT/DRO/DRF)
  shariah:
    - Shariah variants (DHV/DHC/DHT/DHO/DHF)
    - Capped Shariah Top 40
  rafi:
    - RAFI variants (DIV/DIC/DIT)
    - RAFI Capped
  africa_regional:
    - Ex South Africa 30 (ZAR + USD)
    - All Africa 40 (ZAR + USD)
  minimum_variance:
    - Minimum Variance Top 40
    - Minimum Variance All Share
  responsible_investment:
    - Responsible Investment
    - Responsible Investment Top 30
file_format: Fixed-width flat file
delivery_channel: IDP FTP (Information Delivery Portal)
standard_file_types_per_family:
  - Valuations Data Files (VDF)
  - Constituents Data Files (CDF)
  - Tracker Data Files (TDF) - Tracker 1 Index Level
  - Tracker Data Files (TDF) - Tracker 2 Stock Weighting
  - Tracker Data Files (TDF) - Tracker 3 Ex-Dividend
  - Opening Constituents Data Files (OCDF)
  - Five-Day Tracker Data
notes:
  - Spec covers 30+ index families with identical file structure per family
  - Each family has 5 sub-products (Valuations, Constituents, Tracker, Opening,
    Five-Day)
  - "Record type is 3 chars: D + family letter + file type letter (V/C/T/O/F)"
  - Each sub type may have 1-4 sequence numbers for multi-row records
  - Tracker 3 (sub types 05/07, 06/08) supports up to 99 sequences per record
    type
  - Top 40 Dividend is special - only Index Points Data File (DZP sub type 01)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Indices Eod Data Delivery Blueprint",
  "description": "End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-lev",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, indices, ftse, index-data, constituents, valuations, tracker, fixed-width, non-live, ftp"
}
</script>
