---
title: "Exchange Rate Regimes Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify FX regimes along the IMF spectrum — dollarization, currency board, fixed peg, crawling peg, managed float, free float — and trace their monetary policy"
---

# Exchange Rate Regimes Blueprint

> Classify FX regimes along the IMF spectrum — dollarization, currency board, fixed peg, crawling peg, managed float, free float — and trace their monetary policy implications

| | |
|---|---|
| **Feature** | `exchange-rate-regimes` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, foreign-exchange, exchange-rate-regime, currency-board, fixed-peg, floating-rate, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/exchange-rate-regimes.blueprint.yaml) |
| **JSON API** | [exchange-rate-regimes.json]({{ site.baseurl }}/api/blueprints/trading/exchange-rate-regimes.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_regime_analyst` | FX Regime Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Country |  |
| `regime` | select | Yes | dollarization \| monetary_union \| currency_board \| fixed_peg \| crawling_peg \| managed_float \| free_float |  |

## Rules

- **regime_spectrum:**
  - **dollarization:** Foreign currency is legal tender — no domestic monetary policy
  - **monetary_union:** Shared currency with other members (e.g., euro)
  - **currency_board:** Domestic currency backed 1:1 by foreign reserves at a fixed rate
  - **fixed_peg:** Central bank pegs to another currency or basket with narrow band
  - **crawling_peg:** Peg that adjusts on a pre-announced schedule
  - **managed_float:** Floats but central bank intervenes to smooth volatility
  - **free_float:** Market-determined rate; minimal intervention
- **trilemma:**
  - **statement:** A country cannot simultaneously have fixed FX, free capital mobility, and independent monetary policy
  - **implication:** Regime choice trades off one of the three
- **advantages_disadvantages:**
  - **fixed_adv:** Price stability, import-discipline, anchor for inflation expectations
  - **fixed_disadv:** Surrenders monetary independence; vulnerable to speculative attack
  - **float_adv:** Buffer for shocks, retains monetary independence
  - **float_disadv:** Volatility, imported inflation via depreciation
- **applications:**
  - **emerging_markets:** Often managed floats with occasional interventions
  - **crisis_dynamics:** Fixed regimes can break under capital flight (e.g., GBP 1992, Thai baht 1997)
- **validation:**
  - **jurisdiction_required:** jurisdiction present
  - **valid_regime:** regime in allowed set

## Outcomes

### Classify_regime (Priority: 1)

_Map regime to monetary policy implications_

**Given:**
- `jurisdiction` (input) exists
- `regime` (input) in `dollarization,monetary_union,currency_board,fixed_peg,crawling_peg,managed_float,free_float`

**Then:**
- **call_service** target: `fx_regime_analyst`
- **emit_event** event: `fx.regime_classified`

### Invalid_regime (Priority: 10) — Error: `FX_INVALID_REGIME`

_Unsupported regime_

**Given:**
- `regime` (input) not_in `dollarization,monetary_union,currency_board,fixed_peg,crawling_peg,managed_float,free_float`

**Then:**
- **emit_event** event: `fx.regime_rejected`

### Missing_jurisdiction (Priority: 11) — Error: `FX_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `fx.regime_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FX_INVALID_REGIME` | 400 | regime must be a valid IMF exchange rate regime | No |
| `FX_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx.regime_classified` |  | `classification_id`, `jurisdiction`, `regime`, `monetary_independence`, `fx_flexibility` |
| `fx.regime_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-flows-balance-of-payments | recommended |  |
| monetary-policy-framework | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Exchange Rate Regimes Blueprint",
  "description": "Classify FX regimes along the IMF spectrum — dollarization, currency board, fixed peg, crawling peg, managed float, free float — and trace their monetary policy",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, foreign-exchange, exchange-rate-regime, currency-board, fixed-peg, floating-rate, cfa-level-1"
}
</script>
