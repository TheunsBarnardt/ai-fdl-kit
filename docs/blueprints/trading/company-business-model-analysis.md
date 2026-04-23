---
title: "Company Business Model Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Characterise a company's business model, revenue drivers, pricing power, and cost structure to assess operating profitability and working-capital intensity. 4 f"
---

# Company Business Model Analysis Blueprint

> Characterise a company's business model, revenue drivers, pricing power, and cost structure to assess operating profitability and working-capital intensity

| | |
|---|---|
| **Feature** | `company-business-model-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, business-model, revenue-analysis, operating-costs, pricing-power, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/company-business-model-analysis.blueprint.yaml) |
| **JSON API** | [company-business-model-analysis.json]({{ site.baseurl }}/api/blueprints/trading/company-business-model-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `company_analyst` | Company Business-Model Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `industry_code` | text | No | GICS or ICB code |  |
| `revenue_model` | select | No | transactional \| subscription \| licensing \| usage \| advertising \| asset_based |  |
| `cost_structure` | select | No | fixed_heavy \| variable_heavy \| mixed |  |

## Rules

- **business_model_elements:**
  - **who:** Target customer segments
  - **what:** Value proposition and product/service
  - **how:** Channels, operations, cost structure
  - **why:** Competitive moat and economics
  - **where_when:** Geography and timing
- **revenue_drivers:**
  - **volume:** Units x price
  - **mix:** Higher-margin share of mix
  - **pricing_power:** Elasticity and willingness to pay
  - **growth_sources:** New customers, wallet share, geographies, products
- **revenue_approaches:**
  - **top_down:** Macro -> industry -> company share
  - **bottom_up:** Unit-level build from stores, products, or customers
  - **hybrid:** Combine both for cross-check
- **cost_classifications:**
  - **fixed:** Rent, salaries, depreciation — don't scale with output
  - **variable:** COGS components — scale with output
  - **natural:** By nature — labour, materials, energy
  - **functional:** By activity — manufacturing, selling, G&A
- **operating_profitability:**
  - **gross_margin:** Pricing power and input cost discipline
  - **operating_margin:** Scale and SG&A efficiency
  - **operating_leverage:** Change in operating income per 1 percent change in revenue
- **working_capital_metrics:**
  - **dso:** Days sales outstanding
  - **dio:** Days inventory on hand
  - **dpo:** Days payables outstanding
  - **ccc:** DSO + DIO - DPO
- **validation:**
  - **entity_required:** entity_id present
  - **valid_revenue_model:** revenue_model in allowed set or null

## Outcomes

### Profile_business_model (Priority: 1)

_Produce a business-model and revenue profile_

**Given:**
- `entity_id` (input) exists

**Then:**
- **call_service** target: `company_analyst`
- **emit_event** event: `business_model.profiled`

### Missing_entity (Priority: 10) — Error: `BM_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `business_model.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BM_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `business_model.profiled` |  | `profile_id`, `entity_id`, `revenue_model`, `operating_leverage` |
| `business_model.rejected` |  | `profile_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| industry-competitive-analysis | required |  |
| company-forecasting-model | recommended |  |

## AGI Readiness

### Goals

#### Reliable Company Business Model Analysis

Characterise a company's business model, revenue drivers, pricing power, and cost structure to assess operating profitability and working-capital intensity

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
| `industry_competitive_analysis` | industry-competitive-analysis | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| profile_business_model | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Company Business Model Analysis Blueprint",
  "description": "Characterise a company's business model, revenue drivers, pricing power, and cost structure to assess operating profitability and working-capital intensity. 4 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, business-model, revenue-analysis, operating-costs, pricing-power, cfa-level-1"
}
</script>
