---
title: "Buy Sell Back Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Repo agreement (buy-sell-back) pricing combining bond valuation with repo interest accrual over repurchase term. . 5 fields. 1 outcomes. 1 error codes. rules: p"
---

# Buy Sell Back Pricing Blueprint

> Repo agreement (buy-sell-back) pricing combining bond valuation with
repo interest accrual over repurchase term.


| | |
|---|---|
| **Feature** | `buy-sell-back-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | bonds, repo, buy-sell-back, repurchase-agreement, money-market |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/buy-sell-back-pricing.blueprint.yaml) |
| **JSON API** | [buy-sell-back-pricing.json]({{ site.baseurl }}/api/blueprints/trading/buy-sell-back-pricing.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_isin` | text | Yes | Bond ISIN |  |
| `sale_date` | date | Yes | Sale Date |  |
| `repurchase_date` | date | Yes | Repurchase Date |  |
| `sale_yield` | number | Yes | Yield at Sale |  |
| `repo_rate` | number | Yes | Daily Repo Rate |  |

## Rules

- **pricing:**
  - **sale_price_calculation:** Sale_All_In = Sale_Clean + Sale_Accrued

  - **repo_interest:** Repo_Interest = Sale_All_In × Repo_Rate × Term_Days / 365

  - **repurchase_price:** Repurchase_All_In = Sale_All_In + Repo_Interest


## Outcomes

### Repo_priced

_Price repo agreement with bond valuation and daily interest_

**Given:**
- `sale_date` (input) exists
- `repurchase_date` (input) exists
- `repo_rate` (input) exists

**Then:**
- **set_field** target: `repo_interest_amount` value: `calculated from rate and term`
- **set_field** target: `repurchase_price` value: `sale_price + repo_interest`
- **emit_event** event: `repo.agreement.priced`

**Result:** Buy-sell-back agreement priced

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_DATES` | 400 | Repurchase date must be after sale date | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bond-pricing-models | required |  |

## AGI Readiness

### Goals

#### Reliable Buy Sell Back Pricing

Repo agreement (buy-sell-back) pricing combining bond valuation with
repo interest accrual over repurchase term.


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
| repo_priced | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Buy Sell Back Pricing Blueprint",
  "description": "Repo agreement (buy-sell-back) pricing combining bond valuation with\nrepo interest accrual over repurchase term.\n. 5 fields. 1 outcomes. 1 error codes. rules: p",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bonds, repo, buy-sell-back, repurchase-agreement, money-market"
}
</script>
