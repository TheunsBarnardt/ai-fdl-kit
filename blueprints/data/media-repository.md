<!-- AUTO-GENERATED FROM media-repository.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Media Repository

> Upload, store, retrieve, and auto-thumbnail media files. Cache remote media locally, enforce size limits, support multiple storage backends, and run retention cleanup tasks.

**Category:** Data · **Version:** 1.0.0 · **Tags:** media · upload · download · thumbnails · storage · files · images · caching

## What this does

Upload, store, retrieve, and auto-thumbnail media files. Cache remote media locally, enforce size limits, support multiple storage backends, and run retention cleanup tasks.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **media_id** *(token, required)* — Unique identifier for the media file on this server
- **server_name** *(text, required)* — Homeserver that originally stored the media
- **upload_name** *(text, optional)* — Original filename provided by the uploader
- **media_type** *(text, required)* — MIME type of the uploaded or retrieved file
- **media_length** *(number, required)* — File size in bytes
- **sha256_hash** *(text, optional)* — SHA-256 digest for deduplication and integrity verification
- **created_ts** *(datetime, optional)* — Timestamp when the media was first stored
- **last_access_ts** *(datetime, optional)* — Most recent time the media was downloaded or viewed
- **quarantined** *(boolean, optional)* — Flag indicating media has been blocked due to a policy violation

## What must be true

- **uploads:** Uploaded files must not exceed the configured maximum upload size, Image files must not exceed the configured maximum pixel dimension to prevent decompression attacks, Files are deduplicated by SHA-256 hash; identical content reuses the existing storage record
- **remote_media:** Remote media is cached locally on first access to reduce repeated federation requests, Remote media downloads are rate-limited to prevent abuse, Only one download of the same remote media may be in progress at a time, Media servers in the configured block list are rejected without network contact
- **retention:** Last access timestamps are batched in memory and written to storage periodically, Thumbnails are generated on demand and cached; cached thumbnails reused on subsequent requests, Background retention tasks purge media not accessed within the configured expiration period, Administrators may quarantine media to block access without immediate deletion

## Success & failure scenarios

**✅ Success paths**

- **Media Uploaded** — when file size does not exceed the maximum upload limit; for images: pixel count does not exceed the maximum, then Media is accessible via its URI; can be shared in room messages.
- **Media Deduplicated** — when uploaded file SHA-256 matches an existing stored file, then Existing media record reused; no duplicate storage consumed.
- **Media Retrieved Locally** — when media_id belongs to this server; media exists and is not quarantined, then File content returned to requester.
- **Remote Media Cached** — when media_id belongs to a remote server; media is not in local cache; remote server is not on the block list; download rate limit is not exceeded, then Remote media served from local cache; subsequent requests do not contact the origin.
- **Thumbnail Generated** — when thumbnail not already cached for the requested dimensions and mode; source media is a supported image format, then Thumbnail returned to requester; cached for future requests.

**❌ Failure paths**

- **Media Upload Rejected Size** — when file size exceeds the configured maximum, then Upload rejected before storage. *(error: `MEDIA_TOO_LARGE`)*
- **Media Upload Rejected Pixels** — when image pixel count exceeds the configured maximum, then Upload rejected to prevent decompression attack. *(error: `MEDIA_TOO_MANY_PIXELS`)*
- **Media Quarantined** — when media is in quarantined state, then Access denied. *(error: `MEDIA_QUARANTINED`)*
- **Remote Server Blocked** — when origin server is on the media download block list, then Remote media request rejected without contacting the origin. *(error: `MEDIA_SERVER_BLOCKED`)*

## Errors it can return

- `MEDIA_TOO_LARGE` — File exceeds the maximum allowed upload size
- `MEDIA_TOO_MANY_PIXELS` — Image dimensions exceed the maximum allowed size
- `MEDIA_NOT_FOUND` — Media not found
- `MEDIA_QUARANTINED` — This media has been removed
- `MEDIA_SERVER_BLOCKED` — Media from this server is not permitted

## Events

**`media.uploaded`** — A file was successfully uploaded and stored
  Payload: `media_id`, `server_name`, `uploader_id`, `media_type`, `media_length`

**`media.deduplicated`** — An upload matched an existing file; no new storage was used
  Payload: `media_id`, `existing_media_id`

**`media.retrieved`** — A stored media file was served to a requester
  Payload: `media_id`, `downloader_id`

**`media.remote_cached`** — Remote media was downloaded and cached locally
  Payload: `media_id`, `origin_server`

**`media.thumbnail_generated`** — A thumbnail was generated and cached for a media file
  Payload: `media_id`, `width`, `height`, `mode`

**`media.purged`** — Media was removed by the retention policy or an administrator
  Payload: `media_id`, `reason`

## Connects to

- **server-federation** *(recommended)* — Remote media is fetched from origin servers via federation

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/media-repository/) · **Spec source:** [`media-repository.blueprint.yaml`](./media-repository.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
