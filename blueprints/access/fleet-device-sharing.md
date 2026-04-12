<!-- AUTO-GENERATED FROM fleet-device-sharing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fleet Device Sharing

> Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable bulk sharing, user restrictions to l...

**Category:** Access · **Version:** 1.0.0 · **Tags:** gps · tracking · permissions · groups · sharing · fleet · access-control

## What this does

Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable bulk sharing, user restrictions to l...

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **email** *(email, required)* — User's email address; used for authentication and notifications
- **name** *(text, required)* — Full display name of the user
- **administrator** *(boolean, optional)* — Grants unrestricted access to all platform resources
- **readonly** *(boolean, optional)* — Prevents all write operations; user can only view data
- **device_readonly** *(boolean, optional)* — Prevents modifications to device records while allowing full tracking access
- **limit_commands** *(boolean, optional)* — Prevents the user from sending any commands to devices
- **disable_reports** *(boolean, optional)* — Prevents the user from generating or downloading any reports
- **device_limit** *(number, optional)* — Maximum number of devices this user account may have directly shared; -1 means unlimited
- **user_limit** *(number, optional)* — Maximum number of subordinate users this user may create; 0 means user cannot create others
- **expiration_time** *(datetime, optional)* — Date after which the user account is automatically disabled
- **group_name** *(text, optional)* — Name of the device group
- **parent_group_id** *(hidden, optional)* — Parent group reference enabling nested group hierarchies

## What must be true

- **rule_1:** Administrator users have implicit access to all resources; no explicit permission records are required
- **rule_2:** Regular users only see and interact with devices, geofences, drivers, and other resources that have been explicitly shared with them
- **rule_3:** Sharing a group with a user grants access to all devices currently in that group and any devices added to the group in the future
- **rule_4:** Group attributes are inherited by child groups and their devices; device-level attributes override inherited group values
- **rule_5:** A manager (user_limit > 0) can create subordinate users but cannot grant more permissions than they themselves have
- **rule_6:** The device_limit constrains how many devices can be shared with a given user account; administrators are exempt
- **rule_7:** Readonly users can view all accessible data but cannot modify any records, create events, or send commands
- **rule_8:** device_readonly users can track and monitor devices but cannot edit device configuration
- **rule_9:** limit_commands users can see device positions but cannot use the command interface
- **rule_10:** disable_reports users can track live positions but cannot generate historical reports or exports
- **rule_11:** An expired user account is treated as disabled; active sessions are invalidated

## Success & failure scenarios

**✅ Success paths**

- **Permission Revoked** — when admin removes an explicit sharing permission, then User loses access to the resource; ongoing sessions lose visibility immediately.
- **Device Shared With User** — when admin or manager shares a device with a user; user has not reached their device_limit; sharing user has access to the device themselves, then User can now see the device in their fleet view and receive its events and alerts.
- **Group Shared With User** — when admin or manager shares a device group with a user; sharing user has access to the group, then User gains access to all current and future devices in the group.

**❌ Failure paths**

- **Device Limit Exceeded** — when user has reached their device_limit; administrator eq false, then Sharing rejected; operator must increase the user's device_limit or remove an existing device. *(error: `SHARING_DEVICE_LIMIT_EXCEEDED`)*

## Errors it can return

- `SHARING_DEVICE_LIMIT_EXCEEDED` — This user has reached the maximum number of devices they may access
- `SHARING_PERMISSION_DENIED` — You cannot share resources you do not have access to
- `SHARING_USER_NOT_FOUND` — The specified user does not exist

## Connects to

- **gps-device-registration** *(required)* — Devices must be registered before they can be shared
- **remote-device-commands** *(recommended)* — Command access is gated by the limit_commands user restriction
- **fleet-scheduled-reports** *(recommended)* — Report access is gated by the disable_reports user restriction

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/fleet-device-sharing/) · **Spec source:** [`fleet-device-sharing.blueprint.yaml`](./fleet-device-sharing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
