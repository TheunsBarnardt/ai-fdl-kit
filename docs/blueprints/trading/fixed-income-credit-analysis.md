---
title: "Fixed Income Credit Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Assess issuer credit quality using the four Cs (capacity, collateral, covenants, character), credit ratios, and rating agency frameworks for investment-grade an"
---

# Fixed Income Credit Analysis Blueprint

> Assess issuer credit quality using the four Cs (capacity, collateral, covenants, character), credit ratios, and rating agency frameworks for investment-grade and high-yield corporates

| | |
|---|---|
| **Feature** | `fixed-income-credit-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, credit-analysis, ratings, four-cs, covenants, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-credit-analysis.blueprint.yaml) |
| **JSON API** | [fixed-income-credit-analysis.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-credit-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `credit_analyst` | Corporate Credit Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `issuer_id` | text | Yes | Issuer identifier |  |
| `rating_scale` | select | No | moody \| s_and_p \| fitch |  |
| `rating_band` | select | No | investment_grade \| crossover \| high_yield \| distressed |  |
| `industry_code` | text | No | Industry classification code |  |

## Rules

- **four_cs:**
  - **capacity:** Ability to service debt from operating cash flow
  - **collateral:** Assets available to secure obligations
  - **covenants:** Contractual protections for bondholders
  - **character:** Track record and governance of management
- **core_credit_ratios:**
  - **leverage:**
    - **debt_to_ebitda:** Total debt / EBITDA
    - **ffo_to_debt:** Funds from operations / debt
    - **debt_to_capital:** Debt / (debt + equity)
  - **coverage:**
    - **ebit_interest:** EBIT / interest expense
    - **ebitda_interest:** EBITDA / interest expense
    - **fcf_debt:** Free cash flow / debt
- **rating_bands:**
  - **investment_grade:** BBB-/Baa3 or higher
  - **speculative:** BB+/Ba1 or lower — high yield
  - **default:** C and below; in default or near default
- **industry_factors:**
  - **cyclicality:** Cyclical industries warrant lower ratings for same ratios
  - **regulatory:** Utilities benefit from stable cash flows
  - **technology_change:** Fast-moving industries see frequent rating drift
- **structural_factors:**
  - **parent_subsidiary:** Structural subordination at holdcos
  - **cross_default:** Default in one issue triggers others
  - **guarantees:** Explicit vs implicit parent support
- **high_yield_specifics:**
  - **leverage_focus:** Coverage and liquidity trump absolute size
  - **covenant_light:** Weaker protections common post-2010
  - **recovery_analysis:** Estimate recovery given default
- **validation:**
  - **issuer_required:** issuer_id present

## Outcomes

### Analyze_credit (Priority: 1)

_Produce a credit profile with ratios and qualitative commentary_

**Given:**
- `issuer_id` (input) exists

**Then:**
- **call_service** target: `credit_analyst`
- **emit_event** event: `credit.analyzed`

### Missing_issuer (Priority: 10) — Error: `CREDIT_ISSUER_MISSING`

_Issuer missing_

**Given:**
- `issuer_id` (input) not_exists

**Then:**
- **emit_event** event: `credit.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_ISSUER_MISSING` | 400 | issuer_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit.analyzed` |  | `analysis_id`, `issuer_id`, `leverage_ratio`, `coverage_ratio`, `rating_band` |
| `credit.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-credit-risk-spreads | required |  |
| fixed-income-bond-features | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Credit Analysis

Assess issuer credit quality using the four Cs (capacity, collateral, covenants, character), credit ratios, and rating agency frameworks for investment-grade and high-yield corporates

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
| `fixed_income_credit_risk_spreads` | fixed-income-credit-risk-spreads | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyze_credit | `autonomous` | - | - |
| missing_issuer | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Credit Analysis Blueprint",
  "description": "Assess issuer credit quality using the four Cs (capacity, collateral, covenants, character), credit ratios, and rating agency frameworks for investment-grade an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, credit-analysis, ratings, four-cs, covenants, cfa-level-1"
}
</script>
