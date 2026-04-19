<!-- AUTO-GENERATED FROM pre-trade-compliance-checks.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Pre Trade Compliance Checks

> Pre-trade gate running Reg 28, IPS, concentration, restricted-list, suitability, cash, and wash-sale checks before any order is sent

**Category:** Trading · **Version:** 1.0.0 · **Tags:** pre-trade · compliance · reg28 · ips · concentration · wash-sale · suitability

## What this does

Pre-trade gate running Reg 28, IPS, concentration, restricted-list, suitability, cash, and wash-sale checks before any order is sent

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_id** *(text, required)* — Order Identifier
- **fund_id** *(text, required)* — Fund Identifier
- **symbol** *(text, required)* — Instrument Symbol
- **side** *(select, required)* — Side
- **quantity** *(number, required)* — Quantity
- **notional_zar** *(number, required)* — Notional Value (ZAR)
- **available_cash** *(number, required)* — Available Cash (ZAR)
- **check_result** *(select, optional)* — Check Result
- **failed_checks** *(json, optional)* — Failed Check Details

## What must be true

- **reg28_limits:** MUST: Enforce Regulation 28 caps on a look-through basis (equity 75, foreign 45, property 25, PE 15, hedge 10, single issuer 5-25)
- **reg28_limits → equity_max:** 75
- **reg28_limits → foreign_max:** 45
- **reg28_limits → property_max:** 25
- **reg28_limits → pe_max:** 15
- **reg28_limits → hedge_max:** 10
- **reg28_limits → single_issuer_max_lower:** 5
- **reg28_limits → single_issuer_max_upper:** 25
- **ips_constraints:** MUST: Apply IPS-specific constraints (excluded sectors, ESG rules, issuer caps) before any buy
- **ips_constraints → block_on_violation:** true
- **concentration:** MUST: Block orders that push a single issuer or single position above concentration thresholds
- **concentration → single_position_max_pct:** 10
- **restricted_list:** MUST: Block trades in restricted or blacklisted securities regardless of other checks
- **restricted_list → source:** compliance_restricted_list
- **suitability:** MUST: Verify trade aligns with client/fund risk profile and time horizon
- **suitability → block_on_mismatch:** true
- **cash_check:** MUST: Block buy orders without sufficient available cash including expected fees
- **cash_check → include_fees:** true
- **wash_sale:** MUST: Flag sells followed by buys of the same security within 30 days for tax treatment review
- **wash_sale → window_days:** 30
- **audit:** MUST: Every check decision is persisted with inputs, outcome, and rule version
- **audit → retention_years:** 7

## Success & failure scenarios

**✅ Success paths**

- **Checks Passed Successfully** — when reg28 check passed; ips check passed; concentration check passed; restricted list check passed; suitability check passed; cash check passed, then Order cleared for routing. _Why: All mandatory pre-trade checks passed; order may proceed._

**❌ Failure paths**

- **Reg28 Breach** — when resulting exposure exceeds a Reg 28 cap, then Order blocked with Reg 28 detail. _Why: Order would breach a Regulation 28 prudential limit._ *(error: `PRETRADE_REG28_BREACH`)*
- **Restricted Security** — when symbol is on the restricted list, then Order blocked immediately. _Why: Symbol appears on the restricted or blacklisted list._ *(error: `PRETRADE_RESTRICTED_SECURITY`)*
- **Ips Breach** — when order violates an IPS constraint (excluded sector, ESG, issuer cap), then Order blocked. _Why: Order violates a client or fund IPS constraint._ *(error: `PRETRADE_IPS_BREACH`)*
- **Insufficient Cash** — when notional_zar gt "available_cash", then Order blocked; funding required. _Why: Fund lacks available cash including fees._ *(error: `PRETRADE_INSUFFICIENT_CASH`)*
- **Concentration Breach** — when resulting single-position weight exceeds concentration max, then Order blocked. _Why: Order would push single position above concentration threshold._ *(error: `PRETRADE_CONCENTRATION_BREACH`)*

## Errors it can return

- `PRETRADE_REG28_BREACH` — Order would breach a Regulation 28 limit.
- `PRETRADE_IPS_BREACH` — Order violates an investment policy constraint.
- `PRETRADE_INSUFFICIENT_CASH` — Insufficient available cash for this order.
- `PRETRADE_RESTRICTED_SECURITY` — This security is restricted from trading.
- `PRETRADE_CONCENTRATION_BREACH` — Order would exceed concentration limits.

## Events

**`pretrade.checks_passed`** — All checks passed
  Payload: `order_id`, `fund_id`, `symbol`

**`pretrade.reg28_breach`** — Regulation 28 breach
  Payload: `order_id`, `fund_id`, `breached_cap`, `projected_pct`

**`pretrade.ips_breach`** — IPS constraint violated
  Payload: `order_id`, `fund_id`, `constraint`

**`pretrade.insufficient_cash`** — Insufficient cash
  Payload: `order_id`, `notional_zar`, `available_cash`

**`pretrade.restricted_security`** — Restricted symbol attempted
  Payload: `order_id`, `symbol`

**`pretrade.concentration_breach`** — Concentration breach
  Payload: `order_id`, `symbol`, `projected_pct`

## Connects to

- **regulation-28-compliance** *(required)* — Core limits applied by this gate
- **client-risk-profiling-ips** *(required)* — IPS constraints consumed by this gate
- **order-management-execution** *(required)* — OMS must call this gate before routing
- **immutable-audit-log** *(required)* — Every check decision must be audited

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/pre-trade-compliance-checks/) · **Spec source:** [`pre-trade-compliance-checks.blueprint.yaml`](./pre-trade-compliance-checks.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
