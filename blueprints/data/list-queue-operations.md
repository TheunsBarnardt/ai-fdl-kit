<!-- AUTO-GENERATED FROM list-queue-operations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# List Queue Operations

> Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

**Category:** Data · **Version:** 1.0.0 · **Tags:** lists · queues · stacks · blocking-operations · ordered-collections

## What this does

Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

Specifies 23 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)* — Key
- **elements** *(json, optional)* — Elements
- **length** *(number, optional)* — Length
- **head_index** *(number, optional)* — Head Index
- **tail_index** *(number, optional)* — Tail Index
- **is_blocking** *(boolean, optional)* — Is Blocking
- **block_timeout_ms** *(number, optional)* — Block Timeout Ms

## What must be true

- **general:** List can be accessed from both ends (head and tail) in O(1) time, Indices support negative values (-1 = last element, -2 = second-to-last, etc.), LTRIM removes elements from both ends simultaneously; intermediate indices unclamped, Blocking operations (BLPOP, BRPOP, etc.) suspend client until data available or timeout, When list becomes empty after pop/trim, key is automatically deleted, LMOVE and BLMOVE atomically pop from source and push to destination, Range indices clamped to valid bounds; out-of-range ranges return empty results, All operations are atomic with respect to individual keys

## Success & failure scenarios

**✅ Success paths**

- **Push To Head** — when LPUSH command issued; elements: one or more values to push, then list created if absent; elements added; client receives new length.
- **Push To Tail** — when RPUSH command issued; elements: one or more values to push, then list created if absent; elements added; client receives new length.
- **Push Conditional** — when command in ["LPUSHX","RPUSHX"], then elements added if list present; returns 0 if key absent.
- **Pop From Head** — when LPOP command issued; optional count parameter (default 1), then client receives single element or array of count elements (or nil if empty).
- **Pop From Tail** — when RPOP command issued; count gt 0, then client receives single element or array of count elements (or nil if empty).
- **Pop Empty List** — when list_length eq 0, then client receives nil.
- **Blocking Pop** — when command in ["BLPOP","BRPOP","BLMOVE","BLMPOP"]; blocking timeout (0 = indefinite); list_has_data eq false, then client blocks until data available or timeout; receives elements or nil.
- **Blocking Pop Timeout** — when timeout_elapsed eq true; no_data_arrived eq true, then client unblocked; receives nil.
- **Get Range** — when LRANGE key start stop; start: zero-based index (negative counts from tail); stop: inclusive end index, then array of elements from start to stop inclusive (clamped to bounds); empty array if out-of-range.
- **Get Index** — when LINDEX key index; index: zero-based position (negative counts from tail), then element at index (or nil if out-of-range).
- **Get Length** — when LLEN key, then number of elements (0 if key absent).
- **Set Index** — when LSET key index element; index: must be within [0, length-1] or [-length, -1], then element replaced; client receives OK.
- **Insert Element** — when LINSERT key BEFORE|AFTER pivot element; pivot: element to find (first occurrence used); pivot_found eq true, then element inserted; client receives new length.
- **Insert Pivot Not Found** — when pivot_found eq false, then list unchanged; client receives -1.
- **Trim Range** — when LTRIM key start stop; start: first index to keep; stop: last index to keep (inclusive), then list trimmed; client receives OK; key deleted if empty.
- **Remove Elements** — when LREM key count element; count: positive=remove from head, negative=from tail, 0=all occurrences, then matching elements removed; client receives count removed.
- **Find Position** — when LPOS key element [RANK rank] [COUNT count] [MAXLEN len], then single position or array of positions (or nil if not found).
- **Move Between Lists** — when LMOVE source destination LEFT|RIGHT LEFT|RIGHT; source_has_data eq true, then element moved atomically; client receives moved element.
- **Move Empty Source** — when source_has_data eq false, then lists unchanged; client receives nil.
- **Blocking Move** — when command eq "BLMOVE"; source_empty eq true; timeout_ms gte 0, then client blocks until source has data or timeout; then moves and returns element.
- **Mpop From Multiple Keys** — when LMPOP numkeys key [key ...] LEFT|RIGHT [COUNT count]; first_non_empty: first key in list with available data, then nested array [key, [elements...]] or nil if all empty.
- **Blocking Mpop** — when command eq "BLMPOP"; any_nonempty eq false, then client blocks until any key has data or timeout; then pops and returns [key, elements].

**❌ Failure paths**

- **Set Out Of Range** — when index not_in "[valid_indices]", then error returned; list unchanged. *(error: `OUT_OF_RANGE`)*

## Errors it can return

- `OUT_OF_RANGE` — Index is out of range
- `WRONG_TYPE` — Operation against a key holding the wrong kind of value

## Events

**`list.lpush`**

**`list.rpush`**

**`list.push_conditional`**

**`list.lpop`**

**`list.rpop`**

**`list.pop_empty`**

**`list.blocking_wait`**

**`list.blocking_timeout`**

**`list.range_read`**

**`list.index_read`**

**`list.len`**

**`list.set`**

**`list.insert`**

**`list.trimmed`**

**`list.removed`**

**`list.pos_search`**

**`list.moved`**

**`list.blocking_move`**

**`list.mpop`**

**`list.blocking_mpop`**

## Connects to

- **string-key-value** *(optional)* — Elements are strings or numeric values
- **multi-exec-transactions** *(optional)* — Often used within transactions

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

📉 **-1** since baseline (76 → 75)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (8) → rules.general
- `T3` **auto-field-labels** — added labels to 7 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/list-queue-operations/) · **Spec source:** [`list-queue-operations.blueprint.yaml`](./list-queue-operations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
