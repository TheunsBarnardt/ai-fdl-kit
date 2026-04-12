---
title: "Prompt Attack Augmentation Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Post-process probe attempts with obfuscation transforms (encoding, rephrasing, suffix injection) before submission so attacks bypass surface-level safety filter"
---

# Prompt Attack Augmentation Blueprint

> Post-process probe attempts with obfuscation transforms (encoding, rephrasing, suffix injection) before submission so attacks bypass surface-level safety filters.

| | |
|---|---|
| **Feature** | `prompt-attack-augmentation` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, augmentation, obfuscation, encoding, jailbreak, bypass, red-team |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/prompt-attack-augmentation.blueprint.yaml) |
| **JSON API** | [prompt-attack-augmentation.json]({{ site.baseurl }}/api/blueprints/security/prompt-attack-augmentation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `augmentation_engine` | Augmentation Engine | system | Applies one or more transforms to a probe attempt before it is sent. |
| `probe` | Source Probe | system | Generates the original probe attempt that augmentations are applied to. |
| `target_model` | Target AI Model | external | Receives the augmented (transformed) probe prompt. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `augmentation_id` | text | Yes | Augmentation ID |  |
| `source_attempt` | json | Yes | Source Attempt |  |
| `transform_type` | select | Yes | Transform Type |  |
| `transformed_attempt` | json | No | Transformed Attempt |  |
| `origin_attempt_id` | token | Yes | Origin Attempt ID |  |

## Rules

- **ordering:**
  - **apply_after_probe_generation:** true
  - **apply_before_model_submission:** true
- **chaining:**
  - **multiple_augmentations_per_attempt:** true
  - **chain_order:** declared
  - **preserve_semantic_intent:** true
- **traceability:**
  - **origin_attempt_id:** required
- **on_failure:**
  - **action:** passthrough
- **evaluation:**
  - **detector:** same_as_source_probe
- **modality:**
  - **cross_modal_transforms:** declared_only
- **language_specific_augmentations:**
  - **target_language:** required
  - **skip_on_language_locked_probes:** true

## Outcomes

### Augmentation_not_applicable (Priority: 2)

**Given:**
- augmentation type does not support the probe's input modality

**Then:**
- **set_field** target: `transformed_attempt` — Pass through unchanged — original attempt is used.

**Result:** Original attempt is submitted; augmentation skip is logged.

### Augmentation_applied (Priority: 10)

**Given:**
- augmentation type supports the probe's input modality
- transform completes without error

**Then:**
- **set_field** target: `transformed_attempt` — Augmented prompt replaces the original in the attempt.
- **set_field** target: `origin_attempt_id` — Original attempt ID stored for traceability.
- **emit_event** event: `security.augmentation.applied`

**Result:** Augmented attempt is ready for submission to the target model.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUGMENTATION_UNSUPPORTED_MODALITY` | 422 | This augmentation does not support the probe's input modality. | No |
| `AUGMENTATION_TRANSFORM_FAILED` | 500 | The augmentation transform could not be applied. The original attempt will be used. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.augmentation.applied` | Emitted when an augmentation successfully transforms a probe attempt. | `augmentation_id`, `transform_type`, `origin_attempt_id` |
| `security.augmentation.skipped` | Emitted when an augmentation is skipped due to modality mismatch or error. | `augmentation_id`, `transform_type`, `origin_attempt_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| llm-attack-probe-library | required | Source probes that augmentations are applied to. |
| llm-vulnerability-scan | required | The scan pipeline that configures and applies augmentations. |
| prompt-obfuscation-pipeline | optional | Complementary converter-based obfuscation pipeline from PyRIT. |

## AGI Readiness

### Goals

#### Reliable Prompt Attack Augmentation

Post-process probe attempts with obfuscation transforms (encoding, rephrasing, suffix injection) before submission so attacks bypass surface-level safety filters.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `llm_attack_probe_library` | llm-attack-probe-library | degrade |
| `llm_vulnerability_scan` | llm-vulnerability-scan | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| augmentation_not_applicable | `autonomous` | - | - |
| augmentation_applied | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/NVIDIA/garak
  project: garak — LLM vulnerability scanner
  tech_stack: Python 3.10+
  files_traced: 10
  entry_points:
    - garak/buffs/base.py
    - garak/buffs/encoding.py
    - garak/buffs/paraphrase.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Prompt Attack Augmentation Blueprint",
  "description": "Post-process probe attempts with obfuscation transforms (encoding, rephrasing, suffix injection) before submission so attacks bypass surface-level safety filter",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, augmentation, obfuscation, encoding, jailbreak, bypass, red-team"
}
</script>
