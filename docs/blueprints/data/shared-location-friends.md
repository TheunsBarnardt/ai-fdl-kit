---
title: "Shared Location Friends Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Allow devices to receive the last-known positions and profile cards of a curated friend list when polling for location updates, enabling shared-location without"
---

# Shared Location Friends Blueprint

> Allow devices to receive the last-known positions and profile cards of a curated friend list when polling for location updates, enabling shared-location without direct device-to-device communication.

| | |
|---|---|
| **Feature** | `shared-location-friends` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | friends, shared-location, presence, location-sharing, social, iot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/shared-location-friends.blueprint.yaml) |
| **JSON API** | [shared-location-friends.json]({{ site.baseurl }}/api/blueprints/data/shared-location-friends.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `mobile_device` | Mobile Device | external | Device that polls the server for acknowledgement and receives friends' positions in the response |
| `recorder_service` | Recorder Service | system | Looks up the device's friend list, fetches each friend's last position and card, and assembles the response |
| `administrator` | Administrator | human | Configures friend relationships server-side; devices cannot modify their own friend lists |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `requesting_user` | text | Yes | Requesting Username |  |
| `requesting_device` | text | Yes | Requesting Device |  |
| `friend_list` | json | No | Friend List |  |
| `friend_user` | text | No | Friend Username |  |
| `friend_device` | text | No | Friend Device Name |  |
| `tracker_id` | text | Yes | Tracker ID |  |
| `friend_lat` | number | No | Friend Latitude |  |
| `friend_lon` | number | No | Friend Longitude |  |
| `friend_tst` | number | No | Friend Last Seen |  |
| `friend_name` | text | No | Friend Display Name |  |
| `friend_avatar` | text | No | Friend Avatar |  |
| `friend_velocity` | number | No | Friend Velocity (km/h) |  |
| `friend_altitude` | number | No | Friend Altitude (metres) |  |

## Rules

- **friend_management:**
  - **server_side_only:** Friend relationships are configured exclusively server-side; devices cannot add or remove their own friends
  - **storage_format:** The friend list for each user/device is stored as an array of user/device pair strings in a key-value store keyed by the requesting identity
- **response_assembly:**
  - **tid_mandatory:** A tracker ID is mandatory for every friend entry; friends without one are silently skipped because client apps require it to construct a virtual topic
  - **no_position_skip:** If a friend has no recorded last position, that friend is silently omitted from the response without error
  - **two_objects_per_friend:** For each valid friend the response includes two separate objects — a card object (name, avatar, tracker ID) and a location object (coordinates, timestamp, velocity, altitude, accuracy)
  - **card_conditional:** The card object is included only when the friend's card contains both a name and an avatar; otherwise only the location object is returned
  - **virtual_topic:** A virtual topic following the standard device-topic convention is injected into each location object so that client apps can group and display friend locations
- **no_friends:**
  - **empty_array:** When the requesting device has no configured friend list, an empty array is returned without error
- **data_currency:**
  - **snapshot_time:** Friend data is read at poll time from last-position snapshots; it reflects each friend's position at the moment of the request, not a real-time stream

## Outcomes

### Friends_store_unavailable (Priority: 1) — Error: `FRIENDS_STORE_UNAVAILABLE`

**Given:**
- the friend list key-value store cannot be accessed

**Result:** Empty array returned to avoid breaking the polling client; error logged internally

### Friends_returned (Priority: 10)

**Given:**
- requesting_user and requesting_device are valid
- friend_list contains at least one valid user/device pair

**Then:**
- **emit_event** event: `friends.polled`

**Result:** Response array contains card and location objects for each friend with a tracker ID and a last-known position

### No_friends_configured (Priority: 20)

**Given:**
- requesting_user and requesting_device are valid
- `friend_list` (db) not_exists

**Then:**
- **emit_event** event: `friends.polled`

**Result:** Empty array returned; no error raised; client treats this as valid with zero friends

### Friend_skipped_no_position (Priority: 30)

**Given:**
- friend entry is present in friend_list
- friend has no last-position record in storage

**Result:** Friend silently omitted; other friends in the list are still processed

### Friend_skipped_no_tid (Priority: 35)

**Given:**
- friend entry is present in friend_list
- friend last-position record does not contain a tracker_id

**Result:** Friend silently omitted; tracker ID is required for virtual topic construction

### Friend_with_card_returned (Priority: 40)

**Given:**
- friend has a valid last-position record with a tracker_id
- friend card contains both a name and an avatar

**Then:**
- **emit_event** event: `friend.location.returned`

**Result:** Response includes both a card object and a location object for this friend

### Friend_location_only_returned (Priority: 50)

**Given:**
- friend has a valid last-position record with a tracker_id
- friend card is absent or incomplete

**Then:**
- **emit_event** event: `friend.location.returned`

**Result:** Response includes only a location object for this friend; no card object

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FRIENDS_STORE_UNAVAILABLE` | 503 | Friend list is temporarily unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `friends.polled` | A device requested friend locations; response was assembled and returned | `requesting_user`, `requesting_device`, `friend_count` |
| `friend.location.returned` | A single friend's last position and optionally card were included in a poll response | `friend_user`, `friend_device`, `tracker_id`, `has_card` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| location-history-storage | required | Provides the last-position snapshots read to populate each friend's location in the response |
| mqtt-location-ingestion | recommended | Keeps last-position snapshots current as devices publish new locations |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/owntracks/recorder
  project: OwnTracks Recorder
  tech_stack: C, LMDB (httpfriends named database), Mongoose HTTP
  files_traced: 4
  entry_points:
    - http.c (populate_friends)
    - storage.c (last_users, append_card_to_object)
    - udata.h (httpfriends gcache field)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Shared Location Friends Blueprint",
  "description": "Allow devices to receive the last-known positions and profile cards of a curated friend list when polling for location updates, enabling shared-location without",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "friends, shared-location, presence, location-sharing, social, iot"
}
</script>
