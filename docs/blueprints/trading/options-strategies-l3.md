---
title: "Options Strategies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification. 2 fiel"
---

# Options Strategies L3 Blueprint

> Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification

| | |
|---|---|
| **Feature** | `options-strategies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, options, derivatives, covered-call, protective-put, spread, straddle, collar, volatility, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/options-strategies-l3.blueprint.yaml) |
| **JSON API** | [options-strategies-l3.json]({{ site.baseurl }}/api/blueprints/trading/options-strategies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `strategy_type` | select | Yes | covered_call \| protective_put \| bull_spread \| bear_spread \| straddle \| collar \| calendar_spread |  |

## Rules

- **position_equivalencies:**
  - **synthetic_long_forward:** Long call + short put at same strike and expiry ≡ long forward
  - **synthetic_call:** Long stock + long put ≡ long call (put-call parity)
  - **synthetic_put:** Short stock + long call ≡ long put
  - **covered_call_equiv:** Long stock + short call ≡ short put (equivalent payoff profile)
- **covered_call:**
  - **objective:** Generate income from premium; cap upside; lower cost basis
  - **profit_at_expiry:** Profit = premium received − max(0, S_T − X) + (S_T − S_0)
  - **max_profit:** Strike price − purchase price + premium
  - **max_loss:** Purchase price − premium (stock goes to zero)
  - **breakeven:** Purchase price − premium received
  - **use_cases:** Overwrite to generate alpha on flat/slightly rising market; reduce effective cost basis
- **protective_put:**
  - **objective:** Insurance against downside; unlimited upside retained
  - **profit_at_expiry:** Profit = max(0, X − S_T) − premium paid + (S_T − S_0)
  - **max_loss:** Purchase price + premium − strike price
  - **breakeven:** Purchase price + premium paid
  - **use_cases:** Protect concentrated position; lock in gain before tax event
- **put_writing:**
  - **objective:** Earn premium; willing to buy stock at lower price
  - **max_profit:** Premium received
  - **max_loss:** Strike price − premium (stock to zero)
  - **risk:** Unlimited downside if stock collapses; suitable for bullish view with defined budget
- **spreads:**
  - **bull_call_spread:** Buy lower strike call, sell higher strike call; limited profit, limited cost
  - **bull_put_spread:** Sell higher strike put, buy lower strike put; net premium received; bullish
  - **bear_put_spread:** Buy higher strike put, sell lower strike put; limited profit; bearish
  - **bear_call_spread:** Sell lower strike call, buy higher strike call; net premium received; bearish
  - **max_profit_bull:** Difference in strikes − net premium paid (call spread)
  - **max_loss_bull:** Net premium paid (call spread)
- **straddle:**
  - **long_straddle:** Buy call and put at same strike; profit from large move in either direction
  - **breakeven:** Strike ± total premium
  - **use_case:** Anticipate high volatility event (earnings, binary event) without directional view
  - **short_straddle:** Sell call and put; profit from low volatility; unlimited loss potential
- **collar:**
  - **structure:** Long stock + long put + short call; bounded payoff
  - **zero_cost_collar:** Premium from short call offsets cost of put; no net premium outlay
  - **risk_reduction:** Limits both upside and downside; suitable for protecting large unrealized gain
- **calendar_spread:**
  - **structure:** Sell near-term option, buy longer-term option at same strike
  - **profit_from:** Faster time decay of near-term option (theta advantage)
  - **use_case:** Low volatility environment; exploit term structure of volatility
- **implied_vol_skew:**
  - **definition:** Implied vol varies by strike; typically higher for OTM puts (crash protection demand)
  - **put_skew:** OTM put IV > ATM IV; investors pay premium for downside protection
  - **call_skew:** OTM call IV > ATM IV; rare; indicates demand for upside participation
  - **term_structure:** Near-term IV typically higher during stress events; flattens in calm markets
- **portfolio_applications:**
  - **equity_risk_increase:** Buy calls or sell puts to increase effective equity exposure
  - **equity_risk_decrease:** Buy puts or sell calls to reduce effective equity exposure
  - **volatility_hedge:** Long straddle/strangle before binary events; short if vol is richly priced
  - **hedge_expected_volatility:** Buy VIX calls or variance swaps to hedge portfolio against volatility spike
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_strategy:** strategy_type in [covered_call, protective_put, bull_spread, bear_spread, straddle, collar, calendar_spread]

## Outcomes

### Implement_options_strategy (Priority: 1)

_Implement selected options strategy for portfolio management objective_

**Given:**
- `strategy_id` (input) exists
- `strategy_type` (input) in `covered_call,protective_put,bull_spread,bear_spread,straddle,collar,calendar_spread`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `options.strategy.implemented`

### Invalid_strategy (Priority: 10) — Error: `OPTIONS_INVALID_STRATEGY`

_Unsupported strategy type_

**Given:**
- `strategy_type` (input) not_in `covered_call,protective_put,bull_spread,bear_spread,straddle,collar,calendar_spread`

**Then:**
- **emit_event** event: `options.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OPTIONS_INVALID_STRATEGY` | 400 | strategy_type must be one of the supported option strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `options.strategy.implemented` |  | `strategy_id`, `strategy_type`, `max_profit`, `max_loss`, `breakeven`, `net_premium` |
| `options.strategy.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| options-contracts-features | extends | Builds on L1 foundations — prerequisite before this level's material |
| swaps-forwards-futures-strategies-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Options Strategies L3

Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification

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
| implement_options_strategy | `autonomous` | - | - |
| invalid_strategy | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Options Strategies L3 Blueprint",
  "description": "Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification. 2 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, options, derivatives, covered-call, protective-put, spread, straddle, collar, volatility, cfa-level-3"
}
</script>
