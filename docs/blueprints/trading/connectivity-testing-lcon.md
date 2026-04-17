---
title: "Connectivity Testing Lcon Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "JSE Live Connectivity Test (LCON) process for validating client infrastructure changes and trading enablements. 4 fields. 3 outcomes. 3 error codes. rules: lcon"
---

# Connectivity Testing Lcon Blueprint

> JSE Live Connectivity Test (LCON) process for validating client infrastructure changes and trading enablements

| | |
|---|---|
| **Feature** | `connectivity-testing-lcon` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | testing, connectivity, lcon, validation, trading, conformance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/connectivity-testing-lcon.blueprint.yaml) |
| **JSON API** | [connectivity-testing-lcon.json]({{ site.baseurl }}/api/blueprints/trading/connectivity-testing-lcon.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `lcon_type` | select | Yes | Type of Live Connectivity Test |  |
| `support_level` | select | Yes | Support level for LCON |  |
| `gateway_type` | select | Yes | Gateway interface being tested |  |
| `hours_notice_provided` | number | Yes | Hours of notice provided |  |

## Rules

- **lcon_requirement:**
  - **mandatory_on_changes:** LCON mandatory when infrastructure or enablement changes made
- **supported_lcon_scheduling:**
  - **window:** Thursday 18:00-20:00 SAST
  - **notice_period_schedule:** Minimum 72 hours notice required
- **unsupported_lcon_scheduling:**
  - **window:** Monday-Friday 06:30-19:00 SAST
  - **notice_period:** Minimum 24 hours notice required

## Outcomes

### Lcon_request_validated (Priority: 1)

**Given:**
- `lcon_type` (input) exists

**Then:**
- **emit_event** event: `lcon.request.validated`

**Result:** LCON request passes validation

### Supported_lcon_scheduled (Priority: 2)

**Given:**
- `support_level` (input) eq `supported`
- `hours_notice_provided` (input) gte `72`

**Then:**
- **emit_event** event: `lcon.scheduled`

**Result:** Supported LCON scheduled for Thursday

### Lcon_successful (Priority: 10)

**Given:**
- `lcon_type` (input) exists

**Then:**
- **emit_event** event: `lcon.successful`

**Result:** LCON complete; enablements ready for production

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LCON_INSUFFICIENT_NOTICE` | 400 | Insufficient notice; supported requires 72h, unsupported requires 24h | No |
| `LCON_GATEWAY_LOGIN_FAILED` | 500 | Failed to establish login with correct IP and Comp-ID | No |
| `LCON_MULTICAST_RECEIPT_FAILED` | 500 | Failed to confirm Multicast receipt on subscribed channels | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `lcon.request.validated` | LCON request validated | `lcon_type`, `timestamp` |
| `lcon.scheduled` | LCON scheduled | `support_level`, `timestamp` |
| `lcon.successful` | LCON test complete | `tested_gateways`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| network-configuration-guide | required | Network must be configured before LCON |
| client-connectivity-standards | required | Client must meet connectivity standards |
| conformance-testing-guide | recommended | LCON validates connectivity; conformance tests validate functionality |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Connectivity Testing Lcon Blueprint",
  "description": "JSE Live Connectivity Test (LCON) process for validating client infrastructure changes and trading enablements. 4 fields. 3 outcomes. 3 error codes. rules: lcon",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "testing, connectivity, lcon, validation, trading, conformance"
}
</script>
