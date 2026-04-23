<!-- AUTO-GENERATED FROM service-area-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Service Area Management

> Define and manage geographic service areas and zones that control where fleet operations are permitted

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** fleet · geofence · service-area · zones · geography · operational

## What this does

Define and manage geographic service areas and zones that control where fleet operations are permitted

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **area_id** *(text, required)* — Area ID
- **name** *(text, required)* — Area Name
- **type** *(select, optional)* — Area Type
- **country** *(text, optional)* — Country
- **border** *(json, required)* — Boundary (GeoJSON)
- **color** *(text, optional)* — Fill Color
- **stroke_color** *(text, optional)* — Border Color
- **parent_uuid** *(text, optional)* — Parent Area
- **status** *(select, required)* — Status
- **zone_id** *(text, optional)* — Zone ID
- **zone_name** *(text, optional)* — Zone Name
- **zone_description** *(text, optional)* — Zone Description
- **zone_border** *(json, optional)* — Zone Boundary (GeoJSON)

## What must be true

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
- **multi_polygon_support:** Service areas support multi-polygon geometry for non-contiguous regions
- **zone_containment:** Zone entry and exit detection via driver location updates fires zone.driver_entered/exited events
- **fleet_zone_scoping:** Fleets can be assigned to specific zones to restrict or organize operational coverage

## Success & failure scenarios

**✅ Success paths**

- **Area Created** — when name exists; border exists, then Service area created and visible on operations map.
- **Zone Added** — when parent service area exists and is active; border exists, then Sub-zone added to the service area.
- **Area Deactivated** — when status eq "active", then Service area deactivated; no new orders allowed within boundary.
- **Fleet Scoped To Zone** — when dispatcher assigns a fleet to a service area or zone, then Fleet operations logically restricted to the assigned zone.
- **Zone Containment Checked** — when a point (driver or order location) is tested against zone boundaries, then Platform can enforce or report whether a location is within an operational zone.

**❌ Failure paths**

- **Order Outside Area** — when order origin or destination falls outside all active service areas; organization does not permit global operations, then Order rejected — location is outside operational service areas. *(error: `ORDER_OUTSIDE_SERVICE_AREA`)*
- **Invalid Boundary** — when border GeoJSON is malformed or has fewer than 3 coordinate pairs, then Area creation rejected due to invalid boundary. *(error: `SERVICE_AREA_INVALID_BOUNDARY`)*

## Errors it can return

- `ORDER_OUTSIDE_SERVICE_AREA` — This location is outside our operational service area.
- `SERVICE_AREA_INVALID_BOUNDARY` — The provided boundary is invalid. Please draw a valid polygon.
- `SERVICE_AREA_NOT_FOUND` — Service area not found.
- `ZONE_NOT_FOUND` — The specified zone could not be found.

## Events

**`service_area.created`** — Fired when a new service area is created
  Payload: `area_id`, `name`, `type`, `country`

**`service_area.updated`** — Fired when a service area boundary or settings change
  Payload: `area_id`, `name`

**`service_area.deactivated`** — Fired when a service area is disabled
  Payload: `area_id`, `name`

**`service_area.zone_added`** — Fired when a zone is added to a service area
  Payload: `area_id`, `zone_id`, `name`

**`zone.driver_entered`** — Driver's location update places them inside a zone boundary
  Payload: `zone_id`, `driver_id`, `latitude`, `longitude`

**`zone.driver_exited`** — Driver's location update places them outside a zone they were previously in
  Payload: `zone_id`, `driver_id`, `latitude`, `longitude`

## Connects to

- **order-lifecycle** *(recommended)* — Orders are validated against service area boundaries
- **vehicle-fleet-registry** *(recommended)* — Fleet assignments can be scoped to service areas
- **trip-billing-invoicing** *(optional)* — Service rates are linked to specific areas and zones
- **driver-location-streaming** *(recommended)* — Driver location updates enable real-time zone entry/exit detection

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/service-area-management/) · **Spec source:** [`service-area-management.blueprint.yaml`](./service-area-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
