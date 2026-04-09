---
title: "Clearing House Account Management Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification. 18 "
---

# Clearing House Account Management Blueprint

> Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification

| | |
|---|---|
| **Feature** | `clearing-house-account-management` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | clearing-house, proxy, account-verification, cdv, account-mirror, payments |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/chp-account-management.blueprint.yaml) |
| **JSON API** | [clearing-house-account-management.json]({{ site.baseurl }}/api/blueprints/integration/clearing-house-account-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `partner_system` | Partner System | system | Financial institution integrating with payment platform for clearing house services |
| `payment_platform` | Payment Orchestration Platform | external | Payment orchestration platform — manages clearing house integration layer |
| `clearing_house` | Clearing House Operator | external | Automated clearing house operator — manages payment schemes and settlement |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_number` | text | Yes | Account Number | Validations: required |
| `account_name` | text | No | Account Name | Validations: maxLength |
| `account_currency` | text | No | Account Currency |  |
| `account_type` | select | No | Account Type |  |
| `account_status` | select | No | Account Status |  |
| `proxy_type` | select | No | Proxy Type |  |
| `proxy_value` | text | Yes | Proxy Value | Validations: required |
| `proxy_namespace` | text | No | Proxy Namespace | Validations: maxLength |
| `owner_legal_name` | text | No | Owner Legal Name | Validations: maxLength |
| `owner_known_as_name` | text | No | Owner Known-As Name | Validations: maxLength |
| `owner_type` | select | No | Owner Type |  |
| `owner_identification` | text | No | Owner Identification Number | Validations: maxLength |
| `owner_identification_scheme` | select | No | Owner Identification Scheme |  |
| `bank_code` | text | No | Bank Code |  |
| `branch_code` | text | No | Branch Code |  |
| `record_identifier` | text | No | Record Identifier | Validations: maxLength |
| `iban` | text | No | IBAN | Validations: pattern |
| `bicfi` | text | No | BIC/SWIFT Code |  |

## States

**State field:** `account_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `enabled` | Yes |  |
| `disabled` |  |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `enabled` | `disabled` | partner_system |  |
|  | `disabled` | `enabled` | partner_system |  |
|  | `enabled` | `deleted` | partner_system |  |
|  | `disabled` | `deleted` | partner_system |  |

## Rules

- **account_mirror:**
  - **use_case_a:** Platform as Secondary Store — partner manages proxies, platform mirrors for faster routing
  - **use_case_b:** Platform as Primary Store — platform manages proxies, partner mirrors for local resolution
  - **use_case_c:** No Platform Mirror — partner handles all proxy and account resolution directly
  - **use_case_d:** Platform as Account Mirror — for select institutions
  - **sync_required:** Account mirror must be kept synchronized with partner's master data
  - **update_schemas:** Updates sent via AccountUpdateRequest and AccountAdditionalIdUpdateRequest schemas
- **payshap_proxy:**
  - **uniqueness:** One proxy maps to exactly one account — duplicate registrations are rejected
  - **resolution_mandatory:** Proxy resolution is mandatory for inbound digital payments
  - **identifier_determination_inbound:** POST /identifiers/inbound/identifier-determination
  - **identifier_determination_outbound:** POST /identifiers/outbound/identifier-determination-report
- **avsr:**
  - **description:** Real-Time Account Verification Service — confirms account can receive funds
  - **outbound:** Partner sends verification request to platform
  - **inbound:** Platform sends verification request to partner
  - **time_limit:** Verification responses must be returned within scheme time limits
- **cdv:**
  - **description:** Check Digit Verification for bank accounts
  - **validation_required:** Account numbers must pass check digit validation before payment initiation
- **account_types:**
  - **standard:** Account types follow clearing house standards: OTHER, CURRENT, SAVINGS, TRANSMISSION, BOND, SUBSCRIPTION_SHARE
- **identification:**
  - **person_codes:** PersonIdentificationCode enum: ARNU, CCPT, CUST, DRLC, EMPL, NIDN, SOSE, TELE, TXID, POID
  - **organisation_codes:** OrganisationIdentificationCode enum: BANK, CBID, CHID, CINC, COID, and others per ISO 20022
  - **address_types:** Supported address types: ADDR, PBOX, HOME, BIZZ, MLTO, DLVY

## Outcomes

### Proxy_resolved (Priority: 1)

**Given:**
- `proxy_value` (input) exists
- `proxy_type` (input) in `mobile_number,email,id_number,custom`

**Then:**
- **call_service** target: `electrum_api.resolve_proxy` — Resolve proxy to its corresponding bank account via platform
- **emit_event** event: `proxy.resolved`

**Result:** Proxy resolved to bank account — routing information returned for payment processing

### Proxy_not_found (Priority: 2) — Error: `PROXY_NOT_FOUND`

**Given:**
- `proxy_value` (input) exists
- `proxy_value` (db) not_exists

**Then:**
- **notify** target: `partner_system` — Inform partner that proxy could not be resolved

**Result:** Proxy resolution failed — no account found for the given identifier

### Proxy_registered (Priority: 3)

**Given:**
- `proxy_value` (input) exists
- `account_number` (input) exists
- `proxy_value` (db) not_exists

**Then:**
- **create_record** target: `proxy_mapping` — Create proxy-to-account mapping in the proxy registry
- **emit_event** event: `proxy.registered`

**Result:** New proxy registered — identifier now maps to the specified bank account

### Proxy_already_registered (Priority: 3) — Error: `PROXY_ALREADY_REGISTERED`

**Given:**
- `proxy_value` (input) exists
- `proxy_value` (db) exists

**Then:**
- **notify** target: `partner_system` — Inform partner that proxy is already in use

**Result:** Proxy registration rejected — identifier is already mapped to another account

### Proxy_deregistered (Priority: 4)

**Given:**
- `proxy_value` (input) exists
- `proxy_value` (db) exists

**Then:**
- **delete_record** target: `proxy_mapping` — Remove proxy-to-account mapping from the proxy registry
- **emit_event** event: `proxy.deregistered`

**Result:** Proxy deregistered — identifier no longer maps to any account

### Account_mirror_updated (Priority: 5)

**Given:**
- `account_number` (input) exists
- `account_status` (input) in `ENABLED,DISABLED`

**Then:**
- **call_service** target: `electrum_api.update_account_mirror` — Synchronize account data to platform mirror via AccountUpdateRequest
- **emit_event** event: `account.mirror.updated`

**Result:** Account data synchronized to platform mirror — routing information up to date

### Account_mirror_deleted (Priority: 6)

**Given:**
- `account_number` (input) exists
- `account_status` (db) in `ENABLED,DISABLED`

**Then:**
- **call_service** target: `electrum_api.delete_account_mirror` — Remove account from platform mirror
- **transition_state** field: `account_status` from: `enabled` to: `deleted`
- **emit_event** event: `account.mirror.deleted`

**Result:** Account removed from platform mirror — no longer available for routing

### Avsr_verification_success (Priority: 7)

**Given:**
- `account_number` (input) exists
- `bank_code` (input) exists

**Then:**
- **call_service** target: `electrum_api.verify_account_avsr` — Submit verification request to clearing house via platform
- **emit_event** event: `avsr.verification.requested`
- **emit_event** event: `avsr.verification.completed`

**Result:** Account verified — confirmed to exist and able to receive funds

### Avsr_verification_failed (Priority: 8) — Error: `AVS_VERIFICATION_FAILED`

**Given:**
- `account_number` (input) exists
- AVS-R response indicates account cannot receive funds

**Then:**
- **emit_event** event: `avsr.verification.completed`
- **notify** target: `partner_system` — Inform partner that account verification failed

**Result:** Account verification failed — account does not exist or cannot receive funds

### Cdv_validation_passed (Priority: 9)

**Given:**
- `account_number` (input) exists
- `branch_code` (input) exists

**Then:**
- **call_service** target: `electrum_api.validate_cdv` — Submit account number for clearing house check digit verification
- **emit_event** event: `cdv.validation.requested`
- **emit_event** event: `cdv.validation.completed`

**Result:** Account number passes CDV — format and check digits are valid

### Cdv_validation_failed (Priority: 10) — Error: `CDV_VALIDATION_FAILED`

**Given:**
- `account_number` (input) exists
- Account number fails check digit algorithm validation

**Then:**
- **emit_event** event: `cdv.validation.completed`
- **notify** target: `partner_system` — Inform partner that account number failed CDV

**Result:** Account number fails CDV — invalid format or check digits

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCOUNT_BAD_REQUEST` | 400 | Invalid account request — check required fields and formats | No |
| `ACCOUNT_UNAUTHORIZED` | 401 | Authentication failed — invalid or missing credentials | No |
| `ACCOUNT_NOT_FOUND` | 404 | Account not found in the system | No |
| `ACCOUNT_CONFLICT` | 409 | Account conflict — duplicate proxy registration or record collision | No |
| `ACCOUNT_UNPROCESSABLE` | 422 | Account request could not be processed — validation errors | No |
| `CDV_VALIDATION_FAILED` | 422 | Account number failed check digit verification | No |
| `PROXY_NOT_FOUND` | 404 | No account found for the given proxy | No |
| `PROXY_ALREADY_REGISTERED` | 409 | Proxy is already registered to another account | No |
| `AVS_VERIFICATION_FAILED` | 422 | Account verification failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `account.mirror.updated` | Account data synchronized to platform mirror | `account_number`, `account_status`, `record_identifier` |
| `account.mirror.deleted` | Account removed from platform mirror | `account_number`, `record_identifier` |
| `proxy.registered` | New proxy registered for an account | `proxy_type`, `proxy_value`, `account_number` |
| `proxy.deregistered` | Proxy mapping removed from an account | `proxy_type`, `proxy_value`, `account_number` |
| `proxy.resolved` | Proxy successfully resolved to a bank account | `proxy_type`, `proxy_value`, `account_number`, `bank_code` |
| `avsr.verification.requested` | AVS-R verification request initiated | `account_number`, `bank_code` |
| `avsr.verification.completed` | AVS-R verification completed with result | `account_number`, `bank_code`, `account_status` |
| `cdv.validation.requested` | CDV validation request initiated for an account number | `account_number`, `bank_code`, `branch_code` |
| `cdv.validation.completed` | CDV validation completed with result | `account_number`, `bank_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| chp-inbound-payments | required | Account validation and proxy resolution required for inbound routing |
| chp-outbound-payments | required | CDV validation before outbound payments |
| chp-request-to-pay | recommended | Proxy resolution for request-to-pay addressing |
| chp-eft | recommended | Account validation for EFT transactions |

## AGI Readiness

### Goals

#### Reliable Clearing House Account Management

Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `chp_inbound_payments` | chp-inbound-payments | degrade |
| `chp_outbound_payments` | chp-outbound-payments | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| proxy_resolved | `autonomous` | - | - |
| proxy_not_found | `autonomous` | - | - |
| proxy_registered | `autonomous` | - | - |
| proxy_already_registered | `autonomous` | - | - |
| proxy_deregistered | `autonomous` | - | - |
| account_mirror_updated | `supervised` | - | - |
| account_mirror_deleted | `human_required` | - | - |
| avsr_verification_success | `autonomous` | - | - |
| avsr_verification_failed | `autonomous` | - | - |
| cdv_validation_passed | `autonomous` | - | - |
| cdv_validation_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://example.com/path/payments/api/v1
  auth: OAuth 2.0
  content_type: application/json
proxy_types:
  - mobile_number: "Pattern: ^\\+[0-9]{1,3}-[0-9()+\\-]{1,30}$"
  - generic_account: 1-40 characters with optional scheme and issuer
  - iban: "Pattern: [A-Z]{2}[0-9]{2}[a-zA-Z0-9]{1,30}"
  - custom: 1-2048 characters with namespace
cdv:
  description: Check Digit Verification for bank accounts
  documentation: https://docs.electrumsoftware.com/chp/public/cdv-overview
avsr:
  description: Real-Time Account Verification Service
  documentation: https://docs.electrumsoftware.com/chp/public/avsr-overview
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Clearing House Account Management Blueprint",
  "description": "Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification. 18 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "clearing-house, proxy, account-verification, cdv, account-mirror, payments"
}
</script>
