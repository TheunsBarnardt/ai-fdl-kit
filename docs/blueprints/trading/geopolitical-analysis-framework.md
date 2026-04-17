---
title: "Geopolitical Analysis Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify state and non-state actors along cooperation/competition and globalization/nationalism axes to frame geopolitical analysis of investment impacts. 3 fie"
---

# Geopolitical Analysis Framework Blueprint

> Classify state and non-state actors along cooperation/competition and globalization/nationalism axes to frame geopolitical analysis of investment impacts

| | |
|---|---|
| **Feature** | `geopolitical-analysis-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, geopolitics, state-actors, globalization, nationalism, cooperation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/geopolitical-analysis-framework.blueprint.yaml) |
| **JSON API** | [geopolitical-analysis-framework.json]({{ site.baseurl }}/api/blueprints/trading/geopolitical-analysis-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `geopolitics_analyst` | Geopolitics Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `country_id` | text | Yes | Country / actor identifier |  |
| `cooperation_axis` | select | Yes | cooperation \| competition |  |
| `openness_axis` | select | Yes | globalization \| nationalism |  |

## Rules

- **actor_types:**
  - **state_actors:** Sovereign governments setting foreign, trade, and security policy
  - **non_state_actors:** Multinationals, NGOs, supranationals, armed groups, individuals with global influence
- **cooperation_vs_competition:**
  - **cooperation:** Countries align on rules, trade, standards — lowers transaction costs
  - **competition:** Countries pursue conflicting objectives — raises risk premia
- **globalization_vs_nationalism:**
  - **globalization:** Open flows of goods, capital, labour, data across borders
  - **nationalism:** Priority on domestic interests, protectionism, migration limits
- **four_archetypes:**
  - **globalization_cooperation:** Multilateralism — WTO, EU single market style
  - **globalization_competition:** Open rivalry — race for standards, economic statecraft
  - **nationalism_cooperation:** Regional blocs with inward focus — e.g., selective alliances
  - **nationalism_competition:** Autarky / confrontation — trade wars, sanctions, deglobalization
- **tools_of_geopolitics:**
  - **national_security:** Military, intelligence, cyber
  - **economic:** Sanctions, tariffs, export controls, capital controls
  - **financial:** SWIFT access, reserve currency, IMF / World Bank
- **validation:**
  - **country_required:** country_id present
  - **valid_axes:** both axes specified from allowed set

## Outcomes

### Classify_actor (Priority: 1)

_Place actor in the four-quadrant framework_

**Given:**
- `country_id` (input) exists
- `cooperation_axis` (input) in `cooperation,competition`
- `openness_axis` (input) in `globalization,nationalism`

**Then:**
- **call_service** target: `geopolitics_analyst`
- **emit_event** event: `geopolitics.actor_classified`

### Invalid_axis (Priority: 10) — Error: `GEO_INVALID_AXIS`

_Unsupported axis value_

**Given:**
- ANY: `cooperation_axis` (input) not_in `cooperation,competition` OR `openness_axis` (input) not_in `globalization,nationalism`

**Then:**
- **emit_event** event: `geopolitics.classification_rejected`

### Missing_country (Priority: 11) — Error: `GEO_COUNTRY_MISSING`

_Country missing_

**Given:**
- `country_id` (input) not_exists

**Then:**
- **emit_event** event: `geopolitics.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEO_INVALID_AXIS` | 400 | axis values must come from the allowed set | No |
| `GEO_COUNTRY_MISSING` | 400 | country_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `geopolitics.actor_classified` |  | `classification_id`, `country_id`, `archetype`, `recommended_stance` |
| `geopolitics.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| geopolitical-risk-types | recommended |  |
| international-trade-framework | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geopolitical Analysis Framework Blueprint",
  "description": "Classify state and non-state actors along cooperation/competition and globalization/nationalism axes to frame geopolitical analysis of investment impacts. 3 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, geopolitics, state-actors, globalization, nationalism, cooperation, cfa-level-1"
}
</script>
