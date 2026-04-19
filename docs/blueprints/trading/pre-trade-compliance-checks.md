---
title: "Pre Trade Compliance Checks Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Pre-trade gate running Reg 28, IPS, concentration, restricted-list, suitability, cash, and wash-sale checks before any order is sent. 9 fields. 6 outcomes. 5 er"
---

# Pre Trade Compliance Checks Blueprint

> Pre-trade gate running Reg 28, IPS, concentration, restricted-list, suitability, cash, and wash-sale checks before any order is sent

| | |
|---|---|
| **Feature** | `pre-trade-compliance-checks` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | pre-trade, compliance, reg28, ips, concentration, wash-sale, suitability |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/pre-trade-compliance-checks.blueprint.yaml) |
| **JSON API** | [pre-trade-compliance-checks.json]({{ site.baseurl }}/api/blueprints/trading/pre-trade-compliance-checks.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Order Identifier |  |
| `fund_id` | text | Yes | Fund Identifier |  |
| `symbol` | text | Yes | Instrument Symbol |  |
| `side` | select | Yes | Side |  |
| `quantity` | number | Yes | Quantity |  |
| `notional_zar` | number | Yes | Notional Value (ZAR) |  |
| `available_cash` | number | Yes | Available Cash (ZAR) |  |
| `check_result` | select | No | Check Result |  |
| `failed_checks` | json | No | Failed Check Details |  |

## Rules

- **reg28_limits:**
  - **description:** MUST: Enforce Regulation 28 caps on a look-through basis (equity 75, foreign 45, property 25, PE 15, hedge 10, single issuer 5-25)
  - **equity_max:** 75
  - **foreign_max:** 45
  - **property_max:** 25
  - **pe_max:** 15
  - **hedge_max:** 10
  - **single_issuer_max_lower:** 5
  - **single_issuer_max_upper:** 25
- **ips_constraints:**
  - **description:** MUST: Apply IPS-specific constraints (excluded sectors, ESG rules, issuer caps) before any buy
  - **block_on_violation:** true
- **concentration:**
  - **description:** MUST: Block orders that push a single issuer or single position above concentration thresholds
  - **single_position_max_pct:** 10
- **restricted_list:**
  - **description:** MUST: Block trades in restricted or blacklisted securities regardless of other checks
  - **source:** compliance_restricted_list
- **suitability:**
  - **description:** MUST: Verify trade aligns with client/fund risk profile and time horizon
  - **block_on_mismatch:** true
- **cash_check:**
  - **description:** MUST: Block buy orders without sufficient available cash including expected fees
  - **include_fees:** true
- **wash_sale:**
  - **description:** MUST: Flag sells followed by buys of the same security within 30 days for tax treatment review
  - **window_days:** 30
- **audit:**
  - **description:** MUST: Every check decision is persisted with inputs, outcome, and rule version
  - **retention_years:** 7

## Outcomes

### Reg28_breach (Priority: 1) — Error: `PRETRADE_REG28_BREACH`

_Order would breach a Regulation 28 prudential limit_

**Given:**
- resulting exposure exceeds a Reg 28 cap

**Then:**
- **set_field** target: `check_result` value: `blocked`
- **emit_event** event: `pretrade.reg28_breach`

**Result:** Order blocked with Reg 28 detail

### Restricted_security (Priority: 1) — Error: `PRETRADE_RESTRICTED_SECURITY`

_Symbol appears on the restricted or blacklisted list_

**Given:**
- symbol is on the restricted list

**Then:**
- **set_field** target: `check_result` value: `blocked`
- **emit_event** event: `pretrade.restricted_security`

**Result:** Order blocked immediately

### Ips_breach (Priority: 2) — Error: `PRETRADE_IPS_BREACH`

_Order violates a client or fund IPS constraint_

**Given:**
- order violates an IPS constraint (excluded sector, ESG, issuer cap)

**Then:**
- **set_field** target: `check_result` value: `blocked`
- **emit_event** event: `pretrade.ips_breach`

**Result:** Order blocked

### Insufficient_cash (Priority: 3) — Error: `PRETRADE_INSUFFICIENT_CASH`

_Fund lacks available cash including fees_

**Given:**
- `notional_zar` (input) gt `available_cash`

**Then:**
- **set_field** target: `check_result` value: `blocked`
- **emit_event** event: `pretrade.insufficient_cash`

**Result:** Order blocked; funding required

### Concentration_breach (Priority: 4) — Error: `PRETRADE_CONCENTRATION_BREACH`

_Order would push single position above concentration threshold_

**Given:**
- resulting single-position weight exceeds concentration max

**Then:**
- **set_field** target: `check_result` value: `blocked`
- **emit_event** event: `pretrade.concentration_breach`

**Result:** Order blocked

### Checks_passed_successfully (Priority: 10) | Transaction: atomic

_All mandatory pre-trade checks passed; order may proceed_

**Given:**
- reg28 check passed
- ips check passed
- concentration check passed
- restricted list check passed
- suitability check passed
- cash check passed

**Then:**
- **set_field** target: `check_result` value: `passed`
- **emit_event** event: `pretrade.checks_passed`

**Result:** Order cleared for routing

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRETRADE_REG28_BREACH` | 422 | Order would breach a Regulation 28 limit. | No |
| `PRETRADE_IPS_BREACH` | 422 | Order violates an investment policy constraint. | No |
| `PRETRADE_INSUFFICIENT_CASH` | 422 | Insufficient available cash for this order. | Yes |
| `PRETRADE_RESTRICTED_SECURITY` | 422 | This security is restricted from trading. | No |
| `PRETRADE_CONCENTRATION_BREACH` | 422 | Order would exceed concentration limits. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pretrade.checks_passed` | All checks passed | `order_id`, `fund_id`, `symbol` |
| `pretrade.reg28_breach` | Regulation 28 breach | `order_id`, `fund_id`, `breached_cap`, `projected_pct` |
| `pretrade.ips_breach` | IPS constraint violated | `order_id`, `fund_id`, `constraint` |
| `pretrade.insufficient_cash` | Insufficient cash | `order_id`, `notional_zar`, `available_cash` |
| `pretrade.restricted_security` | Restricted symbol attempted | `order_id`, `symbol` |
| `pretrade.concentration_breach` | Concentration breach | `order_id`, `symbol`, `projected_pct` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| regulation-28-compliance | required | Core limits applied by this gate |
| client-risk-profiling-ips | required | IPS constraints consumed by this gate |
| order-management-execution | required | OMS must call this gate before routing |
| immutable-audit-log | required | Every check decision must be audited |

## AGI Readiness

### Goals

#### Pretrade Safety

Block every non-compliant order before it reaches the broker while keeping latency under 100ms

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| breach_leak_rate | = 0% | Post-trade breaches that the pre-trade gate missed |
| check_latency_p99 | < 100ms | 99th percentile check duration |

**Constraints:**

- **regulatory** (non-negotiable): Regulation 28 and IPS checks cannot be disabled
- **performance** (non-negotiable): Latency budget 100ms; degrade to fail-closed on timeout

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before any manual override of a block

**Escalation Triggers:**

- `reg28_breach`
- `restricted_security`

### Verification

**Invariants:**

- no order reaches routing without check_result = passed
- every blocked order has a reason code
- check decisions are immutable

### Coordination

**Protocol:** `request_response`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| checks_passed_successfully | `autonomous` | - | - |
| reg28_breach | `autonomous` | - | - |
| ips_breach | `autonomous` | - | - |
| restricted_security | `autonomous` | - | - |
| manual_override | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pre Trade Compliance Checks Blueprint",
  "description": "Pre-trade gate running Reg 28, IPS, concentration, restricted-list, suitability, cash, and wash-sale checks before any order is sent. 9 fields. 6 outcomes. 5 er",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "pre-trade, compliance, reg28, ips, concentration, wash-sale, suitability"
}
</script>
