---
title: "Investment Policy Statement Ips Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Draft an Investment Policy Statement covering risk and return objectives, liquidity, time horizon, tax, legal, unique circumstances, and ESG considerations for "
---

# Investment Policy Statement Ips Blueprint

> Draft an Investment Policy Statement covering risk and return objectives, liquidity, time horizon, tax, legal, unique circumstances, and ESG considerations for individual and institutional clients

| | |
|---|---|
| **Feature** | `investment-policy-statement-ips` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, ips, objectives, constraints, esg, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/investment-policy-statement-ips.blueprint.yaml) |
| **JSON API** | [investment-policy-statement-ips.json]({{ site.baseurl }}/api/blueprints/trading/investment-policy-statement-ips.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ips_drafter` | IPS Drafter | human |  |
| `client` | Client | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ips_id` | text | Yes | IPS identifier |  |
| `client_type` | select | Yes | individual \| institutional |  |
| `return_objective_type` | select | Yes | total \| absolute \| relative \| liability_driven |  |

## Rules

- **ips_components:**
  - **introduction:** Client and scope description
  - **statement_of_purpose:** Why the IPS exists
  - **duties_responsibilities:** Advisor, custodian, investor roles
  - **procedures:** Process for updates, reviews
  - **investment_objectives:** Risk and return
  - **investment_constraints:** Liquidity, horizon, tax, legal, unique
  - **investment_guidelines:** Permissible assets, prohibited investments
  - **evaluation_measurement:** Benchmarks, review frequency
  - **appendix:** Strategic asset allocation and rebalancing policy
- **risk_objective:**
  - **ability:** Wealth, horizon, income stability
  - **willingness:** Psychological tolerance
  - **conservative_of_the_two:** IPS risk tolerance = min(ability, willingness)
- **return_objective:**
  - **spending_plus_inflation:** Real return to sustain spending
  - **liability_match:** Meet fixed liabilities
  - **pre_post_tax:** State on consistent basis
- **constraints:**
  - **liquidity:** Near-term cash needs
  - **time_horizon:** Single or multi-stage
  - **tax:** Taxable vs. tax-deferred; jurisdiction
  - **legal_regulatory:** Fiduciary, prudent investor, prohibited assets
  - **unique_circumstances:** Concentrated holdings, ethical restrictions
  - **esg:** Exclusions, integration, impact objectives
- **validation:**
  - **ips_required:** ips_id present
  - **valid_client:** client_type in [individual, institutional]

## Outcomes

### Draft_ips (Priority: 1)

_Draft IPS document_

**Given:**
- `ips_id` (input) exists
- `client_type` (input) in `individual,institutional`

**Then:**
- **call_service** target: `ips_drafter`
- **emit_event** event: `ips.drafted`

### Invalid_client (Priority: 10) — Error: `IPS_INVALID_CLIENT`

_Unsupported client type_

**Given:**
- `client_type` (input) not_in `individual,institutional`

**Then:**
- **emit_event** event: `ips.draft_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IPS_INVALID_CLIENT` | 400 | client_type must be individual or institutional | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ips.drafted` |  | `ips_id`, `client_type`, `risk_tolerance`, `return_objective`, `constraints_count` |
| `ips.draft_rejected` |  | `ips_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-management-process | required |  |
| strategic-asset-allocation | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Investment Policy Statement Ips Blueprint",
  "description": "Draft an Investment Policy Statement covering risk and return objectives, liquidity, time horizon, tax, legal, unique circumstances, and ESG considerations for ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, ips, objectives, constraints, esg, cfa-level-1"
}
</script>
