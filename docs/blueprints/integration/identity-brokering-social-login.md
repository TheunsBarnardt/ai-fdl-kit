---
title: "Identity Brokering Social Login Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "External identity provider integration and social login. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised"
---

# Identity Brokering Social Login Blueprint

> External identity provider integration and social login

| | |
|---|---|
| **Feature** | `identity-brokering-social-login` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | identity-brokering, social-login |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/identity-brokering-social-login.blueprint.yaml) |
| **JSON API** | [identity-brokering-social-login.json]({{ site.baseurl }}/api/blueprints/integration/identity-brokering-social-login.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `provider_alias` | text | Yes | Provider Alias | Validations: required |
| `client_id` | text | Yes | Client ID | Validations: required |

## Rules

- **core:** Identity provider delegation

## Outcomes

### User_authenticated (Priority: 5)

**Given:**
- `provider_alias` exists `null`

**Then:**
- **emit_event** event: `broker.authenticated`

**Result:** External authentication successful

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BROKER_ERROR` | 401 | External authentication failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `broker.authenticated` | External authentication successful | `user_id` |

## AGI Readiness

### Goals

#### Reliable Identity Brokering Social Login

External identity provider integration and social login

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| user_authenticated | `autonomous` | - | - |

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
  "name": "Identity Brokering Social Login Blueprint",
  "description": "External identity provider integration and social login. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "identity-brokering, social-login"
}
</script>
