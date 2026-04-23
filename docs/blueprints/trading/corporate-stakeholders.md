---
title: "Corporate Stakeholders Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Identify corporate stakeholders — shareholders, lenders, managers, employees, customers, suppliers, government — and analyse conflicts of interest between their"
---

# Corporate Stakeholders Blueprint

> Identify corporate stakeholders — shareholders, lenders, managers, employees, customers, suppliers, government — and analyse conflicts of interest between their claims

| | |
|---|---|
| **Feature** | `corporate-stakeholders` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, stakeholders, shareholders, creditors, principal-agent, conflicts-of-interest, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/corporate-stakeholders.blueprint.yaml) |
| **JSON API** | [corporate-stakeholders.json]({{ site.baseurl }}/api/blueprints/trading/corporate-stakeholders.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `stakeholder_analyst` | Stakeholder Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `stakeholder_type` | select | Yes | shareholder \| creditor \| manager \| employee \| customer \| supplier \| government |  |
| `claim_priority` | select | No | senior \| subordinated \| residual |  |

## Rules

- **debt_vs_equity:**
  - **debt:** Fixed contractual claim, senior, limited upside, limited downside participation
  - **equity:** Residual claim, last in liquidation, unlimited upside, full downside
- **risk_return:**
  - **creditor_return:** Interest and principal — capped upside
  - **shareholder_return:** Dividends + capital gains — participates in all upside
  - **creditor_risk:** Default risk; recovery from collateral and seniority
  - **shareholder_risk:** Full operational and market risk
- **stakeholder_conflicts:**
  - **shareholder_vs_creditor:** Asset substitution, dividend recapitalizations, leverage increase
  - **controlling_vs_minority:** Related-party transactions, tunnelling, disproportionate voting
  - **manager_vs_owner:** Agency costs — empire building, perks, short-termism
  - **shareholder_vs_employee:** Layoffs vs wage pressure vs profit sharing
- **esg_considerations:**
  - **environmental:** Climate risk, resource use, pollution
  - **social:** Labour standards, community impact, data protection
  - **governance:** Board independence, compensation alignment, transparency
- **validation:**
  - **entity_required:** entity_id present
  - **valid_stakeholder:** stakeholder_type in allowed set

## Outcomes

### Map_stakeholder_claim (Priority: 1)

_Map stakeholder to claim and conflicts_

**Given:**
- `entity_id` (input) exists
- `stakeholder_type` (input) in `shareholder,creditor,manager,employee,customer,supplier,government`

**Then:**
- **call_service** target: `stakeholder_analyst`
- **emit_event** event: `stakeholder.mapped`

### Invalid_stakeholder (Priority: 10) — Error: `STK_INVALID_TYPE`

_Unsupported stakeholder type_

**Given:**
- `stakeholder_type` (input) not_in `shareholder,creditor,manager,employee,customer,supplier,government`

**Then:**
- **emit_event** event: `stakeholder.rejected`

### Missing_entity (Priority: 11) — Error: `STK_ENTITY_MISSING`

_Entity id missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `stakeholder.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STK_INVALID_TYPE` | 400 | stakeholder_type must be from the allowed set | No |
| `STK_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stakeholder.mapped` |  | `map_id`, `entity_id`, `stakeholder_type`, `claim_priority`, `conflict_flags` |
| `stakeholder.rejected` |  | `map_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| corporate-organizational-forms | recommended |  |
| corporate-governance-mechanisms | recommended |  |

## AGI Readiness

### Goals

#### Reliable Corporate Stakeholders

Identify corporate stakeholders — shareholders, lenders, managers, employees, customers, suppliers, government — and analyse conflicts of interest between their claims

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

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
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| map_stakeholder_claim | `autonomous` | - | - |
| invalid_stakeholder | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Corporate Stakeholders Blueprint",
  "description": "Identify corporate stakeholders — shareholders, lenders, managers, employees, customers, suppliers, government — and analyse conflicts of interest between their",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, stakeholders, shareholders, creditors, principal-agent, conflicts-of-interest, cfa-level-1"
}
</script>
