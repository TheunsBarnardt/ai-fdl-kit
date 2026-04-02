---
title: "Wizard Stepper Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Multi-step form and process wizard with progress indicator, step validation, skip optional steps, save progress, and resume later. 7 fields. 7 outcomes. 4 error"
---

# Wizard Stepper Blueprint

> Multi-step form and process wizard with progress indicator, step validation, skip optional steps, save progress, and resume later

| | |
|---|---|
| **Feature** | `wizard-stepper` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | wizard, stepper, multi-step, progress, form-wizard, onboarding, workflow |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/wizard-stepper.blueprint.yaml) |
| **JSON API** | [wizard-stepper.json]({{ site.baseurl }}/api/blueprints/ui/wizard-stepper.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `steps` | json | Yes | Step Definitions | Validations: required |
| `current_step` | number | Yes | Current Step Index | Validations: required, min |
| `progress_percent` | number | No | Progress Percentage | Validations: min, max |
| `can_skip` | boolean | No | Allow Skipping Optional Steps |  |
| `data` | json | No | Accumulated Step Data |  |
| `navigation_mode` | select | No | Navigation Mode |  |
| `save_state_id` | text | No | Saved State Identifier |  |

## Rules

- **navigation:**
  - **validate_before_advance:** true
  - **back_always_available:** true
  - **keyboard_navigation:** true
- **step_management:**
  - **max_steps:** 20
  - **optional_steps_skippable:** true
  - **non_linear_requires_completion:** true
- **persistence:**
  - **auto_save:** true
  - **storage:** localStorage
  - **resume_session:** true
- **unsaved_changes:**
  - **warn_on_navigation:** true
  - **warn_on_browser_back:** true
- **progress:**
  - **calculation:** completed_steps / total_steps * 100
  - **include_optional:** true

## Outcomes

### Step_advanced (Priority: 1)

**Given:**
- current step validation passes
- there is a next step available

**Then:**
- **set_field** target: `current_step` — Increment current step index
- **set_field** target: `data` — Merge current step data into accumulated data
- **set_field** target: `progress_percent` — Recalculate progress percentage
- **emit_event** event: `wizard.step_changed`

**Result:** Next step content renders, progress indicator updates

### Step_back (Priority: 2)

**Given:**
- current step is not the first step

**Then:**
- **set_field** target: `current_step` — Decrement current step index
- **emit_event** event: `wizard.step_changed`

**Result:** Previous step content renders with previously entered data preserved

### Step_skipped (Priority: 3)

**Given:**
- current step is marked as optional
- can_skip is enabled

**Then:**
- **set_field** target: `current_step` — Skip to next step without validation
- **set_field** target: `progress_percent` — Recalculate progress percentage
- **emit_event** event: `wizard.step_changed`

**Result:** Optional step bypassed, next step renders

### Step_validation_failed (Priority: 4) — Error: `WIZARD_STEP_VALIDATION_FAILED`

**Given:**
- user attempts to advance to next step
- current step validation fails

**Then:**
- **emit_event** event: `wizard.validation_failed`

**Result:** Validation errors displayed on current step, navigation blocked

### Wizard_completed (Priority: 5)

**Given:**
- user is on the last step
- last step validation passes
- all required steps are completed

**Then:**
- **emit_event** event: `wizard.completed`
- **call_service** target: `submission_handler` — Submit all accumulated wizard data

**Result:** Wizard complete, accumulated data submitted, completion screen shown

### Wizard_abandoned (Priority: 6)

**Given:**
- user navigates away from wizard before completion
- at least one step has been started

**Then:**
- **set_field** target: `save_state_id` — Save current progress for later resumption
- **emit_event** event: `wizard.abandoned`

**Result:** Progress saved, user can resume later

### Wizard_resumed (Priority: 7)

**Given:**
- user returns to a wizard with saved progress
- save_state_id exists and contains valid data

**Then:**
- **set_field** target: `current_step` — Restore saved step position
- **set_field** target: `data` — Restore accumulated data from saved state
- **set_field** target: `progress_percent` — Restore progress percentage
- **emit_event** event: `wizard.step_changed`

**Result:** Wizard resumes at the last saved step with all data intact

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WIZARD_STEP_VALIDATION_FAILED` | 422 | Please complete the required fields before proceeding | Yes |
| `WIZARD_STEP_NOT_FOUND` | 404 | The requested step does not exist | No |
| `WIZARD_SAVE_FAILED` | 500 | Failed to save wizard progress. Please try again. | Yes |
| `WIZARD_RESUME_EXPIRED` | 410 | Your saved progress has expired. Please start again. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `wizard.step_changed` | User navigated to a different step (forward, back, skip, or resume) | `step_id`, `step_index`, `direction`, `progress_percent` |
| `wizard.completed` | All required steps completed and wizard submitted | `data`, `total_steps`, `completed_steps`, `duration` |
| `wizard.abandoned` | User left the wizard before completion | `step_id`, `step_index`, `progress_percent`, `data` |
| `wizard.validation_failed` | Step validation failed when user attempted to advance | `step_id`, `step_index`, `errors` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| form-builder | recommended | Each wizard step typically contains a form built with the form builder |
| accessibility | recommended | Stepper must be keyboard navigable with proper ARIA roles |
| toast-notifications | optional | Progress save confirmations and validation errors can use toast notifications |
| internationalization | optional | Step titles, validation messages, and button labels may need translation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Wizard Stepper Blueprint",
  "description": "Multi-step form and process wizard with progress indicator, step validation, skip optional steps, save progress, and resume later. 7 fields. 7 outcomes. 4 error",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "wizard, stepper, multi-step, progress, form-wizard, onboarding, workflow"
}
</script>
