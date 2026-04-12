<!-- AUTO-GENERATED FROM link-preview-unfurling.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Link Preview Unfurling

> Automatically generate rich previews for URLs in messages by fetching metadata and oEmbed data, with caching to avoid redundant requests

**Category:** Communication · **Version:** 1.0.0 · **Tags:** urls · preview · oembed · metadata · unfurling

## What this does

Automatically generate rich previews for URLs in messages by fetching metadata and oEmbed data, with caching to avoid redundant requests

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **message_id** *(text, required)* — Message ID
- **url** *(url, required)* — URL
- **page_title** *(text, optional)* — Page Title
- **description** *(text, optional)* — Description
- **og_image** *(url, optional)* — Preview Image URL
- **oembed_html** *(rich_text, optional)* — oEmbed HTML
- **content_type** *(text, optional)* — Content Type
- **content_length** *(number, optional)* — Content Length
- **cached** *(boolean, optional)* — From Cache

## What must be true

- **general:** URL embedding must be enabled at the workspace level; if disabled, no URLs are unfurled, Only absolute URLs are processed; relative URLs are skipped, A single message may have at most a configurable maximum number of external URL previews (default five), URLs that appear alongside file attachments in the same message are skipped to avoid redundant content, Individual URLs within a message may be marked as ignoreParse to opt out of preview generation, Preview data is cached by URL so that repeated occurrences of the same URL do not trigger additional outbound requests, Fetched content is limited to a configured byte size to prevent excessive resource use, Hosts that appear on a configurable ignore list are never fetched; IP range checks are applied for private/internal addresses, Only ports on a configurable safe-port list are contacted; requests to non-safe ports are refused, SSRF protection is applied; private and loopback IP ranges are blocked unless explicitly allow-listed, Redirect chains are followed up to a configurable maximum depth, Relevant metadata tags are extracted: Open Graph (og:*), Twitter card (twitter:*), oEmbed, Facebook (fb:*), and description/title, oEmbed HTML is constrained to a maximum display width to prevent layout overflow, If the oEmbed endpoint returns data it is merged with page metadata; oEmbed takes precedence for media embeds, Known media platforms (video, audio, presentation services) have registered oEmbed endpoints that are contacted directly without page scraping, HTTP responses with a non-200 status code are treated as failed fetches and produce no preview, The User-Agent header sent to external servers is configurable to allow site-specific compatibility, Character encoding is detected from HTTP headers and HTML meta tags; content is decoded to UTF-8 before parsing

## Success & failure scenarios

**✅ Success paths**

- **Embedding Disabled** — when workspace URL embedding setting is disabled, then No preview generated; URLs are rendered as plain links.
- **Url Not Absolute** — when url is not an absolute URL, then URL is skipped; only absolute URLs are unfurled.
- **Url Parse Ignored** — when the URL entry has ignoreParse set to true, then URL is skipped per message-level opt-out flag.
- **Max Previews Exceeded** — when number of external URLs in the message exceeds the maximum preview limit, then Additional URLs beyond the limit are rendered as plain links without previews.
- **Preview From Cache** — when embedding is enabled; url is absolute and not ignored; cached preview data exists for the url, then Rich preview is displayed using cached metadata; no outbound request made.
- **Oembed Preview Generated** — when embedding is enabled; url is absolute, not ignored, and not cached; a registered oEmbed provider matches the url pattern; oEmbed endpoint returns valid data, then Rich oEmbed embed (video player, audio player, slide deck) is displayed inline in the message.
- **Metadata Preview Generated** — when embedding is enabled; url is absolute, not ignored, and not cached; no registered oEmbed provider matches the url; page metadata (title, description, or og:image) is successfully extracted, then Link card preview is shown with title, description, and image where available.
- **No Metadata Found** — when embedding is enabled; url is absolute and not ignored; fetch succeeds but no relevant metadata is found in the page, then URL renders as a plain link; no preview card is shown.

**❌ Failure paths**

- **Host Ignored** — when url hostname matches the configured ignore list or resolves to a private/blocked IP range, then URL is not fetched; no preview is generated. *(error: `PREVIEW_HOST_IGNORED`)*
- **Unsafe Port** — when url port is not in the configured safe-ports list, then URL is not fetched; port is not permitted. *(error: `PREVIEW_UNSAFE_PORT`)*
- **Fetch Failed** — when outbound HTTP request to external_site fails or returns a non-200 status, then No preview generated for this URL; URL renders as a plain link. *(error: `PREVIEW_FETCH_FAILED`)*

## Errors it can return

- `PREVIEW_HOST_IGNORED` — This URL cannot be previewed
- `PREVIEW_UNSAFE_PORT` — This URL cannot be previewed due to an unsupported port
- `PREVIEW_FETCH_FAILED` — The link preview could not be loaded

## Connects to

- **direct-messaging** *(recommended)* — Link previews appear in direct message and channel conversations
- **file-upload-sharing** *(optional)* — Messages with file attachments suppress URL unfurling to avoid duplicate content
- **message-pinning** *(optional)* — Pinned messages containing URLs retain their generated previews

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/link-preview-unfurling/) · **Spec source:** [`link-preview-unfurling.blueprint.yaml`](./link-preview-unfurling.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
