---
title: "User Consent Management Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "OAuth/OIDC consent tracking and enforcement. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised"
---

# User Consent Management Blueprint

> OAuth/OIDC consent tracking and enforcement

| | |
|---|---|
| **Feature** | `user-consent-management` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | consent, oauth2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/user-consent-management.blueprint.yaml) |
| **JSON API** | [user-consent-management.json]({{ site.baseurl }}/api/blueprints/access/user-consent-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | Yes | Client ID | Validations: required |
| `scope` | text | Yes | Scope | Validations: required |

## Rules

- **core:** Consent enforcement

## Outcomes

### Consent_granted (Priority: 5)

**Given:**
- `client_id` exists `null`

**Then:**
- **emit_event** event: `consent.granted`

**Result:** Consent recorded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONSENT_DENIED` | 403 | Consent denied | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `consent.granted` | Consent granted | `client_id` |

## AGI Readiness

### Goals

#### Reliable User Consent Management

OAuth/OIDC consent tracking and enforcement

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | usability | access control must enforce least-privilege principle |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| consent_granted | `autonomous` | - | - |

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
  "name": "User Consent Management Blueprint",
  "description": "OAuth/OIDC consent tracking and enforcement. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "consent, oauth2"
}
</script>
