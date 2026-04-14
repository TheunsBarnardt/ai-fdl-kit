<!-- AUTO-GENERATED FROM rate-limiting-abuse-prevention.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Rate Limiting Abuse Prevention

> Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users when limits are exceeded

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** rate-limiting · abuse-prevention · captcha · push-challenge · leaky-bucket · security

## What this does

Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users when limits are exceeded

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **rate_limiter_name** *(text, required)* — Rate Limiter Name
- **subject_key** *(text, required)* — Subject Key
- **bucket_size** *(number, required)* — Bucket Size (permits)
- **permit_regeneration_duration** *(text, required)* — Permit Regeneration Duration
- **fail_open** *(boolean, optional)* — Fail Open
- **retry_after_seconds** *(number, optional)* — Retry After (seconds)
- **challenge_token** *(token, optional)* — Challenge Token
- **challenge_type** *(select, optional)* — Challenge Type
- **captcha_response** *(text, optional)* — CAPTCHA Response
- **challenge_ttl_minutes** *(number, optional)* — Challenge TTL (minutes)

## What must be true

- **leaky_bucket → storage:** distributed_in_memory
- **leaky_bucket → atomicity:** lua_script
- **leaky_bucket → retry_after_calculation:** deficit_divided_by_leak_rate
- **leaky_bucket → fail_open_default:** false
- **push_challenge → token_length_bytes:** 16
- **push_challenge → storage:** durable_key_value_store
- **push_challenge → ttl_minutes:** 5
- **push_challenge → one_time_use:** true
- **push_challenge → requires_registered_push_token:** true
- **push_challenge → targets_primary_device_only:** true
- **captcha_challenge → verification:** external_captcha_service
- **captcha_challenge → score_threshold:** configurable_per_request
- **captcha_challenge → client_metadata_used:** ip_address, user_agent
- **challenge_rate_limits → push_attempt_limiter:** per_account
- **challenge_rate_limits → push_success_limiter:** per_account
- **challenge_rate_limits → captcha_attempt_limiter:** per_account
- **challenge_rate_limits → captcha_success_limiter:** per_account
- **challenge_rate_limits → rate_limit_reset_limiter:** per_account

## Success & failure scenarios

**✅ Success paths**

- **Push Challenge Invalid** — when submitted push challenge token does not match the stored token or has expired, then Challenge silently rejected (token not consumed); rate limiters remain in effect.
- **Permit Granted** — when subject_key exists; leaky bucket has sufficient permits for the requested amount after accounting for the current fill level and elapsed time, then Request proceeds normally; no response header added.
- **Push Challenge Sent** — when account has a registered push token on its primary device; push challenge issuance is permitted by the per-request constraint checker, then Push notification with the challenge token dispatched to the account's primary device.
- **Push Challenge Verified** — when Client supplied a challenge token; submitted token matches the stored token for this account and has not expired; push challenge attempt rate limiter has permits; push challenge success rate limiter has permits; rate limit reset frequency limiter has permits, then Challenge accepted; associated rate limiters reset; client may retry the original request.
- **Captcha Challenge Verified** — when Client supplied a CAPTCHA solution; external CAPTCHA service validates the solution as genuine at or above the configured score threshold; captcha challenge attempt rate limiter has permits; captcha challenge success rate limiter has permits; rate limit reset frequency limiter has permits, then CAPTCHA accepted; associated rate limiters reset; client may retry the original request.

**❌ Failure paths**

- **Push Challenge No Token** — when account has no registered push token on its primary device, then 404 returned; client must register a push token before requesting a push challenge. *(error: `PUSH_CHALLENGE_NOT_REGISTERED`)*
- **Rate Limit Reset Exhausted** — when rate limit reset frequency limiter for this account is exhausted, then Request rejected with 429 Too Many Requests; challenge farming is blocked. *(error: `RATE_LIMIT_RESET_EXCEEDED`)*
- **Permit Denied** — when leaky bucket deficit after deduction is greater than zero, then Request rejected with 429 Too Many Requests and Retry-After header indicating the calculated wait. *(error: `RATE_LIMIT_EXCEEDED`)*
- **Captcha Challenge Failed** — when external CAPTCHA service rejects the solution or the score is below the configured threshold, then Request rejected with 428 Precondition Required; client must obtain a valid CAPTCHA solution. *(error: `CAPTCHA_CHALLENGE_FAILED`)*

## Errors it can return

- `RATE_LIMIT_EXCEEDED` — Request rate limit exceeded. Please wait before retrying.
- `PUSH_CHALLENGE_NOT_REGISTERED` — No push token registered for this device. Please update your push registration and try again.
- `CAPTCHA_CHALLENGE_FAILED` — CAPTCHA verification failed. Please try again.
- `RATE_LIMIT_RESET_EXCEEDED` — Too many rate limit resets. Please wait before attempting another challenge.

## Events

**`rate_limit.exceeded`** — A request was rejected because the leaky-bucket rate limiter had insufficient permits
  Payload: `rate_limiter_name`, `subject_key`, `retry_after_seconds`

**`rate_limit.push_challenge_sent`** — A push challenge notification was dispatched to the account's primary device
  Payload: `account_identifier`, `challenge_ttl_minutes`

**`rate_limit.challenge_answered`** — A challenge (push or CAPTCHA) was successfully verified and rate limiters were reset
  Payload: `account_identifier`, `challenge_type`

**`rate_limit.challenge_failed`** — A submitted challenge response was invalid
  Payload: `account_identifier`, `challenge_type`

**`rate_limit.reset_limit_exceeded`** — An account attempted to reset rate limits via challenge too frequently
  Payload: `account_identifier`

## Connects to

- **push-notification-delivery** *(required)* — Push challenges are delivered to devices via the push notification subsystem
- **caching** *(required)* — Leaky-bucket state is stored in a distributed in-memory cache with atomic Lua scripting
- **login** *(recommended)* — Authentication endpoints are typically among the first to be rate-limited

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/rate-limiting-abuse-prevention/) · **Spec source:** [`rate-limiting-abuse-prevention.blueprint.yaml`](./rate-limiting-abuse-prevention.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
