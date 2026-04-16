---
title: "Broker Back Office Dissemination Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, "
---

# Broker Back Office Dissemination Blueprint

> Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

| | |
|---|---|
| **Feature** | `broker-back-office-dissemination` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, dissemination, fixed-width, card-codes, accounts, deals, scrip, gl, sbl, elective-events, corporate-actions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-back-office-dissemination.blueprint.yaml) |
| **JSON API** | [broker-back-office-dissemination.json]({{ site.baseurl }}/api/blueprints/trading/broker-back-office-dissemination.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external | Equity member firm that schedules and consumes dissemination data |
| `service_provider` | Service Provider | external | Third party authorized by broker to receive disseminated data |
| `back_office_system` | Back Office System | system | Central equity back-office administration platform |
| `broker_user` | Broker User | human | Firm user who schedules downloads via online request process function |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes | Card Code |  |
| `layout_number` | text | Yes | Layout Number |  |
| `broker_code` | text | Yes | Broker Code |  |
| `dissemination_date` | date | Yes | Dissemination Date |  |
| `record_count` | number | No | Record Count |  |
| `account_number` | text | Yes | Account Number |  |
| `account_name` | text | Yes | Account Name |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `portfolio_indicator` | select | No | Portfolio Indicator |  |
| `date_deactivated` | date | No | Date Deactivated |  |
| `dividend_advice_note_indicator` | select | No | Dividend Advice Note Indicator |  |
| `it3b_exclusion` | select | No | It3b Exclusion |  |
| `it3c_exclusion` | select | No | It3c Exclusion |  |
| `fatca_status` | text | No | Fatca Status |  |
| `ret_exempt_code` | text | No | Ret Exempt Code |  |
| `wti_exempt_code` | text | No | Wti Exempt Code |  |
| `undocumented_reason_code` | text | No | Undocumented Reason Code |  |
| `general_compliance_reason_code` | text | No | General Compliance Reason Code |  |
| `tax_identification_type_code` | text | No | Tax Identification Type Code |  |
| `balance_amount` | number | No | Balance Amount |  |
| `available_balance` | number | No | Available Balance |  |
| `gl_account_code` | text | No | Gl Account Code |  |
| `gl_balance` | number | No | Gl Balance |  |
| `gl_designation_code` | text | No | Gl Designation Code |  |
| `transaction_reference` | text | No | Transaction Reference |  |
| `transaction_date` | date | No | Transaction Date |  |
| `transaction_amount` | number | No | Transaction Amount |  |
| `transaction_origin_user` | text | No | Transaction Origin User |  |
| `reason_code` | text | No | Reason Code |  |
| `time_stamp` | datetime | No | Time Stamp |  |
| `instrument_code` | text | No | Instrument Code |  |
| `isin` | text | No | Isin |  |
| `quantity` | number | No | Quantity |  |
| `portfolio_cost` | number | No | Portfolio Cost |  |
| `charge_structure_code` | text | No | Charge Structure Code |  |
| `instrument_name` | text | No | Instrument Name |  |
| `icb_sector_code` | text | No | Icb Sector Code |  |
| `instrument_type` | text | No | Instrument Type |  |
| `bee_instrument_code` | text | No | Bee Instrument Code |  |
| `bee_effective_date` | date | No | Bee Effective Date |  |
| `slb_trade_date` | date | No | Slb Trade Date |  |
| `slb_loan_reference` | text | No | Slb Loan Reference |  |
| `collateral_reference` | text | No | Collateral Reference |  |
| `freed_indicator` | select | No | Freed Indicator |  |
| `dividend_declaration_date` | date | No | Dividend Declaration Date |  |
| `ex_dividend_date` | date | No | Ex Dividend Date |  |
| `dividend_amount` | number | No | Dividend Amount |  |
| `withholding_tax_amount` | number | No | Withholding Tax Amount |  |
| `communication_by_issuer` | text | No | Communication By Issuer |  |
| `event_reference` | text | No | Event Reference |  |
| `event_type_code` | text | No | Event Type Code |  |
| `event_effective_date` | date | No | Event Effective Date |  |

## Rules

- **scheduling:** MUST: Allow broker users to schedule dissemination via online request process function, MUST: Support multiple scheduled requests per day per broker, MUST: Allow filtering by branch code, partner code, portfolio indicator, and FATCA flags, MUST: Support download of full daily data set or changes-only (delta) mode depending on data type
- **grouping:** MUST: Group related data into distinct Card Codes to isolate business domains, MUST: Allocate General Ledger data to separate dataset from other disseminated data, MUST: Allow end users to select which card codes to download per dataset
- **format:** MUST: Use fixed-width card code record format, MUST: Start every dissemination file with Header record (Card Code 000), MUST: End every dissemination file with Trailer record (Card Code 999), MUST: Include layout version number in each record
- **access_control:** MUST: Verify user has relevant access before scheduling dissemination, MUST: Allow dissemination to member firms and authorized service providers
- **frozen_file:** MUST: Support frozen elective event file download via online request process, MUST: Require email address setup before frozen file access, MUST: Provide Header (000), Event Detail (071), Account Detail (072), and Trailer (999) records in frozen file

## Outcomes

### Schedule_dissemination_request (Priority: 1) — Error: `DISSEM_INVALID_SCHEDULE`

_Broker user schedules a dissemination request via online function_

**Given:**
- `user_has_access` (db) eq `true`
- `schedule_parameters` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `broker_dissem.schedule.created`

### Generate_eod_dissemination_file (Priority: 2) — Error: `DISSEM_FROZEN_FILE_UNAVAILABLE`

_EOD batch generates dissemination file per scheduled request_

**Given:**
- EOD batch process triggered
- scheduled dissemination request exists

**Then:**
- **create_record**
- **call_service** target: `ftp_or_online_delivery`
- **emit_event** event: `broker_dissem.file.generated`

### Download_full_vs_changes (Priority: 3)

_User selects full download or changes-only based on data type_

**Given:**
- `download_mode` (input) in `full,changes`

**Then:**
- **set_field** target: `delta_mode` value: `changes`
- **emit_event** event: `broker_dissem.mode.selected`

### Download_elective_frozen_file (Priority: 4)

_User downloads frozen elective events file via online request process_

**Given:**
- `email_configured` (db) eq `true`
- `dataset_access` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `broker_dissem.frozen_file.delivered`

### Scheduling_access_denied (Priority: 5) — Error: `DISSEM_ACCESS_DENIED`

_User without access attempts to schedule dissemination_

**Given:**
- `user_has_access` (db) eq `false`

**Then:**
- **emit_event** event: `broker_dissem.access_denied`

### File_generation_failure (Priority: 6) — Error: `DISSEM_FILE_GENERATION_FAILED`

**Given:**
- `generation_status` (system) eq `failed`

**Then:**
- **notify**
- **emit_event** event: `broker_dissem.generation.failed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISSEM_ACCESS_DENIED` | 403 | User does not have access to schedule dissemination | No |
| `DISSEM_INVALID_SCHEDULE` | 400 | Invalid dissemination schedule parameters | No |
| `DISSEM_DATASET_NOT_FOUND` | 404 | Requested dataset is not available or not configured | No |
| `DISSEM_FROZEN_FILE_UNAVAILABLE` | 404 | Elective event frozen file not available for requested date | No |
| `DISSEM_FILE_GENERATION_FAILED` | 500 | Failed to generate dissemination file | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-data-upload | recommended |  |
| broker-financial-data-upload | recommended |  |
| broker-deal-management-upload | recommended |  |
| broker-dematerialisation-upload | optional |  |
| broker-securities-lending-borrowing-upload | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Back Office Dissemination

Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| schedule_dissemination_request | `autonomous` | - | - |
| generate_eod_dissemination_file | `autonomous` | - | - |
| download_full_vs_changes | `supervised` | - | - |
| download_elective_frozen_file | `autonomous` | - | - |
| scheduling_access_denied | `autonomous` | - | - |
| file_generation_failure | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
card_code_groups:
  account_details:
    - 80
    - 85
    - 86
    - 77
    - 78
    - 79
    - 98
  account_address_maintenance:
    - 50
    - 51
    - 52
    - 53
    - 58
    - 59
  legal_and_tax_maintenance:
    - 54
    - 55
    - 56
    - 57
  supplementary_names_addresses:
    - 44
    - 45
    - 46
    - 47
  account_relationships:
    - 48
  bee_instrument_account:
    - 70
  balance_details:
    - 90
    - 91
    - 95
    - 75
  daily_financial_movements:
    - 87
  scrip_records:
    - 88
    - 89
  gl_records:
    - 76
  cash_transactions:
    - 97
  daily_deals:
    - 81
    - 82
    - 83
    - 84
    - 99
  instruments:
    - 92
  bank_records:
    - 69
  equity_entitlements:
    - 93
    - 94
    - 74
    - 67
    - 68
    - 62
    - 73
  slb_collateral:
    - 60
    - 61
  portfolio_holdings:
    - 96
  elective_events_frozen_file:
    - 0
    - 71
    - 72
    - 999
data_use_cases:
  - Import client holdings and cash balances into trading systems for pre-trade
    risk management
  - Create IT3(b) and IT3(c) tax files for revenue authority
  - Reconcile general ledger transactions and balances with in-house systems
  - Reconcile sub-ledger holdings, open positions, and cash balances
  - Reconcile securities lending and borrowing transactions with external systems
scheduling_parameters:
  - BRANCH/PARTNER CODES (blank = all)
  - PF IND portfolio indicator (Y/N/blank)
  - FATCA flag (Y/N)
  - FUPD updated FATCA records only flag
  - AC7 account type 7 flag
record_structure:
  header: Card Code 000 — broker_code, date, file metadata
  trailer: Card Code 999 — record count, freed indicator
delivery_channels:
  - FTP (scheduled batch)
  - Online request process function
naming_convention: "{broker_code}_{dataset}_{CCYYMMDD}.dat"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Back Office Dissemination Blueprint",
  "description": "Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, dissemination, fixed-width, card-codes, accounts, deals, scrip, gl, sbl, elective-events, corporate-actions"
}
</script>
