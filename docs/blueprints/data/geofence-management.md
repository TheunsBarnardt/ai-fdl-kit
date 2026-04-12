---
title: "Geofence Management Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Define named geographic boundary zones as circles (centre point + radius) or polygons (closed coordinate ring), optionally with altitude constraints and calenda"
---

# Geofence Management Blueprint

> Define named geographic boundary zones as circles (centre point + radius) or polygons (closed coordinate ring), optionally with altitude constraints and calendar-based activation schedules, and eva...

| | |
|---|---|
| **Feature** | `geofence-management` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, geofence, zone, polygon, circle, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/geofence-management.blueprint.yaml) |
| **JSON API** | [geofence-management.json]({{ site.baseurl }}/api/blueprints/data/geofence-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_admin` | Fleet Administrator | human | Creates and manages geofence zones on the map |
| `system` | Tracking Platform | system | Evaluates each incoming position against all active geofences assigned to the device |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `name` | text | Yes | Human-readable name for the zone |  |
| `description` | text | No | Optional notes about the purpose or location of the zone |  |
| `area` | text | Yes | Geometry definition in a portable text format. Circle: CIRCLE(lat lon, radiusMetres) Polygon: POL... |  |
| `geometry_type` | select | No | Derived geometry type: circle or polygon (determined from area field) |  |
| `altitude_floor` | number | No | Minimum altitude (metres above sea level) for the zone to apply; positions below this altitude ar... |  |
| `altitude_ceiling` | number | No | Maximum altitude (metres above sea level) for the zone to apply |  |
| `speed_limit` | number | No | Optional speed limit (in the platform's configured speed unit) that applies within this zone, ove... |  |
| `calendar_id` | hidden | No | Reference to a calendar record; when set, the zone is only active during the calendar's scheduled... |  |

## Rules

- **processing:**
  - **circle_containment:** A circle geofence is defined by a centre coordinate and a radius in metres; containment is determined by the great-circle distance from the position to the centre
  - **polygon_containment:** A polygon geofence uses a ray-casting (even-odd) algorithm to determine if the position point lies inside the closed ring
  - **altitude_constraints:** If altitude_floor or altitude_ceiling are set, a position is only considered inside the zone if its altitude satisfies the constraint
  - **calendar_activation:** If a calendar is associated, the zone is only considered active during calendar periods; positions received outside active periods are not evaluated against that zone
  - **speed_limit_override:** A zone may carry a speed_limit attribute; the platform uses the zone's speed limit in preference to the device-level limit when the device is inside the zone
- **data:**
  - **multiple_zones_concurrent:** Multiple zones can be active simultaneously for a single device; a position can be inside zero or more zones at the same time
  - **zone_ids_recorded_on_position:** The list of active zone IDs is recorded on each position record so historical queries can reconstruct zone membership at any point in time

## Outcomes

### Invalid_geometry (Priority: 1) — Error: `GEOFENCE_INVALID_GEOMETRY`

**Given:**
- area string does not parse as a valid circle or polygon

**Result:** Geofence is not saved; operator receives a geometry validation error

### Position_inside_zone (Priority: 5)

**Given:**
- an incoming position is evaluated and the point lies within the zone boundary
- zone calendar is active (or no calendar is set)
- position altitude is within floor and ceiling constraints (if set)

**Then:**
- **set_field** target: `position.geofence_ids` — Zone ID is added to the position's active zone list

**Result:** Zone ID recorded on position; geofence alert handler can detect entry transitions

### Geofence_deleted (Priority: 8)

**Given:**
- fleet_admin deletes a geofence zone

**Then:**
- **delete_record** target: `geofence`
- **emit_event** event: `geofence.deleted`

**Result:** Zone is removed; no further entry or exit events will be generated for it

### Geofence_updated (Priority: 9)

**Given:**
- fleet_admin submits updated name, area, or attributes
- `geofence_id` (db) exists

**Then:**
- **set_field** target: `area` — Geometry updated; parsed geometry cache is invalidated
- **emit_event** event: `geofence.updated`

**Result:** Zone definition updated; subsequent position evaluations use the new geometry

### Geofence_created (Priority: 10)

**Given:**
- fleet_admin provides name and valid area geometry

**Then:**
- **create_record** target: `geofence` — Geofence record persisted; geometry is parsed and validated
- **emit_event** event: `geofence.created`

**Result:** Zone is saved and immediately evaluated against future incoming positions

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOFENCE_INVALID_GEOMETRY` | 400 | The zone boundary definition is invalid; check coordinate format and closure | No |
| `GEOFENCE_NOT_FOUND` | 404 | The specified geofence does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `geofence.created` | A new geographic zone has been defined | `geofence_id`, `name`, `geometry_type`, `calendar_id` |
| `geofence.updated` | A zone's boundary or attributes have been modified | `geofence_id`, `changed_fields` |
| `geofence.deleted` | A geographic zone has been removed | `geofence_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| geofence-alerts | required | Entry and exit events are generated by comparing zone memberships between consecutive positions |
| gps-position-ingestion | required | Positions must be ingested and enriched with zone membership before alert evaluation |
| overspeed-alerts | recommended | Zone-level speed limits override device-level limits for overspeed detection |

## AGI Readiness

### Goals

#### Reliable Geofence Management

Define named geographic boundary zones as circles (centre point + radius) or polygons (closed coordinate ring), optionally with altitude constraints and calendar-based activation schedules, and eva...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `geofence_alerts` | geofence-alerts | degrade |
| `gps_position_ingestion` | gps-position-ingestion | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| geofence_created | `supervised` | - | - |
| geofence_updated | `supervised` | - | - |
| geofence_deleted | `human_required` | - | - |
| position_inside_zone | `autonomous` | - | - |
| invalid_geometry | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Hibernate
  files_traced: 8
  entry_points:
    - src/main/java/org/traccar/model/Geofence.java
    - src/main/java/org/traccar/geofence/GeofenceCircle.java
    - src/main/java/org/traccar/geofence/GeofencePolygon.java
    - src/main/java/org/traccar/handler/GeofenceHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geofence Management Blueprint",
  "description": "Define named geographic boundary zones as circles (centre point + radius) or polygons (closed coordinate ring), optionally with altitude constraints and calenda",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, geofence, zone, polygon, circle, fleet"
}
</script>
