<!-- AUTO-GENERATED FROM broker-bond-member-setup.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Bond Member Setup

> Onboarding and configuration of a new bond-market member on the broker back-office system including reference data, settlement accounts, user access, capital adequacy, and trade-processing enablement

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · bond-market · member-onboarding · settlement · reference-data · capital-adequacy · access-control

## What this does

Onboarding and configuration of a new bond-market member on the broker back-office system including reference data, settlement accounts, user access, capital adequacy, and trade-processing enablement

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **member_code** *(text, required)* — Member Code
- **member_legal_name** *(text, required)* — Member Legal Name
- **effective_date** *(date, required)* — Effective Date
- **training_required** *(boolean, optional)* — Training Required
- **cs_officer** *(text, required)* — Assigned Support Officer
- **super_user_id** *(text, required)* — Super User ID
- **additional_user_id** *(text, optional)* — Additional User ID
- **registry_id** *(text, optional)* — Registry Participant ID
- **gilt_user_flag** *(boolean, required)* — Gilt User Indicator
- **party_role** *(select, required)* — Party Role
- **category** *(select, required)* — Category
- **settlement_terms** *(select, required)* — Settlement Terms
- **charge_type** *(select, required)* — Charge Type
- **broker_user_flag** *(boolean, required)* — Broker User Indicator
- **trading_type** *(select, required)* — Trading Type
- **member_settlement_account** *(text, optional)* — Member Proprietary Settlement Account
- **resident_client_settlement_account** *(text, optional)* — Resident Client Settlement Account
- **non_resident_client_settlement_account** *(text, optional)* — Non-Resident Client Settlement Account
- **non_member_settled_clearing_account** *(text, optional)* — Non-Member Settled Clearing Account
- **default_settlement_account** *(text, optional)* — Default Settlement Account
- **settlement_agent_code** *(text, optional)* — Settlement Agent Code
- **funds_account_number** *(text, optional)* — Funds Account Number
- **funds_branch_number** *(text, optional)* — Funds Branch Number
- **scrip_account_number** *(text, optional)* — Scrip Account Number
- **scrip_branch_number** *(text, optional)* — Scrip Branch Number
- **country_code** *(text, required)* — Country Code
- **client_type** *(select, optional)* — Client Type
- **capital_adequacy_confirmed** *(boolean, required)* — Capital Adequacy Confirmed
- **member_status** *(select, required)* — Member Status
- **service_provider_letter** *(file, required)* — Service Provider Appointment Letter
- **membership_approval_reference** *(text, required)* — Membership Approval Reference

## What must be true

- **eligibility → service_provider_appointment:** Member must have formally appointed the service provider in writing to the bond exchange before any loading begins
- **eligibility → membership_approval_required:** Back-office loading may only commence after the bond exchange confirms membership approval and issues a member code
- **eligibility → senior_operator_only:** Only a senior customer-support staff member may load the bond member on the back-office system
- **reference_data → broker_master_indicators:** Member master record must set gilt-user, party role, category, settlement terms, charge type and broker-user indicators at least one day before the live date
- **reference_data → unique_member_code:** Member code must be unique within the back-office system
- **reference_data → broker_master_first:** Broker master record must be updated before access-control provisioning will action the request
- **access_control → external_provisioning_first:** Bond code registry must provision the member on their side and issue a super-user credential before internal access-control can process the request
- **access_control → super_user_and_additional_ids:** Access-control coordinator creates a super-user ID and an additional user ID, with registry ID supplied to the bond code registry for trading-screen access
- **access_control → screen_level_access:** Super-user ID is granted access to the bond-market trading option at the screen level
- **settlement_accounts → proprietary_netting:** Member proprietary settlement account is the netting account for proprietary bond trades and must reconcile with the member's settlement agent
- **settlement_accounts → resident_client_netting:** Resident client settlement account nets market-leg entries for resident member-settled clients and must be linked to the settlement-details record
- **settlement_accounts → non_resident_client_netting:** Non-resident client settlement account nets market-leg entries for non-resident clients and must be linked once the registry code is received
- **settlement_accounts → default_account_routing:** If no settlement account is linked, trades default to the default settlement account and must be investigated
- **settlement_accounts → non_member_settled_clearing:** Non-member settled clearing account is a reverse-substitution account; settlement must not occur there and any settlement entries require investigation
- **settlement_accounts → no_automatic_bond_settlement:** There is no automatic market settlement for bond trades; the member must process cash-book entries and receipt or delivery of holdings manually
- **settlement_details → proprietary_registration:** Settlement-details registration request is triggered to the bond code registry which replies with verified settlement details that auto-populate the master record
- **settlement_details → registry_verification_required:** Settlement-details record must be verified by the bond code registry before the member can commence trading
- **settlement_details → resident_client_details:** Resident member-settled client settlement details are loaded with the local client type, country code ZA, and the resident settlement account
- **settlement_details → non_resident_client_details:** Non-resident member-settled client settlement details are loaded with the non-resident client type, generic foreign country code, and the non-resident settlement account
- **capital_adequacy → surveillance_briefing:** A meeting must be scheduled between the member and the surveillance department before activation so capital-adequacy requirements are formally communicated
- **capital_adequacy → capital_confirmation_before_activation:** Capital-adequacy confirmation from surveillance is a precondition to transitioning the member to active
- **capital_adequacy → ongoing_monitoring:** Non-resident client settlement account must be monitored daily; net positions are generated per stock on T+1
- **trade_processing → end_of_day_batch:** Trades flow from the registry into the back-office system as part of the start-of-day batch run
- **trade_processing → market_leg_auto_posted:** Market leg is automatically posted to the relevant settlement account based on the linked settlement details
- **trade_processing → controlled_accounts_manual:** Trades on controlled client accounts are captured manually on the deal-capture screen and allocated via the scrip-allocation screen
- **security → access_segregation:** Access-control provisioning is segregated from reference-data loading; neither role may perform the other
- **security → audit_trail_retention:** All onboarding steps, approvals, and reference-data changes are logged with user, timestamp and before/after values
- **compliance → popia:** Any personal information captured about authorised representatives of the member must comply with POPIA lawful-basis, minimisation and breach-notification requirements

## Success & failure scenarios

**✅ Success paths**

- **Record Member Application** — when service_provider_letter exists; member_legal_name exists, then create_record; set member_status = "applied"; emit bond_member.applied. _Why: Customer support records the member application once a service-provider letter is lodged._
- **Approve Member After Exchange Confirmation** — when member_status eq "applied"; membership_approval_reference exists; member_code exists, then move member_status applied → approved; emit bond_member.approved. _Why: Transition to approved once the bond exchange has confirmed membership and issued a member code._
- **Load Broker Master Record** — when user_role eq "customer_support_officer"; member_status eq "approved"; gilt_user_flag eq true, then set party_role = "PT"; set category = "C"; set settlement_terms = "AC"; set charge_type = "F"; set broker_user_flag = true; emit bond_member.broker_master_loaded. _Why: Senior customer-support officer loads broker-master indicators at least one day before live date._
- **Provision Access Credentials** — when user_role eq "access_control_coordinator"; super_user_id exists AND broker_master_loaded eq true, then set additional_user_id = "generated"; emit bond_member.access_provisioned. _Why: Access-control coordinator provisions super-user and additional IDs after broker-master is loaded and external registry has provisioned its side._
- **Register Settlement Details** — when member_code exists; trading_type in ["proprietary","client","both"], then call service; set member_settlement_account = "40527"; emit bond_member.settlement_registered. _Why: Trigger settlement-details registration to the bond code registry and store verified reply._
- **Load Resident Client Settlement** — when client_type eq "resident"; trading_type in ["client","both"], then set country_code = "ZA"; set resident_client_settlement_account = "40519"; emit bond_member.client_settlement_loaded. _Why: Load resident member-settled client settlement details with local client type._
- **Load Non Resident Client Settlement** — when client_type eq "non_resident"; trading_type in ["client","both"], then set country_code = "ZZ"; set non_resident_client_settlement_account = "40501"; emit bond_member.client_settlement_loaded. _Why: Load non-resident member-settled client settlement details with generic foreign country code._
- **Confirm Capital Adequacy** — when user_role eq "surveillance_officer"; capital_adequacy_confirmed eq true, then set capital_adequacy_confirmed = true; emit bond_member.capital_adequacy_confirmed. _Why: Surveillance confirms the member has been briefed on and meets capital-adequacy requirements._
- **Activate Bond Member** — when member_status eq "approved"; broker_master_loaded eq true; access_provisioned eq true; settlement_verified eq true; capital_adequacy_confirmed eq true, then move member_status approved → active; emit bond_member.activated. _Why: Activate the member for live bond trading once all preconditions are satisfied._
- **Suspend On Capital Breach** — when user_role eq "surveillance_officer"; member_status eq "active", then move member_status active → suspended; emit bond_member.suspended. _Why: Surveillance may suspend an active member on a capital-adequacy breach._

**❌ Failure paths**

- **Reject Missing Service Provider Letter** — when service_provider_letter not_exists, then emit bond_member.applied. _Why: Application may not be recorded without the written appointment letter._ *(error: `BOND_MEMBER_SERVICE_PROVIDER_LETTER_MISSING`)*
- **Reject Non Senior Loading** — when user_role neq "customer_support_officer", then emit bond_member.broker_master_loaded. _Why: Non-senior users may not load broker-master or settlement data._ *(error: `BOND_MEMBER_ROLE_FORBIDDEN`)*
- **Reject Unverified Settlement** — when settlement_verified eq false, then emit bond_member.settlement_registered. _Why: Member may not be activated while settlement details remain unverified by the bond code registry._ *(error: `BOND_MEMBER_SETTLEMENT_UNVERIFIED`)*
- **Reject Activation Without Capital Confirmation** — when capital_adequacy_confirmed neq true, then emit bond_member.activated. _Why: Block activation until surveillance has confirmed capital adequacy._ *(error: `BOND_MEMBER_CAPITAL_ADEQUACY_NOT_CONFIRMED`)*

## Errors it can return

- `BOND_MEMBER_NOT_APPROVED` — Membership has not been approved by the bond exchange
- `BOND_MEMBER_SERVICE_PROVIDER_LETTER_MISSING` — Service provider appointment letter has not been recorded
- `BOND_MEMBER_DUPLICATE_CODE` — Member code already exists
- `BOND_MEMBER_ACCESS_NOT_PROVISIONED` — External access credentials have not been provisioned
- `BOND_MEMBER_BROKER_MASTER_INCOMPLETE` — Broker master record indicators are incomplete
- `BOND_MEMBER_SETTLEMENT_UNVERIFIED` — Settlement details have not been verified by the bond code registry
- `BOND_MEMBER_CAPITAL_ADEQUACY_NOT_CONFIRMED` — Capital adequacy briefing has not been confirmed by surveillance
- `BOND_MEMBER_ROLE_FORBIDDEN` — Only a senior customer-support officer may perform this action

## Events

**`bond_member.applied`**
  Payload: `member_code`, `member_legal_name`, `effective_date`, `cs_officer`, `timestamp`

**`bond_member.approved`**
  Payload: `member_code`, `membership_approval_reference`, `approved_by`, `timestamp`

**`bond_member.broker_master_loaded`**
  Payload: `member_code`, `loaded_by`, `timestamp`

**`bond_member.access_provisioned`**
  Payload: `member_code`, `super_user_id`, `additional_user_id`, `provisioned_by`, `timestamp`

**`bond_member.settlement_registered`**
  Payload: `member_code`, `member_settlement_account`, `verified`, `timestamp`

**`bond_member.client_settlement_loaded`**
  Payload: `member_code`, `client_type`, `settlement_account`, `timestamp`

**`bond_member.capital_adequacy_confirmed`**
  Payload: `member_code`, `confirmed_by`, `timestamp`

**`bond_member.activated`**
  Payload: `member_code`, `activated_by`, `timestamp`

**`bond_member.suspended`**
  Payload: `member_code`, `reason`, `suspended_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-bond-member-setup/) · **Spec source:** [`broker-bond-member-setup.blueprint.yaml`](./broker-bond-member-setup.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
