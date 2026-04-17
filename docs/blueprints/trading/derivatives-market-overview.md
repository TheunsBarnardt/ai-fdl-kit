---
title: "Derivatives Market Overview Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Derivatives trading market infrastructure, sessions, settlement, and conformance. 5 fields. 4 outcomes. 5 error codes. rules: market_structure, settlement, conf"
---

# Derivatives Market Overview Blueprint

> Derivatives trading market infrastructure, sessions, settlement, and conformance

| | |
|---|---|
| **Feature** | `derivatives-market-overview` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, market-structure, regulatory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-market-overview.blueprint.yaml) |
| **JSON API** | [derivatives-market-overview.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-market-overview.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_segment` | select | Yes | Market segment |  |
| `trading_member_type` | select | Yes | Member type |  |
| `compid` | text | Yes | Firm CompID |  |
| `instrument_type` | select | Yes | Instrument type |  |
| `session_type` | select | Yes | Session type |  |

## Rules

- **market_structure:**
  - **segments:** Interest Rate Derivatives (IRD): Futures, options, repos on fixed income.
Equity Derivatives (EDM): Stock/index options and futures.
Currency Derivatives (FXM): FX forwards, swaps, options.
Commodity Derivatives (CDM): Agricultural, metals, energy contracts.

  - **firm_structure:** Trading Members have multiple principals/dealers. CompID per gateway.
Clearing Members clear and settle; manage client accounts.
Information Subscribers have read-only market data access.

  - **sessions:** Normal book continuous 08:00-17:00 SAST, Mon-Fri (excl. holidays).
Opening auction 07:50-08:00. Closing auction at market end.
Volatility auctions triggered by circuit breaker. Reported trading allowed.

- **settlement:**
  - **post_trade:** Trade routed to STRATE with leg details. Trade leg IDs issued.
Settlement reconciliation T+0 via SWIFT or local banking.

  - **futures:** Daily MTM settlement. Variation margin posted to margin account.
Settlement price from closing auction or last continuous trade.

  - **options:** Exercise triggers settlement (physical or cash). Assignment automatic if ITM.

  - **forwards_swaps:** Forwards settle T+n via banking. Swaps settle near leg T+0, far leg T+n.
Interest differential accrued per contract terms.

  - **repos:** Classic repo: 2 parties. Triparty: 3 parties with agent.
T+0 settlement. Collateral transfer; interest accrued per terms.

  - **margin:** Initial margin per spec. Variation margin daily for futures.
Interest on initial margin accrued per account agreement.

- **conformance:**
  - **mandatory:** All production trading software must pass conformance.
Trading members, clearing members, information subscribers.
Modifications to conformed software trigger re-conformance.

  - **testing:** CTS (Customer Testing Service) environment. Weekly slots Tue-Thu.
Complete within one business day. JSE support 07:00-19:00 SAST.
Results 24-48 hours post-completion.

  - **scenarios:** Logon/logout, order insert/cancel/amend, auction participation.
Reported trade submission, repo initiation/edit, mark-to-market.

  - **report:** Conformance Test Report (CTR) documents scope of functionality tested.
Client completes self-conformance before JSE slot.
JSE analyst signs off pass/fail. Valid until software modification.


## Outcomes

### Market_session_open (Priority: 1)

**Given:**
- `current_time` (system) gte `session_start_time`
- `jse_business_day` (system) eq `true`

**Then:**
- **transition_state** field: `market_status` from: `closed` to: `open`
- **emit_event** event: `session.opened`

**Result:** Trading session opened; orders accepted

### Circuit_breaker_triggered (Priority: 2)

**Given:**
- `price_change_pct` (computed) gte `tolerance_threshold`

**Then:**
- **emit_event** event: `circuit_breaker.triggered`

**Result:** Volatility auction initiated; trading halted

### Closing_auction_settlement (Priority: 5)

**Given:**
- `session_status` (system) eq `CLOSING`
- `uncross_price` (computed) exists

**Then:**
- **set_field** target: `eod_settlement_price` value: `uncross_price`
- **emit_event** event: `auction.ended`

**Result:** EOD settlement prices published; market closed

### Conformance_passed (Priority: 9)

**Given:**
- `all_scenarios_passed` (input) eq `true`
- `conformance_report_submitted` (input) exists

**Then:**
- **set_field** target: `conformance_status` value: `PASSED`
- **emit_event** event: `conformance.passed`

**Result:** Conformance sign-off complete; production access enabled

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKET_NOT_OPEN` | 503 | Trading market is not currently open | No |
| `CONFORMANCE_REQUIRED` | 403 | Software must pass conformance testing before production | No |
| `TRADING_MEMBER_NOT_AUTHORIZED` | 403 | Member not authorized for market segment | No |
| `INSTRUMENT_NOT_ACTIVE` | 404 | Instrument not actively traded or expired | No |
| `SETTLEMENT_SYSTEM_ERROR` | 500 | Settlement system (STRATE) unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.opened` |  | `market_segment`, `session_type`, `time` |
| `session.closed` |  | `market_segment`, `time` |
| `auction.started` |  | `instrument`, `type` |
| `auction.ended` |  | `instrument`, `uncross_price` |
| `circuit_breaker.triggered` |  | `instrument`, `reference_price` |
| `conformance.passed` |  | `member_code`, `sign_off_date` |
| `trade.validated` |  | `trade_id`, `leg_ids` |
| `settlement.initiated` |  | `settlement_id`, `amount` |
| `margin_call.issued` |  | `member_code`, `deficit` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| interest-rate-derivatives-trading | required |  |
| currency-derivatives-trading | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Market Overview Blueprint",
  "description": "Derivatives trading market infrastructure, sessions, settlement, and conformance. 5 fields. 4 outcomes. 5 error codes. rules: market_structure, settlement, conf",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, market-structure, regulatory"
}
</script>
