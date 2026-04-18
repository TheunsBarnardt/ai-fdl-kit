---
title: "Equity Valuation Applications L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply equity valuation — value definitions (intrinsic, going-concern, liquidation, fair), applications (stock selection, M&A, IPO, fairness opinions), model sel"
---

# Equity Valuation Applications L2 Blueprint

> Apply equity valuation — value definitions (intrinsic, going-concern, liquidation, fair), applications (stock selection, M&A, IPO, fairness opinions), model selection, and research report structure

| | |
|---|---|
| **Feature** | `equity-valuation-applications-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, intrinsic-value, valuation-applications, research-report, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-valuation-applications-l2.blueprint.yaml) |
| **JSON API** | [equity-valuation-applications-l2.json]({{ site.baseurl }}/api/blueprints/trading/equity-valuation-applications-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `valuation_analyst` | Equity Valuation Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `valuation_purpose` | select | Yes | stock_selection \| ma \| ipo \| fairness_opinion \| litigation \| tax |  |

## Rules

- **value_definitions:**
  - **intrinsic_value:** Value based on a correct understanding of the firm's characteristics
  - **going_concern:** Value assuming firm continues operating
  - **liquidation:** Value if assets sold individually; floor for distressed firms
  - **fair_market_value:** Willing buyer/seller, arm's length, full information
  - **investment_value:** Value to a specific buyer given synergies or goals
- **applications:**
  - **stock_selection:** Identify mispriced securities
  - **inferring_expectations:** Reverse-engineer price to extract market assumptions
  - **evaluating_events:** M&A, divestiture, restructuring impact
  - **fairness_opinions:** Independent valuation for board fiduciary duty
  - **research_reports:** Buy/sell/hold recommendations
  - **private_business:** Transactions, tax, estate planning
  - **share_based_payments:** Equity compensation expense
- **valuation_process:**
  - **understand_business:** Industry, strategy, quality of management
  - **forecast_performance:** Top-down vs bottom-up; scenarios
  - **select_model:** Absolute (DCF, RI) vs relative (multiples)
  - **convert_to_valuation:** Run model, reconcile to market
  - **apply_conclusions:** Recommendation, report, portfolio action
- **model_selection_criteria:**
  - **dividend_paying_stable:** DDM appropriate
  - **no_dividends_positive_fcf:** FCFE/FCFF preferred
  - **mature_industry_comparables:** Relative valuation via multiples
  - **negative_earnings_asset_heavy:** Asset-based or residual income
  - **private_illiquid:** Add size/illiquidity discount
- **research_report_structure:**
  - **table_of_contents:** Executive summary with recommendation
  - **summary_and_investment_conclusion:** Target price, rating, horizon
  - **business_summary:** Company, industry, strategy
  - **risks:** Downside drivers
  - **valuation:** Model, key assumptions, sensitivity
  - **historical_and_prospective_data:** Financials, forecasts
- **analyst_responsibilities:**
  - **independence:** Avoid conflicts, disclose compensation
  - **rigorous_analysis:** Support opinions with evidence
  - **communication_clarity:** Distinguish fact from opinion
  - **update_views:** Revise when information changes
- **validation:**
  - **company_required:** company_id present
  - **valid_purpose:** valuation_purpose in allowed set

## Outcomes

### Perform_valuation (Priority: 1)

_Perform equity valuation for stated purpose_

**Given:**
- `company_id` (input) exists
- `valuation_purpose` (input) in `stock_selection,ma,ipo,fairness_opinion,litigation,tax`

**Then:**
- **call_service** target: `valuation_analyst`
- **emit_event** event: `valuation.completed`

### Invalid_purpose (Priority: 10) — Error: `VALUATION_INVALID_PURPOSE`

_Unsupported valuation purpose_

**Given:**
- `valuation_purpose` (input) not_in `stock_selection,ma,ipo,fairness_opinion,litigation,tax`

**Then:**
- **emit_event** event: `valuation.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VALUATION_INVALID_PURPOSE` | 400 | valuation_purpose must be one of the supported purposes | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `valuation.completed` |  | `company_id`, `valuation_purpose`, `intrinsic_value`, `recommendation`, `target_price` |
| `valuation.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| discounted-dividend-valuation-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Valuation Applications L2 Blueprint",
  "description": "Apply equity valuation — value definitions (intrinsic, going-concern, liquidation, fair), applications (stock selection, M&A, IPO, fairness opinions), model sel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, intrinsic-value, valuation-applications, research-report, cfa-level-2"
}
</script>
