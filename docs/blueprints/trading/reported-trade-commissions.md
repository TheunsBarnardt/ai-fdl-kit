---
title: "Reported Trade Commissions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.. 11 fields. 5 outcomes. 9 error codes. rul"
---

# Reported Trade Commissions Blueprint

> Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.

| | |
|---|---|
| **Feature** | `reported-trade-commissions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | commission, trade-matching, counterparty, post-trade, financial-services |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/reported-trade-commissions.blueprint.yaml) |
| **JSON API** | [reported-trade-commissions.json]({{ site.baseurl }}/api/blueprints/trading/reported-trade-commissions.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_reference` | text | Yes | Client Reference | Validations: required, pattern |
| `commission_reference` | token | Yes | Commission Reference | Validations: required, pattern |
| `commission_amount` | number | Yes | Commission Amount | Validations: required, min |
| `trade_id` | token | Yes | Trade ID | Validations: required, pattern |
| `initiating_member` | text | Yes | Initiating Trading Member | Validations: required, pattern |
| `counterparty_member` | text | Yes | Counterparty Trading Member | Validations: required, pattern |
| `commission_scenario` | select | Yes | Commission Scenario | Validations: required, oneOf |
| `trade_system_match_id` | token | Yes | Trading System Match ID | Validations: required, pattern |
| `buy_leg_trade_id` | token | No | Buy Leg Trade ID | Validations: pattern |
| `sell_leg_trade_id` | token | No | Sell Leg Trade ID | Validations: pattern |
| `currency` | select | Yes | Currency | Validations: required, oneOf |

## Rules

- **commission_charging_rules:**
  - **member_must_have_counterparty_code:** Counterparty code must exist in JSE counterparty codes file
  - **client_reference_identifies_member:** ClientReference field must contain counterparty member or branch code
  - **commission_reference_identifies_trade:** CommissionReference must identify the unique trade common to buy and sell legs
  - **trade_system_validation:** Trade identifier must be from Trading System (APE Tag 1003) or RTC TradingSystemMatchID
  - **reference_field_alignment:** Reference fields must be aligned across front-end solutions for efficient processing
- **trade_matching_requirements:**
  - **both_legs_must_match:** Buy and sell legs must reference same trading system match ID
  - **symbol_must_match:** Instrument symbol must match between counterparties
  - **trade_size_must_match:** Trade size must match between counterparties
  - **trade_price_must_match:** Trade price must match between counterparties
  - **trade_subtype_must_match:** Trade sub type must match between counterparties
  - **trade_date_time_must_match:** Date and time trade was agreed must match between counterparties
- **commission_scenario_rules:**
  - **broker_to_both_parties:** Member brokers deal between own client and another member, charging commissions to both
  - **inter_dealer_give_up:** Inter-dealer broker executes on behalf of member, charges commission when giving up trade
  - **executing_broker_client_give_up:** Executing broker gives up trade to client member, charges commission; two variations exist
- **give_up_mechanism:**
  - **assign_mechanism_preferred:** Give-ups should be achieved through assign mechanism in deal management when possible
  - **reported_trade_fallback:** Reported trade may be used for give-up if executing broker cannot wait for counterparty acceptance
  - **negotiated_trade_restriction:** Executing broker using negotiated trade can effect give-up via reported trade only as fallback
- **eod_processing:**
  - **clearing_member_processing:** Clearing members must process commissions at EOD using reference fields
  - **counterparty_recognition:** Reference fields must enable counterparty to recognize and process commission
  - **commission_message_format:** Commission entry message must contain properly populated clientReference and commissionReference

## Outcomes

### Commission_charged_successfully (Priority: 1) | Transaction: atomic

_Commission successfully charged to counterparty in reported trade_

**Given:**
- `client_reference` (input) matches `^[A-Z0-9]{3,20}$`
- `commission_reference` (input) matches `^[A-Za-z0-9_-]{1,50}$`
- `trade_system_match_id` (db) exists
- ALL: `buy_leg_trade_id` (db) exists AND `sell_leg_trade_id` (db) exists AND `trade_system_match_id` (db) eq `matched_on_both_legs`
- `commission_amount` (input) gt `0`

**Then:**
- **create_record** target: `commission_entry` — Create commission entry for counterparty
- **emit_event** event: `commission.charged`
- **set_field** target: `commission_status` value: `submitted` — Mark commission as submitted

### Commission_rejected_invalid_client_reference (Priority: 2) — Error: `INVALID_CLIENT_REFERENCE`

_Client reference does not match counterparty member code format_

**Given:**
- `client_reference` (input) neq `^[A-Z0-9]{3,20}$`

**Then:**
- **emit_event** event: `commission.rejected`
- **set_field** target: `commission_status` value: `rejected`

### Commission_rejected_invalid_reference (Priority: 3) — Error: `INVALID_COMMISSION_REFERENCE`

_Commission reference does not reference valid trade identifier_

**Given:**
- `trade_system_match_id` (db) not_exists

**Then:**
- **emit_event** event: `commission.rejected`

### Trade_leg_mismatch (Priority: 4) — Error: `TRADE_LEGS_MISMATCH`

_Buy and sell legs do not reference same trading system match ID_

**Given:**
- ANY: `buy_leg_trade_id` (db) not_exists OR `sell_leg_trade_id` (db) not_exists

**Then:**
- **emit_event** event: `commission.rejected`

### Commission_zero_or_negative (Priority: 5) — Error: `INVALID_COMMISSION_AMOUNT`

_Commission amount must be positive_

**Given:**
- `commission_amount` (input) lte `0`

**Then:**
- **emit_event** event: `commission.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_CLIENT_REFERENCE` | 422 | Client reference does not match counterparty member code format (required: alphanumeric 3-20 chars) | No |
| `INVALID_COMMISSION_REFERENCE` | 422 | Commission reference does not identify a valid trade; verify trading system match ID exists | No |
| `TRADE_LEGS_MISMATCH` | 409 | Buy and sell legs of the trade do not reference the same trading system match ID | No |
| `INVALID_COMMISSION_AMOUNT` | 422 | Commission amount must be greater than zero | No |
| `MEMBER_NOT_AUTHORIZED` | 403 | Initiating member not authorized to charge commission to counterparty | No |
| `COUNTERPARTY_NOT_FOUND` | 404 | Counterparty member code not found in JSE counterparty codes file | No |
| `TRADE_NOT_FOUND` | 404 | Trade with specified identifier not found in trading system | No |
| `COMMISSION_ALREADY_SUBMITTED` | 409 | Commission has already been submitted for this trade | No |
| `EOD_PROCESSING_ERROR` | 500 | Error adding commission to EOD processing batch | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `commission.charged` | Commission successfully charged to counterparty | `initiating_member`, `counterparty_member`, `commission_amount`, `commission_reference`, `timestamp` |
| `commission.rejected` | Commission submission rejected | `commission_reference`, `error_code`, `error_message`, `timestamp` |
| `commission.acknowledged` | Counterparty acknowledged commission receipt | `commission_reference`, `counterparty_member`, `acknowledged_at` |
| `commission.settled` | Commission settled at EOD | `commission_reference`, `settlement_time`, `final_amount` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trade-matching | required |  |
| off-book-reported-trades | required |  |
| eod-commission-settlement | recommended |  |
| member-code-validation | required |  |
| popia-compliance | required |  |

## AGI Readiness

### Goals

#### Reliable Reported Trade Commissions

Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `trade_matching` | trade-matching | fail |
| `off_book_reported_trades` | off-book-reported-trades | fail |
| `member_code_validation` | member-code-validation | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| commission_charged_successfully | `autonomous` | - | - |
| commission_rejected_invalid_client_reference | `supervised` | - | - |
| commission_rejected_invalid_reference | `supervised` | - | - |
| trade_leg_mismatch | `autonomous` | - | - |
| commission_zero_or_negative | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
member_broker_scenario:
  description: Member brokers deal between own client and another member
  commission_to_own_client: true
  commission_to_other_member: true
  initiating_member_is_broker: true
inter_dealer_scenario:
  description: Inter-dealer broker executes on behalf of trading member
  initiating_member_is_broker: true
  charges_on_give_up: true
  give_up_method: assign_or_reported_trade
executing_broker_scenario:
  description: Executing broker gives up trade to client's member
  initiating_member_is_executor: true
  charges_on_give_up: true
  execution_variation_direct_order: Client places order directly with executor
  execution_variation_outsourced: Client's member outsources execution to executor
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Reported Trade Commissions Blueprint",
  "description": "Charge commissions to counterparty trading members in reported trades via reference fields and matching requirements.. 11 fields. 5 outcomes. 9 error codes. rul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "commission, trade-matching, counterparty, post-trade, financial-services"
}
</script>
