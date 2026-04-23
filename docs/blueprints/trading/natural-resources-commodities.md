---
title: "Natural Resources Commodities Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Invest in commodities through spot, futures, and equity of producers; decompose commodity futures total return into spot, collateral, and roll yield and address"
---

# Natural Resources Commodities Blueprint

> Invest in commodities through spot, futures, and equity of producers; decompose commodity futures total return into spot, collateral, and roll yield and address contango and backwardation

| | |
|---|---|
| **Feature** | `natural-resources-commodities` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | commodities, futures, contango, backwardation, roll-yield, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/natural-resources-commodities.blueprint.yaml) |
| **JSON API** | [natural-resources-commodities.json]({{ site.baseurl }}/api/blueprints/trading/natural-resources-commodities.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `commodity_analyst` | Commodity Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `commodity_id` | text | Yes | Commodity analysis identifier |  |
| `access_method` | select | Yes | spot \| futures \| producer_equity \| commodity_etn |  |
| `curve_state` | select | No | contango \| backwardation \| flat |  |

## Rules

- **commodity_investment_forms:**
  - **spot:** Physical ownership — storage costs significant
  - **futures:** Most common; rolling monthly contracts
  - **producer_equity:** Stock of miners, oil majors — equity market beta dilutes pure commodity exposure
  - **commodity_etn:** Exchange-traded notes tracking indices
- **futures_total_return:**
  - **components:** Spot return + collateral return + roll yield
  - **roll_yield:** Gain (loss) from rolling contracts in backwardation (contango)
  - **collateral_return:** Treasury yield on fully collateralised futures
- **curve_states:**
  - **contango:** Forward > spot — negative roll yield; common for costly-to-store commodities
  - **backwardation:** Forward < spot — positive roll yield; signals supply shortage or high convenience yield
- **inflation_hedging:**
  - **mechanism:** Commodities correlate with unexpected inflation via raw-material price pass-through
- **diversification_benefit:**
  - **note:** Historically low correlation with equities over long horizons; correlation spikes in crises
- **validation:**
  - **commodity_required:** commodity_id present
  - **valid_access:** access_method in allowed set

## Outcomes

### Analyse_commodity (Priority: 1)

_Analyse commodity investment and decompose return_

**Given:**
- `commodity_id` (input) exists
- `access_method` (input) in `spot,futures,producer_equity,commodity_etn`

**Then:**
- **call_service** target: `commodity_analyst`
- **emit_event** event: `commodity.analysed`

### Invalid_access (Priority: 10) — Error: `COMMODITY_INVALID_ACCESS`

_Unsupported access method_

**Given:**
- `access_method` (input) not_in `spot,futures,producer_equity,commodity_etn`

**Then:**
- **emit_event** event: `commodity.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMMODITY_INVALID_ACCESS` | 400 | access_method must be spot, futures, producer_equity, or commodity_etn | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `commodity.analysed` |  | `commodity_id`, `access_method`, `spot_return`, `roll_yield`, `total_return` |
| `commodity.analysis_rejected` |  | `commodity_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| commodities-derivatives-l2 | recommended | L2 commodity derivatives treatment extends the natural resources investment concepts covered here |
| forward-futures-pricing | required |  |
| farmland-timberland-investments | recommended |  |

## AGI Readiness

### Goals

#### Reliable Natural Resources Commodities

Invest in commodities through spot, futures, and equity of producers; decompose commodity futures total return into spot, collateral, and roll yield and address contango and backwardation

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
| `forward_futures_pricing` | forward-futures-pricing | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyse_commodity | `autonomous` | - | - |
| invalid_access | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Natural Resources Commodities Blueprint",
  "description": "Invest in commodities through spot, futures, and equity of producers; decompose commodity futures total return into spot, collateral, and roll yield and address",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "commodities, futures, contango, backwardation, roll-yield, cfa-level-1"
}
</script>
