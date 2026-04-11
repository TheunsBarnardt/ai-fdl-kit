---
title: "Openclaw Messaging Channel Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery. 15 fields. 3 o"
---

# Openclaw Messaging Channel Blueprint

> Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery

| | |
|---|---|
| **Feature** | `openclaw-messaging-channel` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | messaging, channels, discord, telegram, multi-platform |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/openclaw-messaging-channel.blueprint.yaml) |
| **JSON API** | [openclaw-messaging-channel.json]({{ site.baseurl }}/api/blueprints/integration/openclaw-messaging-channel.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human |  |
| `platform` | Messaging Platform | external |  |
| `channel_plugin` | Channel Plugin | system |  |
| `gateway` | OpenClaw Gateway | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `channel_id` | text | Yes | Channel ID |  |
| `account_id` | text | Yes | Account ID |  |
| `message_id` | text | Yes | Message ID |  |
| `platform_user_id` | text | Yes | Platform User ID |  |
| `platform_chat_id` | text | No | Chat/Channel ID |  |
| `thread_id` | text | No | Thread ID |  |
| `message_text` | text | Yes | Message Content |  |
| `attachments` | json | No | Attachments |  |
| `message_type` | select | Yes | Message Type |  |
| `peer_kind` | select | Yes | Peer Type |  |
| `dm_policy` | select | No | DM Security Policy |  |
| `response_text` | text | No | Response Text |  |
| `response_components` | json | No | Response Components |  |
| `message_action` | select | No | Message Action |  |
| `text_chunk_limit` | number | No | Text Chunk Limit |  |

## States

**State field:** `undefined`

## Rules

- **inbound_message_handling:**
  - **message_reception:** Inbound flow:
1. Platform sends webhook/event to gateway
2. Channel plugin parses platform format
3. Normalize to unified structure
4. Extract: message_id, sender, content, attachments, metadata
5. Route via message-routing system
6. Dispatch to target agent

  - **message_normalization:** Platform formats converted to unified:
- Discord: Message object → message_text + attachments
- Telegram: Update → message_text + media URLs
- Slack: event_callback → message_text + blocks
- Matrix: m.room.message → message_text + files
Platform differences abstracted from agent.

  - **user_identification:** Platform user IDs normalized:
- Discord: Snowflake ID (int64)
- Telegram: Integer ID
- Slack: U-prefixed string
- Matrix: @user:server.com
Stored with channel prefix for lookup.

  - **attachment_handling:** Supported types: image, file, audio, video.
Max size: platform-dependent (8-25MB typical).
Stored as: attachments[{ type, url, name, size }].
URL handling: some require auth, others public.

- **outbound_message_sending:**
  - **send_flow:** Agent generates response:
1. Message tool called with { text, components, actions }
2. Message tool routes to channel plugin
3. Plugin transforms to platform format
4. Send via platform API
5. Track delivery status (sent, failed, rate-limited)
6. Update session.lastChannel/lastTo

  - **message_splitting:** For messages exceeding platform limits:
- Discord: split at 2000 chars
- Telegram: split at 4096 chars
- Slack: split at 4000 chars
Each chunk sent as separate message.

  - **component_rendering:** Components adapted per platform:
- Discord: Rich embeds, buttons, select menus, modals
- Telegram: Inline buttons (callback_data), keyboards
- Slack: Block Kit (buttons, select menus)
- WhatsApp: Template buttons (max 3)
Platform limitations: too many buttons → error or truncation.

  - **rate_limiting:** Platform rate limits handled:
- Discord: 50 messages/60 seconds per channel
- Telegram: 30 messages/second globally
- Slack: 1 message/second per channel
Queue strategy: queue excess, retry with backoff.
Max retries: 3 (configurable).
Backoff: exponential (300ms, 1s, 5s).

- **access_control:**
  - **dm_policy_enforcement:** DM access controlled by dmPolicy:
- "pairing" — device pairing required (most secure)
- "allowlist" — allowFrom[] enforced
- "open" — allowFrom=["*"] required
- "disabled" — all DMs rejected
Check at message-routing, before agent dispatch.

  - **guild_channel_allowlist:** Guild-level (Discord/Slack):
- Require mention: @bot mention required (optional)
- User allowlist: guild.users[]
- Role allowlist: guild.roles[]
- Channel allowlist: guild.channels.<id>.allow
If allowlist configured: default deny (whitelist mode).

  - **permission_checks:** Agent execution permissions:
- requireMention: @mention required
- ignoreOtherMentions: drop if others mentioned
- dangerouslyAllowNameMatching: name match fallback (insecure)
Violations: message rejected or error sent.

- **message_types:**
  - **text_messages:** Plain text or markdown (platform-dependent).
Discord: markdown (bold, italic, code blocks).
Telegram: HTML/Markdown (configurable).
Slack: mrkdwn format.

  - **rich_components:** Types: buttons, select menus, text input, modals.
Button: label, action, optional payload, style.
Select: placeholder, options[], onChange handler.
Modal: title, customId, fields (1-5).

  - **reactions:** Actions: add, remove, list.
Discord: emoji reactions (custom + unicode).
Telegram: emoji reactions (limited set).
Slack: emoji reactions (any Slack emoji).

  - **threads:** Thread support (if platform enables):
- Create thread: send initial message, create context
- Reply in thread: threadId provided
- Collapse threads: per session config
- Inherit from parent: thread inherits DM policy
Coverage: Discord threads, Telegram topics, Slack threads.

- **moderation_actions:**
  - **moderation_capabilities:** Actions for trusted agents:
- kick: remove from guild/group
- ban: prevent re-joining (indefinite)
- timeout: temporary mute (duration configurable)
- role-add/role-remove: Discord role management
Permissions: bot must have moderation permissions.
Trust: admin agent or explicit approval.

  - **action_validation:** Moderation actions validated:
- Target must be guild/group member
- Bot must have permission
- Duration constraints: timeout max 28 days
- Reason logged for audit.


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| inbound_latency | 2s |  |
| outbound_latency | 3s |  |
| platform_availability |  |  |

## Outcomes

### Inbound_message_received (Priority: 1)

**Given:**
- platform webhook received
- `message_text` (input) exists
- sender verified via platform API

**Then:**
- **set_field** target: `message_id` value: `platform message ID`
- **set_field** target: `platform_user_id` value: `extracted from platform`
- **set_field** target: `message_type` value: `determined from content`
- **transition_state** field: `delivery_state` from: `received` to: `routed`
- **emit_event** event: `message.received`

**Result:** Message normalized and routed to agent

### Message_sent (Priority: 1) — Error: `MESSAGE_NOT_SENT` | Transaction: atomic

**Given:**
- platform API accepted message

**Then:**
- **set_field** target: `delivery_state` value: `sent`
- **emit_event** event: `message.sent`

**Result:** Message delivered to platform

### Rate_limit_handling (Priority: 2) — Error: `PLATFORM_RATE_LIMITED`

**Given:**
- platform returned 429 or rate limit header

**Then:**
- **call_service** target: `external_service`
- **emit_event** event: `message.failed`

**Result:** Message queued with exponential backoff, will retry

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MESSAGE_NOT_SENT` | 500 | Failed to send message to platform | No |
| `PLATFORM_RATE_LIMITED` | 429 | Platform rate limit exceeded | No |
| `DM_NOT_ALLOWED` | 403 | Direct message not allowed for this user | No |
| `INVALID_MESSAGE_FORMAT` | 400 | Message format invalid for platform | No |
| `ACCOUNT_NOT_AUTHORIZED` | 401 | Account token invalid or expired | No |
| `MEMBER_NOT_FOUND` | 404 | Member not found on platform | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message.received` |  | `channel_id`, `message_id`, `platform_user_id`, `message_type`, `peer_kind` |
| `message.sent` |  | `channel_id`, `message_id`, `platform_message_id`, `delivery_time_ms` |
| `message.failed` |  | `channel_id`, `message_id`, `error_code`, `final_attempt` |
| `platform.connected` |  | `channel_id`, `account_id` |
| `platform.disconnected` |  | `channel_id`, `account_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| openclaw-message-routing | required | Routes messages to agents |
| openclaw-session-management | required | Stores conversation in persistent session |
| openclaw-plugin-system | required | Channel adapters are plugins |
| openclaw-gateway-authentication | required | Authenticates platform API calls |

## AGI Readiness

### Goals

#### Reliable Openclaw Messaging Channel

Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `openclaw_message_routing` | openclaw-message-routing | degrade |
| `openclaw_session_management` | openclaw-session-management | degrade |
| `openclaw_plugin_system` | openclaw-plugin-system | degrade |
| `openclaw_gateway_authentication` | openclaw-gateway-authentication | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| inbound_message_received | `autonomous` | - | - |
| message_sent | `autonomous` | - | - |
| rate_limit_handling | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  patterns:
    - Adapter pattern
    - Message normalization
    - Retry with exponential backoff
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Openclaw Messaging Channel Blueprint",
  "description": "Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery. 15 fields. 3 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, channels, discord, telegram, multi-platform"
}
</script>
