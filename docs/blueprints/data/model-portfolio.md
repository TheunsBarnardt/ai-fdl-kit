---
title: "Model Portfolio Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Template portfolios with target weights per asset class, drift calculation, tolerance bands, and rebalance trigger configuration. 8 fields. 6 outcomes. 3 error "
---

# Model Portfolio Blueprint

> Template portfolios with target weights per asset class, drift calculation, tolerance bands, and rebalance trigger configuration

| | |
|---|---|
| **Feature** | `model-portfolio` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | model-portfolio, target-weights, drift, rebalance, asset-allocation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/model-portfolio.blueprint.yaml) |
| **JSON API** | [model-portfolio.json]({{ site.baseurl }}/api/blueprints/data/model-portfolio.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model Portfolio ID |  |
| `name` | text | Yes | Model Name |  |
| `risk_level` | select | Yes | Risk Level |  |
| `target_weights` | json | Yes | Target Weights by Asset Class |  |
| `tolerance_bands` | json | Yes | Tolerance Bands (percent drift) |  |
| `rebalance_trigger` | select | Yes | Rebalance Trigger |  |
| `benchmark` | text | No | Reference Benchmark |  |
| `published` | boolean | No | Published |  |

## Rules

- **weights_sum:**
  - **description:** MUST: Target weights must sum to exactly 100% (allow floating-point tolerance of 0.0001)
  - **sum_target:** 100
  - **tolerance:** 0.0001
- **asset_class_limits:**
  - **description:** MUST: Respect Regulation 28 single-class caps (equity 75, foreign 45, property 25, PE 15, hedge 10, single issuer 5-25)
  - **equity_max:** 75
  - **foreign_max:** 45
  - **property_max:** 25
  - **private_equity_max:** 15
  - **hedge_max:** 10
  - **single_issuer_max:** 25
- **drift_calculation:**
  - **description:** MUST: Compute drift daily as (actual_weight - target_weight) per asset class
  - **cadence:** daily
- **tolerance_bands:**
  - **description:** MUST: Every asset class has an absolute tolerance band; breach triggers rebalance evaluation
  - **default_band_percent:** 5
- **versioning:**
  - **description:** MUST: Every change to a published model creates a new version; prior version remains immutable
  - **immutable_after_publish:** true
- **approval:**
  - **description:** MUST: Publishing a model requires sign-off from investment committee
  - **approver_role:** investment_committee

## Outcomes

### Weights_sum_invalid (Priority: 1) — Error: `MODEL_WEIGHTS_SUM_INVALID`

_Target weights do not sum to 100%_

**Given:**
- sum of target_weights differs from 100 by more than tolerance

**Result:** Validation failure surfaced to user

### Asset_class_limit_breached (Priority: 2) — Error: `MODEL_ASSET_CLASS_LIMIT_BREACHED`

_One or more asset classes exceed Regulation 28 caps_

**Given:**
- any asset class weight exceeds its Regulation 28 cap

**Result:** Validation failure surfaced to user

### Weights_validated (Priority: 9)

_Target weights sum to 100% and respect asset-class caps_

**Given:**
- sum of target_weights equals 100 within tolerance
- no asset class exceeds Regulation 28 cap

**Then:**
- **set_field** target: `weights_valid` value: `true`

**Result:** Weights accepted

### Model_created_successfully (Priority: 10) | Transaction: atomic

_A new model portfolio was created in draft state_

**Given:**
- `name` (input) exists
- `risk_level` (input) exists

**Then:**
- **create_record** target: `models`
- **emit_event** event: `model.created`

**Result:** Model saved in draft

### Drift_calculated (Priority: 10)

_Daily drift between actual and target weights computed_

**Given:**
- end-of-day holdings snapshot is available

**Then:**
- **emit_event** event: `model.drift_calculated`

**Result:** Drift report stored

### Model_published (Priority: 10) | Transaction: atomic

_Model is approved by investment committee and published for use_

**Given:**
- weights_valid is true
- investment committee approval recorded

**Then:**
- **transition_state** field: `status` from: `draft` to: `published`
- **emit_event** event: `model.published`

**Result:** Model available to advisors

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MODEL_WEIGHTS_SUM_INVALID` | 422 | Target weights must sum to 100 percent. | No |
| `MODEL_ASSET_CLASS_LIMIT_BREACHED` | 422 | One or more asset classes exceed Regulation 28 limits. | No |
| `MODEL_NOT_FOUND` | 404 | Model portfolio not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `model.created` | Model portfolio created in draft | `model_id`, `name`, `risk_level` |
| `model.drift_calculated` | Daily drift computed | `model_id`, `max_drift_pct`, `breach_count` |
| `model.published` | Model approved and published | `model_id`, `name`, `risk_level` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| regulation-28-compliance | required | Models for SA retirement mandates must satisfy Regulation 28 |
| portfolio-rebalancing-engine | recommended | Rebalancing engine consumes models to propose trades |
| strategic-asset-allocation | recommended | SAA work feeds target weights |

## AGI Readiness

### Goals

#### Model Integrity

Ensure every published model portfolio has valid weights, respects regulatory caps, and is approved by the investment committee

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| published_model_validity | = 100% | Percentage of published models with weights summing to 100 and no cap breach |

**Constraints:**

- **regulatory** (non-negotiable): Regulation 28 caps are not negotiable for SA retirement mandates

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- before publishing a model
- before changing risk level of an in-use model

### Verification

**Invariants:**

- sum(target_weights) == 100 within tolerance
- no asset class exceeds Regulation 28 cap
- published models are immutable

### Coordination

**Protocol:** `request_response`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| model_created_successfully | `autonomous` | - | - |
| weights_validated | `autonomous` | - | - |
| model_published | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Model Portfolio Blueprint",
  "description": "Template portfolios with target weights per asset class, drift calculation, tolerance bands, and rebalance trigger configuration. 8 fields. 6 outcomes. 3 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "model-portfolio, target-weights, drift, rebalance, asset-allocation"
}
</script>
