<!-- AUTO-GENERATED FROM openclaw-session-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Openclaw Session Management

> Persistent conversation storage with automatic disk budgeting, transcript rotation, and session lifecycle tracking across messaging channels

**Category:** Data · **Version:** 1.0.0 · **Tags:** persistence · conversation · storage · lifecycle · maintenance

## What this does

Persistent conversation storage with automatic disk budgeting, transcript rotation, and session lifecycle tracking across messaging channels

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **session_id** *(text, required)* — Session ID
- **session_key** *(text, required)* — Session Key
- **agent_id** *(text, required)* — Agent ID
- **channel** *(text, optional)* — Channel
- **account_id** *(text, optional)* — Account ID
- **created_at** *(datetime, required)* — Created At
- **updated_at** *(datetime, required)* — Updated At
- **last_activity** *(datetime, optional)* — Last Activity
- **idle_minutes** *(number, optional)* — Idle Timeout Minutes
- **message_count** *(number, required)* — Message Count
- **transcript_bytes** *(number, required)* — Transcript Size (bytes)
- **model_override** *(text, optional)* — Model Override
- **provider_override** *(text, optional)* — Provider Override
- **thinking_level** *(select, optional)* — Thinking Level
- **input_tokens** *(number, optional)* — Input Tokens
- **output_tokens** *(number, optional)* — Output Tokens
- **last_channel** *(text, optional)* — Last Delivery Channel
- **last_to** *(text, optional)* — Last Delivery Target
- **transcript_file** *(text, required)* — Transcript File Path

## What must be true

- **session_lifecycle → creation:** Sessions created implicitly on first inbound message. sessionKey derived from: agent_id + channel + account_id + peer. Initial entry written with createdAt, updatedAt, sessionId, empty transcript.
- **session_lifecycle → updates:** Every agent response updates session: - Append messages to transcript - Increment updatedAt - Update last_activity, token counts - Record model/provider overrides Atomic write with file lock (acquireSessionWriteLock). Max concurrent writers per session: 1. Lock timeout: 30 seconds.
- **session_lifecycle → archival_on_reset:** When reset trigger matches: - Rotate transcript: <key>.json → <key>.reset.<timestamp>.json - Start new transcript: <key>.json = [] - Retention: configurable (default 30 days)
- **session_lifecycle → idle_timeout:** If idleMinutes > 0: - Check: now - last_activity > idleMinutes * 60000 - If true: trigger session.reset (rotate, clear context)
- **transcript_management → message_append:** Messages appended as objects to transcript[]: { id: string; role: "user"|"assistant"; content: string; createdAt: ISO8601; tokens?: { input, output }; metadata?: { channel, threadId, ... }; }
- **transcript_management → message_size_limits:** Individual messages capped at 128KB. Oversized: replaced with "[chat.history omitted: message too large]". Total history display limit: 12K chars.
- **transcript_management → transcript_rotation:** Reset triggers: cron-based or manual /reset command. Old transcript archived to reset_archives. Storage: sessions.json (index) + per-session files.
- **disk_budget_enforcement → budget_limits:** maxDiskBytes: total allowed storage (default 5GB). highWaterBytes: cleanup threshold (default 80% of max). Enforcement: check on every write. Exceeds max: pruneStaleEntries() removes oldest archives (FIFO).
- **disk_budget_enforcement → pruning_strategy:** When totalBytes > maxDiskBytes: 1. Sort sessions by updatedAt (oldest first) 2. Delete oldest reset_archives per session 3. If still over budget: delete oldest sessions Entries capped at max (default 500).
- **disk_budget_enforcement → cache_invalidation:** After disk budget enforcement: - Clear memory cache - Reload from disk on next access
- **concurrent_access → write_locking:** File-based locking via acquireSessionWriteLock(): - One writer per sessionKey at a time - Queued writes wait (timeout: 30s) - Automatic release on completion Release: on write completion or timeout.
- **concurrent_access → read_caching:** Recent entries cached in memory. Cache valid until session updated. On write: clear cache for that sessionKey.
- **concurrent_access → deadlock_prevention:** Lock timeout: 30 seconds. Stale lock detection: >1 minute assumed crashed. Automatic cleanup: remove stale lock, retry.

## Success & failure scenarios

**✅ Success paths**

- **Message Appended** — when session exists or will be created; session_key exists; new message content provided, then Message persisted, session metadata updated.
- **Transcript Rotated** — when reset trigger matched OR /reset command; session has messages, then Old transcript archived, new session started.
- **Idle Session Reset** — when idle_minutes gt 0; elapsed_time gt "idle_minutes minutes", then Session marked idle, awaiting reset.

**❌ Failure paths**

- **Disk Budget Enforced** — when total_bytes_used gt "max_disk_bytes", then Old transcripts deleted, disk budget enforced. *(error: `DISK_CLEANUP_FAILED`)*

## Errors it can return

- `SESSION_NOT_FOUND` — Session does not exist
- `DISK_QUOTA_EXCEEDED` — Insufficient storage for new message
- `WRITE_LOCK_TIMEOUT` — Session write lock timeout
- `TRANSCRIPT_CORRUPTION` — Session transcript corrupted
- `INVALID_SESSION_KEY` — Invalid session key format
- `DISK_CLEANUP_FAILED` — Disk cleanup failed during budget enforcement

## Events

**`session.created`**
  Payload: `session_id`, `session_key`, `agent_id`, `channel`, `created_at`

**`session.updated`**
  Payload: `session_id`, `message_count`, `transcript_bytes`, `updated_at`

**`session.reset`**
  Payload: `session_id`, `reason`, `previous_message_count`

**`session.archived`**
  Payload: `session_id`, `archived_reset_count`

**`session.deleted`**
  Payload: `session_id`, `reclaimed_bytes`, `reason`

**`disk_budget.exceeded`**
  Payload: `total_bytes_used`, `max_bytes`, `sessions_pruned`, `bytes_freed`

## Connects to

- **openclaw-message-routing** *(required)* — Route resolution provides session_key
- **openclaw-gateway-authentication** *(required)* — User auth determines session isolation scope
- **openclaw-llm-provider** *(required)* — Agent writes messages and token counts to session

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

📈 **+1** since baseline (75 → 76)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/openclaw-session-management/) · **Spec source:** [`openclaw-session-management.blueprint.yaml`](./openclaw-session-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
