---
title: "Fsa Balance Sheet Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse balance sheets — intangibles, goodwill, financial instruments, non-current liabilities, deferred taxes — using ratios and common-size analysis to assess"
---

# Fsa Balance Sheet Blueprint

> Analyse balance sheets — intangibles, goodwill, financial instruments, non-current liabilities, deferred taxes — using ratios and common-size analysis to assess structure

| | |
|---|---|
| **Feature** | `fsa-balance-sheet` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, balance-sheet, goodwill, intangibles, deferred-tax, liquidity-ratio, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-balance-sheet.blueprint.yaml) |
| **JSON API** | [fsa-balance-sheet.json]({{ site.baseurl }}/api/blueprints/trading/fsa-balance-sheet.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `bs_analyst` | Balance Sheet Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `period` | text | Yes | Reporting period |  |
| `current_assets` | number | Yes | Current assets |  |
| `current_liabilities` | number | Yes | Current liabilities |  |
| `total_assets` | number | Yes | Total assets |  |
| `total_equity` | number | Yes | Total equity |  |

## Rules

- **intangibles:**
  - **identifiable:** Patents, trademarks, software — amortised or tested for impairment
  - **unidentifiable:** Goodwill — tested annually for impairment, not amortised under IFRS or US GAAP
  - **internally_generated:** Mostly expensed; development costs capitalised under IFRS if criteria met
- **financial_instruments:**
  - **amortised_cost:** Hold-to-maturity debt; measured at amortised cost
  - **fvtpl:** Fair value through P&L — trading
  - **fvoci:** Fair value through OCI — equity investments, available-for-sale debt
- **non_current_liabilities:**
  - **long_term_debt:** Bonds, loans; carried at amortised cost
  - **deferred_tax_liabilities:** Temporary differences between book and tax base
- **key_ratios:**
  - **current_ratio:** Current assets / current liabilities
  - **quick_ratio:** (CA - inventory) / CL
  - **debt_to_equity:** Total debt / total equity
  - **financial_leverage:** Total assets / total equity
- **common_size:**
  - **technique:** Each line as percent of total assets (assets) or total equity+liabilities (credit side)
  - **use:** Reveals structural shifts and peer differences
- **validation:**
  - **entity_required:** entity_id present
  - **balance_sheet_identity:** total_assets must be positive
  - **equity_present:** total_equity must be specified

## Outcomes

### Analyze_balance_sheet (Priority: 1)

_Compute structural and liquidity ratios_

**Given:**
- `entity_id` (input) exists
- `total_assets` (input) gt `0`

**Then:**
- **call_service** target: `bs_analyst`
- **emit_event** event: `bs.analyzed`

### Invalid_total_assets (Priority: 10) — Error: `BS_INVALID_ASSETS`

_Total assets non-positive_

**Given:**
- `total_assets` (input) lte `0`

**Then:**
- **emit_event** event: `bs.analysis_rejected`

### Missing_entity (Priority: 11) — Error: `BS_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `bs.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BS_INVALID_ASSETS` | 400 | total_assets must be positive | No |
| `BS_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bs.analyzed` |  | `analysis_id`, `entity_id`, `period`, `current_ratio`, `quick_ratio`, `leverage`, `intangibles_pct` |
| `bs.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-framework | required |  |
| fsa-income-statement | recommended |  |
| fsa-cash-flow | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fsa Balance Sheet

Analyse balance sheets — intangibles, goodwill, financial instruments, non-current liabilities, deferred taxes — using ratios and common-size analysis to assess structure

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fsa_framework` | fsa-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyze_balance_sheet | `autonomous` | - | - |
| invalid_total_assets | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Balance Sheet Blueprint",
  "description": "Analyse balance sheets — intangibles, goodwill, financial instruments, non-current liabilities, deferred taxes — using ratios and common-size analysis to assess",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, balance-sheet, goodwill, intangibles, deferred-tax, liquidity-ratio, cfa-level-1"
}
</script>
