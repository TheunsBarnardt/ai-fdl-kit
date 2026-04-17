---
title: "Portfolio Management Process Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Describe the three-step portfolio management process (planning, execution, feedback), types of investors, active vs. passive management, and the asset managemen"
---

# Portfolio Management Process Blueprint

> Describe the three-step portfolio management process (planning, execution, feedback), types of investors, active vs. passive management, and the asset management industry structure

| | |
|---|---|
| **Feature** | `portfolio-management-process` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, process, active-passive, investor-types, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-management-process.blueprint.yaml) |
| **JSON API** | [portfolio-management-process.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-management-process.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_mgr` | Portfolio Manager | human |  |
| `client` | Client Investor | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `mandate_id` | text | Yes | Mandate identifier |  |
| `investor_type` | select | Yes | individual \| pension \| endowment \| foundation \| insurance \| bank \| sovereign_wealth |  |
| `management_style` | select | Yes | active \| passive \| enhanced_index |  |

## Rules

- **three_step_process:**
  - **planning:** Understand client, define IPS, set asset allocation
  - **execution:** Implement asset allocation via security selection and trading
  - **feedback:** Monitor, rebalance, evaluate performance, update IPS
- **investor_types:**
  - **individual:** Lifecycle-dependent; taxable; human capital
  - **defined_benefit_pension:** Liability-driven; long horizon; tax-exempt
  - **defined_contribution_pension:** Individual accounts; participant-directed
  - **endowment:** Perpetual horizon; spending rule; intergenerational equity
  - **foundation:** Grant-making mandate; spending tied to mission
  - **insurance:** Asset-liability matching; regulatory capital
  - **bank:** Liquidity and capital management
  - **sovereign_wealth:** Macro objectives; long horizon; often exempt
- **active_vs_passive:**
  - **passive:** Track index; low fee; tax-efficient
  - **active:** Seek alpha; higher fee; tracking error
  - **enhanced_index:** Passive core with modest active bets
- **industry_structure:**
  - **traditional:** Long-only equity and fixed income managers
  - **alternative:** Hedge funds, private equity, real assets managers
  - **ownership:** Publicly listed firms, partnerships, bank-owned
- **pooled_vehicles:**
  - **mutual_funds:** Daily NAV; regulated; retail
  - **etfs:** Exchange-listed; intraday liquidity; tax-efficient via creation/redemption
  - **hedge_funds:** Limited partnerships; accredited investors; flexible strategies
  - **pe_vc_funds:** Closed-end; long lock-up; capital calls
- **validation:**
  - **mandate_required:** mandate_id present
  - **valid_investor:** investor_type in allowed set

## Outcomes

### Establish_mandate (Priority: 1)

_Establish portfolio mandate_

**Given:**
- `mandate_id` (input) exists
- `investor_type` (input) in `individual,pension,endowment,foundation,insurance,bank,sovereign_wealth`

**Then:**
- **call_service** target: `portfolio_mgr`
- **emit_event** event: `mandate.established`

### Invalid_investor (Priority: 10) — Error: `MANDATE_INVALID_INVESTOR`

_Unsupported investor type_

**Given:**
- `investor_type` (input) not_in `individual,pension,endowment,foundation,insurance,bank,sovereign_wealth`

**Then:**
- **emit_event** event: `mandate.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MANDATE_INVALID_INVESTOR` | 400 | investor_type must be a supported category | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mandate.established` |  | `mandate_id`, `investor_type`, `management_style`, `benchmark` |
| `mandate.rejected` |  | `mandate_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| investment-policy-statement-ips | required |  |
| strategic-asset-allocation | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Management Process Blueprint",
  "description": "Describe the three-step portfolio management process (planning, execution, feedback), types of investors, active vs. passive management, and the asset managemen",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, process, active-passive, investor-types, cfa-level-1"
}
</script>
