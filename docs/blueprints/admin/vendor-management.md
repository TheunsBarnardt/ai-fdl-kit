---
title: "Vendor Management Blueprint"
layout: default
parent: "Admin"
grand_parent: Blueprint Catalog
description: "Admin vendor registry — acquirers, SMS/email/KYC/fraud-signal providers; credential rotation, per-merchant overrides, health + cost visibility, full audit trail"
---

# Vendor Management Blueprint

> Admin vendor registry — acquirers, SMS/email/KYC/fraud-signal providers; credential rotation, per-merchant overrides, health + cost visibility, full audit trail

| | |
|---|---|
| **Feature** | `vendor-management` |
| **Category** | Admin |
| **Version** | 1.0.0 |
| **Tags** | admin, vendor, provider, credentials, rotation, audit |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/admin/vendor-management.blueprint.yaml) |
| **JSON API** | [vendor-management.json]({{ site.baseurl }}/api/blueprints/admin/vendor-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ops_operator` | Operations operator | human |  |
| `vendor` | External vendor | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vendor_id` | text | Yes |  |  |
| `vendor_type` | select | Yes |  |  |
| `credentials_encrypted` | text | Yes | KMS-wrapped credentials blob |  |
| `config` | json | Yes | Vendor-specific config (endpoints, timeouts, regions) |  |
| `per_merchant_overrides` | json | No |  |  |

## Rules

- **security:** MUST: credentials stored KMS-encrypted; never exposed in API responses, MUST: credential rotation is a first-class endpoint — operators cannot read current credentials, only rotate, MUST: every registration/rotation/override is audit-logged with operator + reason
- **reliability:** SHOULD: vendor health is polled and surfaced on the console, SHOULD: cost per call tracked per vendor for FinOps

## Outcomes

### Unauthorized (Priority: 1) — Error: `VENDOR_UNAUTHORIZED`

**Given:**
- no admin session or insufficient role

**Result:** 401

### Invalid_config (Priority: 5) — Error: `VENDOR_INVALID_CONFIG`

**Given:**
- config fails schema validation

**Result:** 400

### Already_exists (Priority: 10) — Error: `VENDOR_ALREADY_EXISTS`

**Given:**
- vendor_id already registered

**Result:** 409

### Vendor_registered (Priority: 100)

**Given:**
- operator authenticated with ops role
- config validates

**Then:**
- **create_record**
- **emit_event** event: `vendor.registered`

**Result:** Vendor available for downstream services

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VENDOR_INVALID_CONFIG` | 400 | Vendor config is invalid | No |
| `VENDOR_UNAUTHORIZED` | 401 | Admin authentication required | No |
| `VENDOR_ALREADY_EXISTS` | 409 | Vendor already exists | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vendor.registered` |  |  |
| `vendor.rotated` |  |  |
| `vendor.override_applied` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| transactions-console | required | Vendor management is a companion module of the admin console |
| rail-registry | required | Acquirer vendors plug into rails via this registry |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vendor Management Blueprint",
  "description": "Admin vendor registry — acquirers, SMS/email/KYC/fraud-signal providers; credential rotation, per-merchant overrides, health + cost visibility, full audit trail",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "admin, vendor, provider, credentials, rotation, audit"
}
</script>
