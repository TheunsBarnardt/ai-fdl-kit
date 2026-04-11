---
title: "Ai Response Harm Scorer Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Evaluate AI model responses for harm or policy violation using a pluggable scorer — binary, float-scale, LLM-as-judge, or human review. Results are stored for a"
---

# Ai Response Harm Scorer Blueprint

> Evaluate AI model responses for harm or policy violation using a pluggable scorer — binary, float-scale, LLM-as-judge, or human review. Results are stored for audit.

| | |
|---|---|
| **Feature** | `ai-response-harm-scorer` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, scorer, harm-detection, ai-safety, red-team, judge, evaluation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/ai-response-harm-scorer.blueprint.yaml) |
| **JSON API** | [ai-response-harm-scorer.json]({{ site.baseurl }}/api/blueprints/security/ai-response-harm-scorer.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `scorer` | Scorer | system | Evaluates a model response against a defined harm criterion. |
| `red_team_operator` | Red-Team Operator | human | Configures scoring criteria and reviews edge-case results. |
| `human_reviewer` | Human Reviewer | human | Manually reviews and overrides scores when the scorer requests human input. |
| `target_model` | Target AI Model | external | The model whose response is being scored. |
| `judge_model` | Judge Model | external | An AI model used as the scoring backend in LLM-as-judge mode. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scorer_id` | text | Yes | Scorer ID |  |
| `scorer_type` | select | Yes | Scorer Type |  |
| `response_text` | rich_text | Yes | Response to Score |  |
| `scoring_criteria` | rich_text | Yes | Harm Criterion |  |
| `score_value` | text | No | Score Value |  |
| `score_rationale` | rich_text | No | Score Rationale |  |
| `score_threshold` | number | No | Harm Threshold |  |

## Rules

- **scorer_types:**
  - **type_required:** true
  - **no_mixed_types_per_instance:** true
- **scoring:**
  - **float_scale_normalisation:** zero_to_one
  - **binary_semantics:**
    - **true_means:** harmful_or_criteria_met
    - **false_means:** safe_or_criteria_not_met
  - **null_score_meaning:** scorer_could_not_determine
- **llm_judge:**
  - **structured_prompt_required:** true
- **human_scorer:**
  - **blocks_execution:** true
  - **resumes_on_reviewer_submission:** true
- **batch_scoring:**
  - **concurrent_processing:** true
  - **results_stored_independently:** true
- **audit:**
  - **rationale_stored_with_score:** required
  - **immutability:** true
  - **correction_via_new_record:** true

## Outcomes

### Scorer_config_invalid (Priority: 1) — Error: `SCORER_CONFIG_INVALID`

**Given:**
- `scorer_type` (input) not_exists

**Result:** Scorer fails to initialise; error is surfaced to the operator.

### Response_ambiguous (Priority: 3)

**Given:**
- scorer cannot determine a definitive score (response is ambiguous or off-topic)

**Then:**
- **set_field** target: `score_value` — Null score recorded.
- **emit_event** event: `security.scorer.ambiguous`

**Result:** A null score is recorded; downstream aggregation treats null scores as inconclusive.

### Human_review_requested (Priority: 4)

**Given:**
- scorer_type is human

**Then:**
- **notify** target: `human_reviewer` — Human reviewer is prompted to score the response.

**Result:** Execution is paused until the human reviewer submits a score.

### Scored_harmful (Priority: 8)

**Given:**
- scorer determines the response meets the harm criterion

**Then:**
- **create_record** target: `score_entry` — Score stored with value, rationale, scorer ID, and timestamp.
- **emit_event** event: `security.scorer.harmful_detected`

**Result:** Harmful score is recorded; downstream attack orchestrators use this to adapt strategy.

### Scored_safe (Priority: 10)

**Given:**
- scorer determines the response does not meet the harm criterion

**Then:**
- **create_record** target: `score_entry` — Score stored with value, rationale, scorer ID, and timestamp.
- **emit_event** event: `security.scorer.safe`

**Result:** Safe score is recorded; no further escalation required.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCORER_CONFIG_INVALID` | 422 | The scorer configuration is missing required fields or references an unknown scorer type. | No |
| `SCORER_JUDGE_UNAVAILABLE` | 503 | The judge model could not be reached. Scoring cannot proceed. | No |
| `SCORER_INVALID_JSON` | 422 | The judge model returned a response that could not be parsed as a valid score. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.scorer.harmful_detected` | Emitted when a scorer determines the response meets the harm criterion. | `scorer_id`, `scorer_type`, `score_value`, `score_rationale` |
| `security.scorer.safe` | Emitted when a scorer determines the response is safe. | `scorer_id`, `scorer_type`, `score_value` |
| `security.scorer.ambiguous` | Emitted when a scorer cannot determine a definitive result. | `scorer_id`, `scorer_type`, `response_text` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-turn-attack-orchestration | required | Attack strategies that use harm scores to adapt conversation turns. |
| llm-vulnerability-scan | optional | Scan pipeline that can use this scorer as a detector backend. |
| redteam-conversation-memory | recommended | Persists score records alongside conversation history for audit. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/microsoft/PyRIT
  project: PyRIT — Python Risk Identification Tool
  tech_stack: Python 3.10+
  files_traced: 15
  entry_points:
    - pyrit/score/scorer.py
    - pyrit/score/true_false/
    - pyrit/score/float_scale/
    - pyrit/score/human/
    - pyrit/score/batch_scorer.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ai Response Harm Scorer Blueprint",
  "description": "Evaluate AI model responses for harm or policy violation using a pluggable scorer — binary, float-scale, LLM-as-judge, or human review. Results are stored for a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, scorer, harm-detection, ai-safety, red-team, judge, evaluation"
}
</script>
