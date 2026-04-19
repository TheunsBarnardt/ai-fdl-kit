---
title: "Portfolio Performance Evaluation L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Portfolio performance evaluation — return attribution (BHB, Brinson-Fachler), FI attribution, risk attribution, benchmark quality, appraisal measures, capture r"
---

# Portfolio Performance Evaluation L3 Blueprint

> Portfolio performance evaluation — return attribution (BHB, Brinson-Fachler), FI attribution, risk attribution, benchmark quality, appraisal measures, capture ratios, and skill evaluation

| | |
|---|---|
| **Feature** | `portfolio-performance-evaluation-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, performance-attribution, brinson-hood-beebower, information-ratio, sharpe-ratio, benchmark-quality, capture-ratio, drawdown, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-performance-evaluation-l3.blueprint.yaml) |
| **JSON API** | [portfolio-performance-evaluation-l3.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-performance-evaluation-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `performance_analyst` | Performance Analyst | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `evaluation_type` | select | Yes | return_attribution \| risk_attribution \| benchmark_evaluation \| appraisal \| skill_evaluation |  |

## Rules

- **equity_return_attribution:**
  - **bhb_model:** Brinson-Hood-Beebower: decomposes active return into allocation effect + selection effect + interaction
  - **allocation_effect:** (W_p − W_b) × (R_b_sector − R_b_total); value added from over/underweighting sectors
  - **selection_effect:** W_b × (R_p_sector − R_b_sector); value added from security selection within sector
  - **interaction:** (W_p − W_b) × (R_p_sector − R_b_sector); often combined with selection
  - **brinson_fachler:** Allocation effect = (W_p − W_b) × (R_b_sector − R_b_total); cleaner attribution for non-zero benchmark weights
- **fi_return_attribution:**
  - **decomposition:** Income effect + duration/yield curve effect + spread effect + currency effect
  - **income:** Coupon income as fraction of portfolio value
  - **duration_effect:** Duration × rate change attribution
  - **spread_effect:** Spread duration × spread change; sector-specific
  - **currency:** FX return contribution for non-domestic bonds
  - **residual:** Unexplained component; security selection residual
- **risk_attribution:**
  - **factor_attribution:** Decompose active risk into factor-based and residual (security-specific) components
  - **marginal_contribution:** Each position's marginal contribution to total active risk
  - **risk_budget_efficiency:** Compare risk consumed vs expected alpha per unit of risk
- **macro_micro_attribution:**
  - **macro:** Asset allocation decisions: contribution of SAA and TAA vs policy benchmark
  - **micro:** Manager decisions within asset class: contribution of selection vs asset class benchmark
  - **layering:** Multi-level: total fund → asset class → manager → security
- **benchmark_selection:**
  - **asset_based:** Index matching investable universe; rules-based; transparent; measurable
  - **liability_based:** PV of liabilities as benchmark; relevant for LDI mandates
  - **benchmark_quality:** Unambiguous, investable, measurable, appropriate, reflective of manager opportunity set, agreed upon in advance
  - **decomposition_check:** Verify benchmark has similar factor exposures to manager's stated style
- **benchmarking_alternatives:**
  - **hedge_funds:** Absolute return; peer group; factor model; each has limitations
  - **real_estate:** NCREIF; appraisal-based; illiquidity premium benchmark
  - **private_equity:** PME (public market equivalent); IRR vs benchmark; TVPI vs peer quartile
  - **commodities:** Bloomberg Commodity Index; S&P GSCI; differ by sector weights and roll methodology
- **appraisal_measures:**
  - **sharpe_ratio:** Excess return / total volatility; absolute risk measure; penalizes all volatility
  - **information_ratio:** Active return / tracking error; relative risk measure; key for benchmark-relative managers
  - **treynor_ratio:** Excess return / beta; appropriate if portfolio is part of larger well-diversified fund
  - **m_squared:** Return earned if volatility matched benchmark; comparable across managers
  - **appraisal_ratio:** Alpha / specific risk; measures manager's stock selection skill; Jensen's alpha / TE residual
  - **skill_vs_luck:** Skill requires statistical significance; t-stat of IR; need 3+ years; or 36+ months
- **capture_ratios:**
  - **up_capture:** Manager return in up markets / benchmark return in up markets; want > 100%
  - **down_capture:** Manager return in down markets / benchmark return in down markets; want < 100%
  - **capture_ratio_quality:** Asymmetric: high up-capture + low down-capture = excellent; reverse = poor
- **drawdown_analysis:**
  - **max_drawdown:** Peak-to-trough decline; measures worst historical loss experience
  - **drawdown_duration:** Time from peak to recovery of peak; long duration indicates slow recovery
  - **drawdown_frequency:** How often drawdowns occur; indicates tail risk frequency
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_evaluation:** evaluation_type in [return_attribution, risk_attribution, benchmark_evaluation, appraisal, skill_evaluation]

## Outcomes

### Evaluate_performance (Priority: 1)

_Evaluate portfolio performance using specified evaluation type_

**Given:**
- `portfolio_id` (input) exists
- `evaluation_type` (input) in `return_attribution,risk_attribution,benchmark_evaluation,appraisal,skill_evaluation`

**Then:**
- **call_service** target: `performance_analyst`
- **emit_event** event: `performance.evaluated`

### Invalid_evaluation (Priority: 10) — Error: `PERF_INVALID_EVALUATION`

_Unsupported evaluation type_

**Given:**
- `evaluation_type` (input) not_in `return_attribution,risk_attribution,benchmark_evaluation,appraisal,skill_evaluation`

**Then:**
- **emit_event** event: `performance.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PERF_INVALID_EVALUATION` | 400 | evaluation_type must be one of return_attribution, risk_attribution, benchmark_evaluation, appraisal, skill_evaluation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `performance.evaluated` |  | `portfolio_id`, `evaluation_type`, `information_ratio`, `sharpe_ratio`, `up_capture`, `down_capture`, `max_drawdown` |
| `performance.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| investment-manager-selection-l3 | recommended |  |
| trade-strategy-execution-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Performance Evaluation L3 Blueprint",
  "description": "Portfolio performance evaluation — return attribution (BHB, Brinson-Fachler), FI attribution, risk attribution, benchmark quality, appraisal measures, capture r",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, performance-attribution, brinson-hood-beebower, information-ratio, sharpe-ratio, benchmark-quality, capture-ratio, drawdown, cfa-level-3"
}
</script>
