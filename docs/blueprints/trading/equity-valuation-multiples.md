---
title: "Equity Valuation Multiples Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value equity with price multiples — P/E, P/B, P/S, P/CF — using method of comparables and reconcile multiples with present-value fundamentals. 3 fields. 3 outco"
---

# Equity Valuation Multiples Blueprint

> Value equity with price multiples — P/E, P/B, P/S, P/CF — using method of comparables and reconcile multiples with present-value fundamentals

| | |
|---|---|
| **Feature** | `equity-valuation-multiples` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, valuation, price-multiples, comparables, pe-ratio, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-valuation-multiples.blueprint.yaml) |
| **JSON API** | [equity-valuation-multiples.json]({{ site.baseurl }}/api/blueprints/trading/equity-valuation-multiples.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `multiples_engine` | Multiples Valuation Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `valuation_id` | text | Yes | Valuation identifier |  |
| `multiple_type` | select | Yes | pe \| pb \| ps \| pcf \| peg |  |
| `basis` | select | Yes | trailing \| forward \| normalised |  |

## Rules

- **multiples_definitions:**
  - **pe:** Price / earnings per share
  - **pb:** Price / book value per share
  - **ps:** Price / sales per share
  - **pcf:** Price / operating cash flow per share
  - **peg:** PE / expected growth rate
- **justified_multiples:**
  - **pe_justified:** (1 - retention) * (1 + g) / (r - g)
  - **pb_justified:** (ROE - g) / (r - g)
  - **ps_justified:** Net margin * (1 - retention) * (1 + g) / (r - g)
- **trailing_vs_forward:**
  - **trailing:** Historical 12 months
  - **forward:** Next 12 months; reflects expectations
  - **normalised:** Average through cycle
- **method_of_comparables:**
  - **steps:** Select peer group, Compute multiple for peers, Apply median or mean to target, Adjust for differences in growth, risk, margins
  - **caveats:** Peers must be genuinely comparable; stale multiples mislead
- **earnings_quality:**
  - **concerns:** One-time items, different accounting, buybacks distort EPS
  - **normalisation:** Strip non-recurring; use comprehensive income where helpful
- **cross_section:**
  - **interpretation:** Multiples reflect fundamentals (growth, risk, payout); differences flag mispricing or differing prospects
- **validation:**
  - **valuation_required:** valuation_id present
  - **valid_multiple:** multiple_type in allowed set
  - **valid_basis:** basis in allowed set

## Outcomes

### Value_equity_via_multiples (Priority: 1)

_Compute multiple-based value and justified multiple_

**Given:**
- `valuation_id` (input) exists
- `multiple_type` (input) in `pe,pb,ps,pcf,peg`
- `basis` (input) in `trailing,forward,normalised`

**Then:**
- **call_service** target: `multiples_engine`
- **emit_event** event: `multiples.valued`

### Invalid_multiple (Priority: 10) — Error: `MULT_INVALID_TYPE`

_Unsupported multiple_

**Given:**
- `multiple_type` (input) not_in `pe,pb,ps,pcf,peg`

**Then:**
- **emit_event** event: `multiples.valuation_rejected`

### Invalid_basis (Priority: 11) — Error: `MULT_INVALID_BASIS`

_Unsupported basis_

**Given:**
- `basis` (input) not_in `trailing,forward,normalised`

**Then:**
- **emit_event** event: `multiples.valuation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MULT_INVALID_TYPE` | 400 | multiple_type must be pe, pb, ps, pcf, or peg | No |
| `MULT_INVALID_BASIS` | 400 | basis must be trailing, forward, or normalised | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `multiples.valued` |  | `valuation_id`, `multiple_type`, `implied_value`, `peer_median` |
| `multiples.valuation_rejected` |  | `valuation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-valuation-ddm | recommended |  |
| enterprise-value-asset-based | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Valuation Multiples Blueprint",
  "description": "Value equity with price multiples — P/E, P/B, P/S, P/CF — using method of comparables and reconcile multiples with present-value fundamentals. 3 fields. 3 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, valuation, price-multiples, comparables, pe-ratio, cfa-level-1"
}
</script>
