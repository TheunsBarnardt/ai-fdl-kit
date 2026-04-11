<!-- AUTO-GENERATED FROM document-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Document Management

> Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

**Category:** Data · **Version:** 1.0.0 · **Tags:** documents · file-management · pdf-generation · document-repository · metadata · permissions

## What this does

Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **document_id** *(text, required)*
- **document_name** *(text, required)*
- **document_type** *(text, required)*
- **display_type** *(text, required)*
- **document_classification** *(text, required)*
- **document_folder_id** *(number, required)*
- **document_folder_name** *(text, optional)*
- **document_date** *(date, required)*
- **document_size_bytes** *(number, required)*
- **file_extension** *(text, required)*
- **content_type** *(text, required)*
- **storage_location** *(text, required)*
- **document_url** *(url, required)*
- **is_local** *(boolean, required)*
- **access_token** *(text, optional)*
- **share_with_sasfin** *(boolean, optional)*
- **is_active** *(boolean, required)*
- **expiry_date** *(date, optional)*
- **created_by** *(text, required)*
- **created_date** *(datetime, required)*
- **uploaded_to_crm_user_id** *(text, optional)*
- **last_modified_by** *(text, optional)*
- **last_modified_date** *(datetime, optional)*
- **account_number** *(text, optional)*
- **dynamics_user_id** *(text, required)*
- **aspnet_user_id** *(text, optional)*
- **free_text_description** *(text, optional)*
- **record_type** *(number, optional)*
- **status_reason** *(text, optional)*
- **policy_number** *(text, optional)*
- **document_process_id_name** *(text, optional)*
- **parent_document_id** *(text, optional)*
- **version_number** *(number, optional)*

## What must be true

- **security → authentication:** All document endpoints require JWT authentication via [Authorize] decorator
- **access:** User can only view documents owned by or shared with their CRM account, Client can download their own documents and research documents, Advisors can access client's documents if CRM relationship exists, Back office can upload documents on behalf of clients, Offshore documents visible only to authorized users (office location check), Regulatory announcements are public-accessible
- **business:** Document cannot be deleted immediately; mark as inactive first, Expiry date enforcement: documents past expiry_date must show 'expired' status, One-time URLs for statement documents expire after first access, Document metadata immutable after upload except for notes/classification, File size must not exceed configured limit (typically 100MB), Share permissions cannot grant higher access than creator's own access, Deleted documents retained for audit trail (soft delete, not hard delete)
- **compliance:** All document access logged for audit trail (user, timestamp, action), Regulatory announcements must be timestamped with notification time, Infoslips URL regeneration tracked for compliance, Document retention policies enforced per document type

## Success & failure scenarios

**✅ Success paths**

- **Client Document Retrieved** — when user is authenticated; document_id is provided; document belongs to user's account, then File downloaded successfully.
- **Client Documents Listed** — when user is authenticated; dynamics_user_id is provided; optional: date_range specified, then List of documents user has access to.
- **Document Uploaded** — when user is authenticated; document_data (file content) is provided; document_name is provided; file_size <= max_allowed_size; file_extension in ["pdf","xlsx","docx","jpg","png","txt"], then Document stored and indexed, metadata recorded.
- **Document Expired** — when expiry_date lt "today"; expiry_date not_exists, then Document is expired and cannot be accessed.
- **Dynamic Document Generated** — when user is authenticated; document_request contains template_id and data; user has permission to generate documents, then PDF document generated and returned to user.
- **Document Metadata Updated** — when user is authenticated; document_id is provided; user owns document; fields_to_update in ["classification","free_text_description","folder_id","expiry_date"], then Document metadata updated in system.
- **Document Deleted** — when user is authenticated; document_id is provided; user owns document; document is not system-protected, then Document marked as deleted (soft delete retained for audit).
- **Regulatory Announcements Retrieved** — when start_date is provided; end_date is provided, then List of regulatory announcements for the period.
- **Statement Documents Retrieved** — when account_number is provided; start_date is provided; end_date is provided, then List of statement documents available for download.
- **Infoslips Url Regenerated** — when user is authenticated; download_url is provided; send_options specified (email/download), then New one-time download URL generated.
- **Document Folders Retrieved** — when user is authenticated; dynamics_user_id is provided, then Hierarchical folder structure for user.
- **Document Exported** — when user is authenticated; document_id is provided; export_format specified (pdf, xlsx), then Document exported in requested format.

**❌ Failure paths**

- **Access Denied** — when user_id not_exists, then 401 Unauthorized - authentication required. *(error: `DOCUMENT_ACCESS_DENIED`)*
- **Document Not Found** — when document_id not_exists, then 404 Not Found - document does not exist. *(error: `DOCUMENT_NOT_FOUND`)*
- **File Size Exceeded** — when file_size_bytes gt 104857600, then 400 Bad Request - file too large. *(error: `DOCUMENT_FILE_TOO_LARGE`)*
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

## Connects to

- **portfolio-management** *(recommended)* — Documents linked to portfolio accounts
- **authentication** *(required)* — User authentication and access control

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/document-management/) · **Spec source:** [`document-management.blueprint.yaml`](./document-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
