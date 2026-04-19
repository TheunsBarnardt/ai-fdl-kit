---
title: "Cfa Ethics Application L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Applied ethics for Level 3 — case study applications of CFA Standards and Asset Manager Code of Professional Conduct covering loyalty, investment process, tradi"
---

# Cfa Ethics Application L3 Blueprint

> Applied ethics for Level 3 — case study applications of CFA Standards and Asset Manager Code of Professional Conduct covering loyalty, investment process, trading, risk, performance, and disclosure

| | |
|---|---|
| **Feature** | `cfa-ethics-application-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, professional-conduct, asset-manager-code, applied-ethics, fiduciary, portfolio-ethics, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cfa-ethics-application-l3.blueprint.yaml) |
| **JSON API** | [cfa-ethics-application-l3.json]({{ site.baseurl }}/api/blueprints/trading/cfa-ethics-application-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cfa_member` | CFA Member or Candidate | human |  |
| `compliance_officer` | Compliance Officer | human |  |
| `asset_manager` | Asset Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Ethics case identifier |  |
| `amc_area` | select | Yes | loyalty \| investment_process \| trading \| risk_compliance \| performance \| disclosure |  |

## Rules

- **l3_application_themes:**
  - **portfolio_context:** At L3, ethics must be applied in the context of portfolio management — IPS, suitability, performance, conflicts
  - **dual_roles:** Members may have multiple roles (PM, analyst, trader); conflicts between roles must be managed
  - **institutional_context:** Fiduciary duties extend to beneficiaries, not just named clients; pensions, endowments
  - **complex_situations:** L3 cases involve nuanced conflicts: soft dollars, referral fees, directed brokerage, trade allocation
- **asset_manager_code_loyalty:**
  - **client_first:** Act in clients' best interests; subordinate personal interests and employer interests
  - **prudent_care:** Invest with care, loyalty, and due diligence appropriate to the mandate
  - **reasonable_cost:** Seek best execution; avoid unnecessary costs; soft dollars must be for client benefit
  - **proxy_voting:** Vote proxies in clients' interests; establish written proxy voting policy
  - **no_advantage:** Do not use clients' assets for personal benefit; no self-dealing
- **investment_process:**
  - **strategy_adherence:** Manage in accordance with stated strategy, style, and risk; no style drift
  - **risk_limits:** Adhere to risk limits; escalate when limits are breached
  - **market_manipulation:** Never use any strategy that artificially influences prices
  - **short_selling:** Permitted but must not constitute market manipulation; cover in good faith
  - **benchmark_consistency:** Only compare to appropriate benchmark; disclose benchmark methodology
- **trading_conduct:**
  - **best_execution:** Seek best execution on all trades; document selection criteria
  - **soft_dollars:** Soft dollars only for investment-related research benefiting clients
  - **directed_brokerage:** If client directs brokers, disclose impact on execution quality
  - **personal_trading:** No front-running; personal trades must not disadvantage clients; disclosure required
  - **trade_allocation:** Systematic and fair allocation across clients; no cherry-picking for favorites
- **risk_and_compliance:**
  - **risk_management:** Implement risk management framework; measure and monitor; report to clients
  - **compliance_systems:** Robust compliance; regular review; independent oversight
  - **business_continuity:** Document and test business continuity and disaster recovery plans
  - **customary_records:** Maintain records supporting all investment decisions and compliance monitoring
  - **reporting:** Report compliance violations to management and relevant authorities promptly
- **performance_evaluation:**
  - **fair_presentation:** Present performance completely and fairly; no selective cherry-picking
  - **composite_integrity:** Include all fee-paying discretionary accounts; terminated accounts for relevant periods
  - **gips_recommended:** Comply with GIPS or explain deviation; third-party verification preferred
  - **simulation_disclosure:** Clearly disclose if performance includes back-tested or simulated results
- **disclosures:**
  - **conflicts:** Disclose all material conflicts of interest in writing at least annually
  - **fees:** Full fee schedule; any soft dollars; referral arrangements; performance fees
  - **risks:** Describe investment risks in plain language; material strategy risks
  - **regulatory:** Regulatory and legal matters; sanctions; compliance exceptions
  - **client_access:** Clients should have access to personnel and procedures on request
- **validation:**
  - **case_required:** case_id present
  - **valid_area:** amc_area in [loyalty, investment_process, trading, risk_compliance, performance, disclosure]

## Outcomes

### Apply_ethics_framework (Priority: 1)

_Apply ethics framework to specified Asset Manager Code area_

**Given:**
- `case_id` (input) exists
- `amc_area` (input) in `loyalty,investment_process,trading,risk_compliance,performance,disclosure`

**Then:**
- **call_service** target: `compliance_officer`
- **emit_event** event: `ethics.application.reviewed`

### Invalid_area (Priority: 10) — Error: `ETHICS_APP_INVALID_AREA`

_Unsupported AMC area_

**Given:**
- `amc_area` (input) not_in `loyalty,investment_process,trading,risk_compliance,performance,disclosure`

**Then:**
- **emit_event** event: `ethics.application.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETHICS_APP_INVALID_AREA` | 400 | amc_area must be one of loyalty, investment_process, trading, risk_compliance, performance, disclosure | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ethics.application.reviewed` |  | `case_id`, `amc_area`, `compliance_status`, `remediation_required` |
| `ethics.application.rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-ethics-standards-l3 | required |  |
| gips-standards-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cfa Ethics Application L3 Blueprint",
  "description": "Applied ethics for Level 3 — case study applications of CFA Standards and Asset Manager Code of Professional Conduct covering loyalty, investment process, tradi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, professional-conduct, asset-manager-code, applied-ethics, fiduciary, portfolio-ethics, cfa-level-3"
}
</script>
