<!-- AUTO-GENERATED FROM rate-limiting.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Rate Limiting

> Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse

**Category:** Access · **Version:** 1.0.0 · **Tags:** rate-limiting · throttling · api-protection · security · ddos · abuse-prevention · middleware

## What this does

Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **rule_id** *(text, required)* — Rate Limit Rule ID
- **scope** *(select, required)* — Scope
- **endpoint** *(text, optional)* — Endpoint Pattern
- **algorithm** *(select, required)* — Algorithm
- **limit** *(number, required)* — Request Limit
- **window_seconds** *(number, required)* — Window (seconds)
- **burst_allowance** *(number, optional)* — Burst Allowance
- **current_count** *(number, optional)* — Current Request Count
- **remaining** *(number, optional)* — Remaining Requests
- **reset_at** *(datetime, optional)* — Window Reset Time
- **retry_after_seconds** *(number, optional)* — Retry After (seconds)

## What must be true

- **algorithms → fixed_window:** Count requests in fixed time buckets (e.g., per minute from :00 to :59)
- **algorithms → fixed_window → reset_behavior:** hard_reset
- **algorithms → sliding_window:** Weighted average of current and previous window counts
- **algorithms → sliding_window → weight_formula:** previous_window_count * (1 - elapsed_ratio) + current_count
- **algorithms → token_bucket:** Tokens replenish at a steady rate, requests consume tokens
- **algorithms → token_bucket → refill_rate:** limit / window_seconds
- **algorithms → token_bucket → max_tokens:** limit + burst_allowance
- **headers → x_ratelimit_limit:** true
- **headers → x_ratelimit_remaining:** true
- **headers → x_ratelimit_reset:** true
- **headers → retry_after:** true
- **storage → backend:** redis
- **storage → fallback:** in_memory
- **storage → key_prefix:** rl:
- **storage → key_format:** rl:{scope}:{identifier}:{endpoint}:{window}
- **escalation → warning_threshold_percent:** 80
- **escalation → ban_threshold_consecutive_429s:** 50
- **escalation → ban_duration_minutes:** 60

## Success & failure scenarios

**✅ Success paths**

- **Burst Allowed** — when Token bucket algorithm is in use; Base limit exceeded; But within burst allowance, then allow request using burst allowance and set headers.
- **Rate Limit Warning** — when Request count has reached 80% of limit; But not yet at the limit, then allow request but emit warning event for monitoring.
- **Request Allowed** — when Request count is below the configured limit, then allow request and set rate limit response headers.

**❌ Failure paths**

- **Rate Limit Exceeded** — when Request count has reached or exceeded the limit, then reject request with 429 status, Retry-After header, and rate limit headers. *(error: `RATE_LIMIT_EXCEEDED`)*

## Errors it can return

- `RATE_LIMIT_EXCEEDED` — Too many requests. Please try again later.
- `RATE_LIMIT_CONFIG_INVALID` — Invalid rate limit configuration
- `RATE_LIMIT_STORAGE_ERROR` — Rate limit service temporarily unavailable

## Connects to

- **login** *(recommended)* — Login endpoints should have strict rate limits to prevent brute force
- **role-based-access** *(optional)* — Rate limit rules can vary by user role or API key tier
- **audit-logging** *(optional)* — Rate limit violations can be recorded in the audit trail

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/rate-limiting/) · **Spec source:** [`rate-limiting.blueprint.yaml`](./rate-limiting.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
