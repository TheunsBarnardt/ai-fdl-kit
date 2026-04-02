---
title: "Form Builder Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Dynamic form creation and rendering with drag-and-drop field placement, conditional visibility, multi-step forms, validation rules, and versioning. 8 fields. 8 "
---

# Form Builder Blueprint

> Dynamic form creation and rendering with drag-and-drop field placement, conditional visibility, multi-step forms, validation rules, and versioning

| | |
|---|---|
| **Feature** | `form-builder` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | forms, builder, drag-and-drop, validation, dynamic-forms, multi-step, conditional-logic |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/form-builder.blueprint.yaml) |
| **JSON API** | [form-builder.json]({{ site.baseurl }}/api/blueprints/ui/form-builder.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `form_id` | text | Yes | Form ID | Validations: required |
| `name` | text | Yes | Form Name | Validations: required, maxLength |
| `form_fields` | json | Yes | Form Fields | Validations: required |
| `layout` | json | No | Form Layout |  |
| `version` | number | Yes | Form Version | Validations: required |
| `status` | select | Yes | Form Status | Validations: required |
| `steps` | json | No | Multi-Step Configuration |  |
| `submission_config` | json | No | Submission Configuration |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `published` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `published` | form_author | Form has at least one field and passes validation |
|  | `published` | `draft` | form_author | Author reverts to draft for editing |

## Rules

- **field_types:**
  - **registry:** text, email, password, number, boolean, date, datetime, phone, url, file, select, multiselect, hidden, rich_text, textarea
- **validation_expressions:**
  - **supported_rules:** required, minLength, maxLength, min, max, pattern, email, url, custom
- **conditional_logic:**
  - **supported_operators:** eq, neq, gt, gte, lt, lte, in, not_in, exists, not_exists
  - **evaluation_order:** top-to-bottom
  - **max_conditions_per_field:** 10
- **limits:**
  - **max_fields_per_form:** 100
  - **max_steps:** 20
  - **max_nested_groups:** 3
- **versioning:**
  - **auto_increment:** true
  - **preserve_submissions:** true

## Outcomes

### Form_created (Priority: 1)

**Given:**
- user provides a form name
- form name is unique within the account

**Then:**
- **create_record** target: `form` — Create new form in draft status with version 1
- **emit_event** event: `form.created`

**Result:** New form exists in draft status, ready for field configuration

### Field_added (Priority: 2)

**Given:**
- form is in draft status
- field count is below 100
- field type is in the supported registry

**Then:**
- **set_field** target: `form_fields` — Append new field definition to form fields array
- **emit_event** event: `form.field_added`

**Result:** Field appears in the form builder canvas at the specified position

### Field_removed (Priority: 3)

**Given:**
- form is in draft status
- field exists in the form

**Then:**
- **set_field** target: `form_fields` — Remove field and any conditions referencing it
- **emit_event** event: `form.field_removed`

**Result:** Field removed from form, dependent conditions cleaned up

### Conditional_visibility_applied (Priority: 4)

**Given:**
- a condition is defined on a field
- the referenced source field exists in the form
- the operator is valid for the source field type

**Then:**
- **set_field** target: `form_fields` — Update field visibility condition

**Result:** Field shows or hides dynamically based on the condition at render time

### Form_published (Priority: 5)

**Given:**
- form is in draft status
- form has at least one field
- all field validations are properly configured
- all conditional references point to existing fields

**Then:**
- **transition_state** field: `status` from: `draft` to: `published`
- **set_field** target: `version` — Increment version number
- **emit_event** event: `form.published`

**Result:** Form is live and available for submissions

### Form_submitted (Priority: 6)

**Given:**
- form is in published status
- all required fields have values
- all field validations pass

**Then:**
- **create_record** target: `submission` — Store submission data with reference to form version
- **emit_event** event: `form.submitted`

**Result:** Submission recorded and confirmation shown to the user

### Form_submission_invalid (Priority: 7) — Error: `FORM_VALIDATION_FAILED`

**Given:**
- form is in published status
- ANY: one or more required fields are empty OR one or more field validations fail

**Then:**
- **emit_event** event: `form.submission_failed`

**Result:** Validation errors displayed inline next to the relevant fields

### Max_fields_exceeded (Priority: 8) — Error: `FORM_MAX_FIELDS_EXCEEDED`

**Given:**
- `form_fields` (computed) gte `100`

**Then:**
- **emit_event** event: `form.limit_reached`

**Result:** User informed that the maximum field limit has been reached

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FORM_VALIDATION_FAILED` | 422 | Please fix the highlighted errors before submitting | Yes |
| `FORM_MAX_FIELDS_EXCEEDED` | 400 | Maximum of 100 fields per form has been reached | No |
| `FORM_NOT_FOUND` | 404 | The requested form does not exist | No |
| `FORM_NOT_PUBLISHED` | 400 | This form is not currently accepting submissions | No |
| `FORM_FIELD_TYPE_INVALID` | 400 | The specified field type is not supported | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `form.created` | A new form was created in draft status | `form_id`, `name`, `created_by`, `timestamp` |
| `form.published` | A form was published and is now accepting submissions | `form_id`, `version`, `published_by`, `timestamp` |
| `form.submitted` | A form submission was received and stored | `form_id`, `submission_id`, `version`, `timestamp` |
| `form.field_added` | A field was added to a form | `form_id`, `field_name`, `field_type` |
| `form.field_removed` | A field was removed from a form | `form_id`, `field_name` |
| `form.submission_failed` | A form submission failed validation | `form_id`, `errors` |
| `form.limit_reached` | A form reached its maximum field count | `form_id`, `field_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| drag-drop-editor | recommended | Drag-and-drop provides intuitive field placement in the form builder |
| wizard-stepper | optional | Multi-step forms use the wizard/stepper pattern for step navigation |
| accessibility | recommended | Form fields must meet WCAG 2.1 AA accessibility requirements |
| internationalization | optional | Form labels and validation messages may need translation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Form Builder Blueprint",
  "description": "Dynamic form creation and rendering with drag-and-drop field placement, conditional visibility, multi-step forms, validation rules, and versioning. 8 fields. 8 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "forms, builder, drag-and-drop, validation, dynamic-forms, multi-step, conditional-logic"
}
</script>
