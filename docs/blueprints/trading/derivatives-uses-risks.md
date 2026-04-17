---
title: "Derivatives Uses Risks Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Catalogue derivative benefits and risks for issuers and investors — hedging, speculation, cost-efficiency, leverage, counterparty risk, operational and legal ri"
---

# Derivatives Uses Risks Blueprint

> Catalogue derivative benefits and risks for issuers and investors — hedging, speculation, cost-efficiency, leverage, counterparty risk, operational and legal risks

| | |
|---|---|
| **Feature** | `derivatives-uses-risks` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, hedging, speculation, counterparty-risk, leverage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-uses-risks.blueprint.yaml) |
| **JSON API** | [derivatives-uses-risks.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-uses-risks.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `deriv_use_analyst` | Derivative Use & Risk Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `program_id` | text | Yes | Derivative program identifier |  |
| `user_type` | select | Yes | issuer \| investor \| market_maker \| speculator |  |
| `primary_purpose` | select | Yes | hedge \| speculate \| arbitrage \| synthetic_exposure \| income |  |

## Rules

- **benefits:**
  - **risk_transfer:** Shift unwanted exposures to counterparties willing to bear them
  - **price_discovery:** Forward and futures curves reveal expected prices
  - **operational_efficiency:** Lower transaction cost vs building cash positions
  - **leverage:** Margin-based exposure amplifies capital efficiency
  - **market_completeness:** Access to payoffs not otherwise available
- **issuer_uses:** Hedge floating-rate debt with IRS, Lock in FX on foreign revenue, Commodity input hedging, Monetise inventory via variance/vol swaps
- **investor_uses:** Portfolio overlay for beta management, Convexity trades via options, Income via writing covered calls, Credit views via CDS
- **risk_categories:**
  - **market_risk:** Price changes in underlying
  - **counterparty_risk:** Default of OTC counterparty
  - **liquidity_risk:** Inability to close out at fair price
  - **operational_risk:** Collateral, settlement, data errors
  - **legal_risk:** Enforceability of contracts across jurisdictions
  - **basis_risk:** Imperfect hedge relationship
- **moral_hazard:**
  - **concern:** Excessive risk-taking encouraged by off-balance-sheet leverage
  - **mitigation:** Transparency, disclosure, centralised clearing
- **regulatory_framework:**
  - **dodd_frank:** US post-2008 clearing mandate
  - **emir:** EU reporting and clearing
  - **initial_margin_reform:** Phased IM on uncleared OTC
- **validation:**
  - **program_required:** program_id present
  - **valid_purpose:** primary_purpose in allowed set

## Outcomes

### Assess_program (Priority: 1)

_Assess derivative program purpose and risk profile_

**Given:**
- `program_id` (input) exists
- `primary_purpose` (input) in `hedge,speculate,arbitrage,synthetic_exposure,income`

**Then:**
- **call_service** target: `deriv_use_analyst`
- **emit_event** event: `deriv_program.assessed`

### Invalid_purpose (Priority: 10) — Error: `DERIV_USE_INVALID_PURPOSE`

_Unsupported purpose_

**Given:**
- `primary_purpose` (input) not_in `hedge,speculate,arbitrage,synthetic_exposure,income`

**Then:**
- **emit_event** event: `deriv_program.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DERIV_USE_INVALID_PURPOSE` | 400 | primary_purpose must be hedge, speculate, arbitrage, synthetic_exposure, or income | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `deriv_program.assessed` |  | `program_id`, `purpose`, `risk_profile` |
| `deriv_program.assessment_rejected` |  | `program_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-instrument-features | required |  |
| derivatives-arbitrage-replication | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Uses Risks Blueprint",
  "description": "Catalogue derivative benefits and risks for issuers and investors — hedging, speculation, cost-efficiency, leverage, counterparty risk, operational and legal ri",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, hedging, speculation, counterparty-risk, leverage, cfa-level-1"
}
</script>
