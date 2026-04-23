---
title: "Fixed Income Securitization Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Describe the securitization process — pool formation, SPE issuance, tranching, credit enhancement, waterfalls — and the benefits and risks for originators, inve"
---

# Fixed Income Securitization Blueprint

> Describe the securitization process — pool formation, SPE issuance, tranching, credit enhancement, waterfalls — and the benefits and risks for originators, investors, and the financial system

| | |
|---|---|
| **Feature** | `fixed-income-securitization` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, securitization, abs, spe, tranching, credit-enhancement, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-securitization.blueprint.yaml) |
| **JSON API** | [fixed-income-securitization.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-securitization.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `structurer` | Securitization Structuring Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `deal_id` | text | Yes | Securitization identifier |  |
| `collateral_type` | select | Yes | auto_loans \| credit_card \| student_loans \| commercial_loans \| mortgages \| future_flow \| other |  |
| `tranche_structure` | select | No | senior_sub \| sequential_pay \| pac \| principal_only \| interest_only |  |
| `credit_enhancement` | multiselect | No | subordination \| overcollateralisation \| reserve_fund \| excess_spread \| wrap |  |

## Rules

- **parties:**
  - **originator:** Sells assets to SPE
  - **spe:** Special-purpose entity — bankruptcy-remote issuer
  - **servicer:** Collects and administers pool cash flows
  - **trustee:** Protects investor interests and enforces covenants
- **process:**
  - **pool:** Homogeneous or curated asset pool
  - **true_sale:** Transfer isolates assets from originator bankruptcy
  - **issuance:** SPE issues tranches with differentiated cash-flow rights
- **tranching:**
  - **senior:** Paid first; highest rating
  - **mezzanine:** Intermediate risk/return
  - **equity_residual:** First-loss; holds economic interest
  - **sequential:** Pay senior principal until retired, then mezz, etc.
  - **pro_rata:** Principal split across tranches in proportion
- **credit_enhancement:**
  - **subordination:** Junior tranches absorb losses first
  - **overcollateralisation:** Pool par > bonds issued
  - **reserve_fund:** Cash set aside to cover shortfalls
  - **excess_spread:** Net interest income above deal expenses
  - **wrap:** Third-party financial guarantee
- **benefits:**
  - **originator:** Funding diversification, balance-sheet relief, fee income
  - **investor:** Access to pool exposure, tranched risk/return
  - **system:** Risk distribution, deeper capital markets
- **risks:**
  - **prepayment:** Borrowers prepay early; reduces WAL
  - **default:** Pool losses hit junior first, then up the stack
  - **manager_conflict:** Adverse selection in asset sale
  - **complexity:** Multi-layer structures obscure risk
- **validation:**
  - **deal_required:** deal_id present
  - **valid_collateral:** collateral_type in allowed set

## Outcomes

### Structure_deal (Priority: 1)

_Record securitization structure and enhancements_

**Given:**
- `deal_id` (input) exists
- `collateral_type` (input) in `auto_loans,credit_card,student_loans,commercial_loans,mortgages,future_flow,other`

**Then:**
- **call_service** target: `structurer`
- **emit_event** event: `securitization.structured`

### Invalid_collateral (Priority: 10) — Error: `SEC_INVALID_COLLATERAL`

_Unsupported collateral_

**Given:**
- `collateral_type` (input) not_in `auto_loans,credit_card,student_loans,commercial_loans,mortgages,future_flow,other`

**Then:**
- **emit_event** event: `securitization.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SEC_INVALID_COLLATERAL` | 400 | collateral_type must be one of the supported classes | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `securitization.structured` |  | `deal_id`, `collateral_type`, `tranche_structure`, `enhancements` |
| `securitization.rejected` |  | `deal_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-mbs-abs | required |  |
| fixed-income-credit-analysis | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Securitization

Describe the securitization process — pool formation, SPE issuance, tranching, credit enhancement, waterfalls — and the benefits and risks for originators, investors, and the financial system

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
| `fixed_income_mbs_abs` | fixed-income-mbs-abs | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| structure_deal | `autonomous` | - | - |
| invalid_collateral | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Securitization Blueprint",
  "description": "Describe the securitization process — pool formation, SPE issuance, tranching, credit enhancement, waterfalls — and the benefits and risks for originators, inve",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, securitization, abs, spe, tranching, credit-enhancement, cfa-level-1"
}
</script>
