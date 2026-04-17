<!-- AUTO-GENERATED FROM broker-securities-lending-collateral.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Securities Lending Collateral

> Back-office securities lending and borrowing (SLB) with cash and securities collateral, loan book, collateral interest, proprietary loans, and central-securities-depository movement via...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · securities-lending · slb · collateral · loan-book · settlement · proprietary

## What this does

Back-office securities lending and borrowing (SLB) with cash and securities collateral, loan book, collateral interest, proprietary loans, and central-securities-depository movement via...

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **loan_reference** *(text, required)* — Loan Reference
- **loan_type** *(select, required)* — Loan Type
- **lender_account** *(text, required)* — Lender Account
- **borrower_account** *(text, required)* — Borrower Account
- **instrument_code** *(text, required)* — Instrument Code
- **quantity** *(number, required)* — Quantity
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, required)* — Settlement Date
- **return_date** *(date, optional)* — Return Date
- **slb_rate** *(number, required)* — SLB Rate
- **collateral_type** *(select, required)* — Collateral Type
- **cash_collateral_amount** *(number, optional)* — Cash Collateral Amount
- **securities_collateral_code** *(text, optional)* — Securities Collateral Instrument Code
- **securities_collateral_quantity** *(number, optional)* — Securities Collateral Quantity
- **collateral_haircut_percent** *(number, optional)* — Collateral Haircut Percentage
- **interest_code** *(text, optional)* — Cash Collateral Interest Code
- **interest_rate** *(number, optional)* — Interest Rate
- **turn_rate** *(number, optional)* — Turn Rate
- **investment_type** *(select, optional)* — Investment Type
- **revaluation_price** *(number, optional)* — Revaluation Price
- **proprietary_flag** *(boolean, required)* — Proprietary Loan Flag
- **controlled_client_flag** *(boolean, required)* — Controlled Client Flag
- **counterparty_code** *(text, required)* — Counterparty Code
- **message_requested** *(boolean, required)* — Settlement Message Requested
- **message_reference** *(text, optional)* — Settlement Message Reference
- **loan_status** *(select, required)* — Loan Status

## What must be true

- **data_integrity → loan_uniqueness:** Loan reference must be unique within broker firm and lending desk
- **data_integrity → quantity_positive:** Loan quantity must be greater than zero and in whole units
- **data_integrity → collateral_required:** Every loan must carry either cash or securities collateral, never neither
- **data_integrity → referential_integrity:** Instrument, lender, and borrower accounts must exist before loan capture
- **data_integrity → revaluation_audit:** Each loan revaluation retains the prior price, user, and timestamp for audit
- **security → segregation_of_duties:** Capture and confirmation are separate actions performed by different operators
- **security → access_control:** SLB screens controlled at screen level via resource access control facility
- **security → message_authentication:** Outgoing settlement messages must be signed by the settlement-messaging gateway
- **compliance → proprietary_segregation:** Proprietary loans are ring-fenced from client loans and reported separately
- **compliance → controlled_client_rules:** Controlled-client loans require internal collateral movement rather than external messaging
- **compliance → loan_reporting:** Open loans reported daily to settlement authority
- **compliance → popia_counterparty_data:** Counterparty natural-person data subject to POPIA lawful-basis and minimisation
- **business → slb_rate_bounds:** SLB rate must fall inside the broker's configured minimum and maximum range
- **business → collateral_haircut:** Securities collateral valued at market less the configured haircut percentage
- **business → interest_accrual:** Cash collateral accrues interest daily at the applicable interest-code rate
- **business → turn_rate:** Difference between borrow rate and lend rate is retained as the broker turn
- **business → revaluation_required:** Active loans must be revalued at least daily against latest close price
- **business → return_symmetry:** Loan return releases collateral in the same direction as original capture
- **business → message_bulking:** Multiple SLB or collateral messages may be bulked into a single settlement-messaging batch

## Success & failure scenarios

**✅ Success paths**

- **Capture Securities Loan** — when loan_type in ["lending","borrowing"]; instrument_code exists; quantity gt 0; cash_collateral_amount gt 0 OR securities_collateral_code exists, then create_record; set loan_status = "requested"; emit slb.loan.captured. _Why: Operator captures a new securities lending or borrowing loan with collateral._
- **Confirm And Send Settlement Message** — when loan_status eq "requested"; message_requested eq true, then call service; move loan_status requested → pending_settlement; emit slb.message.sent; emit slb.loan.confirmed. _Why: Operator confirms loan and settlement message is generated via settlement-messaging gateway._
- **Activate Loan On Settlement Intimation** — when loan_status eq "pending_settlement"; message_status eq "settled", then move loan_status pending_settlement → active; emit slb.loan.activated. _Why: Incoming settlement confirmation from settlement-messaging gateway activates the loan automatically._
- **Revalue Active Loan** — when loan_status eq "active"; revaluation_price gt 0, then set revaluation_price = "updated"; emit slb.loan.revalued. _Why: Daily revaluation of active loans against the latest close price._
- **Top Up Cash Collateral** — when loan_status eq "active"; collateral_type eq "cash", then set cash_collateral_amount = "increased"; emit slb.collateral.topped_up. _Why: Operator tops up cash collateral when revaluation shows shortfall._
- **Accrue Cash Collateral Interest** — when collateral_type eq "cash"; loan_status eq "active", then emit slb.collateral.interest_accrued. _Why: Daily interest accrual on cash collateral balances at the applicable interest code._
- **Return Loan And Release Collateral** — when loan_status eq "active"; return_date exists, then move loan_status active → return_pending; call service; emit slb.loan.returned; emit slb.collateral.returned. _Why: Operator processes loan return and releases collateral symmetrically._

**❌ Failure paths**

- **Reject Loan Without Collateral** — when cash_collateral_amount not_exists; securities_collateral_code not_exists, then emit slb.loan.captured. _Why: Reject loan capture where neither cash nor securities collateral is supplied._ *(error: `SLB_COLLATERAL_MISSING`)*
- **Reject Duplicate Loan** — when loan_reference exists, then emit slb.loan.captured. _Why: Prevent duplicate loan reference within broker firm._ *(error: `SLB_DUPLICATE_REFERENCE`)*
- **Reject Return On Inactive Loan** — when loan_status neq "active", then emit slb.loan.returned. _Why: Prevent return processing on loans that are not active._ *(error: `SLB_NOT_ACTIVE`)*
- **Enforce Proprietary Role** — when proprietary_flag eq true; user_role neq "proprietary_trader", then emit slb.loan.captured. _Why: Only users with proprietary trading role may act on proprietary loans._ *(error: `SLB_PROPRIETARY_FORBIDDEN`)*

## Errors it can return

- `SLB_DUPLICATE_REFERENCE` — Loan reference already exists
- `SLB_INVALID_RATE` — SLB rate outside permitted range
- `SLB_COLLATERAL_MISSING` — Loan must carry cash or securities collateral
- `SLB_MESSAGE_GENERATION_FAILED` — Settlement message could not be generated
- `SLB_NOT_ACTIVE` — Loan is not in an active state, return cannot be processed
- `SLB_INSUFFICIENT_COLLATERAL` — Collateral value below required coverage after revaluation
- `SLB_PROPRIETARY_FORBIDDEN` — Proprietary loan actions require proprietary trading role
- `SLB_RETURN_DATE_INVALID` — Return date must be on or after settlement date

## Events

**`slb.loan.captured`**
  Payload: `loan_reference`, `lender_account`, `borrower_account`, `instrument_code`, `quantity`, `captured_by`, `timestamp`

**`slb.loan.confirmed`**
  Payload: `loan_reference`, `confirmed_by`, `timestamp`

**`slb.loan.activated`**
  Payload: `loan_reference`, `settlement_date`, `timestamp`

**`slb.loan.returned`**
  Payload: `loan_reference`, `return_date`, `returned_by`, `timestamp`

**`slb.loan.cancelled`**
  Payload: `loan_reference`, `cancelled_by`, `reason`, `timestamp`

**`slb.collateral.captured`**
  Payload: `loan_reference`, `collateral_type`, `amount_or_quantity`, `captured_by`, `timestamp`

**`slb.collateral.returned`**
  Payload: `loan_reference`, `collateral_type`, `returned_by`, `timestamp`

**`slb.collateral.topped_up`**
  Payload: `loan_reference`, `top_up_amount`, `topped_up_by`, `timestamp`

**`slb.collateral.interest_accrued`**
  Payload: `loan_reference`, `accrual_date`, `interest_amount`

**`slb.loan.revalued`**
  Payload: `loan_reference`, `revaluation_price`, `prior_price`, `revalued_by`, `timestamp`

**`slb.message.sent`**
  Payload: `loan_reference`, `message_reference`, `direction`, `timestamp`

**`slb.message.status_updated`**
  Payload: `loan_reference`, `message_reference`, `status`, `timestamp`

## Connects to

- **broker-securities-lending-borrowing-upload** *(recommended)*
- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-securities-lending-collateral/) · **Spec source:** [`broker-securities-lending-collateral.blueprint.yaml`](./broker-securities-lending-collateral.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
