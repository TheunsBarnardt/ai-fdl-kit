---
title: "Credit Default Swaps L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse credit default swaps — single-name and index CDS, mechanics, valuation (CDS spread vs credit curve), upfront payment, basis trades, and CDS uses in cred"
---

# Credit Default Swaps L2 Blueprint

> Analyse credit default swaps — single-name and index CDS, mechanics, valuation (CDS spread vs credit curve), upfront payment, basis trades, and CDS uses in credit risk management

| | |
|---|---|
| **Feature** | `credit-default-swaps-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, cds, credit-derivatives, basis-trade, cdx, itraxx, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/credit-default-swaps-l2.blueprint.yaml) |
| **JSON API** | [credit-default-swaps-l2.json]({{ site.baseurl }}/api/blueprints/trading/credit-default-swaps-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cds_analyst` | Credit Default Swap Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_id` | text | Yes | CDS trade identifier |  |
| `cds_type` | select | Yes | single_name \| index \| basket \| tranche |  |

## Rules

- **cds_basics:**
  - **contract:** Protection buyer pays periodic premium to seller; seller compensates loss on credit event
  - **notional:** Reference amount; not exchanged at inception
  - **coupon:** Standardised at 100 bps (IG) or 500 bps (HY)
  - **upfront_payment:** Reconciles standard coupon with market spread
- **credit_events_isda:**
  - **bankruptcy:** Issuer files or fails to pay creditors
  - **failure_to_pay:** Past grace period
  - **restructuring:** Modified definitions for sovereign vs corporate
  - **determinations_committee:** ISDA decides if event triggered
- **settlement:**
  - **physical:** Buyer delivers bond, receives par
  - **cash:** Auction determines recovery; cash payment of (1-recovery) × notional
  - **auction_protocol:** Standard since 2009
- **single_name_vs_index:**
  - **single_name:** One reference entity
  - **index:** CDX (NA), iTraxx (Europe); equally weighted basket
  - **sub_indices:** IG, HY, EM, financials
- **cds_spread:**
  - **intuition:** Annualised premium that equates expected protection payments to expected losses
  - **relationship:** CDS spread ≈ PD × LGD (approx; ignoring funding/liquidity)
- **cds_pricing:**
  - **upfront_formula:** Upfront ≈ (CDS spread − fixed coupon) × duration × notional
  - **pv_protection_leg:** Σ PD_t × LGD × DF_t
  - **pv_premium_leg:** Σ coupon × DF_t × (1 − cumulative PD_t)
- **credit_curve:**
  - **upward_sloping:** Higher cumulative PD over longer horizons
  - **inverted_at_distress:** Near-term default risk dominant
- **uses_of_cds:**
  - **hedging:** Buy protection on bond holdings
  - **speculation:** Naked long/short credit exposure
  - **arbitrage:** Basis trade between CDS spread and bond Z-spread
  - **capital_relief:** Synthetic securitisation
- **basis_trade:**
  - **definition:** CDS basis = CDS spread − bond Z-spread
  - **positive_basis:** Buy bond, buy protection (rare; funding stress)
  - **negative_basis:** Sell bond/short, sell protection
  - **drivers:** Funding, repo specials, contract specifics, deliverable squeeze
- **index_tranches:**
  - **structure:** Equity (0-3%), mezzanine (3-7%), senior tranches
  - **correlation_sensitivity:** Equity tranche short correlation; senior long correlation
- **validation:**
  - **trade_required:** trade_id present
  - **valid_type:** cds_type in [single_name, index, basket, tranche]

## Outcomes

### Analyse_cds (Priority: 1)

_Analyse CDS trade_

**Given:**
- `trade_id` (input) exists
- `cds_type` (input) in `single_name,index,basket,tranche`

**Then:**
- **call_service** target: `cds_analyst`
- **emit_event** event: `cds.analysed`

### Invalid_type (Priority: 10) — Error: `CDS_INVALID_TYPE`

_Unsupported CDS type_

**Given:**
- `cds_type` (input) not_in `single_name,index,basket,tranche`

**Then:**
- **emit_event** event: `cds.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CDS_INVALID_TYPE` | 400 | cds_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cds.analysed` |  | `trade_id`, `cds_type`, `spread_bps`, `upfront`, `mark_to_market`, `basis` |
| `cds.rejected` |  | `trade_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| credit-analysis-models-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Credit Default Swaps L2

Analyse credit default swaps — single-name and index CDS, mechanics, valuation (CDS spread vs credit curve), upfront payment, basis trades, and CDS uses in credit risk management

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
| `credit_analysis_models_l2` | credit-analysis-models-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyse_cds | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Credit Default Swaps L2 Blueprint",
  "description": "Analyse credit default swaps — single-name and index CDS, mechanics, valuation (CDS spread vs credit curve), upfront payment, basis trades, and CDS uses in cred",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, cds, credit-derivatives, basis-trade, cdx, itraxx, cfa-level-2"
}
</script>
