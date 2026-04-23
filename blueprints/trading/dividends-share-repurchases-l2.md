<!-- AUTO-GENERATED FROM dividends-share-repurchases-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dividends Share Repurchases L2

> Analyse dividends and share repurchases — theories, payout policies, repurchase methods, EPS and book-value effects, dividend safety and coverage ratios

**Category:** Trading · **Version:** 1.0.0 · **Tags:** corporate-issuers · dividends · repurchases · payout-policy · dividend-safety · cfa-level-2

## What this does

Analyse dividends and share repurchases — theories, payout policies, repurchase methods, EPS and book-value effects, dividend safety and coverage ratios

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **company_id** *(text, required)* — Company identifier
- **payout_type** *(select, required)* — regular_cash | stock_dividend | stock_split | special | repurchase

## What must be true

- **forms_and_effects → regular_cash:** Reduces retained earnings and cash; no impact on share count
- **forms_and_effects → extra_dividend:** One-off on top of regular; often from non-recurring earnings
- **forms_and_effects → liquidating_dividend:** Return of capital, not earnings
- **forms_and_effects → stock_dividend:** Capitalises retained earnings; share count rises proportionally
- **forms_and_effects → stock_split:** Cosmetic; share count rises, price falls; no economic impact
- **forms_and_effects → reverse_split:** Opposite of split; used to meet exchange minimum price
- **theories → mm_irrelevance:** In perfect markets dividend policy has no effect on value
- **theories → bird_in_hand:** Investors prefer current dividends to uncertain capital gains
- **theories → tax_argument:** Dividends taxed more heavily than capital gains; payout reduces after-tax value
- **theories → signalling:** Managers use dividend actions to convey private information
- **theories → agency_costs:** Dividends reduce free cash flow available for empire-building
- **tax_regimes → double_taxation:** Corporate profits taxed, then dividends taxed at shareholder
- **tax_regimes → dividend_imputation:** Shareholders credit corporate tax against personal liability
- **tax_regimes → split_rate:** Distributed profits taxed at lower rate than retained
- **factors_affecting_policy → investment_opportunities:** High-growth firms retain more
- **factors_affecting_policy → earnings_volatility:** Volatile earnings → conservative payout
- **factors_affecting_policy → flexibility:** Repurchases preserve optionality vs dividend commitment
- **factors_affecting_policy → tax:** Jurisdiction tax treatment influences mix
- **factors_affecting_policy → flotation_costs:** Favour internal financing, lower payout
- **factors_affecting_policy → restrictions:** Debt covenants, legal surplus requirements
- **payout_policies → stable_dividend:** Target dividend slowly adjusted to long-run earnings
- **payout_policies → constant_payout_ratio:** Dividend = ratio × current earnings; volatile payouts
- **payout_policies → residual:** Pay what remains after investment
- **payout_policies → global_trends:** Repurchases rising relative to dividends in mature markets
- **share_repurchase_methods → open_market:** Company buys on exchange over time
- **share_repurchase_methods → fixed_price_tender:** Company offers to buy N shares at set price
- **share_repurchase_methods → dutch_auction_tender:** Shareholders submit prices; lowest price clearing volume wins
- **share_repurchase_methods → direct_negotiation:** Private deal with large holder
- **financial_effects → eps_surplus_cash:** Repurchase reduces shares; EPS rises if earnings yield > after-tax cash yield
- **financial_effects → eps_debt_financed:** EPS change depends on debt cost vs earnings yield
- **financial_effects → book_value:** Repurchase above book decreases BVPS; below book increases
- **financial_effects → valuation_equivalence:** Cash dividends and share repurchases have identical total impact in perfect markets
- **dividend_safety → earnings_coverage:** DPS ÷ EPS; payout ratio
- **dividend_safety → fcf_coverage:** DPS ÷ FCFE; sustainability indicator
- **dividend_safety → warning_signs:** Coverage declining, high leverage, flat revenue
- **validation → company_required:** company_id present
- **validation → valid_payout:** payout_type in allowed set

## Success & failure scenarios

**✅ Success paths**

- **Analyse Payout** — when company_id exists; payout_type in ["regular_cash","stock_dividend","stock_split","special","repurchase"], then call service; emit payout.analysed. _Why: Analyse payout action._

**❌ Failure paths**

- **Invalid Payout** — when payout_type not_in ["regular_cash","stock_dividend","stock_split","special","repurchase"], then emit payout.analysis_rejected. _Why: Unsupported payout type._ *(error: `PAYOUT_INVALID_TYPE`)*

## Errors it can return

- `PAYOUT_INVALID_TYPE` — payout_type must be one of the supported types

## Events

**`payout.analysed`**
  Payload: `company_id`, `payout_type`, `eps_impact`, `coverage_ratio`, `safety_flag`

**`payout.analysis_rejected`**
  Payload: `company_id`, `reason_code`

## Connects to

- **financial-statement-modeling-l2** *(optional)*

## Quality fitness 🟢 86/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/dividends-share-repurchases-l2/) · **Spec source:** [`dividends-share-repurchases-l2.blueprint.yaml`](./dividends-share-repurchases-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
