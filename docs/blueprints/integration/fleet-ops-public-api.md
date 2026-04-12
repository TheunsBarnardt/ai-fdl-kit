---
title: "Fleet Ops Public Api Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Versioned public REST API for rider and driver mobile apps, covering order management, driver operations, tracking, and location updates with API key authentica"
---

# Fleet Ops Public Api Blueprint

> Versioned public REST API for rider and driver mobile apps, covering order management, driver operations, tracking, and location updates with API key authentication.

| | |
|---|---|
| **Feature** | `fleet-ops-public-api` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | api, rest, versioned, authentication, driver, rider, mobile |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/fleet-ops-public-api.blueprint.yaml) |
| **JSON API** | [fleet-ops-public-api.json]({{ site.baseurl }}/api/blueprints/integration/fleet-ops-public-api.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `rider_app` | Rider App | system | Customer-facing mobile application consuming order and tracking endpoints. |
| `driver_app` | Driver App | system | Driver-facing mobile application consuming driver and order activity endpoints. |
| `platform` | Platform | system | API gateway that authenticates requests and routes them to the appropriate resource handlers. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `api_key` | token | Yes | Organization-scoped API key sent in the Authorization header or as a query parameter. |  |
| `api_version` | text | No | API version prefix (e.g., v1) included in the request path. |  |
| `resource_id` | text | No | Public identifier of the resource being operated on (e.g., order_xyz, driver_abc). |  |

## Rules

- **rule_01:** All public API requests must include a valid API key; unauthenticated requests receive a 401 response.
- **rule_02:** The API key establishes the organization context; all returned data is scoped to that organization.
- **rule_03:** API endpoints are versioned under a path prefix (e.g., /v1/); the version is part of the URL path.
- **rule_04:** Resource identifiers are public IDs (prefixed strings like order_xxx, driver_xxx), never internal database IDs.
- **rule_05:** Driver authentication uses a separate login endpoint that returns a bearer token for subsequent calls.
- **rule_06:** The API supports create, read, update, and delete operations for all core resources.
- **rule_07:** Special action endpoints (dispatch, start, cancel, complete, update-activity, track) are available on orders and drivers.
- **rule_08:** Webhook endpoint management is also available through the API for programmatic configuration.

## Outcomes

### Request_authenticated (Priority: 1)

**Given:**
- request includes a valid API key

**Then:**
- **set_field** target: `session.organization` — Organization context is resolved from the API key and set for the request.

**Result:** Request proceeds to the resource handler with full organization scope.

### Request_rejected_unauthenticated (Priority: 2) — Error: `API_UNAUTHENTICATED`

**Given:**
- request does not include a valid API key

**Result:** 401 response is returned.

### Order_created_via_api (Priority: 3)

**Given:**
- authenticated request to POST /v1/orders with pickup and drop-off

**Then:**
- **create_record** — Order is created with the provided payload; tracking number is returned.
- **emit_event** event: `order.created`

**Result:** Caller receives order resource with public ID and tracking number.

### Driver_location_updated_via_api (Priority: 4)

**Given:**
- authenticated driver POST to /v1/drivers/{id}/track with coordinates

**Then:**
- **set_field** target: `driver.location` — Driver location is updated; broadcast event is fired.
- **emit_event** event: `driver.location_changed`

**Result:** Location is updated and broadcast to subscribers.

### Resource_not_found (Priority: 5) — Error: `RESOURCE_NOT_FOUND`

**Given:**
- request references a resource ID that does not exist or belongs to a different organization

**Result:** 404 response is returned. The organization isolation ensures no resource leakage.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `API_UNAUTHENTICATED` | 401 | Invalid or missing API credentials. | No |
| `RESOURCE_NOT_FOUND` | 404 | The requested resource was not found. | No |
| `API_VERSION_NOT_SUPPORTED` | 400 | The requested API version is not supported. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.created` | Order is created via the API. | `order_id`, `tracking_number`, `customer_id` |
| `driver.location_changed` | Driver location is updated via the track endpoint. | `driver_id`, `latitude`, `longitude`, `heading`, `speed` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-tenant-organization | required | API keys are scoped to organizations; the API enforces tenant isolation. |
| ride-request-lifecycle | required | The order API drives the full lifecycle from creation to completion. |
| driver-app-flow | required | Driver app uses dedicated auth and track endpoints. |
| webhook-trip-lifecycle | recommended | Webhook endpoints can be managed through the API. |

## AGI Readiness

### Goals

#### Reliable Fleet Ops Public Api

Versioned public REST API for rider and driver mobile apps, covering order management, driver operations, tracking, and location updates with API key authentication.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `multi_tenant_organization` | multi-tenant-organization | degrade |
| `ride_request_lifecycle` | ride-request-lifecycle | degrade |
| `driver_app_flow` | driver-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| request_authenticated | `autonomous` | - | - |
| request_rejected_unauthenticated | `supervised` | - | - |
| order_created_via_api | `supervised` | - | - |
| driver_location_updated_via_api | `supervised` | - | - |
| resource_not_found | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 4
  entry_points:
    - src/routes.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Http/Controllers/Api/v1/DriverController.php
    - config/api.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Ops Public Api Blueprint",
  "description": "Versioned public REST API for rider and driver mobile apps, covering order management, driver operations, tracking, and location updates with API key authentica",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "api, rest, versioned, authentication, driver, rider, mobile"
}
</script>
