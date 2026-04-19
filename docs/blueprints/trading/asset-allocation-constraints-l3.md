---
title: "Asset Allocation Constraints L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Asset allocation under real-world constraints — asset size, liquidity, time horizon, taxes, regulatory limits, TAA, and behavioral biases. 2 fields. 2 outcomes."
---

# Asset Allocation Constraints L3 Blueprint

> Asset allocation under real-world constraints — asset size, liquidity, time horizon, taxes, regulatory limits, TAA, and behavioral biases

| | |
|---|---|
| **Feature** | `asset-allocation-constraints-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, asset-allocation, tax-aware-investing, tactical-asset-allocation, behavioral-finance, regulatory-constraints, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/asset-allocation-constraints-l3.blueprint.yaml) |
| **JSON API** | [asset-allocation-constraints-l3.json]({{ site.baseurl }}/api/blueprints/trading/asset-allocation-constraints-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `investment_committee` | Investment Committee | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `allocation_id` | text | Yes | Allocation identifier |  |
| `constraint_type` | select | Yes | size \| liquidity \| time_horizon \| regulatory \| tax \| behavioral |  |

## Rules

- **asset_size_constraints:**
  - **small_portfolios:** Cannot access illiquid alternatives; high relative transaction costs; limited diversification
  - **large_portfolios:** Market impact limits position size in small-cap and illiquid markets; must use separate accounts
  - **size_advantage:** Large funds have access to private equity, infrastructure, direct real estate; lower fees via negotiation
  - **illiquid_premium:** Larger portfolios can harvest illiquidity premium unavailable to small investors
- **liquidity_constraints:**
  - **operating_needs:** Maintain liquid reserves for ongoing distributions, expenses, and redemptions
  - **liability_matching:** Liquid assets must cover near-term liabilities; illiquid allocation only from long-horizon surplus
  - **stressed_liquidity:** Stress-test liquidity under market dislocations; private assets may become illiquid simultaneously
- **time_horizon:**
  - **human_capital:** Changing human capital (labor income) over life alters economic balance sheet → glide path
  - **liability_character:** As liabilities approach, reduce risk; immunize rather than grow
  - **long_horizon:** Longer horizon allows more illiquidity, higher equity; shorter horizons need liquidity and stability
- **regulatory_constraints:**
  - **insurance_cos:** Regulatory capital requirements; match duration of assets to liabilities; credit quality limits
  - **pension_funds:** Funding ratio requirements; liability-matching mandates; ALM frameworks
  - **endowments:** Perpetual horizon; spending rules (typically 4-5% per annum); broader alternative access
  - **foundations:** Mandatory distribution rules (5% in US); similar to endowments; mission-related investing
  - **swfs:** Objectives vary by mandate (stabilization vs savings); often long horizon; complex governance
- **tax_aware_investing:**
  - **after_tax_return:** Focus on after-tax expected return and risk; asset location matters
  - **asset_location:** Place tax-inefficient assets (bonds, REITs) in tax-deferred; equities in taxable accounts
  - **rebalancing_taxes:** Use new contributions, distributions, loss harvesting to rebalance before selling
  - **loss_harvesting:** Realize capital losses to offset gains; defer realization of gains
  - **after_tax_optimization:** Optimize on after-tax returns and after-tax risk; complicates MVO inputs
- **saa_revision:**
  - **goals_change:** Revise SAA when investor goals materially change
  - **constraints_change:** Revise SAA when constraints (regulatory, liquidity, time horizon) change
  - **beliefs_change:** Revise SAA when long-run CME views materially shift; avoid excessive turnover
- **tactical_asset_allocation:**
  - **discretionary_taa:** Subjective judgment-based deviations from SAA; depends on manager skill
  - **systematic_taa:** Rules-based signals (value, momentum, carry); disciplined; backtestable
  - **taa_sizing:** Size TAA bets in proportion to conviction and available risk budget vs SAA
  - **evaluation:** Judge TAA by information ratio vs SAA benchmark; not absolute return
- **behavioral_biases:**
  - **loss_aversion:** Investors feel losses more than equal gains → under-allocate to risky assets; hold losers too long
  - **illusion_of_control:** Overconfidence in ability to time market → excessive TAA; higher turnover
  - **mental_accounting:** Segregate money into buckets; consistent with goals-based but may sub-optimize overall
  - **representativeness:** Extrapolate recent performance → chase winners; buy high, sell low
  - **framing:** Presentation of choices affects decision; annual vs multi-year framing changes risk tolerance
  - **availability:** Weight recent vivid events (2008 crisis) too heavily → excessive defensiveness long after
- **validation:**
  - **allocation_required:** allocation_id present
  - **valid_constraint:** constraint_type in [size, liquidity, time_horizon, regulatory, tax, behavioral]

## Outcomes

### Apply_constraint (Priority: 1)

_Apply real-world constraint to asset allocation_

**Given:**
- `allocation_id` (input) exists
- `constraint_type` (input) in `size,liquidity,time_horizon,regulatory,tax,behavioral`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `allocation.constrained`

### Invalid_constraint (Priority: 10) — Error: `CONSTRAINT_INVALID_TYPE`

_Unsupported constraint type_

**Given:**
- `constraint_type` (input) not_in `size,liquidity,time_horizon,regulatory,tax,behavioral`

**Then:**
- **emit_event** event: `allocation.constraint_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONSTRAINT_INVALID_TYPE` | 400 | constraint_type must be one of size, liquidity, time_horizon, regulatory, tax, behavioral | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `allocation.constrained` |  | `allocation_id`, `constraint_type`, `adjusted_weights`, `expected_after_tax_return` |
| `allocation.constraint_rejected` |  | `allocation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| overview-asset-allocation-l3 | required |  |
| principles-asset-allocation-l3 | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Asset Allocation Constraints L3 Blueprint",
  "description": "Asset allocation under real-world constraints — asset size, liquidity, time horizon, taxes, regulatory limits, TAA, and behavioral biases. 2 fields. 2 outcomes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, asset-allocation, tax-aware-investing, tactical-asset-allocation, behavioral-finance, regulatory-constraints, cfa-level-3"
}
</script>
