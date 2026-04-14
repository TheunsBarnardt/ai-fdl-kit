<!-- AUTO-GENERATED FROM multi-exec-transactions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Exec Transactions

> Atomic multi-command execution with optional optimistic locking via WATCH; commands queued and executed sequentially without interruption

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** transactions · atomic-operations · optimistic-locking · rollback · isolation

## What this does

Atomic multi-command execution with optional optimistic locking via WATCH; commands queued and executed sequentially without interruption

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **transaction_state** *(select, optional)* — Transaction State
- **queued_commands** *(json, optional)* — Queued Commands
- **command_results** *(json, optional)* — Command Results
- **watched_keys** *(json, optional)* — Watched Keys
- **abort_transaction** *(boolean, optional)* — Abort Transaction

## What must be true

- **general:** MULTI marks start of transaction; client queues commands instead of executing, All queued commands execute sequentially without interleaving from other clients, Syntax errors during queueing set EXECABORT flag; EXEC fails entirely, Runtime errors during execution do not abort other commands (partial success possible), WATCH monitors keys; if ANY watched key modified by other client before EXEC, transaction aborts, No nested MULTI (attempt to MULTI while in transaction returns error)
- **general → Atomicity guarantee:** Either all commands execute or none (in case of WATCH violation)
- **general → Transactions provide isolation:** Other clients cannot see partial state

## Success & failure scenarios

**✅ Success paths**

- **Multi Start** — when MULTI command; already_in_transaction eq false, then client receives OK; enters queuing mode.
- **Queue Command** — when transaction_state eq "queuing"; command not_in ["EXEC","DISCARD","WATCH","UNWATCH"], then client receives QUEUED; command not executed yet.
- **Exec Transaction** — when EXEC command; abort_transaction eq false; watch_violation eq false, then array of results (one per queued command; errors as error objects).
- **Discard Transaction** — when DISCARD command; transaction_state eq "queuing", then client receives OK; queued commands discarded.
- **Watch Keys** — when WATCH key [key ...]; transaction_state in ["idle","queuing"], then client receives OK; keys now monitored.
- **Unwatch Keys** — when UNWATCH command, then client receives OK; watch list cleared.
- **Watch Violation Detected** — when watched_key_modified eq true; modifier_client exists, then next EXEC returns nil (abort).
- **Optimistic Lock Read** — when GET key (before MULTI); WATCH key, then value retrieved; key now watched.
- **Optimistic Lock Compute** — when new_value exists, then application prepares new value.
- **Optimistic Lock Execute** — when MULTI ... SET key new_value ... EXEC; key_unchanged eq true, then EXEC succeeds; new value set.
- **Optimistic Lock Retry** — when watch_violation eq true, then EXEC returns nil; application retries (GET, compute, MULTI/EXEC).
- **Command Runtime Error** — when command_executing exists; runtime_error eq true, then error stored in results array for that command; other commands still execute.
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
- `WATCH_VIOLATION` — WATCH violation detected

## Events

**`transaction.started`**

**`transaction.command_queued`**

**`transaction.syntax_error`**

**`transaction.executed`**

**`transaction.aborted_syntax`**

**`transaction.aborted_watch`**

**`transaction.discarded`**

**`transaction.keys_watched`**

**`transaction.watch_cleared`**

**`transaction.watch_violated`**

**`transaction.optimistic_read`**

**`transaction.value_computed`**

**`transaction.lock_acquired`**

**`transaction.lock_failed`**

**`transaction.command_error`**

**`transaction.partial_success`**

## Connects to

- **string-key-value** *(optional)* — Often used to atomically update multiple keys
- **lua-scripting** *(optional)* — Both provide atomicity; scripting more powerful for complex logic

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (8) → rules.general
- `T3` **auto-field-labels** — added labels to 5 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/multi-exec-transactions/) · **Spec source:** [`multi-exec-transactions.blueprint.yaml`](./multi-exec-transactions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
