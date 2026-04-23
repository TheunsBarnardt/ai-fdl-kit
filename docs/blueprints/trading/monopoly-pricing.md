---
title: "Monopoly Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Determine the profit-maximising price and quantity for a monopolist using MR = MC, analyse price discrimination, and evaluate regulatory responses to monopoly p"
---

# Monopoly Pricing Blueprint

> Determine the profit-maximising price and quantity for a monopolist using MR = MC, analyse price discrimination, and evaluate regulatory responses to monopoly power

| | |
|---|---|
| **Feature** | `monopoly-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, monopoly, price-discrimination, deadweight-loss, regulation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/monopoly-pricing.blueprint.yaml) |
| **JSON API** | [monopoly-pricing.json]({{ site.baseurl }}/api/blueprints/trading/monopoly-pricing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Monopoly Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `firm_id` | text | Yes | Monopolist identifier |  |
| `market_demand` | json | Yes | Market demand schedule or inverse demand function |  |
| `marginal_cost` | number | No | Constant or schedule of marginal cost |  |
| `regulation` | select | No | none \| price_cap \| rate_of_return \| breakup |  |
| `price_discrimination` | select | No | none \| first_degree \| second_degree \| third_degree |  |

## Rules

- **monopoly_optimum:**
  - **rule:** Profit max at MR = MC; price set from demand curve at that quantity
  - **mr_formula:** MR = P * (1 - 1/|elasticity|) for linear demand
  - **markup_rule:** P = MC / (1 - 1/|elasticity|) — Lerner markup
- **barriers_to_entry:**
  - **legal:** Patents, licenses, exclusive franchises
  - **natural:** Economies of scale that make single firm most efficient
  - **resource:** Control of essential input
  - **strategic:** Predatory pricing, exclusive contracts
- **price_discrimination:**
  - **first_degree:** Charge each customer their maximum willingness to pay
  - **second_degree:** Volume or quality tiers (e.g., block pricing, versioning)
  - **third_degree:** Different prices to identifiable groups (students, seniors)
  - **requirements:** Market power, Ability to segment customers, Prevent resale between segments
- **natural_monopoly:**
  - **definition:** Industry in which single firm has lowest LRAC (declining throughout)
  - **examples:** Water distribution, local electricity grid, rail infrastructure
  - **regulation_rationale:** Avoid monopoly markup while preserving scale economies
- **regulation_approaches:**
  - **price_cap:** Regulator sets maximum price (often at ATC or below)
  - **rate_of_return:** Guaranteed return on invested capital; risks over-investment (Averch-Johnson)
  - **marginal_cost_pricing:** P = MC; requires subsidy since P < ATC in natural monopoly
  - **average_cost_pricing:** P = ATC; zero economic profit, socially second-best
- **investment_applications:**
  - **pharma_patents:** Temporary monopoly during patent life
  - **utility_valuation:** Regulated ROE constrains monopoly profit
  - **tech_platforms:** Network-effect near-monopoly with antitrust scrutiny
  - **music_streaming:** Price discrimination via subscription tiers
- **validation:**
  - **firm_id_present:** firm_id required
  - **demand_present:** market_demand required
  - **valid_regulation:** regulation in {none, price_cap, rate_of_return, breakup}

## Outcomes

### Compute_monopoly_price (Priority: 1)

_Unregulated monopoly optimum_

**Given:**
- `regulation` (input) eq `none`
- `market_demand` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `monopoly.optimum_computed`

### Apply_regulation (Priority: 2)

_Regulated price and quantity_

**Given:**
- `regulation` (input) in `price_cap,rate_of_return`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `monopoly.regulation_applied`

### Missing_demand (Priority: 10) — Error: `MONOPOLY_DEMAND_MISSING`

_Market demand missing_

**Given:**
- `market_demand` (input) not_exists

**Then:**
- **emit_event** event: `monopoly.pricing_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MONOPOLY_DEMAND_MISSING` | 400 | market_demand is required to compute monopoly optimum | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `monopoly.optimum_computed` |  | `firm_id`, `monopoly_price`, `monopoly_quantity`, `economic_profit`, `deadweight_loss` |
| `monopoly.regulation_applied` |  | `firm_id`, `regulated_price`, `regulated_quantity`, `consumer_surplus` |
| `monopoly.pricing_rejected` |  | `firm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-structures-analysis | required |  |
| profit-maximization-breakeven | required |  |
| oligopoly-pricing | recommended |  |

## AGI Readiness

### Goals

#### Reliable Monopoly Pricing

Determine the profit-maximising price and quantity for a monopolist using MR = MC, analyse price discrimination, and evaluate regulatory responses to monopoly power

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
| compute_monopoly_price | `autonomous` | - | - |
| apply_regulation | `autonomous` | - | - |
| missing_demand | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
lerner_index:
  formula: L = (P - MC) / P = 1 / |elasticity|
  interpretation: Markup relative to price; higher L signals more market power
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Monopoly Pricing Blueprint",
  "description": "Determine the profit-maximising price and quantity for a monopolist using MR = MC, analyse price discrimination, and evaluate regulatory responses to monopoly p",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, monopoly, price-discrimination, deadweight-loss, regulation, cfa-level-1"
}
</script>
