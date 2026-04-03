---
title: "Cloud Storage Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Manage object storage across cloud providers with upload, download, delete, presigned URLs, multipart upload, and lifecycle policy support. 13 fields. 9 outcome"
---

# Cloud Storage Blueprint

> Manage object storage across cloud providers with upload, download, delete, presigned URLs, multipart upload, and lifecycle policy support

| | |
|---|---|
| **Feature** | `cloud-storage` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | storage, cloud, s3, blob, file-upload, object-storage |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/infrastructure/cloud-storage.blueprint.yaml) |
| **JSON API** | [cloud-storage.json]({{ site.baseurl }}/api/blueprints/infrastructure/cloud-storage.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `provider` | select | Yes | Cloud storage provider |  |
| `bucket` | text | Yes | Bucket or container name | Validations: pattern |
| `key` | text | Yes | Object key (path within bucket) | Validations: maxLength |
| `content_type` | text | No | MIME content type of the object |  |
| `size` | number | No | Object size in bytes |  |
| `acl` | select | No | Access control level |  |
| `presigned_url` | url | No | Presigned URL for temporary access |  |
| `presigned_expiry` | number | No | Presigned URL expiry in seconds | Validations: min, max |
| `encryption` | select | No | Server-side encryption method |  |
| `storage_class` | select | No | Storage class for cost optimization |  |
| `version_id` | text | No | Object version identifier (when versioning enabled) |  |
| `etag` | text | No | Entity tag for conditional operations |  |
| `upload_id` | text | No | Multipart upload identifier |  |

## Rules

- **upload:** Maximum single upload size is 5GB; use multipart upload for larger objects, Multipart upload required for objects over 100MB (recommended over 5MB), Content-type should be set explicitly; auto-detection based on extension as fallback, All uploads must include a checksum (MD5 or SHA-256) for integrity verification
- **security:** Server-side encryption is required for all objects at rest, Bucket-level public access is blocked by default; public-read ACL requires explicit opt-in, Presigned URLs must have an expiry; maximum 7 days (604800 seconds), CORS configuration required for browser-based direct uploads
- **lifecycle:** Lifecycle policies transition objects between storage classes based on age, Expired objects are deleted automatically per lifecycle rules, Versioned objects retain previous versions; lifecycle rules can expire non-current versions
- **naming:** Bucket names must be globally unique and DNS-compatible (lowercase, no underscores), Object keys use forward slashes as logical directory separators, Avoid special characters in keys except hyphens, underscores, dots, and slashes

## Outcomes

### Object_uploaded (Priority: 1)

**Given:**
- `bucket` (input) exists
- `key` (input) exists
- Object body provided and size within single upload limit

**Then:**
- **create_record**
- **emit_event** event: `object.uploaded`

**Result:** Object stored with server-side encryption; etag returned for verification

### Multipart_upload_completed (Priority: 2)

**Given:**
- Object size exceeds 100MB
- Multipart upload initiated with upload_id
- All parts uploaded and completed

**Then:**
- **create_record**
- **emit_event** event: `object.uploaded`

**Result:** Multipart upload assembled into final object; upload_id invalidated

### Object_downloaded (Priority: 3)

**Given:**
- `bucket` (input) exists
- `key` (input) exists
- Object exists at the specified key

**Then:**
- **emit_event** event: `object.accessed`

**Result:** Object content and metadata returned; conditional GET supported via ETag/If-None-Match

### Presigned_url_generated (Priority: 4)

**Given:**
- `bucket` (input) exists
- `key` (input) exists
- `presigned_expiry` (input) lte `604800`

**Then:**
- **set_field** target: `presigned_url` value: `generated_url`

**Result:** Presigned URL generated for temporary access; expires after specified duration

### Object_deleted (Priority: 5)

**Given:**
- `bucket` (input) exists
- `key` (input) exists
- Caller has delete permission on the object

**Then:**
- **delete_record**
- **emit_event** event: `object.deleted`

**Result:** Object deleted; if versioning enabled, a delete marker is placed

### Object_not_found (Priority: 6) — Error: `OBJECT_NOT_FOUND`

**Given:**
- No object exists at the specified bucket/key path

**Then:**
- **emit_event** event: `object.access_denied`

**Result:** 404 returned; object does not exist at the specified path

### Bucket_access_denied (Priority: 7) — Error: `BUCKET_ACCESS_DENIED`

**Given:**
- Caller lacks permission to access the specified bucket

**Then:**
- **emit_event** event: `object.access_denied`

**Result:** 403 returned; caller does not have required IAM permissions

### Upload_too_large (Priority: 8) — Error: `UPLOAD_SIZE_EXCEEDED`

**Given:**
- `size` (input) gt `5368709120`

**Result:** Upload rejected; use multipart upload for objects over 5GB

### Invalid_content_type (Priority: 9) — Error: `CONTENT_TYPE_NOT_ALLOWED`

**Given:**
- Content type is not in the bucket's allowed content types list

**Result:** Upload rejected; content type not permitted by bucket policy

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBJECT_NOT_FOUND` | 404 | Object does not exist at the specified path. | No |
| `BUCKET_ACCESS_DENIED` | 403 | Access denied. Check IAM permissions for the bucket. | No |
| `UPLOAD_SIZE_EXCEEDED` | 413 | Object exceeds maximum single upload size (5GB). Use multipart upload. | No |
| `CONTENT_TYPE_NOT_ALLOWED` | 422 | Content type is not allowed by the bucket policy. | No |
| `BUCKET_NOT_FOUND` | 404 | Bucket does not exist or is not accessible. | No |
| `MULTIPART_UPLOAD_FAILED` | 500 | Multipart upload failed. Incomplete parts have been cleaned up. | No |
| `CHECKSUM_MISMATCH` | 400 | Object checksum does not match the provided value. Upload may be corrupted. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `object.uploaded` |  | `bucket`, `key`, `size`, `content_type`, `etag` |
| `object.deleted` |  | `bucket`, `key`, `version_id` |
| `object.accessed` |  | `bucket`, `key`, `requester` |
| `object.access_denied` |  | `bucket`, `key`, `requester`, `error_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| api-gateway | optional | Presigned URL generation may be exposed through API gateway |
| webhook-ingestion | optional | Receive storage event notifications (object created, deleted) |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cloud Storage Blueprint",
  "description": "Manage object storage across cloud providers with upload, download, delete, presigned URLs, multipart upload, and lifecycle policy support. 13 fields. 9 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "storage, cloud, s3, blob, file-upload, object-storage"
}
</script>
