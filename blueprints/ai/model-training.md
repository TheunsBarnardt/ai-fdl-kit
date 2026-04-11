<!-- AUTO-GENERATED FROM model-training.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Model Training

> Train, evaluate, and checkpoint ML models using the Keras fit API with configurable optimizers, loss functions, callbacks, and distributed strategies

**Category:** Ai · **Version:** 1.0.0 · **Tags:** ai · machine-learning · training · keras · deep-learning · tensorflow

## What this does

Train, evaluate, and checkpoint ML models using the Keras fit API with configurable optimizers, loss functions, callbacks, and distributed strategies

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **optimizer** *(select, required)* — Optimizer
- **learning_rate** *(number, required)* — Learning Rate
- **loss_function** *(select, required)* — Loss Function
- **epochs** *(number, required)* — Max Training Epochs
- **batch_size** *(number, required)* — Batch Size
- **validation_split** *(number, optional)* — Validation Split (fraction of training data, 0–1)
- **checkpoint_path** *(text, optional)* — Checkpoint Directory Path
- **early_stopping_patience** *(number, optional)* — Early Stopping Patience (epochs without improvement)
- **gradient_clip_norm** *(number, optional)* — Gradient Clip Norm (prevents exploding gradients)
- **distribute_strategy** *(select, optional)* — Distribution Strategy
- **training_status** *(select, optional)* — Training Status
- **current_epoch** *(number, optional)* — Current Epoch
- **best_val_loss** *(number, optional)* — Best Validation Loss

## What must be true

- **data_preparation → input_validation:** MUST validate input tensor shapes match the model's expected input shape before calling model.fit(). Mismatched shapes raise InvalidArgumentError. Data types must match the model's dtype (float32 is the default). # Source: tensorflow/python/keras/engine/training.py
- **data_preparation → normalization:** MUST normalize or standardize feature values before training. Common strategies: (x - mean) / std or MinMaxScaler to [0, 1]. Unnormalized inputs cause slow convergence, gradient instability, and saturated activations (sigmoid/tanh).
- **data_preparation → shuffle:** MUST shuffle training data before each epoch to prevent the model from learning the ordering of examples. Use tf.data.Dataset.shuffle() with buffer_size >= dataset size for full randomness; partial buffer gives approximate shuffle.
- **training_loop → gradient_clipping:** SHOULD set gradient_clip_norm (clipnorm parameter in optimizer) to prevent exploding gradients, especially in RNNs and transformer models. Typical value: clipnorm=1.0. # Source: tensorflow/python/training/optimizer.py
- **training_loop → learning_rate_scheduling:** SHOULD reduce learning rate on plateau using ReduceLROnPlateau callback or use cosine decay schedule to improve convergence in later epochs. # Source: tensorflow/python/keras/callbacks.py: ReduceLROnPlateau
- **training_loop → reproducibility:** Set tf.random.set_seed(seed) for deterministic weight initialization and dropout behavior across runs. Also set numpy.random.seed and Python random.seed for full reproducibility.
- **checkpointing → model_checkpointing:** SHOULD save model checkpoints using ModelCheckpoint callback: - save_best_only=True: only persist when monitored metric improves - save_weights_only=False: save full SavedModel (graph + weights) - monitor='val_loss': use validation loss, not training loss Checkpoint format: SavedModel directory (recommended over .h5). # Source: tensorflow/python/keras/callbacks.py: ModelCheckpoint
- **distributed_training → strategy_scope:** MUST create model and optimizer inside strategy.scope() when using MirroredStrategy or MultiWorkerMirroredStrategy. All variables created inside scope are mirrored across all replicas. Effective batch size = batch_size × number_of_replicas. # Source: tensorflow/python/distribute/mirrored_strategy.py
- **distributed_training → tpu_requirements:** TPUStrategy requires: - Connecting to TPU cluster before strategy creation - Dynamic shapes NOT supported — use fixed-shape inputs - Effective batch size MUST be divisible by number of TPU cores (8 or 128) # Source: tensorflow/python/distribute/tpu_strategy.py

## Success & failure scenarios

**✅ Success paths**

- **Checkpoint Saved** — when checkpoint_path exists; training epoch completed; val_loss improved or save_best_only is false, then Model weights and optimizer state persisted in SavedModel format.
- **Early Stopping Triggered** — when early_stopping_patience exists; EarlyStopping callback configured with a monitored metric; monitored metric has not improved for early_stopping_patience epochs, then Training halted early; model weights restored to best checkpoint epoch.
- **Training Completed** — when model compiled with optimizer, loss, and at least one metric; training data provided with compatible shapes and dtypes; epochs gt 0; no hardware error during training loop, then Model weights updated to final checkpoint; training history returned.

**❌ Failure paths**

- **Training Failed Oom** — when GPU or TPU memory allocation failed during forward or backward pass; batch_size gt 0, then Training aborted; reduce batch_size or use gradient accumulation. *(error: `TRAINING_OOM_ERROR`)*
- **Training Failed Shape Mismatch** — when input tensor shape does not match model's expected input_shape, then Training aborted; reshape input data to match model's expected input_shape. *(error: `TRAINING_SHAPE_MISMATCH`)*
- **Training Failed Nan Loss** — when loss value became NaN or Inf during forward or backward pass, then Training aborted; check learning_rate, input normalization, and gradient_clip_norm. *(error: `TRAINING_NAN_LOSS`)*

## Errors it can return

- `TRAINING_OOM_ERROR` — Out of memory during training. Reduce batch size or use gradient accumulation.
- `TRAINING_NAN_LOSS` — Loss became NaN or Inf. Check learning rate, input normalization, and gradient clipping.
- `TRAINING_SHAPE_MISMATCH` — Input shape does not match the model's expected input shape.
- `MODEL_COMPILE_ERROR` — Failed to compile model. Check optimizer, loss, and metrics configuration.
- `DISTRIBUTE_STRATEGY_ERROR` — Distribution strategy error. Ensure model is created inside strategy.scope().

## Connects to

- **dataset-pipeline** *(required)* — Training requires a tf.data.Dataset pipeline to supply batches
- **model-serving** *(recommended)* — Trained model exported as SavedModel for serving

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/model-training/) · **Spec source:** [`model-training.blueprint.yaml`](./model-training.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
