---
title: "Oligopoly Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse oligopoly pricing and output decisions using Cournot output competition, Nash equilibrium, Stackelberg leadership, kinked demand, and cartel models. 5 f"
---

# Oligopoly Pricing Blueprint

> Analyse oligopoly pricing and output decisions using Cournot output competition, Nash equilibrium, Stackelberg leadership, kinked demand, and cartel models

| | |
|---|---|
| **Feature** | `oligopoly-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, oligopoly, game-theory, nash-equilibrium, cournot, cartel, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/oligopoly-pricing.blueprint.yaml) |
| **JSON API** | [oligopoly-pricing.json]({{ site.baseurl }}/api/blueprints/trading/oligopoly-pricing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `game_theory_engine` | Game Theory Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_id` | text | Yes | Market identifier |  |
| `number_of_firms` | number | Yes | Number of firms in the oligopoly (typically 2 to 10) |  |
| `model` | select | Yes | cournot \| stackelberg \| kinked_demand \| cartel \| bertrand |  |
| `market_demand` | json | No | Market demand schedule or inverse demand function |  |
| `cost_structure` | json | No | Cost functions for each firm |  |

## Rules

- **cournot_model:**
  - **definition:** Firms choose output simultaneously, assuming rivals hold output fixed
  - **equilibrium:** Nash equilibrium in quantities; each firm's Q is a best response given rivals
  - **duopoly_result:** Each firm produces 1/3 of monopoly output (with identical constant MC)
- **nash_equilibrium:**
  - **definition:** Strategy profile in which no firm can improve profit by unilaterally changing strategy
  - **existence:** Every finite game has at least one Nash equilibrium (possibly mixed)
- **stackelberg_model:**
  - **definition:** Sequential moves — a leader commits first, follower reacts
  - **result:** Leader gains first-mover advantage; total output higher than Cournot
- **kinked_demand:**
  - **assumption:** Rivals match price cuts but ignore price increases
  - **implication:** Demand is elastic above and inelastic below the current price -> price stability
  - **outcome:** Prices are sticky in oligopolies
- **cartel:**
  - **goal:** Coordinate on joint monopoly output and price
  - **challenge:** Each member has incentive to cheat; stability depends on detection and punishment
  - **examples:** OPEC, De Beers historically
- **bertrand_model:**
  - **assumption:** Firms compete on price with identical homogeneous products
  - **outcome:** Price driven to marginal cost even with two firms (Bertrand paradox)
- **factors_supporting_collusion:** Few firms (lower coordination cost), Homogeneous products, Similar cost structures, Repeated interaction, Low demand volatility, Transparent prices
- **investment_applications:**
  - **airline_routes:** Capacity discipline vs price wars — Cournot dynamics
  - **telecom:** Oligopoly with Stackelberg leader in new-market entry
  - **oil_market:** OPEC+ cartel behaviour and compliance monitoring
  - **beverage_duopoly:** Classic Bertrand-type brand-price competition
- **validation:**
  - **valid_model:** model in {cournot, stackelberg, kinked_demand, cartel, bertrand}
  - **n_firms_reasonable:** 2 <= number_of_firms <= 20

## Outcomes

### Simulate_oligopoly (Priority: 1)

_Compute equilibrium outputs and prices for the chosen model_

**Given:**
- `model` (input) in `cournot,stackelberg,kinked_demand,cartel,bertrand`
- `number_of_firms` (input) gte `2`

**Then:**
- **call_service** target: `game_theory_engine`
- **emit_event** event: `oligopoly.equilibrium_computed`

### Invalid_model (Priority: 10) — Error: `OLIGOPOLY_INVALID_MODEL`

_Unsupported oligopoly model_

**Given:**
- `model` (input) not_in `cournot,stackelberg,kinked_demand,cartel,bertrand`

**Then:**
- **emit_event** event: `oligopoly.equilibrium_rejected`

### Insufficient_firms (Priority: 11) — Error: `OLIGOPOLY_TOO_FEW_FIRMS`

_Single firm cannot be oligopoly_

**Given:**
- `number_of_firms` (input) lt `2`

**Then:**
- **emit_event** event: `oligopoly.equilibrium_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OLIGOPOLY_INVALID_MODEL` | 400 | model must be cournot, stackelberg, kinked_demand, cartel, or bertrand | No |
| `OLIGOPOLY_TOO_FEW_FIRMS` | 400 | Oligopoly requires at least 2 firms | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `oligopoly.equilibrium_computed` |  | `market_id`, `model`, `equilibrium_output`, `equilibrium_price`, `firm_profits` |
| `oligopoly.equilibrium_rejected` |  | `market_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-structures-analysis | required |  |
| monopoly-pricing | recommended |  |
| market-concentration-measures | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
duopoly_output_ranking:
  monopoly: Q_m — lowest combined output, highest price
  cartel: approximately Q_m if collusion holds
  stackelberg: Q_s > Q_cournot — leader forces larger total output
  cournot: Q_c — between Stackelberg and perfect competition
  bertrand: Q_pc — equal to perfect competition with P = MC
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Oligopoly Pricing Blueprint",
  "description": "Analyse oligopoly pricing and output decisions using Cournot output competition, Nash equilibrium, Stackelberg leadership, kinked demand, and cartel models. 5 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, oligopoly, game-theory, nash-equilibrium, cournot, cartel, cfa-level-1"
}
</script>
