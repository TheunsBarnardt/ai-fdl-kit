---
title: "Overview Asset Allocation L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing. 2"
---

# Overview Asset Allocation L3 Blueprint

> Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing

| | |
|---|---|
| **Feature** | `overview-asset-allocation-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, asset-allocation, strategic-asset-allocation, liability-relative, goals-based, rebalancing, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/overview-asset-allocation-l3.blueprint.yaml) |
| **JSON API** | [overview-asset-allocation-l3.json]({{ site.baseurl }}/api/blueprints/trading/overview-asset-allocation-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `investment_committee` | Investment Committee | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `allocation_id` | text | Yes | Allocation identifier |  |
| `approach` | select | Yes | asset_only \| liability_relative \| goals_based |  |

## Rules

- **governance:**
  - **definition:** Governance = framework for rights, responsibilities, and accountability in portfolio management
  - **ips:** Investment Policy Statement documents objectives, constraints, and asset allocation policy
  - **governance_audit:** Periodic review of governance structure for effectiveness and alignment with objectives
  - **rights_responsibilities:** Allocate decision rights to those with expertise and accountability
- **economic_balance_sheet:**
  - **assets:** Financial assets + human capital (PV of future labor income) + PV of pension promises
  - **liabilities:** Financial liabilities + PV of consumption goals + PV of pension obligations
  - **extended_portfolio:** Asset allocation should reflect all economic assets and liabilities, not just financial
  - **human_capital:** Young investors: large human capital → lower equity allocation in financial portfolio needed
- **asset_class_criteria:**
  - **homogeneous:** Assets within class behave similarly
  - **diversifying:** Low correlation with other asset classes
  - **investable:** Accessible in sufficiently large amounts
  - **exhaustive:** Cover most of investable opportunity set
  - **exclusive:** Minimal overlap between classes
- **saa_approaches:**
  - **asset_only:** Maximize risk-adjusted return without explicit liability reference; mean-variance optimization
  - **liability_relative:** Maximize surplus (assets minus liabilities); match liability duration and cash flows
  - **goals_based:** Allocate to sub-portfolios matched to individual life goals with specific time horizons and probabilities
- **relevant_risk_concepts:**
  - **asset_only_risk:** Volatility of portfolio returns (standard deviation)
  - **liability_relative_risk:** Volatility of surplus or funding ratio
  - **goals_based_risk:** Probability of failing to achieve a specific goal
- **asset_class_risk_modeling:**
  - **normal:** Mean-variance sufficient if returns approximately normal
  - **fat_tails:** Use scenario analysis or simulation when returns are non-normal or crisis regimes matter
  - **illiquid:** Adjust VCV for smoothing bias; use factor models
- **implementation:**
  - **passive_active_weights:** Decide whether to deviate from SAA weights (tactical) and by how much
  - **passive_active_classes:** Decide whether to implement each class via passive or active management
  - **risk_budgeting:** Allocate active risk budget across asset classes; balance information ratio vs tracking error
- **rebalancing:**
  - **strategic:** Maintain SAA weights; restore after market drift
  - **corridor_width:** Wider corridors for low-vol, low-corr, high-tax-cost assets; narrower for high-vol, high-momentum
  - **calendar_vs_trigger:** Calendar = periodic rebalance; trigger = rebalance when weights breach corridor
  - **transaction_costs:** Wider corridors justified when trading costs are high relative to diversification benefit lost
- **validation:**
  - **allocation_required:** allocation_id present
  - **valid_approach:** approach in [asset_only, liability_relative, goals_based]

## Outcomes

### Develop_saa (Priority: 1)

_Develop strategic asset allocation using specified approach_

**Given:**
- `allocation_id` (input) exists
- `approach` (input) in `asset_only,liability_relative,goals_based`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `saa.developed`

### Invalid_approach (Priority: 10) — Error: `SAA_INVALID_APPROACH`

_Unsupported allocation approach_

**Given:**
- `approach` (input) not_in `asset_only,liability_relative,goals_based`

**Then:**
- **emit_event** event: `saa.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SAA_INVALID_APPROACH` | 400 | approach must be one of asset_only, liability_relative, goals_based | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `saa.developed` |  | `allocation_id`, `approach`, `asset_class_weights`, `expected_return`, `expected_risk` |
| `saa.rejected` |  | `allocation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-market-expectations-macro-l3 | required |  |
| capital-market-expectations-asset-class-l3 | required |  |
| principles-asset-allocation-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Overview Asset Allocation L3

Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing

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
| `capital_market_expectations_macro_l3` | capital-market-expectations-macro-l3 | fail |
| `capital_market_expectations_asset_class_l3` | capital-market-expectations-asset-class-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| develop_saa | `autonomous` | - | - |
| invalid_approach | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Overview Asset Allocation L3 Blueprint",
  "description": "Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, asset-allocation, strategic-asset-allocation, liability-relative, goals-based, rebalancing, cfa-level-3"
}
</script>
