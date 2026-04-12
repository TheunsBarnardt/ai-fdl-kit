---
title: "Dataset Pipeline Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process worke"
---

# Dataset Pipeline Blueprint

> Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process workers, samplers, collate) patterns

| | |
|---|---|
| **Feature** | `dataset-pipeline` |
| **Category** | Ai |
| **Version** | 1.1.0 |
| **Tags** | ai, data-pipeline, preprocessing, pytorch, tensorflow, etl, performance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/dataset-pipeline.blueprint.yaml) |
| **JSON API** | [dataset-pipeline.json]({{ site.baseurl }}/api/blueprints/ai/dataset-pipeline.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_engineer` | Data Engineer | human | Designs and tunes the data pipeline for a given dataset |
| `pipeline_runtime` | Pipeline Runtime | system | Executes tf.data graph operations during training or inference |
| `storage_backend` | Storage Backend | system | File system, object store, or in-memory tensor source |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `source_type` | select | Yes | Data Source Type |  |
| `source_path` | text | No | Source File Path or Glob Pattern |  |
| `batch_size` | number | Yes | Batch Size | Validations: min |
| `shuffle_buffer_size` | number | No | Shuffle Buffer Size (use dataset size for perfect shuffle; -1 for AUTOTUNE) |  |
| `prefetch_buffer_size` | number | No | Prefetch Buffer Size (-1 = AUTOTUNE, recommended) |  |
| `num_parallel_calls` | number | No | Parallel map() Calls (-1 = AUTOTUNE) |  |
| `cache_to_memory` | boolean | No | Cache Dataset in RAM After First Epoch |  |
| `cache_file_path` | text | No | Cache to File Path (persists across runs; leave empty for RAM cache) |  |
| `repeat_indefinitely` | boolean | No | Repeat Dataset Indefinitely (use with steps_per_epoch) |  |
| `drop_remainder` | boolean | No | Drop Incomplete Final Batch (PyTorch: drop_last; required for TPU fixed shapes) |  |
| `num_workers` | number | No | PyTorch: Number of Worker Subprocesses (0 = main process only, default) |  |
| `pin_memory` | boolean | No | PyTorch: Pin Host Memory for Faster GPU Transfer (enable when using CUDA) |  |
| `persistent_workers` | boolean | No | PyTorch: Keep Workers Alive Between Epochs (avoids fork overhead) |  |
| `prefetch_factor` | number | No | PyTorch: Batches Prefetched per Worker (default 2 when num_workers > 0) |  |
| `worker_timeout_s` | number | No | PyTorch: Timeout in Seconds for Collecting a Batch from Workers (0 = no timeout) |  |
| `sampler_type` | select | No | PyTorch: Sampler Strategy |  |
| `compression_type` | select | No | Source File Compression |  |
| `num_shards` | number | No | Number of Shards (for distributed training) |  |
| `shard_index` | number | No | This Worker's Shard Index (0-based) |  |

## Rules

- **pipeline_ordering:**
  - **operation_order:** The recommended tf.data pipeline operation order:
1. Load source  — from_tensor_slices(), TFRecordDataset(), etc.
2. shard()      — if distributed; must be before shuffle
3. cache()      — before shuffle to avoid redundant disk reads
4. shuffle()    — after cache, before map and batch
5. map()        — preprocessing with num_parallel_calls=AUTOTUNE
6. batch()      — group into batches; drop_remainder for TPU
7. prefetch()   — MUST be the LAST step; overlaps I/O with compute
# Source: tf.data Performance Guide

- **performance:**
  - **prefetch:** MUST call .prefetch(tf.data.AUTOTUNE) as the last pipeline step.
Overlaps data loading with model compute; prevents GPU/TPU stall.
Omitting prefetch can reduce throughput by 50–90% on I/O-bound workloads.
# Source: tensorflow/python/data/experimental/ops/prefetch_op.py

  - **autotune:** Use tf.data.AUTOTUNE (value: -1) for:
- num_parallel_calls in .map()
- buffer_size in .prefetch()
The runtime automatically tunes these values based on available
hardware resources and observed throughput.

  - **caching:** SHOULD cache after expensive I/O or parsing operations:
- .cache()             — caches entire dataset in RAM after first epoch
- .cache(filename)     — caches to local disk, persists across Python sessions
Do NOT cache after .shuffle() — this fixes the order and defeats randomness.
Do NOT cache datasets that exceed available RAM.
# Source: tensorflow/python/data/ops/cache_dataset_ops.py

  - **parallel_interleave:** For TFRecord or file-based datasets, use .interleave() with
num_parallel_calls=AUTOTUNE to read multiple files in parallel
instead of sequential file access.

- **shuffling:**
  - **shuffle_correctness:** buffer_size MUST equal dataset size for perfectly uniform shuffling.
Smaller buffer (e.g., 1000) gives approximate shuffle but saves memory.
MUST shuffle BEFORE .batch() to randomize batch composition.
Set reshuffle_each_iteration=True (default) for fresh order each epoch.

- **sharding:**
  - **distributed_sharding:** When using MultiWorkerMirroredStrategy, each worker MUST shard the dataset:
dataset.shard(num_replicas_in_sync, worker_index)
Sharding must happen BEFORE shuffle and cache for correctness.
# Source: tensorflow/python/distribute/input_lib.py

- **serialization:**
  - **tfrecord_format:** TFRecord is the recommended format for datasets larger than RAM:
- Binary encoding: faster than CSV/JSON parsing
- Supports sharding across multiple files for parallel reads
- Features encoded as tf.train.Feature:
    bytes_list (images, text), float_list, int64_list
- MUST define a feature_description dict for tf.io.parse_single_example
# Source: tensorflow/python/lib/io/tf_record.py

- **pytorch_dataloader:**
  - **iterable_multiworker:** CRITICAL: IterableDataset with num_workers > 0 returns DUPLICATE data
unless each worker independently partitions the data range.
In __iter__, call get_worker_info() to get worker id and num_workers,
then yield only the slice belonging to this worker.
If using worker_init_fn for sharding instead, apply the same partition logic.
# Source: torch/utils/data/dataset.py — IterableDataset docstring examples

  - **map_vs_iterable:** Map-style Dataset (implements __len__ + __getitem__):
  - Supports random access by index
  - Compatible with all samplers (random, weighted, subset)
  - Required for DistributedSampler in DDP
Iterable-style Dataset (implements __iter__):
  - Suited for streaming data (no known length)
  - shuffle=True on DataLoader is silently ignored — must shuffle internally
  - With num_workers > 0, MUST partition data manually per worker
# Source: torch/utils/data/dataset.py — Dataset vs IterableDataset

  - **pin_memory:** Enable pin_memory=True when transferring to CUDA devices.
Pinned (page-locked) host memory allows async DMA transfers from the
DataLoader workers to GPU, overlapping with compute.
Do NOT enable for CPU-only training or MPS (Apple Silicon) — no benefit.
# Source: torch/utils/data/dataloader.py — DataLoader docstring

  - **num_workers:** num_workers=0 (default): data loaded in the main process.
num_workers > 0: spawns subprocesses; requires all objects to be picklable.
Guideline: start with num_workers = number of CPU cores / 2.
persistent_workers=True avoids the per-epoch fork cost for large datasets.
# Source: torch/utils/data/dataloader.py — DataLoader docstring

  - **weighted_sampler:** Use WeightedRandomSampler to address class imbalance:
  - Provide a weight per sample (not per class)
  - replacement=True (default) allows re-sampling
  - num_samples controls epoch length regardless of dataset size
Mutually exclusive with shuffle=True.
# Source: torch/utils/data/sampler.py — WeightedRandomSampler


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| batch_latency |  |  |

## Outcomes

### Pipeline_failed_source_not_found (Priority: 1) — Error: `PIPELINE_SOURCE_NOT_FOUND`

**Given:**
- `source_type` (input) in `file_pattern,tfrecord,csv`
- source_path does not exist or glob pattern matches no files

**Result:** Pipeline not created; verify source_path and storage permissions

### Pipeline_failed_shape_mismatch (Priority: 2) — Error: `PIPELINE_SHAPE_MISMATCH`

**Given:**
- dataset elements have inconsistent shapes across records
- model input layer expects fixed static shape

**Result:** Pipeline rejected; pad sequences to max_length or use tf.RaggedTensor

### Pipeline_failed_deserialization (Priority: 2) — Error: `PIPELINE_DESERIALIZATION_ERROR`

**Given:**
- `source_type` (input) in `tfrecord,csv`
- record cannot be parsed with the provided feature_description or schema

**Result:** Record skipped or pipeline failed; verify TFRecord schema matches writer

### Cache_written (Priority: 7)

**Given:**
- `cache_to_memory` (input) eq `true`
- first epoch completed

**Then:**
- **emit_event** event: `pipeline.cache_written`

**Result:** Dataset cached; subsequent epochs read from cache without I/O

### Epoch_exhausted (Priority: 8)

**Given:**
- `repeat_indefinitely` (input) eq `false`
- iterator has yielded all batches for this epoch

**Then:**
- **emit_event** event: `pipeline.epoch_exhausted`

**Result:** Iterator exhausted; reinitialize or call .repeat() before next epoch

### Pipeline_ready (Priority: 10)

**Given:**
- `source_type` (input) exists
- `batch_size` (input) gt `0`
- data source is accessible and contains at least one record

**Then:**
- **emit_event** event: `pipeline.created`

**Result:** tf.data.Dataset pipeline built; returns (features, labels) batches on iteration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PIPELINE_SOURCE_NOT_FOUND` | 404 | Data source not found. Verify the file path or glob pattern. | No |
| `PIPELINE_SHAPE_MISMATCH` | 400 | Dataset elements have inconsistent shapes. Use padding or ragged tensors. | No |
| `PIPELINE_DESERIALIZATION_ERROR` | 400 | Failed to parse record. Verify TFRecord schema or CSV column definitions. | No |
| `PIPELINE_OOM_ERROR` | 500 | Dataset cache exceeds available memory. Use .cache(filename) to cache to disk. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pipeline.created` |  | `source_type`, `batch_size`, `shuffle_buffer_size`, `prefetch_buffer_size` |
| `pipeline.epoch_exhausted` |  | `batches_yielded` |
| `pipeline.cache_written` |  | `cache_file_path`, `records_cached` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| model-training | recommended | Supplies batched training data to model.fit() |

## AGI Readiness

### Goals

#### Reliable Dataset Pipeline

Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process workers, samplers, collate) patterns

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `fully_autonomous`

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
| safety | capability | AI systems must operate within defined safety boundaries |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| pipeline_ready | `autonomous` | - | - |
| pipeline_failed_source_not_found | `autonomous` | - | - |
| pipeline_failed_shape_mismatch | `autonomous` | - | - |
| pipeline_failed_deserialization | `autonomous` | - | - |
| epoch_exhausted | `autonomous` | - | - |
| cache_written | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  frameworks:
    - TensorFlow tf.data — pipeline composition, AUTOTUNE, TFRecord, caching
    - PyTorch DataLoader — multi-process workers, pin_memory, samplers,
      collate_fn
  patterns:
    - "tf.data: cache → shuffle → map(AUTOTUNE) → batch → prefetch(AUTOTUNE)"
    - "PyTorch: DataLoader with num_workers + persistent_workers for throughput"
    - "PyTorch IterableDataset: manually partition data per worker via
      get_worker_info()"
    - PyTorch WeightedRandomSampler for class imbalance
    - DistributedSampler for DDP / multi-process distributed training
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dataset Pipeline Blueprint",
  "description": "Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process worke",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, data-pipeline, preprocessing, pytorch, tensorflow, etl, performance"
}
</script>
