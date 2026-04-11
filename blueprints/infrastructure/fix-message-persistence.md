<!-- AUTO-GENERATED FROM fix-message-persistence.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Message Persistence

> Persists all sent and received FIX messages with sequence numbers for gap-fill recovery on reconnect; supports in-memory, file-based, and database-backed storage backends

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** fix-protocol · message-store · sequence-numbers · recovery · persistence · financial-messaging

## What this does

Persists all sent and received FIX messages with sequence numbers for gap-fill recovery on reconnect; supports in-memory, file-based, and database-backed storage backends

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **session_id** *(text, required)*
- **msg_seq_num** *(number, required)*
- **message_body** *(text, required)*
- **next_sender_seq_num** *(number, required)*
- **next_target_seq_num** *(number, required)*
- **creation_time** *(datetime, required)*
- **file_store_path** *(text, optional)*
- **db_host** *(text, optional)*
- **db_port** *(number, optional)*
- **db_name** *(text, optional)*
- **db_user** *(text, optional)*
- **db_password** *(password, optional)*
- **db_connection_pool** *(boolean, optional)*

## What must be true

- **message_ordering:** Messages are stored and retrieved by sequence number, Retrieval supports range queries (from_seq to to_seq) to fulfill ResendRequest, Gaps in sequence numbers are expected (PossGapFill messages are stored as placeholders)
- **sequence_integrity:** Sender and target sequence numbers are atomically incremented after each message is accepted, Sequence numbers must survive process restart; file and database stores persist them immediately, Reset (sequence numbers → 1) is triggered by explicit reset() call or ResetSeqNumFlag in Logon
- **session_recovery:** On session startup, the store is loaded and sequence numbers are restored from persistence, If the remote counterparty expects a lower sequence number, a ResendRequest is issued, If the remote expects a higher sequence number, a SequenceReset-GapFill is sent
- **backend_selection → MemoryStoreFactory:** appropriate only for unit tests; data is lost on process exit
- **backend_selection → FileStoreFactory:** stores one binary file per session; suitable for single-process deployments
- **backend_selection → MySQLStoreFactory / PostgreSQLStoreFactory:** stores in a relational database; suitable for clustered deployments
- **backend_selection → NullStoreFactory:** discards all messages; for scenarios where recovery is not needed (no-resend mode)
- **file_store_naming:** Files are named using the session ID so multiple sessions can share a directory, On reset(), both files are truncated and sequence numbers revert to 1
- **file_store_naming → File store creates two files per session:** .body (messages) and .seqnums (sequence numbers)

## Success & failure scenarios

**✅ Success paths**

- **Message Persisted** — when a FIX message is about to be transmitted, then Message stored durably before transmission; can be retrieved for resend.
- **Resend Range Retrieved** — when ResendRequest received for sequence number range [begin, end], then Messages in range returned to session for retransmission; gaps filled with SequenceReset-GapFill.
- **Store Reset** — when reset() called (logout, ResetSeqNumFlag=Y, or operator action), then All stored messages cleared and sequence numbers reset to 1.

**❌ Failure paths**

- **Storage Write Failed** — when session layer attempts to persist a message; store write operation fails (disk full, DB connection lost, etc.), then IOException raised; session is disconnected to preserve sequence integrity. *(error: `STORE_WRITE_FAILED`)*
- **Sequence Restore Failed** — when session is starting up and loading persisted state; stored sequence number files are missing or corrupt, then Store falls back to sequence 1 and resets; risk of sequence mismatch with counterparty. *(error: `SEQUENCE_RESTORE_FAILED`)*

## Errors it can return

- `STORE_WRITE_FAILED` — Failed to persist message to store
- `SEQUENCE_RESTORE_FAILED` — Failed to restore sequence numbers from store
- `STORE_READ_FAILED` — Failed to retrieve messages from store

## Connects to

- **fix-session-management** *(required)* — Session layer calls the store on every sent/received message to maintain sequence integrity
- **fix-message-building** *(required)* — Raw FIX message strings from the message builder are the unit of persistence
- **database-persistence** *(optional)* — Database-backed store variants reuse the same database connection and schema patterns

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/fix-message-persistence/) · **Spec source:** [`fix-message-persistence.blueprint.yaml`](./fix-message-persistence.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
