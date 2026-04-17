<!-- AUTO-GENERATED FROM instrument-classification.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Instrument Classification

> Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and characteristics.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** instruments · classification · derivatives · bonds · equities · structured-products · reference-data

## What this does

Classifies derivative and cash instruments traded on exchanges, including futures, options, bonds, equities, and structured products with trading rules and characteristics.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **instrument_type_code** *(text, required)* — Instrument Type Code
- **instrument_name** *(text, required)* — Instrument Name
- **contract_code** *(text, optional)* — Contract Code
- **isin** *(text, optional)* — ISIN
- **underlying_asset** *(text, optional)* — Underlying Asset
- **expiry_date** *(date, optional)* — Expiry Date
- **strike_price** *(number, optional)* — Strike Price
- **contract_size** *(number, optional)* — Contract Size
- **settlement_type** *(select, optional)* — Settlement Type
- **trading_currency** *(text, optional)* — Trading Currency
- **market_segment** *(select, optional)* — Market Segment

## What must be true

- **equity_derivatives → futures_single_stock:** Single stock futures settled physically or cash
- **equity_derivatives → futures_index:** Index futures on JSE indices with mini and standard sizes
- **equity_derivatives → options_equity:** Equity options with American or European exercise
- **equity_derivatives → options_index:** Index options with standard strike intervals
- **equity_derivatives → warrant_equity:** Call and put warrants on single stocks
- **equity_derivatives → cfds_equity:** Margined contracts settled in cash
- **fixed_income_instruments → vanilla_bonds:** Fixed coupon bonds with semi-annual payments
- **fixed_income_instruments → floating_rate_notes:** Coupon linked to floating rate index (JIBAR-based)
- **fixed_income_instruments → amortising_bonds:** Nominal reducing over time with quarterly reductions
- **fixed_income_instruments → inflation_linked:** Principal and coupon adjusted for CPI
- **fixed_income_instruments → commercial_paper:** Short-term money market paper issued at discount
- **fixed_income_instruments → perpetuities:** Instruments with no maturity date
- **fixed_income_instruments → credit_linked_notes:** Bonds with embedded credit derivatives
- **fixed_income_instruments → convertible_bonds:** Bonds convertible into equity at specified price
- **structured_products → equity_structured_notes:** Debt instruments financing equity purchases
- **structured_products → callable_bonds:** Issuer has redemption right before maturity
- **structured_products → putable_bonds:** Bondholder has sell-back right before maturity
- **structured_products → basket_products:** Underlying comprises multiple assets
- **structured_products → exotic_options:** Non-standard options on stocks or indices
- **currency_derivatives → currency_futures:** Futures on currency pairs (USDZAR, etc.)
- **currency_derivatives → currency_options:** Options on currency pairs
- **currency_derivatives → currency_cfds:** Margined currency contracts
- **currency_derivatives → quanto_derivatives:** Derivatives with embedded FX conversion
- **reference_data_requirements → contract_code_format:** Alphanumeric format derived from expiry, underlying, settlement
- **reference_data_requirements → isin_requirement:** All tradable instruments assigned unique ISIN
- **reference_data_requirements → tick_structure:** Defined tick sizes by price range
- **reference_data_requirements → settlement_period:** T+3 for equities; T+0 to T+2 for derivatives
- **reference_data_requirements → market_segments:** Main Board, AltX, BOND, Derivatives, Warrant

## Success & failure scenarios

**❌ Failure paths**

- **Instrument Created** — when New instrument approved for listing; instrument_type_code exists; underlying_asset exists; contract_size gt 0, then Instrument created in reference data. _Why: New instrument created and added to reference data system._ *(error: `INSTRUMENT_CREATED`)*
- **Contract Code Assigned** — when Instrument in pre_listing status; All contract code components available; instrument_type_code matches "FUTURE|OPTION", then Contract code generated and published. _Why: Contract code generated and published to market participants._ *(error: `CONTRACT_CODE_ASSIGNED`)*
- **Trading Parameters Configured** — when Instrument in pre_listing status; contract_size exists, then Trading parameters configured. _Why: Trading parameters including tick size and price limits configured._ *(error: `TRADING_PARAMETERS_CONFIGURED`)*
- **Instrument Trading Opened** — when Instrument in pre_listing status; Opening date reached; All approvals obtained, then Instrument begins trading. _Why: Instrument opened for trading in specified market segment._ *(error: `INSTRUMENT_TRADING_OPENED`)*
- **Corporate Action Declared** — when Instrument is active_trading; Corporate action declared; corporate_action_type matches "dividend|rights|bonus", then Corporate action reference data updated. _Why: Corporate action declared and reference data updated with ex-markers._ *(error: `CORPORATE_ACTION_DECLARED`)*
- **Instrument Suspended** — when Instrument is active_trading; Corporate action ex-date reached, then Trading suspended for corporate action. _Why: Trading suspended for corporate action processing or compliance._ *(error: `INSTRUMENT_SUSPENDED`)*
- **Instrument Trading Resumed** — when Instrument is suspended; Suspension reason resolved, then Trading resumed. _Why: Trading resumed after suspension or corporate action processing._ *(error: `INSTRUMENT_TRADING_RESUMED`)*
- **Instrument Expired** — when Instrument is active_trading; Expiry date has been reached; instrument_type_code matches "FUTURE|OPTION|WARRANT", then Instrument delisted after expiry. _Why: Instrument delisted after expiry date reached and final settlement completed._ *(error: `INSTRUMENT_EXPIRED`)*

## Errors it can return

- `INSTRUMENT_CREATED` — Instrument created and added to reference data
- `CONTRACT_CODE_ASSIGNED` — Contract code generated and published
- `TRADING_PARAMETERS_CONFIGURED` — Trading parameters configured
- `INSTRUMENT_TRADING_OPENED` — Instrument opened for trading
- `CORPORATE_ACTION_DECLARED` — Corporate action declared
- `INSTRUMENT_SUSPENDED` — Trading suspended
- `INSTRUMENT_TRADING_RESUMED` — Trading resumed
- `INSTRUMENT_EXPIRED` — Instrument expired and delisted

## Events

**`instrument.created`**
  Payload: `instrument_type_code`, `underlying_asset`, `contract_size`

**`contract_code.assigned`**
  Payload: `contract_code`, `isin`, `instrument_type_code`

**`trading_parameters.configured`**
  Payload: `instrument_type_code`, `tick_size`, `contract_size`

**`instrument.trading_opened`**
  Payload: `instrument_type_code`, `opening_date`, `market_segment`

**`corporate_action.declared`**
  Payload: `instrument_type_code`, `ex_date`, `record_date`

**`instrument.suspended`**
  Payload: `instrument_type_code`, `suspension_date`, `reason`

**`instrument.trading_resumed`**
  Payload: `instrument_type_code`, `resumption_date`

**`instrument.expired`**
  Payload: `instrument_type_code`, `expiry_date`, `settlement_type`

## Connects to

- **listings-requirements** *(required)*
- **settlement-and-clearing** *(recommended)*
- **market-data-dissemination** *(recommended)*

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/instrument-classification/) · **Spec source:** [`instrument-classification.blueprint.yaml`](./instrument-classification.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
