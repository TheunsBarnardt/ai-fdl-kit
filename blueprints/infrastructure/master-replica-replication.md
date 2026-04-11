<!-- AUTO-GENERATED FROM master-replica-replication.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Master Replica Replication

> One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** replication · high-availability · read-scaling · data-synchronization · partial-resync

## What this does

One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **repl_state** *(select, optional)*
- **repl_id** *(text, optional)*
- **repl_offset** *(number, optional)*
- **repl_backlog** *(json, optional)*
- **backlog_size_mb** *(number, optional)*
- **replication_lag_seconds** *(number, optional)*

## What must be true

- **0:** Master sends ALL write commands to connected replicas
- **1:** Replicas apply commands in order (FIFO); cannot apply out-of-order
- **2:** Replicas are read-only (writes rejected or ignored)
- **3:** Replication is asynchronous (master doesn't wait for replica ack)
- **4:** Full sync copies RDB snapshot then streams commands
- **5:** Partial sync only sends commands within replication backlog window
- **6:** Replication ID identifies master generation (changes on election or failover)
- **7:** Replica track master offset to enable partial resync after disconnect
- **8:** If offset falls outside backlog window, full sync required
- **9:** Replication backlog is circular (overwrites old entries)

## Success & failure scenarios

**✅ Success paths**

- **Configure Replication** — when REPLICAOF master_host master_port; master_address eq, then OK; replica begins connection to master.
- **Stop Replication** — when REPLICAOF NO ONE, then OK; replica becomes master (accepts writes).
- **Full Sync Rdb** — when replica_state eq "connecting"; partial_resync_possible eq false, then master begins sending RDB; replica loads snapshot.
- **Full Sync Complete** — when rdb_received eq true; replica_loaded_rdb eq true, then replica synchronized; begins receiving command stream.
- **Partial Resync Request** — when replica_reconnect eq true; offset_in_backlog eq true, then PSYNC repl_id offset sent to master.
- **Partial Resync Accepted** — when master_repl_id_matches eq true; replica_offset_in_backlog eq true, then +CONTINUE; master sends backlog commands from offset.
- **Partial Resync Rejected** — when master_repl_id_mismatch eq true; replica_offset_too_old eq true OR repl_id_changed eq true, then -FULLRESYNC; master sends full RDB.
- **Master Write Command** — when any write command (SET, DEL, LPUSH, etc.); replicas_connected gt 0, then master applies command locally and queues for replicas.
- **Replica Receive Command** — when master_sends_command eq, then replica applies command to own dataset.
- **Command Buffer Overflow** — when buffer_size_exceeds_limit eq true, then replica disconnected if buffer exceeds limits; full resync required on reconnect.
- **Replica Disconnect** — when network_failure eq, then replica stops receiving; master queues commands for eventual resync.
- **Replica Reconnect** — when replica_connects_again eq true, then replica attempts PSYNC; full sync if backlog not available.
- **Backlog Command Buffered** — when write_command eq, then command available for partial resync.
- **Backlog Overwrite** — when backlog_full eq true; new_command_added eq true, then old commands discarded; replicas with those offsets must full resync.
- **Backlog Size Configurable** — when in bytes (larger = longer disconnect tolerance), then backlog capacity adjusted; takes effect on next command.
- **Info Replication** — when INFO replication, then master: role=master, replicas=[{ip,port,state,offset}, ...]; replica: role=slave, master={ip,port,state}.
- **Role Command** — when ROLE command, then master=[master, repl_offset, [[replica_ip, replica_port, replica_offset], ...]]; replica=[slave, master_ip, master_port, state, replica_offset].
- **Wait For Replicas** — when WAIT num_replicas timeout_ms; num_replicas eq; timeout_ms eq, then blocks until >= num_replicas have replicated offset or timeout; returns count of acks.

## Errors it can return

- `REPLICATION_ERROR` — Error during replication setup
- `READONLY` — READONLY You can't write against a read only replica

## Connects to

- **database-persistence** *(optional)* — Replicas often serve as backup storage
- **sentinel-failover** *(optional)* — Sentinel uses replication topology for failover

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/master-replica-replication/) · **Spec source:** [`master-replica-replication.blueprint.yaml`](./master-replica-replication.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
