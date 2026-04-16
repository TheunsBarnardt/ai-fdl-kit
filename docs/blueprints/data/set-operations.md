---
title: "Set Operations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting. 4 fields. 17 outcomes. 1 error c"
---

# Set Operations Blueprint

> Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting

| | |
|---|---|
| **Feature** | `set-operations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | sets, unordered-collections, set-algebra, cardinality |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/set-operations.blueprint.yaml) |
| **JSON API** | [set-operations.json]({{ site.baseurl }}/api/blueprints/data/set-operations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Application requesting set operations |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `key` | text | Yes | Key |  |
| `members` | json | No | Members |  |
| `cardinality` | number | No | Cardinality |  |
| `destination_key` | text | No | Destination Key |  |

## States

**State field:** `presence`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `absent` | Yes |  |
| `present` |  |  |
| `empty` |  | Yes |

## Rules

- **general:** Set elements are unique; adding duplicate element replaces (no effect on cardinality), Set membership is unordered (no indices or ranges), Set algebra operations (intersection, union, difference) can accept multiple source sets, Intersection of multiple sets returns elements present in ALL sets, Union of multiple sets returns elements present in ANY set, Difference of first set minus others returns elements in first but not in any other, Store variants (*STORE) create destination set atomically; overwrite if exists, All operations are atomic with respect to individual keys

## Outcomes

### Add_members (Priority: 10)

_Add one or more elements to set_

**Given:**
- SADD key member [member ...]
- `members_to_add` (input) exists

**Then:**
- **set_field** target: `members` — add new members (duplicates ignored)
- **set_field** target: `cardinality` — increment by count of new members
- **emit_event** event: `set.added`

**Result:** set created if absent; members added; client receives count of newly added members

### Remove_members (Priority: 11)

_Remove elements from set_

**Given:**
- SREM key member [member ...]
- `members_to_remove` (input) exists

**Then:**
- **set_field** target: `members` — remove specified members
- **set_field** target: `cardinality` — decrement by count of removed members
- **emit_event** event: `set.removed`

**Result:** members removed; client receives count of removed members; set deleted if empty

### Get_all_members (Priority: 20)

_Retrieve all set members_

**Given:**
- SMEMBERS key

**Then:**
- **emit_event** event: `set.members_read`

**Result:** unordered array of all members (empty if set absent)

### Check_membership (Priority: 21)

_Check if element is member_

**Given:**
- SISMEMBER key member
- `member` (input) exists

**Then:**
- **emit_event** event: `set.ismember_check`

**Result:** 1 if member present, 0 if not

### Check_multiple_membership (Priority: 22)

_Check multiple elements at once_

**Given:**
- SMISMEMBER key member [member ...]
- `members_to_check` (input) exists

**Then:**
- **emit_event** event: `set.mismember_check`

**Result:** array of 0/1 for each member (1=member present, 0=absent)

### Get_cardinality (Priority: 23)

_Get set size_

**Given:**
- SCARD key

**Then:**
- **emit_event** event: `set.cardinality`

**Result:** number of members (0 if key absent)

### Random_members (Priority: 24)

_Return random element(s) from set_

**Given:**
- SRANDMEMBER key [count]
- `count` (input) exists

**Then:**
- **emit_event** event: `set.random_draw`

**Result:** single member or array of members (may have duplicates if count > cardinality)

### Pop_random (Priority: 25)

_Remove and return random element(s)_

**Given:**
- SPOP key [count]
- `count` (input) exists

**Then:**
- **set_field** target: `members` — remove random members
- **set_field** target: `cardinality` — decrement by count removed
- **emit_event** event: `set.popped`

**Result:** single member or array of members removed (no duplicates); nil if empty

### Move_between_sets (Priority: 26)

_Move element from source to destination set_

**Given:**
- SMOVE source destination member
- `member_in_source` (db) eq `true`

**Then:**
- **set_field** target: `source.members` — remove from source
- **set_field** target: `destination.members` — add to destination
- **emit_event** event: `set.moved`

**Result:** member moved; client receives 1 (or 0 if already in destination)

### Intersection (Priority: 30)

_Get elements common to all input sets_

**Given:**
- SINTER key [key ...]
- `input_sets` (input) exists

**Then:**
- **emit_event** event: `set.intersection`

**Result:** array of elements in ALL sets (empty if no common elements)

### Intersection_store (Priority: 31)

_Store intersection result_

**Given:**
- SINTERSTORE destination key [key ...]
- `destination` (input) exists

**Then:**
- **set_field** target: `destination.members` — set to intersection result
- **emit_event** event: `set.intersection_stored`

**Result:** destination set created/overwritten; client receives cardinality of result

### Intersection_cardinality (Priority: 32)

_Get count of common elements without returning them_

**Given:**
- SINTERCARD numkeys key [key ...] [LIMIT limit]
- `limit` (input) exists

**Then:**
- **emit_event** event: `set.intercard`

**Result:** cardinality of intersection (limited by LIMIT if provided)

### Union (Priority: 33)

_Get all elements from any input set_

**Given:**
- SUNION key [key ...]

**Then:**
- **emit_event** event: `set.union`

**Result:** array of unique elements across all sets

### Union_store (Priority: 34)

_Store union result_

**Given:**
- SUNIONSTORE destination key [key ...]

**Then:**
- **set_field** target: `destination.members` — set to union result
- **emit_event** event: `set.union_stored`

**Result:** destination set created/overwritten; client receives cardinality

### Difference (Priority: 35)

_Get elements in first set but not in others_

**Given:**
- SDIFF key [key ...]
- first_key: set to subtract from
- other_keys: sets to subtract

**Then:**
- **emit_event** event: `set.difference`

**Result:** array of elements in first set minus all others

### Difference_store (Priority: 36)

_Store difference result_

**Given:**
- SDIFFSTORE destination key [key ...]

**Then:**
- **set_field** target: `destination.members` — set to difference result
- **emit_event** event: `set.difference_stored`

**Result:** destination set created/overwritten; client receives cardinality

### Scan_members (Priority: 40)

_Iterate members with cursor (safe for large sets)_

**Given:**
- SSCAN key cursor [MATCH pattern] [COUNT count]
- cursor: starting cursor position (0 to start)

**Then:**
- **emit_event** event: `set.scan`

**Result:** array [new_cursor, [members...]] (cursor=0 when full scan complete)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WRONG_TYPE` | 400 | Operation against a key holding the wrong kind of value | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `set.added` |  |  |
| `set.removed` |  |  |
| `set.members_read` |  |  |
| `set.ismember_check` |  |  |
| `set.mismember_check` |  |  |
| `set.cardinality` |  |  |
| `set.random_draw` |  |  |
| `set.popped` |  |  |
| `set.moved` |  |  |
| `set.intersection` |  |  |
| `set.intersection_stored` |  |  |
| `set.intercard` |  |  |
| `set.union` |  |  |
| `set.union_stored` |  |  |
| `set.difference` |  |  |
| `set.difference_stored` |  |  |
| `set.scan` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| string-key-value | optional | Elements are strings or numeric values |
| sorted-set-operations | optional | Sorted sets extend sets with scoring |

## AGI Readiness

### Goals

#### Reliable Set Operations

Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting

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
| add_members | `autonomous` | - | - |
| remove_members | `human_required` | - | - |
| get_all_members | `autonomous` | - | - |
| check_membership | `autonomous` | - | - |
| check_multiple_membership | `autonomous` | - | - |
| get_cardinality | `autonomous` | - | - |
| random_members | `autonomous` | - | - |
| pop_random | `autonomous` | - | - |
| move_between_sets | `autonomous` | - | - |
| intersection | `autonomous` | - | - |
| intersection_store | `autonomous` | - | - |
| intersection_cardinality | `autonomous` | - | - |
| union | `autonomous` | - | - |
| union_store | `autonomous` | - | - |
| difference | `autonomous` | - | - |
| difference_store | `autonomous` | - | - |
| scan_members | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/redis/redis
  project: Redis
  tech_stack: C
  files_traced: 1
  entry_points:
    - src/t_set.c
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Set Operations Blueprint",
  "description": "Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting. 4 fields. 17 outcomes. 1 error c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sets, unordered-collections, set-algebra, cardinality"
}
</script>
