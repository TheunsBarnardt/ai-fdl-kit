---
title: "Capital Market Line Theory Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Derive the Capital Market Line, combine risk-free asset with the market portfolio, and describe leveraged and lending portfolios with differing borrowing and le"
---

# Capital Market Line Theory Blueprint

> Derive the Capital Market Line, combine risk-free asset with the market portfolio, and describe leveraged and lending portfolios with differing borrowing and lending rates

| | |
|---|---|
| **Feature** | `capital-market-line-theory` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, cml, market-portfolio, leveraged-portfolio, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capital-market-line-theory.blueprint.yaml) |
| **JSON API** | [capital-market-line-theory.json]({{ site.baseurl }}/api/blueprints/trading/capital-market-line-theory.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cml_engine` | Capital Market Line Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `cml_id` | text | Yes | CML analysis identifier |  |
| `risk_free_rate` | number | Yes | Risk-free rate (decimal) |  |
| `market_return` | number | Yes | Expected market return |  |
| `market_std_dev` | number | Yes | Market standard deviation |  |

## Rules

- **cml_equation:**
  - **formula:** E(Rp) = Rf + ((E(Rm) - Rf) / sd(Rm)) * sd(Rp)
  - **slope:** Market Sharpe ratio
- **market_portfolio:**
  - **definition:** Value-weighted portfolio of all risky assets
  - **proxy:** Broad equity index used in practice
- **passive_vs_active:**
  - **passive:** Hold market portfolio; consistent with CAPM
  - **active:** Seek alpha relative to market; justified only if investor has skill
- **leveraged_portfolios:**
  - **borrowing_rate_higher:** CML kinks down above market portfolio due to higher borrowing rate
  - **implication:** Leveraged investors lie on kinked CML with less attractive slope
- **validation:**
  - **cml_required:** cml_id present
  - **positive_market_sd:** market_std_dev > 0

## Outcomes

### Compute_cml (Priority: 1)

_Compute CML expected return at given portfolio risk_

**Given:**
- `cml_id` (input) exists
- `market_std_dev` (input) gt `0`

**Then:**
- **call_service** target: `cml_engine`
- **emit_event** event: `cml.computed`

### Invalid_market_sd (Priority: 10) — Error: `CML_INVALID_STD`

_Non-positive market std dev_

**Given:**
- `market_std_dev` (input) lte `0`

**Then:**
- **emit_event** event: `cml.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CML_INVALID_STD` | 400 | market_std_dev must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cml.computed` |  | `cml_id`, `expected_return`, `sharpe_ratio`, `leverage_ratio` |
| `cml.computation_rejected` |  | `cml_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-efficient-frontier | required |  |
| capm-security-market-line | required |  |

## AGI Readiness

### Goals

#### Reliable Capital Market Line Theory

Derive the Capital Market Line, combine risk-free asset with the market portfolio, and describe leveraged and lending portfolios with differing borrowing and lending rates

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

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `portfolio_efficient_frontier` | portfolio-efficient-frontier | fail |
| `capm_security_market_line` | capm-security-market-line | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_cml | `autonomous` | - | - |
| invalid_market_sd | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capital Market Line Theory Blueprint",
  "description": "Derive the Capital Market Line, combine risk-free asset with the market portfolio, and describe leveraged and lending portfolios with differing borrowing and le",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, cml, market-portfolio, leveraged-portfolio, cfa-level-1"
}
</script>
