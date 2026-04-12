---
title: "Link Preview Unfurling Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Automatically generate rich previews for URLs in messages by fetching metadata and oEmbed data, with caching to avoid redundant requests. 9 fields. 11 outcomes."
---

# Link Preview Unfurling Blueprint

> Automatically generate rich previews for URLs in messages by fetching metadata and oEmbed data, with caching to avoid redundant requests

| | |
|---|---|
| **Feature** | `link-preview-unfurling` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | urls, preview, oembed, metadata, unfurling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/link-preview-unfurling.blueprint.yaml) |
| **JSON API** | [link-preview-unfurling.json]({{ site.baseurl }}/api/blueprints/communication/link-preview-unfurling.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `message_author` | Message Author | human | User who sends a message containing one or more URLs |
| `preview_service` | URL Preview Service | system | Fetches URL content, extracts metadata and oEmbed data, caches results, and enriches message records |
| `external_site` | External Website | external | The remote server whose page metadata or oEmbed endpoint is fetched |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `url` | url | Yes | URL |  |
| `page_title` | text | No | Page Title |  |
| `description` | text | No | Description |  |
| `og_image` | url | No | Preview Image URL |  |
| `oembed_html` | rich_text | No | oEmbed HTML |  |
| `content_type` | text | No | Content Type |  |
| `content_length` | number | No | Content Length |  |
| `cached` | boolean | No | From Cache |  |

## Rules

- **general:** URL embedding must be enabled at the workspace level; if disabled, no URLs are unfurled, Only absolute URLs are processed; relative URLs are skipped, A single message may have at most a configurable maximum number of external URL previews (default five), URLs that appear alongside file attachments in the same message are skipped to avoid redundant content, Individual URLs within a message may be marked as ignoreParse to opt out of preview generation, Preview data is cached by URL so that repeated occurrences of the same URL do not trigger additional outbound requests, Fetched content is limited to a configured byte size to prevent excessive resource use, Hosts that appear on a configurable ignore list are never fetched; IP range checks are applied for private/internal addresses, Only ports on a configurable safe-port list are contacted; requests to non-safe ports are refused, SSRF protection is applied; private and loopback IP ranges are blocked unless explicitly allow-listed, Redirect chains are followed up to a configurable maximum depth, Relevant metadata tags are extracted: Open Graph (og:*), Twitter card (twitter:*), oEmbed, Facebook (fb:*), and description/title, oEmbed HTML is constrained to a maximum display width to prevent layout overflow, If the oEmbed endpoint returns data it is merged with page metadata; oEmbed takes precedence for media embeds, Known media platforms (video, audio, presentation services) have registered oEmbed endpoints that are contacted directly without page scraping, HTTP responses with a non-200 status code are treated as failed fetches and produce no preview, The User-Agent header sent to external servers is configurable to allow site-specific compatibility, Character encoding is detected from HTTP headers and HTML meta tags; content is decoded to UTF-8 before parsing

## Outcomes

### Embedding_disabled (Priority: 1)

**Given:**
- workspace URL embedding setting is disabled

**Result:** No preview generated; URLs are rendered as plain links

### Url_not_absolute (Priority: 2)

**Given:**
- url is not an absolute URL

**Result:** URL is skipped; only absolute URLs are unfurled

### Url_parse_ignored (Priority: 3)

**Given:**
- the URL entry has ignoreParse set to true

**Result:** URL is skipped per message-level opt-out flag

### Max_previews_exceeded (Priority: 4)

**Given:**
- number of external URLs in the message exceeds the maximum preview limit

**Result:** Additional URLs beyond the limit are rendered as plain links without previews

### Host_ignored (Priority: 5) — Error: `PREVIEW_HOST_IGNORED`

**Given:**
- url hostname matches the configured ignore list or resolves to a private/blocked IP range

**Result:** URL is not fetched; no preview is generated

### Unsafe_port (Priority: 6) — Error: `PREVIEW_UNSAFE_PORT`

**Given:**
- url port is not in the configured safe-ports list

**Result:** URL is not fetched; port is not permitted

### Fetch_failed (Priority: 7) — Error: `PREVIEW_FETCH_FAILED`

**Given:**
- outbound HTTP request to external_site fails or returns a non-200 status

**Result:** No preview generated for this URL; URL renders as a plain link

### Preview_from_cache (Priority: 8)

**Given:**
- embedding is enabled
- url is absolute and not ignored
- cached preview data exists for the url

**Then:**
- **set_field** target: `cached` value: `true`
- **emit_event** event: `url.preview_generated`

**Result:** Rich preview is displayed using cached metadata; no outbound request made

### Oembed_preview_generated (Priority: 9)

**Given:**
- embedding is enabled
- url is absolute, not ignored, and not cached
- a registered oEmbed provider matches the url pattern
- oEmbed endpoint returns valid data

**Then:**
- **set_field** target: `cached` value: `false`
- **create_record** — Cache entry storing the fetched oEmbed metadata for future reuse
- **emit_event** event: `url.preview_generated`

**Result:** Rich oEmbed embed (video player, audio player, slide deck) is displayed inline in the message

### Metadata_preview_generated (Priority: 10)

**Given:**
- embedding is enabled
- url is absolute, not ignored, and not cached
- no registered oEmbed provider matches the url
- page metadata (title, description, or og:image) is successfully extracted

**Then:**
- **set_field** target: `cached` value: `false`
- **create_record** — Cache entry storing extracted page metadata for future reuse
- **emit_event** event: `url.preview_generated`

**Result:** Link card preview is shown with title, description, and image where available

### No_metadata_found (Priority: 11)

**Given:**
- embedding is enabled
- url is absolute and not ignored
- fetch succeeds but no relevant metadata is found in the page

**Result:** URL renders as a plain link; no preview card is shown

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PREVIEW_HOST_IGNORED` | 400 | This URL cannot be previewed | No |
| `PREVIEW_UNSAFE_PORT` | 400 | This URL cannot be previewed due to an unsupported port | No |
| `PREVIEW_FETCH_FAILED` | 400 | The link preview could not be loaded | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `url.preview_generated` | Fired when a URL preview is successfully generated or served from cache for a message | `message_id`, `url`, `cached` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| direct-messaging | recommended | Link previews appear in direct message and channel conversations |
| file-upload-sharing | optional | Messages with file attachments suppress URL unfurling to avoid duplicate content |
| message-pinning | optional | Pinned messages containing URLs retain their generated previews |

## AGI Readiness

### Goals

#### Generate Safe Link Previews

Automatically enrich messages with rich URL previews while enforcing SSRF protection, port safety, and cache efficiency

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| ssrf_block_rate | 100% | Requests to private or blocked IP ranges that were blocked / total such requests |
| cache_hit_rate | > 40% | Preview requests served from cache / total preview requests |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying the SSRF allow-list for private IP ranges
- before disabling URL embedding workspace-wide

### Verification

**Invariants:**

- private and loopback IP ranges are never contacted unless explicitly allow-listed
- only ports on the safe-port list are contacted
- redirect chains do not exceed the configured maximum depth
- fetched content is size-limited before parsing

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| private IP blocked | URL resolves to a private IP range | preview is requested | PREVIEW_HOST_IGNORED returned with no outbound request made |
| cache serves existing preview | URL has a cached preview entry | same URL appears in a new message | preview returned from cache without outbound HTTP request |

### Composability

**Capabilities:**

- `ssrf_protected_url_fetch`: Fetch URL metadata with SSRF protection, port filtering, and redirect chain limits
- `oembed_and_metadata_extraction`: Extract oEmbed and Open Graph metadata and cache results for reuse

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | preview_coverage | SSRF protection and port filtering may block some legitimate URLs but prevent server-side request forgery |

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
  "name": "Link Preview Unfurling Blueprint",
  "description": "Automatically generate rich previews for URLs in messages by fetching metadata and oEmbed data, with caching to avoid redundant requests. 9 fields. 11 outcomes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "urls, preview, oembed, metadata, unfurling"
}
</script>
