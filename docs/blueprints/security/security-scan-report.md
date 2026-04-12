---
title: "Security Scan Report Blueprint"
layout: default
parent: "Security"
grand_parent: Blueprint Catalog
description: "Generate, persist, and export a structured AI vulnerability scan report with per-probe pass rates, confidence intervals, attempt-level detail, and AVID-compatib"
---

# Security Scan Report Blueprint

> Generate, persist, and export a structured AI vulnerability scan report with per-probe pass rates, confidence intervals, attempt-level detail, and AVID-compatible export.

| | |
|---|---|
| **Feature** | `security-scan-report` |
| **Category** | Security |
| **Version** | 1.0.0 |
| **Tags** | llm, report, scan-results, avid, confidence-interval, ai-safety, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/security/security-scan-report.blueprint.yaml) |
| **JSON API** | [security-scan-report.json]({{ site.baseurl }}/api/blueprints/security/security-scan-report.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `report_writer` | Report Writer | system | Aggregates evaluator output into a structured report during scan execution. |
| `security_engineer` | Security Engineer | human | Reads the report to understand model vulnerabilities and prioritise fixes. |
| `compliance_system` | Compliance System | external | Consumes machine-readable export (AVID, JSON) for governance tracking. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `report_id` | token | Yes | Report ID |  |
| `scan_id` | token | Yes | Scan Run ID |  |
| `target_model_id` | text | Yes | Target Model |  |
| `report_format` | multiselect | Yes | Output Formats |  |
| `probe_results` | json | Yes | Per-Probe Results |  |
| `confidence_method` | select | No | Confidence Interval Method |  |
| `generated_at` | datetime | Yes | Generated At |  |

## Rules

- **generation:**
  - **trigger:** scan_complete_only
  - **include_all_attempts:** true
- **pass_rate_calculation:**
  - **formula:** passing_attempts_divided_by_total_attempts
  - **confidence_intervals:** when_method_not_none
- **export:**
  - **avid_compliance:** required
  - **write_atomicity:** required
- **identifiers:**
  - **report_id:** globally_unique_and_stable
- **digest:**
  - **format:** human_readable

## Outcomes

### No_attempts_recorded (Priority: 1) — Error: `REPORT_NO_DATA`

**Given:**
- scan run completed but zero probe attempts were recorded

**Result:** Report generation is skipped; error is logged.

### Export_failed (Priority: 5) — Error: `REPORT_EXPORT_FAILED`

**Given:**
- report data aggregated successfully
- write to output destination fails (disk full, permission denied)

**Then:**
- **emit_event** event: `security.report.export_failed`

**Result:** Report data is retained in memory; export error is surfaced to the operator.

### Report_generated (Priority: 10) | Transaction: atomic

**Given:**
- scan run is in complete state
- at least one probe attempt was recorded

**Then:**
- **create_record** — Structured report with per-probe pass rates and attempt-level detail.
- **emit_event** event: `security.report.generated`

**Result:** Report is written in all configured formats; path is available for download or review.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPORT_NO_DATA` | 422 | No probe attempts were recorded for this scan. The report cannot be generated. | No |
| `REPORT_EXPORT_FAILED` | 500 | The scan report could not be written to the output destination. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `security.report.generated` | Emitted when a scan report has been successfully written. | `report_id`, `scan_id`, `target_model_id`, `report_format`, `generated_at` |
| `security.report.export_failed` | Emitted when report export fails after successful aggregation. | `report_id`, `scan_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| llm-vulnerability-scan | required | The scan pipeline that produces the attempt data this report aggregates. |
| llm-attack-probe-library | required | Source of per-probe result data included in the report. |
| redteam-conversation-memory | optional | Persistent memory store that can be queried to rebuild or extend reports. |

## AGI Readiness

### Goals

#### Reliable Security Scan Report

Generate, persist, and export a structured AI vulnerability scan report with per-probe pass rates, confidence intervals, attempt-level detail, and AVID-compatible export.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `llm_vulnerability_scan` | llm-vulnerability-scan | degrade |
| `llm_attack_probe_library` | llm-attack-probe-library | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| no_attempts_recorded | `autonomous` | - | - |
| export_failed | `autonomous` | - | - |
| report_generated | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/NVIDIA/garak
  project: garak — LLM vulnerability scanner
  tech_stack: Python 3.10+
  files_traced: 15
  entry_points:
    - garak/report.py
    - garak/analyze/aggregate_reports.py
    - garak/analyze/report_avid.py
    - garak/analyze/report_digest.py
    - garak/analyze/bootstrap_ci.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Security Scan Report Blueprint",
  "description": "Generate, persist, and export a structured AI vulnerability scan report with per-probe pass rates, confidence intervals, attempt-level detail, and AVID-compatib",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "llm, report, scan-results, avid, confidence-interval, ai-safety, compliance"
}
</script>
