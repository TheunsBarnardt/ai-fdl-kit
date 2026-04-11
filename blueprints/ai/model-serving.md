<!-- AUTO-GENERATED FROM model-serving.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Model Serving

> Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile)

**Category:** Ai · **Version:** 1.1.0 · **Tags:** ai · serving · inference · savedmodel · deployment · versioning · pytorch · onnx

## What this does

Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile)

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **model_path** *(text, required)* — Model Base Directory (e.g. /models/classifier)
- **model_version** *(text, required)* — Model Version (integer string, e.g. '3')
- **export_format** *(select, required)* — Export Format
- **onnx_opset_version** *(number, optional)* — ONNX Opset Version (e.g. 17; higher = newer ops)
- **onnx_dynamic_shapes** *(json, optional)* — ONNX Dynamic Shape Axes (e.g. {"input": {0: "batch", 2: "height"}})
- **onnx_external_data** *(boolean, optional)* — ONNX: Store Weights as External Data Files (required for models >2GB)
- **compile_backend** *(select, optional)* — torch.compile Backend
- **compile_mode** *(select, optional)* — torch.compile Mode
- **serving_status** *(select, optional)* — Serving Status
- **input_dtype** *(text, optional)* — Input Tensor Dtype (e.g. float32)
- **input_shape** *(json, optional)* — Input Tensor Shape (e.g. [null, 224, 224, 3])
- **output_dtype** *(text, optional)* — Output Tensor Dtype (e.g. float32)
- **output_shape** *(json, optional)* — Output Tensor Shape (e.g. [null, 1000])
- **max_batch_size** *(number, optional)* — Max Request Batch Size
- **timeout_ms** *(number, optional)* — Inference Timeout (milliseconds)
- **warmup_requests** *(number, optional)* — Warmup Inference Calls After Load (pre-compile TF ops)

## What must be true

- **export → saved_model_format:** MUST export as SavedModel format (not .h5) for production serving: - Bundles computation graph, weights, and serving signatures together - Compatible with TF Serving (REST + gRPC), TF.js, and TFLite conversion - Version directory structure: {model_path}/{version}/saved_model.pb Use: tf.saved_model.save(model, path) or model.save(path) # Source: tensorflow/python/saved_model/save.py
- **export → input_signatures:** MUST define explicit tf.TensorSpec input signatures when exporting: - Without signatures the model cannot be served via TF Serving REST/gRPC - Use @tf.function(input_signature=[...]) or signatures parameter in save() - Signatures name the serving endpoint (default: 'serving_default') # Source: tensorflow/python/framework/tensor_spec.py
- **export → tflite_quantization:** When exporting to TFLite for edge deployment: - SHOULD apply post-training quantization (float16 or int8) to reduce model size and improve latency on mobile CPUs and DSPs - Dynamic range quantization: 2-4x size reduction, minimal accuracy loss - Full integer quantization: requires representative_dataset callable # Source: tensorflow/lite/python/lite.py
- **versioning → directory_structure:** MUST use sequential integer version directories: {model_path}/1/saved_model.pb {model_path}/2/saved_model.pb TF Serving auto-discovers new versions by scanning model_path at intervals. Higher version number = newer; server loads the highest available version. # Source: tensorflow_serving/core/aspired_versions_manager.cc
- **versioning → rollback:** SHOULD retain the previous version when deploying a new one. If the new version causes errors or regressions: - Remove (or hide) the new version directory - TF Serving automatically falls back to the previous highest version Immediate rollback without restart — zero-downtime deployment.
- **versioning → version_policy:** Configure TF Serving version_policy to control how many versions are kept: - latest: keep only the newest version (default) - specific: pin to an exact version number - all: keep all available versions (useful for A/B testing)
- **inference → input_validation:** MUST validate input tensor dtype and shape against input_signature before executing inference. Return INFERENCE_SHAPE_MISMATCH (400) if inputs are incompatible; do not allow TF to raise a C++ error.
- **inference → batching:** SHOULD configure TF Serving's built-in batching for throughput: - Groups concurrent requests into a single forward pass - max_batch_size: limits GPU memory usage per batch - batch_timeout_micros: max wait time before dispatching partial batch - Use batching_parameters_file to pass config to TF Serving Never accept requests with batch size > max_batch_size.
- **inference → warmup:** SHOULD run warmup_requests dummy inferences after model loads: - JIT-compiles TensorFlow XLA ops (first real call would be slow) - Pre-allocates GPU memory to avoid latency spike on first request - TF Serving supports SavedModel warmup assets: assets.extra/tf_serving_warmup_requests (WarmupData proto) # Source: tensorflow_serving/servables/tensorflow/saved_model_warmup.cc
- **pytorch_export → export_hierarchy:** PyTorch 2.x export priority (most to least recommended): 1. torch.export.export() → ExportedProgram - Full graph capture with symbolic shapes - Suitable for AOT compilation and deployment - Accepts dynamic_shapes dict for variable dimensions 2. torch.onnx.export(..., dynamo=True) — default since PyTorch 2.x - Builds on torch.export internally - Supports external_data=True for models > 2GB - Use dynamic_shapes for variable batch/sequence dims 3. torch.compile() — JIT compilation at runtime - No offline export artifact; model must be Python-accessible - inductor backend generates Triton CUDA kernels 4. TorchScript (torch.jit.script / trace) — DEPRECATED in PyTorch 2.5 - Use torch.compile as a drop-in replacement # Source: torch/jit/__init__.py — annotate() deprecation note # torch/onnx/__init__.py — export() dynamo=True default
- **pytorch_export → inference_modes:** MUST call model.eval() before inference to disable Dropout and batch norm running-stat updates. Three no-gradient context options: - torch.no_grad() — disables gradient tracking (most compatible) - torch.inference_mode() — stricter; also disables view tracking, slightly faster than no_grad Use inference_mode for pure inference; use no_grad when you need tensor operations that create views after the inference block. # Source: torch/jit/__init__.py — optimize_for_inference
- **pytorch_export → onnx_opset:** Choose opset_version based on deployment target: - opset 9–11: maximum compatibility (older runtimes, mobile) - opset 17+: latest ops, required for newer model architectures dynamic_shapes (dict) overrides static shapes captured during export, enabling variable batch size or sequence length at runtime. # Source: torch/onnx/__init__.py — export() dynamic_shapes parameter
- **pytorch_export → torchscript_deprecation:** TorchScript (torch.jit.script and torch.jit.trace) is deprecated as of PyTorch 2.5. Existing TorchScript models continue to work but new code should use torch.compile or torch.export instead. # Source: torch/jit/__init__.py — annotate() docstring: "deprecated since 2.5"
- **security → model_integrity:** SHOULD verify model checksum after loading to detect corruption. Do NOT load models from untrusted sources without integrity verification. Model weights can contain malicious operations via custom ops.

## Success & failure scenarios

**✅ Success paths**

- **Model Loaded** — when model_path exists; SavedModel directory exists at {model_path}/{model_version}/; saved_model.pb file is present and parseable, then Model computation graph and weights loaded into serving runtime memory.
- **Model Serving Ready** — when serving_status eq "loaded"; warmup_requests completed without error, then Model serving endpoint active; accepting inference requests.
- **Inference Succeeded** — when serving_status eq "serving"; request input dtype matches input_dtype; request input shape is compatible with input_shape; max_batch_size exists; request batch size is within max_batch_size, then Predictions returned in output tensor with shape and dtype matching output_signature.

**❌ Failure paths**

- **Inference Failed Shape Mismatch** — when request input shape or dtype does not match input_signature, then Request rejected; client must reshape or cast inputs to match the model signature. *(error: `INFERENCE_SHAPE_MISMATCH`)*
- **Max Batch Exceeded** — when max_batch_size exists; request batch size exceeds max_batch_size, then Request rejected; split into smaller batches not exceeding max_batch_size. *(error: `MAX_BATCH_EXCEEDED`)*
- **Model Not Found** — when model_path exists; directory {model_path}/{model_version}/ does not exist, then Load failed; verify model_path and model_version are correct. *(error: `MODEL_NOT_FOUND`)*
- **Model Load Failed** — when saved_model.pb exists but cannot be parsed or is corrupted, then Load aborted; file may be corrupt or from an incompatible TF version. *(error: `MODEL_LOAD_FAILED`)*
- **Inference Timeout** — when timeout_ms exists; inference duration exceeded timeout_ms, then Request timed out; reduce input size, increase timeout_ms, or scale serving replicas. *(error: `INFERENCE_TIMEOUT`)*

## Errors it can return

- `MODEL_NOT_FOUND` — Model not found at the specified path and version.
- `MODEL_LOAD_FAILED` — Failed to load model. File may be corrupted or from an incompatible TensorFlow version.
- `INFERENCE_SHAPE_MISMATCH` — Input tensor shape or dtype does not match the model's serving signature.
- `INFERENCE_TIMEOUT` — Inference exceeded the configured timeout. Reduce input size or increase timeout.
- `MAX_BATCH_EXCEEDED` — Request batch size exceeds the configured maximum.

## Connects to

- **model-training** *(required)* — Consumes SavedModel checkpoint exported by the training workflow
- **dataset-pipeline** *(optional)* — Batch inference can reuse tf.data pipelines for preprocessing

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/model-serving/) · **Spec source:** [`model-serving.blueprint.yaml`](./model-serving.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
