---
title: "Fund Creation Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "CFA-driven fund setup from mandate through IPS, benchmark, Reg 28 flag, custodian registration, seed capital, and go-live. 9 fields. 6 outcomes. 3 error codes. "
---

# Fund Creation Lifecycle Blueprint

> CFA-driven fund setup from mandate through IPS, benchmark, Reg 28 flag, custodian registration, seed capital, and go-live

| | |
|---|---|
| **Feature** | `fund-creation-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fund-setup, mandate, ips, benchmark, custodian, lifecycle, cfa |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/fund-creation-lifecycle.blueprint.yaml) |
| **JSON API** | [fund-creation-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/fund-creation-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cfa` | Chartered Financial Analyst | human | Defines mandate, selects benchmark, authors IPS |
| `compliance_officer` | Compliance Officer | human | Approves IPS and ensures Reg 28 applicability |
| `custodian` | Custodian Bank | external | Holds fund assets and provides statements |
| `fund_admin` | Fund Administrator | human | Handles custodian registration and seed capital |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fund_id` | text | Yes | Fund Identifier |  |
| `fund_name` | text | Yes | Fund Name |  |
| `mandate` | rich_text | Yes | Investment Mandate |  |
| `ips_document` | file | No | IPS Document |  |
| `benchmark` | text | Yes | Benchmark Index |  |
| `reg28_flag` | boolean | Yes | Regulation 28 Fund |  |
| `custodian_id` | text | No | Custodian Identifier |  |
| `seed_capital` | number | No | Seed Capital (ZAR) |  |
| `status` | select | Yes | Fund Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `mandate_defined` |  |  |
| `ips_approved` |  |  |
| `custodian_registered` |  |  |
| `seeded` |  |  |
| `live` |  | Yes |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `mandate_defined` | cfa |  |
|  | `mandate_defined` | `ips_approved` | compliance_officer |  |
|  | `ips_approved` | `custodian_registered` | fund_admin |  |
|  | `custodian_registered` | `seeded` | fund_admin |  |
|  | `seeded` | `live` | compliance_officer |  |
|  | `live` | `closed` | compliance_officer |  |

## Rules

- **mandate_definition:**
  - **description:** MUST: Mandate captures investment universe, benchmark, return target, risk limits, liquidity, and exclusions
  - **required_sections:** universe, benchmark, return_target, risk_limits, liquidity, exclusions
- **ips_content:**
  - **description:** MUST: IPS documents goals, constraints, time horizon, rebalancing policy, reporting cadence. Approved by compliance before next stage.
  - **approver:** compliance_officer
- **reg28:**
  - **description:** MUST: If reg28_flag is true, apply Regulation 28 limits from day one; verify at each lifecycle step
- **custodian:**
  - **description:** MUST: Custodian registration requires signed agreement, account numbers, SWIFT details, and reconciliation contact
- **seed_capital:**
  - **description:** MUST: Fund cannot go live without verified seed capital in the custodian account
  - **minimum_zar:** 1000000
- **separation_of_duties:**
  - **description:** MUST: CFA defines mandate; compliance approves IPS; fund admin handles custodian; no single actor covers all stages

## Flows

### Happy_path

## Outcomes

### Mandate_rejected (Priority: 2) — Error: `FUND_MANDATE_REJECTED`

_Mandate missing required sections or violates internal policy_

**Given:**
- any required mandate section is missing

**Then:**
- **emit_event** event: `fund.mandate_rejected`

**Result:** Mandate returned to CFA for revision

### Custodian_rejection (Priority: 2) — Error: `FUND_CUSTODIAN_REJECTED`

_Custodian declined to register the fund_

**Given:**
- custodian returned a registration rejection

**Then:**
- **emit_event** event: `fund.custodian_rejected`

**Result:** Registration blocked pending remediation

### Fund_created_successfully (Priority: 10) | Transaction: atomic

_A new fund was initialized in draft state with a defined mandate_

**Given:**
- `fund_name` (input) exists
- `mandate` (input) exists

**Then:**
- **create_record** target: `funds`
- **emit_event** event: `fund.created`

**Result:** Fund record created in draft state

### Mandate_approved (Priority: 10)

_Mandate meets required sections and is approved_

**Given:**
- mandate contains universe, benchmark, return target, risk limits

**Then:**
- **transition_state** field: `status` from: `draft` to: `mandate_defined`
- **emit_event** event: `fund.mandate_approved`

**Result:** Mandate finalized

### Ips_approved (Priority: 10)

_IPS reviewed and approved by compliance_

**Given:**
- compliance_officer has signed off IPS

**Then:**
- **transition_state** field: `status` from: `mandate_defined` to: `ips_approved`
- **emit_event** event: `fund.ips_approved`

**Result:** IPS accepted

### Fund_launched (Priority: 10) | Transaction: atomic

_Fund is live and accepting allocations_

**Given:**
- seed capital has been verified in the custodian account
- compliance sign-off recorded

**Then:**
- **transition_state** field: `status` from: `seeded` to: `live`
- **emit_event** event: `fund.launched`

**Result:** Fund is live

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FUND_MANDATE_REJECTED` | 422 | Fund mandate is incomplete or violates policy. | No |
| `FUND_CUSTODIAN_REJECTED` | 409 | Custodian registration was rejected. | Yes |
| `FUND_NOT_FOUND` | 404 | Fund not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fund.created` | Fund initialized in draft | `fund_id`, `fund_name` |
| `fund.mandate_approved` | Mandate finalized | `fund_id` |
| `fund.ips_approved` | IPS approved by compliance | `fund_id` |
| `fund.launched` | Fund live | `fund_id`, `seed_capital` |
| `fund.mandate_rejected` | Mandate missing required sections | `fund_id`, `missing_sections` |
| `fund.custodian_rejected` | Custodian registration rejected | `fund_id`, `custodian_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| regulation-28-compliance | required | Reg 28 funds must satisfy prudential limits from day one |
| client-risk-profiling-ips | recommended | Client IPS informs fund mandate |
| fund-custodian-reconciliation | required | Custodian recon starts once the fund is registered |
| immutable-audit-log | required | All lifecycle transitions must be audited |

## AGI Readiness

### Goals

#### Compliant Fund Launch

Launch new funds with documented mandate, approved IPS, registered custodian, and verified seed capital

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| time_to_live_days | < 30 days | Median days from draft to live |
| rework_rate | < 20% | Percentage of funds that return to prior state |

**Constraints:**

- **regulatory** (non-negotiable): Compliance approval is mandatory; cannot be automated away
- **security** (non-negotiable): Separation of duties across CFA, compliance, and fund admin

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- mandate approval
- ips approval
- go-live

**Escalation Triggers:**

- `custodian_rejection`
- `mandate_rejected`

### Verification

**Invariants:**

- fund cannot be live without verified seed capital
- IPS approval precedes custodian registration
- Reg 28 funds have reg28_flag = true from creation

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| fund_created_successfully | `autonomous` | - | - |
| mandate_approved | `human_required` | - | - |
| ips_approved | `human_required` | - | - |
| fund_launched | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fund Creation Lifecycle Blueprint",
  "description": "CFA-driven fund setup from mandate through IPS, benchmark, Reg 28 flag, custodian registration, seed capital, and go-live. 9 fields. 6 outcomes. 3 error codes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fund-setup, mandate, ips, benchmark, custodian, lifecycle, cfa"
}
</script>
