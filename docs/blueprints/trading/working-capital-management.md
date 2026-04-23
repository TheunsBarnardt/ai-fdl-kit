---
title: "Working Capital Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Measure cash conversion cycle, liquidity sources, drags and pulls on liquidity, and manage working capital components to optimise operational funding. 5 fields."
---

# Working Capital Management Blueprint

> Measure cash conversion cycle, liquidity sources, drags and pulls on liquidity, and manage working capital components to optimise operational funding

| | |
|---|---|
| **Feature** | `working-capital-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, working-capital, liquidity, cash-conversion-cycle, short-term-funding, treasury, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/working-capital-management.blueprint.yaml) |
| **JSON API** | [working-capital-management.json]({{ site.baseurl }}/api/blueprints/trading/working-capital-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `treasury_analyst` | Treasury Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `dso` | number | Yes | Days sales outstanding |  |
| `dio` | number | Yes | Days inventory outstanding |  |
| `dpo` | number | Yes | Days payable outstanding |  |
| `current_ratio` | number | No | Current assets / current liabilities |  |

## Rules

- **cash_conversion_cycle:**
  - **formula:** CCC = DIO + DSO - DPO
  - **interpretation:** Days from cash outlay on inventory to cash collection from customers
  - **objective:** Lower CCC frees cash for deployment
- **liquidity_sources:**
  - **primary:** Cash and near-cash balances, Committed credit lines, Operating cash flow
  - **secondary:** Asset sales, Renegotiating debt terms, Emergency equity issuance
- **drags_and_pulls:**
  - **drags:** Slow receivables, obsolete inventory, tight credit availability
  - **pulls:** Fast payables, early payment discounts refused, capex spikes
- **ratios:**
  - **current_ratio:** CA / CL — overall liquidity cushion
  - **quick_ratio:** (CA - inventory) / CL — liquid assets cover
  - **cash_ratio:** (Cash + MS) / CL — strict cash cover
- **short_term_funding:**
  - **internal:** Stretching payables, accelerating receivables, inventory reduction
  - **external:** Lines of credit, commercial paper, trade credit, factoring
- **validation:**
  - **entity_required:** entity_id present
  - **dso_non_negative:** dso >= 0
  - **dio_non_negative:** dio >= 0
  - **dpo_non_negative:** dpo >= 0

## Outcomes

### Compute_ccc (Priority: 1)

_Compute cash conversion cycle and liquidity metrics_

**Given:**
- `entity_id` (input) exists
- `dso` (input) gte `0`
- `dio` (input) gte `0`
- `dpo` (input) gte `0`

**Then:**
- **call_service** target: `treasury_analyst`
- **emit_event** event: `treasury.ccc_computed`

### Invalid_inputs (Priority: 10) — Error: `CCC_INVALID_INPUT`

_Negative inputs_

**Given:**
- ANY: `dso` (input) lt `0` OR `dio` (input) lt `0` OR `dpo` (input) lt `0`

**Then:**
- **emit_event** event: `treasury.ccc_rejected`

### Missing_entity (Priority: 11) — Error: `CCC_ENTITY_MISSING`

_Entity id missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `treasury.ccc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CCC_INVALID_INPUT` | 400 | DSO, DIO, and DPO must be non-negative | No |
| `CCC_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `treasury.ccc_computed` |  | `computation_id`, `entity_id`, `ccc_days`, `liquidity_grade`, `funding_gap` |
| `treasury.ccc_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-allocation-npv-irr | recommended |  |
| corporate-capital-structure | recommended |  |

## AGI Readiness

### Goals

#### Reliable Working Capital Management

Measure cash conversion cycle, liquidity sources, drags and pulls on liquidity, and manage working capital components to optimise operational funding

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_ccc | `autonomous` | - | - |
| invalid_inputs | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Working Capital Management Blueprint",
  "description": "Measure cash conversion cycle, liquidity sources, drags and pulls on liquidity, and manage working capital components to optimise operational funding. 5 fields.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, working-capital, liquidity, cash-conversion-cycle, short-term-funding, treasury, cfa-level-1"
}
</script>
