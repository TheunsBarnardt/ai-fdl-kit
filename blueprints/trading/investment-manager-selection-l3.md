<!-- AUTO-GENERATED FROM investment-manager-selection-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Investment Manager Selection L3

> Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational due diligence, and fee evaluation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · manager-selection · due-diligence · investment-philosophy · operational-due-diligence · management-fees · type-i-type-ii-error · cfa-level-3

## What this does

Investment manager selection — search framework, style analysis, qualitative and quantitative due diligence, Type I/II errors, manager philosophy, operational due diligence, and fee evaluation

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **search_id** *(text, required)* — Manager search identifier
- **evaluation_stage** *(select, required)* — universe_definition | quantitative_screen | qualitative_review | operational_dd | fee_negotiation

## What must be true

- **search_framework → step1_universe:** Define manager universe by strategy, style, size, track record length
- **search_framework → step2_quant_screen:** Apply quantitative filters: return, IR, Sharpe, capture ratios, AUM
- **search_framework → step3_qualitative:** Deep dive: philosophy, process, personnel, performance attribution
- **search_framework → step4_operational:** Legal, compliance, risk management, technology, custody, reporting
- **search_framework → step5_terms:** Fee structure, liquidity terms, transparency, regulatory status
- **type_errors → type_i:** Hire a manager who doesn't add value; false positive; too permissive in screening
- **type_errors → type_ii:** Reject a manager who does add value; false negative; too restrictive in screening
- **type_errors → implications:** Type I costs: fees + underperformance; Type II costs: missed alpha
- **type_errors → qualitative_factors:** Process consistency, personnel stability reduce Type I risk
- **type_errors → quant_factors:** Longer track record, higher IR reduce both error rates
- **quantitative_evaluation → style_analysis:** Return-based (regression) or holdings-based; validate manager's claimed style
- **quantitative_evaluation → capture_ratios:** Up/down capture; want >1 up-capture and <1 down-capture
- **quantitative_evaluation → drawdown_analysis:** Max drawdown, duration, recovery; assess tail risk tolerance
- **quantitative_evaluation → ir_significance:** Is outperformance statistically significant? t-stat ≥ 2 preferred
- **quantitative_evaluation → attribution:** Does alpha come from claimed source? Stock selection or beta exposure?
- **manager_philosophy → investment_philosophy:** Documented basis for expected edge; why market is mispriced here
- **manager_philosophy → consistency:** Does portfolio reflect stated philosophy? Consistent over time?
- **manager_philosophy → differentiation:** Is the edge unique and durable? Not easily replicated or crowded?
- **manager_philosophy → capacity:** Can strategy scale with AUM? Liquidity and market impact limits
- **investment_process → idea_generation:** Sources of investment ideas; proprietary research vs consensus
- **investment_process → signal_capture:** Translation of ideas to trades; discipline in execution
- **investment_process → portfolio_construction:** Sizing, concentration, risk control; reflects conviction and risk appetite
- **investment_process → monitoring:** Ongoing review of positions; exit criteria; stop-loss rules
- **investment_personnel → key_man_risk:** Is performance dependent on one or few individuals?
- **investment_personnel → stability:** Team tenure, turnover, alignment (ownership/compensation)
- **investment_personnel → succession:** Is there a credible succession plan for key personnel?
- **investment_personnel → culture:** Intellectual rigor; debate culture; research-driven vs top-down
- **operational_due_diligence → firm:** Legal structure; regulatory status; compliance; AML/KYC; litigation history
- **operational_due_diligence → vehicle:** Fund structure (LP, UCITS, 40-Act); administrator; auditor; prime broker
- **operational_due_diligence → risk_management:** Independent risk function; risk limits; VaR; liquidity management
- **operational_due_diligence → technology:** Portfolio management system; order management; disaster recovery
- **operational_due_diligence → reporting:** Frequency, format, transparency; reconciliation with custodian
- **fee_evaluation → aum_fees:** Management fee as % of AUM; 0.5-2% typical; negotiate lower at scale
- **fee_evaluation → performance_fees:** Typically 20% above hurdle; high-water mark essential to prevent double-charging
- **fee_evaluation → hurdle_rate:** Hurdle = risk-free or index; ensures fee only on true alpha
- **fee_evaluation → high_water_mark:** Prevents performance fee on recouped losses; protects investor
- **fee_evaluation → total_cost:** All-in cost including management + performance + trading + admin; net of fees IRR
- **validation → search_required:** search_id present
- **validation → valid_stage:** evaluation_stage in [universe_definition, quantitative_screen, qualitative_review, operational_dd, fee_negotiation]

## Success & failure scenarios

**✅ Success paths**

- **Evaluate Investment Manager** — when search_id exists; evaluation_stage in ["universe_definition","quantitative_screen","qualitative_review","operational_dd","fee_negotiation"], then call service; emit manager.evaluated. _Why: Evaluate investment manager at specified stage of selection process._

**❌ Failure paths**

- **Invalid Stage** — when evaluation_stage not_in ["universe_definition","quantitative_screen","qualitative_review","operational_dd","fee_negotiation"], then emit manager.rejected. _Why: Unsupported evaluation stage._ *(error: `MANAGER_INVALID_STAGE`)*

## Errors it can return

- `MANAGER_INVALID_STAGE` — evaluation_stage must be one of the supported manager evaluation stages

## Events

**`manager.evaluated`**
  Payload: `search_id`, `evaluation_stage`, `manager_id`, `score`, `recommendation`

**`manager.rejected`**
  Payload: `search_id`, `reason_code`

## Connects to

- **portfolio-performance-evaluation-l3** *(required)*

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/investment-manager-selection-l3/) · **Spec source:** [`investment-manager-selection-l3.blueprint.yaml`](./investment-manager-selection-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
