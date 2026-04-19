<!-- AUTO-GENERATED FROM immutable-audit-log.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Immutable Audit Log

> Append-only, hash-chained audit log capturing every state-changing action for regulatory defensibility and forensic investigation

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** audit · compliance · hash-chain · tamper-evident · regulatory · immutable

## What this does

Append-only, hash-chained audit log capturing every state-changing action for regulatory defensibility and forensic investigation

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **entry_id** *(text, required)* — Entry ID
- **actor_id** *(text, required)* — Actor Identifier
- **actor_type** *(select, required)* — Actor Type
- **action** *(text, required)* — Action Name
- **entity_type** *(text, required)* — Entity Type
- **entity_id** *(text, required)* — Entity ID
- **before_state** *(json, optional)* — Before State
- **after_state** *(json, optional)* — After State
- **metadata** *(json, optional)* — Metadata
- **ip_address** *(text, optional)* — IP Address
- **occurred_at** *(datetime, required)* — Occurred At
- **prev_hash** *(text, required)* — Previous Entry Hash
- **entry_hash** *(text, required)* — Entry Hash

## What must be true

- **append_only:** MUST: No UPDATE or DELETE permitted on audit entries via any code path. Enforced at DB permission level (REVOKE UPDATE, DELETE from application role).
- **append_only → enforcement:** database_grant
- **append_only → exception_policy:** none
- **hash_chain → algorithm:** sha256
- **hash_chain → chain_formula:** entry_hash = sha256(entry_id || actor_id || action || entity_type || entity_id || occurred_at || prev_hash || canonical_json(before_state) || canonical_json(after_state))
- **hash_chain → genesis_hash_description:** First entry in chain uses a genesis hash of 64 zero hex characters as prev_hash
- **hash_chain → json_canonicalization:** rfc8785
- **retention → minimum_years:** 5
- **retention → deletion_policy:** never_before_retention
- **retention → archive_after_years:** 2
- **integrity_verification → scan_cadence:** daily
- **integrity_verification → alert_channel:** security_ops
- **integrity_verification → block_reads_on_failure:** false
- **privacy → pii_handling:** MUST: Before/after payloads containing PII are encrypted with envelope encryption; the hash is computed over plaintext then payload is sealed at rest
- **privacy → right_to_erasure:** MUST: POPIA right-to-erasure against a data subject erases only the PII envelope contents (cryptographic shredding of per-record key); the hash chain remains intact to preserve audit integrity
- **privacy → access_logging:** SHOULD: Every read of the audit log is itself logged
- **access_control → write:** service_accounts_only
- **access_control → read:** auditor_role_required

## Success & failure scenarios

**✅ Success paths**

- **Successful Append** — when actor is authenticated; action exists; entity_id exists; prev_hash matches the most recent entry_hash (or genesis_hash if chain is empty), then Entry persisted; chain extended by one link. _Why: Happy-path append: caller is authorized, chain tip is fresh, entry hashes and persists atomically._
- **Query Served** — when caller has auditor role or equivalent compliance permission; Filter by actor_id, entity_id, entity_type, action, or date range, then Filtered, paginated audit entries returned with their entry_hash values for independent verification. _Why: Authorized auditor runs a filtered read; the read itself is logged for meta-audit._

**❌ Failure paths**

- **Chain Mismatch** — when prev_hash does not match current chain tip (concurrent append race or tamper attempt), then Append rejected; caller must retry with current chain tip. If mismatch persists outside of normal concurrency, triggers security alert. _Why: Concurrent-append race or tamper attempt — provided prev_hash doesn't match the current chain tip._ *(error: `AUDIT_CHAIN_BROKEN`)*
- **Integrity Scan Failed** — when daily integrity scan detected an entry whose stored entry_hash does not match a recomputed hash, then Alert raised; forensic investigation initiated. Audit log remains readable but chain is flagged. _Why: Daily verification recomputed an entry hash and it no longer matches — evidence of tampering or storage corruption._ *(error: `AUDIT_INTEGRITY_VIOLATION`)*
- **Unauthorized Read** — when caller lacks auditor or compliance role, then 403 returned; read attempt itself is audited. _Why: Caller lacks auditor/compliance role — deny and log the denied attempt._ *(error: `AUDIT_READ_FORBIDDEN`)*
- **Unauthorized Write** — when caller is not a whitelisted service account, then 403 returned; write attempt itself is audited. _Why: Caller is not a whitelisted service account — only backend services may append entries._ *(error: `AUDIT_WRITE_FORBIDDEN`)*

## Errors it can return

- `AUDIT_CHAIN_BROKEN` — Audit log chain tip has advanced. Please retry.
- `AUDIT_INTEGRITY_VIOLATION` — Audit log integrity check failed. Security team has been notified.
- `AUDIT_READ_FORBIDDEN` — You do not have permission to read the audit log.
- `AUDIT_WRITE_FORBIDDEN` — Only authorized services may write to the audit log.

## Events

**`audit.entry_appended`** — A new audit entry was appended to the hash-chained log
  Payload: `entry_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `entry_hash`

**`audit.chain_mismatch`** — A write attempt referenced a stale chain tip
  Payload: `expected_prev_hash`, `provided_prev_hash`, `entry_id`

**`audit.integrity_violation_detected`** — Integrity scan found an entry whose hash does not match
  Payload: `first_bad_entry_id`, `scan_timestamp`

**`audit.query_executed`** — An auditor queried the log
  Payload: `caller_id`, `filter`, `result_count`

## Connects to

- **popia-compliance** *(required)* — Audit entries containing PII must satisfy POPIA minimization, retention, and right-to-erasure obligations
- **database-persistence** *(required)* — Append-only storage and DB-level REVOKE grants are implemented in the persistence layer
- **rate-limiting-abuse-prevention** *(recommended)* — Audit log query endpoints should be rate-limited to prevent auditor-credential abuse

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/immutable-audit-log/) · **Spec source:** [`immutable-audit-log.blueprint.yaml`](./immutable-audit-log.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
