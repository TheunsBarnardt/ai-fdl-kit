<!-- AUTO-GENERATED FROM tyre-lifecycle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Tyre Lifecycle

> Track tyre fitment, rotation, tread depth assessments, and replacement across the fleet with a per-position history and automated low-tread warnings.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** fleet · vehicle · tyre · lifecycle · maintenance · safety

## What this does

Track tyre fitment, rotation, tread depth assessments, and replacement across the fleet with a per-position history and automated low-tread warnings.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **vehicle** *(text, required)* — Vehicle
- **tyre_position** *(select, required)* — Tyre Position
- **brand** *(text, optional)* — Brand
- **model** *(text, optional)* — Model / Pattern
- **size** *(text, optional)* — Size
- **serial_number** *(text, optional)* — Serial Number / DOT Code
- **manufacture_year** *(number, optional)* — Manufacture Year
- **fitted_date** *(date, required)* — Fitted Date
- **fitted_odometer** *(number, optional)* — Odometer at Fitment (km)
- **removed_date** *(date, optional)* — Removed Date
- **removed_odometer** *(number, optional)* — Odometer at Removal (km)
- **km_on_tyre** *(number, optional)* — km on Tyre
- **last_tread_depth_mm** *(number, optional)* — Last Tread Depth (mm)
- **last_inspection_date** *(date, optional)* — Last Inspection Date
- **condition_rating** *(select, optional)* — Condition Rating
- **reason_for_removal** *(select, optional)* — Reason for Removal
- **status** *(select, required)* — Status

## What must be true

- **one_tyre_per_position:** A vehicle position can have at most one tyre in fitted or inspection_due status at a time
- **removal_odometer_progression:** Removed tyre odometer must be >= fitted odometer
- **km_on_tyre_computation:** km_on_tyre is computed as removed_odometer minus fitted_odometer when removed
- **legal_minimum_tread:** A tyre with tread depth below the legal minimum (typically 1.6 mm) must not remain in fitted status
- **warning_threshold:** A warning is triggered when tread depth falls below a configurable warning threshold (e.g., 3 mm)
- **age_based_replacement:** Tyres older than a configurable maximum age (e.g., 5 years from manufacture year) should be flagged for replacement regardless of tread depth
- **inspection_requires_date:** Tread depth measurements must be recorded with a measurement date

## Success & failure scenarios

**✅ Success paths**

- **Tyre Disposed** — when status is removed; disposal decision confirmed by fleet manager, then Tyre is permanently closed out; lifecycle record retained for reporting.
- **Tyre Removed** — when status is fitted or inspection_due; removed_date is provided; reason_for_removal is provided, then Tyre removal is recorded with distance travelled; position is freed for a new tyre.
- **Low Tread Warning** — when status is fitted or inspection_due; Tread depth at or below warning threshold, then Fleet manager is notified that the tyre is approaching the minimum legal tread depth.
- **Tyre Inspected** — when status is fitted or inspection_due; last_tread_depth_mm is provided; last_inspection_date is provided, then Inspection result is recorded; status transitions if depth is below threshold.
- **Tyre Fitted** — when vehicle and position are valid; no other tyre is currently fitted at the same position; fitted_date is not in the future, then Tyre is recorded as fitted to the vehicle at the specified position.

**❌ Failure paths**

- **Position Conflict Rejected** — when another tyre is already fitted at the same vehicle position, then Fitment is rejected until the existing tyre is removed from that position. *(error: `TYRE_POSITION_CONFLICT`)*

## Errors it can return

- `TYRE_POSITION_CONFLICT` — Another tyre is already fitted at this position. Please remove the existing tyre first.
- `TYRE_INVALID_ODOMETER` — Removal odometer cannot be less than the odometer at fitment.

## Events

**`tyre.fitted`** — A tyre has been mounted on a vehicle at a specific position
  Payload: `vehicle`, `tyre_position`, `brand`, `model`, `size`, `serial_number`, `fitted_date`, `fitted_odometer`

**`tyre.inspected`** — A tread depth measurement has been recorded for a fitted tyre
  Payload: `vehicle`, `tyre_position`, `last_tread_depth_mm`, `condition_rating`, `last_inspection_date`

**`tyre.low_tread_warning`** — A tyre's tread depth is at or below the configured warning threshold
  Payload: `vehicle`, `tyre_position`, `last_tread_depth_mm`, `warning_threshold_mm`

**`tyre.removed`** — A tyre has been dismounted from a vehicle position
  Payload: `vehicle`, `tyre_position`, `reason_for_removal`, `km_on_tyre`, `removed_date`

**`tyre.disposed`** — A removed tyre has been permanently scrapped or recycled
  Payload: `vehicle`, `tyre_position`, `serial_number`, `km_on_tyre`

## Connects to

- **vehicle-master-data** *(required)* — Vehicle master provides current odometer for km-on-tyre calculations
- **odometer-tracking** *(recommended)* — Validated odometer readings feed into km-on-tyre calculations and age-based alerts
- **vehicle-maintenance-log** *(recommended)* — Tyre changes are typically recorded as service events in the maintenance log

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/tyre-lifecycle/) · **Spec source:** [`tyre-lifecycle.blueprint.yaml`](./tyre-lifecycle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
