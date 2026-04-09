---
title: "User Account Self Service Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "User self-service account and credential management. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised"
---

# User Account Self Service Blueprint

> User self-service account and credential management

| | |
|---|---|
| **Feature** | `user-account-self-service` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | account-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/user-account-self-service.blueprint.yaml) |
| **JSON API** | [user-account-self-service.json]({{ site.baseurl }}/api/blueprints/auth/user-account-self-service.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `email` | email | Yes | Email | Validations: required, email |
| `current_password` | password | Yes | Current Password | Validations: required |

## Rules

- **core:** Account self-service operations

## Outcomes

### Profile_updated (Priority: 5)

**Given:**
- `email` exists `null`

**Then:**
- **emit_event** event: `account.updated`

**Result:** Profile updated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_PASSWORD` | 401 | Invalid password | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `account.updated` | Account updated | `user_id` |

## AGI Readiness

### Goals

#### Reliable User Account Self Service

User self-service account and credential management

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| profile_updated | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/keycloak/keycloak
  project: Keycloak
  tech_stack: Java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "User Account Self Service Blueprint",
  "description": "User self-service account and credential management. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "account-management"
}
</script>
