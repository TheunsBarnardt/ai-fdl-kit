---
title: "Monetary Policy Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Execute central bank monetary policy using open market operations, policy rate, reserve requirements, and standing facilities to meet inflation and financial st"
---

# Monetary Policy Framework Blueprint

> Execute central bank monetary policy using open market operations, policy rate, reserve requirements, and standing facilities to meet inflation and financial stability objectives

| | |
|---|---|
| **Feature** | `monetary-policy-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, monetary-policy, central-bank, policy-rate, open-market-operations, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/monetary-policy-framework.blueprint.yaml) |
| **JSON API** | [monetary-policy-framework.json]({{ site.baseurl }}/api/blueprints/trading/monetary-policy-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `central_bank` | Central Bank Operations Desk | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Monetary authority jurisdiction |  |
| `tool` | select | Yes | policy_rate \| open_market_ops \| reserve_requirement \| standing_facility \| asset_purchases |  |
| `policy_stance` | select | No | expansionary \| neutral \| contractionary |  |
| `action_amount` | number | No | Change in rate or balance sheet amount |  |

## Rules

- **objectives:**
  - **price_stability:** Core mandate — keep inflation near target (commonly 2 percent)
  - **full_employment:** Dual mandate in the US
  - **financial_stability:** Safeguard the banking system and smooth market functioning
  - **exchange_rate_stability:** Where applicable, anchor the currency
- **primary_tools:**
  - **policy_rate:** Target short-term interbank rate (e.g., federal funds rate)
  - **open_market_operations:** Buy/sell securities to adjust bank reserves
  - **reserve_requirement:** Fraction of deposits banks must hold at the central bank
  - **standing_facilities:** Permanent overnight borrowing/lending windows
  - **unconventional:** Large-scale asset purchases (QE), yield-curve control, forward guidance
- **transmission_mechanism:**
  - **interest_rate_channel:** Policy rate -> bank lending rates -> consumption and investment
  - **asset_price_channel:** Rate changes -> bond, equity, and housing valuations
  - **exchange_rate_channel:** Rate changes -> capital flows -> FX -> net exports
  - **credit_channel:** Balance-sheet strength and bank lending capacity
  - **expectations_channel:** Forward guidance anchors future rate path and inflation expectations
- **inflation_targeting:**
  - **credibility:** Transparent target anchors expectations
  - **independence:** Insulates policy from short-run political pressure
  - **accountability:** Clear metric to judge central bank performance
- **central_bank_independence:**
  - **operational_independence:** Freedom to set policy tools
  - **target_independence:** Freedom to set target
  - **transparency:** Publishing minutes, forecasts, decision rationale
- **limitations:**
  - **zero_lower_bound:** Rates cannot be cut much below zero
  - **long_variable_lags:** 12-24 months for full transmission
  - **supply_shocks:** Monetary policy cannot offset supply-side inflation without recession risk
  - **banking_transmission:** Weak bank balance sheets impair transmission
- **validation:**
  - **jurisdiction_required:** jurisdiction present
  - **valid_tool:** tool in {policy_rate, open_market_ops, reserve_requirement, standing_facility, asset_purchases}

## Outcomes

### Execute_policy_action (Priority: 1)

_Implement monetary policy action_

**Given:**
- `jurisdiction` (input) exists
- `tool` (input) in `policy_rate,open_market_ops,reserve_requirement,standing_facility,asset_purchases`

**Then:**
- **call_service** target: `central_bank`
- **emit_event** event: `monetary.action_executed`

### Invalid_tool (Priority: 10) — Error: `MONETARY_INVALID_TOOL`

_Unsupported monetary tool_

**Given:**
- `tool` (input) not_in `policy_rate,open_market_ops,reserve_requirement,standing_facility,asset_purchases`

**Then:**
- **emit_event** event: `monetary.action_rejected`

### Missing_jurisdiction (Priority: 11) — Error: `MONETARY_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `monetary.action_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MONETARY_INVALID_TOOL` | 400 | tool must be policy_rate, open_market_ops, reserve_requirement, standing_facility, or asset_purchases | No |
| `MONETARY_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `monetary.action_executed` |  | `action_id`, `jurisdiction`, `tool`, `change`, `expected_transmission` |
| `monetary.action_rejected` |  | `action_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fiscal-policy-framework | recommended |  |
| credit-cycles | recommended |  |
| business-cycle-phases | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
contractionary_vs_expansionary:
  contractionary: Raise rate, sell securities, increase RR, tighten standing facilities
  expansionary: Cut rate, buy securities, lower RR, loosen standing facilities
policy_interaction_with_fiscal:
  consistent: Both expansionary or both contractionary -> large impact
  opposed: Conflicting policies mute each other (e.g., loose fiscal + tight monetary)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Monetary Policy Framework Blueprint",
  "description": "Execute central bank monetary policy using open market operations, policy rate, reserve requirements, and standing facilities to meet inflation and financial st",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, monetary-policy, central-bank, policy-rate, open-market-operations, cfa-level-1"
}
</script>
