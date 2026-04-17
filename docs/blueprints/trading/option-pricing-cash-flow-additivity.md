---
title: "Option Pricing Cash Flow Additivity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price a European option in a one-period binomial model via the cash-flow-additivity replication approach — a portfolio of underlying plus risk-free bond that ma"
---

# Option Pricing Cash Flow Additivity Blueprint

> Price a European option in a one-period binomial model via the cash-flow-additivity replication approach — a portfolio of underlying plus risk-free bond that matches the option payoff

| | |
|---|---|
| **Feature** | `option-pricing-cash-flow-additivity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, options, binomial, replication, no-arbitrage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/option-pricing-cash-flow-additivity.blueprint.yaml) |
| **JSON API** | [option-pricing-cash-flow-additivity.json]({{ site.baseurl }}/api/blueprints/trading/option-pricing-cash-flow-additivity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `derivatives_engine` | Derivatives Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `option_type` | select | Yes | call \| put |  |
| `underlying_price` | number | Yes | Current underlying asset price (S0) |  |
| `strike_price` | number | Yes | Option strike price (K) |  |
| `up_factor` | number | Yes | Up-state multiplier (u > 1), so S_up = S0 * u |  |
| `down_factor` | number | Yes | Down-state multiplier (d < 1), so S_down = S0 * d |  |
| `risk_free_rate` | number | Yes | Periodic risk-free rate (decimal) |  |
| `periods` | number | No | Number of periods (default 1 for one-period model) |  |

## Rules

- **core_formulas:**
  - **payoffs:**
    - **call_up:** c_u = max(S0 * u - K, 0)
    - **call_down:** c_d = max(S0 * d - K, 0)
    - **put_up:** p_u = max(K - S0 * u, 0)
    - **put_down:** p_d = max(K - S0 * d, 0)
  - **hedge_ratio_call:** h = (c_u - c_d) / (S0 * u - S0 * d)
  - **hedge_ratio_put:** h = (p_u - p_d) / (S0 * u - S0 * d)  [negative for puts]
  - **replicating_portfolio_value:** V_0 = h * S0 + B, where B = PV of risk-free bond needed
  - **risk_neutral_probability:** pi = (1 + r - d) / (u - d)
  - **risk_neutral_price_call:** c_0 = (pi * c_u + (1 - pi) * c_d) / (1 + r)
  - **risk_neutral_price_put:** p_0 = (pi * p_u + (1 - pi) * p_d) / (1 + r)
  - **put_call_parity:** c_0 - p_0 = S0 - K / (1 + r)^t
- **no_arbitrage_constraint:**
  - **rule:** d < (1 + r) < u, otherwise arbitrage exists
  - **interpretation:** Risk-free growth must lie strictly between the down and up state growth
- **replication_principle:**
  - **method:** Construct a portfolio of h shares and a bond whose payoff matches the option in both states; by cash flow additivity, option price = portfolio cost
  - **why:** Eliminates the need to know actual (real-world) probabilities
- **validation:**
  - **up_greater_down:** up_factor > down_factor
  - **no_arbitrage_bounds:** down_factor < (1 + risk_free_rate) < up_factor
  - **positive_underlying:** underlying_price > 0
  - **non_negative_strike:** strike_price >= 0

## Outcomes

### Price_call (Priority: 1)

_Price a European call via replication_

**Given:**
- `option_type` (input) eq `call`
- `up_factor` (input) gt `down_factor`

**Then:**
- **call_service** target: `derivatives_engine`
- **emit_event** event: `pricing.option_calculated`

### Price_put (Priority: 2)

_Price a European put via replication_

**Given:**
- `option_type` (input) eq `put`
- `up_factor` (input) gt `down_factor`

**Then:**
- **call_service** target: `derivatives_engine`
- **emit_event** event: `pricing.option_calculated`

### Arbitrage_bounds_violated (Priority: 10) — Error: `OPTION_ARBITRAGE_BOUNDS`

_No-arbitrage constraint violated_

**Given:**
- ANY: `down_factor` (input) gte `risk_free_rate_plus_one` OR `up_factor` (input) lte `risk_free_rate_plus_one`

**Then:**
- **emit_event** event: `pricing.option_rejected`

### Invalid_factors (Priority: 11) — Error: `OPTION_INVALID_FACTORS`

_Up factor not greater than down factor_

**Given:**
- `up_factor` (input) lte `down_factor`

**Then:**
- **emit_event** event: `pricing.option_rejected`

### Invalid_underlying (Priority: 12) — Error: `OPTION_INVALID_UNDERLYING`

_Underlying or strike not valid_

**Given:**
- ANY: `underlying_price` (input) lte `0` OR `strike_price` (input) lt `0`

**Then:**
- **emit_event** event: `pricing.option_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OPTION_ARBITRAGE_BOUNDS` | 422 | No-arbitrage requires d < (1 + r) < u | No |
| `OPTION_INVALID_FACTORS` | 400 | Up factor must be strictly greater than down factor | No |
| `OPTION_INVALID_UNDERLYING` | 400 | Underlying price must be positive; strike must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.option_calculated` |  | `instrument_id`, `option_type`, `underlying_price`, `strike_price`, `up_factor`, `down_factor`, `risk_free_rate`, `option_value`, `hedge_ratio`, `risk_neutral_probability` |
| `pricing.option_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cash-flow-additivity | required |  |
| fixed-income-present-value | recommended |  |
| forward-exchange-rate-no-arbitrage | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_call:
  scenario: S0=50, K=50, u=1.20, d=0.80, r=5%, European call
  payoffs: c_u = 10, c_d = 0
  hedge_ratio: h = (10 - 0) / (60 - 40) = 0.50
  risk_neutral_pi: (1.05 - 0.80) / (1.20 - 0.80) = 0.625
  option_value: (0.625 * 10 + 0.375 * 0) / 1.05 = 5.95
  call_value: 5.95
put_call_parity_check:
  scenario: Same inputs
  put_value: c + K/(1+r) - S = 5.95 + 50/1.05 - 50 = 3.57
replication_interpretation:
  statement: Buy 0.5 shares, borrow PV of K - c_d = 50/1.05 ≈ 47.62 → net cost =
    0.5*50 - 47.62 = -22.62; adjust hedge
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Option Pricing Cash Flow Additivity Blueprint",
  "description": "Price a European option in a one-period binomial model via the cash-flow-additivity replication approach — a portfolio of underlying plus risk-free bond that ma",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, options, binomial, replication, no-arbitrage, cfa-level-1"
}
</script>
