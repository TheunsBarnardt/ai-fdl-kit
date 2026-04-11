---
title: "Distributed Training Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed chec"
---

# Distributed Training Blueprint

> Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed checkpoint coordination

| | |
|---|---|
| **Feature** | `distributed-training` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | ai, distributed, machine-learning, pytorch, ddp, fsdp, multi-gpu |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/distributed-training.blueprint.yaml) |
| **JSON API** | [distributed-training.json]({{ site.baseurl }}/api/blueprints/ai/distributed-training.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ml_engineer` | ML Engineer | human | Configures distributed strategy, hardware topology, and training script |
| `rank_process` | Rank Process | system | One OS process per GPU; runs an identical copy of the training script |
| `rendezvous_backend` | Rendezvous Backend | system | Coordinates process discovery (env vars, TCP store, file store) |
| `communication_backend` | Communication Backend | system | Executes collective operations (NCCL for GPU, Gloo for CPU, MPI) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `backend` | select | Yes | Communication Backend |  |
| `init_method` | select | No | Process Group Initialization Method |  |
| `world_size` | number | Yes | World Size (total number of processes = num_nodes × GPUs_per_node) | Validations: min |
| `rank` | number | Yes | Global Rank of This Process (0 to world_size - 1) |  |
| `local_rank` | number | No | Local Rank Within Node (GPU index on this machine, set by torchrun) |  |
| `parallelism_strategy` | select | Yes | Parallelism Strategy |  |
| `fsdp_sharding_strategy` | select | No | FSDP Sharding Strategy |  |
| `find_unused_parameters` | boolean | No | DDP: Find Unused Parameters (enable if not all params receive gradients) |  |
| `gradient_as_bucket_view` | boolean | No | DDP: Gradient As Bucket View (reduces memory usage, default False) |  |
| `training_status` | select | No | Training Status |  |

## States

**State field:** `undefined`

## Rules

- **process_group:**
  - **initialization:** MUST call torch.distributed.init_process_group() before any collective
operations. Default init_method='env://' reads four environment variables:
  MASTER_ADDR — hostname or IP of rank 0
  MASTER_PORT — free TCP port on rank 0
  RANK        — global rank of this process
  WORLD_SIZE  — total number of processes
When using torchrun, these are set automatically.
# Source: torch/distributed/distributed_c10d.py:1622 — init_process_group

  - **nccl_exclusive_gpu:** NCCL MUST have exclusive access to each GPU.
Each rank process must own exactly one GPU (set via CUDA_VISIBLE_DEVICES
or torch.cuda.set_device(local_rank)).
Sharing a GPU between two NCCL processes causes deadlock or invalid usage.
# Source: torch/distributed/distributed_c10d.py:1622 — backend docstring

  - **backend_selection:** Backend auto-detection logic (since PyTorch 2.6):
  - device_id is CUDA → NCCL
  - device_id is CPU  → Gloo
  - No device_id and no backend → detects accelerator on runtime machine
Explicit recommendation:
  - GPU training: backend='nccl'
  - CPU-only or heterogeneous: backend='gloo'
  - HPC cluster: backend='mpi' (requires pre-installed MPI)
# Source: torch/distributed/distributed_c10d.py:1622 — backend docstring

  - **timeout:** Default timeout: 10 minutes for NCCL, 30 minutes for other backends.
On timeout, the collective is aborted asynchronously and the process crashes.
Because CUDA is async, it is unsafe to continue after a failed collective —
subsequent kernels may run on corrupted data.
# Source: torch/distributed/distributed_c10d.py:1622 — timeout docstring

- **ddp:**
  - **setup:** DDP wraps a model after it has been moved to the target device:
  model = model.to(device)
  model = DistributedDataParallel(model, device_ids=[local_rank])
All reduce of gradients happens automatically during backward pass
(averaged across world_size ranks).

  - **find_unused_parameters:** Set find_unused_parameters=True only when the model has parameters that
do not always receive gradients (conditional branches, optional layers).
It adds a graph traversal overhead on each forward pass — avoid when
all parameters are used every step.

  - **gradient_accumulation:** To accumulate gradients over N steps before syncing across GPUs:
  with model.no_sync():   # suppress all-reduce for N-1 steps
      loss.backward()
  loss.backward()         # all-reduce happens here (final step)
This reduces communication overhead for large effective batch sizes.

- **fsdp:**
  - **sharding_strategy:** FULL_SHARD (default): shards parameters, gradients, and optimizer state
  across all ranks. Maximizes memory savings; best for very large models.
SHARD_GRAD_OP: keeps full parameters during forward/backward; shards only
  optimizer state and gradients. Less memory saving, less communication.
HYBRID_SHARD: full shard within a node group, full replicas across nodes.
  Best for multi-node where inter-node bandwidth is limited.

  - **mixed_precision:** FSDP supports MixedPrecision policy to shard in lower precision:
  MixedPrecision(param_dtype=torch.float16,
                 reduce_dtype=torch.float32,   # reduce in fp32 for stability
                 buffer_dtype=torch.float16)
# Source: torch/distributed/fsdp/__init__.py — MixedPrecision

- **checkpointing:**
  - **rank_zero_save:** MUST save checkpoints on rank 0 only (or use FSDP distributed checkpoint API).
Pattern for DDP:
  if dist.get_rank() == 0:
      torch.save(model.module.state_dict(), path)
  dist.barrier()   # all ranks wait until rank 0 finishes writing
FSDP: use FSDP.state_dict_type() context to choose between full,
sharded, or local state dict formats before saving.

- **collectives:**
  - **all_reduce:** torch.distributed.all_reduce(tensor, op=ReduceOp.SUM) — reduce tensor
across all ranks and broadcast result to all (in-place).
Common ops: SUM (default), AVG, MAX, MIN, PRODUCT.
DDP uses all_reduce internally for gradient synchronization.

  - **barrier:** torch.distributed.barrier() — synchronization point; all ranks block
until every rank reaches the barrier. Use before/after checkpoint writes
and before reading data that rank 0 has written.
CAUTION: every rank must call barrier or it deadlocks.


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| rendezvous_timeout | 10m |  |
| nccl_collective_timeout | 10m |  |
| gloo_collective_timeout | 30m |  |

## Outcomes

### Rendezvous_timeout (Priority: 1) — Error: `DISTRIBUTED_RENDEZVOUS_TIMEOUT`

**Given:**
- not all world_size processes joined within the timeout window

**Then:**
- **transition_state** field: `training_status` from: `initializing` to: `failed`

**Result:** Process group not formed; verify all nodes are reachable and MASTER_ADDR/PORT are correct

### Nccl_error (Priority: 2) — Error: `DISTRIBUTED_NCCL_ERROR`

**Given:**
- `backend` (input) eq `nccl`
- NCCL collective operation failed or timed out

**Then:**
- **transition_state** field: `training_status` from: `running` to: `failed`

**Result:** Training aborted on all ranks; check NCCL logs, GPU exclusivity, and network connectivity

### Rank_oom (Priority: 2) — Error: `DISTRIBUTED_RANK_OOM`

**Given:**
- GPU memory exhausted on one or more ranks during forward or backward pass

**Then:**
- **transition_state** field: `training_status` from: `running` to: `failed`

**Result:** Reduce batch size, enable FSDP/gradient checkpointing, or use mixed precision

### Distributed_initialized (Priority: 10)

**Given:**
- all world_size processes have called init_process_group
- rendezvous completed within timeout
- `backend` (input) exists

**Then:**
- **transition_state** field: `training_status` from: `initializing` to: `running`
- **emit_event** event: `distributed.initialized`

**Result:** Process group ready; collective operations available on all ranks

### Training_completed_distributed (Priority: 10) | Transaction: atomic

**Given:**
- `training_status` (db) eq `running`
- all epochs completed without error on all ranks

**Then:**
- **transition_state** field: `training_status` from: `running` to: `completed`
- **emit_event** event: `training.completed`

**Result:** All ranks finished training; checkpoint saved by rank 0

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISTRIBUTED_RENDEZVOUS_TIMEOUT` | 503 | Distributed rendezvous timed out. Not all processes joined. Check network and configuration. | Yes |
| `DISTRIBUTED_NCCL_ERROR` | 500 | NCCL collective operation failed. Check GPU exclusivity and inter-GPU connectivity. | No |
| `DISTRIBUTED_RANK_OOM` | 500 | GPU out of memory on one or more ranks. Reduce batch size or enable model sharding. | Yes |
| `DISTRIBUTED_BARRIER_DEADLOCK` | 500 | Barrier deadlock — not all ranks reached the barrier. Check for conditional barrier calls. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `distributed.initialized` |  | `backend`, `world_size`, `rank`, `local_rank` |
| `distributed.checkpoint_saved` |  | `rank`, `checkpoint_path` |
| `training.completed` |  | `total_epochs`, `final_loss` |
| `distributed.rank_failed` |  | `rank`, `error_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| model-training | required | Distributed training wraps the single-device training loop |
| dataset-pipeline | required | DistributedSampler must be used to partition data across ranks |
| model-serving | recommended | Checkpoint saved by rank 0 is exported for serving |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Python
  framework: PyTorch Distributed (torch.distributed)
  launcher: torchrun (elastic launch) or mpirun
  patterns:
    - init_process_group with env:// via torchrun environment variables
    - "DistributedDataParallel: replicate on every GPU, all-reduce gradients"
    - "FSDP FULL_SHARD: shard params + grads + optimizer state"
    - FSDP2 fully_shard composable API (PyTorch 2.x)
    - DDP no_sync() for gradient accumulation without inter-GPU sync
    - Rank-0-only checkpoint save guarded by dist.barrier()
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Distributed Training Blueprint",
  "description": "Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed chec",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, distributed, machine-learning, pytorch, ddp, fsdp, multi-gpu"
}
</script>
