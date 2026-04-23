---
title: "Real Estate Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate direct and indirect real estate investment structures, sources of return (income, appreciation), property sectors, and real estate diversification bene"
---

# Real Estate Investments Blueprint

> Evaluate direct and indirect real estate investment structures, sources of return (income, appreciation), property sectors, and real estate diversification benefits

| | |
|---|---|
| **Feature** | `real-estate-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | real-estate, reits, direct-property, commercial-real-estate, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/real-estate-investments.blueprint.yaml) |
| **JSON API** | [real-estate-investments.json]({{ site.baseurl }}/api/blueprints/trading/real-estate-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `re_analyst` | Real Estate Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `re_id` | text | Yes | Real estate analysis identifier |  |
| `structure` | select | Yes | direct \| reit \| private_reit \| rempf \| cmbs |  |
| `sector` | select | Yes | residential \| office \| retail \| industrial \| hospitality \| healthcare \| data_center |  |

## Rules

- **investment_structures:**
  - **direct:** Equity ownership of physical property; requires operational management
  - **reit:** Public listed company owning property; tax pass-through if distribution rules met
  - **private_reit:** Unlisted REIT; illiquid but less volatile NAV
  - **real_estate_mutual_fund:** Pooled vehicle of listed REITs and property companies
  - **cmbs:** Commercial mortgage-backed securities; debt exposure
- **sources_of_return:**
  - **income:** Rental yield less operating expenses
  - **appreciation:** Capital value growth from rental uplift, yield compression
  - **leverage_amplification:** Mortgage debt magnifies equity returns
- **sectors:**
  - **residential:** Apartments, single-family rentals — defensive
  - **office:** Cyclical, tied to employment
  - **retail:** Structurally challenged by e-commerce
  - **industrial:** Logistics tailwind from e-commerce and nearshoring
  - **hospitality:** Most cyclical; daily pricing
  - **healthcare:** Demographics tailwind; regulated
  - **data_center:** Digital infrastructure; long lease, high capex
- **diversification:**
  - **inflation_hedge:** Partial hedge via rent escalators and replacement cost
  - **low_correlation_direct:** Direct RE has lower reported correlation; listed REITs correlate with equities
- **validation:**
  - **re_required:** re_id present
  - **valid_structure:** structure in allowed set
  - **valid_sector:** sector in allowed set

## Outcomes

### Analyse_real_estate (Priority: 1)

_Analyse real estate position_

**Given:**
- `re_id` (input) exists
- `structure` (input) in `direct,reit,private_reit,rempf,cmbs`

**Then:**
- **call_service** target: `re_analyst`
- **emit_event** event: `re.analysed`

### Invalid_structure (Priority: 10) — Error: `RE_INVALID_STRUCTURE`

_Unsupported RE structure_

**Given:**
- `structure` (input) not_in `direct,reit,private_reit,rempf,cmbs`

**Then:**
- **emit_event** event: `re.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RE_INVALID_STRUCTURE` | 400 | structure must be direct, reit, private_reit, rempf, or cmbs | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `re.analysed` |  | `re_id`, `structure`, `sector`, `income_yield`, `total_return` |
| `re.analysis_rejected` |  | `re_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| infrastructure-investments | recommended |  |
| alt-investments-features-categories | required |  |

## AGI Readiness

### Goals

#### Reliable Real Estate Investments

Evaluate direct and indirect real estate investment structures, sources of return (income, appreciation), property sectors, and real estate diversification benefits

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
| `alt_investments_features_categories` | alt-investments-features-categories | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyse_real_estate | `autonomous` | - | - |
| invalid_structure | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Real Estate Investments Blueprint",
  "description": "Evaluate direct and indirect real estate investment structures, sources of return (income, appreciation), property sectors, and real estate diversification bene",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "real-estate, reits, direct-property, commercial-real-estate, cfa-level-1"
}
</script>
