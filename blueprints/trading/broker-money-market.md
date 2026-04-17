<!-- AUTO-GENERATED FROM broker-money-market.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Money Market

> Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated interest capitalisation and reinvestment

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · money-market · call-loan · fixed-term-deposit · deposit-taking-institution · interest-capitalisation · pooled-funds

## What this does

Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated interest capitalisation and reinvestment

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **investment_id** *(text, required)* — Investment Identifier
- **client_account_code** *(text, required)* — Client Account Code
- **borrower_account_code** *(text, required)* — Borrower (Deposit-Taking Institution) Account Code
- **investment_type** *(select, required)* — Investment Type
- **balance_code** *(text, required)* — Money Market Balance Code
- **interest_code** *(text, required)* — Interest Code
- **interest_rate** *(number, required)* — Negotiated Interest Rate Percentage
- **original_capital_amount** *(number, required)* — Original Capital Amount
- **current_balance** *(number, required)* — Current Balance Including Capitalised Interest
- **effective_date** *(date, required)* — Effective Date
- **maturity_date** *(date, optional)* — Maturity Date
- **auto_reinvest_flag** *(boolean, required)* — Auto-Reinvestment Enabled
- **mandate_signed_date** *(date, required)* — Client Money Market Mandate Signed Date
- **pooled_flag** *(boolean, required)* — Funds Pooled with Other Clients
- **withdrawal_instruction** *(boolean, optional)* — Withdrawal Instruction Received
- **investment_status** *(select, required)* — Investment Status
- **capitalisation_frequency** *(select, required)* — Interest Capitalisation Frequency
- **last_capitalised_date** *(date, optional)* — Last Interest Capitalisation Date

## What must be true

- **regulatory → agent_capacity:** Broker acts as agent pooling client funds on clients' behalf; broker is not the principal lender
- **regulatory → mandate_required:** Client must sign a money market mandate before any funds are invested on their behalf
- **regulatory → segregation_of_funds:** Pooled client money market funds must be segregated from broker house funds
- **regulatory → popia_compliance:** Client personal and account information handled under POPIA lawful-basis requirements
- **interest → call_capitalisation:** Daily call investments capitalise interest at calendar month end
- **interest → fixed_term_capitalisation:** Fixed-term investments capitalise interest at maturity date
- **interest → auto_reinvestment:** On maturity, capital plus capitalised interest automatically reinvests at the prevailing rates unless a withdrawal has been instructed
- **interest → rate_sourcing:** Interest rate is negotiated with the deposit-taking institution per interest code and effective date range
- **interest → call_rate_validity:** Call interest codes carry an open-ended validity (no fixed end date)
- **financial → balance_code_required:** All money market debits and credits use specific money market balance codes on the client balance ledger
- **financial → borrower_balance_code:** Borrower balance code must exist on the balance table before funds can be deposited
- **financial → pooled_allocation:** Pooled interest is allocated across participating client accounts in proportion to capital and holding period
- **data_integrity → investment_uniqueness:** Investment identifier must be unique within the broker firm
- **data_integrity → borrower_type:** Borrower accounts must be loaded with account type representing a deposit-taking institution before investments can be made against them
- **data_integrity → audit_trail:** All capital movements, rate changes, and status transitions are logged with actor and timestamp
- **security → rate_change_authorisation:** Changes to interest rates require supervisor authorisation
- **security → segregation_of_duties:** Operator who loaded an investment cannot self-authorise rate changes against it

## Success & failure scenarios

**✅ Success paths**

- **Create Call Investment** — when mandate_signed_date exists; investment_type eq "call"; borrower_account_code exists, then create_record; set capitalisation_frequency = "monthly"; set investment_status = "invested"; emit money_market.investment_created. _Why: Broker operator loads a new daily call investment against a deposit-taking institution after confirming the client mandate is on file._
- **Create Fixed Term Investment** — when investment_type eq "fixed_term"; maturity_date exists; mandate_signed_date exists, then create_record; set capitalisation_frequency = "at_maturity"; set investment_status = "invested"; emit money_market.investment_created. _Why: Broker operator loads a fixed-term deposit with a negotiated rate and maturity date._
- **Capitalise Call Interest Month End** — when investment_type eq "call"; investment_status eq "active", then set current_balance = "computed"; set last_capitalised_date = "computed"; emit money_market.interest_capitalised. _Why: Month-end calendar run capitalises accrued interest on all active daily call investments._
- **Capitalise And Mature Fixed Term** — when investment_type eq "fixed_term"; maturity_date lte "today", then set current_balance = "computed"; move investment_status active → matured; emit money_market.interest_capitalised; emit money_market.investment_matured. _Why: On maturity date, capitalise accrued interest and transition fixed-term investment to matured._
- **Auto Reinvest Matured Investment** — when investment_status eq "matured"; withdrawal_instruction neq true; auto_reinvest_flag eq true, then move investment_status matured → active; emit money_market.auto_reinvested. _Why: Automatically reinvest capital plus capitalised interest at prevailing rates unless a withdrawal was instructed._
- **Process Client Withdrawal** — when withdrawal_instruction eq true; current_balance gt 0, then move investment_status active → withdrawn; emit money_market.withdrawal_processed. _Why: Process a client withdrawal, debiting the money market balance code and crediting the client account._

**❌ Failure paths**

- **Reject Missing Mandate** — when mandate_signed_date not_exists, then emit money_market.investment_created. _Why: Block investment creation if the client has not signed a money market mandate._ *(error: `MM_MANDATE_MISSING`)*
- **Block Reinvestment On Withdrawal** — when withdrawal_instruction eq true, then emit money_market.withdrawal_processed. _Why: Prevent auto-reinvestment when the client has lodged a withdrawal instruction._ *(error: `MM_REINVEST_BLOCKED`)*
- **Reject Unauthorised Rate Change** — when user_role neq "money_market_supervisor", then emit money_market.rate_changed. _Why: Only a money market supervisor may change negotiated interest rates._ *(error: `MM_RATE_UNAUTHORISED`)*
- **Reject Unknown Balance Code** — when balance_code not_exists, then emit money_market.investment_created. _Why: Reject investments that reference a balance code not on the balance table._ *(error: `MM_BALANCE_CODE_UNKNOWN`)*

## Errors it can return

- `MM_MANDATE_MISSING` — Client money market mandate is not on file
- `MM_BORROWER_INVALID` — Borrower account is not a registered deposit-taking institution
- `MM_BALANCE_CODE_UNKNOWN` — Balance code is not defined on the balance table
- `MM_RATE_UNAUTHORISED` — Only a supervisor may change money market interest rates
- `MM_REINVEST_BLOCKED` — Auto-reinvestment blocked because a withdrawal instruction is pending
- `MM_MATURITY_INVALID` — Maturity date is required for fixed-term investments and must be after the effective date
- `MM_WITHDRAWAL_INSUFFICIENT` — Requested withdrawal exceeds available balance

## Events

**`money_market.investment_created`**
  Payload: `investment_id`, `client_account_code`, `borrower_account_code`, `investment_type`, `original_capital_amount`, `effective_date`

**`money_market.investment_activated`**
  Payload: `investment_id`, `activated_by`, `timestamp`

**`money_market.interest_capitalised`**
  Payload: `investment_id`, `period`, `interest_amount`, `new_balance`, `capitalised_at`

**`money_market.investment_matured`**
  Payload: `investment_id`, `maturity_date`, `final_balance`

**`money_market.auto_reinvested`**
  Payload: `investment_id`, `previous_balance`, `new_capital`, `new_rate`, `new_maturity_date`

**`money_market.withdrawal_processed`**
  Payload: `investment_id`, `client_account_code`, `amount`, `processed_by`, `timestamp`

**`money_market.rate_changed`**
  Payload: `interest_code`, `old_rate`, `new_rate`, `effective_date`, `changed_by`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-money-market/) · **Spec source:** [`broker-money-market.blueprint.yaml`](./broker-money-market.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
