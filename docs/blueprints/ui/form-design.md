---
title: "Form Design Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Design forms that are easy to scan and complete by organizing fields clearly, providing immediate feedback, handling errors gracefully, and minimizing cognitive"
---

# Form Design Blueprint

> Design forms that are easy to scan and complete by organizing fields clearly, providing immediate feedback, handling errors gracefully, and minimizing cognitive load through smart defaults.


| | |
|---|---|
| **Feature** | `form-design` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, interaction-design, user-experience |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/form-design.blueprint.yaml) |
| **JSON API** | [form-design.json]({{ site.baseurl }}/api/blueprints/ui/form-design.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `field_count` | number | No | Number of input fields in form |  |
| `required_fields` | number | No | How many fields are required vs optional |  |
| `error_handling_strategy` | text | No | Real-time validation, on-blur, or on-submit |  |
| `success_feedback` | text | No | How success is communicated (message, redirect, animation) |  |
| `conditional_fields` | text | No | Fields that show/hide based on user input |  |

## Rules

- **group_related_fields_logically:** Group related fields logically — use spacing and optional section headers to communicate field relationships
- **labels_are_crucial_signals:** Labels are crucial signals — descriptive labels above or beside inputs (avoid placeholders as labels)
- **provide_immediate_feedback:** Provide immediate feedback — validation feedback (errors, success, warnings) appears without additional steps
- **smart_defaults_reduce_effort:** Smart defaults reduce effort — pre-fill when possible; use sensible defaults for optional fields
- **error_messages_are_user_safe:** Error messages are user-safe — explain what went wrong and how to fix it, never expose system details
- **dont_over_design_for_edge_cases:** Don't over-design for edge cases — handle common paths smoothly; edge cases can be addressed with help text

## Outcomes

### Form_presented_to_user (Priority: 1)

**Given:**
- form is presented to user

**Then:**
- **set_field** target: `field_grouping` value: `logically related fields grouped with spacing`
- **set_field** target: `label_placement` value: `above input (mobile) or beside (desktop)`
- **set_field** target: `required_indicator` value: `clear visual marker (asterisk, color, or text)`

**Result:** form is scannable and user understands what's required

### User_enters_invalid_data (Priority: 2)

**Given:**
- user enters invalid data in field

**Then:**
- **set_field** target: `error_message` value: `appears immediately (on blur or submit)`
- **set_field** target: `message_tone` value: `helpful, not critical`
- **set_field** target: `message_content` value: `states problem and solution`
- **set_field** target: `visual_indicator` value: `red border, icon, or background`

**Result:** user understands error and knows how to fix it

### Form_submission_successful (Priority: 3)

**Given:**
- form submission is successful

**Then:**
- **emit_event** event: `form.submission.success`
- **set_field** target: `feedback` value: `clear success state (message, icon, animation)`

**Result:** user confident that action completed

### Form_has_optional_conditional_fields (Priority: 4)

**Given:**
- form has optional or conditional fields

**Then:**
- **set_field** target: `disclosure_strategy` value: `progressive disclosure or clear grouping`
- **set_field** target: `conditional_logic` value: `show/hide based on user input`

**Result:** form doesn't overwhelm with unnecessary fields

### Form_is_long (Priority: 5)

**Given:**
- form is long (>5 fields)

**Then:**
- **set_field** target: `organization` value: `multi-step or grouped sections with visual breaks`
- **set_field** target: `progress_indicator` value: `step count or progress bar if multi-step`

**Result:** long form feels manageable and completion is visible

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| form-validation | required | Forms require robust validation rules and error handling |
| accessibility | required | Forms must be keyboard-navigable with proper label/input associations |
| visual-hierarchy | recommended | Form hierarchy guides user through logical field progression |
| error-handling | recommended | Error states integrate with broader error handling system |

## AGI Readiness

### Goals

#### Reliable Form Design

Design forms that are easy to scan and complete by organizing fields clearly, providing immediate feedback, handling errors gracefully, and minimizing cognitive load through smart defaults.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `form_validation` | form-validation | degrade |
| `accessibility` | accessibility | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| form_presented_to_user | `autonomous` | - | - |
| user_enters_invalid_data | `autonomous` | - | - |
| form_submission_successful | `autonomous` | - | - |
| form_has_optional_conditional_fields | `autonomous` | - | - |
| form_is_long | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Form Design Blueprint",
  "description": "Design forms that are easy to scan and complete by organizing fields clearly, providing immediate feedback, handling errors gracefully, and minimizing cognitive",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, interaction-design, user-experience"
}
</script>
