---
title: "Financial Markets Functions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify financial market functions, asset types, and intermediaries that connect savers to borrowers, transfer risk, and facilitate price discovery. 4 fields. "
---

# Financial Markets Functions Blueprint

> Classify financial market functions, asset types, and intermediaries that connect savers to borrowers, transfer risk, and facilitate price discovery

| | |
|---|---|
| **Feature** | `financial-markets-functions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, market-structure, intermediaries, asset-classes, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/financial-markets-functions.blueprint.yaml) |
| **JSON API** | [financial-markets-functions.json]({{ site.baseurl }}/api/blueprints/trading/financial-markets-functions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_taxonomist` | Market Classification Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `instrument_id` | text | Yes | Instrument identifier |  |
| `asset_class` | select | Yes | equity \| fixed_income \| currency \| commodity \| real_asset \| derivative |  |
| `maturity` | select | No | money_market \| capital_market |  |
| `issuer_type` | select | No | public \| private \| government \| supranational |  |

## Rules

- **market_functions:**
  - **save:** Help savers move purchasing power forward in time
  - **borrow:** Allow borrowers to bring future income forward
  - **raise_equity:** Firms raise capital by selling ownership
  - **manage_risk:** Hedge via derivatives and diversification
  - **exchange:** Currency and commodity exchange between parties
  - **utility:** Provide liquidity, price discovery, information
- **asset_classifications:**
  - **by_maturity:** Money market < 1 year; capital market > 1 year
  - **by_claim:** Debt (fixed claim) vs equity (residual claim)
  - **by_trading:** Public (exchanges/OTC) vs private (direct)
  - **by_underlying:** Spot vs derivative contract
- **intermediaries:**
  - **brokers_dealers:** Match buyers/sellers; dealers trade from own book
  - **exchanges_atss:** Organised venues; ATS/dark pools match without displayed quotes
  - **clearing_houses:** Central counterparty — novation, margin, settlement
  - **custodians:** Hold securities on behalf of owners
  - **banks_insurance:** Provide credit, risk transfer, liquidity
  - **investment_advisers:** Pooled and managed accounts
  - **arbitrageurs:** Exploit price differences across venues
- **validation:**
  - **asset_required:** instrument_id present
  - **valid_asset_class:** asset_class in allowed set

## Outcomes

### Classify_instrument (Priority: 1)

_Classify instrument along asset-class and market axes_

**Given:**
- `instrument_id` (input) exists
- `asset_class` (input) in `equity,fixed_income,currency,commodity,real_asset,derivative`

**Then:**
- **call_service** target: `market_taxonomist`
- **emit_event** event: `market.classified`

### Invalid_asset_class (Priority: 10) — Error: `MARKET_INVALID_ASSET_CLASS`

_Asset class outside allowed set_

**Given:**
- `asset_class` (input) not_in `equity,fixed_income,currency,commodity,real_asset,derivative`

**Then:**
- **emit_event** event: `market.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKET_INVALID_ASSET_CLASS` | 400 | asset_class must be one of the allowed classes | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market.classified` |  | `classification_id`, `instrument_id`, `asset_class`, `maturity_band` |
| `market.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| positions-leverage-margin | recommended |  |
| market-indexes-construction | recommended |  |

## AGI Readiness

### Goals

#### Reliable Financial Markets Functions

Classify financial market functions, asset types, and intermediaries that connect savers to borrowers, transfer risk, and facilitate price discovery

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
| classify_instrument | `autonomous` | - | - |
| invalid_asset_class | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Financial Markets Functions Blueprint",
  "description": "Classify financial market functions, asset types, and intermediaries that connect savers to borrowers, transfer risk, and facilitate price discovery. 4 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, market-structure, intermediaries, asset-classes, cfa-level-1"
}
</script>
