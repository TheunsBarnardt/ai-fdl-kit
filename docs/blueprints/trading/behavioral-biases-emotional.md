---
title: "Behavioral Biases Emotional Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Identify emotional biases (loss aversion, overconfidence, self-control, status quo, endowment, regret aversion) and describe their effect on portfolio construct"
---

# Behavioral Biases Emotional Blueprint

> Identify emotional biases (loss aversion, overconfidence, self-control, status quo, endowment, regret aversion) and describe their effect on portfolio construction and rebalancing

| | |
|---|---|
| **Feature** | `behavioral-biases-emotional` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | behavioral-finance, emotional-bias, loss-aversion, overconfidence, endowment-bias, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/behavioral-biases-emotional.blueprint.yaml) |
| **JSON API** | [behavioral-biases-emotional.json]({{ site.baseurl }}/api/blueprints/trading/behavioral-biases-emotional.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `emo_bias_detector` | Emotional Bias Detector | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `detection_id` | text | Yes | Detection identifier |  |
| `bias_type` | select | Yes | loss_aversion \| overconfidence \| self_control \| status_quo \| endowment \| regret_aversion |  |

## Rules

- **loss_aversion:**
  - **pattern:** Losses feel ~2x worse than equivalent gains
  - **consequence:** Hold losers too long, sell winners too early
- **overconfidence:**
  - **pattern:** Overestimate ability, precision of forecasts
  - **consequence:** Excessive trading, under-diversification
- **self_control:**
  - **pattern:** Prefer immediate reward over future benefit
  - **consequence:** Under-save, raid long-term pots
- **status_quo:**
  - **pattern:** Prefer keeping current allocation
  - **consequence:** Portfolio drift; fail to rebalance
- **endowment:**
  - **pattern:** Value holdings more than equivalent non-holdings
  - **consequence:** Over-concentration in inherited or granted stock
- **regret_aversion:**
  - **pattern:** Fear of errors of commission exceeds errors of omission
  - **consequence:** Avoid necessary trades; herd-follow
- **investment_implications:**
  - **construction:** Advise using pre-commitment, buckets, automatic rebalancing
  - **monitoring:** Benchmark and independent review to counter overconfidence
- **mitigation:**
  - **rule:** Automated rules, mandatory rebalancing bands, structured decision logs, client education
- **validation:**
  - **detection_required:** detection_id present
  - **valid_bias:** bias_type in allowed set

## Outcomes

### Detect_emo_bias (Priority: 1)

_Detect emotional bias_

**Given:**
- `detection_id` (input) exists
- `bias_type` (input) in `loss_aversion,overconfidence,self_control,status_quo,endowment,regret_aversion`

**Then:**
- **call_service** target: `emo_bias_detector`
- **emit_event** event: `emotional_bias.detected`

### Invalid_bias (Priority: 10) — Error: `EMO_BIAS_INVALID`

_Unsupported bias type_

**Given:**
- `bias_type` (input) not_in `loss_aversion,overconfidence,self_control,status_quo,endowment,regret_aversion`

**Then:**
- **emit_event** event: `emotional_bias.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EMO_BIAS_INVALID` | 400 | bias_type must be a supported emotional bias | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `emotional_bias.detected` |  | `detection_id`, `bias_type`, `risk_impact`, `mitigation_suggested` |
| `emotional_bias.rejected` |  | `detection_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| behavioral-biases-cognitive | required |  |
| behavioral-finance-market-anomalies | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Behavioral Biases Emotional Blueprint",
  "description": "Identify emotional biases (loss aversion, overconfidence, self-control, status quo, endowment, regret aversion) and describe their effect on portfolio construct",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "behavioral-finance, emotional-bias, loss-aversion, overconfidence, endowment-bias, cfa-level-1"
}
</script>
