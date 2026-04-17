---
title: "Regulation 28 Compliance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Prudential investment-limit compliance monitoring for SA retirement funds under Pension Funds Act Regulation 28.. 8 fields. 8 outcomes. 7 error codes. rules: re"
---

# Regulation 28 Compliance Blueprint

> Prudential investment-limit compliance monitoring for SA retirement funds under Pension Funds Act Regulation 28.

| | |
|---|---|
| **Feature** | `regulation-28-compliance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | compliance, regulatory, south-africa, pension-funds, investment-limits, fsca, popia, regulation-28 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regulation-28-compliance.blueprint.yaml) |
| **JSON API** | [regulation-28-compliance.json]({{ site.baseurl }}/api/blueprints/trading/regulation-28-compliance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `principal_officer` | Principal Officer | human | Accountable for fund operations and regulatory compliance under s.8 of the Pension Funds Act. |
| `board_of_trustees` | Board of Trustees | human | Fiduciary oversight; approves IPS, breach remediation, and ESG policy. |
| `fund_administrator` | Fund Administrator | human | Maintains holdings data, runs daily compliance checks, prepares returns. |
| `investment_manager` | Investment Manager | external | Manages assets within mandate; must operate within Reg 28 limits. |
| `fsca` | Financial Sector Conduct Authority | external | Regulator; receives Form 28 submissions and breach notifications. |
| `compliance_engine` | Reg 28 Compliance Engine | system | Computes limits, detects breaches, generates audit logs and returns. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fund_id` | text | Yes | Retirement Fund ID | Validations: pattern |
| `reporting_date` | date | Yes | Valuation / Reporting Date |  |
| `total_fund_value` | number | Yes | Total Fair Value of Fund Assets (ZAR) | Validations: min |
| `holdings` | json | Yes | Holdings Snapshot |  |
| `reporting_period` | select | Yes | Reporting Period |  |
| `breach_type` | select | No | Breach Type (if any) |  |
| `remediation_plan_id` | text | No | Remediation Plan Reference |  |
| `esg_assessment` | rich_text | Yes | ESG / Sustainability Assessment |  |

## States

**State field:** `compliance_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `compliant` |  |  |
| `active_breach` |  |  |
| `passive_breach` |  |  |
| `concentration_breach` |  |  |
| `remediation_in_progress` |  |  |
| `remediated` |  | Yes |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `compliant` | compliance_engine | all limits within caps |
|  | `pending` | `active_breach` | compliance_engine | trustee-initiated breach detected |
|  | `pending` | `passive_breach` | compliance_engine | market-movement breach detected |
|  | `pending` | `concentration_breach` | compliance_engine | issuer limit exceeded |
|  | `pending` | `rejected` | compliance_engine | reconciliation or look-through failure |
|  | `active_breach` | `remediation_in_progress` | board_of_trustees | remediation plan approved |
|  | `passive_breach` | `remediation_in_progress` | board_of_trustees | remediation plan approved |
|  | `concentration_breach` | `remediation_in_progress` | board_of_trustees | remediation plan approved |
|  | `remediation_in_progress` | `remediated` | compliance_engine | exposures back within caps for two consecutive valuation dates |

## Rules

- **regulatory:** MUST: Apply asset-class fair-value caps measured after look-through into collective investment schemes, pooled vehicles, and linked-policy wrappers., MUST: Cap equity exposure at 75% of total fund value (listed + unlisted combined)., MUST: Cap immovable property exposure at 25% of total fund value., MUST: Cap foreign (offshore) asset exposure at 45% of total fund value, per National Treasury and FSCA direction., MUST: Cap African assets outside South Africa at 10% of total fund value, included within the 45% offshore limit., MUST: Cap hedge-fund exposure at 10% of total fund value., MUST: Cap private-equity exposure at 15% of total fund value., MUST: Cap commodities (including gold) at 10% of total fund value., MUST: Prohibit direct investment in crypto assets (0% cap) per FSCA guidance under Regulation 28., MUST: Enforce issuer concentration limits — max 5% per unlisted issuer, 10% per listed non-SOE issuer, 15% for SOE issuers, 25% for South African government debt per instrument category., MUST: Enforce bank-deposit limits — max 25% per top-four bank, 10% per other bank, per deposit-taking counterparty., MUST: Review the Investment Policy Statement at least annually and document how Reg 28 compliance is monitored., MUST: Document sustainability (ESG) considerations in every material investment decision per reg 28(2)(c)(ix)., MUST: Report breaches to the FSCA and the fund's board of trustees per FSCA-prescribed template and timeline., SHOULD: Distinguish active from passive breaches — remediation urgency differs., SHOULD: Apply the prudent person principle — investments must be liquid enough to meet benefit obligations., SHOULD: Monitor compliance continuously; do not rely on quarter-end snapshots alone., MAY: Apply stricter internal limits than Reg 28 minimums where trustees deem prudent.
- **security:** MUST: Restrict write access to holdings data to authorised fund administrators and principal officers only., MUST: Log every limit calculation, breach determination, and FSCA submission to an immutable audit trail., MUST: Treat member-level information as personal information under POPIA — regulatory returns are fund-level only, never per-member., MUST: Encrypt holdings and valuation data at rest and in transit (TLS 1.2+ minimum)., SHOULD: Require dual-control (maker-checker) for breach remediation approvals and FSCA submissions., SHOULD: Sign FSCA submissions with the fund's digital certificate.
- **data_integrity:** MUST: Reject holdings snapshots whose constituent fair values do not reconcile to total_fund_value within 0.01% tolerance., MUST: Apply look-through valuation to all pooled vehicles — no opaque CIS allocation may count toward limit calculation., MUST: Use fair value (IFRS 13) — reject cost-basis valuations for Reg 28 reporting., SHOULD: Version every holdings snapshot so historical compliance can be re-computed.

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| active_breach_notification | 48h | principal_officer notifies FSCA within FSCA-prescribed window |
| quarterly_report_submission | 30d | late submission triggers FSCA enforcement |
| breach_remediation | 12m | prolonged breach escalated to FSCA for directive |

## Flows

### Daily_compliance_check

Daily look-through compliance computation for a fund.

1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**

### Quarterly_fsca_return

Prepare and submit Form 28 to the FSCA.

1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**

### Breach_remediation

Close out a Reg 28 breach.

1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**
1. **undefined**

## Outcomes

### Reconciliation_failure (Priority: 1) — Error: `REG28_RECONCILIATION_FAILED`

_Rejects snapshots whose fair values do not reconcile to total fund value._

**Given:**
- `reconciliation_variance_pct` (computed) gt `0.01`

**Then:**
- **emit_event** event: `reg28.snapshot.rejected`

**Result:** Snapshot rejected; correct holdings data before re-running compliance.

### Active_breach_detected (Priority: 2) — Error: `REG28_ACTIVE_BREACH` | Transaction: atomic

_Fund-initiated breach of a prudential limit — highest remediation urgency._

**Given:**
- `breach_type` (computed) eq `active`
- ANY: `equity_pct` (computed) gt `75` OR `property_pct` (computed) gt `25` OR `foreign_pct` (computed) gt `45` OR `africa_ex_sa_pct` (computed) gt `10` OR `hedge_fund_pct` (computed) gt `10` OR `private_equity_pct` (computed) gt `15` OR `crypto_pct` (computed) gt `0`

**Then:**
- **set_field** target: `compliance_status` value: `active_breach`
- **emit_event** event: `reg28.breach.active`
- **notify** target: `principal_officer`
- **notify** target: `board_of_trustees`
- **notify** target: `fsca`
- **create_record** target: `breach_register`

**Result:** Active breach flagged; remediation plan required within FSCA-prescribed timeline.

### Passive_breach_detected (Priority: 3) — Error: `REG28_PASSIVE_BREACH`

_Market-driven breach — remediation allowed within reasonable period._

**Given:**
- `breach_type` (computed) eq `passive`

**Then:**
- **set_field** target: `compliance_status` value: `passive_breach`
- **emit_event** event: `reg28.breach.passive`
- **notify** target: `principal_officer`
- **create_record** target: `breach_register`

**Result:** Passive breach logged; remediation plan must bring exposure within cap within a reasonable period.

### Issuer_concentration_breach (Priority: 4) — Error: `REG28_ISSUER_CONCENTRATION`

_Single-issuer or counterparty limit exceeded._

**Given:**
- `issuer_concentration_breach` (computed) eq `true`

**Then:**
- **set_field** target: `compliance_status` value: `concentration_breach`
- **emit_event** event: `reg28.breach.concentration`
- **notify** target: `principal_officer`
- **create_record** target: `breach_register`

**Result:** Issuer/counterparty limit exceeded; concentration risk flagged for remediation.

### Look_through_unavailable (Priority: 5) — Error: `REG28_LOOK_THROUGH_MISSING`

_Opaque pooled vehicles prevent accurate limit computation._

**Given:**
- `opaque_holdings_count` (computed) gt `0`

**Then:**
- **emit_event** event: `reg28.lookthrough.missing`

**Result:** Look-through data missing; compliance cannot be computed until resolved.

### Compliant_snapshot (Priority: 10)

_Fund satisfies all Reg 28 caps for the reporting date; recorded for audit._

**Given:**
- fund holdings snapshot is complete
- all asset-class exposures are within prescribed caps after look-through
- all issuer concentration limits are within prescribed caps
- holdings fair values reconcile to total_fund_value
- ESG assessment is present and non-empty

**Then:**
- **set_field** target: `compliance_status` value: `compliant`
- **emit_event** event: `reg28.snapshot.compliant`
- **create_record** target: `compliance_audit_log`

**Result:** Fund is Reg 28 compliant for the reporting date; snapshot recorded to audit trail.

### Remediation_plan_approved (Priority: 15)

_Board has approved a breach remediation plan; execution tracked to closure._

**Given:**
- a breach is in open state
- remediation plan has been tabled to the board of trustees
- board has approved the plan

**Then:**
- **set_field** target: `breach_status` value: `remediation_in_progress`
- **emit_event** event: `reg28.remediation.approved`

**Result:** Remediation plan recorded; execution tracked until breach resolved.

### Quarterly_report_filed (Priority: 20)

_Form 28 filed with FSCA for the quarter._

**Given:**
- `reporting_period` (input) eq `quarterly`
- compliance snapshot is in compliant or remediated state

**Then:**
- **call_service** target: `fsca_submission_service`
- **emit_event** event: `reg28.report.filed`
- **create_record** target: `fsca_submission_log`

**Result:** Form 28 filed with FSCA; submission reference captured for audit.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REG28_ACTIVE_BREACH` | 409 | The fund has breached a Regulation 28 prudential limit. Remediation required. | No |
| `REG28_PASSIVE_BREACH` | 409 | A Regulation 28 limit has been exceeded due to market movement. Remediation plan required. | No |
| `REG28_ISSUER_CONCENTRATION` | 409 | Issuer or counterparty concentration limit exceeded. | No |
| `REG28_RECONCILIATION_FAILED` | 422 | Holdings do not reconcile to total fund value; snapshot rejected. | No |
| `REG28_LOOK_THROUGH_MISSING` | 422 | Look-through data missing for one or more pooled vehicles. | No |
| `REG28_UNAUTHORISED` | 403 | Caller is not authorised to submit or view Reg 28 data for this fund. | No |
| `REG28_SUBMISSION_FAILED` | 503 | FSCA submission service is unavailable; please retry. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `reg28.snapshot_compliant` | A valuation snapshot satisfies all limits. | `fund_id`, `reporting_date`, `total_fund_value` |
| `reg28.snapshot_rejected` | A snapshot failed reconciliation or look-through. | `fund_id`, `reporting_date`, `reason` |
| `reg28.breach_active` | A trustee/fund-initiated breach was detected. | `fund_id`, `reporting_date`, `breached_limit`, `exposure_pct`, `cap_pct` |
| `reg28.breach_passive` | A market-driven breach was detected. | `fund_id`, `reporting_date`, `breached_limit`, `exposure_pct`, `cap_pct`, `cause` |
| `reg28.breach_concentration` | An issuer/counterparty concentration limit was exceeded. | `fund_id`, `reporting_date`, `issuer_id`, `exposure_pct`, `cap_pct` |
| `reg28.lookthrough_missing` | Look-through data missing for one or more pooled vehicles. | `fund_id`, `reporting_date`, `opaque_holdings` |
| `reg28.report_filed` | Quarterly Form 28 was submitted to FSCA. | `fund_id`, `reporting_date`, `submission_reference` |
| `reg28.remediation_approved` | Board approved a breach remediation plan. | `fund_id`, `breach_id`, `remediation_plan_id`, `target_resolution_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Member and beneficiary data processed by the fund is personal information under POPIA. |
| broker-portfolio-management | recommended | Portfolio valuation data feeds the Reg 28 compliance engine. |
| bond-pricing-models | recommended | Fair-value pricing for fixed-income instruments used in limit calculations. |
| data-retention-policies | recommended | Audit logs and compliance snapshots have statutory retention requirements. |
| document-management | optional | Storage of IPS, board minutes, remediation plans, and FSCA submission proofs. |

## AGI Readiness

### Goals

#### Ensure Continuous Compliance

Continuously ensure the fund's portfolio satisfies Regulation 28 prudential limits.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| undetected_active_breaches | 0 | Count of active breaches discovered outside the compliance engine per quarter. |
| on_time_fsca_submissions | 100% | Percentage of quarterly Form 28 filings submitted before FSCA deadline. |
| mean_time_to_detect_passive_breach | < 24h | Hours between market-movement breach and engine flag. |

**Constraints:**

- **regulatory** (non-negotiable): All determinations must comply with Pension Funds Act s.36 and Reg 28 as amended.
- **security** (non-negotiable): Member personal information must never leave POPIA-compliant processing boundary.

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- Board approval of the Investment Policy Statement and any material change thereto.
- Board approval of every breach remediation plan.
- Principal officer sign-off on every Form 28 submission.
- Trustee review of the ESG / sustainability narrative at least annually.

**Escalation Triggers:**

- `active_breach_detected == true`
- `concentration_breach_detected == true`
- `reconciliation_variance_pct > 0.01`

### Coordination

**Protocol:** `pub_sub`

**Exposes:**

| Capability | Contract |
|------------|----------|
| `reg28_compliance_check` | Accepts a holdings snapshot; returns compliance_status and breach list. |
| `reg28_quarterly_return` | Accepts a locked snapshot; returns FSCA submission reference. |

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `portfolio_valuation` | broker-portfolio-management | fail |
| `fixed_income_pricing` | bond-pricing-models | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_exposures | `autonomous` | - | - |
| flag_breach | `autonomous` | - | - |
| draft_remediation_plan | `supervised` | - | - |
| submit_fsca_return | `human_required` | - | - |
| execute_rebalancing_trades | `human_required` | - | - |
| amend_investment_policy_statement | `human_required` | - | - |
| reclassify_holding | `human_required` | - | - |
| suppress_breach | `human_required` | - | - |

### Explainability

**Log Decisions:** Yes

**Reasoning Depth:** `full`

**Audit Events:**

| Decision | Must Log |
|----------|----------|
| breach_classification | `fund_id`, `reporting_date`, `breached_limit`, `exposure_pct`, `cap_pct`, `classification`, `inputs_hash` |
| fsca_submission | `fund_id`, `reporting_date`, `submission_reference`, `signer`, `timestamp` |
| remediation_approval | `fund_id`, `breach_id`, `plan_id`, `approver`, `target_resolution_date` |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: dashboard
primary_views:
  - Compliance dashboard showing asset-class caps as bar charts with current
    exposure vs limit.
  - Issuer concentration heatmap highlighting counterparties near or above caps.
  - Breach register with status, age, and remediation progress.
  - Quarterly return preview with maker-checker sign-off panel.
accessibility:
  - All charts must have tabular fallback views for screen-reader users.
  - Colour-blind-safe palette for cap-status indicators (do not rely on
    red/green alone).
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regulation 28 Compliance Blueprint",
  "description": "Prudential investment-limit compliance monitoring for SA retirement funds under Pension Funds Act Regulation 28.. 8 fields. 8 outcomes. 7 error codes. rules: re",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "compliance, regulatory, south-africa, pension-funds, investment-limits, fsca, popia, regulation-28"
}
</script>
