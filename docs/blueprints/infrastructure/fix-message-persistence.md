---
title: "Fix Message Persistence Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Persists all sent and received FIX messages with sequence numbers for gap-fill recovery on reconnect; supports in-memory, file-based, and database-backed storag"
---

# Fix Message Persistence Blueprint

> Persists all sent and received FIX messages with sequence numbers for gap-fill recovery on reconnect; supports in-memory, file-based, and database-backed storage backends

| | |
|---|---|
| **Feature** | `fix-message-persistence` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, message-store, sequence-numbers, recovery, persistence, financial-messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/infrastructure/fix-message-persistence.blueprint.yaml) |
| **JSON API** | [fix-message-persistence.json]({{ site.baseurl }}/api/blueprints/infrastructure/fix-message-persistence.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `session_layer` | FIX Session Layer | system | Reads and writes messages and sequence numbers during session lifecycle |
| `file_store` | File Store | system | Persists messages and sequence numbers to local files on disk |
| `database_store` | Database Store | system | Persists messages and sequence numbers to a relational database (MySQL, PostgreSQL, ODBC) |
| `memory_store` | Memory Store | system | In-memory store for testing only; all data lost on process exit |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `session_id` | text | Yes |  |  |
| `msg_seq_num` | number | Yes |  |  |
| `message_body` | text | Yes |  |  |
| `next_sender_seq_num` | number | Yes |  |  |
| `next_target_seq_num` | number | Yes |  |  |
| `creation_time` | datetime | Yes |  |  |
| `file_store_path` | text | No |  |  |
| `db_host` | text | No |  |  |
| `db_port` | number | No |  |  |
| `db_name` | text | No |  |  |
| `db_user` | text | No |  |  |
| `db_password` | password | No |  |  |
| `db_connection_pool` | boolean | No |  |  |

## Rules

- **message_ordering:** Messages are stored and retrieved by sequence number, Retrieval supports range queries (from_seq to to_seq) to fulfill ResendRequest, Gaps in sequence numbers are expected (PossGapFill messages are stored as placeholders)
- **sequence_integrity:** Sender and target sequence numbers are atomically incremented after each message is accepted, Sequence numbers must survive process restart; file and database stores persist them immediately, Reset (sequence numbers → 1) is triggered by explicit reset() call or ResetSeqNumFlag in Logon
- **session_recovery:** On session startup, the store is loaded and sequence numbers are restored from persistence, If the remote counterparty expects a lower sequence number, a ResendRequest is issued, If the remote expects a higher sequence number, a SequenceReset-GapFill is sent
- **backend_selection:** {"MemoryStoreFactory":"appropriate only for unit tests; data is lost on process exit"}, {"FileStoreFactory":"stores one binary file per session; suitable for single-process deployments"}, {"MySQLStoreFactory / PostgreSQLStoreFactory":"stores in a relational database; suitable for clustered deployments"}, {"NullStoreFactory":"discards all messages; for scenarios where recovery is not needed (no-resend mode)"}
- **file_store_naming:** {"File store creates two files per session":".body (messages) and .seqnums (sequence numbers)"}, Files are named using the session ID so multiple sessions can share a directory, On reset(), both files are truncated and sequence numbers revert to 1

## Outcomes

### Storage_write_failed (Priority: 1) — Error: `STORE_WRITE_FAILED`

**Given:**
- session layer attempts to persist a message
- store write operation fails (disk full, DB connection lost, etc.)

**Then:**
- **emit_event** event: `fix.store.error`

**Result:** IOException raised; session is disconnected to preserve sequence integrity

### Sequence_restore_failed (Priority: 2) — Error: `SEQUENCE_RESTORE_FAILED`

**Given:**
- session is starting up and loading persisted state
- stored sequence number files are missing or corrupt

**Then:**
- **emit_event** event: `fix.store.error`

**Result:** Store falls back to sequence 1 and resets; risk of sequence mismatch with counterparty

### Message_persisted (Priority: 9)

**Given:**
- a FIX message is about to be transmitted

**Then:**
- **set_field** target: `next_sender_seq_num` value: `next_sender_seq_num + 1`
- **emit_event** event: `fix.store.message_persisted`

**Result:** Message stored durably before transmission; can be retrieved for resend

### Resend_range_retrieved (Priority: 10)

**Given:**
- ResendRequest received for sequence number range [begin, end]

**Then:**
- **emit_event** event: `fix.store.resend_range_retrieved`

**Result:** Messages in range returned to session for retransmission; gaps filled with SequenceReset-GapFill

### Store_reset (Priority: 11)

**Given:**
- reset() called (logout, ResetSeqNumFlag=Y, or operator action)

**Then:**
- **set_field** target: `next_sender_seq_num` value: `1`
- **set_field** target: `next_target_seq_num` value: `1`
- **set_field** target: `creation_time` value: `current_utc_time`
- **emit_event** event: `fix.store.reset`

**Result:** All stored messages cleared and sequence numbers reset to 1

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STORE_WRITE_FAILED` | 500 | Failed to persist message to store | No |
| `SEQUENCE_RESTORE_FAILED` | 500 | Failed to restore sequence numbers from store | No |
| `STORE_READ_FAILED` | 500 | Failed to retrieve messages from store | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.store.message_persisted` | A message was successfully persisted to the store | `session_id`, `msg_seq_num` |
| `fix.store.resend_range_retrieved` | A range of messages was retrieved from the store for resend | `session_id`, `begin_seq_no`, `end_seq_no`, `message_count` |
| `fix.store.reset` | Store was reset; sequence numbers set to 1 and messages cleared | `session_id`, `reset_time` |
| `fix.store.error` | A store operation failed | `session_id`, `operation`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-session-management | required | Session layer calls the store on every sent/received message to maintain sequence integrity |
| fix-message-building | required | Raw FIX message strings from the message builder are the unit of persistence |
| database-persistence | optional | Database-backed store variants reuse the same database connection and schema patterns |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: FIX 4.0–5.0 SP2 / FIXT 1.1
store_backends:
  - MemoryStore: in-memory (testing only)
  - FileStore: flat files (single-process production)
  - MySQLStore: MySQL/MariaDB relational database
  - PostgreSQLStore: PostgreSQL relational database
  - OdbcStore: ODBC-compatible databases
  - NullStore: no persistence (when recovery is not required)
db_schema_tables:
  - messages: stores raw message bodies indexed by session_id + msg_seq_num
  - sessions: stores next_sender_seq_num, next_target_seq_num, creation_time per
      session_id
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Message Persistence Blueprint",
  "description": "Persists all sent and received FIX messages with sequence numbers for gap-fill recovery on reconnect; supports in-memory, file-based, and database-backed storag",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, message-store, sequence-numbers, recovery, persistence, financial-messaging"
}
</script>
