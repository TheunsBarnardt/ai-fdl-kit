---
title: "Big Data Projects L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Execute a big-data analysis project — data preparation and wrangling, feature selection and engineering, model training, and performance evaluation for structur"
---

# Big Data Projects L2 Blueprint

> Execute a big-data analysis project — data preparation and wrangling, feature selection and engineering, model training, and performance evaluation for structured and unstructured data

| | |
|---|---|
| **Feature** | `big-data-projects-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quant, big-data, data-wrangling, feature-engineering, model-training, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/big-data-projects-l2.blueprint.yaml) |
| **JSON API** | [big-data-projects-l2.json]({{ site.baseurl }}/api/blueprints/trading/big-data-projects-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_pipeline` | Data Pipeline | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `project_id` | text | Yes | Project identifier |  |
| `data_type` | select | Yes | structured \| unstructured |  |

## Rules

- **project_steps:**
  - **conceptualisation:** Define problem and target variable
  - **data_collection:** Identify sources, ingest
  - **preparation_wrangling:** Clean, transform, integrate
  - **exploration:** EDA, feature selection, feature engineering
  - **model_training:** Method selection, performance evaluation, tuning
  - **results_interpretation:** Communicate insights to stakeholders
- **structured_data_prep:**
  - **cleansing:** Handle missing, invalid, duplicate, inconsistent observations
  - **wrangling:** Extract, aggregate, filter, normalise/standardise
- **unstructured_text_prep:**
  - **cleansing:** Remove HTML tags, punctuation, numbers; case normalisation
  - **wrangling:** Tokenisation, stemming, lemmatisation, stop-word removal, n-gram creation
  - **representation:** Bag-of-words, TF-IDF, word embeddings
- **feature_selection:**
  - **purpose:** Reduce dimensionality, remove noise, prevent overfitting
  - **methods:** Filter (chi-sq, correlation), wrapper (forward/backward), embedded (Lasso)
- **feature_engineering:**
  - **transformations:** Log, square, polynomial, interactions
  - **one_hot_encoding:** Convert categorical to binary indicator columns
- **model_training:**
  - **method_selection:** Match algorithm to problem (regression vs classification, linear vs non-linear)
  - **performance_metrics:** Accuracy, precision, recall, F1, AUC for classification; RMSE, MAE for regression
  - **confusion_matrix:** TP/FP/TN/FN tabulation
  - **tuning:** Grid search or random search with cross-validation
- **validation:**
  - **project_required:** project_id present
  - **valid_data_type:** data_type in [structured, unstructured]

## Outcomes

### Execute_project (Priority: 1)

_Execute big-data analysis project_

**Given:**
- `project_id` (input) exists
- `data_type` (input) in `structured,unstructured`

**Then:**
- **call_service** target: `data_pipeline`
- **emit_event** event: `bigdata.project_executed`

### Invalid_data_type (Priority: 10) — Error: `BIGDATA_INVALID_DATA_TYPE`

_Unsupported data type_

**Given:**
- `data_type` (input) not_in `structured,unstructured`

**Then:**
- **emit_event** event: `bigdata.project_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BIGDATA_INVALID_DATA_TYPE` | 400 | data_type must be structured or unstructured | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bigdata.project_executed` |  | `project_id`, `data_type`, `model_score`, `feature_count` |
| `bigdata.project_rejected` |  | `project_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| big-data-characteristics | required |  |
| machine-learning-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Big Data Projects L2

Execute a big-data analysis project — data preparation and wrangling, feature selection and engineering, model training, and performance evaluation for structured and unstructured data

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
| `big_data_characteristics` | big-data-characteristics | fail |
| `machine_learning_l2` | machine-learning-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| execute_project | `autonomous` | - | - |
| invalid_data_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Big Data Projects L2 Blueprint",
  "description": "Execute a big-data analysis project — data preparation and wrangling, feature selection and engineering, model training, and performance evaluation for structur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quant, big-data, data-wrangling, feature-engineering, model-training, cfa-level-2"
}
</script>
