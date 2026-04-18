---
title: "Machine Learning L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply ML to investment problems — supervised (penalised regression, SVM, KNN, CART, random forest), unsupervised (PCA, clustering), neural networks, deep learni"
---

# Machine Learning L2 Blueprint

> Apply ML to investment problems — supervised (penalised regression, SVM, KNN, CART, random forest), unsupervised (PCA, clustering), neural networks, deep learning, reinforcement learning

| | |
|---|---|
| **Feature** | `machine-learning-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quant, machine-learning, supervised, unsupervised, neural-networks, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/machine-learning-l2.blueprint.yaml) |
| **JSON API** | [machine-learning-l2.json]({{ site.baseurl }}/api/blueprints/trading/machine-learning-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ml_engine_l2` | ML Engine (L2) | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model identifier |  |
| `algorithm` | select | Yes | penalised_regression \| svm \| knn \| cart \| random_forest \| pca \| kmeans \| hierarchical \| neural_network \| deep_learning \| reinforcement |  |

## Rules

- **supervised_vs_unsupervised:**
  - **supervised:** Labelled data; predict Y from X (regression or classification)
  - **unsupervised:** No labels; discover structure (clusters, components)
- **generalisation_overfitting:**
  - **bias_variance:** High bias = underfit; high variance = overfit
  - **train_validate_test:** Partition; train on training, tune on validation, evaluate on test
  - **k_fold_cv:** K-fold cross-validation reduces variance of performance estimate
- **prevention_overfitting:**
  - **regularisation:** Penalise model complexity (L1/L2)
  - **early_stopping:** Halt training when validation error rises
- **penalised_regression:**
  - **lasso:** L1 penalty; performs variable selection by zeroing coefficients
  - **ridge:** L2 penalty; shrinks coefficients without zeroing
  - **elastic_net:** Combines L1 and L2 penalties
- **svm:** Linear classifier maximising margin between classes; kernel trick handles non-linear
- **knn:** Classify by majority vote of k nearest neighbours; sensitive to feature scaling
- **cart:** Recursive partitioning of feature space; prone to overfitting without pruning
- **ensemble:**
  - **bagging:** Bootstrap aggregating; reduces variance
  - **random_forest:** Bagging on decision trees with random feature subsets at each split
  - **boosting:** Sequential weak learners weighted by previous errors
- **unsupervised:**
  - **pca:** Linear orthogonal transformation maximising variance per component; eigenvalue scree plot to choose k
  - **kmeans:** Partition into k clusters minimising within-cluster sum of squares
  - **hierarchical:** Agglomerative or divisive; produces dendrogram
- **neural_networks:**
  - **architecture:** Input layer → hidden layers (with non-linear activation) → output layer
  - **backpropagation:** Gradient descent on loss function via chain rule
  - **deep_learning:** Many hidden layers; learns hierarchical representations
- **reinforcement_learning:**
  - **framework:** Agent learns policy maximising cumulative reward via state-action-reward feedback
  - **application:** Algorithmic trading strategies that adapt online
- **validation:**
  - **model_required:** model_id present
  - **valid_algorithm:** algorithm in allowed set

## Outcomes

### Train_ml_model (Priority: 1)

_Train ML model_

**Given:**
- `model_id` (input) exists
- `algorithm` (input) in `penalised_regression,svm,knn,cart,random_forest,pca,kmeans,hierarchical,neural_network,deep_learning,reinforcement`

**Then:**
- **call_service** target: `ml_engine_l2`
- **emit_event** event: `ml.trained`

### Invalid_algorithm (Priority: 10) — Error: `ML_INVALID_ALGORITHM`

_Unsupported algorithm_

**Given:**
- `algorithm` (input) not_in `penalised_regression,svm,knn,cart,random_forest,pca,kmeans,hierarchical,neural_network,deep_learning,reinforcement`

**Then:**
- **emit_event** event: `ml.train_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ML_INVALID_ALGORITHM` | 400 | algorithm must be one of the supported ML algorithms | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ml.trained` |  | `model_id`, `algorithm`, `train_score`, `validation_score`, `hyperparameters` |
| `ml.train_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| machine-learning-techniques | required |  |
| big-data-projects-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Machine Learning L2 Blueprint",
  "description": "Apply ML to investment problems — supervised (penalised regression, SVM, KNN, CART, random forest), unsupervised (PCA, clustering), neural networks, deep learni",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quant, machine-learning, supervised, unsupervised, neural-networks, cfa-level-2"
}
</script>
