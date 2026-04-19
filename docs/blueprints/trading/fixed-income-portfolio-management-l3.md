---
title: "Fixed Income Portfolio Management L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Fixed-income portfolio management overview — roles of FI, mandate types, portfolio measures, liquidity, return decomposition, leverage, and taxation. 2 fields. "
---

# Fixed Income Portfolio Management L3 Blueprint

> Fixed-income portfolio management overview — roles of FI, mandate types, portfolio measures, liquidity, return decomposition, leverage, and taxation

| | |
|---|---|
| **Feature** | `fixed-income-portfolio-management-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, fixed-income, bond-portfolio, duration, spread-risk, leverage, fi-mandates, return-decomposition, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-portfolio-management-l3.blueprint.yaml) |
| **JSON API** | [fixed-income-portfolio-management-l3.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-portfolio-management-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `mandate_type` | select | Yes | liability_based \| total_return \| esg_constrained |  |

## Rules

- **roles_of_fi:**
  - **diversification:** Low or negative correlation with equities during risk-off; flight to quality
  - **regular_cash_flows:** Known coupon and principal payments; suitable for liability matching
  - **inflation_hedging:** TIPS provide direct inflation protection; real yields are observable
  - **capital_preservation:** High-quality short-duration bonds preserve capital in bear markets
- **mandate_types:**
  - **liability_based:** Asset cash flows match liability cash flows; duration matching; immunization
  - **total_return:** Maximize return vs benchmark; pure index or enhanced indexing
  - **esg_constrained:** Exclude issuers failing ESG criteria; may track adjusted benchmark
- **portfolio_measures:**
  - **yield_to_maturity:** Aggregate YTM; fair approximation of expected return if held to maturity
  - **duration:** Interest rate sensitivity; modified duration, effective duration, key rate duration
  - **convexity:** Second-order price sensitivity to rate changes; positive convexity is beneficial
  - **spread_duration:** Sensitivity of price to spread changes; key for credit portfolios
  - **dts:** Duration Times Spread; measure of credit risk contribution; better than spread duration alone
- **correlations_between_sectors:**
  - **govt_ig:** Investment-grade corporates highly correlated with govts; spread is primary differentiator
  - **hy_equities:** High yield correlates more with equities than govts; spread risk dominates rate risk
  - **em_bonds:** Mix of local rate risk and spread risk; correlation with DM varies by stress regime
- **bond_liquidity:**
  - **most_liquid:** On-the-run sovereign bonds; benchmark corp issues; current coupon MBS
  - **least_liquid:** Off-the-run govts; small corp issues; structured products; high yield
  - **liquidity_factors:** Issue size, issuer frequency, time since issuance, credit quality, structure
  - **portfolio_implications:** Illiquid bonds widen bid-ask; harder to rebalance; require liquidity buffer
- **return_decomposition:**
  - **coupon:** Coupon income as % of bond price
  - **rolldown:** Return from bond rolling down yield curve toward maturity (when curve is upward sloping)
  - **rate_change:** Duration × (−Δyield)
  - **spread_change:** Spread duration × (−Δspread)
  - **currency:** FX return for non-domestic bonds
  - **total:** Sum of coupon + rolldown + rate change + spread change + currency
- **leverage:**
  - **using_leverage:** Amplifies returns and risks; suitable when expected return > financing cost
  - **methods:** Repo agreements, futures, total return swaps, structured notes
  - **repo:** Sell bond with agreement to repurchase; short-term financing at repo rate
  - **leverage_risks:** Margin calls in stress; forced selling amplifies losses; counterparty risk
  - **leverage_ratio:** Portfolio / equity; leverage ratio = (borrowed funds + equity) / equity
- **fi_taxation:**
  - **accrued_interest:** Taxable as ordinary income when received
  - **capital_gains:** Tax on price appreciation; short-term vs long-term treatment varies by jurisdiction
  - **discount_bonds:** OID amortization may be ordinary income; varies by jurisdiction
  - **vehicle_selection:** Mutual funds vs ETFs vs separately managed accounts; different tax treatment
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_mandate:** mandate_type in [liability_based, total_return, esg_constrained]

## Outcomes

### Manage_fi_portfolio (Priority: 1)

_Manage fixed-income portfolio within specified mandate type_

**Given:**
- `portfolio_id` (input) exists
- `mandate_type` (input) in `liability_based,total_return,esg_constrained`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `fi_portfolio.managed`

### Invalid_mandate (Priority: 10) — Error: `FI_INVALID_MANDATE`

_Unsupported mandate type_

**Given:**
- `mandate_type` (input) not_in `liability_based,total_return,esg_constrained`

**Then:**
- **emit_event** event: `fi_portfolio.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_INVALID_MANDATE` | 400 | mandate_type must be one of liability_based, total_return, esg_constrained | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fi_portfolio.managed` |  | `portfolio_id`, `mandate_type`, `duration`, `yield_to_maturity`, `spread_duration`, `leverage_ratio` |
| `fi_portfolio.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| liability-driven-index-strategies-l3 | recommended |  |
| capital-market-expectations-asset-class-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Portfolio Management L3 Blueprint",
  "description": "Fixed-income portfolio management overview — roles of FI, mandate types, portfolio measures, liquidity, return decomposition, leverage, and taxation. 2 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, fixed-income, bond-portfolio, duration, spread-risk, leverage, fi-mandates, return-decomposition, cfa-level-3"
}
</script>
