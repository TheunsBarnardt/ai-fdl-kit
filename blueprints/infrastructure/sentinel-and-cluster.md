<!-- AUTO-GENERATED FROM sentinel-and-cluster.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sentinel And Cluster

> Sentinel: automatic failover and monitoring; Cluster: distributed sharding across multiple nodes with gossip protocol

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** sentinel · cluster · failover · sharding · high-availability · auto-recovery · distributed

## What this does

Sentinel: automatic failover and monitoring; Cluster: distributed sharding across multiple nodes with gossip protocol

Specifies 19 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **sentinel_mode** *(boolean, optional)* — Sentinel Mode
- **cluster_mode** *(boolean, optional)* — Cluster Mode
- **master_state** *(select, optional)* — Master State
- **cluster_slots** *(number, optional)* — Cluster Slots
- **node_slots_owned** *(json, optional)* — Node Slots Owned
- **sentinel_quorum_size** *(number, optional)* — Sentinel Quorum Size

## What must be true

- **general:** Sentinel monitors master health via PING; no response within down_after_milliseconds = SDOWN, Quorum of Sentinels must agree (ODOWN) before failover begins, Failover elected to one Sentinel as leader; others follow decisions, Configurations written to disk and propagated via Pub/Sub, Failed master can rejoin cluster as replica after recovery, Data sharded across cluster nodes using hash slots (0-16383), Slot assignment determines which node owns which keys, Replicas replicate their master's slots (same slot ranges), Multi-key operations must have all keys in same slot, Cluster protocol via gossip (periodic node updates), Redirection via MOVED (permanent) or ASK (temporary), Cluster can rebalance slots (migrate data between nodes)
- **general → During failover:** replica promoted to master, other replicas reconfigured

## Success & failure scenarios

**✅ Success paths**

- **Sentinel Monitor Master** — when sentinel_config exists, then Sentinel begins periodic health checks (PING, INFO). _Why: Start monitoring master._
- **Sentinel Health Check** — when ping_no_response exists, then this Sentinel marks master subjectively down. _Why: Ping master; no response = SDOWN._
- **Sentinel Quorum Agreement** — when other_sentinels_agree gte "quorum-1"; total_sentinels_agree gte "quorum", then master objectively down; failover authorized. _Why: Other Sentinels agree master is down._
- **Sentinel Leader Election** — when odown eq true; leader_elected eq "this_sentinel", then leader begins failover state machine. _Why: Sentinel elected as failover leader._
- **Sentinel Replica Selection** — when replica_candidates exists; selection_criteria exists, then best replica chosen for promotion. _Why: Choose best replica to promote._
- **Sentinel Promotion** — when SLAVEOF NO ONE sent to replica, then replica stops replication, becomes master. _Why: Promote replica to master._
- **Sentinel Reconfigure Replicas** — when new_master exists; other_replicas gt 0, then other replicas point to new master. _Why: Reconfigure other replicas._
- **Sentinel Failover Complete** — when new_master_promoted eq true; all_replicas_reconfigured eq true, then failover complete; cluster operational with new master.
- **Cluster Node Join** — when CLUSTER MEET ip port; cluster_mode_enabled eq true, then node added to cluster; gossip begins. _Why: Node joins cluster._
- **Cluster Key Routing** — when key exists; slot exists; slot_owner exists, then command executed on slot owner or client redirected. _Why: Client request routed to correct slot owner._
- **Cluster Moved Redirect** — when slot_owner_changed eq true, then client receives MOVED node_ip:node_port; should update slot map. _Why: Permanent redirection (slot reassigned)._
- **Cluster Ask Redirect** — when slot_importing eq true; slot_migrating_from_other eq true, then client receives ASK; forward request to new node; next request goes to moved node. _Why: Temporary redirection (slot being migrated)._
- **Cluster State Ok** — when all_slots_assigned eq true; all_nodes_reachable eq true, then cluster operational. _Why: All slots covered and reachable._
- **Cluster State Fail** — when unreachable_slots gt 0, then cluster enters fail state; some commands fail. _Why: Some slots unreachable._
- **Cluster Gossip Update** — when cluster tick (internal periodic task), then nodes exchange health/slot info; topology discovered. _Why: Periodic gossip between nodes._
- **Cluster Info** — when CLUSTER INFO, then cluster state info: state, slots covered/ok/fail, nodes. _Why: Query cluster state._

**❌ Failure paths**

- **Cluster Slot Assignment** — when CLUSTER ADDSLOTS slot [slot ...]; slots_available eq true, then slots now served by this node. _Why: Assign slots to nodes._ *(error: `CLUSTER_CROSSSLOT`)*
- **Cluster Slot Migration** — when CLUSTER SETSLOT slot MIGRATING target_node_id; target node: CLUSTER SETSLOT slot IMPORTING source_node_id, then slot enters migration state; data gradually moved. _Why: Move slots between nodes._ *(error: `CLUSTER_SLOT_UNOWNED`)*
- **Cluster Multi Key Restriction** — when command_touches_multiple_slots eq true, then error returned; operation not allowed (use MGET, MSET on keys with same slot). _Why: Multi-key operation on different slots._ *(error: `CLUSTER_CROSSSLOT`)*

## Errors it can return

- `CLUSTER_CROSSSLOT` — Keys in request do not hash to the same slot
- `CLUSTER_SLOT_UNOWNED` — The cluster is down
- `SENTINEL_NOSCRIPT` — Sentinel command syntax error

## Events

**`sentinel.monitoring_started`**

**`sentinel.sdown_detected`**

**`sentinel.odown_detected`**

**`sentinel.failover_started`**

**`sentinel.replica_selected`**

**`sentinel.promotion_sent`**

**`sentinel.replication_updated`**

**`sentinel.failover_complete`**

**`cluster.node_joined`**

**`cluster.slots_assigned`**

**`cluster.request_routed`**

**`cluster.moved`**

**`cluster.ask`**

**`cluster.migration_started`**

**`cluster.crossslot_rejected`**

**`cluster.healthy`**

**`cluster.unhealthy`**

**`cluster.gossip_sent`**

**`cluster.info_queried`**

## Connects to

- **master-replica-replication** *(required)* — Sentinel monitors master-replica setup; Cluster uses replication for fault tolerance
- **database-persistence** *(optional)* — Both use RDB snapshots for recovery

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (13) → rules.general
- `T3` **auto-field-labels** — added labels to 6 fields
- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/sentinel-and-cluster/) · **Spec source:** [`sentinel-and-cluster.blueprint.yaml`](./sentinel-and-cluster.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
