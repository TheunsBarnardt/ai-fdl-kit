---
title: "Active Equity Portfolio Construction L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Active equity portfolio construction — building blocks, risk measures, risk budgeting, position sizing, long/short strategies, market-neutral, and implicit cost"
---

# Active Equity Portfolio Construction L3 Blueprint

> Active equity portfolio construction — building blocks, risk measures, risk budgeting, position sizing, long/short strategies, market-neutral, and implicit costs

| | |
|---|---|
| **Feature** | `active-equity-portfolio-construction-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, equity, active-equity, portfolio-construction, risk-budgeting, long-short, market-neutral, tracking-error, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/active-equity-portfolio-construction-l3.blueprint.yaml) |
| **JSON API** | [active-equity-portfolio-construction-l3.json]({{ site.baseurl }}/api/blueprints/trading/active-equity-portfolio-construction-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `construction_type` | select | Yes | long_only \| long_short \| long_extension \| market_neutral |  |

## Rules

- **building_blocks:**
  - **alpha:** Return attributed to manager skill; idiosyncratic to individual security selection
  - **factor_exposure:** Systematic risk tilts (value, momentum, quality); rewarded but not unique to manager
  - **sizing:** Position size should reflect conviction, alpha, and marginal contribution to risk
- **benchmark_relative_risk:**
  - **tracking_error:** Standard deviation of active return; primary measure of active risk
  - **active_share:** Sum of absolute weight deviations / 2; measures degree of differentiation from index
  - **closet_indexing:** Low active share + high fee = value destruction; active share < 60% is warning sign
  - **high_conviction:** High active share + high tracking error = concentrated; requires skill to justify
- **objectives_constraints:**
  - **absolute_risk:** Total portfolio volatility; relevant for standalone portfolios
  - **relative_risk:** Tracking error vs benchmark; relevant for benchmark-relative mandates
  - **risk_target:** Set by client risk tolerance; manager cannot exceed without mandate breach
  - **liquidity_constraint:** Position size limited by daily trading volume; avoid illiquid concentrations
  - **leverage:** Borrowing amplifies return and risk; introduces margin call risk; increases drawdown potential
- **risk_budget:**
  - **allocation:** Divide total active risk budget across securities and factors
  - **marginal_contribution:** Each position's contribution to portfolio active risk; optimize efficiency
  - **information_ratio:** Alpha per unit of active risk; maximize IR across positions
  - **formal_constraints:** Sector limits, position limits, factor exposure limits
- **implicit_costs:**
  - **market_impact:** Large orders move prices adversely; impact rises with position size as % of ADV
  - **slippage_estimation:** Slippage ≈ (1/2) × daily volatility × order size / ADV
  - **aum_capacity:** Larger AUM = larger orders = higher market impact; alpha decays with scale
  - **turnover:** High turnover increases market impact and commissions; net of costs IR often lower
- **well_constructed_portfolio:**
  - **criteria:** Consistent with mandate; diversified; efficient use of risk budget; cost-aware; liquid
  - **wrong_bets:** Unintended factor tilts waste risk budget on unrewarded risk
  - **conviction_sizing:** Larger positions for highest-conviction ideas; smaller for low-conviction
- **long_only:**
  - **merits:** No short-selling costs; simpler; suitable for most institutional mandates
  - **constraint:** Can only profit from long ideas; cannot isolate alpha by shorting overvalued stocks
  - **max_active_weight:** Limited to index weight; small-cap index stocks get small maximum short
- **long_short:**
  - **structure:** Unencumbered longs and shorts; profit from both rising and falling stocks
  - **gross_exposure:** Sum of long and short exposure; measures total leverage
  - **net_exposure:** Long − short; net market exposure; determines beta
  - **benefits:** Full expression of short alpha; higher active share; alpha portable via shorts
  - **drawbacks:** Short-selling costs (borrow fee, opportunity cost); forced covering in squeezes
- **long_extension:**
  - **structure:** 130/30 or 140/40; invest 100% long + additional 30-40% short; net = 100%
  - **benefit:** More active share than long-only; short ideas generate additional alpha
  - **constraint:** Regulatory limits in many jurisdictions; harder to implement in less liquid markets
- **market_neutral:**
  - **structure:** Equal long and short; near-zero beta; isolates stock-selection alpha
  - **use_case:** Pure alpha; low correlation to equity market; hedge fund structure
  - **risks:** Long-short spread compression; short squeeze; factor exposure unintended
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_construction:** construction_type in [long_only, long_short, long_extension, market_neutral]

## Outcomes

### Construct_active_portfolio (Priority: 1)

_Construct active equity portfolio using specified construction approach_

**Given:**
- `portfolio_id` (input) exists
- `construction_type` (input) in `long_only,long_short,long_extension,market_neutral`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `active_portfolio.constructed`

### Invalid_construction (Priority: 10) — Error: `CONSTRUCTION_INVALID_TYPE`

_Unsupported construction type_

**Given:**
- `construction_type` (input) not_in `long_only,long_short,long_extension,market_neutral`

**Then:**
- **emit_event** event: `active_portfolio.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONSTRUCTION_INVALID_TYPE` | 400 | construction_type must be one of long_only, long_short, long_extension, market_neutral | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `active_portfolio.constructed` |  | `portfolio_id`, `construction_type`, `active_share`, `tracking_error`, `expected_information_ratio` |
| `active_portfolio.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| active-equity-strategies-l3 | required |  |
| equity-portfolio-management-overview-l3 | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Active Equity Portfolio Construction L3 Blueprint",
  "description": "Active equity portfolio construction — building blocks, risk measures, risk budgeting, position sizing, long/short strategies, market-neutral, and implicit cost",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, equity, active-equity, portfolio-construction, risk-budgeting, long-short, market-neutral, tracking-error, cfa-level-3"
}
</script>
