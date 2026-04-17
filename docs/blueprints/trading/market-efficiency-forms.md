---
title: "Market Efficiency Forms Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Distinguish weak, semi-strong, and strong forms of market efficiency, test joint hypotheses with event studies, and reconcile market value with intrinsic value."
---

# Market Efficiency Forms Blueprint

> Distinguish weak, semi-strong, and strong forms of market efficiency, test joint hypotheses with event studies, and reconcile market value with intrinsic value

| | |
|---|---|
| **Feature** | `market-efficiency-forms` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, market-efficiency, emh, fundamental-analysis, technical-analysis, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-efficiency-forms.blueprint.yaml) |
| **JSON API** | [market-efficiency-forms.json]({{ site.baseurl }}/api/blueprints/trading/market-efficiency-forms.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `efficiency_tester` | Market Efficiency Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `test_id` | text | Yes | Efficiency test identifier |  |
| `form_under_test` | select | Yes | weak \| semi_strong \| strong |  |
| `abnormal_returns` | json | No | Cumulative abnormal return series |  |
| `information_set` | select | No | historical_prices \| public \| all_including_private |  |

## Rules

- **efficiency_definition:**
  - **price_reflects:** Prices fully reflect all relevant information
  - **speed_of_adjustment:** New information incorporated quickly
  - **abnormal_returns:** Consistent above-market returns impossible after adjusting for risk
- **forms_of_efficiency:**
  - **weak:** Past prices and volumes — technical analysis cannot produce abnormal returns
  - **semi_strong:** All public information — fundamental analysis of public data insufficient
  - **strong:** All information including private — insiders also cannot profit
- **factors_affecting_efficiency:** Number of participants and analysts, Information availability and disclosure, Limits to arbitrage (short-sale costs, capital constraints), Transaction and information costs
- **intrinsic_vs_market_value:**
  - **intrinsic:** Present value of expected future cash flows at appropriate discount rate
  - **market:** Observed transaction price
  - **equilibrium:** Active investors drive market toward intrinsic value
- **implications:**
  - **fundamental_analysis:** Helpful when market less than semi-strong efficient
  - **technical_analysis:** Only useful if weak form fails
  - **portfolio_management:** In efficient markets, favour passive indexing
- **validation:**
  - **test_required:** test_id present
  - **valid_form:** form_under_test in allowed set

## Outcomes

### Evaluate_efficiency_form (Priority: 1)

_Test a form of market efficiency against observed returns_

**Given:**
- `test_id` (input) exists
- `form_under_test` (input) in `weak,semi_strong,strong`

**Then:**
- **call_service** target: `efficiency_tester`
- **emit_event** event: `efficiency.evaluated`

### Invalid_form (Priority: 10) — Error: `EFF_INVALID_FORM`

_Unsupported efficiency form_

**Given:**
- `form_under_test` (input) not_in `weak,semi_strong,strong`

**Then:**
- **emit_event** event: `efficiency.evaluation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EFF_INVALID_FORM` | 400 | form_under_test must be weak, semi_strong, or strong | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `efficiency.evaluated` |  | `test_id`, `form`, `verdict`, `confidence` |
| `efficiency.evaluation_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-anomalies-behavioral | recommended |  |
| equity-valuation-ddm | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Efficiency Forms Blueprint",
  "description": "Distinguish weak, semi-strong, and strong forms of market efficiency, test joint hypotheses with event studies, and reconcile market value with intrinsic value.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, market-efficiency, emh, fundamental-analysis, technical-analysis, cfa-level-1"
}
</script>
