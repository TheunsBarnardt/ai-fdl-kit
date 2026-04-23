<!-- AUTO-GENERATED FROM equity-portfolio-management-overview-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Equity Portfolio Management Overview L3

> Equity portfolio management overview — roles of equities, universe segmentation, income, costs, shareholder engagement, and active vs passive spectrum

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · equity · equity-portfolio · shareholder-engagement · passive-active-spectrum · equity-universe · cfa-level-3

## What this does

Equity portfolio management overview — roles of equities, universe segmentation, income, costs, shareholder engagement, and active vs passive spectrum

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **mandate_id** *(text, required)* — Equity mandate identifier
- **approach** *(select, required)* — passive | factor | active_systematic | active_fundamental

## What must be true

- **roles_of_equities → capital_appreciation:** Primary return source; real growth in earnings and expansion of multiples
- **roles_of_equities → dividend_income:** Income component; especially relevant for income-oriented mandates
- **roles_of_equities → inflation_hedge:** Equities historically hedge inflation over long horizons via earnings growth
- **roles_of_equities → diversification:** Low correlation with bonds in normal regimes; higher in risk-off events
- **universe_segmentation → size_style:** Large/mid/small cap; value/growth/blend; defines investable universe and benchmark
- **universe_segmentation → geography:** Domestic/developed international/emerging markets; drives currency and country risk
- **universe_segmentation → sector_industry:** GICS sectors; energy, financials, technology etc; macro risk factors
- **universe_segmentation → indexes:** Market-cap weighted (S&P 500); equal-weighted; factor-weighted; float-adjusted
- **income_from_equity → dividend_income:** Dividend yield; tax treatment differs between ordinary and qualified dividends
- **income_from_equity → securities_lending:** Lend shares to short sellers; earn lending fee; counterparty and recall risk
- **income_from_equity → ancillary_strategies:** Options writing (covered calls); can supplement income
- **costs_of_equity_management → performance_fees:** Incentive fees (typically 20% of outperformance); increases with active risk
- **costs_of_equity_management → admin_fees:** Fund administration, custody, reporting; relatively fixed
- **costs_of_equity_management → marketing_distribution:** 12b-1 fees in mutual funds; distribution costs reduce investor return
- **costs_of_equity_management → trading_costs:** Bid-ask spread, market impact, commissions; higher for less-liquid stocks
- **costs_of_equity_management → tax_drag:** Capital gains distributions; tax-efficient vehicles (ETFs) minimize this
- **shareholder_engagement → benefits:** Governance improvement; value creation through board accountability
- **shareholder_engagement → disadvantages:** Cost of engagement; potential reputational risk; may conflict with trading activity
- **shareholder_engagement → manager_role:** Proxy voting; direct engagement; collaborative engagement with other shareholders
- **shareholder_engagement → esg_integration:** Material ESG factors incorporated into valuation; engagement to improve ESG
- **passive_active_spectrum → pure_passive:** Full replication of index; zero active risk; lowest cost
- **passive_active_spectrum → factor_investing:** Systematic factor tilts (value, quality, momentum, low-vol); smart beta
- **passive_active_spectrum → active_systematic:** Quantitative models; rules-based but non-index; moderate active risk
- **passive_active_spectrum → active_fundamental:** Discretionary stock picking; highest active risk and potential alpha
- **passive_active_spectrum → deciding_factors:** Manager skill (IR), cost differential, client preference, tax efficiency, benchmark
- **validation → mandate_required:** mandate_id present
- **validation → valid_approach:** approach in [passive, factor, active_systematic, active_fundamental]

## Success & failure scenarios

**✅ Success paths**

- **Establish Equity Mandate** — when mandate_id exists; approach in ["passive","factor","active_systematic","active_fundamental"], then call service; emit equity.mandate.established. _Why: Establish equity portfolio management mandate and approach._

**❌ Failure paths**

- **Invalid Approach** — when approach not_in ["passive","factor","active_systematic","active_fundamental"], then emit equity.mandate.rejected. _Why: Unsupported equity management approach._ *(error: `EQUITY_INVALID_APPROACH`)*

## Errors it can return

- `EQUITY_INVALID_APPROACH` — approach must be one of passive, factor, active_systematic, active_fundamental

## Events

**`equity.mandate.established`**
  Payload: `mandate_id`, `approach`, `benchmark`, `expected_tracking_error`, `fee_structure`

**`equity.mandate.rejected`**
  Payload: `mandate_id`, `reason_code`

## Connects to

- **passive-equity-investing-l3** *(recommended)*
- **active-equity-strategies-l3** *(recommended)*

## Quality fitness 🟢 87/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/equity-portfolio-management-overview-l3/) · **Spec source:** [`equity-portfolio-management-overview-l3.blueprint.yaml`](./equity-portfolio-management-overview-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
