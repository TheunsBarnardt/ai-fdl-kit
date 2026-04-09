---
title: "Fix Engine Logging Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file"
---

# Fix Engine Logging Blueprint

> Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file, and database outputs

| | |
|---|---|
| **Feature** | `fix-engine-logging` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, logging, observability, financial-messaging, audit-trail |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/observability/fix-engine-logging.blueprint.yaml) |
| **JSON API** | [fix-engine-logging.json]({{ site.baseurl }}/api/blueprints/observability/fix-engine-logging.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `session_layer` | FIX Session Layer | system | Emits log events for every received/sent message and session state change |
| `screen_log` | Screen Logger | system | Writes log entries to stdout with UTC timestamps; useful for development and debugging |
| `file_log` | File Logger | system | Writes log entries to per-session files on disk; suitable for production audit trails |
| `database_log` | Database Logger | system | Writes log entries to MySQL, PostgreSQL, or ODBC database tables; enables log querying and analytics |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `file_log_path` | text | No |  |  |
| `file_log_backup_path` | text | No |  |  |
| `screen_log_show_incoming` | boolean | No |  |  |
| `screen_log_show_outgoing` | boolean | No |  |  |
| `screen_log_show_events` | boolean | No |  |  |
| `db_host` | text | No |  |  |
| `db_port` | number | No |  |  |
| `db_name` | text | No |  |  |
| `db_user` | text | No |  |  |
| `db_password` | password | No |  |  |
| `db_connection_pool` | boolean | No |  |  |
| `db_incoming_table` | text | No |  |  |
| `db_outgoing_table` | text | No |  |  |
| `db_event_table` | text | No |  |  |

## Rules

- **three_log_streams:** {"Incoming":"every FIX message received from the counterparty (raw wire format)"}, {"Outgoing":"every FIX message sent to the counterparty (raw wire format)"}, {"Event":"session lifecycle events (created, logon, logout, errors, heartbeat actions)"}, Each stream can be independently enabled or disabled via configuration
- **thread_safety:** All log writes are protected by a mutex to prevent interleaved output from concurrent sessions, FileLog uses per-instance file handles; ScreenLog uses a global mutex for stdout coherence
- **session_scoped_logging:** A separate log instance is created for each session, named by its SessionID, A global log instance (no SessionID) captures engine-level events not tied to a specific session, Log factories implement create(SessionID) for per-session logs and create() for global logs
- **log_rotation:** backup() is called on session reset, moving current log to the backup path, clear() truncates the current log (called on session reset before replay), File-based log consumers should monitor for file rotation to avoid reading stale data
- **message_format:** Raw FIX messages use SOH (0x01) as field separator; logs replace SOH with "|" for human readability, Each log line includes a UTC timestamp, session ID prefix, and message direction

## Outcomes

### Log_write_failed (Priority: 1) — Error: `LOG_WRITE_FAILED`

**Given:**
- log backend encounters an error (disk full, DB connection lost)

**Then:**
- **emit_event** event: `fix.log.error`

**Result:** Log write silently fails; session continues operating (logging is non-critical path)

### Incoming_message_logged (Priority: 9)

**Given:**
- a FIX message is received from the counterparty

**Then:**
- **emit_event** event: `fix.log.incoming`

**Result:** Raw message written to the incoming log stream with UTC timestamp

### Outgoing_message_logged (Priority: 10)

**Given:**
- a FIX message is sent to the counterparty

**Then:**
- **emit_event** event: `fix.log.outgoing`

**Result:** Raw message written to the outgoing log stream with UTC timestamp

### Session_event_logged (Priority: 11)

**Given:**
- a session lifecycle event occurs (logon, logout, error, heartbeat, etc.)

**Then:**
- **emit_event** event: `fix.log.event`

**Result:** Event description written to the event log stream with UTC timestamp

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LOG_WRITE_FAILED` | 500 | Failed to write to log backend | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.log.incoming` | Incoming FIX message logged | `session_id`, `timestamp`, `raw_message` |
| `fix.log.outgoing` | Outgoing FIX message logged | `session_id`, `timestamp`, `raw_message` |
| `fix.log.event` | Session lifecycle event logged | `session_id`, `timestamp`, `event_description` |
| `fix.log.error` | Log backend encountered an error | `session_id`, `log_stream`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-session-management | required | Session layer calls the log on every sent/received message and state change |
| fix-message-building | recommended | Log output uses the serialized message strings produced by the message builder |

## AGI Readiness

### Goals

#### Reliable Fix Engine Logging

Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file, and database outputs

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| completeness | performance | observability gaps hide production issues |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fix_session_management` | fix-session-management | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| log_write_failed | `autonomous` | - | - |
| incoming_message_logged | `autonomous` | - | - |
| outgoing_message_logged | `autonomous` | - | - |
| session_event_logged | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: FIX 4.0–5.0 SP2 / FIXT 1.1
log_backends:
  - ScreenLog: stdout output with timestamps (development/debugging)
  - FileLog: disk file per session (production audit trail)
  - MySQLLog: MySQL database tables for log querying
  - PostgreSQLLog: PostgreSQL database tables
  - OdbcLog: ODBC-compatible databases
  - NullLog: discards all log output (testing)
file_naming:
  - "Incoming:
    {FileLogPath}/{BeginString}-{SenderCompID}-{TargetCompID}.messages.incoming\
    .current"
  - "Outgoing:
    {FileLogPath}/{BeginString}-{SenderCompID}-{TargetCompID}.messages.outgoing\
    .current"
  - "Events:   {FileLogPath}/{BeginString}-{SenderCompID}-{TargetCompID}.event.\
    current"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Engine Logging Blueprint",
  "description": "Provides per-session and global logging of all incoming messages, outgoing messages, and session lifecycle events with pluggable backends including screen, file",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, logging, observability, financial-messaging, audit-trail"
}
</script>
