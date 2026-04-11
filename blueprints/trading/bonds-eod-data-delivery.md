<!-- AUTO-GENERATED FROM bonds-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bonds Eod Data Delivery

> End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client position, and non-resident trading reports

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · bonds · csv · xls · excel · yield-curve · mtm · zero-curve · non-live · ftp

## What this does

End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client position, and non-resident trading reports

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **trade_date** *(date, required)*
- **settlement_date** *(date, required)*
- **bond_code** *(text, required)*
- **isin_code** *(text, required)*
- **maturity** *(date, required)*
- **coupon** *(number, required)*
- **companion_bond** *(text, optional)*
- **bp_spread** *(number, optional)*
- **mtm** *(number, required)*
- **all_in_price** *(number, required)*
- **clean_price** *(number, required)*
- **accrued_interest** *(number, required)*
- **year_high_yield** *(number, optional)*
- **year_low_yield** *(number, optional)*
- **return_ytd** *(number, optional)*
- **duration** *(number, optional)*
- **modified_duration** *(number, optional)*
- **delta** *(number, optional)*
- **rand_per_basis_point** *(number, optional)*
- **convexity** *(number, optional)*
- **yield_volatility** *(number, optional)*
- **yield_price_indicator** *(text, optional)*
- **last_trade_date** *(date, optional)*
- **last_mtm_change_date** *(date, optional)*
- **index_ratio** *(number, optional)*
- **base_cpi** *(number, optional)*
- **reference_cpi** *(number, optional)*
- **mtm_process_methodology** *(text, optional)*
- **mtm_change** *(text, optional)*
- **curve_date** *(date, required)*
- **period** *(text, optional)*
- **bond_curve_nacc** *(number, optional)*
- **swap_curve_nacc** *(number, optional)*
- **real_curve_nacc** *(number, optional)*
- **nominal_swap_nacq** *(number, optional)*
- **nominal_bond_nacs** *(number, optional)*
- **real_bond_nacs** *(number, optional)*
- **curve_code** *(text, optional)*
- **curve_mtm** *(number, optional)*
- **time_to_maturity** *(date, optional)*
- **yield_to_maturity** *(number, optional)*
- **statistic_date** *(date, optional)*
- **trade_time** *(text, optional)*
- **instrument** *(text, optional)*
- **yield** *(number, optional)*
- **nominal** *(number, optional)*
- **consideration** *(number, optional)*
- **carry_rate** *(number, optional)*
- **trade_type** *(select, optional)*
- **buy_party** *(select, optional)*
- **sell_party** *(select, optional)*
- **settlement** *(date, optional)*
- **period_settlement** *(text, optional)*
- **spread** *(number, optional)*
- **trade_clean_price** *(number, optional)*
- **deals** *(number, optional)*
- **member_client** *(select, optional)*
- **party** *(select, optional)*

## What must be true

- **dissemination:** MUST: Disseminate Zero Curve reports at 14:30, 15:30, and 17:30 SAST daily, MUST: Generate MTM reports at 17:30 (T+3, T+1, T+0) and UTMTM reports at 15:30, MUST: Publish Trade Detail and Instrument Detail reports at end of day, MUST: Exclude trades reported and cancelled on the same day from all reports, MUST: Include backdated trades reported on the day in all reports
- **formats:** MUST: Provide all MTM reports in both XLS and CSV formats, MUST: Use comma delimiter for CSV files, MUST: Use fixed column counts per report (MTM Detailed = 26, UTMTM = 28, Trade Detail = 16)
- **identification:** MUST: Use ISIN with ZAG prefix for all listed bonds, MUST: Use bond code as short identifier, max 20 chars
- **valuation:** MUST: Calculate MTM yields for T+3, T+1, and T+0 settlement scenarios, MUST: Include BEASSA Yield Curve worksheet only in MTM Detailed report, SHOULD: Populate companion_bond for parallel yield curve shift calculations
- **access_control:** MUST: Verify subscriber entitlement before file generation, MUST: Deliver files only via IDP FTP to provisioned subscribers

## Success & failure scenarios

**✅ Success paths**

- **Generate Zero Curve 1430** — when system time reaches 14:30 SAST; daily curve inputs are available, then Build ZeroCurve<CCYYMMDD>.xls with Zeroes, Compact, and Inputs worksheets; call service; emit bonds.zero_curve.1430.disseminated.
- **Generate Zero Curve 1530** — when system time reaches 15:30 SAST, then create_record; emit bonds.zero_curve.1530.disseminated.
- **Generate Zero Curve 1730** — when system time reaches 17:30 SAST, then create_record; emit bonds.zero_curve.1730.disseminated.
- **Generate Zaronia Zero Curve** — when system time reaches 14:30, 15:30, or 17:30 SAST, then create_record; emit bonds.zaronia_curve.disseminated.
- **Generate Mtm Detailed 1730** — when system time reaches 17:30 SAST; all trades for the day have been processed, then MTMDetailed<CCYYMMDD>.xls with MTM sheet (26 cols) and BEASSA Yield Curve sheet; create_record; emit bonds.mtm_detailed.disseminated.
- **Generate Mtm T1 1730** — when system time reaches 17:30 SAST, then create_record; emit bonds.mtm_t1.disseminated.
- **Generate Mtm Value Today 1730** — when system time reaches 17:30 SAST, then create_record; emit bonds.mtm_value_today.disseminated.
- **Generate Utmtm Reports 1530** — when system time reaches 15:30 SAST, then Three Unit Trust MTM reports for T+3, T+1, T+0 settlement; emit bonds.utmtm.disseminated.
- **Generate Trade Detail Eod** — when end of day batch triggered, then TradeDetail_Daily<CCYYMMDD>.xls/.csv with 16 columns (excludes same-day cancelled trades); emit bonds.trade_detail.disseminated.
- **Generate Instrument Detail Eod** — when end of day batch triggered, then InstrumentDetail_Daily<CCYYMMDD>.xls/.csv with turnover stats per trade type; emit bonds.instrument_detail.disseminated.
- **Generate Member Client Position Eod** — when end of day batch triggered, then create_record; emit bonds.member_client_position.disseminated.

**❌ Failure paths**

- **Ftp Dissemination Failure** — when any bonds EOD file generation succeeds; ftp_transfer_status eq "failed", then notify via operations; emit bonds.dissemination.failed. *(error: `BONDS_DISSEMINATION_FAILED`)*
- **Subscriber Not Provisioned** — when subscriber_entitled eq false, then emit bonds.access_denied. *(error: `BONDS_SUBSCRIBER_NOT_PROVISIONED`)*

## Errors it can return

- `BONDS_SUBSCRIBER_NOT_PROVISIONED` — Subscriber not provisioned for bonds market data products
- `BONDS_FILE_GENERATION_FAILED` — Failed to generate bonds EOD data file
- `BONDS_DISSEMINATION_FAILED` — Failed to disseminate bonds data file via FTP
- `BONDS_INVALID_REPORT_DATE` — Report date is invalid or report unavailable for requested date

## Connects to

- **bonds-reference-corporate-actions-eod-data-delivery** *(recommended)*
- **bond-etp-eod-data-delivery** *(recommended)*
- **equities-eod-data-delivery** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bonds-eod-data-delivery/) · **Spec source:** [`bonds-eod-data-delivery.blueprint.yaml`](./bonds-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
