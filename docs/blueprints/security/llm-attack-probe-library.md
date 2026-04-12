---
title: "Llm Attack Probe Library Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Registry of modular attack probes for testing AI model vulnerabilities — each probe targets a category (jailbreak, prompt injection, data leakage, toxicity) and"
---

# Llm Attack Probe Library Blueprint

> Registry of modular attack probes for testing AI model vulnerabilities — each probe targets a category (jailbreak, prompt injection, data leakage, toxicity) and pairs with a detector.

| | |
|---|---|
| **Feature** | `llm-attack-probe-library` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, probe, jailbreak, prompt-injection, toxicity, data-leakage, ai-safety, red-team |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/llm-attack-probe-library.blueprint.yaml) |
| **JSON API** | [llm-attack-probe-library.json]({{ site.baseurl }}/api/blueprints/security/llm-attack-probe-library.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `probe_registry` | Probe Registry | system | Discovers, loads, and manages all available probe types. |
| `probe` | Attack Probe | system | Generates attack prompts for a specific vulnerability category. |
| `target_model` | Target AI Model | external | Receives probe prompts and returns responses to be evaluated. |
| `detector` | Detector | system | Scores model responses to determine if the attack triggered a vulnerability. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `probe_id` | text | Yes | Probe ID |  |
| `probe_category` | select | Yes | Vulnerability Category |  |
| `goal` | text | Yes | Attack Goal |  |
| `prompt_template` | rich_text | Yes | Prompt Template |  |
| `detector_id` | text | Yes | Primary Detector |  |
| `language` | text | No | Language (BCP-47) |  |
| `parallelisable` | boolean | No | Allow Parallel Attempts |  |
| `tier` | select | No | Probe Tier |  |

## Rules

- **probe_requirements:**
  - **goal_required:** true
  - **primary_detector_required:** true
- **probe_execution:**
  - **prompt_sanitisation:** never
  - **category_per_probe:** one
  - **on_language_mismatch:** skip
  - **on_no_prompts:** config_error
- **output_requirements:**
  - **fields_recorded:** generated_prompt, model_response, detector_score
  - **truncation:** never
- **tiers:**
  - **active_by_default:** of_concern, competitive

## Outcomes

### Probe_config_invalid (Priority: 1) — Error: `PROBE_CONFIG_INVALID`

**Given:**
- `goal` (input) not_exists

**Result:** Probe fails to load; error is logged and the probe is skipped in the scan run.

### Prompt_generation_failed (Priority: 2) — Error: `PROBE_NO_PROMPTS`

**Given:**
- probe cannot generate any attack prompts (missing dataset, template error)

**Then:**
- **emit_event** event: `security.probe.load_failed`

**Result:** Probe is skipped; scan continues with remaining probes.

### Attack_detected (Priority: 5)

**Given:**
- probe submits at least one attack prompt to the target model
- detector scores one or more responses above the failure threshold

**Then:**
- **create_record** — Records prompt, response, detector name, score, and fail verdict.
- **emit_event** event: `security.probe.vulnerability_detected`

**Result:** Vulnerability is recorded; pass rate for this probe decreases.

### Attack_not_triggered (Priority: 10)

**Given:**
- all detector scores for this probe's attempts are below the failure threshold

**Then:**
- **create_record** — Records prompt, response, detector name, score, and pass verdict.
- **emit_event** event: `security.probe.passed`

**Result:** Probe passes; model did not produce the targeted failure mode.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PROBE_CONFIG_INVALID` | 422 | The probe configuration is invalid or references an unknown category. | No |
| `PROBE_NO_PROMPTS` | 422 | The probe could not generate attack prompts. Check the probe's dataset or template. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.probe.load_failed` | Emitted when a probe fails to load due to configuration or dependency error. | `probe_id`, `probe_category`, `reason` |
| `security.probe.vulnerability_detected` | Emitted when a detector determines the model produced a vulnerable response. | `probe_id`, `probe_category`, `attempt_id`, `detector_score` |
| `security.probe.passed` | Emitted when all attempts in a probe pass without triggering the vulnerability. | `probe_id`, `probe_category`, `attempt_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| llm-vulnerability-scan | required | The orchestration pipeline that loads and executes probes. |
| prompt-attack-augmentation | optional | Augmentations that transform probe prompts before submission. |
| security-scan-report | recommended | Aggregates probe results into a human-readable scan report. |

## AGI Readiness

### Goals

#### Reliable Llm Attack Probe Library

Registry of modular attack probes for testing AI model vulnerabilities — each probe targets a category (jailbreak, prompt injection, data leakage, toxicity) and pairs with a detector.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `llm_vulnerability_scan` | llm-vulnerability-scan | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| probe_config_invalid | `autonomous` | - | - |
| prompt_generation_failed | `autonomous` | - | - |
| attack_detected | `autonomous` | - | - |
| attack_not_triggered | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/NVIDIA/garak
  project: garak — LLM vulnerability scanner
  tech_stack: Python 3.10+
  files_traced: 40
  entry_points:
    - garak/probes/base.py
    - garak/probes/promptinject.py
    - garak/probes/dan.py
    - garak/probes/leakreplay.py
    - garak/detectors/base.py
    - garak/detectors/judge.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Llm Attack Probe Library Blueprint",
  "description": "Registry of modular attack probes for testing AI model vulnerabilities — each probe targets a category (jailbreak, prompt injection, data leakage, toxicity) and",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, probe, jailbreak, prompt-injection, toxicity, data-leakage, ai-safety, red-team"
}
</script>
