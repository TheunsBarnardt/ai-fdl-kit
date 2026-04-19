<!-- AUTO-GENERATED FROM performance-attribution.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Performance Attribution

> GIPS-compliant TWR daily returns and Brinson-Fachler attribution decomposing excess return into allocation, selection, and interaction

**Category:** Trading · **Version:** 1.0.0 · **Tags:** performance · attribution · twr · gips · brinson-fachler · benchmark · returns

## What this does

GIPS-compliant TWR daily returns and Brinson-Fachler attribution decomposing excess return into allocation, selection, and interaction

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio Identifier
- **benchmark** *(text, required)* — Benchmark Identifier
- **period_start** *(date, required)* — Period Start
- **period_end** *(date, required)* — Period End
- **twr** *(number, optional)* — Time-Weighted Return
- **benchmark_return** *(number, optional)* — Benchmark Return
- **allocation_effect** *(number, optional)* — Allocation Effect
- **selection_effect** *(number, optional)* — Selection Effect
- **interaction_effect** *(number, optional)* — Interaction Effect
- **cash_flows** *(json, optional)* — External Cash Flows
- **data_gaps** *(json, optional)* — Missing Data Points

## What must be true

- **twr:** MUST: Daily time-weighted returns chain-linked geometrically; adjust for external cash flows on the day they occur (Modified Dietz or true TWR)
- **twr → frequency:** daily
- **twr → method:** true_twr
- **gips:** MUST: Returns compliant with GIPS — no dollar-weighting, composite construction documented, dispersion disclosed
- **gips → composite_required:** true
- **benchmark_declared:** MUST: Benchmark declared in IPS; changes require client notice and effective-date accounting
- **brinson_fachler:** MUST: Attribution uses Brinson-Fachler (sector-relative) decomposition; sum of effects equals excess return
- **cash_flow_timing:** MUST: Large external cash flows (> 10% of portfolio) trigger sub-period split to avoid return distortion
- **cash_flow_timing → threshold_pct:** 10
- **data_quality:** MUST: Pricing and weights validated before attribution runs; missing data produces a flagged gap, not a zero
- **reporting:** MUST: Attribution reports include period, composite, gross and net returns, benchmark, and effects

## Success & failure scenarios

**✅ Success paths**

- **Returns Calculated Successfully** — when all daily pricing points are available; external cash flows have been captured, then TWR persisted. _Why: Daily TWR computed and chain-linked to produce period return._
- **Attribution Computed** — when portfolio returns calculated; benchmark returns available, then Attribution report available. _Why: Brinson-Fachler attribution decomposed into allocation, selection, and interaction._

**❌ Failure paths**

- **Calculation Failed** — when calculation returned NaN or chain-link divergence, then Performance team investigates. _Why: Numerical failure in return or attribution computation._ *(error: `PERFORMANCE_CALCULATION_FAILED`)*
- **Benchmark Mismatch** — when benchmark differs from the IPS benchmark, then Attribution blocked pending reconciliation. _Why: Portfolio benchmark does not match the IPS-declared benchmark._ *(error: `PERFORMANCE_BENCHMARK_MISMATCH`)*
- **Data Gap Detected** — when one or more required data points are missing, then Gap flagged; attribution continues with documented exclusions. _Why: Pricing or weights missing for at least one day in the period._ *(error: `PERFORMANCE_DATA_GAP`)*

## Errors it can return

- `PERFORMANCE_BENCHMARK_MISMATCH` — Portfolio benchmark does not match the declared IPS benchmark.
- `PERFORMANCE_DATA_GAP` — Required pricing or weights data are missing.
- `PERFORMANCE_CALCULATION_FAILED` — Performance calculation could not complete.

## Events

**`performance.returns_calculated`** — Daily returns chain-linked
  Payload: `portfolio_id`, `period_start`, `period_end`, `twr`

**`performance.attribution_computed`** — Brinson-Fachler attribution produced
  Payload: `portfolio_id`, `allocation_effect`, `selection_effect`, `interaction_effect`

**`performance.benchmark_mismatch`** — Benchmark does not match IPS
  Payload: `portfolio_id`, `declared`, `supplied`

**`performance.data_gap_detected`** — Data gap in period
  Payload: `portfolio_id`, `gap_count`

**`performance.calculation_failed`** — Performance computation failed
  Payload: `portfolio_id`, `reason`

## Connects to

- **gips-standards-l3** *(required)* — Attribution methodology must satisfy GIPS standards
- **client-risk-profiling-ips** *(required)* — IPS declares the benchmark used for attribution
- **observability-metrics** *(recommended)* — Calculation latency and gap rate are operational SLIs

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/performance-attribution/) · **Spec source:** [`performance-attribution.blueprint.yaml`](./performance-attribution.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
