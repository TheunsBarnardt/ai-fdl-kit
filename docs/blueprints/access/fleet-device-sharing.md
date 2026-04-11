---
title: "Fleet Device Sharing Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable"
---

# Fleet Device Sharing Blueprint

> Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable bulk sharing, user restrictions to limit dangerous operations, and manager-level user provisioning.

| | |
|---|---|
| **Feature** | `fleet-device-sharing` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, permissions, groups, sharing, fleet, access-control |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/fleet-device-sharing.blueprint.yaml) |
| **JSON API** | [fleet-device-sharing.json]({{ site.baseurl }}/api/blueprints/access/fleet-device-sharing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `admin` | Administrator | human | Has unrestricted access to all resources; can create users and assign devices |
| `manager` | Manager | human | Can create subordinate users up to their user_limit and share devices with them |
| `fleet_user` | Fleet User | human | Has access only to explicitly shared devices and groups |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes |  |  |
| `name` | text | Yes |  |  |
| `administrator` | boolean | No |  |  |
| `readonly` | boolean | No |  |  |
| `device_readonly` | boolean | No |  |  |
| `limit_commands` | boolean | No |  |  |
| `disable_reports` | boolean | No |  |  |
| `device_limit` | number | No |  |  |
| `user_limit` | number | No |  |  |
| `expiration_time` | datetime | No |  |  |
| `group_name` | text | No |  |  |
| `parent_group_id` | hidden | No |  |  |

## Rules

- Administrator users have implicit access to all resources; no explicit permission records are required
- Regular users only see and interact with devices, geofences, drivers, and other resources that have been explicitly shared with them
- Sharing a group with a user grants access to all devices currently in that group and any devices added to the group in the future
- Group attributes are inherited by child groups and their devices; device-level attributes override inherited group values
- A manager (user_limit > 0) can create subordinate users but cannot grant more permissions than they themselves have
- The device_limit constrains how many devices can be shared with a given user account; administrators are exempt
- Readonly users can view all accessible data but cannot modify any records, create events, or send commands
- device_readonly users can track and monitor devices but cannot edit device configuration
- limit_commands users can see device positions but cannot use the command interface
- disable_reports users can track live positions but cannot generate historical reports or exports
- An expired user account is treated as disabled; active sessions are invalidated

## Outcomes

### Device_limit_exceeded (Priority: 2) — Error: `SHARING_DEVICE_LIMIT_EXCEEDED`

**Given:**
- user has reached their device_limit
- `administrator` (db) eq `false`

**Result:** Sharing rejected; operator must increase the user's device_limit or remove an existing device

### Permission_revoked (Priority: 8)

**Given:**
- admin removes an explicit sharing permission

**Then:**
- **delete_record** target: `permission`
- **emit_event** event: `permission.revoked`

**Result:** User loses access to the resource; ongoing sessions lose visibility immediately

### Device_shared_with_user (Priority: 10)

**Given:**
- admin or manager shares a device with a user
- user has not reached their device_limit
- sharing user has access to the device themselves

**Then:**
- **create_record** target: `permission` — Permission record linking user to device created
- **emit_event** event: `device.shared`

**Result:** User can now see the device in their fleet view and receive its events and alerts

### Group_shared_with_user (Priority: 10)

**Given:**
- admin or manager shares a device group with a user
- sharing user has access to the group

**Then:**
- **create_record** target: `permission` — Permission record linking user to group created
- **emit_event** event: `group.shared`

**Result:** User gains access to all current and future devices in the group

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SHARING_DEVICE_LIMIT_EXCEEDED` |  | This user has reached the maximum number of devices they may access | No |
| `SHARING_PERMISSION_DENIED` |  | You cannot share resources you do not have access to | No |
| `SHARING_USER_NOT_FOUND` |  | The specified user does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.shared` | A device has been shared with a user | `device_id`, `user_id`, `shared_by` |
| `group.shared` | A device group has been shared with a user | `group_id`, `user_id`, `shared_by` |
| `permission.revoked` | A user's access to a resource has been removed | `resource_type`, `resource_id`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-device-registration |  |  |
| remote-device-commands |  |  |
| fleet-scheduled-reports |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Hibernate
  files_traced: 10
  entry_points:
    - src/main/java/org/traccar/model/User.java
    - src/main/java/org/traccar/model/Group.java
    - src/main/java/org/traccar/model/Permission.java
    - src/main/java/org/traccar/api/security/PermissionsService.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Device Sharing Blueprint",
  "description": "Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, permissions, groups, sharing, fleet, access-control"
}
</script>
