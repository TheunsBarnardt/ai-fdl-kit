<!-- AUTO-GENERATED FROM master-replica-replication.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Master Replica Replication

> One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** replication · high-availability · read-scaling · data-synchronization · partial-resync

## What this does

One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **repl_state** *(select, optional)* — Repl State
- **repl_id** *(text, optional)* — Repl Id
- **repl_offset** *(number, optional)* — Repl Offset
- **repl_backlog** *(json, optional)* — Repl Backlog
- **backlog_size_mb** *(number, optional)* — Backlog Size Mb
- **replication_lag_seconds** *(number, optional)* — Replication Lag Seconds

## What must be true

- **general:** Master sends ALL write commands to connected replicas, Replicas apply commands in order (FIFO); cannot apply out-of-order, Replicas are read-only (writes rejected or ignored), Replication is asynchronous (master doesn't wait for replica ack), Full sync copies RDB snapshot then streams commands, Partial sync only sends commands within replication backlog window, Replication ID identifies master generation (changes on election or failover), Replica track master offset to enable partial resync after disconnect, If offset falls outside backlog window, full sync required, Replication backlog is circular (overwrites old entries)

## Success & failure scenarios

**✅ Success paths**

- **Configure Replication** — when REPLICAOF master_host master_port; master_address exists, then OK; replica begins connection to master.
- **Stop Replication** — when REPLICAOF NO ONE, then OK; replica becomes master (accepts writes).
- **Full Sync Rdb** — when replica_state eq "connecting"; partial_resync_possible eq false, then master begins sending RDB; replica loads snapshot.
- **Full Sync Complete** — when rdb_received eq true; replica_loaded_rdb eq true, then replica synchronized; begins receiving command stream.
- **Partial Resync Request** — when replica_reconnect eq true; offset_in_backlog eq true, then PSYNC repl_id offset sent to master.
- **Partial Resync Accepted** — when master_repl_id_matches eq true; replica_offset_in_backlog eq true, then +CONTINUE; master sends backlog commands from offset.
- **Partial Resync Rejected** — when master_repl_id_mismatch eq true; replica_offset_too_old eq true OR repl_id_changed eq true, then -FULLRESYNC; master sends full RDB.
- **Master Write Command** — when any write command (SET, DEL, LPUSH, etc.); replicas_connected gt 0, then master applies command locally and queues for replicas.
- **Replica Receive Command** — when master_sends_command exists, then replica applies command to own dataset.
- **Command Buffer Overflow** — when buffer_size_exceeds_limit eq true, then replica disconnected if buffer exceeds limits; full resync required on reconnect.
- **Replica Disconnect** — when network_failure exists, then replica stops receiving; master queues commands for eventual resync.
- **Replica Reconnect** — when replica_connects_again eq true, then replica attempts PSYNC; full sync if backlog not available.
- **Backlog Command Buffered** — when write_command exists, then command available for partial resync.
- **Backlog Overwrite** — when backlog_full eq true; new_command_added eq true, then old commands discarded; replicas with those offsets must full resync.
- **Backlog Size Configurable** — when repl_backlog_size exists, then backlog capacity adjusted; takes effect on next command.
- **Info Replication** — when INFO replication, then master: role=master, replicas=[{ip,port,state,offset}, ...]; replica: role=slave, master={ip,port,state}.
- **Role Command** — when ROLE command, then master=[master, repl_offset, [[replica_ip, replica_port, replica_offset], ...]]; replica=[slave, master_ip, master_port, state, replica_offset].
- **Wait For Replicas** — when WAIT num_replicas timeout_ms; num_replicas exists; timeout_ms exists, then blocks until >= num_replicas have replicated offset or timeout; returns count of acks.

## Errors it can return

- `REPLICATION_ERROR` — Error during replication setup
- `READONLY` — You cannot write against a read only replica

## Events

**`replication.config_set`**

**`replication.stopped`**

**`replication.full_sync_started`**

**`replication.full_sync_complete`**

**`replication.partial_resync_request`**

**`replication.partial_resync_accepted`**

**`replication.full_resync_forced`**

**`replication.command_propagated`**

**`replication.command_applied`**

**`replication.buffer_overflow`**

**`replication.disconnected`**

**`replication.reconnecting`**

**`replication.backlog_write`**

**`replication.backlog_overwrite`**

**`replication.backlog_resized`**

**`replication.info_queried`**

**`replication.role_queried`**

**`replication.wait_issued`**

## Connects to

- **database-persistence** *(optional)* — Replicas often serve as backup storage
- **sentinel-failover** *(optional)* — Sentinel uses replication topology for failover

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (10) → rules.general
- `T3` **auto-field-labels** — added labels to 6 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/master-replica-replication/) · **Spec source:** [`master-replica-replication.blueprint.yaml`](./master-replica-replication.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
