<!-- AUTO-GENERATED FROM derivatives-market-overview.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Derivatives Market Overview

> Derivatives trading market infrastructure, sessions, settlement, and conformance

**Category:** Trading · **Version:** 1.0.0 · **Tags:** derivatives · market-structure · regulatory

## What this does

Derivatives trading market infrastructure, sessions, settlement, and conformance

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_segment** *(select, required)* — Market segment
- **trading_member_type** *(select, required)* — Member type
- **compid** *(text, required)* — Firm CompID
- **instrument_type** *(select, required)* — Instrument type
- **session_type** *(select, required)* — Session type

## What must be true

- **market_structure → segments:** Interest Rate Derivatives (IRD): Futures, options, repos on fixed income. Equity Derivatives (EDM): Stock/index options and futures. Currency Derivatives (FXM): FX forwards, swaps, options. Commodity Derivatives (CDM): Agricultural, metals, energy contracts.
- **market_structure → firm_structure:** Trading Members have multiple principals/dealers. CompID per gateway. Clearing Members clear and settle; manage client accounts. Information Subscribers have read-only market data access.
- **market_structure → sessions:** Normal book continuous 08:00-17:00 SAST, Mon-Fri (excl. holidays). Opening auction 07:50-08:00. Closing auction at market end. Volatility auctions triggered by circuit breaker. Reported trading allowed.
- **settlement → post_trade:** Trade routed to STRATE with leg details. Trade leg IDs issued. Settlement reconciliation T+0 via SWIFT or local banking.
- **settlement → futures:** Daily MTM settlement. Variation margin posted to margin account. Settlement price from closing auction or last continuous trade.
- **settlement → options:** Exercise triggers settlement (physical or cash). Assignment automatic if ITM.
- **settlement → forwards_swaps:** Forwards settle T+n via banking. Swaps settle near leg T+0, far leg T+n. Interest differential accrued per contract terms.
- **settlement → repos:** Classic repo: 2 parties. Triparty: 3 parties with agent. T+0 settlement. Collateral transfer; interest accrued per terms.
- **settlement → margin:** Initial margin per spec. Variation margin daily for futures. Interest on initial margin accrued per account agreement.
- **conformance → mandatory:** All production trading software must pass conformance. Trading members, clearing members, information subscribers. Modifications to conformed software trigger re-conformance.
- **conformance → testing:** CTS (Customer Testing Service) environment. Weekly slots Tue-Thu. Complete within one business day. JSE support 07:00-19:00 SAST. Results 24-48 hours post-completion.
- **conformance → scenarios:** Logon/logout, order insert/cancel/amend, auction participation. Reported trade submission, repo initiation/edit, mark-to-market.
- **conformance → report:** Conformance Test Report (CTR) documents scope of functionality tested. Client completes self-conformance before JSE slot. JSE analyst signs off pass/fail. Valid until software modification.

## Success & failure scenarios

**✅ Success paths**

- **Market Session Open** — when current_time gte "session_start_time"; jse_business_day eq true, then Trading session opened; orders accepted.
- **Circuit Breaker Triggered** — when price_change_pct gte "tolerance_threshold", then Volatility auction initiated; trading halted.
- **Closing Auction Settlement** — when session_status eq "CLOSING"; uncross_price exists, then EOD settlement prices published; market closed.
- **Conformance Passed** — when all_scenarios_passed eq true; conformance_report_submitted exists, then Conformance sign-off complete; production access enabled.

## Errors it can return

- `MARKET_NOT_OPEN` — Trading market is not currently open
- `CONFORMANCE_REQUIRED` — Software must pass conformance testing before production
- `TRADING_MEMBER_NOT_AUTHORIZED` — Member not authorized for market segment
- `INSTRUMENT_NOT_ACTIVE` — Instrument not actively traded or expired
- `SETTLEMENT_SYSTEM_ERROR` — Settlement system (STRATE) unavailable

## Events

**`session.opened`**
  Payload: `market_segment`, `session_type`, `time`

**`session.closed`**
  Payload: `market_segment`, `time`

**`auction.started`**
  Payload: `instrument`, `type`

**`auction.ended`**
  Payload: `instrument`, `uncross_price`

**`circuit_breaker.triggered`**
  Payload: `instrument`, `reference_price`

**`conformance.passed`**
  Payload: `member_code`, `sign_off_date`

**`trade.validated`**
  Payload: `trade_id`, `leg_ids`

**`settlement.initiated`**
  Payload: `settlement_id`, `amount`

**`margin_call.issued`**
  Payload: `member_code`, `deficit`

## Connects to

- **interest-rate-derivatives-trading** *(required)*
- **currency-derivatives-trading** *(required)*

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `█████████░` | 9/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/derivatives-market-overview/) · **Spec source:** [`derivatives-market-overview.blueprint.yaml`](./derivatives-market-overview.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
