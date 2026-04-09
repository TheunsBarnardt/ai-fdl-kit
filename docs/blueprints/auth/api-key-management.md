---
title: "Api Key Management Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Create, rotate, revoke, and scope API keys for programmatic access. 12 fields. 8 outcomes. 8 error codes. rules: security, rotation, expiration. AGI: supervised"
---

# Api Key Management Blueprint

> Create, rotate, revoke, and scope API keys for programmatic access

| | |
|---|---|
| **Feature** | `api-key-management` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, api-key, security, programmatic-access, developer |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/api-key-management.blueprint.yaml) |
| **JSON API** | [api-key-management.json]({{ site.baseurl }}/api/blueprints/auth/api-key-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `key_id` | text | Yes | Key ID | Validations: required |
| `key_hash` | hidden | Yes | Key Hash |  |
| `key_prefix` | text | Yes | Key Prefix | Validations: maxLength |
| `name` | text | Yes | Key Name | Validations: required, maxLength, minLength |
| `scopes` | multiselect | Yes | Permissions | Validations: required |
| `expires_at` | datetime | No | Expiration Date |  |
| `last_used_at` | datetime | No | Last Used |  |
| `last_used_ip` | text | No | Last Used IP |  |
| `created_by` | text | Yes | Created By | Validations: required |
| `created_at` | datetime | Yes | Created At |  |
| `revoked_at` | datetime | No | Revoked At |  |
| `environment` | select | Yes | Environment | Validations: required, oneOf |

## Rules

- **security:**
  - **key_generation:**
    - **algorithm:** cryptographic_random
    - **length_bytes:** 32
    - **format:** sk_{environment}_{random}
    - **prefix_live:** sk_live_
    - **prefix_test:** sk_test_
    - **show_once:** true
  - **storage:**
    - **hash_algorithm:** sha256
    - **never_store_plaintext:** true
  - **rate_limit_per_key:**
    - **default_window_seconds:** 60
    - **default_max_requests:** 100
    - **burst_allowance:** 20
  - **max_keys_per_user:** 25
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_user
- **rotation:**
  - **grace_period_hours:** 24
  - **notify_on_rotation:** true
- **expiration:**
  - **warn_before_days:** 7
  - **auto_revoke_on_expiry:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `API_KEY_RATE_LIMITED`

**Given:**
- `management_request_count` (computed) gt `10`

**Result:** show "Too many requests. Please wait a moment."

### Max_keys_exceeded (Priority: 2) — Error: `API_KEY_LIMIT_EXCEEDED`

**Given:**
- `active_key_count` (db) gte `25`

**Result:** show "Maximum number of API keys reached. Please revoke unused keys."

### Create_key (Priority: 5) | Transaction: atomic

**Given:**
- `name` (input) exists
- `scopes` (input) exists
- `active_key_count` (db) lt `25`

**Then:**
- **create_record** target: `api_key` — Generate cryptographic random key, store hash only
- **emit_event** event: `api_key.created`

**Result:** show full key ONCE — warn user to copy it now as it cannot be retrieved again

### Rotate_key (Priority: 6) | Transaction: atomic

**Given:**
- `target_key` (db) exists
- `target_key_revoked_at` (db) not_exists
- `target_key_created_by` (db) eq `current_user_id`

**Then:**
- **create_record** target: `new_api_key` — Generate new key with same name, scopes, and environment
- **set_field** target: `old_key_grace_expiry` value: `now + 24h` — Old key remains valid for 24-hour grace period
- **emit_event** event: `api_key.rotated`

**Result:** show new key ONCE — old key valid for 24 more hours

### Revoke_key (Priority: 7) | Transaction: atomic

**Given:**
- `target_key` (db) exists
- `target_key_revoked_at` (db) not_exists
- `target_key_created_by` (db) eq `current_user_id`

**Then:**
- **set_field** target: `revoked_at` value: `now`
- **invalidate** target: `api_key` — Immediately invalidate the key hash
- **emit_event** event: `api_key.revoked`

**Result:** key revoked — all requests using this key will be rejected immediately

### Authenticate_with_key (Priority: 8)

**Given:**
- `api_key` (request) exists
- `api_key_hash` (computed) eq `stored_key_hash`
- `key_revoked_at` (db) not_exists
- ALL: ANY: `key_expires_at` (db) not_exists OR `key_expires_at` (db) gt `now`

**Then:**
- **set_field** target: `last_used_at` value: `now`
- **set_field** target: `last_used_ip` value: `request_ip`
- **emit_event** event: `api_key.used`

**Result:** request authenticated — enforce scopes on subsequent authorization checks

### Key_expired (Priority: 9) — Error: `API_KEY_EXPIRED`

**Given:**
- `api_key_hash` (computed) eq `stored_key_hash`
- `key_expires_at` (db) lte `now`

**Then:**
- **set_field** target: `revoked_at` value: `now` — Auto-revoke expired key
- **emit_event** event: `api_key.expired`

**Result:** show "API key has expired. Please generate a new key."

### Invalid_key (Priority: 10) — Error: `API_KEY_INVALID`

**Given:**
- `api_key` (request) exists
- `api_key_hash` (computed) neq `stored_key_hash`

**Then:**
- **emit_event** event: `api_key.invalid_attempt`

**Result:** return 401 Unauthorized (generic message — do not reveal whether key exists)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `API_KEY_RATE_LIMITED` | 429 | Too many requests. Please wait a moment. | Yes |
| `API_KEY_LIMIT_EXCEEDED` | 409 | Maximum number of API keys reached. Please revoke unused keys. | No |
| `API_KEY_INVALID` | 401 | Invalid API key | No |
| `API_KEY_EXPIRED` | 401 | API key has expired | No |
| `API_KEY_REVOKED` | 401 | API key has been revoked | No |
| `API_KEY_INSUFFICIENT_SCOPE` | 403 | API key does not have the required permissions | No |
| `API_KEY_NOT_FOUND` | 404 | API key not found | No |
| `API_KEY_PER_KEY_RATE_LIMITED` | 429 | Rate limit exceeded for this API key | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `api_key.created` | New API key generated | `user_id`, `key_id`, `key_prefix`, `name`, `scopes`, `environment`, `timestamp` |
| `api_key.rotated` | API key rotated — new key issued, old key in grace period | `user_id`, `old_key_id`, `new_key_id`, `key_prefix`, `timestamp` |
| `api_key.revoked` | API key permanently revoked | `user_id`, `key_id`, `key_prefix`, `name`, `timestamp` |
| `api_key.used` | API key used to authenticate a request | `key_id`, `key_prefix`, `timestamp`, `ip_address`, `endpoint` |
| `api_key.expired` | API key auto-revoked due to expiration | `key_id`, `key_prefix`, `timestamp` |
| `api_key.invalid_attempt` | Request made with an invalid API key | `key_prefix`, `timestamp`, `ip_address` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | User must be authenticated to manage API keys |
| session-management | recommended | API key management requires an active session |
| multi-factor-auth | recommended | MFA should be required before creating live API keys |

## AGI Readiness

### Goals

#### Reliable Api Key Management

Create, rotate, revoke, and scope API keys for programmatic access

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
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
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `login` | login | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| max_keys_exceeded | `autonomous` | - | - |
| create_key | `supervised` | - | - |
| rotate_key | `autonomous` | - | - |
| revoke_key | `human_required` | - | - |
| authenticate_with_key | `autonomous` | - | - |
| key_expired | `autonomous` | - | - |
| invalid_key | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column
max_width: 720px
key_list:
  show_name: true
  show_prefix: true
  show_scopes: true
  show_last_used: true
  show_created_at: true
  show_expires_at: true
  show_environment_badge: true
  sort_by: created_at
  sort_order: descending
key_creation:
  show_key_once_warning: true
  copy_button: true
  show_scopes_checklist: true
  confirm_before_create: true
key_display:
  mask_key: true
actions:
  primary:
    label: Create API Key
    type: button
  per_key:
    rotate:
      label: Rotate
      type: button
      confirm: true
    revoke:
      label: Revoke
      type: button
      style: danger
      confirm: true
accessibility:
  aria_live_region: true
  copy_confirmation: API key copied to clipboard
loading:
  show_skeleton: true
  disable_button: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Api Key Management Blueprint",
  "description": "Create, rotate, revoke, and scope API keys for programmatic access. 12 fields. 8 outcomes. 8 error codes. rules: security, rotation, expiration. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, api-key, security, programmatic-access, developer"
}
</script>
