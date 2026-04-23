---
title: "Reference Data Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Daily instrument master, trading calendars, session schedules, corporate-action calendar and static reference data. 7 fields. 3 outcomes. 2 error codes. rules: "
---

# Reference Data Management Blueprint

> Daily instrument master, trading calendars, session schedules, corporate-action calendar and static reference data

| | |
|---|---|
| **Feature** | `reference-data-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | reference-data, master-data, instruments, calendars, trading-sessions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/reference-data-management.blueprint.yaml) |
| **JSON API** | [reference-data-management.json]({{ site.baseurl }}/api/blueprints/trading/reference-data-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `isin` | text | Yes | ISIN Code |  |
| `symbol` | text | Yes | Trading Symbol |  |
| `contract_size` | number | Yes | Contract Size (shares per lot) |  |
| `tick_size` | number | Yes | Tick Size (minimum price increment) |  |
| `currency` | text | Yes | Currency |  |
| `segment` | select | Yes | Segment (Equity, Derivatives, Bonds) |  |
| `status` | select | No | Status (Active, Suspended, Delisted) |  |

## Rules

- **master_data:**
  - **isin_uniqueness:** ISIN must be globally unique
  - **symbol_uniqueness:** Symbol must be unique within segment
  - **currency_valid:** Currency must be ISO 4217 code
- **calendars:**
  - **holiday_calendar:** Trading calendar excludes weekends and market holidays
  - **settlement_calendar:** Settlement calendar defines valid settlement dates
  - **corporate_action_calendar:** Calendar tracks all upcoming dividend/rights/corporate actions

## Outcomes

### Load_instrument_master (Priority: 1)

_Load instrument master file at start of trading day_

**Given:**
- `file_type` (input) eq `instrument_master`

**Then:**
- **emit_event** event: `data.loaded`

### Update_trading_calendar (Priority: 2)

_Update trading session schedules_

**Given:**
- `file_type` (input) eq `session_schedule`

**Then:**
- **emit_event** event: `calendar.updated`

### Publish_corporate_action (Priority: 3)

_Publish upcoming corporate action on calendar_

**Given:**
- `file_type` (input) eq `corporate_action_calendar`

**Then:**
- **emit_event** event: `ca_event.published`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSTRUMENT_NOT_FOUND` | 404 | Instrument not in reference data | No |
| `INVALID_CURRENCY` | 400 | Invalid currency code | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.loaded` |  | `file_type`, `record_count`, `timestamp` |
| `calendar.updated` |  | `calendar_type`, `effective_date` |
| `ca_event.published` |  | `isin`, `event_type`, `record_date`, `payment_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trading-gateway-fix | required |  |
| market-data-mitch-udp | required |  |

## AGI Readiness

### Goals

#### Reliable Reference Data Management

Daily instrument master, trading calendars, session schedules, corporate-action calendar and static reference data

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

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `trading_gateway_fix` | trading-gateway-fix | fail |
| `market_data_mitch_udp` | market-data-mitch-udp | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| load_instrument_master | `autonomous` | - | - |
| update_trading_calendar | `supervised` | - | - |
| publish_corporate_action | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  INSTRUMENT:
    - name: ISIN
      offset: 0
      length: 12
      type: string
    - name: Symbol
      offset: 12
      length: 20
      type: string
    - name: ContractSize
      offset: 32
      length: 10
      type: integer
    - name: TickSize
      offset: 42
      length: 8
      type: decimal
    - name: Currency
      offset: 50
      length: 3
      type: string
  SESSION:
    - name: Date
      offset: 0
      length: 8
      type: date
    - name: OpenTime
      offset: 8
      length: 6
      type: time
    - name: CloseTime
      offset: 14
      length: 6
      type: time
    - name: SessionType
      offset: 20
      length: 1
      type: char
instrument_segments:
  - code: EQ
    name: Equity
  - code: DR
    name: Derivatives
  - code: BD
    name: Bonds
  - code: MM
    name: MoneyMarket
delivery_schedule:
  - file_type: instrument_master
    delivery_time: 08:00
    frequency: daily
  - file_type: session_schedule
    delivery_time: 07:00
    frequency: daily
  - file_type: corporate_action_calendar
    delivery_time: 09:00
    frequency: real_time
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Reference Data Management Blueprint",
  "description": "Daily instrument master, trading calendars, session schedules, corporate-action calendar and static reference data. 7 fields. 3 outcomes. 2 error codes. rules: ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "reference-data, master-data, instruments, calendars, trading-sessions"
}
</script>
