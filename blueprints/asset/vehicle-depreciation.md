<!-- AUTO-GENERATED FROM vehicle-depreciation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Vehicle Depreciation

> Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per finance book.

**Category:** Asset · **Version:** 1.0.0 · **Tags:** fleet · vehicle · depreciation · finance · accounting · book-value

## What this does

Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per finance book.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **vehicle** *(text, required)* — Vehicle
- **acquisition_cost** *(number, required)* — Acquisition Cost
- **additional_costs** *(number, optional)* — Additional Capitalised Costs
- **salvage_value** *(number, required)* — Salvage / Residual Value
- **useful_life_years** *(number, required)* — Useful Life (years)
- **depreciation_method** *(select, required)* — Depreciation Method
- **depreciation_frequency_months** *(number, required)* — Depreciation Frequency (months)
- **depreciation_start_date** *(date, required)* — Depreciation Start Date
- **opening_accumulated_depreciation** *(number, optional)* — Opening Accumulated Depreciation
- **current_book_value** *(number, optional)* — Current Book Value
- **accumulated_depreciation** *(number, optional)* — Accumulated Depreciation
- **rate_of_depreciation** *(number, optional)* — Depreciation Rate (%)
- **daily_prorata** *(boolean, optional)* — Daily Pro-Rata
- **is_fully_depreciated** *(boolean, optional)* — Fully Depreciated
- **status** *(select, required)* — Status

## What must be true

- **salvage_less_than_cost:** Salvage value must be less than acquisition cost
- **useful_life_positive:** Useful life in years must be a positive number greater than zero
- **start_date_after_acquisition:** Depreciation start date must not precede the acquisition date
- **book_value_floor:** Book value cannot fall below salvage value — depreciation stops when book value equals salvage value
- **straight_line_formula:** Straight Line: periodic amount = (acquisition_cost - salvage_value) / total_periods
- **wdv_formula:** Written Down Value: periodic amount = current_book_value × (rate_of_depreciation / periods_per_year)
- **ddb_formula:** Double Declining Balance: rate = 2 / useful_life_years; amount = current_book_value × rate; floor at salvage value
- **manual_method:** Manual method: amounts are entered directly per period by the finance manager
- **capitalised_repair_recalculation:** When a repair capitalises additional cost, the depreciation base increases and the schedule is recalculated
- **disposal_reversal:** Depreciation postings for periods beyond the disposal date are reversed on disposal
- **opening_depreciation_reduction:** Opening accumulated depreciation reduces the net depreciable amount

## Success & failure scenarios

**✅ Success paths**

- **Schedule Recalculated After Repair** — when a capitalised repair has increased the vehicle's asset base; repair increases useful life (months extension provided), then Depreciation schedule is recalculated from the current book value over the revised remaining life.
- **Disposal Entries Posted** — when vehicle is being disposed of (sold or scrapped); disposal date and method are provided, then Final disposal accounting entries are posted; gain or loss on disposal is computed.
- **Fully Depreciated** — when current_book_value equals or is less than salvage_value after the latest posting, then Vehicle is flagged as fully depreciated; no further periodic postings are made.
- **Depreciation Posted** — when status is active or partially_depreciated; current period posting date has been reached; current_book_value is greater than salvage_value, then Periodic depreciation amount is posted and book value is updated.
- **Schedule Generated** — when vehicle exists in the fleet; acquisition_cost, salvage_value, useful_life_years, and depreciation_method are provided; depreciation_start_date is valid; Salvage value is less than acquisition cost, then A full depreciation schedule is generated showing the amount and date for each posting period.

**❌ Failure paths**

- **Invalid Salvage Value** — when Salvage value is equal to or greater than acquisition cost, then Schedule generation is rejected; user must provide a salvage value less than acquisition cost. *(error: `DEPRECIATION_INVALID_SALVAGE`)*

## Errors it can return

- `DEPRECIATION_INVALID_SALVAGE` — Salvage value must be less than the acquisition cost.
- `DEPRECIATION_INVALID_START_DATE` — Depreciation start date cannot be before the vehicle's acquisition date.

## Events

**`depreciation.schedule_generated`** — A full depreciation schedule has been computed for a vehicle
  Payload: `vehicle`, `depreciation_method`, `total_periods`, `period_amount`, `depreciation_start_date`

**`depreciation.period_posted`** — A periodic depreciation amount has been posted for a vehicle
  Payload: `vehicle`, `posting_date`, `period_amount`, `accumulated_depreciation`, `current_book_value`

**`depreciation.fully_depreciated`** — A vehicle's book value has reached its salvage value
  Payload: `vehicle`, `depreciation_date`, `salvage_value`, `total_depreciation_posted`

**`depreciation.disposal_posted`** — Final accounting entries for vehicle disposal have been posted
  Payload: `vehicle`, `disposal_date`, `current_book_value`, `disposal_proceeds`, `gain_or_loss`

**`depreciation.schedule_recalculated`** — The depreciation schedule was revised following a capitalised repair or useful-life extension
  Payload: `vehicle`, `new_book_value`, `new_total_periods`, `capitalised_repair_amount`

## Connects to

- **vehicle-master-data** *(required)* — Acquisition cost and date from the vehicle master seed the depreciation calculation
- **vehicle-disposal** *(required)* — Disposal workflow triggers the final depreciation entries and gain/loss calculation
- **vehicle-expense-tracking** *(recommended)* — Periodic depreciation amounts can be posted as expense records for management reporting
- **vehicle-maintenance-log** *(optional)* — Capitalised repairs from the maintenance log can increase the depreciable base and trigger schedule recalculation

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/asset/vehicle-depreciation/) · **Spec source:** [`vehicle-depreciation.blueprint.yaml`](./vehicle-depreciation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
