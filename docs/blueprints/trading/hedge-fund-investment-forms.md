---
title: "Hedge Fund Investment Forms Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Access hedge funds directly (single-manager, master-feeder, side-pocket) or indirectly (fund-of-funds, UCITS liquid alts, alternative risk premia replication) w"
---

# Hedge Fund Investment Forms Blueprint

> Access hedge funds directly (single-manager, master-feeder, side-pocket) or indirectly (fund-of-funds, UCITS liquid alts, alternative risk premia replication) with awareness of liquidity and fees

| | |
|---|---|
| **Feature** | `hedge-fund-investment-forms` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | hedge-funds, fund-of-funds, master-feeder, ucits-liquid-alt, replication, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/hedge-fund-investment-forms.blueprint.yaml) |
| **JSON API** | [hedge-fund-investment-forms.json]({{ site.baseurl }}/api/blueprints/trading/hedge-fund-investment-forms.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `hf_access_mgr` | Hedge Fund Access Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `hf_access_id` | text | Yes | Access form identifier |  |
| `form` | select | Yes | direct_single \| master_feeder \| side_pocket \| fund_of_funds \| liquid_alt \| replication |  |

## Rules

- **direct_forms:**
  - **single_manager:** LP in single fund; direct exposure, concentrated risk
  - **master_feeder:** Feeder funds (onshore/offshore) pool into master fund for operational efficiency
  - **side_pocket:** Illiquid positions segregated from redeeming investors
- **indirect_forms:**
  - **fund_of_funds:** Portfolio of hedge funds; diversification, double layer of fees
  - **liquid_alt_ucits:** UCITS-compliant vehicles providing hedge fund strategies with daily liquidity
  - **alt_risk_premia:** Systematic replication of style factors; low fees, limited manager alpha
  - **replication:** Index-based tracking of hedge fund beta via factor exposures
- **liquidity_terms:**
  - **lock_up:** Initial period with no redemptions
  - **gates:** Percentage redemption cap per period
  - **notice_period:** 30-90 days notice typical
- **validation:**
  - **access_required:** hf_access_id present
  - **valid_form:** form in allowed set

## Outcomes

### Select_hf_form (Priority: 1)

_Select hedge fund access form_

**Given:**
- `hf_access_id` (input) exists
- `form` (input) in `direct_single,master_feeder,side_pocket,fund_of_funds,liquid_alt,replication`

**Then:**
- **call_service** target: `hf_access_mgr`
- **emit_event** event: `hf.access_selected`

### Invalid_form (Priority: 10) — Error: `HF_INVALID_FORM`

_Unsupported access form_

**Given:**
- `form` (input) not_in `direct_single,master_feeder,side_pocket,fund_of_funds,liquid_alt,replication`

**Then:**
- **emit_event** event: `hf.access_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HF_INVALID_FORM` | 400 | form must be a supported hedge fund access form | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `hf.access_selected` |  | `hf_access_id`, `form`, `liquidity_terms`, `net_fee_load` |
| `hf.access_rejected` |  | `hf_access_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hedge-fund-strategies | required |  |
| alt-investments-ownership-compensation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Hedge Fund Investment Forms

Access hedge funds directly (single-manager, master-feeder, side-pocket) or indirectly (fund-of-funds, UCITS liquid alts, alternative risk premia replication) with awareness of liquidity and fees

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
| `hedge_fund_strategies` | hedge-fund-strategies | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| select_hf_form | `autonomous` | - | - |
| invalid_form | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Hedge Fund Investment Forms Blueprint",
  "description": "Access hedge funds directly (single-manager, master-feeder, side-pocket) or indirectly (fund-of-funds, UCITS liquid alts, alternative risk premia replication) w",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "hedge-funds, fund-of-funds, master-feeder, ucits-liquid-alt, replication, cfa-level-1"
}
</script>
