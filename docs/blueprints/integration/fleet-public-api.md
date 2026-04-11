---
title: "Fleet Public Api Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "RESTful public API with API key authentication and request logging for third-party integrations. 10 fields. 6 outcomes. 4 error codes. rules: cryptographic_gene"
---

# Fleet Public Api Blueprint

> RESTful public API with API key authentication and request logging for third-party integrations

| | |
|---|---|
| **Feature** | `fleet-public-api` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | fleet, api, rest, authentication, credentials, integration, third-party |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/fleet-public-api.blueprint.yaml) |
| **JSON API** | [fleet-public-api.json]({{ site.baseurl }}/api/blueprints/integration/fleet-public-api.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Technical user creating and managing API credentials |
| `external_system` | External System | external | Third-party application consuming the API |
| `system` | API Gateway | system | Request authentication, rate limiting, and logging |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `credential_id` | text | Yes | Credential ID |  |
| `name` | text | Yes | Credential Name |  |
| `api_key` | token | Yes | API Key |  |
| `api_secret` | token | Yes | API Secret |  |
| `test_mode` | boolean | No | Test Mode |  |
| `browser_origins` | json | No | Allowed Browser Origins |  |
| `last_used_at` | datetime | No | Last Used At |  |
| `expires_at` | datetime | No | Expires At |  |
| `api_version` | text | No | API Version |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `revoked` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `revoked` | developer |  |

## Rules

- **cryptographic_generation:** API key and secret are generated as cryptographically secure random tokens
- **secret_shown_once:** The API secret is only shown once at creation and is never retrievable afterward
- **auth_header:** API requests must include the API key in the Authorization header
- **immediate_revocation:** Revoked credentials are immediately invalid; all requests return 401
- **rate_limiting:** Rate limiting is enforced per credential to prevent abuse
- **request_audit:** All API requests are logged with timestamp, endpoint, method, status code, and credential
- **test_mode_isolation:** Test mode credentials operate against test data and do not affect live records
- **permission_scoping:** Credentials can be scoped to specific API resources via permissions
- **auto_expiry:** Expired credentials are automatically invalidated at the expiry timestamp
- **cors_restriction:** Browser origin restrictions prevent unauthorized web application usage

## Outcomes

### Credential_created (Priority: 1)

**Given:**
- `name` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `api.credential_created`

**Result:** API credential created; key and secret provided once

### Invalid_api_key (Priority: 1) — Error: `API_INVALID_KEY`

**Given:**
- Authorization header is missing or API key is not found

**Result:** Request rejected — invalid API key

### Request_authenticated (Priority: 2)

**Given:**
- Authorization header contains a valid API key
- `status` (db) eq `active`
- credential is not expired

**Then:**
- **set_field** target: `last_used_at` value: `now`
- **create_record**

**Result:** Request authenticated; operation proceeds

### Rate_limit_exceeded (Priority: 2) — Error: `API_RATE_LIMIT_EXCEEDED`

**Given:**
- request rate for this credential exceeds configured limit

**Result:** Request rejected — rate limit exceeded

### Credential_revoked (Priority: 3)

**Given:**
- `status` (db) eq `active`

**Then:**
- **set_field** target: `status` value: `revoked`
- **emit_event** event: `api.credential_revoked`

**Result:** Credential revoked; all subsequent requests rejected

### Credential_expired (Priority: 3) — Error: `API_CREDENTIAL_EXPIRED`

**Given:**
- `expires_at` (db) lt `now`

**Result:** Request rejected — credential has expired

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `API_INVALID_KEY` | 401 | Invalid or missing API key. | No |
| `API_RATE_LIMIT_EXCEEDED` | 429 | Too many requests. Please slow down and try again. | Yes |
| `API_CREDENTIAL_EXPIRED` | 401 | Your API credential has expired. Please generate a new key. | No |
| `API_PERMISSION_DENIED` | 403 | You do not have permission to perform this action. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `api.credential_created` | Fired when a new API credential is created | `credential_id`, `name`, `test_mode` |
| `api.credential_revoked` | Fired when an API credential is revoked | `credential_id`, `name` |
| `api.request_logged` | Fired for each authenticated API request | `credential_id`, `endpoint`, `method`, `status_code`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-tenant-organization | required | API credentials are scoped to an organization |
| order-lifecycle-webhooks | recommended | API credentials can be linked to webhook endpoints |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Public Api Blueprint",
  "description": "RESTful public API with API key authentication and request logging for third-party integrations. 10 fields. 6 outcomes. 4 error codes. rules: cryptographic_gene",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, api, rest, authentication, credentials, integration, third-party"
}
</script>
