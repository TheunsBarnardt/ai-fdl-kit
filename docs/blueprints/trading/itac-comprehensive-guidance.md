---
title: "Itac Comprehensive Guidance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "ITaC comprehensive guidance covering corporate actions, dividend treatment, trade cancellations, FCO expiries, user-created instruments, password policy. 3 fiel"
---

# Itac Comprehensive Guidance Blueprint

> ITaC comprehensive guidance covering corporate actions, dividend treatment, trade cancellations, FCO expiries, user-created instruments, password policy

| | |
|---|---|
| **Feature** | `itac-comprehensive-guidance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | itac, consensus-guidance, operational-rules, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/itac-comprehensive-guidance.blueprint.yaml) |
| **JSON API** | [itac-comprehensive-guidance.json]({{ site.baseurl }}/api/blueprints/trading/itac-comprehensive-guidance.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `guidance_topic` | select | Yes | Guidance Topic |  |
| `effective_date` | date | Yes | Effective Date |  |
| `requirement_level` | select | No | Level (Mandatory, Recommended, Optional) |  |

## Rules

- **software:**
  - **password_policy:** Minimum 12 characters; change every 90 days; no reuse of last 5 passwords
  - **user_created_instruments:** Software must validate user-created securities against master list
  - **two_factor_auth:** Required for critical operations (block trades, corporate action elections)
- **operations:**
  - **trade_cancellation:** Only before settlement; must be bilateral agreement
  - **fco_expiry:** Foreign Currency Options expire on specific UTC times per currency
  - **dividend_treatment:** Interim vs final; ordinary vs special; tax-imputation credits
- **compliance:**
  - **audit_trail:** All transactions logged with timestamp, user, IP address
  - **conformance_testing:** Annual software conformance validation required
  - **contact_registry:** Software providers must maintain current contact details

## Outcomes

### Publish_guidance (Priority: 1)

_Issue new or updated ITaC guidance_

**Given:**
- `guidance_topic` (input) exists

**Then:**
- **emit_event** event: `guidance.published`

### Validate_compliance (Priority: 2)

_Validate software compliance with guidance_

**Given:**
- `requirement_level` (input) eq `mandatory`

**Then:**
- **emit_event** event: `compliance.validated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NON_COMPLIANT` | 409 | Software not compliant with ITaC guidance | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `guidance.published` |  | `guidance_topic`, `effective_date`, `requirement_level` |
| `compliance.validated` |  | `software_name`, `conformance_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| itac-corporate-actions | extends |  |
| reference-data-management | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
guidance_topics:
  - topic: CorporateActions
    scope: Dividend
    Rights: null
    Scheme: null
    Takeover: null
    Capitalisation: null
  - topic: TradeManagement
    scope: Cancellation
    Novation: null
    Amendment: null
  - topic: Derivatives
    scope: FCO Expiry
    Settlement: null
    Expiration: null
  - topic: Security
    scope: PasswordPolicy
    TwoFactorAuth: null
    AuditTrail: null
  - topic: Instruments
    scope: UserCreatedSecurities
    Validation: null
    Master List: null
  - topic: Conformance
    scope: Testing
    Validation: null
    SoftwareProviders: null
password_requirements:
  - rule: MinimumLength
    value: 12
  - rule: ChangeFrequency
    days: 90
  - rule: NoReuse
    count: 5
  - rule: Complexity
    requires:
      - Uppercase
      - Lowercase
      - Digits
      - Symbols
dividend_types:
  - type: Ordinary
    imputation: applicable
  - type: Special
    imputation: applicable
  - type: Interim
    imputation: applicable
  - type: Final
    imputation: applicable
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Itac Comprehensive Guidance Blueprint",
  "description": "ITaC comprehensive guidance covering corporate actions, dividend treatment, trade cancellations, FCO expiries, user-created instruments, password policy. 3 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "itac, consensus-guidance, operational-rules, compliance"
}
</script>
