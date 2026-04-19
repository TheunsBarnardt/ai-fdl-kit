---
title: "Observability Metrics Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Golden-signal metrics, structured logs, and distributed traces emitted by every service, with SLOs, alerts, and dashboards. 8 fields. 6 outcomes. 2 error codes."
---

# Observability Metrics Blueprint

> Golden-signal metrics, structured logs, and distributed traces emitted by every service, with SLOs, alerts, and dashboards

| | |
|---|---|
| **Feature** | `observability-metrics` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | metrics, logs, traces, slo, alerting, prometheus, opentelemetry |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/observability/observability-metrics.blueprint.yaml) |
| **JSON API** | [observability-metrics.json]({{ site.baseurl }}/api/blueprints/observability/observability-metrics.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_name` | text | Yes | Service Name |  |
| `environment` | select | Yes | Environment |  |
| `metric_name` | text | Yes | Metric Name |  |
| `metric_type` | select | Yes | Metric Type |  |
| `labels` | json | No | Dimensional Labels |  |
| `value` | number | Yes | Metric Value |  |
| `trace_id` | text | No | Trace ID |  |
| `span_id` | text | No | Span ID |  |

## Rules

- **golden_signals:**
  - **description:** MUST: Every service exposes the four golden signals: latency, traffic, errors, saturation
  - **latency:** histogram in ms, with p50/p95/p99 buckets
  - **traffic:** counter of requests per second
  - **errors:** counter partitioned by error code
  - **saturation:** gauge for cpu, memory, queue depth, connection-pool utilization
- **instrumentation:**
  - **library:** opentelemetry
  - **exporter:** otlp
  - **sampling_rate_production:** 0.1
  - **sampling_rate_errors:** 1
- **structured_logging:**
  - **format:** json
  - **required_fields:** timestamp, level, service, trace_id, message
  - **pii_redaction:** true
- **slo_definitions:**
  - **availability:** 99.9% of requests return non-5xx in any rolling 30-day window
  - **latency:** p99 < 500ms for read paths, p99 < 2s for write paths
  - **trading_critical_paths:** p99 < 100ms for pre-trade compliance and order routing
- **alert_rules:**
  - **burn_rate_fast:** error budget consumed at >14x rate for 5 minutes triggers page
  - **burn_rate_slow:** error budget consumed at >1x rate for 1 hour triggers ticket
  - **saturation_warning:** resource utilization > 70% for 15 minutes triggers warning
  - **saturation_critical:** resource utilization > 90% for 5 minutes triggers page
- **retention:**
  - **raw_metrics_days:** 15
  - **aggregated_metrics_days:** 400
  - **logs_days:** 30
  - **logs_compliance_days:** 1825
  - **traces_days:** 7

## Outcomes

### Log_pii_redaction_failed (Priority: 1) — Error: `LOG_PII_REDACTION_FAILURE`

**Given:**
- PII redaction filter fails to sanitize a log entry before ship

**Then:**
- **notify** target: `security_ops` — Security alert: PII potentially leaked to log pipeline
- **emit_event** event: `logs.pii_redaction_failed`

**Result:** Log entry is dropped; security team alerted for manual review

### Invalid_metric_name (Priority: 2) — Error: `METRIC_NAME_INVALID`

**Given:**
- `metric_name` (input) not_exists

**Result:** Metric rejected; caller must supply a valid metric name

### Slo_burn_alert_raised (Priority: 5)

**Given:**
- error budget consumption rate exceeds the fast-burn threshold (14x) for 5 consecutive minutes

**Then:**
- **notify** target: `on_call_engineer` — Page on-call engineer with service name, SLO, and current burn rate
- **emit_event** event: `slo.burn_rate_exceeded`

**Result:** Page dispatched and incident opened

### Metric_recorded_successfully (Priority: 10)

**Given:**
- `metric_name` (input) exists
- `value` (input) exists

**Then:**
- **emit_event** event: `metric.recorded`

**Result:** Metric point recorded to the time-series store

### Slo_satisfied (Priority: 10)

**Given:**
- rolling error budget consumption is below alert thresholds across all windows

**Result:** No action; service healthy

### Trace_dropped_due_to_sampling (Priority: 10)

**Given:**
- request is sampled out based on production sampling rate
- request is not an error

**Result:** Trace span is not exported; metrics are still recorded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `METRIC_NAME_INVALID` | 400 | Metric name is missing or malformed. | No |
| `LOG_PII_REDACTION_FAILURE` | 500 | Log entry rejected due to redaction filter failure. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `metric.recorded` | A metric point was recorded to the time-series store | `service_name`, `metric_name`, `value`, `labels` |
| `slo.burn_rate_exceeded` | An SLO burn rate threshold was exceeded | `service_name`, `slo_name`, `burn_rate`, `window_minutes` |
| `logs.pii_redaction_failed` | A log entry failed PII redaction and was dropped | `service_name`, `filter_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| immutable-audit-log | recommended | Audit entries and observability events are complementary; the audit log is tamper-evident while metrics are high-cardinality |
| popia-compliance | required | PII redaction in logs and metrics is a POPIA obligation |

## AGI Readiness

### Goals

#### Platform Observability

Provide operators with a real-time, low-noise view of system health sufficient to detect, diagnose, and remediate incidents within SLO budgets

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| mttr_p90 | < 30 minutes | 90th percentile time from alert to resolution |
| alert_precision | >= 90% | Fraction of pages that correspond to real user impact |

**Constraints:**

- **regulatory** (non-negotiable): PII in logs and metrics must be redacted at source

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before acknowledging a critical page

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- all services emit the four golden signals
- no PII appears in log stores in plaintext
- compliance logs are retained for at least 1825 days

### Coordination

**Protocol:** `pub_sub`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| metric_recorded_successfully | `autonomous` | - | - |
| slo_burn_alert_raised | `autonomous` | - | - |
| log_pii_redaction_failed | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Observability Metrics Blueprint",
  "description": "Golden-signal metrics, structured logs, and distributed traces emitted by every service, with SLOs, alerts, and dashboards. 8 fields. 6 outcomes. 2 error codes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "metrics, logs, traces, slo, alerting, prometheus, opentelemetry"
}
</script>
