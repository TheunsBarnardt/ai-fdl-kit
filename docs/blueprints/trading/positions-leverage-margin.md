---
title: "Positions Leverage Margin Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute returns on long, short, and leveraged positions including margin requirements, maintenance calls, and the leverage ratio effect on equity returns. 5 fie"
---

# Positions Leverage Margin Blueprint

> Compute returns on long, short, and leveraged positions including margin requirements, maintenance calls, and the leverage ratio effect on equity returns

| | |
|---|---|
| **Feature** | `positions-leverage-margin` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, leverage, margin, short-selling, returns, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/positions-leverage-margin.blueprint.yaml) |
| **JSON API** | [positions-leverage-margin.json]({{ site.baseurl }}/api/blueprints/trading/positions-leverage-margin.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `position_service` | Position & Leverage Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `position_id` | text | Yes | Position identifier |  |
| `direction` | select | Yes | long \| short |  |
| `purchase_price` | number | Yes | Entry price |  |
| `initial_margin` | number | Yes | Initial margin fraction (decimal) |  |
| `maintenance_margin` | number | Yes | Maintenance margin fraction (decimal) |  |

## Rules

- **long_vs_short:**
  - **long:** Own the asset; profit if price rises
  - **short:** Borrow and sell; profit if price falls; pay dividends and borrow fee
- **leverage_ratio:**
  - **formula:** Position value / equity invested
  - **effect:** Amplifies gains and losses; small price moves move equity substantially
- **margin_mechanics:**
  - **initial_margin:** Equity required at trade inception (e.g., 50 percent)
  - **maintenance_margin:** Minimum equity ratio ongoing (e.g., 25 percent)
  - **call_price_long:** P0 * (1 - initial_margin) / (1 - maintenance_margin)
  - **call_price_short:** P0 * (1 + initial_margin) / (1 + maintenance_margin)
- **leveraged_return:**
  - **formula:** Return / initial_margin - borrowing_cost * (1 - initial_margin) / initial_margin
  - **risk:** Same magnitude on the downside; full loss possible with low margins
- **short_sale_considerations:**
  - **dividends:** Short seller pays dividends to lender
  - **rebate:** Lender returns part of short-sale proceeds interest
  - **recall_risk:** Lender may recall shares; force cover at unfavourable price
- **validation:**
  - **position_required:** position_id present
  - **valid_direction:** direction in [long, short]
  - **valid_margins:** 0 < initial_margin <= 1 and 0 < maintenance_margin < initial_margin

## Outcomes

### Compute_position_economics (Priority: 1)

_Compute leveraged return and margin-call price_

**Given:**
- `position_id` (input) exists
- `direction` (input) in `long,short`
- `initial_margin` (input) gt `0`
- `maintenance_margin` (input) gt `0`

**Then:**
- **call_service** target: `position_service`
- **emit_event** event: `position.computed`

### Invalid_direction (Priority: 10) — Error: `POS_INVALID_DIRECTION`

_Direction not long or short_

**Given:**
- `direction` (input) not_in `long,short`

**Then:**
- **emit_event** event: `position.computation_rejected`

### Invalid_margin (Priority: 11) — Error: `POS_INVALID_MARGIN`

_Margin parameters inconsistent_

**Given:**
- ANY: `initial_margin` (input) lte `0` OR `maintenance_margin` (input) lte `0`

**Then:**
- **emit_event** event: `position.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POS_INVALID_DIRECTION` | 400 | direction must be long or short | No |
| `POS_INVALID_MARGIN` | 400 | initial_margin and maintenance_margin must be positive fractions | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `position.computed` |  | `position_id`, `leveraged_return`, `call_price`, `equity` |
| `position.computation_rejected` |  | `position_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-types-execution | recommended |  |
| financial-markets-functions | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Positions Leverage Margin Blueprint",
  "description": "Compute returns on long, short, and leveraged positions including margin requirements, maintenance calls, and the leverage ratio effect on equity returns. 5 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, leverage, margin, short-selling, returns, cfa-level-1"
}
</script>
