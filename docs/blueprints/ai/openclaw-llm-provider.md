---
title: "Openclaw Llm Provider Blueprint"
layout: default
parent: "Ai"
grand_parent: Blueprint Catalog
description: "Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support. 27 fields. 5 outcomes. 7 error codes. rules: "
---

# Openclaw Llm Provider Blueprint

> Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support

| | |
|---|---|
| **Feature** | `openclaw-llm-provider` |
| **Category** | Ai |
| **Version** | 1.0.0 |
| **Tags** | ai, models, providers, streaming, llm |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ai/openclaw-llm-provider.blueprint.yaml) |
| **JSON API** | [openclaw-llm-provider.json]({{ site.baseurl }}/api/blueprints/ai/openclaw-llm-provider.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `agent` | AI Agent | system |  |
| `provider` | AI Provider | external |  |
| `gateway` | OpenClaw Gateway | system |  |
| `user` | End User | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `provider_id` | text | Yes | Provider ID |  |
| `provider_name` | text | Yes | Provider Name |  |
| `model_id` | text | Yes | Model ID |  |
| `model_name` | text | Yes | Model Display Name |  |
| `supports_reasoning` | boolean | Yes | Reasoning Support |  |
| `input_types` | json | Yes | Input Types |  |
| `max_input_tokens` | number | Yes | Context Window |  |
| `max_output_tokens` | number | Yes | Max Output Tokens |  |
| `cost_per_input_mtok` | number | Yes | Input Cost ($/MTok) |  |
| `cost_per_output_mtok` | number | Yes | Output Cost ($/MTok) |  |
| `cost_per_cache_read_mtok` | number | No | Cache Read Cost ($/MTok) |  |
| `cost_per_cache_write_mtok` | number | No | Cache Write Cost ($/MTok) |  |
| `auth_methods` | json | Yes | Auth Methods |  |
| `api_key` | token | No | API Key |  |
| `oauth_token` | token | No | OAuth Token |  |
| `auth_profile_id` | text | No | Auth Profile ID |  |
| `thinking_level` | select | No | Thinking Level |  |
| `thinking_budget_tokens` | number | No | Thinking Budget (tokens) |  |
| `supports_streaming` | boolean | Yes | Streaming Support |  |
| `supports_vision` | boolean | Yes | Vision Support |  |
| `supports_caching` | boolean | No | Caching Support |  |
| `supports_tool_use` | boolean | Yes | Tool Use Support |  |
| `streaming_mode` | select | Yes | Streaming Display Mode |  |
| `is_primary` | boolean | Yes | Is Primary |  |
| `fallback_models` | json | No | Fallback Models |  |
| `input_tokens` | number | No | Input Tokens Used |  |
| `output_tokens` | number | No | Output Tokens Used |  |

## States

**State field:** `undefined`

## Rules

- **model_selection:**
  - **model_resolution:** Priority:
1. Session-level override (session.model_override)
2. Agent-level primary (agent.model.primary)
3. System-wide default (config.models.default)
4. Fallback chain (if primary unavailable)
Resolved at chat.send time (not session creation).

  - **fallback_chain:** If primary model unavailable:
1. Try fallback_models[0]
2. Try fallback_models[1], etc.
3. Try system default
4. Fail with error if none available
Triggers: API error, rate limit, auth failure, model deprecated.
Transparent: user sees fallback seamlessly.

  - **forward_compatibility:** Models may change API surface over time.
compat_config handles:
- Model ID remapping (gpt-4 → gpt-4-turbo)
- Default parameter changes
- Deprecated feature removal
- API endpoint changes

- **authentication:**
  - **auth_method_selection:** Methods per provider:
- "api_key" — static key in header
- "oauth" — refresh token flow (auto-renew)
- "token" — bearer token (static)
- "aws-sdk" — AWS credential chain
Selection: first available method.

  - **credential_management:** Stored in:
- config.auth (direct, plaintext)
- config/auth-profiles.json (named)
- Environment variables (${VAR_NAME})
- AWS credential chain
Priority: session > agent > global.
Secrets redaction: _KEY, _TOKEN, _SECRET patterns.

  - **oauth_refresh_flow:** For OAuth:
1. Initial auth: exchange code for tokens
2. Token check: verify expiry before API call
3. Refresh: if <7 days to expiry, refresh proactively
4. Store: save tokens to auth-profiles.json
5. Fallback: use cached token if refresh fails
Max retries: 3 with exponential backoff.

- **model_capabilities:**
  - **thinking_mode_activation:** Extended thinking (if reasoning=true):
- off — no thinking
- minimal — 5-10K token budget
- low — 10-50K tokens
- medium — 50-200K tokens
- high — 200K+ tokens
- xhigh — max available
- adaptive — auto-select by query
Thinking tokens separate from response tokens.
Cost: may have different cost per provider.

  - **vision_support:** Image input handling:
- OpenAI: URL or base64 (2000 token limit, 20 max images)
- Anthropic: base64 (no explicit limit)
- Google: URI references (Cloud Storage)
Image preprocessing: resize large images, convert formats.
Unsupported: send text-only fallback.

  - **tool_use:** Function calling (if supportsToolUse=true):
1. Define tool schema: name, description, parameters
2. Model generates tool_calls in response
3. Execute tools synchronously
4. Append results to conversation
5. Continue until no more tool_calls or iteration limit
Max iterations: 10 (configurable).

  - **caching_support:** Prompt caching (if supportsCaching=true):
- Anthropic: cache_control on messages, auto-evict
- OpenAI: cache_control on logit_bias
Cost: cache write ~25% of read cost (saves 90% on reads).
Automatic: enabled if >1K tokens.

- **streaming:**
  - **streaming_modes:** Display modes:
- "off" — wait for full response
- "partial" — edit message in-place
- "block" — display in chunks
- "progress" — show indicator, full message at end
Channel-dependent: Discord partial risky (edit limits).
Config: per-agent or per-session override.

  - **streaming_error_handling:** On stream error:
- Connection drop → retry entire request
- Invalid delta → skip, log, continue
- Rate limit during stream → pause, wait, resume
- Partial response → deliver what received, notify user
Transparent retry: user doesn't re-send.

  - **token_counting:** Tracked:
- inputTokens — user message + system prompt
- outputTokens — model response
- cacheReadTokens — from cached prompt
- cacheWriteTokens — written to cache
Reported by: provider in final response metadata.
Accumulated: in session entry for cost tracking.


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| api_latency |  |  |
| token_limit_response | 5min |  |

## Outcomes

### Model_loaded (Priority: 1)

**Given:**
- `model_id` (system) exists
- provider API authenticated
- model_id exists in provider catalog

**Then:**
- **set_field** target: `provider_id` value: `extracted from model config`
- **set_field** target: `thinking_level` value: `session override or agent default`
- **emit_event** event: `provider.selected`

**Result:** Model ready for inference

### Api_request_succeeded (Priority: 1) | Transaction: atomic

**Given:**
- API request sent
- HTTP 200 or streaming started

**Then:**
- **set_field** target: `input_tokens` value: `from provider response`
- **set_field** target: `output_tokens` value: `from provider response`
- **emit_event** event: `api.response_received`

**Result:** Response processed, tokens counted, cost calculated

### Streaming_response (Priority: 1)

**Given:**
- `streaming_mode` (system) neq `off`
- provider supports streaming

**Then:**
- **emit_event** event: `stream.started`

**Result:** Response tokens streamed to client, displayed progressively

### Fallback_activated (Priority: 2)

**Given:**
- `provider_state` (computed) in `rate_limited,auth_failed,unavailable`
- `fallback_models` (system) exists

**Then:**
- **set_field** target: `model_id` value: `fallback_models[0]`
- **emit_event** event: `fallback.triggered`

**Result:** Fallback model used, request retried

### Cost_estimation (Priority: 3)

**Given:**
- `estimated_cost_usd` (computed) gt `cost_threshold`

**Then:**
- **emit_event** event: `cost.estimated`

**Result:** User alerted to high cost before execution

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MODEL_NOT_AVAILABLE` | 503 | Model not available | No |
| `AUTH_FAILED` | 401 | Provider authentication failed | No |
| `RATE_LIMIT_EXCEEDED` | 429 | Provider rate limit exceeded | No |
| `INVALID_MODEL_CONFIG` | 400 | Model configuration invalid | No |
| `RESPONSE_FORMAT_ERROR` | 500 | Failed to parse provider response | No |
| `THINKING_BUDGET_EXCEEDED` | 400 | Thinking tokens exceeded budget | No |
| `STREAMING_INTERRUPTED` | 500 | Streaming response interrupted | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `provider.selected` |  | `provider_id`, `model_id`, `thinking_level` |
| `api.request_sent` |  | `provider_id`, `model_id`, `input_tokens` |
| `api.response_received` |  | `provider_id`, `model_id`, `output_tokens`, `cache_read_tokens`, `cache_write_tokens` |
| `stream.started` |  | `provider_id`, `model_id` |
| `stream.completed` |  | `provider_id`, `total_tokens` |
| `fallback.triggered` |  | `primary_model`, `fallback_model`, `reason` |
| `cost.estimated` |  | `model_id`, `estimated_usd`, `thinking_budget_tokens` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| openclaw-session-management | required | Tracks token usage and cost per session |
| openclaw-plugin-system | required | Provider implementations are plugins |
| openclaw-gateway-authentication | required | Authenticates provider API calls |

## AGI Readiness

### Goals

#### Reliable Openclaw Llm Provider

Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `fully_autonomous`

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
| safety | capability | AI systems must operate within defined safety boundaries |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `openclaw_session_management` | openclaw-session-management | fail |
| `openclaw_plugin_system` | openclaw-plugin-system | fail |
| `openclaw_gateway_authentication` | openclaw-gateway-authentication | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| model_loaded | `autonomous` | - | - |
| api_request_succeeded | `autonomous` | - | - |
| streaming_response | `autonomous` | - | - |
| fallback_activated | `autonomous` | - | - |
| cost_estimation | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  patterns:
    - Provider adapter pattern
    - Streaming response handling
    - Token cost calculation
    - Fallback chain execution
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Openclaw Llm Provider Blueprint",
  "description": "Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support. 27 fields. 5 outcomes. 7 error codes. rules: ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ai, models, providers, streaming, llm"
}
</script>
