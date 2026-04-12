---
title: "Server Federation Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Enable real-time event exchange and membership coordination between independently operated servers so users on different servers share rooms without a central a"
---

# Server Federation Blueprint

> Enable real-time event exchange and membership coordination between independently operated servers so users on different servers share rooms without a central authority.

| | |
|---|---|
| **Feature** | `server-federation` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | federation, distributed, inter-server, decentralized, messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/server-federation.blueprint.yaml) |
| **JSON API** | [server-federation.json]({{ site.baseurl }}/api/blueprints/infrastructure/server-federation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `local_server` | Local Server | system | The originating homeserver processing a federation action |
| `remote_server` | Remote Server | external | A foreign homeserver participating in a shared room |
| `local_user` | Local User | human | A user whose account is hosted on the local server |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | token | Yes | Globally unique identifier for each event in the distributed graph |  |
| `room_id` | token | Yes | Identifier for the shared room spanning multiple servers |  |
| `sender` | text | Yes | Fully-qualified user identifier including home server domain |  |
| `event_type` | text | Yes | Type of matrix event (e.g. room message, membership change) |  |
| `depth` | number | Yes | DAG depth of the event for topological ordering |  |
| `prev_event_ids` | json | Yes | List of parent event IDs this event references in the DAG |  |
| `auth_event_ids` | json | Yes | State events that cryptographically authorize this event |  |
| `signatures` | json | Yes | Cryptographic signatures from sending and origin servers |  |
| `partial_state` | boolean | No | Whether the server has full or partial room state for this event |  |

## States

**State field:** `backfill_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `backfilling` |  |  |
| `failed` |  | Yes |
| `complete` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `backfilling` | local_server |  |
|  | `backfilling` | `complete` | remote_server |  |
|  | `backfilling` | `failed` | local_server |  |

## Rules

- **federation_policy:** Rooms created with the federation flag disabled reject all membership events from other servers, Only one backfill operation per room may run concurrently, Backfill contacts candidate servers sequentially; after five consecutive 4xx rejections a server is skipped, Every event must carry valid cryptographic signatures from both the sender's and origin server before acceptance, Events received from servers on a federation blocklist are rejected without processing, Servers in backoff state must not be contacted until the backoff window expires, Join operations lock the room event queue until the join completes, Rooms with partial state block certain operations until full state is obtained, Invite events must be co-signed by the invitee's server before distribution

## Outcomes

### Backfill_success (Priority: 1)

**Given:**
- room has events older than earliest known depth
- at least one candidate remote server is reachable
- room allows federation

**Then:**
- **create_record** target: `event_store` — Historical events persisted to local event store
- **emit_event** event: `federation.backfill.complete`

**Result:** Missing historical events are available for client retrieval

### Backfill_rejected (Priority: 2) — Error: `FEDERATION_BACKFILL_FAILED`

**Given:**
- all candidate servers return permanent errors or are unreachable

**Then:**
- **emit_event** event: `federation.backfill.failed`

**Result:** Backfill aborted; room history remains incomplete

### Join_via_federation (Priority: 3)

**Given:**
- local user requests to join a room hosted on a remote server
- room join rules permit the join

**Then:**
- **create_record** target: `event_store` — Membership event created and distributed to all room servers
- **emit_event** event: `federation.room.joined`

**Result:** User is a full member of the remote room and receives events

### Invite_via_federation (Priority: 4)

**Given:**
- local user invites a remote user
- inviter has sufficient permission in the room

**Then:**
- **create_record** target: `event_store` — Invite event signed by target server and distributed
- **emit_event** event: `federation.invite.sent`

**Result:** Remote user receives invite and can accept to join

### Federation_denied (Priority: 5) — Error: `FEDERATION_DENIED`

**Given:**
- ANY: destination server is on the federation blocklist OR destination server is in backoff state

**Then:**
- **emit_event** event: `federation.request.denied`

**Result:** Request fails immediately without network contact

### Event_signature_invalid (Priority: 6) — Error: `FEDERATION_SIGNATURE_INVALID`

**Given:**
- received event missing valid signature from sender or origin server

**Then:**
- **emit_event** event: `federation.event.rejected`

**Result:** Event discarded; not persisted or forwarded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FEDERATION_DENIED` | 403 | Federation with this server is not permitted | No |
| `FEDERATION_BACKFILL_FAILED` | 503 | Unable to retrieve room history from any available server | No |
| `FEDERATION_SIGNATURE_INVALID` | 400 | Event rejected: invalid or missing server signatures | No |
| `FEDERATION_REQUEST_FAILED` | 503 | Remote server did not respond to the federation request | No |
| `FEDERATION_ROOM_NOT_FEDERATED` | 403 | This room does not permit federation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `federation.backfill.complete` | Historical events successfully fetched from a remote server | `room_id`, `events_retrieved_count`, `source_server` |
| `federation.backfill.failed` | Backfill exhausted all candidate servers | `room_id`, `attempted_servers` |
| `federation.room.joined` | Local user successfully joined a remote room | `user_id`, `room_id`, `origin_server` |
| `federation.invite.sent` | Invite forwarded to and signed by target server | `inviter_id`, `invitee_id`, `room_id` |
| `federation.event.rejected` | Incoming event rejected due to signature or auth failure | `event_id`, `rejection_reason` |
| `federation.request.denied` | Outgoing request blocked by blocklist or backoff policy | `destination_server`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-lifecycle | required | Room creation initialises federation senders for each participating server |
| room-power-levels | required | Event authorization rules are checked against room power levels |
| room-state-history | required | State resolution is applied to events received via federation |
| e2e-key-exchange | optional | Device keys are fetched from remote servers via federation |

## AGI Readiness

### Goals

#### Reliable Server Federation

Enable real-time event exchange and membership coordination between independently operated servers so users on different servers share rooms without a central authority.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_lifecycle` | room-lifecycle | fail |
| `room_power_levels` | room-power-levels | fail |
| `room_state_history` | room-state-history | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| backfill_success | `autonomous` | - | - |
| backfill_rejected | `supervised` | - | - |
| join_via_federation | `autonomous` | - | - |
| invite_via_federation | `autonomous` | - | - |
| federation_denied | `autonomous` | - | - |
| event_signature_invalid | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 15
  entry_points:
    - synapse/handlers/federation.py
    - synapse/federation/sender/__init__.py
    - synapse/federation/federation_client.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Server Federation Blueprint",
  "description": "Enable real-time event exchange and membership coordination between independently operated servers so users on different servers share rooms without a central a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "federation, distributed, inter-server, decentralized, messaging"
}
</script>
