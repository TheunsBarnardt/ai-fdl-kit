---
title: "Saml 2 Identity Provider Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "SAML 2.0 identity provider with assertions and metadata. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised"
---

# Saml 2 Identity Provider Blueprint

> SAML 2.0 identity provider with assertions and metadata

| | |
|---|---|
| **Feature** | `saml-2-identity-provider` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | saml2, identity-provider |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/saml-2-identity-provider.blueprint.yaml) |
| **JSON API** | [saml-2-identity-provider.json]({{ site.baseurl }}/api/blueprints/auth/saml-2-identity-provider.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `issuer_entity_id` | text | Yes | Issuer Entity ID | Validations: required |
| `assertion_consumer_url` | url | Yes | Assertion Consumer URL | Validations: required, url |

## Rules

- **core:** SAML protocol compliance

## Outcomes

### Assertion_issued (Priority: 5)

**Given:**
- `issuer_entity_id` exists `null`

**Then:**
- **emit_event** event: `saml.assertion_created`

**Result:** SAML assertion issued

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_ISSUER` | 400 | Invalid issuer | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `saml.assertion_created` | SAML assertion created | `assertion_id` |

## AGI Readiness

### Goals

#### Reliable Saml 2 Identity Provider

SAML 2.0 identity provider with assertions and metadata

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
| security | performance | authentication must prioritize preventing unauthorized access |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| assertion_issued | `autonomous` | - | - |

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
  "name": "Saml 2 Identity Provider Blueprint",
  "description": "SAML 2.0 identity provider with assertions and metadata. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "saml2, identity-provider"
}
</script>
