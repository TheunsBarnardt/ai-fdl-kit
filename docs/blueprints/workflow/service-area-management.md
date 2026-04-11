---
title: "Service Area Management Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Define and manage geographic service areas and zones that control where fleet operations are permitted. 9 fields. 5 outcomes. 3 error codes. rules: valid_bounda"
---

# Service Area Management Blueprint

> Define and manage geographic service areas and zones that control where fleet operations are permitted

| | |
|---|---|
| **Feature** | `service-area-management` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, geofence, service-area, zones, geography, operational |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/service-area-management.blueprint.yaml) |
| **JSON API** | [service-area-management.json]({{ site.baseurl }}/api/blueprints/workflow/service-area-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Administrator defining operational regions |
| `system` | System | system | Geospatial engine enforcing area boundaries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `area_id` | text | Yes | Area ID |  |
| `name` | text | Yes | Area Name |  |
| `type` | select | No | Area Type |  |
| `country` | text | No | Country |  |
| `border` | json | Yes | Boundary (GeoJSON) |  |
| `color` | text | No | Fill Color |  |
| `stroke_color` | text | No | Border Color |  |
| `parent_uuid` | text | No | Parent Area |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `inactive` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `inactive` | fleet_manager |  |
|  | `inactive` | `active` | fleet_manager |  |

## Rules

- **valid_boundary:** A service area must have a valid GeoJSON polygon with at least 3 coordinate pairs
- **hierarchical_nesting:** Service areas can be nested within a parent area to create hierarchical zones
- **inactive_excluded:** Inactive service areas are excluded from order creation and driver assignment
- **outside_area_rejection:** Orders placed outside all active service areas are rejected unless global operations are enabled
- **zone_support:** Each service area can have one or more zones as sub-regions with specific rules or rates
- **geometry_storage:** Service area and zone boundaries are stored as geometry columns for spatial query performance
- **fleet_scoping:** Fleet assignments can be scoped to specific service areas
- **overlap_allowed:** Overlapping service areas are permitted; the most specific matching area takes precedence
- **rate_binding:** Service rate structures can be bound to specific service areas and zones
- **valid_colors:** Visualization colors must be valid hex color codes

## Outcomes

### Area_created (Priority: 1)

**Given:**
- `name` (input) exists
- `border` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `service_area.created`

**Result:** Service area created and visible on operations map

### Order_outside_area (Priority: 1) — Error: `ORDER_OUTSIDE_SERVICE_AREA`

**Given:**
- order origin or destination falls outside all active service areas
- organization does not permit global operations

**Result:** Order rejected — location is outside operational service areas

### Zone_added (Priority: 2)

**Given:**
- parent service area exists and is active
- `border` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `service_area.zone_added`

**Result:** Sub-zone added to the service area

### Invalid_boundary (Priority: 2) — Error: `SERVICE_AREA_INVALID_BOUNDARY`

**Given:**
- border GeoJSON is malformed or has fewer than 3 coordinate pairs

**Result:** Area creation rejected due to invalid boundary

### Area_deactivated (Priority: 3)

**Given:**
- `status` (db) eq `active`

**Then:**
- **set_field** target: `status` value: `inactive`
- **emit_event** event: `service_area.deactivated`

**Result:** Service area deactivated; no new orders allowed within boundary

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_OUTSIDE_SERVICE_AREA` | 422 | This location is outside our operational service area. | No |
| `SERVICE_AREA_INVALID_BOUNDARY` | 422 | The provided boundary is invalid. Please draw a valid polygon. | No |
| `SERVICE_AREA_NOT_FOUND` | 404 | Service area not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `service_area.created` | Fired when a new service area is created | `area_id`, `name`, `type`, `country` |
| `service_area.updated` | Fired when a service area boundary or settings change | `area_id`, `name` |
| `service_area.deactivated` | Fired when a service area is disabled | `area_id`, `name` |
| `service_area.zone_added` | Fired when a zone is added to a service area | `area_id`, `zone_id`, `name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | recommended | Orders are validated against service area boundaries |
| vehicle-fleet-registry | recommended | Fleet assignments can be scoped to service areas |
| trip-billing-invoicing | optional | Service rates are linked to specific areas and zones |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Service Area Management Blueprint",
  "description": "Define and manage geographic service areas and zones that control where fleet operations are permitted. 9 fields. 5 outcomes. 3 error codes. rules: valid_bounda",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, geofence, service-area, zones, geography, operational"
}
</script>
