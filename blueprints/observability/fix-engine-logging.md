<!-- AUTO-GENERATED FROM fix-engine-logging.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Engine Logging

> Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file, and database outputs

**Category:** Observability · **Version:** 1.0.0 · **Tags:** fix-protocol · logging · observability · financial-messaging · audit-trail

## What this does

Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file, and database outputs

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **file_log_path** *(text, optional)*
- **file_log_backup_path** *(text, optional)*
- **screen_log_show_incoming** *(boolean, optional)*
- **screen_log_show_outgoing** *(boolean, optional)*
- **screen_log_show_events** *(boolean, optional)*
- **db_host** *(text, optional)*
- **db_port** *(number, optional)*
- **db_name** *(text, optional)*
- **db_user** *(text, optional)*
- **db_password** *(password, optional)*
- **db_connection_pool** *(boolean, optional)*
- **db_incoming_table** *(text, optional)*
- **db_outgoing_table** *(text, optional)*
- **db_event_table** *(text, optional)*

## What must be true

- **three_log_streams:** Each stream can be independently enabled or disabled via configuration
- **three_log_streams → Incoming:** every FIX message received from the counterparty (raw wire format)
- **three_log_streams → Outgoing:** every FIX message sent to the counterparty (raw wire format)
- **three_log_streams → Event:** session lifecycle events (created, logon, logout, errors, heartbeat actions)
- **thread_safety:** All log writes are protected by a mutex to prevent interleaved output from concurrent sessions, FileLog uses per-instance file handles; ScreenLog uses a global mutex for stdout coherence
- **session_scoped_logging:** A separate log instance is created for each session, named by its SessionID, A global log instance (no SessionID) captures engine-level events not tied to a specific session, Log factories implement create(SessionID) for per-session logs and create() for global logs
- **log_rotation:** backup() is called on session reset, moving current log to the backup path, clear() truncates the current log (called on session reset before replay), File-based log consumers should monitor for file rotation to avoid reading stale data
- **message_format:** Raw FIX messages use SOH (0x01) as field separator; logs replace SOH with "|" for human readability, Each log line includes a UTC timestamp, session ID prefix, and message direction

## Success & failure scenarios

**✅ Success paths**

- **Incoming Message Logged** — when a FIX message is received from the counterparty, then Raw message written to the incoming log stream with UTC timestamp.
- **Outgoing Message Logged** — when a FIX message is sent to the counterparty, then Raw message written to the outgoing log stream with UTC timestamp.
- **Session Event Logged** — when a session lifecycle event occurs (logon, logout, error, heartbeat, etc.), then Event description written to the event log stream with UTC timestamp.

**❌ Failure paths**

- **Log Write Failed** — when log backend encounters an error (disk full, DB connection lost), then Log write silently fails; session continues operating (logging is non-critical path). *(error: `LOG_WRITE_FAILED`)*

## Errors it can return

- `LOG_WRITE_FAILED` — Failed to write to log backend

## Connects to

- **fix-session-management** *(required)* — Session layer calls the log on every sent/received message and state change
- **fix-message-building** *(recommended)* — Log output uses the serialized message strings produced by the message builder

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/observability/fix-engine-logging/) · **Spec source:** [`fix-engine-logging.blueprint.yaml`](./fix-engine-logging.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
