<!-- AUTO-GENERATED FROM string-key-value.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# String Key Value

> Store and retrieve arbitrary-length string values with atomic increment, decrement, append, and range operations

**Category:** Data · **Version:** 1.0.0 · **Tags:** strings · key-value · atomic-operations · numeric-operations

## What this does

Store and retrieve arbitrary-length string values with atomic increment, decrement, append, and range operations

Specifies 22 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)*
- **value** *(text, optional)*
- **ttl_milliseconds** *(number, optional)*
- **is_numeric** *(boolean, optional)*
- **old_value** *(text, optional)*
- **encoding** *(select, optional)*

## What must be true

- **0:** String size cannot exceed 512 MB (configurable via proto_max_bulk_len)
- **1:** Numeric operations (INCR, DECR) require value to be a valid 64-bit signed integer; otherwise fail with syntax error
- **2:** Increment/decrement values must fit in [-2^63, 2^63-1]; overflow checked and rejected with error
- **3:** Floating-point increment (INCRBYFLOAT) parsed as long double; operations returning NaN or Infinity fail
- **4:** APPEND and SETRANGE extend string with zero-padding if needed; SETRANGE with negative offset rejected
- **5:** All operations are atomic—no partial states visible to concurrent clients
- **6:** SET with NX (if-not-exists) and XX (if-exists) conditions are mutually exclusive

## Success & failure scenarios

**✅ Success paths**

- **Read Existing String** — when key exists and has string value; key is not expired, then client receives full string value.
- **Read Missing Key** — when key does not exist, then client receives null/nil.
- **Read With Ttl Modification** — when key exists with string value; GETEX command with optional expiry flags, then client receives string value; TTL optionally modified.
- **Set Or Overwrite** — when SET command issued, then key now holds new value; client receives OK.
- **Set With Conditions** — when Conditional set flags; condition_met eq true, then value set and OK returned; or nil if condition not met.
- **Set With Ttl** — when SET with EX|PX|EXAT|PXAT flag, then key set with expiration; expires at specified time.
- **Append To String** — when APPEND command; suffix to append, then string extended; client receives new total length.
- **Get Substring** — when GETRANGE key start end; start gte "-2^31"; end lte "2^31-1", then substring from start to end inclusive (0-indexed, supports negative indices); empty string if range out of bounds.
- **Set Substring** — when SETRANGE key offset value; offset gte 0, then string modified; client receives new total length.
- **Increment Integer** — when INCR, INCRBY, or DECR command; value is valid 64-bit signed integer; change is within [-2^63, 2^63-1] range, then client receives new numeric value.
- **Increment Float** — when INCRBYFLOAT command; interpreted as long double; result not_in ["NaN","Infinity"], then client receives new value as decimal string.
- **Getset Atomically** — when GETSET or SET with GET flag, then old value returned to client; new value now stored.
- **Getdel Atomically** — when GETDEL command, then value returned to client; key deleted.
- **Mget Multiple Keys** — when MGET key1 [key2 ...], then array returned with value for each key (nil for missing or non-string keys).
- **Mset Multiple Keys** — when MSET key1 value1 [key2 value2 ...], then all keys set; client receives OK.
- **Msetnx Conditional Bulk** — when MSETNX key1 value1 [key2 value2 ...]; all_keys_absent eq true, then all keys set; client receives 1.

**❌ Failure paths**

- **Conditional Set Fails** — when SET with NX|XX|IFEQ|IFNE condition; condition_met eq false, then value unchanged; client receives nil. *(error: `CONDITION_NOT_MET`)*
- **Setrange With Invalid Offset** — when SETRANGE with negative offset, then error returned; string unchanged. *(error: `INVALID_OFFSET`)*
- **Increment Non Numeric** — when value is not a valid integer, then error returned; value unchanged. *(error: `NOT_AN_INTEGER`)*
- **Increment Overflow** — when increment would exceed 64-bit bounds, then error returned; value unchanged. *(error: `INCREMENT_OVERFLOW`)*
- **Increment Float Invalid** — when result in ["NaN","Infinity"], then error returned; value unchanged. *(error: `FLOAT_INVALID`)*
- **Msetnx Condition Fails** — when all_keys_absent eq false, then no keys set; client receives 0. *(error: `KEY_EXISTS`)*

## Errors it can return

- `NOT_AN_INTEGER` — value is not an integer or out of range
- `INCREMENT_OVERFLOW` — increment or decrement would overflow
- `CONDITION_NOT_MET` — SET condition not met (returned as nil, not error)
- `INVALID_OFFSET` — offset is out of range
- `STRING_TOO_LARGE` — string exceeds maximum allowed size
- `FLOAT_INVALID` — float increment resulted in NaN or Infinity

## Connects to

- **key-expiration** *(required)* — TTL support integrated into string operations
- **multi-exec-transactions** *(optional)* — Multiple string commands often wrapped in transactions

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/string-key-value/) · **Spec source:** [`string-key-value.blueprint.yaml`](./string-key-value.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
