---
title: "Fiscal Policy Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Use government spending and taxation as a fiscal policy instrument — including discretionary and automatic stabilisers — to influence aggregate demand, employme"
---

# Fiscal Policy Framework Blueprint

> Use government spending and taxation as a fiscal policy instrument — including discretionary and automatic stabilisers — to influence aggregate demand, employment, and inflation

| | |
|---|---|
| **Feature** | `fiscal-policy-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, fiscal-policy, government-spending, taxation, automatic-stabilisers, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fiscal-policy-framework.blueprint.yaml) |
| **JSON API** | [fiscal-policy-framework.json]({{ site.baseurl }}/api/blueprints/trading/fiscal-policy-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fiscal_engine` | Fiscal Policy Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Country or monetary union |  |
| `policy_tool` | select | Yes | government_spending \| direct_tax \| indirect_tax \| transfer_payment \| automatic_stabiliser |  |
| `change_amount` | number | No | Proposed change in currency units or percent of GDP |  |
| `cycle_phase` | select | No | recovery \| expansion \| slowdown \| recession |  |

## Rules

- **objectives:** Stabilise aggregate demand and smooth the business cycle, Influence employment and inflation, Redistribute income and wealth, Fund public goods and provide safety nets
- **fiscal_stance:**
  - **expansionary:** Higher spending and/or lower taxes — stimulates AD
  - **contractionary:** Lower spending and/or higher taxes — restrains AD
  - **neutral:** Structural deficit unchanged after adjusting for cycle
- **tools:**
  - **direct_taxes:** Income, corporate, capital gains, payroll — slow to adjust
  - **indirect_taxes:** VAT, excise duties — quick to adjust
  - **government_spending:** Goods, services, public investment, transfers
  - **transfer_payments:** Unemployment benefits, welfare, pensions
- **automatic_stabilisers:**
  - **definition:** Fiscal features that moderate cycles without new legislation
  - **examples:** Progressive income tax, unemployment insurance, means-tested benefits
  - **mechanism:** Rise in recessions, fall in expansions — dampens AD swings
- **discretionary_vs_automatic:**
  - **discretionary:** Requires new legislation; subject to lags
  - **automatic:** Kicks in with the cycle; no legislative delay
- **applications:**
  - **equity_sector_bets:** Infrastructure spending lifts industrials and materials
  - **credit_positioning:** Fiscal expansion widens supply of sovereigns -> spreads/curve
  - **currency:** Large fiscal deficits can weaken currency via rising rates and supply
- **validation:**
  - **jurisdiction_present:** jurisdiction required
  - **valid_tool:** policy_tool in {government_spending, direct_tax, indirect_tax, transfer_payment, automatic_stabiliser}

## Outcomes

### Evaluate_fiscal_action (Priority: 1)

_Assess a proposed fiscal policy change_

**Given:**
- `jurisdiction` (input) exists
- `policy_tool` (input) in `government_spending,direct_tax,indirect_tax,transfer_payment,automatic_stabiliser`

**Then:**
- **call_service** target: `fiscal_engine`
- **emit_event** event: `fiscal.action_evaluated`

### Invalid_tool (Priority: 10) — Error: `FISCAL_INVALID_TOOL`

_Unsupported fiscal tool_

**Given:**
- `policy_tool` (input) not_in `government_spending,direct_tax,indirect_tax,transfer_payment,automatic_stabiliser`

**Then:**
- **emit_event** event: `fiscal.action_rejected`

### Missing_jurisdiction (Priority: 11) — Error: `FISCAL_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `fiscal.action_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FISCAL_INVALID_TOOL` | 400 | policy_tool must be one of government_spending, direct_tax, indirect_tax, transfer_payment, automatic_stabiliser | No |
| `FISCAL_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fiscal.action_evaluated` |  | `action_id`, `jurisdiction`, `policy_tool`, `estimated_impact`, `fiscal_stance` |
| `fiscal.action_rejected` |  | `action_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fiscal-deficits-debt | recommended |  |
| fiscal-multiplier | recommended |  |
| fiscal-implementation-challenges | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fiscal Policy Framework

Use government spending and taxation as a fiscal policy instrument — including discretionary and automatic stabilisers — to influence aggregate demand, employment, and inflation

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
| evaluate_fiscal_action | `autonomous` | - | - |
| invalid_tool | `autonomous` | - | - |
| missing_jurisdiction | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
advantages_disadvantages:
  direct_tax_adv: Progressive; collects from capacity to pay
  direct_tax_disadv: Discourages labour/investment; slow to adjust
  indirect_tax_adv: Easy to implement and vary
  indirect_tax_disadv: Regressive
  spending_adv: Can target specific regions or sectors
  spending_disadv: Political allocation; slower to implement
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fiscal Policy Framework Blueprint",
  "description": "Use government spending and taxation as a fiscal policy instrument — including discretionary and automatic stabilisers — to influence aggregate demand, employme",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, fiscal-policy, government-spending, taxation, automatic-stabilisers, cfa-level-1"
}
</script>
