---
title: "Dataset Pipeline Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Build efficient input data pipelines for ML training and inference using tf.data with batching, shuffling, caching, prefetching, and parallel preprocessing. 13 "
---

# Dataset Pipeline Blueprint

> Build efficient input data pipelines for ML training and inference using tf.data with batching, shuffling, caching, prefetching, and parallel preprocessing

| | |
|---|---|
| **Feature** | `dataset-pipeline` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | ai, data-pipeline, preprocessing, tensorflow, etl, performance |
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
| `drop_remainder` | boolean | No | Drop Incomplete Final Batch |  |
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

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  framework: TensorFlow tf.data
  patterns:
    - tf.data.Dataset pipeline composition
    - AUTOTUNE buffer sizing
    - TFRecord binary format for large-scale datasets
    - Dataset sharding for distributed training
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dataset Pipeline Blueprint",
  "description": "Build efficient input data pipelines for ML training and inference using tf.data with batching, shuffling, caching, prefetching, and parallel preprocessing. 13 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, data-pipeline, preprocessing, tensorflow, etl, performance"
}
</script>
