---
title: "Model Serving Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Export trained ML models in SavedModel format, version them for rollback, load them into a serving runtime, and execute real-time or batch inference via REST or"
---

# Model Serving Blueprint

> Export trained ML models in SavedModel format, version them for rollback, load them into a serving runtime, and execute real-time or batch inference via REST or gRPC

| | |
|---|---|
| **Feature** | `model-serving` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | ai, serving, inference, savedmodel, deployment, versioning |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/model-serving.blueprint.yaml) |
| **JSON API** | [model-serving.json]({{ site.baseurl }}/api/blueprints/ai/model-serving.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ml_engineer` | ML Engineer | human | Exports, versions, and deploys trained model checkpoints |
| `serving_runtime` | Serving Runtime | system | Loads model and executes inference requests (TF Serving, in-process, etc.) |
| `client_application` | Client Application | external | Calls the inference endpoint and consumes predictions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_path` | text | Yes | Model Base Directory (e.g. /models/classifier) |  |
| `model_version` | text | Yes | Model Version (integer string, e.g. '3') |  |
| `export_format` | select | Yes | Export Format |  |
| `serving_status` | select | No | Serving Status |  |
| `input_dtype` | text | No | Input Tensor Dtype (e.g. float32) |  |
| `input_shape` | json | No | Input Tensor Shape (e.g. [null, 224, 224, 3]) |  |
| `output_dtype` | text | No | Output Tensor Dtype (e.g. float32) |  |
| `output_shape` | json | No | Output Tensor Shape (e.g. [null, 1000]) |  |
| `max_batch_size` | number | No | Max Request Batch Size |  |
| `timeout_ms` | number | No | Inference Timeout (milliseconds) |  |
| `warmup_requests` | number | No | Warmup Inference Calls After Load (pre-compile TF ops) |  |

## States

**State field:** `undefined`

## Rules

- **export:**
  - **saved_model_format:** MUST export as SavedModel format (not .h5) for production serving:
- Bundles computation graph, weights, and serving signatures together
- Compatible with TF Serving (REST + gRPC), TF.js, and TFLite conversion
- Version directory structure: {model_path}/{version}/saved_model.pb
Use: tf.saved_model.save(model, path) or model.save(path)
# Source: tensorflow/python/saved_model/save.py

  - **input_signatures:** MUST define explicit tf.TensorSpec input signatures when exporting:
- Without signatures the model cannot be served via TF Serving REST/gRPC
- Use @tf.function(input_signature=[...]) or signatures parameter in save()
- Signatures name the serving endpoint (default: 'serving_default')
# Source: tensorflow/python/framework/tensor_spec.py

  - **tflite_quantization:** When exporting to TFLite for edge deployment:
- SHOULD apply post-training quantization (float16 or int8) to reduce
  model size and improve latency on mobile CPUs and DSPs
- Dynamic range quantization: 2-4x size reduction, minimal accuracy loss
- Full integer quantization: requires representative_dataset callable
# Source: tensorflow/lite/python/lite.py

- **versioning:**
  - **directory_structure:** MUST use sequential integer version directories:
{model_path}/1/saved_model.pb
{model_path}/2/saved_model.pb
TF Serving auto-discovers new versions by scanning model_path at intervals.
Higher version number = newer; server loads the highest available version.
# Source: tensorflow_serving/core/aspired_versions_manager.cc

  - **rollback:** SHOULD retain the previous version when deploying a new one.
If the new version causes errors or regressions:
- Remove (or hide) the new version directory
- TF Serving automatically falls back to the previous highest version
Immediate rollback without restart — zero-downtime deployment.

  - **version_policy:** Configure TF Serving version_policy to control how many versions are kept:
- latest: keep only the newest version (default)
- specific: pin to an exact version number
- all: keep all available versions (useful for A/B testing)

- **inference:**
  - **input_validation:** MUST validate input tensor dtype and shape against input_signature
before executing inference. Return INFERENCE_SHAPE_MISMATCH (400)
if inputs are incompatible; do not allow TF to raise a C++ error.

  - **batching:** SHOULD configure TF Serving's built-in batching for throughput:
- Groups concurrent requests into a single forward pass
- max_batch_size: limits GPU memory usage per batch
- batch_timeout_micros: max wait time before dispatching partial batch
- Use batching_parameters_file to pass config to TF Serving
Never accept requests with batch size > max_batch_size.

  - **warmup:** SHOULD run warmup_requests dummy inferences after model loads:
- JIT-compiles TensorFlow XLA ops (first real call would be slow)
- Pre-allocates GPU memory to avoid latency spike on first request
- TF Serving supports SavedModel warmup assets:
    assets.extra/tf_serving_warmup_requests (WarmupData proto)
# Source: tensorflow_serving/servables/tensorflow/saved_model_warmup.cc

- **security:**
  - **model_integrity:** SHOULD verify model checksum after loading to detect corruption.
Do NOT load models from untrusted sources without integrity verification.
Model weights can contain malicious operations via custom ops.


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| inference_latency |  |  |
| model_load_time | 30s |  |
| warmup_time | 60s |  |

## Outcomes

### Inference_failed_shape_mismatch (Priority: 1) — Error: `INFERENCE_SHAPE_MISMATCH`

**Given:**
- request input shape or dtype does not match input_signature

**Result:** Request rejected; client must reshape or cast inputs to match the model signature

### Max_batch_exceeded (Priority: 1) — Error: `MAX_BATCH_EXCEEDED`

**Given:**
- `max_batch_size` (system) exists
- request batch size exceeds max_batch_size

**Result:** Request rejected; split into smaller batches not exceeding max_batch_size

### Model_not_found (Priority: 2) — Error: `MODEL_NOT_FOUND`

**Given:**
- `model_path` (input) exists
- directory {model_path}/{model_version}/ does not exist

**Result:** Load failed; verify model_path and model_version are correct

### Model_load_failed (Priority: 2) — Error: `MODEL_LOAD_FAILED`

**Given:**
- saved_model.pb exists but cannot be parsed or is corrupted

**Then:**
- **transition_state** field: `serving_status` from: `loading` to: `unloaded`

**Result:** Load aborted; file may be corrupt or from an incompatible TF version

### Inference_timeout (Priority: 3) — Error: `INFERENCE_TIMEOUT`

**Given:**
- `timeout_ms` (system) exists
- inference duration exceeded timeout_ms

**Result:** Request timed out; reduce input size, increase timeout_ms, or scale serving replicas

### Model_loaded (Priority: 5)

**Given:**
- `model_path` (input) exists
- SavedModel directory exists at {model_path}/{model_version}/
- saved_model.pb file is present and parseable

**Then:**
- **transition_state** field: `serving_status` from: `loading` to: `loaded`
- **emit_event** event: `model.loaded`

**Result:** Model computation graph and weights loaded into serving runtime memory

### Model_serving_ready (Priority: 6)

**Given:**
- `serving_status` (db) eq `loaded`
- warmup_requests completed without error

**Then:**
- **transition_state** field: `serving_status` from: `loaded` to: `serving`
- **emit_event** event: `model.ready`

**Result:** Model serving endpoint active; accepting inference requests

### Inference_succeeded (Priority: 10)

**Given:**
- `serving_status` (db) eq `serving`
- request input dtype matches input_dtype
- request input shape is compatible with input_shape
- `max_batch_size` (system) exists
- request batch size is within max_batch_size

**Then:**
- **emit_event** event: `model.inference_completed`

**Result:** Predictions returned in output tensor with shape and dtype matching output_signature

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MODEL_NOT_FOUND` | 404 | Model not found at the specified path and version. | No |
| `MODEL_LOAD_FAILED` | 500 | Failed to load model. File may be corrupted or from an incompatible TensorFlow version. | Yes |
| `INFERENCE_SHAPE_MISMATCH` | 400 | Input tensor shape or dtype does not match the model's serving signature. | No |
| `INFERENCE_TIMEOUT` | 503 | Inference exceeded the configured timeout. Reduce input size or increase timeout. | Yes |
| `MAX_BATCH_EXCEEDED` | 400 | Request batch size exceeds the configured maximum. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `model.loaded` |  | `model_path`, `model_version` |
| `model.ready` |  | `model_version`, `warmup_requests` |
| `model.inference_completed` |  | `model_version`, `batch_size`, `inference_latency_ms` |
| `model.unloaded` |  | `model_path`, `model_version` |
| `model.deprecated` |  | `model_version`, `replacement_version` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| model-training | required | Consumes SavedModel checkpoint exported by the training workflow |
| dataset-pipeline | optional | Batch inference can reuse tf.data pipelines for preprocessing |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  framework: TensorFlow SavedModel + TF Serving
  patterns:
    - SavedModel versioned directory structure
    - tf.TensorSpec input/output signatures
    - TF Serving batching configuration
    - Zero-downtime rolling version deployment
    - SavedModel warmup assets for JIT pre-compilation
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Model Serving Blueprint",
  "description": "Export trained ML models in SavedModel format, version them for rollback, load them into a serving runtime, and execute real-time or batch inference via REST or",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, serving, inference, savedmodel, deployment, versioning"
}
</script>
