<!-- AUTO-GENERATED FROM fixed-asset-lifecycle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fixed Asset Lifecycle

> Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic GL entries.

**Category:** Asset · **Version:** 1.0.0 · **Tags:** fixed-asset · depreciation · asset-movement · capitalization · finance-books · general-ledger

## What this does

Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic GL entries.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **asset_name** *(text, required)* — Asset Name
- **item_code** *(text, required)* — Item Code
- **company** *(text, required)* — Company
- **purchase_date** *(date, required)* — Purchase Date
- **gross_purchase_amount** *(number, required)* — Gross Purchase Amount
- **asset_category** *(text, required)* — Asset Category
- **status** *(select, required)* — Status
- **depreciation_method** *(select, optional)* — Depreciation Method
- **total_number_of_depreciations** *(number, optional)* — Total Number of Depreciations
- **frequency_of_depreciation** *(number, optional)* — Frequency of Depreciation (Months)
- **expected_value_after_useful_life** *(number, optional)* — Expected Value After Useful Life
- **finance_books** *(json, optional)* — Finance Books
- **location** *(text, optional)* — Location
- **custodian** *(text, optional)* — Custodian
- **department** *(text, optional)* — Department
- **cost_center** *(text, optional)* — Cost Center

## What must be true

- **depreciation_auto_calculate:** Depreciation schedules are auto-calculated from the selected method, total number of depreciations, and frequency. Schedule dates and amounts are generated upon submission.
- **multiple_finance_books:** Multiple finance books support parallel depreciation methods for the same asset (e.g., tax book vs company book).
- **asset_movement_tracking:** Asset movements track changes in location, custodian, and department. Each movement is a separate auditable record.
- **value_adjustment_gl:** Value adjustments create corresponding general ledger entries to keep accounting in sync with asset value changes.
- **sold_cannot_scrap:** A sold asset cannot be scrapped. Status must not be Sold.
- **scrapped_cannot_sell:** A scrapped asset cannot be sold. Status must not be Scrapped.
- **capitalization_conversion:** Capitalization converts items or expenses into fixed assets, creating the asset record and corresponding GL entries.
- **depreciation_auto_post:** Depreciation entries are auto-posted on the scheduled date via a background job, creating journal entries in the general ledger.

## Success & failure scenarios

**✅ Success paths**

- **Register Asset** — when asset_name, item_code, company, purchase_date, and gross_purchase_amount are provided; asset_category exists and is valid, then Asset registered in Draft status with depreciation schedule calculated.
- **Calculate Depreciation** — when asset is in Submitted status; depreciation_method, total_number_of_depreciations, and frequency_of_depreciation are set, then Depreciation schedule calculated with entries for each period.
- **Post Depreciation Entry** — when scheduled depreciation date has arrived; asset status is Submitted or Partially Depreciated, then Depreciation entry posted and asset value updated.
- **Move Asset** — when asset exists and is not in Draft status; new location, custodian, or department is specified, then Asset movement recorded and current assignment updated.
- **Adjust Value** — when asset exists and is not Sold or Scrapped; adjustment amount is provided, then Asset value adjusted with corresponding GL entries.
- **Capitalize Items** — when items or expenses to capitalize are specified; target asset category is valid, then Items/expenses capitalized into a new fixed asset.

**❌ Failure paths**

- **Sell Asset** — when asset exists and status is not Sold or Scrapped; status neq "Scrapped", then Asset marked as Sold with disposal GL entries created. *(error: `ASSET_ALREADY_SCRAPPED`)*
- **Scrap Asset** — when asset exists and status is not Sold or Scrapped; status neq "Sold", then Asset marked as Scrapped with write-off GL entries. *(error: `ASSET_ALREADY_SOLD`)*

## Errors it can return

- `ASSET_ALREADY_SOLD` — This asset has already been sold and cannot be scrapped.
- `ASSET_ALREADY_SCRAPPED` — This asset has already been scrapped and cannot be sold.
- `ASSET_DEPRECIATION_EXISTS` — Depreciation entries already exist for this period. Cannot recalculate.
- `ASSET_INVALID_CATEGORY` — The specified asset category does not exist or is not active.

## Connects to

- **general-ledger** *(required)* — Depreciation and disposal entries post to general ledger
- **sales-purchase-invoicing** *(recommended)* — Asset sales create sales invoices; purchases link to purchase invoices

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (70 → 74)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T4` **sequential-priority** — added priority to 8 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/asset/fixed-asset-lifecycle/) · **Spec source:** [`fixed-asset-lifecycle.blueprint.yaml`](./fixed-asset-lifecycle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
