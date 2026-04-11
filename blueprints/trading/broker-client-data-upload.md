<!-- AUTO-GENERATED FROM broker-client-data-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Client Data Upload

> Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · client-data · fatca · kyc · card-codes · fixed-width · csdp

## What this does

Client account data upload from broker firms to central back-office via fixed-width card code files covering account, CSDP, addresses, FATCA/IT3 tax, and portfolio data

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)*
- **broker_code** *(text, required)*
- **upload_date** *(date, required)*
- **record_count** *(number, optional)*
- **account_number** *(text, required)*
- **client_name** *(text, required)*
- **client_initials** *(text, optional)*
- **client_surname** *(text, optional)*
- **client_title** *(select, optional)*
- **id_number** *(text, required)*
- **id_type** *(select, optional)*
- **date_of_birth** *(date, optional)*
- **gender** *(select, optional)*
- **country_of_birth** *(text, optional)*
- **nationality** *(text, optional)*
- **citizenship** *(text, optional)*
- **language_preference** *(select, optional)*
- **account_type** *(select, optional)*
- **csdp_code** *(text, optional)*
- **csdp_account_number** *(text, optional)*
- **csdp_bank_code** *(text, optional)*
- **dematerialisation_indicator** *(select, optional)*
- **employment_status** *(select, optional)*
- **occupation** *(text, optional)*
- **employer_name** *(text, optional)*
- **income_category** *(select, optional)*
- **source_of_funds** *(text, optional)*
- **risk_rating** *(select, optional)*
- **vat_number** *(text, optional)*
- **income_tax_reference** *(text, optional)*
- **marital_status** *(select, optional)*
- **spouse_id_number** *(text, optional)*
- **postal_address_line_1** *(text, optional)*
- **postal_address_line_2** *(text, optional)*
- **postal_city** *(text, optional)*
- **postal_postcode** *(text, optional)*
- **postal_country** *(text, optional)*
- **physical_address_line_1** *(text, optional)*
- **physical_city** *(text, optional)*
- **physical_postcode** *(text, optional)*
- **email_address** *(email, optional)*
- **mobile_number** *(phone, optional)*
- **telephone_home** *(phone, optional)*
- **telephone_work** *(phone, optional)*
- **fatca_status** *(select, optional)*
- **fatca_classification** *(text, optional)*
- **gin_number** *(text, optional)*
- **tin_number** *(text, optional)*
- **tin_country** *(text, optional)*
- **it3b_exclusion** *(select, optional)*
- **it3c_exclusion** *(select, optional)*
- **withholding_tax_exemption** *(select, optional)*
- **us_person_indicator** *(select, optional)*
- **crs_status** *(select, optional)*
- **politically_exposed_person** *(select, optional)*
- **sanctions_check_status** *(select, optional)*
- **portfolio_code** *(text, optional)*
- **portfolio_manager** *(text, optional)*
- **portfolio_mandate_type** *(select, optional)*
- **portfolio_base_currency** *(text, optional)*
- **portfolio_benchmark** *(text, optional)*

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
- **Fatca Validation Check** — when card_code eq "038"; us_person_indicator eq "Y", then call service; emit client_upload.fatca.validated.
- **Generate Response Dataset** — when upload file processing complete, then create_record; notify via email; emit client_upload.response.delivered.
- **Archive Upload** — when processing_status eq "completed", then call service; emit client_upload.archived.

**❌ Failure paths**

- **Mandatory Field Missing** — when account_number not_exists OR client_name not_exists OR id_number not_exists, then create_record; emit client_upload.validation_failed. *(error: `CLIENT_UPLOAD_MANDATORY_FIELD_MISSING`)*

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

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-client-data-upload/) · **Spec source:** [`broker-client-data-upload.blueprint.yaml`](./broker-client-data-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
