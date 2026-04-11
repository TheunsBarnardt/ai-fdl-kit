<!-- AUTO-GENERATED FROM broker-client-data-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Client Data Upload

> Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · client-data · fatca · kyc · card-codes · fixed-width · csdp

## What this does

Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **record_count** *(number, optional)* — Record Count
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

## What must be true

- **submission:** MUST: Support automated file submission via FTP, MUST: Support manual online upload via comprehensive reporting process function, MUST: Configure email addresses before allowing upload submission, MUST: Provide response dataset acknowledging upload status, MUST: Archive processed upload files
- **validation:** MUST: Validate mandatory fields on Card Code 031, MUST: Reject files with invalid Card Code 000 header, MUST: Report field-level errors via COMPR/PCOMPR error reporting, MUST: Return response codes indicating success or failure per record
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Group related fields into logical Card Codes (031, 032, 033, 034, 036, 037, 038)
- **compliance:** MUST: Support FATCA classification fields (GIN, TIN, US person indicator), MUST: Support Common Reporting Standard (CRS) fields, MUST: Support IT3(b) and IT3(c) tax reporting exclusion flags, MUST: Support politically exposed person (PEP) indicator
- **identification:** MUST: Use unique account number as primary identifier, MUST: Capture ID number and ID type for every client

## Success & failure scenarios

**✅ Success paths**

- **Automated Upload Submission** — when email_configured eq true; file_format eq "fixed_width_card_code", then create_record; emit client_upload.submitted.
- **Validate Mandatory Fields** — when card_code eq "031", then call service; emit client_upload.validated.
- **Generate Response Dataset** — when upload file processing complete, then create_record; notify via email; emit client_upload.response.delivered.
- **Archive Upload** — when processing_status eq "completed", then call service; emit client_upload.archived.

**❌ Failure paths**

- **Mandatory Field Missing** — when account_number not_exists OR client_name not_exists OR id_number not_exists, then create_record; emit client_upload.validation_failed. *(error: `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING`)*
- **Fatca Validation Check** — when card_code eq "038"; us_person_indicator eq "Y", then call service; emit client_upload.fatca.validated. *(error: `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED`)*

## Errors it can return

- `CLIENT_UPLOAD_INVALID_HEADER` — Upload file missing or invalid Card Code 000 header
- `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING` — Required client account field missing
- `CLIENT_UPLOAD_DUPLICATE_ACCOUNT` — Account number already exists
- `CLIENT_UPLOAD_FATCA_VALIDATION_FAILED` — FATCA classification fields failed validation
- `CLIENT_UPLOAD_FILE_REJECTED` — Upload file rejected - see response dataset for details

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-financial-data-upload** *(optional)*
- **client-onboarding** *(recommended)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 61 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-client-data-upload/) · **Spec source:** [`broker-client-data-upload.blueprint.yaml`](./broker-client-data-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
