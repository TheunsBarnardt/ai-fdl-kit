---
title: "Derivatives Market Data Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Non-live market data products for derivatives (equity derivatives, commodity derivatives, currency derivatives, interest-rate derivatives). 6 fields. 1 outcomes"
---

# Derivatives Market Data Blueprint

> Non-live market data products for derivatives (equity derivatives, commodity derivatives, currency derivatives, interest-rate derivatives)

| | |
|---|---|
| **Feature** | `derivatives-market-data` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, market-data, non-live, eod-data, options-futures |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-market-data.blueprint.yaml) |
| **JSON API** | [derivatives-market-data.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-market-data.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `derivative_code` | text | Yes | Derivative Contract Code |  |
| `derivative_type` | select | Yes | Type (EquityOption, EquityFuture, CommodityFuture, CurrencyDerivative, IRDerivative) |  |
| `underlying_asset` | text | Yes | Underlying Asset |  |
| `maturity_date` | date | No | Maturity/Expiry Date |  |
| `strike_price` | number | No | Strike Price (for options) |  |
| `settlement_date` | date | No | Settlement Date |  |

## Rules

- **data_coverage:**
  - **contract_specifications:** Includes contract size, tick size, trading hours, position limits
  - **settlement_terms:** Physical vs cash settlement rules documented
  - **risk_parameters:** Greeks (delta, gamma, vega, theta) calculated daily

## Outcomes

### Publish_derivatives_data (Priority: 1)

_Publish derivatives market data end-of-day_

**Given:**
- `derivative_code` (input) exists

**Then:**
- **emit_event** event: `derivatives_data.published`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DERIVATIVES_DATA_PUBLISH_FAILED` | 500 | Failed to publish derivatives market data | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `derivatives_data.published` |  | `derivative_code`, `publication_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trading-gateway-fix | recommended |  |
| reference-data-management | required |  |

## AGI Readiness

### Goals

#### Reliable Derivatives Market Data

Non-live market data products for derivatives (equity derivatives, commodity derivatives, currency derivatives, interest-rate derivatives)

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

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `reference_data_management` | reference-data-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| publish_derivatives_data | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
derivative_types:
  - type: EquityOption
    description: Call and put options on equities
  - type: EquityFuture
    description: Equity index and single-stock futures
  - type: CommodityFuture
    description: Commodity futures contracts
  - type: CurrencyDerivative
    description: FX forwards, swaps, options
  - type: IRDerivative
    description: Bond futures, interest-rate swaps
data_fields:
  - field: OpenPrice
    description: Opening price
  - field: HighPrice
    description: Intraday high
  - field: LowPrice
    description: Intraday low
  - field: ClosePrice
    description: Settlement price
  - field: Volume
    description: Contracts traded
  - field: OpenInterest
    description: Outstanding contracts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Market Data Blueprint",
  "description": "Non-live market data products for derivatives (equity derivatives, commodity derivatives, currency derivatives, interest-rate derivatives). 6 fields. 1 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, market-data, non-live, eod-data, options-futures"
}
</script>
