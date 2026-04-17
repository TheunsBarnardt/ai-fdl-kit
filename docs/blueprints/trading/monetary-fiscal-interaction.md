---
title: "Monetary Fiscal Interaction Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify the combined stance of monetary and fiscal policy and assess the interaction effects on aggregate demand, interest rates, the currency, and inflation. "
---

# Monetary Fiscal Interaction Blueprint

> Classify the combined stance of monetary and fiscal policy and assess the interaction effects on aggregate demand, interest rates, the currency, and inflation

| | |
|---|---|
| **Feature** | `monetary-fiscal-interaction` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, policy-mix, monetary-fiscal, policy-interaction, coordination, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/monetary-fiscal-interaction.blueprint.yaml) |
| **JSON API** | [monetary-fiscal-interaction.json]({{ site.baseurl }}/api/blueprints/trading/monetary-fiscal-interaction.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `policy_mix_analyst` | Policy Mix Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Country or monetary union |  |
| `monetary_stance` | select | Yes | expansionary \| neutral \| contractionary |  |
| `fiscal_stance` | select | Yes | expansionary \| neutral \| contractionary |  |

## Rules

- **four_quadrants:**
  - **loose_loose:** Both expansionary — strong AD boost, weak currency, rising rates eventually
  - **loose_monetary_tight_fiscal:** Private sector led — exports aided, currency weakens, lower rates
  - **tight_monetary_loose_fiscal:** Public sector led — strong currency, higher rates, crowding out risk
  - **tight_tight:** Both contractionary — disinflation, recession risk
- **fiscal_dominance:**
  - **definition:** Large deficits force monetary accommodation, undermining inflation control
  - **signal:** Central bank cannot raise rates without triggering debt crisis
- **market_implications:**
  - **equities:** Loose/loose typically supports equities until inflation bites
  - **bonds:** Tight monetary + loose fiscal -> curve steepens, term premia widen
  - **fx:** Tight monetary + loose fiscal -> currency strengthens (short run)
- **validation:**
  - **jurisdiction_required:** jurisdiction present
  - **valid_stances:** monetary_stance and fiscal_stance in allowed set

## Outcomes

### Classify_policy_mix (Priority: 1)

_Assign quadrant and derive market implications_

**Given:**
- `jurisdiction` (input) exists
- `monetary_stance` (input) in `expansionary,neutral,contractionary`
- `fiscal_stance` (input) in `expansionary,neutral,contractionary`

**Then:**
- **call_service** target: `policy_mix_analyst`
- **emit_event** event: `policy.mix_classified`

### Invalid_stance (Priority: 10) — Error: `POLICY_MIX_INVALID_STANCE`

_Unsupported stance value_

**Given:**
- ANY: `monetary_stance` (input) not_in `expansionary,neutral,contractionary` OR `fiscal_stance` (input) not_in `expansionary,neutral,contractionary`

**Then:**
- **emit_event** event: `policy.mix_rejected`

### Missing_jurisdiction (Priority: 11) — Error: `POLICY_MIX_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `policy.mix_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POLICY_MIX_INVALID_STANCE` | 400 | stances must be expansionary, neutral, or contractionary | No |
| `POLICY_MIX_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `policy.mix_classified` |  | `mix_id`, `jurisdiction`, `quadrant`, `fx_bias`, `rates_bias`, `equity_bias` |
| `policy.mix_rejected` |  | `mix_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| monetary-policy-framework | required |  |
| fiscal-policy-framework | required |  |
| business-cycle-phases | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Monetary Fiscal Interaction Blueprint",
  "description": "Classify the combined stance of monetary and fiscal policy and assess the interaction effects on aggregate demand, interest rates, the currency, and inflation. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, policy-mix, monetary-fiscal, policy-interaction, coordination, cfa-level-1"
}
</script>
