---
title: "Broker Scrip Procedures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgemen"
---

# Broker Scrip Procedures Blueprint

> Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgement, pledge management, and scrip...

| | |
|---|---|
| **Feature** | `broker-scrip-procedures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, scrip, settlement, safekeeping, csd, lodgement, dematerialisation, float-control, bank-pledge |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-scrip-procedures.blueprint.yaml) |
| **JSON API** | [broker-scrip-procedures.json]({{ site.baseurl }}/api/blueprints/trading/broker-scrip-procedures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `scrip_clerk` | Scrip Clerk | human |  |
| `scrip_supervisor` | Scrip Supervisor | human |  |
| `transfer_secretary` | Transfer Secretary | external | Issuer agent responsible for registration of physical securities |
| `central_depository` | Central Securities Depository Participant | external | CSD participant holding dematerialised securities on behalf of the broker |
| `custodian_bank` | Custodian Bank | external | Bank holding scrip under pledge or safe custody |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scrip_reference` | text | Yes | Scrip Reference Number |  |
| `scrip_type` | select | Yes | Scrip Type |  |
| `security_code` | text | Yes | Security Code |  |
| `certificate_number` | text | No | Certificate Number |  |
| `quantity` | number | Yes | Share Quantity |  |
| `registered_holder` | text | No | Registered Holder Name |  |
| `account_code` | text | Yes | Client Account Code |  |
| `deal_reference` | text | No | Deal Reference |  |
| `location_code` | select | Yes | Scrip Location Code |  |
| `scrip_status` | select | Yes | Scrip Status |  |
| `received_date` | date | Yes | Received Date |  |
| `received_from` | text | No | Received From Counterparty |  |
| `transfer_deed_number` | text | No | Transfer Deed Number |  |
| `transfer_deed_type` | select | No | Transfer Deed Type |  |
| `balance_receipt_number` | text | No | Balance Receipt Number |  |
| `lodged_with` | select | No | Lodged With |  |
| `lodgement_reference` | text | No | Lodgement Reference |  |
| `pledge_reference` | text | No | Pledge Reference |  |
| `pledge_bank` | text | No | Pledging Bank |  |
| `dispatch_method` | select | No | Dispatch Method |  |
| `dispatch_date` | date | No | Dispatch Date |  |
| `safe_custody_reference` | text | No | Safe Custody Reference |  |
| `contra_reference` | text | No | Contra Reference |  |
| `float_count_date` | date | No | Float Count Date |  |
| `counted_quantity` | number | No | Counted Quantity |  |
| `system_quantity` | number | No | System Quantity |  |
| `variance_quantity` | number | No | Variance Quantity |  |
| `memo_text` | rich_text | No | Scrip Memo |  |

## States

**State field:** `scrip_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `received` | Yes |  |
| `allocated` |  |  |
| `registered` |  |  |
| `lodged` |  |  |
| `in_safe_custody` |  |  |
| `pledged` |  |  |
| `released` |  | Yes |
| `dispatched` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `received` | `allocated` | scrip_clerk |  |
|  | `allocated` | `registered` | transfer_secretary |  |
|  | `registered` | `lodged` | scrip_clerk |  |
|  | `registered` | `in_safe_custody` | scrip_clerk |  |
|  | `registered` | `pledged` | scrip_supervisor |  |
|  | `in_safe_custody` | `released` | scrip_supervisor |  |
|  | `lodged` | `released` | scrip_supervisor |  |
|  | `pledged` | `released` | scrip_supervisor |  |
|  | `registered` | `dispatched` | scrip_clerk |  |

## Rules

- **data_integrity:**
  - **scrip_uniqueness:** Scrip reference must be unique within broker firm and cannot be reused after release or dispatch
  - **certificate_integrity:** Certificate number plus security code must match issuer records before registration
  - **quantity_match:** Captured quantity must equal the sum of allocated quantities across linked deals
  - **location_audit:** Every scrip movement logs origin location, destination location, timestamp, and actor
  - **record_retention:** Scrip movement history retained for at least seven years to satisfy recordkeeping rules
- **security:**
  - **segregation_of_duties:** Operator who receives scrip may not also release from safe custody or pledge without a supervisor override
  - **physical_handling:** Physical scrip handled only by designated scrip clerks in a dual-control environment
  - **dematerialised_access:** Electronic pledge operations require supervisor role and are recorded with audit trail
- **compliance:**
  - **exchange_control:** Foreign-holder scrip flagged and handled under applicable exchange-control regulations
  - **popia_client_data:** Registered-holder names and account linkages treated as personal information under POPIA
  - **fica_counterparty:** Counterparty identity verified before accepting scrip received from non-regulated parties
  - **aml_monitoring:** Unusual patterns of physical scrip movement reported to compliance
- **business:**
  - **scrip_types:** Valid scrip types are certificate, certified deed, white deed form CM42, blue deed form CM41, balance receipt, transfer receipt
  - **location_codes:** Each physical location of scrip assigned a unique code so the broker always knows where scrip resides
  - **contra_settlement:** Scrip received against a sale must be contra-matched to the corresponding counter-side; unmatched contras block settlement
  - **float_balancing:** Daily scrip count per security and per location must reconcile to system quantity; variances raise a float-control exception
  - **registration_flow:** Scrip sent to transfer secretary for registration, monitored until receipt ex-company, then moved to final destination
  - **safe_custody_sweep:** Client scrip not earmarked for delivery moves to safe custody by end of settlement window
  - **pledge_release:** Pledged scrip cannot be released to client or safe custody until pledge is formally withdrawn by the pledgee bank

## Outcomes

### Receive_scrip_against_sale (Priority: 1) | Transaction: atomic

_Scrip clerk captures scrip received from a counterparty against an open sale, creating a register entry and initial receipt event_

**Given:**
- `scrip_type` (input) in `certificate,certified_deed,white_deed,blue_deed,balance_receipt,transfer_receipt`
- `security_code` (input) exists
- `quantity` (input) gt `0`
- `deal_reference` (input) exists

**Then:**
- **create_record**
- **set_field** target: `scrip_status` value: `received`
- **emit_event** event: `scrip.received`

### Reject_duplicate_scrip (Priority: 2) — Error: `SCRIP_DUPLICATE`

_Prevent the same certificate or balance receipt being loaded twice_

**Given:**
- `scrip_reference` (db) exists

**Then:**
- **emit_event** event: `scrip.received`

### Allocate_scrip_to_purchase (Priority: 3) | Transaction: atomic

_Scrip clerk allocates received scrip against a matching open purchase_

**Given:**
- `scrip_status` (db) eq `received`
- `deal_reference` (input) exists

**Then:**
- **transition_state** field: `scrip_status` from: `received` to: `allocated`
- **emit_event** event: `scrip.allocated`

### Send_for_registration (Priority: 4) | Transaction: atomic

_Clerk sends allocated scrip to the transfer secretary for registration in the new holder's name_

**Given:**
- `scrip_status` (db) eq `allocated`

**Then:**
- **set_field** target: `location_code` value: `at_transfer_secretary`
- **emit_event** event: `scrip.sent_for_registration`

### Record_registered_scrip (Priority: 5) | Transaction: atomic

_Back-office records receipt ex-company once transfer secretary returns the registered certificate_

**Given:**
- `certificate_number` (input) exists
- `registered_holder` (input) exists

**Then:**
- **transition_state** field: `scrip_status` from: `allocated` to: `registered`
- **emit_event** event: `scrip.registered`

### Lodge_with_central_depository (Priority: 6) | Transaction: atomic

_Registered scrip lodged with the central securities depository for dematerialisation_

**Given:**
- `scrip_status` (db) eq `registered`
- `lodged_with` (input) eq `central_depository`

**Then:**
- **transition_state** field: `scrip_status` from: `registered` to: `lodged`
- **set_field** target: `location_code` value: `at_central_depository`
- **emit_event** event: `scrip.lodged`

### Move_to_safe_custody (Priority: 7)

_Registered scrip not earmarked for delivery is swept into safe custody_

**Given:**
- `scrip_status` (db) eq `registered`

**Then:**
- **transition_state** field: `scrip_status` from: `registered` to: `in_safe_custody`
- **set_field** target: `location_code` value: `safe_custody`
- **emit_event** event: `scrip.lodged`

### Reject_unregistered_lodgement (Priority: 8) — Error: `SCRIP_NOT_REGISTERED`

_Prevent lodgement, safe custody, or pledge of unregistered scrip_

**Given:**
- `scrip_status` (db) in `received,allocated`

**Then:**
- **emit_event** event: `scrip.lodged`

### Pledge_scrip_to_bank (Priority: 9) | Transaction: atomic

_Supervisor pledges registered or lodged scrip to a custodian bank_

**Given:**
- `user_role` (session) eq `scrip_supervisor`
- `pledge_bank` (input) exists

**Then:**
- **transition_state** field: `scrip_status` from: `registered` to: `pledged`
- **emit_event** event: `scrip.pledged`

### Release_scrip_from_safekeeping (Priority: 10) | Transaction: atomic

_Supervisor releases scrip from safe custody, lodgement, or pledge once business reason documented_

**Given:**
- `user_role` (session) eq `scrip_supervisor`
- `scrip_status` (db) in `in_safe_custody,lodged,pledged`

**Then:**
- **transition_state** field: `scrip_status` from: `in_safe_custody` to: `released`
- **emit_event** event: `scrip.released_from_safekeeping`

### Reject_release_with_active_pledge (Priority: 11) — Error: `SCRIP_PLEDGE_ACTIVE`

_Block release of scrip while an active pledge record exists and has not been withdrawn_

**Given:**
- `pledge_reference` (db) exists
- `scrip_status` (db) eq `pledged`

**Then:**
- **emit_event** event: `scrip.released_from_safekeeping`

### Dispatch_scrip_to_client (Priority: 12)

_Registered scrip dispatched by registered post or courier to the client_

**Given:**
- `scrip_status` (db) eq `registered`
- `dispatch_method` (input) in `registered_post,courier,counter_collection`

**Then:**
- **transition_state** field: `scrip_status` from: `registered` to: `dispatched`
- **emit_event** event: `scrip.dispatched`

### Balance_scrip_float (Priority: 13)

_Daily scrip count reconciles physical quantity at each location to system quantity_

**Given:**
- `counted_quantity` (input) exists
- `system_quantity` (db) exists

**Then:**
- **set_field** target: `variance_quantity` value: `computed`
- **emit_event** event: `scrip.float_counted`

### Raise_float_variance_exception (Priority: 14) — Error: `SCRIP_FLOAT_VARIANCE`

_Float count variance raises an exception and blocks end-of-day until investigated_

**Given:**
- `variance_quantity` (computed) neq `0`

**Then:**
- **emit_event** event: `scrip.float_counted`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCRIP_DUPLICATE` | 409 | Scrip reference already exists in the register | No |
| `SCRIP_TYPE_INVALID` | 400 | Scrip type is not recognised | No |
| `SCRIP_QUANTITY_MISMATCH` | 422 | Captured quantity does not match allocated quantities | No |
| `SCRIP_LOCATION_UNKNOWN` | 400 | Location code is not defined in the scrip location master | No |
| `SCRIP_CONTRA_UNMATCHED` | 409 | No matching contra found for this scrip receipt | No |
| `SCRIP_NOT_REGISTERED` | 409 | Scrip must be registered before lodgement, safe custody, or pledge | No |
| `SCRIP_RELEASE_FORBIDDEN` | 403 | Scrip release requires scrip supervisor role | No |
| `SCRIP_PLEDGE_ACTIVE` | 409 | Scrip cannot be released while an active pledge exists | No |
| `SCRIP_FLOAT_VARIANCE` | 422 | Float count does not reconcile to system quantity | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `scrip.received` |  | `scrip_reference`, `scrip_type`, `security_code`, `quantity`, `account_code`, `received_from`, `timestamp` |
| `scrip.allocated` |  | `scrip_reference`, `deal_reference`, `account_code`, `allocated_by`, `timestamp` |
| `scrip.sent_for_registration` |  | `scrip_reference`, `transfer_secretary`, `sent_by`, `timestamp` |
| `scrip.registered` |  | `scrip_reference`, `registered_holder`, `certificate_number`, `timestamp` |
| `scrip.lodged` |  | `scrip_reference`, `lodged_with`, `lodgement_reference`, `lodged_by`, `timestamp` |
| `scrip.released_from_safekeeping` |  | `scrip_reference`, `location_code`, `released_by`, `timestamp` |
| `scrip.pledged` |  | `scrip_reference`, `pledge_bank`, `pledge_reference`, `pledged_by`, `timestamp` |
| `scrip.pledge_withdrawn` |  | `scrip_reference`, `pledge_reference`, `withdrawn_by`, `timestamp` |
| `scrip.dispatched` |  | `scrip_reference`, `dispatch_method`, `dispatch_date`, `dispatched_by` |
| `scrip.float_counted` |  | `security_code`, `location_code`, `counted_quantity`, `system_quantity`, `variance_quantity`, `counted_by`, `timestamp` |
| `scrip.contra_matched` |  | `scrip_reference`, `contra_reference`, `matched_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Scrip Procedures

Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgement, pledge management, and scrip...

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

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| receive_scrip_against_sale | `autonomous` | - | - |
| reject_duplicate_scrip | `supervised` | - | - |
| allocate_scrip_to_purchase | `autonomous` | - | - |
| send_for_registration | `autonomous` | - | - |
| record_registered_scrip | `autonomous` | - | - |
| lodge_with_central_depository | `autonomous` | - | - |
| move_to_safe_custody | `autonomous` | - | - |
| reject_unregistered_lodgement | `supervised` | - | - |
| pledge_scrip_to_bank | `autonomous` | - | - |
| release_scrip_from_safekeeping | `autonomous` | - | - |
| reject_release_with_active_pledge | `supervised` | - | - |
| dispatch_scrip_to_client | `autonomous` | - | - |
| balance_scrip_float | `autonomous` | - | - |
| raise_float_variance_exception | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  ACDLU: Receive Scrip Against Sales
  ACSCR: Scrip Receipts Other Than Against Sales
  MANCT: Manual Contras
  SCRAL: Scrip Allocation and Certification
  SCRCT: Scrip Count
  SHBAL: Share Balance
  USTCO: Scrip to Company (Send for Registration)
  URXCO: Receipts Ex Company
  USXCO: Scrip Ex Company
  USTNN: Scrip Delivery
  USTPO: Scrip for Mailing
  USTSC: Scrip to Safe Custody
  USXSC: Scrip Ex Safe Custody
  USTBP: Scrip to Bank Pledge
  USXBP: Scrip from Bank Pledge
  USTEP: Bank Pledge for Electronic Scrip
  USXEP: Scrip Ex Bank Pledge
scrip_types:
  C: Certificate
  CD: Certified Deed
  WD: White Deed (Form CM42)
  BD: Blue Deed (Form CM41)
  BR: Balance Receipt
  TR: Transfer Receipt
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Scrip Procedures Blueprint",
  "description": "Back-office scrip handling covering physical and electronic securities — receipts, allocations, registration, dispatch, safekeeping, central depository lodgemen",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, scrip, settlement, safekeeping, csd, lodgement, dematerialisation, float-control, bank-pledge"
}
</script>
