---
title: "Institutional Portfolio Management L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Institutional investor portfolio management — pension funds, SWFs, endowments, foundations, banks, and insurers — objectives, constraints, liabilities, risk, an"
---

# Institutional Portfolio Management L3 Blueprint

> Institutional investor portfolio management — pension funds, SWFs, endowments, foundations, banks, and insurers — objectives, constraints, liabilities, risk, and asset allocation

| | |
|---|---|
| **Feature** | `institutional-portfolio-management-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, institutional-investors, pension-fund, sovereign-wealth-fund, endowment, insurance, asset-liability-management, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/institutional-portfolio-management-l3.blueprint.yaml) |
| **JSON API** | [institutional-portfolio-management-l3.json]({{ site.baseurl }}/api/blueprints/trading/institutional-portfolio-management-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `investment_committee` | Investment Committee | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `institution_id` | text | Yes | Institution identifier |  |
| `institution_type` | select | Yes | defined_benefit_pension \| defined_contribution_pension \| sovereign_wealth_fund \| endowment \| foundation \| bank \| insurer |  |

## Rules

- **common_characteristics:**
  - **fiduciary:** All institutional investors have fiduciary duty to beneficiaries
  - **return_objective:** Must achieve return sufficient to meet obligations and spending
  - **risk_tolerance:** Constrained by liabilities, regulatory capital, stakeholder expectations
  - **long_horizon:** Most institutional investors have long (10+ year) investment horizons
  - **governance:** Investment committee, IPS, annual review; clear delegation of authority
- **defined_benefit_pension:**
  - **liabilities:** PV of promised pension payments; driven by discount rate and actuarial assumptions
  - **stakeholders:** Plan sponsor, active members, retirees, regulator, PBGC/guarantor
  - **investment_horizon:** Long; some obligations decades away; must consider mortality improvements
  - **liquidity:** Ongoing benefit payments; contributions reduce need; net CF may be positive or negative
  - **regulatory:** Funding ratio requirements; minimum contribution rules; investment restrictions
  - **risk:** Funded status risk; interest rate risk (liability duration > asset duration typical)
  - **objective:** Match liability duration; earn excess return above liability discount rate
  - **asset_allocation:** LDI core (bonds) + return-seeking (equities, alternatives)
- **defined_contribution_pension:**
  - **liabilities:** No defined liability; member bears investment risk
  - **objective:** Maximize long-term risk-adjusted return; appropriate glide path
  - **governance:** Offer menu of appropriate funds; default option should be diversified and age-appropriate
- **sovereign_wealth_fund:**
  - **types:** Stabilization, savings, reserve investment, development, pension reserve
  - **stakeholders:** Government, citizens, future generations
  - **horizon:** Very long (perpetual); intergenerational equity
  - **liquidity:** Stabilization funds: high liquidity; savings funds: low liquidity
  - **regulatory:** Often exempt from domestic regulation; political governance oversight
  - **objective:** Preserve real value of national wealth; generate returns for government spending
  - **asset_allocation:** Diversified; significant alternatives; long-horizon illiquidity premium
- **university_endowment:**
  - **liabilities:** Perpetual institution; spending rule (typically 5% annually)
  - **horizon:** Perpetual; support institution in perpetuity
  - **liquidity:** Annual spending needs; capital campaigns; building projects
  - **regulatory:** Tax-exempt; payout requirements vary by jurisdiction
  - **objective:** Real return > spending rate + inflation; preserve purchasing power
  - **asset_allocation:** Endowment model: heavy alternatives (PE, real assets, HF); low bonds
- **private_foundation:**
  - **liabilities:** Mandatory distribution (5% of assets/yr in US); grant-making obligations
  - **horizon:** Perpetual; some spend-down foundations have finite horizon
  - **liquidity:** Annual grant payments; must maintain liquidity for distributions
  - **regulatory:** IRS rules (US); payout floors; prohibited transactions
  - **objective:** Cover distributions + real return; maintain mission indefinitely
- **bank:**
  - **liabilities:** Deposits (short duration); wholesale funding; primarily floating rate
  - **objective:** ALM: manage net interest margin; earn spread between assets and funding cost
  - **regulatory:** Basel capital requirements; liquidity coverage ratio (LCR); net stable funding ratio
  - **portfolio_role:** Investment portfolio supplements loan book; liquidity buffer (HQLA)
  - **risk:** Interest rate risk; credit risk; funding/liquidity risk
- **insurer:**
  - **liabilities:** P&C: short duration, uncertain amounts; Life: long duration, more predictable
  - **objective:** Match liability duration and cash flows; maintain regulatory surplus
  - **regulatory:** Solvency II (EU); RBC capital requirements (US); investment grade requirements
  - **pc_insurer:** Short-duration liabilities; shorter asset duration; more equity possible if surplus large
  - **life_insurer:** Long-duration liabilities; must match duration precisely; bonds dominant
- **validation:**
  - **institution_required:** institution_id present
  - **valid_type:** institution_type in [defined_benefit_pension, defined_contribution_pension, sovereign_wealth_fund, endowment, foundation, bank, insurer]

## Outcomes

### Manage_institutional_portfolio (Priority: 1)

_Develop portfolio management framework for specified institution type_

**Given:**
- `institution_id` (input) exists
- `institution_type` (input) in `defined_benefit_pension,defined_contribution_pension,sovereign_wealth_fund,endowment,foundation,bank,insurer`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `institutional.portfolio.managed`

### Invalid_type (Priority: 10) — Error: `INSTITUTIONAL_INVALID_TYPE`

_Unsupported institution type_

**Given:**
- `institution_type` (input) not_in `defined_benefit_pension,defined_contribution_pension,sovereign_wealth_fund,endowment,foundation,bank,insurer`

**Then:**
- **emit_event** event: `institutional.portfolio.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSTITUTIONAL_INVALID_TYPE` | 400 | institution_type must be one of the supported institutional investor types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `institutional.portfolio.managed` |  | `institution_id`, `institution_type`, `asset_allocation`, `funded_ratio`, `expected_return` |
| `institutional.portfolio.rejected` |  | `institution_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| overview-asset-allocation-l3 | required |  |
| asset-allocation-alternatives-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Institutional Portfolio Management L3 Blueprint",
  "description": "Institutional investor portfolio management — pension funds, SWFs, endowments, foundations, banks, and insurers — objectives, constraints, liabilities, risk, an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, institutional-investors, pension-fund, sovereign-wealth-fund, endowment, insurance, asset-liability-management, cfa-level-3"
}
</script>
