---
title: "Master Replica Replication Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog. 6 fields. 18 outcomes. 2 error code"
---

# Master Replica Replication Blueprint

> One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

| | |
|---|---|
| **Feature** | `master-replica-replication` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | replication, high-availability, read-scaling, data-synchronization, partial-resync |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/master-replica-replication.blueprint.yaml) |
| **JSON API** | [master-replica-replication.json]({{ site.baseurl }}/api/blueprints/infrastructure/master-replica-replication.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `master` | Master | system | Primary instance accepting writes |
| `replica` | Replica | system | Secondary instance receiving commands |
| `replication_stream` | Replication Stream | system | Command log between master and replicas |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `repl_state` | select | No | Repl State |  |
| `repl_id` | text | No | Repl Id |  |
| `repl_offset` | number | No | Repl Offset |  |
| `repl_backlog` | json | No | Repl Backlog |  |
| `backlog_size_mb` | number | No | Backlog Size Mb |  |
| `replication_lag_seconds` | number | No | Replication Lag Seconds |  |

## States

**State field:** `replica_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_replicating` | Yes |  |
| `connecting` |  |  |
| `syncing` |  |  |
| `sync_partial` |  |  |
| `replicating` |  | Yes |

## Rules

- **general:** Master sends ALL write commands to connected replicas, Replicas apply commands in order (FIFO); cannot apply out-of-order, Replicas are read-only (writes rejected or ignored), Replication is asynchronous (master doesn't wait for replica ack), Full sync copies RDB snapshot then streams commands, Partial sync only sends commands within replication backlog window, Replication ID identifies master generation (changes on election or failover), Replica track master offset to enable partial resync after disconnect, If offset falls outside backlog window, full sync required, Replication backlog is circular (overwrites old entries)

## Outcomes

### Configure_replication (Priority: 10)

_Configure instance as replica_

**Given:**
- REPLICAOF master_host master_port
- `master_address` (input) exists

**Then:**
- **transition_state** field: `replica_state` to: `connecting`
- **emit_event** event: `replication.config_set`

**Result:** OK; replica begins connection to master

### Stop_replication (Priority: 11)

_Promote replica to standalone_

**Given:**
- REPLICAOF NO ONE

**Then:**
- **transition_state** field: `replica_state` to: `not_replicating`
- **emit_event** event: `replication.stopped`

**Result:** OK; replica becomes master (accepts writes)

### Full_sync_rdb (Priority: 20)

_Master sends RDB snapshot for full sync_

**Given:**
- `replica_state` (db) eq `connecting`
- `partial_resync_possible` (computed) eq `false`

**Then:**
- **transition_state** field: `replica_state` to: `syncing`
- **emit_event** event: `replication.full_sync_started`

**Result:** master begins sending RDB; replica loads snapshot

### Full_sync_complete (Priority: 21)

**Given:**
- `rdb_received` (system) eq `true`
- `replica_loaded_rdb` (system) eq `true`

**Then:**
- **transition_state** field: `replica_state` to: `replicating`
- **emit_event** event: `replication.full_sync_complete`

**Result:** replica synchronized; begins receiving command stream

### Partial_resync_request (Priority: 30)

_Replica attempts partial resync_

**Given:**
- `replica_reconnect` (system) eq `true`
- `offset_in_backlog` (computed) eq `true`

**Then:**
- **emit_event** event: `replication.partial_resync_request`

**Result:** PSYNC repl_id offset sent to master

### Partial_resync_accepted (Priority: 31)

**Given:**
- `master_repl_id_matches` (db) eq `true`
- `replica_offset_in_backlog` (db) eq `true`

**Then:**
- **transition_state** field: `replica_state` to: `sync_partial`
- **emit_event** event: `replication.partial_resync_accepted`

**Result:** +CONTINUE; master sends backlog commands from offset

### Partial_resync_rejected (Priority: 32)

**Given:**
- `master_repl_id_mismatch` (db) eq `true`
- ANY: `replica_offset_too_old` (db) eq `true` OR `repl_id_changed` (db) eq `true`

**Then:**
- **transition_state** field: `replica_state` to: `syncing`
- **emit_event** event: `replication.full_resync_forced`

**Result:** -FULLRESYNC; master sends full RDB

### Master_write_command (Priority: 40)

_Master accepts write command_

**Given:**
- any write command (SET, DEL, LPUSH, etc.)
- `replicas_connected` (system) gt `0`

**Then:**
- **emit_event** event: `replication.command_propagated`

**Result:** master applies command locally and queues for replicas

### Replica_receive_command (Priority: 41)

_Replica receives and applies command_

**Given:**
- `master_sends_command` (system) exists

**Then:**
- **emit_event** event: `replication.command_applied`

**Result:** replica applies command to own dataset

### Command_buffer_overflow (Priority: 42)

_Replication buffer grows too large_

**Given:**
- `buffer_size_exceeds_limit` (system) eq `true`

**Then:**
- **emit_event** event: `replication.buffer_overflow`

**Result:** replica disconnected if buffer exceeds limits; full resync required on reconnect

### Replica_disconnect (Priority: 50)

_Network partition or timeout_

**Given:**
- `network_failure` (system) exists

**Then:**
- **transition_state** field: `replica_state` to: `not_replicating`
- **emit_event** event: `replication.disconnected`

**Result:** replica stops receiving; master queues commands for eventual resync

### Replica_reconnect (Priority: 51)

_Replica reconnects to master_

**Given:**
- `replica_connects_again` (system) eq `true`

**Then:**
- **transition_state** field: `replica_state` to: `connecting`
- **emit_event** event: `replication.reconnecting`

**Result:** replica attempts PSYNC; full sync if backlog not available

### Backlog_command_buffered (Priority: 60)

_Command added to replication backlog_

**Given:**
- `write_command` (system) exists

**Then:**
- **emit_event** event: `replication.backlog_write`

**Result:** command available for partial resync

### Backlog_overwrite (Priority: 61)

_Backlog circular buffer overwrites old entry_

**Given:**
- `backlog_full` (system) eq `true`
- `new_command_added` (system) eq `true`

**Then:**
- **emit_event** event: `replication.backlog_overwrite`

**Result:** old commands discarded; replicas with those offsets must full resync

### Backlog_size_configurable (Priority: 62)

_Adjust backlog size for different retention_

**Given:**
- `repl_backlog_size` (input) exists

**Then:**
- **set_field** target: `backlog_size_mb`
- **emit_event** event: `replication.backlog_resized`

**Result:** backlog capacity adjusted; takes effect on next command

### Info_replication (Priority: 70)

_Query replication status_

**Given:**
- INFO replication

**Then:**
- **emit_event** event: `replication.info_queried`

**Result:** master: role=master, replicas=[{ip,port,state,offset}, ...]; replica: role=slave, master={ip,port,state}

### Role_command (Priority: 71)

_Get role and replication info_

**Given:**
- ROLE command

**Then:**
- **emit_event** event: `replication.role_queried`

**Result:** master=[master, repl_offset, [[replica_ip, replica_port, replica_offset], ...]]; replica=[slave, master_ip, master_port, state, replica_offset]

### Wait_for_replicas (Priority: 80)

_Block until replicas ack_

**Given:**
- WAIT num_replicas timeout_ms
- `num_replicas` (input) exists
- `timeout_ms` (input) exists

**Then:**
- **emit_event** event: `replication.wait_issued`

**Result:** blocks until >= num_replicas have replicated offset or timeout; returns count of acks

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPLICATION_ERROR` | 500 | Error during replication setup | No |
| `READONLY` | 403 | You cannot write against a read only replica | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `replication.config_set` |  |  |
| `replication.stopped` |  |  |
| `replication.full_sync_started` |  |  |
| `replication.full_sync_complete` |  |  |
| `replication.partial_resync_request` |  |  |
| `replication.partial_resync_accepted` |  |  |
| `replication.full_resync_forced` |  |  |
| `replication.command_propagated` |  |  |
| `replication.command_applied` |  |  |
| `replication.buffer_overflow` |  |  |
| `replication.disconnected` |  |  |
| `replication.reconnecting` |  |  |
| `replication.backlog_write` |  |  |
| `replication.backlog_overwrite` |  |  |
| `replication.backlog_resized` |  |  |
| `replication.info_queried` |  |  |
| `replication.role_queried` |  |  |
| `replication.wait_issued` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| database-persistence | optional | Replicas often serve as backup storage |
| sentinel-failover | optional | Sentinel uses replication topology for failover |

## AGI Readiness

### Goals

#### Reliable Master Replica Replication

One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| configure_replication | `autonomous` | - | - |
| stop_replication | `autonomous` | - | - |
| full_sync_rdb | `autonomous` | - | - |
| full_sync_complete | `autonomous` | - | - |
| partial_resync_request | `autonomous` | - | - |
| partial_resync_accepted | `autonomous` | - | - |
| partial_resync_rejected | `supervised` | - | - |
| master_write_command | `autonomous` | - | - |
| replica_receive_command | `autonomous` | - | - |
| command_buffer_overflow | `autonomous` | - | - |
| replica_disconnect | `autonomous` | - | - |
| replica_reconnect | `autonomous` | - | - |
| backlog_command_buffered | `autonomous` | - | - |
| backlog_overwrite | `autonomous` | - | - |
| backlog_size_configurable | `autonomous` | - | - |
| info_replication | `autonomous` | - | - |
| role_command | `autonomous` | - | - |
| wait_for_replicas | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/redis/redis
  project: Redis
  tech_stack: C
  files_traced: 1
  entry_points:
    - src/replication.c
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Master Replica Replication Blueprint",
  "description": "One-way data synchronization from master to replicas; full or partial resync with command streaming and replication backlog. 6 fields. 18 outcomes. 2 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "replication, high-availability, read-scaling, data-synchronization, partial-resync"
}
</script>
