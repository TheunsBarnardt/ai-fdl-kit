---
title: "Contingent Claims Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value contingent claims — binomial model (one- and two-period), BSM assumptions and formula, carry benefits, Black model for futures/swaptions, option Greeks, i"
---

# Contingent Claims Valuation L2 Blueprint

> Value contingent claims — binomial model (one- and two-period), BSM assumptions and formula, carry benefits, Black model for futures/swaptions, option Greeks, implied volatility

| | |
|---|---|
| **Feature** | `contingent-claims-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, options, bsm, binomial-model, option-greeks, implied-volatility, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/contingent-claims-valuation-l2.blueprint.yaml) |
| **JSON API** | [contingent-claims-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/contingent-claims-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `options_pricer` | Options Pricer | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `option_id` | text | Yes | Option identifier |  |
| `model_type` | select | Yes | binomial \| bsm \| black |  |

## Rules

- **no_arbitrage_principles:**
  - **put_call_parity:** C − P = S − PV(X); holds under no-arbitrage
  - **bounds:** Call: max(0, S−PV(X)); Put: max(0, PV(X)−S)
- **binomial_one_period:**
  - **risk_neutral_probability:** π = (1+r − d) / (u − d)
  - **option_value:** V0 = [π × Vu + (1−π) × Vd] / (1+r)
  - **replication:** Portfolio of stock + bond that replicates option payoff
- **two_period_binomial:**
  - **backward_induction:** Work from terminal nodes back to today
  - **calls_puts:** Exercise decision at each node
  - **dividends:** Reduce up/down factors at ex-date
- **interest_rate_options:**
  - **cap_floor:** Series of caplets/floorlets; reference vs strike
  - **multiperiod_binomial:** Rate tree; each node computes caplet payoff
- **bsm_assumptions:**
  - **underlying:** Lognormal returns; no jumps
  - **constant_vol:** σ fixed over life
  - **continuous_trading:** No frictions, short selling allowed
  - **risk_free_constant:** Flat term structure
- **bsm_formula:**
  - **call:** C = S × N(d1) − PV(X) × N(d2)
  - **put:** P = PV(X) × N(−d2) − S × N(−d1)
  - **d1:** (ln(S/X) + (r + σ²/2)T) / (σ√T)
  - **d2:** d1 − σ√T
- **carry_benefits_extension:**
  - **dividends:** Replace S with S × e^{−qT}; lowers call, raises put
  - **fx_options:** Foreign risk-free rate acts as carry yield
  - **futures_options:** S = F × e^{−rT} (Black model)
- **black_model:**
  - **call:** Bl(F, X, T, σ, r)
  - **use_for:** Futures options, caps, floors, swaptions
  - **swaption:** Receiver/payer swaption valued on forward swap rate
- **greeks:**
  - **delta:** ∂V/∂S; sensitivity to underlying price
  - **gamma:** ∂²V/∂S²; rate of change of delta
  - **theta:** ∂V/∂t; time decay (usually negative for long)
  - **vega:** ∂V/∂σ; sensitivity to volatility
  - **rho:** ∂V/∂r; sensitivity to interest rate
- **delta_hedging:**
  - **portfolio_delta:** Sum of position deltas × holdings
  - **dynamic_hedging:** Rebalance continuously; gamma risk remains
- **implied_volatility:**
  - **definition:** σ that equates BSM price to market price
  - **vol_smile:** Lower/higher strikes often imply higher vol
  - **vol_skew:** Equity smirk: OTM puts rich relative to model
- **validation:**
  - **option_required:** option_id present
  - **valid_model:** model_type in [binomial, bsm, black]

## Outcomes

### Value_option (Priority: 1)

_Value contingent claim using selected model_

**Given:**
- `option_id` (input) exists
- `model_type` (input) in `binomial,bsm,black`

**Then:**
- **call_service** target: `options_pricer`
- **emit_event** event: `option.valued`

### Invalid_model (Priority: 10) — Error: `OPTION_INVALID_MODEL`

_Unsupported model_

**Given:**
- `model_type` (input) not_in `binomial,bsm,black`

**Then:**
- **emit_event** event: `option.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OPTION_INVALID_MODEL` | 400 | model_type must be one of the supported option models | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `option.valued` |  | `option_id`, `model_type`, `value`, `delta`, `gamma`, `vega`, `theta` |
| `option.rejected` |  | `option_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forward-commitments-valuation-l2 | required |  |
| bonds-with-embedded-options-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Contingent Claims Valuation L2 Blueprint",
  "description": "Value contingent claims — binomial model (one- and two-period), BSM assumptions and formula, carry benefits, Black model for futures/swaptions, option Greeks, i",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, options, bsm, binomial-model, option-greeks, implied-volatility, cfa-level-2"
}
</script>
