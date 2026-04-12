---
title: "Payment Observability Blueprint"
layout: default
parent: "Observability"
grand_parent: Blueprint Catalog
description: "Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards. 13 fields. 6 outcomes. 3 error co"
---

# Payment Observability Blueprint

> Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards

| | |
|---|---|
| **Feature** | `payment-observability` |
| **Category** | Observability |
| **Version** | 1.0.0 |
| **Tags** | metrics, monitoring, alerting, dashboard, health-check, kpi |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/observability/payment-observability.blueprint.yaml) |
| **JSON API** | [payment-observability.json]({{ site.baseurl }}/api/blueprints/observability/payment-observability.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `metrics_collector` | Metrics Collector | system | Collects and aggregates transaction metrics from terminals and backend |
| `alerting_engine` | Alerting Engine | system | Evaluates alert rules and sends notifications |
| `ops_team` | Operations Team | human | Monitors dashboards and responds to alerts |
| `merchant` | Merchant | human | Views merchant-facing reports and summaries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `metric_id` | token | Yes | Metric ID |  |
| `metric_name` | text | Yes | Metric Name |  |
| `metric_type` | select | Yes | Metric Type |  |
| `dimensions` | json | No | Metric Dimensions |  |
| `value` | number | Yes | Metric Value |  |
| `timestamp` | datetime | Yes | Timestamp |  |
| `alert_id` | token | No | Alert ID |  |
| `alert_name` | text | No | Alert Name |  |
| `alert_severity` | select | No | Alert Severity |  |
| `alert_status` | select | No | Alert Status |  |
| `retention_raw_days` | number | Yes | Raw Metric Retention (days) |  |
| `retention_hourly_days` | number | Yes | Hourly Aggregate Retention (days) |  |
| `retention_daily_days` | number | Yes | Daily Aggregate Retention (days) |  |

## States

**State field:** `alert_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `collecting` | Yes |  |
| `firing` |  |  |
| `acknowledged` |  |  |
| `resolved` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `collecting` | `firing` | alerting_engine |  |
|  | `firing` | `acknowledged` | ops_team |  |
|  | `acknowledged` | `resolved` | alerting_engine |  |
|  | `firing` | `resolved` | alerting_engine |  |

## Rules

- **transaction_metrics:**
  - **count:** Count of transactions by terminal, merchant, payment method, and status (success/failure)
  - **amount:** Sum and average of transaction amounts by terminal and method
  - **method_split:** Percentage of palm vs card transactions
  - **offline_usage:** Count and value of offline-queued transactions
- **latency_metrics:**
  - **palm_scan:** Palm scan time (feature extraction + template match) — p50, p95, p99
  - **payshap_settlement:** PayShap end-to-end settlement time — p50, p95, p99 (SLA: < 10s)
  - **card_authorization:** Card online authorisation time — p50, p95, p99
  - **total_transaction:** Total transaction time from amount entry to receipt — p50, p95, p99
- **error_metrics:**
  - **by_code:** Error count grouped by error code
  - **by_terminal:** Error rate per terminal (errors / total transactions)
  - **by_method:** Error rate per payment method
  - **consecutive:** Count of consecutive failures per terminal
- **business_kpis:**
  - **daily_volume:** Total transaction count per day
  - **daily_gmv:** Gross merchandise value (total amount) per day
  - **enrolment_rate:** New palm enrolments per day
  - **palm_adoption:** Percentage of transactions using palm vs card over time
  - **offline_queue_depth:** Average and peak offline queue depth
- **alerting_rules:**
  - **error_rate_high:** Alert when error rate > 5% over 5-minute window (severity: critical)
  - **latency_breach:** Alert when PayShap p95 latency > 10s over 5-minute window (severity: critical)
  - **terminal_offline:** Alert when terminal misses 3 heartbeats (severity: warning)
  - **queue_depth_high:** Alert when offline queue > 8 transactions on any terminal (severity: warning)
  - **consecutive_failures:** Alert when 5+ consecutive failures on same terminal (severity: critical)
  - **daily_volume_drop:** Alert when daily volume drops > 30% vs 7-day average (severity: warning)
- **dashboards:**
  - **ops_realtime:** Real-time operations: live transaction feed, error rate gauge, active terminals, latency heatmap
  - **merchant_daily:** Merchant daily summary: transaction count, GMV, palm vs card split, top terminals
  - **fleet_health:** Fleet health: terminal status map, heartbeat status, hardware health, queue depths
- **retention:**
  - **raw_metrics:** 7 days — full resolution
  - **hourly_aggregates:** 90 days — hourly rollups
  - **daily_aggregates:** 730 days (2 years) — daily rollups
  - **alerts_history:** 365 days — all alert events
- **health_checks:**
  - **liveness:** GET /health/live — returns 200 if process is running
  - **readiness:** GET /health/ready — returns 200 if all dependencies are reachable
  - **startup:** GET /health/startup — returns 200 after initialisation complete

## Outcomes

### Metric_recorded (Priority: 1)

**Given:**
- Transaction completes (success or failure)

**Then:**
- **create_record** target: `metrics` — Record transaction metric with dimensions
- **emit_event** event: `observability.metric.recorded`

**Result:** Transaction metric recorded for aggregation

### Alert_fired (Priority: 2)

**Given:**
- Metric value crosses alert threshold
- `alert_severity` (computed) in `warning,critical`

**Then:**
- **transition_state** field: `alert_status` from: `collecting` to: `firing`
- **notify** — Send alert to operations team via push notification and dashboard
- **emit_event** event: `observability.alert.fired`

**Result:** Alert fired — operations team notified

### Alert_acknowledged (Priority: 3)

**Given:**
- `alert_status` (db) eq `firing`
- Operator acknowledges the alert

**Then:**
- **transition_state** field: `alert_status` from: `firing` to: `acknowledged`
- **emit_event** event: `observability.alert.acknowledged`

**Result:** Alert acknowledged by operator

### Alert_resolved (Priority: 4)

**Given:**
- `alert_status` (db) in `firing,acknowledged`
- Metric returns to normal range

**Then:**
- **transition_state** field: `alert_status` from: `firing` to: `resolved`
- **emit_event** event: `observability.alert.resolved`

**Result:** Alert resolved — metric back to normal

### Health_check_failed (Priority: 5) — Error: `OBSERVABILITY_HEALTH_FAILED`

**Given:**
- Health check endpoint returns non-200 status

**Then:**
- **notify** — Critical: health check failed
- **emit_event** event: `observability.health.failed`

**Result:** Health check failed — system may be degraded

### Metrics_aggregated (Priority: 6)

**Given:**
- Aggregation interval reached (hourly or daily)

**Then:**
- **call_service** target: `metrics_aggregator.rollup` — Aggregate raw metrics into hourly or daily rollups
- **emit_event** event: `observability.metrics.aggregated`

**Result:** Metrics aggregated and raw data eligible for expiry

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBSERVABILITY_HEALTH_FAILED` | 503 | Health check failed — system may be degraded | No |
| `OBSERVABILITY_METRIC_INVALID` | 400 | Invalid metric data — check name, type, and dimensions | No |
| `OBSERVABILITY_STORAGE_FULL` | 500 | Metrics storage capacity reached — check retention policies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `observability.metric.recorded` | Transaction metric recorded | `metric_name`, `value`, `dimensions`, `timestamp` |
| `observability.alert.fired` | Alert threshold breached | `alert_id`, `alert_name`, `alert_severity`, `metric_name`, `value` |
| `observability.alert.acknowledged` | Alert acknowledged by operator | `alert_id`, `alert_name` |
| `observability.alert.resolved` | Alert condition resolved | `alert_id`, `alert_name` |
| `observability.health.failed` | Health check endpoint failed | `endpoint`, `status_code` |
| `observability.metrics.aggregated` | Metrics rolled up to higher aggregation level | `aggregation_level`, `period`, `metric_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| terminal-fleet | required | Fleet monitoring provides device-level health; this provides application-level metrics |
| terminal-payment-flow | required | Transaction events are the primary source of payment metrics |
| payshap-rail | recommended | PayShap settlement latency tracked against 10s SLA |
| payment-gateway | recommended | Card authorisation latency and error rates tracked |
| audit-logging | optional | Alert events can be logged to audit trail |

## AGI Readiness

### Goals

#### Reliable Payment Observability

Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| completeness | performance | observability gaps hide production issues |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `terminal_fleet` | terminal-fleet | degrade |
| `terminal_payment_flow` | terminal-payment-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| metric_recorded | `autonomous` | - | - |
| alert_fired | `autonomous` | - | - |
| alert_acknowledged | `autonomous` | - | - |
| alert_resolved | `autonomous` | - | - |
| health_check_failed | `autonomous` | - | - |
| metrics_aggregated | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payment Observability Blueprint",
  "description": "Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards. 13 fields. 6 outcomes. 3 error co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "metrics, monitoring, alerting, dashboard, health-check, kpi"
}
</script>
