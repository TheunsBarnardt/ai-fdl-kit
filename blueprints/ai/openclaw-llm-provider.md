<!-- AUTO-GENERATED FROM openclaw-llm-provider.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openclaw Llm Provider

> Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support

**Category:** Ai · **Version:** 1.0.0 · **Tags:** ai · models · providers · streaming · llm

## What this does

Multi-provider AI model integration with fallback chains, cost tracking, streaming, and extended thinking support

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **provider_id** *(text, required)* — Provider ID
- **provider_name** *(text, required)* — Provider Name
- **model_id** *(text, required)* — Model ID
- **model_name** *(text, required)* — Model Display Name
- **supports_reasoning** *(boolean, required)* — Reasoning Support
- **input_types** *(json, required)* — Input Types
- **max_input_tokens** *(number, required)* — Context Window
- **max_output_tokens** *(number, required)* — Max Output Tokens
- **cost_per_input_mtok** *(number, required)* — Input Cost ($/MTok)
- **cost_per_output_mtok** *(number, required)* — Output Cost ($/MTok)
- **cost_per_cache_read_mtok** *(number, optional)* — Cache Read Cost ($/MTok)
- **cost_per_cache_write_mtok** *(number, optional)* — Cache Write Cost ($/MTok)
- **auth_methods** *(json, required)* — Auth Methods
- **api_key** *(token, optional)* — API Key
- **oauth_token** *(token, optional)* — OAuth Token
- **auth_profile_id** *(text, optional)* — Auth Profile ID
- **thinking_level** *(select, optional)* — Thinking Level
- **thinking_budget_tokens** *(number, optional)* — Thinking Budget (tokens)
- **supports_streaming** *(boolean, required)* — Streaming Support
- **supports_vision** *(boolean, required)* — Vision Support
- **supports_caching** *(boolean, optional)* — Caching Support
- **supports_tool_use** *(boolean, required)* — Tool Use Support
- **streaming_mode** *(select, required)* — Streaming Display Mode
- **is_primary** *(boolean, required)* — Is Primary
- **fallback_models** *(json, optional)* — Fallback Models
- **input_tokens** *(number, optional)* — Input Tokens Used
- **output_tokens** *(number, optional)* — Output Tokens Used

## What must be true

- **model_selection → model_resolution:** Priority: 1. Session-level override (session.model_override) 2. Agent-level primary (agent.model.primary) 3. System-wide default (config.models.default) 4. Fallback chain (if primary unavailable) Resolved at chat.send time (not session creation).
- **model_selection → fallback_chain:** If primary model unavailable: 1. Try fallback_models[0] 2. Try fallback_models[1], etc. 3. Try system default 4. Fail with error if none available Triggers: API error, rate limit, auth failure, model deprecated. Transparent: user sees fallback seamlessly.
- **model_selection → forward_compatibility:** Models may change API surface over time. compat_config handles: - Model ID remapping (gpt-4 → gpt-4-turbo) - Default parameter changes - Deprecated feature removal - API endpoint changes
- **authentication → auth_method_selection:** Methods per provider: - "api_key" — static key in header - "oauth" — refresh token flow (auto-renew) - "token" — bearer token (static) - "aws-sdk" — AWS credential chain Selection: first available method.
- **authentication → credential_management:** Stored in: - config.auth (direct, plaintext) - config/auth-profiles.json (named) - Environment variables (${VAR_NAME}) - AWS credential chain Priority: session > agent > global. Secrets redaction: _KEY, _TOKEN, _SECRET patterns.
- **authentication → oauth_refresh_flow:** For OAuth: 1. Initial auth: exchange code for tokens 2. Token check: verify expiry before API call 3. Refresh: if <7 days to expiry, refresh proactively 4. Store: save tokens to auth-profiles.json 5. Fallback: use cached token if refresh fails Max retries: 3 with exponential backoff.
- **model_capabilities → thinking_mode_activation:** Extended thinking (if reasoning=true): - off — no thinking - minimal — 5-10K token budget - low — 10-50K tokens - medium — 50-200K tokens - high — 200K+ tokens - xhigh — max available - adaptive — auto-select by query Thinking tokens separate from response tokens. Cost: may have different cost per provider.
- **model_capabilities → vision_support:** Image input handling: - OpenAI: URL or base64 (2000 token limit, 20 max images) - Anthropic: base64 (no explicit limit) - Google: URI references (Cloud Storage) Image preprocessing: resize large images, convert formats. Unsupported: send text-only fallback.
- **model_capabilities → tool_use:** Function calling (if supportsToolUse=true): 1. Define tool schema: name, description, parameters 2. Model generates tool_calls in response 3. Execute tools synchronously 4. Append results to conversation 5. Continue until no more tool_calls or iteration limit Max iterations: 10 (configurable).
- **model_capabilities → caching_support:** Prompt caching (if supportsCaching=true): - Anthropic: cache_control on messages, auto-evict - OpenAI: cache_control on logit_bias Cost: cache write ~25% of read cost (saves 90% on reads). Automatic: enabled if >1K tokens.
- **streaming → streaming_modes:** Display modes: - "off" — wait for full response - "partial" — edit message in-place - "block" — display in chunks - "progress" — show indicator, full message at end Channel-dependent: Discord partial risky (edit limits). Config: per-agent or per-session override.
- **streaming → streaming_error_handling:** On stream error: - Connection drop → retry entire request - Invalid delta → skip, log, continue - Rate limit during stream → pause, wait, resume - Partial response → deliver what received, notify user Transparent retry: user doesn't re-send.
- **streaming → token_counting:** Tracked: - inputTokens — user message + system prompt - outputTokens — model response - cacheReadTokens — from cached prompt - cacheWriteTokens — written to cache Reported by: provider in final response metadata. Accumulated: in session entry for cost tracking.

## Success & failure scenarios

**✅ Success paths**

- **Model Loaded** — when model_id exists; provider API authenticated; model_id exists in provider catalog, then Model ready for inference.
- **Api Request Succeeded** — when API request sent; HTTP 200 or streaming started, then Response processed, tokens counted, cost calculated.
- **Streaming Response** — when streaming_mode neq "off"; provider supports streaming, then Response tokens streamed to client, displayed progressively.
- **Fallback Activated** — when provider_state in ["rate_limited","auth_failed","unavailable"]; fallback_models exists, then Fallback model used, request retried.
- **Cost Estimation** — when estimated_cost_usd gt "cost_threshold", then User alerted to high cost before execution.

## Errors it can return

- `MODEL_NOT_AVAILABLE` — Model not available
- `AUTH_FAILED` — Provider authentication failed
- `RATE_LIMIT_EXCEEDED` — Provider rate limit exceeded
- `INVALID_MODEL_CONFIG` — Model configuration invalid
- `RESPONSE_FORMAT_ERROR` — Failed to parse provider response
- `THINKING_BUDGET_EXCEEDED` — Thinking tokens exceeded budget
- `STREAMING_INTERRUPTED` — Streaming response interrupted

## Connects to

- **openclaw-session-management** *(required)* — Tracks token usage and cost per session
- **openclaw-plugin-system** *(required)* — Provider implementations are plugins
- **openclaw-gateway-authentication** *(required)* — Authenticates provider API calls

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ai/openclaw-llm-provider/) · **Spec source:** [`openclaw-llm-provider.blueprint.yaml`](./openclaw-llm-provider.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
