---
title: "Fixed Income Mbs Abs Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse residential and commercial mortgage-backed securities, CMOs, and asset-backed securities including prepayment risk, extension risk, and tranche economic"
---

# Fixed Income Mbs Abs Blueprint

> Analyse residential and commercial mortgage-backed securities, CMOs, and asset-backed securities including prepayment risk, extension risk, and tranche economics

| | |
|---|---|
| **Feature** | `fixed-income-mbs-abs` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, mbs, rmbs, cmbs, cmo, abs, prepayment-risk, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-mbs-abs.blueprint.yaml) |
| **JSON API** | [fixed-income-mbs-abs.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-mbs-abs.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `mbs_analyst` | MBS & ABS Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `security_id` | text | Yes | MBS / ABS identifier |  |
| `security_type` | select | Yes | rmbs_agency \| rmbs_non_agency \| cmbs \| cmo \| abs_auto \| abs_card \| abs_other |  |
| `tranche_type` | select | No | sequential \| pac \| support \| io \| po \| z_bond |  |
| `wac` | number | No | Weighted-average coupon (decimal) |  |
| `wam` | number | No | Weighted-average maturity (months) |  |

## Rules

- **rmbs:**
  - **agency:** Guaranteed by Ginnie/Fannie/Freddie; credit risk minimal
  - **non_agency:** Private-label; full credit analysis required
  - **pass_through:** Simple pro-rata pass-through of pool cash flows
- **cmo:**
  - **pac:** Planned amortisation class — cash flows stable within prepayment band
  - **support:** Absorbs prepayment variance for PACs
  - **sequential:** Paid in order of tranches
  - **io_po:**
    - **io:** Interest-only; rises when rates rise (prepayments slow)
    - **po:** Principal-only; price sensitive to prepayment speed
  - **z_bond:** Accrual bond; last principal pay
- **cmbs:**
  - **balloon_risk:** Non-amortising mortgages require refinancing at maturity
  - **call_protection:** Yield maintenance, defeasance, lockout prevent early prepay
- **abs_types:**
  - **auto:** Short duration; prepayment from sales/trade-ins
  - **credit_card:** Revolving pool; lockout then amortisation
  - **student_loans:** Often guaranteed; extended WAL
  - **equipment:** Lease receivables
- **prepayment_risk:**
  - **contraction:** Rates fall -> prepayments accelerate -> WAL shortens
  - **extension:** Rates rise -> prepayments slow -> WAL extends
  - **psa_benchmark:** Standard prepayment assumption curve (100 PSA = 6 percent CPR)
- **risk_return:**
  - **negative_convexity:** Prepayments cap price upside when rates drop
  - **spread:** Compensation for prepay uncertainty
- **validation:**
  - **security_required:** security_id present
  - **valid_type:** security_type in allowed set

## Outcomes

### Analyze_mbs_abs (Priority: 1)

_Produce prepayment, extension, and cash-flow analytics_

**Given:**
- `security_id` (input) exists
- `security_type` (input) in `rmbs_agency,rmbs_non_agency,cmbs,cmo,abs_auto,abs_card,abs_other`

**Then:**
- **call_service** target: `mbs_analyst`
- **emit_event** event: `mbs_abs.analyzed`

### Invalid_type (Priority: 10) — Error: `MBS_INVALID_TYPE`

_Unsupported security type_

**Given:**
- `security_type` (input) not_in `rmbs_agency,rmbs_non_agency,cmbs,cmo,abs_auto,abs_card,abs_other`

**Then:**
- **emit_event** event: `mbs_abs.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MBS_INVALID_TYPE` | 400 | security_type must be one of the supported MBS/ABS types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mbs_abs.analyzed` |  | `analysis_id`, `security_id`, `security_type`, `wal`, `effective_duration`, `effective_convexity` |
| `mbs_abs.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-securitization | required |  |
| fixed-income-convexity-measures | required |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Mbs Abs

Analyse residential and commercial mortgage-backed securities, CMOs, and asset-backed securities including prepayment risk, extension risk, and tranche economics

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fixed_income_securitization` | fixed-income-securitization | fail |
| `fixed_income_convexity_measures` | fixed-income-convexity-measures | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyze_mbs_abs | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Mbs Abs Blueprint",
  "description": "Analyse residential and commercial mortgage-backed securities, CMOs, and asset-backed securities including prepayment risk, extension risk, and tranche economic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, mbs, rmbs, cmbs, cmo, abs, prepayment-risk, cfa-level-1"
}
</script>
