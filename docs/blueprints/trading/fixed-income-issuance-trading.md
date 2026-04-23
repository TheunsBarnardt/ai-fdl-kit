---
title: "Fixed Income Issuance Trading Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify fixed-income primary issuance mechanisms (auction, syndicated, best-efforts, private placement) and secondary trading structures (OTC dealer, electroni"
---

# Fixed Income Issuance Trading Blueprint

> Classify fixed-income primary issuance mechanisms (auction, syndicated, best-efforts, private placement) and secondary trading structures (OTC dealer, electronic, dark)

| | |
|---|---|
| **Feature** | `fixed-income-issuance-trading` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, bond-issuance, primary-market, dealer-market, auction, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-issuance-trading.blueprint.yaml) |
| **JSON API** | [fixed-income-issuance-trading.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-issuance-trading.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_venue_service` | Fixed-Income Venue Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | text | Yes | Issuance or trade identifier |  |
| `venue_type` | select | Yes | primary_auction \| primary_syndicated \| primary_best_efforts \| primary_private \| secondary_dealer \| secondary_electronic |  |
| `issuer_segment` | select | No | sovereign \| agency \| corporate \| municipal \| supranational |  |

## Rules

- **primary_mechanisms:**
  - **auction:**
    - **single_price:** Uniform clearing yield; bidders receive their bid or better
    - **multiple_price:** Pay-as-bid; winners pay their own bid
    - **typical_use:** Sovereign benchmark issuance
  - **syndicated:**
    - **pattern:** Underwriter group distributes new issue
    - **pricing:** Book-building with indicative range
    - **typical_use:** Corporate benchmark and emerging-market sovereigns
  - **best_efforts:**
    - **pattern:** Underwriters act as agent; no firm commitment
    - **typical_use:** Smaller or high-yield deals
  - **private_placement:**
    - **pattern:** Sold to qualified institutional buyers (e.g., 144A)
    - **disclosure:** Light; resale restricted
- **secondary_trading:**
  - **dealer_otc:**
    - **mechanics:** Request-for-quote from dealers; bilateral settlement
    - **liquidity:** Dealer balance sheets provide market-making
  - **electronic:**
    - **all_to_all:** Buy-side can trade with buy-side
    - **dealer_to_client:** RFQ platforms
  - **dark_pools:** Used for large block trades
- **settlement:**
  - **govt_bonds:** T+1 typical
  - **corporate_bonds:** T+2 typical
  - **emerging_markets:** T+2 to T+3
- **validation:**
  - **event_required:** event_id present
  - **valid_venue:** venue_type in allowed set

## Outcomes

### Classify_fi_event (Priority: 1)

_Classify primary issuance or secondary trading event_

**Given:**
- `event_id` (input) exists
- `venue_type` (input) in `primary_auction,primary_syndicated,primary_best_efforts,primary_private,secondary_dealer,secondary_electronic`

**Then:**
- **call_service** target: `fi_venue_service`
- **emit_event** event: `fi_event.classified`

### Invalid_venue (Priority: 10) — Error: `FI_EVENT_INVALID_VENUE`

_Unsupported venue_

**Given:**
- `venue_type` (input) not_in `primary_auction,primary_syndicated,primary_best_efforts,primary_private,secondary_dealer,secondary_electronic`

**Then:**
- **emit_event** event: `fi_event.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_EVENT_INVALID_VENUE` | 400 | venue_type must be one of the supported venues | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fi_event.classified` |  | `event_id`, `venue_type`, `issuer_segment` |
| `fi_event.classification_rejected` |  | `event_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-bond-features | recommended |  |
| fixed-income-market-segments | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Issuance Trading

Classify fixed-income primary issuance mechanisms (auction, syndicated, best-efforts, private placement) and secondary trading structures (OTC dealer, electronic, dark)

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
| classify_fi_event | `autonomous` | - | - |
| invalid_venue | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Issuance Trading Blueprint",
  "description": "Classify fixed-income primary issuance mechanisms (auction, syndicated, best-efforts, private placement) and secondary trading structures (OTC dealer, electroni",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, bond-issuance, primary-market, dealer-market, auction, cfa-level-1"
}
</script>
