---
title: "Session Management Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Active session listing, device tracking, and session revocation. 13 fields. 8 outcomes. 6 error codes. rules: security, device_tracking. AGI: supervised"
---

# Session Management Blueprint

> Active session listing, device tracking, and session revocation

| | |
|---|---|
| **Feature** | `session-management` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, session, security, device-tracking, identity |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/session-management.blueprint.yaml) |
| **JSON API** | [session-management.json]({{ site.baseurl }}/api/blueprints/auth/session-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `session_id` | token | Yes | Session ID | Validations: required |
| `user_id` | text | Yes | User ID | Validations: required |
| `device_browser` | text | No | Browser |  |
| `device_os` | text | No | Operating System |  |
| `device_ip` | text | No | IP Address |  |
| `device_location` | text | No | Approximate Location |  |
| `device_type` | select | No | Device Type |  |
| `created_at` | datetime | Yes | Session Created |  |
| `last_active_at` | datetime | Yes | Last Active |  |
| `expires_at` | datetime | Yes | Session Expires |  |
| `revoked_at` | datetime | No | Session Revoked |  |
| `is_current` | boolean | No | Current Session |  |
| `user_agent` | text | No | User Agent | Validations: maxLength |

## Rules

- **security:**
  - **session_id:**
    - **entropy_bytes:** 32
    - **storage:** server_side
  - **concurrent_sessions:**
    - **max_per_user:** 5
    - **enforcement:** evict_oldest
    - **notify_on_new_device:** true
  - **idle_timeout_minutes:** 30
  - **absolute_timeout_hours:** 24
  - **ip_binding:**
    - **enabled:** false
    - **warn_on_ip_change:** true
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_user
  - **revocation:**
    - **immediate:** true
    - **propagation:** synchronous
- **device_tracking:**
  - **fingerprint:** false
  - **parse_user_agent:** true
  - **geo_ip_lookup:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `SESSION_RATE_LIMITED`

**Given:**
- `request_count` (computed) gt `10`

**Result:** show "Too many requests. Please wait a moment."

### Session_not_found (Priority: 2) — Error: `SESSION_NOT_FOUND`

**Given:**
- `target_session` (db) not_exists

**Result:** show "Session not found."

### Unauthorized_revocation (Priority: 3) — Error: `SESSION_UNAUTHORIZED`

**Given:**
- `target_session_user_id` (db) neq `current_user_id`

**Result:** show "You do not have permission to manage this session."

### List_active_sessions (Priority: 5)

**Given:**
- `user_id` (session) exists

**Then:**
- **emit_event** event: `session.listed`

**Result:** return list of active sessions with device info, marking the current session

### Create_session (Priority: 6) | Transaction: atomic

**Given:**
- `user_id` (input) exists

**Then:**
- **create_record** target: `session` — Create new session with device info and expiry
- **set_field** target: `oldest_session` value: `revoked` when: `active_session_count >= 5` — Evict oldest session if concurrent limit exceeded
- **emit_event** event: `session.created`
- **emit_event** event: `session.evicted` when: `active_session_count >= 5`

**Result:** session created with device tracking metadata

### Revoke_single_session (Priority: 7) — Error: `SESSION_ALREADY_REVOKED` | Transaction: atomic

**Given:**
- `target_session` (db) exists
- `target_session_user_id` (db) eq `current_user_id`
- `target_session` (input) neq `current_session_id`

**Then:**
- **set_field** target: `revoked_at` value: `now`
- **invalidate** target: `target_session` — Immediately invalidate the session token
- **emit_event** event: `session.revoked`

**Result:** session revoked — device is signed out

### Revoke_all_other_sessions (Priority: 8) — Error: `SESSION_CANNOT_REVOKE_CURRENT` | Transaction: atomic

**Given:**
- `user_id` (session) exists
- `other_active_sessions` (db) exists

**Then:**
- **set_field** target: `all_other_sessions_revoked_at` value: `now` — Mark all sessions except current as revoked
- **invalidate** target: `all_other_sessions` — Immediately invalidate all other session tokens
- **emit_event** event: `session.revoke_all`

**Result:** all other sessions revoked — user remains signed in on current device only

### Session_expired (Priority: 9) — Error: `SESSION_EXPIRED`

**Given:**
- ANY: `last_active_at` (db) lt `now - 30m` OR `created_at` (db) lt `now - 24h`

**Then:**
- **set_field** target: `revoked_at` value: `now`
- **invalidate** target: `session` — Invalidate expired session
- **emit_event** event: `session.expired`

**Result:** session expired — redirect to login

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SESSION_RATE_LIMITED` | 429 | Too many requests. Please wait a moment. | Yes |
| `SESSION_NOT_FOUND` | 404 | Session not found | No |
| `SESSION_UNAUTHORIZED` | 403 | You do not have permission to manage this session | No |
| `SESSION_ALREADY_REVOKED` | 409 | This session has already been revoked | No |
| `SESSION_CANNOT_REVOKE_CURRENT` | 400 | You cannot revoke your current session. Use logout instead. | No |
| `SESSION_EXPIRED` | 401 | Your session has expired. Please sign in again. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.created` | New session created for a user | `user_id`, `session_id`, `device_browser`, `device_os`, `device_ip`, `timestamp` |
| `session.revoked` | A specific session was revoked by the user | `user_id`, `session_id`, `device_browser`, `device_os`, `timestamp` |
| `session.expired` | Session expired due to idle or absolute timeout | `user_id`, `session_id`, `reason`, `timestamp` |
| `session.revoke_all` | User revoked all sessions except current | `user_id`, `revoked_count`, `timestamp` |
| `session.evicted` | Oldest session evicted due to concurrent session limit | `user_id`, `evicted_session_id`, `timestamp` |
| `session.listed` | User viewed their active sessions | `user_id`, `timestamp`, `active_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | Sessions are created during login |
| logout | required | Logout terminates the current session |
| multi-factor-auth | optional | MFA verification status is tracked per session |
| single-sign-on | optional | SSO sessions need bridging and lifecycle management |
| oauth-social-login | optional | OAuth sessions need tracking alongside password sessions |

## AGI Readiness

### Goals

#### Reliable Session Management

Active session listing, device tracking, and session revocation

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
| `logout` | logout | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| session_not_found | `autonomous` | - | - |
| unauthorized_revocation | `autonomous` | - | - |
| list_active_sessions | `autonomous` | - | - |
| create_session | `supervised` | - | - |
| revoke_single_session | `human_required` | - | - |
| revoke_all_other_sessions | `human_required` | - | - |
| session_expired | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column
max_width: 640px
session_list:
  show_device_icon: true
  show_current_badge: true
  show_location: true
  show_last_active: true
  sort_by: last_active_at
  sort_order: descending
actions:
  primary:
    label: Sign out all other devices
    type: button
    full_width: true
    style: danger
    confirm: true
  per_session:
    label: Sign out
    type: button
    style: danger
    disabled_for_current: true
accessibility:
  aria_live_region: true
  screen_reader_session_label: "{browser} on {os} — last active {time_ago}"
loading:
  show_skeleton: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Session Management Blueprint",
  "description": "Active session listing, device tracking, and session revocation. 13 fields. 8 outcomes. 6 error codes. rules: security, device_tracking. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, session, security, device-tracking, identity"
}
</script>
