---
title: "Fund Factsheet Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Monthly or quarterly investor factsheet summarising fund strategy, performance, holdings, risk, fees, and disclosures, generated as a versioned PDF. 32 fields. "
---

# Fund Factsheet Blueprint

> Monthly or quarterly investor factsheet summarising fund strategy, performance, holdings, risk, fees, and disclosures, generated as a versioned PDF

| | |
|---|---|
| **Feature** | `fund-factsheet` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | factsheet, fund-reporting, asisa, disclosure, msci, benchmark, reporting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fund-factsheet.blueprint.yaml) |
| **JSON API** | [fund-factsheet.json]({{ site.baseurl }}/api/blueprints/trading/fund-factsheet.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `compliance_officer` | Compliance Officer | human |  |
| `head_of_compliance` | Head of Compliance | human |  |
| `fund_ops_team` | Fund Operations Team | human |  |
| `factsheet_generator` | Factsheet Generator Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `factsheet_id` | text | Yes | Factsheet ID |  |
| `fund_id` | text | Yes | Fund Identifier |  |
| `as_of_date` | date | Yes | As-Of Date |  |
| `frequency` | select | Yes | Frequency |  |
| `fund_name` | text | Yes | Fund Name |  |
| `fund_classification` | text | Yes | ASISA Classification |  |
| `investment_objective` | rich_text | Yes | Investment Objective |  |
| `investment_approach` | rich_text | Yes | Investment Approach / Strategy |  |
| `portfolio_manager` | text | Yes | Portfolio Manager |  |
| `launch_date` | date | Yes | Launch Date |  |
| `base_currency` | text | Yes | Base Currency |  |
| `benchmark` | text | Yes | Benchmark |  |
| `regulation_28_compliant` | boolean | Yes | Regulation 28 Compliant |  |
| `risk_profile` | select | Yes | Risk Profile |  |
| `recommended_term` | text | Yes | Recommended Investment Term |  |
| `minimum_investment` | number | No | Minimum Investment Amount |  |
| `fee_structure` | json | Yes | Fee Structure (management, performance, TER, TIC, TC) |  |
| `top_holdings` | json | Yes | Top Holdings (typically top 10) |  |
| `sector_allocation` | json | Yes | Sector Allocation |  |
| `geographic_allocation` | json | No | Geographic Allocation |  |
| `asset_allocation` | json | Yes | Asset Class Allocation |  |
| `returns_table` | json | Yes | Periodic Returns vs Benchmark (1M, 3M, YTD, 1Y, 3Y, 5Y, SI) |  |
| `monthly_returns` | json | No | Monthly Returns Grid (years x months) |  |
| `risk_measures` | json | Yes | Risk Measures (std dev, Sharpe, Sortino, max drawdown, VaR, best/worst month) |  |
| `growth_chart_data` | json | Yes | Investment Growth Chart Series |  |
| `drawdown_chart_data` | json | No | Drawdown Chart Series |  |
| `income_distributions` | json | No | Income Distributions History |  |
| `manager_commentary` | rich_text | No | Portfolio Manager Commentary |  |
| `disclosures` | rich_text | Yes | Regulatory Disclosures and Disclaimers |  |
| `pdf_storage_url` | url | No | Generated PDF Storage URL |  |
| `pdf_hash` | text | No | PDF Content Hash (SHA-256) |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `compliance_review` |  |  |
| `approved` |  |  |
| `published` |  |  |
| `superseded` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `compliance_review` | portfolio_manager |  |
|  | `compliance_review` | `draft` | compliance_officer |  |
|  | `compliance_review` | `approved` | compliance_officer |  |
|  | `approved` | `published` | head_of_compliance |  |
|  | `published` | `superseded` | factsheet_generator |  |

## Rules

- **generation:**
  - **trigger:** scheduled_job
  - **schedule:** monthly on the 5th business day after month-end, quarterly on the 7th business day after quarter-end
  - **inputs:** portfolio_positions_as_of_date, performance_series, benchmark_returns, fee_schedule, fund_mandate, manager_commentary
  - **as_of_snapshot:** true
- **content_requirements:**
  - **investment_objective:** MUST: Present verbatim from the fund mandate
  - **benchmark:** MUST: The benchmark declared in the IPS; changes require client/trustee approval and are disclosed
  - **asisa_classification:** MUST: Aligned to the current ASISA Fund Classification Standard
  - **regulation_28_flag:** MUST: Display Reg 28 status prominently for retirement-eligible funds
  - **risk_profile:** MUST: Risk profile indicator is consistent with the fund's 36-month volatility bucket
  - **fees_disclosure:** MUST: TER, TIC, and TC shown where applicable, in accordance with ASISA Standard on Total Expense Ratios
- **performance_calculation:**
  - **methodology:** gips_compliant
  - **net_of_fees:** MUST: Net-of-fees returns shown with calculation method disclosed
  - **benchmark_alignment:** MUST: Benchmark returns computed over identical periods, same currency
  - **inception_label:** MUST: Performance labelled 'since inception' uses the actual launch date
- **risk_measures:**
  - **basis:** 36-month rolling (or since inception if younger)
  - **required_measures:** standard_deviation, sharpe_ratio, sortino_ratio, max_drawdown, best_month, worst_month, value_at_risk_95
  - **risk_free_proxy_disclosed:** true
- **approval_workflow:**
  - **draft_by:** portfolio_manager
  - **reviewed_by:** compliance_officer
  - **approved_by:** head_of_compliance
  - **authorization_logged:** true
- **disclosures:**
  - **required_statements:** Collective Investment Schemes are generally medium to long-term investments., Past performance is not necessarily a guide to future performance., The value of participatory interests may go down as well as up., CIS are traded at ruling prices and may engage in scrip lending and borrowing., Annualised returns are period returns re-scaled to a period of 1 year., A schedule of fees and charges is available on request from the Manager.
  - **custom_disclosures_allowed:** true
- **versioning:**
  - **supersedes_on_republish:** true
  - **version_label:** YYYY-MM (monthly) or YYYY-Qn (quarterly)
  - **retention_years:** 7
- **pii_and_privacy:**
  - **contains_client_pii:** false
  - **top_holdings_delay_days:** 30
- **distribution:**
  - **channels:** website, email, client_portal, regulator_filing
  - **watermark_unpublished:** true

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| max_duration | 10 business days from as_of_date to published |  |
| escalation |  |  |

## Outcomes

### Unauthorized_publish (Priority: 1) — Error: `FACTSHEET_UNAUTHORIZED_PUBLISH`

_Caller attempted to publish without compliance approval_

**Given:**
- caller does not have head_of_compliance role
- `status` (db) neq `compliance_review`

**Then:**
- **emit_event** event: `factsheet.unauthorized_publish_attempt`

**Result:** Publish blocked and attempt recorded to audit log

### Input_data_missing (Priority: 2) — Error: `FACTSHEET_INPUT_MISSING`

_One or more required inputs for generation are unavailable as of as_of_date_

**Given:**
- any of positions, performance, benchmark returns, or fee schedule is missing or stale

**Then:**
- **emit_event** event: `factsheet.generation_failed`
- **notify** target: `fund_ops_team` — Alert operations that factsheet generation is blocked

**Result:** Generation aborted; operations team must resolve inputs before retry

### Benchmark_mismatch (Priority: 2) — Error: `FACTSHEET_BENCHMARK_MISMATCH`

_The benchmark specified does not match the benchmark in the IPS_

**Given:**
- benchmark field does not match the benchmark declared in the current IPS

**Then:**
- **emit_event** event: `factsheet.benchmark_mismatch`

**Result:** Generation blocked; mandate and factsheet must be reconciled

### Pdf_render_failed (Priority: 2) — Error: `FACTSHEET_RENDER_FAILED`

_PDF rendering engine failed to produce output_

**Given:**
- PDF rendering pipeline returned an error

**Then:**
- **emit_event** event: `factsheet.render_failed`

**Result:** Generation aborted; engineering alerted

### Compliance_rejected (Priority: 3) — Error: `FACTSHEET_COMPLIANCE_REJECTED`

_Compliance review found issues requiring remediation_

**Given:**
- `status` (db) eq `compliance_review`
- compliance officer rejected the draft

**Then:**
- **transition_state** field: `status` from: `compliance_review` to: `draft`
- **emit_event** event: `factsheet.rejected`

**Result:** Factsheet returned to portfolio manager with rejection reasons

### Factsheet_generated_successfully (Priority: 10) | Transaction: atomic

_All inputs present and fresh, content computed, PDF rendered and hashed_

**Given:**
- all required inputs (positions, performance, benchmark, fees) are available as of as_of_date
- fund mandate, benchmark, and classification are current
- risk measures are computable from the performance history

**Then:**
- **set_field** target: `status` value: `draft`
- **create_record** target: `factsheet_versions` — Render PDF, compute content hash, persist storage URL and hash
- **emit_event** event: `factsheet.generated`

**Result:** Draft factsheet written to compliance review queue

### Factsheet_approved_and_published (Priority: 10) | Transaction: atomic

_Compliance approval recorded, version published, audit log entry written_

**Given:**
- `status` (db) eq `compliance_review`
- compliance officer has approved the draft

**Then:**
- **transition_state** field: `status` from: `compliance_review` to: `published`
- **emit_event** event: `factsheet.published`
- **call_service** target: `audit_log` — Record approval with approver, timestamp, PDF hash
- **call_service** target: `distribution_channels` — Publish to website, email, client portal, regulator filing

**Result:** Factsheet published across all distribution channels

### Factsheet_superseded (Priority: 10)

_A newer version supersedes a prior published version; prior remains readable for audit_

**Given:**
- a newer factsheet for the same fund and as_of_date is published

**Then:**
- **transition_state** field: `status` from: `published` to: `superseded`
- **emit_event** event: `factsheet.superseded`

**Result:** Prior version marked superseded; both remain in the audit record

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FACTSHEET_INPUT_MISSING` | 422 | Factsheet generation blocked: required input data is missing or stale. | Yes |
| `FACTSHEET_COMPLIANCE_REJECTED` | 409 | Factsheet was rejected by compliance review. | No |
| `FACTSHEET_BENCHMARK_MISMATCH` | 409 | Benchmark does not match the fund's declared IPS benchmark. | No |
| `FACTSHEET_UNAUTHORIZED_PUBLISH` | 403 | You do not have permission to publish this factsheet. | No |
| `FACTSHEET_RENDER_FAILED` | 500 | Factsheet PDF rendering failed. Engineering has been notified. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `factsheet.generated` | A draft factsheet was successfully generated and queued for compliance review | `factsheet_id`, `fund_id`, `as_of_date`, `frequency`, `pdf_hash` |
| `factsheet.published` | A factsheet was approved by compliance and published to distribution channels | `factsheet_id`, `fund_id`, `as_of_date`, `approver_id`, `pdf_hash` |
| `factsheet.superseded` | A prior published factsheet was superseded by a newer version | `factsheet_id`, `superseding_factsheet_id`, `reason` |
| `factsheet.rejected` | Compliance review rejected the draft factsheet | `factsheet_id`, `reviewer_id`, `rejection_reasons` |
| `factsheet.generation_failed` | Factsheet generation aborted due to missing or stale inputs | `fund_id`, `as_of_date`, `missing_inputs` |
| `factsheet.benchmark_mismatch` | Benchmark does not match the IPS-declared benchmark | `fund_id`, `expected_benchmark`, `provided_benchmark` |
| `factsheet.unauthorized_publish_attempt` | An unauthorized caller attempted to publish a factsheet | `caller_id`, `factsheet_id` |
| `factsheet.render_failed` | PDF rendering pipeline failed | `factsheet_id`, `render_error` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-management | required | Positions and cash balances as of the factsheet date are sourced from the portfolio manager |
| performance-attribution | required | Return series and risk measures are computed by the performance engine |
| regulation-28-compliance | recommended | The Reg 28 flag and compliance status are surfaced on the factsheet for retirement-eligible funds |
| immutable-audit-log | required | Approval events and published-version hashes are recorded to the audit log for regulator inspection |
| popia-compliance | required | Distribution lists (email recipients) contain PII and must satisfy POPIA consent and minimization |

## AGI Readiness

### Goals

#### Timely Accurate Factsheet

Produce a compliant, accurate factsheet within the regulatory window of each month-end or quarter-end

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| on_time_publication_rate | >= 99% | Fraction of factsheets published within 10 business days of as_of_date |
| compliance_rejection_rate | < 5% | Fraction of drafts rejected at first compliance review |

**Constraints:**

- **regulatory** (non-negotiable): Content must satisfy ASISA and FSCA disclosure standards
- **regulatory** (non-negotiable): Approval must be logged to the immutable audit log before publication

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before submitting draft for compliance review (PM sign-off)
- before publishing (head of compliance)

**Escalation Triggers:**

- `consecutive_failures > 2`
- `days_late >= 5`

### Verification

**Invariants:**

- every published factsheet has a recorded compliance approval in the audit log
- performance is computed per GIPS chain-linking
- net-of-fees returns are shown whenever gross-of-fees are shown
- superseded versions are never physically deleted within the retention window

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| regulatory_compliance | speed | Late publication is recoverable; non-compliant publication is a reportable breach |

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| factsheet_generated_successfully | `autonomous` | - | - |
| factsheet_approved_and_published | `human_required` | - | - |
| factsheet_superseded | `autonomous` | - | - |
| compliance_rejected | `human_required` | - | - |
| unauthorized_publish | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fund Factsheet Blueprint",
  "description": "Monthly or quarterly investor factsheet summarising fund strategy, performance, holdings, risk, fees, and disclosures, generated as a versioned PDF. 32 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "factsheet, fund-reporting, asisa, disclosure, msci, benchmark, reporting"
}
</script>
