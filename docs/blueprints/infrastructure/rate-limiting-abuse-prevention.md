---
title: "Rate Limiting Abuse Prevention Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users whe"
---

# Rate Limiting Abuse Prevention Blueprint

> Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users when limits are exceeded

| | |
|---|---|
| **Feature** | `rate-limiting-abuse-prevention` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | rate-limiting, abuse-prevention, captcha, push-challenge, leaky-bucket, security |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/rate-limiting-abuse-prevention.blueprint.yaml) |
| **JSON API** | [rate-limiting-abuse-prevention.json]({{ site.baseurl }}/api/blueprints/infrastructure/rate-limiting-abuse-prevention.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rate_limiter_name` | text | Yes | Rate Limiter Name |  |
| `subject_key` | text | Yes | Subject Key |  |
| `bucket_size` | number | Yes | Bucket Size (permits) | Validations: min |
| `permit_regeneration_duration` | text | Yes | Permit Regeneration Duration |  |
| `fail_open` | boolean | No | Fail Open |  |
| `retry_after_seconds` | number | No | Retry After (seconds) |  |
| `challenge_token` | token | No | Challenge Token |  |
| `challenge_type` | select | No | Challenge Type |  |
| `captcha_response` | text | No | CAPTCHA Response |  |
| `challenge_ttl_minutes` | number | No | Challenge TTL (minutes) |  |

## Rules

- **leaky_bucket:**
  - **storage:** distributed_in_memory
  - **atomicity:** lua_script
  - **retry_after_calculation:** deficit_divided_by_leak_rate
  - **fail_open_default:** false
- **push_challenge:**
  - **token_length_bytes:** 16
  - **storage:** durable_key_value_store
  - **ttl_minutes:** 5
  - **one_time_use:** true
  - **requires_registered_push_token:** true
  - **targets_primary_device_only:** true
- **captcha_challenge:**
  - **verification:** external_captcha_service
  - **score_threshold:** configurable_per_request
  - **client_metadata_used:** ip_address, user_agent
- **challenge_rate_limits:**
  - **push_attempt_limiter:** per_account
  - **push_success_limiter:** per_account
  - **captcha_attempt_limiter:** per_account
  - **captcha_success_limiter:** per_account
  - **rate_limit_reset_limiter:** per_account

## Outcomes

### Push_challenge_no_token (Priority: 1) — Error: `PUSH_CHALLENGE_NOT_REGISTERED`

**Given:**
- account has no registered push token on its primary device

**Result:** 404 returned; client must register a push token before requesting a push challenge

### Rate_limit_reset_exhausted (Priority: 1) — Error: `RATE_LIMIT_RESET_EXCEEDED`

**Given:**
- rate limit reset frequency limiter for this account is exhausted

**Then:**
- **emit_event** event: `rate_limit.reset_limit_exceeded`

**Result:** Request rejected with 429 Too Many Requests; challenge farming is blocked

### Permit_denied (Priority: 2) — Error: `RATE_LIMIT_EXCEEDED`

**Given:**
- leaky bucket deficit after deduction is greater than zero

**Then:**
- **emit_event** event: `rate_limit.exceeded`

**Result:** Request rejected with 429 Too Many Requests and Retry-After header indicating the calculated wait

### Push_challenge_invalid (Priority: 3)

**Given:**
- submitted push challenge token does not match the stored token or has expired

**Then:**
- **emit_event** event: `rate_limit.challenge_failed`

**Result:** Challenge silently rejected (token not consumed); rate limiters remain in effect

### Captcha_challenge_failed (Priority: 3) — Error: `CAPTCHA_CHALLENGE_FAILED`

**Given:**
- external CAPTCHA service rejects the solution or the score is below the configured threshold

**Then:**
- **emit_event** event: `rate_limit.challenge_failed`

**Result:** Request rejected with 428 Precondition Required; client must obtain a valid CAPTCHA solution

### Permit_granted (Priority: 10)

**Given:**
- `subject_key` (input) exists
- leaky bucket has sufficient permits for the requested amount after accounting for the current fill level and elapsed time

**Then:**
- **set_field** target: `bucket_level` — Atomically deduct permits from the bucket and record the current timestamp

**Result:** Request proceeds normally; no response header added

### Push_challenge_sent (Priority: 10)

**Given:**
- account has a registered push token on its primary device
- push challenge issuance is permitted by the per-request constraint checker

**Then:**
- **create_record** target: `challenge` — Generate a 16-byte random token, persist it with a 5-minute TTL, and dispatch it to the primary device via push notification
- **emit_event** event: `rate_limit.push_challenge_sent`

**Result:** Push notification with the challenge token dispatched to the account's primary device

### Push_challenge_verified (Priority: 10)

**Given:**
- `challenge_token` (input) exists
- submitted token matches the stored token for this account and has not expired
- push challenge attempt rate limiter has permits
- push challenge success rate limiter has permits
- rate limit reset frequency limiter has permits

**Then:**
- **delete_record** target: `push_challenge_token` — Consume and delete the one-time token
- **set_field** target: `rate_limiters` — Reset the relevant leaky-bucket rate limiters for the account
- **emit_event** event: `rate_limit.challenge_answered`

**Result:** Challenge accepted; associated rate limiters reset; client may retry the original request

### Captcha_challenge_verified (Priority: 10)

**Given:**
- `captcha_response` (input) exists
- external CAPTCHA service validates the solution as genuine at or above the configured score threshold
- captcha challenge attempt rate limiter has permits
- captcha challenge success rate limiter has permits
- rate limit reset frequency limiter has permits

**Then:**
- **set_field** target: `rate_limiters` — Reset the relevant leaky-bucket rate limiters for the account
- **emit_event** event: `rate_limit.challenge_answered`

**Result:** CAPTCHA accepted; associated rate limiters reset; client may retry the original request

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RATE_LIMIT_EXCEEDED` | 429 | Request rate limit exceeded. Please wait before retrying. | Yes |
| `PUSH_CHALLENGE_NOT_REGISTERED` | 404 | No push token registered for this device. Please update your push registration and try again. | No |
| `CAPTCHA_CHALLENGE_FAILED` | 422 | CAPTCHA verification failed. Please try again. | Yes |
| `RATE_LIMIT_RESET_EXCEEDED` | 429 | Too many rate limit resets. Please wait before attempting another challenge. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rate_limit.exceeded` | A request was rejected because the leaky-bucket rate limiter had insufficient permits | `rate_limiter_name`, `subject_key`, `retry_after_seconds` |
| `rate_limit.push_challenge_sent` | A push challenge notification was dispatched to the account's primary device | `account_identifier`, `challenge_ttl_minutes` |
| `rate_limit.challenge_answered` | A challenge (push or CAPTCHA) was successfully verified and rate limiters were reset | `account_identifier`, `challenge_type` |
| `rate_limit.challenge_failed` | A submitted challenge response was invalid | `account_identifier`, `challenge_type` |
| `rate_limit.reset_limit_exceeded` | An account attempted to reset rate limits via challenge too frequently | `account_identifier` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| push-notification-delivery | required | Push challenges are delivered to devices via the push notification subsystem |
| caching | required | Leaky-bucket state is stored in a distributed in-memory cache with atomic Lua scripting |
| login | recommended | Authentication endpoints are typically among the first to be rate-limited |

## AGI Readiness

### Goals

#### Reliable Rate Limiting Abuse Prevention

Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users when limits are exceeded

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `push_notification_delivery` | push-notification-delivery | fail |
| `caching` | caching | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| permit_granted | `autonomous` | - | - |
| permit_denied | `autonomous` | - | - |
| push_challenge_sent | `autonomous` | - | - |
| push_challenge_no_token | `autonomous` | - | - |
| push_challenge_verified | `autonomous` | - | - |
| push_challenge_invalid | `autonomous` | - | - |
| captcha_challenge_verified | `autonomous` | - | - |
| captcha_challenge_failed | `autonomous` | - | - |
| rate_limit_reset_exhausted | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Rate Limiting Abuse Prevention Blueprint",
  "description": "Leaky-bucket rate limiting backed by distributed in-memory storage, with push-challenge and CAPTCHA-challenge flows that restore access for legitimate users whe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rate-limiting, abuse-prevention, captcha, push-challenge, leaky-bucket, security"
}
</script>
