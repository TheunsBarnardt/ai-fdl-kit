---
title: "Active Equity Strategies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls. 2 f"
---

# Active Equity Strategies L3 Blueprint

> Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls

| | |
|---|---|
| **Feature** | `active-equity-strategies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, equity, active-equity, value-investing, momentum, factor-investing, activist-investing, quantitative-equity, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/active-equity-strategies-l3.blueprint.yaml) |
| **JSON API** | [active-equity-strategies-l3.json]({{ site.baseurl }}/api/blueprints/trading/active-equity-strategies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `research_analyst` | Research Analyst | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `strategy_type` | select | Yes | bottom_up \| top_down \| factor \| activist \| stat_arb \| event_driven |  |

## Rules

- **information_used:**
  - **fundamental:** Financial statements, competitive analysis, management quality, valuation models
  - **quantitative:** Statistical relationships, price data, alternative data; large data sets
  - **forecast_vs_pattern:** Fundamental = forecast earnings/cash flows; quant = pattern recognition in data
  - **judgment_vs_optimization:** Fundamental = PM judgment; quant = portfolio optimizer
- **bottom_up_strategies:**
  - **value_investing:** Buy stocks trading below intrinsic value; low P/E, P/B, P/FCF; mean-reversion
  - **garp:** Growth at Reasonable Price; PEG ratio; blend value and growth
  - **deep_value:** Distressed or out-of-favor stocks; high margin of safety; high patience required
  - **relative_value:** Compare similar stocks; buy undervalued vs peers; short overvalued
  - **income_focus:** High dividend yield; payout sustainability; dividend growth
- **top_down_strategies:**
  - **country_geographic:** Overweight countries with superior macro outlook, valuation, or momentum
  - **sector_rotation:** Overweight sectors expected to outperform based on business cycle phase
  - **volatility_based:** Low-volatility strategies; target stable return with reduced drawdown
  - **thematic:** Long-term structural themes (AI, clean energy, aging population); high conviction
- **factor_strategies:**
  - **value_factor:** Low price ratios (P/E, P/B, EV/EBITDA); contrarian; works over long horizons
  - **momentum_factor:** Recent outperformers continue; 12-1 month returns; strong empirical evidence
  - **growth_factor:** High revenue/earnings growth; expensive but justified by superior fundamentals
  - **quality_factor:** High ROE, low debt, stable earnings; defensive; outperforms in bear markets
  - **unconventional:** Alternative data (satellite, credit card, NLP); alpha decay faster
- **activist_strategies:**
  - **popularity:** Activist hedge funds manage significant assets; increasing influence on governance
  - **tactics:** Board seats, proxy contests, open letters, merger blocking, capital structure change
  - **targets:** Underperforming vs peers; excessive cash; conglomerate discount; poor governance
  - **holding_period:** Typically 2-5 years; requires patience and resources
- **stat_arb_microstructure:**
  - **pairs_trading:** Long undervalued, short overvalued within pair; mean-reversion
  - **market_making:** Provide liquidity; earn bid-ask spread; requires speed and technology
  - **high_frequency:** Exploit micro-structural inefficiencies; requires co-location and low latency
- **event_driven:**
  - **merger_arb:** Long target, short acquirer in cash/stock deals; earn spread net of deal break risk
  - **spin_offs:** Newly independent companies often mispriced; forced selling by index funds
  - **earnings_events:** Trade around earnings announcements; exploit post-earnings drift
- **fundamental_process:**
  - **idea_generation:** Screens, research, analyst input, market observation
  - **analysis:** Valuation model, competitive analysis, management assessment
  - **portfolio_construction:** Position sizing based on conviction and risk budget
  - **monitoring:** Track thesis; exit when thesis plays out or is invalidated
  - **pitfalls:** Value trap, overconfidence, anchoring, failure to update on new information
- **quantitative_process:**
  - **signal_generation:** Identify predictive factors; test on historical data
  - **backtesting:** Validate signal; beware overfitting and data mining bias
  - **portfolio_construction:** Optimize factor exposure; control turnover and transaction costs
  - **pitfalls:** Overfitting, factor crowding, regime change, lookahead bias
- **style_classification:**
  - **return_based:** Regress returns on factor indexes; infer style from factor loadings
  - **holdings_based:** Analyze actual portfolio holdings; more accurate but delayed
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_type:** strategy_type in [bottom_up, top_down, factor, activist, stat_arb, event_driven]

## Outcomes

### Implement_active_strategy (Priority: 1)

_Implement active equity strategy using specified approach_

**Given:**
- `strategy_id` (input) exists
- `strategy_type` (input) in `bottom_up,top_down,factor,activist,stat_arb,event_driven`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `active_equity.strategy.implemented`

### Invalid_strategy (Priority: 10) — Error: `ACTIVE_EQUITY_INVALID_STRATEGY`

_Unsupported active equity strategy type_

**Given:**
- `strategy_type` (input) not_in `bottom_up,top_down,factor,activist,stat_arb,event_driven`

**Then:**
- **emit_event** event: `active_equity.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACTIVE_EQUITY_INVALID_STRATEGY` | 400 | strategy_type must be one of the supported active equity strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `active_equity.strategy.implemented` |  | `strategy_id`, `strategy_type`, `expected_alpha`, `active_risk`, `information_ratio` |
| `active_equity.strategy.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-portfolio-management-overview-l3 | required |  |
| active-equity-portfolio-construction-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Active Equity Strategies L3

Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls

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
| `equity_portfolio_management_overview_l3` | equity-portfolio-management-overview-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| implement_active_strategy | `autonomous` | - | - |
| invalid_strategy | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Active Equity Strategies L3 Blueprint",
  "description": "Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls. 2 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, equity, active-equity, value-investing, momentum, factor-investing, activist-investing, quantitative-equity, cfa-level-3"
}
</script>
