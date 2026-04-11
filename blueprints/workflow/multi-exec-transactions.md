<!-- AUTO-GENERATED FROM multi-exec-transactions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Exec Transactions

> Atomic multi-command execution with optional optimistic locking via WATCH; commands queued and executed sequentially without interruption

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** transactions · atomic-operations · optimistic-locking · rollback · isolation

## What this does

Atomic multi-command execution with optional optimistic locking via WATCH; commands queued and executed sequentially without interruption

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **transaction_state** *(select, optional)*
- **queued_commands** *(json, optional)*
- **command_results** *(json, optional)*
- **watched_keys** *(json, optional)*
- **abort_transaction** *(boolean, optional)*

## What must be true

- **0:** MULTI marks start of transaction; client queues commands instead of executing
- **1:** All queued commands execute sequentially without interleaving from other clients
- **2:** Syntax errors during queueing set EXECABORT flag; EXEC fails entirely
- **3:** Runtime errors during execution do not abort other commands (partial success possible)
- **4:** WATCH monitors keys; if ANY watched key modified by other client before EXEC, transaction aborts
- **5 → Atomicity guarantee:** Either all commands execute or none (in case of WATCH violation)
- **6:** No nested MULTI (attempt to MULTI while in transaction returns error)
- **7 → Transactions provide isolation:** Other clients cannot see partial state

## Success & failure scenarios

**✅ Success paths**

- **Multi Start** — when MULTI command; already_in_transaction eq false, then client receives OK; enters queuing mode.
- **Queue Command** — when transaction_state eq "queuing"; command not_in ["EXEC","DISCARD","WATCH","UNWATCH"], then client receives QUEUED; command not executed yet.
- **Exec Transaction** — when EXEC command; abort_transaction eq false; watch_violation eq false, then array of results (one per queued command; errors as error objects).
- **Discard Transaction** — when DISCARD command; transaction_state eq "queuing", then client receives OK; queued commands discarded.
- **Watch Keys** — when WATCH key [key ...]; transaction_state in ["idle","queuing"], then client receives OK; keys now monitored.
- **Unwatch Keys** — when UNWATCH command, then client receives OK; watch list cleared.
- **Watch Violation Detected** — when watched_key_modified eq true; different client modified the key, then next EXEC returns nil (abort).
- **Optimistic Lock Read** — when GET key (before MULTI); WATCH key, then value retrieved; key now watched.
- **Optimistic Lock Compute** — when calculated from read value, then application prepares new value.
- **Optimistic Lock Execute** — when MULTI ... SET key new_value ... EXEC; key_unchanged eq true, then EXEC succeeds; new value set.
- **Optimistic Lock Retry** — when watch_violation eq true, then EXEC returns nil; application retries (GET, compute, MULTI/EXEC).
- **Command Runtime Error** — when command_executing eq; runtime_error eq true, then error stored in results array for that command; other commands still execute.
- **Partial Execution** — when mixed_results eq true, then EXEC returns array with mix of values and error objects.

**❌ Failure paths**

- **Nested Multi Error** — when already_in_transaction eq true, then error returned; transaction state unchanged. *(error: `NESTED_TRANSACTION`)*
- **Queue Syntax Error** — when syntax_error eq true, then error returned; EXECABORT flag set; EXEC will fail. *(error: `EXECABORT`)*
- **Exec Abort Syntax** — when abort_transaction eq true, then error returned; transaction discarded; client back to idle. *(error: `EXECABORT`)*
- **Exec Watch Violation** — when watch_violation eq true, then nil returned; transaction rolled back; watched keys unchanged. *(error: `WATCH_VIOLATION`)*
- **Discard Without Transaction** — when transaction_state not_in ["queuing"], then error returned. *(error: `NO_TRANSACTION`)*

## Errors it can return

- `NESTED_TRANSACTION` — MULTI calls can not be nested
- `EXECABORT` — EXECABORT Transaction discarded because of previous errors
- `NO_TRANSACTION` — DISCARD without MULTI
- `WATCH_VIOLATION` — WATCH violation (returned as nil, not error)

## Connects to

- **string-key-value** *(optional)* — Often used to atomically update multiple keys
- **lua-scripting** *(optional)* — Both provide atomicity; scripting more powerful for complex logic

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/multi-exec-transactions/) · **Spec source:** [`multi-exec-transactions.blueprint.yaml`](./multi-exec-transactions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
