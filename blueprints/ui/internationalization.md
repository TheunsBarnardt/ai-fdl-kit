<!-- AUTO-GENERATED FROM internationalization.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Internationalization

> Internationalization with locale switching, translation keys, pluralization, and RTL support

**Category:** Ui · **Version:** 1.0.0 · **Tags:** i18n · localization · translation · rtl · locale · internationalization · ui

## What this does

Internationalization with locale switching, translation keys, pluralization, and RTL support

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **locale** *(text, required)* — Current Locale
- **fallback_locale** *(text, required)* — Fallback Locale
- **translations** *(json, optional)* — Translation Map
- **supported_locales** *(json, required)* — Supported Locales
- **direction** *(select, optional)* — Text Direction

## What must be true

- **fallback → chain:** exact_locale, language_only, fallback_locale
- **fallback → missing_key_behavior:** show_key
- **fallback → log_missing_keys:** true
- **fallback → missing_key_log_level:** warn
- **message_format → standard:** icu
- **message_format → interpolation_delimiter:** {
- **message_format → html_escaping:** true
- **message_format → allow_rich_text:** false
- **formatting → date_format:** locale_default
- **formatting → number_format:** locale_default
- **formatting → currency_format:** locale_default
- **formatting → relative_time:** true
- **rtl → auto_detect:** true
- **rtl → rtl_locales:** ar, he, fa, ur
- **rtl → mirror_layout:** true
- **rtl → logical_properties:** true
- **detection → auto_detect_browser_language:** true
- **detection → priority:** url_param, cookie, browser, fallback
- **detection → persist_preference:** cookie
- **detection → cookie_name:** locale
- **detection → cookie_max_age_days:** 365
- **performance → lazy_load_bundles:** true
- **performance → chunk_by_namespace:** true
- **performance → preload_fallback:** true
- **performance → cache_bundles:** true

## Success & failure scenarios

**✅ Success paths**

- **Fallback Chain Resolved** — when Translation key is requested; No translation in exact locale (e.g., fr-CA); Translation found in language-only locale (e.g., fr), then return translation from language-only locale.
- **Rtl Locale Detected** — when Active locale uses right-to-left script, then set dir="rtl" on document root and apply mirrored layout.
- **Locale Switched** — when New locale is in the supported list; New locale differs from current locale, then load locale bundle, update all translated strings, persist preference in cookie.
- **Translate With Interpolation** — when Translation key is provided; Translation found in active locale or fallback, then return translated string with ICU MessageFormat interpolation and HTML escaping.

**❌ Failure paths**

- **Unsupported Locale** — when Requested locale is not in the supported list, then use fallback locale and log warning. *(error: `I18N_UNSUPPORTED_LOCALE`)*
- **Missing Translation Key** — when Translation key is requested; No translation found in current locale or fallback chain, then display raw translation key and log warning for developer review. *(error: `I18N_MISSING_KEY`)*
- **Bundle Loaded** — when Locale is set; Locale bundle not yet loaded in memory, then fetch and cache locale bundle, then re-render translated content. *(error: `I18N_BUNDLE_LOAD_FAILED`)*

## Errors it can return

- `I18N_UNSUPPORTED_LOCALE` — The requested locale is not supported
- `I18N_MISSING_KEY` — Translation key not found
- `I18N_BUNDLE_LOAD_FAILED` — Failed to load locale bundle. Please try again.
- `I18N_INVALID_FORMAT` — Invalid ICU message format in translation value

## Events

**`i18n.locale_changed`** — User switched to a different locale
  Payload: `previous_locale`, `new_locale`, `direction`, `timestamp`

**`i18n.missing_key`** — Translation key not found in any locale in the fallback chain
  Payload: `key`, `locale`, `fallback_locale`, `timestamp`

**`i18n.bundle_loaded`** — Locale translation bundle loaded into memory
  Payload: `locale`, `namespace`, `bundle_size_kb`, `timestamp`

**`i18n.locale_fallback`** — Requested locale not supported, fell back to default
  Payload: `requested_locale`, `fallback_locale`, `timestamp`

**`i18n.fallback_used`** — Translation resolved from fallback locale instead of exact match
  Payload: `key`, `requested_locale`, `resolved_locale`, `timestamp`

## Connects to

- **toast-notifications** *(recommended)* — Toast messages need translation support
- **form-builder** *(recommended)* — Form labels, placeholders, and validation messages need translation
- **navigation-menu** *(optional)* — Navigation labels need translation and RTL layout support
- **theme-configuration** *(optional)* — Theme may include locale-specific font choices

## Quality fitness 🟢 89/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/internationalization/) · **Spec source:** [`internationalization.blueprint.yaml`](./internationalization.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
