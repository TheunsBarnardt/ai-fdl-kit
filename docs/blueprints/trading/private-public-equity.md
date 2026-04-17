---
title: "Private Public Equity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compare private and public equity along liquidity, disclosure, governance, and valuation axes, and describe exit routes including IPO, trade sale, secondary, an"
---

# Private Public Equity Blueprint

> Compare private and public equity along liquidity, disclosure, governance, and valuation axes, and describe exit routes including IPO, trade sale, secondary, and dividend recap

| | |
|---|---|
| **Feature** | `private-public-equity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, private-equity, public-equity, liquidity, disclosure, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/private-public-equity.blueprint.yaml) |
| **JSON API** | [private-public-equity.json]({{ site.baseurl }}/api/blueprints/trading/private-public-equity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pe_analyst` | Private-Public Equity Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `holding_id` | text | Yes | Holding identifier |  |
| `venue` | select | Yes | public \| private |  |
| `private_stage` | select | No | seed \| venture \| growth \| buyout |  |
| `expected_exit` | select | No | ipo \| trade_sale \| secondary \| dividend_recap |  |

## Rules

- **public_characteristics:**
  - **liquidity:** Continuous market; price discovery
  - **disclosure:** Regulated periodic reporting
  - **governance:** Minority shareholder protections, proxy votes
  - **valuation:** Market price observable
- **private_characteristics:**
  - **liquidity:** Illiquid; lock-ups; secondary market limited
  - **disclosure:** Negotiated; confidential
  - **governance:** Board control, protective provisions
  - **valuation:** Model-based; stale marks
- **private_stages:**
  - **seed:** Idea and team formation
  - **venture:** Early revenue and product-market fit
  - **growth:** Scaling with unit economics proven
  - **buyout:** Mature cash flow; leverage-driven
- **exit_routes:**
  - **ipo:** Public listing; underwritten distribution
  - **trade_sale:** Sale to strategic acquirer
  - **secondary:** Sale to another PE fund or LP buyer
  - **dividend_recap:** Return capital via leveraged dividend without sale
- **liquidity_discount:**
  - **magnitude:** Private equity typically trades at 10-30 percent discount to public comparables
  - **drivers:** Illiquidity, valuation uncertainty, governance risk
- **validation:**
  - **holding_required:** holding_id present
  - **valid_venue:** venue in [public, private]

## Outcomes

### Classify_private_public (Priority: 1)

_Classify equity holding and infer expected exit if private_

**Given:**
- `holding_id` (input) exists
- `venue` (input) in `public,private`

**Then:**
- **call_service** target: `pe_analyst`
- **emit_event** event: `equity_venue.classified`

### Invalid_venue (Priority: 10) — Error: `PE_INVALID_VENUE`

_Unsupported venue_

**Given:**
- `venue` (input) not_in `public,private`

**Then:**
- **emit_event** event: `equity_venue.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PE_INVALID_VENUE` | 400 | venue must be public or private | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `equity_venue.classified` |  | `holding_id`, `venue`, `stage`, `expected_exit` |
| `equity_venue.rejected` |  | `holding_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-securities-types | recommended |  |
| primary-secondary-markets | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Public Equity Blueprint",
  "description": "Compare private and public equity along liquidity, disclosure, governance, and valuation axes, and describe exit routes including IPO, trade sale, secondary, an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, private-equity, public-equity, liquidity, disclosure, cfa-level-1"
}
</script>
