<!-- AUTO-GENERATED FROM openclaw-gateway-authentication.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openclaw Gateway Authentication

> Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration

**Category:** Access · **Version:** 1.0.0 · **Tags:** authentication · authorization · security · rate-limiting · gateway

## What this does

Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **auth_mode** *(select, required)* — Authentication Mode
- **token** *(token, optional)* — Bearer Token
- **password** *(password, optional)* — Password
- **device_token** *(token, optional)* — Device Token
- **bootstrap_token** *(token, optional)* — Bootstrap Token
- **client_ip** *(text, required)* — Client IP
- **authenticated** *(boolean, required)* — Authenticated
- **auth_method** *(select, optional)* — Auth Method Used
- **authenticated_user** *(text, optional)* — Authenticated User
- **rate_limited** *(boolean, optional)* — Rate Limited
- **remaining_attempts** *(number, optional)* — Remaining Attempts
- **retry_after_ms** *(number, optional)* — Retry After (ms)
- **is_loopback** *(boolean, optional)* — Is Loopback

## What must be true

- **auth_mode_selection → mode_priority:** Selection order: 1. Check override (e.g., --auth override mode) 2. Check config.auth.mode 3. Check credentials provided (password/token) 4. Default: "none" (only if explicitly enabled) All modes except "none" must be explicitly enabled.
- **auth_mode_selection → mode_availability:** "none" — No auth (ONLY if config allows) "token" — Bearer token (require token in config) "password" — Static password (require password in config) "trusted-proxy" — X-Forwarded-For headers (require proxy config) "tailscale" — Tailscale VPN membership (require Tailscale access) "device-token" — Paired device token (require prior pairing) "bootstrap-token" — One-time pairing token
- **rate_limiting → rate_limit_config:** maxAttempts: 10 (default, configurable) windowMs: 60000 (1 minute sliding window) lockoutMs: 300000 (5 minute lockout) exemptLoopback: true (localhost always passes) pruneIntervalMs: 60000 (cleanup stale entries)
- **rate_limiting → sliding_window_logic:** Track failed attempt timestamps within windowMs. On failure: append timestamp to attempts[]. When attempts.length >= maxAttempts: set lockedUntil = now + lockoutMs. On check: if now < lockedUntil, return allowed=false.
- **rate_limiting → loopback_bypass:** Clients from 127.0.0.1 or ::1: - Always pass rate limit checks (if exemptLoopback=true, default) - Useful for local development - Can be disabled (not recommended)
- **token_authentication → token_validation:** Format: "Authorization: Bearer <token>" Comparison: constant-time (safeEqualSecret) prevents timing attacks Constraints: - Length: >= 16 characters - Characters: [a-zA-Z0-9_.-]+ - Stored in: config.auth.token (plaintext) - Rotation: manual (no auto-expiry)
- **token_authentication → rate_limit_scope:** Scope: "shared-secret" (all token failures in same bucket)
- **password_authentication → password_validation:** Sent via: POST body { password: "..." } Comparison: constant-time (safeEqualSecret) Constraints: - Length: >= 8 characters - Stored in: config.auth.password (plaintext)
- **password_authentication → rate_limit_scope:** Scope: "shared-secret" (same bucket as token)
- **tailscale_authentication → tailscale_flow:** 1. Client connects from Tailscale VPN 2. Gateway reads TLS client certificate 3. Extract identity: loginName, displayName, profilePic 4. Verify VPN membership via Tailscale whois lookup 5. Allow if verified Only if allowTailscale=true.
- **tailscale_authentication → tailscale_ip_matching:** Tailscale CIDR: 100.64.0.0/10 (WireGuard) Detect: client_ip in Tailscale range Verify: call tailscale whois API
- **device_token_authentication → pairing_prerequisites:** Device must be paired first: 1. Device initiates: POST /gateway/pair { deviceId, deviceName } 2. Gateway generates: deviceToken (32 bytes random) 3. User confirms pairing (code or biometric) 4. Device stores securely: deviceId + deviceToken 5. On next request: "Authorization: Bearer <deviceId>:<deviceToken>"
- **device_token_authentication → device_token_validation:** Format: "<deviceId>:<deviceTokenSecret>" Lookup: config/device-tokens.json Comparison: constant-time secret comparison Refresh: one-time POST /gateway/device/<deviceId>/refresh Revocation: manual or automatic (>1 year inactivity)
- **device_token_authentication → rate_limit_scope:** Scope: "device-token" (per-device buckets)
- **trusted_proxy_authentication → proxy_flow:** Reverse proxy (nginx, caddy, etc.) forwards to gateway: 1. Client → Proxy (authenticated by proxy) 2. Proxy → Gateway with X-Forwarded-For: <client_ip> 3. Gateway checks: proxy_ip in trustedProxies list 4. Extract client_ip from header 5. Allow request (no further auth)
- **trusted_proxy_authentication → proxy_allowlist:** trustedProxies: string[] (CIDR ranges or IPs) Strict matching: client_ip in CIDR range Invalid: log warning, deny all requests
- **trusted_proxy_authentication → header_precedence:** 1. X-Forwarded-For (preferred, rightmost = original client) 2. X-Real-IP (Nginx/Caddy fallback) 3. Direct connection IP
- **ip_resolution → resolution_order:** 1. Check is_loopback (::1 or 127.0.0.1) → bypass auth 2. Check trusted proxy → extract from headers 3. Use client socket IP → direct connection 4. Fallback to X-Real-IP (if allowRealIpFallback=true)

## Success & failure scenarios

**✅ Success paths**

- **Loopback Bypass** — when is_loopback eq "true"; exempt_loopback eq "true", then Localhost allowed (if exemptLoopback=true).
- **Token Authenticated** — when Authorization header present; auth_mode eq "token"; token header matches config.auth.token, then Request allowed, token authenticated.
- **Password Authenticated** — when auth_mode eq "password"; password POST body matches config.auth.password, then Request allowed, password authenticated.
- **Device Authenticated** — when auth_mode eq "device-token"; deviceId:deviceToken valid in config/device-tokens.json, then Paired device allowed.

**❌ Failure paths**

- **Rate Limit Exceeded** — when failed_attempts_in_window gte "max_attempts", then Request blocked by rate limiter, retry after delay. *(error: `AUTH_RATE_LIMITED`)*

## Errors it can return

- `AUTH_RATE_LIMITED` — Too many failed authentication attempts
- `INVALID_CREDENTIALS` — Authentication failed
- `AUTH_MODE_NOT_CONFIGURED` — Authentication required but not configured
- `TAILSCALE_VERIFICATION_FAILED` — Tailscale VPN verification failed
- `INVALID_DEVICE_TOKEN` — Device token invalid or expired
- `TRUSTED_PROXY_NOT_ALLOWED` — Request source not in trusted proxies
- `ORIGIN_MISMATCH` — Origin not allowed

## Connects to

- **openclaw-session-management** *(recommended)* — Auth determines session isolation scope
- **openclaw-message-routing** *(required)* — Auth must precede message routing

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/openclaw-gateway-authentication/) · **Spec source:** [`openclaw-gateway-authentication.blueprint.yaml`](./openclaw-gateway-authentication.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
