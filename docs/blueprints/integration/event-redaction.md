---
title: "Event Redaction Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Remove sensitive content from previously sent events. Creates a redaction event that prunes original content while preserving graph position and essential metad"
---

# Event Redaction Blueprint

> Remove sensitive content from previously sent events. Creates a redaction event that prunes original content while preserving graph position and essential metadata.

| | |
|---|---|
| **Feature** | `event-redaction` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | redaction, moderation, privacy, content-removal, rooms, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/event-redaction.blueprint.yaml) |
| **JSON API** | [event-redaction.json]({{ site.baseurl }}/api/blueprints/integration/event-redaction.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `event_author` | Event Author | human | User who originally sent the event; may redact their own content |
| `moderator` | Room Moderator | human | User with the redact power level who may redact any event |
| `homeserver` | Homeserver | system | Server applying pruning rules and persisting the redaction event |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | token | Yes | Identifier of the event to be redacted |  |
| `redaction_event_id` | token | No | Identifier of the newly created redaction event |  |
| `reason` | text | No | Optional human-readable explanation for the redaction |  |
| `redacted_content` | json | No | Pruned event content; only fields permitted by room version rules are retained |  |
| `room_version` | text | No | Determines which pruning rules are applied to the redacted event |  |

## Rules

- **authorization:** Any user may redact their own events at any time, Redacting another user's event requires meeting the room's redact power level threshold, Redaction creates an immutable redaction event in the room's event graph; original event is not deleted
- **pruning:** The pruning algorithm removes all content fields except those explicitly permitted for the event type, Permitted fields after redaction vary by event type: membership keeps state; power levels keep values, The genesis event cannot be meaningfully redacted; its permitted fields are preserved, Encrypted event content is completely removed on redaction; no algorithm or ciphertext is retained, Metadata (event ID, sender, room ID, type, timestamps, signatures, auth chain) is always preserved
- **idempotency:** Redacting an already-redacted event is a no-op; subsequent redactions have no additional effect, Redaction events themselves cannot be redacted

## Outcomes

### Self_redaction (Priority: 1)

**Given:**
- requester is authenticated
- event being redacted was sent by the requester

**Then:**
- **create_record** target: `event_graph` — Redaction event persisted in the room graph
- **set_field** target: `redacted_content` — Original event content pruned according to room version rules
- **emit_event** event: `event.redacted`

**Result:** Event content removed; room participants see the event as redacted

### Moderator_redaction (Priority: 2)

**Given:**
- requester's power level meets or exceeds the room's redact threshold
- target event belongs to a different user

**Then:**
- **create_record** target: `event_graph` — Redaction event persisted
- **set_field** target: `redacted_content` — Target event content pruned
- **emit_event** event: `event.redacted`

**Result:** Moderator removes the content; optional reason is visible in the redaction event

### Redaction_permission_denied (Priority: 3) — Error: `REDACTION_PERMISSION_DENIED`

**Given:**
- requester did not send the original event
- requester's power level is below the redact threshold

**Result:** Redaction rejected; event content unchanged

### Already_redacted (Priority: 4)

**Given:**
- target event has already been redacted

**Then:**
- **emit_event** event: `event.redaction_noop`

**Result:** No change; event was already redacted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REDACTION_PERMISSION_DENIED` | 403 | You do not have permission to redact this event | No |
| `REDACTION_TARGET_NOT_FOUND` | 404 | The event to be redacted was not found | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `event.redacted` | An event's content was removed by its author or a moderator | `event_id`, `redaction_event_id`, `redactor_id` |
| `event.redaction_noop` | A redaction was requested for an event that had already been redacted | `event_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-power-levels | required | The redact power level threshold is defined in the room's power levels event |
| room-state-history | required | Redaction events are appended to the room's immutable event graph |
| room-lifecycle | recommended | Room version determines which pruning rules apply during redaction |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 6
  entry_points:
    - synapse/handlers/room.py
    - synapse/events/utils.py
    - synapse/event_auth.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Event Redaction Blueprint",
  "description": "Remove sensitive content from previously sent events. Creates a redaction event that prunes original content while preserving graph position and essential metad",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "redaction, moderation, privacy, content-removal, rooms, compliance"
}
</script>
