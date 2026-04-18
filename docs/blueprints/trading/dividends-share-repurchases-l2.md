---
title: "Dividends Share Repurchases L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse dividends and share repurchases — theories, payout policies, repurchase methods, EPS and book-value effects, dividend safety and coverage ratios. 2 fiel"
---

# Dividends Share Repurchases L2 Blueprint

> Analyse dividends and share repurchases — theories, payout policies, repurchase methods, EPS and book-value effects, dividend safety and coverage ratios

| | |
|---|---|
| **Feature** | `dividends-share-repurchases-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, dividends, repurchases, payout-policy, dividend-safety, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/dividends-share-repurchases-l2.blueprint.yaml) |
| **JSON API** | [dividends-share-repurchases-l2.json]({{ site.baseurl }}/api/blueprints/trading/dividends-share-repurchases-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `payout_analyst` | Payout Policy Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `payout_type` | select | Yes | regular_cash \| stock_dividend \| stock_split \| special \| repurchase |  |

## Rules

- **forms_and_effects:**
  - **regular_cash:** Reduces retained earnings and cash; no impact on share count
  - **extra_dividend:** One-off on top of regular; often from non-recurring earnings
  - **liquidating_dividend:** Return of capital, not earnings
  - **stock_dividend:** Capitalises retained earnings; share count rises proportionally
  - **stock_split:** Cosmetic; share count rises, price falls; no economic impact
  - **reverse_split:** Opposite of split; used to meet exchange minimum price
- **theories:**
  - **mm_irrelevance:** In perfect markets dividend policy has no effect on value
  - **bird_in_hand:** Investors prefer current dividends to uncertain capital gains
  - **tax_argument:** Dividends taxed more heavily than capital gains; payout reduces after-tax value
  - **signalling:** Managers use dividend actions to convey private information
  - **agency_costs:** Dividends reduce free cash flow available for empire-building
- **tax_regimes:**
  - **double_taxation:** Corporate profits taxed, then dividends taxed at shareholder
  - **dividend_imputation:** Shareholders credit corporate tax against personal liability
  - **split_rate:** Distributed profits taxed at lower rate than retained
- **factors_affecting_policy:**
  - **investment_opportunities:** High-growth firms retain more
  - **earnings_volatility:** Volatile earnings → conservative payout
  - **flexibility:** Repurchases preserve optionality vs dividend commitment
  - **tax:** Jurisdiction tax treatment influences mix
  - **flotation_costs:** Favour internal financing, lower payout
  - **restrictions:** Debt covenants, legal surplus requirements
- **payout_policies:**
  - **stable_dividend:** Target dividend slowly adjusted to long-run earnings
  - **constant_payout_ratio:** Dividend = ratio × current earnings; volatile payouts
  - **residual:** Pay what remains after investment
  - **global_trends:** Repurchases rising relative to dividends in mature markets
- **share_repurchase_methods:**
  - **open_market:** Company buys on exchange over time
  - **fixed_price_tender:** Company offers to buy N shares at set price
  - **dutch_auction_tender:** Shareholders submit prices; lowest price clearing volume wins
  - **direct_negotiation:** Private deal with large holder
- **financial_effects:**
  - **eps_surplus_cash:** Repurchase reduces shares; EPS rises if earnings yield > after-tax cash yield
  - **eps_debt_financed:** EPS change depends on debt cost vs earnings yield
  - **book_value:** Repurchase above book decreases BVPS; below book increases
  - **valuation_equivalence:** Cash dividends and share repurchases have identical total impact in perfect markets
- **dividend_safety:**
  - **earnings_coverage:** DPS ÷ EPS; payout ratio
  - **fcf_coverage:** DPS ÷ FCFE; sustainability indicator
  - **warning_signs:** Coverage declining, high leverage, flat revenue
- **validation:**
  - **company_required:** company_id present
  - **valid_payout:** payout_type in allowed set

## Outcomes

### Analyse_payout (Priority: 1)

_Analyse payout action_

**Given:**
- `company_id` (input) exists
- `payout_type` (input) in `regular_cash,stock_dividend,stock_split,special,repurchase`

**Then:**
- **call_service** target: `payout_analyst`
- **emit_event** event: `payout.analysed`

### Invalid_payout (Priority: 10) — Error: `PAYOUT_INVALID_TYPE`

_Unsupported payout type_

**Given:**
- `payout_type` (input) not_in `regular_cash,stock_dividend,stock_split,special,repurchase`

**Then:**
- **emit_event** event: `payout.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAYOUT_INVALID_TYPE` | 400 | payout_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payout.analysed` |  | `company_id`, `payout_type`, `eps_impact`, `coverage_ratio`, `safety_flag` |
| `payout.analysis_rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| financial-statement-modeling-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dividends Share Repurchases L2 Blueprint",
  "description": "Analyse dividends and share repurchases — theories, payout policies, repurchase methods, EPS and book-value effects, dividend safety and coverage ratios. 2 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, dividends, repurchases, payout-policy, dividend-safety, cfa-level-2"
}
</script>
