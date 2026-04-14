<!-- AUTO-GENERATED FROM stream-event-log.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Stream Event Log

> Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

**Category:** Data · **Version:** 1.0.0 · **Tags:** streams · event-log · consumer-groups · message-queue · ack-tracking · ordering

## What this does

Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

Specifies 24 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)* — Key
- **entry_id** *(text, optional)* — Entry Id
- **fields** *(json, optional)* — Fields
- **group_name** *(text, optional)* — Group Name
- **consumer_name** *(text, optional)* — Consumer Name
- **pending_entries** *(json, optional)* — Pending Entries

## What must be true

- **general:** Stream entry IDs are globally ordered; new IDs always > previous IDs, Entry IDs auto-generated based on millisecond timestamp and sequence counter, Consumer groups track position with last_id (messages after this are new), Consumer groups maintain Pending Entry List (PEL) of unacknowledged messages, Messages in PEL tracked by both group and consumer (dual indexing), Idle messages in PEL can be claimed by other consumers, All stream operations are atomic with respect to the stream key, Entry deletion leaves tombstone (space not reclaimed)

## Success & failure scenarios

**✅ Success paths**

- **Xadd Entry** — when XADD key [ID|*] field value [field value ...]; id_generation exists, then new entry ID returned to producer.
- **Xadd With Trimming** — when XADD with MAXLEN|MINID flag; trim_strategy exists, then new entry ID; stream trimmed per strategy.
- **Xadd Idempotent** — when XADD with IDMP <producer_id> <idempotent_id>; same producer_id + idempotent_id seen before, then existing entry ID returned (no new entry added).
- **Xread Entries** — when XREAD [COUNT count] STREAMS key id; start_id exists, then array of entries [id, [field1, value1, ...]] or nil if empty.
- **Xread Range** — when command in ["XRANGE","XREVRANGE"]; start_id exists; end_id exists, then array of entries in range (XREVRANGE returns reverse order).
- **Xread Blocking** — when XREAD BLOCK timeout_ms ... STREAMS key id; timeout_ms exists; new_entries_available eq false, then client blocks until new entries or timeout; returns entries or nil.
- **Xlen Count** — when XLEN key, then number of non-deleted entries.
- **Xgroup Create** — when XGROUP CREATE key group id; id exists, then OK returned; group created and ready.
- **Xgroup Destroy** — when XGROUP DESTROY key group, then OK returned; group and its PEL deleted.
- **Xgroup Setid** — when XGROUP SETID key group id, then OK returned; future XREADGROUP starts at new position.
- **Xgroup Createconsumer** — when XGROUP CREATECONSUMER key group consumer, then 1 if new consumer created, 0 if already existed.
- **Xgroup Delconsumer** — when XGROUP DELCONSUMER key group consumer, then count of pending entries that were removed.
- **Xreadgroup Entries** — when XREADGROUP GROUP group consumer STREAMS key id; id exists; messages_available eq true, then array of entries with auto-added to consumer's PEL.
- **Xreadgroup Blocking** — when XREADGROUP BLOCK timeout_ms ...; new_messages eq false, then client blocks; returns entries or nil on timeout.
- **Xack Messages** — when XACK key group id [id ...]; ids_in_pel exists, then count of acknowledged messages (0 if already acked or not found).
- **Xpending Summary** — when XPENDING key group, then [total_pending, first_pending_id, last_pending_id, [[consumer, count], ...]].
- **Xpending Details** — when XPENDING key group [IDLE min_idle] start end count; idle_filter exists, then array of [id, consumer, idle_ms, delivery_count].
- **Xclaim Messages** — when XCLAIM key group new_consumer min_idle_ms id [id ...] [IDLE ms] [RETRYCOUNT count]; message in PEL and idle >= threshold, then array of claimed messages [id, [field1, value1, ...]] or empty if none eligible.
- **Xautoclaim Messages** — when XAUTOCLAIM key group consumer min_idle_ms start_id [COUNT count], then [cursor_id, [[id, [field, value, ...]], ...]].
- **Xdel Entries** — when XDEL key id [id ...]; ids_exist exists, then count of deleted entries (0 if not found).
- **Xtrim Entries** — when XTRIM key [MAXLEN|MINID] [~] threshold [LIMIT count]; trim_type exists, then count of trimmed entries.
- **Xinfo Stream** — when XINFO STREAM key, then stream information (length, IDs, entry count, consumer group count, etc.).
- **Xinfo Groups** — when XINFO GROUPS key, then array of group info (name, consumers_count, pending_entries, last_id).
- **Xinfo Consumers** — when XINFO CONSUMERS key group, then array of consumer info (name, pending_count, idle_time).

## Errors it can return

- `WRONGTYPE` — Operation against a key holding the wrong kind of value
- `NOGROUP` — No such consumer group
- `NOSCRIPT` — Index out of range

## Events

**`stream.entry_added`**

**`stream.trimmed`**

**`stream.duplicate_detected`**

**`stream.read`**

**`stream.range_read`**

**`stream.blocking_read`**

**`stream.length_read`**

**`stream.group_created`**

**`stream.group_deleted`**

**`stream.group_position_updated`**

**`stream.consumer_created`**

**`stream.consumer_deleted`**

**`stream.group_read`**

**`stream.group_blocking_read`**

**`stream.acked`**

**`stream.pending_summary`**

**`stream.pending_details`**

**`stream.claimed`**

**`stream.autoclaimed`**

**`stream.deleted`**

**`stream.info_read`**

**`stream.groups_listed`**

**`stream.consumers_listed`**

## Connects to

- **pub-sub-messaging** *(optional)* — Both provide message delivery; streams add persistence and groups
- **list-queue-operations** *(optional)* — Streams are persistent event logs; lists are transient queues
- **key-expiration** *(optional)* — Can trim streams by age/count

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (8) → rules.general
- `T3` **auto-field-labels** — added labels to 6 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/stream-event-log/) · **Spec source:** [`stream-event-log.blueprint.yaml`](./stream-event-log.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
