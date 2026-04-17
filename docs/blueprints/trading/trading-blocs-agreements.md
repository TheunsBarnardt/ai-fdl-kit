---
title: "Trading Blocs Agreements Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify trading blocs and free trade agreements by depth of integration — FTA, customs union, common market, economic union, monetary union — and assess trade "
---

# Trading Blocs Agreements Blueprint

> Classify trading blocs and free trade agreements by depth of integration — FTA, customs union, common market, economic union, monetary union — and assess trade creation vs diversion

| | |
|---|---|
| **Feature** | `trading-blocs-agreements` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, trading-blocs, free-trade-agreement, customs-union, common-market, monetary-union, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/trading-blocs-agreements.blueprint.yaml) |
| **JSON API** | [trading-blocs-agreements.json]({{ site.baseurl }}/api/blueprints/trading/trading-blocs-agreements.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `bloc_analyst` | Trading Bloc Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bloc_id` | text | Yes | Bloc or agreement identifier |  |
| `integration_level` | select | Yes | fta \| customs_union \| common_market \| economic_union \| monetary_union |  |

## Rules

- **levels_of_integration:**
  - **fta:** Eliminate internal tariffs; members keep own external tariffs
  - **customs_union:** FTA + common external tariff
  - **common_market:** Customs union + free movement of labour and capital
  - **economic_union:** Common market + harmonised economic policies
  - **monetary_union:** Economic union + common currency
- **trade_effects:**
  - **trade_creation:** Shift from high-cost domestic to low-cost member producer — welfare gain
  - **trade_diversion:** Shift from low-cost non-member to higher-cost member producer — welfare loss
  - **net_effect:** Welfare impact depends on relative magnitudes
- **examples:**
  - **eu:** Monetary union (eurozone) + common market for non-euro members
  - **nafta_usmca:** Free trade agreement
  - **mercosur:** Customs union with internal exceptions
  - **asean:** Free trade agreement with deepening services coverage
- **applications:**
  - **equity_sector_exposure:** Manufacturers gain market access but face intra-bloc competition
  - **fx_analysis:** Monetary unions eliminate intra-bloc FX but concentrate regional risk
  - **supply_chain:** Common rules-of-origin reshape production networks
- **validation:**
  - **bloc_required:** bloc_id present
  - **valid_integration:** integration_level in allowed set

## Outcomes

### Classify_bloc (Priority: 1)

_Assign integration level and assess trade creation / diversion_

**Given:**
- `bloc_id` (input) exists
- `integration_level` (input) in `fta,customs_union,common_market,economic_union,monetary_union`

**Then:**
- **call_service** target: `bloc_analyst`
- **emit_event** event: `bloc.classified`

### Invalid_level (Priority: 10) — Error: `BLOC_INVALID_LEVEL`

_Unsupported integration level_

**Given:**
- `integration_level` (input) not_in `fta,customs_union,common_market,economic_union,monetary_union`

**Then:**
- **emit_event** event: `bloc.classification_rejected`

### Missing_bloc (Priority: 11) — Error: `BLOC_ID_MISSING`

_Bloc id missing_

**Given:**
- `bloc_id` (input) not_exists

**Then:**
- **emit_event** event: `bloc.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BLOC_INVALID_LEVEL` | 400 | integration_level must be fta, customs_union, common_market, economic_union, or monetary_union | No |
| `BLOC_ID_MISSING` | 400 | bloc_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bloc.classified` |  | `classification_id`, `bloc_id`, `integration_level`, `trade_creation`, `trade_diversion` |
| `bloc.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| international-trade-framework | required |  |
| trade-restrictions-tariffs | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trading Blocs Agreements Blueprint",
  "description": "Classify trading blocs and free trade agreements by depth of integration — FTA, customs union, common market, economic union, monetary union — and assess trade ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, trading-blocs, free-trade-agreement, customs-union, common-market, monetary-union, cfa-level-1"
}
</script>
