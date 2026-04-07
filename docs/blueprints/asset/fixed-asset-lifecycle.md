---
title: "Fixed Asset Lifecycle Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic"
---

# Fixed Asset Lifecycle Blueprint

> Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic GL entries.


| | |
|---|---|
| **Feature** | `fixed-asset-lifecycle` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fixed-asset, depreciation, asset-movement, capitalization, finance-books, general-ledger |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/fixed-asset-lifecycle.blueprint.yaml) |
| **JSON API** | [fixed-asset-lifecycle.json]({{ site.baseurl }}/api/blueprints/asset/fixed-asset-lifecycle.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_name` | text | Yes | Asset Name |  |
| `item_code` | text | Yes | Item Code |  |
| `company` | text | Yes | Company |  |
| `purchase_date` | date | Yes | Purchase Date |  |
| `gross_purchase_amount` | number | Yes | Gross Purchase Amount | Validations: min |
| `asset_category` | text | Yes | Asset Category |  |
| `status` | select | Yes | Status |  |
| `depreciation_method` | select | No | Depreciation Method |  |
| `total_number_of_depreciations` | number | No | Total Number of Depreciations | Validations: min |
| `frequency_of_depreciation` | number | No | Frequency of Depreciation (Months) | Validations: min |
| `expected_value_after_useful_life` | number | No | Expected Value After Useful Life | Validations: min |
| `finance_books` | json | No | Finance Books |  |
| `location` | text | No | Location |  |
| `custodian` | text | No | Custodian |  |
| `department` | text | No | Department |  |
| `cost_center` | text | No | Cost Center |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `partially_depreciated` |  |  |
| `fully_depreciated` |  | Yes |
| `sold` |  | Yes |
| `scrapped` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` |  |  |
|  | `submitted` | `partially_depreciated` |  |  |
|  | `partially_depreciated` | `fully_depreciated` |  |  |
|  | `submitted` | `sold` |  |  |
|  | `submitted` | `scrapped` |  |  |
|  | `partially_depreciated` | `sold` |  |  |
|  | `partially_depreciated` | `scrapped` |  |  |
|  | `fully_depreciated` | `sold` |  |  |
|  | `fully_depreciated` | `scrapped` |  |  |

## Rules

- **depreciation_auto_calculate:**
  - **description:** Depreciation schedules are auto-calculated from the selected method, total number of depreciations, and frequency. Schedule dates and amounts are generated upon submission.

- **multiple_finance_books:**
  - **description:** Multiple finance books support parallel depreciation methods for the same asset (e.g., tax book vs company book).

- **asset_movement_tracking:**
  - **description:** Asset movements track changes in location, custodian, and department. Each movement is a separate auditable record.

- **value_adjustment_gl:**
  - **description:** Value adjustments create corresponding general ledger entries to keep accounting in sync with asset value changes.

- **sold_cannot_scrap:**
  - **description:** A sold asset cannot be scrapped. Status must not be Sold.
- **scrapped_cannot_sell:**
  - **description:** A scrapped asset cannot be sold. Status must not be Scrapped.
- **capitalization_conversion:**
  - **description:** Capitalization converts items or expenses into fixed assets, creating the asset record and corresponding GL entries.

- **depreciation_auto_post:**
  - **description:** Depreciation entries are auto-posted on the scheduled date via a background job, creating journal entries in the general ledger.


## Outcomes

### Register_asset

**Given:**
- asset_name, item_code, company, purchase_date, and gross_purchase_amount are provided
- asset_category exists and is valid

**Then:**
- **create_record** target: `asset` — Asset record created with Draft status
- **emit_event** event: `asset.registered`

**Result:** Asset registered in Draft status with depreciation schedule calculated

### Calculate_depreciation

**Given:**
- asset is in Submitted status
- depreciation_method, total_number_of_depreciations, and frequency_of_depreciation are set

**Then:**
- **set_field** target: `depreciation_schedule` — Generate depreciation schedule with dates and amounts

**Result:** Depreciation schedule calculated with entries for each period

### Post_depreciation_entry

**Given:**
- scheduled depreciation date has arrived
- asset status is Submitted or Partially Depreciated

**Then:**
- **create_record** target: `journal_entry` — Depreciation journal entry posted to general ledger
- **transition_state** field: `status` from: `submitted` to: `partially_depreciated`
- **emit_event** event: `asset.depreciated`

**Result:** Depreciation entry posted and asset value updated

### Move_asset

**Given:**
- asset exists and is not in Draft status
- new location, custodian, or department is specified

**Then:**
- **create_record** target: `asset_movement` — Movement record created tracking location/custodian change
- **set_field** target: `location` — Asset location updated to new value
- **emit_event** event: `asset.moved`

**Result:** Asset movement recorded and current assignment updated

### Adjust_value

**Given:**
- asset exists and is not Sold or Scrapped
- adjustment amount is provided

**Then:**
- **set_field** target: `asset_value` — Asset gross value adjusted
- **create_record** target: `journal_entry` — GL entry created for value adjustment
- **emit_event** event: `asset.value_adjusted`

**Result:** Asset value adjusted with corresponding GL entries

### Sell_asset — Error: `ASSET_ALREADY_SCRAPPED`

**Given:**
- asset exists and status is not Sold or Scrapped
- `status` (db) neq `Scrapped`

**Then:**
- **transition_state** field: `status` from: `current` to: `sold`
- **create_record** target: `journal_entry` — GL entries for asset disposal (sale)
- **emit_event** event: `asset.sold`

**Result:** Asset marked as Sold with disposal GL entries created

### Scrap_asset — Error: `ASSET_ALREADY_SOLD`

**Given:**
- asset exists and status is not Sold or Scrapped
- `status` (db) neq `Sold`

**Then:**
- **transition_state** field: `status` from: `current` to: `scrapped`
- **create_record** target: `journal_entry` — GL entries for asset write-off
- **emit_event** event: `asset.scrapped`

**Result:** Asset marked as Scrapped with write-off GL entries

### Capitalize_items

**Given:**
- items or expenses to capitalize are specified
- target asset category is valid

**Then:**
- **create_record** target: `asset` — New asset created from capitalized items/expenses
- **create_record** target: `journal_entry` — GL entries transferring value from expense to asset
- **emit_event** event: `asset.registered`

**Result:** Items/expenses capitalized into a new fixed asset

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ASSET_ALREADY_SOLD` | 400 | This asset has already been sold and cannot be scrapped. | No |
| `ASSET_ALREADY_SCRAPPED` | 400 | This asset has already been scrapped and cannot be sold. | No |
| `ASSET_DEPRECIATION_EXISTS` | 409 | Depreciation entries already exist for this period. Cannot recalculate. | No |
| `ASSET_INVALID_CATEGORY` | 400 | The specified asset category does not exist or is not active. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `asset.registered` | Fired when a new asset is created | `asset_name`, `item_code`, `company`, `gross_purchase_amount` |
| `asset.depreciated` | Fired when a depreciation entry is posted | `asset_name`, `depreciation_amount`, `accumulated_depreciation` |
| `asset.moved` | Fired when asset location or custodian changes | `asset_name`, `from_location`, `to_location`, `custodian` |
| `asset.sold` | Fired when an asset is sold | `asset_name`, `sale_amount`, `book_value`, `profit_loss` |
| `asset.scrapped` | Fired when an asset is scrapped | `asset_name`, `book_value` |
| `asset.value_adjusted` | Fired when asset value is manually adjusted | `asset_name`, `adjustment_amount`, `new_value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| general-ledger | required | Depreciation and disposal entries post to general ledger |
| sales-purchase-invoicing | recommended | Asset sales create sales invoices; purchases link to purchase invoices |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Asset Lifecycle Blueprint",
  "description": "Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-asset, depreciation, asset-movement, capitalization, finance-books, general-ledger"
}
</script>
