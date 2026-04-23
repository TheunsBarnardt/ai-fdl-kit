---
title: "Continuously Compounded Returns Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Convert between holding-period and continuously compounded returns, leverage their additivity over time, and annualise volatility using the square-root-of-time "
---

# Continuously Compounded Returns Blueprint

> Convert between holding-period and continuously compounded returns, leverage their additivity over time, and annualise volatility using the square-root-of-time rule

| | |
|---|---|
| **Feature** | `continuously-compounded-returns` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, returns, continuously-compounded, log-returns, volatility-scaling, annualisation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/continuously-compounded-returns.blueprint.yaml) |
| **JSON API** | [continuously-compounded-returns.json]({{ site.baseurl }}/api/blueprints/trading/continuously-compounded-returns.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `return_engine` | Return Calculation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `prices` | json | No | Array of prices {t, price} for converting to continuously compounded returns |  |
| `holding_period_return` | number | No | Simple return r_hpr for conversion to ln(1 + r_hpr) |  |
| `period_volatility` | number | No | Volatility to be annualised |  |
| `periods_per_year` | number | No | Number of periods per year (default 250 trading days) |  |

## Rules

- **core_formulas:**
  - **cc_return_from_prices:** r_cc = ln(P_T / P_0)
  - **cc_from_hpr:** r_cc = ln(1 + r_hpr)
  - **hpr_from_cc:** r_hpr = exp(r_cc) - 1
  - **additivity_over_time:** r_0,T = r_0,1 + r_1,2 + ... + r_{T-1,T} (log returns are additive)
  - **expected_multi_period:** E(r_0,T) = T * mu when single-period returns are i.i.d. with mean mu
  - **variance_multi_period:** Var(r_0,T) = T * sigma^2 (i.i.d. assumption)
  - **volatility_scaling:** sigma(r_0,T) = sigma * sqrt(T)
  - **annualised_volatility:** sigma_annual = sigma_daily * sqrt(periods_per_year)
- **assumptions:**
  - **iid:** Returns are independently and identically distributed
  - **stationarity:** Mean and variance of period returns do not change over time
  - **normality_optional:** Normality of period returns implies normality of sum (exactly); CLT gives approximate normality otherwise
- **key_properties:**
  - **log_additivity:** ln(P_T / P_0) decomposes into sum of single-period log returns — enables variance scaling
  - **no_arithmetic_additivity:** Simple returns are NOT additive across time: (1+r_1)(1+r_2) != 1 + r_1 + r_2
  - **always_unbounded_below:** Unlike simple returns (>= -100%), log returns can be any real number — though price > 0 always
- **annualisation_convention:**
  - **trading_days:** Standard is 250 trading days per year; some sources use 252
  - **volatility_only:** Square-root-of-time scales volatility; expected return scales linearly
- **applications:**
  - **var_modelling:** Scale daily vol to annual horizon via sqrt(T) under i.i.d. assumption
  - **option_pricing:** Black-Scholes-Merton uses continuously compounded returns
  - **portfolio_compounding:** Multi-period portfolio return = sum of log returns
- **validation:**
  - **prices_positive:** All prices > 0 to compute ln(P)
  - **hpr_greater_than_neg_one:** 1 + r_hpr > 0 to compute ln
  - **periods_per_year_positive:** periods_per_year > 0

## Outcomes

### Convert_prices_to_returns (Priority: 1)

_ln(P_t / P_{t-1}) over price series_

**Given:**
- `prices` (input) exists

**Then:**
- **call_service** target: `return_engine`
- **emit_event** event: `return.cc_calculated`

### Convert_hpr_to_cc (Priority: 2)

_r_cc = ln(1 + r_hpr)_

**Given:**
- `holding_period_return` (input) exists

**Then:**
- **call_service** target: `return_engine`
- **emit_event** event: `return.cc_calculated`

### Annualise_volatility (Priority: 3)

_Scale period volatility by sqrt(periods_per_year)_

**Given:**
- `period_volatility` (input) exists
- `periods_per_year` (input) exists

**Then:**
- **call_service** target: `return_engine`
- **emit_event** event: `return.volatility_annualised`

### Invalid_price (Priority: 10) — Error: `CC_RETURN_INVALID_PRICE`

_Non-positive price in series_

**Given:**
- `min_price` (computed) lte `0`

**Then:**
- **emit_event** event: `return.cc_rejected`

### Invalid_hpr (Priority: 11) — Error: `CC_RETURN_INVALID_HPR`

_1 + r_hpr <= 0_

**Given:**
- `holding_period_return` (input) lte `-1`

**Then:**
- **emit_event** event: `return.cc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CC_RETURN_INVALID_PRICE` | 400 | All prices must be positive | No |
| `CC_RETURN_INVALID_HPR` | 400 | Holding-period return must satisfy 1 + r > 0 | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.cc_calculated` |  | `dataset_id`, `cc_return`, `hpr`, `period_count` |
| `return.volatility_annualised` |  | `dataset_id`, `period_volatility`, `annualised_volatility`, `periods_per_year` |
| `return.cc_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| lognormal-distribution-asset-prices | required |  |
| holding-period-return | recommended |  |
| monte-carlo-simulation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Continuously Compounded Returns

Convert between holding-period and continuously compounded returns, leverage their additivity over time, and annualise volatility using the square-root-of-time rule

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `lognormal_distribution_asset_prices` | lognormal-distribution-asset-prices | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| convert_prices_to_returns | `autonomous` | - | - |
| convert_hpr_to_cc | `autonomous` | - | - |
| annualise_volatility | `autonomous` | - | - |
| invalid_price | `autonomous` | - | - |
| invalid_hpr | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Daily volatility 0.01 annualised over 250 trading days
  daily_vol: 0.01
  periods_per_year: 250
  annualised_vol: 0.01 * sqrt(250) = 0.1581
mordice_example:
  p_0: 112
  p_t: 120
  cc_return: ln(120/112) = 0.0690 = 6.90%
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Continuously Compounded Returns Blueprint",
  "description": "Convert between holding-period and continuously compounded returns, leverage their additivity over time, and annualise volatility using the square-root-of-time ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, returns, continuously-compounded, log-returns, volatility-scaling, annualisation, cfa-level-1"
}
</script>
