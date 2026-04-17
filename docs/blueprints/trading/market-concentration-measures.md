---
title: "Market Concentration Measures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Quantify industry concentration using the N-firm concentration ratio and the Herfindahl-Hirschman Index to infer market power and antitrust risk. 3 fields. 3 ou"
---

# Market Concentration Measures Blueprint

> Quantify industry concentration using the N-firm concentration ratio and the Herfindahl-Hirschman Index to infer market power and antitrust risk

| | |
|---|---|
| **Feature** | `market-concentration-measures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, microeconomics, concentration-ratio, hhi, market-power, antitrust, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-concentration-measures.blueprint.yaml) |
| **JSON API** | [market-concentration-measures.json]({{ site.baseurl }}/api/blueprints/trading/market-concentration-measures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_analyst` | Market Structure Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_id` | text | Yes | Market identifier |  |
| `firm_shares` | json | Yes | Array of firm market shares (in percent or decimal) |  |
| `top_n` | number | No | Number of top firms for concentration ratio (typical 4) |  |

## Rules

- **n_firm_concentration_ratio:**
  - **formula:** CR_n = sum of top n firms' market shares
  - **typical_n:** 4 (CR4) or 8 (CR8)
  - **range:** 0 to 100 percent
  - **interpretation:**
    - **low:** CR4 < 40 percent -> unconcentrated / competitive
    - **moderate:** 40 percent <= CR4 < 70 percent -> moderately concentrated
    - **high:** CR4 >= 70 percent -> highly concentrated
- **herfindahl_hirschman_index:**
  - **formula:** HHI = sum_i s_i^2, where s_i = market share in percent (or decimal)
  - **range:** 0 to 10,000 (if shares expressed as percent) or 0 to 1
  - **interpretation_dept_of_justice:**
    - **unconcentrated:** HHI < 1,500
    - **moderately_concentrated:** 1,500 <= HHI < 2,500
    - **highly_concentrated:** HHI >= 2,500
  - **merger_screen:** Change in HHI > 200 in highly concentrated markets triggers scrutiny
- **relative_merits:**
  - **cr_n_advantages:** Simple; widely reported
  - **cr_n_limitations:** Ignores distribution among top N and outside top N
  - **hhi_advantages:** Captures entire size distribution; sensitive to merger effects
  - **hhi_limitations:** Requires share data for all firms; sensitive to market definition
- **limitations_of_both:**
  - **market_definition:** Geographic and product scope determine who is a 'competitor'
  - **import_competition:** Domestic share overstates power when imports discipline prices
  - **dynamic_entry:** Contestable markets behave competitively even with high concentration
- **investment_applications:**
  - **antitrust_due_diligence:** Estimate HHI before and after merger to forecast approval risk
  - **industry_attractiveness:** High concentration often correlates with higher ROE
  - **activism_target_screen:** Low-HHI industries may benefit from consolidation
- **validation:**
  - **shares_present:** firm_shares must exist with at least 1 entry
  - **shares_non_negative:** each share >= 0
  - **shares_sum_reasonable:** sum of shares <= 100 (if percent) or <= 1 (if decimal)
  - **valid_top_n:** top_n >= 1

## Outcomes

### Compute_concentration (Priority: 1)

_Compute CR_n and HHI_

**Given:**
- `firm_shares` (input) exists
- `shares_valid` (computed) eq `true`

**Then:**
- **call_service** target: `market_analyst`
- **emit_event** event: `market.concentration_computed`

### Invalid_shares (Priority: 10) — Error: `CONCENTRATION_SHARES_INVALID`

_Share data invalid (negative, sums > 100 percent)_

**Given:**
- `shares_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `market.concentration_rejected`

### Missing_shares (Priority: 11) — Error: `CONCENTRATION_SHARES_MISSING`

_Shares array missing_

**Given:**
- `firm_shares` (input) not_exists

**Then:**
- **emit_event** event: `market.concentration_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONCENTRATION_SHARES_INVALID` | 400 | Firm shares must be non-negative and sum to at most 100 percent (or 1 in decimal) | No |
| `CONCENTRATION_SHARES_MISSING` | 400 | firm_shares array is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market.concentration_computed` |  | `market_id`, `cr_n`, `hhi`, `category`, `top_firm_share` |
| `market.concentration_rejected` |  | `market_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-structures-analysis | required |  |
| oligopoly-pricing | recommended |  |
| monopoly-pricing | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  firm_shares_percent:
    - 35
    - 25
    - 15
    - 10
    - 8
    - 4
    - 3
  cr4: 85
  hhi: 35^2 + 25^2 + 15^2 + 10^2 + 8^2 + 4^2 + 3^2 = 1225 + 625 + 225 + 100 + 64 +
    16 + 9 = 2264
  category: Moderately concentrated (HHI between 1500 and 2500)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Concentration Measures Blueprint",
  "description": "Quantify industry concentration using the N-firm concentration ratio and the Herfindahl-Hirschman Index to infer market power and antitrust risk. 3 fields. 3 ou",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, microeconomics, concentration-ratio, hhi, market-power, antitrust, cfa-level-1"
}
</script>
