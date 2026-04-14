<!-- AUTO-GENERATED FROM vehicle-master-data.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Vehicle Master Data

> Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.

**Category:** Asset · **Version:** 1.0.0 · **Tags:** fleet · vehicle · master-data · specifications · vin

## What this does

Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **license_plate** *(text, required)* — License Plate
- **make** *(text, required)* — Make
- **manufacturer** *(text, optional)* — Manufacturer
- **model** *(text, required)* — Model
- **year** *(number, optional)* — Year of Manufacture
- **vin** *(text, optional)* — VIN (Chassis Number)
- **fuel_type** *(select, required)* — Fuel Type
- **fuel_uom** *(text, required)* — Fuel Unit of Measure
- **color** *(text, optional)* — Color
- **doors** *(number, optional)* — Number of Doors
- **wheels** *(number, optional)* — Number of Wheels
- **seating_capacity** *(number, optional)* — Seating Capacity
- **gross_vehicle_weight** *(number, optional)* — Gross Vehicle Weight (kg)
- **acquisition_date** *(date, optional)* — Acquisition Date
- **acquisition_cost** *(number, optional)* — Acquisition Cost
- **last_odometer** *(number, optional)* — Last Known Odometer (km)
- **current_location** *(text, optional)* — Current Location
- **assigned_driver** *(text, optional)* — Assigned Driver
- **fleet_category** *(select, optional)* — Fleet Category
- **carbon_check_date** *(date, optional)* — Last Emissions Test Date

## What must be true

- **unique_license_plate:** License plate must be unique across all vehicles
- **unique_vin:** VIN must be unique if provided; standard VINs are 17 alphanumeric characters
- **year_not_future:** Year of manufacture must not be in the future
- **acquisition_date_not_future:** Acquisition date must not be in the future
- **odometer_non_negative:** Last odometer value must be a non-negative integer
- **carbon_check_not_future:** Carbon check date must not be a future date
- **fuel_fields_required:** Fuel type and fuel unit of measure are required for accurate fuel efficiency calculations
- **acquisition_cost_positive:** Acquisition cost must be positive if provided — it is the base value for depreciation

## Success & failure scenarios

**✅ Success paths**

- **Odometer Updated** — when new odometer value is provided; New reading is at least equal to the last recorded reading, then Last known odometer is updated on the vehicle record.
- **Vehicle Record Updated** — when vehicle record exists; changed fields pass all validation rules, then Vehicle specification is updated and the change is auditable.
- **Vehicle Record Created** — when license plate is unique; make, model, and fuel type are provided; year is not in the future if provided; VIN is unique if provided, then Vehicle specification record is saved and available for fleet operations.

**❌ Failure paths**

- **Duplicate Vin Rejected** — when VIN is provided; another vehicle record already uses the same VIN, then Record creation is blocked and the user is notified of the duplicate VIN. *(error: `VEHICLE_DUPLICATE_VIN`)*
- **Invalid Year Rejected** — when year of manufacture is provided; Year is in the future, then Validation fails and the user is prompted to correct the year. *(error: `VEHICLE_INVALID_YEAR`)*

## Errors it can return

- `VEHICLE_DUPLICATE_VIN` — A vehicle with this VIN already exists in the system.
- `VEHICLE_INVALID_YEAR` — Year of manufacture cannot be in the future.
- `VEHICLE_DUPLICATE_PLATE` — A vehicle with this license plate already exists.

## Events

**`vehicle.master_record_created`** — A new vehicle specification record has been added to the fleet
  Payload: `license_plate`, `make`, `model`, `year`, `vin`, `fuel_type`

**`vehicle.master_record_updated`** — One or more specification fields on a vehicle record were changed
  Payload: `license_plate`, `changed_fields`

**`vehicle.odometer_updated`** — The last known odometer reading on the vehicle record was updated
  Payload: `license_plate`, `previous_odometer`, `new_odometer`

## Connects to

- **vehicle-registration** *(required)* — Legal registration details complement the physical specification record
- **odometer-tracking** *(recommended)* — Detailed odometer history is maintained in the dedicated tracking feature
- **fuel-log** *(recommended)* — Fuel entries update the last_odometer field on the master record
- **vehicle-depreciation** *(recommended)* — Acquisition cost and date from master data seed the depreciation calculation

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/asset/vehicle-master-data/) · **Spec source:** [`vehicle-master-data.blueprint.yaml`](./vehicle-master-data.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
