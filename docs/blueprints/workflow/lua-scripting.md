---
title: "Lua Scripting Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip. 7 fields. 21 outc"
---

# Lua Scripting Blueprint

> Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

| | |
|---|---|
| **Feature** | `lua-scripting` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | lua-scripting, server-side-execution, atomic-operations, stored-procedures |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/lua-scripting.blueprint.yaml) |
| **JSON API** | [lua-scripting.json]({{ site.baseurl }}/api/blueprints/workflow/lua-scripting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Application sending scripts to execute |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `script_source` | text | No | Script Source |  |
| `script_sha` | text | No | Script Sha |  |
| `num_keys` | number | No | Num Keys |  |
| `keys_array` | json | No | Keys Array |  |
| `argv_array` | json | No | Argv Array |  |
| `script_result` | text | No | Script Result |  |
| `execution_time_ms` | number | No | Execution Time Ms |  |

## States

**State field:** `script_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_cached` | Yes |  |
| `cached` |  |  |
| `executing` |  |  |
| `completed` |  | Yes |

## Rules

- **general:** Scripts execute atomically; no other commands interleave during execution, Script has access to all Redis commands via redis.call() or redis.pcall(), redis.call() raises error if command fails; redis.pcall() returns error table, Scripts are sandboxed; no file I/O, network access, or dangerous Lua operations, Replicas execute scripts read-only (writes not allowed on replicas), Scripts are cached by SHA1; same script executed multiple times via EVALSHA, Script cache persists for server lifetime or until FLUSHDB/FLUSHALL, Numeric types preserved; float operations return integers where possible, Long-running scripts can be SCRIPT KILL if timeout exceeded

## Outcomes

### Eval_inline_script (Priority: 10)

_Execute script inline_

**Given:**
- EVAL script numkeys [key ...] [arg ...]
- `script` (input) exists
- `numkeys` (input) exists

**Then:**
- **set_field** target: `script_source`
- **set_field** target: `keys_array` — first numkeys arguments
- **set_field** target: `argv_array` — remaining arguments
- **transition_state** field: `script_state` to: `executing`
- **emit_event** event: `script.executed`

**Result:** script result returned (value, error, or nil)

### Evalsha_cached (Priority: 11)

_Execute cached script by SHA1_

**Given:**
- EVALSHA sha1 numkeys [key ...] [arg ...]
- `script_cached` (db) eq `true`

**Then:**
- **set_field** target: `keys_array`
- **set_field** target: `argv_array`
- **transition_state** field: `script_state` to: `executing`
- **emit_event** event: `script.executed_cached`

**Result:** script result returned

### Evalsha_not_found (Priority: 12) — Error: `NOSCRIPT`

**Given:**
- `script_cached` (db) eq `false`

**Then:**
- **emit_event** event: `script.not_found`

**Result:** NOSCRIPT error returned; client can retry with EVAL

### Script_result_string (Priority: 13)

_Script returns string value_

**Given:**
- `script_returns` (computed) eq `string`

**Then:**
- **set_field** target: `script_result`
- **emit_event** event: `script.result_string`

**Result:** string value returned to client

### Script_result_number (Priority: 14)

_Script returns numeric value_

**Given:**
- `script_returns` (computed) eq `number`

**Then:**
- **set_field** target: `script_result`
- **emit_event** event: `script.result_number`

**Result:** number value returned

### Script_result_array (Priority: 15)

_Script returns array/table_

**Given:**
- `script_returns` (computed) eq `table`

**Then:**
- **emit_event** event: `script.result_array`

**Result:** array returned with nested structures preserved

### Script_result_error (Priority: 16)

_Script returns error via redis.error_reply()_

**Given:**
- redis.error_reply('message')

**Then:**
- **emit_event** event: `script.result_error`

**Result:** error returned to client

### Script_runtime_error (Priority: 17) — Error: `SCRIPT_ERROR`

_Script execution fails (Lua error)_

**Given:**
- `lua_error` (computed) eq `true`

**Then:**
- **emit_event** event: `script.runtime_error`

**Result:** error returned; database unchanged

### Script_redis_error (Priority: 18)

_Redis command within script fails with redis.call()_

**Given:**
- redis.call() fails

**Then:**
- **emit_event** event: `script.redis_call_error`

**Result:** error returned; script aborted; database unchanged (atomic)

### Script_redis_error_handled (Priority: 19)

_Redis command fails but caught with redis.pcall()_

**Given:**
- redis.pcall() returns error

**Then:**
- **emit_event** event: `script.redis_pcall_error`

**Result:** error table passed to Lua; script continues

### Script_call_redis_command (Priority: 20)

_Execute Redis command from within script_

**Given:**
- redis.call('SET', 'key', 'value') or redis.pcall(...)

**Then:**
- **emit_event** event: `script.redis_command_executed`

**Result:** command executes atomically; result returned to script

### Script_load (Priority: 30)

_Pre-load script into cache_

**Given:**
- SCRIPT LOAD script
- `script` (input) exists

**Then:**
- **set_field** target: `script_sha` — compute SHA1 digest
- **set_field** target: `script_state` value: `cached`
- **emit_event** event: `script.loaded`

**Result:** SHA1 digest returned (can later use with EVALSHA)

### Script_exists (Priority: 31)

_Check if scripts are cached_

**Given:**
- SCRIPT EXISTS sha1 [sha1 ...]
- `shas` (input) exists

**Then:**
- **emit_event** event: `script.exists_checked`

**Result:** array of 0/1 for each SHA (1=cached, 0=not found)

### Script_flush (Priority: 32)

_Clear script cache_

**Given:**
- SCRIPT FLUSH [ASYNC|SYNC]
- `mode` (input) exists

**Then:**
- **set_field** target: `script_state` value: `not_cached`
- **emit_event** event: `script.cache_flushed`

**Result:** OK returned; all cached scripts deleted

### Script_kill (Priority: 33)

_Terminate long-running script_

**Given:**
- SCRIPT KILL
- `script_executing` (system) eq `true`
- `execution_time_exceeds_timeout` (system) eq `true`

**Then:**
- **emit_event** event: `script.killed`

**Result:** script terminated; OK returned (or error if cannot kill)

### Script_call_denied (Priority: 34) — Error: `SCRIPT_KILLED`

**Given:**
- `script_killed_mid_execution` (system) eq `true`

**Then:**
- **emit_event** event: `script.call_denied`

**Result:** redis.call() rejects further execution; SCRIPT KILL succeeded

### Sandbox_no_file_io (Priority: 40) — Error: `SCRIPT_ERROR`

_File I/O operations blocked_

**Given:**
- io.open(), os.execute(), etc.

**Then:**
- **emit_event** event: `script.sandbox_violation`

**Result:** error returned; script aborted

### Sandbox_no_network (Priority: 41)

_Network operations blocked_

**Given:**
- socket.connect(), etc.

**Result:** error returned

### Sandbox_allowed_functions (Priority: 42)

_Standard library functions available_

**Given:**
- `allowed_libs` (system) in `table,string,math,cjson`

**Then:**
- **emit_event** event: `script.stdlib_used`

**Result:** library functions execute normally

### Script_all_or_nothing (Priority: 50)

_Script atomicity guarantee_

**Given:**
- script with multiple redis.call()
- `first_command_succeeds` (system) eq `true`
- `second_command_fails` (system) eq `true`

**Then:**
- **emit_event** event: `script.atomic_abort`

**Result:** first command's effects remain (NOT transactional); script aborted at failure

### Script_isolation (Priority: 51)

_Script sees consistent database state_

**Given:**
- script execution in progress
- `other_client_modifies_key` (system) eq `true`

**Then:**
- **emit_event** event: `script.isolation_maintained`

**Result:** script doesn't see other client's modification (changes applied after script completes)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NOSCRIPT` | 404 | No matching script. Please use EVAL. | No |
| `SCRIPT_ERROR` | 500 | Error running script | No |
| `SCRIPT_KILLED` | 500 | Script killed by user with SCRIPT KILL | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `script.executed` |  |  |
| `script.executed_cached` |  |  |
| `script.not_found` |  |  |
| `script.result_string` |  |  |
| `script.result_number` |  |  |
| `script.result_array` |  |  |
| `script.result_error` |  |  |
| `script.runtime_error` |  |  |
| `script.redis_call_error` |  |  |
| `script.redis_pcall_error` |  |  |
| `script.redis_command_executed` |  |  |
| `script.loaded` |  |  |
| `script.exists_checked` |  |  |
| `script.cache_flushed` |  |  |
| `script.killed` |  |  |
| `script.call_denied` |  |  |
| `script.sandbox_violation` |  |  |
| `script.stdlib_used` |  |  |
| `script.atomic_abort` |  |  |
| `script.isolation_maintained` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-exec-transactions | optional | Both provide atomicity; scripting is more powerful for complex logic |
| string-key-value | optional | Scripts often operate on string keys |

## AGI Readiness

### Goals

#### Reliable Lua Scripting

Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| eval_inline_script | `autonomous` | - | - |
| evalsha_cached | `autonomous` | - | - |
| evalsha_not_found | `autonomous` | - | - |
| script_result_string | `autonomous` | - | - |
| script_result_number | `autonomous` | - | - |
| script_result_array | `autonomous` | - | - |
| script_result_error | `autonomous` | - | - |
| script_runtime_error | `autonomous` | - | - |
| script_redis_error | `autonomous` | - | - |
| script_redis_error_handled | `autonomous` | - | - |
| script_call_redis_command | `autonomous` | - | - |
| script_load | `autonomous` | - | - |
| script_exists | `autonomous` | - | - |
| script_flush | `autonomous` | - | - |
| script_kill | `autonomous` | - | - |
| script_call_denied | `autonomous` | - | - |
| sandbox_no_file_io | `autonomous` | - | - |
| sandbox_no_network | `autonomous` | - | - |
| sandbox_allowed_functions | `autonomous` | - | - |
| script_all_or_nothing | `autonomous` | - | - |
| script_isolation | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/redis/redis
  project: Redis
  tech_stack: C
  files_traced: 3
  entry_points:
    - src/eval.c
    - src/script.c
    - src/script_lua.c
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Lua Scripting Blueprint",
  "description": "Server-side Lua script execution providing atomic operations, programmatic logic, and access to all Redis commands within a single round-trip. 7 fields. 21 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "lua-scripting, server-side-execution, atomic-operations, stored-procedures"
}
</script>
