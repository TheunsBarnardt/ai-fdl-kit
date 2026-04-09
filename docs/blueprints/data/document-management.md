---
title: "Document Management Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation. 33 fields. 17 outcomes. 8 error codes. "
---

# Document Management Blueprint

> Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

| | |
|---|---|
| **Feature** | `document-management` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | documents, file-management, pdf-generation, document-repository, metadata, permissions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/document-management.blueprint.yaml) |
| **JSON API** | [document-management.json]({{ site.baseurl }}/api/blueprints/data/document-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Document owner/beneficiary |
| `financial_advisor` | Financial Advisor | human | Professional who manages client documents and generates reports |
| `back_office` | Back Office Staff | human | Administrative staff uploading and organizing documents |
| `document_repository` | Document Repository | external | Document storage and management backend |
| `metadata_system` | Metadata Management System | external | Document metadata and audit trail storage |
| `pdf_generator` | PDF Generation Engine | external | Dynamic PDF generation from templates and data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `document_id` | text | Yes |  |  |
| `document_name` | text | Yes |  |  |
| `document_type` | text | Yes |  |  |
| `display_type` | text | Yes |  |  |
| `document_classification` | text | Yes |  |  |
| `document_folder_id` | number | Yes |  |  |
| `document_folder_name` | text | No |  |  |
| `document_date` | date | Yes |  |  |
| `document_size_bytes` | number | Yes |  |  |
| `file_extension` | text | Yes |  |  |
| `content_type` | text | Yes |  |  |
| `storage_location` | text | Yes |  |  |
| `document_url` | url | Yes |  |  |
| `is_local` | boolean | Yes |  |  |
| `access_token` | text | No |  |  |
| `share_with_sasfin` | boolean | No |  |  |
| `is_active` | boolean | Yes |  |  |
| `expiry_date` | date | No |  |  |
| `created_by` | text | Yes |  |  |
| `created_date` | datetime | Yes |  |  |
| `uploaded_to_crm_user_id` | text | No |  |  |
| `last_modified_by` | text | No |  |  |
| `last_modified_date` | datetime | No |  |  |
| `account_number` | text | No |  |  |
| `dynamics_user_id` | text | Yes |  |  |
| `aspnet_user_id` | text | No |  |  |
| `free_text_description` | text | No |  |  |
| `record_type` | number | No |  |  |
| `status_reason` | text | No |  |  |
| `policy_number` | text | No |  |  |
| `document_process_id_name` | text | No |  |  |
| `parent_document_id` | text | No |  |  |
| `version_number` | number | No |  |  |

## States

**State field:** `document_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` |  |  |
| `uploaded` | Yes |  |
| `archived` |  |  |
| `expired` |  |  |
| `deleted` |  |  |

## Rules

- **security:**
  - **authentication:** All document endpoints require JWT authentication via [Authorize] decorator
- **access:** User can only view documents owned by or shared with their CRM account, Client can download their own documents and research documents, Advisors can access client's documents if CRM relationship exists, Back office can upload documents on behalf of clients, Offshore documents visible only to authorized users (office location check), Regulatory announcements are public-accessible
- **business:** Document cannot be deleted immediately; mark as inactive first, Expiry date enforcement: documents past expiry_date must show 'expired' status, One-time URLs for statement documents expire after first access, Document metadata immutable after upload except for notes/classification, File size must not exceed configured limit (typically 100MB), Share permissions cannot grant higher access than creator's own access, Deleted documents retained for audit trail (soft delete, not hard delete)
- **compliance:** All document access logged for audit trail (user, timestamp, action), Regulatory announcements must be timestamped with notification time, Infoslips URL regeneration tracked for compliance, Document retention policies enforced per document type

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| document_retrieval | 3s |  |
| metadata_update | 1s |  |
| pdf_generation | 10s |  |
| upload_processing | 5s |  |

## Outcomes

### Client_document_retrieved (Priority: 1)

**Given:**
- user is authenticated
- document_id is provided
- document belongs to user's account

**Then:**
- **fetch_record**
- **emit_event** event: `document.downloaded`

**Result:** File downloaded successfully

### Access_denied (Priority: 1) — Error: `DOCUMENT_ACCESS_DENIED`

**Given:**
- `user_id` (session) not_exists

**Result:** 401 Unauthorized - authentication required

### Client_documents_listed (Priority: 2)

**Given:**
- user is authenticated
- dynamics_user_id is provided
- optional: date_range specified

**Then:**
- **fetch_record**
- **filter_data** value: `true`
- **sort_data**

**Result:** List of documents user has access to

### Document_not_found (Priority: 2) — Error: `DOCUMENT_NOT_FOUND`

**Given:**
- `document_id` (input) not_exists

**Result:** 404 Not Found - document does not exist

### Document_uploaded (Priority: 3) | Transaction: atomic

**Given:**
- user is authenticated
- document_data (file content) is provided
- document_name is provided
- file_size <= max_allowed_size
- `file_extension` (input) in `pdf,xlsx,docx,jpg,png,txt`

**Then:**
- **validate_data**
- **create_record**
- **store_file**
- **create_record**
- **emit_event** event: `document.uploaded`

**Result:** Document stored and indexed, metadata recorded

### Document_expired (Priority: 3)

**Given:**
- `expiry_date` (db) lt `today`
- `expiry_date` (db) not_exists

**Then:**
- **set_field** target: `document_state` value: `expired`

**Result:** Document is expired and cannot be accessed

### Dynamic_document_generated (Priority: 4)

**Given:**
- user is authenticated
- document_request contains template_id and data
- user has permission to generate documents

**Then:**
- **fetch_record**
- **merge_data**
- **generate_output**
- **create_record**
- **emit_event** event: `document.generated`

**Result:** PDF document generated and returned to user

### File_size_exceeded (Priority: 4) — Error: `DOCUMENT_FILE_TOO_LARGE`

**Given:**
- `file_size_bytes` (input) gt `104857600`

**Result:** 400 Bad Request - file too large

### Document_metadata_updated (Priority: 5)

**Given:**
- user is authenticated
- document_id is provided
- user owns document
- `fields_to_update` (input) in `classification,free_text_description,folder_id,expiry_date`

**Then:**
- **set_field** target: `free_text_description` value: `[input_value]`
- **set_field** target: `document_classification` value: `[input_value]`
- **set_field** target: `last_modified_by` value: `[user_id]`
- **set_field** target: `last_modified_date` value: `now`
- **emit_event** event: `document.metadata_updated`

**Result:** Document metadata updated in system

### Invalid_file_type (Priority: 5) — Error: `DOCUMENT_INVALID_FILE_TYPE`

**Given:**
- `file_extension` (input) not_in `pdf,xlsx,docx,jpg,png,txt,ppt`

**Result:** 400 Bad Request - file type not allowed

### Document_deleted (Priority: 6) | Transaction: atomic

**Given:**
- user is authenticated
- document_id is provided
- user owns document
- document is not system-protected

**Then:**
- **set_field** target: `is_active` value: `false`
- **set_field** target: `status_reason` value: `deleted`
- **set_field** target: `last_modified_by` value: `[user_id]`
- **set_field** target: `last_modified_date` value: `now`
- **emit_event** event: `document.deleted`

**Result:** Document marked as deleted (soft delete retained for audit)

### Pdf_generation_failed (Priority: 6) — Error: `DOCUMENT_PDF_GENERATION_FAILED`

**Given:**
- PDF generation engine encounters error

**Then:**
- **emit_event** event: `document.generation_failed`

**Result:** 500 Internal Server Error - please try again later

### Regulatory_announcements_retrieved (Priority: 7)

**Given:**
- start_date is provided
- end_date is provided

**Then:**
- **fetch_record**
- **sort_data**

**Result:** List of regulatory announcements for the period

### Statement_documents_retrieved (Priority: 8)

**Given:**
- account_number is provided
- start_date is provided
- end_date is provided

**Then:**
- **fetch_record**

**Result:** List of statement documents available for download

### Infoslips_url_regenerated (Priority: 9)

**Given:**
- user is authenticated
- download_url is provided
- send_options specified (email/download)

**Then:**
- **generate_token**
- **set_field** target: `access_token` value: `generated_token`
- **emit_event** event: `document.infoslips_url_regenerated`

**Result:** New one-time download URL generated

### Document_folders_retrieved (Priority: 10)

**Given:**
- user is authenticated
- dynamics_user_id is provided

**Then:**
- **fetch_record**

**Result:** Hierarchical folder structure for user

### Document_exported (Priority: 11)

**Given:**
- user is authenticated
- document_id is provided
- export_format specified (pdf, xlsx)

**Then:**
- **fetch_record**
- **set_field** target: `document_name` value: `[title]`
- **emit_event** event: `document.exported`

**Result:** Document exported in requested format

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DOCUMENT_ACCESS_DENIED` | 401 | You do not have permission to access this document. Please verify your credentials. | No |
| `DOCUMENT_NOT_FOUND` | 404 | The requested document could not be found. It may have been deleted or moved. | No |
| `DOCUMENT_EXPIRED` | 410 | This document has expired and is no longer available. | No |
| `DOCUMENT_FILE_TOO_LARGE` | 413 | The file you are trying to upload exceeds the maximum size of 100MB. | No |
| `DOCUMENT_INVALID_FILE_TYPE` | 400 | The file type is not supported. Please upload one of: PDF, Excel, Word, Image, Text. | No |
| `DOCUMENT_UPLOAD_FAILED` | 500 | The document upload failed. Please try again later. | No |
| `DOCUMENT_PDF_GENERATION_FAILED` | 500 | Unable to generate PDF document. Please try again later. | No |
| `DOCUMENT_METADATA_UPDATE_FAILED` | 500 | Unable to update document metadata. Please try again later. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `document.uploaded` | Document uploaded to system | `document_id`, `document_name`, `created_by`, `document_size_bytes` |
| `document.downloaded` | User downloaded a document | `document_id`, `user_id`, `download_date`, `document_size_bytes` |
| `document.deleted` | Document deleted by user | `document_id`, `user_id`, `deletion_date` |
| `document.metadata_updated` | Document metadata changed | `document_id`, `fields_updated`, `user_id`, `update_date` |
| `document.generated` | Dynamic document generated from template | `document_id`, `template_id`, `created_by`, `generation_time_ms` |
| `document.exported` | Document exported to format | `document_id`, `export_format`, `user_id`, `export_date` |
| `document.infoslips_url_regenerated` | One-time statement document URL regenerated | `document_id`, `send_option`, `regeneration_date` |
| `document.generation_failed` | Document generation encountered error | `request_id`, `template_id`, `error_details`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-management | recommended | Documents linked to portfolio accounts |
| authentication | required | User authentication and access control |

## AGI Readiness

### Goals

#### Reliable Document Management

Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `authentication` | authentication | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| client_document_retrieved | `autonomous` | - | - |
| client_documents_listed | `autonomous` | - | - |
| document_uploaded | `autonomous` | - | - |
| dynamic_document_generated | `autonomous` | - | - |
| document_metadata_updated | `supervised` | - | - |
| document_deleted | `human_required` | - | - |
| regulatory_announcements_retrieved | `autonomous` | - | - |
| statement_documents_retrieved | `autonomous` | - | - |
| infoslips_url_regenerated | `autonomous` | - | - |
| document_folders_retrieved | `autonomous` | - | - |
| document_exported | `autonomous` | - | - |
| access_denied | `autonomous` | - | - |
| document_not_found | `autonomous` | - | - |
| document_expired | `autonomous` | - | - |
| file_size_exceeded | `autonomous` | - | - |
| invalid_file_type | `autonomous` | - | - |
| pdf_generation_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C#
  framework: ASP.NET Core 5+
  database: SQL Server (metadata and document information)
  storage: Document repository, local file system
  pdf_engine: PDF generation engine
source:
  repo: Reference implementation
  project: Document Management System
  entry_points:
    - Api/Controllers/DocumentController.cs
    - Framework/Entities/DocumentResult.cs
    - Framework/Entities/DocumentDataDTO.cs
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Document Management Blueprint",
  "description": "Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation. 33 fields. 17 outcomes. 8 error codes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "documents, file-management, pdf-generation, document-repository, metadata, permissions"
}
</script>
