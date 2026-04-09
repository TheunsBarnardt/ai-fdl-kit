---
title: "Logout Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "End a user session and clear all authentication tokens. 1 fields. 3 outcomes. 2 error codes. rules: security, session. AGI: supervised"
---

# Logout Blueprint

> End a user session and clear all authentication tokens

| | |
|---|---|
| **Feature** | `logout` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, session, security, identity |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/logout.blueprint.yaml) |
| **JSON API** | [logout.json]({{ site.baseurl }}/api/blueprints/auth/logout.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `logout_scope` | select | No | Sign out from |  |

## Rules

- **security:**
  - **requires_auth:** true
  - **csrf_protection:** true
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 10
    - **scope:** per_user
- **session:**
  - **clear_access_token:** true
  - **clear_refresh_token:** true
  - **invalidate_server_side:** true

## Outcomes

### Not_authenticated (Priority: 1)

**Given:**
- `session` (session) not_exists

**Result:** redirect to /login (no error — graceful handling)

### Successful_logout_current (Priority: 2) | Transaction: atomic

**Given:**
- `session` (session) exists
- `logout_scope` (input) in `current,`

**Then:**
- **invalidate** target: `access_token` — Clear access token cookie
- **invalidate** target: `refresh_token` — Clear refresh token cookie and revoke in DB
- **emit_event** event: `logout.success`

**Result:** redirect to /login

### Successful_logout_all_devices (Priority: 3) | Transaction: atomic

**Given:**
- `session` (session) exists
- `logout_scope` (input) eq `all`

**Then:**
- **invalidate** target: `refresh_token` — Invalidate ALL refresh tokens for this user
- **invalidate** target: `access_token` — Clear cookies on current device
- **emit_event** event: `logout.all_devices`

**Result:** redirect to /login

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LOGOUT_CSRF_INVALID` | 403 | Invalid request. Please try again. | Yes |
| `LOGOUT_RATE_LIMITED` | 429 | Too many requests. Please wait a moment. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `logout.success` | User logged out from current device | `user_id`, `session_id`, `timestamp`, `ip_address` |
| `logout.all_devices` | User logged out from all devices | `user_id`, `timestamp`, `ip_address`, `revoked_session_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | Logout ends what login started |
| session-management | optional | View active sessions before choosing which to revoke |

## AGI Readiness

### Goals

#### Reliable Logout

End a user session and clear all authentication tokens

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

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
| not_authenticated | `autonomous` | - | - |
| successful_logout_current | `autonomous` | - | - |
| successful_logout_all_devices | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
trigger: button
confirmation:
  show_for: all_devices_only
  message: This will sign you out of all devices. Continue?
actions:
  primary:
    label: Sign out
    type: submit
    method: POST
```

</details>

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
nextjs:
  route: /api/auth/logout
  method: POST
  server_action: true
  redirect_after: /login
express:
  route: /api/auth/logout
  method: POST
  middleware:
    - auth
    - csrf
laravel:
  route: /logout
  method: POST
  middleware:
    - auth
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Logout Blueprint",
  "description": "End a user session and clear all authentication tokens. 1 fields. 3 outcomes. 2 error codes. rules: security, session. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, session, security, identity"
}
</script>
