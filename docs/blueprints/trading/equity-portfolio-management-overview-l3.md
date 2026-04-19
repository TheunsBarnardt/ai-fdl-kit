---
title: "Equity Portfolio Management Overview L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Equity portfolio management overview — roles of equities, universe segmentation, income, costs, shareholder engagement, and active vs passive spectrum. 2 fields"
---

# Equity Portfolio Management Overview L3 Blueprint

> Equity portfolio management overview — roles of equities, universe segmentation, income, costs, shareholder engagement, and active vs passive spectrum

| | |
|---|---|
| **Feature** | `equity-portfolio-management-overview-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, equity, equity-portfolio, shareholder-engagement, passive-active-spectrum, equity-universe, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-portfolio-management-overview-l3.blueprint.yaml) |
| **JSON API** | [equity-portfolio-management-overview-l3.json]({{ site.baseurl }}/api/blueprints/trading/equity-portfolio-management-overview-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `investment_committee` | Investment Committee | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `mandate_id` | text | Yes | Equity mandate identifier |  |
| `approach` | select | Yes | passive \| factor \| active_systematic \| active_fundamental |  |

## Rules

- **roles_of_equities:**
  - **capital_appreciation:** Primary return source; real growth in earnings and expansion of multiples
  - **dividend_income:** Income component; especially relevant for income-oriented mandates
  - **inflation_hedge:** Equities historically hedge inflation over long horizons via earnings growth
  - **diversification:** Low correlation with bonds in normal regimes; higher in risk-off events
- **universe_segmentation:**
  - **size_style:** Large/mid/small cap; value/growth/blend; defines investable universe and benchmark
  - **geography:** Domestic/developed international/emerging markets; drives currency and country risk
  - **sector_industry:** GICS sectors; energy, financials, technology etc; macro risk factors
  - **indexes:** Market-cap weighted (S&P 500); equal-weighted; factor-weighted; float-adjusted
- **income_from_equity:**
  - **dividend_income:** Dividend yield; tax treatment differs between ordinary and qualified dividends
  - **securities_lending:** Lend shares to short sellers; earn lending fee; counterparty and recall risk
  - **ancillary_strategies:** Options writing (covered calls); can supplement income
- **costs_of_equity_management:**
  - **performance_fees:** Incentive fees (typically 20% of outperformance); increases with active risk
  - **admin_fees:** Fund administration, custody, reporting; relatively fixed
  - **marketing_distribution:** 12b-1 fees in mutual funds; distribution costs reduce investor return
  - **trading_costs:** Bid-ask spread, market impact, commissions; higher for less-liquid stocks
  - **tax_drag:** Capital gains distributions; tax-efficient vehicles (ETFs) minimize this
- **shareholder_engagement:**
  - **benefits:** Governance improvement; value creation through board accountability
  - **disadvantages:** Cost of engagement; potential reputational risk; may conflict with trading activity
  - **manager_role:** Proxy voting; direct engagement; collaborative engagement with other shareholders
  - **esg_integration:** Material ESG factors incorporated into valuation; engagement to improve ESG
- **passive_active_spectrum:**
  - **pure_passive:** Full replication of index; zero active risk; lowest cost
  - **factor_investing:** Systematic factor tilts (value, quality, momentum, low-vol); smart beta
  - **active_systematic:** Quantitative models; rules-based but non-index; moderate active risk
  - **active_fundamental:** Discretionary stock picking; highest active risk and potential alpha
  - **deciding_factors:** Manager skill (IR), cost differential, client preference, tax efficiency, benchmark
- **validation:**
  - **mandate_required:** mandate_id present
  - **valid_approach:** approach in [passive, factor, active_systematic, active_fundamental]

## Outcomes

### Establish_equity_mandate (Priority: 1)

_Establish equity portfolio management mandate and approach_

**Given:**
- `mandate_id` (input) exists
- `approach` (input) in `passive,factor,active_systematic,active_fundamental`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `equity.mandate.established`

### Invalid_approach (Priority: 10) — Error: `EQUITY_INVALID_APPROACH`

_Unsupported equity management approach_

**Given:**
- `approach` (input) not_in `passive,factor,active_systematic,active_fundamental`

**Then:**
- **emit_event** event: `equity.mandate.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EQUITY_INVALID_APPROACH` | 400 | approach must be one of passive, factor, active_systematic, active_fundamental | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `equity.mandate.established` |  | `mandate_id`, `approach`, `benchmark`, `expected_tracking_error`, `fee_structure` |
| `equity.mandate.rejected` |  | `mandate_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| passive-equity-investing-l3 | recommended |  |
| active-equity-strategies-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Portfolio Management Overview L3 Blueprint",
  "description": "Equity portfolio management overview — roles of equities, universe segmentation, income, costs, shareholder engagement, and active vs passive spectrum. 2 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, equity, equity-portfolio, shareholder-engagement, passive-active-spectrum, equity-universe, cfa-level-3"
}
</script>
