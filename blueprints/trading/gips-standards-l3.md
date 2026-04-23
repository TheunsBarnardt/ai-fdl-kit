<!-- AUTO-GENERATED FROM gips-standards-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Gips Standards L3

> Global Investment Performance Standards (GIPS) — firm definition, composites, time-weighted return, valuation, presentation requirements, portability, and verification

**Category:** Trading · **Version:** 1.0.0 · **Tags:** ethics · gips · performance-standards · composite · time-weighted-return · performance-reporting · verification · cfa-level-3

## What this does

Global Investment Performance Standards (GIPS) — firm definition, composites, time-weighted return, valuation, presentation requirements, portability, and verification

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **firm_id** *(text, required)* — Firm identifier
- **gips_area** *(select, required)* — firm_definition | composite_construction | return_calculation | valuation | presentation | portability | verification

## What must be true

- **objective_scope → objective:** Fair, accurate, and comparable investment performance globally
- **objective_scope → scope:** Voluntary; asset managers claiming compliance must apply standards firm-wide
- **objective_scope → compliance:** Claim of compliance must be firm-wide; cannot claim composite-level compliance
- **objective_scope → ethics:** GIPS is an ethical framework; full disclosure and fair presentation are paramount
- **firm_definition → definition:** Distinct business entity held out to clients or prospects as an investment manager
- **firm_definition → subsidiary:** Subsidiaries may claim separately if managed independently with distinct strategies
- **firm_definition → divisions:** Internal management divisions are not separate firms for GIPS purposes
- **firm_definition → discretion:** Only discretionary accounts (where manager makes investment decisions) included
- **composite_construction → definition:** Aggregation of one or more portfolios managed according to similar investment mandate
- **composite_construction → inclusion:** All fee-paying discretionary portfolios must be in at least one composite
- **composite_construction → exclusion:** Non-discretionary or non-fee-paying accounts may be excluded
- **composite_construction → terminated_accounts:** Must include terminated accounts for periods they were active; prevents survivorship bias
- **composite_construction → strategy_definition:** Composites defined by investment mandate, objective, or strategy; fully disclosed
- **time_weighted_return → definition:** Return that eliminates impact of external cash flows; reflects manager's investment decisions
- **time_weighted_return → formula:** Chain-link subperiod returns; revalue portfolio at each external cash flow
- **time_weighted_return → vs_money_weighted:** TWR preferred for comparing managers; MWR (IRR) used for PE and private assets
- **time_weighted_return → annualizing:** Returns > 1 year must be annualized; <1 year must not be annualized
- **time_weighted_return → subperiod:** At minimum, revalue at each large external cash flow; daily preferred
- **return_calculation → cash_equivalents:** Include dividends, interest; accrual basis preferred
- **return_calculation → expenses:** Gross-of-fees and net-of-fees returns both required; investment management fees disclosed
- **return_calculation → trading_costs:** Must be deducted from gross returns; all transaction costs included
- **valuation → frequency:** Monthly minimum; quarterly for some asset classes
- **valuation → fair_value:** Fair value = price at which willing buyer and seller would transact; not cost or distressed
- **valuation → hierarchy:** Observable quoted market prices preferred; model-based last resort; disclose methodology
- **presentation_requirements → minimum_years:** Must present at least 5 years of GIPS performance; build to 10 years
- **presentation_requirements → required_elements:** Composite name, composite creation date, # portfolios, composite/benchmark return, composite dispersion, composite 3-yr annualized ex-ante risk, benchmark name
- **presentation_requirements → dispersion:** Must show internal dispersion of portfolio returns within composite; indicates consistency
- **presentation_requirements → benchmark:** Must show appropriate benchmark for comparison; disclose benchmark description
- **presentation_requirements → inception:** If less than 5 years since inception, show performance since inception
- **portability → definition:** If key decision-makers move to a new firm, track record may be portable
- **portability → conditions:** Same investment process, same decision-making team, substantially same portfolios followed
- **portability → disclosure:** Must disclose that prior firm performance was achieved at a different firm
- **portability → strict:** New firm must meet GIPS requirements for new performance period
- **verification → definition:** Third-party examination of firm-wide GIPS compliance; not audit of specific composites
- **verification → scope:** Test construction and presentation of all composites; verify policies and procedures
- **verification → voluntary:** Not required for GIPS compliance; but strongly recommended for credibility
- **verification → composite_examination:** More specific verification of individual composite construction; optional add-on
- **validation → firm_required:** firm_id present
- **validation → valid_area:** gips_area in [firm_definition, composite_construction, return_calculation, valuation, presentation, portability, verification]

## Success & failure scenarios

**✅ Success paths**

- **Assess Gips Compliance** — when firm_id exists; gips_area in ["firm_definition","composite_construction","return_calculation","valuation","presentation","portability","verification"], then call service; emit gips.assessed. _Why: Assess GIPS compliance for specified area._

**❌ Failure paths**

- **Invalid Area** — when gips_area not_in ["firm_definition","composite_construction","return_calculation","valuation","presentation","portability","verification"], then emit gips.rejected. _Why: Unsupported GIPS area._ *(error: `GIPS_INVALID_AREA`)*

## Errors it can return

- `GIPS_INVALID_AREA` — gips_area must be one of the supported GIPS compliance areas

## Events

**`gips.assessed`**
  Payload: `firm_id`, `gips_area`, `compliant`, `findings`, `remediation_required`

**`gips.rejected`**
  Payload: `firm_id`, `reason_code`

## Connects to

- **gips-compliance-fundamentals** *(extends)* — Builds on L1 foundations — prerequisite before this level's material
- **cfa-ethics-standards-l3** *(required)*
- **portfolio-performance-evaluation-l3** *(recommended)*
- **gips-composites-requirements** *(recommended)* — Composite construction and maintenance are core operational requirements within GIPS standards

## Quality fitness 🟢 90/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/gips-standards-l3/) · **Spec source:** [`gips-standards-l3.blueprint.yaml`](./gips-standards-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
