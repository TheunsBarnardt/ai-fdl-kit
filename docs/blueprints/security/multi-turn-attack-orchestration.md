---
title: "Multi Turn Attack Orchestration Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Orchestrate automated multi-turn adversarial conversations that incrementally steer an AI model toward a harmful objective using crescendo, TAP, or red-team-LLM"
---

# Multi Turn Attack Orchestration Blueprint

> Orchestrate automated multi-turn adversarial conversations that incrementally steer an AI model toward a harmful objective using crescendo, TAP, or red-team-LLM strategies.

| | |
|---|---|
| **Feature** | `multi-turn-attack-orchestration` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, multi-turn, crescendo, tap, red-team, jailbreak, orchestration, ai-safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/multi-turn-attack-orchestration.blueprint.yaml) |
| **JSON API** | [multi-turn-attack-orchestration.json]({{ site.baseurl }}/api/blueprints/security/multi-turn-attack-orchestration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `attack_orchestrator` | Attack Orchestrator | system | Manages the multi-turn conversation loop, strategy selection, and backtracking. |
| `adversarial_model` | Adversarial Model | external | An AI model that generates adaptive attack prompts based on prior responses. |
| `target_model` | Target AI Model | external | The AI model under test — receives attack prompts and returns responses. |
| `harm_scorer` | Harm Scorer | system | Evaluates each target response to determine if the attack objective was achieved. |
| `red_team_operator` | Red-Team Operator | human | Configures the attack strategy and objective; reviews results. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `attack_id` | token | Yes | Attack Run ID |  |
| `objective` | rich_text | Yes | Attack Objective |  |
| `strategy` | select | Yes | Attack Strategy |  |
| `max_turns` | number | Yes | Max Turns |  |
| `max_backtracks` | number | No | Max Backtracks |  |
| `current_turn` | number | No | Current Turn |  |
| `attack_status` | select | Yes | Attack Status |  |
| `attack_outcome` | select | No | Final Outcome |  |

## States

**State field:** `attack_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initialised` | Yes |  |
| `running` |  |  |
| `backtracking` |  |  |
| `succeeded` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initialised` | `running` | attack_orchestrator |  |
|  | `running` | `backtracking` | attack_orchestrator |  |
|  | `backtracking` | `running` | attack_orchestrator |  |
|  | `running` | `succeeded` | attack_orchestrator |  |
|  | `running` | `failed` | attack_orchestrator |  |

## Rules

- **per_turn:**
  - **prompts_per_turn:** one
  - **score_response_before_next_turn:** true
- **crescendo:**
  - **start:** benign_requests
  - **escalation:** gradual_toward_objective
  - **on_refusal:** backtrack_with_softer_prompt
  - **backtrack_limit:** max_backtracks_field
- **tree_of_attacks:**
  - **branches:** parallel
  - **pruning:** prune_lowest_harm_score_branches
- **adversarial_prompt_generation:**
  - **inputs:** objective, conversation_history, last_target_response
  - **no_identical_consecutive_prompts:** true
- **success_criterion:**
  - **requires:** definitive_harmful_score
- **audit:**
  - **store_all_turns:** required

## Outcomes

### Backtrack_limit_reached (Priority: 3)

**Given:**
- `current_turn` (computed) gte `max_backtracks`

**Then:**
- **transition_state** field: `attack_status` from: `backtracking` to: `failed`
- **set_field** target: `attack_outcome` — Set to backtrack_limit_reached.
- **emit_event** event: `security.attack.failed`

**Result:** Attack fails; result is recorded as backtrack limit reached.

### Max_turns_reached (Priority: 4)

**Given:**
- `current_turn` (computed) gte `max_turns`

**Then:**
- **transition_state** field: `attack_status` from: `running` to: `failed`
- **set_field** target: `attack_outcome` — Set to max_turns_reached.
- **emit_event** event: `security.attack.failed`

**Result:** Attack fails; result is recorded as max turns reached without success.

### Objective_achieved (Priority: 5) | Transaction: atomic

**Given:**
- harm scorer returns harmful for the target model's response

**Then:**
- **transition_state** field: `attack_status` from: `running` to: `succeeded`
- **set_field** target: `attack_outcome` — Set to success.
- **emit_event** event: `security.attack.objective_achieved`

**Result:** Attack succeeds; conversation history and final harmful response are stored.

### Refusal_detected (Priority: 6)

**Given:**
- harm scorer indicates a refusal
- `current_turn` (computed) lt `max_turns`

**Then:**
- **transition_state** field: `attack_status` from: `running` to: `backtracking`
- **emit_event** event: `security.attack.refusal_detected`

**Result:** Orchestrator backtracks and generates a softer follow-up prompt.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ATTACK_ADVERSARIAL_MODEL_UNAVAILABLE` | 503 | The adversarial model could not be reached. Attack cannot proceed. | No |
| `ATTACK_TARGET_UNAVAILABLE` | 503 | The target model could not be reached. Attack cannot proceed. | No |
| `ATTACK_INVALID_STRATEGY` | 400 | The specified attack strategy is not recognised. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.attack.objective_achieved` | Emitted when the multi-turn attack successfully elicits the harmful objective. | `attack_id`, `strategy`, `turn_count`, `objective` |
| `security.attack.refusal_detected` | Emitted when the target model refuses a prompt and backtracking begins. | `attack_id`, `strategy`, `current_turn` |
| `security.attack.failed` | Emitted when the attack exhausts its allowed turns or backtracks. | `attack_id`, `strategy`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ai-response-harm-scorer | required | Scores each target response to determine attack progress. |
| prompt-obfuscation-pipeline | optional | Converter chain applied to each turn's prompt before submission. |
| redteam-conversation-memory | required | Persists all conversation turns and scores for audit and replay. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/microsoft/PyRIT
  project: PyRIT — Python Risk Identification Tool
  tech_stack: Python 3.10+
  files_traced: 20
  entry_points:
    - pyrit/executor/attack/multi_turn/crescendo.py
    - pyrit/executor/attack/multi_turn/tree_of_attacks.py
    - pyrit/executor/attack/multi_turn/red_teaming.py
    - pyrit/executor/attack/multi_turn/multi_turn_attack_strategy.py
    - pyrit/scenario/core/scenario.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Turn Attack Orchestration Blueprint",
  "description": "Orchestrate automated multi-turn adversarial conversations that incrementally steer an AI model toward a harmful objective using crescendo, TAP, or red-team-LLM",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, multi-turn, crescendo, tap, red-team, jailbreak, orchestration, ai-safety"
}
</script>
