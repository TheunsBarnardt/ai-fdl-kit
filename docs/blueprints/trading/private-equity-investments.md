---
title: "Private Equity Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse private equity categories (buyout, venture, growth), investment characteristics, exit strategies, risk-return profile, and diversification benefits. 3 f"
---

# Private Equity Investments Blueprint

> Analyse private equity categories (buyout, venture, growth), investment characteristics, exit strategies, risk-return profile, and diversification benefits

| | |
|---|---|
| **Feature** | `private-equity-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | private-equity, buyout, venture-capital, growth-equity, lbo, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/private-equity-investments.blueprint.yaml) |
| **JSON API** | [private-equity-investments.json]({{ site.baseurl }}/api/blueprints/trading/private-equity-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pe_analyst` | Private Equity Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pe_id` | text | Yes | Private equity analysis identifier |  |
| `pe_category` | select | Yes | buyout \| venture \| growth \| distressed |  |
| `target_stage` | select | No | seed \| early \| late \| mature |  |

## Rules

- **categories:**
  - **buyout:** Acquire mature company, typically using leverage (LBO); improve operations
  - **venture:** Invest in early-stage companies; seed, early-stage, late-stage sub-segments
  - **growth:** Minority stakes in profitable companies to fund expansion
  - **distressed:** Underperforming or bankrupt assets; turnaround or restructuring
- **investment_characteristics:**
  - **long_horizon:** 5-10 year holding periods
  - **illiquidity:** No public market; exits are control events
  - **value_add:** Operational improvement, strategic repositioning, leverage
- **exit_strategies:**
  - **ipo:** Public offering — highest multiples in favourable markets
  - **strategic_sale:** Sale to corporate buyer; control premium
  - **secondary_sale:** Sale to another PE firm
  - **recapitalisation:** Refinance to return capital; retain stake
- **risk_return:**
  - **dispersion:** Wide manager dispersion; top-quartile vs. median material
  - **risk_sources:** Leverage risk, governance risk, vintage risk
- **diversification:**
  - **benefit:** Low correlation with public equity after unsmoothing, though beta >1 in stress
- **validation:**
  - **pe_required:** pe_id present
  - **valid_category:** pe_category in [buyout, venture, growth, distressed]

## Outcomes

### Analyse_pe (Priority: 1)

_Analyse PE investment by category_

**Given:**
- `pe_id` (input) exists
- `pe_category` (input) in `buyout,venture,growth,distressed`

**Then:**
- **call_service** target: `pe_analyst`
- **emit_event** event: `pe.analysed`

### Invalid_category (Priority: 10) — Error: `PE_INVALID_CATEGORY`

_Unsupported PE category_

**Given:**
- `pe_category` (input) not_in `buyout,venture,growth,distressed`

**Then:**
- **emit_event** event: `pe.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PE_INVALID_CATEGORY` | 400 | pe_category must be buyout, venture, growth, or distressed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pe.analysed` |  | `pe_id`, `pe_category`, `expected_irr`, `hold_period`, `exit_route` |
| `pe.analysis_rejected` |  | `pe_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-features-categories | required |  |
| alt-investments-return-calculations | required |  |
| private-debt-investments | recommended |  |

## AGI Readiness

### Goals

#### Reliable Private Equity Investments

Analyse private equity categories (buyout, venture, growth), investment characteristics, exit strategies, risk-return profile, and diversification benefits

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
| `alt_investments_return_calculations` | alt-investments-return-calculations | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyse_pe | `autonomous` | - | - |
| invalid_category | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Equity Investments Blueprint",
  "description": "Analyse private equity categories (buyout, venture, growth), investment characteristics, exit strategies, risk-return profile, and diversification benefits. 3 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "private-equity, buyout, venture-capital, growth-equity, lbo, cfa-level-1"
}
</script>
