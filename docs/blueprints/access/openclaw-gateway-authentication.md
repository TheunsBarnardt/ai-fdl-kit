---
title: "Openclaw Gateway Authentication Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration. 13 fields. 5 outcomes. 7 error codes. rules: auth_mode_selec"
---

# Openclaw Gateway Authentication Blueprint

> Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration

| | |
|---|---|
| **Feature** | `openclaw-gateway-authentication` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | authentication, authorization, security, rate-limiting, gateway |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/access/openclaw-gateway-authentication.blueprint.yaml) |
| **JSON API** | [openclaw-gateway-authentication.json]({{ site.baseurl }}/api/blueprints/access/openclaw-gateway-authentication.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | external |  |
| `gateway` | OpenClaw Gateway | system |  |
| `tailscale` | Tailscale VPN | external |  |
| `trusted_proxy` | Reverse Proxy | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `auth_mode` | select | Yes | Authentication Mode |  |
| `token` | token | No | Bearer Token |  |
| `password` | password | No | Password |  |
| `device_token` | token | No | Device Token |  |
| `bootstrap_token` | token | No | Bootstrap Token |  |
| `client_ip` | text | Yes | Client IP |  |
| `authenticated` | boolean | Yes | Authenticated |  |
| `auth_method` | select | No | Auth Method Used |  |
| `authenticated_user` | text | No | Authenticated User |  |
| `rate_limited` | boolean | No | Rate Limited |  |
| `remaining_attempts` | number | No | Remaining Attempts |  |
| `retry_after_ms` | number | No | Retry After (ms) |  |
| `is_loopback` | boolean | No | Is Loopback |  |

## States

**State field:** `undefined`

## Rules

- **auth_mode_selection:**
  - **mode_priority:** Selection order:
1. Check override (e.g., --auth override mode)
2. Check config.auth.mode
3. Check credentials provided (password/token)
4. Default: "none" (only if explicitly enabled)
All modes except "none" must be explicitly enabled.

  - **mode_availability:** "none" — No auth (ONLY if config allows)
"token" — Bearer token (require token in config)
"password" — Static password (require password in config)
"trusted-proxy" — X-Forwarded-For headers (require proxy config)
"tailscale" — Tailscale VPN membership (require Tailscale access)
"device-token" — Paired device token (require prior pairing)
"bootstrap-token" — One-time pairing token

- **rate_limiting:**
  - **rate_limit_config:** maxAttempts: 10 (default, configurable)
windowMs: 60000 (1 minute sliding window)
lockoutMs: 300000 (5 minute lockout)
exemptLoopback: true (localhost always passes)
pruneIntervalMs: 60000 (cleanup stale entries)

  - **sliding_window_logic:** Track failed attempt timestamps within windowMs.
On failure: append timestamp to attempts[].
When attempts.length >= maxAttempts: set lockedUntil = now + lockoutMs.
On check: if now < lockedUntil, return allowed=false.

  - **loopback_bypass:** Clients from 127.0.0.1 or ::1:
- Always pass rate limit checks (if exemptLoopback=true, default)
- Useful for local development
- Can be disabled (not recommended)

- **token_authentication:**
  - **token_validation:** Format: "Authorization: Bearer <token>"
Comparison: constant-time (safeEqualSecret) prevents timing attacks
Constraints:
- Length: >= 16 characters
- Characters: [a-zA-Z0-9_.-]+
- Stored in: config.auth.token (plaintext)
- Rotation: manual (no auto-expiry)

  - **rate_limit_scope:** Scope: "shared-secret" (all token failures in same bucket)

- **password_authentication:**
  - **password_validation:** Sent via: POST body { password: "..." }
Comparison: constant-time (safeEqualSecret)
Constraints:
- Length: >= 8 characters
- Stored in: config.auth.password (plaintext)

  - **rate_limit_scope:** Scope: "shared-secret" (same bucket as token)

- **tailscale_authentication:**
  - **tailscale_flow:** 1. Client connects from Tailscale VPN
2. Gateway reads TLS client certificate
3. Extract identity: loginName, displayName, profilePic
4. Verify VPN membership via Tailscale whois lookup
5. Allow if verified
Only if allowTailscale=true.

  - **tailscale_ip_matching:** Tailscale CIDR: 100.64.0.0/10 (WireGuard)
Detect: client_ip in Tailscale range
Verify: call tailscale whois API

- **device_token_authentication:**
  - **pairing_prerequisites:** Device must be paired first:
1. Device initiates: POST /gateway/pair { deviceId, deviceName }
2. Gateway generates: deviceToken (32 bytes random)
3. User confirms pairing (code or biometric)
4. Device stores securely: deviceId + deviceToken
5. On next request: "Authorization: Bearer <deviceId>:<deviceToken>"

  - **device_token_validation:** Format: "<deviceId>:<deviceTokenSecret>"
Lookup: config/device-tokens.json
Comparison: constant-time secret comparison
Refresh: one-time POST /gateway/device/<deviceId>/refresh
Revocation: manual or automatic (>1 year inactivity)

  - **rate_limit_scope:** Scope: "device-token" (per-device buckets)

- **trusted_proxy_authentication:**
  - **proxy_flow:** Reverse proxy (nginx, caddy, etc.) forwards to gateway:
1. Client → Proxy (authenticated by proxy)
2. Proxy → Gateway with X-Forwarded-For: <client_ip>
3. Gateway checks: proxy_ip in trustedProxies list
4. Extract client_ip from header
5. Allow request (no further auth)

  - **proxy_allowlist:** trustedProxies: string[] (CIDR ranges or IPs)
Strict matching: client_ip in CIDR range
Invalid: log warning, deny all requests

  - **header_precedence:** 1. X-Forwarded-For (preferred, rightmost = original client)
2. X-Real-IP (Nginx/Caddy fallback)
3. Direct connection IP

- **ip_resolution:**
  - **resolution_order:** 1. Check is_loopback (::1 or 127.0.0.1) → bypass auth
2. Check trusted proxy → extract from headers
3. Use client socket IP → direct connection
4. Fallback to X-Real-IP (if allowRealIpFallback=true)


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| auth_latency | 50ms |  |
| rate_limit_check | 10ms |  |

## Outcomes

### Loopback_bypass (Priority: 0)

**Given:**
- `is_loopback` (computed) eq `true`
- `exempt_loopback` (config) eq `true`

**Then:**
- **set_field** target: `authenticated` value: `true`
- **set_field** target: `auth_method` value: `none`

**Result:** Localhost allowed (if exemptLoopback=true)

### Token_authenticated (Priority: 1)

**Given:**
- Authorization header present
- `auth_mode` (config) eq `token`
- token header matches config.auth.token

**Then:**
- **set_field** target: `authenticated` value: `true`
- **set_field** target: `auth_method` value: `token`

**Result:** Request allowed, token authenticated

### Password_authenticated (Priority: 1)

**Given:**
- `auth_mode` (config) eq `password`
- password POST body matches config.auth.password

**Then:**
- **set_field** target: `authenticated` value: `true`
- **set_field** target: `auth_method` value: `password`

**Result:** Request allowed, password authenticated

### Device_authenticated (Priority: 1)

**Given:**
- `auth_mode` (config) eq `device-token`
- deviceId:deviceToken valid in config/device-tokens.json

**Then:**
- **set_field** target: `authenticated` value: `true`
- **set_field** target: `auth_method` value: `device-token`

**Result:** Paired device allowed

### Rate_limit_exceeded (Priority: 2) — Error: `AUTH_RATE_LIMITED`

**Given:**
- `failed_attempts_in_window` (computed) gte `max_attempts`

**Then:**
- **set_field** target: `rate_limited` value: `true`
- **set_field** target: `authenticated` value: `false`
- **set_field** target: `retry_after_ms` value: `calculated backoff`

**Result:** Request blocked by rate limiter, retry after delay

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUTH_RATE_LIMITED` | 429 | Too many failed authentication attempts | No |
| `INVALID_CREDENTIALS` | 401 | Authentication failed | No |
| `AUTH_MODE_NOT_CONFIGURED` | 401 | Authentication required but not configured | No |
| `TAILSCALE_VERIFICATION_FAILED` | 401 | Tailscale VPN verification failed | No |
| `INVALID_DEVICE_TOKEN` | 401 | Device token invalid or expired | No |
| `TRUSTED_PROXY_NOT_ALLOWED` | 403 | Request source not in trusted proxies | No |
| `ORIGIN_MISMATCH` | 403 | Origin not allowed | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| openclaw-session-management | recommended | Auth determines session isolation scope |
| openclaw-message-routing | required | Auth must precede message routing |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  patterns:
    - Constant-time string comparison
    - Sliding window rate limiting
    - IP-based rate limit buckets
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Openclaw Gateway Authentication Blueprint",
  "description": "Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration. 13 fields. 5 outcomes. 7 error codes. rules: auth_mode_selec",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, authorization, security, rate-limiting, gateway"
}
</script>
