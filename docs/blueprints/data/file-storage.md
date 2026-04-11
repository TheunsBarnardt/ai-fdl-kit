---
title: "File Storage Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Cloud storage abstraction with signed URLs, virus scanning, content type validation, checksum deduplication, and multi-provider support. 13 fields. 8 outcomes. "
---

# File Storage Blueprint

> Cloud storage abstraction with signed URLs, virus scanning, content type validation, checksum deduplication, and multi-provider support

| | |
|---|---|
| **Feature** | `file-storage` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | file-storage, upload, download, s3, cloud-storage, signed-urls, virus-scanning |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/file-storage.blueprint.yaml) |
| **JSON API** | [file-storage.json]({{ site.baseurl }}/api/blueprints/data/file-storage.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `file_id` | text | Yes | File ID |  |
| `bucket` | text | Yes | Storage Bucket |  |
| `key` | text | Yes | Object Key | Validations: maxLength |
| `filename` | text | Yes | Original Filename | Validations: maxLength |
| `content_type` | text | Yes | MIME Content Type |  |
| `size_bytes` | number | Yes | File Size (bytes) | Validations: min |
| `checksum_sha256` | text | Yes | SHA-256 Checksum |  |
| `storage_provider` | select | Yes | Storage Provider |  |
| `upload_url` | url | No | Presigned Upload URL |  |
| `download_url` | url | No | Presigned Download URL |  |
| `uploaded_by` | text | Yes | Uploaded By |  |
| `uploaded_at` | datetime | Yes | Upload Timestamp |  |
| `scan_status` | select | No | Virus Scan Status |  |

## Rules

- **upload:**
  - **max_file_size_bytes:** configurable
  - **default_max_file_size_bytes:** 104857600
  - **allowed_content_types:** configurable
  - **content_type_validation:** server_side
  - **presigned_upload:** true
  - **presigned_upload_expiry_seconds:** 3600
- **download:**
  - **presigned_download:** true
  - **presigned_download_expiry_seconds:** 3600
  - **content_disposition:** attachment
- **virus_scanning:**
  - **enabled:** true
  - **scan_on_upload:** true
  - **quarantine_on_detect:** true
  - **block_until_scanned:** false
- **deduplication:**
  - **enabled:** true
  - **strategy:** checksum
  - **scope:** per_bucket
- **storage:**
  - **path_strategy:** date_partitioned
  - **encryption_at_rest:** true
  - **versioning:** false
- **cleanup:**
  - **orphan_detection:** true
  - **orphan_grace_period_days:** 7

## Outcomes

### File_uploaded (Priority: 1) — Error: `FILE_UPLOAD_URL_EXPIRED`

**Given:**
- a file upload request is received
- the file passes size and content type validation
- the user is authenticated

**Then:**
- **create_record** target: `file_metadata` — Store file metadata (filename, size, content_type, checksum, bucket, key)
- **emit_event** event: `file.uploaded`

**Result:** File stored and metadata recorded; virus scan queued

### File_downloaded (Priority: 2)

**Given:**
- a file download request is received
- the file exists and the user has access
- the file is not quarantined (scan_status != infected)

**Then:**
- **set_field** target: `download_url` — Generate presigned download URL
- **emit_event** event: `file.downloaded`

**Result:** Presigned download URL returned to the client

### Presigned_url_generated (Priority: 3)

**Given:**
- a presigned upload URL is requested
- the content type and size are within allowed limits

**Then:**
- **set_field** target: `upload_url` — Generate presigned upload URL with expiry

**Result:** Presigned upload URL returned for direct client-to-storage upload

### File_deleted (Priority: 4)

**Given:**
- a file deletion request is received
- the file exists
- the user has permission to delete the file

**Then:**
- **delete_record** — Remove file metadata record
- **emit_event** event: `file.deleted`

**Result:** File metadata removed; storage object scheduled for cleanup

### File_scanned_clean (Priority: 5)

**Given:**
- virus scan completes on an uploaded file
- no threats detected

**Then:**
- **set_field** target: `scan_status` value: `clean`
- **emit_event** event: `file.scanned`

**Result:** File marked as clean and fully available for download

### File_scanned_infected (Priority: 6)

**Given:**
- virus scan completes on an uploaded file
- a threat is detected

**Then:**
- **set_field** target: `scan_status` value: `infected`
- **notify** to: `uploaded_by` — Notify uploader that their file was quarantined
- **emit_event** event: `file.quarantined`

**Result:** File quarantined; not available for download; uploader notified

### Upload_too_large (Priority: 10) — Error: `FILE_TOO_LARGE`

**Given:**
- the uploaded file exceeds the maximum allowed size

**Result:** Error returned indicating file size limit

### Content_type_not_allowed (Priority: 11) — Error: `FILE_CONTENT_TYPE_NOT_ALLOWED`

**Given:**
- the detected content type is not in the allowed list for the target bucket

**Result:** Error returned indicating the file type is not permitted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FILE_TOO_LARGE` | 413 | File exceeds the maximum allowed size | No |
| `FILE_CONTENT_TYPE_NOT_ALLOWED` | 422 | File type is not permitted for this upload | No |
| `FILE_NOT_FOUND` | 404 | File not found | No |
| `FILE_QUARANTINED` | 403 | File is quarantined due to a detected threat and cannot be downloaded | No |
| `FILE_UPLOAD_URL_EXPIRED` | 410 | Presigned upload URL has expired; request a new one | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `file.uploaded` | A file was uploaded and metadata recorded | `file_id`, `filename`, `content_type`, `size_bytes`, `uploaded_by` |
| `file.downloaded` | A file was downloaded by a user | `file_id`, `downloaded_by` |
| `file.deleted` | A file was deleted | `file_id`, `filename`, `deleted_by` |
| `file.scanned` | A file completed virus scanning | `file_id`, `scan_status`, `scan_engine` |
| `file.quarantined` | A file was quarantined due to a detected threat | `file_id`, `threat_name`, `uploaded_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| data-import-export | recommended | Import/export operations use file storage for uploaded and generated files |
| audit-trail | recommended | File uploads, downloads, and deletions should be tracked |
| soft-delete | optional | Files can use soft-delete with retention before permanent removal |

## AGI Readiness

### Goals

#### Reliable File Storage

Cloud storage abstraction with signed URLs, virus scanning, content type validation, checksum deduplication, and multi-provider support

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| file_uploaded | `autonomous` | - | - |
| file_downloaded | `autonomous` | - | - |
| presigned_url_generated | `autonomous` | - | - |
| file_deleted | `human_required` | - | - |
| file_scanned_clean | `autonomous` | - | - |
| file_scanned_infected | `autonomous` | - | - |
| upload_too_large | `autonomous` | - | - |
| content_type_not_allowed | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "File Storage Blueprint",
  "description": "Cloud storage abstraction with signed URLs, virus scanning, content type validation, checksum deduplication, and multi-provider support. 13 fields. 8 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "file-storage, upload, download, s3, cloud-storage, signed-urls, virus-scanning"
}
</script>
