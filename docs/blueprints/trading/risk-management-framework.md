---
title: "Risk Management Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Establish an enterprise risk management framework with governance, risk tolerance, risk identification (financial and non-financial), and risk measurement, miti"
---

# Risk Management Framework Blueprint

> Establish an enterprise risk management framework with governance, risk tolerance, risk identification (financial and non-financial), and risk measurement, mitigation, and monitoring

| | |
|---|---|
| **Feature** | `risk-management-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | risk-management, enterprise-risk, governance, financial-risk, non-financial-risk, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/risk-management-framework.blueprint.yaml) |
| **JSON API** | [risk-management-framework.json]({{ site.baseurl }}/api/blueprints/trading/risk-management-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `risk_officer` | Chief Risk Officer | human |  |
| `risk_system` | Risk Management System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rm_id` | text | Yes | Risk management identifier |  |
| `risk_type` | select | Yes | market \| credit \| liquidity \| operational \| model \| legal \| reputational |  |

## Rules

- **rm_process:**
  - **identify:** Catalogue risks — financial and non-financial
  - **measure:** Quantify exposure — VaR, stress tests, scenario analysis
  - **manage:** Accept, mitigate, transfer, or avoid
  - **monitor:** Continuous reporting against risk appetite
- **governance:**
  - **board:** Sets risk appetite; oversight via risk committee
  - **executive:** CRO responsible; enterprise view across silos
- **risk_tolerance:**
  - **willingness:** Strategic appetite for risk
  - **capacity:** Financial ability to bear risk
- **financial_risks:**
  - **market:** Price movements in equity, rates, FX, commodity
  - **credit:** Counterparty default
  - **liquidity:** Funding or market liquidity failure
- **non_financial_risks:**
  - **operational:** People, process, systems failure
  - **model:** Incorrect or misused model
  - **legal_regulatory:** Compliance and litigation
  - **reputational:** Brand damage
- **validation:**
  - **rm_required:** rm_id present
  - **valid_type:** risk_type in allowed set

## Outcomes

### Assess_risk (Priority: 1)

_Assess risk within ERM framework_

**Given:**
- `rm_id` (input) exists
- `risk_type` (input) in `market,credit,liquidity,operational,model,legal,reputational`

**Then:**
- **call_service** target: `risk_system`
- **emit_event** event: `risk.assessed`

### Invalid_type (Priority: 10) — Error: `RISK_INVALID_TYPE`

_Unsupported risk type_

**Given:**
- `risk_type` (input) not_in `market,credit,liquidity,operational,model,legal,reputational`

**Then:**
- **emit_event** event: `risk.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RISK_INVALID_TYPE` | 400 | risk_type must be a supported risk category | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `risk.assessed` |  | `rm_id`, `risk_type`, `exposure`, `mitigation_action` |
| `risk.assessment_rejected` |  | `rm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| risk-budgeting-tolerance | required |  |
| investment-policy-statement-ips | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Risk Management Framework Blueprint",
  "description": "Establish an enterprise risk management framework with governance, risk tolerance, risk identification (financial and non-financial), and risk measurement, miti",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "risk-management, enterprise-risk, governance, financial-risk, non-financial-risk, cfa-level-1"
}
</script>
