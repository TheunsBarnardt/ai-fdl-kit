---
title: "Liability Driven Index Strategies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies. 2"
---

# Liability Driven Index Strategies L3 Blueprint

> Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies

| | |
|---|---|
| **Feature** | `liability-driven-index-strategies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, fixed-income, liability-driven-investing, immunization, cash-flow-matching, bond-indexing, duration-matching, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/liability-driven-index-strategies-l3.blueprint.yaml) |
| **JSON API** | [liability-driven-index-strategies-l3.json]({{ site.baseurl }}/api/blueprints/trading/liability-driven-index-strategies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `actuary` | Actuary | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `ldi_type` | select | Yes | immunization \| cash_flow_matching \| duration_matching \| contingent \| laddered \| index \| enhanced_index |  |

## Rules

- **ldi_vs_adl:**
  - **ldi:** Liability-Driven Investing: assets structured to match liabilities; minimize surplus risk
  - **adl:** Asset-Driven Liabilities: rare; liabilities adjust to asset performance (some DB pension schemes)
- **liability_types:**
  - **type_i:** Fixed amount, fixed timing; easiest to immunize (e.g., GIC, zero-coupon bond)
  - **type_ii:** Fixed amount, uncertain timing; mortality risk, prepayment risk
  - **type_iii:** Uncertain amount, fixed timing; inflation-linked liabilities
  - **type_iv:** Uncertain amount, uncertain timing; most complex; DB pension with inflation + longevity risk
- **immunization:**
  - **conditions:** PV(assets) = PV(liabilities); duration(assets) = duration(liabilities); convexity(assets) ≥ convexity(liabilities)
  - **convexity:** Positive convexity ensures surplus rises regardless of rate shift direction
  - **rebalancing:** Required as time passes and rates move; duration drift must be corrected
  - **dispersion:** Minimizing asset cash flow dispersion around liability payment reduces structural risk
- **cash_flow_matching:**
  - **definition:** Match exact timing and amount of liability cash flows with asset cash flows
  - **conservative:** No reinvestment risk; surplus risk near zero; but expensive and inflexible
  - **duration_match_vs_cf:** CF matching avoids reinvestment risk; duration matching is cheaper but has more risk
- **laddered_portfolio:**
  - **structure:** Equal investment across maturities in regular intervals; continuous reinvestment
  - **benefits:** Diversifies across yield curve; rolling reinvestment reduces reinvestment rate risk; liquid
  - **use_case:** Insurance companies; retail investors; balanced duration and liquidity
- **duration_matching:**
  - **basis:** Match dollar duration (BPV) of assets to BPV of liabilities
  - **multi_liability:** Use key rate durations to match liabilities at each key maturity
  - **derivatives_overlay:** Use interest rate swaps or futures to close duration gap cheaply
  - **contingent:** Hybrid: floor return immunized; if surplus sufficient, switch to active management
- **contingent_immunization:**
  - **concept:** Actively manage until surplus falls to minimum required; then immunize
  - **trigger:** Surplus = PV(assets) − PV(liabilities) falls below safety cushion
  - **advantage:** Captures upside from active management while protecting minimum liability coverage
- **ldi_risks:**
  - **model_risk:** Liability duration model may misspecify liability sensitivity to rates
  - **spread_risk:** If asset yield includes credit spread but liability discount is risk-free → spread risk
  - **counterparty:** Derivatives overlay introduces counterparty exposure
  - **asset_liquidity:** During stress, bond positions may be illiquid when rebalancing needed
- **bond_indexing:**
  - **full_replication:** Hold all index securities in proportion; tracks closely; expensive and impractical for large indexes
  - **stratified_sampling:** Divide index into cells; hold representative bonds per cell; reduces cost
  - **enhanced_indexing:** Slight active deviations for alpha within tight tracking error budget
  - **primary_risk_factors:** Duration, key rate duration, spread duration, sector weights, credit quality
  - **benchmark_selection:** Match benchmark to investor mandate; avoid excessive cash drag
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_ldi_type:** ldi_type in [immunization, cash_flow_matching, duration_matching, contingent, laddered, index, enhanced_index]

## Outcomes

### Implement_ldi_strategy (Priority: 1)

_Implement liability-driven or index-based fixed-income strategy_

**Given:**
- `strategy_id` (input) exists
- `ldi_type` (input) in `immunization,cash_flow_matching,duration_matching,contingent,laddered,index,enhanced_index`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `ldi.strategy.implemented`

### Invalid_ldi_type (Priority: 10) — Error: `LDI_INVALID_TYPE`

_Unsupported LDI strategy type_

**Given:**
- `ldi_type` (input) not_in `immunization,cash_flow_matching,duration_matching,contingent,laddered,index,enhanced_index`

**Then:**
- **emit_event** event: `ldi.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LDI_INVALID_TYPE` | 400 | ldi_type must be one of the supported LDI strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ldi.strategy.implemented` |  | `strategy_id`, `ldi_type`, `asset_duration`, `liability_duration`, `surplus`, `funding_ratio` |
| `ldi.strategy.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-portfolio-management-l3 | required |  |
| principles-asset-allocation-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Liability Driven Index Strategies L3

Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies

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
| `fixed_income_portfolio_management_l3` | fixed-income-portfolio-management-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| implement_ldi_strategy | `autonomous` | - | - |
| invalid_ldi_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Liability Driven Index Strategies L3 Blueprint",
  "description": "Liability-driven investing and bond indexing — immunization, cash flow matching, duration matching, contingent immunization, and enhanced indexing strategies. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, fixed-income, liability-driven-investing, immunization, cash-flow-matching, bond-indexing, duration-matching, cfa-level-3"
}
</script>
