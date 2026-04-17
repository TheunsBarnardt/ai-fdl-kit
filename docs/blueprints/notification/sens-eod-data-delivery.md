---
title: "Sens Eod Data Delivery Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and "
---

# Sens Eod Data Delivery Blueprint

> End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

| | |
|---|---|
| **Feature** | `sens-eod-data-delivery` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, sens, announcements, newsml, xml, news, regulatory, price-sensitive, non-live |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/sens-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [sens-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/notification/sens-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed SENS feed consumer |
| `exchange_operations` | Exchange Operations | system |  |
| `issuer_company` | Issuer Company | external | Listed company that submits announcements via SENS |
| `regulatory_institution` | Regulatory Institution | external | Body issuing regulatory announcements (Competition Commission, Takeover Regulation Panel, FSB) |
| `exchange_authority` | Exchange Authority | external | Exchange issuing exchange-level announcements |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `news_item_guid` | text | Yes | News Item Guid |  |
| `standard_attr` | text | Yes | Standard Attr |  |
| `standard_version` | text | Yes | Standard Version |  |
| `conformance` | text | Yes | Conformance |  |
| `xml_lang` | text | Yes | Xml Lang |  |
| `catalog_ref` | url | Yes | Catalog Ref |  |
| `usage_terms` | text | Yes | Usage Terms |  |
| `item_class` | select | Yes | Item Class |  |
| `provider` | text | Yes | Provider |  |
| `version_created` | datetime | Yes | Version Created |  |
| `first_created` | datetime | Yes | First Created |  |
| `embargoed` | datetime | No | Embargoed |  |
| `pub_status` | select | Yes | Pub Status |  |
| `file_name` | text | Yes | File Name |  |
| `generator_name` | text | No | Generator Name |  |
| `generator_version` | text | No | Generator Version |  |
| `service` | select | Yes | Service |  |
| `signal` | select | No | Signal |  |
| `link_resid_ref` | text | No | Link Resid Ref |  |
| `alt_id_ann_no` | text | No | Alt Id Ann No |  |
| `alt_id_ann_ref_no` | text | No | Alt Id Ann Ref No |  |
| `urgency` | select | Yes | Urgency |  |
| `content_created` | datetime | Yes | Content Created |  |
| `located` | text | Yes | Located |  |
| `info_source_org_id` | text | No | Info Source Org Id |  |
| `creator_org_id` | text | No | Creator Org Id |  |
| `audience_prd_cde` | select | Yes | Audience Prd Cde |  |
| `language_tag` | text | Yes | Language Tag |  |
| `genre_rel_typ` | text | No | Genre Rel Typ |  |
| `headline` | text | Yes | Headline |  |
| `announcement_type_qcode` | text | Yes | Announcement Type Qcode |  |
| `announcement_sub_type_qcode` | text | No | Announcement Sub Type Qcode |  |
| `company_org_id` | text | No | Company Org Id |  |
| `instrument_num_code` | text | No | Instrument Num Code |  |
| `announcement_regulatory_code` | select | Yes | Announcement Regulatory Code |  |
| `price_sensitivity_indicator` | select | Yes | Price Sensitivity Indicator |  |
| `announcement_group_code` | select | No | Announcement Group Code |  |
| `company_rel_seq` | number | No | Company Rel Seq |  |
| `company_role` | select | No | Company Role |  |
| `company_role_on_mic` | text | No | Company Role On Mic |  |
| `company_registered_in` | text | No | Company Registered In |  |
| `company_alpha_code` | text | No | Company Alpha Code |  |
| `company_short_name` | text | No | Company Short Name |  |
| `company_full_name` | text | No | Company Full Name |  |
| `instrument_issued_by` | text | No | Instrument Issued By |  |
| `instrument_issued_in` | text | No | Instrument Issued In |  |
| `instrument_listing_type` | select | No | Instrument Listing Type |  |
| `instrument_listed_on_mic` | text | No | Instrument Listed On Mic |  |
| `instrument_market_type` | text | No | Instrument Market Type |  |
| `instrument_board_type` | text | No | Instrument Board Type |  |
| `instrument_icb_subsector` | text | No | Instrument Icb Subsector |  |
| `instrument_isin` | text | No | Instrument Isin |  |
| `instrument_future_isin` | text | No | Instrument Future Isin |  |
| `instrument_tidm` | text | No | Instrument Tidm |  |
| `instrument_alpha_code` | text | No | Instrument Alpha Code |  |
| `instrument_short_name` | text | No | Instrument Short Name |  |
| `instrument_full_name` | text | No | Instrument Full Name |  |
| `inline_data_content_type` | select | No | Inline Data Content Type |  |
| `inline_data` | rich_text | No | Inline Data |  |
| `remote_content_type` | select | No | Remote Content Type |  |
| `remote_content_size` | number | No | Remote Content Size |  |
| `remote_content_href` | text | No | Remote Content Href |  |
| `package_item_guid` | text | No | Package Item Guid |  |
| `package_headline` | text | No | Package Headline |  |
| `package_genre` | text | No | Package Genre |  |
| `group_id` | text | No | Group Id |  |
| `group_role` | select | No | Group Role |  |
| `item_ref_resid_ref` | text | No | Item Ref Resid Ref |  |
| `item_ref_href` | text | No | Item Ref Href |  |

## Rules

- **format:** MUST: Use NewsML-G2 standard v2.9 with power conformance, MUST: Use Windows-1252 encoding for XML and announcement text, MUST: Use UTC ISO 8601 timestamps with milliseconds (CCYY-MM-DDTHH:MM:SS.sssZ), MUST: Limit headline to 150 characters maximum, MUST: Limit plain text announcement size to 4MB, SHOULD: Limit PDF announcements to 10MB (configurable)
- **identification:** MUST: Use standard GUID format with announcement reference and product code, MUST: Use announcement number format CCYYMMDDNNNNNA (never recycled), MUST: Include altId with AnnNo and AnnRefNo for every announcement
- **classification:** MUST: Set urgency=1 for price-sensitive, urgency=4 for non-price-sensitive, MUST: Use AnnRegCde R for regulatory, N for non-regulatory, MUST: Omit announcement_group_code for company announcements with listed shares, MUST: Include announcement_group_code for no-share companies, exchanges, and regulators
- **corrections:** MUST: Use signal=CorTyp:Cncl for cancellations with pubStatus=stat:canceled, MUST: Use signal=CorTyp:Repl for replacements referencing previousVersion GUID, MUST NOT: Cancel PackageItems (use replacement only)
- **delivery:** MUST: Group all daily announcements into end-of-day PackageItem with Wrapup genre, MUST: Deliver as compressed ZIP via IDP FTP

## Outcomes

### Company_announcement_with_share (Priority: 1)

_Company announcement when primary company has listed share_

**Given:**
- `announcement_class` (input) eq `company_with_share`

**Then:**
- **set_field** target: `company_org_id` value: `primary_company_id`
- **set_field** target: `instrument_num_code` value: `instrument_id`
- **create_record**
- **emit_event** event: `sens.company_announcement.created`

### Company_announcement_no_share (Priority: 2)

_Company announcement when primary company has no share (debt issuer)_

**Given:**
- `announcement_class` (input) eq `company_no_share`

**Then:**
- **set_field** target: `company_org_id` value: `primary_company_id`
- **set_field** target: `announcement_group_code` value: `JSEO_or_NSXO`
- **emit_event** event: `sens.company_no_share_announcement.created`

### Exchange_announcement (Priority: 3)

_Exchange announcement with EXCH group code and General role_

**Given:**
- `announcement_class` (input) eq `exchange`

**Then:**
- **set_field** target: `announcement_group_code` value: `EXCH`
- **set_field** target: `company_role` value: `General`
- **emit_event** event: `sens.exchange_announcement.created`

### Regulatory_institution_announcement (Priority: 4)

_Regulatory institution announcement_

**Given:**
- `announcement_class` (input) eq `regulatory_institution`

**Then:**
- **set_field** target: `company_role` value: `General`
- **set_field** target: `announcement_regulatory_code` value: `R`
- **emit_event** event: `sens.regulatory_announcement.created`

### Price_sensitive_urgency_1 (Priority: 5)

_Price-sensitive announcements get urgency=1_

**Given:**
- `price_sensitivity_indicator` (input) eq `Y`

**Then:**
- **set_field** target: `urgency` value: `1`
- **emit_event** event: `sens.price_sensitive.flagged`

### Non_price_sensitive_urgency_4 (Priority: 6)

_Non-price-sensitive announcements get urgency=4_

**Given:**
- `price_sensitivity_indicator` (input) eq `N`

**Then:**
- **set_field** target: `urgency` value: `4`

### Announcement_cancellation (Priority: 7)

_Cancellation correction with signal=Cncl_

**Given:**
- `correction_type` (input) eq `cancellation`

**Then:**
- **set_field** target: `signal` value: `CorTyp:Cncl`
- **set_field** target: `pub_status` value: `stat:canceled`
- **emit_event** event: `sens.announcement.cancelled`

### Announcement_replacement (Priority: 8)

_Replacement correction with signal=Repl_

**Given:**
- `correction_type` (input) eq `replacement`

**Then:**
- **set_field** target: `signal` value: `CorTyp:Repl`
- **emit_event** event: `sens.announcement.replaced`

### Headline_too_long (Priority: 9) — Error: `SENS_HEADLINE_TOO_LONG`

_Headline exceeds 150 characters_

**Given:**
- `headline_length` (computed) gt `150`

**Then:**
- **emit_event** event: `sens.validation.headline_rejected`

### Eod_text_too_large (Priority: 10) — Error: `SENS_ANNOUNCEMENT_TEXT_TOO_LARGE`

_Plain text announcement exceeds 4MB_

**Given:**
- `inline_data_size_bytes` (computed) gt `4194304`

**Then:**
- **emit_event** event: `sens.validation.text_too_large`

### Eod_pdf_too_large (Priority: 11) — Error: `SENS_PDF_TOO_LARGE`

_PDF exceeds configured limit (default 10MB)_

**Given:**
- `remote_content_size` (input) gt `10485760`

**Then:**
- **notify** target: `exchange_operations`
- **emit_event** event: `sens.validation.pdf_too_large`

### Generate_eod_package (Priority: 12)

_End-of-day PackageItem groups daily announcements into zip_

**Given:**
- end of trading day reached

**Then:**
- **create_record**
- **call_service** target: `compress_eod_package`
- **call_service** target: `idp_ftp_dissemination`
- **emit_event** event: `sens.eod_package.disseminated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SENS_SUBSCRIBER_NOT_PROVISIONED` | 403 | Subscriber not provisioned for SENS data product | No |
| `SENS_NEWSML_VALIDATION_FAILED` | 422 | NewsML-G2 XML failed schema validation | No |
| `SENS_ANNOUNCEMENT_TEXT_TOO_LARGE` | 413 | Announcement text exceeds 4MB limit | No |
| `SENS_PDF_TOO_LARGE` | 413 | Announcement PDF exceeds configured size limit | No |
| `SENS_HEADLINE_TOO_LONG` | 422 | Announcement headline exceeds 150 character limit | No |
| `SENS_PACKAGE_GENERATION_FAILED` | 500 | Failed to generate end-of-day SENS package | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equities-eod-data-delivery | recommended |  |
| bonds-reference-corporate-actions-eod-data-delivery | optional |  |

## AGI Readiness

### Goals

#### Reliable Sens Eod Data Delivery

End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| delivery_reliability | speed | notifications must reach recipients even if delayed |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| company_announcement_with_share | `autonomous` | - | - |
| company_announcement_no_share | `autonomous` | - | - |
| exchange_announcement | `supervised` | - | - |
| regulatory_institution_announcement | `autonomous` | - | - |
| price_sensitive_urgency_1 | `autonomous` | - | - |
| non_price_sensitive_urgency_4 | `autonomous` | - | - |
| announcement_cancellation | `supervised` | - | - |
| announcement_replacement | `autonomous` | - | - |
| headline_too_long | `autonomous` | - | - |
| eod_text_too_large | `autonomous` | - | - |
| eod_pdf_too_large | `autonomous` | - | - |
| generate_eod_package | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
product_codes:
  eod_sens:
    code: ETNI
    description: End of Day SENS NewsItem - plain text
    item_class: ninat:text
    content_type: text/plain
    encoding: windows-1252
    max_size_mb: 4
  eod_sens_plus:
    code: EPNI
    description: End of Day SENS Plus NewsItem - PDF
    item_class: ninat:composite
    content_type: application/pdf
    default_max_size_mb: 10
  eod_sens_package:
    code: ETPI
    description: End of Day SENS PackageItem for text product
  eod_sens_plus_package:
    code: EPPI
    description: End of Day SENS Plus PackageItem for PDF product
announcement_types_complete:
  - code: 17
    name: Name Change
    subtypes:
      - 520
  - code: 100
    name: Acquisition
    subtypes:
      - 224
      - 225
      - 218
      - 223
      - 405
  - code: 104
    name: Annual General Meeting
    subtypes:
      - 105
      - 222
      - 500
  - code: 107
    name: Capitalisation
    subtypes:
      - 228
      - 337
      - 111
  - code: 112
    name: Cautionary
    subtypes:
      - 113
      - 114
      - 348
  - code: 116
    name: Change to the Board
    subtypes:
      - 117
      - 339
      - 408
      - 119
      - 120
      - 121
      - 122
      - 229
  - code: 123
    name: Dealings
    subtypes:
      - 312
      - 317
      - 124
      - 125
      - 318
      - 363
      - 321
      - 232
      - 330
  - code: 129
    name: Disposal
    subtypes:
      - 130
      - 132
      - 131
      - 233
      - 406
  - code: 133
    name: Dividend/Interest
    subtypes:
      - 134
      - 506
      - 135
      - 136
      - 504
      - 505
      - 137
      - 138
  - code: 140
    name: Financial Results
    subtypes:
      - 510
      - 514
      - 141
      - 512
      - 142
      - 352
      - 143
      - 144
      - 515
      - 513
      - 145
      - 511
      - 366
  - code: 147
    name: General Meeting
    subtypes:
      - 473
      - 148
      - 149
      - 518
  - code: 150
    name: Instruments
    subtypes:
      - 152
      - 242
      - 243
  - code: 153
    name: Issue of Shares for Cash
    subtypes:
      - 154
      - 155
  - code: 156
    name: New Listing (Board/Instrument)
    subtypes:
      - 522
      - 245
      - 157
      - 523
      - 244
      - 521
      - 246
      - 524
      - 158
  - code: 160
    name: Merger
    subtypes:
      - 519
  - code: 163
    name: Offers
    subtypes:
      - 164
      - 165
      - 301
      - 166
      - 167
      - 347
      - 168
      - 307
      - 170
  - code: 171
    name: Redemption
    subtypes:
      - 172
      - 173
  - code: 175
    name: Related Party Transactions
    subtypes:
      - 176
      - 177
  - code: 178
    name: Scheme Meeting
    subtypes:
      - 179
      - 180
  - code: 181
    name: Scheme of Arrangement
    subtypes:
      - 528
      - 530
      - 529
  - code: 183
    name: Share Buyback
    subtypes:
      - 184
      - 185
  - code: 186
    name: Statements
    subtypes:
      - 187
      - 532
      - 481
      - 482
      - 483
      - 484
      - 533
      - 403
      - 365
      - 485
      - 188
      - 306
      - 409
      - 402
      - 486
      - 336
      - 190
      - 487
      - 488
  - code: 191
    name: Suspension
    subtypes:
      - 192
      - 193
  - code: 196
    name: Take-Over
    subtypes:
      - 195
      - 194
  - code: 197
    name: Termination
    subtypes:
      - 310
      - 361
  - code: 199
    name: Unbundling
    subtypes:
      - 538
      - 537
      - 536
  - code: 201
    name: Voluntary Winding-Up
    subtypes:
      - 539
  - code: 230
    name: Debt Instrument
    subtypes:
      - 464
      - 503
      - 465
      - 466
      - 467
      - 501
      - 468
      - 469
      - 470
      - 471
      - 293
      - 253
      - 231
      - 294
      - 472
      - 502
  - code: 239
    name: Change in Authorised share capital
    subtypes:
      - 240
      - 241
  - code: 250
    name: Sector transfer
    subtypes:
      - 531
  - code: 252
    name: General
    subtypes: []
  - code: 259
    name: Resource and Reserves
    subtypes: []
  - code: 260
    name: Rescue operation
    subtypes: []
  - code: 313
    name: Warrants
    subtypes: []
  - code: 325
    name: Sponsor/DA/Debt Sponsor/Auditor/Debt Officer
    subtypes: []
  - code: 329
    name: Payment to shareholders
    subtypes: []
  - code: 334
    name: FTSE/JSE Africa Index Series
    subtypes: []
  - code: 362
    name: Regulatory
    subtypes: []
  - code: 373
    name: Trading Halt
    subtypes: []
  - code: 461
    name: Credit Rating
    subtypes: []
  - code: 474
    name: Index and Index providers
    subtypes: []
  - code: 477
    name: Section 60 approval
    subtypes: []
  - code: 507
    name: ETF Distribution
    subtypes: []
  - code: 516
    name: Fraction Rate
    subtypes: []
subtype_definitions:
  financial_results:
    - code: 510
      name: Annual Financial Statements
    - code: 514
      name: Annual report
    - code: 141
      name: Audited
    - code: 512
      name: Condensed financial statements
    - code: 142
      name: Interim results
    - code: 352
      name: Late Submission
    - code: 143
      name: Preliminary
    - code: 144
      name: Quarterly
    - code: 515
      name: Restatements
    - code: 513
      name: Results for a twelve month period given the change in year end
    - code: 145
      name: Reviewed
    - code: 511
      name: Summary financial statements
    - code: 366
      name: Unaudited
  board_changes:
    - code: 117
      name: Appointment of Company Secretary
    - code: 339
      name: Appointment of Director
    - code: 408
      name: Change role of Director
    - code: 119
      name: Death of Company Secretary
    - code: 120
      name: Death of Director
    - code: 121
      name: Resignation of Company Secretary
    - code: 122
      name: Resignation of Director
    - code: 229
      name: Retirement of director
  dealings:
    - code: 312
      name: by Associate of Director
    - code: 317
      name: by Company Secretary
    - code: 124
      name: by Designated Advisor
    - code: 125
      name: by Director
    - code: 318
      name: by Director of Subsidiary
    - code: 363
      name: by Executive Committee
    - code: 321
      name: by other
    - code: 232
      name: Exercise of options
    - code: 330
      name: Share Incentive schemes
  dividend:
    - code: 134
      name: Cash Dividend
    - code: 506
      name: Currency Conversion
    - code: 135
      name: Interest payment
    - code: 136
      name: Liquidation Dividend
    - code: 504
      name: REIT Distribution
    - code: 505
      name: REIT Reinvestment
    - code: 137
      name: Scrip Dividend
    - code: 138
      name: Special Dividend
announcement_categories:
  dual_listed:
    - Company announcements
    - Exchange announcements
  single_listed:
    - Company announcements (with share)
    - Company announcements (no share - debt issuers)
    - Exchange announcements
    - Regulatory institution announcements
announcement_group_codes:
  - code: CCO
    description: Competition Commission
  - code: CTR
    description: Corporate/Trust/Regulatory body
  - code: TRP
    description: Takeover Regulation Panel
  - code: FSB
    description: Financial Services Board
  - code: EXCH
    description: Exchange Authority
  - code: JSEO
    description: Primary exchange issuer (no share)
  - code: NSXO
    description: Secondary exchange issuer (no share)
newsml_containers_used:
  - newsItem
  - packageItem
  - knowledgeItem
newsml_containers_not_used:
  - conceptItem
  - newsMessage
  - EventsML-G2
  - SportsML-G2
guid_format: urn:newsml:jse.co.za:CCYY-MM-DD:SENS:<AnnRefNo>:<ProductCode>
filename_format: SENS_CCYYMMDD_<AnnRefNo>_<ProductCode>.XML
announcement_number_format: CCYYMMDDNNNNNA
delivery:
  channel: IDP FTP (Information Delivery Portal)
  format: Compressed ZIP containing NewsML XML files and optional PDFs
encoding:
  xml: Windows-1252
  timestamp: UTC ISO 8601 with milliseconds
standards:
  base: NewsML-G2 (IPTC)
  standard_version: "2.9"
  conformance: power
icb_subsector_change:
  effective_date: 2021-03-23
  old_length: 4
  new_length: 8
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sens Eod Data Delivery Blueprint",
  "description": "End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, sens, announcements, newsml, xml, news, regulatory, price-sensitive, non-live"
}
</script>
