---
title: "Supplier Scorecard Blueprint"
layout: default
parent: "Procurement"
grand_parent: Blueprint Catalog
description: "Supplier performance scorecard system with weighted criteria, formula-based scoring, standing thresholds, automatic transaction blocking, and periodic score rec"
---

# Supplier Scorecard Blueprint

> Supplier performance scorecard system with weighted criteria, formula-based scoring, standing thresholds, automatic transaction blocking, and periodic score recalculation.


| | |
|---|---|
| **Feature** | `supplier-scorecard` |
| **Category** | Procurement |
| **Version** | 1.0.0 |
| **Tags** | supplier-evaluation, procurement, performance-scoring, vendor-management, transaction-blocking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/procurement/supplier-scorecard.blueprint.yaml) |
| **JSON API** | [supplier-scorecard.json]({{ site.baseurl }}/api/blueprints/procurement/supplier-scorecard.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `procurement_manager` | Procurement Manager | human | Configures scorecard criteria, standings, and reviews supplier performance |
| `purchase_user` | Purchase User | human | Creates RFQs and purchase orders, receives warnings or blocks based on scores |
| `system` | System | system | Calculates scores, evaluates standings, enforces transaction restrictions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `supplier` | text | Yes | Supplier |  |
| `period` | select | Yes | Evaluation Period |  |
| `supplier_score` | number | No | Supplier Score | Validations: min, max |
| `status` | text | No | Current Standing |  |
| `indicator_color` | select | No | Indicator Color |  |
| `weighting_function` | text | No | Weighting Function |  |
| `criteria` | json | Yes | Scoring Criteria |  |
| `standings` | json | Yes | Standing Thresholds |  |
| `notify_supplier` | boolean | No | Notify Supplier |  |
| `notify_employee` | text | No | Notify Employee |  |
| `start_date` | date | No | Period Start Date |  |
| `end_date` | date | No | Period End Date |  |
| `variables` | json | No | Scorecard Variables |  |
| `period_criteria` | json | No | Period Criteria Scores |  |
| `total_score` | number | No | Total Period Score | Validations: min, max |

## Rules

- **standings_must_cover_full_range:**
  - **description:** Standing thresholds must cover the full 0-100 score range with no gaps. Every possible score value must map to exactly one standing.

- **standings_no_overlap:**
  - **description:** Standing grade ranges must not overlap. Each score maps to exactly one standing. The min_grade of one standing must equal the max_grade of the previous standing.

- **criteria_weights_sum_to_100:**
  - **description:** The sum of all criteria weights must equal exactly 100%. Partial or excess weights are rejected at save time.

- **formula_variables_must_exist:**
  - **description:** Variables referenced in criteria formulas must exist in the scorecard variable database. Unknown variables cause a formula evaluation error.

- **scoring_is_weighted_average:**
  - **description:** The supplier score is calculated as a weighted average across all evaluation periods, optionally weighted by the weighting function to give more importance to recent periods.

- **auto_block_transactions:**
  - **description:** When a supplier's standing has prevent_rfqs or prevent_pos enabled, the system automatically blocks creation of new RFQs or purchase orders for that supplier.

- **notifications_on_standing_change:**
  - **description:** When a supplier's standing changes (e.g., from Green to Yellow), notifications are sent to the configured employee and optionally to the supplier.

- **scorecards_auto_created:**
  - **description:** Period scorecards are automatically created based on the supplier's creation date and the configured evaluation period (weekly, monthly, or yearly).


## Outcomes

### Calculate_score (Priority: 1)

**Given:**
- evaluation period has ended for a supplier
- scorecard template exists with valid criteria and standings
- all formula variables are available for the period

**Then:**
- **create_record** — Create period scorecard with calculated criteria scores
- **set_field** target: `total_score` — Weighted sum of all criteria scores for the period
- **set_field** target: `supplier_score` — Weighted average across all periods using weighting function
- **emit_event** event: `scorecard.calculated`

**Result:** Period scorecard created with calculated scores, overall supplier score updated

### Standing_overlap_rejected (Priority: 1) — Error: `SCORECARD_STANDING_OVERLAP`

**Given:**
- procurement manager saves scorecard template
- two or more standings have overlapping grade ranges

**Then:**
- **notify** — Highlight overlapping standing ranges

**Result:** Save blocked until standing grade ranges are corrected

### Weights_invalid (Priority: 1) — Error: `SCORECARD_WEIGHTS_INVALID`

**Given:**
- procurement manager saves scorecard template
- criteria weights do not sum to exactly 100%

**Then:**
- **notify** — Show current weight total and difference from 100%

**Result:** Save blocked until criteria weights sum to 100%

### Formula_error (Priority: 1) — Error: `SCORECARD_FORMULA_ERROR`

**Given:**
- system evaluates a criteria formula
- formula references a variable that does not exist

**Then:**
- **notify** — Show formula with unresolved variable highlighted

**Result:** Score calculation failed, formula must be corrected

### Coverage_gap_rejected (Priority: 1) — Error: `SCORECARD_COVERAGE_GAP`

**Given:**
- procurement manager saves scorecard template
- standing ranges do not cover the full 0-100 score range

**Then:**
- **notify** — Show uncovered score ranges

**Result:** Save blocked until standings cover the entire 0-100 range

### Update_standing (Priority: 2)

**Given:**
- supplier score has been recalculated
- new score falls in a different standing range than current standing

**Then:**
- **set_field** target: `status` — Set to the standing name matching the new score range
- **set_field** target: `indicator_color` — Set to the color of the new standing
- **emit_event** event: `scorecard.standing_changed`
- **notify** when: `notify_supplier == true or notify_employee is not null` — Notify configured employee and optionally the supplier

**Result:** Supplier standing updated, relevant parties notified of change

### Block_rfq (Priority: 3)

**Given:**
- purchase user attempts to create an RFQ for the supplier
- supplier's current standing has prevent_rfqs enabled

**Then:**
- **notify** — Display block message with supplier standing and score
- **emit_event** event: `scorecard.supplier_blocked`

**Result:** RFQ creation blocked for supplier with poor performance standing

### Block_purchase_order (Priority: 4)

**Given:**
- purchase user attempts to create a purchase order for the supplier
- supplier's current standing has prevent_pos enabled

**Then:**
- **notify** — Display block message with supplier standing and score
- **emit_event** event: `scorecard.supplier_blocked`

**Result:** Purchase order creation blocked for supplier with poor performance standing

### Warn_on_transaction (Priority: 5)

**Given:**
- purchase user creates an RFQ or purchase order for the supplier
- supplier's current standing has warn_rfqs or warn_pos enabled

**Then:**
- **notify** — Display warning with supplier score, standing, and recommendation
- **emit_event** event: `scorecard.supplier_warned`

**Result:** Warning displayed but transaction is allowed to proceed

### Generate_period_scorecard (Priority: 6)

**Given:**
- new evaluation period begins based on supplier creation date
- scorecard template is configured for this supplier

**Then:**
- **create_record** — Create new blank period scorecard for the upcoming period
- **set_field** target: `start_date` — Set to period start based on supplier creation anniversary
- **set_field** target: `end_date` — Set to period end based on evaluation frequency

**Result:** New period scorecard created and ready for score calculation at period end

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCORECARD_STANDING_OVERLAP` | 422 | Standing grade ranges overlap. Each score must map to exactly one standing. | No |
| `SCORECARD_WEIGHTS_INVALID` | 422 | Criteria weights must sum to exactly 100%. | No |
| `SCORECARD_FORMULA_ERROR` | 422 | Formula contains unknown variables. Check that all referenced variables exist. | No |
| `SCORECARD_COVERAGE_GAP` | 422 | Standing ranges do not cover the full 0-100 score range. All scores must have a standing. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `scorecard.calculated` | Period scorecard scores have been calculated | `supplier`, `period`, `total_score`, `supplier_score` |
| `scorecard.standing_changed` | Supplier standing has changed based on recalculated score | `supplier`, `old_standing`, `new_standing`, `supplier_score` |
| `scorecard.supplier_blocked` | Transaction blocked due to supplier performance standing | `supplier`, `transaction_type`, `standing` |
| `scorecard.supplier_warned` | Warning issued for transaction with low-scoring supplier | `supplier`, `transaction_type`, `standing`, `supplier_score` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| customer-supplier-management | required | Supplier master data and hold/block status management |
| purchase-order-lifecycle | recommended | Purchase order lifecycle affected by scorecard blocking rules |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source: https://github.com/frappe/erpnext
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Supplier Scorecard Blueprint",
  "description": "Supplier performance scorecard system with weighted criteria, formula-based scoring, standing thresholds, automatic transaction blocking, and periodic score rec",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "supplier-evaluation, procurement, performance-scoring, vendor-management, transaction-blocking"
}
</script>
