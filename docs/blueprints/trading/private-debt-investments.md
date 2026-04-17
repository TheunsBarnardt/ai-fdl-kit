---
title: "Private Debt Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate private debt categories (direct lending, mezzanine, distressed, venture debt, unitranche) by seniority, yield, covenants, and risk-return and compare w"
---

# Private Debt Investments Blueprint

> Evaluate private debt categories (direct lending, mezzanine, distressed, venture debt, unitranche) by seniority, yield, covenants, and risk-return and compare with private equity

| | |
|---|---|
| **Feature** | `private-debt-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | private-debt, direct-lending, mezzanine, distressed-debt, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/private-debt-investments.blueprint.yaml) |
| **JSON API** | [private-debt-investments.json]({{ site.baseurl }}/api/blueprints/trading/private-debt-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pd_analyst` | Private Debt Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pd_id` | text | Yes | Private debt analysis identifier |  |
| `pd_category` | select | Yes | direct_lending \| mezzanine \| distressed \| venture_debt \| unitranche |  |
| `seniority` | select | Yes | senior \| subordinated \| junior |  |

## Rules

- **categories:**
  - **direct_lending:** Senior secured loans to middle-market companies, often floating-rate
  - **mezzanine:** Junior debt with equity kickers (warrants); higher yield
  - **distressed:** Debt of troubled issuers; loan-to-own or restructuring
  - **venture_debt:** Loans to VC-backed startups; warrants for upside
  - **unitranche:** Combined senior/subordinated in single instrument; simpler capital stack
- **risk_return:**
  - **direct_lending:** Steady cash yield 6-9%; credit risk moderate
  - **mezzanine:** Total return 10-15% blending coupon and equity kickers
  - **distressed:** Return dispersion high; requires restructuring expertise
- **covenants_and_structure:**
  - **covenant_lite:** Weakened investor protection; common in syndicated market
  - **financial_maintenance:** Required in most private direct loans
  - **security_package:** First lien typical for direct; junior liens for mezz
- **diversification_benefits:**
  - **floating_rate_hedge:** Direct lending provides rate sensitivity opposite of fixed-income duration
  - **low_mark_to_market:** Appraisal-based NAVs dampen reported volatility
- **validation:**
  - **pd_required:** pd_id present
  - **valid_category:** pd_category in allowed set
  - **valid_seniority:** seniority in [senior, subordinated, junior]

## Outcomes

### Analyse_private_debt (Priority: 1)

_Analyse private debt position_

**Given:**
- `pd_id` (input) exists
- `pd_category` (input) in `direct_lending,mezzanine,distressed,venture_debt,unitranche`

**Then:**
- **call_service** target: `pd_analyst`
- **emit_event** event: `pd.analysed`

### Invalid_category (Priority: 10) — Error: `PD_INVALID_CATEGORY`

_Unsupported category_

**Given:**
- `pd_category` (input) not_in `direct_lending,mezzanine,distressed,venture_debt,unitranche`

**Then:**
- **emit_event** event: `pd.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PD_INVALID_CATEGORY` | 400 | pd_category must be direct_lending, mezzanine, distressed, venture_debt, or unitranche | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pd.analysed` |  | `pd_id`, `pd_category`, `expected_yield`, `seniority`, `covenant_score` |
| `pd.analysis_rejected` |  | `pd_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| private-equity-investments | recommended |  |
| alt-investments-features-categories | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Debt Investments Blueprint",
  "description": "Evaluate private debt categories (direct lending, mezzanine, distressed, venture debt, unitranche) by seniority, yield, covenants, and risk-return and compare w",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "private-debt, direct-lending, mezzanine, distressed-debt, cfa-level-1"
}
</script>
