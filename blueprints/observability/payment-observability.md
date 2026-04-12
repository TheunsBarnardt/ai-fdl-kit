<!-- AUTO-GENERATED FROM payment-observability.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payment Observability

> Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards

**Category:** Observability · **Version:** 1.0.0 · **Tags:** metrics · monitoring · alerting · dashboard · health-check · kpi

## What this does

Payment observability — transaction metrics, latency tracking, error rate monitoring, business KPIs, alerting, and dashboards

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **metric_id** *(token, required)* — Metric ID
- **metric_name** *(text, required)* — Metric Name
- **metric_type** *(select, required)* — Metric Type
- **dimensions** *(json, optional)* — Metric Dimensions
- **value** *(number, required)* — Metric Value
- **timestamp** *(datetime, required)* — Timestamp
- **alert_id** *(token, optional)* — Alert ID
- **alert_name** *(text, optional)* — Alert Name
- **alert_severity** *(select, optional)* — Alert Severity
- **alert_status** *(select, optional)* — Alert Status
- **retention_raw_days** *(number, required)* — Raw Metric Retention (days)
- **retention_hourly_days** *(number, required)* — Hourly Aggregate Retention (days)
- **retention_daily_days** *(number, required)* — Daily Aggregate Retention (days)

## What must be true

- **transaction_metrics → count:** Count of transactions by terminal, merchant, payment method, and status (success/failure)
- **transaction_metrics → amount:** Sum and average of transaction amounts by terminal and method
- **transaction_metrics → method_split:** Percentage of palm vs card transactions
- **transaction_metrics → offline_usage:** Count and value of offline-queued transactions
- **latency_metrics → palm_scan:** Palm scan time (feature extraction + template match) — p50, p95, p99
- **latency_metrics → payshap_settlement:** PayShap end-to-end settlement time — p50, p95, p99 (SLA: < 10s)
- **latency_metrics → card_authorization:** Card online authorisation time — p50, p95, p99
- **latency_metrics → total_transaction:** Total transaction time from amount entry to receipt — p50, p95, p99
- **error_metrics → by_code:** Error count grouped by error code
- **error_metrics → by_terminal:** Error rate per terminal (errors / total transactions)
- **error_metrics → by_method:** Error rate per payment method
- **error_metrics → consecutive:** Count of consecutive failures per terminal
- **business_kpis → daily_volume:** Total transaction count per day
- **business_kpis → daily_gmv:** Gross merchandise value (total amount) per day
- **business_kpis → enrolment_rate:** New palm enrolments per day
- **business_kpis → palm_adoption:** Percentage of transactions using palm vs card over time
- **business_kpis → offline_queue_depth:** Average and peak offline queue depth
- **alerting_rules → error_rate_high:** Alert when error rate > 5% over 5-minute window (severity: critical)
- **alerting_rules → latency_breach:** Alert when PayShap p95 latency > 10s over 5-minute window (severity: critical)
- **alerting_rules → terminal_offline:** Alert when terminal misses 3 heartbeats (severity: warning)
- **alerting_rules → queue_depth_high:** Alert when offline queue > 8 transactions on any terminal (severity: warning)
- **alerting_rules → consecutive_failures:** Alert when 5+ consecutive failures on same terminal (severity: critical)
- **alerting_rules → daily_volume_drop:** Alert when daily volume drops > 30% vs 7-day average (severity: warning)
- **dashboards → ops_realtime:** Real-time operations: live transaction feed, error rate gauge, active terminals, latency heatmap
- **dashboards → merchant_daily:** Merchant daily summary: transaction count, GMV, palm vs card split, top terminals
- **dashboards → fleet_health:** Fleet health: terminal status map, heartbeat status, hardware health, queue depths
- **retention → raw_metrics:** 7 days — full resolution
- **retention → hourly_aggregates:** 90 days — hourly rollups
- **retention → daily_aggregates:** 730 days (2 years) — daily rollups
- **retention → alerts_history:** 365 days — all alert events
- **health_checks → liveness:** GET /health/live — returns 200 if process is running
- **health_checks → readiness:** GET /health/ready — returns 200 if all dependencies are reachable
- **health_checks → startup:** GET /health/startup — returns 200 after initialisation complete

## Success & failure scenarios

**✅ Success paths**

- **Metric Recorded** — when Transaction completes (success or failure), then Transaction metric recorded for aggregation.
- **Alert Fired** — when Metric value crosses alert threshold; Alert severity determined by rule, then Alert fired — operations team notified.
- **Alert Acknowledged** — when alert_status eq "firing"; Operator acknowledges the alert, then Alert acknowledged by operator.
- **Alert Resolved** — when alert_status in ["firing","acknowledged"]; Metric returns to normal range, then Alert resolved — metric back to normal.
- **Metrics Aggregated** — when Aggregation interval reached (hourly or daily), then Metrics aggregated and raw data eligible for expiry.

**❌ Failure paths**

- **Health Check Failed** — when Health check endpoint returns non-200 status, then Health check failed — system may be degraded. *(error: `OBSERVABILITY_HEALTH_FAILED`)*

## Errors it can return

- `OBSERVABILITY_HEALTH_FAILED` — Health check failed — system may be degraded
- `OBSERVABILITY_METRIC_INVALID` — Invalid metric data — check name, type, and dimensions
- `OBSERVABILITY_STORAGE_FULL` — Metrics storage capacity reached — check retention policies

## Connects to

- **terminal-fleet** *(required)* — Fleet monitoring provides device-level health; this provides application-level metrics
- **terminal-payment-flow** *(required)* — Transaction events are the primary source of payment metrics
- **payshap-rail** *(recommended)* — PayShap settlement latency tracked against 10s SLA
- **payment-gateway** *(recommended)* — Card authorisation latency and error rates tracked
- **audit-logging** *(optional)* — Alert events can be logged to audit trail

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/observability/payment-observability/) · **Spec source:** [`payment-observability.blueprint.yaml`](./payment-observability.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
