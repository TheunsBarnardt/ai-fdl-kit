---
title: "Mtm Bond Valuation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Mark-to-market bond valuation framework for daily portfolio accounting. Establishes pricing hierarchy, accrued interest conventions, and rounding rules. . 5 fie"
---

# Mtm Bond Valuation Blueprint

> Mark-to-market bond valuation framework for daily portfolio accounting.
Establishes pricing hierarchy, accrued interest conventions, and rounding rules.


| | |
|---|---|
| **Feature** | `mtm-bond-valuation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | bonds, valuation, mark-to-market, mtm, portfolio, accounting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/mtm-bond-valuation.blueprint.yaml) |
| **JSON API** | [mtm-bond-valuation.json]({{ site.baseurl }}/api/blueprints/trading/mtm-bond-valuation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `valuation_date` | date | Yes | Valuation Date |  |
| `bond_isin` | text | Yes | Bond ISIN |  |
| `quoted_clean_price` | number | No | Quoted Clean Price |  |
| `bid_price` | number | No | Bid Price |  |
| `ask_price` | number | No | Ask Price |  |

## Rules

- **pricing:**
  - **pricing_hierarchy:** 1. Recent trade quotes (last N hours)
2. Bid-ask spread midpoint
3. Derived from yield curve
4. Benchmark spread assumption
5. Previous close price

  - **accrued_interest_calculation:** Accrued = (Days_Since_Last_Coupon / 365) × Annual_Coupon


## Outcomes

### Bond_valued

_Mark bond-to-market using pricing hierarchy and accrued interest_

**Given:**
- `valuation_date` (input) exists
- `bond_isin` (input) exists

**Then:**
- **set_field** target: `mtm_clean_price` value: `from pricing hierarchy`
- **set_field** target: `accrued_interest` value: `calculated per A/365`
- **set_field** target: `all_in_price` value: `clean_price + accrued_interest`
- **emit_event** event: `bond.mtm.valued`

**Result:** Bond marked-to-market

### Portfolio_aggregated

_Aggregate daily MTM valuations across portfolio_

**Given:**
- `valuation_date` (input) exists

**Then:**
- **emit_event** event: `portfolio.mtm.complete`

**Result:** Portfolio MTM valuation completed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NO_PRICING_DATA` | 400 | No quoted prices available for bond | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bond-pricing-models | required |  |

## AGI Readiness

### Goals

#### Reliable Mtm Bond Valuation

Mark-to-market bond valuation framework for daily portfolio accounting.
Establishes pricing hierarchy, accrued interest conventions, and rounding rules.


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

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `bond_pricing_models` | bond-pricing-models | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| bond_valued | `autonomous` | - | - |
| portfolio_aggregated | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Mtm Bond Valuation Blueprint",
  "description": "Mark-to-market bond valuation framework for daily portfolio accounting.\nEstablishes pricing hierarchy, accrued interest conventions, and rounding rules.\n. 5 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bonds, valuation, mark-to-market, mtm, portfolio, accounting"
}
</script>
