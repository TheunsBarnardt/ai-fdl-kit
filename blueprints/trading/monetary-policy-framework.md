<!-- AUTO-GENERATED FROM monetary-policy-framework.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Monetary Policy Framework

> Execute central bank monetary policy using open market operations, policy rate, reserve requirements, and standing facilities to meet inflation and financial stability objectives

**Category:** Trading · **Version:** 1.0.0 · **Tags:** economics · macroeconomics · monetary-policy · central-bank · policy-rate · open-market-operations · cfa-level-1

## What this does

Execute central bank monetary policy using open market operations, policy rate, reserve requirements, and standing facilities to meet inflation and financial stability objectives

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **jurisdiction** *(text, required)* — Monetary authority jurisdiction
- **tool** *(select, required)* — policy_rate | open_market_ops | reserve_requirement | standing_facility | asset_purchases
- **policy_stance** *(select, optional)* — expansionary | neutral | contractionary
- **action_amount** *(number, optional)* — Change in rate or balance sheet amount

## What must be true

- **objectives → price_stability:** Core mandate — keep inflation near target (commonly 2 percent)
- **objectives → full_employment:** Dual mandate in the US
- **objectives → financial_stability:** Safeguard the banking system and smooth market functioning
- **objectives → exchange_rate_stability:** Where applicable, anchor the currency
- **primary_tools → policy_rate:** Target short-term interbank rate (e.g., federal funds rate)
- **primary_tools → open_market_operations:** Buy/sell securities to adjust bank reserves
- **primary_tools → reserve_requirement:** Fraction of deposits banks must hold at the central bank
- **primary_tools → standing_facilities:** Permanent overnight borrowing/lending windows
- **primary_tools → unconventional:** Large-scale asset purchases (QE), yield-curve control, forward guidance
- **transmission_mechanism → interest_rate_channel:** Policy rate -> bank lending rates -> consumption and investment
- **transmission_mechanism → asset_price_channel:** Rate changes -> bond, equity, and housing valuations
- **transmission_mechanism → exchange_rate_channel:** Rate changes -> capital flows -> FX -> net exports
- **transmission_mechanism → credit_channel:** Balance-sheet strength and bank lending capacity
- **transmission_mechanism → expectations_channel:** Forward guidance anchors future rate path and inflation expectations
- **inflation_targeting → credibility:** Transparent target anchors expectations
- **inflation_targeting → independence:** Insulates policy from short-run political pressure
- **inflation_targeting → accountability:** Clear metric to judge central bank performance
- **central_bank_independence → operational_independence:** Freedom to set policy tools
- **central_bank_independence → target_independence:** Freedom to set target
- **central_bank_independence → transparency:** Publishing minutes, forecasts, decision rationale
- **limitations → zero_lower_bound:** Rates cannot be cut much below zero
- **limitations → long_variable_lags:** 12-24 months for full transmission
- **limitations → supply_shocks:** Monetary policy cannot offset supply-side inflation without recession risk
- **limitations → banking_transmission:** Weak bank balance sheets impair transmission
- **validation → jurisdiction_required:** jurisdiction present
- **validation → valid_tool:** tool in {policy_rate, open_market_ops, reserve_requirement, standing_facility, asset_purchases}

## Success & failure scenarios

**✅ Success paths**

- **Execute Policy Action** — when jurisdiction exists; tool in ["policy_rate","open_market_ops","reserve_requirement","standing_facility","asset_purchases"], then call service; emit monetary.action_executed. _Why: Implement monetary policy action._

**❌ Failure paths**

- **Invalid Tool** — when tool not_in ["policy_rate","open_market_ops","reserve_requirement","standing_facility","asset_purchases"], then emit monetary.action_rejected. _Why: Unsupported monetary tool._ *(error: `MONETARY_INVALID_TOOL`)*
- **Missing Jurisdiction** — when jurisdiction not_exists, then emit monetary.action_rejected. _Why: Jurisdiction missing._ *(error: `MONETARY_JURISDICTION_MISSING`)*

## Errors it can return

- `MONETARY_INVALID_TOOL` — tool must be policy_rate, open_market_ops, reserve_requirement, standing_facility, or asset_purchases
- `MONETARY_JURISDICTION_MISSING` — jurisdiction is required

## Events

**`monetary.action_executed`**
  Payload: `action_id`, `jurisdiction`, `tool`, `change`, `expected_transmission`

**`monetary.action_rejected`**
  Payload: `action_id`, `reason_code`

## Connects to

- **fiscal-policy-framework** *(recommended)*
- **credit-cycles** *(recommended)*
- **business-cycle-phases** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/monetary-policy-framework/) · **Spec source:** [`monetary-policy-framework.blueprint.yaml`](./monetary-policy-framework.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
