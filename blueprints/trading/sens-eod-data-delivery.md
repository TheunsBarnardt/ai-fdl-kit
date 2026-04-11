<!-- AUTO-GENERATED FROM sens-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sens Eod Data Delivery

> End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

**Category:** Notification · **Version:** 1.0.0 · **Tags:** market-data · eod · sens · announcements · newsml · xml · news · regulatory · price-sensitive · non-live

## What this does

End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **news_item_guid** *(text, required)*
- **standard_attr** *(text, required)*
- **standard_version** *(text, required)*
- **conformance** *(text, required)*
- **xml_lang** *(text, required)*
- **catalog_ref** *(url, required)*
- **usage_terms** *(text, required)*
- **item_class** *(select, required)*
- **provider** *(text, required)*
- **version_created** *(datetime, required)*
- **first_created** *(datetime, required)*
- **embargoed** *(datetime, optional)*
- **pub_status** *(select, required)*
- **file_name** *(text, required)*
- **generator_name** *(text, optional)*
- **generator_version** *(text, optional)*
- **service** *(select, required)*
- **signal** *(select, optional)*
- **link_resid_ref** *(text, optional)*
- **alt_id_ann_no** *(text, optional)*
- **alt_id_ann_ref_no** *(text, optional)*
- **urgency** *(select, required)*
- **content_created** *(datetime, required)*
- **located** *(text, required)*
- **info_source_org_id** *(text, optional)*
- **creator_org_id** *(text, optional)*
- **audience_prd_cde** *(select, required)*
- **language_tag** *(text, required)*
- **genre_rel_typ** *(text, optional)*
- **headline** *(text, required)*
- **announcement_type_qcode** *(text, required)*
- **announcement_sub_type_qcode** *(text, optional)*
- **company_org_id** *(text, optional)*
- **instrument_num_code** *(text, optional)*
- **announcement_regulatory_code** *(select, required)*
- **price_sensitivity_indicator** *(select, required)*
- **announcement_group_code** *(select, optional)*
- **company_rel_seq** *(number, optional)*
- **company_role** *(select, optional)*
- **company_role_on_mic** *(text, optional)*
- **company_registered_in** *(text, optional)*
- **company_alpha_code** *(text, optional)*
- **company_short_name** *(text, optional)*
- **company_full_name** *(text, optional)*
- **instrument_issued_by** *(text, optional)*
- **instrument_issued_in** *(text, optional)*
- **instrument_listing_type** *(select, optional)*
- **instrument_listed_on_mic** *(text, optional)*
- **instrument_market_type** *(text, optional)*
- **instrument_board_type** *(text, optional)*
- **instrument_icb_subsector** *(text, optional)*
- **instrument_isin** *(text, optional)*
- **instrument_future_isin** *(text, optional)*
- **instrument_tidm** *(text, optional)*
- **instrument_alpha_code** *(text, optional)*
- **instrument_short_name** *(text, optional)*
- **instrument_full_name** *(text, optional)*
- **inline_data_content_type** *(select, optional)*
- **inline_data** *(rich_text, optional)*
- **remote_content_type** *(select, optional)*
- **remote_content_size** *(number, optional)*
- **remote_content_href** *(text, optional)*
- **package_item_guid** *(text, optional)*
- **package_headline** *(text, optional)*
- **package_genre** *(text, optional)*
- **group_id** *(text, optional)*
- **group_role** *(select, optional)*
- **item_ref_resid_ref** *(text, optional)*
- **item_ref_href** *(text, optional)*

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

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/sens-eod-data-delivery/) · **Spec source:** [`sens-eod-data-delivery.blueprint.yaml`](./sens-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
