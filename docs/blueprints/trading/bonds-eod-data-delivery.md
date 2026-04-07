---
title: "Bonds Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client positio"
---

# Bonds Eod Data Delivery Blueprint

> End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client position, and non-resident trading reports

| | |
|---|---|
| **Feature** | `bonds-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, bonds, csv, xls, excel, yield-curve, mtm, zero-curve, non-live, ftp |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bonds-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [bonds-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/bonds-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient who receives end-of-day bonds market data files |
| `exchange_operations` | Exchange Operations | system | Exchange dissemination system that generates and delivers EOD bonds files |
| `account_manager` | Account Manager | human | Market Data team member who manages subscriber onboarding and data agreements |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_date` | date | Yes |  |  |
| `settlement_date` | date | Yes |  |  |
| `bond_code` | text | Yes |  |  |
| `isin_code` | text | Yes |  |  |
| `maturity` | date | Yes |  |  |
| `coupon` | number | Yes |  |  |
| `companion_bond` | text | No |  |  |
| `bp_spread` | number | No |  |  |
| `mtm` | number | Yes |  |  |
| `all_in_price` | number | Yes |  |  |
| `clean_price` | number | Yes |  |  |
| `accrued_interest` | number | Yes |  |  |
| `year_high_yield` | number | No |  |  |
| `year_low_yield` | number | No |  |  |
| `return_ytd` | number | No |  |  |
| `duration` | number | No |  |  |
| `modified_duration` | number | No |  |  |
| `delta` | number | No |  |  |
| `rand_per_basis_point` | number | No |  |  |
| `convexity` | number | No |  |  |
| `yield_volatility` | number | No |  |  |
| `yield_price_indicator` | text | No |  |  |
| `last_trade_date` | date | No |  |  |
| `last_mtm_change_date` | date | No |  |  |
| `index_ratio` | number | No |  |  |
| `base_cpi` | number | No |  |  |
| `reference_cpi` | number | No |  |  |
| `mtm_process_methodology` | text | No |  |  |
| `mtm_change` | text | No |  |  |
| `curve_date` | date | Yes |  |  |
| `period` | text | No |  |  |
| `bond_curve_nacc` | number | No |  |  |
| `swap_curve_nacc` | number | No |  |  |
| `real_curve_nacc` | number | No |  |  |
| `nominal_swap_nacq` | number | No |  |  |
| `nominal_bond_nacs` | number | No |  |  |
| `real_bond_nacs` | number | No |  |  |
| `curve_code` | text | No |  |  |
| `curve_mtm` | number | No |  |  |
| `time_to_maturity` | date | No |  |  |
| `yield_to_maturity` | number | No |  |  |
| `statistic_date` | date | No |  |  |
| `trade_time` | text | No |  |  |
| `instrument` | text | No |  |  |
| `yield` | number | No |  |  |
| `nominal` | number | No |  |  |
| `consideration` | number | No |  |  |
| `carry_rate` | number | No |  |  |
| `trade_type` | select | No |  |  |
| `buy_party` | select | No |  |  |
| `sell_party` | select | No |  |  |
| `settlement` | date | No |  |  |
| `period_settlement` | text | No |  |  |
| `spread` | number | No |  |  |
| `trade_clean_price` | number | No |  |  |
| `deals` | number | No |  |  |
| `member_client` | select | No |  |  |
| `party` | select | No |  |  |

## Rules

- **dissemination:** MUST: Disseminate Zero Curve reports at 14:30, 15:30, and 17:30 SAST daily, MUST: Generate MTM reports at 17:30 (T+3, T+1, T+0) and UTMTM reports at 15:30, MUST: Publish Trade Detail and Instrument Detail reports at end of day, MUST: Exclude trades reported and cancelled on the same day from all reports, MUST: Include backdated trades reported on the day in all reports
- **formats:** MUST: Provide all MTM reports in both XLS and CSV formats, MUST: Use comma delimiter for CSV files, MUST: Use fixed column counts per report (MTM Detailed = 26, UTMTM = 28, Trade Detail = 16)
- **identification:** MUST: Use ISIN with ZAG prefix for all listed bonds, MUST: Use bond code as short identifier, max 20 chars
- **valuation:** MUST: Calculate MTM yields for T+3, T+1, and T+0 settlement scenarios, MUST: Include BEASSA Yield Curve worksheet only in MTM Detailed report, SHOULD: Populate companion_bond for parallel yield curve shift calculations
- **access_control:** MUST: Verify subscriber entitlement before file generation, MUST: Deliver files only via IDP FTP to provisioned subscribers

## Outcomes

### Generate_zero_curve_1430 (Priority: 1)

**Given:**
- system time reaches 14:30 SAST
- daily curve inputs are available

**Then:**
- **create_record** — Build ZeroCurve<CCYYMMDD>.xls with Zeroes, Compact, and Inputs worksheets
- **call_service** target: `idp_ftp_dissemination`
- **emit_event** event: `bonds.zero_curve.1430.disseminated`

### Generate_zero_curve_1530 (Priority: 2)

**Given:**
- system time reaches 15:30 SAST

**Then:**
- **create_record**
- **emit_event** event: `bonds.zero_curve.1530.disseminated`

### Generate_zero_curve_1730 (Priority: 3)

**Given:**
- system time reaches 17:30 SAST

**Then:**
- **create_record**
- **emit_event** event: `bonds.zero_curve.1730.disseminated`

### Generate_zaronia_zero_curve (Priority: 4)

**Given:**
- system time reaches 14:30, 15:30, or 17:30 SAST

**Then:**
- **create_record**
- **emit_event** event: `bonds.zaronia_curve.disseminated`

### Generate_mtm_detailed_1730 (Priority: 5)

**Given:**
- system time reaches 17:30 SAST
- all trades for the day have been processed

**Then:**
- **create_record** — MTMDetailed<CCYYMMDD>.xls with MTM sheet (26 cols) and BEASSA Yield Curve sheet
- **create_record**
- **emit_event** event: `bonds.mtm_detailed.disseminated`

### Generate_mtm_t1_1730 (Priority: 6)

**Given:**
- system time reaches 17:30 SAST

**Then:**
- **create_record**
- **emit_event** event: `bonds.mtm_t1.disseminated`

### Generate_mtm_value_today_1730 (Priority: 7)

**Given:**
- system time reaches 17:30 SAST

**Then:**
- **create_record**
- **emit_event** event: `bonds.mtm_value_today.disseminated`

### Generate_utmtm_reports_1530 (Priority: 8)

**Given:**
- system time reaches 15:30 SAST

**Then:**
- **create_record** — Three Unit Trust MTM reports for T+3, T+1, T+0 settlement
- **emit_event** event: `bonds.utmtm.disseminated`

### Generate_trade_detail_eod (Priority: 9)

**Given:**
- end of day batch triggered

**Then:**
- **create_record** — TradeDetail_Daily<CCYYMMDD>.xls/.csv with 16 columns (excludes same-day cancelled trades)
- **emit_event** event: `bonds.trade_detail.disseminated`

### Generate_instrument_detail_eod (Priority: 10)

**Given:**
- end of day batch triggered

**Then:**
- **create_record** — InstrumentDetail_Daily<CCYYMMDD>.xls/.csv with turnover stats per trade type
- **emit_event** event: `bonds.instrument_detail.disseminated`

### Generate_member_client_position_eod (Priority: 11)

**Given:**
- end of day batch triggered

**Then:**
- **create_record**
- **emit_event** event: `bonds.member_client_position.disseminated`

### Ftp_dissemination_failure (Priority: 12) — Error: `BONDS_DISSEMINATION_FAILED`

**Given:**
- any bonds EOD file generation succeeds
- `ftp_transfer_status` (system) eq `failed`

**Then:**
- **notify** target: `exchange_operations`
- **emit_event** event: `bonds.dissemination.failed`

### Subscriber_not_provisioned (Priority: 13) — Error: `BONDS_SUBSCRIBER_NOT_PROVISIONED`

**Given:**
- `subscriber_entitled` (db) eq `false`

**Then:**
- **emit_event** event: `bonds.access_denied`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BONDS_SUBSCRIBER_NOT_PROVISIONED` | 403 | Subscriber not provisioned for bonds market data products | No |
| `BONDS_FILE_GENERATION_FAILED` | 500 | Failed to generate bonds EOD data file | No |
| `BONDS_DISSEMINATION_FAILED` | 500 | Failed to disseminate bonds data file via FTP | No |
| `BONDS_INVALID_REPORT_DATE` | 400 | Report date is invalid or report unavailable for requested date | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bonds-reference-corporate-actions-eod-data-delivery | recommended |  |
| bond-etp-eod-data-delivery | recommended |  |
| equities-eod-data-delivery | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
delivery_products:
  zero_curves:
    - name: Zero Curve 14:30
      filename: ZeroCurve<CCYYMMDD>.xls / ZeroCurveCompact<CCYYMMDD>.csv
      time: 14:30 SAST
      worksheets:
        - Zeroes
        - Compact
        - Inputs
    - name: Zero Curve 15:30
      filename: ZeroCurve<CCYYMMDD>.xls
      time: 15:30 SAST
    - name: Zero Curve 17:30
      filename: ZeroCurve<CCYYMMDD>.xls
      time: 17:30 SAST
  zaronia_curves:
    - name: ZARONIA Zero Curve
      times:
        - 14:30
        - 15:30
        - 17:30
      description: Zaronia Swap Curve (Overnight + OIS Swaps weekly/monthly/yearly)
  mtm_reports_t3:
    - name: MTM Detailed
      filename: MTMDetailed<CCYYMMDD>.xls / MTMDetail<CCYYMMDD>.csv
      time: 17:30
      columns: 26
      settlement: T+3
      worksheets:
        - MTM
        - BEASSA_Yield_Curve
  mtm_reports_t1:
    - name: MTM T+1
      filename: MTMT1<CCYYMMDD>.xls/.csv
      time: 17:30
      settlement: T+1
  mtm_reports_t0:
    - name: MTM Value Today
      filename: MTMValueToday<CCYYMMDD>.xls/.csv
      time: 17:30
      settlement: T+0
  utmtm_reports:
    - name: UTMTM
      filename: UTMTM<CCYYMMDD>.xls/.csv
      time: 15:30
      settlement: T+3
      description: Unit Trust MTM based on 15:00 data
    - name: UTMTM + 1
      time: 15:30
      settlement: T+1
    - name: UTMTM Value Today
      time: 15:30
      settlement: T+0
  turnover_reports:
    - name: Trade Detail
      filename: TradeDetail_Daily<CCYYMMDD>.xls/.csv
      columns: 16
      frequency: Daily, Weekly, Monthly, YTD
    - name: Instrument Detail
      filename: InstrumentDetail_Daily<CCYYMMDD>.xls/.csv
      frequency: Daily, Weekly, Monthly, YTD
    - name: Member/Client Position
      worksheets:
        - Member_Client_Overall
        - Member_Client_Instruments
      frequency: Daily, Weekly, Monthly, YTD
    - name: Non-Resident Trading
      description: Foreign vs local client trading report
trade_types:
  - Standard Trade
  - Standard Trade (Spot)
  - Repo 1
  - Repo 2
  - Structured Deal (SD)
  - Free of Value (FOV)
  - Option Exercised (OX)
  - Other
  - Backdated E&O (Standard Trade)
  - Backdated E&O (Standard Trade-Spot)
  - Backdated E&O (Repo1 or Repo2)
  - Backdated E&O (FOV)
  - Backdated E&O (Structured deal)
  - Backdated E&O (OX)
party_types:
  - Foreign Client
  - Member
  - Local Client
file_formats:
  - XLS
  - CSV
delivery_channel: IDP FTP (Information Delivery Portal)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bonds Eod Data Delivery Blueprint",
  "description": "End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client positio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, bonds, csv, xls, excel, yield-curve, mtm, zero-curve, non-live, ftp"
}
</script>
