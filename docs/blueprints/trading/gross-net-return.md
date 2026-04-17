---
title: "Gross Net Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute gross and net returns — differentiating the manager's gross performance from the investor's return after fees and expenses. 7 fields. 3 outcomes. 2 erro"
---

# Gross Net Return Blueprint

> Compute gross and net returns — differentiating the manager's gross performance from the investor's return after fees and expenses

| | |
|---|---|
| **Feature** | `gross-net-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, fees, net-of-fees, gross-of-fees, gips, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/gross-net-return.blueprint.yaml) |
| **JSON API** | [gross-net-return.json]({{ site.baseurl }}/api/blueprints/trading/gross-net-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |
| `investor` | Investor / End Client | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `gross_return` | number | Yes | Gross return before management and performance fees (decimal) |  |
| `management_fee_rate` | number | No | Management fee (annual %, expressed as decimal) |  |
| `performance_fee_rate` | number | No | Performance fee (% of profit, expressed as decimal) |  |
| `expense_ratio` | number | No | Fund operating expenses (decimal) |  |
| `trading_costs` | number | No | Realised trading/execution costs (decimal) |  |
| `hurdle_rate` | number | No | Performance fee hurdle (decimal); performance fee applies above this |  |
| `high_water_mark` | number | No | High-water mark NAV; performance fee only applies above HWM |  |

## Rules

- **gross_definition:**
  - **gross_return:** Return before deducting management fees, performance fees, and fund operating expenses; trading costs ARE typically included (netted)
- **net_definition:**
  - **net_return:** R_net = R_gross - management_fee - performance_fee - expense_ratio
  - **simple_fee_model:** Approximation suitable for reporting; exact calculation depends on fee accrual rules
- **performance_fee_logic:**
  - **above_hurdle_only:** performance_fee = max(0, (R_gross - hurdle_rate)) * performance_fee_rate
  - **high_water_mark:** Performance fee only applies when NAV exceeds prior HWM
  - **catch_up_clauses:** Some fee structures include catch-up provisions; flag and defer to fee schedule
- **gips_requirement:**
  - **disclosure:** GIPS-compliant reporting requires both gross and net return disclosure for composites
- **appropriate_use:**
  - **manager_skill:** Gross return reflects investment decisions alone
  - **investor_outcome:** Net return reflects what the end investor actually earns
- **validation:**
  - **non_negative_fees:** All fee rates must be >= 0
  - **fees_not_exceeding_return:** Warn if total fees exceed gross return (negative net return is possible but flag)

## Outcomes

### Compute_net_return (Priority: 1)

_Compute net return given fees_

**Given:**
- `gross_return` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.net_calculated`

### Negative_fee_rate (Priority: 10) — Error: `RETURN_NEGATIVE_FEE`

_A fee rate is negative_

**Given:**
- ANY: `management_fee_rate` (input) lt `0` OR `performance_fee_rate` (input) lt `0`

**Then:**
- **emit_event** event: `return.net_rejected`

### Missing_gross_return (Priority: 11) — Error: `RETURN_MISSING_GROSS`

_Gross return not provided_

**Given:**
- `gross_return` (input) not_exists

**Then:**
- **emit_event** event: `return.net_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RETURN_NEGATIVE_FEE` | 400 | Fee rates cannot be negative | No |
| `RETURN_MISSING_GROSS` | 400 | Gross return is required to derive net return | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.net_calculated` |  | `portfolio_id`, `gross_return`, `net_return`, `total_fees`, `management_fee`, `performance_fee`, `expense_ratio` |
| `return.net_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| after-tax-nominal-return | recommended |  |
| real-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Manager earns 12% gross; 2% management fee; 20% performance fee over
    0% hurdle
  inputs:
    gross_return: 0.12
    management_fee_rate: 0.02
    performance_fee_rate: 0.2
    hurdle_rate: 0
  computation: |
    mgmt_fee = 0.02
    performance_fee = max(0, (0.12 - 0) * 0.20) = 0.024
    net_return = 0.12 - 0.02 - 0.024 = 0.076
  net_return: 0.076
gips_required_disclosures:
  - Presence and amount of management fees
  - Calculation method for performance fees
  - Hurdle rate and HWM mechanics
  - Whether trading costs are gross or net
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gross Net Return Blueprint",
  "description": "Compute gross and net returns — differentiating the manager's gross performance from the investor's return after fees and expenses. 7 fields. 3 outcomes. 2 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, fees, net-of-fees, gross-of-fees, gips, cfa-level-1"
}
</script>
