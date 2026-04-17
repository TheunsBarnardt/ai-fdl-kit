---
title: "Bonds Leases Accounting Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Account for non-current liabilities — bond issuance at par/premium/discount, effective interest method, debt covenants, and lease capitalisation under IFRS 16 a"
---

# Bonds Leases Accounting Blueprint

> Account for non-current liabilities — bond issuance at par/premium/discount, effective interest method, debt covenants, and lease capitalisation under IFRS 16 and ASC 842

| | |
|---|---|
| **Feature** | `bonds-leases-accounting` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, non-current-liabilities, bonds-payable, leases, ifrs-16, effective-interest, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bonds-leases-accounting.blueprint.yaml) |
| **JSON API** | [bonds-leases-accounting.json]({{ site.baseurl }}/api/blueprints/trading/bonds-leases-accounting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ncl_analyst` | Non-Current Liabilities Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `instrument_type` | select | Yes | bond \| finance_lease \| operating_lease |  |
| `face_value` | number | No | Bond face value |  |
| `coupon_rate` | number | No | Coupon rate (decimal) |  |
| `market_rate` | number | No | Market yield at issuance (decimal) |  |
| `lease_term_years` | number | No | Lease term in years |  |

## Rules

- **bond_issuance:**
  - **at_par:** Coupon rate equals market rate
  - **at_premium:** Coupon rate above market rate -> proceeds > face
  - **at_discount:** Coupon rate below market rate -> proceeds < face
- **effective_interest_method:**
  - **interest_expense:** Beginning carrying amount x market rate at issuance
  - **coupon_payment:** Face value x coupon rate
  - **amortisation:** Difference between interest expense and coupon payment
  - **carrying_amount_trajectory:** Premium amortises down; discount amortises up to par at maturity
- **debt_covenants:**
  - **affirmative:** Must do — maintain ratios, audit, insurance
  - **negative:** Must not — issue more senior debt, sell assets, pay dividends above cap
  - **breach_consequences:** Acceleration, higher rates, restricted operations
- **lease_accounting:**
  - **ifrs16:** Lessee capitalises all leases > 12 months — ROU asset and lease liability
  - **asc842:** Lessee distinguishes finance vs operating; both on balance sheet but P&L pattern differs
  - **operating_lease_expense:** Single straight-line expense
  - **finance_lease_expense:** Front-loaded: depreciation + interest
- **derecognition:**
  - **early_redemption:** Gain/loss = carrying amount - cash paid
  - **modification:** Substantive change -> derecognise old, recognise new
- **validation:**
  - **entity_required:** entity_id present
  - **valid_type:** instrument_type in allowed set

## Outcomes

### Account_for_instrument (Priority: 1)

_Compute amortisation schedule and P&L impact_

**Given:**
- `entity_id` (input) exists
- `instrument_type` (input) in `bond,finance_lease,operating_lease`

**Then:**
- **call_service** target: `ncl_analyst`
- **emit_event** event: `ncl.computed`

### Invalid_type (Priority: 10) — Error: `NCL_INVALID_TYPE`

_Unsupported instrument type_

**Given:**
- `instrument_type` (input) not_in `bond,finance_lease,operating_lease`

**Then:**
- **emit_event** event: `ncl.computation_rejected`

### Missing_entity (Priority: 11) — Error: `NCL_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `ncl.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NCL_INVALID_TYPE` | 400 | instrument_type must be bond, finance_lease, or operating_lease | No |
| `NCL_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ncl.computed` |  | `computation_id`, `entity_id`, `instrument_type`, `interest_expense`, `carrying_amount` |
| `ncl.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-balance-sheet | required |  |
| fsa-income-statement | required |  |
| corporate-capital-structure | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bonds Leases Accounting Blueprint",
  "description": "Account for non-current liabilities — bond issuance at par/premium/discount, effective interest method, debt covenants, and lease capitalisation under IFRS 16 a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, non-current-liabilities, bonds-payable, leases, ifrs-16, effective-interest, cfa-level-1"
}
</script>
