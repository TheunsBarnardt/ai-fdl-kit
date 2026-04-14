<!-- AUTO-GENERATED FROM api-gateway.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Api Gateway

> Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support

**Category:** Integration · **Version:** 1.0.0 · **Tags:** api · gateway · routing · rate-limiting · circuit-breaker · cors

## What this does

Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **route_path** *(text, required)* — API route path pattern (e.g., /api/v1/users/:id)
- **method** *(select, required)* — HTTP method
- **upstream_url** *(url, required)* — Upstream service URL to proxy requests to
- **auth_type** *(select, optional)* — Authentication mechanism for this route
- **rate_limit** *(number, optional)* — Maximum requests per minute per client
- **version** *(text, optional)* — API version (e.g., v1, v2)
- **timeout_ms** *(number, optional)* — Upstream request timeout in milliseconds
- **cors_origins** *(json, optional)* — Allowed CORS origins
- **request_size_limit** *(number, optional)* — Maximum request body size in bytes
- **circuit_state** *(select, optional)* — Circuit breaker state
- **circuit_failure_threshold** *(number, optional)* — Number of failures before circuit opens
- **circuit_reset_timeout_ms** *(number, optional)* — Milliseconds before open circuit transitions to half-open

## What must be true

- **routing:** Routes are matched by path pattern and HTTP method, Path parameters (e.g., :id) are extracted and forwarded to upstream, If no route matches, return 404 with standardized error response, Route priority: exact match > parameterized > wildcard
- **versioning:** API version resolved from Accept-Version header or URL path prefix, When version header is absent, default to latest version, Deprecated versions return Sunset header with deprecation date
- **authentication:** API key validated against registered client keys, JWT tokens verified using RS256 or HS256 with configured secret/public key, OAuth tokens validated against token introspection endpoint or JWT claims, Authentication failures return 401 with WWW-Authenticate header
- **rate_limiting:** Rate limits enforced per client (identified by API key, JWT subject, or IP), Sliding window algorithm: count requests in rolling 60-second window, Rate-limited responses return 429 with Retry-After and X-RateLimit-Remaining headers
- **request_limits:** Maximum request body size is 10MB by default; configurable per route, Request timeout defaults to 30000ms (30 seconds); configurable per route
- **circuit_breaker:** Circuit opens after 5 consecutive upstream failures (configurable), Open circuit rejects requests immediately with 503 for 60 seconds (configurable), After reset timeout, circuit transitions to half-open; next request tests upstream, Successful half-open request closes circuit; failure re-opens it
- **cors:** OPTIONS preflight requests handled automatically for configured origins, Access-Control-Allow-Origin set to requesting origin if in allowed list, Wildcard (*) origin only allowed when auth_type is none

## Success & failure scenarios

**✅ Success paths**

- **Request Routed** — when route_path exists; method exists; Route matches registered path and method; Authentication passes (if required); Rate limit not exceeded; circuit_state neq "open", then Request proxied to upstream service; response returned to client with gateway headers.
- **Circuit Half Open Success** — when circuit_state eq "half_open"; Test request to upstream succeeds, then Circuit breaker closed; normal traffic flow resumed to upstream.

**❌ Failure paths**

- **Request Rejected Auth** — when Route requires authentication; Request missing or invalid credentials (API key, JWT, or OAuth token), then 401 returned with WWW-Authenticate header indicating required auth scheme. *(error: `GATEWAY_AUTH_FAILED`)*
- **Request Rate Limited** — when Client exceeds configured rate_limit for the route, then 429 returned with Retry-After and X-RateLimit-Remaining headers. *(error: `GATEWAY_RATE_LIMITED`)*
- **Upstream Timeout** — when Upstream service does not respond within timeout_ms, then 504 returned to client; timeout recorded for circuit breaker evaluation. *(error: `GATEWAY_UPSTREAM_TIMEOUT`)*
- **Circuit Open** — when circuit_state eq "open", then 503 returned immediately without contacting upstream; circuit resets after timeout. *(error: `GATEWAY_CIRCUIT_OPEN`)*
- **Request Body Too Large** — when Request body size exceeds request_size_limit, then 413 returned; client must reduce payload size. *(error: `GATEWAY_PAYLOAD_TOO_LARGE`)*
- **Route Not Found** — when No registered route matches the request path and method, then 404 returned with standardized error response. *(error: `GATEWAY_ROUTE_NOT_FOUND`)*

## Errors it can return

- `GATEWAY_AUTH_FAILED` — Authentication required. Provide valid credentials for this endpoint.
- `GATEWAY_RATE_LIMITED` — Rate limit exceeded. Retry after the specified duration.
- `GATEWAY_UPSTREAM_TIMEOUT` — Upstream service did not respond within the configured timeout.
- `GATEWAY_CIRCUIT_OPEN` — Service temporarily unavailable. Upstream circuit breaker is open.
- `GATEWAY_PAYLOAD_TOO_LARGE` — Request body exceeds the maximum allowed size.
- `GATEWAY_ROUTE_NOT_FOUND` — No route matches the requested path and method.
- `GATEWAY_FORBIDDEN` — Authenticated but not authorized to access this resource.

## Events

**`gateway.request`**
  Payload: `route_path`, `method`, `upstream_url`, `client_id`, `response_time_ms`, `status_code`

**`gateway.error`**
  Payload: `route_path`, `method`, `client_id`, `error_code`, `error_message`

**`gateway.circuit_opened`**
  Payload: `upstream_url`, `failure_count`, `reset_timeout_ms`

**`gateway.circuit_closed`**
  Payload: `upstream_url`

## Connects to

- **oauth-provider** *(recommended)* — Gateway validates OAuth tokens issued by the provider
- **webhook-ingestion** *(optional)* — Incoming webhooks routed through gateway for authentication
- **payment-gateway** *(optional)* — Payment API requests routed through gateway with rate limiting

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/api-gateway/) · **Spec source:** [`api-gateway.blueprint.yaml`](./api-gateway.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
