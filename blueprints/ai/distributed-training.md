<!-- AUTO-GENERATED FROM distributed-training.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Distributed Training

> Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed checkpoint coordination

**Category:** Ai · **Version:** 1.0.0 · **Tags:** ai · distributed · machine-learning · pytorch · ddp · fsdp · multi-gpu

## What this does

Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed checkpoint coordination

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **backend** *(select, required)* — Communication Backend
- **init_method** *(select, optional)* — Process Group Initialization Method
- **world_size** *(number, required)* — World Size (total number of processes = num_nodes × GPUs_per_node)
- **rank** *(number, required)* — Global Rank of This Process (0 to world_size - 1)
- **local_rank** *(number, optional)* — Local Rank Within Node (GPU index on this machine, set by torchrun)
- **parallelism_strategy** *(select, required)* — Parallelism Strategy
- **fsdp_sharding_strategy** *(select, optional)* — FSDP Sharding Strategy
- **find_unused_parameters** *(boolean, optional)* — DDP: Find Unused Parameters (enable if not all params receive gradients)
- **gradient_as_bucket_view** *(boolean, optional)* — DDP: Gradient As Bucket View (reduces memory usage, default False)
- **training_status** *(select, optional)* — Training Status

## What must be true

- **process_group → initialization:** MUST call torch.distributed.init_process_group() before any collective operations. Default init_method='env://' reads four environment variables: MASTER_ADDR — hostname or IP of rank 0 MASTER_PORT — free TCP port on rank 0 RANK — global rank of this process WORLD_SIZE — total number of processes When using torchrun, these are set automatically. # Source: torch/distributed/distributed_c10d.py:1622 — init_process_group
- **process_group → nccl_exclusive_gpu:** NCCL MUST have exclusive access to each GPU. Each rank process must own exactly one GPU (set via CUDA_VISIBLE_DEVICES or torch.cuda.set_device(local_rank)). Sharing a GPU between two NCCL processes causes deadlock or invalid usage. # Source: torch/distributed/distributed_c10d.py:1622 — backend docstring
- **process_group → backend_selection:** Backend auto-detection logic (since PyTorch 2.6): - device_id is CUDA → NCCL - device_id is CPU → Gloo - No device_id and no backend → detects accelerator on runtime machine Explicit recommendation: - GPU training: backend='nccl' - CPU-only or heterogeneous: backend='gloo' - HPC cluster: backend='mpi' (requires pre-installed MPI) # Source: torch/distributed/distributed_c10d.py:1622 — backend docstring
- **process_group → timeout:** Default timeout: 10 minutes for NCCL, 30 minutes for other backends. On timeout, the collective is aborted asynchronously and the process crashes. Because CUDA is async, it is unsafe to continue after a failed collective — subsequent kernels may run on corrupted data. # Source: torch/distributed/distributed_c10d.py:1622 — timeout docstring
- **ddp → setup:** DDP wraps a model after it has been moved to the target device: model = model.to(device) model = DistributedDataParallel(model, device_ids=[local_rank]) All reduce of gradients happens automatically during backward pass (averaged across world_size ranks).
- **ddp → find_unused_parameters:** Set find_unused_parameters=True only when the model has parameters that do not always receive gradients (conditional branches, optional layers). It adds a graph traversal overhead on each forward pass — avoid when all parameters are used every step.
- **ddp → gradient_accumulation:** To accumulate gradients over N steps before syncing across GPUs: with model.no_sync(): # suppress all-reduce for N-1 steps loss.backward() loss.backward() # all-reduce happens here (final step) This reduces communication overhead for large effective batch sizes.
- **fsdp → sharding_strategy:** FULL_SHARD (default): shards parameters, gradients, and optimizer state across all ranks. Maximizes memory savings; best for very large models. SHARD_GRAD_OP: keeps full parameters during forward/backward; shards only optimizer state and gradients. Less memory saving, less communication. HYBRID_SHARD: full shard within a node group, full replicas across nodes. Best for multi-node where inter-node bandwidth is limited.
- **fsdp → mixed_precision:** FSDP supports MixedPrecision policy to shard in lower precision: MixedPrecision(param_dtype=torch.float16, reduce_dtype=torch.float32, # reduce in fp32 for stability buffer_dtype=torch.float16) # Source: torch/distributed/fsdp/__init__.py — MixedPrecision
- **checkpointing → rank_zero_save:** MUST save checkpoints on rank 0 only (or use FSDP distributed checkpoint API). Pattern for DDP: if dist.get_rank() == 0: torch.save(model.module.state_dict(), path) dist.barrier() # all ranks wait until rank 0 finishes writing FSDP: use FSDP.state_dict_type() context to choose between full, sharded, or local state dict formats before saving.
- **collectives → all_reduce:** torch.distributed.all_reduce(tensor, op=ReduceOp.SUM) — reduce tensor across all ranks and broadcast result to all (in-place). Common ops: SUM (default), AVG, MAX, MIN, PRODUCT. DDP uses all_reduce internally for gradient synchronization.
- **collectives → barrier:** torch.distributed.barrier() — synchronization point; all ranks block until every rank reaches the barrier. Use before/after checkpoint writes and before reading data that rank 0 has written. CAUTION: every rank must call barrier or it deadlocks.

## Success & failure scenarios

**✅ Success paths**

- **Distributed Initialized** — when all world_size processes have called init_process_group; rendezvous completed within timeout; backend exists, then Process group ready; collective operations available on all ranks.
- **Training Completed Distributed** — when training_status eq "running"; all epochs completed without error on all ranks, then All ranks finished training; checkpoint saved by rank 0.

**❌ Failure paths**

- **Rendezvous Timeout** — when not all world_size processes joined within the timeout window, then Process group not formed; verify all nodes are reachable and MASTER_ADDR/PORT are correct. *(error: `DISTRIBUTED_RENDEZVOUS_TIMEOUT`)*
- **Nccl Error** — when backend eq "nccl"; NCCL collective operation failed or timed out, then Training aborted on all ranks; check NCCL logs, GPU exclusivity, and network connectivity. *(error: `DISTRIBUTED_NCCL_ERROR`)*
- **Rank Oom** — when GPU memory exhausted on one or more ranks during forward or backward pass, then Reduce batch size, enable FSDP/gradient checkpointing, or use mixed precision. *(error: `DISTRIBUTED_RANK_OOM`)*

## Errors it can return

- `DISTRIBUTED_RENDEZVOUS_TIMEOUT` — Distributed rendezvous timed out. Not all processes joined. Check network and configuration.
- `DISTRIBUTED_NCCL_ERROR` — NCCL collective operation failed. Check GPU exclusivity and inter-GPU connectivity.
- `DISTRIBUTED_RANK_OOM` — GPU out of memory on one or more ranks. Reduce batch size or enable model sharding.
- `DISTRIBUTED_BARRIER_DEADLOCK` — Barrier deadlock — not all ranks reached the barrier. Check for conditional barrier calls.

## Events

**`distributed.initialized`**
  Payload: `backend`, `world_size`, `rank`, `local_rank`

**`distributed.checkpoint_saved`**
  Payload: `rank`, `checkpoint_path`

**`training.completed`**
  Payload: `total_epochs`, `final_loss`

**`distributed.rank_failed`**
  Payload: `rank`, `error_code`

## Connects to

- **model-training** *(required)* — Distributed training wraps the single-device training loop
- **dataset-pipeline** *(required)* — DistributedSampler must be used to partition data across ranks
- **model-serving** *(recommended)* — Checkpoint saved by rank 0 is exported for serving

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+4** since baseline (82 → 86)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/distributed-training/) · **Spec source:** [`distributed-training.blueprint.yaml`](./distributed-training.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
