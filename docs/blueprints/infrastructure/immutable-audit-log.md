---
title: "Immutable Audit Log Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Append-only, hash-chained audit log capturing every state-changing action for regulatory defensibility and forensic investigation. 13 fields. 6 outcomes. 4 erro"
---

# Immutable Audit Log Blueprint

> Append-only, hash-chained audit log capturing every state-changing action for regulatory defensibility and forensic investigation

| | |
|---|---|
| **Feature** | `immutable-audit-log` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | audit, compliance, hash-chain, tamper-evident, regulatory, immutable |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/immutable-audit-log.blueprint.yaml) |
| **JSON API** | [immutable-audit-log.json]({{ site.baseurl }}/api/blueprints/infrastructure/immutable-audit-log.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entry_id` | text | Yes | Entry ID |  |
| `actor_id` | text | Yes | Actor Identifier |  |
| `actor_type` | select | Yes | Actor Type |  |
| `action` | text | Yes | Action Name |  |
| `entity_type` | text | Yes | Entity Type |  |
| `entity_id` | text | Yes | Entity ID |  |
| `before_state` | json | No | Before State |  |
| `after_state` | json | No | After State |  |
| `metadata` | json | No | Metadata |  |
| `ip_address` | text | No | IP Address |  |
| `occurred_at` | datetime | Yes | Occurred At |  |
| `prev_hash` | text | Yes | Previous Entry Hash |  |
| `entry_hash` | text | Yes | Entry Hash |  |

## Rules

- **append_only:**
  - **description:** MUST: No UPDATE or DELETE permitted on audit entries via any code path. Enforced at DB permission level (REVOKE UPDATE, DELETE from application role).
  - **enforcement:** database_grant
  - **exception_policy:** none
- **hash_chain:**
  - **algorithm:** sha256
  - **chain_formula:** entry_hash = sha256(entry_id || actor_id || action || entity_type || entity_id || occurred_at || prev_hash || canonical_json(before_state) || canonical_json(after_state))
  - **genesis_hash_description:** First entry in chain uses a genesis hash of 64 zero hex characters as prev_hash
  - **json_canonicalization:** rfc8785
- **retention:**
  - **minimum_years:** 5
  - **deletion_policy:** never_before_retention
  - **archive_after_years:** 2
- **integrity_verification:**
  - **scan_cadence:** daily
  - **alert_channel:** security_ops
  - **block_reads_on_failure:** false
- **privacy:**
  - **pii_handling:** MUST: Before/after payloads containing PII are encrypted with envelope encryption; the hash is computed over plaintext then payload is sealed at rest
  - **right_to_erasure:** MUST: POPIA right-to-erasure against a data subject erases only the PII envelope contents (cryptographic shredding of per-record key); the hash chain remains intact to preserve audit integrity
  - **access_logging:** SHOULD: Every read of the audit log is itself logged
- **access_control:**
  - **write:** service_accounts_only
  - **read:** auditor_role_required

## Outcomes

### Chain_mismatch (Priority: 1) — Error: `AUDIT_CHAIN_BROKEN`

_Concurrent-append race or tamper attempt — provided prev_hash doesn't match the current chain tip_

**Given:**
- prev_hash does not match current chain tip (concurrent append race or tamper attempt)

**Then:**
- **emit_event** event: `audit.chain_mismatch`

**Result:** Append rejected; caller must retry with current chain tip. If mismatch persists outside of normal concurrency, triggers security alert.

### Integrity_scan_failed (Priority: 1) — Error: `AUDIT_INTEGRITY_VIOLATION`

_Daily verification recomputed an entry hash and it no longer matches — evidence of tampering or storage corruption_

**Given:**
- daily integrity scan detected an entry whose stored entry_hash does not match a recomputed hash

**Then:**
- **notify** target: `security_ops` — Security alert with affected entry_id range
- **emit_event** event: `audit.integrity_violation_detected`

**Result:** Alert raised; forensic investigation initiated. Audit log remains readable but chain is flagged.

### Unauthorized_read (Priority: 2) — Error: `AUDIT_READ_FORBIDDEN`

_Caller lacks auditor/compliance role — deny and log the denied attempt_

**Given:**
- caller lacks auditor or compliance role

**Result:** 403 returned; read attempt itself is audited

### Unauthorized_write (Priority: 2) — Error: `AUDIT_WRITE_FORBIDDEN`

_Caller is not a whitelisted service account — only backend services may append entries_

**Given:**
- caller is not a whitelisted service account

**Result:** 403 returned; write attempt itself is audited

### Successful_append (Priority: 10) | Transaction: atomic

_Happy-path append: caller is authorized, chain tip is fresh, entry hashes and persists atomically_

**Given:**
- actor is authenticated
- `action` (input) exists
- `entity_id` (input) exists
- prev_hash matches the most recent entry_hash (or genesis_hash if chain is empty)

**Then:**
- **create_record** target: `audit_log` — Append the entry with computed entry_hash
- **emit_event** event: `audit.entry_appended`

**Result:** Entry persisted; chain extended by one link

### Query_served (Priority: 10)

_Authorized auditor runs a filtered read; the read itself is logged for meta-audit_

**Given:**
- caller has auditor role or equivalent compliance permission
- `filter` (input) exists

**Then:**
- **emit_event** event: `audit.query_executed`

**Result:** Filtered, paginated audit entries returned with their entry_hash values for independent verification

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AUDIT_CHAIN_BROKEN` | 409 | Audit log chain tip has advanced. Please retry. | Yes |
| `AUDIT_INTEGRITY_VIOLATION` | 500 | Audit log integrity check failed. Security team has been notified. | No |
| `AUDIT_READ_FORBIDDEN` | 403 | You do not have permission to read the audit log. | No |
| `AUDIT_WRITE_FORBIDDEN` | 403 | Only authorized services may write to the audit log. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `audit.entry_appended` | A new audit entry was appended to the hash-chained log | `entry_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `entry_hash` |
| `audit.chain_mismatch` | A write attempt referenced a stale chain tip | `expected_prev_hash`, `provided_prev_hash`, `entry_id` |
| `audit.integrity_violation_detected` | Integrity scan found an entry whose hash does not match | `first_bad_entry_id`, `scan_timestamp` |
| `audit.query_executed` | An auditor queried the log | `caller_id`, `filter`, `result_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Audit entries containing PII must satisfy POPIA minimization, retention, and right-to-erasure obligations |
| database-persistence | required | Append-only storage and DB-level REVOKE grants are implemented in the persistence layer |
| rate-limiting-abuse-prevention | recommended | Audit log query endpoints should be rate-limited to prevent auditor-credential abuse |

## AGI Readiness

### Goals

#### Tamper Evident Audit Trail

Maintain a cryptographically verifiable record of every state change for regulatory defensibility and forensic investigation

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| integrity_scan_pass_rate | = 100% | Percentage of daily integrity scans that verify the entire chain without mismatch |
| append_latency_p99 | < 50ms | 99th percentile time from action to durable audit entry |

**Constraints:**

- **security** (non-negotiable): No code path may UPDATE or DELETE audit entries
- **regulatory** (non-negotiable): PII in payloads must be encrypted; right-to-erasure applied via cryptographic shredding only

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- on integrity violation detection — requires human forensic review before declaring benign

**Escalation Triggers:**

- `chain_mismatch_rate_per_minute > 0.1`
- `integrity_scan_failed == true`

### Verification

**Invariants:**

- for every entry e_n where n > 0: sha256(canonical(e_n)) == e_n.entry_hash
- for every entry e_n where n > 0: e_n.prev_hash == e_{n-1}.entry_hash
- audit entries are never modified after creation
- PII fields are never logged in plaintext outside the encrypted payload

### Coordination

**Protocol:** `pub_sub`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| successful_append | `autonomous` | - | - |
| query_served | `autonomous` | - | - |
| integrity_scan_failed | `human_required` | - | - |
| chain_mismatch | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Immutable Audit Log Blueprint",
  "description": "Append-only, hash-chained audit log capturing every state-changing action for regulatory defensibility and forensic investigation. 13 fields. 6 outcomes. 4 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "audit, compliance, hash-chain, tamper-evident, regulatory, immutable"
}
</script>
