---
title: "Fund Custodian Reconciliation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Daily reconciliation of positions, cash, and trades against custodian statements with break detection and escalation. 10 fields. 5 outcomes. 3 error codes. rule"
---

# Fund Custodian Reconciliation Blueprint

> Daily reconciliation of positions, cash, and trades against custodian statements with break detection and escalation

| | |
|---|---|
| **Feature** | `fund-custodian-reconciliation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | reconciliation, custodian, breaks, positions, cash, daily-recon |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fund-custodian-reconciliation.blueprint.yaml) |
| **JSON API** | [fund-custodian-reconciliation.json]({{ site.baseurl }}/api/blueprints/trading/fund-custodian-reconciliation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `recon_id` | text | Yes | Reconciliation Identifier |  |
| `recon_date` | date | Yes | Reconciliation Date |  |
| `fund_id` | text | Yes | Fund Identifier |  |
| `our_positions` | json | Yes | Internal Positions |  |
| `custodian_positions` | json | Yes | Custodian Positions |  |
| `our_cash` | number | Yes | Internal Cash Balance |  |
| `custodian_cash` | number | Yes | Custodian Cash Balance |  |
| `breaks` | json | No | Break Details |  |
| `nav_zar` | number | Yes | NAV (ZAR) |  |
| `status` | select | Yes | Recon Status |  |

## Rules

- **cadence:**
  - **description:** MUST: Reconciliation runs every business day by 10:00 SAST against prior day's custodian statement
  - **time_sast:** 10:00
- **matching:**
  - **description:** MUST: Three-way match: internal positions, internal cash, and trade register against custodian statement
  - **dimensions:** positions, cash, trades
- **break_threshold:**
  - **description:** MUST: Any mismatch greater than 0.01% of NAV is a break; below threshold is rounding
  - **threshold_pct_of_nav:** 0.01
- **auto_resolve:**
  - **description:** MAY: Apply rule-based auto-resolution for known patterns (FX rounding, corporate actions in flight)
  - **rules_versioned:** true
- **escalation:**
  - **description:** MUST: Breaks unresolved after 24 hours escalate to head of operations; regulator thresholds in 48h
  - **ttl_hours:** 24
- **statement_ingestion:**
  - **description:** MUST: Support SWIFT MT535/MT940 and CSV statements; checksum verified on ingest
  - **formats:** mt535, mt940, csv
- **audit:**
  - **description:** MUST: Every break and its resolution captured with evidence; retained 7 years

## Outcomes

### Statement_not_received (Priority: 1) — Error: `RECON_STATEMENT_MISSING`

_Custodian statement not received by cutoff_

**Given:**
- custodian statement not ingested by cutoff time

**Then:**
- **notify** target: `custodian_liaison`
- **emit_event** event: `recon.statement_missing`

**Result:** Ops chases custodian; recon pending

### Break_escalated (Priority: 2) — Error: `RECON_BREAK_ESCALATED`

_Break unresolved beyond TTL; escalated_

**Given:**
- break age exceeds TTL

**Then:**
- **notify** target: `head_of_operations`
- **transition_state** field: `status` from: `breaks_detected` to: `escalated`
- **emit_event** event: `recon.break_escalated`

**Result:** Escalation ticket opened

### Break_detected (Priority: 3)

_One or more breaks exceed threshold_

**Given:**
- at least one delta exceeds break threshold

**Then:**
- **transition_state** field: `status` from: `pending` to: `breaks_detected`
- **emit_event** event: `recon.break_detected`

**Result:** Breaks logged; resolution workflow begins

### Break_auto_resolved (Priority: 5)

_Known-pattern break matched an auto-resolution rule_

**Given:**
- break matches an auto-resolution rule

**Then:**
- **emit_event** event: `recon.break_auto_resolved`

**Result:** Break marked resolved with rule evidence

### Reconciliation_completed_successfully (Priority: 10) | Transaction: atomic

_All positions, cash, and trades matched within threshold_

**Given:**
- position deltas within threshold
- cash deltas within threshold
- trade register matches statement

**Then:**
- **transition_state** field: `status` from: `pending` to: `matched`
- **emit_event** event: `recon.completed`

**Result:** Recon closed clean

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RECON_BREAK_ESCALATED` | 409 | A reconciliation break required escalation. | No |
| `RECON_STATEMENT_MISSING` | 503 | Custodian statement not received. | Yes |
| `RECON_STATEMENT_INVALID` | 400 | Custodian statement failed validation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `recon.completed` | Recon matched clean | `recon_id`, `fund_id`, `recon_date` |
| `recon.break_detected` | Break detected | `recon_id`, `fund_id`, `break_count` |
| `recon.break_auto_resolved` | Break auto-resolved | `recon_id`, `break_id`, `rule_id` |
| `recon.break_escalated` | Break escalated | `recon_id`, `break_id` |
| `recon.statement_missing` | Statement not received by cutoff | `recon_date`, `fund_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-management-execution | required | Trade register is sourced from OMS fills |
| immutable-audit-log | required | Breaks and resolutions must be auditable |
| observability-metrics | recommended | Break rate and age are operational SLIs |

## AGI Readiness

### Goals

#### Accurate Books

Keep internal books in agreement with custodian within 0.01% of NAV daily

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| clean_recon_rate | >= 95% | Percentage of daily recons completing clean without manual intervention |
| break_resolution_time_p90 | < 24h | 90th percentile time from break detection to resolution |

**Constraints:**

- **regulatory** (non-negotiable): Break evidence retained 7 years

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before closing a break above NAV threshold
- before amending statement data

**Escalation Triggers:**

- `break_escalated`
- `statement_not_received`

### Verification

**Invariants:**

- net mismatch <= break threshold when status = matched
- every break has an owner and age
- statement checksum verified before ingestion

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| reconciliation_completed_successfully | `autonomous` | - | - |
| break_auto_resolved | `supervised` | - | - |
| break_escalated | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fund Custodian Reconciliation Blueprint",
  "description": "Daily reconciliation of positions, cash, and trades against custodian statements with break detection and escalation. 10 fields. 5 outcomes. 3 error codes. rule",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "reconciliation, custodian, breaks, positions, cash, daily-recon"
}
</script>
