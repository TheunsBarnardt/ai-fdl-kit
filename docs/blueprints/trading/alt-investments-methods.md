---
title: "Alt Investments Methods Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compare fund investment, co-investment, and direct investment methods for accessing alternatives, contrasting diversification, fees, control, and required exper"
---

# Alt Investments Methods Blueprint

> Compare fund investment, co-investment, and direct investment methods for accessing alternatives, contrasting diversification, fees, control, and required expertise

| | |
|---|---|
| **Feature** | `alt-investments-methods` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternatives, fund-investment, co-investment, direct-investment, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/alt-investments-methods.blueprint.yaml) |
| **JSON API** | [alt-investments-methods.json]({{ site.baseurl }}/api/blueprints/trading/alt-investments-methods.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `alt_access_mgr` | Alt Access Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `access_id` | text | Yes | Access identifier |  |
| `method` | select | Yes | fund \| co_investment \| direct |  |
| `investor_type` | select | Yes | individual \| institution |  |

## Rules

- **fund_investment:**
  - **description:** Investor commits capital to a pooled vehicle run by a GP
  - **pros:** Diversification, access to specialised managers, due diligence outsourced
  - **cons:** Double fee drag (FoF), limited control, lock-ups, J-curve
- **co_investment:**
  - **description:** Invest alongside fund in a specific deal, usually fee-reduced
  - **pros:** Lower fees, selective exposure, closer to manager
  - **cons:** Concentration risk, requires in-house deal analysis
- **direct_investment:**
  - **description:** Investor purchases the asset or company directly
  - **pros:** Full control, no intermediary fees, bespoke structuring
  - **cons:** Requires scale, expertise, operational infrastructure
- **validation:**
  - **access_required:** access_id present
  - **valid_method:** method in [fund, co_investment, direct]

## Outcomes

### Select_access_method (Priority: 1)

_Pick alt access method consistent with investor capability_

**Given:**
- `access_id` (input) exists
- `method` (input) in `fund,co_investment,direct`

**Then:**
- **call_service** target: `alt_access_mgr`
- **emit_event** event: `alt.access_selected`

### Invalid_method (Priority: 10) — Error: `ALT_INVALID_METHOD`

_Unsupported method_

**Given:**
- `method` (input) not_in `fund,co_investment,direct`

**Then:**
- **emit_event** event: `alt.access_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ALT_INVALID_METHOD` | 400 | method must be fund, co_investment, or direct | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alt.access_selected` |  | `access_id`, `method`, `investor_type` |
| `alt.access_rejected` |  | `access_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-features-categories | required |  |
| alt-investments-ownership-compensation | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Alt Investments Methods Blueprint",
  "description": "Compare fund investment, co-investment, and direct investment methods for accessing alternatives, contrasting diversification, fees, control, and required exper",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternatives, fund-investment, co-investment, direct-investment, cfa-level-1"
}
</script>
