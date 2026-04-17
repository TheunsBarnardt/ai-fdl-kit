---
title: "Fixed Income Credit Risk Spreads Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Quantify credit risk via probability of default, loss given default, and expected loss, and decompose credit spreads into default, liquidity, and risk-premium c"
---

# Fixed Income Credit Risk Spreads Blueprint

> Quantify credit risk via probability of default, loss given default, and expected loss, and decompose credit spreads into default, liquidity, and risk-premium components

| | |
|---|---|
| **Feature** | `fixed-income-credit-risk-spreads` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, credit-risk, probability-of-default, loss-given-default, credit-spread, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-credit-risk-spreads.blueprint.yaml) |
| **JSON API** | [fixed-income-credit-risk-spreads.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-credit-risk-spreads.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `credit_risk_engine` | Credit Risk Decomposition Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `exposure_id` | text | Yes | Exposure identifier |  |
| `pd` | number | No | Probability of default (decimal) |  |
| `lgd` | number | No | Loss given default (decimal) |  |
| `exposure_amount` | number | No | Exposure at default |  |
| `rating_band` | select | No | investment_grade \| high_yield \| distressed |  |

## Rules

- **expected_loss:**
  - **formula:** PD * LGD * EAD
  - **interpretation:** Base case credit loss provision
- **recovery_rate:**
  - **formula:** 1 - LGD
  - **factors:** Seniority and collateral, Industry liquidation value, Jurisdiction and process
- **credit_spread_components:**
  - **default_compensation:** Expected loss across states
  - **risk_premium:** Compensation for systemic and uncertainty
  - **liquidity_premium:** Bid-ask and market-impact cost
  - **tax_premium:** Applicable for muni vs corporate
- **credit_migration:**
  - **transition_matrix:** Probabilities of rating changes over horizon
  - **credit_drift:** Net upgrades minus downgrades in portfolio
- **credit_cycle:**
  - **expansion:** Spreads compress, low defaults
  - **peak:** Covenant erosion, leverage high
  - **contraction:** Spreads widen, defaults rise
  - **trough:** Distressed opportunities; highest recovery prospects
- **portfolio_metrics:**
  - **concentration:** Name, industry, region
  - **diversification:** Correlated defaults cluster in recessions
- **validation:**
  - **exposure_required:** exposure_id present
  - **valid_pd:** pd between 0 and 1 when provided
  - **valid_lgd:** lgd between 0 and 1 when provided

## Outcomes

### Compute_credit_risk (Priority: 1)

_Compute expected loss and spread decomposition_

**Given:**
- `exposure_id` (input) exists

**Then:**
- **call_service** target: `credit_risk_engine`
- **emit_event** event: `credit_risk.computed`

### Invalid_pd (Priority: 10) — Error: `CREDIT_RISK_INVALID_PD`

_PD outside [0, 1]_

**Given:**
- ANY: `pd` (input) lt `0` OR `pd` (input) gt `1`

**Then:**
- **emit_event** event: `credit_risk.computation_rejected`

### Invalid_lgd (Priority: 11) — Error: `CREDIT_RISK_INVALID_LGD`

_LGD outside [0, 1]_

**Given:**
- ANY: `lgd` (input) lt `0` OR `lgd` (input) gt `1`

**Then:**
- **emit_event** event: `credit_risk.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_RISK_INVALID_PD` | 400 | pd must be between 0 and 1 | No |
| `CREDIT_RISK_INVALID_LGD` | 400 | lgd must be between 0 and 1 | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit_risk.computed` |  | `computation_id`, `exposure_id`, `expected_loss`, `spread_decomposition` |
| `credit_risk.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-credit-analysis | required |  |
| fixed-income-yield-spreads | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Credit Risk Spreads Blueprint",
  "description": "Quantify credit risk via probability of default, loss given default, and expected loss, and decompose credit spreads into default, liquidity, and risk-premium c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, credit-risk, probability-of-default, loss-given-default, credit-spread, cfa-level-1"
}
</script>
