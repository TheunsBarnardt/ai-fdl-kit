<!-- AUTO-GENERATED FROM dataset-pipeline.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dataset Pipeline

> Build efficient input data pipelines for ML training and inference using tf.data with batching, shuffling, caching, prefetching, and parallel preprocessing

**Category:** Ai · **Version:** 1.0.0 · **Tags:** ai · data-pipeline · preprocessing · tensorflow · etl · performance

## What this does

Build efficient input data pipelines for ML training and inference using tf.data with batching, shuffling, caching, prefetching, and parallel preprocessing

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
- **drop_remainder** *(boolean, optional)* — Drop Incomplete Final Batch
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

## Connects to

- **model-training** *(recommended)* — Supplies batched training data to model.fit()

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/dataset-pipeline/) · **Spec source:** [`dataset-pipeline.blueprint.yaml`](./dataset-pipeline.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
