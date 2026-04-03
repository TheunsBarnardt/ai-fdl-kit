---
title: "Openclaw Message Routing Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Central message router resolving inbound messages to agents via binding precedence, role-based routing, and guild/channel/peer matching. 12 fields. 2 outcomes. "
---

# Openclaw Message Routing Blueprint

> Central message router resolving inbound messages to agents via binding precedence, role-based routing, and guild/channel/peer matching

| | |
|---|---|
| **Feature** | `openclaw-message-routing` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | gateway, routing, messaging, multi-tenant, binding-resolution |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/openclaw-message-routing.blueprint.yaml) |
| **JSON API** | [openclaw-message-routing.json]({{ site.baseurl }}/api/blueprints/integration/openclaw-message-routing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `message_source` | Inbound Message Source | external |  |
| `gateway` | OpenClaw Gateway | system |  |
| `agent` | AI Agent | system |  |
| `config_store` | Configuration Store | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `channel` | text | Yes | Messaging Channel |  |
| `account_id` | text | No | Account ID |  |
| `peer_kind` | select | No | Peer Type |  |
| `peer_id` | text | No | Peer ID |  |
| `guild_id` | text | No | Guild ID |  |
| `team_id` | text | No | Team ID |  |
| `member_role_ids` | json | No | Member Roles |  |
| `agent_id` | text | Yes | Resolved Agent ID |  |
| `session_key` | text | Yes | Session Key |  |
| `main_session_key` | text | Yes | Main Session Key |  |
| `last_route_policy` | select | Yes | Last Route Policy |  |
| `matched_by` | select | Yes | Binding Match Type |  |

## States

**State field:** `undefined`

## Rules

- **routing:**
  - **binding_precedence:** Bindings evaluated in strict order (first match wins):
1. binding.peer — exact direct peer (highest priority)
2. binding.peer.parent — thread parent peer
3. binding.peer.wildcard — wildcard peer kind (group ↔ channel)
4. binding.guild+roles — guild + role intersection
5. binding.guild — guild ID match
6. binding.team — team ID match
7. binding.account — account-level default
8. binding.channel — channel-level default
9. default — system default agent (lowest priority)

  - **agent_id_normalization:** All agent IDs normalized to lowercase for matching.
Case-insensitive lookup preserves original ID casing in resolution.
Missing/empty agent_id falls back to resolveDefaultAgentId(cfg).

  - **session_key_derivation:** Format: agent:<agentId>:<scoped_path>
Examples:
- agent:mybot:main (DM collapse)
- agent:mybot:discord:direct:userid (per-channel DM)
- agent:mybot:group:groupid (group messages)
- agent:mybot:discord:direct:userid:thread:threadid (threaded)
Max length: 255 characters
Normalized to lowercase for storage

  - **cache_strategy:** Resolved routes cached with per-cfg object weak map.
Cache limit: 4000 entries (entire cache cleared on limit exceeded).
Stale detection: config change clears all caches for that object.

- **binding_matching:**
  - **peer_normalization:** Peer ID normalization:
- String: trimmed directly
- Number/BigInt: converted to string
- Null/undefined: treated as "unknown"
Wildcard: "group" matches "channel" (platforms differ)

  - **role_matching:** Discord role-based routing via set intersection.
All specified roles required to match (AND logic).
Empty roles[] matches any member (no restriction).

  - **guild_team_scoping:** guildId/teamId matching bypasses channel scope.
Sub-guild bindings override guild bindings.

- **dm_policy:**
  - **peer_kind_matching:** peer.kind values: direct (1:1), group (multi-user), channel (public)
Peer.id normalization: trimmed, ID-only (remove prefixes)
Parent peer matching for threads: inheritance of parent policy

  - **last_route_policy_logic:** lastRoutePolicy = (sessionKey === mainSessionKey) ? "main" : "session"
"main": all inbound from peer update mainSessionKey (collapsed)
"session": updates target specific sessionKey (per-peer context)


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| routing_latency | 100ms |  |
| cache_hit_ratio |  |  |

## Outcomes

### Binding_matched (Priority: 1)

**Given:**
- message received on channel
- channel and account_id provided
- `matched_by` (computed) neq `default`

**Then:**
- **set_field** target: `agent_id` value: `resolved agent from binding`
- **set_field** target: `session_key` value: `derived from agentId, channel, peer, dmScope`
- **set_field** target: `matched_by` value: `binding rule that matched`
- **emit_event** event: `route.resolved`

**Result:** Agent determined, route resolved to session_key

### Fallback_to_default (Priority: 10)

**Given:**
- message processed
- no binding matched any rule

**Then:**
- **set_field** target: `agent_id` value: `resolveDefaultAgentId(cfg)`
- **set_field** target: `matched_by` value: `default`
- **emit_event** event: `route.fallback`

**Result:** Fallback agent used, message proceeds to dispatch

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AGENT_NOT_FOUND` | 404 | Agent not found in configuration | No |
| `INVALID_SESSION_KEY` | 400 | Invalid session key format | No |
| `BINDING_RESOLUTION_FAILED` | 500 | Unable to resolve agent binding | No |
| `CACHE_MISS` | 500 | Route cache miss | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `route.resolved` |  | `agent_id`, `channel`, `matched_by`, `session_key`, `last_route_policy` |
| `route.fallback` |  | `channel`, `account_id`, `peer_kind`, `default_agent_id` |
| `route.cache_cleared` |  | `reason`, `cache_size_before` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| openclaw-session-management | required | Session key used in persistent conversation store |
| openclaw-gateway-authentication | required | Auth must resolve before routing to determine user scope |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Node.js
  patterns:
    - Precedence-based matching
    - Weak-map caching
    - Lazy role intersection evaluation
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Openclaw Message Routing Blueprint",
  "description": "Central message router resolving inbound messages to agents via binding precedence, role-based routing, and guild/channel/peer matching. 12 fields. 2 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gateway, routing, messaging, multi-tenant, binding-resolution"
}
</script>
