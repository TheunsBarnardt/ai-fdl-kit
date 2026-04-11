---
title: "Vehicle Documents Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Store, categorise, and manage fleet vehicle documents — permits, roadworthiness certificates, registration papers, inspection reports, photos — with expiry trac"
---

# Vehicle Documents Blueprint

> Store, categorise, and manage fleet vehicle documents — permits, roadworthiness certificates, registration papers, inspection reports, photos — with expiry tracking and renewal reminders.

| | |
|---|---|
| **Feature** | `vehicle-documents` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, documents, permits, compliance, certificates, files |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-documents.blueprint.yaml) |
| **JSON API** | [vehicle-documents.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-documents.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Uploads documents, categorises them, and manages renewal actions |
| `driver` | Driver | human | May upload photos or scan documents in the field via mobile |
| `system` | System | system | Monitors expiry dates and triggers renewal reminders |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `document_type` | select | Yes | Document Type |  |
| `document_title` | text | Yes | Document Title |  |
| `document_number` | text | No | Document Reference Number |  |
| `issuing_authority` | text | No | Issuing Authority |  |
| `issue_date` | date | No | Issue Date |  |
| `expiry_date` | date | No | Expiry Date |  |
| `file_attachment` | file | Yes | File Attachment |  |
| `uploaded_by` | text | No | Uploaded By |  |
| `upload_date` | date | No | Upload Date |  |
| `notes` | text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `expiring_soon` |  |  |
| `expired` |  |  |
| `superseded` |  |  |
| `archived` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `expiring_soon` | system |  |
|  | `expiring_soon` | `active` | fleet_manager |  |
|  | `expiring_soon` | `expired` | system |  |
|  | `expired` | `active` | fleet_manager |  |
|  | `active` | `superseded` | fleet_manager |  |
|  | `any` | `archived` | fleet_manager |  |

## Rules

- **file_required:**
  - **description:** File attachment is mandatory — a document record without a file is invalid
- **expiry_after_issue:**
  - **description:** If expiry_date is provided it must be after issue_date
- **auto_supersede_on_upload:**
  - **description:** When a new document of the same type is uploaded for the same vehicle, the previous record is automatically set to superseded
- **auto_expire_daily:**
  - **description:** Documents with expiry_date less than today are automatically transitioned to expired by the daily system job
- **compliance_blocks_dispatch:**
  - **description:** Expired compliance documents (roadworthiness, operating_permit) block vehicle dispatch until replaced
- **photos_no_expiry:**
  - **description:** Photos do not require expiry dates and are not subject to renewal reminders
- **archived_readonly:**
  - **description:** Archived documents are read-only but remain retrievable for audits

## Outcomes

### Invalid_file_rejected (Priority: 1) — Error: `DOCUMENT_MISSING_FILE`

**Given:**
- file_attachment is not provided

**Result:** Document record is rejected; a file attachment is mandatory

### Document_archived (Priority: 7)

**Given:**
- fleet manager requests archival

**Then:**
- **set_field** target: `status` value: `archived`
- **emit_event** event: `vehicle_document.archived`

**Result:** Document is archived and no longer included in active document counts

### Document_expired (Priority: 8)

**Given:**
- expiry_date has passed
- status is not archived, superseded, or active with a current replacement

**Then:**
- **set_field** target: `status` value: `expired`
- **notify** — Send overdue alert to fleet manager
- **emit_event** event: `vehicle_document.expired`

**Result:** Document is marked expired; compliance-critical document types block vehicle dispatch

### Expiry_reminder_triggered (Priority: 9)

**Given:**
- expiry_date is set
- days until expiry_date is less than or equal to configured advance_notice_days
- status is active

**Then:**
- **set_field** target: `status` value: `expiring_soon`
- **notify** — Send expiry reminder to fleet manager
- **emit_event** event: `vehicle_document.expiring_soon`

**Result:** Fleet manager is notified that the document requires renewal

### Document_uploaded (Priority: 10)

**Given:**
- vehicle exists in the fleet
- document_type and document_title are provided
- file_attachment is attached
- expiry_date is after issue_date if both provided

**Then:**
- **set_field** target: `status` value: `active`
- **set_field** target: `upload_date` value: `today`
- **set_field** target: `uploaded_by` value: `current_user`
- **set_field** target: `previous_document.status` value: `superseded` — If another active document of the same type exists, mark it superseded
- **emit_event** event: `vehicle_document.uploaded`

**Result:** Document is stored and the vehicle's document register is updated; previous version is superseded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DOCUMENT_MISSING_FILE` | 422 | A file attachment is required to save a document record. | No |
| `DOCUMENT_INVALID_DATES` | 400 | Document expiry date must be after the issue date. | No |
| `DOCUMENT_EXPIRED_COMPLIANCE` | 422 | This vehicle has an expired compliance document. Renew it before dispatching the vehicle. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle_document.uploaded` | A document has been uploaded and stored against a vehicle record | `vehicle`, `document_type`, `document_number`, `expiry_date`, `upload_date` |
| `vehicle_document.expiring_soon` | A vehicle document is within the renewal reminder window | `vehicle`, `document_type`, `expiry_date`, `days_remaining` |
| `vehicle_document.expired` | A vehicle document has passed its expiry date without renewal | `vehicle`, `document_type`, `expiry_date` |
| `vehicle_document.archived` | A vehicle document has been manually archived | `vehicle`, `document_type`, `document_number`, `archived_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-registration | required | Registration certificates are the primary document type managed for each vehicle |
| vehicle-renewal-reminders | recommended | Document expiry dates feed the centralised renewal reminder system |
| vehicle-insurance | recommended | Insurance certificates are stored as documents in the vehicle document register |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 2
  entry_points:
    - erpnext/assets/doctype/asset_maintenance_log/asset_maintenance_log.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Documents Blueprint",
  "description": "Store, categorise, and manage fleet vehicle documents — permits, roadworthiness certificates, registration papers, inspection reports, photos — with expiry trac",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, documents, permits, compliance, certificates, files"
}
</script>
