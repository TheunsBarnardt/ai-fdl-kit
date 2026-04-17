---
title: "Broker Client Data Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfo"
---

# Broker Client Data Upload Blueprint

> Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

| | |
|---|---|
| **Feature** | `broker-client-data-upload` |
| **Category** | Trading |
| **Version** | 1.1.0 |
| **Tags** | back-office, broker, upload, client-data, fatca, kyc, card-codes, fixed-width, csdp |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-client-data-upload.blueprint.yaml) |
| **JSON API** | [broker-client-data-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-client-data-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external | Equity member firm submitting client account data |
| `back_office_system` | Back Office System | system |  |
| `compliance_officer` | Compliance Officer | human | Broker staff member reviewing FATCA and tax compliance data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes | Card Code |  |
| `broker_code` | text | Yes | Broker Code |  |
| `upload_date` | date | Yes | Upload Date |  |
| `upload_time` | text | No | Upload Time |  |
| `sequence_number` | text | Yes | Sequence Number |  |
| `upload_type` | select | Yes | Upload Type |  |
| `record_count` | number | No | Record Count |  |
| `records_processed` | number | No | Records Processed |  |
| `records_rejected` | number | No | Records Rejected |  |
| `account_number` | text | Yes | Account Number |  |
| `client_name` | text | Yes | Client Name |  |
| `client_initials` | text | No | Client Initials |  |
| `client_surname` | text | No | Client Surname |  |
| `client_title` | select | No | Client Title |  |
| `id_number` | text | Yes | Id Number |  |
| `id_type` | select | No | Id Type |  |
| `date_of_birth` | date | No | Date Of Birth |  |
| `gender` | select | No | Gender |  |
| `country_of_birth` | text | No | Country Of Birth |  |
| `nationality` | text | No | Nationality |  |
| `citizenship` | text | No | Citizenship |  |
| `language_preference` | select | No | Language Preference |  |
| `account_type` | select | No | Account Type |  |
| `csdp_code` | text | No | Csdp Code |  |
| `csdp_account_number` | text | No | Csdp Account Number |  |
| `csdp_bank_code` | text | No | Csdp Bank Code |  |
| `dematerialisation_indicator` | select | No | Dematerialisation Indicator |  |
| `employment_status` | select | No | Employment Status |  |
| `occupation` | text | No | Occupation |  |
| `employer_name` | text | No | Employer Name |  |
| `income_category` | select | No | Income Category |  |
| `source_of_funds` | text | No | Source Of Funds |  |
| `risk_rating` | select | No | Risk Rating |  |
| `vat_number` | text | No | Vat Number |  |
| `income_tax_reference` | text | No | Income Tax Reference |  |
| `marital_status` | select | No | Marital Status |  |
| `spouse_id_number` | text | No | Spouse Id Number |  |
| `postal_address_line_1` | text | No | Postal Address Line 1 |  |
| `postal_address_line_2` | text | No | Postal Address Line 2 |  |
| `postal_city` | text | No | Postal City |  |
| `postal_postcode` | text | No | Postal Postcode |  |
| `postal_country` | text | No | Postal Country |  |
| `physical_address_line_1` | text | No | Physical Address Line 1 |  |
| `physical_city` | text | No | Physical City |  |
| `physical_postcode` | text | No | Physical Postcode |  |
| `email_address` | email | No | Email Address |  |
| `mobile_number` | phone | No | Mobile Number |  |
| `telephone_home` | phone | No | Telephone Home |  |
| `telephone_work` | phone | No | Telephone Work |  |
| `fatca_status` | select | No | Fatca Status |  |
| `fatca_classification` | text | No | Fatca Classification |  |
| `gin_number` | text | No | Gin Number |  |
| `tin_number` | text | No | Tin Number |  |
| `tin_country` | text | No | Tin Country |  |
| `it3b_exclusion` | select | No | It3b Exclusion |  |
| `it3c_exclusion` | select | No | It3c Exclusion |  |
| `withholding_tax_exemption` | select | No | Withholding Tax Exemption |  |
| `us_person_indicator` | select | No | Us Person Indicator |  |
| `crs_status` | select | No | Crs Status |  |
| `politically_exposed_person` | select | No | Politically Exposed Person |  |
| `sanctions_check_status` | select | No | Sanctions Check Status |  |
| `portfolio_code` | text | No | Portfolio Code |  |
| `portfolio_manager` | text | No | Portfolio Manager |  |
| `portfolio_mandate_type` | select | No | Portfolio Mandate Type |  |
| `portfolio_base_currency` | text | No | Portfolio Base Currency |  |
| `portfolio_benchmark` | text | No | Portfolio Benchmark |  |
| `upload_mode` | select | No | Upload Mode |  |
| `upload_scope` | select | No | Upload Scope |  |

## Rules

- **submission:** MUST: Support automated file submission via secure file transfer, MUST: Support manual online upload via reporting process function, MUST: Configure notification email addresses before allowing upload submission, MUST: Provide response dataset acknowledging upload status per record, MUST: Archive processed upload files and response files, MUST: Enforce 1000-record limit per online upload file, MUST: Prevent new upload until previous upload has completed processing
- **validation:** MUST: Validate mandatory fields on Card Code 031, MUST: Reject files with invalid Card Code 000 header, MUST: Reject entire file on fatal file-level errors (duplicate trailer, missing trailer, broker mismatch, record after trailer, trailer count mismatch), MUST: Report field-level errors via central error enquiry and printed error report, MUST: Return response codes indicating success or failure per record, MUST: Replicate a rejected record in the response file once per failed field with each error appended
- **format:** MUST: Use fixed-width card code record format with total record length of 700 bytes (header 30, trailer 50), MUST: Zero-fill numeric fields and space-fill character fields when no value supplied, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Group related fields into logical Card Codes (031, 032, 033, 034, 035, 036, 037, 038, 039, 040), MUST: Append sequence number (prefixed S) from header record to response file name
- **compliance:** MUST: Support FATCA classification fields (GIIN, TIN, US person indicator), MUST: Support Common Reporting Standard (CRS) fields including undocumented reason codes, MUST: Support IT3(b) and IT3(c) tax reporting exclusion flags, MUST: Support politically exposed person (PEP) indicator, MUST: Support dividend withholding tax (DWT) exemption — system-generated, not uploaded
- **identification:** MUST: Use unique account number as primary identifier, MUST: Capture ID number and ID type for every client
- **modes:** MUST: Support UPL-TYP = N (new account) — Card Code 031 or 039 is mandatory, MUST: Support UPL-TYP = U (update) — any card code acceptable, MUST: Support validate-only mode that runs all checks without committing, MUST: Support incremental merge mode that leaves unspecified fields untouched, MUST: Support full replacement mode that rolls back the entire file if any record fails (when configured)
- **audit:** MUST: Persist every uploaded record with broker code, sequence number and submission timestamp, MUST: Log every accept/reject decision with reason codes against the original row, MUST: Retain response files and source files on daily backup for the configured retention window

## Outcomes

### Automated_upload_submission (Priority: 1)

_Broker submits upload file via automated secure file transfer_

**Given:**
- `email_configured` (db) eq `true`
- `file_format` (input) eq `fixed_width_card_code`

**Then:**
- **create_record**
- **emit_event** event: `client_upload.submitted`

### Validate_mandatory_fields (Priority: 2)

_Validate Card Code 031 mandatory fields_

**Given:**
- `card_code` (input) eq `031`

**Then:**
- **call_service** target: `field_validator`
- **emit_event** event: `client_upload.validated`

### Mandatory_field_missing (Priority: 3) — Error: `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING`

**Given:**
- ANY: `account_number` (input) not_exists OR `client_name` (input) not_exists OR `id_number` (input) not_exists

**Then:**
- **create_record**
- **emit_event** event: `client_upload.validation_failed`

### Fatca_validation_check (Priority: 4) — Error: `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED`

_Validate FATCA classification on Card Code 038_

**Given:**
- `card_code` (input) eq `038`
- `us_person_indicator` (input) eq `Y`

**Then:**
- **call_service** target: `fatca_validator`
- **emit_event** event: `client_upload.fatca.validated`

### Upload_validation_pass (Priority: 5)

_All records pass validation; file is ready to commit_

**Given:**
- `records_rejected` (computed) eq `0`
- `upload_mode` (input) in `validate_only,commit`

**Then:**
- **set_field** target: `upload_status` value: `validated`
- **emit_event** event: `client_upload.validation.pass`

### Upload_validation_fail_partial (Priority: 6) — Error: `CLIENT_UPLOAD_FILE_REJECTED`

_Some records failed validation; response dataset lists per-row errors_

**Given:**
- `records_rejected` (computed) gt `0`
- `upload_scope` (input) eq `incremental`

**Then:**
- **create_record**
- **emit_event** event: `client_upload.validation.fail_partial`

### Upload_full_rollback (Priority: 7) — Error: `CLIENT_UPLOAD_FILE_REJECTED` | Transaction: atomic

_Fatal file-level error or full-replacement mode with any failure - reject the entire file atomically_

**Given:**
- ANY: `fatal_file_error` (computed) eq `true` OR ALL: `upload_scope` (input) eq `full` AND `records_rejected` (computed) gt `0`

**Then:**
- **call_service** target: `transaction_rollback`
- **set_field** target: `upload_status` value: `rejected`
- **emit_event** event: `client_upload.full_rollback`

### Upload_incremental_merge (Priority: 8) | Transaction: atomic

_Incremental upload - merge only supplied fields onto existing client records, leave other fields untouched_

**Given:**
- `upload_scope` (input) eq `incremental`
- `upload_mode` (input) eq `commit`
- `records_rejected` (computed) eq `0`

**Then:**
- **call_service** target: `client_record_merger`
- **emit_event** event: `client_upload.incremental.merged`

### Upload_audit_trail (Priority: 9)

_Persist a full audit trail of every uploaded record and its accept/reject decision_

**Given:**
- `processing_status` (system) in `completed,rejected`

**Then:**
- **create_record**
- **emit_event** event: `client_upload.audit.recorded`

### Generate_response_dataset (Priority: 10)

_Generate response dataset with per-record status_

**Given:**
- `processing_status` (system) eq `completed`

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `client_upload.response.delivered`

### Archive_upload (Priority: 11)

_Archive processed upload file and response file_

**Given:**
- `processing_status` (system) eq `completed`

**Then:**
- **call_service** target: `archive_storage`
- **emit_event** event: `client_upload.archived`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CLIENT_UPLOAD_INVALID_HEADER` | 400 | Upload file missing or invalid Card Code 000 header | No |
| `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING` | 422 | Required client account field missing | No |
| `CLIENT_UPLOAD_DUPLICATE_ACCOUNT` | 409 | Account number already exists | No |
| `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED` | 422 | FATCA classification fields failed validation | No |
| `CLIENT_UPLOAD_FILE_REJECTED` | 422 | Upload file rejected - see response dataset for details | No |
| `CLIENT_UPLOAD_TRAILER_MISMATCH` | 422 | Trailer record total does not match records sent | No |
| `CLIENT_UPLOAD_BROKER_MISMATCH` | 422 | Broker code on detail record does not match header | No |
| `CLIENT_UPLOAD_CONCURRENT_IN_PROGRESS` | 409 | A previous upload for this broker is still processing | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-financial-data-upload | optional |  |
| client-onboarding | recommended |  |
| popia-compliance | required |  |

## AGI Readiness

### Goals

#### Reliable Broker Client Data Upload

Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

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
| automated_upload_submission | `autonomous` | - | - |
| validate_mandatory_fields | `autonomous` | - | - |
| mandatory_field_missing | `autonomous` | - | - |
| fatca_validation_check | `autonomous` | - | - |
| upload_validation_pass | `autonomous` | - | - |
| upload_validation_fail_partial | `autonomous` | - | - |
| upload_full_rollback | `supervised` | - | - |
| upload_incremental_merge | `autonomous` | - | - |
| upload_audit_trail | `autonomous` | - | - |
| generate_response_dataset | `autonomous` | - | - |
| archive_upload | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
upload_card_codes:
  "999": Trailer Record - record counts and file control totals
  "000": Header Record - file metadata and broker identification
  "031": Mandatory, Conditionally Optional and Frequently Used Optional fields -
    core client account details
  "032": CSDP Details - central security depository participant account info
  "033": All Other Fields - safe custody, telephones, risk rating, credit limits
  "034": Portfolio Details - advisor code, accumulated profit, investment type
  "035": Banking Details - bank branch, account number, preferred account flag
  "036": Additional Client Maintenance fields - nameless account descriptor, POA,
    source of income, TFSA, trading address, reason for no tax number
  "037": Additional Address Maintenance fields - physical address, additional
    phone/fax/email/cell contacts
  "038": Legal and Tax Maintenance fields - FATCA, CRS, IT3, PEP, sanctions, GIIN,
    indicia, TIN
  "039": Supplementary Names and Address Details Record - linked account holders
    for joint or nominee accounts
  "040": Account Relationships - links between supplementary accounts and main
    client accounts
upload_modes:
  scope:
    - value: full
      label: Full replacement
      description: Entire file must succeed end-to-end; any failure rolls the whole
        file back atomically
    - value: incremental
      label: Incremental merge
      description: Only supplied fields overwrite existing records; other fields are
        preserved; failed rows are rejected individually
  commit:
    - value: validate_only
      label: Validate only
      description: Run all validations and return a response dataset without
        persisting any changes
    - value: commit
      label: Validate and commit
      description: Persist valid records and return a response dataset listing any
        rejections
  upload_type_field:
    field: UPL-TYP
    values:
      - value: N
        label: New
        rule: Card Code 031 or 039 is mandatory
      - value: U
        label: Update
        rule: Any card code acceptable
validation_response:
  dataset_name_pattern: <original_file_name>.S<sequence_number>
  record_length: 700
  fields:
    - name: CARD-CDE
      start: 1
      length: 3
      end: 3
      type: numeric
      value: "999"
    - name: BRK-CDE
      start: 4
      length: 3
      end: 6
      type: numeric
      description: Broker numeric code
    - name: DATE
      start: 7
      length: 8
      end: 14
      type: numeric
      description: Process date CCYYMMDD
    - name: TIME
      start: 15
      length: 6
      end: 20
      type: numeric
      description: Process time HHMMSS
    - name: TOTAL-RECORDS
      start: 21
      length: 9
      end: 29
      type: numeric
      description: Total records excluding header and trailer
    - name: RECORDS-PROCESSED
      start: 30
      length: 9
      end: 38
      type: numeric
      description: Successfully processed records
    - name: RECORDS-REJECTED
      start: 39
      length: 9
      end: 47
      type: numeric
      description: Rejected records
    - name: FILLER
      start: 48
      length: 653
      end: 700
      type: character
      description: Original uploaded record payload (space-filled on summary row)
    - name: COUNT-OF-MSGS-FOR-LINE
      start: 701
      length: 3
      end: 703
      type: numeric
      description: Count of errors appended to this line
    - name: ERROR-MESSAGE
      start: 704
      length: 50
      end: 753
      type: character
      description: Error message code appended to the uploaded row
  fatal_file_errors:
    - RECORD RECEIVED AFTER TRAILER
    - DUPLICATE TRAILER RECEIVED
    - BRK CDE NOT SAME AS HDR
    - TRAILER REC TOTAL NOT SAME AS RECS SENT
    - TRAILER NOT RECEIVED
  error_row_behaviour: For each failed field the uploaded row is replicated and
    the error description appended; the numeric prefix on each error line
    indicates the count of errors for that uploaded record (e.g. "002INVALID
    PRINCIPLE/AGENCY INDICATOR").
record_layouts:
  HEADER_000:
    card_code: "000"
    total_length: 30
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "000"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
        description: Broker numeric code
      - name: DATE
        start: 7
        length: 8
        end: 14
        type: numeric
        description: Upload date CCYYMMDD
      - name: TIME
        start: 15
        length: 6
        end: 20
        type: numeric
        description: Upload time HHMMSS
      - name: PREFIX
        start: 21
        length: 1
        end: 21
        type: character
        value: S
      - name: SEQ-NO
        start: 22
        length: 7
        end: 28
        type: character
        description: Sequence number
      - name: FILLER
        start: 29
        length: 2
        end: 30
        type: character
        description: Spaces
  TRAILER_999:
    card_code: "999"
    total_length: 50
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "999"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
        description: Broker numeric code
      - name: DATE
        start: 7
        length: 8
        end: 14
        type: numeric
        description: Process date CCYYMMDD
      - name: TIME
        start: 15
        length: 6
        end: 20
        type: numeric
        description: Process time HHMMSS
      - name: TOTAL-RECORDS
        start: 21
        length: 9
        end: 29
        type: numeric
        description: Total records excluding header and trailer
      - name: RECORDS-PROCESSED
        start: 30
        length: 9
        end: 38
        type: numeric
        description: Successfully processed records
      - name: RECORDS-REJECTED
        start: 39
        length: 9
        end: 47
        type: numeric
        description: Rejected records
      - name: FILLER
        start: 48
        length: 3
        end: 50
        type: character
        description: Spaces
  CARD_031:
    card_code: "031"
    total_length: 700
    description: Mandatory, Conditionally Optional and Frequently Used Optional fields
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "031"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
        description: N=New U=Update
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
        description: Account code - C type only
      - name: ACC-TYP-CDE
        start: 15
        length: 2
        end: 16
        type: character
        description: Account type code
      - name: ACC-ID-CDE
        start: 17
        length: 3
        end: 19
        type: character
        description: Account ID code
      - name: BRN-CDE
        start: 20
        length: 2
        end: 21
        type: character
        description: Branch code
      - name: PARTNER-CDE
        start: 22
        length: 2
        end: 23
        type: character
        description: Partner code
      - name: CLI-TITLE
        start: 24
        length: 10
        end: 33
        type: character
        description: Client title
      - name: INITIALS
        start: 34
        length: 4
        end: 37
        type: character
      - name: FIRST-NAMES
        start: 38
        length: 40
        end: 77
        type: character
      - name: SURNAME
        start: 78
        length: 40
        end: 117
        type: character
        description: Surname or company name
      - name: ADR-LINE-1
        start: 118
        length: 40
        end: 157
        type: character
      - name: ADR-LINE-2
        start: 158
        length: 40
        end: 197
        type: character
      - name: ADR-LINE-3
        start: 198
        length: 40
        end: 237
        type: character
      - name: ADR-LINE-4
        start: 238
        length: 40
        end: 277
        type: character
      - name: POSTAL-CDE
        start: 278
        length: 4
        end: 281
        type: character
      - name: SEX
        start: 282
        length: 1
        end: 282
        type: character
        description: M/F/B
      - name: LANG-CDE
        start: 283
        length: 1
        end: 283
        type: character
        description: E=English A=Afrikaans
      - name: INSTIT-CDE
        start: 284
        length: 3
        end: 286
        type: character
        description: Institution code
      - name: STAFF-IND
        start: 287
        length: 1
        end: 287
        type: character
      - name: INC-BAL
        start: 288
        length: 1
        end: 288
        type: character
        description: Income balance indicator Y/N
      - name: CTA-OPTN-CDE
        start: 289
        length: 1
        end: 289
        type: character
        description: Contra option code
      - name: MAN-CDE
        start: 290
        length: 3
        end: 292
        type: character
        description: Managed code
      - name: SET-TYP-CDE
        start: 293
        length: 1
        end: 293
        type: character
        description: Settlement type code C/D
      - name: NON-RES-IND
        start: 294
        length: 1
        end: 294
        type: character
        description: Non-resident indicator
      - name: EXCH-CTL
        start: 295
        length: 1
        end: 295
        type: character
        description: Exchange control code
      - name: COUNTRY-CDE
        start: 296
        length: 3
        end: 298
        type: character
        description: Country of residence
      - name: PRIN-AG-IND
        start: 299
        length: 1
        end: 299
        type: character
        description: Trading capacity indicator
      - name: ELECTION-IND
        start: 300
        length: 1
        end: 300
        type: character
        description: Corporate action default election
      - name: ELEC-RPT-IND
        start: 301
        length: 1
        end: 301
        type: character
        description: Electronic report indicator
      - name: TAX-NO
        start: 302
        length: 12
        end: 313
        type: character
        description: Income tax number
      - name: VAT-NO
        start: 314
        length: 13
        end: 326
        type: character
      - name: EMAIL-ADDR
        start: 327
        length: 55
        end: 381
        type: character
      - name: MANDATE-MOD
        start: 382
        length: 1
        end: 382
        type: character
        description: Mandate modification indicator
      - name: MAND-CHG-DTE
        start: 383
        length: 8
        end: 390
        type: numeric
        description: Mandate changed date CCYYMMDD
      - name: MAND-RCV-DTE
        start: 391
        length: 8
        end: 398
        type: numeric
        description: Mandate received date CCYYMMDD
      - name: SHORT-NAME
        start: 399
        length: 20
        end: 418
        type: character
        description: Short account name
      - name: REG-INS-CDE
        start: 419
        length: 2
        end: 420
        type: numeric
        description: Registration instruction code
      - name: SCR-DISP-CDE
        start: 421
        length: 2
        end: 422
        type: character
        description: Scrip disposal code
      - name: NEG-SCALE
        start: 423
        length: 3
        end: 425
        type: character
        description: Negotiated brokerage scale code
      - name: EXTNL-ACC-IND
        start: 426
        length: 1
        end: 426
        type: character
      - name: EXTNL-ACC-CDE
        start: 427
        length: 17
        end: 443
        type: character
      - name: EL-PAY-MAN-DTE
        start: 444
        length: 8
        end: 451
        type: numeric
        description: Electronic payment mandate date
      - name: BEE-IND
        start: 452
        length: 1
        end: 452
        type: character
      - name: EXP-DTE
        start: 453
        length: 8
        end: 460
        type: numeric
        description: BEE expiry date
      - name: POSTAL-ADD-CO-IND
        start: 461
        length: 1
        end: 461
        type: character
        description: Postal Care of indicator Y/N
      - name: CO-NAME
        start: 462
        length: 30
        end: 491
        type: character
        description: Postal care-of name
      - name: FREE-TEXT
        start: 492
        length: 64
        end: 555
        type: character
        description: Free text internal reference
      - name: FILLER
        start: 556
        length: 145
        end: 700
        type: character
  CARD_032:
    card_code: "032"
    total_length: 700
    description: CSDP Details
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "032"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
        description: U=Update only
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: CSDP-CDE
        start: 15
        length: 2
        end: 16
        type: character
        description: Bank code
      - name: CSDP-BRN-CDE
        start: 17
        length: 4
        end: 20
        type: character
        description: Bank branch code
      - name: CSDP-ACC-NO
        start: 21
        length: 16
        end: 36
        type: character
        description: Bank account number
      - name: CSDP-BIC-CDE
        start: 37
        length: 11
        end: 47
        type: character
        description: Bank BIC code
      - name: CSDP-BP-ID
        start: 48
        length: 8
        end: 55
        type: character
        description: Business partner ID
      - name: CSDP-CSD-ACC-NO
        start: 56
        length: 9
        end: 64
        type: numeric
        description: System generated - upload as zeros
      - name: CSH-AGT-CDE
        start: 65
        length: 2
        end: 66
        type: character
        description: Cash agent bank code
      - name: CSH-AGT-BRN-CDE
        start: 67
        length: 4
        end: 70
        type: character
        description: Cash agent branch code
      - name: CSH-AGT-ACC-NO
        start: 71
        length: 16
        end: 86
        type: character
        description: Cash agent account number
      - name: CSH-AGT-BIC-CDE
        start: 87
        length: 11
        end: 97
        type: character
        description: Cash agent BIC code
      - name: CSH-AGT-BP-ID
        start: 98
        length: 8
        end: 105
        type: character
        description: Cash agent business partner ID
      - name: CLNT-BIC-CDE
        start: 106
        length: 11
        end: 116
        type: character
        description: Client account BIC
      - name: STRT-CSDP-TEL-NO
        start: 117
        length: 15
        end: 131
        type: character
        description: CSDP telephone number
      - name: STRT-ACC-TYP-HOLDER
        start: 132
        length: 1
        end: 132
        type: character
        description: CSDP account type holder
      - name: FILLER
        start: 133
        length: 568
        end: 700
        type: character
  CARD_033:
    card_code: "033"
    total_length: 700
    description: All Other Fields
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "033"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
        description: U=Update only
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: SC-CHG-CDE
        start: 15
        length: 2
        end: 16
        type: numeric
        description: Safe custody charge code
      - name: TEL-NO-1
        start: 17
        length: 15
        end: 31
        type: character
      - name: TEL-NO-2
        start: 32
        length: 15
        end: 46
        type: character
      - name: TELEFAX
        start: 47
        length: 15
        end: 61
        type: character
      - name: REF-BY
        start: 62
        length: 30
        end: 91
        type: character
        description: Referrer name
      - name: SPEC-REG-NAME
        start: 92
        length: 70
        end: 161
        type: character
        description: Full name for registration
      - name: INV-RET-CDE
        start: 162
        length: 2
        end: 163
        type: character
        description: Investment return code
      - name: SLB-RATE
        start: 164
        length: 5
        end: 168
        type: numeric
        description: Scrip lending and borrowing rate
      - name: DV-ADV-NOTES-IND
        start: 169
        length: 1
        end: 169
        type: character
        description: Dividend advice note indicator
      - name: ASSET-RATE
        start: 170
        length: 5
        end: 174
        type: numeric
        description: Account asset rating
      - name: RTS-CONSOL-IND
        start: 175
        length: 1
        end: 175
        type: character
        description: Rights consolidation indicator
      - name: ALLOC-SEQ-NO
        start: 176
        length: 3
        end: 178
        type: numeric
        description: Scrip allocation sequence code
      - name: VAT-INV-IND
        start: 179
        length: 1
        end: 179
        type: character
      - name: POW-ATT
        start: 180
        length: 1
        end: 180
        type: character
        description: Power of attorney held
      - name: CLI-IND
        start: 181
        length: 7
        end: 187
        type: character
        description: Client indicator
      - name: CLI-CAT
        start: 188
        length: 2
        end: 189
        type: character
        description: Client category
      - name: SCRIP-ACC-NO
        start: 190
        length: 12
        end: 201
        type: character
      - name: MIN-NTE-IND
        start: 202
        length: 1
        end: 202
        type: character
        description: Minimised note indicator
      - name: CR-LIM-CDE
        start: 203
        length: 2
        end: 204
        type: character
        description: Credit limit code (deprecated)
      - name: CR-LIM-AMT
        start: 205
        length: 15
        end: 219
        type: numeric
        description: Credit limit amount
      - name: SAFEX-ACC-CDE
        start: 220
        length: 5
        end: 224
        type: character
        description: Derivatives account code
      - name: SAFEX-RATE-CLASS
        start: 225
        length: 1
        end: 225
        type: character
        description: Derivatives rate class
      - name: UNEX-CDE
        start: 226
        length: 8
        end: 233
        type: character
        description: Bond market code
      - name: MMKT-IND
        start: 234
        length: 1
        end: 234
        type: character
        description: Money market indicator
      - name: MMKT-MANDATE-DTE
        start: 235
        length: 8
        end: 242
        type: numeric
        description: Money market mandate date CCYYMMDD
      - name: NO-MST-IND
        start: 243
        length: 1
        end: 243
        type: character
        description: Marketable securities tax indicator
      - name: CMPY-RPT-IND
        start: 244
        length: 1
        end: 244
        type: character
        description: Company report indicator
      - name: PF-MAN-CHG-CDE
        start: 245
        length: 2
        end: 246
        type: numeric
        description: Portfolio management charge code
      - name: DTE-DEACTIVATED
        start: 247
        length: 8
        end: 254
        type: numeric
      - name: FILLER
        start: 255
        length: 446
        end: 700
        type: character
  CARD_034:
    card_code: "034"
    total_length: 700
    description: Portfolio Details
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "034"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
        description: U=Update only
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: ADVR-CDE
        start: 15
        length: 4
        end: 18
        type: character
        description: Advisor code
      - name: ACCUM-PROFIT
        start: 19
        length: 15
        end: 33
        type: numeric
        description: Accumulated profit (13
        2): null
      - name: INV-TYP
        start: 34
        length: 3
        end: 36
        type: character
        description: Investment type code
      - name: FILLER
        start: 37
        length: 664
        end: 700
        type: character
  CARD_035:
    card_code: "035"
    total_length: 700
    description: Banking Details
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "035"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
        description: U=Update only
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: BAL-CDE
        start: 15
        length: 2
        end: 16
        type: character
        description: Balance code
      - name: BANK-BRN-NO
        start: 17
        length: 6
        end: 22
        type: numeric
        description: Bank branch code
      - name: BANK-ACC-NO
        start: 23
        length: 16
        end: 38
        type: character
        description: Bank account number
      - name: BANK-DESCRIP
        start: 39
        length: 20
        end: 58
        type: character
        description: Bank name
      - name: BANK-ACC-TYP
        start: 59
        length: 1
        end: 59
        type: character
        description: Bank account type
      - name: PAYEE-NAME
        start: 60
        length: 35
        end: 94
        type: character
        description: Payee or account name
      - name: PREFERRED-ACC
        start: 95
        length: 1
        end: 95
        type: character
        description: Preferred account Y/N
      - name: FILLER
        start: 96
        length: 605
        end: 700
        type: character
  CARD_036:
    card_code: "036"
    total_length: 700
    description: Additional client maintenance fields
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "036"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: NAMELESS-ACC-DESC
        start: 15
        length: 18
        end: 32
        type: character
        description: Nameless account descriptor
      - name: PROCESS-INTEREST
        start: 33
        length: 1
        end: 33
        type: character
        description: C/D/N/B
      - name: PLEDGE-VALUE-REQUIRED
        start: 34
        length: 10
        end: 43
        type: numeric
        description: Pledge value
      - name: POA-IN-FAVOUR-OF
        start: 44
        length: 55
        end: 98
        type: character
      - name: FAX-INDEMNITY-RECEIVED
        start: 99
        length: 8
        end: 106
        type: numeric
        description: Date fax indemnity received
      - name: SOURCE-OF-INCOME
        start: 107
        length: 10
        end: 116
        type: character
      - name: PROCESS-MARGIN
        start: 117
        length: 1
        end: 117
        type: character
        description: Y/N - margin processing
      - name: RETAIL-CLI-IND
        start: 118
        length: 1
        end: 118
        type: character
        description: Retail client indicator
      - name: TFSA-IND
        start: 119
        length: 1
        end: 119
        type: character
        description: Tax-free savings account indicator
      - name: FOREIGN-POST-CDE
        start: 120
        length: 10
        end: 129
        type: character
      - name: POST-CNTRY-CDE
        start: 130
        length: 3
        end: 132
        type: character
      - name: TRADING-ADDR-LINE-1
        start: 133
        length: 40
        end: 172
        type: character
      - name: TRADING-ADDR-LINE-2
        start: 173
        length: 40
        end: 212
        type: character
      - name: TRADING-ADDR-LINE-3
        start: 213
        length: 40
        end: 252
        type: character
      - name: TRADING-ADDR-LINE-4
        start: 253
        length: 40
        end: 292
        type: character
      - name: TRADING-POSTAL-CDE
        start: 293
        length: 10
        end: 302
        type: character
      - name: REASON-FOR-NO-TAX-NUMBER
        start: 303
        length: 50
        end: 352
        type: character
      - name: FILLER
        start: 353
        length: 348
        end: 700
        type: character
  CARD_037:
    card_code: "037"
    total_length: 700
    description: Additional address maintenance fields
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "037"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: SAME-AS-POSTAL-ADD
        start: 15
        length: 1
        end: 15
        type: character
      - name: PHY-ADD-CO-IND
        start: 16
        length: 1
        end: 16
        type: character
      - name: PHY-CO-NAME
        start: 17
        length: 30
        end: 46
        type: character
      - name: PHY-UNIT-NUMBER
        start: 47
        length: 5
        end: 51
        type: character
      - name: PHY-COMPLEX-NAME
        start: 52
        length: 26
        end: 77
        type: character
      - name: PHY-STREET-NUMBER
        start: 78
        length: 5
        end: 82
        type: character
      - name: PHY-STREET-NAME
        start: 83
        length: 26
        end: 108
        type: character
      - name: PHY-SUBURB-DISTRICT
        start: 109
        length: 34
        end: 142
        type: character
      - name: PHY-CITY-TOWN
        start: 143
        length: 23
        end: 165
        type: character
      - name: PHY-POST-CDE
        start: 166
        length: 10
        end: 175
        type: character
      - name: PHY-CNTRY-CDE
        start: 176
        length: 3
        end: 178
        type: character
      - name: FAX2-CNTRY
        start: 179
        length: 3
        end: 181
        type: character
      - name: FAX2
        start: 182
        length: 10
        end: 191
        type: character
      - name: TEL3-CNTRY
        start: 192
        length: 3
        end: 194
        type: character
      - name: TEL3
        start: 195
        length: 10
        end: 204
        type: character
      - name: TEL4-CNTRY
        start: 205
        length: 3
        end: 207
        type: character
      - name: TEL4
        start: 208
        length: 10
        end: 217
        type: character
      - name: EMAIL2
        start: 218
        length: 55
        end: 272
        type: character
      - name: EMAIL-DESC-2
        start: 273
        length: 26
        end: 298
        type: character
      - name: EMAIL3
        start: 299
        length: 55
        end: 353
        type: character
      - name: EMAIL-DESC-3
        start: 354
        length: 26
        end: 379
        type: character
      - name: EMAIL4
        start: 380
        length: 55
        end: 434
        type: character
      - name: EMAIL-DESC-4
        start: 435
        length: 26
        end: 460
        type: character
      - name: CELL-1
        start: 461
        length: 10
        end: 470
        type: character
      - name: CELL-DESC-1
        start: 471
        length: 26
        end: 496
        type: character
      - name: CELL-2
        start: 497
        length: 10
        end: 506
        type: character
      - name: CELL-DESC-2
        start: 507
        length: 26
        end: 532
        type: character
      - name: CELL-3
        start: 533
        length: 10
        end: 542
        type: character
      - name: CELL-DESC-3
        start: 543
        length: 26
        end: 568
        type: character
      - name: FILLER
        start: 569
        length: 132
        end: 700
        type: character
  CARD_038:
    card_code: "038"
    total_length: 700
    description: Legal and tax maintenance fields
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "038"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: ID-TYPE
        start: 15
        length: 3
        end: 17
        type: numeric
        description: Code identifying type of ID
      - name: ID
        start: 18
        length: 30
        end: 47
        type: character
        description: ID/Passport/Company reg/Trust number
      - name: CTRY-OF-ISSUE-INC
        start: 48
        length: 3
        end: 50
        type: character
      - name: DTE-OF-ISSUE-INC
        start: 51
        length: 8
        end: 58
        type: numeric
      - name: PP-EXPIRY-DTE
        start: 59
        length: 8
        end: 66
        type: numeric
      - name: DTE-OF-BIRTH
        start: 67
        length: 8
        end: 74
        type: numeric
      - name: CNTRY-OF-BIRTH
        start: 75
        length: 3
        end: 77
        type: character
      - name: PLACE-OF-BIRTH
        start: 78
        length: 33
        end: 110
        type: character
      - name: CTRY-OF-RES-FOR-DWT
        start: 111
        length: 3
        end: 113
        type: character
      - name: DWT-EXEMP-FORM-REC
        start: 114
        length: 1
        end: 114
        type: character
        description: System generated - not uploaded
      - name: IT3B-EXCL
        start: 115
        length: 1
        end: 115
        type: character
        description: Y excludes from IT3B
      - name: IT3C-EXCL
        start: 116
        length: 1
        end: 116
        type: character
        description: Y excludes from IT3C
      - name: DWT-FORM-A-OR-B
        start: 117
        length: 1
        end: 117
        type: character
      - name: DTA-FORM-REC
        start: 118
        length: 3
        end: 120
        type: character
        description: Country code of DTA
      - name: PASS-THRU
        start: 121
        length: 1
        end: 121
        type: character
        description: Dividend pass-through indicator
      - name: REPORTING-ACCOUNT
        start: 122
        length: 1
        end: 122
        type: character
        description: Foreign tax reporting required Y/N
      - name: ACC-HOLDER-TYP
        start: 123
        length: 8
        end: 130
        type: character
      - name: ACC-STATUS
        start: 131
        length: 2
        end: 132
        type: character
      - name: LEG-ENT-CDE
        start: 133
        length: 2
        end: 134
        type: character
        description: Legal entity code - mandatory if REPORTING-ACCOUNT=Y
      - name: FI-GIIN
        start: 135
        length: 19
        end: 153
        type: character
        description: Financial institution GIIN
      - name: INDICIA1
        start: 154
        length: 3
        end: 156
        type: character
      - name: INDICIA2
        start: 157
        length: 3
        end: 159
        type: character
      - name: INDICIA3
        start: 160
        length: 3
        end: 162
        type: character
      - name: INDICIA4
        start: 163
        length: 3
        end: 165
        type: character
      - name: INDICIA5
        start: 166
        length: 3
        end: 168
        type: character
      - name: TAX-RES1
        start: 169
        length: 3
        end: 171
        type: character
      - name: TAX-RES2
        start: 172
        length: 3
        end: 174
        type: character
      - name: TAX-RES3
        start: 175
        length: 3
        end: 177
        type: character
      - name: TAX-RES4
        start: 178
        length: 3
        end: 180
        type: character
      - name: TAX-RES5
        start: 181
        length: 3
        end: 183
        type: character
      - name: NAL1
        start: 184
        length: 3
        end: 186
        type: character
      - name: NAL2
        start: 187
        length: 3
        end: 189
        type: character
      - name: NAL3
        start: 190
        length: 3
        end: 192
        type: character
      - name: NAL4
        start: 193
        length: 3
        end: 195
        type: character
      - name: NAL5
        start: 196
        length: 3
        end: 198
        type: character
      - name: TIN1
        start: 199
        length: 20
        end: 218
        type: character
      - name: TIN2
        start: 219
        length: 20
        end: 238
        type: character
      - name: TIN3
        start: 239
        length: 20
        end: 258
        type: character
      - name: TIN4
        start: 259
        length: 20
        end: 278
        type: character
      - name: TIN5
        start: 279
        length: 20
        end: 298
        type: character
      - name: JUR1
        start: 299
        length: 3
        end: 301
        type: character
      - name: JUR2
        start: 302
        length: 3
        end: 304
        type: character
      - name: JUR3
        start: 305
        length: 3
        end: 307
        type: character
      - name: JUR4
        start: 308
        length: 3
        end: 310
        type: character
      - name: JUR5
        start: 311
        length: 3
        end: 313
        type: character
      - name: SIC-CDE
        start: 314
        length: 5
        end: 318
        type: numeric
        description: Standard Industrial Classification code
      - name: FICA-COMPLIANT
        start: 319
        length: 1
        end: 319
        type: character
      - name: FICA-DATE
        start: 320
        length: 8
        end: 327
        type: numeric
      - name: CLIENT-RISK
        start: 328
        length: 1
        end: 328
        type: character
        description: H/M/L
      - name: PEP-IND
        start: 329
        length: 1
        end: 329
        type: character
        description: Politically exposed person Y/N
      - name: CPA-MARKETING-MATERIAL
        start: 330
        length: 1
        end: 330
        type: character
      - name: CPA-MATERIAL-DISTRIBUTION
        start: 331
        length: 1
        end: 331
        type: character
        description: P=Post E=Email
      - name: INDIVIDUALS-PREV-DISADV
        start: 332
        length: 1
        end: 332
        type: character
      - name: COMPANIES-ANNUAL-TURNOVER
        start: 333
        length: 15
        end: 347
        type: numeric
      - name: TRUSTS-NO-OF-TRUSTEES
        start: 348
        length: 4
        end: 351
        type: numeric
      - name: JURISTIC-TRUSTEE
        start: 352
        length: 1
        end: 352
        type: character
      - name: BND-NAME
        start: 353
        length: 70
        end: 422
        type: character
        description: Clean name for central depository dissemination
      - name: RE-VER-DTE
        start: 423
        length: 8
        end: 430
        type: numeric
        description: Re-verification date
      - name: ALT-ID
        start: 431
        length: 13
        end: 443
        type: character
        description: Alternative ID field
      - name: COMM-BY-ISSUER
        start: 444
        length: 1
        end: 444
        type: character
        description: Communication by issuer Y/N/M
      - name: UND-REASON-CDE
        start: 445
        length: 3
        end: 447
        type: character
        description: CRS undocumented reason code
      - name: GEN-COMPLNCE-REASON-CDE
        start: 448
        length: 3
        end: 450
        type: character
        description: CRS general compliance reason code
      - name: FILLER
        start: 451
        length: 250
        end: 700
        type: character
  CARD_039:
    card_code: "039"
    total_length: 700
    description: Supplementary names and address details - joint and nominee holders
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "039"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: ACC-TYP-CDE
        start: 15
        length: 2
        end: 16
        type: character
        description: Must be * type
      - name: BRN-CDE
        start: 17
        length: 2
        end: 18
        type: character
      - name: PARTNER-CDE
        start: 19
        length: 2
        end: 20
        type: character
      - name: FIRST-NAMES
        start: 21
        length: 40
        end: 60
        type: character
      - name: CO-ADD-IND
        start: 61
        length: 1
        end: 61
        type: character
        description: Care-of address indicator
      - name: TITLE
        start: 62
        length: 10
        end: 71
        type: character
      - name: INITIALS
        start: 72
        length: 4
        end: 75
        type: character
      - name: SURNAME
        start: 76
        length: 40
        end: 115
        type: character
      - name: SA-RESIDENT
        start: 116
        length: 1
        end: 116
        type: character
      - name: ADR-LINE-1
        start: 117
        length: 40
        end: 156
        type: character
      - name: ADR-LINE-2
        start: 157
        length: 40
        end: 196
        type: character
      - name: ADR-LINE-3
        start: 197
        length: 40
        end: 236
        type: character
      - name: ADR-LINE-4
        start: 237
        length: 40
        end: 276
        type: character
      - name: POSTAL-CDE
        start: 277
        length: 4
        end: 280
        type: character
      - name: COUNTRY-CDE
        start: 281
        length: 3
        end: 283
        type: character
      - name: FGN-POST-CDE
        start: 284
        length: 10
        end: 293
        type: character
      - name: TEL-NO-1
        start: 294
        length: 15
        end: 308
        type: character
      - name: TEL-NO-2
        start: 309
        length: 15
        end: 323
        type: character
      - name: TELEFAX
        start: 324
        length: 15
        end: 338
        type: character
      - name: EMAIL-ADDR
        start: 339
        length: 55
        end: 393
        type: character
      - name: ALPHA-CDE
        start: 394
        length: 20
        end: 413
        type: character
        description: Alpha or shortened account name
      - name: INSTIT-CDE
        start: 414
        length: 3
        end: 416
        type: character
      - name: LANG-CDE
        start: 417
        length: 1
        end: 417
        type: character
      - name: SCR-DISP-CDE
        start: 418
        length: 2
        end: 419
        type: character
      - name: ETC-FUND-CDE
        start: 420
        length: 3
        end: 422
        type: character
        description: Electronic trade confirmation fund code
      - name: ETC-FUND-BIC
        start: 423
        length: 11
        end: 433
        type: character
      - name: ELEC-REP-IND
        start: 434
        length: 1
        end: 434
        type: character
      - name: SHAREHOLDER-PCT
        start: 435
        length: 3
        end: 437
        type: numeric
        description: Percentage this account holder holds
      - name: CONTROL-PERSON-TYP
        start: 438
        length: 8
        end: 445
        type: character
      - name: CONTACT
        start: 446
        length: 55
        end: 500
        type: character
        description: Contact person details
      - name: CELL
        start: 501
        length: 10
        end: 510
        type: numeric
      - name: DESCRIPTION
        start: 511
        length: 26
        end: 536
        type: character
      - name: FILLER
        start: 537
        length: 164
        end: 700
        type: character
  CARD_040:
    card_code: "040"
    total_length: 700
    description: Account relationships - links between supplementary and main accounts
    fields:
      - name: CARD-CDE
        start: 1
        length: 3
        end: 3
        type: numeric
        value: "040"
      - name: BRK-CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: UPL-TYP
        start: 7
        length: 1
        end: 7
        type: character
      - name: ACC-CDE
        start: 8
        length: 7
        end: 14
        type: numeric
      - name: REL-CDE
        start: 15
        length: 2
        end: 16
        type: character
        description: Relationship code
      - name: SUPP-ACC-BRK
        start: 17
        length: 3
        end: 19
        type: numeric
        description: Numeric broker code of linked account
      - name: SUPP-ACC-CDE
        start: 20
        length: 7
        end: 26
        type: numeric
        description: Linked supplementary account number
      - name: COPIES
        start: 27
        length: 2
        end: 28
        type: numeric
      - name: FREQUENCY
        start: 29
        length: 1
        end: 29
        type: character
        description: Report frequency code
      - name: MNTH
        start: 30
        length: 2
        end: 31
        type: numeric
        description: Month code
      - name: DAY
        start: 32
        length: 2
        end: 33
        type: numeric
        description: Day code
      - name: FILLER
        start: 34
        length: 667
        end: 700
        type: character
record_type_map:
  "999": Trailer Record
  "000": Header Record
  "031": Mandatory and Frequently Used Optional fields
  "032": CSDP Details
  "033": All Other Fields
  "034": Portfolio Details
  "035": Banking Details
  "036": Additional Client Maintenance Fields
  "037": Additional Address Maintenance Fields
  "038": Legal and Tax Maintenance Fields
  "039": Supplementary Names and Address Details
  "040": Account Relationships
card_codes:
  "999":
    name: Trailer Record
    purpose: Record counts and file control totals
  "000":
    name: Header Record
    purpose: File metadata and broker identification
  "031":
    name: Mandatory, Conditionally Optional and Frequently Used Optional fields
    purpose: Core client account details
  "032":
    name: CSDP Details
    purpose: Central security depository participant account info
  "033":
    name: All Other Fields
    purpose: Employment, income, risk rating, KYC fields
  "034":
    name: Portfolio Details
    purpose: Portfolio configuration for portfolio clients
  "035":
    name: Banking Details
    purpose: Bank branch, account number and preferred account flag
  "036":
    name: Additional Client Maintenance fields
    purpose: Nameless descriptor, POA, trading address, TFSA, reason for no tax number
  "037":
    name: Additional Address Maintenance fields
    purpose: Physical address, additional phones, faxes, emails and cell numbers
  "038":
    name: Legal and Tax Maintenance fields
    purpose: FATCA, CRS, IT3, PEP, sanctions, GIIN, indicia, TINs
  "039":
    name: Supplementary Names and Address Details
    purpose: Linked account holders for joint or nominee accounts
  "040":
    name: Account Relationships
    purpose: Links between supplementary accounts and main client accounts
submission_methods:
  - Automated secure file transfer submission
  - Manual online upload via reporting function
  - Batch upload
delivery_workflow:
  - 1. Email address setup
  - 2. Upload file submission (automated file transfer or manual)
  - 3. Error reporting via central error enquiry and printed error report
  - 4. Response dataset delivery
  - 5. Archiving
compliance_standards:
  - FATCA (Foreign Account Tax Compliance Act)
  - CRS (Common Reporting Standard)
  - Local IT3(b) and IT3(c) tax reporting
  - PEP (Politically Exposed Persons) screening
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Client Data Upload Blueprint",
  "description": "Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, client-data, fatca, kyc, card-codes, fixed-width, csdp"
}
</script>
