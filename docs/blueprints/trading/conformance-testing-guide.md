---
title: "Conformance Testing Guide Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "JSE trading and market data conformance testing including gateway failover, recovery service testing, and application compliance. 4 fields. 3 outcomes. 3 error "
---

# Conformance Testing Guide Blueprint

> JSE trading and market data conformance testing including gateway failover, recovery service testing, and application compliance

| | |
|---|---|
| **Feature** | `conformance-testing-guide` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | testing, conformance, validation, trading, market-data |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/conformance-testing-guide.blueprint.yaml) |
| **JSON API** | [conformance-testing-guide.json]({{ site.baseurl }}/api/blueprints/trading/conformance-testing-guide.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `testing_type` | select | Yes | Type of conformance testing |  |
| `market` | select | Yes | Target market |  |
| `gateway_interface` | select | Yes | Trading gateway interface |  |
| `client_can_detect_failure` | boolean | Yes | Client application can detect gateway failure |  |

## Rules

- **mandatory_testing:**
  - **trading_clients:** All applications connecting to production MUST pass mandatory testing
  - **interface_certification:** Clients MUST be certified for each interface used in production
  - **post_trade_mandatory:** Post Trade Gateway (FIX 5.0 SP2) MANDATORY for all trading
- **gateway_failover_testing:**
  - **schedule:** Every Friday 15:00-15:45 SAST
  - **client_expectation:** Client MUST detect disconnection and reconnect to Secondary Gateway

## Outcomes

### Testing_plan_created (Priority: 1)

**Given:**
- `testing_type` (input) exists

**Then:**
- **emit_event** event: `conformance.testing.plan.created`

**Result:** Conformance testing plan created

### Gateway_failover_triggered (Priority: 2)

**Given:**
- `testing_type` (input) in `trading_gateway_failover,post_trade_gateway_failover`

**Then:**
- **emit_event** event: `conformance.gateway.failover.triggered`

**Result:** Gateway failover test triggered

### Application_conformance_passed (Priority: 10)

**Given:**
- `testing_type` (input) exists
- `market` (input) exists

**Then:**
- **emit_event** event: `conformance.application.passed`

**Result:** Application achieves conformance certification

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONFORMANCE_GATEWAY_FAILOVER_FAILED` | 500 | Gateway failover test failed; client did not detect or reconnect | No |
| `CONFORMANCE_SEQUENCE_GAP_NOT_DETECTED` | 500 | Client failed to detect market data sequence gap | No |
| `CONFORMANCE_TEST_INCOMPLETE` | 400 | Application did not complete all mandatory tests | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `conformance.testing.plan.created` | Conformance testing plan created | `testing_type`, `market`, `timestamp` |
| `conformance.gateway.failover.triggered` | Gateway failover test triggered | `gateway_interface`, `timestamp` |
| `conformance.application.passed` | All conformance tests passed | `market`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| connectivity-testing-lcon | required | LCON validates connectivity; conformance testing validates application behavior |
| network-configuration-guide | required | Network must be configured before conformance testing |
| client-connectivity-standards | required | Client must meet connectivity standards |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Conformance Testing Guide Blueprint",
  "description": "JSE trading and market data conformance testing including gateway failover, recovery service testing, and application compliance. 4 fields. 3 outcomes. 3 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "testing, conformance, validation, trading, market-data"
}
</script>
