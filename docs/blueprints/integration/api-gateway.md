---
title: "Api Gateway Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support. 12 fields. 8 outc"
---

# Api Gateway Blueprint

> Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support

| | |
|---|---|
| **Feature** | `api-gateway` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | api, gateway, routing, rate-limiting, circuit-breaker, cors |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/api-gateway.blueprint.yaml) |
| **JSON API** | [api-gateway.json]({{ site.baseurl }}/api/blueprints/integration/api-gateway.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `route_path` | text | Yes | API route path pattern (e.g., /api/v1/users/:id) | Validations: pattern |
| `method` | select | Yes | HTTP method |  |
| `upstream_url` | url | Yes | Upstream service URL to proxy requests to |  |
| `auth_type` | select | No | Authentication mechanism for this route |  |
| `rate_limit` | number | No | Maximum requests per minute per client | Validations: min |
| `version` | text | No | API version (e.g., v1, v2) | Validations: pattern |
| `timeout_ms` | number | No | Upstream request timeout in milliseconds | Validations: min, max |
| `cors_origins` | json | No | Allowed CORS origins |  |
| `request_size_limit` | number | No | Maximum request body size in bytes |  |
| `circuit_state` | select | No | Circuit breaker state |  |
| `circuit_failure_threshold` | number | No | Number of failures before circuit opens | Validations: min |
| `circuit_reset_timeout_ms` | number | No | Milliseconds before open circuit transitions to half-open |  |

## Rules

- **routing:** Routes are matched by path pattern and HTTP method, Path parameters (e.g., :id) are extracted and forwarded to upstream, If no route matches, return 404 with standardized error response, Route priority: exact match > parameterized > wildcard
- **versioning:** API version resolved from Accept-Version header or URL path prefix, When version header is absent, default to latest version, Deprecated versions return Sunset header with deprecation date
- **authentication:** API key validated against registered client keys, JWT tokens verified using RS256 or HS256 with configured secret/public key, OAuth tokens validated against token introspection endpoint or JWT claims, Authentication failures return 401 with WWW-Authenticate header
- **rate_limiting:** Rate limits enforced per client (identified by API key, JWT subject, or IP), Sliding window algorithm: count requests in rolling 60-second window, Rate-limited responses return 429 with Retry-After and X-RateLimit-Remaining headers
- **request_limits:** Maximum request body size is 10MB by default; configurable per route, Request timeout defaults to 30000ms (30 seconds); configurable per route
- **circuit_breaker:** Circuit opens after 5 consecutive upstream failures (configurable), Open circuit rejects requests immediately with 503 for 60 seconds (configurable), After reset timeout, circuit transitions to half-open; next request tests upstream, Successful half-open request closes circuit; failure re-opens it
- **cors:** OPTIONS preflight requests handled automatically for configured origins, Access-Control-Allow-Origin set to requesting origin if in allowed list, Wildcard (*) origin only allowed when auth_type is none

## Outcomes

### Request_routed (Priority: 1)

**Given:**
- `route_path` (request) exists
- `method` (request) exists
- Route matches registered path and method
- Authentication passes (if required)
- Rate limit not exceeded
- `circuit_state` (system) neq `open`

**Then:**
- **emit_event** event: `gateway.request`

**Result:** Request proxied to upstream service; response returned to client with gateway headers

### Request_rejected_auth (Priority: 2) — Error: `GATEWAY_AUTH_FAILED`

**Given:**
- Route requires authentication
- Request missing or invalid credentials (API key, JWT, or OAuth token)

**Then:**
- **emit_event** event: `gateway.error`

**Result:** 401 returned with WWW-Authenticate header indicating required auth scheme

### Request_rate_limited (Priority: 3) — Error: `GATEWAY_RATE_LIMITED`

**Given:**
- Client exceeds configured rate_limit for the route

**Then:**
- **emit_event** event: `gateway.error`

**Result:** 429 returned with Retry-After and X-RateLimit-Remaining headers

### Upstream_timeout (Priority: 4) — Error: `GATEWAY_UPSTREAM_TIMEOUT`

**Given:**
- Upstream service does not respond within timeout_ms

**Then:**
- **emit_event** event: `gateway.error`

**Result:** 504 returned to client; timeout recorded for circuit breaker evaluation

### Circuit_open (Priority: 5) — Error: `GATEWAY_CIRCUIT_OPEN`

**Given:**
- `circuit_state` (system) eq `open`

**Then:**
- **emit_event** event: `gateway.circuit_opened`

**Result:** 503 returned immediately without contacting upstream; circuit resets after timeout

### Circuit_half_open_success (Priority: 6)

**Given:**
- `circuit_state` (system) eq `half_open`
- Test request to upstream succeeds

**Then:**
- **set_field** target: `circuit_state` value: `closed`
- **emit_event** event: `gateway.circuit_closed`

**Result:** Circuit breaker closed; normal traffic flow resumed to upstream

### Request_body_too_large (Priority: 7) — Error: `GATEWAY_PAYLOAD_TOO_LARGE`

**Given:**
- Request body size exceeds request_size_limit

**Result:** 413 returned; client must reduce payload size

### Route_not_found (Priority: 8) — Error: `GATEWAY_ROUTE_NOT_FOUND`

**Given:**
- No registered route matches the request path and method

**Then:**
- **emit_event** event: `gateway.error`

**Result:** 404 returned with standardized error response

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GATEWAY_AUTH_FAILED` | 401 | Authentication required. Provide valid credentials for this endpoint. | No |
| `GATEWAY_RATE_LIMITED` | 429 | Rate limit exceeded. Retry after the specified duration. | No |
| `GATEWAY_UPSTREAM_TIMEOUT` | 500 | Upstream service did not respond within the configured timeout. | No |
| `GATEWAY_CIRCUIT_OPEN` | 503 | Service temporarily unavailable. Upstream circuit breaker is open. | No |
| `GATEWAY_PAYLOAD_TOO_LARGE` | 413 | Request body exceeds the maximum allowed size. | No |
| `GATEWAY_ROUTE_NOT_FOUND` | 404 | No route matches the requested path and method. | No |
| `GATEWAY_FORBIDDEN` | 403 | Authenticated but not authorized to access this resource. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `gateway.request` |  | `route_path`, `method`, `upstream_url`, `client_id`, `response_time_ms`, `status_code` |
| `gateway.error` |  | `route_path`, `method`, `client_id`, `error_code`, `error_message` |
| `gateway.circuit_opened` |  | `upstream_url`, `failure_count`, `reset_timeout_ms` |
| `gateway.circuit_closed` |  | `upstream_url` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| oauth-provider | recommended | Gateway validates OAuth tokens issued by the provider |
| webhook-ingestion | optional | Incoming webhooks routed through gateway for authentication |
| payment-gateway | optional | Payment API requests routed through gateway with rate limiting |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Api Gateway Blueprint",
  "description": "Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support. 12 fields. 8 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "api, gateway, routing, rate-limiting, circuit-breaker, cors"
}
</script>
