---
title: "Equity Securities Types Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify common and preferred equity variants — voting, participating, cumulative, convertible, callable, putable — and capture their cash-flow and control righ"
---

# Equity Securities Types Blueprint

> Classify common and preferred equity variants — voting, participating, cumulative, convertible, callable, putable — and capture their cash-flow and control rights

| | |
|---|---|
| **Feature** | `equity-securities-types` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, common-stock, preferred-stock, convertible, shareholder-rights, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-securities-types.blueprint.yaml) |
| **JSON API** | [equity-securities-types.json]({{ site.baseurl }}/api/blueprints/trading/equity-securities-types.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `equity_taxonomist` | Equity Securities Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `security_id` | text | Yes | Security identifier |  |
| `equity_type` | select | Yes | common \| preferred |  |
| `features` | multiselect | No | voting \| cumulative \| participating \| convertible \| callable \| putable |  |
| `dividend_rate` | number | No | Stated dividend rate for preferred (decimal) |  |

## Rules

- **common_shares:**
  - **residual_claim:** Last in line for assets and earnings
  - **voting_rights:** One share one vote (typical); may have dual-class
  - **dividends:** Discretionary, paid after debt and preferred
- **preferred_shares:**
  - **cumulative:** Unpaid dividends accumulate; must be paid before common dividends
  - **participating:** Receive extra dividends when common exceeds threshold
  - **convertible:** Convert to common at pre-set ratio
  - **callable:** Issuer can redeem at call price
  - **putable:** Holder can force redemption
- **voting_variants:**
  - **statutory:** One vote per share per director
  - **cumulative:** Votes can be concentrated on one nominee
  - **dual_class:** Super-voting shares retained by founders
- **non_domestic_access:**
  - **direct_investing:** Buy on foreign exchange; FX and settlement risk
  - **depository_receipts:**
    - **sponsored_adr:** Issuer-backed ADR; levels I-III increase disclosure
    - **unsponsored_adr:** No issuer cooperation; limited voting
    - **gdr:** Global DR, often traded in London/Luxembourg
- **risk_return:**
  - **risk:** Standard deviation of returns; preferred less volatile than common
  - **return:** Price change plus dividends; currency effects for ADR/GDR
- **validation:**
  - **security_required:** security_id present
  - **valid_type:** equity_type in [common, preferred]

## Outcomes

### Classify_equity_security (Priority: 1)

_Record classification and features of an equity security_

**Given:**
- `security_id` (input) exists
- `equity_type` (input) in `common,preferred`

**Then:**
- **call_service** target: `equity_taxonomist`
- **emit_event** event: `equity_security.classified`

### Invalid_type (Priority: 10) — Error: `EQ_INVALID_TYPE`

_Unsupported equity type_

**Given:**
- `equity_type` (input) not_in `common,preferred`

**Then:**
- **emit_event** event: `equity_security.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EQ_INVALID_TYPE` | 400 | equity_type must be common or preferred | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `equity_security.classified` |  | `security_id`, `equity_type`, `features` |
| `equity_security.classification_rejected` |  | `security_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| private-public-equity | recommended |  |
| equity-return-roe | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Securities Types Blueprint",
  "description": "Classify common and preferred equity variants — voting, participating, cumulative, convertible, callable, putable — and capture their cash-flow and control righ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, common-stock, preferred-stock, convertible, shareholder-rights, cfa-level-1"
}
</script>
