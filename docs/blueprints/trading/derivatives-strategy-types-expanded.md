---
title: "Derivatives Strategy Types Expanded Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Expansion of Strategy Type field (27110) in Trade Capture Report (TCR) to support additional multi-legged instrument strategy classifications for Equity Derivat"
---

# Derivatives Strategy Types Expanded Blueprint

> Expansion of Strategy Type field (27110) in Trade Capture Report (TCR) to support additional
multi-legged instrument strategy classifications for Equity Derivative Market (EDM) and
Currency Derivative Market (FXM) participants. Enhances granularity of strategy reporting.
Introduced in JSE Release 7.8.


| | |
|---|---|
| **Feature** | `derivatives-strategy-types-expanded` |
| **Category** | Trading |
| **Version** | 1.0 |
| **Tags** | derivatives, post-trade, strategy-classification, release-7.8 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/derivatives-strategy-types-expanded.blueprint.yaml) |
| **JSON API** | [derivatives-strategy-types-expanded.json]({{ site.baseurl }}/api/blueprints/trading/derivatives-strategy-types-expanded.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trading_participant` | Trading Participant | human |  |
| `post_trade_gateway` | Post Trade Gateway | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_id` | token | Yes |  |  |
| `tcr_strategy_link_id` | token | No |  |  |
| `strategy_type` | number | Yes |  |  |
| `strategy_classification` | text | Yes |  |  |
| `market` | select | Yes |  |  |
| `tcr_message_format` | select | Yes |  |  |
| `strategy_type_required` | boolean | No |  |  |
| `gateway` | select | Yes |  |  |

## Outcomes

### 0 (Priority: 1)

_Trade Capture Report with StrategyLinkID must specify Strategy Type_

**Given:**
- `tcr_strategy_link_id` (input) exists
- `market` (system) in `EDM,FXM`

**Then:**
- **set_field** target: `strategy_type_required` value: `true`

### 1 (Priority: 2)

_Strategy Types 1-14 are all supported for multi-legged instruments_

**Given:**
- `strategy_type` (input) in `1,2,3,4,5,6,7,8,9,10,11,12,13,14`
- `tcr_strategy_link_id` (input) exists

**Then:**
- **set_field** target: `strategy_classification` value: `accepted`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STRATEGY_TYPE_MISSING_WITH_LINK_ID` |  | Strategy Type (field 27110) required when StrategyLinkID (field 27100) is populated | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trade-capture-report | required |  |
| post-trade-gateway | required |  |
| derivatives-market-trading | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Derivatives Strategy Types Expanded Blueprint",
  "description": "Expansion of Strategy Type field (27110) in Trade Capture Report (TCR) to support additional\nmulti-legged instrument strategy classifications for Equity Derivat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, post-trade, strategy-classification, release-7.8"
}
</script>
