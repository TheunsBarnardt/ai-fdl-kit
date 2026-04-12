<!-- AUTO-GENERATED FROM shared-location-friends.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Shared Location Friends

> Allow devices to receive the last-known positions and profile cards of a curated friend list when polling for location updates, enabling shared-location without direct device-to-device communication.

**Category:** Data · **Version:** 1.0.0 · **Tags:** friends · shared-location · presence · location-sharing · social · iot

## What this does

Allow devices to receive the last-known positions and profile cards of a curated friend list when polling for location updates, enabling shared-location without direct device-to-device communication.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **requesting_user** *(text, required)* — Requesting Username
- **requesting_device** *(text, required)* — Requesting Device
- **friend_list** *(json, optional)* — Friend List
- **friend_user** *(text, optional)* — Friend Username
- **friend_device** *(text, optional)* — Friend Device Name
- **tracker_id** *(text, required)* — Tracker ID
- **friend_lat** *(number, optional)* — Friend Latitude
- **friend_lon** *(number, optional)* — Friend Longitude
- **friend_tst** *(number, optional)* — Friend Last Seen
- **friend_name** *(text, optional)* — Friend Display Name
- **friend_avatar** *(text, optional)* — Friend Avatar
- **friend_velocity** *(number, optional)* — Friend Velocity (km/h)
- **friend_altitude** *(number, optional)* — Friend Altitude (metres)

## What must be true

- **friend_management → server_side_only:** Friend relationships are configured exclusively server-side; devices cannot add or remove their own friends
- **friend_management → storage_format:** The friend list for each user/device is stored as an array of user/device pair strings in a key-value store keyed by the requesting identity
- **response_assembly → tid_mandatory:** A tracker ID is mandatory for every friend entry; friends without one are silently skipped because client apps require it to construct a virtual topic
- **response_assembly → no_position_skip:** If a friend has no recorded last position, that friend is silently omitted from the response without error
- **response_assembly → two_objects_per_friend:** For each valid friend the response includes two separate objects — a card object (name, avatar, tracker ID) and a location object (coordinates, timestamp, velocity, altitude, accuracy)
- **response_assembly → card_conditional:** The card object is included only when the friend's card contains both a name and an avatar; otherwise only the location object is returned
- **response_assembly → virtual_topic:** A virtual topic following the standard device-topic convention is injected into each location object so that client apps can group and display friend locations
- **no_friends → empty_array:** When the requesting device has no configured friend list, an empty array is returned without error
- **data_currency → snapshot_time:** Friend data is read at poll time from last-position snapshots; it reflects each friend's position at the moment of the request, not a real-time stream

## Success & failure scenarios

**✅ Success paths**

- **Friends Returned** — when requesting_user and requesting_device are valid; friend_list contains at least one valid user/device pair, then Response array contains card and location objects for each friend with a tracker ID and a last-known position.
- **No Friends Configured** — when requesting_user and requesting_device are valid; friend_list not_exists, then Empty array returned; no error raised; client treats this as valid with zero friends.
- **Friend Skipped No Position** — when friend entry is present in friend_list; friend has no last-position record in storage, then Friend silently omitted; other friends in the list are still processed.
- **Friend Skipped No Tid** — when friend entry is present in friend_list; friend last-position record does not contain a tracker_id, then Friend silently omitted; tracker ID is required for virtual topic construction.
- **Friend With Card Returned** — when friend has a valid last-position record with a tracker_id; friend card contains both a name and an avatar, then Response includes both a card object and a location object for this friend.
- **Friend Location Only Returned** — when friend has a valid last-position record with a tracker_id; friend card is absent or incomplete, then Response includes only a location object for this friend; no card object.

**❌ Failure paths**

- **Friends Store Unavailable** — when the friend list key-value store cannot be accessed, then Empty array returned to avoid breaking the polling client; error logged internally. *(error: `FRIENDS_STORE_UNAVAILABLE`)*

## Errors it can return

- `FRIENDS_STORE_UNAVAILABLE` — Friend list is temporarily unavailable

## Connects to

- **location-history-storage** *(required)* — Provides the last-position snapshots read to populate each friend's location in the response
- **mqtt-location-ingestion** *(recommended)* — Keeps last-position snapshots current as devices publish new locations

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/shared-location-friends/) · **Spec source:** [`shared-location-friends.blueprint.yaml`](./shared-location-friends.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
