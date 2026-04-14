<!-- AUTO-GENERATED FROM payload-uploads.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payload Uploads

> File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support

**Category:** Data · **Version:** 1.0.0 · **Tags:** cms · uploads · files · images · sharp · resize · crop · focal-point · storage · payload

## What this does

File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **filename** *(text, required)* — Filename
- **filesize** *(number, required)* — File Size
- **url** *(url, required)* — File URL
- **mime_type** *(text, required)* — MIME Type
- **width** *(number, optional)* — Image Width
- **height** *(number, optional)* — Image Height
- **thumbnail_url** *(url, optional)* — Thumbnail URL
- **focal_x** *(number, optional)* — Focal Point X
- **focal_y** *(number, optional)* — Focal Point Y

## What must be true

- **security → restricted_file_types → blocked_by_default:** exe, bat, php, js, jar, dmg, deb, rpm, msi, app, cmd, com, ps1, sh
- **security → restricted_file_types → override:** allowRestrictedFileTypes: true
- **security → mime_type_validation → primary_detection:** file buffer analysis (file-type library)
- **security → mime_type_validation → fallback:** extension-based detection
- **security → mime_type_validation → svg_special_handling:** true
- **security → mime_type_validation → pdf_integrity_check:** true
- **security → filename_sanitization:** true
- **security → svg_content_security_policy:** true
- **image_processing → library:** Sharp
- **image_processing → resize_modes:** resize with focal point (intelligent crop around focal coordinates), standard resize (Sharp configuration), omit (skip if image too small, respects withoutEnlargement)
- **image_processing → focal_point_cropping:** true
- **image_processing → format_conversion:** true
- **image_processing → animated_image_support:** true
- **image_processing → exif_auto_rotation:** true
- **image_processing → metadata_preservation:** configurable via withMetadata option
- **storage → local_filesystem:** true
- **storage → cloud_adapters:** S3, GCS, Azure Blob, Cloudflare R2, Vercel Blob, Uploadthing
- **storage → disable_local_storage:** configurable
- **storage → static_dir:** defaults to collection slug
- **access → range_requests:** true

## Success & failure scenarios

**✅ Success paths**

- **Upload Success** — when user has create access for the upload collection; file passes MIME type validation; file is not a restricted type (or restrictions overridden); file size within configured limits, then Upload document created with filename, URL, dimensions, MIME type, and all image size variants.
- **File Retrieval** — when GET request to /api/{slug}/file/:filename; user has read access, then File binary streamed to client.
- **Image Resize** — when uploaded file is an image; collection has imageSizes configured, then Image size variants created with individual URLs, dimensions, and file sizes.
- **File Deletion** — when user has delete access for the upload collection; document is being deleted, then All associated files removed from storage.
- **Overwrite Existing** — when user has update access; overwriteExistingFiles flag is set; new file uploaded to replace existing, then Existing file replaced with new upload.

**❌ Failure paths**

- **Upload Restricted Type** — when file extension or MIME type is in the restricted list; allowRestrictedFileTypes is not enabled, then Upload rejected — file type not allowed. *(error: `UPLOAD_RESTRICTED_TYPE`)*
- **Upload Invalid Mime** — when collection specifies allowed MIME types; file MIME type does not match any allowed pattern, then Upload rejected — MIME type not in allowed list. *(error: `UPLOAD_INVALID_MIME`)*

## Errors it can return

- `UPLOAD_RESTRICTED_TYPE` — This file type is not allowed
- `UPLOAD_INVALID_MIME` — This file type is not permitted for this collection
- `UPLOAD_FILE_MISSING` — No file was provided
- `UPLOAD_ERROR` — An error occurred while uploading the file
- `UPLOAD_RETRIEVAL_ERROR` — An error occurred while retrieving the file
- `UPLOAD_DELETION_ERROR` — An error occurred while deleting the file

## Events

**`upload.create`** — Emitted after successful file upload — handled via collection afterChange hooks
  Payload: `collection_slug`, `document_id`, `filename`, `mime_type`, `filesize`

**`upload.delete`** — Emitted when upload document and files are deleted
  Payload: `collection_slug`, `document_id`, `filename`

## Connects to

- **payload-collections** *(required)* — Upload collections are standard Payload collections with upload fields added
- **payload-versions** *(optional)* — Upload collections can enable versioning to track file history
- **payload-access-control** *(required)* — File access controlled by collection access functions

## Quality fitness 🟡 73/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `░░░░░░░░░░` | 0/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/payload-uploads/) · **Spec source:** [`payload-uploads.blueprint.yaml`](./payload-uploads.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
