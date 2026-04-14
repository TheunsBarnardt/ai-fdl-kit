<!-- AUTO-GENERATED FROM dataset-pipeline.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dataset Pipeline

> Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process workers, samplers, collate) patterns

**Category:** Ai · **Version:** 1.1.0 · **Tags:** ai · data-pipeline · preprocessing · pytorch · tensorflow · etl · performance

## What this does

Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process workers, samplers, collate) patterns

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **source_type** *(select, required)* — Data Source Type
- **source_path** *(text, optional)* — Source File Path or Glob Pattern
- **batch_size** *(number, required)* — Batch Size
- **shuffle_buffer_size** *(number, optional)* — Shuffle Buffer Size (use dataset size for perfect shuffle; -1 for AUTOTUNE)
- **prefetch_buffer_size** *(number, optional)* — Prefetch Buffer Size (-1 = AUTOTUNE, recommended)
- **num_parallel_calls** *(number, optional)* — Parallel map() Calls (-1 = AUTOTUNE)
- **cache_to_memory** *(boolean, optional)* — Cache Dataset in RAM After First Epoch
- **cache_file_path** *(text, optional)* — Cache to File Path (persists across runs; leave empty for RAM cache)
- **repeat_indefinitely** *(boolean, optional)* — Repeat Dataset Indefinitely (use with steps_per_epoch)
- **drop_remainder** *(boolean, optional)* — Drop Incomplete Final Batch (PyTorch: drop_last; required for TPU fixed shapes)
- **num_workers** *(number, optional)* — PyTorch: Number of Worker Subprocesses (0 = main process only, default)
- **pin_memory** *(boolean, optional)* — PyTorch: Pin Host Memory for Faster GPU Transfer (enable when using CUDA)
- **persistent_workers** *(boolean, optional)* — PyTorch: Keep Workers Alive Between Epochs (avoids fork overhead)
- **prefetch_factor** *(number, optional)* — PyTorch: Batches Prefetched per Worker (default 2 when num_workers > 0)
- **worker_timeout_s** *(number, optional)* — PyTorch: Timeout in Seconds for Collecting a Batch from Workers (0 = no timeout)
- **sampler_type** *(select, optional)* — PyTorch: Sampler Strategy
- **compression_type** *(select, optional)* — Source File Compression
- **num_shards** *(number, optional)* — Number of Shards (for distributed training)
- **shard_index** *(number, optional)* — This Worker's Shard Index (0-based)

## What must be true

- **pipeline_ordering → operation_order:** The recommended tf.data pipeline operation order: 1. Load source — from_tensor_slices(), TFRecordDataset(), etc. 2. shard() — if distributed; must be before shuffle 3. cache() — before shuffle to avoid redundant disk reads 4. shuffle() — after cache, before map and batch 5. map() — preprocessing with num_parallel_calls=AUTOTUNE 6. batch() — group into batches; drop_remainder for TPU 7. prefetch() — MUST be the LAST step; overlaps I/O with compute # Source: tf.data Performance Guide
- **performance → prefetch:** MUST call .prefetch(tf.data.AUTOTUNE) as the last pipeline step. Overlaps data loading with model compute; prevents GPU/TPU stall. Omitting prefetch can reduce throughput by 50–90% on I/O-bound workloads. # Source: tensorflow/python/data/experimental/ops/prefetch_op.py
- **performance → autotune:** Use tf.data.AUTOTUNE (value: -1) for: - num_parallel_calls in .map() - buffer_size in .prefetch() The runtime automatically tunes these values based on available hardware resources and observed throughput.
- **performance → caching:** SHOULD cache after expensive I/O or parsing operations: - .cache() — caches entire dataset in RAM after first epoch - .cache(filename) — caches to local disk, persists across Python sessions Do NOT cache after .shuffle() — this fixes the order and defeats randomness. Do NOT cache datasets that exceed available RAM. # Source: tensorflow/python/data/ops/cache_dataset_ops.py
- **performance → parallel_interleave:** For TFRecord or file-based datasets, use .interleave() with num_parallel_calls=AUTOTUNE to read multiple files in parallel instead of sequential file access.
- **shuffling → shuffle_correctness:** buffer_size MUST equal dataset size for perfectly uniform shuffling. Smaller buffer (e.g., 1000) gives approximate shuffle but saves memory. MUST shuffle BEFORE .batch() to randomize batch composition. Set reshuffle_each_iteration=True (default) for fresh order each epoch.
- **sharding → distributed_sharding:** When using MultiWorkerMirroredStrategy, each worker MUST shard the dataset: dataset.shard(num_replicas_in_sync, worker_index) Sharding must happen BEFORE shuffle and cache for correctness. # Source: tensorflow/python/distribute/input_lib.py
- **serialization → tfrecord_format:** TFRecord is the recommended format for datasets larger than RAM: - Binary encoding: faster than CSV/JSON parsing - Supports sharding across multiple files for parallel reads - Features encoded as tf.train.Feature: bytes_list (images, text), float_list, int64_list - MUST define a feature_description dict for tf.io.parse_single_example # Source: tensorflow/python/lib/io/tf_record.py
- **pytorch_dataloader → iterable_multiworker:** CRITICAL: IterableDataset with num_workers > 0 returns DUPLICATE data unless each worker independently partitions the data range. In __iter__, call get_worker_info() to get worker id and num_workers, then yield only the slice belonging to this worker. If using worker_init_fn for sharding instead, apply the same partition logic. # Source: torch/utils/data/dataset.py — IterableDataset docstring examples
- **pytorch_dataloader → map_vs_iterable:** Map-style Dataset (implements __len__ + __getitem__): - Supports random access by index - Compatible with all samplers (random, weighted, subset) - Required for DistributedSampler in DDP Iterable-style Dataset (implements __iter__): - Suited for streaming data (no known length) - shuffle=True on DataLoader is silently ignored — must shuffle internally - With num_workers > 0, MUST partition data manually per worker # Source: torch/utils/data/dataset.py — Dataset vs IterableDataset
- **pytorch_dataloader → pin_memory:** Enable pin_memory=True when transferring to CUDA devices. Pinned (page-locked) host memory allows async DMA transfers from the DataLoader workers to GPU, overlapping with compute. Do NOT enable for CPU-only training or MPS (Apple Silicon) — no benefit. # Source: torch/utils/data/dataloader.py — DataLoader docstring
- **pytorch_dataloader → num_workers:** num_workers=0 (default): data loaded in the main process. num_workers > 0: spawns subprocesses; requires all objects to be picklable. Guideline: start with num_workers = number of CPU cores / 2. persistent_workers=True avoids the per-epoch fork cost for large datasets. # Source: torch/utils/data/dataloader.py — DataLoader docstring
- **pytorch_dataloader → weighted_sampler:** Use WeightedRandomSampler to address class imbalance: - Provide a weight per sample (not per class) - replacement=True (default) allows re-sampling - num_samples controls epoch length regardless of dataset size Mutually exclusive with shuffle=True. # Source: torch/utils/data/sampler.py — WeightedRandomSampler

## Success & failure scenarios

**✅ Success paths**

- **Cache Written** — when cache_to_memory eq true; first epoch completed, then Dataset cached; subsequent epochs read from cache without I/O.
- **Epoch Exhausted** — when repeat_indefinitely eq false; iterator has yielded all batches for this epoch, then Iterator exhausted; reinitialize or call .repeat() before next epoch.
- **Pipeline Ready** — when source_type exists; batch_size gt 0; data source is accessible and contains at least one record, then tf.data.Dataset pipeline built; returns (features, labels) batches on iteration.

**❌ Failure paths**

- **Pipeline Failed Source Not Found** — when source_type in ["file_pattern","tfrecord","csv"]; source_path does not exist or glob pattern matches no files, then Pipeline not created; verify source_path and storage permissions. *(error: `PIPELINE_SOURCE_NOT_FOUND`)*
- **Pipeline Failed Shape Mismatch** — when dataset elements have inconsistent shapes across records; model input layer expects fixed static shape, then Pipeline rejected; pad sequences to max_length or use tf.RaggedTensor. *(error: `PIPELINE_SHAPE_MISMATCH`)*
- **Pipeline Failed Deserialization** — when source_type in ["tfrecord","csv"]; record cannot be parsed with the provided feature_description or schema, then Record skipped or pipeline failed; verify TFRecord schema matches writer. *(error: `PIPELINE_DESERIALIZATION_ERROR`)*

## Errors it can return

- `PIPELINE_SOURCE_NOT_FOUND` — Data source not found. Verify the file path or glob pattern.
- `PIPELINE_SHAPE_MISMATCH` — Dataset elements have inconsistent shapes. Use padding or ragged tensors.
- `PIPELINE_DESERIALIZATION_ERROR` — Failed to parse record. Verify TFRecord schema or CSV column definitions.
- `PIPELINE_OOM_ERROR` — Dataset cache exceeds available memory. Use .cache(filename) to cache to disk.

## Events

**`pipeline.created`**
  Payload: `source_type`, `batch_size`, `shuffle_buffer_size`, `prefetch_buffer_size`

**`pipeline.epoch_exhausted`**
  Payload: `batches_yielded`

**`pipeline.cache_written`**
  Payload: `cache_file_path`, `records_cached`

## Connects to

- **model-training** *(recommended)* — Supplies batched training data to model.fit()

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+4** since baseline (73 → 77)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/dataset-pipeline/) · **Spec source:** [`dataset-pipeline.blueprint.yaml`](./dataset-pipeline.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
