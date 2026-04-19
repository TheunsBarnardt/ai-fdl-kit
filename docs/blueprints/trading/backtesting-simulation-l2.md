---
title: "Backtesting Simulation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Conduct backtesting and simulation — backtesting process, multifactor model backtesting, survivorship/look-ahead/data-snooping biases, historical and Monte Carl"
---

# Backtesting Simulation L2 Blueprint

> Conduct backtesting and simulation — backtesting process, multifactor model backtesting, survivorship/look-ahead/data-snooping biases, historical and Monte Carlo simulation, sensitivity analysis

| | |
|---|---|
| **Feature** | `backtesting-simulation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, backtesting, simulation, look-ahead-bias, survivorship-bias, monte-carlo, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/backtesting-simulation-l2.blueprint.yaml) |
| **JSON API** | [backtesting-simulation-l2.json]({{ site.baseurl }}/api/blueprints/trading/backtesting-simulation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `backtesting_analyst` | Backtesting Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `method_type` | select | Yes | historical_backtest \| mc_simulation \| sensitivity \| scenario |  |

## Rules

- **backtesting_objectives:**
  - **hypothesis_testing:** Does the strategy earn the expected return?
  - **parameter_estimation:** Calibrate model parameters
  - **risk_assessment:** Drawdown, tail loss, worst periods
- **backtesting_process:**
  - **step1_design:** Define strategy, signals, execution assumptions, universe
  - **step2_simulation:** Apply rules over historical data; generate P&L time series
  - **step3_output_analysis:** Sharpe, drawdown, turnover, factor attribution
- **multifactor_backtesting:**
  - **universe_construction:** Consistent historical universe; point-in-time data
  - **signal_construction:** Factor scores normalised cross-sectionally
  - **portfolio_construction:** Long/short or long-only; rebalancing frequency
  - **transaction_costs:** Estimate and apply; critical for high-turnover strategies
  - **output_metrics:** IC, IR, factor returns, decay analysis
- **common_biases:**
  - **survivorship_bias:** Backtest only on current members; removes failed firms; overstates return
  - **look_ahead_bias:** Use information not available at signal date (e.g. revised earnings)
  - **data_snooping:** Test many signals; select winners; in-sample overfitting
  - **short_history:** Too little data to distinguish skill from luck
  - **transaction_cost_underestimation:** Ignoring spread, market impact, and borrow costs
- **simulation_types:**
  - **historical_simulation:** Bootstrap or rolling window of past returns
  - **monte_carlo:** Simulate factor paths from calibrated model; flexible
  - **sensitivity_analysis:** Vary key inputs (growth, vol, correlations); stress parameters
- **historical_scenario_analysis:**
  - **crisis_periods:** GFC 2008, COVID 2020, DotCom 2000
  - **output:** Maximum drawdown, Sharpe degradation, correlation shift
- **monte_carlo_process:**
  - **calibration:** Estimate return, vol, correlation from history
  - **path_generation:** Simulate future paths consistent with parameters
  - **aggregation:** Distribution of terminal wealth, drawdown, Sharpe
- **output_interpretation:**
  - **is_vs_oos:** In-sample (backtest period) vs out-of-sample (holdout)
  - **t_statistic:** Signal significance; minimum 3 years monthly data
  - **decay:** How quickly IC and returns decline post-publication
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_method:** method_type in [historical_backtest, mc_simulation, sensitivity, scenario]

## Outcomes

### Run_backtest (Priority: 1)

_Run backtesting or simulation_

**Given:**
- `strategy_id` (input) exists
- `method_type` (input) in `historical_backtest,mc_simulation,sensitivity,scenario`

**Then:**
- **call_service** target: `backtesting_analyst`
- **emit_event** event: `backtest.completed`

### Invalid_method (Priority: 10) — Error: `BACKTEST_INVALID_METHOD`

_Unsupported method type_

**Given:**
- `method_type` (input) not_in `historical_backtest,mc_simulation,sensitivity,scenario`

**Then:**
- **emit_event** event: `backtest.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BACKTEST_INVALID_METHOD` | 400 | method_type must be one of the supported methods | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `backtest.completed` |  | `strategy_id`, `method_type`, `sharpe`, `max_drawdown`, `ic`, `ir` |
| `backtest.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multifactor-models-l2 | required |  |
| market-risk-measurement-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Backtesting Simulation L2 Blueprint",
  "description": "Conduct backtesting and simulation — backtesting process, multifactor model backtesting, survivorship/look-ahead/data-snooping biases, historical and Monte Carl",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, backtesting, simulation, look-ahead-bias, survivorship-bias, monte-carlo, cfa-level-2"
}
</script>
