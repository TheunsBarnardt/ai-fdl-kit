<!-- AUTO-GENERATED FROM list-queue-operations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# List Queue Operations

> Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

**Category:** Data · **Version:** 1.0.0 · **Tags:** lists · queues · stacks · blocking-operations · ordered-collections

## What this does

Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists

Specifies 23 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)*
- **elements** *(json, optional)*
- **length** *(number, optional)*
- **head_index** *(number, optional)*
- **tail_index** *(number, optional)*
- **is_blocking** *(boolean, optional)*
- **block_timeout_ms** *(number, optional)*

## What must be true

- **0:** List can be accessed from both ends (head and tail) in O(1) time
- **1:** Indices support negative values (-1 = last element, -2 = second-to-last, etc.)
- **2:** LTRIM removes elements from both ends simultaneously; intermediate indices unclamped
- **3:** Blocking operations (BLPOP, BRPOP, etc.) suspend client until data available or timeout
- **4:** When list becomes empty after pop/trim, key is automatically deleted
- **5:** LMOVE and BLMOVE atomically pop from source and push to destination
- **6:** Range indices clamped to valid bounds; out-of-range ranges return empty results
- **7:** All operations are atomic with respect to individual keys

## Success & failure scenarios

**✅ Success paths**

- **Push To Head** — when LPUSH command issued; one or more values to push, then list created if absent; elements added; client receives new length.
- **Push To Tail** — when RPUSH command issued; elements eq, then list created if absent; elements added; client receives new length.
- **Push Conditional** — when command in ["LPUSHX","RPUSHX"], then elements added if list present; returns 0 if key absent.
- **Pop From Head** — when LPOP command issued; optional count parameter (default 1), then client receives single element or array of count elements (or nil if empty).
- **Pop From Tail** — when RPOP command issued; count gt 0, then client receives single element or array of count elements (or nil if empty).
- **Pop Empty List** — when list_length eq 0, then client receives nil.
- **Blocking Pop** — when command in ["BLPOP","BRPOP","BLMOVE","BLMPOP"]; blocking timeout (0 = indefinite); list_has_data eq false, then client blocks until data available or timeout; receives elements or nil.
- **Blocking Pop Timeout** — when timeout_elapsed eq true; no_data_arrived eq true, then client unblocked; receives nil.
- **Get Range** — when LRANGE key start stop; start eq; stop eq, then array of elements from start to stop inclusive (clamped to bounds); empty array if out-of-range.
- **Get Index** — when LINDEX key index; index eq, then element at index (or nil if out-of-range).
- **Get Length** — when LLEN key, then number of elements (0 if key absent).
- **Set Index** — when LSET key index element; must be within [0, length-1] or [-length, -1], then element replaced; client receives OK.
- **Insert Element** — when LINSERT key BEFORE|AFTER pivot element; element to find; pivot_found eq true, then element inserted; client receives new length.
- **Insert Pivot Not Found** — when pivot_found eq false, then list unchanged; client receives -1.
- **Trim Range** — when LTRIM key start stop; start eq; stop eq, then list trimmed; client receives OK; key deleted if empty.
- **Remove Elements** — when LREM key count element; positive=from head, negative=from tail, 0=all, then matching elements removed; client receives count removed.
- **Find Position** — when LPOS key element [RANK rank] [COUNT count] [MAXLEN len], then single position or array of positions (or nil if not found).
- **Move Between Lists** — when LMOVE source destination LEFT|RIGHT LEFT|RIGHT; source_has_data eq true, then element moved atomically; client receives moved element.
- **Move Empty Source** — when source_has_data eq false, then lists unchanged; client receives nil.
- **Blocking Move** — when command eq "BLMOVE"; source_empty eq true; timeout_ms gte 0, then client blocks until source has data or timeout; then moves and returns element.
- **Mpop From Multiple Keys** — when LMPOP numkeys key [key ...] LEFT|RIGHT [COUNT count]; first key with data, then nested array [key, [elements...]] or nil if all empty.
- **Blocking Mpop** — when command eq "BLMPOP"; any_nonempty eq false, then client blocks until any key has data or timeout; then pops and returns [key, elements].

**❌ Failure paths**

- **Set Out Of Range** — when index not_in "[valid_indices]", then error returned; list unchanged. *(error: `OUT_OF_RANGE`)*

## Errors it can return

- `OUT_OF_RANGE` — index is out of range
- `WRONG_TYPE` — WRONGTYPE Operation against a key holding the wrong kind of value

## Connects to

- **string-key-value** *(optional)* — Elements are strings or numeric values
- **multi-exec-transactions** *(optional)* — Often used within transactions

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/list-queue-operations/) · **Spec source:** [`list-queue-operations.blueprint.yaml`](./list-queue-operations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
