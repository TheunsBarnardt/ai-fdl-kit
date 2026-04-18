---
title: "Private Company Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value private companies — public vs private differences, earnings normalisation, discount rate models, lack of control and marketability discounts, income/marke"
---

# Private Company Valuation L2 Blueprint

> Value private companies — public vs private differences, earnings normalisation, discount rate models, lack of control and marketability discounts, income/market/excess-earnings approaches

| | |
|---|---|
| **Feature** | `private-company-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity-valuation, private-company, dlom, dloc, build-up-method, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/private-company-valuation-l2.blueprint.yaml) |
| **JSON API** | [private-company-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/private-company-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `private_valuator` | Private Company Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `approach` | select | Yes | income \| market \| excess_earnings \| asset |  |

## Rules

- **public_vs_private_differences:**
  - **company_specific:** Lifecycle stage, size, management depth
  - **stock_specific:** Liquidity, control, restrictions
- **uses_of_valuation:**
  - **transactions:** M&A, financing, IPO
  - **compliance:** Tax, financial reporting (purchase price allocation)
  - **litigation:** Shareholder disputes, divorce
- **areas_of_focus:**
  - **venture_capital:** Pre-money valuation, milestone-based
  - **fairness_opinions:** Independent value for board
  - **estate_planning:** Gift tax, transfer pricing
- **earnings_normalisation:**
  - **owner_compensation:** Adjust above-market salaries
  - **related_party:** Lease and service contracts
  - **discretionary_expenses:** Personal expenses run through company
  - **one_time_items:** Strip non-recurring
- **cash_flow_estimation:**
  - **fcff_or_fcfe:** Same definitions as public; data quality lower
  - **capex_estimation:** Maintenance vs growth
- **discount_rate_factors:**
  - **size_premium:** Smaller firms higher required return
  - **illiquidity:** Lack of marketability raises required return
  - **company_specific_risk:** Customer concentration, key-person
  - **diversification_lack:** Owner not diversified
- **required_return_models:**
  - **capm_modified:** Add size and specific premia
  - **expanded_capm:** Rf + ERP + size + industry
  - **build_up_method:** Rf + ERP + size + specific (no beta)
  - **bond_yield_plus_risk_premium:** YTM + 3-5%
- **valuation_discounts:**
  - **dloc_lack_of_control:** Minority interest discount; pro-rata reduction for inability to direct
  - **dlom_lack_of_marketability:** Restricted stock studies, pre-IPO studies; 20-40% typical
  - **combined:** Multiplicative not additive
- **income_based_approach:**
  - **fcf_method:** Standard DCF with private adjustments
  - **capitalised_cash_flow:** CF / (k − g) for stable firms
  - **excess_earnings:** Identifies intangible value above tangible asset return
- **market_based_approach:**
  - **gpcm_guideline_public:** Apply public-company multiples with control/liquidity adjustments
  - **gtm_guideline_transactions:** Multiples from comparable M&A
  - **prior_transaction:** Recent share sales as benchmark
- **asset_based_approach:**
  - **appropriate_when:** Holding companies, distressed, liquidation
  - **method:** FV of identifiable assets less liabilities
- **validation:**
  - **company_required:** company_id present
  - **valid_approach:** approach in [income, market, excess_earnings, asset]

## Outcomes

### Value_private_company (Priority: 1)

_Value private company via selected approach_

**Given:**
- `company_id` (input) exists
- `approach` (input) in `income,market,excess_earnings,asset`

**Then:**
- **call_service** target: `private_valuator`
- **emit_event** event: `private.valued`

### Invalid_approach (Priority: 10) — Error: `PRIVATE_INVALID_APPROACH`

_Unsupported valuation approach_

**Given:**
- `approach` (input) not_in `income,market,excess_earnings,asset`

**Then:**
- **emit_event** event: `private.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRIVATE_INVALID_APPROACH` | 400 | approach must be one of the supported approaches | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `private.valued` |  | `company_id`, `approach`, `marketable_minority_value`, `dloc`, `dlom`, `final_value` |
| `private.rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| free-cash-flow-valuation-l2 | recommended |  |
| market-based-valuation-multiples-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Company Valuation L2 Blueprint",
  "description": "Value private companies — public vs private differences, earnings normalisation, discount rate models, lack of control and marketability discounts, income/marke",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity-valuation, private-company, dlom, dloc, build-up-method, cfa-level-2"
}
</script>
