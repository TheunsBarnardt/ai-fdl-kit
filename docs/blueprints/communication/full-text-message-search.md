---
title: "Full Text Message Search Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Search message content across all channels accessible to the user, with pluggable search provider support and real-time result streaming. 9 fields. 7 outcomes. "
---

# Full Text Message Search Blueprint

> Search message content across all channels accessible to the user, with pluggable search provider support and real-time result streaming

| | |
|---|---|
| **Feature** | `full-text-message-search` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | search, messages, full-text, discovery, indexing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/full-text-message-search.blueprint.yaml) |
| **JSON API** | [full-text-message-search.json]({{ site.baseurl }}/api/blueprints/communication/full-text-message-search.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `searcher` | Searching User | human | Authenticated user performing a content search across messages |
| `search_provider` | Search Provider | system | Pluggable backend service that indexes messages and processes search queries; may be built-in or an external search engine |
| `index_worker` | Index Worker | system | Background process that keeps the search index up to date as messages, users, and channels change |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `query_text` | text | Yes | Search Query |  |
| `channel_id` | text | No | Channel Context |  |
| `user_id` | text | Yes | Searching User ID |  |
| `page_size` | number | No | Page Size |  |
| `page_token` | token | No | Page Token |  |
| `result_messages` | json | No | Message Results |  |
| `result_users` | json | No | User Results |  |
| `result_rooms` | json | No | Room Results |  |
| `suggestions` | json | No | Search Suggestions |  |

## Rules

- **general:** The searching user must be authenticated, A search provider must be active and configured; if no provider is active, search is unavailable, Search results are filtered to channels and messages the searching user has permission to access; no results from inaccessible channels are exposed, When a channel_id is provided, results are scoped to that channel only, Search supports pagination through an opaque page token passed in each subsequent request, The search provider is pluggable; the system exposes a standard interface so providers can be swapped without API changes, Provider settings (index size, stemming, language, etc.) are managed through the provider's own configuration, not the search API, Suggestion queries are distinct from result queries; a provider may support suggestions independently, The index is kept current via event-driven updates: user save/delete and channel save/delete events are forwarded to the index worker, Search results include message documents; providers may optionally include user and channel records in the same result set, The result format follows a standard envelope with start offset, total found count, and document array for each entity type, Search operations are asynchronous; the system waits for the provider to resolve before returning results, Errors from the provider (timeouts, index unavailability) are surfaced as search errors, not silent failures

## Outcomes

### User_not_authenticated (Priority: 1) — Error: `SEARCH_NOT_AUTHENTICATED`

**Given:**
- no authenticated user session exists

**Result:** Search rejected; user must be logged in

### No_provider_active (Priority: 2) — Error: `SEARCH_PROVIDER_UNAVAILABLE`

**Given:**
- no search provider is currently active or configured

**Result:** Search rejected; the search service is not available

### Empty_query (Priority: 3) — Error: `SEARCH_EMPTY_QUERY`

**Given:**
- query_text is empty or blank

**Result:** Search rejected; a non-empty search term is required

### Provider_error (Priority: 4) — Error: `SEARCH_PROVIDER_ERROR`

**Given:**
- search provider returns an error or times out

**Result:** Search failed; the search service encountered an error

### Suggestions_returned (Priority: 5)

**Given:**
- user is authenticated
- active search provider supports suggestions
- query_text is a partial term suitable for autocomplete

**Then:**
- **emit_event** event: `search.suggestions_returned`

**Result:** Autocomplete suggestion list is returned to the client for display

### Results_returned (Priority: 6)

**Given:**
- user is authenticated
- active search provider is available
- query_text is non-empty
- provider successfully executes the search

**Then:**
- **emit_event** event: `search.completed`

**Result:** Matching messages are returned ordered by relevance; users and rooms included if provider supports them

### No_results (Priority: 7)

**Given:**
- user is authenticated
- active search provider is available
- query_text is non-empty
- provider returns zero matching documents

**Then:**
- **emit_event** event: `search.completed`

**Result:** Empty result set returned; user sees a no-results message

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SEARCH_NOT_AUTHENTICATED` | 400 | You must be logged in to search messages | No |
| `SEARCH_PROVIDER_UNAVAILABLE` | 503 | Message search is not available at this time | No |
| `SEARCH_EMPTY_QUERY` | 400 | Please enter a search term | No |
| `SEARCH_PROVIDER_ERROR` | 400 | Search encountered an error; please try again | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `search.completed` | Fired when a search query returns results (including empty results) | `user_id`, `query_text`, `channel_id`, `result_messages` |
| `search.suggestions_returned` | Fired when autocomplete suggestions are returned for a partial query | `user_id`, `query_text`, `suggestions` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| direct-messaging | recommended | Search spans direct messages and channel messages accessible to the user |
| message-pinning | optional | Pinned messages are indexed and discoverable via search |
| message-starring | optional | Users may use search to find content they previously starred |
| file-upload-sharing | optional | Shared file messages with descriptions are included in search results |

## AGI Readiness

### Goals

#### Access Controlled Message Search

Return relevant message search results scoped strictly to channels the searching user has permission to access

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| result_access_compliance | 100% | Search results limited to accessible channels / total results returned |
| search_availability | 99% | Search requests served successfully / total requests when provider is active |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before switching the active search provider
- before reindexing the entire message corpus

### Verification

**Invariants:**

- results never include messages from channels the user cannot access
- search is unavailable when no provider is active
- empty query always returns SEARCH_EMPTY_QUERY error

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| results scoped to accessible channels | user has access to channel A but not channel B | search returns messages from both channels | only channel A messages are included in results |
| provider unavailability surfaced | no search provider is active | search is requested | SEARCH_PROVIDER_UNAVAILABLE error returned |

### Composability

**Capabilities:**

- `permission_filtered_search`: Query pluggable search provider and filter results to channels accessible by the requesting user
- `paginated_result_streaming`: Support paginated retrieval of search results via opaque page tokens

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | result_completeness | access filtering is mandatory even if it means returning fewer results than the provider found |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 5
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Full Text Message Search Blueprint",
  "description": "Search message content across all channels accessible to the user, with pluggable search provider support and real-time result streaming. 9 fields. 7 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "search, messages, full-text, discovery, indexing"
}
</script>
