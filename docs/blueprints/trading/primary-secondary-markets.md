---
title: "Primary Secondary Markets Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Distinguish primary issuance (IPO, seasoned offering, private placement) from secondary trading venues and evaluate call, continuous, quote-driven, and order-dr"
---

# Primary Secondary Markets Blueprint

> Distinguish primary issuance (IPO, seasoned offering, private placement) from secondary trading venues and evaluate call, continuous, quote-driven, and order-driven execution mechanisms

| | |
|---|---|
| **Feature** | `primary-secondary-markets` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, ipo, primary-market, secondary-market, exchange-structure, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/primary-secondary-markets.blueprint.yaml) |
| **JSON API** | [primary-secondary-markets.json]({{ site.baseurl }}/api/blueprints/trading/primary-secondary-markets.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `issuance_service` | Primary Market Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | text | Yes | Issuance or venue identifier |  |
| `market_type` | select | Yes | primary_ipo \| primary_seo \| primary_private \| secondary_exchange \| secondary_otc \| secondary_ats |  |
| `execution_mechanism` | select | No | call \| continuous \| quote_driven \| order_driven \| brokered |  |
| `underwriting_type` | select | No | firm_commitment \| best_efforts \| auction \| shelf |  |

## Rules

- **primary_transactions:**
  - **ipo:** First sale of shares to public; set by underwriters via book-building
  - **seo:** Additional shares by listed issuer; dilutes existing holders
  - **private_placement:** Sale to qualified investors; no public registration
  - **shelf_registration:** Pre-register and draw down over time
  - **rights_offering:** Existing shareholders receive rights to subscribe pro rata
- **underwriting:**
  - **firm_commitment:** Underwriter buys whole issue; bears unsold risk
  - **best_efforts:** Underwriter acts as agent; issuer bears unsold risk
  - **auction:** Dutch auction determines clearing price
- **secondary_structures:**
  - **call_market:** Orders accumulated and crossed at single auction time
  - **continuous_market:** Orders match continuously during session
  - **quote_driven:** Dealers post bid/ask; investors trade against dealer
  - **order_driven:** Orders match based on price-time priority
  - **brokered_market:** Dealer finds counterparty for illiquid instruments
- **well_functioning_markets:**
  - **liquidity:** Low bid-ask spreads, depth, resilience
  - **informational_efficiency:** Prices reflect available information
  - **operational_efficiency:** Low transaction costs
  - **allocational_efficiency:** Capital flows to most productive uses
- **regulation_objectives:** Protect unsophisticated investors, Ensure fair, orderly, efficient markets, Facilitate capital formation, Prevent fraud and manipulation
- **validation:**
  - **event_required:** event_id present
  - **valid_market_type:** market_type in allowed set

## Outcomes

### Classify_market_event (Priority: 1)

_Record and classify a primary issuance or secondary venue_

**Given:**
- `event_id` (input) exists
- `market_type` (input) in `primary_ipo,primary_seo,primary_private,secondary_exchange,secondary_otc,secondary_ats`

**Then:**
- **call_service** target: `issuance_service`
- **emit_event** event: `market_event.classified`

### Invalid_market_type (Priority: 10) — Error: `MKT_EVENT_INVALID_TYPE`

_Unsupported market type_

**Given:**
- `market_type` (input) not_in `primary_ipo,primary_seo,primary_private,secondary_exchange,secondary_otc,secondary_ats`

**Then:**
- **emit_event** event: `market_event.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MKT_EVENT_INVALID_TYPE` | 400 | market_type must be one of the supported primary/secondary categories | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market_event.classified` |  | `event_id`, `market_type`, `execution_mechanism` |
| `market_event.rejected` |  | `event_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| financial-markets-functions | recommended |  |
| order-types-execution | recommended |  |

## AGI Readiness

### Goals

#### Reliable Primary Secondary Markets

Distinguish primary issuance (IPO, seasoned offering, private placement) from secondary trading venues and evaluate call, continuous, quote-driven, and order-driven execution mechanisms

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| classify_market_event | `autonomous` | - | - |
| invalid_market_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Primary Secondary Markets Blueprint",
  "description": "Distinguish primary issuance (IPO, seasoned offering, private placement) from secondary trading venues and evaluate call, continuous, quote-driven, and order-dr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, ipo, primary-market, secondary-market, exchange-structure, cfa-level-1"
}
</script>
