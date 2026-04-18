<!-- AUTO-GENERATED FROM intercorporate-investments-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Intercorporate Investments L2

> Account for intercorporate investments — IFRS 9 financial assets, equity method for associates/JVs, acquisition method for business combinations with NCI and goodwill

**Category:** Trading · **Version:** 1.0.0 · **Tags:** fsa · intercorporate-investments · ifrs-9 · equity-method · acquisition-method · cfa-level-2

## What this does

Account for intercorporate investments — IFRS 9 financial assets, equity method for associates/JVs, acquisition method for business combinations with NCI and goodwill

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **investment_id** *(text, required)* — Investment identifier
- **investment_type** *(select, required)* — financial_asset | associate | joint_venture | subsidiary

## What must be true

- **classification_thresholds → financial_asset:** Ownership < 20% — passive investment
- **classification_thresholds → associate:** 20-50% significant influence — equity method
- **classification_thresholds → joint_venture:** Joint control — equity method under IFRS, proportionate historically under GAAP
- **classification_thresholds → subsidiary:** Control (typically >50%) — full consolidation via acquisition method
- **ifrs9_financial_assets → amortised_cost:** Business model = hold to collect cash flows; SPPI pass
- **ifrs9_financial_assets → fvoci_debt:** Hold to collect and sell; OCI for unrealised gains/losses
- **ifrs9_financial_assets → fvoci_equity_election:** Irrevocable at initial recognition; no recycling on disposal
- **ifrs9_financial_assets → fvtpl:** Default; held for trading or failed SPPI test
- **ifrs9_financial_assets → reclassification:** Only on business-model change; rare
- **equity_method → initial_recognition:** Record at cost
- **equity_method → subsequent:** Investor's share of investee profit increases carrying amount; dividends decrease it
- **equity_method → amortisation_of_excess:** Excess cost over book value of identifiable net assets allocated to assets; amortise non-goodwill portion
- **equity_method → fair_value_option:** Available under IFRS; changes in FV go through P&L
- **equity_method → impairment:** Compare recoverable amount to carrying value; loss cannot be reversed under US GAAP
- **equity_method → transactions_with_associate:** Eliminate unrealised profits pro-rata
- **acquisition_method → consideration:** FV of cash, stock, contingent consideration
- **acquisition_method → identifiable_net_assets:** Recognise at acquisition-date FV
- **acquisition_method → goodwill:** Consideration + FV of NCI - FV of identifiable net assets
- **acquisition_method → nci_measurement:** Full goodwill (FV of NCI) vs partial goodwill (proportionate share)
- **acquisition_method → less_than_100:** Elect full or partial goodwill method under IFRS; GAAP requires full
- **acquisition_method → post_acquisition:** Subsidiary fully consolidated line-by-line; intra-group eliminated
- **goodwill_impairment → trigger:** Annual test or when indicators exist
- **goodwill_impairment → ifrs_test:** Compare recoverable amount of CGU to carrying value
- **goodwill_impairment → gaap_test:** Qualitative then quantitative (step 1 reporting unit FV vs carrying)
- **goodwill_impairment → non_reversible:** Goodwill impairment losses never reversed
- **vies_spes → consolidation_trigger:** Primary beneficiary absorbs majority of expected losses/residual returns
- **vies_spes → securitisation:** Transfer of receivables to SPE — derecognition depends on risk-reward transfer
- **contingent_items → contingent_consideration:** Recognise at FV at acquisition; subsequent changes to P&L
- **contingent_items → in_process_rd:** Recognise as indefinite-life intangible until project completion or abandonment
- **validation → investment_required:** investment_id present
- **validation → valid_type:** investment_type in [financial_asset, associate, joint_venture, subsidiary]

## Success & failure scenarios

**✅ Success paths**

- **Classify Investment** — when investment_id exists; investment_type in ["financial_asset","associate","joint_venture","subsidiary"], then call service; emit intercorp.classified. _Why: Classify and account for intercorporate investment._

**❌ Failure paths**

- **Invalid Type** — when investment_type not_in ["financial_asset","associate","joint_venture","subsidiary"], then emit intercorp.classification_rejected. _Why: Unsupported investment type._ *(error: `INTERCORP_INVALID_TYPE`)*

## Errors it can return

- `INTERCORP_INVALID_TYPE` — investment_type must be financial_asset, associate, joint_venture, or subsidiary

## Events

**`intercorp.classified`**
  Payload: `investment_id`, `investment_type`, `accounting_method`, `carrying_amount`

**`intercorp.classification_rejected`**
  Payload: `investment_id`, `reason_code`

## Connects to

- **multiple-regression-basics-l2** *(optional)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/intercorporate-investments-l2/) · **Spec source:** [`intercorporate-investments-l2.blueprint.yaml`](./intercorporate-investments-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
