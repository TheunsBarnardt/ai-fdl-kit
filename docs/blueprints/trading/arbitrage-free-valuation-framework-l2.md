---
title: "Arbitrage Free Valuation Framework L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value bonds arbitrage-free — law of one price, binomial interest rate trees, calibration to term structure, pathwise valuation, Monte Carlo, equilibrium and arb"
---

# Arbitrage Free Valuation Framework L2 Blueprint

> Value bonds arbitrage-free — law of one price, binomial interest rate trees, calibration to term structure, pathwise valuation, Monte Carlo, equilibrium and arbitrage-free term structure models

| | |
|---|---|
| **Feature** | `arbitrage-free-valuation-framework-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, arbitrage-free, binomial-tree, monte-carlo, term-structure-models, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/arbitrage-free-valuation-framework-l2.blueprint.yaml) |
| **JSON API** | [arbitrage-free-valuation-framework-l2.json]({{ site.baseurl }}/api/blueprints/trading/arbitrage-free-valuation-framework-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `arbitrage_valuator` | Arbitrage-Free Bond Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `valuation_method` | select | Yes | zero_curve \| binomial_tree \| pathwise \| monte_carlo |  |

## Rules

- **meaning_of_arbitrage_free:**
  - **law_of_one_price:** Identical cash flows must have identical prices
  - **arbitrage_opportunity:** Riskless profit with zero net investment
  - **implications_fi:** Bonds with same cash flows in all states must have same price
- **arbitrage_free_option_free:**
  - **method:** Discount each cash flow at maturity-matching spot rate
  - **formula:** P = Σ CF_t / (1+s_t)^t
- **binomial_interest_rate_tree:**
  - **structure:** Lognormal tree of one-period rates with up/down nodes
  - **volatility_input:** σ governs spread between adjacent nodes (e.g., u/d = e^{2σ})
  - **risk_neutral_probabilities:** Typically 0.5/0.5 in standard build
- **determining_node_value:**
  - **backward_induction:** V_node = 0.5 × (V_up + V_down + 2C) / (1 + r_node)
  - **discount_at_node_rate:** Use one-period rate at that node
- **calibration:**
  - **objective:** Tree must price benchmark bonds (zero curve) exactly
  - **process:** Iteratively solve for short rates so model prices match observed
- **valuing_option_free:**
  - **binomial:** Backward induction on the calibrated tree
  - **cross_check:** Should equal zero-curve discounting
- **pathwise_valuation:**
  - **method:** Average present value across all 2^n paths
  - **equivalence:** Mathematically same as backward induction
- **monte_carlo:**
  - **use_when:** Path-dependent securities (MBS, prepayment)
  - **process:** Simulate many rate paths; discount along each; average
  - **benchmark:** Calibrate so expected value matches benchmark prices
- **term_structure_models:**
  - **equilibrium_models:** CIR (cir > 0 mean reverting), Vasicek (Gaussian, mean reverting); derive curve from primitives
  - **arbitrage_free_models:** Ho-Lee, BDT, HJM; fit observed curve exactly
  - **modern_models:** Affine multi-factor; LMM for swaption pricing
- **validation:**
  - **bond_required:** bond_id present
  - **valid_method:** valuation_method in [zero_curve, binomial_tree, pathwise, monte_carlo]

## Outcomes

### Value_arbitrage_free (Priority: 1)

_Value bond using arbitrage-free method_

**Given:**
- `bond_id` (input) exists
- `valuation_method` (input) in `zero_curve,binomial_tree,pathwise,monte_carlo`

**Then:**
- **call_service** target: `arbitrage_valuator`
- **emit_event** event: `arbitrage_free.valued`

### Invalid_method (Priority: 10) — Error: `ARBITRAGE_INVALID_METHOD`

_Unsupported valuation method_

**Given:**
- `valuation_method` (input) not_in `zero_curve,binomial_tree,pathwise,monte_carlo`

**Then:**
- **emit_event** event: `arbitrage_free.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ARBITRAGE_INVALID_METHOD` | 400 | valuation_method must be one of the supported methods | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `arbitrage_free.valued` |  | `bond_id`, `valuation_method`, `value`, `calibration_check` |
| `arbitrage_free.rejected` |  | `bond_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| term-structure-interest-rate-dynamics-l2 | required |  |
| bonds-with-embedded-options-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Arbitrage Free Valuation Framework L2 Blueprint",
  "description": "Value bonds arbitrage-free — law of one price, binomial interest rate trees, calibration to term structure, pathwise valuation, Monte Carlo, equilibrium and arb",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, arbitrage-free, binomial-tree, monte-carlo, term-structure-models, cfa-level-2"
}
</script>
