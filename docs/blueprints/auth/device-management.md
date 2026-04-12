---
title: "Device Management Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Track all client sessions as named devices per user account. List, rename, and delete devices with cascading cleanup. Auto-purge devices inactive beyond retenti"
---

# Device Management Blueprint

> Track all client sessions as named devices per user account. List, rename, and delete devices with cascading cleanup. Auto-purge devices inactive beyond retention period.

| | |
|---|---|
| **Feature** | `device-management` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | devices, sessions, security, e2e, logout, access-control |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/device-management.blueprint.yaml) |
| **JSON API** | [device-management.json]({{ site.baseurl }}/api/blueprints/auth/device-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `account_owner` | Account Owner | human | User managing their own registered devices |
| `server_admin` | Server Administrator | human | Admin managing devices on behalf of users |
| `homeserver` | Homeserver | system | Server enforcing device limits and running background purge tasks |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | token | Yes | Unique identifier for a client session on the user's account |  |
| `user_id` | text | Yes | User account the device belongs to |  |
| `display_name` | text | No | Human-readable label for the device; maximum 100 characters | Validations: maxLength |
| `created_ts` | datetime | No | Timestamp when the device was first registered |  |
| `last_seen_ts` | datetime | No | Timestamp of the most recent activity from this device |  |
| `last_seen_ip` | text | No | IP address of the device's most recent connection |  |

## States

**State field:** `device_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `stale` |  |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `stale` | homeserver |  |
|  | `stale` | `deleted` | homeserver |  |
|  | `active` | `deleted` | account_owner |  |

## Rules

- **management:** Each device is uniquely identified by the combination of user_id and device_id, Device display names must not exceed 100 characters, Deleting a device revokes its access tokens, removes its registered pushers, and cancels queued messages, Message cleanup after deletion is performed asynchronously, Devices inactive beyond the configured retention period are purged by a daily background task, Device list changes are broadcast to all users who share encrypted rooms with the account owner, A device cannot be deleted by another user unless the requester is a server administrator

## Outcomes

### Device_registered (Priority: 1)

**Given:**
- user authenticates with a new or existing device_id
- display_name does not exceed 100 characters if provided

**Then:**
- **create_record** target: `device` — Device record created or updated with display name and timestamps
- **emit_event** event: `device.registered`

**Result:** Device is listed in the user's device inventory

### Device_display_name_updated (Priority: 2)

**Given:**
- requester is the account owner or server administrator
- new display name does not exceed 100 characters

**Then:**
- **set_field** target: `display_name` — Display name updated for the device
- **emit_event** event: `device.updated`

**Result:** Device shows the new label in device listings

### Device_deleted (Priority: 3)

**Given:**
- requester is the account owner or server administrator
- device exists on the account

**Then:**
- **delete_record** target: `device` — Device removed; associated tokens, pushers, and queued messages invalidated
- **emit_event** event: `device.deleted`

**Result:** Device can no longer be used; all associated sessions are terminated

### Stale_device_purged (Priority: 4)

**Given:**
- device has not been accessed within the retention period
- background purge task runs

**Then:**
- **delete_record** target: `device` — Stale device and all its associations removed
- **emit_event** event: `device.purged`

**Result:** Inactive device cleaned up automatically

### Display_name_too_long (Priority: 5) — Error: `DEVICE_DISPLAY_NAME_TOO_LONG`

**Given:**
- display name exceeds 100 characters

**Result:** Update rejected

### Devices_listed (Priority: 6)

**Given:**
- requester is authenticated as the account owner or server administrator

**Then:**
- **emit_event** event: `device.list_retrieved`

**Result:** Full list of devices with metadata returned

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEVICE_DISPLAY_NAME_TOO_LONG` | 400 | Device display name is too long (maximum 100 characters) | No |
| `DEVICE_NOT_FOUND` | 404 | Device not found on this account | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.registered` | A new device has been added to a user's account | `user_id`, `device_id` |
| `device.updated` | A device's display name was changed | `user_id`, `device_id` |
| `device.deleted` | A device was removed and its sessions invalidated | `user_id`, `device_id` |
| `device.purged` | A device was automatically removed by the stale-device cleanup task | `user_id`, `device_id` |
| `device.list_retrieved` | A user's device list was retrieved | `user_id`, `device_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cross-signing-verification | recommended | Cross-signing keys are associated with devices and updated on device changes |
| e2e-key-exchange | recommended | Device public keys are managed alongside device records |
| push-notification-gateway | recommended | Pushers are removed when their associated device is deleted |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 6
  entry_points:
    - synapse/handlers/device.py
    - synapse/storage/databases/main/devices.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Device Management Blueprint",
  "description": "Track all client sessions as named devices per user account. List, rename, and delete devices with cascading cleanup. Auto-purge devices inactive beyond retenti",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "devices, sessions, security, e2e, logout, access-control"
}
</script>
