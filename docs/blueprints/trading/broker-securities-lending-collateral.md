---
title: "Broker Securities Lending Collateral Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office securities lending and borrowing (SLB) with cash and securities collateral, loan book, collateral interest, proprietary loans, and central-securitie"
---

# Broker Securities Lending Collateral Blueprint

> Back-office securities lending and borrowing (SLB) with cash and securities collateral, loan book, collateral interest, proprietary loans, and central-securities-depository movement via...

| | |
|---|---|
| **Feature** | `broker-securities-lending-collateral` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, securities-lending, slb, collateral, loan-book, settlement, proprietary |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-securities-lending-collateral.blueprint.yaml) |
| **JSON API** | [broker-securities-lending-collateral.json]({{ site.baseurl }}/api/blueprints/trading/broker-securities-lending-collateral.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `lender` | Securities Lender | external |  |
| `borrower` | Securities Borrower | external |  |
| `slb_operator` | SLB Back-Office Operator | human |  |
| `lending_desk` | Lending Desk | human |  |
| `settlement_authority` | Settlement Authority | external |  |
| `csd_participant` | Central Securities Depository Participant | external |  |
| `back_office_system` | Back-Office System | system |  |
| `settlement_messaging_gateway` | Settlement Messaging Gateway | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `loan_reference` | text | Yes | Loan Reference |  |
| `loan_type` | select | Yes | Loan Type |  |
| `lender_account` | text | Yes | Lender Account |  |
| `borrower_account` | text | Yes | Borrower Account |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `quantity` | number | Yes | Quantity |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `return_date` | date | No | Return Date |  |
| `slb_rate` | number | Yes | SLB Rate |  |
| `collateral_type` | select | Yes | Collateral Type |  |
| `cash_collateral_amount` | number | No | Cash Collateral Amount |  |
| `securities_collateral_code` | text | No | Securities Collateral Instrument Code |  |
| `securities_collateral_quantity` | number | No | Securities Collateral Quantity |  |
| `collateral_haircut_percent` | number | No | Collateral Haircut Percentage |  |
| `interest_code` | text | No | Cash Collateral Interest Code |  |
| `interest_rate` | number | No | Interest Rate |  |
| `turn_rate` | number | No | Turn Rate |  |
| `investment_type` | select | No | Investment Type |  |
| `revaluation_price` | number | No | Revaluation Price |  |
| `proprietary_flag` | boolean | Yes | Proprietary Loan Flag |  |
| `controlled_client_flag` | boolean | Yes | Controlled Client Flag |  |
| `counterparty_code` | text | Yes | Counterparty Code |  |
| `message_requested` | boolean | Yes | Settlement Message Requested |  |
| `message_reference` | text | No | Settlement Message Reference |  |
| `loan_status` | select | Yes | Loan Status |  |

## States

**State field:** `loan_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `pending_settlement` |  |  |
| `active` |  |  |
| `return_pending` |  |  |
| `returned` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `pending_settlement` | slb_operator |  |
|  | `pending_settlement` | `active` | settlement_messaging_gateway |  |
|  | `active` | `return_pending` | slb_operator |  |
|  | `return_pending` | `returned` | settlement_messaging_gateway |  |
|  | `requested` | `cancelled` | slb_operator |  |
|  | `pending_settlement` | `cancelled` | slb_operator |  |

## Rules

- **data_integrity:**
  - **loan_uniqueness:** Loan reference must be unique within broker firm and lending desk
  - **quantity_positive:** Loan quantity must be greater than zero and in whole units
  - **collateral_required:** Every loan must carry either cash or securities collateral, never neither
  - **referential_integrity:** Instrument, lender, and borrower accounts must exist before loan capture
  - **revaluation_audit:** Each loan revaluation retains the prior price, user, and timestamp for audit
- **security:**
  - **segregation_of_duties:** Capture and confirmation are separate actions performed by different operators
  - **access_control:** SLB screens controlled at screen level via resource access control facility
  - **message_authentication:** Outgoing settlement messages must be signed by the settlement-messaging gateway
- **compliance:**
  - **proprietary_segregation:** Proprietary loans are ring-fenced from client loans and reported separately
  - **controlled_client_rules:** Controlled-client loans require internal collateral movement rather than external messaging
  - **loan_reporting:** Open loans reported daily to settlement authority
  - **popia_counterparty_data:** Counterparty natural-person data subject to POPIA lawful-basis and minimisation
- **business:**
  - **slb_rate_bounds:** SLB rate must fall inside the broker's configured minimum and maximum range
  - **collateral_haircut:** Securities collateral valued at market less the configured haircut percentage
  - **interest_accrual:** Cash collateral accrues interest daily at the applicable interest-code rate
  - **turn_rate:** Difference between borrow rate and lend rate is retained as the broker turn
  - **revaluation_required:** Active loans must be revalued at least daily against latest close price
  - **return_symmetry:** Loan return releases collateral in the same direction as original capture
  - **message_bulking:** Multiple SLB or collateral messages may be bulked into a single settlement-messaging batch

## Outcomes

### Capture_securities_loan (Priority: 1) | Transaction: atomic

_Operator captures a new securities lending or borrowing loan with collateral_

**Given:**
- `loan_type` (input) in `lending,borrowing`
- `instrument_code` (input) exists
- `quantity` (input) gt `0`
- ANY: `cash_collateral_amount` (input) gt `0` OR `securities_collateral_code` (input) exists

**Then:**
- **create_record**
- **set_field** target: `loan_status` value: `requested`
- **emit_event** event: `slb.loan.captured`

### Reject_loan_without_collateral (Priority: 2) — Error: `SLB_COLLATERAL_MISSING`

_Reject loan capture where neither cash nor securities collateral is supplied_

**Given:**
- `cash_collateral_amount` (input) not_exists
- `securities_collateral_code` (input) not_exists

**Then:**
- **emit_event** event: `slb.loan.captured`

### Reject_duplicate_loan (Priority: 3) — Error: `SLB_DUPLICATE_REFERENCE`

_Prevent duplicate loan reference within broker firm_

**Given:**
- `loan_reference` (db) exists

**Then:**
- **emit_event** event: `slb.loan.captured`

### Confirm_and_send_settlement_message (Priority: 4) | Transaction: atomic

_Operator confirms loan and settlement message is generated via settlement-messaging gateway_

**Given:**
- `loan_status` (db) eq `requested`
- `message_requested` (input) eq `true`

**Then:**
- **call_service** target: `settlement_messaging_gateway`
- **transition_state** field: `loan_status` from: `requested` to: `pending_settlement`
- **emit_event** event: `slb.message.sent`
- **emit_event** event: `slb.loan.confirmed`

### Activate_loan_on_settlement_intimation (Priority: 5)

_Incoming settlement confirmation from settlement-messaging gateway activates the loan automatically_

**Given:**
- `loan_status` (db) eq `pending_settlement`
- `message_status` (input) eq `settled`

**Then:**
- **transition_state** field: `loan_status` from: `pending_settlement` to: `active`
- **emit_event** event: `slb.loan.activated`

### Revalue_active_loan (Priority: 6) | Transaction: atomic

_Daily revaluation of active loans against the latest close price_

**Given:**
- `loan_status` (db) eq `active`
- `revaluation_price` (input) gt `0`

**Then:**
- **set_field** target: `revaluation_price` value: `updated`
- **emit_event** event: `slb.loan.revalued`

### Top_up_cash_collateral (Priority: 7)

_Operator tops up cash collateral when revaluation shows shortfall_

**Given:**
- `loan_status` (db) eq `active`
- `collateral_type` (db) eq `cash`

**Then:**
- **set_field** target: `cash_collateral_amount` value: `increased`
- **emit_event** event: `slb.collateral.topped_up`

### Accrue_cash_collateral_interest (Priority: 8)

_Daily interest accrual on cash collateral balances at the applicable interest code_

**Given:**
- `collateral_type` (db) eq `cash`
- `loan_status` (db) eq `active`

**Then:**
- **emit_event** event: `slb.collateral.interest_accrued`

### Return_loan_and_release_collateral (Priority: 9) | Transaction: atomic

_Operator processes loan return and releases collateral symmetrically_

**Given:**
- `loan_status` (db) eq `active`
- `return_date` (input) exists

**Then:**
- **transition_state** field: `loan_status` from: `active` to: `return_pending`
- **call_service** target: `settlement_messaging_gateway`
- **emit_event** event: `slb.loan.returned`
- **emit_event** event: `slb.collateral.returned`

### Reject_return_on_inactive_loan (Priority: 10) — Error: `SLB_NOT_ACTIVE`

_Prevent return processing on loans that are not active_

**Given:**
- `loan_status` (db) neq `active`

**Then:**
- **emit_event** event: `slb.loan.returned`

### Enforce_proprietary_role (Priority: 11) — Error: `SLB_PROPRIETARY_FORBIDDEN`

_Only users with proprietary trading role may act on proprietary loans_

**Given:**
- `proprietary_flag` (input) eq `true`
- `user_role` (session) neq `proprietary_trader`

**Then:**
- **emit_event** event: `slb.loan.captured`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLB_DUPLICATE_REFERENCE` | 409 | Loan reference already exists | No |
| `SLB_INVALID_RATE` | 400 | SLB rate outside permitted range | No |
| `SLB_COLLATERAL_MISSING` | 422 | Loan must carry cash or securities collateral | No |
| `SLB_MESSAGE_GENERATION_FAILED` | 503 | Settlement message could not be generated | No |
| `SLB_NOT_ACTIVE` | 409 | Loan is not in an active state, return cannot be processed | No |
| `SLB_INSUFFICIENT_COLLATERAL` | 422 | Collateral value below required coverage after revaluation | No |
| `SLB_PROPRIETARY_FORBIDDEN` | 403 | Proprietary loan actions require proprietary trading role | No |
| `SLB_RETURN_DATE_INVALID` | 400 | Return date must be on or after settlement date | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `slb.loan.captured` |  | `loan_reference`, `lender_account`, `borrower_account`, `instrument_code`, `quantity`, `captured_by`, `timestamp` |
| `slb.loan.confirmed` |  | `loan_reference`, `confirmed_by`, `timestamp` |
| `slb.loan.activated` |  | `loan_reference`, `settlement_date`, `timestamp` |
| `slb.loan.returned` |  | `loan_reference`, `return_date`, `returned_by`, `timestamp` |
| `slb.loan.cancelled` |  | `loan_reference`, `cancelled_by`, `reason`, `timestamp` |
| `slb.collateral.captured` |  | `loan_reference`, `collateral_type`, `amount_or_quantity`, `captured_by`, `timestamp` |
| `slb.collateral.returned` |  | `loan_reference`, `collateral_type`, `returned_by`, `timestamp` |
| `slb.collateral.topped_up` |  | `loan_reference`, `top_up_amount`, `topped_up_by`, `timestamp` |
| `slb.collateral.interest_accrued` |  | `loan_reference`, `accrual_date`, `interest_amount` |
| `slb.loan.revalued` |  | `loan_reference`, `revaluation_price`, `prior_price`, `revalued_by`, `timestamp` |
| `slb.message.sent` |  | `loan_reference`, `message_reference`, `direction`, `timestamp` |
| `slb.message.status_updated` |  | `loan_reference`, `message_reference`, `status`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-securities-lending-borrowing-upload | recommended |  |
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Securities Lending Collateral Blueprint",
  "description": "Back-office securities lending and borrowing (SLB) with cash and securities collateral, loan book, collateral interest, proprietary loans, and central-securitie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, securities-lending, slb, collateral, loan-book, settlement, proprietary"
}
</script>
