<!-- AUTO-GENERATED FROM sens-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sens Eod Data Delivery

> End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

**Category:** Notification · **Version:** 1.0.0 · **Tags:** market-data · eod · sens · announcements · newsml · xml · news · regulatory · price-sensitive · non-live

## What this does

End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **news_item_guid** *(text, required)* — News Item Guid
- **standard_attr** *(text, required)* — Standard Attr
- **standard_version** *(text, required)* — Standard Version
- **conformance** *(text, required)* — Conformance
- **xml_lang** *(text, required)* — Xml Lang
- **catalog_ref** *(url, required)* — Catalog Ref
- **usage_terms** *(text, required)* — Usage Terms
- **item_class** *(select, required)* — Item Class
- **provider** *(text, required)* — Provider
- **version_created** *(datetime, required)* — Version Created
- **first_created** *(datetime, required)* — First Created
- **embargoed** *(datetime, optional)* — Embargoed
- **pub_status** *(select, required)* — Pub Status
- **file_name** *(text, required)* — File Name
- **generator_name** *(text, optional)* — Generator Name
- **generator_version** *(text, optional)* — Generator Version
- **service** *(select, required)* — Service
- **signal** *(select, optional)* — Signal
- **link_resid_ref** *(text, optional)* — Link Resid Ref
- **alt_id_ann_no** *(text, optional)* — Alt Id Ann No
- **alt_id_ann_ref_no** *(text, optional)* — Alt Id Ann Ref No
- **urgency** *(select, required)* — Urgency
- **content_created** *(datetime, required)* — Content Created
- **located** *(text, required)* — Located
- **info_source_org_id** *(text, optional)* — Info Source Org Id
- **creator_org_id** *(text, optional)* — Creator Org Id
- **audience_prd_cde** *(select, required)* — Audience Prd Cde
- **language_tag** *(text, required)* — Language Tag
- **genre_rel_typ** *(text, optional)* — Genre Rel Typ
- **headline** *(text, required)* — Headline
- **announcement_type_qcode** *(text, required)* — Announcement Type Qcode
- **announcement_sub_type_qcode** *(text, optional)* — Announcement Sub Type Qcode
- **company_org_id** *(text, optional)* — Company Org Id
- **instrument_num_code** *(text, optional)* — Instrument Num Code
- **announcement_regulatory_code** *(select, required)* — Announcement Regulatory Code
- **price_sensitivity_indicator** *(select, required)* — Price Sensitivity Indicator
- **announcement_group_code** *(select, optional)* — Announcement Group Code
- **company_rel_seq** *(number, optional)* — Company Rel Seq
- **company_role** *(select, optional)* — Company Role
- **company_role_on_mic** *(text, optional)* — Company Role On Mic
- **company_registered_in** *(text, optional)* — Company Registered In
- **company_alpha_code** *(text, optional)* — Company Alpha Code
- **company_short_name** *(text, optional)* — Company Short Name
- **company_full_name** *(text, optional)* — Company Full Name
- **instrument_issued_by** *(text, optional)* — Instrument Issued By
- **instrument_issued_in** *(text, optional)* — Instrument Issued In
- **instrument_listing_type** *(select, optional)* — Instrument Listing Type
- **instrument_listed_on_mic** *(text, optional)* — Instrument Listed On Mic
- **instrument_market_type** *(text, optional)* — Instrument Market Type
- **instrument_board_type** *(text, optional)* — Instrument Board Type
- **instrument_icb_subsector** *(text, optional)* — Instrument Icb Subsector
- **instrument_isin** *(text, optional)* — Instrument Isin
- **instrument_future_isin** *(text, optional)* — Instrument Future Isin
- **instrument_tidm** *(text, optional)* — Instrument Tidm
- **instrument_alpha_code** *(text, optional)* — Instrument Alpha Code
- **instrument_short_name** *(text, optional)* — Instrument Short Name
- **instrument_full_name** *(text, optional)* — Instrument Full Name
- **inline_data_content_type** *(select, optional)* — Inline Data Content Type
- **inline_data** *(rich_text, optional)* — Inline Data
- **remote_content_type** *(select, optional)* — Remote Content Type
- **remote_content_size** *(number, optional)* — Remote Content Size
- **remote_content_href** *(text, optional)* — Remote Content Href
- **package_item_guid** *(text, optional)* — Package Item Guid
- **package_headline** *(text, optional)* — Package Headline
- **package_genre** *(text, optional)* — Package Genre
- **group_id** *(text, optional)* — Group Id
- **group_role** *(select, optional)* — Group Role
- **item_ref_resid_ref** *(text, optional)* — Item Ref Resid Ref
- **item_ref_href** *(text, optional)* — Item Ref Href

## What must be true

- **format:** MUST: Use NewsML-G2 standard v2.9 with power conformance, MUST: Use Windows-1252 encoding for XML and announcement text, MUST: Use UTC ISO 8601 timestamps with milliseconds (CCYY-MM-DDTHH:MM:SS.sssZ), MUST: Limit headline to 150 characters maximum, MUST: Limit plain text announcement size to 4MB, SHOULD: Limit PDF announcements to 10MB (configurable)
- **identification:** MUST: Use standard GUID format with announcement reference and product code, MUST: Use announcement number format CCYYMMDDNNNNNA (never recycled), MUST: Include altId with AnnNo and AnnRefNo for every announcement
- **classification:** MUST: Set urgency=1 for price-sensitive, urgency=4 for non-price-sensitive, MUST: Use AnnRegCde R for regulatory, N for non-regulatory, MUST: Omit announcement_group_code for company announcements with listed shares, MUST: Include announcement_group_code for no-share companies, exchanges, and regulators
- **corrections:** MUST: Use signal=CorTyp:Cncl for cancellations with pubStatus=stat:canceled, MUST: Use signal=CorTyp:Repl for replacements referencing previousVersion GUID, MUST NOT: Cancel PackageItems (use replacement only)
- **delivery:** MUST: Group all daily announcements into end-of-day PackageItem with Wrapup genre, MUST: Deliver as compressed ZIP via IDP FTP

## Success & failure scenarios

**✅ Success paths**

- **Company Announcement With Share** — when announcement_class eq "company_with_share", then set company_org_id = "primary_company_id"; set instrument_num_code = "instrument_id"; create_record; emit sens.company_announcement.created.
- **Company Announcement No Share** — when announcement_class eq "company_no_share", then set company_org_id = "primary_company_id"; set announcement_group_code = "JSEO_or_NSXO"; emit sens.company_no_share_announcement.created.
- **Exchange Announcement** — when announcement_class eq "exchange", then set announcement_group_code = "EXCH"; set company_role = "General"; emit sens.exchange_announcement.created.
- **Regulatory Institution Announcement** — when announcement_class eq "regulatory_institution", then set company_role = "General"; set announcement_regulatory_code = "R"; emit sens.regulatory_announcement.created.
- **Price Sensitive Urgency 1** — when price_sensitivity_indicator eq "Y", then set urgency = 1; emit sens.price_sensitive.flagged.
- **Non Price Sensitive Urgency 4** — when price_sensitivity_indicator eq "N", then set urgency = 4.
- **Announcement Cancellation** — when correction_type eq "cancellation", then set signal = "CorTyp:Cncl"; set pub_status = "stat:canceled"; emit sens.announcement.cancelled.
- **Announcement Replacement** — when correction_type eq "replacement", then set signal = "CorTyp:Repl"; emit sens.announcement.replaced.
- **Generate Eod Package** — when end of trading day reached, then create_record; call service; call service; emit sens.eod_package.disseminated.

**❌ Failure paths**

- **Headline Too Long** — when headline_length gt 150, then emit sens.validation.headline_rejected. *(error: `SENS_HEADLINE_TOO_LONG`)*
- **Eod Text Too Large** — when inline_data_size_bytes gt 4194304, then emit sens.validation.text_too_large. *(error: `SENS_ANNOUNCEMENT_TEXT_TOO_LARGE`)*
- **Eod Pdf Too Large** — when remote_content_size gt 10485760, then notify via operations; emit sens.validation.pdf_too_large. *(error: `SENS_PDF_TOO_LARGE`)*

## Errors it can return

- `SENS_SUBSCRIBER_NOT_PROVISIONED` — Subscriber not provisioned for SENS data product
- `SENS_NEWSML_VALIDATION_FAILED` — NewsML-G2 XML failed schema validation
- `SENS_ANNOUNCEMENT_TEXT_TOO_LARGE` — Announcement text exceeds 4MB limit
- `SENS_PDF_TOO_LARGE` — Announcement PDF exceeds configured size limit
- `SENS_HEADLINE_TOO_LONG` — Announcement headline exceeds 150 character limit
- `SENS_PACKAGE_GENERATION_FAILED` — Failed to generate end-of-day SENS package

## Connects to

- **equities-eod-data-delivery** *(recommended)*
- **bonds-reference-corporate-actions-eod-data-delivery** *(optional)*

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (71 → 75)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 69 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/sens-eod-data-delivery/) · **Spec source:** [`sens-eod-data-delivery.blueprint.yaml`](./sens-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
