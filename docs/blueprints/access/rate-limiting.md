---
title: "Rate Limiting Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse. 11 fields. 4 outcomes. 3 error codes. rules: algorithms, headers"
---

# Rate Limiting Blueprint

> Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse

| | |
|---|---|
| **Feature** | `rate-limiting` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | rate-limiting, throttling, api-protection, security, ddos, abuse-prevention, middleware |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/rate-limiting.blueprint.yaml) |
| **JSON API** | [rate-limiting.json]({{ site.baseurl }}/api/blueprints/access/rate-limiting.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rule_id` | text | Yes | Rate Limit Rule ID | Validations: required |
| `scope` | select | Yes | Scope | Validations: required |
| `endpoint` | text | No | Endpoint Pattern | Validations: maxLength |
| `algorithm` | select | Yes | Algorithm | Validations: required |
| `limit` | number | Yes | Request Limit | Validations: required, min, max |
| `window_seconds` | number | Yes | Window (seconds) | Validations: required, min, max |
| `burst_allowance` | number | No | Burst Allowance | Validations: min |
| `current_count` | number | No | Current Request Count |  |
| `remaining` | number | No | Remaining Requests |  |
| `reset_at` | datetime | No | Window Reset Time |  |
| `retry_after_seconds` | number | No | Retry After (seconds) |  |

## Rules

- **algorithms:**
  - **fixed_window:**
    - **description:** Count requests in fixed time buckets (e.g., per minute from :00 to :59)
    - **reset_behavior:** hard_reset
  - **sliding_window:**
    - **description:** Weighted average of current and previous window counts
    - **weight_formula:** previous_window_count * (1 - elapsed_ratio) + current_count
  - **token_bucket:**
    - **description:** Tokens replenish at a steady rate, requests consume tokens
    - **refill_rate:** limit / window_seconds
    - **max_tokens:** limit + burst_allowance
- **headers:**
  - **x_ratelimit_limit:** true
  - **x_ratelimit_remaining:** true
  - **x_ratelimit_reset:** true
  - **retry_after:** true
- **storage:**
  - **backend:** redis
  - **fallback:** in_memory
  - **key_prefix:** rl:
  - **key_format:** rl:{scope}:{identifier}:{endpoint}:{window}
- **bypass:**
  - **allowlist_ips:** 
  - **allowlist_api_keys:** 
- **escalation:**
  - **warning_threshold_percent:** 80
  - **ban_threshold_consecutive_429s:** 50
  - **ban_duration_minutes:** 60

## Outcomes

### Rate_limit_exceeded (Priority: 1) — Error: `RATE_LIMIT_EXCEEDED`

**Given:**
- `current_count` (computed) gte `limit`

**Then:**
- **emit_event** event: `rate_limit.exceeded`

**Result:** reject request with 429 status, Retry-After header, and rate limit headers

### Burst_allowed (Priority: 2)

**Given:**
- `algorithm` (db) eq `token_bucket`
- `current_count` (computed) gte `limit`
- `current_count` (computed) lt `limit + burst_allowance`

**Then:**
- **set_field** target: `current_count` value: `increment` — Consume burst token
- **emit_event** event: `rate_limit.burst_used`

**Result:** allow request using burst allowance and set headers

### Rate_limit_warning (Priority: 3)

**Given:**
- `current_count` (computed) gte `limit * 0.8`
- `current_count` (computed) lt `limit`

**Then:**
- **set_field** target: `current_count` value: `increment` — Increment the request counter
- **emit_event** event: `rate_limit.warning`

**Result:** allow request but emit warning event for monitoring

### Request_allowed (Priority: 5)

**Given:**
- `current_count` (computed) lt `limit`

**Then:**
- **set_field** target: `current_count` value: `increment` — Increment the request counter for this scope/window
- **set_field** target: `remaining` value: `limit - current_count - 1` — Calculate remaining requests for response header

**Result:** allow request and set rate limit response headers

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests. Please try again later. | Yes |
| `RATE_LIMIT_CONFIG_INVALID` | 422 | Invalid rate limit configuration | No |
| `RATE_LIMIT_STORAGE_ERROR` | 503 | Rate limit service temporarily unavailable | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rate_limit.exceeded` | Request rejected because rate limit was exceeded | `scope`, `identifier`, `endpoint`, `limit`, `window_seconds`, `ip_address`, `timestamp` |
| `rate_limit.warning` | Request count approaching the configured limit (80% threshold) | `scope`, `identifier`, `endpoint`, `current_count`, `limit`, `window_seconds` |
| `rate_limit.burst_used` | Request allowed using burst allowance (token bucket) | `scope`, `identifier`, `endpoint`, `burst_remaining`, `timestamp` |
| `rate_limit.ban_triggered` | Source temporarily banned after excessive consecutive 429s | `scope`, `identifier`, `ban_duration_minutes`, `consecutive_429_count`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | recommended | Login endpoints should have strict rate limits to prevent brute force |
| role-based-access | optional | Rate limit rules can vary by user role or API key tier |
| audit-logging | optional | Rate limit violations can be recorded in the audit trail |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: table_with_detail
max_width: 1100px
actions:
  primary:
    label: Create Rule
    type: submit
  secondary:
    label: View Metrics
    type: button
fields_order:
  - scope
  - endpoint
  - algorithm
  - limit
  - window_seconds
  - burst_allowance
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Rate Limiting Blueprint",
  "description": "Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse. 11 fields. 4 outcomes. 3 error codes. rules: algorithms, headers",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rate-limiting, throttling, api-protection, security, ddos, abuse-prevention, middleware"
}
</script>
