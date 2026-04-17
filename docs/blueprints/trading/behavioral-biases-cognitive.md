---
title: "Behavioral Biases Cognitive Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Identify cognitive behavioral biases (conservatism, confirmation, representativeness, illusion of control, hindsight, framing, anchoring, availability) and thei"
---

# Behavioral Biases Cognitive Blueprint

> Identify cognitive behavioral biases (conservatism, confirmation, representativeness, illusion of control, hindsight, framing, anchoring, availability) and their impact on investment decisions

| | |
|---|---|
| **Feature** | `behavioral-biases-cognitive` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | behavioral-finance, cognitive-bias, belief-perseverance, processing-errors, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/behavioral-biases-cognitive.blueprint.yaml) |
| **JSON API** | [behavioral-biases-cognitive.json]({{ site.baseurl }}/api/blueprints/trading/behavioral-biases-cognitive.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `bias_detector` | Cognitive Bias Detector | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `detection_id` | text | Yes | Detection identifier |  |
| `bias_type` | select | Yes | conservatism \| confirmation \| representativeness \| illusion_of_control \| hindsight \| framing \| anchoring \| availability |  |

## Rules

- **belief_perseverance:**
  - **conservatism:** Under-react to new information; retain priors
  - **confirmation:** Seek evidence confirming existing view
  - **representativeness:** Judge by similarity rather than base rates
  - **illusion_of_control:** Overestimate personal influence on outcomes
  - **hindsight:** Re-remember past as more predictable than it was
- **processing_errors:**
  - **anchoring:** Fixate on initial value; insufficient adjustment
  - **mental_accounting:** Treat money differently by source/purpose
  - **framing:** Decisions change with presentation of equivalent information
  - **availability:** Weight easily recalled information over statistical evidence
- **investment_consequences:**
  - **delayed_response:** Conservatism leads to slow revision after earnings
  - **overconcentration:** Confirmation and representativeness amplify single-stock bets
  - **false_confidence:** Illusion of control justifies active trading with no edge
- **mitigation:**
  - **rule:** Structured processes, base-rate emphasis, red-team reviews, written decision journals
- **validation:**
  - **detection_required:** detection_id present
  - **valid_bias:** bias_type in allowed set

## Outcomes

### Detect_bias (Priority: 1)

_Detect cognitive bias in investment decision_

**Given:**
- `detection_id` (input) exists
- `bias_type` (input) in `conservatism,confirmation,representativeness,illusion_of_control,hindsight,framing,anchoring,availability`

**Then:**
- **call_service** target: `bias_detector`
- **emit_event** event: `bias.detected`

### Invalid_bias (Priority: 10) — Error: `BIAS_INVALID_TYPE`

_Unsupported bias type_

**Given:**
- `bias_type` (input) not_in `conservatism,confirmation,representativeness,illusion_of_control,hindsight,framing,anchoring,availability`

**Then:**
- **emit_event** event: `bias.detection_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BIAS_INVALID_TYPE` | 400 | bias_type must be a supported cognitive bias category | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bias.detected` |  | `detection_id`, `bias_type`, `category`, `mitigation_suggested` |
| `bias.detection_rejected` |  | `detection_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| behavioral-biases-emotional | required |  |
| behavioral-finance-market-anomalies | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Behavioral Biases Cognitive Blueprint",
  "description": "Identify cognitive behavioral biases (conservatism, confirmation, representativeness, illusion of control, hindsight, framing, anchoring, availability) and thei",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "behavioral-finance, cognitive-bias, belief-perseverance, processing-errors, cfa-level-1"
}
</script>
