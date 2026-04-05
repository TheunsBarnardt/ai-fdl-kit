---
title: "Broker Securities Lending Borrowing Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker securities lending and borrowing (SLB) upload to central back-office via fixed-width records for loan, collateral, loan confirmation/return, and collater"
---

# Broker Securities Lending Borrowing Upload Blueprint

> Broker securities lending and borrowing (SLB) upload to central back-office via fixed-width records for loan, collateral, loan confirmation/return, and collateral confirmation/return

| | |
|---|---|
| **Feature** | `broker-securities-lending-borrowing-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, upload, slb, securities-lending, borrowing, collateral, fixed-width, card-codes |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/trading/broker-securities-lending-borrowing-upload.blueprint.yaml) |
| **JSON API** | [broker-securities-lending-borrowing-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-securities-lending-borrowing-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `slb_counterparty` | SLB Counterparty | external | Lending or borrowing counterparty |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes |  |  |
| `broker_code` | text | Yes |  |  |
| `upload_date` | date | Yes |  |  |
| `loan_reference` | text | No |  |  |
| `loan_trade_date` | date | No |  |  |
| `loan_start_date` | date | No |  |  |
| `loan_end_date` | date | No |  |  |
| `loan_account_code` | text | No |  |  |
| `loan_instrument_code` | text | No |  |  |
| `loan_isin` | text | No |  |  |
| `loan_quantity` | number | No |  |  |
| `loan_rate` | number | No |  |  |
| `loan_fee` | number | No |  |  |
| `loan_counterparty` | text | No |  |  |
| `loan_type` | select | No |  |  |
| `loan_direction` | select | No |  |  |
| `collateral_reference` | text | No |  |  |
| `collateral_trade_date` | date | No |  |  |
| `collateral_type` | select | No |  |  |
| `collateral_instrument` | text | No |  |  |
| `collateral_quantity` | number | No |  |  |
| `collateral_value` | number | No |  |  |
| `collateral_currency` | text | No |  |  |
| `collateral_haircut` | number | No |  |  |
| `collateral_linked_loan_reference` | text | No |  |  |
| `confirmation_type` | select | No |  |  |
| `confirmation_date` | date | No |  |  |
| `return_quantity` | number | No |  |  |
| `return_amount` | number | No |  |  |
| `collateral_confirmation_type` | select | No |  |  |
| `collateral_return_quantity` | number | No |  |  |
| `collateral_return_value` | number | No |  |  |

## Rules

- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses before allowing upload, MUST: Provide error reporting via COMPR and PCOMPR functions, MUST: Generate response dataset with per-record response codes, MUST: Archive processed upload files
- **validation:** MUST: Validate loan and collateral reference uniqueness, MUST: Link collateral records to existing loan references, MUST: Validate trade date is within acceptable window, MUST: Validate counterparty exists in master data
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Layout 025 for loan upload, MUST: Use Layout 026 for collateral upload, MUST: Use Layout 027 for loan confirmation/return, MUST: Use Layout 028 for collateral confirmation/return
- **lifecycle:** MUST: Support open-ended and fixed-term loan types, MUST: Allow partial or full return of loans and collateral, MUST: Update loan status on confirmation and return

## Outcomes

### Automated_loan_upload (Priority: 1)

**Given:**
- `card_code` (input) eq `025`
- `email_configured` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `slb_upload.loan.received`

### Automated_collateral_upload (Priority: 2)

**Given:**
- `card_code` (input) eq `026`

**Then:**
- **create_record**
- **emit_event** event: `slb_upload.collateral.received`

### Loan_confirmation_return (Priority: 3)

**Given:**
- `card_code` (input) eq `027`

**Then:**
- **transition_state** field: `loan_status` from: `open` to: `confirmed_or_returned`
- **emit_event** event: `slb_upload.loan.confirmed`

### Collateral_confirmation_return (Priority: 4)

**Given:**
- `card_code` (input) eq `028`

**Then:**
- **transition_state** field: `collateral_status` from: `posted` to: `confirmed_or_returned`
- **emit_event** event: `slb_upload.collateral.confirmed`

### Validate_collateral_link (Priority: 5)

**Given:**
- `card_code` (input) eq `026`
- `collateral_linked_loan_exists` (computed) eq `false`

**Then:**
- **emit_event** event: `slb_upload.collateral.unlinked`

### Generate_response_dataset (Priority: 6)

**Given:**
- upload processing complete

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `slb_upload.response.delivered`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLB_UPLOAD_INVALID_LOAN_REF` | 422 | Loan reference is invalid or duplicate | No |
| `SLB_UPLOAD_COLLATERAL_NOT_LINKED` | 422 | Collateral record references non-existent loan | No |
| `SLB_UPLOAD_INVALID_COUNTERPARTY` | 422 | SLB counterparty not found in master data | No |
| `SLB_UPLOAD_INSTRUMENT_NOT_FOUND` | 422 | Referenced instrument does not exist | No |
| `SLB_UPLOAD_PROCESSING_FAILED` | 500 | SLB upload processing failed | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-deal-management-upload | optional |  |
| broker-client-data-upload | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
card_codes:
  "999":
    name: Trailer Record
  "000":
    name: Header Record
  "025":
    name: Loan Upload Record
    purpose: Create new securities lending/borrowing loan
  "026":
    name: Collateral Upload Record
    purpose: Post collateral against loan
  "027":
    name: Loan Confirmation/Return Record
    purpose: Confirm or return existing loan
  "028":
    name: Collateral Confirmation/Return Record
    purpose: Confirm or return posted collateral
loan_types:
  - Open (no fixed end date)
  - Term (fixed end date)
  - Call (callable on demand)
collateral_types:
  - Cash
  - Securities
lifecycle_states:
  loan:
    - open
    - confirmed
    - returned
    - cancelled
  collateral:
    - posted
    - confirmed
    - returned
    - cancelled
workflow:
  - 1. Email address set-up
  - 2. Loan upload (Layout 025)
  - 3. Collateral upload (Layout 026)
  - 4. Loan confirmation/return (Layout 027)
  - 5. Collateral confirmation/return (Layout 028)
  - 6. Response dataset and archiving
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Securities Lending Borrowing Upload Blueprint",
  "description": "Broker securities lending and borrowing (SLB) upload to central back-office via fixed-width records for loan, collateral, loan confirmation/return, and collater",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, slb, securities-lending, borrowing, collateral, fixed-width, card-codes"
}
</script>
