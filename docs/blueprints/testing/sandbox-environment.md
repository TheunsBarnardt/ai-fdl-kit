---
title: "Sandbox Environment Blueprint"
layout: default
parent: "Testing"
grand_parent: Blueprint Catalog
description: "Parallel PGW environment with full data isolation — merchants/terminals can be flipped to sandbox for demos and integration testing without moving real money; p"
---

# Sandbox Environment Blueprint

> Parallel PGW environment with full data isolation — merchants/terminals can be flipped to sandbox for demos and integration testing without moving real money; provisioned per merchant at enrolment

| | |
|---|---|
| **Feature** | `sandbox-environment` |
| **Category** | Testing |
| **Version** | 1.0.0 |
| **Tags** | sandbox, testing, isolation, provisioning, demo, mock |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/testing/sandbox-environment.blueprint.yaml) |
| **JSON API** | [sandbox-environment.json]({{ site.baseurl }}/api/blueprints/testing/sandbox-environment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `merchant` | Merchant | human |  |
| `pgw` | Payments Gateway (sandbox instance) | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `merchant_id` | text | Yes |  |  |
| `scenario_profile` | select | Yes | Deterministic scenario scripting for the mock rail |  |
| `sandbox_flag` | boolean | Yes | Terminal-level sandbox toggle |  |

## Rules

- **isolation:** MUST: sandbox data (transactions, enrolments, receipts) is fully isolated from prod — separate DB schema / namespace, MUST: sandbox cannot reach real rails; only the sandbox-rail-adapter is loaded
- **parity:** MUST: sandbox runs the SAME code as prod, differing only in config (rail set + scenario profile)
- **safety:** MUST: sandbox payments are tagged with `sandbox: true` in every event and webhook

## Outcomes

### Unauthorized (Priority: 1) — Error: `SANDBOX_UNAUTHORIZED`

**Given:**
- no admin session

**Result:** 401

### Already_provisioned (Priority: 10) — Error: `SANDBOX_ALREADY_PROVISIONED`

**Given:**
- merchant already has sandbox

**Result:** 409 — update scenario instead

### Provisioned (Priority: 100)

**Given:**
- operator authenticated
- merchant not yet provisioned

**Then:**
- **create_record**
- **emit_event** event: `sandbox.provisioned`

**Result:** Merchant can flip any of their terminals to sandbox mode

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SANDBOX_UNAUTHORIZED` | 401 | Admin authentication required | No |
| `SANDBOX_ALREADY_PROVISIONED` | 409 | Sandbox already provisioned for this merchant | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sandbox.provisioned` |  |  |
| `sandbox.flag_toggled` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payments-gateway-api | required | Sandbox is a config variant of the PGW |
| sandbox-rail-adapter | required | Sandbox uses the mock rail exclusively |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sandbox Environment Blueprint",
  "description": "Parallel PGW environment with full data isolation — merchants/terminals can be flipped to sandbox for demos and integration testing without moving real money; p",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sandbox, testing, isolation, provisioning, demo, mock"
}
</script>
