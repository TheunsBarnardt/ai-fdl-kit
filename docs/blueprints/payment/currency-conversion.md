---
title: "Currency Conversion Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Convert amounts between currencies using live or cached exchange rates. 7 fields. 5 outcomes. 5 error codes. rules: rate_cache, supported_currencies, rounding"
---

# Currency Conversion Blueprint

> Convert amounts between currencies using live or cached exchange rates

| | |
|---|---|
| **Feature** | `currency-conversion` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | currency, exchange-rate, multi-currency, localization, payment, finance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/payment/currency-conversion.blueprint.yaml) |
| **JSON API** | [currency-conversion.json]({{ site.baseurl }}/api/blueprints/payment/currency-conversion.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `from_currency` | text | Yes | From Currency | Validations: required, pattern |
| `to_currency` | text | Yes | To Currency | Validations: required, pattern |
| `amount` | number | Yes | Amount | Validations: required, min, max |
| `converted_amount` | number | No | Converted Amount |  |
| `exchange_rate` | number | No | Exchange Rate |  |
| `rate_source` | select | No | Rate Source |  |
| `rate_timestamp` | datetime | No | Rate Timestamp |  |

## Rules

- **rate_cache:**
  - **ttl_seconds:** 3600
  - **fallback_to_last_known:** true
  - **max_stale_hours:** 24
- **supported_currencies:**
  - **base_currency:** USD
  - **list:** USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, ZAR, SGD, HKD, KRW, MXN, NZD, SEK, NOK, DKK, PLN
- **rounding:**
  - **method:** bankers
  - **decimal_places:** 2
  - **zero_decimal_currencies:** JPY, KRW
- **display:**
  - **format_per_locale:** true
  - **show_currency_symbol:** true
  - **show_rate_source:** false
- **settlement:**
  - **currency:** USD
  - **convert_on_capture:** true

## Outcomes

### Unsupported_currency (Priority: 1) — Error: `CONVERSION_UNSUPPORTED_CURRENCY`

**Given:**
- ANY: `from_currency` (input) not_in `USD,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,BRL,ZAR,SGD,HKD,KRW,MXN,NZD,SEK,NOK,DKK,PLN` OR `to_currency` (input) not_in `USD,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,BRL,ZAR,SGD,HKD,KRW,MXN,NZD,SEK,NOK,DKK,PLN`

**Result:** show "Currency not supported. Please select a supported currency."

### Same_currency (Priority: 2) — Error: `CONVERSION_SAME_CURRENCY`

**Given:**
- `from_currency` (input) eq `to_currency`

**Result:** return original amount with exchange rate 1.0

### Rate_unavailable (Priority: 3) — Error: `CONVERSION_RATE_UNAVAILABLE`

**Given:**
- `exchange_rate` (computed) not_exists
- `rate_timestamp` (db) lt `now - 24h`

**Then:**
- **emit_event** event: `rate.fetch_failed`

**Result:** show "Exchange rate temporarily unavailable. Please try again later."

### Rate_stale_fallback (Priority: 4)

**Given:**
- `exchange_rate` (computed) not_exists
- `rate_timestamp` (db) gte `now - 24h`

**Then:**
- **set_field** target: `rate_source` value: `fallback`
- **emit_event** event: `rate.fallback_used`

**Result:** convert using last known cached rate with fallback indicator

### Successful_conversion (Priority: 10) | Transaction: atomic

**Given:**
- `from_currency` (input) in `USD,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,BRL,ZAR,SGD,HKD,KRW,MXN,NZD,SEK,NOK,DKK,PLN`
- `to_currency` (input) in `USD,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,BRL,ZAR,SGD,HKD,KRW,MXN,NZD,SEK,NOK,DKK,PLN`
- `amount` (input) gt `0`
- `exchange_rate` (computed) exists

**Then:**
- **set_field** target: `converted_amount` value: `amount * exchange_rate`
- **set_field** target: `rate_source` value: `live`
- **emit_event** event: `conversion.executed`

**Result:** return converted amount with rate details and formatted display

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONVERSION_UNSUPPORTED_CURRENCY` | 400 | The selected currency is not supported | No |
| `CONVERSION_SAME_CURRENCY` | 400 | Source and target currencies must be different | No |
| `CONVERSION_RATE_UNAVAILABLE` | 503 | Exchange rate temporarily unavailable. Please try again later. | Yes |
| `CONVERSION_INVALID_AMOUNT` | 422 | Please enter a valid amount | Yes |
| `CONVERSION_VALIDATION_ERROR` | 422 | Please check your input and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rate.updated` | Exchange rate cache refreshed from external source | `from_currency`, `to_currency`, `old_rate`, `new_rate`, `rate_source`, `timestamp` |
| `conversion.executed` | Currency conversion completed successfully | `from_currency`, `to_currency`, `amount`, `converted_amount`, `exchange_rate`, `rate_source`, `rate_timestamp`, `timestamp` |
| `rate.fetch_failed` | Failed to fetch live exchange rate from provider | `from_currency`, `to_currency`, `timestamp`, `error_reason` |
| `rate.fallback_used` | Conversion used cached fallback rate instead of live rate | `from_currency`, `to_currency`, `rate_timestamp`, `exchange_rate` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cart-checkout | recommended | Cart totals may need multi-currency display |
| invoicing-payments | recommended | Invoices in foreign currencies require conversion for settlement |
| payment-gateway | optional | Gateway may handle conversion at capture time |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Conversion Blueprint",
  "description": "Convert amounts between currencies using live or cached exchange rates. 7 fields. 5 outcomes. 5 error codes. rules: rate_cache, supported_currencies, rounding",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "currency, exchange-rate, multi-currency, localization, payment, finance"
}
</script>
