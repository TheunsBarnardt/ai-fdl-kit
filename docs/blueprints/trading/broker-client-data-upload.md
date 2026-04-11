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
| **Version** | 1.0.0 |
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
| `record_count` | number | No | Record Count |  |
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

## Rules

- **submission:** MUST: Support automated file submission via FTP, MUST: Support manual online upload via comprehensive reporting process function, MUST: Configure email addresses before allowing upload submission, MUST: Provide response dataset acknowledging upload status, MUST: Archive processed upload files
- **validation:** MUST: Validate mandatory fields on Card Code 031, MUST: Reject files with invalid Card Code 000 header, MUST: Report field-level errors via COMPR/PCOMPR error reporting, MUST: Return response codes indicating success or failure per record
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Group related fields into logical Card Codes (031, 032, 033, 034, 036, 037, 038)
- **compliance:** MUST: Support FATCA classification fields (GIN, TIN, US person indicator), MUST: Support Common Reporting Standard (CRS) fields, MUST: Support IT3(b) and IT3(c) tax reporting exclusion flags, MUST: Support politically exposed person (PEP) indicator
- **identification:** MUST: Use unique account number as primary identifier, MUST: Capture ID number and ID type for every client

## Outcomes

### Automated_upload_submission (Priority: 1)

**Given:**
- `email_configured` (db) eq `true`
- `file_format` (input) eq `fixed_width_card_code`

**Then:**
- **create_record**
- **emit_event** event: `client_upload.submitted`

### Validate_mandatory_fields (Priority: 2)

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

**Given:**
- `card_code` (input) eq `038`
- `us_person_indicator` (input) eq `Y`

**Then:**
- **call_service** target: `fatca_validator`
- **emit_event** event: `client_upload.fatca.validated`

### Generate_response_dataset (Priority: 5)

**Given:**
- upload file processing complete

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `client_upload.response.delivered`

### Archive_upload (Priority: 6)

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

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-financial-data-upload | optional |  |
| client-onboarding | recommended |  |

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
| generate_response_dataset | `autonomous` | - | - |
| archive_upload | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
card_codes:
  "999":
    name: Trailer Record
    purpose: Record count and checksum
  "000":
    name: Header Record
    purpose: File metadata and broker identification
  "031":
    name: Mandatory, Conditionally Optional and Frequently Used Optional fields
    purpose: Core client account details
  "032":
    name: CSDP Details
    purpose: Central Security Depository Participant account info
  "033":
    name: All Other Fields
    purpose: Employment, income, risk rating, KYC fields
  "034":
    name: Portfolio Details
    purpose: Portfolio configuration for portfolio clients
  "036":
    name: Additional Client Maintenance fields
    purpose: VAT, tax reference, marital status
  "037":
    name: Additional Address Maintenance fields
    purpose: Postal, physical, email, phone contact
  "038":
    name: Legal and Tax Maintenance fields
    purpose: FATCA, CRS, IT3, PEP, sanctions
submission_methods:
  - Automated FTP submission
  - Manual online upload via comprehensive reporting function
  - Batch upload
delivery_workflow:
  - 1. Email address setup
  - 2. Upload file submission (FTP or manual)
  - 3. Error reporting via COMPR/PCOMPR
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
