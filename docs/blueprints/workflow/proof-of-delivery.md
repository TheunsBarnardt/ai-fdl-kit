---
title: "Proof Of Delivery Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Capture digital proof of delivery including signature, photo, and notes at delivery completion. 10 fields. 5 outcomes. 4 error codes. rules: pod_required_to_com"
---

# Proof Of Delivery Blueprint

> Capture digital proof of delivery including signature, photo, and notes at delivery completion

| | |
|---|---|
| **Feature** | `proof-of-delivery` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, pod, delivery, signature, photo, confirmation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/proof-of-delivery.blueprint.yaml) |
| **JSON API** | [proof-of-delivery.json]({{ site.baseurl }}/api/blueprints/workflow/proof-of-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Driver capturing delivery proof at the recipient location |
| `recipient` | Recipient | external | Customer or recipient providing signature |
| `system` | System | system | POD validation and storage |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `proof_id` | text | Yes | Proof ID |  |
| `order_uuid` | text | Yes | Order |  |
| `subject_uuid` | text | No | Subject (Waypoint/Entity) |  |
| `subject_type` | text | No | Subject Type |  |
| `file_uuid` | text | No | Photo File |  |
| `remarks` | rich_text | No | Remarks |  |
| `raw_data` | rich_text | No | Signature Raw Data |  |
| `data` | json | No | Structured POD Data |  |
| `proof_type` | select | Yes | Proof Type |  |
| `captured_at` | datetime | No | Captured At |  |

## Rules

- **pod_required_to_complete:** Proof of delivery is required to complete an order where pod_required is true
- **at_least_one_method:** At least one proof method (signature, photo, or notes) must be captured per delivery
- **signature_storage:** Signature is captured as raw vector or bitmap data and stored securely
- **photo_format:** Photos must be a supported image format (JPEG, PNG) and within the configured size limit
- **linked_to_order:** POD is linked to the order and optionally to a specific waypoint or entity
- **gps_evidence:** Captured GPS coordinates are stored with each POD record as evidence of location
- **immutable:** POD records are immutable once saved; tampering is prevented by audit logging
- **retention:** POD is retained for the organization's configured retention period for legal compliance
- **multiple_per_order:** Multiple proof records can exist per order (one per waypoint or entity)
- **failed_photo_fallback:** Failed photo uploads must not block completion if notes or signature was captured

## Outcomes

### Signature_captured (Priority: 1)

**Given:**
- `proof_type` (input) eq `signature`
- `raw_data` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `pod.signature_captured`

**Result:** Signature recorded and linked to order

### Pod_required_missing (Priority: 1) — Error: `POD_REQUIRED_MISSING`

**Given:**
- order.pod_required is true
- no proof record exists for this order

**Result:** Order completion blocked — proof of delivery required

### Photo_captured (Priority: 2)

**Given:**
- `proof_type` (input) eq `photo`
- `file_uuid` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `pod.photo_captured`

**Result:** Delivery photo saved and linked to order

### Invalid_photo_format (Priority: 2) — Error: `POD_INVALID_PHOTO_FORMAT`

**Given:**
- `proof_type` (input) eq `photo`
- uploaded file is not a supported image format

**Result:** Photo upload rejected — unsupported file format

### Notes_captured (Priority: 3)

**Given:**
- `proof_type` (input) eq `notes`
- `remarks` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `pod.notes_captured`

**Result:** Delivery notes recorded and linked to order

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POD_REQUIRED_MISSING` | 422 | Proof of delivery is required to complete this order. | No |
| `POD_INVALID_PHOTO_FORMAT` | 422 | Photo must be a JPEG or PNG image. | No |
| `POD_FILE_TOO_LARGE` | 413 | Photo file size exceeds the maximum allowed limit. | No |
| `POD_NOT_FOUND` | 404 | Proof of delivery record not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pod.signature_captured` | Fired when a digital signature is captured | `proof_id`, `order_uuid`, `captured_at` |
| `pod.photo_captured` | Fired when a delivery photo is captured | `proof_id`, `order_uuid`, `file_uuid`, `captured_at` |
| `pod.notes_captured` | Fired when delivery notes are recorded | `proof_id`, `order_uuid`, `captured_at` |
| `pod.completed` | Fired when all required PODs for an order have been captured | `order_uuid`, `proof_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | POD unlocks order completion when pod_required is true |
| route-planning | recommended | POD is captured at specific route waypoints |
| delivery-notifications | optional | Customer may receive POD confirmation notification |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Proof Of Delivery Blueprint",
  "description": "Capture digital proof of delivery including signature, photo, and notes at delivery completion. 10 fields. 5 outcomes. 4 error codes. rules: pod_required_to_com",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, pod, delivery, signature, photo, confirmation"
}
</script>
