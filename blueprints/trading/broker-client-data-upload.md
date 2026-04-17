<!-- AUTO-GENERATED FROM broker-client-data-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Client Data Upload

> Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

**Category:** Trading · **Version:** 1.1.0 · **Tags:** back-office · broker · upload · client-data · fatca · kyc · card-codes · fixed-width · csdp

## What this does

Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **upload_time** *(text, optional)* — Upload Time
- **sequence_number** *(text, required)* — Sequence Number
- **upload_type** *(select, required)* — Upload Type
- **record_count** *(number, optional)* — Record Count
- **records_processed** *(number, optional)* — Records Processed
- **records_rejected** *(number, optional)* — Records Rejected
- **account_number** *(text, required)* — Account Number
- **client_name** *(text, required)* — Client Name
- **client_initials** *(text, optional)* — Client Initials
- **client_surname** *(text, optional)* — Client Surname
- **client_title** *(select, optional)* — Client Title
- **id_number** *(text, required)* — Id Number
- **id_type** *(select, optional)* — Id Type
- **date_of_birth** *(date, optional)* — Date Of Birth
- **gender** *(select, optional)* — Gender
- **country_of_birth** *(text, optional)* — Country Of Birth
- **nationality** *(text, optional)* — Nationality
- **citizenship** *(text, optional)* — Citizenship
- **language_preference** *(select, optional)* — Language Preference
- **account_type** *(select, optional)* — Account Type
- **csdp_code** *(text, optional)* — Csdp Code
- **csdp_account_number** *(text, optional)* — Csdp Account Number
- **csdp_bank_code** *(text, optional)* — Csdp Bank Code
- **dematerialisation_indicator** *(select, optional)* — Dematerialisation Indicator
- **employment_status** *(select, optional)* — Employment Status
- **occupation** *(text, optional)* — Occupation
- **employer_name** *(text, optional)* — Employer Name
- **income_category** *(select, optional)* — Income Category
- **source_of_funds** *(text, optional)* — Source Of Funds
- **risk_rating** *(select, optional)* — Risk Rating
- **vat_number** *(text, optional)* — Vat Number
- **income_tax_reference** *(text, optional)* — Income Tax Reference
- **marital_status** *(select, optional)* — Marital Status
- **spouse_id_number** *(text, optional)* — Spouse Id Number
- **postal_address_line_1** *(text, optional)* — Postal Address Line 1
- **postal_address_line_2** *(text, optional)* — Postal Address Line 2
- **postal_city** *(text, optional)* — Postal City
- **postal_postcode** *(text, optional)* — Postal Postcode
- **postal_country** *(text, optional)* — Postal Country
- **physical_address_line_1** *(text, optional)* — Physical Address Line 1
- **physical_city** *(text, optional)* — Physical City
- **physical_postcode** *(text, optional)* — Physical Postcode
- **email_address** *(email, optional)* — Email Address
- **mobile_number** *(phone, optional)* — Mobile Number
- **telephone_home** *(phone, optional)* — Telephone Home
- **telephone_work** *(phone, optional)* — Telephone Work
- **fatca_status** *(select, optional)* — Fatca Status
- **fatca_classification** *(text, optional)* — Fatca Classification
- **gin_number** *(text, optional)* — Gin Number
- **tin_number** *(text, optional)* — Tin Number
- **tin_country** *(text, optional)* — Tin Country
- **it3b_exclusion** *(select, optional)* — It3b Exclusion
- **it3c_exclusion** *(select, optional)* — It3c Exclusion
- **withholding_tax_exemption** *(select, optional)* — Withholding Tax Exemption
- **us_person_indicator** *(select, optional)* — Us Person Indicator
- **crs_status** *(select, optional)* — Crs Status
- **politically_exposed_person** *(select, optional)* — Politically Exposed Person
- **sanctions_check_status** *(select, optional)* — Sanctions Check Status
- **portfolio_code** *(text, optional)* — Portfolio Code
- **portfolio_manager** *(text, optional)* — Portfolio Manager
- **portfolio_mandate_type** *(select, optional)* — Portfolio Mandate Type
- **portfolio_base_currency** *(text, optional)* — Portfolio Base Currency
- **portfolio_benchmark** *(text, optional)* — Portfolio Benchmark
- **upload_mode** *(select, optional)* — Upload Mode
- **upload_scope** *(select, optional)* — Upload Scope

## What must be true

- **submission:** MUST: Support automated file submission via secure file transfer, MUST: Support manual online upload via reporting process function, MUST: Configure notification email addresses before allowing upload submission, MUST: Provide response dataset acknowledging upload status per record, MUST: Archive processed upload files and response files, MUST: Enforce 1000-record limit per online upload file, MUST: Prevent new upload until previous upload has completed processing
- **validation:** MUST: Validate mandatory fields on Card Code 031, MUST: Reject files with invalid Card Code 000 header, MUST: Reject entire file on fatal file-level errors (duplicate trailer, missing trailer, broker mismatch, record after trailer, trailer count mismatch), MUST: Report field-level errors via central error enquiry and printed error report, MUST: Return response codes indicating success or failure per record, MUST: Replicate a rejected record in the response file once per failed field with each error appended
- **format:** MUST: Use fixed-width card code record format with total record length of 700 bytes (header 30, trailer 50), MUST: Zero-fill numeric fields and space-fill character fields when no value supplied, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Group related fields into logical Card Codes (031, 032, 033, 034, 035, 036, 037, 038, 039, 040), MUST: Append sequence number (prefixed S) from header record to response file name
- **compliance:** MUST: Support FATCA classification fields (GIIN, TIN, US person indicator), MUST: Support Common Reporting Standard (CRS) fields including undocumented reason codes, MUST: Support IT3(b) and IT3(c) tax reporting exclusion flags, MUST: Support politically exposed person (PEP) indicator, MUST: Support dividend withholding tax (DWT) exemption — system-generated, not uploaded
- **identification:** MUST: Use unique account number as primary identifier, MUST: Capture ID number and ID type for every client
- **modes:** MUST: Support UPL-TYP = N (new account) — Card Code 031 or 039 is mandatory, MUST: Support UPL-TYP = U (update) — any card code acceptable, MUST: Support validate-only mode that runs all checks without committing, MUST: Support incremental merge mode that leaves unspecified fields untouched, MUST: Support full replacement mode that rolls back the entire file if any record fails (when configured)
- **audit:** MUST: Persist every uploaded record with broker code, sequence number and submission timestamp, MUST: Log every accept/reject decision with reason codes against the original row, MUST: Retain response files and source files on daily backup for the configured retention window

## Success & failure scenarios

**✅ Success paths**

- **Automated Upload Submission** — when email_configured eq true; file_format eq "fixed_width_card_code", then create_record; emit client_upload.submitted. _Why: Broker submits upload file via automated secure file transfer._
- **Validate Mandatory Fields** — when card_code eq "031", then call service; emit client_upload.validated. _Why: Validate Card Code 031 mandatory fields._
- **Upload Validation Pass** — when records_rejected eq 0; upload_mode in ["validate_only","commit"], then set upload_status = "validated"; emit client_upload.validation.pass. _Why: All records pass validation; file is ready to commit._
- **Upload Incremental Merge** — when upload_scope eq "incremental"; upload_mode eq "commit"; records_rejected eq 0, then call service; emit client_upload.incremental.merged. _Why: Incremental upload - merge only supplied fields onto existing client records, leave other fields untouched._
- **Upload Audit Trail** — when processing_status in ["completed","rejected"], then create_record; emit client_upload.audit.recorded. _Why: Persist a full audit trail of every uploaded record and its accept/reject decision._
- **Generate Response Dataset** — when processing_status eq "completed", then create_record; notify via email; emit client_upload.response.delivered. _Why: Generate response dataset with per-record status._
- **Archive Upload** — when processing_status eq "completed", then call service; emit client_upload.archived. _Why: Archive processed upload file and response file._

**❌ Failure paths**

- **Mandatory Field Missing** — when account_number not_exists OR client_name not_exists OR id_number not_exists, then create_record; emit client_upload.validation_failed. *(error: `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING`)*
- **Fatca Validation Check** — when card_code eq "038"; us_person_indicator eq "Y", then call service; emit client_upload.fatca.validated. _Why: Validate FATCA classification on Card Code 038._ *(error: `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED`)*
- **Upload Validation Fail Partial** — when records_rejected gt 0; upload_scope eq "incremental", then create_record; emit client_upload.validation.fail_partial. _Why: Some records failed validation; response dataset lists per-row errors._ *(error: `CLIENT_UPLOAD_FILE_REJECTED`)*
- **Upload Full Rollback** — when fatal_file_error eq true OR upload_scope eq "full" AND records_rejected gt 0, then call service; set upload_status = "rejected"; emit client_upload.full_rollback. _Why: Fatal file-level error or full-replacement mode with any failure - reject the entire file atomically._ *(error: `CLIENT_UPLOAD_FILE_REJECTED`)*

## Errors it can return

- `CLIENT_UPLOAD_INVALID_HEADER` — Upload file missing or invalid Card Code 000 header
- `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING` — Required client account field missing
- `CLIENT_UPLOAD_DUPLICATE_ACCOUNT` — Account number already exists
- `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED` — FATCA classification fields failed validation
- `CLIENT_UPLOAD_FILE_REJECTED` — Upload file rejected - see response dataset for details
- `CLIENT_UPLOAD_TRAILER_MISMATCH` — Trailer record total does not match records sent
- `CLIENT_UPLOAD_BROKER_MISMATCH` — Broker code on detail record does not match header
- `CLIENT_UPLOAD_CONCURRENT_IN_PROGRESS` — A previous upload for this broker is still processing

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-financial-data-upload** *(optional)*
- **client-onboarding** *(recommended)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+1** since baseline (80 → 81)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 61 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-client-data-upload/) · **Spec source:** [`broker-client-data-upload.blueprint.yaml`](./broker-client-data-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
