---
title: "Investment Manager Selection L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational d"
---

# Investment Manager Selection L3 Blueprint

> Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational due diligence, and fee evaluation

| | |
|---|---|
| **Feature** | `investment-manager-selection-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, manager-selection, due-diligence, investment-philosophy, operational-due-diligence, management-fees, type-i-type-ii-error, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/investment-manager-selection-l3.blueprint.yaml) |
| **JSON API** | [investment-manager-selection-l3.json]({{ site.baseurl }}/api/blueprints/trading/investment-manager-selection-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `investment_committee` | Investment Committee | human |  |
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `search_id` | text | Yes | Manager search identifier |  |
| `evaluation_stage` | select | Yes | universe_definition \| quantitative_screen \| qualitative_review \| operational_dd \| fee_negotiation |  |

## Rules

- **search_framework:**
  - **step1_universe:** Define manager universe by strategy, style, size, track record length
  - **step2_quant_screen:** Apply quantitative filters: return, IR, Sharpe, capture ratios, AUM
  - **step3_qualitative:** Deep dive: philosophy, process, personnel, performance attribution
  - **step4_operational:** Legal, compliance, risk management, technology, custody, reporting
  - **step5_terms:** Fee structure, liquidity terms, transparency, regulatory status
- **type_errors:**
  - **type_i:** Hire a manager who doesn't add value; false positive; too permissive in screening
  - **type_ii:** Reject a manager who does add value; false negative; too restrictive in screening
  - **implications:** Type I costs: fees + underperformance; Type II costs: missed alpha
  - **qualitative_factors:** Process consistency, personnel stability reduce Type I risk
  - **quant_factors:** Longer track record, higher IR reduce both error rates
- **quantitative_evaluation:**
  - **style_analysis:** Return-based (regression) or holdings-based; validate manager's claimed style
  - **capture_ratios:** Up/down capture; want >1 up-capture and <1 down-capture
  - **drawdown_analysis:** Max drawdown, duration, recovery; assess tail risk tolerance
  - **ir_significance:** Is outperformance statistically significant? t-stat ≥ 2 preferred
  - **attribution:** Does alpha come from claimed source? Stock selection or beta exposure?
- **manager_philosophy:**
  - **investment_philosophy:** Documented basis for expected edge; why market is mispriced here
  - **consistency:** Does portfolio reflect stated philosophy? Consistent over time?
  - **differentiation:** Is the edge unique and durable? Not easily replicated or crowded?
  - **capacity:** Can strategy scale with AUM? Liquidity and market impact limits
- **investment_process:**
  - **idea_generation:** Sources of investment ideas; proprietary research vs consensus
  - **signal_capture:** Translation of ideas to trades; discipline in execution
  - **portfolio_construction:** Sizing, concentration, risk control; reflects conviction and risk appetite
  - **monitoring:** Ongoing review of positions; exit criteria; stop-loss rules
- **investment_personnel:**
  - **key_man_risk:** Is performance dependent on one or few individuals?
  - **stability:** Team tenure, turnover, alignment (ownership/compensation)
  - **succession:** Is there a credible succession plan for key personnel?
  - **culture:** Intellectual rigor; debate culture; research-driven vs top-down
- **operational_due_diligence:**
  - **firm:** Legal structure; regulatory status; compliance; AML/KYC; litigation history
  - **vehicle:** Fund structure (LP, UCITS, 40-Act); administrator; auditor; prime broker
  - **risk_management:** Independent risk function; risk limits; VaR; liquidity management
  - **technology:** Portfolio management system; order management; disaster recovery
  - **reporting:** Frequency, format, transparency; reconciliation with custodian
- **fee_evaluation:**
  - **aum_fees:** Management fee as % of AUM; 0.5-2% typical; negotiate lower at scale
  - **performance_fees:** Typically 20% above hurdle; high-water mark essential to prevent double-charging
  - **hurdle_rate:** Hurdle = risk-free or index; ensures fee only on true alpha
  - **high_water_mark:** Prevents performance fee on recouped losses; protects investor
  - **total_cost:** All-in cost including management + performance + trading + admin; net of fees IRR
- **validation:**
  - **search_required:** search_id present
  - **valid_stage:** evaluation_stage in [universe_definition, quantitative_screen, qualitative_review, operational_dd, fee_negotiation]

## Outcomes

### Evaluate_investment_manager (Priority: 1)

_Evaluate investment manager at specified stage of selection process_

**Given:**
- `search_id` (input) exists
- `evaluation_stage` (input) in `universe_definition,quantitative_screen,qualitative_review,operational_dd,fee_negotiation`

**Then:**
- **call_service** target: `investment_committee`
- **emit_event** event: `manager.evaluated`

### Invalid_stage (Priority: 10) — Error: `MANAGER_INVALID_STAGE`

_Unsupported evaluation stage_

**Given:**
- `evaluation_stage` (input) not_in `universe_definition,quantitative_screen,qualitative_review,operational_dd,fee_negotiation`

**Then:**
- **emit_event** event: `manager.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MANAGER_INVALID_STAGE` | 400 | evaluation_stage must be one of the supported manager evaluation stages | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `manager.evaluated` |  | `search_id`, `evaluation_stage`, `manager_id`, `score`, `recommendation` |
| `manager.rejected` |  | `search_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-performance-evaluation-l3 | required |  |

## AGI Readiness

### Goals

#### Reliable Investment Manager Selection L3

Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational due diligence, and fee evaluation

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
| `portfolio_performance_evaluation_l3` | portfolio-performance-evaluation-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| evaluate_investment_manager | `autonomous` | - | - |
| invalid_stage | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Investment Manager Selection L3 Blueprint",
  "description": "Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational d",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, manager-selection, due-diligence, investment-philosophy, operational-due-diligence, management-fees, type-i-type-ii-error, cfa-level-3"
}
</script>
