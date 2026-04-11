---
title: "Prompt Obfuscation Pipeline Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Chain converters to transform a prompt into an obfuscated form designed to bypass AI safety filters — supports encoding, character substitution, language transl"
---

# Prompt Obfuscation Pipeline Blueprint

> Chain converters to transform a prompt into an obfuscated form designed to bypass AI safety filters — supports encoding, character substitution, language translation, and 40+ transforms.

| | |
|---|---|
| **Feature** | `prompt-obfuscation-pipeline` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, prompt-converter, obfuscation, jailbreak, encoding, red-team, ai-safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/prompt-obfuscation-pipeline.blueprint.yaml) |
| **JSON API** | [prompt-obfuscation-pipeline.json]({{ site.baseurl }}/api/blueprints/security/prompt-obfuscation-pipeline.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `red_team_operator` | Red-Team Operator | human | Selects converter chain and initiates the obfuscated prompt attack. |
| `converter_pipeline` | Converter Pipeline | system | Applies converters in sequence; each converter's output feeds the next. |
| `target_model` | Target AI Model | external | Receives the final obfuscated prompt and returns a response. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `original_prompt` | rich_text | Yes | Original Prompt |  |
| `converter_chain` | json | Yes | Converter Chain |  |
| `data_type` | select | Yes | Prompt Modality |  |
| `converted_prompt` | rich_text | No | Converted Prompt |  |
| `converter_results` | json | No | Per-Converter Results |  |

## Rules

- **ordering:**
  - **apply_in_declared_order:** true
  - **each_converter_receives_previous_output:** true
- **modality_contract:**
  - **output_type_must_match_next_input_type:** true
  - **on_mismatch:** halt_pipeline
- **on_converter_failure:**
  - **action:** halt_and_report
- **llm_backed_converters:**
  - **counts_against_model_usage_budget:** true
- **human_in_the_loop:**
  - **pauses_execution:** true
  - **resumes_on_manual_approval:** true
- **audit:**
  - **store_intermediate_outputs:** true
  - **original_prompt:** immutable

## Outcomes

### Modality_mismatch (Priority: 1) — Error: `CONVERTER_MODALITY_MISMATCH`

**Given:**
- output modality of converter N does not match required input modality of converter N+1

**Then:**
- **emit_event** event: `security.converter.pipeline_failed`

**Result:** Pipeline is halted; error identifies which converter caused the mismatch.

### Converter_error (Priority: 2) — Error: `CONVERTER_TRANSFORM_FAILED`

**Given:**
- a converter throws an error during transformation (API failure, encoding error)

**Then:**
- **emit_event** event: `security.converter.pipeline_failed`

**Result:** Pipeline is halted; the partially converted prompt is discarded.

### Pipeline_complete (Priority: 10)

**Given:**
- all converters in the chain complete without error

**Then:**
- **set_field** target: `converted_prompt` — Final output of the last converter in the chain.
- **emit_event** event: `security.converter.pipeline_complete`

**Result:** Converted prompt is ready to be sent to the target model.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONVERTER_MODALITY_MISMATCH` | 422 | A converter in the chain produced an output type incompatible with the next converter. | No |
| `CONVERTER_TRANSFORM_FAILED` | 500 | A converter failed to transform the prompt. Check converter configuration and dependencies. | No |
| `CONVERTER_CHAIN_EMPTY` | 400 | The converter chain is empty. At least one converter must be configured. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.converter.pipeline_complete` | Emitted when all converters have been applied successfully. | `converter_chain`, `data_type`, `converted_prompt` |
| `security.converter.pipeline_failed` | Emitted when a converter in the chain fails and the pipeline halts. | `converter_chain`, `failing_converter`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| prompt-attack-augmentation | optional | Alternative augmentation approach used in the garak probe pipeline. |
| multi-turn-attack-orchestration | recommended | Multi-turn attacks that apply converter chains per turn. |
| llm-vulnerability-scan | optional | Scan pipeline that can integrate obfuscated prompts as augmented attempts. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/microsoft/PyRIT
  project: PyRIT — Python Risk Identification Tool
  tech_stack: Python 3.10+
  files_traced: 60
  entry_points:
    - pyrit/prompt_converter/prompt_converter.py
    - pyrit/prompt_converter/base64_converter.py
    - pyrit/prompt_converter/translation_converter.py
    - pyrit/prompt_converter/persuasion_converter.py
    - pyrit/prompt_normalizer/
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Prompt Obfuscation Pipeline Blueprint",
  "description": "Chain converters to transform a prompt into an obfuscated form designed to bypass AI safety filters — supports encoding, character substitution, language transl",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, prompt-converter, obfuscation, jailbreak, encoding, red-team, ai-safety"
}
</script>
