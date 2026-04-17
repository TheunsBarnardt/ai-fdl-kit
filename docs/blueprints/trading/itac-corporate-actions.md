---
title: "Itac Corporate Actions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "ITaC consensus guidance on dividend, rights, scheme of arrangement, and corporate action processing. 7 fields. 4 outcomes. 3 error codes. rules: dividend, right"
---

# Itac Corporate Actions Blueprint

> ITaC consensus guidance on dividend, rights, scheme of arrangement, and corporate action processing

| | |
|---|---|
| **Feature** | `itac-corporate-actions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | itac, corporate-actions, dividend, rights, scheme, consensus-rules |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/itac-corporate-actions.blueprint.yaml) |
| **JSON API** | [itac-corporate-actions.json]({{ site.baseurl }}/api/blueprints/trading/itac-corporate-actions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `issuer_ca_team` | Issuer Corporate Actions Team | human |  |
| `ca_processing_system` | CA Processing System | system |  |
| `custodian` | Custodian / CSDP | system |  |
| `central_registry` | Central Share Registry | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ca_event_id` | text | Yes | Corporate Action Event ID |  |
| `issuer_code` | text | Yes | Issuer Code |  |
| `ca_type` | select | Yes | CA Type (Dividend, Rights, Scheme, Takeover, Capitalisation) |  |
| `record_date` | date | Yes | Record Date (entitlement snapshot) |  |
| `payment_date` | date | No | Payment/Settlement Date |  |
| `election_deadline` | datetime | No | Election Deadline (for voluntary events) |  |
| `default_election` | select | No | Default Election (if shareholder does not elect) |  |

## Rules

- **dividend:**
  - **record_date_cutoff:** Holders as at record date entitled to dividend; no trading settlement post-RD applies
  - **payment_date_posting:** Cash payments must be posted by payment date; dividends cannot be delayed
  - **tax_withholding:** System must apply applicable tax withholding per issuer and holder jurisdiction
- **rights:**
  - **rights_allocation:** Rights allocated 1:n per holding as at record date
  - **rights_exercise_deadline:** Exercise deadline minimum 3 weeks from announcement
  - **unexercised_lapse:** Unexercised rights lapse automatically after deadline; no further entitlement
- **scheme:**
  - **scheme_date:** Scheme effective date determines when old shares cancelled and new shares issued
  - **exchange_ratio:** Fixed exchange ratio (e.g. 1 old for 2 new) applied to all holdings
  - **takeover_compulsory:** Compulsory takeover ratio enforced for minority shareholders if threshold met

## Outcomes

### Publish_ca_event (Priority: 1)

_Issuer announces corporate action event_

**Given:**
- `ca_type` (input) exists

**Then:**
- **emit_event** event: `ca.announced`

### Calculate_entitlements (Priority: 2)

_Calculate per-holder entitlement based on record date holdings_

**Given:**
- `record_date` (system) exists

**Then:**
- **emit_event** event: `entitlements.calculated`

### Process_dividend (Priority: 3) — Error: `DIVIDEND_PROCESSING_FAILED`

_Process dividend payment with tax withholding_

**Given:**
- `ca_type` (system) eq `dividend`
- `payment_date` (system) lte `today`

**Then:**
- **call_service** target: `central_registry`
- **emit_event** event: `dividend.processed`

### Apply_scheme (Priority: 4)

_Apply scheme of arrangement (cancel old shares, issue new shares)_

**Given:**
- `ca_type` (system) eq `scheme`

**Then:**
- **call_service** target: `central_registry`
- **emit_event** event: `scheme.applied`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DIVIDEND_PROCESSING_FAILED` | 500 | Dividend payment processing failed | No |
| `RIGHTS_EXERCISE_DEADLINE_MISSED` | 409 | Rights exercise deadline has passed | No |
| `SCHEME_EFFECTIVE_DATE_INVALID` | 400 | Scheme effective date must be after record date | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ca.announced` |  | `ca_event_id`, `ca_type`, `issuer_code`, `record_date` |
| `entitlements.calculated` |  | `ca_event_id`, `holder_count`, `total_entitlement` |
| `dividend.processed` |  | `ca_event_id`, `dividend_per_share`, `tax_rate`, `payment_date` |
| `scheme.applied` |  | `ca_event_id`, `exchange_ratio`, `effective_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-ca-election-download | required |  |
| broker-ca-election-upload | required |  |
| reference-data-management | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
ca_types:
  - code: DIV
    name: Dividend
    subtypes:
      - Cash
      - Scrip
  - code: RTS
    name: Rights Issue
    subtypes:
      - Renounceable
      - NonRenounceable
  - code: SCH
    name: Scheme of Arrangement
    subtypes:
      - Merger
      - Takeover
      - Reconstruction
  - code: TKO
    name: Takeover
    subtypes:
      - Offer
      - Compulsory
  - code: CAP
    name: Capitalisation
    subtypes:
      - BonusIssue
      - StockSplit
dividend_rules:
  - rule: Interim dividend may be paid before end of financial year
  - rule: Final dividend typically declared after year-end results
  - rule: Dividend reinvestment plans (DRIP) must be offered per listing rules
tax_withholding:
  - jurisdiction: ZA
    resident_rate: 0.2
    non_resident_rate: 0.25
  - jurisdiction: US
    resident_rate: 0.15
    non_resident_rate: 0.3
rights_processing:
  - step: 1
    action: Calculate entitlement ratio per holding
  - step: 2
    action: Publish rights prospectus and exercise instructions
  - step: 3
    action: Accept rights exercises until deadline
  - step: 4
    action: Cancel unexercised rights
  - step: 5
    action: Allot new shares to exercised rights
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Itac Corporate Actions Blueprint",
  "description": "ITaC consensus guidance on dividend, rights, scheme of arrangement, and corporate action processing. 7 fields. 4 outcomes. 3 error codes. rules: dividend, right",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "itac, corporate-actions, dividend, rights, scheme, consensus-rules"
}
</script>
