<!-- AUTO-GENERATED FROM bonds-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bonds Eod Data Delivery

> End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client position, and non-resident trading reports

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · bonds · csv · xls · excel · yield-curve · mtm · zero-curve · non-live · ftp

## What this does

End-of-day bonds market data delivery via FTP — CSV/XLS formats covering zero curves, MTM valuations, trade detail, instrument statistics, member/client position, and non-resident trading reports

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, required)* — Settlement Date
- **bond_code** *(text, required)* — Bond Code
- **isin_code** *(text, required)* — Isin Code
- **maturity** *(date, required)* — Maturity
- **coupon** *(number, required)* — Coupon
- **companion_bond** *(text, optional)* — Companion Bond
- **bp_spread** *(number, optional)* — Bp Spread
- **mtm** *(number, required)* — Mtm
- **all_in_price** *(number, required)* — All In Price
- **clean_price** *(number, required)* — Clean Price
- **accrued_interest** *(number, required)* — Accrued Interest
- **year_high_yield** *(number, optional)* — Year High Yield
- **year_low_yield** *(number, optional)* — Year Low Yield
- **return_ytd** *(number, optional)* — Return Ytd
- **duration** *(number, optional)* — Duration
- **modified_duration** *(number, optional)* — Modified Duration
- **delta** *(number, optional)* — Delta
- **rand_per_basis_point** *(number, optional)* — Rand Per Basis Point
- **convexity** *(number, optional)* — Convexity
- **yield_volatility** *(number, optional)* — Yield Volatility
- **yield_price_indicator** *(text, optional)* — Yield Price Indicator
- **last_trade_date** *(date, optional)* — Last Trade Date
- **last_mtm_change_date** *(date, optional)* — Last Mtm Change Date
- **index_ratio** *(number, optional)* — Index Ratio
- **base_cpi** *(number, optional)* — Base Cpi
- **reference_cpi** *(number, optional)* — Reference Cpi
- **mtm_process_methodology** *(text, optional)* — Mtm Process Methodology
- **mtm_change** *(text, optional)* — Mtm Change
- **curve_date** *(date, required)* — Curve Date
- **period** *(text, optional)* — Period
- **bond_curve_nacc** *(number, optional)* — Bond Curve Nacc
- **swap_curve_nacc** *(number, optional)* — Swap Curve Nacc
- **real_curve_nacc** *(number, optional)* — Real Curve Nacc
- **nominal_swap_nacq** *(number, optional)* — Nominal Swap Nacq
- **nominal_bond_nacs** *(number, optional)* — Nominal Bond Nacs
- **real_bond_nacs** *(number, optional)* — Real Bond Nacs
- **curve_code** *(text, optional)* — Curve Code
- **curve_mtm** *(number, optional)* — Curve Mtm
- **time_to_maturity** *(date, optional)* — Time To Maturity
- **yield_to_maturity** *(number, optional)* — Yield To Maturity
- **statistic_date** *(date, optional)* — Statistic Date
- **trade_time** *(text, optional)* — Trade Time
- **instrument** *(text, optional)* — Instrument
- **yield** *(number, optional)* — Yield
- **nominal** *(number, optional)* — Nominal
- **consideration** *(number, optional)* — Consideration
- **carry_rate** *(number, optional)* — Carry Rate
- **trade_type** *(select, optional)* — Trade Type
- **buy_party** *(select, optional)* — Buy Party
- **sell_party** *(select, optional)* — Sell Party
- **settlement** *(date, optional)* — Settlement
- **period_settlement** *(text, optional)* — Period Settlement
- **spread** *(number, optional)* — Spread
- **trade_clean_price** *(number, optional)* — Trade Clean Price
- **deals** *(number, optional)* — Deals
- **member_client** *(select, optional)* — Member Client
- **party** *(select, optional)* — Party

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

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (71 → 75)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 58 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bonds-eod-data-delivery/) · **Spec source:** [`bonds-eod-data-delivery.blueprint.yaml`](./bonds-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
