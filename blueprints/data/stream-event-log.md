<!-- AUTO-GENERATED FROM stream-event-log.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Stream Event Log

> Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

**Category:** Data · **Version:** 1.0.0 · **Tags:** streams · event-log · consumer-groups · message-queue · ack-tracking · ordering

## What this does

Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

Specifies 24 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)*
- **entry_id** *(text, optional)*
- **fields** *(json, optional)*
- **group_name** *(text, optional)*
- **consumer_name** *(text, optional)*
- **pending_entries** *(json, optional)*

## What must be true

- **0:** Stream entry IDs are globally ordered; new IDs always > previous IDs
- **1:** Entry IDs auto-generated based on millisecond timestamp and sequence counter
- **2:** Consumer groups track position with last_id (messages after this are new)
- **3:** Consumer groups maintain Pending Entry List (PEL) of unacknowledged messages
- **4:** Messages in PEL tracked by both group and consumer (dual indexing)
- **5:** Idle messages in PEL can be claimed by other consumers
- **6:** All stream operations are atomic with respect to the stream key
- **7:** Entry deletion leaves tombstone (space not reclaimed)

## Success & failure scenarios

**✅ Success paths**

- **Xadd Entry** — when XADD key [ID|*] field value [field value ...]; * = auto-generate, or explicit milliseconds-sequence, then new entry ID returned to producer.
- **Xadd With Trimming** — when XADD with MAXLEN|MINID flag; MAXLEN (by count) or MINID (by id), then new entry ID; stream trimmed per strategy.
- **Xadd Idempotent** — when XADD with IDMP <producer_id> <idempotent_id>; same producer_id + idempotent_id seen before, then existing entry ID returned (no new entry added).
- **Xread Entries** — when XREAD [COUNT count] STREAMS key id; read entries after this ID, then array of entries [id, [field1, value1, ...]] or nil if empty.
- **Xread Range** — when command in ["XRANGE","XREVRANGE"]; start_id eq; end_id eq, then array of entries in range (XREVRANGE returns reverse order).
- **Xread Blocking** — when XREAD BLOCK timeout_ms ... STREAMS key id; 0 = indefinite block; new_entries_available eq false, then client blocks until new entries or timeout; returns entries or nil.
- **Xlen Count** — when XLEN key, then number of non-deleted entries.
- **Xgroup Create** — when XGROUP CREATE key group id; group start position ($ = stream head, explicit id, 0-0 = from beginning), then OK returned; group created and ready.
- **Xgroup Destroy** — when XGROUP DESTROY key group, then OK returned; group and its PEL deleted.
- **Xgroup Setid** — when XGROUP SETID key group id, then OK returned; future XREADGROUP starts at new position.
- **Xgroup Createconsumer** — when XGROUP CREATECONSUMER key group consumer, then 1 if new consumer created, 0 if already existed.
- **Xgroup Delconsumer** — when XGROUP DELCONSUMER key group consumer, then count of pending entries that were removed.
- **Xreadgroup Entries** — when XREADGROUP GROUP group consumer STREAMS key id; > = new undelivered messages, or explicit id; messages_available eq true, then array of entries with auto-added to consumer's PEL.
- **Xreadgroup Blocking** — when XREADGROUP BLOCK timeout_ms ...; new_messages eq false, then client blocks; returns entries or nil on timeout.
- **Xack Messages** — when XACK key group id [id ...]; messages in group's PEL, then count of acknowledged messages (0 if already acked or not found).
- **Xpending Summary** — when XPENDING key group, then [total_pending, first_pending_id, last_pending_id, [[consumer, count], ...]].
- **Xpending Details** — when XPENDING key group [IDLE min_idle] start end count; optional: only pending >= min_idle_ms, then array of [id, consumer, idle_ms, delivery_count].
- **Xclaim Messages** — when XCLAIM key group new_consumer min_idle_ms id [id ...] [IDLE ms] [RETRYCOUNT count]; message in PEL and idle >= threshold, then array of claimed messages [id, [field1, value1, ...]] or empty if none eligible.
- **Xautoclaim Messages** — when XAUTOCLAIM key group consumer min_idle_ms start_id [COUNT count], then [cursor_id, [[id, [field, value, ...]], ...]].
- **Xdel Entries** — when XDEL key id [id ...]; ids_exist eq, then count of deleted entries (0 if not found).
- **Xtrim Entries** — when XTRIM key [MAXLEN|MINID] [~] threshold [LIMIT count]; MAXLEN = keep N newest, MINID = keep only id >= threshold, then count of trimmed entries.
- **Xinfo Stream** — when XINFO STREAM key, then stream information (length, IDs, entry count, consumer group count, etc.).
- **Xinfo Groups** — when XINFO GROUPS key, then array of group info (name, consumers_count, pending_entries, last_id).
- **Xinfo Consumers** — when XINFO CONSUMERS key group, then array of consumer info (name, pending_count, idle_time).

## Errors it can return

- `WRONGTYPE` — WRONGTYPE Operation against a key holding the wrong kind of value
- `NOGROUP` — NOGROUP No such consumer group
- `NOSCRIPT` — Index out of range

## Connects to

- **pub-sub-messaging** *(optional)* — Both provide message delivery; streams add persistence and groups
- **list-queue-operations** *(optional)* — Streams are persistent event logs; lists are transient queues
- **key-expiration** *(optional)* — Can trim streams by age/count

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/stream-event-log/) · **Spec source:** [`stream-event-log.blueprint.yaml`](./stream-event-log.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
