---
title: "Inflation Indexed Bond Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Pricing methodology for inflation-linked bonds with CPI-adjusted principals. Supports linear CPI interpolation for settlement dates between published months. . "
---

# Inflation Indexed Bond Pricing Blueprint

> Pricing methodology for inflation-linked bonds with CPI-adjusted principals.
Supports linear CPI interpolation for settlement dates between published months.


| | |
|---|---|
| **Feature** | `inflation-indexed-bond-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | bonds, inflation, cpi, inflation-indexed, real-yield |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/inflation-indexed-bond-pricing.blueprint.yaml) |
| **JSON API** | [inflation-indexed-bond-pricing.json]({{ site.baseurl }}/api/blueprints/trading/inflation-indexed-bond-pricing.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `settlement_date` | date | Yes | Settlement Date |  |
| `maturity_date` | date | Yes | Maturity Date |  |
| `coupon_percentage` | number | Yes | Real Coupon Rate |  |
| `reference_cpi` | number | Yes | Reference CPI |  |
| `settlement_cpi` | number | Yes | Settlement CPI |  |

## Rules

- **pricing:**
  - **indexed_principal:** Indexed_Principal = Nominal × (Settlement_CPI / Reference_CPI)

  - **cpi_interpolation:** Settlement_CPI = CPI(m) + [(CPI(m+1) - CPI(m)) × fraction_of_month]


## Outcomes

### Iilb_priced

_Calculate inflation-indexed bond price with CPI adjustment_

**Given:**
- `settlement_cpi` (input) exists
- `reference_cpi` (input) exists

**Then:**
- **set_field** target: `indexed_principal` value: `nominal × (settlement_cpi / reference_cpi)`
- **set_field** target: `all_in_price` value: `GCH formula on indexed principal`
- **emit_event** event: `iilb.price.calculated`

**Result:** Inflation-indexed bond priced

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_CPI` | 400 | CPI values must be positive | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bond-pricing-models | required |  |

## AGI Readiness

### Goals

#### Reliable Inflation Indexed Bond Pricing

Pricing methodology for inflation-linked bonds with CPI-adjusted principals.
Supports linear CPI interpolation for settlement dates between published months.


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
| iilb_priced | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Inflation Indexed Bond Pricing Blueprint",
  "description": "Pricing methodology for inflation-linked bonds with CPI-adjusted principals.\nSupports linear CPI interpolation for settlement dates between published months.\n. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bonds, inflation, cpi, inflation-indexed, real-yield"
}
</script>
