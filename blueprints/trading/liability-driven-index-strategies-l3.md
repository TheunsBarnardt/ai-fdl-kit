<!-- AUTO-GENERATED FROM liability-driven-index-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Liability Driven Index Strategies L3

> Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · fixed-income · liability-driven-investing · immunization · cash-flow-matching · bond-indexing · duration-matching · cfa-level-3

## What this does

Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **ldi_type** *(select, required)* — immunization | cash_flow_matching | duration_matching | contingent | laddered | index | enhanced_index

## What must be true

- **ldi_vs_adl → ldi:** Liability-Driven Investing: assets structured to match liabilities; minimize surplus risk
- **ldi_vs_adl → adl:** Asset-Driven Liabilities: rare; liabilities adjust to asset performance (some DB pension schemes)
- **liability_types → type_i:** Fixed amount, fixed timing; easiest to immunize (e.g., GIC, zero-coupon bond)
- **liability_types → type_ii:** Fixed amount, uncertain timing; mortality risk, prepayment risk
- **liability_types → type_iii:** Uncertain amount, fixed timing; inflation-linked liabilities
- **liability_types → type_iv:** Uncertain amount, uncertain timing; most complex; DB pension with inflation + longevity risk
- **immunization → conditions:** PV(assets) = PV(liabilities); duration(assets) = duration(liabilities); convexity(assets) ≥ convexity(liabilities)
- **immunization → convexity:** Positive convexity ensures surplus rises regardless of rate shift direction
- **immunization → rebalancing:** Required as time passes and rates move; duration drift must be corrected
- **immunization → dispersion:** Minimizing asset cash flow dispersion around liability payment reduces structural risk
- **cash_flow_matching → definition:** Match exact timing and amount of liability cash flows with asset cash flows
- **cash_flow_matching → conservative:** No reinvestment risk; surplus risk near zero; but expensive and inflexible
- **cash_flow_matching → duration_match_vs_cf:** CF matching avoids reinvestment risk; duration matching is cheaper but has more risk
- **laddered_portfolio → structure:** Equal investment across maturities in regular intervals; continuous reinvestment
- **laddered_portfolio → benefits:** Diversifies across yield curve; rolling reinvestment reduces reinvestment rate risk; liquid
- **laddered_portfolio → use_case:** Insurance companies; retail investors; balanced duration and liquidity
- **duration_matching → basis:** Match dollar duration (BPV) of assets to BPV of liabilities
- **duration_matching → multi_liability:** Use key rate durations to match liabilities at each key maturity
- **duration_matching → derivatives_overlay:** Use interest rate swaps or futures to close duration gap cheaply
- **duration_matching → contingent:** Hybrid: floor return immunized; if surplus sufficient, switch to active management
- **contingent_immunization → concept:** Actively manage until surplus falls to minimum required; then immunize
- **contingent_immunization → trigger:** Surplus = PV(assets) − PV(liabilities) falls below safety cushion
- **contingent_immunization → advantage:** Captures upside from active management while protecting minimum liability coverage
- **ldi_risks → model_risk:** Liability duration model may misspecify liability sensitivity to rates
- **ldi_risks → spread_risk:** If asset yield includes credit spread but liability discount is risk-free → spread risk
- **ldi_risks → counterparty:** Derivatives overlay introduces counterparty exposure
- **ldi_risks → asset_liquidity:** During stress, bond positions may be illiquid when rebalancing needed
- **bond_indexing → full_replication:** Hold all index securities in proportion; tracks closely; expensive and impractical for large indexes
- **bond_indexing → stratified_sampling:** Divide index into cells; hold representative bonds per cell; reduces cost
- **bond_indexing → enhanced_indexing:** Slight active deviations for alpha within tight tracking error budget
- **bond_indexing → primary_risk_factors:** Duration, key rate duration, spread duration, sector weights, credit quality
- **bond_indexing → benchmark_selection:** Match benchmark to investor mandate; avoid excessive cash drag
- **validation → strategy_required:** strategy_id present
- **validation → valid_ldi_type:** ldi_type in [immunization, cash_flow_matching, duration_matching, contingent, laddered, index, enhanced_index]

## Success & failure scenarios

**✅ Success paths**

- **Implement Ldi Strategy** — when strategy_id exists; ldi_type in ["immunization","cash_flow_matching","duration_matching","contingent","laddered","index","enhanced_index"], then call service; emit ldi.strategy.implemented. _Why: Implement liability-driven or index-based fixed-income strategy._

**❌ Failure paths**

- **Invalid Ldi Type** — when ldi_type not_in ["immunization","cash_flow_matching","duration_matching","contingent","laddered","index","enhanced_index"], then emit ldi.strategy.rejected. _Why: Unsupported LDI strategy type._ *(error: `LDI_INVALID_TYPE`)*

## Errors it can return

- `LDI_INVALID_TYPE` — ldi_type must be one of the supported LDI strategies

## Events

**`ldi.strategy.implemented`**
  Payload: `strategy_id`, `ldi_type`, `asset_duration`, `liability_duration`, `surplus`, `funding_ratio`

**`ldi.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **fixed-income-portfolio-management-l3** *(required)*
- **principles-asset-allocation-l3** *(recommended)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/liability-driven-index-strategies-l3/) · **Spec source:** [`liability-driven-index-strategies-l3.blueprint.yaml`](./liability-driven-index-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
