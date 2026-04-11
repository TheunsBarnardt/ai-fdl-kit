<!-- AUTO-GENERATED FROM wizard-stepper.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Wizard Stepper

> Multi-step form and process wizard with progress indicator, step validation, skip optional steps, save progress, and resume later

**Category:** Ui · **Version:** 1.0.0 · **Tags:** wizard · stepper · multi-step · progress · form-wizard · onboarding · workflow

## What this does

Multi-step form and process wizard with progress indicator, step validation, skip optional steps, save progress, and resume later

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **steps** *(json, required)* — Step Definitions
- **current_step** *(number, required)* — Current Step Index
- **progress_percent** *(number, optional)* — Progress Percentage
- **can_skip** *(boolean, optional)* — Allow Skipping Optional Steps
- **data** *(json, optional)* — Accumulated Step Data
- **navigation_mode** *(select, optional)* — Navigation Mode
- **save_state_id** *(text, optional)* — Saved State Identifier

## What must be true

- **navigation → validate_before_advance:** true
- **navigation → back_always_available:** true
- **navigation → keyboard_navigation:** true
- **step_management → max_steps:** 20
- **step_management → optional_steps_skippable:** true
- **step_management → non_linear_requires_completion:** true
- **persistence → auto_save:** true
- **persistence → storage:** localStorage
- **persistence → resume_session:** true
- **unsaved_changes → warn_on_navigation:** true
- **unsaved_changes → warn_on_browser_back:** true
- **progress → calculation:** completed_steps / total_steps * 100
- **progress → include_optional:** true

## Success & failure scenarios

**✅ Success paths**

- **Step Advanced** — when current step validation passes; there is a next step available, then Next step content renders, progress indicator updates.
- **Step Back** — when current step is not the first step, then Previous step content renders with previously entered data preserved.
- **Step Skipped** — when current step is marked as optional; can_skip is enabled, then Optional step bypassed, next step renders.
- **Wizard Completed** — when user is on the last step; last step validation passes; all required steps are completed, then Wizard complete, accumulated data submitted, completion screen shown.
- **Wizard Abandoned** — when user navigates away from wizard before completion; at least one step has been started, then Progress saved, user can resume later.
- **Wizard Resumed** — when user returns to a wizard with saved progress; save_state_id exists and contains valid data, then Wizard resumes at the last saved step with all data intact.

**❌ Failure paths**

- **Step Validation Failed** — when user attempts to advance to next step; current step validation fails, then Validation errors displayed on current step, navigation blocked. *(error: `WIZARD_STEP_VALIDATION_FAILED`)*

## Errors it can return

- `WIZARD_STEP_VALIDATION_FAILED` — Please complete the required fields before proceeding
- `WIZARD_STEP_NOT_FOUND` — The requested step does not exist
- `WIZARD_SAVE_FAILED` — Failed to save wizard progress. Please try again.
- `WIZARD_RESUME_EXPIRED` — Your saved progress has expired. Please start again.

## Connects to

- **form-builder** *(recommended)* — Each wizard step typically contains a form built with the form builder
- **accessibility** *(recommended)* — Stepper must be keyboard navigable with proper ARIA roles
- **toast-notifications** *(optional)* — Progress save confirmations and validation errors can use toast notifications
- **internationalization** *(optional)* — Step titles, validation messages, and button labels may need translation

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/wizard-stepper/) · **Spec source:** [`wizard-stepper.blueprint.yaml`](./wizard-stepper.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
