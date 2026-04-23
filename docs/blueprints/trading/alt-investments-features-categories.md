---
title: "Alt Investments Features Categories Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify alternative investments into private capital, real assets, and hedge funds, and contrast them with traditional equity and fixed income on liquidity, fe"
---

# Alt Investments Features Categories Blueprint

> Classify alternative investments into private capital, real assets, and hedge funds, and contrast them with traditional equity and fixed income on liquidity, fees, and regulation

| | |
|---|---|
| **Feature** | `alt-investments-features-categories` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternatives, private-capital, real-assets, hedge-funds, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/alt-investments-features-categories.blueprint.yaml) |
| **JSON API** | [alt-investments-features-categories.json]({{ site.baseurl }}/api/blueprints/trading/alt-investments-features-categories.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `alt_classifier` | Alt Investment Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `classification_id` | text | Yes | Classification identifier |  |
| `category` | select | Yes | private_capital \| real_assets \| hedge_funds |  |
| `subcategory` | text | No | Subcategory (e.g., buyout, real_estate, macro) |  |

## Rules

- **categories:**
  - **private_capital:** Private equity (buyout, venture, growth) and private debt
  - **real_assets:** Real estate, infrastructure, natural resources, commodities
  - **hedge_funds:** Pooled vehicles applying long/short, event-driven, macro, relative-value strategies
- **distinguishing_features:**
  - **illiquidity:** Long lock-ups, limited secondary market
  - **high_fees:** Management and incentive fees; 2-and-20 common
  - **low_correlation:** Diversification from traditional assets, subject to smoothing
  - **specialised_skill:** Manager selection is a major driver of returns
  - **regulatory_regime:** Typically accredited/qualified investors, lighter disclosure
- **validation:**
  - **classification_required:** classification_id present
  - **valid_category:** category in allowed set

## Outcomes

### Classify_alt_investment (Priority: 1)

_Classify investment into alt category_

**Given:**
- `classification_id` (input) exists
- `category` (input) in `private_capital,real_assets,hedge_funds`

**Then:**
- **call_service** target: `alt_classifier`
- **emit_event** event: `alt.classified`

### Invalid_category (Priority: 10) — Error: `ALT_INVALID_CATEGORY`

_Unsupported alt category_

**Given:**
- `category` (input) not_in `private_capital,real_assets,hedge_funds`

**Then:**
- **emit_event** event: `alt.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ALT_INVALID_CATEGORY` | 400 | category must be private_capital, real_assets, or hedge_funds | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alt.classified` |  | `classification_id`, `category`, `subcategory` |
| `alt.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-methods | recommended |  |
| alt-investments-ownership-compensation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Alt Investments Features Categories

Classify alternative investments into private capital, real assets, and hedge funds, and contrast them with traditional equity and fixed income on liquidity, fees, and regulation

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
| classify_alt_investment | `autonomous` | - | - |
| invalid_category | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Alt Investments Features Categories Blueprint",
  "description": "Classify alternative investments into private capital, real assets, and hedge funds, and contrast them with traditional equity and fixed income on liquidity, fe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternatives, private-capital, real-assets, hedge-funds, cfa-level-1"
}
</script>
