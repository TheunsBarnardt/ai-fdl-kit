---
title: "Fixed Income Bond Features Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify bond indenture terms — issuer, maturity, coupon, seniority, collateral, covenants — and describe how contractual features drive cash flow and credit ri"
---

# Fixed Income Bond Features Blueprint

> Classify bond indenture terms — issuer, maturity, coupon, seniority, collateral, covenants — and describe how contractual features drive cash flow and credit risk

| | |
|---|---|
| **Feature** | `fixed-income-bond-features` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, bond-features, indenture, covenants, seniority, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-bond-features.blueprint.yaml) |
| **JSON API** | [fixed-income-bond-features.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-bond-features.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_classifier` | Fixed-Income Instrument Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier (CUSIP / ISIN) |  |
| `issuer_type` | select | Yes | sovereign \| supranational \| quasi_government \| corporate \| municipal \| securitised |  |
| `coupon_type` | select | Yes | fixed \| floating \| zero \| step_up \| deferred \| inflation_linked |  |
| `seniority` | select | No | senior_secured \| senior_unsecured \| subordinated \| junior_subordinated |  |
| `collateral` | select | No | unsecured \| mortgage \| equipment \| covered \| sovereign_guarantee |  |

## Rules

- **indenture_contents:**
  - **obligations:** Issuer obligations — payment schedule, covenants
  - **rights:** Bondholder rights — voting, acceleration
  - **definitions:** Events of default, remedies
- **coupon_structures:**
  - **fixed:** Constant rate through life
  - **floating:** Reference rate + quoted margin
  - **zero:** Issued at discount; no periodic coupons
  - **step_up:** Rate increases on schedule
  - **deferred:** No coupons early; large later
  - **inflation_linked:** Principal or coupon indexed to CPI
- **covenants:**
  - **affirmative:** Must do — audited statements, insurance
  - **negative:** Must not do — additional debt above cap, asset sales
  - **maintenance:** Maintain ratios (coverage, leverage)
  - **incurrence:** Only when new action is taken
- **seniority_ladder:**
  - **order_of_payment:** Senior secured, Senior unsecured, Subordinated, Junior subordinated, Preferred equity, Common equity
- **contingency_provisions:**
  - **callable:** Issuer may redeem early
  - **putable:** Bondholder may demand redemption
  - **convertible:** Convert to equity at ratio
- **validation:**
  - **bond_required:** bond_id present
  - **valid_issuer:** issuer_type in allowed set
  - **valid_coupon:** coupon_type in allowed set

## Outcomes

### Classify_bond (Priority: 1)

_Produce structured classification of bond indenture_

**Given:**
- `bond_id` (input) exists
- `issuer_type` (input) in `sovereign,supranational,quasi_government,corporate,municipal,securitised`
- `coupon_type` (input) in `fixed,floating,zero,step_up,deferred,inflation_linked`

**Then:**
- **call_service** target: `fi_classifier`
- **emit_event** event: `bond.classified`

### Invalid_issuer (Priority: 10) — Error: `BOND_INVALID_ISSUER`

_Unsupported issuer type_

**Given:**
- `issuer_type` (input) not_in `sovereign,supranational,quasi_government,corporate,municipal,securitised`

**Then:**
- **emit_event** event: `bond.classification_rejected`

### Invalid_coupon (Priority: 11) — Error: `BOND_INVALID_COUPON`

_Unsupported coupon type_

**Given:**
- `coupon_type` (input) not_in `fixed,floating,zero,step_up,deferred,inflation_linked`

**Then:**
- **emit_event** event: `bond.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BOND_INVALID_ISSUER` | 400 | issuer_type must be one of the supported issuer categories | No |
| `BOND_INVALID_COUPON` | 400 | coupon_type must be one of the supported coupon types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bond.classified` |  | `classification_id`, `bond_id`, `issuer_type`, `coupon_type`, `seniority` |
| `bond.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-cash-flow-structures | recommended |  |
| fixed-income-credit-analysis | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Bond Features

Classify bond indenture terms — issuer, maturity, coupon, seniority, collateral, covenants — and describe how contractual features drive cash flow and credit risk

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| classify_bond | `autonomous` | - | - |
| invalid_issuer | `autonomous` | - | - |
| invalid_coupon | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Bond Features Blueprint",
  "description": "Classify bond indenture terms — issuer, maturity, coupon, seniority, collateral, covenants — and describe how contractual features drive cash flow and credit ri",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, bond-features, indenture, covenants, seniority, cfa-level-1"
}
</script>
