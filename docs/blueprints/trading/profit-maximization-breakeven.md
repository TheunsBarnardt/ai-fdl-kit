---
title: "Profit Maximization Breakeven Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Determine the profit-maximising output, breakeven quantity, and shutdown point of a firm using marginal revenue equals marginal cost and short-run average cost "
---

# Profit Maximization Breakeven Blueprint

> Determine the profit-maximising output, breakeven quantity, and shutdown point of a firm using marginal revenue equals marginal cost and short-run average cost analysis

| | |
|---|---|
| **Feature** | `profit-maximization-breakeven` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, profit-maximization, breakeven, shutdown, mr-mc, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/profit-maximization-breakeven.blueprint.yaml) |
| **JSON API** | [profit-maximization-breakeven.json]({{ site.baseurl }}/api/blueprints/trading/profit-maximization-breakeven.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Firm Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `price` | number | Yes | Market price per unit |  |
| `marginal_cost_schedule` | json | Yes | Array of marginal cost observations at various quantities |  |
| `average_total_cost` | number | No | ATC at current output |  |
| `average_variable_cost` | number | No | AVC at current output |  |
| `quantity` | number | Yes | Current output quantity |  |

## Rules

- **profit_maximization:**
  - **rule:** Produce where MR = MC (marginal revenue equals marginal cost)
  - **perfect_competition:** MR = P, so produce where P = MC
  - **concavity:** MC must be rising through MR for a maximum, not a minimum
- **breakeven:**
  - **definition:** Output level at which total revenue = total cost (economic profit = 0)
  - **formula:** P = ATC at breakeven quantity
  - **normal_profit:** Accounting profit covers opportunity cost of capital
- **shutdown_decision:**
  - **short_run_rule:** Shut down if P < AVC; continue if P >= AVC (cover variable cost)
  - **long_run_rule:** Exit if P < ATC (cannot cover total cost long term)
  - **intuition:** In short run, fixed costs are sunk; operate if you cover variable cost and contribute to fixed
- **economies_of_scale:**
  - **economies:** LRAC falls as output rises — scale benefits
  - **diseconomies:** LRAC rises as output rises — coordination costs dominate
  - **minimum_efficient_scale:** Output at which LRAC bottoms
- **applications:**
  - **corporate_capacity:** Decide plant closure when price dips below AVC
  - **commodity_producers:** Oil/gas shutdown decisions tied to spot vs variable cost
  - **manufacturing:** Scale decisions and unit-economics analysis
  - **equity_valuation:** Understand margin sustainability across the cycle
- **validation:**
  - **positive_price:** price >= 0
  - **valid_quantity:** quantity > 0
  - **mc_schedule_sorted:** marginal_cost_schedule entries sorted by quantity

## Outcomes

### Compute_optimal_output (Priority: 1)

_Determine profit-maximising quantity where P = MC_

**Given:**
- `price` (input) gte `0`
- `marginal_cost_schedule` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `firm.optimal_output_computed`

### Shutdown_recommended (Priority: 5)

_Price below AVC in short run_

**Given:**
- `price` (input) lt `average_variable_cost`

**Then:**
- **emit_event** event: `firm.shutdown_recommended`

### Exit_recommended (Priority: 6)

_Price below ATC in long run_

**Given:**
- `price` (input) lt `average_total_cost`

**Then:**
- **emit_event** event: `firm.exit_recommended`

### Invalid_inputs (Priority: 10) — Error: `FIRM_INPUT_MISSING`

_Missing required inputs_

**Given:**
- ANY: `price` (input) not_exists OR `quantity` (input) not_exists

**Then:**
- **emit_event** event: `firm.optimisation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FIRM_INPUT_MISSING` | 400 | price and quantity are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `firm.optimal_output_computed` |  | `firm_id`, `optimal_quantity`, `max_profit`, `breakeven_quantity` |
| `firm.shutdown_recommended` |  | `firm_id`, `price`, `avc`, `rationale` |
| `firm.exit_recommended` |  | `firm_id`, `price`, `atc`, `rationale` |
| `firm.optimisation_rejected` |  | `firm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-structures-analysis | required |  |
| market-concentration-measures | recommended |  |

## AGI Readiness

### Goals

#### Reliable Profit Maximization Breakeven

Determine the profit-maximising output, breakeven quantity, and shutdown point of a firm using marginal revenue equals marginal cost and short-run average cost analysis

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
| `market_structures_analysis` | market-structures-analysis | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_optimal_output | `autonomous` | - | - |
| shutdown_recommended | `autonomous` | - | - |
| exit_recommended | `autonomous` | - | - |
| invalid_inputs | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
decision_rules_summary:
  - condition: P > ATC
    action: Produce; economic profit > 0
  - condition: P = ATC
    action: Produce; normal profit only (breakeven)
  - condition: AVC <= P < ATC
    action: "Short run: produce; long run: exit"
  - condition: P < AVC
    action: Shut down immediately (even short run)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Profit Maximization Breakeven Blueprint",
  "description": "Determine the profit-maximising output, breakeven quantity, and shutdown point of a firm using marginal revenue equals marginal cost and short-run average cost ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, profit-maximization, breakeven, shutdown, mr-mc, cfa-level-1"
}
</script>
