---
title: "Infrastructure Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate infrastructure investments by stage (greenfield vs. brownfield), category (economic, social), return profile, and diversification and inflation-hedging"
---

# Infrastructure Investments Blueprint

> Evaluate infrastructure investments by stage (greenfield vs. brownfield), category (economic, social), return profile, and diversification and inflation-hedging benefits

| | |
|---|---|
| **Feature** | `infrastructure-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | infrastructure, greenfield, brownfield, ppp, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/infrastructure-investments.blueprint.yaml) |
| **JSON API** | [infrastructure-investments.json]({{ site.baseurl }}/api/blueprints/trading/infrastructure-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `infra_analyst` | Infrastructure Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `infra_id` | text | Yes | Infrastructure analysis identifier |  |
| `stage` | select | Yes | greenfield \| brownfield |  |
| `category` | select | Yes | economic \| social |  |

## Rules

- **stages:**
  - **greenfield:** New construction; higher construction and demand risk, higher expected return
  - **brownfield:** Operating asset; lower risk, more predictable cash flow
- **categories:**
  - **economic:** Transport, utilities, energy, communications — revenue-generating
  - **social:** Hospitals, schools, prisons — availability payments
- **return_profile:**
  - **cash_yield_focus:** Long-duration stable cash flows; lower capital appreciation
  - **regulation_risk:** Regulated returns constrain upside; political risk in some jurisdictions
  - **inflation_linkage:** Many contracts index revenues to CPI — natural inflation hedge
- **ppp_structures:**
  - **rule:** Private sector finances, builds, operates; public partner provides concession
- **diversification:**
  - **benefit:** Low correlation with equities; matches long-duration liabilities for pension funds
- **validation:**
  - **infra_required:** infra_id present
  - **valid_stage:** stage in [greenfield, brownfield]
  - **valid_category:** category in [economic, social]

## Outcomes

### Analyse_infrastructure (Priority: 1)

_Analyse infrastructure investment_

**Given:**
- `infra_id` (input) exists
- `stage` (input) in `greenfield,brownfield`
- `category` (input) in `economic,social`

**Then:**
- **call_service** target: `infra_analyst`
- **emit_event** event: `infra.analysed`

### Invalid_stage (Priority: 10) — Error: `INFRA_INVALID_STAGE`

_Unsupported stage_

**Given:**
- `stage` (input) not_in `greenfield,brownfield`

**Then:**
- **emit_event** event: `infra.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INFRA_INVALID_STAGE` | 400 | stage must be greenfield or brownfield | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `infra.analysed` |  | `infra_id`, `stage`, `category`, `expected_yield`, `cash_flow_duration` |
| `infra.analysis_rejected` |  | `infra_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| real-estate-investments | recommended |  |
| alt-investments-features-categories | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Infrastructure Investments Blueprint",
  "description": "Evaluate infrastructure investments by stage (greenfield vs. brownfield), category (economic, social), return profile, and diversification and inflation-hedging",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "infrastructure, greenfield, brownfield, ppp, cfa-level-1"
}
</script>
