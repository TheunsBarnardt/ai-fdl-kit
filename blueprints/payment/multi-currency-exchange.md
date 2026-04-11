<!-- AUTO-GENERATED FROM multi-currency-exchange.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Currency Exchange

> Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses

**Category:** Payment · **Version:** 1.0.0 · **Tags:** multi-currency · exchange-rates · revaluation · forex · erp · accounting

## What this does

Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **from_currency** *(text, required)*
- **to_currency** *(text, required)*
- **exchange_rate** *(number, required)*
- **date** *(date, required)*
- **for_buying** *(boolean, optional)*
- **for_selling** *(boolean, optional)*
- **rounding_loss_allowance** *(number, optional)*
- **company** *(text, required)*
- **posting_date** *(date, required)*
- **accounts** *(json, optional)*
- **gain_loss_booked** *(number, optional)*
- **gain_loss_unbooked** *(number, optional)*

## What must be true

- **same_currency_rejected:** From currency and to currency cannot be the same. Same-currency exchange rate entries are rejected.
- **date_based_lookup:** Exchange rates are fetched by date and currency pair. The most recent rate for the requested date is used.
- **revaluation_journal:** Revaluation creates journal entries for unrealized gain or loss on open foreign currency balances.
- **zero_balance_exclusion:** Zero-balance accounts in foreign currency are excluded from revaluation processing.
- **rounding_loss:** Rounding loss allowance must be between 0 and 1. Amounts within this threshold are written off automatically as rounding loss.
- **direction_flags:** Exchange rates can be flagged for buying, selling, or both directions. Separate rates may exist for each direction.
- **fallback_rate:** When no rate exists for the exact date, the most recent prior rate is used as a fallback.
- **gain_loss_account:** Revaluation gain or loss is posted to a designated exchange gain/loss account in the general ledger.
- **reversal_on_rerun:** Subsequent revaluations reverse previous unrealized entries before posting new ones to avoid double counting.

## Success & failure scenarios

**✅ Success paths**

- **Create Gain Loss Journal** — when revaluation has been completed with non-zero gain/loss amounts; Revaluation account details are available, then Journal entry is created for the unrealized exchange gain or loss and posted to the general ledger.

**❌ Failure paths**

- **Fetch Exchange Rate** — when Source currency is specified; Target currency is specified; Date for rate lookup is specified, then Exchange rate is returned for the specified currency pair and date. *(error: `EXCHANGE_RATE_NOT_FOUND`)*
- **Revalue Accounts** — when Company is specified; Revaluation posting date is specified; at least one foreign currency account has a non-zero balance, then All open foreign currency accounts are revalued and gain/loss amounts calculated. *(error: `REVALUATION_NO_ACCOUNTS`)*

## Errors it can return

- `EXCHANGE_SAME_CURRENCY` — Source and target currencies cannot be the same.
- `EXCHANGE_RATE_NOT_FOUND` — No exchange rate found for the specified currency pair and date.
- `REVALUATION_NO_ACCOUNTS` — No foreign currency accounts with open balances found for revaluation.

## Connects to

- **general-ledger** *(required)* — Revaluation posts journal entries to the general ledger
- **sales-purchase-invoicing** *(recommended)* — Multi-currency invoices require exchange rate conversion

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/multi-currency-exchange/) · **Spec source:** [`multi-currency-exchange.blueprint.yaml`](./multi-currency-exchange.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
