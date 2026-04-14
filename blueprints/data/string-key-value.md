<!-- AUTO-GENERATED FROM string-key-value.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# String Key Value

> Store and retrieve arbitrary-length string values with atomic increment, decrement, append, and range operations

**Category:** Data · **Version:** 1.0.0 · **Tags:** strings · key-value · atomic-operations · numeric-operations

## What this does

Store and retrieve arbitrary-length string values with atomic increment, decrement, append, and range operations

Specifies 22 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)* — Key
- **value** *(text, optional)* — Value
- **ttl_milliseconds** *(number, optional)* — Ttl Milliseconds
- **is_numeric** *(boolean, optional)* — Is Numeric
- **old_value** *(text, optional)* — Old Value
- **encoding** *(select, optional)* — Encoding

## What must be true

- **general:** String size cannot exceed 512 MB (configurable via proto_max_bulk_len), Numeric operations (INCR, DECR) require value to be a valid 64-bit signed integer; otherwise fail with syntax error, Increment/decrement values must fit in [-2^63, 2^63-1]; overflow checked and rejected with error, Floating-point increment (INCRBYFLOAT) parsed as long double; operations returning NaN or Infinity fail, APPEND and SETRANGE extend string with zero-padding if needed; SETRANGE with negative offset rejected, All operations are atomic—no partial states visible to concurrent clients, SET with NX (if-not-exists) and XX (if-exists) conditions are mutually exclusive

## Success & failure scenarios

**✅ Success paths**

- **Read Existing String** — when key exists and has string value; key is not expired, then client receives full string value.
- **Read Missing Key** — when key does not exist, then client receives null/nil.
- **Read With Ttl Modification** — when key exists with string value; GETEX command with optional expiry flags, then client receives string value; TTL optionally modified.
- **Set Or Overwrite** — when SET command issued, then key now holds new value; client receives OK.
- **Set With Conditions** — when condition_type in ["NX","XX","IFEQ","IFNE","IFDEQ","IFDNE"]; condition_met eq true, then value set and OK returned; or nil if condition not met.
- **Set With Ttl** — when SET with EX|PX|EXAT|PXAT flag, then key set with expiration; expires at specified time.
- **Get Substring** — when GETRANGE key start end; start gte "-2^31"; end lte "2^31-1", then substring from start to end inclusive (0-indexed, supports negative indices); empty string if range out of bounds.
- **Set Substring** — when SETRANGE key offset value; offset gte 0, then string modified; client receives new total length.
- **Increment Integer** — when INCR, INCRBY, or DECR command; value matches "^-?[0-9]{1,19}$"; increment_amount exists, then client receives new numeric value.
- **Increment Float** — when INCRBYFLOAT command; value exists; result not_in ["NaN","Infinity"], then client receives new value as decimal string.
- **Getset Atomically** — when GETSET or SET with GET flag, then old value returned to client; new value now stored.
- **Getdel Atomically** — when GETDEL command, then value returned to client; key deleted.
- **Mget Multiple Keys** — when MGET key1 [key2 ...], then array returned with value for each key (nil for missing or non-string keys).
- **Mset Multiple Keys** — when MSET key1 value1 [key2 value2 ...], then all keys set; client receives OK.
- **Msetnx Conditional Bulk** — when MSETNX key1 value1 [key2 value2 ...]; all_keys_absent eq true, then all keys set; client receives 1.

**❌ Failure paths**

- **Conditional Set Fails** — when SET with NX|XX|IFEQ|IFNE condition; condition_met eq false, then value unchanged; client receives nil. *(error: `CONDITION_NOT_MET`)*
- **Append To String** — when APPEND command; value exists, then string extended; client receives new total length. *(error: `STRING_TOO_LARGE`)*
- **Setrange With Invalid Offset** — when SETRANGE with negative offset, then error returned; string unchanged. *(error: `INVALID_OFFSET`)*
- **Increment Non Numeric** — when value is not a valid 64-bit signed integer string, then error returned; value unchanged. *(error: `NOT_AN_INTEGER`)*
- **Increment Overflow** — when increment would exceed 64-bit bounds, then error returned; value unchanged. *(error: `INCREMENT_OVERFLOW`)*
- **Increment Float Invalid** — when result in ["NaN","Infinity"], then error returned; value unchanged. *(error: `FLOAT_INVALID`)*
- **Msetnx Condition Fails** — when all_keys_absent eq false, then no keys set; client receives 0. *(error: `KEY_EXISTS`)*

## Errors it can return

- `NOT_AN_INTEGER` — Value is not an integer or out of range
- `INCREMENT_OVERFLOW` — Increment or decrement would overflow
- `CONDITION_NOT_MET` — SET condition not met
- `INVALID_OFFSET` — Offset is out of range
- `STRING_TOO_LARGE` — String exceeds maximum allowed size
- `FLOAT_INVALID` — Float increment resulted in NaN or Infinity
- `KEY_EXISTS` — One or more keys already exist

## Events

**`string.read`**

**`string.miss`**

**`string.set`**

**`string.set_conditional`**

**`string.set_expiring`**

**`string.appended`**

**`string.range_read`**

**`string.range_written`**

**`string.incr`**

**`string.incrbyfloat`**

**`string.getset`**

**`string.getdel`**

**`string.mget`**

**`string.mset`**

**`string.msetnx_success`**

**`string.msetnx_rejected`**

## Connects to

- **key-expiration** *(required)* — TTL support integrated into string operations
- **multi-exec-transactions** *(optional)* — Multiple string commands often wrapped in transactions

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (7) → rules.general
- `T3` **auto-field-labels** — added labels to 6 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/string-key-value/) · **Spec source:** [`string-key-value.blueprint.yaml`](./string-key-value.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
