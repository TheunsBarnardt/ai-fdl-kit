<!-- AUTO-GENERATED FROM portfolio-rebalancing-engine.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Portfolio Rebalancing Engine

> Computes drift vs model, proposes trades to restore target weights, minimizes turnover, respects Reg 28, and requires human authorization

**Category:** Trading · **Version:** 1.0.0 · **Tags:** rebalancing · drift · turnover · tax-lot · cgt · reg28 · optimization

## What this does

Computes drift vs model, proposes trades to restore target weights, minimizes turnover, respects Reg 28, and requires human authorization

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **proposal_id** *(text, required)* — Proposal Identifier
- **portfolio_id** *(text, required)* — Portfolio Identifier
- **model_id** *(text, required)* — Target Model
- **drift_snapshot** *(json, required)* — Drift vs Target
- **proposed_trades** *(json, optional)* — Proposed Trades
- **estimated_turnover** *(number, optional)* — Estimated Turnover (ZAR)
- **estimated_cgt** *(number, optional)* — Estimated CGT Impact (ZAR)
- **status** *(select, required)* — Proposal Status

## What must be true

- **drift_calculation:** MUST: Compute drift per asset class and per position; only propose trades where drift exceeds tolerance band
- **drift_calculation → source:** model_portfolio.tolerance_bands
- **turnover_minimization:** MUST: Minimize turnover subject to drift correction, prefer HIFO tax lots to reduce CGT, respect min trade size
- **turnover_minimization → min_trade_size_zar:** 10000
- **turnover_minimization → lot_selection:** hifo
- **reg28_respect:** MUST: Proposed post-trade state must satisfy Regulation 28 limits
- **reg28_respect → validate_post_trade:** true
- **cgt_harvest:** SHOULD: Harvest losses when beneficial; do not trigger wash sales
- **human_authorization:** MUST: No proposal executes without explicit human authorization by portfolio manager
- **human_authorization → mandatory:** true
- **proposal_ttl:** MUST: Proposals expire after 24 hours to avoid stale pricing
- **proposal_ttl → ttl_hours:** 24
- **execution:** MUST: On authorization, send orders to OMS in atomic batch; rollback proposal state on failure

## Success & failure scenarios

**✅ Success paths**

- **Drift Below Threshold** — when every asset class drift is within tolerance band, then No proposal generated. _Why: No asset class exceeds tolerance; no action needed._
- **Rebalance Proposal Generated** — when drift exceeds tolerance on at least one asset class; proposed trades satisfy Reg 28 post-trade, then Proposal awaiting authorization. _Why: Engine produced a valid proposal respecting all constraints._
- **Proposal Authorized** — when authorizer has portfolio_manager role; proposal is not expired, then Ready for execution. _Why: Portfolio manager authorized the proposal._
- **Rebalance Executed Successfully** — when all proposed orders acknowledged by OMS, then Rebalance complete; orders in flight to brokers. _Why: All orders from an authorized proposal were accepted by OMS._

**❌ Failure paths**

- **Computation Failed** — when optimizer did not converge or no feasible solution respects all constraints, then Portfolio manager investigates manually. _Why: Optimizer failed to produce a feasible proposal._ *(error: `REBALANCE_COMPUTATION_FAILED`)*
- **Proposal Rejected** — when authorizer rejected the proposal, then Proposal archived; no trades sent. _Why: Portfolio manager rejected the proposal._ *(error: `REBALANCE_PROPOSAL_REJECTED`)*

## Errors it can return

- `REBALANCE_PROPOSAL_REJECTED` — Rebalance proposal was rejected.
- `REBALANCE_COMPUTATION_FAILED` — Could not produce a feasible rebalance proposal.
- `REBALANCE_PROPOSAL_EXPIRED` — Proposal has expired; regenerate from current prices.

## Events

**`rebalance.proposal_generated`** — Rebalance proposal produced
  Payload: `proposal_id`, `portfolio_id`, `estimated_turnover`

**`rebalance.proposal_authorized`** — Proposal authorized by PM
  Payload: `proposal_id`, `authorizer_id`

**`rebalance.executed`** — Proposal orders sent to OMS
  Payload: `proposal_id`, `portfolio_id`, `order_ids`

**`rebalance.no_action_needed`** — Drift within tolerance
  Payload: `portfolio_id`

**`rebalance.proposal_rejected`** — Proposal rejected
  Payload: `proposal_id`, `reason`

**`rebalance.computation_failed`** — Optimizer failure
  Payload: `portfolio_id`, `reason`

## Connects to

- **model-portfolio** *(required)* — Models supply target weights and tolerance bands
- **regulation-28-compliance** *(required)* — Post-trade state must remain compliant
- **pre-trade-compliance-checks** *(required)* — Individual rebalance orders pass through the pre-trade gate
- **order-management-execution** *(required)* — OMS receives authorized orders

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/portfolio-rebalancing-engine/) · **Spec source:** [`portfolio-rebalancing-engine.blueprint.yaml`](./portfolio-rebalancing-engine.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
