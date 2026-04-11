---
title: "Broker Deal Management Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes,"
---

# Broker Deal Management Upload Blueprint

> Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

| | |
|---|---|
| **Feature** | `broker-deal-management-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, upload, deal-allocation, t+3, trades, fixed-width |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-deal-management-upload.blueprint.yaml) |
| **JSON API** | [broker-deal-management-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-deal-management-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `broker_dealing_room` | Broker Dealing Room | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `record_type` | text | Yes | Record Type |  |
| `broker_code` | text | Yes | Broker Code |  |
| `upload_date` | date | Yes | Upload Date |  |
| `deal_reference` | text | Yes | Deal Reference |  |
| `order_reference` | text | No | Order Reference |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | No | Settlement Date |  |
| `buy_sell_indicator` | select | Yes | Buy Sell Indicator |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `isin` | text | No | Isin |  |
| `quantity` | number | Yes | Quantity |  |
| `price` | number | Yes | Price |  |
| `consideration` | number | No | Consideration |  |
| `trade_time` | text | No | Trade Time |  |
| `client_account` | text | Yes | Client Account |  |
| `external_account_code` | text | No | External Account Code |  |
| `commission_amount` | number | No | Commission Amount |  |
| `charges_amount` | number | No | Charges Amount |  |
| `vat_amount` | number | No | Vat Amount |  |
| `stt_amount` | number | No | Stt Amount |  |
| `allocation_reference` | text | No | Allocation Reference |  |
| `partner_code` | text | No | Partner Code |  |
| `branch_code` | text | No | Branch Code |  |
| `portfolio_code` | text | No | Portfolio Code |  |
| `dealer_code` | text | No | Dealer Code |  |
| `trade_type` | select | No | Trade Type |  |
| `execution_venue` | text | No | Execution Venue |  |
| `counter_party_code` | text | No | Counter Party Code |  |
| `principal_indicator` | select | No | Principal Indicator |  |
| `cancellation_indicator` | select | No | Cancellation Indicator |  |

## Rules

- **submission_modes:** MUST: Support manual submission of deal allocations via FTP process, MUST: Support automated submission of deal allocations via FTP, MUST: Support automated submission of same-day allocations, MUST: Support automated submission of deals upload
- **setup:** MUST: Complete member setup and FTP process configuration before use, MUST: Set up email addresses for notifications
- **validation:** MUST: Validate external account code mapping to internal client account, MUST: Validate trade date, settlement date, and T+3 settlement rules, MUST: Validate buy/sell indicator is B or S, MUST: Reject unbalanced or incomplete allocation records
- **timing:** MUST: Process same-day allocations within business day cutoff, MUST: Process T+3 deal allocations before settlement cutoff, MUST: Support T+2 settlement where applicable per market rules
- **format:** MUST: Use fixed-width upload file format, MUST: Include Header and Trailer records in every upload

## Outcomes

### Manual_deal_allocation_upload (Priority: 1) — Error: `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT`

**Given:**
- `submission_mode` (input) eq `manual_ftp`

**Then:**
- **create_record**
- **emit_event** event: `deal_upload.manual.received`

### Automated_deal_allocation_upload (Priority: 2) — Error: `DEAL_UPLOAD_INVALID_TRADE_DATE`

**Given:**
- `submission_mode` (input) eq `automated_ftp`

**Then:**
- **create_record**
- **emit_event** event: `deal_upload.automated.received`

### Same_day_allocation_upload (Priority: 3)

**Given:**
- `allocation_type` (input) eq `same_day`
- `submission_time` (system) lt `cutoff_time`

**Then:**
- **create_record**
- **emit_event** event: `deal_upload.same_day.received`

### Deals_upload (Priority: 4) — Error: `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND`

**Given:**
- `upload_type` (input) eq `deals`

**Then:**
- **create_record**
- **emit_event** event: `deal_upload.deals.received`

### External_account_mapping (Priority: 5)

**Given:**
- `external_account_code` (input) exists

**Then:**
- **call_service** target: `external_account_mapper`
- **emit_event** event: `deal_upload.external_account.mapped`

### Allocation_cutoff_exceeded (Priority: 6) — Error: `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED`

**Given:**
- `allocation_type` (input) eq `same_day`
- `submission_time` (system) gte `cutoff_time`

**Then:**
- **emit_event** event: `deal_upload.cutoff_exceeded`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT` | 422 | External account code cannot be mapped to a client account | No |
| `DEAL_UPLOAD_INVALID_TRADE_DATE` | 422 | Trade date is invalid or outside allowed window | No |
| `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND` | 422 | Referenced instrument does not exist | No |
| `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED` | 422 | Same-day allocation submitted after cutoff time | No |
| `DEAL_UPLOAD_DUPLICATE_DEAL` | 409 | Deal reference already exists | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |
| broker-financial-data-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Deal Management Upload

Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| manual_deal_allocation_upload | `autonomous` | - | - |
| automated_deal_allocation_upload | `autonomous` | - | - |
| same_day_allocation_upload | `autonomous` | - | - |
| deals_upload | `autonomous` | - | - |
| external_account_mapping | `autonomous` | - | - |
| allocation_cutoff_exceeded | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
upload_types:
  manual_deal_allocation:
    description: Manual submission of deal allocations via FTP
    member_setup_required: true
  automated_deal_allocation:
    description: Automated FTP submission of deal allocations
  same_day_allocation:
    description: Same-day allocations with intraday cutoff
  deals_upload:
    description: Automated deals upload
submission_workflow:
  - 1. Member setup and FTP process configuration
  - 2. Email address set-up
  - 3. Upload file creation per layout
  - 4. FTP or online submission
  - 5. Error reporting
  - 6. Response processing
external_account_mapping:
  description: External account codes provided by broker trading systems are
    mapped to internal account numbers by back-office
settlement_cycles:
  - T+3 standard settlement
  - T+2 settlement (where applicable)
  - Same-day settlement
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Deal Management Upload Blueprint",
  "description": "Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes,",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, deal-allocation, t+3, trades, fixed-width"
}
</script>
