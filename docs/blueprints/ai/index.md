---
title: "Ai"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 99
description: "Ai blueprints."
---

# Ai Blueprints

Ai blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Ai Solo Business Automation]({{ site.baseurl }}/blueprints/ai/ai-solo-business-automation/) | Autonomous AI-to-AI service platform — sells intelligence, tools, and compute to other AI systems via MCP and API, zero human involvement, self-improving | 1.0.0 |
| [Dataset Pipeline]({{ site.baseurl }}/blueprints/ai/dataset-pipeline/) | Build efficient input data pipelines for ML training and inference — covers tf.data (caching, prefetching, AUTOTUNE) and PyTorch DataLoader (multi-process workers, samplers, collate) patterns | 1.1.0 |
| [Distributed Training]({{ site.baseurl }}/blueprints/ai/distributed-training/) | Configure multi-GPU or multi-node ML training using DDP, FSDP, or hybrid strategies — covers process group setup, collective communication, and distributed checkpoint coordination | 1.0.0 |
| [Model Serving]({{ site.baseurl }}/blueprints/ai/model-serving/) | Export trained ML models for production inference — covers TF SavedModel/TF Serving versioning and PyTorch export patterns (torch.export, ONNX, torch.compile) | 1.1.0 |
| [Model Training]({{ site.baseurl }}/blueprints/ai/model-training/) | Train, evaluate, and checkpoint ML models with configurable optimizers, LR schedulers, mixed precision, and distributed strategies — covers Keras fit API and PyTorch training loop | 1.1.0 |
| [Openclaw Llm Provider]({{ site.baseurl }}/blueprints/ai/openclaw-llm-provider/) | Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support | 1.0.0 |
