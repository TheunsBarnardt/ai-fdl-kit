<!-- AUTO-GENERATED FROM sorted-set-and-hash-operations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sorted Set And Hash Operations

> Sorted collections with ranking and scoring; nested key-value maps with field-level operations and optional TTL per field

**Category:** Data · **Version:** 1.0.0 · **Tags:** sorted-sets · hashes · nested-kv · scoring · field-expiration · ranking

## What this does

Sorted collections with ranking and scoring; nested key-value maps with field-level operations and optional TTL per field

Specifies 27 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **key** *(text, required)* — Key
- **members** *(json, optional)* — Members
- **fields** *(json, optional)* — Fields
- **score** *(number, optional)* — Score
- **field_ttl_ms** *(number, optional)* — Field Ttl Ms

## What must be true

- **general:** Sorted set members are unique; adding existing member updates score, Scores can be equal; ties broken by lexicographic member order, Scores can be negative, infinity (-inf), or +inf, Range queries support inclusive and exclusive boundaries, Rank is 0-based (0 = lowest score, -1 = highest score in reverse), Lex ranges require all members to have identical scores, Hash fields are unique strings; updating field overwrites value, Hash supports per-field TTL (field expires independently), Numeric field operations (HINCRBY) increment field values, Fields are unordered unless scanning with HSCAN

## Success & failure scenarios

**✅ Success paths**

- **Zadd Members** — when command eq "ZADD"; nx_xx_compat not_in ["NX+XX"], then new member count or changed count (with CH flag); client receives count. _Why: Add or update members with scores._
- **Zadd Incr** — when incr_flag eq "INCR", then new score returned (as string). _Why: Increment member score._
- **Zadd Conditional** — when condition in ["NX","XX","GT","LT"]; condition_met eq true, then member added/updated if condition met; client receives count. _Why: Add only if condition met (NX, XX, GT, LT)._
- **Zrem Members** — when ZREM key member [member ...], then client receives count of removed members. _Why: Remove members by name._
- **Zrange By Rank** — when ZRANGE key start stop [WITHSCORES]; range_type eq "rank", then array of members (with scores if WITHSCORES); empty if out-of-range. _Why: Get members by index range._
- **Zrange By Score** — when ZRANGE key min max BYSCORE [WITHSCORES] [LIMIT offset count]; min_score exists; max_score exists, then array of members in score range [min, max] (exclusive with '(' prefix; handles -inf/+inf). _Why: Get members by score range._
- **Zrange By Lex** — when ZRANGE key min max BYLEX [LIMIT offset count]; all_equal_scores eq true, then array of members in lex range [min, max] (exclusive with '(' prefix; handles -/+). _Why: Get members by lexicographic range (requires equal scores)._
- **Zrank Member** — when ZRANK key member [WITHSCORE], then 0-based rank (or nil if member absent); score included if WITHSCORE. _Why: Get member rank by position._
- **Zscore Member** — when ZSCORE key member, then score as string (or nil if member absent). _Why: Get member score._
- **Zinter Sets** — when ZINTER numkeys key [key ...] [WEIGHTS weight ...] [AGGREGATE SUM|MIN|MAX]; weights exists; aggregate exists, then array of members in all sets (scores combined per AGGREGATE). _Why: Get intersection of sorted sets._
- **Zunion Sets** — when ZUNION numkeys key [key ...] [WEIGHTS weight ...] [AGGREGATE SUM|MIN|MAX], then array of members in any set (scores combined per AGGREGATE). _Why: Get union of sorted sets._
- **Hset Fields** — when command in ["HSET","HMSET"]; field_value_pairs exists, then count of new fields added (HSET) or OK (HMSET). _Why: Set one or more field-value pairs._
- **Hget Field** — when HGET key field, then field value (or nil if field absent or expired). _Why: Get single field value._
- **Hmget Fields** — when HMGET key field [field ...], then array with value for each field (nil for missing/expired fields). _Why: Get multiple field values._
- **Hgetall Fields** — when HGETALL key, then flattened array [field1, value1, field2, value2, ...] (excludes expired fields). _Why: Get all field-value pairs._
- **Hkeys Fields** — when HKEYS key, then array of all field names (excludes expired). _Why: Get all field names._
- **Hvals Values** — when HVALS key, then array of all values (excludes expired fields). _Why: Get all field values._
- **Hdel Fields** — when HDEL key field [field ...], then count of deleted fields; hash deleted if empty. _Why: Delete fields._
- **Hincrby Field** — when HINCRBY key field increment; value matches "^-?[0-9]+$", then new field value after increment. _Why: Increment field value by integer._
- **Hincrbyfloat Field** — when HINCRBYFLOAT key field increment, then new field value as decimal string. _Why: Increment field value by float._
- **Hexists Field** — when HEXISTS key field, then 1 if field exists and not expired, 0 otherwise. _Why: Check if field exists._
- **Hlen Hash** — when HLEN key, then number of fields (after lazy-expiring expired fields). _Why: Get hash field count._
- **Hexpire Field** — when HEXPIRE key [NX|XX|GT|LT] seconds FIELDS count field [field ...]; condition exists, then array with count of affected fields per condition. _Why: Set field expiration time (seconds)._
- **Hpexpire Field** — when HPEXPIRE key [condition] milliseconds FIELDS count field [field ...], then array with affected field counts. _Why: Set field expiration time (milliseconds)._
- **Hpersist Field** — when HPERSIST key FIELDS count field [field ...], then array with count of fields that had TTL removed. _Why: Remove field expiration (make permanent)._
- **Httl Field** — when HTTL key field [field ...], then array of TTLs in seconds (-1=no-ttl, -2=field-absent). _Why: Get field TTL (seconds)._
- **Hscan Fields** — when HSCAN key cursor [MATCH pattern] [COUNT count], then array [new_cursor, [field1, value1, field2, value2, ...]]. _Why: Iterate fields with cursor._

## Errors it can return

- `NOT_AN_INTEGER` — Hash value is not an integer
- `WRONG_TYPE` — Operation against a key holding the wrong kind of value
- `SYNTAX_ERROR` — Syntax error in score or condition

## Events

**`zset.added`**

**`zset.conditional_add`**

**`zset.removed`**

**`zset.range_rank`**

**`zset.range_score`**

**`zset.range_lex`**

**`zset.rank`**

**`zset.score_read`**

**`zset.inter`**

**`zset.union`**

**`hash.set`**

**`hash.field_read`**

**`hash.multi_read`**

**`hash.all_read`**

**`hash.keys_read`**

**`hash.vals_read`**

**`hash.deleted`**

**`hash.incr`**

**`hash.incrbyfloat`**

**`hash.exists_check`**

**`hash.count`**

**`hash.expire_set`**

**`hash.pexpire_set`**

**`hash.persist`**

**`hash.ttl_read`**

**`hash.scan`**

## Connects to

- **string-key-value** *(optional)* — Hash fields and sorted set members are strings
- **key-expiration** *(required)* — Hashes support per-field TTL

## Quality fitness 🟡 68/100

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
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (10) → rules.general
- `T3` **auto-field-labels** — added labels to 5 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/sorted-set-and-hash-operations/) · **Spec source:** [`sorted-set-and-hash-operations.blueprint.yaml`](./sorted-set-and-hash-operations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
