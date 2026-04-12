---
layout: default
title: Outcome Naming Conventions
nav_order: 9
---

# Outcome Naming Conventions

FDL blueprints use outcome names to express **what happened** after evaluation. The fitness scorer and completeness checker use these naming patterns to verify that blueprints cover both success and failure paths.

## Success Outcome Names

Use names that indicate a positive result. The following patterns are recognized:

| Pattern | Example Use |
|---------|-------------|
| `successful` | `successful_login`, `successful_payment` |
| `valid` | `valid_credentials`, `valid_input` |
| `approved` | `approved_request`, `approved_transaction` |
| `confirmed` | `confirmed_order`, `confirmed_identity` |
| `created` | `created_account`, `created_record` |
| `updated` | `updated_profile`, `updated_settings` |
| `granted` | `granted_access`, `granted_permission` |
| `complete` | `complete_checkout`, `complete_registration` |
| `ok` | `ok_health_check` |

**Regex pattern used:** `success|valid|ok|complete|approved|confirmed|created|updated|granted`

## Failure Outcome Names

Use names that indicate an error or rejection. The following patterns are recognized:

| Pattern | Example Use |
|---------|-------------|
| `invalid` | `invalid_credentials`, `invalid_input` |
| `failed` | `failed_validation`, `failed_payment` |
| `denied` | `denied_access`, `denied_permission` |
| `rejected` | `rejected_request`, `rejected_transaction` |
| `expired` | `expired_token`, `expired_session` |
| `unauthorized` | `unauthorized_access` |
| `forbidden` | `forbidden_resource` |
| `not_found` | `not_found_user`, `not_found_record` |
| `error` | `error_internal`, `error_timeout` |
| `limit` | `rate_limited`, `limit_exceeded` |
| `lock` | `account_locked`, `resource_locked` |
| `missing` | `missing_field`, `missing_dependency` |
| `declined` | `declined_payment` |

**Regex pattern used:** `fail|invalid|denied|error|rejected|expired|missing|declined|unauthorized|forbidden|not_found|limit|lock`

## Scoring Impact

The fitness scorer (`scripts/fitness.js`) awards:
- **2 points** for having at least one success-path outcome
- **2 points** for having at least one failure-path outcome

The completeness checker (`scripts/completeness-check.js`) issues warnings when:
- No outcome name suggests a success path
- No outcome name suggests a failure path

## Best Practices

1. **Every blueprint should have at least one success and one failure outcome**
2. **Use descriptive compound names** like `invalid_credentials` not just `invalid`
3. **Bind failure outcomes to error codes** using the `error:` field
4. **Set priorities** — lower numbers are checked first (e.g., rate limiting at priority 0)
5. **Include `given[]` conditions** — even plain-text conditions help document when an outcome applies
6. **Include `then[]` actions or `result`** — outcomes with neither are flagged as dead weight by the simplicity scorer
