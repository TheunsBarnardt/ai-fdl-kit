---
title: "Internationalization Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Internationalization with locale switching, translation keys, pluralization, and RTL support. 5 fields. 7 outcomes. 4 error codes. rules: fallback, message_form"
---

# Internationalization Blueprint

> Internationalization with locale switching, translation keys, pluralization, and RTL support

| | |
|---|---|
| **Feature** | `internationalization` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | i18n, localization, translation, rtl, locale, internationalization, ui |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/internationalization.blueprint.yaml) |
| **JSON API** | [internationalization.json]({{ site.baseurl }}/api/blueprints/ui/internationalization.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `locale` | text | Yes | Current Locale | Validations: required, pattern |
| `fallback_locale` | text | Yes | Fallback Locale | Validations: required, pattern |
| `translations` | json | No | Translation Map |  |
| `supported_locales` | json | Yes | Supported Locales | Validations: required |
| `direction` | select | No | Text Direction |  |

## Rules

- **fallback:**
  - **chain:** exact_locale, language_only, fallback_locale
  - **missing_key_behavior:** show_key
  - **log_missing_keys:** true
  - **missing_key_log_level:** warn
- **message_format:**
  - **standard:** icu
  - **interpolation_delimiter:** {
  - **html_escaping:** true
  - **allow_rich_text:** false
- **formatting:**
  - **date_format:** locale_default
  - **number_format:** locale_default
  - **currency_format:** locale_default
  - **relative_time:** true
- **rtl:**
  - **auto_detect:** true
  - **rtl_locales:** ar, he, fa, ur
  - **mirror_layout:** true
  - **logical_properties:** true
- **detection:**
  - **auto_detect_browser_language:** true
  - **priority:** url_param, cookie, browser, fallback
  - **persist_preference:** cookie
  - **cookie_name:** locale
  - **cookie_max_age_days:** 365
- **performance:**
  - **lazy_load_bundles:** true
  - **chunk_by_namespace:** true
  - **preload_fallback:** true
  - **cache_bundles:** true

## Outcomes

### Unsupported_locale (Priority: 1) — Error: `I18N_UNSUPPORTED_LOCALE`

**Given:**
- `locale` (input) not_in `supported_locales`

**Then:**
- **set_field** target: `locale` value: `fallback_locale` — Fall back to default locale
- **emit_event** event: `i18n.locale_fallback`

**Result:** use fallback locale and log warning

### Missing_translation_key (Priority: 2) — Error: `I18N_MISSING_KEY`

**Given:**
- `translation_key` (input) exists
- `translation_value` (computed) not_exists

**Then:**
- **emit_event** event: `i18n.missing_key`

**Result:** display raw translation key and log warning for developer review

### Fallback_chain_resolved (Priority: 3)

**Given:**
- `translation_key` (input) exists
- `translation_value` (computed) not_exists
- `translation_value_language` (computed) exists

**Then:**
- **emit_event** event: `i18n.fallback_used`

**Result:** return translation from language-only locale

### Rtl_locale_detected (Priority: 4)

**Given:**
- `locale` (input) in `ar,he,fa,ur`

**Then:**
- **set_field** target: `direction` value: `rtl` — Set document direction to RTL

**Result:** set dir="rtl" on document root and apply mirrored layout

### Locale_switched (Priority: 5) | Transaction: atomic

**Given:**
- `locale` (input) in `supported_locales`
- `locale` (input) neq `current_locale`

**Then:**
- **set_field** target: `current_locale` value: `locale` — Update active locale
- **set_field** target: `direction` value: `auto` — Recalculate text direction for new locale
- **emit_event** event: `i18n.locale_changed`

**Result:** load locale bundle, update all translated strings, persist preference in cookie

### Bundle_loaded (Priority: 6) — Error: `I18N_BUNDLE_LOAD_FAILED`

**Given:**
- `locale` (input) exists
- `locale_bundle` (computed) not_exists

**Then:**
- **call_service** target: `locale_loader` — Lazy-load the locale bundle for the active locale
- **emit_event** event: `i18n.bundle_loaded`

**Result:** fetch and cache locale bundle, then re-render translated content

### Translate_with_interpolation (Priority: 10)

**Given:**
- `translation_key` (input) exists
- `translation_value` (computed) exists

**Result:** return translated string with ICU MessageFormat interpolation and HTML escaping

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `I18N_UNSUPPORTED_LOCALE` | 400 | The requested locale is not supported | No |
| `I18N_MISSING_KEY` | 404 | Translation key not found | No |
| `I18N_BUNDLE_LOAD_FAILED` | 500 | Failed to load locale bundle. Please try again. | Yes |
| `I18N_INVALID_FORMAT` | 400 | Invalid ICU message format in translation value | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `i18n.locale_changed` | User switched to a different locale | `previous_locale`, `new_locale`, `direction`, `timestamp` |
| `i18n.missing_key` | Translation key not found in any locale in the fallback chain | `key`, `locale`, `fallback_locale`, `timestamp` |
| `i18n.bundle_loaded` | Locale translation bundle loaded into memory | `locale`, `namespace`, `bundle_size_kb`, `timestamp` |
| `i18n.locale_fallback` | Requested locale not supported, fell back to default | `requested_locale`, `fallback_locale`, `timestamp` |
| `i18n.fallback_used` | Translation resolved from fallback locale instead of exact match | `key`, `requested_locale`, `resolved_locale`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| toast-notifications | recommended | Toast messages need translation support |
| form-builder | recommended | Form labels, placeholders, and validation messages need translation |
| navigation-menu | optional | Navigation labels need translation and RTL layout support |
| theme-configuration | optional | Theme may include locale-specific font choices |

## AGI Readiness

### Goals

#### Reliable Internationalization

Internationalization with locale switching, translation keys, pluralization, and RTL support

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| unsupported_locale | `autonomous` | - | - |
| missing_translation_key | `autonomous` | - | - |
| fallback_chain_resolved | `autonomous` | - | - |
| rtl_locale_detected | `autonomous` | - | - |
| locale_switched | `autonomous` | - | - |
| bundle_loaded | `autonomous` | - | - |
| translate_with_interpolation | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Internationalization Blueprint",
  "description": "Internationalization with locale switching, translation keys, pluralization, and RTL support. 5 fields. 7 outcomes. 4 error codes. rules: fallback, message_form",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "i18n, localization, translation, rtl, locale, internationalization, ui"
}
</script>
