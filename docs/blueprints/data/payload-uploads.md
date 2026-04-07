---
title: "Payload Uploads Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support. 9 fields. 7 outcomes. 6 error "
---

# Payload Uploads Blueprint

> File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support

| | |
|---|---|
| **Feature** | `payload-uploads` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | cms, uploads, files, images, sharp, resize, crop, focal-point, storage, payload |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/payload-uploads.blueprint.yaml) |
| **JSON API** | [payload-uploads.json]({{ site.baseurl }}/api/blueprints/data/payload-uploads.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `uploader` | Uploader | human | User uploading files through the admin panel or API |
| `image_processor` | Image Processor | system | Sharp-based image processing engine for resize, crop, and format conversion |
| `storage_adapter` | Storage Adapter | system | Pluggable storage backend — local filesystem or cloud (S3, GCS, Azure, R2, Vercel Blob, Uploadthing) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `filename` | text | Yes | Filename | Validations: unique |
| `filesize` | number | Yes | File Size |  |
| `url` | url | Yes | File URL |  |
| `mime_type` | text | Yes | MIME Type |  |
| `width` | number | No | Image Width |  |
| `height` | number | No | Image Height |  |
| `thumbnail_url` | url | No | Thumbnail URL |  |
| `focal_x` | number | No | Focal Point X |  |
| `focal_y` | number | No | Focal Point Y |  |

## Rules

- **security:**
  - **restricted_file_types:**
    - **blocked_by_default:** exe, bat, php, js, jar, dmg, deb, rpm, msi, app, cmd, com, ps1, sh
    - **override:** allowRestrictedFileTypes: true
  - **mime_type_validation:**
    - **primary_detection:** file buffer analysis (file-type library)
    - **fallback:** extension-based detection
    - **svg_special_handling:** true
    - **pdf_integrity_check:** true
  - **filename_sanitization:** true
  - **svg_content_security_policy:** true
- **image_processing:**
  - **library:** Sharp
  - **resize_modes:** resize with focal point (intelligent crop around focal coordinates), standard resize (Sharp configuration), omit (skip if image too small, respects withoutEnlargement)
  - **focal_point_cropping:** true
  - **format_conversion:** true
  - **animated_image_support:** true
  - **exif_auto_rotation:** true
  - **metadata_preservation:** configurable via withMetadata option
- **storage:**
  - **local_filesystem:** true
  - **cloud_adapters:** S3, GCS, Azure Blob, Cloudflare R2, Vercel Blob, Uploadthing
  - **disable_local_storage:** configurable
  - **static_dir:** defaults to collection slug
- **access:**
  - **range_requests:** true

## Outcomes

### Upload_restricted_type (Priority: 2) — Error: `UPLOAD_RESTRICTED_TYPE`

**Given:**
- file extension or MIME type is in the restricted list
- allowRestrictedFileTypes is not enabled

**Result:** Upload rejected — file type not allowed

### Upload_invalid_mime (Priority: 3) — Error: `UPLOAD_INVALID_MIME`

**Given:**
- collection specifies allowed MIME types
- file MIME type does not match any allowed pattern

**Result:** Upload rejected — MIME type not in allowed list

### Upload_success (Priority: 10) | Transaction: atomic

**Given:**
- user has create access for the upload collection
- file passes MIME type validation
- file is not a restricted type (or restrictions overridden)
- file size within configured limits

**Then:**
- filename sanitized for path safety
- MIME type detected from file buffer
- image dimensions extracted (with EXIF rotation adjustment)
- image sizes generated per collection configuration
- focal point crop applied if focal coordinates set
- file stored via storage adapter (local or cloud)
- document created in collection with file metadata

**Result:** Upload document created with filename, URL, dimensions, MIME type, and all image size variants

### File_retrieval (Priority: 10)

**Given:**
- GET request to /api/{slug}/file/:filename
- user has read access

**Then:**
- custom handler checked first (for cloud storage)
- file served with correct Content-Type header
- Range requests supported (HTTP 206)
- SVG files served with Content-Security-Policy headers

**Result:** File binary streamed to client

### Image_resize (Priority: 10)

**Given:**
- uploaded file is an image
- collection has imageSizes configured

**Then:**
- each configured size processed through Sharp
- focal point respected during crop/resize
- animated images handled (frame count detection)
- format conversion applied if specified
- resized variants stored alongside original

**Result:** Image size variants created with individual URLs, dimensions, and file sizes

### File_deletion (Priority: 10)

**Given:**
- user has delete access for the upload collection
- document is being deleted

**Then:**
- main file deleted from storage
- all image size variants deleted
- deletion errors logged but do not block document deletion

**Result:** All associated files removed from storage

### Overwrite_existing (Priority: 10)

**Given:**
- user has update access
- overwriteExistingFiles flag is set
- new file uploaded to replace existing

**Then:**
- old file and variants deleted
- new file processed and stored
- document metadata updated

**Result:** Existing file replaced with new upload

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `UPLOAD_RESTRICTED_TYPE` | 400 | This file type is not allowed | Yes |
| `UPLOAD_INVALID_MIME` | 400 | This file type is not permitted for this collection | Yes |
| `UPLOAD_FILE_MISSING` | 400 | No file was provided | Yes |
| `UPLOAD_ERROR` | 400 | An error occurred while uploading the file | Yes |
| `UPLOAD_RETRIEVAL_ERROR` | 500 | An error occurred while retrieving the file | Yes |
| `UPLOAD_DELETION_ERROR` | 500 | An error occurred while deleting the file | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `upload.create` | Emitted after successful file upload — handled via collection afterChange hooks | `collection_slug`, `document_id`, `filename`, `mime_type`, `filesize` |
| `upload.delete` | Emitted when upload document and files are deleted | `collection_slug`, `document_id`, `filename` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payload-collections | required | Upload collections are standard Payload collections with upload fields added |
| payload-versions | optional | Upload collections can enable versioning to track file history |
| payload-access-control | required | File access controlled by collection access functions |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Payload CMS 3.x
  image_library: Sharp
  database: Multi-adapter (MongoDB, PostgreSQL, SQLite, D1)
storage_adapters:
  - package: "@payloadcms/storage-s3"
  - package: "@payloadcms/storage-gcs"
  - package: "@payloadcms/storage-azure"
  - package: "@payloadcms/storage-r2"
  - package: "@payloadcms/storage-vercel-blob"
  - package: "@payloadcms/storage-uploadthing"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payload Uploads Blueprint",
  "description": "File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support. 9 fields. 7 outcomes. 6 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cms, uploads, files, images, sharp, resize, crop, focal-point, storage, payload"
}
</script>
