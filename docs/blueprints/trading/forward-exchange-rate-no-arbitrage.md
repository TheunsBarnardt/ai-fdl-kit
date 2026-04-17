---
title: "Forward Exchange Rate No Arbitrage Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the no-arbitrage forward exchange rate between two currencies via covered interest rate parity — using cash flow additivity across currency-specific ris"
---

# Forward Exchange Rate No Arbitrage Blueprint

> Compute the no-arbitrage forward exchange rate between two currencies via covered interest rate parity — using cash flow additivity across currency-specific risk-free investments

| | |
|---|---|
| **Feature** | `forward-exchange-rate-no-arbitrage` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, fx, forward-fx, covered-interest-parity, no-arbitrage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/forward-exchange-rate-no-arbitrage.blueprint.yaml) |
| **JSON API** | [forward-exchange-rate-no-arbitrage.json]({{ site.baseurl }}/api/blueprints/trading/forward-exchange-rate-no-arbitrage.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_engine` | FX Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `spot_rate` | number | Yes | Spot exchange rate quoted as price_currency per base_currency (e.g., USD/EUR) |  |
| `base_currency_rate` | number | Yes | Risk-free rate in the base (quoted) currency (decimal, annualised) |  |
| `price_currency_rate` | number | Yes | Risk-free rate in the price currency (decimal, annualised) |  |
| `tenor_years` | number | Yes | Forward tenor in years |  |
| `compounding` | select | No | discrete \| continuous (default discrete) |  |
| `day_count` | select | No | ACT/360 \| ACT/365 \| 30/360 (default ACT/360) |  |

## Rules

- **core_formula:**
  - **discrete:** F = S * (1 + r_price)^T / (1 + r_base)^T
  - **continuous:** F = S * exp((r_price - r_base) * T)
  - **quotation_convention:** F, S quoted in units of price_currency per 1 unit of base_currency
- **points_representation:**
  - **formula:** forward_points = F - S
  - **annualised_basis:** Often quoted as (F - S) / S expressed in basis points or pips
- **interpretation:**
  - **higher_base_rate_discounted:** If r_base > r_price, base currency trades at a forward discount (F < S)
  - **higher_price_rate_premium:** If r_price > r_base, base currency trades at a forward premium (F > S)
  - **no_arbitrage:** Any deviation from CIP is an arbitrage — borrow cheap currency, lend dear currency, lock forward
- **practical_deviations:**
  - **frictions:** Transaction costs, capital controls, and credit risk cause small observable CIP deviations
  - **post_2008:** Funding basis (cross-currency basis swap) has been persistently non-zero since 2008
- **validation:**
  - **positive_spot:** spot_rate > 0
  - **positive_tenor:** tenor_years > 0
  - **rates_above_negative_one:** both rates > -1

## Outcomes

### Compute_forward_rate (Priority: 1)

_Apply CIP to compute forward_

**Given:**
- `spot_rate` (input) gt `0`
- `tenor_years` (input) gt `0`

**Then:**
- **call_service** target: `fx_engine`
- **emit_event** event: `fx.forward_calculated`

### Invalid_spot (Priority: 10) — Error: `FX_FORWARD_INVALID_SPOT`

_Spot rate not positive_

**Given:**
- `spot_rate` (input) lte `0`

**Then:**
- **emit_event** event: `fx.forward_rejected`

### Invalid_rate (Priority: 11) — Error: `FX_FORWARD_INVALID_RATE`

_A rate is at or below -100%_

**Given:**
- ANY: `base_currency_rate` (input) lte `-1` OR `price_currency_rate` (input) lte `-1`

**Then:**
- **emit_event** event: `fx.forward_rejected`

### Missing_inputs (Priority: 12) — Error: `FX_FORWARD_MISSING_INPUTS`

_Required inputs missing_

**Given:**
- ANY: `spot_rate` (input) not_exists OR `tenor_years` (input) not_exists OR `base_currency_rate` (input) not_exists OR `price_currency_rate` (input) not_exists

**Then:**
- **emit_event** event: `fx.forward_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FX_FORWARD_INVALID_SPOT` | 400 | Spot rate must be strictly positive | No |
| `FX_FORWARD_INVALID_RATE` | 400 | Both currency interest rates must be strictly greater than -100% | No |
| `FX_FORWARD_MISSING_INPUTS` | 400 | spot_rate, tenor_years, and both currency rates are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx.forward_calculated` |  | `pair`, `spot_rate`, `base_currency_rate`, `price_currency_rate`, `tenor_years`, `forward_rate`, `forward_points` |
| `fx.forward_rejected` |  | `pair`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cash-flow-additivity | required |  |
| implied-forward-rates | recommended |  |
| fixed-income-present-value | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: USD/EUR spot 1.10, USD rate 5%, EUR rate 3%, T=1
  computation: 1.10 * 1.05 / 1.03 = 1.1214
  forward: 1.1214
  interpretation: EUR at forward premium because USD rate > EUR rate
continuous_example:
  scenario: Same inputs, continuous
  computation: 1.10 * exp((0.05 - 0.03) * 1) = 1.1222
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Forward Exchange Rate No Arbitrage Blueprint",
  "description": "Compute the no-arbitrage forward exchange rate between two currencies via covered interest rate parity — using cash flow additivity across currency-specific ris",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, fx, forward-fx, covered-interest-parity, no-arbitrage, cfa-level-1"
}
</script>
