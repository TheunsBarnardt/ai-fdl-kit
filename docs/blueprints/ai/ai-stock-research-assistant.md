---
title: "Ai Stock Research Assistant Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "AI assistant that summarizes filings and news and drafts research notes using DDM, DuPont, and multiples, with mandatory human sign-off. 9 fields. 6 outcomes. 3"
---

# Ai Stock Research Assistant Blueprint

> AI assistant that summarizes filings and news and drafts research notes using DDM, DuPont, and multiples, with mandatory human sign-off

| | |
|---|---|
| **Feature** | `ai-stock-research-assistant` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | research, ai, llm, valuation, ddm, dupont, multiples, filings |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/ai-stock-research-assistant.blueprint.yaml) |
| **JSON API** | [ai-stock-research-assistant.json]({{ site.baseurl }}/api/blueprints/ai/ai-stock-research-assistant.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ticker` | text | Yes | Ticker Symbol |  |
| `note_id` | text | Yes | Research Note Identifier |  |
| `source_documents` | json | Yes | Input Documents |  |
| `framework` | select | Yes | Valuation Framework |  |
| `summary` | rich_text | No | Filings / News Summary |  |
| `valuation_result` | json | No | Valuation Output |  |
| `recommendation` | select | No | Recommendation |  |
| `human_signoff_by` | text | No | Human Sign-off Analyst |  |
| `status` | select | Yes | Note Status |  |

## Rules

- **human_signoff:**
  - **description:** MUST: Every recommendation requires a human analyst sign-off before being accepted into the research library
  - **mandatory:** true
- **cited_sources:**
  - **description:** MUST: Every claim in the summary or valuation cites a source document and page/paragraph
- **framework_fidelity:**
  - **description:** MUST: Valuation math is performed by deterministic code, not by LLM; LLM only drafts narrative
  - **no_llm_in_math:** true
- **disclosure:**
  - **description:** MUST: AI-assisted watermark visible on every note; conflicts of interest disclosed
- **pii_scrub:**
  - **description:** MUST: Source documents stripped of non-public PII before LLM ingestion
  - **pii_patterns:** sa_id, passport, banking_details
- **model_limits:**
  - **description:** MUST: Token and cost limits per note; sensitive data never sent to third-party LLM
  - **max_tokens:** 32000
- **retention:**
  - **description:** MUST: Notes retained 7 years with full prompt and response logs for audit
  - **retention_years:** 7
- **fallback:**
  - **description:** MUST: If LLM unavailable, allow manual draft path; do not block research

## Outcomes

### Llm_unavailable (Priority: 1) — Error: `RESEARCH_LLM_UNAVAILABLE`

_LLM provider unavailable; fall back to manual drafting_

**Given:**
- LLM call failed after retries

**Then:**
- **notify** target: `research_team`
- **emit_event** event: `research.llm_unavailable`

**Result:** Manual path suggested

### Insufficient_data (Priority: 2) — Error: `RESEARCH_INSUFFICIENT_DATA`

_Not enough source material to produce a defensible note_

**Given:**
- source documents insufficient for the selected framework

**Then:**
- **emit_event** event: `research.insufficient_data`

**Result:** Analyst supplied with guidance to add inputs

### Note_rejected (Priority: 3) — Error: `RESEARCH_NOTE_REJECTED`

_Analyst rejected the note_

**Given:**
- analyst flagged the note as not acceptable

**Then:**
- **transition_state** field: `status` from: `drafted` to: `rejected`
- **emit_event** event: `research.note_rejected`

**Result:** Note archived with reason

### Research_note_drafted_successfully (Priority: 10) | Transaction: atomic

_AI draft of a research note produced and awaiting human review_

**Given:**
- `ticker` (input) exists
- `source_documents` (input) exists

**Then:**
- **transition_state** field: `status` from: `drafting` to: `drafted`
- **emit_event** event: `research.note_drafted`

**Result:** Draft ready for analyst review

### Valuation_computed (Priority: 10)

_Deterministic valuation calculation completed_

**Given:**
- required financial inputs captured

**Then:**
- **set_field** target: `valuation_result` value: `computed`
- **emit_event** event: `research.valuation_computed`

**Result:** Valuation output attached to the note

### Source_cited (Priority: 10)

_Every claim in the draft has a source citation_

**Given:**
- all assertions map to an input document

**Then:**
- **emit_event** event: `research.sources_cited`

**Result:** Note passes citation check

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RESEARCH_NOTE_REJECTED` | 409 | Research note was rejected by the analyst. | Yes |
| `RESEARCH_INSUFFICIENT_DATA` | 422 | Not enough source material to draft this note. | Yes |
| `RESEARCH_LLM_UNAVAILABLE` | 503 | AI drafting is temporarily unavailable. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `research.note_drafted` | AI draft produced | `note_id`, `ticker`, `framework` |
| `research.valuation_computed` | Valuation math complete | `note_id`, `framework` |
| `research.sources_cited` | Citations verified | `note_id`, `citation_count` |
| `research.note_rejected` | Note rejected by analyst | `note_id`, `reason` |
| `research.insufficient_data` | Insufficient source material | `note_id`, `ticker` |
| `research.llm_unavailable` | LLM provider unavailable | `note_id`, `provider` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ai-stock-screener | recommended | Screener shortlists feed research workflow |
| immutable-audit-log | required | Prompts, responses, and sign-offs must be audited |
| popia-compliance | required | PII scrubbing and retention obligations apply |

## AGI Readiness

### Goals

#### Assisted Research Integrity

Accelerate analyst workflow with AI drafts while preserving human judgement and source-level traceability

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| draft_acceptance_rate | >= 70% | Fraction of drafts accepted with minor edits |
| citation_coverage | = 100% | Fraction of claims with source citations |

**Constraints:**

- **regulatory** (non-negotiable): Human sign-off mandatory on every accepted note
- **security** (non-negotiable): No non-public PII leaves the environment

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- before accepting any recommendation
- before publishing a note

**Escalation Triggers:**

- `insufficient_data`
- `llm_unavailable`

### Verification

**Invariants:**

- no accepted note without human_signoff_by set
- every claim has a source citation
- valuation math executed by deterministic code

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| research_note_drafted_successfully | `autonomous` | - | - |
| valuation_computed | `autonomous` | - | - |
| accept_recommendation | `human_required` | - | - |
| publish_note | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ai Stock Research Assistant Blueprint",
  "description": "AI assistant that summarizes filings and news and drafts research notes using DDM, DuPont, and multiples, with mandatory human sign-off. 9 fields. 6 outcomes. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "research, ai, llm, valuation, ddm, dupont, multiples, filings"
}
</script>
