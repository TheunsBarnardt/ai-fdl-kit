---
title: "Pagination Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Cursor-based and offset-based pagination with configurable page sizes, stable sorting, and Link header support for REST APIs. 8 fields. 5 outcomes. 3 error code"
---

# Pagination Blueprint

> Cursor-based and offset-based pagination with configurable page sizes, stable sorting, and Link header support for REST APIs

| | |
|---|---|
| **Feature** | `pagination` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | pagination, cursor, offset, paging, rest-api, list |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/pagination.blueprint.yaml) |
| **JSON API** | [pagination.json]({{ site.baseurl }}/api/blueprints/data/pagination.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `page` | number | No | Page Number (offset-based) | Validations: min |
| `page_size` | number | No | Items Per Page | Validations: min, max |
| `cursor` | text | No | Pagination Cursor |  |
| `total_count` | number | No | Total Record Count |  |
| `has_next` | boolean | Yes | Has Next Page |  |
| `has_previous` | boolean | Yes | Has Previous Page |  |
| `next_cursor` | text | No | Next Page Cursor |  |
| `previous_cursor` | text | No | Previous Page Cursor |  |

## Rules

- **offset_based:**
  - **default_page_size:** 20
  - **max_page_size:** 100
  - **includes_total_count:** true
  - **max_offset:** 10000
- **cursor_based:**
  - **preferred_for_large_datasets:** true
  - **cursor_encoding:** opaque_base64
  - **stable_sort_required:** true
  - **no_total_count:** true
- **link_headers:**
  - **enabled:** true
  - **format:** RFC 8288
- **response_metadata:**
  - **offset_fields:** page, page_size, total_count, has_next, has_previous
  - **cursor_fields:** page_size, has_next, has_previous, next_cursor, previous_cursor

## Outcomes

### Page_returned (Priority: 1)

**Given:**
- a paginated list request is made with valid parameters
- records exist for the requested page

**Then:**
- **set_field** target: `has_next` — Set to true if more records exist beyond the current page
- **set_field** target: `has_previous` — Set to true if records exist before the current page

**Result:** Page of results returned with pagination metadata and Link headers

### Empty_page (Priority: 2)

**Given:**
- a paginated list request is made with valid parameters
- no records exist for the requested page (page beyond last or empty dataset)

**Then:**
- **set_field** target: `has_next` value: `false`
- **set_field** target: `has_previous` — Set based on whether earlier pages have records

**Result:** Empty array returned with pagination metadata indicating no more results

### Invalid_cursor (Priority: 3) — Error: `PAGINATION_INVALID_CURSOR`

**Given:**
- a cursor-based request is made
- the cursor token is malformed, expired, or references deleted data

**Result:** Error returned instructing client to restart pagination from the beginning

### Page_size_exceeded (Priority: 4) — Error: `PAGINATION_PAGE_SIZE_EXCEEDED`

**Given:**
- requested page_size exceeds the maximum allowed (100)

**Result:** Error returned indicating the maximum page size

### Offset_too_deep (Priority: 5) — Error: `PAGINATION_OFFSET_TOO_DEEP`

**Given:**
- offset-based pagination is used
- `page` (input) gt `500`

**Result:** Error returned suggesting client switch to cursor-based pagination

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAGINATION_INVALID_CURSOR` | 400 | Invalid or expired pagination cursor; please restart from the first page | No |
| `PAGINATION_PAGE_SIZE_EXCEEDED` | 400 | Page size must not exceed 100 | No |
| `PAGINATION_OFFSET_TOO_DEEP` | 400 | Offset too large; use cursor-based pagination for deep result sets | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pagination.page_served` | A page of results was served to a client | `page_or_cursor`, `page_size`, `result_count`, `has_next` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| search-and-filtering | recommended | Search results are typically paginated |
| caching | optional | Paginated responses can be cached by page/cursor key |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pagination Blueprint",
  "description": "Cursor-based and offset-based pagination with configurable page sizes, stable sorting, and Link header support for REST APIs. 8 fields. 5 outcomes. 3 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "pagination, cursor, offset, paging, rest-api, list"
}
</script>
