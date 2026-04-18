---
title: "Intercorporate Investments L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Account for intercorporate investments — IFRS 9 financial assets, equity method for associates/JVs, acquisition method for business combinations with NCI and go"
---

# Intercorporate Investments L2 Blueprint

> Account for intercorporate investments — IFRS 9 financial assets, equity method for associates/JVs, acquisition method for business combinations with NCI and goodwill

| | |
|---|---|
| **Feature** | `intercorporate-investments-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, intercorporate-investments, ifrs-9, equity-method, acquisition-method, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/intercorporate-investments-l2.blueprint.yaml) |
| **JSON API** | [intercorporate-investments-l2.json]({{ site.baseurl }}/api/blueprints/trading/intercorporate-investments-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `intercorp_accountant` | Intercorporate Investment Accountant | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `investment_id` | text | Yes | Investment identifier |  |
| `investment_type` | select | Yes | financial_asset \| associate \| joint_venture \| subsidiary |  |

## Rules

- **classification_thresholds:**
  - **financial_asset:** Ownership < 20% — passive investment
  - **associate:** 20-50% significant influence — equity method
  - **joint_venture:** Joint control — equity method under IFRS, proportionate historically under GAAP
  - **subsidiary:** Control (typically >50%) — full consolidation via acquisition method
- **ifrs9_financial_assets:**
  - **amortised_cost:** Business model = hold to collect cash flows; SPPI pass
  - **fvoci_debt:** Hold to collect and sell; OCI for unrealised gains/losses
  - **fvoci_equity_election:** Irrevocable at initial recognition; no recycling on disposal
  - **fvtpl:** Default; held for trading or failed SPPI test
  - **reclassification:** Only on business-model change; rare
- **equity_method:**
  - **initial_recognition:** Record at cost
  - **subsequent:** Investor's share of investee profit increases carrying amount; dividends decrease it
  - **amortisation_of_excess:** Excess cost over book value of identifiable net assets allocated to assets; amortise non-goodwill portion
  - **fair_value_option:** Available under IFRS; changes in FV go through P&L
  - **impairment:** Compare recoverable amount to carrying value; loss cannot be reversed under US GAAP
  - **transactions_with_associate:** Eliminate unrealised profits pro-rata
- **acquisition_method:**
  - **consideration:** FV of cash, stock, contingent consideration
  - **identifiable_net_assets:** Recognise at acquisition-date FV
  - **goodwill:** Consideration + FV of NCI - FV of identifiable net assets
  - **nci_measurement:** Full goodwill (FV of NCI) vs partial goodwill (proportionate share)
  - **less_than_100:** Elect full or partial goodwill method under IFRS; GAAP requires full
  - **post_acquisition:** Subsidiary fully consolidated line-by-line; intra-group eliminated
- **goodwill_impairment:**
  - **trigger:** Annual test or when indicators exist
  - **ifrs_test:** Compare recoverable amount of CGU to carrying value
  - **gaap_test:** Qualitative then quantitative (step 1 reporting unit FV vs carrying)
  - **non_reversible:** Goodwill impairment losses never reversed
- **vies_spes:**
  - **consolidation_trigger:** Primary beneficiary absorbs majority of expected losses/residual returns
  - **securitisation:** Transfer of receivables to SPE — derecognition depends on risk-reward transfer
- **contingent_items:**
  - **contingent_consideration:** Recognise at FV at acquisition; subsequent changes to P&L
  - **in_process_rd:** Recognise as indefinite-life intangible until project completion or abandonment
- **validation:**
  - **investment_required:** investment_id present
  - **valid_type:** investment_type in [financial_asset, associate, joint_venture, subsidiary]

## Outcomes

### Classify_investment (Priority: 1)

_Classify and account for intercorporate investment_

**Given:**
- `investment_id` (input) exists
- `investment_type` (input) in `financial_asset,associate,joint_venture,subsidiary`

**Then:**
- **call_service** target: `intercorp_accountant`
- **emit_event** event: `intercorp.classified`

### Invalid_type (Priority: 10) — Error: `INTERCORP_INVALID_TYPE`

_Unsupported investment type_

**Given:**
- `investment_type` (input) not_in `financial_asset,associate,joint_venture,subsidiary`

**Then:**
- **emit_event** event: `intercorp.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INTERCORP_INVALID_TYPE` | 400 | investment_type must be financial_asset, associate, joint_venture, or subsidiary | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `intercorp.classified` |  | `investment_id`, `investment_type`, `accounting_method`, `carrying_amount` |
| `intercorp.classification_rejected` |  | `investment_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multiple-regression-basics-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Intercorporate Investments L2 Blueprint",
  "description": "Account for intercorporate investments — IFRS 9 financial assets, equity method for associates/JVs, acquisition method for business combinations with NCI and go",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, intercorporate-investments, ifrs-9, equity-method, acquisition-method, cfa-level-2"
}
</script>
