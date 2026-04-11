<!-- AUTO-GENERATED FROM currency-conversion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Currency Conversion

> Convert amounts between currencies using live or cached exchange rates

**Category:** Payment · **Version:** 1.0.0 · **Tags:** currency · exchange-rate · multi-currency · localization · payment · finance

## What this does

Convert amounts between currencies using live or cached exchange rates

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **from_currency** *(text, required)* — From Currency
- **to_currency** *(text, required)* — To Currency
- **amount** *(number, required)* — Amount
- **converted_amount** *(number, optional)* — Converted Amount
- **exchange_rate** *(number, optional)* — Exchange Rate
- **rate_source** *(select, optional)* — Rate Source
- **rate_timestamp** *(datetime, optional)* — Rate Timestamp

## What must be true

- **rate_cache → ttl_seconds:** 3600
- **rate_cache → fallback_to_last_known:** true
- **rate_cache → max_stale_hours:** 24
- **supported_currencies → base_currency:** USD
- **supported_currencies → list:** USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, ZAR, SGD, HKD, KRW, MXN, NZD, SEK, NOK, DKK, PLN
- **rounding → method:** bankers
- **rounding → decimal_places:** 2
- **rounding → zero_decimal_currencies:** JPY, KRW
- **display → format_per_locale:** true
- **display → show_currency_symbol:** true
- **display → show_rate_source:** false
- **settlement → currency:** USD
- **settlement → convert_on_capture:** true

## Success & failure scenarios

**✅ Success paths**

- **Rate Stale Fallback** — when exchange_rate not_exists; rate_timestamp gte "now - 24h", then convert using last known cached rate with fallback indicator.
- **Successful Conversion** — when from_currency in ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL","ZAR","SGD","HKD","KRW","MXN","NZD","SEK","NOK","DKK","PLN"]; to_currency in ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL","ZAR","SGD","HKD","KRW","MXN","NZD","SEK","NOK","DKK","PLN"]; amount gt 0; exchange_rate exists, then return converted amount with rate details and formatted display.

**❌ Failure paths**

- **Unsupported Currency** — when from_currency not_in ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL","ZAR","SGD","HKD","KRW","MXN","NZD","SEK","NOK","DKK","PLN"] OR to_currency not_in ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL","ZAR","SGD","HKD","KRW","MXN","NZD","SEK","NOK","DKK","PLN"], then show "Currency not supported. Please select a supported currency.". *(error: `CONVERSION_UNSUPPORTED_CURRENCY`)*
- **Same Currency** — when from_currency eq "to_currency", then return original amount with exchange rate 1.0. *(error: `CONVERSION_SAME_CURRENCY`)*
- **Rate Unavailable** — when exchange_rate not_exists; rate_timestamp lt "now - 24h", then show "Exchange rate temporarily unavailable. Please try again later.". *(error: `CONVERSION_RATE_UNAVAILABLE`)*

## Errors it can return

- `CONVERSION_UNSUPPORTED_CURRENCY` — The selected currency is not supported
- `CONVERSION_SAME_CURRENCY` — Source and target currencies must be different
- `CONVERSION_RATE_UNAVAILABLE` — Exchange rate temporarily unavailable. Please try again later.
- `CONVERSION_INVALID_AMOUNT` — Please enter a valid amount
- `CONVERSION_VALIDATION_ERROR` — Please check your input and try again

## Connects to

- **cart-checkout** *(recommended)* — Cart totals may need multi-currency display
- **invoicing-payments** *(recommended)* — Invoices in foreign currencies require conversion for settlement
- **payment-gateway** *(optional)* — Gateway may handle conversion at capture time

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/currency-conversion/) · **Spec source:** [`currency-conversion.blueprint.yaml`](./currency-conversion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
