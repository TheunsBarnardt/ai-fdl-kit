<!-- AUTO-GENERATED FROM proof-of-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Proof Of Delivery Workflow

> Capture digital proof of delivery including signature, photo, and notes at delivery completion

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** fleet · pod · delivery · signature · photo · confirmation

## What this does

Capture digital proof of delivery including signature, photo, and notes at delivery completion

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **proof_id** *(text, required)* — Proof ID
- **order_uuid** *(text, required)* — Order
- **subject_uuid** *(text, optional)* — Subject (Waypoint/Entity)
- **subject_type** *(text, optional)* — Subject Type
- **file_uuid** *(text, optional)* — Photo File
- **remarks** *(rich_text, optional)* — Remarks
- **raw_data** *(rich_text, optional)* — Signature Raw Data
- **data** *(json, optional)* — Structured POD Data
- **proof_type** *(select, required)* — Proof Type
- **qr_code** *(text, optional)* — UUID or code string from a QR scan (for proof_type=qr_scan).
- **captured_at** *(datetime, optional)* — Captured At

## What must be true

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
- **qr_scan_validation:** QR scan proof validates that the scanned UUID matches the UUID of the subject (waypoint, entity, or order)
- **cloud_storage:** Signature and photo files are uploaded to cloud storage; the file URL is stored on the proof record

## Success & failure scenarios

**✅ Success paths**

- **Signature Captured** — when proof_type eq "signature"; raw_data exists, then Signature recorded and linked to order.
- **Photo Captured** — when proof_type eq "photo"; file_uuid exists, then Delivery photo saved and linked to order.
- **Notes Captured** — when proof_type eq "notes"; remarks exists, then Delivery notes recorded and linked to order.
- **Qr Scan Verified** — when proof_type eq "qr_scan"; scanned qr_code matches UUID of target subject (order, waypoint, or entity), then QR scan proof confirms driver is at the correct delivery point.

**❌ Failure paths**

- **Qr Scan Invalid** — when proof_type eq "qr_scan"; scanned qr_code does not match any valid subject UUID, then Proof rejected — driver must re-scan the correct code. *(error: `POD_QR_CODE_MISMATCH`)*
- **Pod Required Missing** — when order.pod_required is true; no proof record exists for this order, then Order completion blocked — proof of delivery required. *(error: `POD_REQUIRED_MISSING`)*
- **Invalid Photo Format** — when proof_type eq "photo"; uploaded file is not a supported image format, then Photo upload rejected — unsupported file format. *(error: `POD_INVALID_PHOTO_FORMAT`)*

## Errors it can return

- `POD_REQUIRED_MISSING` — Proof of delivery is required to complete this order.
- `POD_INVALID_PHOTO_FORMAT` — Photo must be a JPEG or PNG image.
- `POD_FILE_TOO_LARGE` — Photo file size exceeds the maximum allowed limit.
- `POD_NOT_FOUND` — Proof of delivery record not found.
- `POD_QR_CODE_MISMATCH` — The scanned code does not match the expected delivery point.

## Events

**`pod.signature_captured`** — Fired when a digital signature is captured
  Payload: `proof_id`, `order_uuid`, `captured_at`

**`pod.photo_captured`** — Fired when a delivery photo is captured
  Payload: `proof_id`, `order_uuid`, `file_uuid`, `captured_at`

**`pod.notes_captured`** — Fired when delivery notes are recorded
  Payload: `proof_id`, `order_uuid`, `captured_at`

**`pod.completed`** — Fired when all required PODs for an order have been captured
  Payload: `order_uuid`, `proof_count`

## Connects to

- **order-lifecycle** *(required)* — POD unlocks order completion when pod_required is true
- **route-planning** *(recommended)* — POD is captured at specific route waypoints
- **delivery-notifications** *(optional)* — Customer may receive POD confirmation notification
- **order-trip-state-machine** *(recommended)* — Proof gates are enforced at activity transition points in the state machine

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/proof-of-delivery-workflow/) · **Spec source:** [`proof-of-delivery-workflow.blueprint.yaml`](./proof-of-delivery-workflow.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
