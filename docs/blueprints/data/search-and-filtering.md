---
title: "Search And Filtering Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Full-text search with faceted filters, sorting, relevance scoring, fuzzy matching, and saved searches. 12 fields. 5 outcomes. 4 error codes. rules: search_index"
---

# Search And Filtering Blueprint

> Full-text search with faceted filters, sorting, relevance scoring, fuzzy matching, and saved searches

| | |
|---|---|
| **Feature** | `search-and-filtering` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | search, filtering, full-text, facets, sorting, relevance, fuzzy-matching |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/search-and-filtering.blueprint.yaml) |
| **JSON API** | [search-and-filtering.json]({{ site.baseurl }}/api/blueprints/data/search-and-filtering.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `query` | text | No | Search Query | Validations: maxLength |
| `filters` | json | No | Filter Array |  |
| `filter_field` | text | Yes | Filter Field Name |  |
| `filter_operator` | select | Yes | Filter Operator |  |
| `filter_value` | json | No | Filter Value |  |
| `sort_by` | text | No | Sort Field |  |
| `sort_order` | select | No | Sort Order |  |
| `page` | number | No | Page Number | Validations: min |
| `page_size` | number | No | Page Size | Validations: min, max |
| `saved_search_name` | text | No | Saved Search Name | Validations: maxLength |
| `total_results` | number | No | Total Result Count |  |
| `relevance_score` | number | No | Relevance Score |  |

## Rules

- **search_index:**
  - **configurable_fields:** true
  - **index_type:** inverted_index
  - **analyzer:** standard
- **query:**
  - **max_length:** 500
  - **min_length:** 1
  - **sanitize_input:** true
- **fuzzy_matching:**
  - **enabled:** true
  - **default_tolerance:** 2
  - **min_query_length_for_fuzzy:** 3
- **filters:**
  - **max_filters:** 20
  - **operators:** eq, neq, gt, gte, lt, lte, in, not_in, between, contains, not_contains, exists, not_exists
  - **validate_field_names:** true
- **sorting:**
  - **default_sort:** relevance
  - **allowed_sort_fields_configurable:** true
- **saved_searches:**
  - **max_per_user:** 50
  - **stores:** query, filters, sort_by, sort_order
- **rate_limiting:**
  - **max_requests_per_minute:** 60

## Outcomes

### Results_found (Priority: 1)

**Given:**
- a search request is submitted with valid parameters
- matching records exist in the index

**Then:**
- **set_field** target: `total_results` — Set total count of matching records
- **emit_event** event: `search.executed`

**Result:** Paginated results returned with relevance scores, total count, and facet counts

### No_results (Priority: 2)

**Given:**
- a search request is submitted with valid parameters
- no records match the query and filters

**Then:**
- **emit_event** event: `search.executed`

**Result:** Empty result set returned with suggestions (spelling corrections, relaxed filters)

### Search_saved (Priority: 3)

**Given:**
- user submits a saved search request with a name
- user is authenticated
- saved search count is below the per-user limit

**Then:**
- **create_record** target: `saved_search` — Persist query, filters, sort configuration under the given name
- **emit_event** event: `search.saved`

**Result:** Search configuration saved for future reuse

### Search_error (Priority: 10) — Error: `SEARCH_QUERY_INVALID`

**Given:**
- the search request contains invalid parameters
- filter references a non-existent field or uses an unsupported operator

**Result:** Error returned describing which parameters are invalid

### Search_timeout (Priority: 11) — Error: `SEARCH_TIMEOUT`

**Given:**
- search execution exceeds the configured timeout threshold

**Result:** Timeout error returned; client may retry with narrower filters

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SEARCH_QUERY_INVALID` | 400 | Search query or filter parameters are invalid | No |
| `SEARCH_TIMEOUT` | 503 | Search request timed out; try narrowing your query | No |
| `SEARCH_RATE_LIMITED` | 429 | Too many search requests; please try again shortly | No |
| `SAVED_SEARCH_LIMIT_REACHED` | 400 | Maximum number of saved searches reached | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `search.executed` | A search query was executed (regardless of result count) | `query`, `filters`, `sort_by`, `result_count`, `response_time_ms` |
| `search.saved` | A search configuration was saved by a user | `saved_search_id`, `user_id`, `search_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pagination | required | Search results must be paginated for performance and usability |
| caching | recommended | Frequently executed searches benefit from result caching |
| audit-trail | optional | Search activity can be recorded for analytics and compliance |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Search And Filtering Blueprint",
  "description": "Full-text search with faceted filters, sorting, relevance scoring, fuzzy matching, and saved searches. 12 fields. 5 outcomes. 4 error codes. rules: search_index",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "search, filtering, full-text, facets, sorting, relevance, fuzzy-matching"
}
</script>
