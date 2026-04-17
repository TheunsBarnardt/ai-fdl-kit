---
title: "Leveraged Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the return on a leveraged position — amplifying gains and losses through borrowed capital at a cost. 5 fields. 3 outcomes. 2 error codes. rules: core_fo"
---

# Leveraged Return Blueprint

> Compute the return on a leveraged position — amplifying gains and losses through borrowed capital at a cost

| | |
|---|---|
| **Feature** | `leveraged-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, leverage, margin, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/leveraged-return.blueprint.yaml) |
| **JSON API** | [leveraged-return.json]({{ site.baseurl }}/api/blueprints/trading/leveraged-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |
| `margin_system` | Margin / Prime Brokerage System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_return` | number | Yes | Return on the underlying asset (decimal) |  |
| `equity_capital` | number | Yes | Investor's own equity capital |  |
| `borrowed_capital` | number | Yes | Amount borrowed |  |
| `borrowing_rate` | number | Yes | Interest rate on borrowed capital (decimal, same period as asset_return) |  |
| `leverage_ratio` | number | No | Total assets / equity (derived if not supplied) |  |

## Rules

- **core_formula:**
  - **leveraged_return:** R_L = R_asset + (V_B / V_E) * (R_asset - r_D)
  - **alternative_form:** R_L = (V_E + V_B) / V_E * R_asset - (V_B / V_E) * r_D
  - **leverage_ratio:** L = (V_E + V_B) / V_E = 1 + V_B/V_E
- **amplification:**
  - **gains:** When R_asset > r_D, leverage amplifies gains
  - **losses:** When R_asset < r_D, leverage amplifies losses (including below cost of borrowing)
  - **break_even:** R_L = R_asset only when V_B = 0 (no leverage)
- **margin_mechanics:**
  - **initial_margin:** Regulatory / broker-set minimum equity percentage at trade initiation
  - **maintenance_margin:** Ongoing minimum equity; breach triggers margin call
  - **margin_call:** If equity / total_value < maintenance_margin, investor must deposit funds or liquidate
- **risk_considerations:**
  - **unbounded_loss:** Leveraged long can lose > 100% of equity if asset declines sharply
  - **cost_of_borrow_variable:** If r_D floats (e.g., SOFR + spread), leverage cost changes with rates
- **validation:**
  - **non_negative_capital:** equity_capital > 0, borrowed_capital >= 0
  - **non_negative_borrowing_rate:** borrowing_rate >= 0

## Outcomes

### Compute_leveraged (Priority: 1)

_Calculate leveraged return_

**Given:**
- `equity_capital` (input) gt `0`
- `borrowed_capital` (input) gte `0`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.leveraged_calculated`

### Zero_equity (Priority: 10) — Error: `LEVERAGE_ZERO_EQUITY`

_Equity capital zero or negative_

**Given:**
- `equity_capital` (input) lte `0`

**Then:**
- **emit_event** event: `return.leveraged_rejected`

### Negative_borrowing (Priority: 11) — Error: `LEVERAGE_INVALID_INPUT`

_Negative borrowed capital or borrowing rate_

**Given:**
- ANY: `borrowed_capital` (input) lt `0` OR `borrowing_rate` (input) lt `0`

**Then:**
- **emit_event** event: `return.leveraged_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LEVERAGE_ZERO_EQUITY` | 400 | Equity capital must be strictly positive | No |
| `LEVERAGE_INVALID_INPUT` | 400 | Borrowed capital and borrowing rate must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.leveraged_calculated` |  | `portfolio_id`, `asset_return`, `leverage_ratio`, `leveraged_return`, `borrowing_cost`, `margin_cushion` |
| `return.leveraged_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| gross-net-return | recommended |  |
| money-weighted-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Investor puts up 000 equity, borrows 000 at 4%. Asset returns 10%
  inputs:
    asset_return: 0.1
    equity_capital: 1000
    borrowed_capital: 1000
    borrowing_rate: 0.04
  computation: 0.10 + (1000/1000) * (0.10 - 0.04) = 0.16
  leveraged_return: 0.16
  leverage_ratio: 2
  interpretation: 2x leverage turns a 10% asset return into 16% equity return; a
    -10% asset return would produce -24% equity return
stress_scenarios:
  asset_minus_50pct:
    leveraged_return: -1.04
    interpretation: 50% loss on 2x leverage wipes out equity and creates debt to repay
  break_even_asset_return:
    formula: R_asset_breakeven = r_D * (V_B / (V_E + V_B))
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Leveraged Return Blueprint",
  "description": "Compute the return on a leveraged position — amplifying gains and losses through borrowed capital at a cost. 5 fields. 3 outcomes. 2 error codes. rules: core_fo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, leverage, margin, cfa-level-1"
}
</script>
