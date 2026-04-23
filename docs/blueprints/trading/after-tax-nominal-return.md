---
title: "After Tax Nominal Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Convert pre-tax nominal return to after-tax nominal return, accounting for income tax (on dividends/interest) and capital gains tax. 6 fields. 3 outcomes. 2 err"
---

# After Tax Nominal Return Blueprint

> Convert pre-tax nominal return to after-tax nominal return, accounting for income tax (on dividends/interest) and capital gains tax

| | |
|---|---|
| **Feature** | `after-tax-nominal-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, tax, after-tax, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/after-tax-nominal-return.blueprint.yaml) |
| **JSON API** | [after-tax-nominal-return.json]({{ site.baseurl }}/api/blueprints/trading/after-tax-nominal-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |
| `investor` | Taxable Investor | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pre_tax_return` | number | Yes | Pre-tax nominal return (decimal) |  |
| `income_yield` | number | No | Income (dividend/coupon) component of pre-tax return |  |
| `capital_gain_yield` | number | No | Capital gain component of pre-tax return |  |
| `income_tax_rate` | number | Yes | Marginal tax rate on income (decimal) |  |
| `capital_gains_tax_rate` | number | Yes | Tax rate on realised capital gains (decimal) |  |
| `realised` | boolean | No | Whether capital gains are realised (taxable) or unrealised (deferred) |  |

## Rules

- **core_formula_simple:**
  - **after_tax_nominal:** R_after_tax = R_pre_tax * (1 - t)
- **core_formula_decomposed:**
  - **after_tax:** R_after_tax = income_yield * (1 - t_income) + capital_gain_yield * (1 - t_cg * realised_indicator)
  - **unrealised_capital_gains:** If gains are unrealised (held), capital gains tax is deferred — effective rate 0 for the period
- **jurisdictional_notes:**
  - **south_africa_popia:** SA CGT 2026: effective CGT rate for individuals approx 18% (40% inclusion × marginal); for companies approx 21.6%
  - **us_qualified_dividends:** Qualified dividends taxed at long-term CGT rate rather than ordinary income rate
  - **tax_deferred_accounts:** Returns in tax-deferred accounts (401k, TFSA, retirement annuity) apply zero tax until distribution
- **validation:**
  - **tax_rates_in_range:** 0 <= tax_rate <= 1
  - **component_sum:** If income_yield and capital_gain_yield provided, they should approximately sum to pre_tax_return

## Outcomes

### Compute_after_tax (Priority: 1)

_Compute after-tax return using decomposed formula when components provided_

**Given:**
- `pre_tax_return` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.after_tax_calculated`

### Invalid_tax_rate (Priority: 10) — Error: `AFTER_TAX_INVALID_RATE`

_Tax rate out of [0,1]_

**Given:**
- ANY: `income_tax_rate` (input) lt `0` OR `income_tax_rate` (input) gt `1` OR `capital_gains_tax_rate` (input) lt `0` OR `capital_gains_tax_rate` (input) gt `1`

**Then:**
- **emit_event** event: `return.after_tax_rejected`

### Missing_pre_tax (Priority: 11) — Error: `AFTER_TAX_MISSING_PRE_TAX`

_Pre-tax return missing_

**Given:**
- `pre_tax_return` (input) not_exists

**Then:**
- **emit_event** event: `return.after_tax_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `AFTER_TAX_INVALID_RATE` | 400 | Tax rates must be in the interval [0, 1] | No |
| `AFTER_TAX_MISSING_PRE_TAX` | 400 | Pre-tax return is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.after_tax_calculated` |  | `portfolio_id`, `pre_tax_return`, `after_tax_return`, `income_tax_paid`, `cgt_paid`, `realised` |
| `return.after_tax_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gross-net-return | recommended |  |
| real-return | recommended |  |
| holding-period-return | required |  |

## AGI Readiness

### Goals

#### Reliable After Tax Nominal Return

Convert pre-tax nominal return to after-tax nominal return, accounting for income tax (on dividends/interest) and capital gains tax

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
| `holding_period_return` | holding-period-return | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_after_tax | `autonomous` | - | - |
| invalid_tax_rate | `autonomous` | - | - |
| missing_pre_tax | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: "12% pre-tax: 3% income yield, 9% capital gain, income tax 30%, CGT
    18%, gain realised"
  inputs:
    income_yield: 0.03
    capital_gain_yield: 0.09
    income_tax_rate: 0.3
    capital_gains_tax_rate: 0.18
    realised: true
  computation: 0.03*(1-0.30) + 0.09*(1-0.18) = 0.021 + 0.0738 = 0.0948
  after_tax_return: 0.0948
planning_considerations:
  - Tax-loss harvesting
  - Asset location (place income assets in tax-deferred accounts)
  - Holding period for long-term CGT rates
  - Municipal/tax-exempt bonds for high-bracket investors
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "After Tax Nominal Return Blueprint",
  "description": "Convert pre-tax nominal return to after-tax nominal return, accounting for income tax (on dividends/interest) and capital gains tax. 6 fields. 3 outcomes. 2 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, tax, after-tax, cfa-level-1"
}
</script>
