---
title: "List Queue Operations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists. 7 fields. 23 out"
---

# List Queue Operations Blueprint

> Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

| | |
|---|---|
| **Feature** | `list-queue-operations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | lists, queues, stacks, blocking-operations, ordered-collections |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/list-queue-operations.blueprint.yaml) |
| **JSON API** | [list-queue-operations.json]({{ site.baseurl }}/api/blueprints/data/list-queue-operations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Application requesting list operations |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `key` | text | Yes | Key |  |
| `elements` | json | No | Elements |  |
| `length` | number | No | Length |  |
| `head_index` | number | No | Head Index |  |
| `tail_index` | number | No | Tail Index |  |
| `is_blocking` | boolean | No | Is Blocking |  |
| `block_timeout_ms` | number | No | Block Timeout Ms |  |

## States

**State field:** `presence`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `absent` | Yes |  |
| `present` |  |  |
| `empty` |  | Yes |

## Rules

- **general:** List can be accessed from both ends (head and tail) in O(1) time, Indices support negative values (-1 = last element, -2 = second-to-last, etc.), LTRIM removes elements from both ends simultaneously; intermediate indices unclamped, Blocking operations (BLPOP, BRPOP, etc.) suspend client until data available or timeout, When list becomes empty after pop/trim, key is automatically deleted, LMOVE and BLMOVE atomically pop from source and push to destination, Range indices clamped to valid bounds; out-of-range ranges return empty results, All operations are atomic with respect to individual keys

## Outcomes

### Push_to_head (Priority: 10)

**Given:**
- LPUSH command issued
- elements: one or more values to push

**Then:**
- **set_field** target: `elements` — add to head in order provided
- **emit_event** event: `list.lpush`

**Result:** list created if absent; elements added; client receives new length

### Push_to_tail (Priority: 11)

**Given:**
- RPUSH command issued
- elements: one or more values to push

**Then:**
- **set_field** target: `elements` — add to tail in order provided
- **emit_event** event: `list.rpush`

**Result:** list created if absent; elements added; client receives new length

### Push_conditional (Priority: 12)

**Given:**
- `command` (input) in `LPUSHX,RPUSHX`

**Then:**
- **set_field** target: `elements` when: `list_length > 0`
- **emit_event** event: `list.push_conditional`

**Result:** elements added if list present; returns 0 if key absent

### Pop_from_head (Priority: 20)

**Given:**
- LPOP command issued
- `count` (input) gt `0`

**Then:**
- **set_field** target: `elements` — remove from head
- **emit_event** event: `list.lpop`

**Result:** client receives single element or array of count elements (or nil if empty)

### Pop_from_tail (Priority: 21)

**Given:**
- RPOP command issued
- `count` (input) gt `0`

**Then:**
- **set_field** target: `elements` — remove from tail
- **emit_event** event: `list.rpop`

**Result:** client receives single element or array of count elements (or nil if empty)

### Pop_empty_list (Priority: 22)

**Given:**
- `list_length` (db) eq `0`

**Then:**
- **emit_event** event: `list.pop_empty`

**Result:** client receives nil

### Blocking_pop (Priority: 23)

**Given:**
- `command` (input) in `BLPOP,BRPOP,BLMOVE,BLMPOP`
- `timeout_ms` (input) gte `0`
- `list_has_data` (db) eq `false`

**Then:**
- **transition_state** field: `blocking_state` to: `suspended` — client put in queue
- **emit_event** event: `list.blocking_wait`

**Result:** client blocks until data available or timeout; receives elements or nil

### Blocking_pop_timeout (Priority: 24)

**Given:**
- `timeout_elapsed` (system) eq `true`
- `no_data_arrived` (system) eq `true`

**Then:**
- **transition_state** field: `blocking_state` to: `released`
- **emit_event** event: `list.blocking_timeout`

**Result:** client unblocked; receives nil

### Get_range (Priority: 30)

**Given:**
- LRANGE key start stop
- start: zero-based index (negative counts from tail)
- stop: inclusive end index

**Then:**
- **emit_event** event: `list.range_read`

**Result:** array of elements from start to stop inclusive (clamped to bounds); empty array if out-of-range

### Get_index (Priority: 31)

**Given:**
- LINDEX key index
- index: zero-based position (negative counts from tail)

**Then:**
- **emit_event** event: `list.index_read`

**Result:** element at index (or nil if out-of-range)

### Get_length (Priority: 32)

**Given:**
- LLEN key

**Then:**
- **emit_event** event: `list.len`

**Result:** number of elements (0 if key absent)

### Set_index (Priority: 40)

**Given:**
- LSET key index element
- index: must be within [0, length-1] or [-length, -1]

**Then:**
- **set_field** target: `elements` — replace at index
- **emit_event** event: `list.set`

**Result:** element replaced; client receives OK

### Set_out_of_range (Priority: 41) — Error: `OUT_OF_RANGE`

**Given:**
- `index` (input) not_in `[valid_indices]`

**Result:** error returned; list unchanged

### Insert_element (Priority: 42)

**Given:**
- LINSERT key BEFORE|AFTER pivot element
- pivot: element to find (first occurrence used)
- `pivot_found` (db) eq `true`

**Then:**
- **set_field** target: `elements` — insert before or after first matching pivot
- **emit_event** event: `list.insert`

**Result:** element inserted; client receives new length

### Insert_pivot_not_found (Priority: 43)

**Given:**
- `pivot_found` (db) eq `false`

**Then:**
- **emit_event** event: `list.insert_failed`

**Result:** list unchanged; client receives -1

### Trim_range (Priority: 44)

**Given:**
- LTRIM key start stop
- start: first index to keep
- stop: last index to keep (inclusive)

**Then:**
- **set_field** target: `elements` — remove elements outside [start, stop]
- **emit_event** event: `list.trimmed`

**Result:** list trimmed; client receives OK; key deleted if empty

### Remove_elements (Priority: 45)

**Given:**
- LREM key count element
- count: positive=remove from head, negative=from tail, 0=all occurrences

**Then:**
- **set_field** target: `elements` — remove matching elements per count direction
- **emit_event** event: `list.removed`

**Result:** matching elements removed; client receives count removed

### Find_position (Priority: 46)

**Given:**
- LPOS key element [RANK rank] [COUNT count] [MAXLEN len]

**Then:**
- **emit_event** event: `list.pos_search`

**Result:** single position or array of positions (or nil if not found)

### Move_between_lists (Priority: 50)

**Given:**
- LMOVE source destination LEFT|RIGHT LEFT|RIGHT
- `source_has_data` (db) eq `true`

**Then:**
- **set_field** target: `source.elements` — pop from source
- **set_field** target: `destination.elements` — push to destination
- **emit_event** event: `list.moved`

**Result:** element moved atomically; client receives moved element

### Move_empty_source (Priority: 51)

**Given:**
- `source_has_data` (db) eq `false`

**Then:**
- **emit_event** event: `list.move_failed`

**Result:** lists unchanged; client receives nil

### Blocking_move (Priority: 52)

**Given:**
- `command` (input) eq `BLMOVE`
- `source_empty` (db) eq `true`
- `timeout_ms` (input) gte `0`

**Then:**
- **transition_state** field: `blocking_state` to: `suspended`
- **emit_event** event: `list.blocking_move`

**Result:** client blocks until source has data or timeout; then moves and returns element

### Mpop_from_multiple_keys (Priority: 60)

**Given:**
- LMPOP numkeys key [key ...] LEFT|RIGHT [COUNT count]
- first_non_empty: first key in list with available data

**Then:**
- **set_field** target: `first_non_empty.elements` — pop count elements from this list
- **emit_event** event: `list.mpop`

**Result:** nested array [key, [elements...]] or nil if all empty

### Blocking_mpop (Priority: 61)

**Given:**
- `command` (input) eq `BLMPOP`
- `any_nonempty` (db) eq `false`

**Then:**
- **transition_state** field: `blocking_state` to: `suspended`
- **emit_event** event: `list.blocking_mpop`

**Result:** client blocks until any key has data or timeout; then pops and returns [key, elements]

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OUT_OF_RANGE` | 400 | Index is out of range | No |
| `WRONG_TYPE` | 400 | Operation against a key holding the wrong kind of value | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `list.lpush` |  |  |
| `list.rpush` |  |  |
| `list.push_conditional` |  |  |
| `list.lpop` |  |  |
| `list.rpop` |  |  |
| `list.pop_empty` |  |  |
| `list.blocking_wait` |  |  |
| `list.blocking_timeout` |  |  |
| `list.range_read` |  |  |
| `list.index_read` |  |  |
| `list.len` |  |  |
| `list.set` |  |  |
| `list.insert` |  |  |
| `list.trimmed` |  |  |
| `list.removed` |  |  |
| `list.pos_search` |  |  |
| `list.moved` |  |  |
| `list.blocking_move` |  |  |
| `list.mpop` |  |  |
| `list.blocking_mpop` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| string-key-value | optional | Elements are strings or numeric values |
| multi-exec-transactions | optional | Often used within transactions |

## AGI Readiness

### Goals

#### Reliable List Queue Operations

Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| push_to_head | `autonomous` | - | - |
| push_to_tail | `autonomous` | - | - |
| push_conditional | `autonomous` | - | - |
| pop_from_head | `autonomous` | - | - |
| pop_from_tail | `autonomous` | - | - |
| pop_empty_list | `autonomous` | - | - |
| blocking_pop | `human_required` | - | - |
| blocking_pop_timeout | `human_required` | - | - |
| get_range | `autonomous` | - | - |
| get_index | `autonomous` | - | - |
| get_length | `autonomous` | - | - |
| set_index | `autonomous` | - | - |
| set_out_of_range | `autonomous` | - | - |
| insert_element | `autonomous` | - | - |
| insert_pivot_not_found | `autonomous` | - | - |
| trim_range | `autonomous` | - | - |
| remove_elements | `human_required` | - | - |
| find_position | `autonomous` | - | - |
| move_between_lists | `autonomous` | - | - |
| move_empty_source | `autonomous` | - | - |
| blocking_move | `human_required` | - | - |
| mpop_from_multiple_keys | `autonomous` | - | - |
| blocking_mpop | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/redis/redis
  project: Redis
  tech_stack: C
  files_traced: 2
  entry_points:
    - src/t_list.c
    - src/quicklist.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "List Queue Operations Blueprint",
  "description": "Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists. 7 fields. 23 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "lists, queues, stacks, blocking-operations, ordered-collections"
}
</script>
