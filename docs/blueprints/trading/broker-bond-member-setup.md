---
title: "Broker Bond Member Setup Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Onboarding and configuration of a new bond-market member on the broker back-office system including reference data, settlement accounts, user access, capital ad"
---

# Broker Bond Member Setup Blueprint

> Onboarding and configuration of a new bond-market member on the broker back-office system including reference data, settlement accounts, user access, capital adequacy, and trade-processing enablement

| | |
|---|---|
| **Feature** | `broker-bond-member-setup` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, bond-market, member-onboarding, settlement, reference-data, capital-adequacy, access-control |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-bond-member-setup.blueprint.yaml) |
| **JSON API** | [broker-bond-member-setup.json]({{ site.baseurl }}/api/blueprints/trading/broker-bond-member-setup.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer_support_officer` | Customer Support Officer | human | Senior back-office staff responsible for loading bond member reference data |
| `access_control_coordinator` | Access Control Coordinator | human | Provisions user IDs and screen-level access rights |
| `surveillance_officer` | Surveillance Officer | human | Reviews capital-adequacy compliance before activation |
| `bond_member` | Bond Member Firm | external | Applying member firm that has appointed the service provider |
| `bond_exchange` | Bond Exchange | external | Bond market operator that approves membership |
| `bond_code_registry` | Bond Code Registry | external | External registry that issues member identifier codes and settlement routing |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `member_code` | text | Yes | Member Code |  |
| `member_legal_name` | text | Yes | Member Legal Name |  |
| `effective_date` | date | Yes | Effective Date |  |
| `training_required` | boolean | No | Training Required |  |
| `cs_officer` | text | Yes | Assigned Support Officer |  |
| `super_user_id` | text | Yes | Super User ID |  |
| `additional_user_id` | text | No | Additional User ID |  |
| `registry_id` | text | No | Registry Participant ID |  |
| `gilt_user_flag` | boolean | Yes | Gilt User Indicator |  |
| `party_role` | select | Yes | Party Role |  |
| `category` | select | Yes | Category |  |
| `settlement_terms` | select | Yes | Settlement Terms |  |
| `charge_type` | select | Yes | Charge Type |  |
| `broker_user_flag` | boolean | Yes | Broker User Indicator |  |
| `trading_type` | select | Yes | Trading Type |  |
| `member_settlement_account` | text | No | Member Proprietary Settlement Account |  |
| `resident_client_settlement_account` | text | No | Resident Client Settlement Account |  |
| `non_resident_client_settlement_account` | text | No | Non-Resident Client Settlement Account |  |
| `non_member_settled_clearing_account` | text | No | Non-Member Settled Clearing Account |  |
| `default_settlement_account` | text | No | Default Settlement Account |  |
| `settlement_agent_code` | text | No | Settlement Agent Code |  |
| `funds_account_number` | text | No | Funds Account Number |  |
| `funds_branch_number` | text | No | Funds Branch Number |  |
| `scrip_account_number` | text | No | Scrip Account Number |  |
| `scrip_branch_number` | text | No | Scrip Branch Number |  |
| `country_code` | text | Yes | Country Code |  |
| `client_type` | select | No | Client Type |  |
| `capital_adequacy_confirmed` | boolean | Yes | Capital Adequacy Confirmed |  |
| `member_status` | select | Yes | Member Status |  |
| `service_provider_letter` | file | Yes | Service Provider Appointment Letter |  |
| `membership_approval_reference` | text | Yes | Membership Approval Reference |  |

## States

**State field:** `member_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `applied` | Yes |  |
| `approved` |  |  |
| `active` |  |  |
| `suspended` |  |  |
| `deactivated` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `applied` | `approved` | bond_exchange |  |
|  | `approved` | `active` | customer_support_officer |  |
|  | `active` | `suspended` | surveillance_officer |  |
|  | `suspended` | `active` | surveillance_officer |  |
|  | `active` | `deactivated` | customer_support_officer |  |

## Rules

- **eligibility:**
  - **service_provider_appointment:** Member must have formally appointed the service provider in writing to the bond exchange before any loading begins
  - **membership_approval_required:** Back-office loading may only commence after the bond exchange confirms membership approval and issues a member code
  - **senior_operator_only:** Only a senior customer-support staff member may load the bond member on the back-office system
- **reference_data:**
  - **broker_master_indicators:** Member master record must set gilt-user, party role, category, settlement terms, charge type and broker-user indicators at least one day before the live date
  - **unique_member_code:** Member code must be unique within the back-office system
  - **broker_master_first:** Broker master record must be updated before access-control provisioning will action the request
- **access_control:**
  - **external_provisioning_first:** Bond code registry must provision the member on their side and issue a super-user credential before internal access-control can process the request
  - **super_user_and_additional_ids:** Access-control coordinator creates a super-user ID and an additional user ID, with registry ID supplied to the bond code registry for trading-screen access
  - **screen_level_access:** Super-user ID is granted access to the bond-market trading option at the screen level
- **settlement_accounts:**
  - **proprietary_netting:** Member proprietary settlement account is the netting account for proprietary bond trades and must reconcile with the member's settlement agent
  - **resident_client_netting:** Resident client settlement account nets market-leg entries for resident member-settled clients and must be linked to the settlement-details record
  - **non_resident_client_netting:** Non-resident client settlement account nets market-leg entries for non-resident clients and must be linked once the registry code is received
  - **default_account_routing:** If no settlement account is linked, trades default to the default settlement account and must be investigated
  - **non_member_settled_clearing:** Non-member settled clearing account is a reverse-substitution account; settlement must not occur there and any settlement entries require investigation
  - **no_automatic_bond_settlement:** There is no automatic market settlement for bond trades; the member must process cash-book entries and receipt or delivery of holdings manually
- **settlement_details:**
  - **proprietary_registration:** Settlement-details registration request is triggered to the bond code registry which replies with verified settlement details that auto-populate the master record
  - **registry_verification_required:** Settlement-details record must be verified by the bond code registry before the member can commence trading
  - **resident_client_details:** Resident member-settled client settlement details are loaded with the local client type, country code ZA, and the resident settlement account
  - **non_resident_client_details:** Non-resident member-settled client settlement details are loaded with the non-resident client type, generic foreign country code, and the non-resident settlement account
- **capital_adequacy:**
  - **surveillance_briefing:** A meeting must be scheduled between the member and the surveillance department before activation so capital-adequacy requirements are formally communicated
  - **capital_confirmation_before_activation:** Capital-adequacy confirmation from surveillance is a precondition to transitioning the member to active
  - **ongoing_monitoring:** Non-resident client settlement account must be monitored daily; net positions are generated per stock on T+1
- **trade_processing:**
  - **end_of_day_batch:** Trades flow from the registry into the back-office system as part of the start-of-day batch run
  - **market_leg_auto_posted:** Market leg is automatically posted to the relevant settlement account based on the linked settlement details
  - **controlled_accounts_manual:** Trades on controlled client accounts are captured manually on the deal-capture screen and allocated via the scrip-allocation screen
- **security:**
  - **access_segregation:** Access-control provisioning is segregated from reference-data loading; neither role may perform the other
  - **audit_trail_retention:** All onboarding steps, approvals, and reference-data changes are logged with user, timestamp and before/after values
- **compliance:**
  - **popia:** Any personal information captured about authorised representatives of the member must comply with POPIA lawful-basis, minimisation and breach-notification requirements

## Outcomes

### Record_member_application (Priority: 1) | Transaction: atomic

_Customer support records the member application once a service-provider letter is lodged_

**Given:**
- `service_provider_letter` (input) exists
- `member_legal_name` (input) exists

**Then:**
- **create_record**
- **set_field** target: `member_status` value: `applied`
- **emit_event** event: `bond_member.applied`

### Reject_missing_service_provider_letter (Priority: 2) — Error: `BOND_MEMBER_SERVICE_PROVIDER_LETTER_MISSING`

_Application may not be recorded without the written appointment letter_

**Given:**
- `service_provider_letter` (input) not_exists

**Then:**
- **emit_event** event: `bond_member.applied`

### Approve_member_after_exchange_confirmation (Priority: 3) | Transaction: atomic

_Transition to approved once the bond exchange has confirmed membership and issued a member code_

**Given:**
- `member_status` (db) eq `applied`
- `membership_approval_reference` (input) exists
- `member_code` (input) exists

**Then:**
- **transition_state** field: `member_status` from: `applied` to: `approved`
- **emit_event** event: `bond_member.approved`

### Load_broker_master_record (Priority: 4) | Transaction: atomic

_Senior customer-support officer loads broker-master indicators at least one day before live date_

**Given:**
- `user_role` (session) eq `customer_support_officer`
- `member_status` (db) eq `approved`
- `gilt_user_flag` (input) eq `true`

**Then:**
- **set_field** target: `party_role` value: `PT`
- **set_field** target: `category` value: `C`
- **set_field** target: `settlement_terms` value: `AC`
- **set_field** target: `charge_type` value: `F`
- **set_field** target: `broker_user_flag` value: `true`
- **emit_event** event: `bond_member.broker_master_loaded`

### Reject_non_senior_loading (Priority: 5) — Error: `BOND_MEMBER_ROLE_FORBIDDEN`

_Non-senior users may not load broker-master or settlement data_

**Given:**
- `user_role` (session) neq `customer_support_officer`

**Then:**
- **emit_event** event: `bond_member.broker_master_loaded`

### Provision_access_credentials (Priority: 6) | Transaction: atomic

_Access-control coordinator provisions super-user and additional IDs after broker-master is loaded and external registry has provisioned its side_

**Given:**
- `user_role` (session) eq `access_control_coordinator`
- ALL: `super_user_id` (input) exists AND `broker_master_loaded` (db) eq `true`

**Then:**
- **set_field** target: `additional_user_id` value: `generated`
- **emit_event** event: `bond_member.access_provisioned`

### Register_settlement_details (Priority: 7) | Transaction: atomic

_Trigger settlement-details registration to the bond code registry and store verified reply_

**Given:**
- `member_code` (input) exists
- `trading_type` (input) in `proprietary,client,both`

**Then:**
- **call_service** target: `bond_code_registry.register_settlement`
- **set_field** target: `member_settlement_account` value: `40527`
- **emit_event** event: `bond_member.settlement_registered`

### Reject_unverified_settlement (Priority: 8) — Error: `BOND_MEMBER_SETTLEMENT_UNVERIFIED`

_Member may not be activated while settlement details remain unverified by the bond code registry_

**Given:**
- `settlement_verified` (db) eq `false`

**Then:**
- **emit_event** event: `bond_member.settlement_registered`

### Load_resident_client_settlement (Priority: 9) | Transaction: atomic

_Load resident member-settled client settlement details with local client type_

**Given:**
- `client_type` (input) eq `resident`
- `trading_type` (input) in `client,both`

**Then:**
- **set_field** target: `country_code` value: `ZA`
- **set_field** target: `resident_client_settlement_account` value: `40519`
- **emit_event** event: `bond_member.client_settlement_loaded`

### Load_non_resident_client_settlement (Priority: 10) | Transaction: atomic

_Load non-resident member-settled client settlement details with generic foreign country code_

**Given:**
- `client_type` (input) eq `non_resident`
- `trading_type` (input) in `client,both`

**Then:**
- **set_field** target: `country_code` value: `ZZ`
- **set_field** target: `non_resident_client_settlement_account` value: `40501`
- **emit_event** event: `bond_member.client_settlement_loaded`

### Confirm_capital_adequacy (Priority: 11) | Transaction: atomic

_Surveillance confirms the member has been briefed on and meets capital-adequacy requirements_

**Given:**
- `user_role` (session) eq `surveillance_officer`
- `capital_adequacy_confirmed` (input) eq `true`

**Then:**
- **set_field** target: `capital_adequacy_confirmed` value: `true`
- **emit_event** event: `bond_member.capital_adequacy_confirmed`

### Activate_bond_member (Priority: 12) | Transaction: atomic

_Activate the member for live bond trading once all preconditions are satisfied_

**Given:**
- `member_status` (db) eq `approved`
- `broker_master_loaded` (db) eq `true`
- `access_provisioned` (db) eq `true`
- `settlement_verified` (db) eq `true`
- `capital_adequacy_confirmed` (db) eq `true`

**Then:**
- **transition_state** field: `member_status` from: `approved` to: `active`
- **emit_event** event: `bond_member.activated`

### Reject_activation_without_capital_confirmation (Priority: 13) — Error: `BOND_MEMBER_CAPITAL_ADEQUACY_NOT_CONFIRMED`

_Block activation until surveillance has confirmed capital adequacy_

**Given:**
- `capital_adequacy_confirmed` (db) neq `true`

**Then:**
- **emit_event** event: `bond_member.activated`

### Suspend_on_capital_breach (Priority: 14) | Transaction: atomic

_Surveillance may suspend an active member on a capital-adequacy breach_

**Given:**
- `user_role` (session) eq `surveillance_officer`
- `member_status` (db) eq `active`

**Then:**
- **transition_state** field: `member_status` from: `active` to: `suspended`
- **emit_event** event: `bond_member.suspended`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BOND_MEMBER_NOT_APPROVED` | 409 | Membership has not been approved by the bond exchange | No |
| `BOND_MEMBER_SERVICE_PROVIDER_LETTER_MISSING` | 422 | Service provider appointment letter has not been recorded | No |
| `BOND_MEMBER_DUPLICATE_CODE` | 409 | Member code already exists | No |
| `BOND_MEMBER_ACCESS_NOT_PROVISIONED` | 409 | External access credentials have not been provisioned | No |
| `BOND_MEMBER_BROKER_MASTER_INCOMPLETE` | 422 | Broker master record indicators are incomplete | No |
| `BOND_MEMBER_SETTLEMENT_UNVERIFIED` | 409 | Settlement details have not been verified by the bond code registry | No |
| `BOND_MEMBER_CAPITAL_ADEQUACY_NOT_CONFIRMED` | 409 | Capital adequacy briefing has not been confirmed by surveillance | No |
| `BOND_MEMBER_ROLE_FORBIDDEN` | 403 | Only a senior customer-support officer may perform this action | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bond_member.applied` |  | `member_code`, `member_legal_name`, `effective_date`, `cs_officer`, `timestamp` |
| `bond_member.approved` |  | `member_code`, `membership_approval_reference`, `approved_by`, `timestamp` |
| `bond_member.broker_master_loaded` |  | `member_code`, `loaded_by`, `timestamp` |
| `bond_member.access_provisioned` |  | `member_code`, `super_user_id`, `additional_user_id`, `provisioned_by`, `timestamp` |
| `bond_member.settlement_registered` |  | `member_code`, `member_settlement_account`, `verified`, `timestamp` |
| `bond_member.client_settlement_loaded` |  | `member_code`, `client_type`, `settlement_account`, `timestamp` |
| `bond_member.capital_adequacy_confirmed` |  | `member_code`, `confirmed_by`, `timestamp` |
| `bond_member.activated` |  | `member_code`, `activated_by`, `timestamp` |
| `bond_member.suspended` |  | `member_code`, `reason`, `suspended_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  BROKM: Broker Master Maintenance
  STAGN: Settlement Agent and Settlement Details
  CLMNT: Client Account Maintenance
  TRMNT: Transfer and General Ledger Maintenance
  ACDLU: Deal Capture for Controlled Accounts
  SCRAL: Scrip Allocation
  SCRMV: Scrip Movement
settlement_accounts:
  "40071": Non-Member Settled Clearing Account
  "40089": Default Settlement Account
  "40501": Non-Resident Member-Settled Client Settlement Account
  "40519": Resident Member-Settled Client Settlement Account
  "40527": Member Proprietary Settlement Account
general_ledger:
  "11023": Bonds Member Settled Default
  "11031": Bonds Non Member Settled
  "11049": Bonds Member Settled Residents
  "11056": Bonds Member Settled Non Residents
  "11064": Bonds Member Settled Proprietary
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Bond Member Setup Blueprint",
  "description": "Onboarding and configuration of a new bond-market member on the broker back-office system including reference data, settlement accounts, user access, capital ad",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, bond-market, member-onboarding, settlement, reference-data, capital-adequacy, access-control"
}
</script>
