---
title: "Broker Credit Limit Dissemination Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.. 9 fields. 5 outco"
---

# Broker Credit Limit Dissemination Blueprint

> Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.

| | |
|---|---|
| **Feature** | `broker-credit-limit-dissemination` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | credit-limit, pre-trade-risk, dissemination, risk-management, broker-feed |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-credit-limit-dissemination.blueprint.yaml) |
| **JSON API** | [broker-credit-limit-dissemination.json]({{ site.baseurl }}/api/blueprints/trading/broker-credit-limit-dissemination.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `back_office_system` | Back-office clearing and settlement system | system |  |
| `broker_trading_system` | Broker order management / trading system | system |  |
| `risk_officer` | Broker risk officer | human |  |
| `member_firm` | Subscribing member firm | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `broker_code` | text | Yes | Broker code | Validations: pattern |
| `account_code` | text | Yes | Account code | Validations: pattern |
| `valuation_date` | date | Yes | Valuation date |  |
| `credit_limit_amount_code` | select | Yes | Credit limit type |  |
| `credit_limit_amount` | number | Yes | Credit limit amount |  |
| `currency` | text | No | Limit currency | Validations: pattern |
| `limit_scope` | select | No | Limit scope |  |
| `utilised_amount` | number | No | Current utilised amount |  |
| `run_date` | date | Yes | Dissemination run date |  |

## Rules

- **general:**
  - **rule_1:** A credit limit record must exist for every counter-party account before orders may be routed.
  - **rule_2:** Three limit types are supported: PF (portfolio-derived, one-day validity), ST (static), UP (broker-uploaded, one-day validity).
  - **rule_3:** PF and UP limits automatically expire after one trading day unless refreshed.
  - **rule_4:** Broker trading systems must perform a pre-trade check against the latest disseminated limit and reject orders that would breach it.
  - **rule_5:** End-of-day file is delivered via secure file transfer; real-time updates use push messages for intra-day changes.
  - **rule_6:** Members must register in writing by Thursday 09:00 to begin receiving the feed from the following Monday.
  - **rule_7:** No historical limit data is disseminated — only the current active limit per account.
  - **rule_8:** Every record carries broker code, record type BC, sub-type 01 and continuation sequence 01.
  - **rule_9:** Breaches must emit an alert to the broker risk desk and be logged for audit.

## Outcomes

### Block_order_on_breach (Priority: 1) — Error: `ORDER_BLOCKED_CREDIT_LIMIT` | Transaction: atomic

_Reject an inbound order that would cause utilisation to exceed the account credit limit._

**Given:**
- `projected_utilisation` (computed) gt `credit_limit_amount`

**Then:**
- **transition_state** field: `order_status` from: `received` to: `rejected`
- **emit_event** event: `order.blocked_credit_limit`
- **notify**

### Breach_alert (Priority: 2) — Error: `CREDIT_LIMIT_BREACHED`

_Raise an alert when utilisation approaches or exceeds the limit._

**Given:**
- `utilised_amount` (computed) gte `credit_limit_amount`

**Then:**
- **notify**
- **notify**
- **emit_event** event: `credit_limit.breached`

### Missing_limit_record (Priority: 3) — Error: `NO_CREDIT_LIMIT_ON_FILE`

_Block trading on an account that has no active credit limit on file._

**Given:**
- `credit_limit_amount` (db) not_exists

**Then:**
- **transition_state** field: `order_status` from: `received` to: `rejected`
- **emit_event** event: `order.blocked_no_limit`

### Push_limit_update (Priority: 5)

_Push an intra-day limit update to the broker trading system when a limit changes._

**Given:**
- `limit_changed` (system) eq `true`

**Then:**
- **call_service** target: `broker_trading_system_push`
- **set_field** target: `last_pushed_at` value: `now`
- **emit_event** event: `credit_limit.updated`

### Disseminate_limits_eod (Priority: 10) | Transaction: atomic

_Produce the end-of-day credit limit file for every subscribing broker._

**Given:**
- `eod_cycle` (system) eq `complete`
- `subscription_active` (db) eq `true`

**Then:**
- **create_record**
- **call_service** target: `sftp_delivery`
- **emit_event** event: `credit_limit.eod_disseminated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_LIMIT_BREACHED` | 409 | Account credit limit has been breached. | No |
| `ORDER_BLOCKED_CREDIT_LIMIT` | 409 | Order rejected — would exceed account credit limit. | No |
| `NO_CREDIT_LIMIT_ON_FILE` | 409 | No active credit limit on file for this account. | No |
| `INVALID_LIMIT_TYPE` | 422 | Credit limit type must be PF, ST or UP. | No |
| `SUBSCRIPTION_NOT_ACTIVE` | 403 | Broker is not subscribed to the credit limit feed. | No |
| `FEED_DELIVERY_FAILED` | 503 | Credit limit feed delivery failed — retry scheduled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit_limit.eod_disseminated` |  | `broker_code`, `run_date`, `record_count` |
| `credit_limit.updated` |  | `broker_code`, `account_code`, `credit_limit_amount`, `credit_limit_amount_code`, `valuation_date` |
| `credit_limit.breached` |  | `broker_code`, `account_code`, `utilised_amount`, `credit_limit_amount` |
| `order.blocked_credit_limit` |  | `broker_code`, `account_code`, `order_id`, `credit_limit_amount` |
| `order.blocked_no_limit` |  | `broker_code`, `account_code`, `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |

## AGI Readiness

### Goals

#### Reliable Broker Credit Limit Dissemination

Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.

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
| disseminate_limits_eod | `autonomous` | - | - |
| push_limit_update | `supervised` | - | - |
| breach_alert | `autonomous` | - | - |
| block_order_on_breach | `human_required` | - | - |
| missing_limit_record | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_type_map:
  BC_01_01:
    record_type: BC
    sub_type: "01"
    sequence: "01"
    description: Client credit limit record
record_layouts:
  LEADING:
    description: Leading record layout wrapping every disseminated credit limit record.
    length: 148
    fields:
      - name: broker_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: filler_packed_sequence
        start: 4
        length: 7
        end: 10
        type: packed
      - name: record_type
        start: 11
        length: 3
        end: 13
        type: text
      - name: sub_record_type
        start: 14
        length: 2
        end: 15
        type: text
      - name: continuation_sequence_number
        start: 16
        length: 2
        end: 17
        type: numeric
      - name: filler
        start: 18
        length: 14
        end: 31
        type: text
      - name: run_date
        start: 32
        length: 8
        end: 39
        type: date_ccyymmdd
      - name: data
        start: 40
        length: 109
        end: 148
        type: text
  CC:
    description: Client credit limit payload (Record Type BC, Sub Type 01, Sequence 01).
    length: 32
    fields:
      - name: account_code
        start: 40
        length: 7
        end: 46
        type: numeric
      - name: valuation_date
        start: 47
        length: 8
        end: 54
        type: date_ccyymmdd
      - name: credit_limit_amount_code
        start: 55
        length: 2
        end: 56
        type: text
      - name: credit_limit_amount
        start: 57
        length: 15
        end: 71
        type: numeric
limit_type_codes:
  PF: Portfolio-valuation-derived credit limit (valid one day).
  ST: Static broker-maintained credit limit.
  UP: Broker-uploaded credit limit (valid one day).
delivery:
  channel: sftp
  cadence: end_of_day
  realtime_updates: push
  subscription_cutoff: Thursday 09:00 for following Monday activation
  historical_data: false
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Credit Limit Dissemination Blueprint",
  "description": "Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.. 9 fields. 5 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "credit-limit, pre-trade-risk, dissemination, risk-management, broker-feed"
}
</script>
