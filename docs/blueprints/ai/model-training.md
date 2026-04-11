---
title: "Model Training Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Train, evaluate, and checkpoint ML models using the Keras fit API with configurable optimizers, loss functions, callbacks, and distributed strategies. 13 fields"
---

# Model Training Blueprint

> Train, evaluate, and checkpoint ML models using the Keras fit API with configurable optimizers, loss functions, callbacks, and distributed strategies

| | |
|---|---|
| **Feature** | `model-training` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | ai, machine-learning, training, keras, deep-learning, tensorflow |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/model-training.blueprint.yaml) |
| **JSON API** | [model-training.json]({{ site.baseurl }}/api/blueprints/ai/model-training.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ml_engineer` | ML Engineer | human | Defines model architecture, hyperparameters, and training strategy |
| `data_engineer` | Data Engineer | human | Prepares and validates training datasets |
| `training_runtime` | Training Runtime | system | Executes the training loop on CPU, GPU, or TPU hardware |
| `checkpoint_store` | Checkpoint Store | system | Persists model weights and optimizer state to disk |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `optimizer` | select | Yes | Optimizer |  |
| `learning_rate` | number | Yes | Learning Rate | Validations: min, max |
| `loss_function` | select | Yes | Loss Function |  |
| `epochs` | number | Yes | Max Training Epochs | Validations: min |
| `batch_size` | number | Yes | Batch Size | Validations: min |
| `validation_split` | number | No | Validation Split (fraction of training data, 0–1) |  |
| `checkpoint_path` | text | No | Checkpoint Directory Path |  |
| `early_stopping_patience` | number | No | Early Stopping Patience (epochs without improvement) |  |
| `gradient_clip_norm` | number | No | Gradient Clip Norm (prevents exploding gradients) |  |
| `distribute_strategy` | select | No | Distribution Strategy |  |
| `training_status` | select | No | Training Status |  |
| `current_epoch` | number | No | Current Epoch |  |
| `best_val_loss` | number | No | Best Validation Loss |  |

## States

**State field:** `undefined`

## Rules

- **data_preparation:**
  - **input_validation:** MUST validate input tensor shapes match the model's expected input shape
before calling model.fit(). Mismatched shapes raise InvalidArgumentError.
Data types must match the model's dtype (float32 is the default).
# Source: tensorflow/python/keras/engine/training.py

  - **normalization:** MUST normalize or standardize feature values before training.
Common strategies: (x - mean) / std or MinMaxScaler to [0, 1].
Unnormalized inputs cause slow convergence, gradient instability,
and saturated activations (sigmoid/tanh).

  - **shuffle:** MUST shuffle training data before each epoch to prevent the model
from learning the ordering of examples.
Use tf.data.Dataset.shuffle() with buffer_size >= dataset size for
full randomness; partial buffer gives approximate shuffle.

- **training_loop:**
  - **gradient_clipping:** SHOULD set gradient_clip_norm (clipnorm parameter in optimizer) to
prevent exploding gradients, especially in RNNs and transformer models.
Typical value: clipnorm=1.0.
# Source: tensorflow/python/training/optimizer.py

  - **learning_rate_scheduling:** SHOULD reduce learning rate on plateau using ReduceLROnPlateau callback
or use cosine decay schedule to improve convergence in later epochs.
# Source: tensorflow/python/keras/callbacks.py: ReduceLROnPlateau

  - **reproducibility:** Set tf.random.set_seed(seed) for deterministic weight initialization
and dropout behavior across runs. Also set numpy.random.seed and
Python random.seed for full reproducibility.

- **checkpointing:**
  - **model_checkpointing:** SHOULD save model checkpoints using ModelCheckpoint callback:
- save_best_only=True: only persist when monitored metric improves
- save_weights_only=False: save full SavedModel (graph + weights)
- monitor='val_loss': use validation loss, not training loss
Checkpoint format: SavedModel directory (recommended over .h5).
# Source: tensorflow/python/keras/callbacks.py: ModelCheckpoint

- **distributed_training:**
  - **strategy_scope:** MUST create model and optimizer inside strategy.scope() when using
MirroredStrategy or MultiWorkerMirroredStrategy.
All variables created inside scope are mirrored across all replicas.
Effective batch size = batch_size × number_of_replicas.
# Source: tensorflow/python/distribute/mirrored_strategy.py

  - **tpu_requirements:** TPUStrategy requires:
- Connecting to TPU cluster before strategy creation
- Dynamic shapes NOT supported — use fixed-shape inputs
- Effective batch size MUST be divisible by number of TPU cores (8 or 128)
# Source: tensorflow/python/distribute/tpu_strategy.py


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| epoch_throughput |  |  |
| checkpoint_write | 30s |  |

## Outcomes

### Training_failed_oom (Priority: 1) — Error: `TRAINING_OOM_ERROR`

**Given:**
- GPU or TPU memory allocation failed during forward or backward pass
- `batch_size` (input) gt `0`

**Then:**
- **transition_state** field: `training_status` from: `running` to: `failed`

**Result:** Training aborted; reduce batch_size or use gradient accumulation

### Training_failed_shape_mismatch (Priority: 1) — Error: `TRAINING_SHAPE_MISMATCH`

**Given:**
- input tensor shape does not match model's expected input_shape

**Then:**
- **transition_state** field: `training_status` from: `running` to: `failed`

**Result:** Training aborted; reshape input data to match model's expected input_shape

### Training_failed_nan_loss (Priority: 2) — Error: `TRAINING_NAN_LOSS`

**Given:**
- loss value became NaN or Inf during forward or backward pass

**Then:**
- **transition_state** field: `training_status` from: `running` to: `failed`

**Result:** Training aborted; check learning_rate, input normalization, and gradient_clip_norm

### Checkpoint_saved (Priority: 3)

**Given:**
- `checkpoint_path` (input) exists
- training epoch completed
- val_loss improved or save_best_only is false

**Then:**
- **emit_event** event: `checkpoint.saved`

**Result:** Model weights and optimizer state persisted in SavedModel format

### Early_stopping_triggered (Priority: 5)

**Given:**
- `early_stopping_patience` (input) exists
- EarlyStopping callback configured with a monitored metric
- monitored metric has not improved for early_stopping_patience epochs

**Then:**
- **transition_state** field: `training_status` from: `running` to: `stopped_early`
- **set_field** target: `best_val_loss` value: `best monitored metric value at stopped epoch`
- **emit_event** event: `training.stopped_early`

**Result:** Training halted early; model weights restored to best checkpoint epoch

### Training_completed (Priority: 10) | Transaction: atomic

**Given:**
- model compiled with optimizer, loss, and at least one metric
- training data provided with compatible shapes and dtypes
- `epochs` (input) gt `0`
- no hardware error during training loop

**Then:**
- **transition_state** field: `training_status` from: `running` to: `completed`
- **emit_event** event: `training.completed`

**Result:** Model weights updated to final checkpoint; training history returned

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRAINING_OOM_ERROR` | 500 | Out of memory during training. Reduce batch size or use gradient accumulation. | Yes |
| `TRAINING_NAN_LOSS` | 500 | Loss became NaN or Inf. Check learning rate, input normalization, and gradient clipping. | No |
| `TRAINING_SHAPE_MISMATCH` | 400 | Input shape does not match the model's expected input shape. | No |
| `MODEL_COMPILE_ERROR` | 400 | Failed to compile model. Check optimizer, loss, and metrics configuration. | No |
| `DISTRIBUTE_STRATEGY_ERROR` | 400 | Distribution strategy error. Ensure model is created inside strategy.scope(). | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `training.started` |  | `optimizer`, `learning_rate`, `epochs`, `batch_size`, `distribute_strategy` |
| `training.epoch_completed` |  | `current_epoch`, `loss`, `val_loss` |
| `training.completed` |  | `total_epochs`, `final_loss`, `final_val_loss` |
| `training.stopped_early` |  | `best_epoch`, `best_val_loss` |
| `training.failed` |  | `error_code`, `current_epoch` |
| `checkpoint.saved` |  | `current_epoch`, `checkpoint_path`, `best_val_loss` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dataset-pipeline | required | Training requires a tf.data.Dataset pipeline to supply batches |
| model-serving | recommended | Trained model exported as SavedModel for serving |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  framework: TensorFlow / Keras
  patterns:
    - Keras Model.fit() training loop
    - ModelCheckpoint + EarlyStopping callbacks
    - tf.distribute.Strategy for multi-device training
    - tf.random.set_seed for reproducibility
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Model Training Blueprint",
  "description": "Train, evaluate, and checkpoint ML models using the Keras fit API with configurable optimizers, loss functions, callbacks, and distributed strategies. 13 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, machine-learning, training, keras, deep-learning, tensorflow"
}
</script>
