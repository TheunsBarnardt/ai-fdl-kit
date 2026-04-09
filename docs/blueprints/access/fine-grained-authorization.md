---
title: "Fine Grained Authorization Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Resource-based and policy-based authorization. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised"
---

# Fine Grained Authorization Blueprint

> Resource-based and policy-based authorization

| | |
|---|---|
| **Feature** | `fine-grained-authorization` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | authorization, rbac |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/fine-grained-authorization.blueprint.yaml) |
| **JSON API** | [fine-grained-authorization.json]({{ site.baseurl }}/api/blueprints/access/fine-grained-authorization.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `resource_id` | text | Yes | Resource ID | Validations: required |
| `scope_name` | text | Yes | Scope | Validations: required |

## Rules

- **core:** Authorization policy evaluation

## Outcomes

### Access_granted (Priority: 5)

**Given:**
- `resource_id` exists `null`

**Then:**
- **emit_event** event: `authz.granted`

**Result:** Access granted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCESS_DENIED` | 403 | Access denied | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `authz.granted` | Authorization granted | `resource_id` |

## AGI Readiness

### Goals

#### Reliable Fine Grained Authorization

Resource-based and policy-based authorization

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
| access_granted | `autonomous` | - | - |

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
  "name": "Fine Grained Authorization Blueprint",
  "description": "Resource-based and policy-based authorization. 2 fields. 1 outcomes. 1 error codes. rules: core. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authorization, rbac"
}
</script>
