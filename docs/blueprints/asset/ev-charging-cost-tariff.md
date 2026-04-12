---
title: "Ev Charging Cost Tariff Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Calculates EV charging session cost using location-linked tariffs (per-kWh or per-minute) with optional flat session fees and free-charging programme exemptions"
---

# Ev Charging Cost Tariff Blueprint

> Calculates EV charging session cost using location-linked tariffs (per-kWh or per-minute) with optional flat session fees and free-charging programme exemptions.

| | |
|---|---|
| **Feature** | `ev-charging-cost-tariff` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | ev, charging, cost, tariff, billing, geofence, vehicle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/ev-charging-cost-tariff.blueprint.yaml) |
| **JSON API** | [ev-charging-cost-tariff.json]({{ site.baseurl }}/api/blueprints/asset/ev-charging-cost-tariff.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Applies tariff rules and calculates cost when a session closes |
| `vehicle_owner` | Vehicle Owner | human | Configures tariffs on charging locations and free-charging eligibility |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `location_id` | hidden | No | Charging Location (Geofence) |  |
| `billing_type` | select | No | Billing Type |  |
| `cost_per_unit` | number | No | Cost Per Unit |  |
| `session_fee` | number | No | Session Fee |  |
| `charge_energy_added_kwh` | number | No | Energy Added (kWh) |  |
| `charge_energy_used_kwh` | number | No | Grid Energy Used (kWh) |  |
| `duration_min` | number | No | Session Duration (minutes) |  |
| `is_free_charging_eligible` | boolean | No | Free Charging Eligible |  |
| `charger_network` | text | No | Charger Network |  |
| `calculated_cost` | number | No | Calculated Cost |  |

## Rules

- **cost_requires_tariff:**
  - **description:** Cost is only calculated when billing_type and cost_per_unit are both configured for the charging location; sessions without a tariff have null cost
- **per_kwh_uses_higher_value:**
  - **description:** Per-kWh billing uses max(charge_energy_used_kwh, charge_energy_added_kwh) x cost_per_unit + session_fee — the larger value protects against under-charging due to metering differences
- **per_minute_billing:**
  - **description:** Per-minute billing uses duration_min x cost_per_unit + session_fee
- **free_charging_exemption:**
  - **description:** If the vehicle holds a free-charging entitlement and the session used the qualifying network, cost is set to 0.00 regardless of any configured tariff
- **session_fee_non_negative:**
  - **description:** Session fee must be zero or positive; negative fees are rejected
- **retroactive_tariff_update:**
  - **description:** Updating a geofence tariff retroactively recalculates the cost of all historical sessions matched to that geofence

## Outcomes

### Cost_calculated_per_kwh (Priority: 1)

**Given:**
- `billing_type` (db) eq `per_kwh`
- `is_free_charging_eligible` (db) neq `true`
- `cost_per_unit` (db) exists

**Then:**
- **set_field** target: `calculated_cost` value: `max(charge_energy_used_kwh, charge_energy_added_kwh) x cost_per_unit + session_fee`
- **emit_event** event: `charging.cost.calculated`

**Result:** Cost computed from energy delivered; attached to the session record

### Cost_calculated_per_minute (Priority: 2)

**Given:**
- `billing_type` (db) eq `per_minute`
- `is_free_charging_eligible` (db) neq `true`
- `cost_per_unit` (db) exists

**Then:**
- **set_field** target: `calculated_cost` value: `duration_min x cost_per_unit + session_fee`
- **emit_event** event: `charging.cost.calculated`

**Result:** Cost computed from session duration; attached to the session record

### Cost_zero_free_charging (Priority: 3)

**Given:**
- `is_free_charging_eligible` (db) eq `true`
- session charger_network matches the qualifying free-charging network

**Then:**
- **set_field** target: `calculated_cost` value: `0`
- **emit_event** event: `charging.cost.free`

**Result:** Session cost set to zero under free-charging entitlement

### Cost_null_no_tariff (Priority: 4)

**Given:**
- ANY: `billing_type` (db) not_exists OR `cost_per_unit` (db) not_exists OR no geofence matched the charging location

**Then:**
- **set_field** target: `calculated_cost` value: `null`

**Result:** Cost left as null; session recorded without financial data

### Tariff_retroactively_applied (Priority: 5)

**Given:**
- a location tariff has been created or updated by the operator

**Then:**
- **emit_event** event: `charging.cost.tariff_changed`
- **set_field** target: `calculated_cost` — Recalculated using new tariff for all historical sessions at this location

**Result:** Historical charging costs updated to reflect the new tariff

### Session_fee_invalid (Priority: 6) — Error: `TARIFF_INVALID_SESSION_FEE`

**Given:**
- `session_fee` (input) lt `0`

**Result:** Tariff not saved; user informed that session fee must be non-negative

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TARIFF_INVALID_SESSION_FEE` | 422 | Session fee must be zero or a positive value. | No |
| `TARIFF_MISSING_COST_PER_UNIT` | 422 | A billing type is set but no cost per unit is configured. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `charging.cost.calculated` | Session cost calculated using a location tariff | `session_id`, `calculated_cost`, `billing_type`, `cost_per_unit`, `session_fee` |
| `charging.cost.free` | Session cost set to zero due to free-charging programme eligibility | `session_id`, `reason`, `charger_network` |
| `charging.cost.tariff_changed` | A location tariff was changed; historical session costs may be updated | `location_id`, `billing_type`, `cost_per_unit`, `session_fee` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ev-charging-session | required |  |
| geofence-places | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 4
  entry_points:
    - lib/teslamate/log/charging_process.ex
    - lib/teslamate/locations/geo_fence.ex
    - lib/teslamate/settings/car_settings.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ev Charging Cost Tariff Blueprint",
  "description": "Calculates EV charging session cost using location-linked tariffs (per-kWh or per-minute) with optional flat session fees and free-charging programme exemptions",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ev, charging, cost, tariff, billing, geofence, vehicle"
}
</script>
