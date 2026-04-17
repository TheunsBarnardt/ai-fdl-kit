---
title: "Derivatives Arbitrage Replication Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the law of one price, arbitrage, and risk-neutral replication to price derivatives, and explain why identical payoffs must share a single price or arbitra"
---

# Derivatives Arbitrage Replication Blueprint

> Apply the law of one price, arbitrage, and risk-neutral replication to price derivatives, and explain why identical payoffs must share a single price or arbitrage appears

| | |
|---|---|
| **Feature** | `derivatives-arbitrage-replication` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, arbitrage, law-of-one-price, risk-neutral, replication, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-arbitrage-replication.blueprint.yaml) |
| **JSON API** | [derivatives-arbitrage-replication.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-arbitrage-replication.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `arb_engine` | Arbitrage & Replication Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pricing_id` | text | Yes | Pricing identifier |  |
| `underlying_price` | number | Yes | Current underlying price |  |
| `risk_free_rate` | number | Yes | Risk-free rate (decimal) |  |
| `volatility` | number | No | Volatility input (decimal) |  |
| `time_to_expiry` | number | Yes | Time to expiry in years |  |

## Rules

- **law_of_one_price:**
  - **statement:** Two portfolios with identical payoffs must trade at the same price
  - **consequence:** Violations are riskless arbitrage opportunities
- **arbitrage_conditions:**
  - **type_1:** Positive cash flow today with no future liability
  - **type_2:** Zero cash flow today with strictly positive future payoff
- **replication:**
  - **idea:** Construct portfolio that replicates derivative payoff across states
  - **delta_hedge:** Dynamic position in underlying and cash
- **risk_neutral_probability:**
  - **formula:** q = (1 + r - d) / (u - d)
  - **where:** u, d = up/down return multipliers
  - **interpretation:** Pricing measure under which expected return equals risk-free rate
- **discounting:**
  - **rule:** Discount risk-neutral expected payoff at risk-free rate
  - **not:** Do not use real-world probabilities with real-world discount rate for arbitrage-free pricing
- **hedging_and_pricing:**
  - **connection:** Ability to hedge implies unique arbitrage-free price
  - **incomplete_markets:** No unique hedge -> range of arbitrage-free prices
- **validation:**
  - **pricing_required:** pricing_id present
  - **positive_time:** time_to_expiry > 0

## Outcomes

### Price_via_replication (Priority: 1)

_Price a derivative by constructing replicating portfolio under no-arbitrage_

**Given:**
- `pricing_id` (input) exists
- `time_to_expiry` (input) gt `0`

**Then:**
- **call_service** target: `arb_engine`
- **emit_event** event: `replication.priced`

### Invalid_time (Priority: 10) — Error: `REPL_INVALID_TIME`

_Non-positive time to expiry_

**Given:**
- `time_to_expiry` (input) lte `0`

**Then:**
- **emit_event** event: `replication.pricing_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPL_INVALID_TIME` | 400 | time_to_expiry must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `replication.priced` |  | `pricing_id`, `replication_value`, `hedge_weights`, `implied_q` |
| `replication.pricing_rejected` |  | `pricing_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| binomial-option-pricing | required |  |
| options-put-call-parity | required |  |
| forward-futures-pricing | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Arbitrage Replication Blueprint",
  "description": "Apply the law of one price, arbitrage, and risk-neutral replication to price derivatives, and explain why identical payoffs must share a single price or arbitra",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, arbitrage, law-of-one-price, risk-neutral, replication, cfa-level-1"
}
</script>
