---
title: "Monopolistic Competition Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Model pricing, output, and long-run equilibrium in monopolistic competition — many firms selling differentiated products with free entry and downward-sloping de"
---

# Monopolistic Competition Blueprint

> Model pricing, output, and long-run equilibrium in monopolistic competition — many firms selling differentiated products with free entry and downward-sloping demand for each firm

| | |
|---|---|
| **Feature** | `monopolistic-competition` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, monopolistic-competition, product-differentiation, brand, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/monopolistic-competition.blueprint.yaml) |
| **JSON API** | [monopolistic-competition.json]({{ site.baseurl }}/api/blueprints/trading/monopolistic-competition.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Firm Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `firm_id` | text | Yes | Firm identifier |  |
| `own_demand_curve` | json | No | Firm-level demand schedule |  |
| `marginal_cost` | number | No | MC at current output |  |
| `marginal_revenue` | number | No | MR at current output |  |
| `average_total_cost` | number | No | ATC at current output |  |
| `time_horizon` | select | No | short_run \| long_run |  |

## Rules

- **demand_in_monopolistic_competition:**
  - **firm_demand_slope:** Downward-sloping — firms have some pricing power due to differentiation
  - **elasticity:** Relatively elastic because many close substitutes exist
  - **shift_factors:** Advertising, quality, branding, product variety
- **supply_and_optimal_output:**
  - **rule:** Profit max at MR = MC; price set from demand curve at that quantity
  - **output_less_than_mes:** Firms produce below minimum efficient scale — 'excess capacity theorem'
- **long_run_equilibrium:**
  - **entry_drives_profit_to_zero:** Free entry competes away economic profit
  - **condition:** P = ATC at MR = MC output (demand curve tangent to ATC)
  - **outcome:** Normal accounting profit, zero economic profit, excess capacity
- **non_price_competition:**
  - **channels:** Advertising, R&D, product features, service, packaging, brand equity
  - **role:** Shift demand curve outward and make it less elastic
  - **risk:** Advertising cost can dissipate any economic profit
- **investment_applications:**
  - **brand_value_analysis:** Measure moat strength via price premium sustainability
  - **retail_apparel:** High-differentiation, low-entry-barriers example
  - **packaged_goods:** Heavy advertising sustains pricing power short term
  - **restaurants:** Classic monopolistic competition
- **validation:**
  - **firm_id_present:** firm_id required
  - **valid_horizon:** time_horizon in {short_run, long_run}

## Outcomes

### Compute_short_run_equilibrium (Priority: 1)

_Short-run optimum at MR = MC_

**Given:**
- `time_horizon` (input) eq `short_run`
- `marginal_cost` (input) exists
- `marginal_revenue` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `moncomp.short_run_computed`

### Compute_long_run_equilibrium (Priority: 2)

_Long-run normal-profit equilibrium_

**Given:**
- `time_horizon` (input) eq `long_run`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `moncomp.long_run_computed`

### Missing_inputs (Priority: 10) — Error: `MONCOMP_MISSING_INPUT`

_Required cost/revenue data missing_

**Given:**
- `firm_id` (input) not_exists

**Then:**
- **emit_event** event: `moncomp.equilibrium_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MONCOMP_MISSING_INPUT` | 400 | firm_id and cost/revenue data required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `moncomp.short_run_computed` |  | `firm_id`, `optimal_quantity`, `optimal_price`, `short_run_profit` |
| `moncomp.long_run_computed` |  | `firm_id`, `equilibrium_quantity`, `equilibrium_price`, `normal_profit_only` |
| `moncomp.equilibrium_rejected` |  | `firm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-structures-analysis | required |  |
| profit-maximization-breakeven | required |  |

## AGI Readiness

### Goals

#### Reliable Monopolistic Competition

Model pricing, output, and long-run equilibrium in monopolistic competition — many firms selling differentiated products with free entry and downward-sloping demand for each firm

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
| `profit_maximization_breakeven` | profit-maximization-breakeven | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_short_run_equilibrium | `autonomous` | - | - |
| compute_long_run_equilibrium | `autonomous` | - | - |
| missing_inputs | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
excess_capacity_note:
  result: In long-run equilibrium, output lies to the left of minimum ATC
  implication: Monopolistically competitive industries operate with 'unused'
    efficient-scale capacity
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Monopolistic Competition Blueprint",
  "description": "Model pricing, output, and long-run equilibrium in monopolistic competition — many firms selling differentiated products with free entry and downward-sloping de",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, monopolistic-competition, product-differentiation, brand, cfa-level-1"
}
</script>
