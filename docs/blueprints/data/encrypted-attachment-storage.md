---
title: "Encrypted Attachment Storage Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Issue signed upload descriptors so authenticated clients can upload client-side encrypted attachments directly to cloud object storage, with server-enforced siz"
---

# Encrypted Attachment Storage Blueprint

> Issue signed upload descriptors so authenticated clients can upload client-side encrypted attachments directly to cloud object storage, with server-enforced size limits and dual rate limiting

| | |
|---|---|
| **Feature** | `encrypted-attachment-storage` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | attachments, encryption, upload, resumable, cloud-storage, signed-url, e2ee |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/encrypted-attachment-storage.blueprint.yaml) |
| **JSON API** | [encrypted-attachment-storage.json]({{ site.baseurl }}/api/blueprints/data/encrypted-attachment-storage.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `upload_length` | number | No | Upload Length (bytes) | Validations: min |
| `cdn_number` | number | No | CDN Number |  |
| `attachment_key` | token | No | Attachment Key |  |
| `signed_upload_location` | url | No | Signed Upload Location |  |
| `upload_headers` | json | No | Upload Headers |  |
| `max_upload_bytes` | number | No | Maximum Upload Size (bytes) |  |

## Rules

- **authentication:**
  - **require_active_session:** true
- **privacy:**
  - **server_never_receives_plaintext:** true
  - **client_must_encrypt_before_upload:** true
- **size_limits:**
  - **reject_before_rate_limiting:** true
- **rate_limiting:**
  - **upload_count_limiter:** per_account
  - **byte_quota_limiter:** per_account
  - **restore_count_permit_on_byte_failure:** true
- **upload_protocol:**
  - **selection:** server_side_experiment_enrollment
  - **key_generation:** cryptographically_secure_random

## Outcomes

### Unauthenticated (Priority: 1) — Error: `ATTACHMENT_UNAUTHENTICATED`

**Given:**
- `account_identifier` (session) not_exists

**Result:** Request rejected with 401 Unauthorized

### Upload_too_large (Priority: 2) — Error: `ATTACHMENT_TOO_LARGE`

**Given:**
- `upload_length` (input) gt `max_upload_bytes`

**Result:** Request rejected with 413 Request Entity Too Large

### Rate_limited (Priority: 3) — Error: `ATTACHMENT_RATE_LIMITED`

**Given:**
- per-account upload count or byte quota rate limiter is exhausted

**Then:**
- **emit_event** event: `attachment.rate_limited`

**Result:** Request rejected with 429 Too Many Requests and Retry-After header

### Descriptor_issued (Priority: 10)

**Given:**
- `account_identifier` (session) exists
- `upload_length` (input) lte `max_upload_bytes`
- per-account upload count rate limiter has available permits
- per-account byte quota rate limiter has available permits when upload_length is provided

**Then:**
- **create_record** target: `descriptor` — Generate a random attachment key, select the storage backend, produce signed upload headers and location URL
- **emit_event** event: `attachment.descriptor_issued`

**Result:** Returns a JSON object with cdn number, attachment key, upload headers, and a pre-signed upload URL; client uploads encrypted bytes directly to the returned location

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ATTACHMENT_UNAUTHENTICATED` | 401 | Authentication required to upload attachments. | No |
| `ATTACHMENT_TOO_LARGE` | 413 | Attachment exceeds the maximum allowed size. | No |
| `ATTACHMENT_RATE_LIMITED` | 429 | Too many attachment uploads. Please wait before trying again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `attachment.descriptor_issued` | A signed upload descriptor was successfully issued to an authenticated client | `account_identifier`, `cdn_number`, `attachment_key`, `upload_length` |
| `attachment.rate_limited` | An attachment upload descriptor request was rejected due to rate limiting | `account_identifier` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | User must hold a valid authenticated session before requesting an upload descriptor |
| rate-limiting-abuse-prevention | required | Both upload count and byte quota are enforced through leaky-bucket rate limiters |
| cloud-storage | required | Attachment bytes are stored in and retrieved from cloud object storage via the issued signed URL |
| e2e-key-exchange | recommended | Attachment encryption keys are typically exchanged via the end-to-end key infrastructure before upload |

## AGI Readiness

### Goals

#### Reliable Encrypted Attachment Storage

Issue signed upload descriptors so authenticated clients can upload client-side encrypted attachments directly to cloud object storage, with server-enforced size limits and dual rate limiting

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `login` | login | degrade |
| `rate_limiting_abuse_prevention` | rate-limiting-abuse-prevention | degrade |
| `cloud_storage` | cloud-storage | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| descriptor_issued | `autonomous` | - | - |
| unauthenticated | `autonomous` | - | - |
| upload_too_large | `autonomous` | - | - |
| rate_limited | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Encrypted Attachment Storage Blueprint",
  "description": "Issue signed upload descriptors so authenticated clients can upload client-side encrypted attachments directly to cloud object storage, with server-enforced siz",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "attachments, encryption, upload, resumable, cloud-storage, signed-url, e2ee"
}
</script>
