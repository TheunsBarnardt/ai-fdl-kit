---
title: "Derivatives Instrument Features Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify derivative instruments by underlying, venue (exchange vs OTC), settlement (physical vs cash), and contract standardisation, and distinguish forward com"
---

# Derivatives Instrument Features Blueprint

> Classify derivative instruments by underlying, venue (exchange vs OTC), settlement (physical vs cash), and contract standardisation, and distinguish forward commitments from contingent claims

| | |
|---|---|
| **Feature** | `derivatives-instrument-features` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, forward-commitment, contingent-claim, otc, exchange-traded, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-instrument-features.blueprint.yaml) |
| **JSON API** | [derivatives-instrument-features.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-instrument-features.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `deriv_classifier` | Derivative Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contract_id` | text | Yes | Contract identifier |  |
| `instrument_family` | select | Yes | forward \| future \| option \| swap \| credit_derivative \| structured |  |
| `underlying_type` | select | Yes | equity \| fixed_income \| currency \| commodity \| credit \| volatility \| weather |  |
| `venue` | select | Yes | exchange \| otc \| cleared_otc |  |
| `settlement` | select | No | physical \| cash \| netted |  |

## Rules

- **derivative_definition:**
  - **value_derived_from:** Contract value is derived from an underlying asset or reference
  - **zero_sum:** Gains to one party match losses to other
- **categories:**
  - **forward_commitments:** Both parties obliged — forwards, futures, swaps
  - **contingent_claims:** One party pays for optionality — options, credit defaults
- **venue_distinction:**
  - **exchange_traded:** Standardised, cleared, margin required, transparent
  - **otc:** Customised, bilateral, counterparty risk, less transparent
  - **cleared_otc:** Negotiated OTC then cleared through CCP
- **standardisation_tradeoffs:**
  - **exchange:**
    - **pros:** Liquidity, price discovery, reduced counterparty risk
    - **cons:** Less customisation
  - **otc:**
    - **pros:** Tailor to exact exposure
    - **cons:** Collateral complexity, liquidity risk
- **underlying_types:**
  - **financial:** Equity, rates, currency, credit, volatility
  - **commodity:** Energy, metals, agriculture
  - **alternative:** Weather, freight, inflation
- **validation:**
  - **contract_required:** contract_id present
  - **valid_family:** instrument_family in allowed set
  - **valid_venue:** venue in allowed set

## Outcomes

### Classify_derivative (Priority: 1)

_Produce structured classification of a derivative contract_

**Given:**
- `contract_id` (input) exists
- `instrument_family` (input) in `forward,future,option,swap,credit_derivative,structured`
- `venue` (input) in `exchange,otc,cleared_otc`

**Then:**
- **call_service** target: `deriv_classifier`
- **emit_event** event: `derivative.classified`

### Invalid_family (Priority: 10) — Error: `DERIV_INVALID_FAMILY`

_Unsupported family_

**Given:**
- `instrument_family` (input) not_in `forward,future,option,swap,credit_derivative,structured`

**Then:**
- **emit_event** event: `derivative.classification_rejected`

### Invalid_venue (Priority: 11) — Error: `DERIV_INVALID_VENUE`

_Unsupported venue_

**Given:**
- `venue` (input) not_in `exchange,otc,cleared_otc`

**Then:**
- **emit_event** event: `derivative.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DERIV_INVALID_FAMILY` | 400 | instrument_family must be forward, future, option, swap, credit_derivative, or structured | No |
| `DERIV_INVALID_VENUE` | 400 | venue must be exchange, otc, or cleared_otc | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `derivative.classified` |  | `classification_id`, `contract_id`, `family`, `underlying`, `venue` |
| `derivative.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| forwards-futures-contracts | recommended |  |
| options-contracts-features | recommended |  |
| swaps-contracts-features | recommended |  |

## AGI Readiness

### Goals

#### Reliable Derivatives Instrument Features

Classify derivative instruments by underlying, venue (exchange vs OTC), settlement (physical vs cash), and contract standardisation, and distinguish forward commitments from contingent claims

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
| classify_derivative | `autonomous` | - | - |
| invalid_family | `autonomous` | - | - |
| invalid_venue | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Instrument Features Blueprint",
  "description": "Classify derivative instruments by underlying, venue (exchange vs OTC), settlement (physical vs cash), and contract standardisation, and distinguish forward com",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, forward-commitment, contingent-claim, otc, exchange-traded, cfa-level-1"
}
</script>
