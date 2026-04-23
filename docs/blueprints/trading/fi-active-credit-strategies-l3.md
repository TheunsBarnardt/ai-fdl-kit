---
title: "Fi Active Credit Strategies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and"
---

# Fi Active Credit Strategies L3 Blueprint

> Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and structured credit

| | |
|---|---|
| **Feature** | `fi-active-credit-strategies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, fixed-income, credit-strategies, credit-spread, high-yield, cds, structured-credit, factor-credit, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fi-active-credit-strategies-l3.blueprint.yaml) |
| **JSON API** | [fi-active-credit-strategies-l3.json]({{ site.baseurl }}/api/blueprints/trading/fi-active-credit-strategies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `credit_analyst` | Credit Analyst | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `credit_approach` | select | Yes | bottom_up \| top_down \| factor \| synthetic \| spread_curve \| global \| structured |  |

## Rules

- **credit_spread_measures:**
  - **oas:** Option-Adjusted Spread; spread over risk-free after removing embedded option value
  - **z_spread:** Zero-volatility spread; constant spread over spot curve making PV = price
  - **dts:** Duration Times Spread = modified spread duration × OAS; comparable across instruments
  - **spread_duration:** Sensitivity to 1% change in credit spread; key for credit P&L attribution
- **credit_risk:**
  - **pd_lgd:** Expected credit loss = PD × LGD; both must be estimated forward-looking
  - **downgrade_risk:** Rating migration can cause spread widening well before default
  - **liquidity_risk:** Credit bonds are illiquid; bid-ask wider in stress; forced selling amplifies losses
  - **market_credit_risk:** Spread changes driven by risk appetite, not just fundamental credit quality
- **bottom_up_strategies:**
  - **security_selection:** Identify mispriced bonds relative to fair value given credit fundamentals
  - **credit_analysis:** Cash flow adequacy, leverage, coverage ratios, competitive position, covenant quality
  - **relative_value:** Compare similar bonds across issuers, maturities, capital structure
  - **fallen_angels:** Investment-grade downgraded to HY; often oversold; potential return opportunity
- **top_down_strategies:**
  - **sector_allocation:** Overweight/underweight sectors (financial, energy, consumer) based on cycle view
  - **quality_tilt:** Overweight IG vs HY or vice versa based on spread outlook and default forecast
  - **country_allocation:** Within global credit, overweight countries with improving fundamentals
  - **duration_management:** Adjust credit spread duration relative to benchmark
- **factor_strategies:**
  - **carry:** Buy high-spread bonds; earn excess spread net of expected losses
  - **momentum:** Buy bonds with recent spread tightening; sell widening
  - **value:** Buy bonds that are cheap vs fundamental model; sell expensive
  - **quality:** Buy bonds with improving credit quality; sell deteriorating
  - **size:** Small-issue premium; compensation for illiquidity in smaller bonds
- **liquidity_tail_risk:**
  - **liquidity_risk:** Credit spreads widen when risk appetite drops; liquidity evaporates simultaneously
  - **liquidity_budget:** Maintain buffer of liquid assets; avoid concentrating in illiquid bonds
  - **tail_risk:** Left-tail events (default clusters, credit crises) not captured by normal distributions
  - **stress_testing:** Model portfolio under 2008-style credit crisis; assess drawdown and recovery
- **synthetic_credit:**
  - **cds:** Credit default swap; protection buyer pays premium; seller bears default loss
  - **long_credit_cds:** Sell protection = long credit; earns premium; bears default risk
  - **short_credit_cds:** Buy protection = short credit; hedges or speculates on spread widening
  - **cds_index:** CDX (US), iTraxx (Europe); liquid; used for macro credit hedging and TAA
  - **total_return_swap:** Receive total return on credit index; pay floating; synthetic credit exposure
- **spread_curve_strategies:**
  - **static:** Exploit mis-valuation on spread curve; buy cheap maturities vs rich maturities
  - **dynamic:** Position for expected changes in spread curve shape; steepener/flattener
  - **credit_barbell:** Short-maturity credit + long-duration govts; earn credit premium + duration premium
- **global_credit:**
  - **investment_grade:** DM IG corporate bonds; broad universe; trade currency-hedged
  - **high_yield:** Sub-IG bonds; higher spread; higher default risk; more equity-like
  - **em_credit:** Sovereign and corporate bonds from emerging markets; additional country risk
- **structured_credit:**
  - **abs:** Asset-backed securities; auto loans, student loans, credit cards
  - **cmbs:** Commercial mortgage-backed securities; collateralized by income-producing real estate
  - **clo:** Collateralized loan obligation; pool of leveraged loans; tranched risk
  - **securitization_benefits:** Diversification, risk transfer, improved access to credit markets
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_approach:** credit_approach in [bottom_up, top_down, factor, synthetic, spread_curve, global, structured]

## Outcomes

### Implement_credit_strategy (Priority: 1)

_Implement active credit strategy using specified approach_

**Given:**
- `strategy_id` (input) exists
- `credit_approach` (input) in `bottom_up,top_down,factor,synthetic,spread_curve,global,structured`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `credit.strategy.implemented`

### Invalid_approach (Priority: 10) — Error: `CREDIT_INVALID_APPROACH`

_Unsupported credit approach_

**Given:**
- `credit_approach` (input) not_in `bottom_up,top_down,factor,synthetic,spread_curve,global,structured`

**Then:**
- **emit_event** event: `credit.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_INVALID_APPROACH` | 400 | credit_approach must be one of the supported credit strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit.strategy.implemented` |  | `strategy_id`, `credit_approach`, `spread_duration`, `oas`, `dts`, `expected_excess_return` |
| `credit.strategy.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| yield-curve-strategies-l3 | recommended |  |
| fixed-income-portfolio-management-l3 | required |  |

## AGI Readiness

### Goals

#### Reliable Fi Active Credit Strategies L3

Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and structured credit

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fixed_income_portfolio_management_l3` | fixed-income-portfolio-management-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| implement_credit_strategy | `autonomous` | - | - |
| invalid_approach | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fi Active Credit Strategies L3 Blueprint",
  "description": "Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, fixed-income, credit-strategies, credit-spread, high-yield, cds, structured-credit, factor-credit, cfa-level-3"
}
</script>
