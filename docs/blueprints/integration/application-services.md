---
title: "Application Services Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Connect the messaging server to external systems through registered bridges. Services receive a filtered event stream, provision virtual users/rooms, and respon"
---

# Application Services Blueprint

> Connect the messaging server to external systems through registered bridges. Services receive a filtered event stream, provision virtual users/rooms, and respond to existence queries.

| | |
|---|---|
| **Feature** | `application-services` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | bridge, appservice, integration, bot, virtual-users, webhooks |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/application-services.blueprint.yaml) |
| **JSON API** | [application-services.json]({{ site.baseurl }}/api/blueprints/integration/application-services.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `application_service` | Application Service | external | Registered external program that consumes and produces room events |
| `homeserver` | Homeserver | system | Server routing events to registered services and enforcing namespace rules |
| `user` | User | human | User whose events may be routed to application services |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_id` | token | Yes | Unique identifier for the registered application service |  |
| `as_token` | token | Yes | Shared secret the service presents to authenticate inbound requests |  |
| `hs_token` | token | Yes | Shared secret the homeserver presents when calling the service |  |
| `user_namespace_regex` | text | No | Regular expression matching user IDs managed by this service |  |
| `room_alias_regex` | text | No | Regular expression matching room aliases managed by this service |  |
| `exclusive` | boolean | No | Whether the namespace is exclusively owned by this service |  |
| `transaction_id` | token | No | Identifier for an event batch delivered to the service |  |
| `last_processed_position` | number | No | Stream position tracking how far the service has received events |  |

## States

**State field:** `service_delivery_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `delivering` |  |  |
| `retrying` |  |  |
| `failed` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `delivering` | homeserver |  |
|  | `delivering` | `idle` | application_service |  |
|  | `delivering` | `retrying` | homeserver |  |
|  | `retrying` | `delivering` | homeserver |  |

## Rules

- **namespaces:** Application services register interest using regular expressions for user IDs, room aliases, and room IDs, Exclusive namespaces prevent other users and services from creating users or aliases in that pattern
- **delivery:** Events are delivered in strictly sequential order per service; new batch not sent until previous acknowledged, Before delivering an event, the homeserver queries the service to check if an unknown user should be provisioned, A maximum of 100 events are batched per transaction, Failed deliveries are retried with exponential backoff; last processed position persisted for recovery, Ephemeral events (typing, presence, read receipts) are delivered separately from room events, Services may act as users in their namespace by authenticating with their service token

## Outcomes

### Events_delivered (Priority: 1)

**Given:**
- one or more room events match the service's interest patterns
- previous transaction was acknowledged

**Then:**
- **notify** — Event batch sent as a transaction to the service's endpoint
- **set_field** target: `last_processed_position` — Stream position advanced after acknowledgement
- **emit_event** event: `appservice.events_delivered`

**Result:** Service receives and processes the events

### User_provisioned (Priority: 2)

**Given:**
- homeserver encounters an unknown user ID
- user ID matches the service's user namespace

**Then:**
- **call_service** target: `appservice_user_query` — Homeserver queries the service's user existence endpoint
- **emit_event** event: `appservice.user_provisioned`

**Result:** Service creates the virtual user; subsequent operations proceed

### Alias_provisioned (Priority: 3)

**Given:**
- homeserver encounters an unknown room alias
- alias matches the service's alias namespace

**Then:**
- **call_service** target: `appservice_alias_query` — Homeserver queries the service's alias existence endpoint
- **emit_event** event: `appservice.alias_provisioned`

**Result:** Service creates the room for the alias; lookup resolves successfully

### Delivery_failed (Priority: 4)

**Given:**
- service endpoint returns an error or times out

**Then:**
- **emit_event** event: `appservice.delivery_failed`

**Result:** Delivery retried with backoff; event stream paused for this service

### Namespace_conflict (Priority: 5) — Error: `APPSERVICE_NAMESPACE_CONFLICT`

**Given:**
- user or alias creation targets an exclusive namespace owned by another service

**Result:** Creation rejected; namespace is reserved

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `APPSERVICE_NAMESPACE_CONFLICT` | 403 | This alias or user ID is reserved by a registered application service | No |
| `APPSERVICE_SERVICE_UNAVAILABLE` | 503 | Application service is currently unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `appservice.events_delivered` | A batch of room events was successfully delivered to a service | `service_id`, `transaction_id`, `event_count` |
| `appservice.user_provisioned` | A service provisioned a virtual user in response to a query | `service_id`, `user_id` |
| `appservice.alias_provisioned` | A service provisioned a room in response to an alias query | `service_id`, `alias` |
| `appservice.delivery_failed` | Event delivery to a service failed; retry scheduled | `service_id`, `transaction_id`, `retry_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-aliases | required | Application services enforce exclusive namespace rules on alias creation |
| room-lifecycle | recommended | Services can create rooms on behalf of users in their namespace |
| server-federation | recommended | Services may bridge federated rooms from external networks |

## AGI Readiness

### Goals

#### Reliable Application Services

Connect the messaging server to external systems through registered bridges. Services receive a filtered event stream, provision virtual users/rooms, and respond to existence queries.

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

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_aliases` | room-aliases | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| events_delivered | `autonomous` | - | - |
| user_provisioned | `autonomous` | - | - |
| alias_provisioned | `autonomous` | - | - |
| delivery_failed | `autonomous` | - | - |
| namespace_conflict | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 10
  entry_points:
    - synapse/handlers/appservice.py
    - synapse/appservice/scheduler.py
    - synapse/appservice/api.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Application Services Blueprint",
  "description": "Connect the messaging server to external systems through registered bridges. Services receive a filtered event stream, provision virtual users/rooms, and respon",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bridge, appservice, integration, bot, virtual-users, webhooks"
}
</script>
