<!-- AUTO-GENERATED FROM set-operations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Set Operations

> Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting

**Category:** Data · **Version:** 1.0.0 · **Tags:** sets · unordered-collections · set-algebra · cardinality

## What this does

Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)* — Key
- **members** *(json, optional)* — Members
- **cardinality** *(number, optional)* — Cardinality
- **destination_key** *(text, optional)* — Destination Key

## What must be true

- **general:** Set elements are unique; adding duplicate element replaces (no effect on cardinality), Set membership is unordered (no indices or ranges), Set algebra operations (intersection, union, difference) can accept multiple source sets, Intersection of multiple sets returns elements present in ALL sets, Union of multiple sets returns elements present in ANY set, Difference of first set minus others returns elements in first but not in any other, Store variants (*STORE) create destination set atomically; overwrite if exists, All operations are atomic with respect to individual keys

## Success & failure scenarios

**✅ Success paths**

- **Add Members** — when SADD key member [member ...]; members_to_add exists, then set created if absent; members added; client receives count of newly added members. _Why: Add one or more elements to set._
- **Remove Members** — when SREM key member [member ...]; members_to_remove exists, then members removed; client receives count of removed members; set deleted if empty. _Why: Remove elements from set._
- **Get All Members** — when SMEMBERS key, then unordered array of all members (empty if set absent). _Why: Retrieve all set members._
- **Check Membership** — when SISMEMBER key member; member exists, then 1 if member present, 0 if not. _Why: Check if element is member._
- **Check Multiple Membership** — when SMISMEMBER key member [member ...]; members_to_check exists, then array of 0/1 for each member (1=member present, 0=absent). _Why: Check multiple elements at once._
- **Get Cardinality** — when SCARD key, then number of members (0 if key absent). _Why: Get set size._
- **Random Members** — when SRANDMEMBER key [count]; count exists, then single member or array of members (may have duplicates if count > cardinality). _Why: Return random element(s) from set._
- **Pop Random** — when SPOP key [count]; count exists, then single member or array of members removed (no duplicates); nil if empty. _Why: Remove and return random element(s)._
- **Move Between Sets** — when SMOVE source destination member; member_in_source eq true, then member moved; client receives 1 (or 0 if already in destination). _Why: Move element from source to destination set._
- **Intersection** — when SINTER key [key ...]; input_sets exists, then array of elements in ALL sets (empty if no common elements). _Why: Get elements common to all input sets._
- **Intersection Store** — when SINTERSTORE destination key [key ...]; destination exists, then destination set created/overwritten; client receives cardinality of result. _Why: Store intersection result._
- **Intersection Cardinality** — when SINTERCARD numkeys key [key ...] [LIMIT limit]; limit exists, then cardinality of intersection (limited by LIMIT if provided). _Why: Get count of common elements without returning them._
- **Union** — when SUNION key [key ...], then array of unique elements across all sets. _Why: Get all elements from any input set._
- **Union Store** — when SUNIONSTORE destination key [key ...], then destination set created/overwritten; client receives cardinality. _Why: Store union result._
- **Difference** — when SDIFF key [key ...]; first_key: set to subtract from; other_keys: sets to subtract, then array of elements in first set minus all others. _Why: Get elements in first set but not in others._
- **Difference Store** — when SDIFFSTORE destination key [key ...], then destination set created/overwritten; client receives cardinality. _Why: Store difference result._
- **Scan Members** — when SSCAN key cursor [MATCH pattern] [COUNT count]; cursor: starting cursor position (0 to start), then array [new_cursor, [members...]] (cursor=0 when full scan complete). _Why: Iterate members with cursor (safe for large sets)._

## Errors it can return

- `WRONG_TYPE` — Operation against a key holding the wrong kind of value

## Events

**`set.added`**

**`set.removed`**

**`set.members_read`**

**`set.ismember_check`**

**`set.mismember_check`**

**`set.cardinality`**

**`set.random_draw`**

**`set.popped`**

**`set.moved`**

**`set.intersection`**

**`set.intersection_stored`**

**`set.intercard`**

**`set.union`**

**`set.union_stored`**

**`set.difference`**

**`set.difference_stored`**

**`set.scan`**

## Connects to

- **string-key-value** *(optional)* — Elements are strings or numeric values
- **sorted-set-operations** *(optional)* — Sorted sets extend sets with scoring

## Quality fitness 🟡 69/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (8) → rules.general
- `T3` **auto-field-labels** — added labels to 4 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/set-operations/) · **Spec source:** [`set-operations.blueprint.yaml`](./set-operations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
