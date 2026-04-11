<!-- AUTO-GENERATED FROM cloud-storage.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cloud Storage

> Manage object storage across cloud providers with upload, download, delete, presigned URLs, multipart upload, and lifecycle policy support

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** storage · cloud · s3 · blob · file-upload · object-storage

## What this does

Manage object storage across cloud providers with upload, download, delete, presigned URLs, multipart upload, and lifecycle policy support

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **provider** *(select, required)* — Cloud storage provider
- **bucket** *(text, required)* — Bucket or container name
- **key** *(text, required)* — Object key (path within bucket)
- **content_type** *(text, optional)* — MIME content type of the object
- **size** *(number, optional)* — Object size in bytes
- **acl** *(select, optional)* — Access control level
- **presigned_url** *(url, optional)* — Presigned URL for temporary access
- **presigned_expiry** *(number, optional)* — Presigned URL expiry in seconds
- **encryption** *(select, optional)* — Server-side encryption method
- **storage_class** *(select, optional)* — Storage class for cost optimization
- **version_id** *(text, optional)* — Object version identifier (when versioning enabled)
- **etag** *(text, optional)* — Entity tag for conditional operations
- **upload_id** *(text, optional)* — Multipart upload identifier

## What must be true

- **upload:** Maximum single upload size is 5GB; use multipart upload for larger objects, Multipart upload required for objects over 100MB (recommended over 5MB), Content-type should be set explicitly; auto-detection based on extension as fallback, All uploads must include a checksum (MD5 or SHA-256) for integrity verification
- **security:** Server-side encryption is required for all objects at rest, Bucket-level public access is blocked by default; public-read ACL requires explicit opt-in, Presigned URLs must have an expiry; maximum 7 days (604800 seconds), CORS configuration required for browser-based direct uploads
- **lifecycle:** Lifecycle policies transition objects between storage classes based on age, Expired objects are deleted automatically per lifecycle rules, Versioned objects retain previous versions; lifecycle rules can expire non-current versions
- **naming:** Bucket names must be globally unique and DNS-compatible (lowercase, no underscores), Object keys use forward slashes as logical directory separators, Avoid special characters in keys except hyphens, underscores, dots, and slashes

## Success & failure scenarios

**✅ Success paths**

- **Object Uploaded** — when bucket exists; key exists; Object body provided and size within single upload limit, then Object stored with server-side encryption; etag returned for verification.
- **Multipart Upload Completed** — when Object size exceeds 100MB; Multipart upload initiated with upload_id; All parts uploaded and completed, then Multipart upload assembled into final object; upload_id invalidated.
- **Object Downloaded** — when bucket exists; key exists; Object exists at the specified key, then Object content and metadata returned; conditional GET supported via ETag/If-None-Match.
- **Presigned Url Generated** — when bucket exists; key exists; presigned_expiry lte 604800, then Presigned URL generated for temporary access; expires after specified duration.
- **Object Deleted** — when bucket exists; key exists; Caller has delete permission on the object, then Object deleted; if versioning enabled, a delete marker is placed.

**❌ Failure paths**

- **Object Not Found** — when No object exists at the specified bucket/key path, then 404 returned; object does not exist at the specified path. *(error: `OBJECT_NOT_FOUND`)*
- **Bucket Access Denied** — when Caller lacks permission to access the specified bucket, then 403 returned; caller does not have required IAM permissions. *(error: `BUCKET_ACCESS_DENIED`)*
- **Upload Too Large** — when size gt 5368709120, then Upload rejected; use multipart upload for objects over 5GB. *(error: `UPLOAD_SIZE_EXCEEDED`)*
- **Invalid Content Type** — when Content type is not in the bucket's allowed content types list, then Upload rejected; content type not permitted by bucket policy. *(error: `CONTENT_TYPE_NOT_ALLOWED`)*

## Errors it can return

- `OBJECT_NOT_FOUND` — Object does not exist at the specified path.
- `BUCKET_ACCESS_DENIED` — Access denied. Check IAM permissions for the bucket.
- `UPLOAD_SIZE_EXCEEDED` — Object exceeds maximum single upload size (5GB). Use multipart upload.
- `CONTENT_TYPE_NOT_ALLOWED` — Content type is not allowed by the bucket policy.
- `BUCKET_NOT_FOUND` — Bucket does not exist or is not accessible.
- `MULTIPART_UPLOAD_FAILED` — Multipart upload failed. Incomplete parts have been cleaned up.
- `CHECKSUM_MISMATCH` — Object checksum does not match the provided value. Upload may be corrupted.

## Connects to

- **api-gateway** *(optional)* — Presigned URL generation may be exposed through API gateway
- **webhook-ingestion** *(optional)* — Receive storage event notifications (object created, deleted)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/cloud-storage/) · **Spec source:** [`cloud-storage.blueprint.yaml`](./cloud-storage.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
