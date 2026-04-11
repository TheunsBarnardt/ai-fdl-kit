---
title: "Stream Event Log Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking. 6 fields. 24 outcome"
---

# Stream Event Log Blueprint

> Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

| | |
|---|---|
| **Feature** | `stream-event-log` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | streams, event-log, consumer-groups, message-queue, ack-tracking, ordering |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/stream-event-log.blueprint.yaml) |
| **JSON API** | [stream-event-log.json]({{ site.baseurl }}/api/blueprints/data/stream-event-log.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `producer` | Producer | system | Application adding events to stream |
| `consumer` | Consumer | system | Application reading events from stream |
| `consumer_group` | Consumer Group | system | Named group tracking consumer progress and pending messages |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `key` | text | Yes | Key |  |
| `entry_id` | text | No | Entry Id |  |
| `fields` | json | No | Fields |  |
| `group_name` | text | No | Group Name |  |
| `consumer_name` | text | No | Consumer Name |  |
| `pending_entries` | json | No | Pending Entries |  |

## States

**State field:** `undefined`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|

## Rules

- **general:** Stream entry IDs are globally ordered; new IDs always > previous IDs, Entry IDs auto-generated based on millisecond timestamp and sequence counter, Consumer groups track position with last_id (messages after this are new), Consumer groups maintain Pending Entry List (PEL) of unacknowledged messages, Messages in PEL tracked by both group and consumer (dual indexing), Idle messages in PEL can be claimed by other consumers, All stream operations are atomic with respect to the stream key, Entry deletion leaves tombstone (space not reclaimed)

## Outcomes

### Xadd_entry (Priority: 10)

**Given:**
- XADD key [ID|*] field value [field value ...]
- `id_generation` (input) eq

**Then:**
- **set_field** target: `entry_id` — create monotonic ID
- **set_field** target: `fields` — store event data
- **emit_event** event: `stream.entry_added`

**Result:** new entry ID returned to producer

### Xadd_with_trimming (Priority: 11)

**Given:**
- XADD with MAXLEN|MINID flag
- `trim_strategy` (input) eq

**Then:**
- **set_field** target: `entry_id`
- **set_field** target: `fields`
- **emit_event** event: `stream.trimmed`

**Result:** new entry ID; stream trimmed per strategy

### Xadd_idempotent (Priority: 12)

**Given:**
- XADD with IDMP <producer_id> <idempotent_id>
- `duplicate` (db) eq `true`

**Then:**
- **emit_event** event: `stream.duplicate_detected`

**Result:** existing entry ID returned (no new entry added)

### Xread_entries (Priority: 20)

**Given:**
- XREAD [COUNT count] STREAMS key id
- `start_id` (input) eq

**Then:**
- **emit_event** event: `stream.read`

**Result:** array of entries [id, [field1, value1, ...]] or nil if empty

### Xread_range (Priority: 21)

**Given:**
- `command` (input) in `XRANGE,XREVRANGE`
- `start_id` (input) eq
- `end_id` (input) eq

**Then:**
- **emit_event** event: `stream.range_read`

**Result:** array of entries in range (XREVRANGE returns reverse order)

### Xread_blocking (Priority: 22)

**Given:**
- XREAD BLOCK timeout_ms ... STREAMS key id
- `timeout_ms` (input) eq
- `new_entries_available` (system) eq `false`

**Then:**
- **transition_state** field: `message_delivery` to: `suspended`
- **emit_event** event: `stream.blocking_read`

**Result:** client blocks until new entries or timeout; returns entries or nil

### Xlen_count (Priority: 23)

**Given:**
- XLEN key

**Then:**
- **emit_event** event: `stream.length_read`

**Result:** number of non-deleted entries

### Xgroup_create (Priority: 30)

**Given:**
- XGROUP CREATE key group id
- `id` (input) eq

**Then:**
- **set_field** target: `group_name`
- **transition_state** field: `consumer_group_state` to: `new`
- **emit_event** event: `stream.group_created`

**Result:** OK returned; group created and ready

### Xgroup_destroy (Priority: 31)

**Given:**
- XGROUP DESTROY key group

**Then:**
- **emit_event** event: `stream.group_deleted`

**Result:** OK returned; group and its PEL deleted

### Xgroup_setid (Priority: 32)

**Given:**
- XGROUP SETID key group id

**Then:**
- **emit_event** event: `stream.group_position_updated`

**Result:** OK returned; future XREADGROUP starts at new position

### Xgroup_createconsumer (Priority: 33)

**Given:**
- XGROUP CREATECONSUMER key group consumer

**Then:**
- **emit_event** event: `stream.consumer_created`

**Result:** 1 if new consumer created, 0 if already existed

### Xgroup_delconsumer (Priority: 34)

**Given:**
- XGROUP DELCONSUMER key group consumer

**Then:**
- **emit_event** event: `stream.consumer_deleted`

**Result:** count of pending entries that were removed

### Xreadgroup_entries (Priority: 35)

**Given:**
- XREADGROUP GROUP group consumer STREAMS key id
- `id` (input) eq
- `messages_available` (db) eq `true`

**Then:**
- **set_field** target: `pending_entries` — create NACK for each delivered message
- **transition_state** field: `message_delivery` to: `pending`
- **emit_event** event: `stream.group_read`

**Result:** array of entries with auto-added to consumer's PEL

### Xreadgroup_blocking (Priority: 36)

**Given:**
- XREADGROUP BLOCK timeout_ms ...
- `new_messages` (db) eq `false`

**Then:**
- **transition_state** field: `message_delivery` to: `suspended`
- **emit_event** event: `stream.group_blocking_read`

**Result:** client blocks; returns entries or nil on timeout

### Xack_messages (Priority: 40)

**Given:**
- XACK key group id [id ...]
- `ids_in_pel` (db) eq

**Then:**
- **set_field** target: `pending_entries` — remove from group PEL and consumer PEL
- **transition_state** field: `message_delivery` to: `acknowledged`
- **emit_event** event: `stream.acked`

**Result:** count of acknowledged messages (0 if already acked or not found)

### Xpending_summary (Priority: 41)

**Given:**
- XPENDING key group

**Then:**
- **emit_event** event: `stream.pending_summary`

**Result:** [total_pending, first_pending_id, last_pending_id, [[consumer, count], ...]]

### Xpending_details (Priority: 42)

**Given:**
- XPENDING key group [IDLE min_idle] start end count
- `idle_filter` (input) eq

**Then:**
- **emit_event** event: `stream.pending_details`

**Result:** array of [id, consumer, idle_ms, delivery_count]

### Xclaim_messages (Priority: 43)

**Given:**
- XCLAIM key group new_consumer min_idle_ms id [id ...] [IDLE ms] [RETRYCOUNT count]
- `message_idle` (db) gte `min_idle_ms`

**Then:**
- **set_field** target: `pending_entries` — transfer from old consumer to new consumer
- **emit_event** event: `stream.claimed`

**Result:** array of claimed messages [id, [field1, value1, ...]] or empty if none eligible

### Xautoclaim_messages (Priority: 44)

**Given:**
- XAUTOCLAIM key group consumer min_idle_ms start_id [COUNT count]

**Then:**
- **emit_event** event: `stream.autoclaimed`

**Result:** [cursor_id, [[id, [field, value, ...]], ...]]

### Xdel_entries (Priority: 50)

**Given:**
- XDEL key id [id ...]
- `ids_exist` (db) eq

**Then:**
- **emit_event** event: `stream.deleted`

**Result:** count of deleted entries (0 if not found)

### Xtrim_entries (Priority: 51)

**Given:**
- XTRIM key [MAXLEN|MINID] [~] threshold [LIMIT count]
- `trim_type` (input) eq

**Then:**
- **emit_event** event: `stream.trimmed`

**Result:** count of trimmed entries

### Xinfo_stream (Priority: 60)

**Given:**
- XINFO STREAM key

**Then:**
- **emit_event** event: `stream.info_read`

**Result:** stream information (length, IDs, entry count, consumer group count, etc.)

### Xinfo_groups (Priority: 61)

**Given:**
- XINFO GROUPS key

**Then:**
- **emit_event** event: `stream.groups_listed`

**Result:** array of group info (name, consumers_count, pending_entries, last_id)

### Xinfo_consumers (Priority: 62)

**Given:**
- XINFO CONSUMERS key group

**Then:**
- **emit_event** event: `stream.consumers_listed`

**Result:** array of consumer info (name, pending_count, idle_time)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WRONGTYPE` |  | WRONGTYPE Operation against a key holding the wrong kind of value | No |
| `NOGROUP` |  | NOGROUP No such consumer group | No |
| `NOSCRIPT` |  | Index out of range | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |
| `undefined` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pub-sub-messaging | optional | Both provide message delivery; streams add persistence and groups |
| list-queue-operations | optional | Streams are persistent event logs; lists are transient queues |
| key-expiration | optional | Can trim streams by age/count |

## AGI Readiness

### Goals

#### Reliable Stream Event Log

Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| xadd_entry | `autonomous` | - | - |
| xadd_with_trimming | `autonomous` | - | - |
| xadd_idempotent | `autonomous` | - | - |
| xread_entries | `autonomous` | - | - |
| xread_range | `autonomous` | - | - |
| xread_blocking | `human_required` | - | - |
| xlen_count | `autonomous` | - | - |
| xgroup_create | `supervised` | - | - |
| xgroup_destroy | `human_required` | - | - |
| xgroup_setid | `autonomous` | - | - |
| xgroup_createconsumer | `supervised` | - | - |
| xgroup_delconsumer | `autonomous` | - | - |
| xreadgroup_entries | `autonomous` | - | - |
| xreadgroup_blocking | `human_required` | - | - |
| xack_messages | `autonomous` | - | - |
| xpending_summary | `autonomous` | - | - |
| xpending_details | `autonomous` | - | - |
| xclaim_messages | `autonomous` | - | - |
| xautoclaim_messages | `autonomous` | - | - |
| xdel_entries | `autonomous` | - | - |
| xtrim_entries | `autonomous` | - | - |
| xinfo_stream | `autonomous` | - | - |
| xinfo_groups | `autonomous` | - | - |
| xinfo_consumers | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/redis/redis
  project: Redis
  tech_stack: C
  files_traced: 2
  entry_points:
    - src/t_stream.c
    - src/stream.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Stream Event Log Blueprint",
  "description": "Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking. 6 fields. 24 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "streams, event-log, consumer-groups, message-queue, ack-tracking, ordering"
}
</script>
