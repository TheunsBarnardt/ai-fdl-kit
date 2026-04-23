---
title: "Machine Learning Techniques Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits an"
---

# Machine Learning Techniques Blueprint

> Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits and cross-validation

| | |
|---|---|
| **Feature** | `machine-learning-techniques` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, machine-learning, supervised-learning, unsupervised-learning, overfitting, cross-validation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/machine-learning-techniques.blueprint.yaml) |
| **JSON API** | [machine-learning-techniques.json]({{ site.baseurl }}/api/blueprints/trading/machine-learning-techniques.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ml_engine` | Machine Learning Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `problem_type` | select | Yes | classification \| regression \| clustering \| dimensionality_reduction \| deep_learning |  |
| `labeled_target` | boolean | No | Whether the training data include a known target variable |  |
| `training_data` | json | Yes | Feature matrix X (and y for supervised) |  |
| `validation_strategy` | select | No | holdout \| k_fold_cv \| time_series_cv |  |

## Rules

- **supervised_learning:**
  - **definition:** ML using labeled data — algorithm learns mapping X -> y
  - **tasks:**
    - **classification:** Discrete labels (up/down, default/non-default)
    - **regression:** Continuous target (return, yield, spread)
  - **algorithms:** Linear/logistic regression, SVM, random forests, gradient boosting
- **unsupervised_learning:**
  - **definition:** ML on data without labels — algorithm discovers structure
  - **tasks:**
    - **clustering:** Group similar observations (k-means, hierarchical)
    - **dimensionality_reduction:** Compress features (PCA, t-SNE, autoencoders)
  - **applications:** Security clustering for peer selection, factor extraction
- **deep_learning:**
  - **definition:** Neural networks with many layers learning hierarchical representations
  - **strengths:** Image, audio, and text processing; non-linear feature interactions
  - **weaknesses:** Data hungry, hard to interpret, easy to overfit
- **overfitting_and_underfitting:**
  - **overfitting:** Model memorises training noise; strong in-sample, weak out-of-sample
  - **underfitting:** Model too simple; poor in-sample AND out-of-sample
  - **symptoms:**
    - **overfit:** Train error low, validation error high; complex model
    - **underfit:** Both errors high; model too simple or regularised
- **mitigation:**
  - **train_test_split:** Hold out 20-30 percent for evaluation before any tuning
  - **k_fold_cv:** Repeat train/validate across k folds to stabilise estimates
  - **time_series_cv:** Use expanding or rolling windows to preserve time order
  - **regularisation:** L1/L2 penalties to shrink coefficients
  - **early_stopping:** Halt training when validation error starts to rise
  - **feature_selection:** Fewer, well-motivated features over many noisy ones
- **applications:**
  - **credit_scoring:** Classification to predict default (supervised)
  - **peer_grouping:** K-means clustering of firms by financial ratios (unsupervised)
  - **signal_generation:** Gradient boosting of return on multi-factor features
  - **document_classification:** Deep-learning NER/topic tagging of filings
- **validation:**
  - **supported_problem_type:** problem_type in {classification, regression, clustering, dimensionality_reduction, deep_learning}
  - **labels_match_supervision:** Labels required for supervised tasks

## Outcomes

### Fit_model (Priority: 1)

_Train the selected ML model on the provided data_

**Given:**
- `training_data` (input) exists
- `problem_type` (input) in `classification,regression,clustering,dimensionality_reduction,deep_learning`

**Then:**
- **call_service** target: `ml_engine`
- **emit_event** event: `ml.model_trained`

### Overfitting_warning (Priority: 5)

_Large gap between training and validation error_

**Given:**
- `overfit_detected` (computed) eq `true`

**Then:**
- **emit_event** event: `ml.overfit_warning`

### Invalid_problem_type (Priority: 10) — Error: `ML_INVALID_PROBLEM_TYPE`

_Unsupported problem type_

**Given:**
- `problem_type` (input) not_in `classification,regression,clustering,dimensionality_reduction,deep_learning`

**Then:**
- **emit_event** event: `ml.training_rejected`

### Missing_labels_for_supervised (Priority: 11) — Error: `ML_MISSING_LABELS`

_Supervised task but labels missing_

**Given:**
- `problem_type` (input) in `classification,regression`
- `labeled_target` (input) eq `false`

**Then:**
- **emit_event** event: `ml.training_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ML_INVALID_PROBLEM_TYPE` | 400 | problem_type must be classification, regression, clustering, dimensionality_reduction, or deep_learning | No |
| `ML_MISSING_LABELS` | 400 | Supervised learning requires labeled target data | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ml.model_trained` |  | `model_id`, `problem_type`, `train_score`, `validation_score`, `features_used` |
| `ml.overfit_warning` |  | `model_id`, `train_score`, `validation_score`, `gap` |
| `ml.training_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| big-data-characteristics | recommended |  |
| data-science-processing | recommended |  |
| fintech-investment-analysis | recommended |  |

## AGI Readiness

### Goals

#### Reliable Machine Learning Techniques

Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits and cross-validation

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
| fit_model | `autonomous` | - | - |
| overfitting_warning | `autonomous` | - | - |
| invalid_problem_type | `autonomous` | - | - |
| missing_labels_for_supervised | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
bias_variance_tradeoff:
  bias: Error from simplifying assumptions — underfitting
  variance: Error from sensitivity to training sample — overfitting
  sweet_spot: Minimum total prediction error sits between extremes
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Machine Learning Techniques Blueprint",
  "description": "Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, machine-learning, supervised-learning, unsupervised-learning, overfitting, cross-validation, cfa-level-1"
}
</script>
