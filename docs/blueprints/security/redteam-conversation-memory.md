---
title: "Redteam Conversation Memory Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Persist all red-team prompts, model responses, scores, and attack metadata to a queryable store — enables session replay, cross-run analysis, and compliance rep"
---

# Redteam Conversation Memory Blueprint

> Persist all red-team prompts, model responses, scores, and attack metadata to a queryable store — enables session replay, cross-run analysis, and compliance reporting.

| | |
|---|---|
| **Feature** | `redteam-conversation-memory` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, memory, audit-trail, red-team, conversation, persistence, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/redteam-conversation-memory.blueprint.yaml) |
| **JSON API** | [redteam-conversation-memory.json]({{ site.baseurl }}/api/blueprints/security/redteam-conversation-memory.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `memory_store` | Memory Store | system | Persists and retrieves all conversation entries, scores, and attack metadata. |
| `attack_orchestrator` | Attack Orchestrator | system | Reads prior conversation turns from memory to build context for next attack prompt. |
| `compliance_officer` | Compliance Officer | human | Queries memory to produce audit reports and evidence of red-team activities. |
| `red_team_operator` | Red-Team Operator | human | Searches and filters memory to analyse attack patterns and outcomes. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entry_id` | token | Yes | Entry ID |  |
| `conversation_id` | token | Yes | Conversation ID |  |
| `attack_id` | token | No | Attack Run ID |  |
| `role` | select | Yes | Speaker Role |  |
| `content` | rich_text | Yes | Content |  |
| `data_type` | select | Yes | Content Modality |  |
| `score_entries` | json | No | Score Entries |  |
| `labels` | json | No | Labels |  |
| `timestamp` | datetime | Yes | Timestamp |  |
| `embedding` | json | No | Semantic Embedding |  |

## Rules

- **capture:**
  - **every_prompt_to_model:** required
  - **every_model_response:** required
  - **every_score:** required
- **data_safety:**
  - **no_credentials_or_pii:** enforced
- **immutability:**
  - **entries:** immutable_after_creation
  - **corrections:** new_entry_with_reference_to_original
- **identifiers:**
  - **conversation_id:** consistent_across_all_turns
- **embeddings:**
  - **compute_at_write_time:** true
- **filtering:**
  - **supported_dimensions:** conversation_id, attack_id, role, label, timestamp_range, score_value
- **export:**
  - **formats:** json, csv
- **backends:**
  - **minimum_required:** 2
- **deletion:**
  - **requires_explicit_authorisation:** true
  - **bulk_delete_requires_confirmation:** true

## Outcomes

### Entry_missing_required_fields (Priority: 1) — Error: `MEMORY_ENTRY_INVALID`

**Given:**
- ANY: `entry_id` (input) not_exists OR `conversation_id` (input) not_exists OR `content` (input) not_exists

**Result:** Entry is rejected; memory store logs the validation error.

### Entry_contains_secrets (Priority: 2) — Error: `MEMORY_CONTAINS_SECRETS`

**Given:**
- entry content matches a known credential or PII pattern

**Result:** Entry is rejected; operator is notified to sanitise the content before retrying.

### Conversation_retrieved (Priority: 5)

**Given:**
- query specifies a conversation_id
- at least one entry exists for that conversation

**Then:**
- **emit_event** event: `security.memory.conversation_retrieved`

**Result:** All entries for the conversation are returned in turn order.

### Export_requested (Priority: 6)

**Given:**
- operator requests export of memory entries with optional filters

**Then:**
- **create_record** target: `memory_export` — Filtered entries written to export file in requested format.
- **emit_event** event: `security.memory.exported`

**Result:** Export file is available for download or compliance review.

### Entry_persisted (Priority: 10) | Transaction: atomic

**Given:**
- all required fields are present
- content does not contain secrets or PII patterns

**Then:**
- **create_record** target: `memory_entry` — Entry written to the configured backend store.
- **emit_event** event: `security.memory.entry_added`

**Result:** Entry is persisted and queryable immediately.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MEMORY_ENTRY_INVALID` | 422 | The memory entry is missing required fields and cannot be stored. | No |
| `MEMORY_BACKEND_UNAVAILABLE` | 503 | The memory backend is unavailable. Entry could not be persisted. | No |
| `MEMORY_CONTAINS_SECRETS` | 422 | The entry appears to contain credentials or PII and was rejected. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.memory.entry_added` | Emitted when a new memory entry is successfully persisted. | `entry_id`, `conversation_id`, `role`, `data_type`, `timestamp` |
| `security.memory.conversation_retrieved` | Emitted when conversation history is retrieved from the store. | `conversation_id`, `entry_count` |
| `security.memory.exported` | Emitted when a memory export is generated. | `filter_criteria`, `entry_count`, `export_format` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-turn-attack-orchestration | required | Attack orchestrators read conversation history from memory to build context. |
| ai-response-harm-scorer | recommended | Scores are stored as linked entries in the memory store. |
| security-scan-report | optional | Scan reports can query memory to include attempt-level evidence. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/microsoft/PyRIT
  project: PyRIT — Python Risk Identification Tool
  tech_stack: Python 3.10+
  files_traced: 10
  entry_points:
    - pyrit/memory/memory_interface.py
    - pyrit/memory/central_memory.py
    - pyrit/memory/sqlite_memory.py
    - pyrit/memory/memory_models.py
    - pyrit/memory/memory_exporter.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Redteam Conversation Memory Blueprint",
  "description": "Persist all red-team prompts, model responses, scores, and attack metadata to a queryable store — enables session replay, cross-run analysis, and compliance rep",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, memory, audit-trail, red-team, conversation, persistence, compliance"
}
</script>
