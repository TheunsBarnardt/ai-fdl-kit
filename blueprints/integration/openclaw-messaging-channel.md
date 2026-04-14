<!-- AUTO-GENERATED FROM openclaw-messaging-channel.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openclaw Messaging Channel

> Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery

**Category:** Integration · **Version:** 1.0.0 · **Tags:** messaging · channels · discord · telegram · multi-platform

## What this does

Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **channel_id** *(text, required)* — Channel ID
- **account_id** *(text, required)* — Account ID
- **message_id** *(text, required)* — Message ID
- **platform_user_id** *(text, required)* — Platform User ID
- **platform_chat_id** *(text, optional)* — Chat/Channel ID
- **thread_id** *(text, optional)* — Thread ID
- **message_text** *(text, required)* — Message Content
- **attachments** *(json, optional)* — Attachments
- **message_type** *(select, required)* — Message Type
- **peer_kind** *(select, required)* — Peer Type
- **dm_policy** *(select, optional)* — DM Security Policy
- **response_text** *(text, optional)* — Response Text
- **response_components** *(json, optional)* — Response Components
- **message_action** *(select, optional)* — Message Action
- **text_chunk_limit** *(number, optional)* — Text Chunk Limit

## What must be true

- **inbound_message_handling → message_reception:** Inbound flow: 1. Platform sends webhook/event to gateway 2. Channel plugin parses platform format 3. Normalize to unified structure 4. Extract: message_id, sender, content, attachments, metadata 5. Route via message-routing system 6. Dispatch to target agent
- **inbound_message_handling → message_normalization:** Platform formats converted to unified: - Discord: Message object → message_text + attachments - Telegram: Update → message_text + media URLs - Slack: event_callback → message_text + blocks - Matrix: m.room.message → message_text + files Platform differences abstracted from agent.
- **inbound_message_handling → user_identification:** Platform user IDs normalized: - Discord: Snowflake ID (int64) - Telegram: Integer ID - Slack: U-prefixed string - Matrix: @user:server.com Stored with channel prefix for lookup.
- **inbound_message_handling → attachment_handling:** Supported types: image, file, audio, video. Max size: platform-dependent (8-25MB typical). Stored as: attachments[{ type, url, name, size }]. URL handling: some require auth, others public.
- **outbound_message_sending → send_flow:** Agent generates response: 1. Message tool called with { text, components, actions } 2. Message tool routes to channel plugin 3. Plugin transforms to platform format 4. Send via platform API 5. Track delivery status (sent, failed, rate-limited) 6. Update session.lastChannel/lastTo
- **outbound_message_sending → message_splitting:** For messages exceeding platform limits: - Discord: split at 2000 chars - Telegram: split at 4096 chars - Slack: split at 4000 chars Each chunk sent as separate message.
- **outbound_message_sending → component_rendering:** Components adapted per platform: - Discord: Rich embeds, buttons, select menus, modals - Telegram: Inline buttons (callback_data), keyboards - Slack: Block Kit (buttons, select menus) - WhatsApp: Template buttons (max 3) Platform limitations: too many buttons → error or truncation.
- **outbound_message_sending → rate_limiting:** Platform rate limits handled: - Discord: 50 messages/60 seconds per channel - Telegram: 30 messages/second globally - Slack: 1 message/second per channel Queue strategy: queue excess, retry with backoff. Max retries: 3 (configurable). Backoff: exponential (300ms, 1s, 5s).
- **access_control → dm_policy_enforcement:** DM access controlled by dmPolicy: - "pairing" — device pairing required (most secure) - "allowlist" — allowFrom[] enforced - "open" — allowFrom=["*"] required - "disabled" — all DMs rejected Check at message-routing, before agent dispatch.
- **access_control → guild_channel_allowlist:** Guild-level (Discord/Slack): - Require mention: @bot mention required (optional) - User allowlist: guild.users[] - Role allowlist: guild.roles[] - Channel allowlist: guild.channels.<id>.allow If allowlist configured: default deny (whitelist mode).
- **access_control → permission_checks:** Agent execution permissions: - requireMention: @mention required - ignoreOtherMentions: drop if others mentioned - dangerouslyAllowNameMatching: name match fallback (insecure) Violations: message rejected or error sent.
- **message_types → text_messages:** Plain text or markdown (platform-dependent). Discord: markdown (bold, italic, code blocks). Telegram: HTML/Markdown (configurable). Slack: mrkdwn format.
- **message_types → rich_components:** Types: buttons, select menus, text input, modals. Button: label, action, optional payload, style. Select: placeholder, options[], onChange handler. Modal: title, customId, fields (1-5).
- **message_types → reactions:** Actions: add, remove, list. Discord: emoji reactions (custom + unicode). Telegram: emoji reactions (limited set). Slack: emoji reactions (any Slack emoji).
- **message_types → threads:** Thread support (if platform enables): - Create thread: send initial message, create context - Reply in thread: threadId provided - Collapse threads: per session config - Inherit from parent: thread inherits DM policy Coverage: Discord threads, Telegram topics, Slack threads.
- **moderation_actions → moderation_capabilities:** Actions for trusted agents: - kick: remove from guild/group - ban: prevent re-joining (indefinite) - timeout: temporary mute (duration configurable) - role-add/role-remove: Discord role management Permissions: bot must have moderation permissions. Trust: admin agent or explicit approval.
- **moderation_actions → action_validation:** Moderation actions validated: - Target must be guild/group member - Bot must have permission - Duration constraints: timeout max 28 days - Reason logged for audit.

## Success & failure scenarios

**✅ Success paths**

- **Inbound Message Received** — when platform webhook received; message_text exists; sender verified via platform API, then Message normalized and routed to agent.

**❌ Failure paths**

- **Message Sent** — when platform API accepted message, then Message delivered to platform. *(error: `MESSAGE_NOT_SENT`)*
- **Rate Limit Handling** — when platform returned 429 or rate limit header, then Message queued with exponential backoff, will retry. *(error: `PLATFORM_RATE_LIMITED`)*

## Errors it can return

- `MESSAGE_NOT_SENT` — Failed to send message to platform
- `PLATFORM_RATE_LIMITED` — Platform rate limit exceeded
- `DM_NOT_ALLOWED` — Direct message not allowed for this user
- `INVALID_MESSAGE_FORMAT` — Message format invalid for platform
- `ACCOUNT_NOT_AUTHORIZED` — Account token invalid or expired
- `MEMBER_NOT_FOUND` — Member not found on platform

## Events

**`message.received`**
  Payload: `channel_id`, `message_id`, `platform_user_id`, `message_type`, `peer_kind`

**`message.sent`**
  Payload: `channel_id`, `message_id`, `platform_message_id`, `delivery_time_ms`

**`message.failed`**
  Payload: `channel_id`, `message_id`, `error_code`, `final_attempt`

**`platform.connected`**
  Payload: `channel_id`, `account_id`

**`platform.disconnected`**
  Payload: `channel_id`, `account_id`, `reason`

## Connects to

- **openclaw-message-routing** *(required)* — Routes messages to agents
- **openclaw-session-management** *(required)* — Stores conversation in persistent session
- **openclaw-plugin-system** *(required)* — Channel adapters are plugins
- **openclaw-gateway-authentication** *(required)* — Authenticates platform API calls

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/openclaw-messaging-channel/) · **Spec source:** [`openclaw-messaging-channel.blueprint.yaml`](./openclaw-messaging-channel.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
