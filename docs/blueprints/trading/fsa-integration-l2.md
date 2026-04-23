---
title: "Fsa Integration L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Integrate FSA techniques in a six-phase framework — define purpose, collect data, process, analyse via DuPont, segment and capital structure, conclude with reco"
---

# Fsa Integration L2 Blueprint

> Integrate FSA techniques in a six-phase framework — define purpose, collect data, process, analyse via DuPont, segment and capital structure, conclude with recommendations

| | |
|---|---|
| **Feature** | `fsa-integration-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, integration, dupont, segment-analysis, capital-allocation, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-integration-l2.blueprint.yaml) |
| **JSON API** | [fsa-integration-l2.json]({{ site.baseurl }}/api/blueprints/trading/fsa-integration-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fsa_integrator` | FSA Integration Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Analysis case identifier |  |
| `phase` | select | Yes | purpose \| collect \| process \| analyse \| conclude \| follow_up |  |

## Rules

- **six_phases:**
  - **purpose:** Define question (equity valuation, credit, acquisition, portfolio screening)
  - **collect:** Financial statements, MD&A, industry, macro, peer data
  - **process:** Normalisation, segment breakdown, ratio calculation
  - **analyse:** Interpret ratios, compare to peers, identify drivers and risks
  - **conclude:** Written recommendations with quantitative support
  - **follow_up:** Monitor thesis, react to new information
- **dupont_decomposition:**
  - **three_step:** ROE = Net Profit Margin × Asset Turnover × Leverage
  - **five_step:** ROE = (NI/EBT)(EBT/EBIT)(EBIT/Rev)(Rev/Assets)(Assets/Equity); isolates tax, interest, operating, efficiency, leverage
- **unusual_charges_adjustment:**
  - **purpose:** Remove non-recurring items to reveal sustainable earnings
  - **examples:** Restructuring, impairment, litigation, one-time tax benefits
  - **analyst_approach:** Treat recurring if they recur; analyse underlying cause
- **asset_base_composition:**
  - **working_capital:** Liquidity, operating cycle
  - **fixed_assets:** Capital intensity, depreciation policy
  - **intangibles:** Goodwill vs other; acquisition-driven vs organic
- **capital_structure_analysis:**
  - **leverage_ratios:** Debt/Equity, Debt/EBITDA, Interest Coverage
  - **debt_maturity_profile:** Refinancing risk concentration
  - **off_balance_sheet:** Operating leases (pre-IFRS 16), guarantees, JVs
- **segment_analysis:**
  - **revenue_margin_by_segment:** Identify growth and profitability drivers
  - **capital_allocation:** Return on invested capital per segment; flag value-destroying units
- **accruals_earnings_quality:**
  - **balance_sheet_approach:** (NOA_t − NOA_{t-1}) / NOA_avg
  - **cash_flow_approach:** (NI − CFO − CFI) / NOA_avg
  - **high_accruals:** Predict negative earnings surprise
- **valuation_decomposition:**
  - **price_components:** P/E × Earnings; P/B × Book; EV/EBITDA × EBITDA
  - **attribution:** Revenue growth, margin expansion, multiple re-rating
- **validation:**
  - **case_required:** case_id present
  - **valid_phase:** phase in [purpose, collect, process, analyse, conclude, follow_up]

## Outcomes

### Execute_phase (Priority: 1)

_Execute FSA integration phase_

**Given:**
- `case_id` (input) exists
- `phase` (input) in `purpose,collect,process,analyse,conclude,follow_up`

**Then:**
- **call_service** target: `fsa_integrator`
- **emit_event** event: `fsa.phase_executed`

### Invalid_phase (Priority: 10) — Error: `FSA_INVALID_PHASE`

_Unsupported phase_

**Given:**
- `phase` (input) not_in `purpose,collect,process,analyse,conclude,follow_up`

**Then:**
- **emit_event** event: `fsa.phase_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FSA_INVALID_PHASE` | 400 | phase must be one of the six defined phases | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fsa.phase_executed` |  | `case_id`, `phase`, `outputs`, `next_phase` |
| `fsa.phase_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| financial-report-quality-l2 | required |  |
| multinational-operations-l2 | optional |  |

## AGI Readiness

### Goals

#### Reliable Fsa Integration L2

Integrate FSA techniques in a six-phase framework — define purpose, collect data, process, analyse via DuPont, segment and capital structure, conclude with recommendations

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
| `financial_report_quality_l2` | financial-report-quality-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| execute_phase | `autonomous` | - | - |
| invalid_phase | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Integration L2 Blueprint",
  "description": "Integrate FSA techniques in a six-phase framework — define purpose, collect data, process, analyse via DuPont, segment and capital structure, conclude with reco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, integration, dupont, segment-analysis, capital-allocation, cfa-level-2"
}
</script>
