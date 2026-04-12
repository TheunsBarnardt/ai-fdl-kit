---
title: "Proof Of Delivery Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Capture proof of pickup or drop-off for an order or specific waypoint/entity, supporting digital signature, photo upload, and QR code scan as verification metho"
---

# Proof Of Delivery Blueprint

> Capture proof of pickup or drop-off for an order or specific waypoint/entity, supporting digital signature, photo upload, and QR code scan as verification methods.

| | |
|---|---|
| **Feature** | `proof-of-delivery` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | proof, signature, photo, qr-code, delivery-confirmation, pod |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/proof-of-delivery.blueprint.yaml) |
| **JSON API** | [proof-of-delivery.json]({{ site.baseurl }}/api/blueprints/data/proof-of-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Captures proof at the point of pickup or delivery via the driver app. |
| `platform` | Platform | system | Validates and stores proof records; gates order completion when pod_required is true. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | The order this proof is associated with. |  |
| `subject_id` | text | No | Optional waypoint or entity identifier this proof is for (omit for order-level proof). |  |
| `pod_method` | select | Yes | Type of proof being captured. |  |
| `signature_data` | text | No | Base64-encoded signature image (for pod_method=signature). |  |
| `photo_file` | file | No | Photo file uploaded as proof (for pod_method=photo). |  |
| `qr_code` | text | No | UUID or code string from the QR scan (for pod_method=qr_scan). |  |
| `remarks` | text | No | Optional driver comments about the proof capture. |  |
| `raw_data` | json | No | Raw input data accompanying the proof (e.g., scan metadata). |  |
| `data` | json | No | Structured proof data, used for QR scan content or additional metadata. |  |
| `file_url` | url | No | URL of the uploaded signature or photo file in cloud storage. |  |
| `proof_id` | text | No | Public identifier of the created proof record. |  |

## Rules

- **rule_01:** Proof is only required when pod_required is set to true on the order.
- **rule_02:** If pod_required is true, the order completion activity is blocked until proof is captured.
- **rule_03:** A proof record can be captured at the order level or for a specific waypoint or entity within the order.
- **rule_04:** Signature capture uploads the signature as a file to cloud storage; the file URL is stored on the proof record.
- **rule_05:** QR scan proof validates that the scanned UUID matches the UUID of the subject (waypoint, entity, or order).
- **rule_06:** Photo proof stores the uploaded file URL in cloud storage.
- **rule_07:** Multiple proof records can exist for a single order (e.g., one per waypoint in a multi-stop trip).
- **rule_08:** Proof records are immutable once created.

## Outcomes

### Signature_captured (Priority: 1)

**Given:**
- driver submits a base64-encoded signature image
- valid order_id is provided

**Then:**
- **create_record** — Signature image is stored in cloud storage and a file record is created.
- **create_record** — Proof record is created linking the order, subject, and stored signature file.

**Result:** Signature proof is stored and linked to the order or waypoint. Order can now proceed to completion.

### Photo_captured (Priority: 2)

**Given:**
- driver uploads a photo file
- valid order_id is provided

**Then:**
- **create_record** — Photo is uploaded to cloud storage.
- **create_record** — Proof record is created linking the order and stored photo.

**Result:** Photo proof is stored and linked to the order.

### Qr_scan_verified (Priority: 3)

**Given:**
- driver scans a QR code
- scanned code matches the UUID of the target subject (order, waypoint, or entity)

**Then:**
- **create_record** — Verification proof is created with remarks indicating QR verification.

**Result:** QR scan proof confirms the driver is at the correct delivery point.

### Qr_scan_invalid (Priority: 4) — Error: `QR_CODE_MISMATCH`

**Given:**
- scanned QR code does not match any valid subject UUID

**Result:** Proof is rejected; driver must re-scan the correct code.

### Proof_required_gate_blocked (Priority: 5) — Error: `PROOF_REQUIRED`

**Given:**
- driver attempts to complete or advance order
- pod_required is true
- no proof record exists for the order or required waypoint

**Result:** Activity transition is blocked until valid proof is submitted.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QR_CODE_MISMATCH` | 400 | Unable to capture QR code: the scanned code does not match the expected subject. | No |
| `PROOF_REQUIRED` | 400 | Proof of delivery is required before this step can be completed. | No |
| `SIGNATURE_DATA_MISSING` | 400 | Signature data is required for signature proof capture. | No |
| `ORDER_NOT_FOUND` | 404 | Order not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.proof_captured` | Fired when a proof record is successfully created for an order or waypoint. | `order_id`, `proof_id`, `pod_method`, `subject_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-trip-state-machine | required | Proof gates are enforced at activity transition points in the state machine. |
| ride-request-lifecycle | recommended | pod_required flag on the order determines whether proof is needed. |
| driver-app-flow | required | Driver app submits proof via the capture-signature or capture-qr endpoints. |

## AGI Readiness

### Goals

#### Reliable Proof Of Delivery

Capture proof of pickup or drop-off for an order or specific waypoint/entity, supporting digital signature, photo upload, and QR code scan as verification methods.

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

- before making irreversible changes

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
| `order_trip_state_machine` | order-trip-state-machine | degrade |
| `driver_app_flow` | driver-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| signature_captured | `autonomous` | - | - |
| photo_captured | `autonomous` | - | - |
| qr_scan_verified | `autonomous` | - | - |
| qr_scan_invalid | `autonomous` | - | - |
| proof_required_gate_blocked | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 4
  entry_points:
    - src/Models/Proof.php
    - src/Models/Order.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/routes.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Proof Of Delivery Blueprint",
  "description": "Capture proof of pickup or drop-off for an order or specific waypoint/entity, supporting digital signature, photo upload, and QR code scan as verification metho",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "proof, signature, photo, qr-code, delivery-confirmation, pod"
}
</script>
