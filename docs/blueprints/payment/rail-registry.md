---
title: "Rail Registry Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Pluggable RailAdapter registry — admin API to add/swap rails, routing policy engine that selects a rail per payment by amount/region/merchant. 5 fields. 4 outco"
---

# Rail Registry Blueprint

> Pluggable RailAdapter registry — admin API to add/swap rails, routing policy engine that selects a rail per payment by amount/region/merchant

| | |
|---|---|
| **Feature** | `rail-registry` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | rail, registry, routing, policy, pluggable, adapter |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/rail-registry.blueprint.yaml) |
| **JSON API** | [rail-registry.json]({{ site.baseurl }}/api/blueprints/payment/rail-registry.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pgw` | Payments Gateway | system | Caller — asks registry to route each payment |
| `admin` | Admin operator | human | Registers / swaps rail adapters via admin API |
| `adapter` | RailAdapter plugin | external | Implementation of the rail contract (PayShap, Visa, RTGS, sandbox, …) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `rail_id` | text | Yes | Rail identifier (e.g. payshap, visa, sandbox) |  |
| `adapter_module` | text | Yes | Module path implementing the RailAdapter contract |  |
| `priority` | number | Yes | Tie-break priority when policies match multiple rails |  |
| `enabled` | boolean | Yes | Whether the rail is currently routable |  |
| `routing_policy` | json | Yes | Policy expression (amount/currency/region/merchant rules) |  |

## Rules

- **contract:** MUST: every rail adapter implements authorize(), capture(), refund(), status(), supports_currency(), MUST: registering a rail does NOT require device firmware updates
- **routing:** MUST: routing evaluates policies in priority order; first match wins, MUST: disabled rails are never selected even when policy matches
- **admin:** MUST: rail registration requires operator role + mTLS-authenticated admin session

## Outcomes

### Unauthorized (Priority: 1) — Error: `RAIL_UNAUTHORIZED`

**Given:**
- admin session missing or insufficient role

**Result:** 401 — operator auth required

### Invalid_policy (Priority: 5) — Error: `RAIL_INVALID_POLICY`

**Given:**
- routing_policy fails schema validation

**Result:** 400 — policy rejected

### Duplicate (Priority: 10) — Error: `RAIL_ALREADY_EXISTS`

**Given:**
- rail_id already registered

**Result:** 409 — use PUT to update instead

### Rail_registered (Priority: 100)

**Given:**
- operator role verified
- adapter_module is in the signed allowlist
- routing_policy parses and validates

**Then:**
- **create_record**
- **emit_event** event: `rail.registered`

**Result:** Rail available for routing on next payment

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RAIL_INVALID_POLICY` | 400 | Routing policy is invalid | No |
| `RAIL_UNAUTHORIZED` | 401 | Admin authentication required | No |
| `RAIL_ALREADY_EXISTS` | 409 | A rail with that id already exists | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rail.registered` |  |  |
| `rail.disabled` |  |  |
| `rail.routing.decision` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payments-gateway-api | required | PGW is the sole caller of the registry during routing |
| payshap-rail | recommended | First-class ZA rail adapter |
| sandbox-rail-adapter | recommended | Mock rail used for sandbox and demos |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Rail Registry Blueprint",
  "description": "Pluggable RailAdapter registry — admin API to add/swap rails, routing policy engine that selects a rail per payment by amount/region/merchant. 5 fields. 4 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rail, registry, routing, policy, pluggable, adapter"
}
</script>
