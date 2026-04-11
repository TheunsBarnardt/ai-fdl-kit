<!-- AUTO-GENERATED FROM sentinel-and-cluster.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sentinel And Cluster

> Sentinel: automatic failover and monitoring; Cluster: distributed sharding across multiple nodes with gossip protocol

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** sentinel · cluster · failover · sharding · high-availability · auto-recovery · distributed

## What this does

Sentinel: automatic failover and monitoring; Cluster: distributed sharding across multiple nodes with gossip protocol

Specifies 19 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **sentinel_mode** *(boolean, optional)*
- **cluster_mode** *(boolean, optional)*
- **master_state** *(select, optional)*
- **cluster_slots** *(number, optional)*
- **node_slots_owned** *(json, optional)*
- **sentinel_quorum_size** *(number, optional)*

## What must be true

- **0:** Sentinel monitors master health via PING; no response within down_after_milliseconds = SDOWN
- **1:** Quorum of Sentinels must agree (ODOWN) before failover begins
- **2:** Failover elected to one Sentinel as leader; others follow decisions
- **3 → During failover:** replica promoted to master, other replicas reconfigured
- **4:** Configurations written to disk and propagated via Pub/Sub
- **5:** Failed master can rejoin cluster as replica after recovery
- **6:** Data sharded across cluster nodes using hash slots (0-16383)
- **7:** Slot assignment determines which node owns which keys
- **8:** Replicas replicate their master's slots (same slot ranges)
- **9:** Multi-key operations must have all keys in same slot
- **10:** Cluster protocol via gossip (periodic node updates)
- **11:** Redirection via MOVED (permanent) or ASK (temporary)
- **12:** Cluster can rebalance slots (migrate data between nodes)

## Success & failure scenarios

**✅ Success paths**

- **Sentinel Monitor Master** — when sentinel monitor <name> <ip> <port> <quorum>, then Sentinel begins periodic health checks (PING, INFO).
- **Sentinel Health Check** — when no PONG for down_after_milliseconds, then this Sentinel marks master subjectively down.
- **Sentinel Quorum Agreement** — when other_sentinels_agree gte "quorum-1"; total_sentinels_agree gte "quorum", then master objectively down; failover authorized.
- **Sentinel Leader Election** — when odown eq true; leader_elected eq "this_sentinel", then leader begins failover state machine.
- **Sentinel Replica Selection** — when connected replicas; priority, offset, runid, then best replica chosen for promotion.
- **Sentinel Promotion** — when SLAVEOF NO ONE sent to replica, then replica stops replication, becomes master.
- **Sentinel Reconfigure Replicas** — when new_master eq; other_replicas gt 0, then other replicas point to new master.
- **Sentinel Failover Complete** — when new_master_promoted eq true; all_replicas_reconfigured eq true, then failover complete; cluster operational with new master.
- **Cluster Node Join** — when CLUSTER MEET ip port; cluster_mode_enabled eq true, then node added to cluster; gossip begins.
- **Cluster Slot Assignment** — when CLUSTER ADDSLOTS slot [slot ...]; slots_available eq true, then slots now served by this node.
- **Cluster Key Routing** — when key eq; CRC16(key) mod 16384; slot_owner eq, then command executed on slot owner or client redirected.
- **Cluster Moved Redirect** — when slot_owner_changed eq true, then client receives MOVED node_ip:node_port; should update slot map.
- **Cluster Ask Redirect** — when slot_importing eq true; slot_migrating_from_other eq true, then client receives ASK; forward request to new node; next request goes to moved node.
- **Cluster Slot Migration** — when CLUSTER SETSLOT slot MIGRATING target_node_id; target node: CLUSTER SETSLOT slot IMPORTING source_node_id, then slot enters migration state; data gradually moved.
- **Cluster State Ok** — when all_slots_assigned eq true; all_nodes_reachable eq true, then cluster operational.
- **Cluster State Fail** — when unreachable_slots gt 0, then cluster enters fail state; some commands fail.
- **Cluster Gossip Update** — when cluster tick (internal periodic task), then nodes exchange health/slot info; topology discovered.
- **Cluster Info** — when CLUSTER INFO, then cluster state info: state, slots covered/ok/fail, nodes.

**❌ Failure paths**

- **Cluster Multi Key Restriction** — when command_touches_multiple_slots eq true, then error returned; operation not allowed (use MGET, MSET on keys with same slot). *(error: `CROSSSLOT`)*

## Errors it can return

- `CLUSTER_CROSSSLOT` — CROSSSLOT Keys in request don't hash to the same slot
- `CLUSTER_SLOT_UNOWNED` — CLUSTERDOWN The cluster is down
- `SENTINEL_NOSCRIPT` — Sentinel command syntax error

## Connects to

- **master-replica-replication** *(required)* — Sentinel monitors master-replica setup; Cluster uses replication for fault tolerance
- **database-persistence** *(optional)* — Both use RDB snapshots for recovery

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/sentinel-and-cluster/) · **Spec source:** [`sentinel-and-cluster.blueprint.yaml`](./sentinel-and-cluster.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
