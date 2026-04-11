<!-- AUTO-GENERATED FROM lua-scripting.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Lua Scripting

> Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** lua-scripting · server-side-execution · atomic-operations · stored-procedures

## What this does

Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

Specifies 21 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **script_source** *(text, optional)*
- **script_sha** *(text, optional)*
- **num_keys** *(number, optional)*
- **keys_array** *(json, optional)*
- **argv_array** *(json, optional)*
- **script_result** *(text, optional)*
- **execution_time_ms** *(number, optional)*

## What must be true

- **0:** Scripts execute atomically; no other commands interleave during execution
- **1:** Script has access to all Redis commands via redis.call() or redis.pcall()
- **2:** redis.call() raises error if command fails; redis.pcall() returns error table
- **3:** Scripts are sandboxed; no file I/O, network access, or dangerous Lua operations
- **4:** Replicas execute scripts read-only (writes not allowed on replicas)
- **5:** Scripts are cached by SHA1; same script executed multiple times via EVALSHA
- **6:** Script cache persists for server lifetime or until FLUSHDB/FLUSHALL
- **7:** Numeric types preserved; float operations return integers where possible
- **8:** Long-running scripts can be SCRIPT KILL if timeout exceeded

## Success & failure scenarios

**✅ Success paths**

- **Eval Inline Script** — when EVAL script numkeys [key ...] [arg ...]; script eq; count of keys (determines KEYS/ARGV split), then script result returned (value, error, or nil).
- **Evalsha Cached** — when EVALSHA sha1 numkeys [key ...] [arg ...]; script_cached eq true, then script result returned.
- **Script Result String** — when script_returns eq "string", then string value returned to client.
- **Script Result Number** — when script_returns eq "number", then number value returned.
- **Script Result Array** — when script_returns eq "table", then array returned with nested structures preserved.
- **Script Result Error** — when redis.error_reply('message'), then error returned to client.
- **Script Redis Error** — when redis.call() fails, then error returned; script aborted; database unchanged (atomic).
- **Script Redis Error Handled** — when redis.pcall() returns error, then error table passed to Lua; script continues.
- **Script Call Redis Command** — when redis.call('SET', 'key', 'value') or redis.pcall(...), then command executes atomically; result returned to script.
- **Script Load** — when SCRIPT LOAD script; script eq, then SHA1 digest returned (can later use with EVALSHA).
- **Script Exists** — when SCRIPT EXISTS sha1 [sha1 ...]; shas eq, then array of 0/1 for each SHA (1=cached, 0=not found).
- **Script Flush** — when SCRIPT FLUSH [ASYNC|SYNC]; ASYNC=non-blocking, SYNC=blocking, then OK returned; all cached scripts deleted.
- **Script Kill** — when SCRIPT KILL; script_executing eq true; execution_time_exceeds_timeout eq true, then script terminated; OK returned (or error if cannot kill).
- **Sandbox No Network** — when socket.connect(), etc., then error returned.
- **Sandbox Allowed Functions** — when allowed_libs in ["table","string","math","cjson"], then library functions execute normally.
- **Script All Or Nothing** — when script with multiple redis.call(); first_command_succeeds eq true; second_command_fails eq true, then first command's effects remain (NOT transactional); script aborted at failure.
- **Script Isolation** — when script execution in progress; other_client_modifies_key eq true, then script doesn't see other client's modification (changes applied after script completes).

**❌ Failure paths**

- **Evalsha Not Found** — when script_cached eq false, then NOSCRIPT error returned; client can retry with EVAL. *(error: `NOSCRIPT`)*
- **Script Runtime Error** — when lua_error eq true, then error returned; database unchanged. *(error: `SCRIPT_ERROR`)*
- **Script Call Denied** — when script_killed_mid_execution eq true, then redis.call() rejects further execution; SCRIPT KILL succeeded. *(error: `SCRIPT_KILLED`)*
- **Sandbox No File Io** — when io.open(), os.execute(), etc., then error returned; script aborted. *(error: `SCRIPT_ERROR`)*

## Errors it can return

- `NOSCRIPT` — NOSCRIPT No matching script. Please use EVAL.
- `SCRIPT_ERROR` — ERR Error running script: <details>
- `SCRIPT_KILLED` — SCRIPT KILLED Script killed by user with SCRIPT KILL...

## Connects to

- **multi-exec-transactions** *(optional)* — Both provide atomicity; scripting is more powerful for complex logic
- **string-key-value** *(optional)* — Scripts often operate on string keys

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/lua-scripting/) · **Spec source:** [`lua-scripting.blueprint.yaml`](./lua-scripting.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
