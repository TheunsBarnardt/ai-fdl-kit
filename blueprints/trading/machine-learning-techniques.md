<!-- AUTO-GENERATED FROM machine-learning-techniques.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Machine Learning Techniques

> Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits and cross-validation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · machine-learning · supervised-learning · unsupervised-learning · overfitting · cross-validation · cfa-level-1

## What this does

Select between supervised, unsupervised, and deep learning approaches for investment problems while managing overfitting through train/validation/test splits and cross-validation

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **problem_type** *(select, required)* — classification | regression | clustering | dimensionality_reduction | deep_learning
- **labeled_target** *(boolean, optional)* — Whether the training data include a known target variable
- **training_data** *(json, required)* — Feature matrix X (and y for supervised)
- **validation_strategy** *(select, optional)* — holdout | k_fold_cv | time_series_cv

## What must be true

- **supervised_learning → definition:** ML using labeled data — algorithm learns mapping X -> y
- **supervised_learning → tasks → classification:** Discrete labels (up/down, default/non-default)
- **supervised_learning → tasks → regression:** Continuous target (return, yield, spread)
- **supervised_learning → algorithms:** Linear/logistic regression, SVM, random forests, gradient boosting
- **unsupervised_learning → definition:** ML on data without labels — algorithm discovers structure
- **unsupervised_learning → tasks → clustering:** Group similar observations (k-means, hierarchical)
- **unsupervised_learning → tasks → dimensionality_reduction:** Compress features (PCA, t-SNE, autoencoders)
- **unsupervised_learning → applications:** Security clustering for peer selection, factor extraction
- **deep_learning → definition:** Neural networks with many layers learning hierarchical representations
- **deep_learning → strengths:** Image, audio, and text processing; non-linear feature interactions
- **deep_learning → weaknesses:** Data hungry, hard to interpret, easy to overfit
- **overfitting_and_underfitting → overfitting:** Model memorises training noise; strong in-sample, weak out-of-sample
- **overfitting_and_underfitting → underfitting:** Model too simple; poor in-sample AND out-of-sample
- **overfitting_and_underfitting → symptoms → overfit:** Train error low, validation error high; complex model
- **overfitting_and_underfitting → symptoms → underfit:** Both errors high; model too simple or regularised
- **mitigation → train_test_split:** Hold out 20-30 percent for evaluation before any tuning
- **mitigation → k_fold_cv:** Repeat train/validate across k folds to stabilise estimates
- **mitigation → time_series_cv:** Use expanding or rolling windows to preserve time order
- **mitigation → regularisation:** L1/L2 penalties to shrink coefficients
- **mitigation → early_stopping:** Halt training when validation error starts to rise
- **mitigation → feature_selection:** Fewer, well-motivated features over many noisy ones
- **applications → credit_scoring:** Classification to predict default (supervised)
- **applications → peer_grouping:** K-means clustering of firms by financial ratios (unsupervised)
- **applications → signal_generation:** Gradient boosting of return on multi-factor features
- **applications → document_classification:** Deep-learning NER/topic tagging of filings
- **validation → supported_problem_type:** problem_type in {classification, regression, clustering, dimensionality_reduction, deep_learning}
- **validation → labels_match_supervision:** Labels required for supervised tasks

## Success & failure scenarios

**✅ Success paths**

- **Fit Model** — when training_data exists; problem_type in ["classification","regression","clustering","dimensionality_reduction","deep_learning"], then call service; emit ml.model_trained. _Why: Train the selected ML model on the provided data._
- **Overfitting Warning** — when overfit_detected eq true, then emit ml.overfit_warning. _Why: Large gap between training and validation error._

**❌ Failure paths**

- **Invalid Problem Type** — when problem_type not_in ["classification","regression","clustering","dimensionality_reduction","deep_learning"], then emit ml.training_rejected. _Why: Unsupported problem type._ *(error: `ML_INVALID_PROBLEM_TYPE`)*
- **Missing Labels For Supervised** — when problem_type in ["classification","regression"]; labeled_target eq false, then emit ml.training_rejected. _Why: Supervised task but labels missing._ *(error: `ML_MISSING_LABELS`)*

## Errors it can return

- `ML_INVALID_PROBLEM_TYPE` — problem_type must be classification, regression, clustering, dimensionality_reduction, or deep_learning
- `ML_MISSING_LABELS` — Supervised learning requires labeled target data

## Events

**`ml.model_trained`**
  Payload: `model_id`, `problem_type`, `train_score`, `validation_score`, `features_used`

**`ml.overfit_warning`**
  Payload: `model_id`, `train_score`, `validation_score`, `gap`

**`ml.training_rejected`**
  Payload: `model_id`, `reason_code`

## Connects to

- **big-data-characteristics** *(recommended)*
- **data-science-processing** *(recommended)*
- **fintech-investment-analysis** *(recommended)*

## Quality fitness 🟢 89/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/machine-learning-techniques/) · **Spec source:** [`machine-learning-techniques.blueprint.yaml`](./machine-learning-techniques.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
