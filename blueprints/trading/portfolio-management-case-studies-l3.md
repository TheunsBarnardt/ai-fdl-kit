<!-- AUTO-GENERATED FROM portfolio-management-case-studies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Portfolio Management Case Studies L3

> Applied portfolio management case studies — institutional liquidity management, ESG integration, lifecycle private wealth risk, and institutional enterprise risk management

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · case-study · liquidity-management · esg-integration · enterprise-risk-management · lifecycle-investing · institutional-risk · cfa-level-3

## What this does

Applied portfolio management case studies — institutional liquidity management, ESG integration, lifecycle private wealth risk, and institutional enterprise risk management

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **case_id** *(text, required)* — Case study identifier
- **case_type** *(select, required)* — institutional_pm | private_wealth_risk | institutional_risk

## What must be true

- **institutional_pm_case → liquidity_profiling:** Time-to-cash tables: classify assets by days/weeks/months to liquidate at target price
- **institutional_pm_case → rebalancing:** Maintain SAA amid market drift; use new contributions and derivatives before forced trading
- **institutional_pm_case → commitment_pacing:** Smooth private capital commitments over vintages; manage J-curve and capital call risk
- **institutional_pm_case → stress_testing:** Model liquidity under adverse scenario; identify forced selling trigger points
- **institutional_pm_case → derivatives_use:** Equitize cash with futures; hedge FX; manage duration; tactical tilts efficiently
- **institutional_pm_case → illiquidity_premium:** Capture illiquidity premium from PE, real assets, private credit; size to liquidity budget
- **institutional_pm_case → saa_process:** Define CME, risk tolerance, constraints; optimize; review annually
- **institutional_pm_case → taa:** Short-term deviations from SAA based on valuation and cycle signals; modest sizing
- **institutional_pm_case → manager_selection:** RFP process; qualitative and quantitative screen; operational DD; fee negotiation
- **institutional_pm_case → esg_integration:** Identify material ESG factors; integrate into manager selection and monitoring; stewardship
- **private_wealth_risk_case → early_career:** High human capital; young dependents; life insurance priority; build emergency fund
- **private_wealth_risk_case → career_development:** Growing HC and FC; disability insurance; save aggressively; equity-heavy portfolio
- **private_wealth_risk_case → peak_accumulation:** HC declining; maximize retirement savings; long-term care planning; estate documents
- **private_wealth_risk_case → retirement:** HC zero; income replacement; sequence risk management; drawdown plan; annuity consideration
- **private_wealth_risk_case → lifecycle_integration:** Each life stage requires holistic balance sheet review and plan update
- **private_wealth_risk_case → risk_review_triggers:** Major life events: marriage, birth, divorce, death, inheritance, job change
- **institutional_risk_case → financial_risks:** Market, credit, liquidity, counterparty, leverage, model risk; all interrelated
- **institutional_risk_case → long_term_perspective:** Short-term mark-to-market vs long-term risk to mission achievement
- **institutional_risk_case → illiquid_risks:** Valuation uncertainty; manager selection; capital commitment; exit risk
- **institutional_risk_case → liquidity_risk_mgmt:** Cascade of liquid assets; reserves; credit facilities; derivatives hedges
- **institutional_risk_case → enterprise_risk:** Integrate all risk types into unified framework; risk appetite statement
- **institutional_risk_case → environmental_risks:** Climate physical risk (asset stranding); transition risk (regulatory change)
- **institutional_risk_case → social_risks:** Labor practices; community impact; supply chain; material to long-term returns
- **institutional_risk_case → universal_ownership:** Large diversified investors own the whole market; externalities are internalized losses
- **institutional_risk_case → esg_case:** Material ESG factors must be integrated into investment process; stewardship enhances returns
- **validation → case_required:** case_id present
- **validation → valid_case:** case_type in [institutional_pm, private_wealth_risk, institutional_risk]

## Success & failure scenarios

**✅ Success paths**

- **Apply Case Study Framework** — when case_id exists; case_type in ["institutional_pm","private_wealth_risk","institutional_risk"], then call service; emit case_study.framework.applied. _Why: Apply portfolio management framework from specified case study type._

**❌ Failure paths**

- **Invalid Case** — when case_type not_in ["institutional_pm","private_wealth_risk","institutional_risk"], then emit case_study.rejected. _Why: Unsupported case type._ *(error: `CASE_STUDY_INVALID_TYPE`)*

## Errors it can return

- `CASE_STUDY_INVALID_TYPE` — case_type must be one of institutional_pm, private_wealth_risk, institutional_risk

## Events

**`case_study.framework.applied`**
  Payload: `case_id`, `case_type`, `key_recommendations`, `risk_exposures_identified`

**`case_study.rejected`**
  Payload: `case_id`, `reason_code`

## Connects to

- **institutional-portfolio-management-l3** *(required)*
- **private-wealth-management-overview-l3** *(required)*
- **asset-allocation-alternatives-l3** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/portfolio-management-case-studies-l3/) · **Spec source:** [`portfolio-management-case-studies-l3.blueprint.yaml`](./portfolio-management-case-studies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
