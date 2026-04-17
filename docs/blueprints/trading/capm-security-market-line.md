---
title: "Capm Security Market Line Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the Capital Asset Pricing Model with its assumptions, plot the Security Market Line, compute expected return from beta, and describe CAPM limitations and "
---

# Capm Security Market Line Blueprint

> Apply the Capital Asset Pricing Model with its assumptions, plot the Security Market Line, compute expected return from beta, and describe CAPM limitations and extensions

| | |
|---|---|
| **Feature** | `capm-security-market-line` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, capm, sml, expected-return, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capm-security-market-line.blueprint.yaml) |
| **JSON API** | [capm-security-market-line.json]({{ site.baseurl }}/api/blueprints/trading/capm-security-market-line.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `capm_engine` | CAPM Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `capm_id` | text | Yes | CAPM calculation identifier |  |
| `risk_free_rate` | number | Yes | Risk-free rate |  |
| `market_return` | number | Yes | Expected market return |  |
| `beta` | number | Yes | Asset beta |  |

## Rules

- **capm_equation:**
  - **formula:** E(R_i) = R_f + beta_i * (E(R_m) - R_f)
  - **market_risk_premium:** E(R_m) - R_f
- **sml:**
  - **definition:** Plot of expected return versus beta for all assets
  - **slope:** Market risk premium
  - **intercept:** Risk-free rate
- **assumptions:**
  - **rationality:** Investors are risk-averse, utility maximising, price takers
  - **homogeneous_expectations:** All investors share the same inputs
  - **no_frictions:** No taxes, transaction costs, or borrowing limits
  - **single_period:** Common holding period
  - **risk_free_borrow_lend:** Unlimited at same rate
- **applications:**
  - **expected_return:** Required rate of return for valuation and capital budgeting
  - **security_selection:** Assets above SML undervalued; below SML overvalued
- **limitations:**
  - **empirical:** Low-beta anomaly, size/value anomalies
  - **single_factor:** Market beta alone does not capture cross-sectional returns
- **extensions:**
  - **arbitrage_pricing_theory:** Multiple priced factors
  - **fama_french:** Size, value, profitability, investment factors
- **validation:**
  - **capm_required:** capm_id present

## Outcomes

### Compute_capm_return (Priority: 1)

_Compute expected return via CAPM_

**Given:**
- `capm_id` (input) exists

**Then:**
- **call_service** target: `capm_engine`
- **emit_event** event: `capm.computed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CAPM_INVALID_INPUTS` | 400 | required CAPM inputs missing | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `capm.computed` |  | `capm_id`, `expected_return`, `market_risk_premium`, `beta` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| beta-market-model | required |  |
| portfolio-performance-measures | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capm Security Market Line Blueprint",
  "description": "Apply the Capital Asset Pricing Model with its assumptions, plot the Security Market Line, compute expected return from beta, and describe CAPM limitations and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, capm, sml, expected-return, cfa-level-1"
}
</script>
