---
title: "Trade Restrictions Tariffs Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Model welfare impact of tariffs, quotas, export subsidies, and voluntary export restraints on consumer surplus, producer surplus, government revenue, and deadwe"
---

# Trade Restrictions Tariffs Blueprint

> Model welfare impact of tariffs, quotas, export subsidies, and voluntary export restraints on consumer surplus, producer surplus, government revenue, and deadweight loss

| | |
|---|---|
| **Feature** | `trade-restrictions-tariffs` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, international-trade, tariff, quota, export-subsidy, deadweight-loss, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/trade-restrictions-tariffs.blueprint.yaml) |
| **JSON API** | [trade-restrictions-tariffs.json]({{ site.baseurl }}/api/blueprints/trading/trade-restrictions-tariffs.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trade_restriction_engine` | Trade Restriction Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario_id` | text | Yes | Scenario identifier |  |
| `restriction_type` | select | Yes | tariff \| quota \| export_subsidy \| ver |  |
| `size` | number | Yes | Magnitude (percent or units) |  |
| `country_size` | select | No | small \| large |  |

## Rules

- **tariff:**
  - **mechanism:** Tax on imports raises domestic price to world price + tariff
  - **small_country:** Consumer surplus falls; producer surplus and tariff revenue rise; net deadweight loss
  - **large_country:** Can improve terms of trade enough to offset DWL (optimal tariff)
- **quota:**
  - **mechanism:** Quantitative limit on imports
  - **effect:** Same domestic price effect as equivalent tariff but rents accrue to licence holders
  - **license_allocation:** Determines whether government or foreign exporters capture the rents
- **export_subsidy:**
  - **mechanism:** Government pays producers per unit exported
  - **effect:** Domestic price rises toward world + subsidy; consumer surplus falls, producer surplus rises, government pays subsidy, net DWL
- **voluntary_export_restraint:**
  - **mechanism:** Exporting country voluntarily caps exports
  - **rents:** Accrue to foreign exporters (worse for importing country than tariff)
- **motivations:**
  - **protect_infant_industry:** Shelter developing sectors until competitive
  - **national_security:** Food, energy, defence
  - **retaliation:** Response to partner restrictions
  - **revenue:** Historical rationale in developing economies
- **validation:**
  - **scenario_required:** scenario_id present
  - **valid_type:** restriction_type in {tariff, quota, export_subsidy, ver}
  - **size_non_negative:** size >= 0

## Outcomes

### Compute_welfare_impact (Priority: 1)

_Compute CS, PS, revenue, and DWL effects_

**Given:**
- `scenario_id` (input) exists
- `restriction_type` (input) in `tariff,quota,export_subsidy,ver`
- `size` (input) gte `0`

**Then:**
- **call_service** target: `trade_restriction_engine`
- **emit_event** event: `trade.restriction_analyzed`

### Invalid_type (Priority: 10) — Error: `RESTRICT_INVALID_TYPE`

_Unsupported restriction type_

**Given:**
- `restriction_type` (input) not_in `tariff,quota,export_subsidy,ver`

**Then:**
- **emit_event** event: `trade.restriction_rejected`

### Invalid_size (Priority: 11) — Error: `RESTRICT_INVALID_SIZE`

_Negative magnitude_

**Given:**
- `size` (input) lt `0`

**Then:**
- **emit_event** event: `trade.restriction_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RESTRICT_INVALID_TYPE` | 400 | restriction_type must be tariff, quota, export_subsidy, or ver | No |
| `RESTRICT_INVALID_SIZE` | 400 | size must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trade.restriction_analyzed` |  | `scenario_id`, `restriction_type`, `consumer_surplus_change`, `producer_surplus_change`, `revenue`, `deadweight_loss` |
| `trade.restriction_rejected` |  | `scenario_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| international-trade-framework | required |  |
| trading-blocs-agreements | recommended |  |

## AGI Readiness

### Goals

#### Reliable Trade Restrictions Tariffs

Model welfare impact of tariffs, quotas, export subsidies, and voluntary export restraints on consumer surplus, producer surplus, government revenue, and deadweight loss

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
| `international_trade_framework` | international-trade-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_welfare_impact | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |
| invalid_size | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trade Restrictions Tariffs Blueprint",
  "description": "Model welfare impact of tariffs, quotas, export subsidies, and voluntary export restraints on consumer surplus, producer surplus, government revenue, and deadwe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, international-trade, tariff, quota, export-subsidy, deadweight-loss, cfa-level-1"
}
</script>
