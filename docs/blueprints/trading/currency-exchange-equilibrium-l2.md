---
title: "Currency Exchange Equilibrium L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Determine FX equilibrium values via international parity conditions, carry trade, balance of payments flows, monetary models, and Mundell-Fleming. 2 fields. 2 o"
---

# Currency Exchange Equilibrium L2 Blueprint

> Determine FX equilibrium values via international parity conditions, carry trade, balance of payments flows, monetary models, and Mundell-Fleming

| | |
|---|---|
| **Feature** | `currency-exchange-equilibrium-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, fx, international-parity, carry-trade, mundell-fleming, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/currency-exchange-equilibrium-l2.blueprint.yaml) |
| **JSON API** | [currency-exchange-equilibrium-l2.json]({{ site.baseurl }}/api/blueprints/trading/currency-exchange-equilibrium-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_equilibrium_engine` | FX Equilibrium Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pair_id` | text | Yes | Currency pair identifier |  |
| `parity_condition` | select | Yes | cirp \| uirp \| frp \| ppp \| fisher |  |

## Rules

- **fx_concepts:**
  - **spot_quote:** Price of base currency in units of price currency
  - **bid_ask_spread:** Ask – bid; widens with risk and illiquidity
  - **cross_rates:** Derive third pair via two intermediate pairs
  - **forward_premium_discount:** (F-S)/S annualised; positive = base trades at premium
  - **mark_to_market:** PV of (F_t - F_0)*notional discounted at price-currency rate
- **international_parity_conditions:**
  - **cirp:** Covered interest rate parity F/S = (1+i_p)/(1+i_b); enforced by arbitrage
  - **uirp:** Uncovered interest rate parity E[%ΔS] = i_p - i_b; not enforced — empirical violations create carry trade
  - **frp:** Forward rate parity F = E[S]; combines CIRP and UIRP
  - **ppp:** Absolute PPP S = P_p/P_b; relative PPP %ΔS = π_p - π_b
  - **fisher:** Nominal i = real r + expected inflation
  - **real_interest_rate_parity:** Real rates equalise globally if all parities hold
- **carry_trade:**
  - **strategy:** Borrow low-yield currency, invest high-yield currency
  - **risk:** Crash risk — high-yield currency depreciates sharply during stress
  - **pnl:** Interest differential plus FX move
- **balance_of_payments_flows:**
  - **current_account:** Trade flows; persistent deficit pressures currency lower
  - **capital_account:** Investment flows; can offset CA deficits
  - **equity_market_trends:** Rising equity attracts capital inflows, supports currency
- **monetary_fiscal_policy:**
  - **mundell_fleming:** Capital mobility, exchange regime, and policy mix determine currency response
  - **monetary_models:** Quantity theory and Dornbusch overshooting
  - **portfolio_balance:** Investors hold portfolios of domestic/foreign assets; fiscal expansion via bond issuance affects FX through risk premium
- **intervention_controls:**
  - **sterilised_intervention:** FX op offset by domestic monetary op; weak effectiveness in deep markets
  - **capital_controls:** Restrict flows to manage exchange rate
- **currency_crisis_warnings:**
  - **real_appreciation:** Loss of competitiveness
  - **declining_reserves:** Limited defence capacity
  - **rising_external_debt:** Currency mismatch risk
  - **political_instability:** Capital flight catalyst
- **validation:**
  - **pair_required:** pair_id present
  - **valid_parity:** parity_condition in [cirp, uirp, frp, ppp, fisher]

## Outcomes

### Evaluate_parity (Priority: 1)

_Evaluate FX parity condition_

**Given:**
- `pair_id` (input) exists
- `parity_condition` (input) in `cirp,uirp,frp,ppp,fisher`

**Then:**
- **call_service** target: `fx_equilibrium_engine`
- **emit_event** event: `fx.parity_evaluated`

### Invalid_parity (Priority: 10) — Error: `FX_INVALID_PARITY`

_Unsupported parity condition_

**Given:**
- `parity_condition` (input) not_in `cirp,uirp,frp,ppp,fisher`

**Then:**
- **emit_event** event: `fx.parity_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FX_INVALID_PARITY` | 400 | parity_condition must be cirp, uirp, frp, ppp, or fisher | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx.parity_evaluated` |  | `pair_id`, `parity_condition`, `theoretical_value`, `observed_value`, `deviation` |
| `fx.parity_rejected` |  | `pair_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forward-exchange-rate-no-arbitrage | required |  |
| forward-rates-interest-rate-parity | required |  |
| exchange-rate-regimes | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Exchange Equilibrium L2 Blueprint",
  "description": "Determine FX equilibrium values via international parity conditions, carry trade, balance of payments flows, monetary models, and Mundell-Fleming. 2 fields. 2 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, fx, international-parity, carry-trade, mundell-fleming, cfa-level-2"
}
</script>
