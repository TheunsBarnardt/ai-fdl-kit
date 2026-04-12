---
title: "Media Repository Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Upload, store, retrieve, and auto-thumbnail media files. Cache remote media locally, enforce size limits, support multiple storage backends, and run retention c"
---

# Media Repository Blueprint

> Upload, store, retrieve, and auto-thumbnail media files. Cache remote media locally, enforce size limits, support multiple storage backends, and run retention cleanup tasks.

| | |
|---|---|
| **Feature** | `media-repository` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | media, upload, download, thumbnails, storage, files, images, caching |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/media-repository.blueprint.yaml) |
| **JSON API** | [media-repository.json]({{ site.baseurl }}/api/blueprints/data/media-repository.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `uploader` | Uploader | human | User uploading a file to the media repository |
| `downloader` | Downloader | human | User or client retrieving a media file or thumbnail |
| `homeserver` | Homeserver | system | Server processing media requests and running background tasks |
| `remote_server` | Remote Server | external | Origin server for federated media that is cached locally |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `media_id` | token | Yes | Unique identifier for the media file on this server |  |
| `server_name` | text | Yes | Homeserver that originally stored the media |  |
| `upload_name` | text | No | Original filename provided by the uploader |  |
| `media_type` | text | Yes | MIME type of the uploaded or retrieved file |  |
| `media_length` | number | Yes | File size in bytes | Validations: max |
| `sha256_hash` | text | No | SHA-256 digest for deduplication and integrity verification |  |
| `created_ts` | datetime | No | Timestamp when the media was first stored |  |
| `last_access_ts` | datetime | No | Most recent time the media was downloaded or viewed |  |
| `quarantined` | boolean | No | Flag indicating media has been blocked due to a policy violation |  |

## States

**State field:** `media_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `stored` |  |  |
| `quarantined` |  |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `stored` | uploader |  |
|  | `stored` | `quarantined` | homeserver |  |
|  | `stored` | `deleted` | homeserver |  |

## Rules

- **uploads:** Uploaded files must not exceed the configured maximum upload size, Image files must not exceed the configured maximum pixel dimension to prevent decompression attacks, Files are deduplicated by SHA-256 hash; identical content reuses the existing storage record
- **remote_media:** Remote media is cached locally on first access to reduce repeated federation requests, Remote media downloads are rate-limited to prevent abuse, Only one download of the same remote media may be in progress at a time, Media servers in the configured block list are rejected without network contact
- **retention:** Last access timestamps are batched in memory and written to storage periodically, Thumbnails are generated on demand and cached; cached thumbnails reused on subsequent requests, Background retention tasks purge media not accessed within the configured expiration period, Administrators may quarantine media to block access without immediate deletion

## Outcomes

### Media_uploaded (Priority: 1)

**Given:**
- file size does not exceed the maximum upload limit
- for images: pixel count does not exceed the maximum

**Then:**
- **create_record** target: `media_store` — Media record stored with SHA-256 hash, type, size, and timestamp
- **emit_event** event: `media.uploaded`

**Result:** Media is accessible via its URI; can be shared in room messages

### Media_deduplicated (Priority: 2)

**Given:**
- uploaded file SHA-256 matches an existing stored file

**Then:**
- **emit_event** event: `media.deduplicated`

**Result:** Existing media record reused; no duplicate storage consumed

### Media_retrieved_locally (Priority: 3)

**Given:**
- media_id belongs to this server
- media exists and is not quarantined

**Then:**
- **set_field** target: `last_access_ts` — Access timestamp updated in memory for batched persistence
- **emit_event** event: `media.retrieved`

**Result:** File content returned to requester

### Remote_media_cached (Priority: 4)

**Given:**
- media_id belongs to a remote server
- media is not in local cache
- remote server is not on the block list
- download rate limit is not exceeded

**Then:**
- **create_record** target: `media_cache` — Remote media downloaded, validated, and stored in local cache
- **emit_event** event: `media.remote_cached`

**Result:** Remote media served from local cache; subsequent requests do not contact the origin

### Thumbnail_generated (Priority: 5)

**Given:**
- thumbnail not already cached for the requested dimensions and mode
- source media is a supported image format

**Then:**
- **create_record** target: `thumbnail_cache` — Thumbnail image generated and stored in cache
- **emit_event** event: `media.thumbnail_generated`

**Result:** Thumbnail returned to requester; cached for future requests

### Media_upload_rejected_size (Priority: 6) — Error: `MEDIA_TOO_LARGE`

**Given:**
- file size exceeds the configured maximum

**Result:** Upload rejected before storage

### Media_upload_rejected_pixels (Priority: 7) — Error: `MEDIA_TOO_MANY_PIXELS`

**Given:**
- image pixel count exceeds the configured maximum

**Result:** Upload rejected to prevent decompression attack

### Media_quarantined (Priority: 8) — Error: `MEDIA_QUARANTINED`

**Given:**
- media is in quarantined state

**Result:** Access denied

### Remote_server_blocked (Priority: 9) — Error: `MEDIA_SERVER_BLOCKED`

**Given:**
- origin server is on the media download block list

**Result:** Remote media request rejected without contacting the origin

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MEDIA_TOO_LARGE` | 413 | File exceeds the maximum allowed upload size | No |
| `MEDIA_TOO_MANY_PIXELS` | 400 | Image dimensions exceed the maximum allowed size | No |
| `MEDIA_NOT_FOUND` | 404 | Media not found | No |
| `MEDIA_QUARANTINED` | 404 | This media has been removed | No |
| `MEDIA_SERVER_BLOCKED` | 403 | Media from this server is not permitted | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `media.uploaded` | A file was successfully uploaded and stored | `media_id`, `server_name`, `uploader_id`, `media_type`, `media_length` |
| `media.deduplicated` | An upload matched an existing file; no new storage was used | `media_id`, `existing_media_id` |
| `media.retrieved` | A stored media file was served to a requester | `media_id`, `downloader_id` |
| `media.remote_cached` | Remote media was downloaded and cached locally | `media_id`, `origin_server` |
| `media.thumbnail_generated` | A thumbnail was generated and cached for a media file | `media_id`, `width`, `height`, `mode` |
| `media.purged` | Media was removed by the retention policy or an administrator | `media_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| server-federation | recommended | Remote media is fetched from origin servers via federation |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 12
  entry_points:
    - synapse/media/media_storage.py
    - synapse/media/thumbnailer.py
    - synapse/media/_base.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Media Repository Blueprint",
  "description": "Upload, store, retrieve, and auto-thumbnail media files. Cache remote media locally, enforce size limits, support multiple storage backends, and run retention c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "media, upload, download, thumbnails, storage, files, images, caching"
}
</script>
