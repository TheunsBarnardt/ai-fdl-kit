---
title: "Model Serving Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile). "
---

# Model Serving Blueprint

> Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile)

| | |
|---|---|
| **Feature** | `model-serving` |
| **Category** | Ai |
| **Version** | 1.1.0 |
| **Tags** | ai, serving, inference, savedmodel, deployment, versioning, pytorch, onnx |
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
| `onnx_opset_version` | number | No | ONNX Opset Version (e.g. 17; higher = newer ops) |  |
| `onnx_dynamic_shapes` | json | No | ONNX Dynamic Shape Axes (e.g. {"input": {0: "batch", 2: "height"}}) |  |
| `onnx_external_data` | boolean | No | ONNX: Store Weights as External Data Files (required for models >2GB) |  |
| `compile_backend` | select | No | torch.compile Backend |  |
| `compile_mode` | select | No | torch.compile Mode |  |
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

- **pytorch_export:**
  - **export_hierarchy:** PyTorch 2.x export priority (most to least recommended):
  1. torch.export.export() → ExportedProgram
       - Full graph capture with symbolic shapes
       - Suitable for AOT compilation and deployment
       - Accepts dynamic_shapes dict for variable dimensions
  2. torch.onnx.export(..., dynamo=True) — default since PyTorch 2.x
       - Builds on torch.export internally
       - Supports external_data=True for models > 2GB
       - Use dynamic_shapes for variable batch/sequence dims
  3. torch.compile() — JIT compilation at runtime
       - No offline export artifact; model must be Python-accessible
       - inductor backend generates Triton CUDA kernels
  4. TorchScript (torch.jit.script / trace) — DEPRECATED in PyTorch 2.5
       - Use torch.compile as a drop-in replacement
# Source: torch/jit/__init__.py — annotate() deprecation note
#          torch/onnx/__init__.py — export() dynamo=True default

  - **inference_modes:** MUST call model.eval() before inference to disable Dropout and
batch norm running-stat updates. Three no-gradient context options:
  - torch.no_grad()          — disables gradient tracking (most compatible)
  - torch.inference_mode()   — stricter; also disables view tracking,
                               slightly faster than no_grad
Use inference_mode for pure inference; use no_grad when you need
tensor operations that create views after the inference block.
# Source: torch/jit/__init__.py — optimize_for_inference

  - **onnx_opset:** Choose opset_version based on deployment target:
  - opset 9–11: maximum compatibility (older runtimes, mobile)
  - opset 17+: latest ops, required for newer model architectures
dynamic_shapes (dict) overrides static shapes captured during export,
enabling variable batch size or sequence length at runtime.
# Source: torch/onnx/__init__.py — export() dynamic_shapes parameter

  - **torchscript_deprecation:** TorchScript (torch.jit.script and torch.jit.trace) is deprecated
as of PyTorch 2.5. Existing TorchScript models continue to work
but new code should use torch.compile or torch.export instead.
# Source: torch/jit/__init__.py — annotate() docstring: "deprecated since 2.5"

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

## AGI Readiness

### Goals

#### Reliable Model Serving

Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile)

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `model_training` | model-training | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| model_loaded | `autonomous` | - | - |
| model_serving_ready | `autonomous` | - | - |
| inference_succeeded | `autonomous` | - | - |
| inference_failed_shape_mismatch | `autonomous` | - | - |
| model_not_found | `autonomous` | - | - |
| model_load_failed | `autonomous` | - | - |
| inference_timeout | `autonomous` | - | - |
| max_batch_exceeded | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  frameworks:
    - TensorFlow SavedModel + TF Serving
    - PyTorch — torch.export, torch.onnx (dynamo), torch.compile
  patterns:
    - TF SavedModel versioned directory structure with zero-downtime rollback
    - TF Serving batching + warmup assets for JIT pre-compilation
    - PyTorch torch.export → ExportedProgram (preferred 2.x export)
    - PyTorch ONNX export with dynamo=True + dynamic_shapes
    - torch.compile(backend='inductor') for runtime graph optimization
    - model.eval() + torch.inference_mode() for pure inference
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Model Serving Blueprint",
  "description": "Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile). ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, serving, inference, savedmodel, deployment, versioning, pytorch, onnx"
}
</script>
