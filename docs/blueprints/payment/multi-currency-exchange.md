---
title: "Multi Currency Exchange Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses. 12 fields. 3 outcomes. 3 erro"
---

# Multi Currency Exchange Blueprint

> Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses

| | |
|---|---|
| **Feature** | `multi-currency-exchange` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | multi-currency, exchange-rates, revaluation, forex, erp, accounting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/payment/multi-currency-exchange.blueprint.yaml) |
| **JSON API** | [multi-currency-exchange.json]({{ site.baseurl }}/api/blueprints/payment/multi-currency-exchange.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `from_currency` | text | Yes |  | Validations: pattern |
| `to_currency` | text | Yes |  | Validations: pattern |
| `exchange_rate` | number | Yes |  | Validations: min |
| `date` | date | Yes |  |  |
| `for_buying` | boolean | No |  |  |
| `for_selling` | boolean | No |  |  |
| `rounding_loss_allowance` | number | No |  | Validations: min, max |
| `company` | text | Yes |  | Validations: minLength |
| `posting_date` | date | Yes |  |  |
| `accounts` | json | No |  |  |
| `gain_loss_booked` | number | No |  |  |
| `gain_loss_unbooked` | number | No |  |  |

## Rules

- **same_currency_rejected:**
  - **description:** From currency and to currency cannot be the same. Same-currency exchange rate entries are rejected.

- **date_based_lookup:**
  - **description:** Exchange rates are fetched by date and currency pair. The most recent rate for the requested date is used.

- **revaluation_journal:**
  - **description:** Revaluation creates journal entries for unrealized gain or loss on open foreign currency balances.

- **zero_balance_exclusion:**
  - **description:** Zero-balance accounts in foreign currency are excluded from revaluation processing.

- **rounding_loss:**
  - **description:** Rounding loss allowance must be between 0 and 1. Amounts within this threshold are written off automatically as rounding loss.

- **direction_flags:**
  - **description:** Exchange rates can be flagged for buying, selling, or both directions. Separate rates may exist for each direction.

- **fallback_rate:**
  - **description:** When no rate exists for the exact date, the most recent prior rate is used as a fallback.

- **gain_loss_account:**
  - **description:** Revaluation gain or loss is posted to a designated exchange gain/loss account in the general ledger.

- **reversal_on_rerun:**
  - **description:** Subsequent revaluations reverse previous unrealized entries before posting new ones to avoid double counting.


## Outcomes

### Fetch_exchange_rate — Error: `EXCHANGE_RATE_NOT_FOUND`

**Given:**
- `from_currency` exists
- `to_currency` exists
- `date` exists

**Then:**
- **call_service** target: `exchange_rate_provider` — Fetch exchange rate for the currency pair on the specified date
- **emit_event** event: `exchange_rate.updated`

**Result:** Exchange rate is returned for the specified currency pair and date

### Revalue_accounts — Error: `REVALUATION_NO_ACCOUNTS`

**Given:**
- `company` exists
- `posting_date` exists
- at least one foreign currency account has a non-zero balance

**Then:**
- **call_service** target: `account_revaluation_engine` — Calculate unrealized gain/loss for each open foreign currency account
- **set_field** target: `accounts` — Populated with account balances and calculated gain/loss per account
- **emit_event** event: `revaluation.completed`

**Result:** All open foreign currency accounts are revalued and gain/loss amounts calculated

### Create_gain_loss_journal | Transaction: atomic

**Given:**
- revaluation has been completed with non-zero gain/loss amounts
- `accounts` exists

**Then:**
- **create_record** target: `journal_entry` — Create journal entry posting unrealized exchange gain or loss
- **set_field** target: `gain_loss_booked` — Set to total gain/loss from revaluation
- **emit_event** event: `gain_loss.booked`

**Result:** Journal entry is created for the unrealized exchange gain or loss and posted to the general ledger

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EXCHANGE_SAME_CURRENCY` | 400 | Source and target currencies cannot be the same. | No |
| `EXCHANGE_RATE_NOT_FOUND` | 404 | No exchange rate found for the specified currency pair and date. | No |
| `REVALUATION_NO_ACCOUNTS` | 404 | No foreign currency accounts with open balances found for revaluation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `exchange_rate.updated` | Exchange rate is fetched or manually updated for a currency pair | `from_currency`, `to_currency`, `exchange_rate`, `date` |
| `revaluation.completed` | Account revaluation run completes for a company | `company`, `posting_date`, `total_gain_loss`, `account_count` |
| `gain_loss.booked` | Journal entry for unrealized exchange gain/loss is posted | `journal_entry_id`, `company`, `posting_date`, `gain_loss_booked` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| general-ledger | required | Revaluation posts journal entries to the general ledger |
| sales-purchase-invoicing | recommended | Multi-currency invoices require exchange rate conversion |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python, Frappe Framework, MariaDB/PostgreSQL
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Currency Exchange Blueprint",
  "description": "Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses. 12 fields. 3 outcomes. 3 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "multi-currency, exchange-rates, revaluation, forex, erp, accounting"
}
</script>
