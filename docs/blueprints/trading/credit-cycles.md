---
title: "Credit Cycles Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Identify credit cycle phase using credit growth, lending standards, and spreads — and track how credit conditions amplify business cycles via leverage and asset"
---

# Credit Cycles Blueprint

> Identify credit cycle phase using credit growth, lending standards, and spreads — and track how credit conditions amplify business cycles via leverage and asset prices

| | |
|---|---|
| **Feature** | `credit-cycles` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, credit-cycle, leverage, financial-conditions, minsky, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/credit-cycles.blueprint.yaml) |
| **JSON API** | [credit-cycles.json]({{ site.baseurl }}/api/blueprints/trading/credit-cycles.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `credit_monitor` | Credit Conditions Monitor | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_id` | text | Yes | Market or economy identifier |  |
| `credit_growth_rate` | number | No | Year-on-year credit growth (percent) |  |
| `lending_standards_index` | number | No | Senior loan officer tightening index or equivalent |  |
| `credit_spread_bps` | number | No | Representative IG or HY spread over sovereign |  |
| `default_rate` | number | No | Trailing default rate (percent) |  |

## Rules

- **credit_cycle_phases:**
  - **repair:** Post-default phase; defaults peak, underwriting tight, spreads wide
  - **recovery:** Defaults falling; underwriting loosens; spreads compress
  - **expansion:** Credit grows rapidly; standards loose; spreads tight
  - **downturn:** Defaults rising; standards tighten; spreads widen
- **interaction_with_business_cycle:**
  - **amplification:** Loose credit amplifies expansions; tight credit deepens recessions
  - **asset_price_link:** Credit fuels asset prices; price falls reduce collateral value and credit supply
  - **procyclicality:** Bank balance sheets expand in booms, contract in busts
- **early_warning_signals:**
  - **rapid_credit_growth:** Credit growth exceeding GDP growth for many quarters
  - **deteriorating_standards:** Covenant-lite deals, high LTVs, thin DSCRs
  - **compressed_spreads:** Spreads at historic tights with deteriorating quality
  - **rising_leverage:** Debt/EBITDA climbing across borrowers
- **applications:**
  - **credit_allocation:** Reduce HY exposure in late-expansion phase
  - **bank_equity_analysis:** Monitor loan loss reserves vs credit cycle phase
  - **sovereign_risk:** Credit-to-GDP gap as BIS early-warning indicator
  - **counter_cyclical_capital_buffer:** Regulator tool set by credit gap
- **validation:**
  - **market_id_required:** market_id present
  - **reasonable_spread:** credit_spread_bps >= 0

## Outcomes

### Classify_credit_phase (Priority: 1)

_Assign current credit cycle phase_

**Given:**
- `market_id` (input) exists

**Then:**
- **call_service** target: `credit_monitor`
- **emit_event** event: `credit.phase_classified`

### Credit_stress_alert (Priority: 2)

_Spreads spike and standards tighten sharply_

**Given:**
- `stress_signal` (computed) eq `true`

**Then:**
- **emit_event** event: `credit.stress_alert`

### Missing_market (Priority: 10) — Error: `CREDIT_MARKET_MISSING`

_Market id missing_

**Given:**
- `market_id` (input) not_exists

**Then:**
- **emit_event** event: `credit.classification_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_MARKET_MISSING` | 400 | market_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit.phase_classified` |  | `classification_id`, `phase`, `confidence`, `supporting_signals` |
| `credit.stress_alert` |  | `alert_id`, `spread_widening_bps`, `standard_tightening` |
| `credit.classification_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| business-cycle-phases | required |  |
| economic-indicators | recommended |  |

## AGI Readiness

### Goals

#### Reliable Credit Cycles

Identify credit cycle phase using credit growth, lending standards, and spreads — and track how credit conditions amplify business cycles via leverage and asset prices

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
| `business_cycle_phases` | business-cycle-phases | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| classify_credit_phase | `autonomous` | - | - |
| credit_stress_alert | `autonomous` | - | - |
| missing_market | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
bis_credit_to_gdp_gap:
  signal: Credit/GDP ratio deviation from long-run trend
  threshold_warning: "> 10 percentage points above trend -> elevated systemic risk"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Credit Cycles Blueprint",
  "description": "Identify credit cycle phase using credit growth, lending standards, and spreads — and track how credit conditions amplify business cycles via leverage and asset",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, credit-cycle, leverage, financial-conditions, minsky, cfa-level-1"
}
</script>
