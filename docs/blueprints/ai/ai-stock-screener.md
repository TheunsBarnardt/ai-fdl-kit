---
title: "Ai Stock Screener Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "AI-assisted stock screener that parses natural-language queries into deterministic filters and returns ranked candidates with sources. 6 fields. 6 outcomes. 3 e"
---

# Ai Stock Screener Blueprint

> AI-assisted stock screener that parses natural-language queries into deterministic filters and returns ranked candidates with sources

| | |
|---|---|
| **Feature** | `ai-stock-screener` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | screener, ai, nlp, filters, equity-research, ranking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/ai-stock-screener.blueprint.yaml) |
| **JSON API** | [ai-stock-screener.json]({{ site.baseurl }}/api/blueprints/ai/ai-stock-screener.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `query_text` | text | Yes | Natural Language Query |  |
| `parsed_filters` | json | No | Parsed Filters |  |
| `universe` | select | Yes | Investment Universe |  |
| `ranking_metric` | select | No | Ranking Metric |  |
| `results` | json | No | Ranked Results |  |
| `data_sources` | json | No | Data Source Citations |  |

## Rules

- **deterministic_parsing:**
  - **description:** MUST: LLM only translates NL to a structured filter AST; ranking and data fetch are deterministic code paths
  - **no_llm_in_ranking:** true
- **no_hallucinated_tickers:**
  - **description:** MUST: Results only include tickers present in the selected universe; LLM never names securities directly
  - **whitelist_source:** universe
- **data_citation:**
  - **description:** MUST: Every metric in the result carries a data-source citation (vendor, field, as-of timestamp)
- **watermark:**
  - **description:** MUST: Results are clearly labelled AI-assisted; advisors must review before client use
- **ambiguity_handling:**
  - **description:** MUST: Ambiguous queries return a clarification prompt, never a guess
- **rate_limit:**
  - **description:** MUST: 30 screens per user per minute; LLM cost capped per user
  - **limit_per_minute:** 30
- **audit:**
  - **description:** MUST: Every query, parsed filter, and result set logged for compliance review
  - **retention_days:** 365

## Outcomes

### Query_ambiguous (Priority: 2) — Error: `SCREENER_QUERY_AMBIGUOUS`

_LLM could not confidently parse the query_

**Given:**
- LLM confidence below threshold or multiple valid interpretations

**Then:**
- **emit_event** event: `screener.query_ambiguous`

**Result:** Clarification prompt returned to user

### Data_missing (Priority: 3) — Error: `SCREENER_DATA_MISSING`

_Required metric unavailable for a material portion of the universe_

**Given:**
- required data field unavailable for more than 20% of the universe

**Then:**
- **notify** target: `data_team`
- **emit_event** event: `screener.data_missing`

**Result:** User warned; ranking may be biased

### No_results (Priority: 5)

_Filters valid but matched zero candidates_

**Given:**
- parsed filters valid
- candidate count is 0

**Then:**
- **emit_event** event: `screener.no_results`

**Result:** Empty result set with suggestion to relax filters

### Query_parsed (Priority: 9)

_Natural language translated to structured filter AST_

**Given:**
- LLM returned a valid filter AST

**Then:**
- **set_field** target: `parsed_filters` value: `ast`
- **emit_event** event: `screener.query_parsed`

**Result:** Filter AST available

### Screen_executed_successfully (Priority: 10) | Transaction: atomic

_Query parsed, filters applied, and results produced_

**Given:**
- `query_text` (input) exists
- parsed filters are non-empty and valid

**Then:**
- **emit_event** event: `screener.executed`

**Result:** Ranked candidates returned with citations

### Results_ranked (Priority: 10)

_Candidates ranked by selected metric_

**Given:**
- results are non-empty
- ranking_metric is set

**Then:**
- **emit_event** event: `screener.results_ranked`

**Result:** Ranked list presented

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCREENER_QUERY_AMBIGUOUS` | 422 | Please clarify your query. | Yes |
| `SCREENER_DATA_MISSING` | 503 | Required data is currently unavailable. | Yes |
| `SCREENER_RATE_LIMITED` | 429 | Too many screens; please slow down. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `screener.executed` | Screen executed successfully | `query_text`, `universe`, `result_count` |
| `screener.results_ranked` | Results ranked | `ranking_metric`, `result_count` |
| `screener.query_parsed` | NL query parsed to filter AST | `query_text`, `filter_count` |
| `screener.query_ambiguous` | Query ambiguous | `query_text` |
| `screener.no_results` | No candidates matched | `query_text`, `universe` |
| `screener.data_missing` | Required data missing | `missing_field`, `universe` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-ingestion | required | Fundamentals and prices come from the internal data store |
| ai-stock-research-assistant | recommended | Screener results feed into research workflow |
| immutable-audit-log | required | Queries and results are audited for compliance |

## AGI Readiness

### Goals

#### Reliable Screener

Turn natural-language screening intents into deterministic, cited, AI-assisted shortlists without hallucinations

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| parse_success_rate | >= 90% | Fraction of queries parsed without clarification |
| hallucination_rate | = 0% | Tickers returned that are not in the selected universe |

**Constraints:**

- **regulatory** (non-negotiable): AI-assisted disclosure must appear on output
- **security** (non-negotiable): User queries are scrubbed of PII before LLM call

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before acting on screener output (advisor review)

**Escalation Triggers:**

- `data_missing`
- `query_ambiguous`

### Verification

**Invariants:**

- every ticker returned is in the selected universe
- every metric has a citation
- LLM output constrained to filter AST schema

### Coordination

**Protocol:** `request_response`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| screen_executed_successfully | `autonomous` | - | - |
| query_parsed | `autonomous` | - | - |
| results_ranked | `autonomous` | - | - |
| trade_from_results | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ai Stock Screener Blueprint",
  "description": "AI-assisted stock screener that parses natural-language queries into deterministic filters and returns ranked candidates with sources. 6 fields. 6 outcomes. 3 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "screener, ai, nlp, filters, equity-research, ranking"
}
</script>
