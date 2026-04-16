<!-- AUTO-GENERATED FROM database-persistence.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Database Persistence

> Data durability via RDB snapshots and/or AOF journaling; recover to point-in-time or exact command sequence after crash

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** persistence · durability · rdb-snapshots · aof-journal · crash-recovery · backup

## What this does

Data durability via RDB snapshots and/or AOF journaling; recover to point-in-time or exact command sequence after crash

Specifies 20 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **persistence_mode** *(select, optional)* — Persistence Mode
- **rdb_file** *(text, optional)* — Rdb File
- **aof_file** *(text, optional)* — Aof File
- **last_save_time** *(number, optional)* — Last Save Time
- **fsync_policy** *(select, optional)* — Fsync Policy
- **recovery_point** *(text, optional)* — Recovery Point

## What must be true

- **general:** RDB snapshots are point-in-time; commands after snapshot are lost on crash, AOF journaling logs every write command; replaying recovers to exact state before crash, RDB snapshots smaller but slower to load; AOF larger but can replay incrementally, Fsync policy determines durability vs. performance tradeoff (always=safe, no=fast), RDB snapshot created via fork; uses copy-on-write to minimize memory overhead, AOF rewrite compacts journal into snapshot + recent commands (background process), Persistence operations are transparent; do not block client commands (background), Files are atomic; writes to temp files then renamed
- **general → RDB + AOF together:** fastest load (RDB) + maximum durability (AOF)

## Success & failure scenarios

**✅ Success paths**

- **Rdb Save Sync** — when SAVE command, then server blocks; snapshot written to disk; client receives OK. _Why: Block and save snapshot synchronously._
- **Rdb Bgsave** — when BGSAVE command; no_other_save_in_progress eq true, then background process started; client receives OK immediately. _Why: Save snapshot in background._
- **Rdb Save Complete** — when rdb_save_succeeds eq true, then snapshot available for recovery.
- **Rdb Lastsave** — when LASTSAVE command, then Unix timestamp of last successful save (or 0 if never saved). _Why: Query last save time._
- **Aof Write Command** — when any write command (SET, DEL, LPUSH, etc.); aof_enabled eq true, then command written to AOF buffer (fsync per policy). _Why: Append command to journal._
- **Aof Fsync Always** — when fsync_policy eq "always", then AOF durability guaranteed; write latency increased. _Why: Sync after every write._
- **Aof Fsync Everysec** — when fsync_policy eq "everysec", then good balance of durability and performance. _Why: Sync every 1 second._
- **Aof Fsync No** — when fsync_policy eq "no", then fastest but least durable; data loss possible on crash. _Why: OS decides when to sync._
- **Aof Rewrite** — when BGREWRITEAOF command; no_rewrite_in_progress eq true, then background rewrite process started. _Why: Compact AOF by rewriting._
- **Aof Rewrite Complete** — when aof_rewrite_succeeds eq true, then AOF compacted; future appends continue on new AOF.
- **Recovery Rdb Only** — when persistence_mode eq "rdb_only"; server startup, then database loaded from RDB; commands after snapshot lost. _Why: Recover from RDB snapshot._
- **Recovery Aof Only** — when persistence_mode eq "aof_only", then database recovered to exact state before crash. _Why: Recover from AOF by replaying._
- **Recovery Rdb And Aof** — when persistence_mode eq "rdb_and_aof", then fast load (RDB) with exact state (AOF replay). _Why: Recover RDB then replay AOF._
- **Recovery Aof Truncated** — when aof_last_command_incomplete eq true, then incomplete command skipped; recovery continues with earlier commands. _Why: AOF has incomplete last command._
- **Backup Via Rdb** — when strategy eq "snapshot-based", then small backup files; fast restore; acceptable data loss window. _Why: Use RDB for backup._
- **Backup Via Replication** — when strategy eq "replica-based", then replicas take RDB snapshots while staying up-to-date. _Why: Replica holds backup snapshots._
- **Backup Hybrid** — when persistence_mode eq "rdb_and_aof", then maximum durability; largest disk footprint. _Why: RDB + AOF for maximum safety._

**❌ Failure paths**

- **Rdb Save Failed** — when rdb_save_fails eq true; failure_reason exists, then save aborted; existing snapshot unchanged; server continues. *(error: `BGSAVE_FAILED`)*
- **Aof Rewrite Failed** — when aof_rewrite_fails exists, then rewrite aborted; old AOF continues. *(error: `BGREWRITEAOF_FAILED`)*
- **Recovery Aof Corruption** — when aof_corrupted_mid_command eq true, then admin must use redis-check-aof tool to fix; recovery manual. *(error: `CORRUPTED_AOF`)*

## Errors it can return

- `BGSAVE_FAILED` — Background save failed
- `BGREWRITEAOF_FAILED` — Background AOF rewrite failed
- `CORRUPTED_AOF` — The AOF file is corrupted

## Events

**`rdb.save_started`**

**`rdb.bgsave_started`**

**`rdb.save_complete`**

**`rdb.save_failed`**

**`rdb.lastsave_queried`**

**`aof.command_logged`**

**`aof.fsync`**

**`aof.periodic_fsync`**

**`aof.os_fsync`**

**`aof.rewrite_started`**

**`aof.rewrite_complete`**

**`aof.rewrite_failed`**

**`persistence.recovery_rdb`**

**`persistence.recovery_aof`**

**`persistence.recovery_hybrid`**

**`persistence.aof_truncated`**

**`persistence.aof_corrupt`**

**`persistence.backup_rdb`**

**`persistence.backup_replica`**

**`persistence.backup_hybrid`**

## Connects to

- **master-replica-replication** *(optional)* — Replicas can hold backup snapshots
- **key-expiration** *(optional)* — Expired keys may or may not be persisted

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (9) → rules.general
- `T3` **auto-field-labels** — added labels to 6 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/database-persistence/) · **Spec source:** [`database-persistence.blueprint.yaml`](./database-persistence.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
