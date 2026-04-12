---
title: "Channel Directory Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Browse and discover public channels and rooms available on the platform. 12 fields. 6 outcomes. 2 error codes. rules: general. AGI: supervised"
---

# Channel Directory Blueprint

> Browse and discover public channels and rooms available on the platform

| | |
|---|---|
| **Feature** | `channel-directory` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | channels, rooms, discovery, directory, search, public |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/channel-directory.blueprint.yaml) |
| **JSON API** | [channel-directory.json]({{ site.baseurl }}/api/blueprints/communication/channel-directory.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Authenticated user browsing or searching the channel directory |
| `administrator` | Administrator | human | Manages which channels are visible in the directory and configures visibility settings |
| `platform` | Platform | system | Returns paginated channel listings and enforces visibility permissions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `filter` | text | No | Search Filter |  |
| `room_type` | select | No | Room Type |  |
| `include_all_public_channels` | boolean | No | Include All Public Channels |  |
| `sort` | json | No | Sort Order |  |
| `offset` | number | No | Page Offset |  |
| `count` | number | No | Page Size |  |
| `channel_id` | text | No | Channel ID |  |
| `channel_name` | text | No | Channel Name |  |
| `description` | text | No | Channel Description |  |
| `member_count` | number | No | Member Count |  |
| `read_only` | boolean | No | Read Only |  |
| `federated` | boolean | No | Federated |  |

## Rules

- **general:** Only rooms marked as public (open) are listed in the channel directory; private groups are excluded, Users with the view-c-room permission can see all public channels; users without it see only channels they are eligible to join, Directory listings are paginated; callers must supply offset and count to retrieve subsequent pages, The filter parameter performs a case-insensitive partial match against channel names and descriptions, Channels can be sorted by name, member count, or creation date; default sort is by name ascending, Federated channels from remote servers may appear in the directory if cross-server federation is enabled, The directory does not expose private or direct message rooms, A user who is already a member of a channel can still view it in the directory, The total count of matching channels is returned alongside each paginated response for UI rendering

## Outcomes

### Permission_denied (Priority: 2) — Error: `CHANNEL_DIRECTORY_PERMISSION_DENIED`

**Given:**
- user requests channel listing
- user is not authenticated or has been explicitly blocked from viewing channels

**Result:** Request is rejected and an authorization error is returned

### Channel_not_found (Priority: 3) — Error: `CHANNEL_DIRECTORY_NOT_FOUND`

**Given:**
- user requests details for a specific channel id or name that does not exist or is not public

**Result:** A not-found error is returned

### No_results (Priority: 5)

**Given:**
- user applies a filter that matches no channels

**Then:**
- **emit_event** event: `channel_directory.searched`

**Result:** An empty list is returned with a total count of zero

### Channel_detail_retrieved (Priority: 8)

**Given:**
- user requests details for a specific channel by id or name
- channel is public or user has view-c-room permission

**Then:**
- **emit_event** event: `channel_directory.detail_viewed`

**Result:** Full channel detail including description, member count, and type is returned

### Channel_searched (Priority: 9)

**Given:**
- user supplies a filter value
- user is authenticated

**Then:**
- **emit_event** event: `channel_directory.searched`

**Result:** Directory returns only channels whose names or descriptions match the filter string

### Directory_listed (Priority: 10)

**Given:**
- user requests the channel directory
- user is authenticated

**Then:**
- **emit_event** event: `channel_directory.listed`

**Result:** A paginated list of public channels matching the filter and sort criteria is returned

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHANNEL_DIRECTORY_PERMISSION_DENIED` | 403 | You do not have permission to browse the channel directory. | No |
| `CHANNEL_DIRECTORY_NOT_FOUND` | 404 | The requested channel was not found or is not publicly accessible. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `channel_directory.listed` | Fires when a user retrieves the paginated channel directory | `filter`, `room_type`, `offset`, `count` |
| `channel_directory.searched` | Fires when a user applies a text filter to the channel directory | `filter`, `offset`, `count` |
| `channel_directory.detail_viewed` | Fires when a user views the detail of a specific channel from the directory | `channel_id`, `channel_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| channel-management | required | Channels listed in the directory are created and managed by channel management |
| role-based-access-control | required | View permissions determine which channels are visible to which users |
| room-search | recommended | Platform-wide search may surface channel directory results |
| user-profile | optional | Joining a channel from the directory updates the user's channel membership |

## AGI Readiness

### Goals

#### Discover Public Channels

Return paginated, permission-filtered listings of public channels to help users discover and join relevant rooms

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| private_channel_exposure_rate | 0% | Private channels returned in directory results / total directory results |
| directory_response_time | < 300ms p95 | Time to return first page of directory results |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before changing directory visibility settings that affect all users

### Verification

**Invariants:**

- only public channels appear in the directory
- direct message rooms are never listed
- pagination offset and count are required for all listing requests

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| private channels excluded | workspace has both public and private channels | directory is listed | only public channels are returned |
| unauthenticated access denied | request is made without authentication | directory listing is requested | CHANNEL_DIRECTORY_PERMISSION_DENIED returned |

### Composability

**Capabilities:**

- `paginated_channel_listing`: Return filtered, sorted, paginated public channel listings with total count

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | discoverability | private channels must never appear in the directory even if it limits the number of joinable channels shown |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 4
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Channel Directory Blueprint",
  "description": "Browse and discover public channels and rooms available on the platform. 12 fields. 6 outcomes. 2 error codes. rules: general. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "channels, rooms, discovery, directory, search, public"
}
</script>
