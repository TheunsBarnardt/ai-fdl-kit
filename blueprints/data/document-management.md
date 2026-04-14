<!-- AUTO-GENERATED FROM document-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Document Management

> Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

**Category:** Data · **Version:** 1.0.0 · **Tags:** documents · file-management · pdf-generation · document-repository · metadata · permissions

## What this does

Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **document_id** *(text, required)* — Document Id
- **document_name** *(text, required)* — Document Name
- **document_type** *(text, required)* — Document Type
- **display_type** *(text, required)* — Display Type
- **document_classification** *(text, required)* — Document Classification
- **document_folder_id** *(number, required)* — Document Folder Id
- **document_folder_name** *(text, optional)* — Document Folder Name
- **document_date** *(date, required)* — Document Date
- **document_size_bytes** *(number, required)* — Document Size Bytes
- **file_extension** *(text, required)* — File Extension
- **content_type** *(text, required)* — Content Type
- **storage_location** *(text, required)* — Storage Location
- **document_url** *(url, required)* — Document Url
- **is_local** *(boolean, required)* — Is Local
- **access_token** *(text, optional)* — Access Token
- **share_with_sasfin** *(boolean, optional)* — Share With Sasfin
- **is_active** *(boolean, required)* — Is Active
- **expiry_date** *(date, optional)* — Expiry Date
- **created_by** *(text, required)* — Created By
- **created_date** *(datetime, required)* — Created Date
- **uploaded_to_crm_user_id** *(text, optional)* — Uploaded To Crm User Id
- **last_modified_by** *(text, optional)* — Last Modified By
- **last_modified_date** *(datetime, optional)* — Last Modified Date
- **account_number** *(text, optional)* — Account Number
- **dynamics_user_id** *(text, required)* — Dynamics User Id
- **aspnet_user_id** *(text, optional)* — Aspnet User Id
- **free_text_description** *(text, optional)* — Free Text Description
- **record_type** *(number, optional)* — Record Type
- **status_reason** *(text, optional)* — Status Reason
- **policy_number** *(text, optional)* — Policy Number
- **document_process_id_name** *(text, optional)* — Document Process Id Name
- **parent_document_id** *(text, optional)* — Parent Document Id
- **version_number** *(number, optional)* — Version Number

## What must be true

- **security → authentication:** All document endpoints require JWT authentication via [Authorize] decorator
- **access:** User can only view documents owned by or shared with their CRM account, Client can download their own documents and research documents, Advisors can access client's documents if CRM relationship exists, Back office can upload documents on behalf of clients, Offshore documents visible only to authorized users (office location check), Regulatory announcements are public-accessible
- **business:** Document cannot be deleted immediately; mark as inactive first, Expiry date enforcement: documents past expiry_date must show 'expired' status, One-time URLs for statement documents expire after first access, Document metadata immutable after upload except for notes/classification, File size must not exceed configured limit (typically 100MB), Share permissions cannot grant higher access than creator's own access, Deleted documents retained for audit trail (soft delete, not hard delete)
- **compliance:** All document access logged for audit trail (user, timestamp, action), Regulatory announcements must be timestamped with notification time, Infoslips URL regeneration tracked for compliance, Document retention policies enforced per document type

## Success & failure scenarios

**✅ Success paths**

- **Client Document Retrieved** — when user is authenticated; document_id is provided; document belongs to user's account, then File downloaded successfully.
- **Client Documents Listed** — when user is authenticated; dynamics_user_id is provided; optional: date_range specified, then List of documents user has access to.
- **Dynamic Document Generated** — when user is authenticated; document_request contains template_id and data; user has permission to generate documents, then PDF document generated and returned to user.
- **Document Deleted** — when user is authenticated; document_id is provided; user owns document; document is not system-protected, then Document marked as deleted (soft delete retained for audit).
- **Regulatory Announcements Retrieved** — when start_date is provided; end_date is provided, then List of regulatory announcements for the period.
- **Statement Documents Retrieved** — when account_number is provided; start_date is provided; end_date is provided, then List of statement documents available for download.
- **Infoslips Url Regenerated** — when user is authenticated; download_url is provided; send_options specified (email/download), then New one-time download URL generated.
- **Document Folders Retrieved** — when user is authenticated; dynamics_user_id is provided, then Hierarchical folder structure for user.
- **Document Exported** — when user is authenticated; document_id is provided; export_format specified (pdf, xlsx), then Document exported in requested format.

**❌ Failure paths**

- **Access Denied** — when user_id not_exists, then 401 Unauthorized - authentication required. *(error: `DOCUMENT_ACCESS_DENIED`)*
- **Document Not Found** — when document_id not_exists, then 404 Not Found - document does not exist. *(error: `DOCUMENT_NOT_FOUND`)*
- **Document Uploaded** — when user is authenticated; document_data (file content) is provided; document_name is provided; file_size <= max_allowed_size; file_extension in ["pdf","xlsx","docx","jpg","png","txt"], then Document stored and indexed, metadata recorded. *(error: `DOCUMENT_UPLOAD_FAILED`)*
- **Document Expired** — when expiry_date lt "today"; expiry_date not_exists, then Document is expired and cannot be accessed. *(error: `DOCUMENT_EXPIRED`)*
- **File Size Exceeded** — when file_size_bytes gt 104857600, then 400 Bad Request - file too large. *(error: `DOCUMENT_FILE_TOO_LARGE`)*
- **Document Metadata Updated** — when user is authenticated; document_id is provided; user owns document; fields_to_update in ["classification","free_text_description","folder_id","expiry_date"], then Document metadata updated in system. *(error: `DOCUMENT_METADATA_UPDATE_FAILED`)*
- **Invalid File Type** — when file_extension not_in ["pdf","xlsx","docx","jpg","png","txt","ppt"], then 400 Bad Request - file type not allowed. *(error: `DOCUMENT_INVALID_FILE_TYPE`)*
- **Pdf Generation Failed** — when PDF generation engine encounters error, then 500 Internal Server Error - please try again later. *(error: `DOCUMENT_PDF_GENERATION_FAILED`)*

## Errors it can return

- `DOCUMENT_ACCESS_DENIED` — You do not have permission to access this document. Please verify your credentials.
- `DOCUMENT_NOT_FOUND` — The requested document could not be found. It may have been deleted or moved.
- `DOCUMENT_EXPIRED` — This document has expired and is no longer available.
- `DOCUMENT_FILE_TOO_LARGE` — The file you are trying to upload exceeds the maximum size of 100MB.
- `DOCUMENT_INVALID_FILE_TYPE` — The file type is not supported. Please upload one of: PDF, Excel, Word, Image, Text.
- `DOCUMENT_UPLOAD_FAILED` — The document upload failed. Please try again later.
- `DOCUMENT_PDF_GENERATION_FAILED` — Unable to generate PDF document. Please try again later.
- `DOCUMENT_METADATA_UPDATE_FAILED` — Unable to update document metadata. Please try again later.

## Events

**`document.uploaded`** — Document uploaded to system
  Payload: `document_id`, `document_name`, `created_by`, `document_size_bytes`

**`document.downloaded`** — User downloaded a document
  Payload: `document_id`, `user_id`, `download_date`, `document_size_bytes`

**`document.deleted`** — Document deleted by user
  Payload: `document_id`, `user_id`, `deletion_date`

**`document.metadata_updated`** — Document metadata changed
  Payload: `document_id`, `fields_updated`, `user_id`, `update_date`

**`document.generated`** — Dynamic document generated from template
  Payload: `document_id`, `template_id`, `created_by`, `generation_time_ms`

**`document.exported`** — Document exported to format
  Payload: `document_id`, `export_format`, `user_id`, `export_date`

**`document.infoslips_url_regenerated`** — One-time statement document URL regenerated
  Payload: `document_id`, `send_option`, `regeneration_date`

**`document.generation_failed`** — Document generation encountered error
  Payload: `request_id`, `template_id`, `error_details`, `timestamp`

## Connects to

- **portfolio-management** *(recommended)* — Documents linked to portfolio accounts
- **authentication** *(required)* — User authentication and access control

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 33 fields
- `T5` **bind-orphan-errors** — bound 3 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/document-management/) · **Spec source:** [`document-management.blueprint.yaml`](./document-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
