---
title: "Broker Dematerialisation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office conversion of paper share certificates into electronic records via a central securities depository, with lodgement, nominee-name registration, scrip"
---

# Broker Dematerialisation Blueprint

> Back-office conversion of paper share certificates into electronic records via a central securities depository, with lodgement, nominee-name registration, scrip register updates, proprietary and...

| | |
|---|---|
| **Feature** | `broker-dematerialisation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, dematerialisation, scrip, nominee, csd, settlement, equities |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-dematerialisation.blueprint.yaml) |
| **JSON API** | [broker-dematerialisation.json]({{ site.baseurl }}/api/blueprints/trading/broker-dematerialisation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `settlement_supervisor` | Settlement Supervisor | human |  |
| `csd_participant` | Central Securities Depository Participant | external |  |
| `transfer_secretary` | Transfer Secretary | external |  |
| `back_office_system` | Back-Office System | system |  |
| `client` | Client | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `batch_reference` | text | Yes | Batch Reference Number |  |
| `issuing_company` | text | Yes | Issuing Company |  |
| `share_class` | text | Yes | Share Class |  |
| `registered_holder` | text | Yes | Registered Holder |  |
| `non_resident_flag` | boolean | Yes | Non-Resident Scrip Flag |  |
| `certificate_number` | text | Yes | Certificate Number |  |
| `certificate_quantity` | number | Yes | Certificate Quantity |  |
| `document_type` | select | Yes | Document Type |  |
| `client_account_code` | text | No | Client Account Code |  |
| `proprietary_flag` | boolean | Yes | Proprietary Scrip Flag |  |
| `nominee_account_code` | text | Yes | Nominee Account Code |  |
| `scrip_location` | select | Yes | Scrip Location Code |  |
| `lodgement_date` | date | Yes | Lodgement Date |  |
| `acknowledgement_receipt` | text | No | CSD Acknowledgement Receipt |  |
| `csd_response` | select | No | CSD Response Outcome |  |
| `rejection_reason` | text | No | Rejection Reason |  |
| `scrip_status` | select | Yes | Scrip Status |  |
| `jurisdiction` | select | Yes | Securities Jurisdiction |  |
| `rematerialisation_quantity` | number | No | Rematerialisation Quantity |  |
| `registration_code` | text | No | Registration Code |  |
| `rematerialisation_receipt` | text | No | Rematerialisation Receipt Number |  |

## States

**State field:** `scrip_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `lodged` | Yes |  |
| `pending_demat` |  |  |
| `dematerialised` |  | Yes |
| `rejected` |  |  |
| `tainted` |  |  |
| `rematerialised` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `lodged` | `pending_demat` | broker_operator |  |
|  | `pending_demat` | `dematerialised` | csd_participant |  |
|  | `pending_demat` | `rejected` | csd_participant |  |
|  | `pending_demat` | `tainted` | transfer_secretary |  |
|  | `rejected` | `pending_demat` | broker_operator |  |
|  | `dematerialised` | `rematerialised` | broker_operator |  |

## Rules

- **batching:**
  - **max_documents_per_batch:** A batch may contain no more than 100 documents of title
  - **single_issuer:** All scrip in a batch must be for one issuing company only
  - **single_share_class:** All scrip in a batch must be for one share class only
  - **single_holder:** All scrip in a batch must be for one registered holder only
  - **non_resident_segregation:** Non-resident scrip must be lodged in a separate batch from resident scrip
  - **acceptable_documents:** Only share certificates and balance receipts may be included in a batch
  - **unique_reference:** Each batch must carry a broker-assigned unique reference number
- **lodgement:**
  - **covering_letter_required:** Each batch lodged with the CSD must include scrip, a printed information report, and a covering letter
  - **acknowledgement_required:** Broker must receive and retain CSD acknowledgement for each batch lodged
  - **location_transfer:** Scrip sent to CSD must be transferred to the pending dematerialisation location before acknowledgement
- **segregation:**
  - **proprietary_vs_client:** Nominee account must be analysed daily into proprietary, resident-client, and non-resident-client sub-totals
  - **nominee_account_reserved:** Central nominee account is reserved exclusively for dematerialised scrip
  - **daily_reconciliation:** All uncertificated balances must be reconciled with the CSD on a daily basis
- **rejection:**
  - **unacceptable_scrip:** Unacceptable scrip (minor technicality) is returned and must be rectified and resubmitted
  - **tainted_scrip:** Tainted scrip is retained by the transfer secretary; certified copy returned; handled under trace rules
  - **rejection_transfer:** Rejected scrip must be moved out of pending dematerialisation location to invalid scrip account or original account
- **risk:**
  - **ownership_verification:** Broker must verify client ownership of shares before submitting for dematerialisation
  - **validity_responsibility:** Broker is responsible to the CSD for the validity of all scrip lodged
  - **right_to_refuse:** Broker has no obligation to accept scrip where validity is in doubt
  - **physical_risk_point:** Broker carries risk on delivery until CSD issues acknowledgement receipt
  - **no_pre_demat_trading:** Selling on behalf of a client before dematerialisation completes adds borrowing risk and is discouraged
  - **settlement_rule:** Only dematerialised securities may be used to settle listed equity trades
- **client_own_name:**
  - **direct_csd_approach:** Clients wishing to dematerialise in their own name must approach a CSD participant directly and cannot route through the broker
- **jurisdictional:**
  - **multi_market_support:** System must support local and regional securities (e.g. SA and Namibian listings) with market-appropriate CSD routing
- **compliance:**
  - **popia_compliance:** Client scrip records contain personal information and are subject to POPIA s.19 safeguards
  - **audit_trail:** All location moves, acknowledgements, and rejections logged with user, timestamp, and batch reference

## Outcomes

### Lodge_valid_batch (Priority: 1) | Transaction: atomic

_Operator lodges a well-formed batch with the central depository and moves scrip to the pending dematerialisation location_

**Given:**
- `document_count` (input) lte `100`
- `issuing_company` (input) exists
- `share_class` (input) exists
- `registered_holder` (input) exists

**Then:**
- **set_field** target: `scrip_location` value: `pending_demat`
- **transition_state** field: `scrip_status` from: `lodged` to: `pending_demat`
- **emit_event** event: `demat.batch_lodged`
- **emit_event** event: `demat.pending_location_updated`

### Reject_oversized_batch (Priority: 2) — Error: `DEMAT_BATCH_OVERSIZED`

_Prevent lodgement of a batch containing more than 100 documents of title_

**Given:**
- `document_count` (input) gt `100`

**Then:**
- **emit_event** event: `demat.rejected`

### Reject_mixed_holder_batch (Priority: 3) — Error: `DEMAT_BATCH_MIXED_HOLDER`

_Prevent lodgement of a batch containing multiple registered holders, issuers, or share classes_

**Given:**
- ANY: `distinct_holders` (input) gt `1` OR `distinct_issuers` (input) gt `1` OR `distinct_share_classes` (input) gt `1`

**Then:**
- **emit_event** event: `demat.rejected`

### Reject_non_resident_mix (Priority: 4) — Error: `DEMAT_NON_RESIDENT_MIXED`

_Prevent non-resident scrip from being lodged in the same batch as resident scrip_

**Given:**
- `has_resident_and_non_resident_mix` (input) eq `true`

**Then:**
- **emit_event** event: `demat.rejected`

### Mark_batch_dematerialised (Priority: 5) | Transaction: atomic

_Operator marks scrip as successfully dematerialised on confirmation from the central depository and updates the nominee account balance_

**Given:**
- `csd_response` (input) eq `ok`
- `scrip_status` (db) eq `pending_demat`

**Then:**
- **transition_state** field: `scrip_status` from: `pending_demat` to: `dematerialised`
- **set_field** target: `scrip_location` value: `csd`
- **emit_event** event: `demat.completed`
- **emit_event** event: `scrip.register_reconciled`

### Handle_rejected_scrip (Priority: 6) — Error: `DEMAT_SCRIP_REJECTED` | Transaction: atomic

_Operator reverses pending location when the central depository rejects scrip and routes it to an invalid scrip account for rectification_

**Given:**
- `csd_response` (input) eq `nok`

**Then:**
- **transition_state** field: `scrip_status` from: `pending_demat` to: `rejected`
- **set_field** target: `scrip_location` value: `rejected`
- **emit_event** event: `demat.rejected`

### Handle_tainted_scrip (Priority: 7) — Error: `DEMAT_SCRIP_TAINTED` | Transaction: atomic

_Transfer secretary retains tainted scrip; broker moves position to invalid account and initiates trace process_

**Given:**
- `csd_response` (input) eq `tainted`

**Then:**
- **transition_state** field: `scrip_status` from: `pending_demat` to: `tainted`
- **emit_event** event: `demat.tainted`

### Daily_nominee_reconciliation (Priority: 8)

_Back-office system reconciles the nominee account daily, producing proprietary, resident-client, and non-resident-client sub-totals_

**Given:**
- `reconciliation_trigger` (system) eq `end_of_day`

**Then:**
- **call_service** target: `nominee_reconciliation_engine`
- **emit_event** event: `scrip.register_reconciled`

### Rematerialise_position (Priority: 9) | Transaction: atomic

_Operator rematerialises a dematerialised position back into a paper certificate on client request_

**Given:**
- `scrip_status` (db) eq `dematerialised`
- `rematerialisation_quantity` (input) gt `0`
- `registration_code` (input) exists
- `rematerialisation_receipt` (input) exists

**Then:**
- **transition_state** field: `scrip_status` from: `dematerialised` to: `rematerialised`
- **emit_event** event: `scrip.rematerialised`

### Block_client_own_name_via_broker (Priority: 10) — Error: `DEMAT_OWNERSHIP_UNVERIFIED`

_Prevent a client from dematerialising in their own name via the broker; they must approach a central depository participant directly_

**Given:**
- `own_name_request` (input) eq `true`

**Then:**
- **notify** target: `client`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEMAT_BATCH_OVERSIZED` | 422 | Batch exceeds maximum of 100 documents of title | No |
| `DEMAT_BATCH_MIXED_ISSUER` | 422 | Batch contains scrip from more than one issuing company | No |
| `DEMAT_BATCH_MIXED_CLASS` | 422 | Batch contains more than one share class | No |
| `DEMAT_BATCH_MIXED_HOLDER` | 422 | Batch contains more than one registered holder | No |
| `DEMAT_NON_RESIDENT_MIXED` | 422 | Non-resident scrip must be lodged in a separate batch | No |
| `DEMAT_CSD_ACKNOWLEDGEMENT_MISSING` | 409 | Central depository acknowledgement has not been received for this batch | No |
| `DEMAT_SCRIP_REJECTED` | 409 | Scrip was rejected by the central depository and must be rectified | No |
| `DEMAT_SCRIP_TAINTED` | 409 | Scrip is tainted and has been retained by the transfer secretary | No |
| `DEMAT_INVALID_LOCATION_TRANSFER` | 409 | Scrip cannot be transferred out of the current location in its present state | No |
| `DEMAT_OWNERSHIP_UNVERIFIED` | 403 | Client ownership of scrip could not be verified | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `demat.batch_lodged` |  | `batch_reference`, `issuing_company`, `share_class`, `registered_holder`, `document_count`, `lodged_by`, `timestamp` |
| `demat.pending_location_updated` |  | `batch_reference`, `scrip_location`, `updated_by`, `timestamp` |
| `demat.acknowledged` |  | `batch_reference`, `acknowledgement_receipt`, `received_at` |
| `demat.completed` |  | `batch_reference`, `certificate_number`, `quantity`, `client_account_code`, `completed_at` |
| `demat.rejected` |  | `batch_reference`, `certificate_number`, `rejection_reason`, `rejected_at` |
| `demat.tainted` |  | `batch_reference`, `certificate_number`, `retained_by`, `timestamp` |
| `scrip.rematerialised` |  | `client_account_code`, `issuing_company`, `quantity`, `registration_code`, `rematerialisation_receipt`, `timestamp` |
| `scrip.register_reconciled` |  | `nominee_account_code`, `proprietary_total`, `resident_client_total`, `non_resident_client_total`, `reconciled_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-dematerialisation-upload | recommended |  |
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
locations:
  RD: Pending Dematerialisation (scrip lodged at CSD awaiting acknowledgement)
  RJ: Rejected Dematerialisation (scrip lodged but rejected)
  CS: CSD Location (dematerialised scrip held at central depository)
  RN: Rematerialised Location (position returned to paper)
accounts:
  uncertificated_nominee: Nominee account reserved for dematerialised scrip,
    loaded automatically for all members
screens:
  USTCD: Accept Dematerialised Certificates (OK/NOK marking)
  USTCD2: Dematerialised Scrip Allocation (fungible position client allocation)
  USXCD: Rematerialise Scrip
  ACDLS: Open Deals by Share (entry point for rematerialisation)
  SCRMV: Scrip Move (location transfers)
  LOCSC: Location Scrip Totals (proprietary, resident, non-resident sub-totals)
jurisdictions:
  local: Local listed securities
  regional: Regional listed securities (e.g. Namibian)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Dematerialisation Blueprint",
  "description": "Back-office conversion of paper share certificates into electronic records via a central securities depository, with lodgement, nominee-name registration, scrip",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, dematerialisation, scrip, nominee, csd, settlement, equities"
}
</script>
