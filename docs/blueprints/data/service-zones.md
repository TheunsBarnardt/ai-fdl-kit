---
title: "Service Zones Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Define geographic service areas and subdivide them into operational zones, used to scope fleet operations, restrict order pickup and drop-off, and assign driver"
---

# Service Zones Blueprint

> Define geographic service areas and subdivide them into operational zones, used to scope fleet operations, restrict order pickup and drop-off, and assign drivers to specific areas.

| | |
|---|---|
| **Feature** | `service-zones` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | geospatial, zones, service-areas, polygons, operations |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/service-zones.blueprint.yaml) |
| **JSON API** | [service-zones.json]({{ site.baseurl }}/api/blueprints/data/service-zones.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `operator` | Fleet Operator | human | Defines service areas and zones using polygon geometries. |
| `platform` | Platform | system | Enforces zone containment checks for orders and driver assignments. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_area_id` | text | No | Public identifier of the service area. |  |
| `service_area_name` | text | Yes | Human-readable name of the service area (e.g., "Greater Cape Town"). |  |
| `service_area_type` | select | No | Geometry type for the service area border. |  |
| `border` | json | Yes | GeoJSON polygon or multi-polygon defining the geographic boundary. |  |
| `color` | text | No | Fill color used to render the area on maps. |  |
| `stroke_color` | text | No | Border/outline color for map rendering. |  |
| `status` | select | No | Whether this service area is active. |  |
| `zone_id` | text | No | Public identifier of a sub-zone. |  |
| `zone_name` | text | Yes | Name of the zone (e.g., "City Bowl", "Northern Suburbs"). |  |
| `zone_description` | text | No | Description of what the zone covers. |  |
| `zone_border` | json | Yes | GeoJSON polygon defining the zone's boundary within the service area. |  |

## Rules

- **rule_01:** Service areas use multi-polygon geometry to support non-contiguous regions.
- **rule_02:** Zones use single polygon geometry and are always nested within a parent service area.
- **rule_03:** All service area and zone records are scoped to the organization.
- **rule_04:** Zones can be assigned to fleets to restrict or organize operational coverage.
- **rule_05:** Orders may be validated against service area boundaries; orders outside all active service areas can be rejected.
- **rule_06:** Zone entry and exit detection (driver crossing a zone boundary) is supported via location change events.
- **rule_07:** Service areas and zones support visual differentiation via color and stroke_color for map display.

## Outcomes

### Service_area_created (Priority: 1)

**Given:**
- operator provides a name and valid polygon geometry

**Then:**
- **create_record** — Service area is stored with spatial index for efficient containment queries.

**Result:** Service area is active and available for zone nesting, fleet scoping, and order validation.

### Zone_created (Priority: 2)

**Given:**
- operator provides a zone name, polygon geometry, and a parent service area reference

**Then:**
- **create_record** — Zone is stored as a sub-region of the service area.

**Result:** Zone is available for fleet assignment and driver geo-fencing.

### Fleet_scoped_to_zone (Priority: 3)

**Given:**
- dispatcher assigns a fleet to a service area and/or zone

**Then:**
- **set_field** target: `fleet.service_area_id` — Fleet is associated with the service area.
- **set_field** target: `fleet.zone_id` — Fleet is associated with the specific zone.

**Result:** Fleet operations are logically restricted to the assigned zone.

### Zone_containment_checked (Priority: 4)

**Given:**
- a point (driver or order location) is tested against zone boundaries

**Then:**
- **set_field** target: `response.inside_zone` — Boolean result indicating if the point falls within any zone boundary.

**Result:** Platform can enforce or report whether a given location is within an operational zone.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SERVICE_AREA_NOT_FOUND` | 404 | The specified service area could not be found. | No |
| `ZONE_NOT_FOUND` | 404 | The specified zone could not be found. | No |
| `INVALID_GEOMETRY` | 400 | The provided border geometry is not a valid polygon. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `zone.driver_entered` | Driver's location update places them inside a zone boundary. | `zone_id`, `driver_id`, `latitude`, `longitude` |
| `zone.driver_exited` | Driver's location update places them outside a zone they were previously in. | `zone_id`, `driver_id`, `latitude`, `longitude` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fleet-vehicle-registry | recommended | Fleets can be scoped to specific service areas and zones. |
| driver-location-streaming | recommended | Driver location updates enable real-time zone entry/exit detection. |
| driver-assignment-dispatch | optional | Dispatch can be filtered to drivers within a specific zone. |

## AGI Readiness

### Goals

#### Reliable Service Zones

Define geographic service areas and subdivide them into operational zones, used to scope fleet operations, restrict order pickup and drop-off, and assign drivers to specific areas.

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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| service_area_created | `supervised` | - | - |
| zone_created | `supervised` | - | - |
| fleet_scoped_to_zone | `autonomous` | - | - |
| zone_containment_checked | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 4
  entry_points:
    - src/Models/ServiceArea.php
    - src/Models/Zone.php
    - src/Http/Controllers/Api/v1/ServiceAreaController.php
    - src/Http/Controllers/Api/v1/ZoneController.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Service Zones Blueprint",
  "description": "Define geographic service areas and subdivide them into operational zones, used to scope fleet operations, restrict order pickup and drop-off, and assign driver",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "geospatial, zones, service-areas, polygons, operations"
}
</script>
