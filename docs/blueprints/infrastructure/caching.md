---
title: "Caching Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Multi-tier caching with read-through, write-through, write-behind, and cache-aside strategies, stampede protection, and configurable invalidation. 7 fields. 5 o"
---

# Caching Blueprint

> Multi-tier caching with read-through, write-through, write-behind, and cache-aside strategies, stampede protection, and configurable invalidation

| | |
|---|---|
| **Feature** | `caching` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | caching, performance, redis, cdn, invalidation, ttl, stampede-protection |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/caching.blueprint.yaml) |
| **JSON API** | [caching.json]({{ site.baseurl }}/api/blueprints/infrastructure/caching.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `cache_key` | text | Yes | Cache Key | Validations: maxLength |
| `ttl_seconds` | number | No | Time-to-Live (seconds) | Validations: min, max |
| `invalidation_strategy` | select | Yes | Invalidation Strategy |  |
| `cache_tier` | select | Yes | Cache Tier |  |
| `cache_strategy` | select | Yes | Cache Strategy |  |
| `compressed` | boolean | No | Compression Enabled |  |
| `cache_tags` | json | No | Cache Tags |  |

## Rules

- **strategies:**
  - **read_through:**
    - **description:** Cache checks for key; on miss, loads from source, stores in cache, returns value
    - **automatic_population:** true
  - **write_through:**
    - **description:** Writes go to cache and source simultaneously; strong consistency
    - **consistency:** strong
  - **write_behind:**
    - **description:** Writes go to cache immediately; source updated asynchronously
    - **consistency:** eventual
    - **flush_interval_ms:** 1000
  - **cache_aside:**
    - **description:** Application manages cache explicitly; reads check cache first, writes update source and invalidate cache
    - **manual_management:** true
- **ttl:**
  - **max_ttl_seconds:** 604800
  - **default_ttl_seconds:** 3600
  - **jitter_percent:** 10
- **stampede_protection:**
  - **enabled:** true
  - **mutex_strategy:** true
  - **mutex_timeout_ms:** 5000
  - **probabilistic_early_expiry:** true
- **compression:**
  - **enabled:** true
  - **threshold_bytes:** 1024
  - **algorithm:** gzip
- **multi_tier:**
  - **enabled:** true
  - **tier_order:** memory, redis, cdn
  - **memory_max_entries:** 10000
- **tagging:**
  - **enabled:** true
  - **max_tags_per_entry:** 10
- **warming:**
  - **enabled:** true

## Outcomes

### Cache_hit (Priority: 1)

**Given:**
- a cache lookup is performed
- the key exists in the cache and has not expired

**Then:**
- **emit_event** event: `cache.hit`

**Result:** Cached value returned without hitting the data source

### Cache_miss (Priority: 2)

**Given:**
- a cache lookup is performed
- the key does not exist in the cache or has expired

**Then:**
- **emit_event** event: `cache.miss`

**Result:** Value fetched from data source; cache populated for subsequent requests

### Cache_invalidated (Priority: 3)

**Given:**
- ANY: a data change event triggers event-based invalidation OR a manual purge request is received OR tag-based invalidation is triggered

**Then:**
- **invalidate** target: `cache_key` — Remove entry from all cache tiers
- **emit_event** event: `cache.invalidated`

**Result:** Cache entry removed; next read will fetch from source

### Cache_warmed (Priority: 4)

**Given:**
- a cache warming job is triggered (startup or scheduled)
- a list of hot keys is available

**Then:**
- **emit_event** event: `cache.warmed`

**Result:** Cache pre-populated with frequently accessed data

### Cache_write_failed (Priority: 10) — Error: `CACHE_WRITE_FAILED`

**Given:**
- an attempt to write to the cache tier fails (e.g., Redis unavailable)

**Result:** Write proceeds to source; cache failure is logged but does not block the operation

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CACHE_WRITE_FAILED` | 500 | Failed to write to cache; operation completed against data source | No |
| `CACHE_INVALIDATION_FAILED` | 500 | Cache invalidation failed; stale data may be served temporarily | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cache.hit` | A cache lookup found a valid entry | `cache_key`, `cache_tier`, `ttl_remaining` |
| `cache.miss` | A cache lookup did not find a valid entry | `cache_key`, `cache_tier` |
| `cache.invalidated` | A cache entry was removed or expired | `cache_key`, `invalidation_reason`, `cache_tier` |
| `cache.warmed` | Cache warming job completed | `keys_warmed`, `cache_tier`, `duration_ms` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| search-and-filtering | optional | Search results benefit from caching for repeated queries |
| pagination | optional | Paginated results can be cached by page key |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Caching Blueprint",
  "description": "Multi-tier caching with read-through, write-through, write-behind, and cache-aside strategies, stampede protection, and configurable invalidation. 7 fields. 5 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "caching, performance, redis, cdn, invalidation, ttl, stampede-protection"
}
</script>
