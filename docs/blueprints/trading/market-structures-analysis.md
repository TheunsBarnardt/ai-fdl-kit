---
title: "Market Structures Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify an industry by market structure — perfect competition, monopolistic competition, oligopoly, or monopoly — and infer pricing power, entry barriers, and "
---

# Market Structures Analysis Blueprint

> Classify an industry by market structure — perfect competition, monopolistic competition, oligopoly, or monopoly — and infer pricing power, entry barriers, and profitability implications

| | |
|---|---|
| **Feature** | `market-structures-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, market-structure, perfect-competition, monopoly, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-structures-analysis.blueprint.yaml) |
| **JSON API** | [market-structures-analysis.json]({{ site.baseurl }}/api/blueprints/trading/market-structures-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_analyst` | Market Structure Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `number_of_sellers` | select | Yes | many \| many_differentiated \| few \| one |  |
| `product_differentiation` | select | Yes | homogeneous \| differentiated |  |
| `barriers_to_entry` | select | Yes | none \| low \| high \| very_high |  |
| `pricing_power` | select | No | price_taker \| limited \| substantial \| price_maker |  |

## Rules

- **four_structures:**
  - **perfect_competition:**
    - **sellers:** many
    - **product:** homogeneous
    - **entry:** none
    - **pricing:** price_taker
    - **demand:** perfectly_elastic
    - **long_run_profit:** zero_economic_profit
  - **monopolistic_competition:**
    - **sellers:** many
    - **product:** differentiated
    - **entry:** low
    - **pricing:** limited
    - **demand:** downward_sloping_elastic
    - **long_run_profit:** zero_economic_profit
  - **oligopoly:**
    - **sellers:** few
    - **product:** either
    - **entry:** high
    - **pricing:** substantial
    - **demand:** kinked_or_game_theoretic
    - **long_run_profit:** can_persist_with_barriers
  - **monopoly:**
    - **sellers:** one
    - **product:** unique
    - **entry:** very_high
    - **pricing:** price_maker
    - **demand:** market_demand
    - **long_run_profit:** positive_with_barriers
- **key_questions:** How many firms compete?, Are products identical or differentiated?, Are there barriers to entry?, Do firms compete on price or other dimensions?
- **investment_implications:**
  - **perfect_competition:** Commodity-like returns; no sustainable margin
  - **monopolistic_competition:** Brand moats; temporary economic profit
  - **oligopoly:** Game theory dominates; coordination risk
  - **monopoly:** Highest margins but regulatory/antitrust risk
- **applications:**
  - **retail_banking:** Monopolistic competition among branded banks
  - **airlines:** Oligopoly with few major carriers on key routes
  - **utilities:** Regulated monopoly with fixed ROE
  - **agricultural_commodities:** Perfect competition for homogeneous products
- **validation:**
  - **valid_number:** number_of_sellers in {many, many_differentiated, few, one}
  - **valid_differentiation:** product_differentiation in {homogeneous, differentiated}
  - **valid_barriers:** barriers_to_entry in {none, low, high, very_high}

## Outcomes

### Classify_structure (Priority: 1)

_Assign an industry to one of four market structures_

**Given:**
- `number_of_sellers` (input) exists
- `product_differentiation` (input) exists
- `barriers_to_entry` (input) exists

**Then:**
- **call_service** target: `market_analyst`
- **emit_event** event: `market.structure_classified`

### Invalid_classification (Priority: 10) — Error: `MARKET_STRUCTURE_UNMATCHED`

_Inputs do not map to a known structure_

**Given:**
- `classification_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `market.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKET_STRUCTURE_UNMATCHED` | 400 | Inputs do not map to a recognised market structure | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market.structure_classified` |  | `industry_id`, `structure`, `pricing_power`, `implied_profitability` |
| `market.classification_rejected` |  | `industry_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| profit-maximization-breakeven | required |  |
| monopolistic-competition | recommended |  |
| oligopoly-pricing | recommended |  |
| monopoly-pricing | recommended |  |
| market-concentration-measures | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
structure_comparison_summary:
  dimensions:
    - number_of_sellers
    - product
    - barriers
    - pricing_power
    - long_run_profit
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Structures Analysis Blueprint",
  "description": "Classify an industry by market structure — perfect competition, monopolistic competition, oligopoly, or monopoly — and infer pricing power, entry barriers, and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, market-structure, perfect-competition, monopoly, cfa-level-1"
}
</script>
