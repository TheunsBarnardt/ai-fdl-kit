<!-- AUTO-GENERATED FROM lua-scripting.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Lua Scripting

> Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** lua-scripting · server-side-execution · atomic-operations · stored-procedures

## What this does

Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

Specifies 21 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **script_source** *(text, optional)* — Script Source
- **script_sha** *(text, optional)* — Script Sha
- **num_keys** *(number, optional)* — Num Keys
- **keys_array** *(json, optional)* — Keys Array
- **argv_array** *(json, optional)* — Argv Array
- **script_result** *(text, optional)* — Script Result
- **execution_time_ms** *(number, optional)* — Execution Time Ms

## What must be true

- **general:** Scripts execute atomically; no other commands interleave during execution, Script has access to all Redis commands via redis.call() or redis.pcall(), redis.call() raises error if command fails; redis.pcall() returns error table, Scripts are sandboxed; no file I/O, network access, or dangerous Lua operations, Replicas execute scripts read-only (writes not allowed on replicas), Scripts are cached by SHA1; same script executed multiple times via EVALSHA, Script cache persists for server lifetime or until FLUSHDB/FLUSHALL, Numeric types preserved; float operations return integers where possible, Long-running scripts can be SCRIPT KILL if timeout exceeded

## Success & failure scenarios

**✅ Success paths**

- **Eval Inline Script** — when EVAL script numkeys [key ...] [arg ...]; script exists; numkeys exists, then script result returned (value, error, or nil). _Why: Execute script inline._
- **Evalsha Cached** — when EVALSHA sha1 numkeys [key ...] [arg ...]; script_cached eq true, then script result returned. _Why: Execute cached script by SHA1._
- **Script Result String** — when script_returns eq "string", then string value returned to client. _Why: Script returns string value._
- **Script Result Number** — when script_returns eq "number", then number value returned. _Why: Script returns numeric value._
- **Script Result Array** — when script_returns eq "table", then array returned with nested structures preserved. _Why: Script returns array/table._
- **Script Result Error** — when redis.error_reply('message'), then error returned to client. _Why: Script returns error via redis.error_reply()._
- **Script Redis Error** — when redis.call() fails, then error returned; script aborted; database unchanged (atomic). _Why: Redis command within script fails with redis.call()._
- **Script Redis Error Handled** — when redis.pcall() returns error, then error table passed to Lua; script continues. _Why: Redis command fails but caught with redis.pcall()._
- **Script Call Redis Command** — when redis.call('SET', 'key', 'value') or redis.pcall(...), then command executes atomically; result returned to script. _Why: Execute Redis command from within script._
- **Script Load** — when SCRIPT LOAD script; script exists, then SHA1 digest returned (can later use with EVALSHA). _Why: Pre-load script into cache._
- **Script Exists** — when SCRIPT EXISTS sha1 [sha1 ...]; shas exists, then array of 0/1 for each SHA (1=cached, 0=not found). _Why: Check if scripts are cached._
- **Script Flush** — when SCRIPT FLUSH [ASYNC|SYNC]; mode exists, then OK returned; all cached scripts deleted. _Why: Clear script cache._
- **Script Kill** — when SCRIPT KILL; script_executing eq true; execution_time_exceeds_timeout eq true, then script terminated; OK returned (or error if cannot kill). _Why: Terminate long-running script._
- **Sandbox No Network** — when socket.connect(), etc., then error returned. _Why: Network operations blocked._
- **Sandbox Allowed Functions** — when allowed_libs in ["table","string","math","cjson"], then library functions execute normally. _Why: Standard library functions available._
- **Script All Or Nothing** — when script with multiple redis.call(); first_command_succeeds eq true; second_command_fails eq true, then first command's effects remain (NOT transactional); script aborted at failure. _Why: Script atomicity guarantee._
- **Script Isolation** — when script execution in progress; other_client_modifies_key eq true, then script doesn't see other client's modification (changes applied after script completes). _Why: Script sees consistent database state._

**❌ Failure paths**

- **Evalsha Not Found** — when script_cached eq false, then NOSCRIPT error returned; client can retry with EVAL. *(error: `NOSCRIPT`)*
- **Script Runtime Error** — when lua_error eq true, then error returned; database unchanged. _Why: Script execution fails (Lua error)._ *(error: `SCRIPT_ERROR`)*
- **Script Call Denied** — when script_killed_mid_execution eq true, then redis.call() rejects further execution; SCRIPT KILL succeeded. *(error: `SCRIPT_KILLED`)*
- **Sandbox No File Io** — when io.open(), os.execute(), etc., then error returned; script aborted. _Why: File I/O operations blocked._ *(error: `SCRIPT_ERROR`)*

## Errors it can return

- `NOSCRIPT` — No matching script. Please use EVAL.
- `SCRIPT_ERROR` — Error running script
- `SCRIPT_KILLED` — Script killed by user with SCRIPT KILL

## Events

**`script.executed`**

**`script.executed_cached`**

**`script.not_found`**

**`script.result_string`**

**`script.result_number`**

**`script.result_array`**

**`script.result_error`**

**`script.runtime_error`**

**`script.redis_call_error`**

**`script.redis_pcall_error`**

**`script.redis_command_executed`**

**`script.loaded`**

**`script.exists_checked`**

**`script.cache_flushed`**

**`script.killed`**

**`script.call_denied`**

**`script.sandbox_violation`**

**`script.stdlib_used`**

**`script.atomic_abort`**

**`script.isolation_maintained`**

## Connects to

- **multi-exec-transactions** *(optional)* — Both provide atomicity; scripting is more powerful for complex logic
- **string-key-value** *(optional)* — Scripts often operate on string keys

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (9) → rules.general
- `T3` **auto-field-labels** — added labels to 7 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/lua-scripting/) · **Spec source:** [`lua-scripting.blueprint.yaml`](./lua-scripting.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
