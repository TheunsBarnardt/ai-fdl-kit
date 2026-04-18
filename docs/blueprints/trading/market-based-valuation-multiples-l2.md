---
title: "Market Based Valuation Multiples L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply price and enterprise value multiples — P/E, P/B, P/S, P/CF, dividend yield, EV/EBITDA, EV/Sales, justified vs comparables, harmonic mean, momentum indicat"
---

# Market Based Valuation Multiples L2 Blueprint

> Apply price and enterprise value multiples — P/E, P/B, P/S, P/CF, dividend yield, EV/EBITDA, EV/Sales, justified vs comparables, harmonic mean, momentum indicators

| | |
|---|---|
| **Feature** | `market-based-valuation-multiples-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, multiples, pe-ratio, ev-ebitda, comparables, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-based-valuation-multiples-l2.blueprint.yaml) |
| **JSON API** | [market-based-valuation-multiples-l2.json]({{ site.baseurl }}/api/blueprints/trading/market-based-valuation-multiples-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `multiples_analyst` | Multiples Valuation Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `multiple_type` | select | Yes | pe \| pb \| ps \| pcf \| dy \| ev_ebitda \| ev_sales |  |

## Rules

- **rationales_for_multiples:**
  - **intuitive:** Easy to communicate
  - **market_aggregates:** Reflect investor consensus
  - **empirical_support:** Value-investing literature
- **drawbacks:**
  - **static_snapshot:** Ignores forward growth dynamics
  - **accounting_distortion:** Sensitive to policy choices
  - **peer_comparability:** Hard to find true comparables
- **pe_basics:**
  - **trailing_pe:** Price ÷ trailing EPS
  - **leading_pe:** Price ÷ forecast EPS
  - **underlying_earnings:** Strip non-recurring, normalise
- **pe_justified:**
  - **formula:** Justified P/E = (1 − b) / (k_e − g)
  - **cross_section_regression:** Predicted P/E from fundamentals across peers
- **pe_using:**
  - **peer_company:** Median multiple of comparables
  - **industry_sector:** Industry composite
  - **market_multiple:** Aggregate market level
  - **own_historical:** Time-series average
  - **cross_country:** Adjust for accounting and rate differences
  - **terminal_value_in_ddm:** Multiply terminal earnings by exit P/E
- **pb_ratio:**
  - **book_value_method:** Common equity ÷ shares; adjust for intangibles, off-BS
  - **justified_pb:** (ROE − g) / (k_e − g)
  - **use_when:** Asset-heavy firms, financials
- **ps_ratio:**
  - **sales_method:** Less manipulable than EPS
  - **justified_ps:** (NPM × (1−b) × (1+g)) / (k_e − g)
  - **use_when:** Loss-making or cyclical firms
- **pcf_ratio:**
  - **cash_flow_definitions:** CFO, FCFE, EBITDA
  - **use_when:** Earnings quality concerns
- **dividend_yield:**
  - **formula:** DPS / Price
  - **use_when:** Income-focused investors; mature payers
- **ev_multiples:**
  - **enterprise_value:** Market cap + debt − cash + minority interest + preferred
  - **ev_ebitda:** Capital-structure-neutral; pre-D&A
  - **ev_sales:** For loss-makers
  - **other_ev:** EV/EBIT, EV/CFO, EV/IC
- **international_considerations:**
  - **accounting_differences:** Adjust for IFRS vs US GAAP
  - **currency:** Hedged vs unhedged comparables
- **momentum_indicators:**
  - **earnings_surprise:** Standardised unexpected earnings (SUE)
  - **relative_strength:** Price momentum over 3-12 months
- **practical_issues:**
  - **harmonic_mean:** Less biased than arithmetic mean for ratios
  - **multiple_indicators:** Triangulate from several multiples
- **validation:**
  - **company_required:** company_id present
  - **valid_multiple:** multiple_type in allowed set

## Outcomes

### Value_with_multiple (Priority: 1)

_Value equity using selected multiple_

**Given:**
- `company_id` (input) exists
- `multiple_type` (input) in `pe,pb,ps,pcf,dy,ev_ebitda,ev_sales`

**Then:**
- **call_service** target: `multiples_analyst`
- **emit_event** event: `multiple.valued`

### Invalid_multiple (Priority: 10) — Error: `MULTIPLE_INVALID_TYPE`

_Unsupported multiple_

**Given:**
- `multiple_type` (input) not_in `pe,pb,ps,pcf,dy,ev_ebitda,ev_sales`

**Then:**
- **emit_event** event: `multiple.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MULTIPLE_INVALID_TYPE` | 400 | multiple_type must be one of the supported multiples | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `multiple.valued` |  | `company_id`, `multiple_type`, `implied_value`, `peer_median`, `percentile` |
| `multiple.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-valuation-applications-l2 | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Based Valuation Multiples L2 Blueprint",
  "description": "Apply price and enterprise value multiples — P/E, P/B, P/S, P/CF, dividend yield, EV/EBITDA, EV/Sales, justified vs comparables, harmonic mean, momentum indicat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, multiples, pe-ratio, ev-ebitda, comparables, cfa-level-2"
}
</script>
