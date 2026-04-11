<!-- AUTO-GENERATED FROM supplier-scorecard.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Supplier Scorecard

> Supplier performance scorecard system with weighted criteria, formula-based scoring, standing thresholds, automatic transaction blocking, and periodic score recalculation.

**Category:** Procurement · **Version:** 1.0.0 · **Tags:** supplier-evaluation · procurement · performance-scoring · vendor-management · transaction-blocking

## What this does

Supplier performance scorecard system with weighted criteria, formula-based scoring, standing thresholds, automatic transaction blocking, and periodic score recalculation.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **supplier** *(text, required)* — Supplier
- **period** *(select, required)* — Evaluation Period
- **supplier_score** *(number, optional)* — Supplier Score
- **status** *(text, optional)* — Current Standing
- **indicator_color** *(select, optional)* — Indicator Color
- **weighting_function** *(text, optional)* — Weighting Function
- **criteria** *(json, required)* — Scoring Criteria
- **standings** *(json, required)* — Standing Thresholds
- **notify_supplier** *(boolean, optional)* — Notify Supplier
- **notify_employee** *(text, optional)* — Notify Employee
- **start_date** *(date, optional)* — Period Start Date
- **end_date** *(date, optional)* — Period End Date
- **variables** *(json, optional)* — Scorecard Variables
- **period_criteria** *(json, optional)* — Period Criteria Scores
- **total_score** *(number, optional)* — Total Period Score

## What must be true

- **standings_must_cover_full_range:** Standing thresholds must cover the full 0-100 score range with no gaps. Every possible score value must map to exactly one standing.
- **standings_no_overlap:** Standing grade ranges must not overlap. Each score maps to exactly one standing. The min_grade of one standing must equal the max_grade of the previous standing.
- **criteria_weights_sum_to_100:** The sum of all criteria weights must equal exactly 100%. Partial or excess weights are rejected at save time.
- **formula_variables_must_exist:** Variables referenced in criteria formulas must exist in the scorecard variable database. Unknown variables cause a formula evaluation error.
- **scoring_is_weighted_average:** The supplier score is calculated as a weighted average across all evaluation periods, optionally weighted by the weighting function to give more importance to recent periods.
- **auto_block_transactions:** When a supplier's standing has prevent_rfqs or prevent_pos enabled, the system automatically blocks creation of new RFQs or purchase orders for that supplier.
- **notifications_on_standing_change:** When a supplier's standing changes (e.g., from Green to Yellow), notifications are sent to the configured employee and optionally to the supplier.
- **scorecards_auto_created:** Period scorecards are automatically created based on the supplier's creation date and the configured evaluation period (weekly, monthly, or yearly).

## Success & failure scenarios

**✅ Success paths**

- **Calculate Score** — when evaluation period has ended for a supplier; scorecard template exists with valid criteria and standings; all formula variables are available for the period, then Period scorecard created with calculated scores, overall supplier score updated.
- **Update Standing** — when supplier score has been recalculated; new score falls in a different standing range than current standing, then Supplier standing updated, relevant parties notified of change.
- **Block Rfq** — when purchase user attempts to create an RFQ for the supplier; supplier's current standing has prevent_rfqs enabled, then RFQ creation blocked for supplier with poor performance standing.
- **Block Purchase Order** — when purchase user attempts to create a purchase order for the supplier; supplier's current standing has prevent_pos enabled, then Purchase order creation blocked for supplier with poor performance standing.
- **Warn On Transaction** — when purchase user creates an RFQ or purchase order for the supplier; supplier's current standing has warn_rfqs or warn_pos enabled, then Warning displayed but transaction is allowed to proceed.
- **Generate Period Scorecard** — when new evaluation period begins based on supplier creation date; scorecard template is configured for this supplier, then New period scorecard created and ready for score calculation at period end.

**❌ Failure paths**

- **Standing Overlap Rejected** — when procurement manager saves scorecard template; two or more standings have overlapping grade ranges, then Save blocked until standing grade ranges are corrected. *(error: `SCORECARD_STANDING_OVERLAP`)*
- **Weights Invalid** — when procurement manager saves scorecard template; criteria weights do not sum to exactly 100%, then Save blocked until criteria weights sum to 100%. *(error: `SCORECARD_WEIGHTS_INVALID`)*
- **Formula Error** — when system evaluates a criteria formula; formula references a variable that does not exist, then Score calculation failed, formula must be corrected. *(error: `SCORECARD_FORMULA_ERROR`)*
- **Coverage Gap Rejected** — when procurement manager saves scorecard template; standing ranges do not cover the full 0-100 score range, then Save blocked until standings cover the entire 0-100 range. *(error: `SCORECARD_COVERAGE_GAP`)*

## Errors it can return

- `SCORECARD_STANDING_OVERLAP` — Standing grade ranges overlap. Each score must map to exactly one standing.
- `SCORECARD_WEIGHTS_INVALID` — Criteria weights must sum to exactly 100%.
- `SCORECARD_FORMULA_ERROR` — Formula contains unknown variables. Check that all referenced variables exist.
- `SCORECARD_COVERAGE_GAP` — Standing ranges do not cover the full 0-100 score range. All scores must have a standing.

## Connects to

- **customer-supplier-management** *(required)* — Supplier master data and hold/block status management
- **purchase-order-lifecycle** *(recommended)* — Purchase order lifecycle affected by scorecard blocking rules

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/procurement/supplier-scorecard/) · **Spec source:** [`supplier-scorecard.blueprint.yaml`](./supplier-scorecard.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
