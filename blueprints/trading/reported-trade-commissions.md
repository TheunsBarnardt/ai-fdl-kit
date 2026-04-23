<!-- AUTO-GENERATED FROM reported-trade-commissions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Reported Trade Commissions

> Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** commission · trade-matching · counterparty · post-trade · financial-services

## What this does

Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_reference** *(text, required)* — Client Reference
- **commission_reference** *(token, required)* — Commission Reference
- **commission_amount** *(number, required)* — Commission Amount
- **trade_id** *(token, required)* — Trade ID
- **initiating_member** *(text, required)* — Initiating Trading Member
- **counterparty_member** *(text, required)* — Counterparty Trading Member
- **commission_scenario** *(select, required)* — Commission Scenario
- **trade_system_match_id** *(token, required)* — Trading System Match ID
- **buy_leg_trade_id** *(token, optional)* — Buy Leg Trade ID
- **sell_leg_trade_id** *(token, optional)* — Sell Leg Trade ID
- **currency** *(select, required)* — Currency

## What must be true

- **commission_charging_rules → member_must_have_counterparty_code:** Counterparty code must exist in JSE counterparty codes file
- **commission_charging_rules → client_reference_identifies_member:** ClientReference field must contain counterparty member or branch code
- **commission_charging_rules → commission_reference_identifies_trade:** CommissionReference must identify the unique trade common to buy and sell legs
- **commission_charging_rules → trade_system_validation:** Trade identifier must be from Trading System (APE Tag 1003) or RTC TradingSystemMatchID
- **commission_charging_rules → reference_field_alignment:** Reference fields must be aligned across front-end solutions for efficient processing
- **trade_matching_requirements → both_legs_must_match:** Buy and sell legs must reference same trading system match ID
- **trade_matching_requirements → symbol_must_match:** Instrument symbol must match between counterparties
- **trade_matching_requirements → trade_size_must_match:** Trade size must match between counterparties
- **trade_matching_requirements → trade_price_must_match:** Trade price must match between counterparties
- **trade_matching_requirements → trade_subtype_must_match:** Trade sub type must match between counterparties
- **trade_matching_requirements → trade_date_time_must_match:** Date and time trade was agreed must match between counterparties
- **commission_scenario_rules → broker_to_both_parties:** Member brokers deal between own client and another member, charging commissions to both
- **commission_scenario_rules → inter_dealer_give_up:** Inter-dealer broker executes on behalf of member, charges commission when giving up trade
- **commission_scenario_rules → executing_broker_client_give_up:** Executing broker gives up trade to client member, charges commission; two variations exist
- **give_up_mechanism → assign_mechanism_preferred:** Give-ups should be achieved through assign mechanism in deal management when possible
- **give_up_mechanism → reported_trade_fallback:** Reported trade may be used for give-up if executing broker cannot wait for counterparty acceptance
- **give_up_mechanism → negotiated_trade_restriction:** Executing broker using negotiated trade can effect give-up via reported trade only as fallback
- **eod_processing → clearing_member_processing:** Clearing members must process commissions at EOD using reference fields
- **eod_processing → counterparty_recognition:** Reference fields must enable counterparty to recognize and process commission
- **eod_processing → commission_message_format:** Commission entry message must contain properly populated clientReference and commissionReference

## Success & failure scenarios

**✅ Success paths**

- **Commission Charged Successfully** — when Client reference matches counterparty member code format; Commission reference matches trade identifier format; Trade exists in trading system with matching ID; buy_leg_trade_id exists AND sell_leg_trade_id exists AND Both trade legs reference same trading system match ID; Commission amount is positive, then Create commission entry for counterparty; emit commission.charged; Mark commission as submitted. _Why: Commission successfully charged to counterparty in reported trade._

**❌ Failure paths**

- **Commission Rejected Invalid Client Reference** — when client_reference neq "^[A-Z0-9]{3,20}$", then emit commission.rejected; set commission_status = "rejected". _Why: Client reference does not match counterparty member code format._ *(error: `INVALID_CLIENT_REFERENCE`)*
- **Commission Rejected Invalid Reference** — when trade_system_match_id not_exists, then emit commission.rejected. _Why: Commission reference does not reference valid trade identifier._ *(error: `INVALID_COMMISSION_REFERENCE`)*
- **Trade Leg Mismatch** — when buy_leg_trade_id not_exists OR sell_leg_trade_id not_exists, then emit commission.rejected. _Why: Buy and sell legs do not reference same trading system match ID._ *(error: `TRADE_LEGS_MISMATCH`)*
- **Commission Zero Or Negative** — when commission_amount lte 0, then emit commission.rejected. _Why: Commission amount must be positive._ *(error: `INVALID_COMMISSION_AMOUNT`)*

## Errors it can return

- `INVALID_CLIENT_REFERENCE` — Client reference does not match counterparty member code format (required: alphanumeric 3-20 chars)
- `INVALID_COMMISSION_REFERENCE` — Commission reference does not identify a valid trade; verify trading system match ID exists
- `TRADE_LEGS_MISMATCH` — Buy and sell legs of the trade do not reference the same trading system match ID
- `INVALID_COMMISSION_AMOUNT` — Commission amount must be greater than zero
- `MEMBER_NOT_AUTHORIZED` — Initiating member not authorized to charge commission to counterparty
- `COUNTERPARTY_NOT_FOUND` — Counterparty member code not found in JSE counterparty codes file
- `TRADE_NOT_FOUND` — Trade with specified identifier not found in trading system
- `COMMISSION_ALREADY_SUBMITTED` — Commission has already been submitted for this trade
- `EOD_PROCESSING_ERROR` — Error adding commission to EOD processing batch

## Events

**`commission.charged`** — Commission successfully charged to counterparty
  Payload: `initiating_member`, `counterparty_member`, `commission_amount`, `commission_reference`, `timestamp`

**`commission.rejected`** — Commission submission rejected
  Payload: `commission_reference`, `error_code`, `error_message`, `timestamp`

**`commission.acknowledged`** — Counterparty acknowledged commission receipt
  Payload: `commission_reference`, `counterparty_member`, `acknowledged_at`

**`commission.settled`** — Commission settled at EOD
  Payload: `commission_reference`, `settlement_time`, `final_amount`

## Connects to

- **trade-matching** *(required)*
- **off-book-reported-trades** *(required)*
- **eod-commission-settlement** *(recommended)*
- **member-code-validation** *(required)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████████` | 10/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/reported-trade-commissions/) · **Spec source:** [`reported-trade-commissions.blueprint.yaml`](./reported-trade-commissions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
