---
title: "Income Taxes Deferred Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Reconcile accounting and taxable income, compute deferred tax assets/liabilities from temporary differences, and apply valuation allowances and rate-change adju"
---

# Income Taxes Deferred Blueprint

> Reconcile accounting and taxable income, compute deferred tax assets/liabilities from temporary differences, and apply valuation allowances and rate-change adjustments

| | |
|---|---|
| **Feature** | `income-taxes-deferred` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, income-tax, deferred-tax-asset, deferred-tax-liability, temporary-difference, effective-tax-rate, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/income-taxes-deferred.blueprint.yaml) |
| **JSON API** | [income-taxes-deferred.json]({{ site.baseurl }}/api/blueprints/trading/income-taxes-deferred.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `tax_analyst` | Tax Accounting Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `pretax_income` | number | Yes | Accounting pretax income |  |
| `taxable_income` | number | Yes | Taxable income per tax return |  |
| `statutory_rate` | number | Yes | Statutory tax rate (decimal) |  |

## Rules

- **temporary_differences:**
  - **definition:** Differences between carrying amount and tax base that reverse over time
  - **examples:** Depreciation timing, Warranty reserves, Unrealised gains/losses
- **permanent_differences:**
  - **definition:** Never reverse — do not create DTA/DTL
  - **examples:** Tax-exempt interest, Non-deductible entertainment, Fines and penalties
- **dta_dtl_creation:**
  - **dtl:** Taxable income < accounting income (e.g., accelerated tax depreciation)
  - **dta:** Taxable income > accounting income (e.g., warranty accruals)
- **valuation_allowance:**
  - **condition:** Reduce DTA when recovery is more likely than not (US GAAP) / probable (IFRS) to fail
  - **impact:** Boosts effective tax rate when recorded; reverses boost realizability
- **rate_change_effect:**
  - **formula:** DTA/DTL = temporary difference x enacted future rate
  - **rate_cut:** Cuts DTA and DTL; one-time hit or gain in earnings
- **effective_tax_rate:**
  - **formula:** Tax expense / pretax income
  - **drivers:** Mix of permanent differences, foreign rates, valuation allowances, rate changes
- **disclosure_requirements:**
  - **reconciliation:** Statutory vs effective rate reconciliation
  - **components:** Current and deferred components of tax expense
- **validation:**
  - **entity_required:** entity_id present
  - **valid_rate:** 0 < statutory_rate < 1

## Outcomes

### Compute_deferred_tax (Priority: 1)

_Compute tax expense with deferred adjustments_

**Given:**
- `entity_id` (input) exists
- `statutory_rate` (input) gt `0`
- `statutory_rate` (input) lt `1`

**Then:**
- **call_service** target: `tax_analyst`
- **emit_event** event: `tax.computed`

### Invalid_rate (Priority: 10) — Error: `TAX_INVALID_RATE`

_Rate out of range_

**Given:**
- ANY: `statutory_rate` (input) lte `0` OR `statutory_rate` (input) gte `1`

**Then:**
- **emit_event** event: `tax.rejected`

### Missing_entity (Priority: 11) — Error: `TAX_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `tax.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TAX_INVALID_RATE` | 400 | statutory_rate must be strictly between 0 and 1 | No |
| `TAX_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tax.computed` |  | `computation_id`, `entity_id`, `current_tax`, `deferred_tax`, `effective_rate` |
| `tax.rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-balance-sheet | required |  |
| fsa-income-statement | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Income Taxes Deferred Blueprint",
  "description": "Reconcile accounting and taxable income, compute deferred tax assets/liabilities from temporary differences, and apply valuation allowances and rate-change adju",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, income-tax, deferred-tax-asset, deferred-tax-liability, temporary-difference, effective-tax-rate, cfa-level-1"
}
</script>
