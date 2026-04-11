---
title: "Security"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 99
description: "Security blueprints."
---

# Security Blueprints

Security blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Ai Response Harm Scorer]({{ site.baseurl }}/blueprints/security/ai-response-harm-scorer/) | Evaluate AI model responses for harm or policy violation using a pluggable scorer — binary, float-scale, LLM-as-judge, or human review. Results are stored for audit. | 1.0.0 |
| [Llm Attack Probe Library]({{ site.baseurl }}/blueprints/security/llm-attack-probe-library/) | Registry of modular attack probes for testing AI model vulnerabilities — each probe targets a category (jailbreak, prompt injection, data leakage, toxicity) and pairs with a detector. | 1.0.0 |
| [Llm Vulnerability Scan]({{ site.baseurl }}/blueprints/security/llm-vulnerability-scan/) | Orchestrate end-to-end vulnerability scanning of an AI model — run attack probes, collect responses, detect failures, and emit a structured report. | 1.0.0 |
| [Multi Turn Attack Orchestration]({{ site.baseurl }}/blueprints/security/multi-turn-attack-orchestration/) | Orchestrate automated multi-turn adversarial conversations that incrementally steer an AI model toward a harmful objective using crescendo, TAP, or red-team-LLM strategies. | 1.0.0 |
| [Prompt Attack Augmentation]({{ site.baseurl }}/blueprints/security/prompt-attack-augmentation/) | Post-process probe attempts with obfuscation transforms (encoding, rephrasing, suffix injection) before submission so attacks bypass surface-level safety filters. | 1.0.0 |
| [Prompt Obfuscation Pipeline]({{ site.baseurl }}/blueprints/security/prompt-obfuscation-pipeline/) | Chain converters to transform a prompt into an obfuscated form designed to bypass AI safety filters — supports encoding, character substitution, language translation, and 40+ transforms. | 1.0.0 |
| [Redteam Conversation Memory]({{ site.baseurl }}/blueprints/security/redteam-conversation-memory/) | Persist all red-team prompts, model responses, scores, and attack metadata to a queryable store — enables session replay, cross-run analysis, and compliance reporting. | 1.0.0 |
| [Security Scan Report]({{ site.baseurl }}/blueprints/security/security-scan-report/) | Generate, persist, and export a structured AI vulnerability scan report with per-probe pass rates, confidence intervals, attempt-level detail, and AVID-compatible export. | 1.0.0 |
