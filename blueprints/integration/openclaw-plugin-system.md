<!-- AUTO-GENERATED FROM openclaw-plugin-system.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openclaw Plugin System

> Plugin registration, lifecycle management, and capability-based permissions system for extending OpenClaw functionality

**Category:** Integration · **Version:** 1.0.0 · **Tags:** plugins · extensibility · capabilities · configuration · modular

## What this does

Plugin registration, lifecycle management, and capability-based permissions system for extending OpenClaw functionality

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **plugin_id** *(text, required)* — Plugin ID
- **plugin_name** *(text, required)* — Plugin Name
- **plugin_version** *(text, required)* — Plugin Version
- **enabled** *(boolean, required)* — Enabled
- **config** *(json, optional)* — Configuration
- **declared_capabilities** *(json, required)* — Declared Capabilities
- **initialized** *(boolean, optional)* — Initialized
- **manifest_hash** *(text, optional)* — Manifest Hash
- **plugin_scope** *(select, optional)* — Execution Scope
- **hooks_enabled** *(json, optional)* — Hooks Configuration

## What must be true

- **plugin_loading → discovery_paths:** Plugins loaded from: 1. Bundled plugins (node_modules/openclaw*/index.ts) 2. Configured load paths (plugins.load.paths[]) 3. Node modules with @openclaw namespace Plugin must export: definePluginEntry() or defineChannelPluginEntry().
- **plugin_loading → lazy_loading:** Plugins loaded on-demand (not at startup by default). Trigger: First use or explicit /plugin load command. Exceptions: Critical plugins pre-loaded (auth, memory, context-engine). Benefit: Faster startup, reduced memory footprint.
- **plugin_loading → manifest_validation:** Every plugin provides manifest: { id, name, description, version, authors, capabilities } Validation: required fields + format checks. Error: plugin rejected if manifest invalid.
- **plugin_lifecycle → initialization_sequence:** 1. Load module (require/import) 2. Validate manifest (id, version, capabilities) 3. Merge with config (from plugins.entries) 4. Initialize config schema (Zod/JSON Schema) 5. Call onEnable() hook (if defined) 6. Register capabilities with gateway 7. Mark initialized=true Failure at any step: plugin disabled, error logged.
- **plugin_lifecycle → enable_disable:** Enable: Set enabled=true, call onEnable(), expose capabilities. Disable: Set enabled=false, call onDisable(), hide capabilities. Required plugin disabled: warning logged, may prevent execution. Dynamic enable/disable available via CLI.
- **plugin_lifecycle → reload_strategy:** On config change: 1. Compare manifest_hash 2. If unchanged: skip reload 3. If changed: unload, reinitialize, reload Preserve auth profiles across reload.
- **plugin_configuration → config_schema_validation:** Plugin defines configSchema (Zod or JSON Schema). config object validated against schema on load. Errors: detailed path reporting (e.g., "config.deeplink.port"). Invalid config: plugin disabled, error shown.
- **plugin_configuration → ui_hints:** Config schema includes UI hints: { field, type, sensitive, description, ui_type } Respected by: CLI wizard, web config UI, mobile app.
- **plugin_configuration → nested_configuration:** Plugins can have deeply nested config with recursive validation. Path-based access: config.integrations.discord.token.
- **plugin_configuration → environment_variable_substitution:** Config values can reference env vars: "apiKey": "${MY_API_KEY}" or "${API_URL:-https://default.com}" Substitution: performed during load. Secrets detection: _KEY, _TOKEN, _PASSWORD, _SECRET redacted in logs.
- **capability_model → capability_declaration:** Plugins declare capabilities: ["chat.send", "context.read", "tool.custom", "event.listen"] Capabilities are strings (provider/type/name format).
- **capability_model → capability_gating:** Tools/features check plugin.capabilities before invocation. Missing capability: tool call rejected with permission error. Prevents plugins from exceeding declared scope.
- **capability_model → capability_categories:** System: memory, context-engine, rag, tool.index Chat: chat.send, chat.receive, chat.edit Tools: tool.* (custom namespaces) Context: context.read, context.inject Events: event.listen, event.emit
- **slot_based_plugins → memory_slot:** plugins.slots.memory: single plugin controls conversation memory. Only one memory plugin enabled at a time. Alternatives: default (file-based), vector DB, custom. Switching: update config, restart gateway.
- **slot_based_plugins → context_engine_slot:** plugins.slots.contextEngine: single plugin provides context building. Builds prompt context from conversation history. Alternatives: default (transcript), RAG, custom.
- **plugin_allowlist_denylist → allowlist_behavior:** plugins.allow: string[] of allowed plugin IDs. If set: ONLY these plugins can load (whitelist mode). Others: rejected during load.
- **plugin_allowlist_denylist → denylist_behavior:** plugins.deny: string[] of blocked plugin IDs. If set: these plugins cannot load. Deny takes precedence over allow (safer default).

## Success & failure scenarios

**✅ Success paths**

- **Plugin Loaded** — when plugin_id provided; plugin_id exists; plugin module found in search paths, then Plugin module loaded, manifest validated.
- **Plugin Initialized** — when plugin_state eq "loading"; configSchema validated against config; onEnable() hook completed without error, then Plugin enabled, capabilities exposed to gateway.
- **Capability Check** — when plugin attempting tool use; required_capability in "declared_capabilities", then Capability check passed, tool use allowed.
- **Plugin Disabled** — when enabled eq "false", then Plugin disabled, no longer accessible.

**❌ Failure paths**

- **Capability Denied** — when required_capability not_in "declared_capabilities", then Capability check failed, tool use denied. *(error: `CAPABILITY_DENIED`)*

## Errors it can return

- `PLUGIN_NOT_FOUND` — Plugin not found
- `PLUGIN_INITIALIZATION_FAILED` — Plugin failed to initialize
- `INVALID_PLUGIN_CONFIG` — Plugin configuration invalid
- `CAPABILITY_DENIED` — Plugin capability not declared
- `AUTH_PROFILE_NOT_FOUND` — Auth profile not found
- `PLUGIN_CONFLICT` — Plugin conflict

## Connects to

- **openclaw-gateway-authentication** *(optional)* — Some plugins manage authentication
- **openclaw-llm-provider** *(optional)* — Plugins can provide LLM models

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/openclaw-plugin-system/) · **Spec source:** [`openclaw-plugin-system.blueprint.yaml`](./openclaw-plugin-system.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
