---
title: "Accessibility Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion "
---

# Accessibility Blueprint

> WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion preferences.


| | |
|---|---|
| **Feature** | `accessibility` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | accessibility, wcag, aria, keyboard-navigation, screen-reader, focus-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/accessibility.blueprint.yaml) |
| **JSON API** | [accessibility.json]({{ site.baseurl }}/api/blueprints/ui/accessibility.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `component_id` | text | Yes | Component ID | Validations: minLength |
| `role` | select | No | ARIA Role |  |
| `aria_label` | text | No | ARIA Label |  |
| `aria_describedby` | text | No | Described By Element ID |  |
| `aria_live` | select | No | Live Region Politeness |  |
| `tab_index` | number | No | Tab Index |  |
| `alt_text` | text | No | Alternative Text |  |
| `contrast_ratio` | number | No | Contrast Ratio | Validations: min |
| `focus_trap_enabled` | boolean | No | Focus Trap Enabled |  |
| `reduced_motion` | boolean | No | Respect Reduced Motion |  |
| `skip_link_target` | text | No | Skip Link Target ID |  |

## Rules

- **interactive_elements_keyboard_accessible:**
  - **description:** All interactive elements (buttons, links, form controls, custom widgets) must be operable via keyboard alone. Elements must be reachable via Tab and activatable via Enter or Space as appropriate for their role.

- **images_require_alt_text:**
  - **description:** All img elements and image-role elements must have meaningful alt text. Decorative images must use alt="" or role="presentation" to be hidden from assistive technology.

- **form_inputs_require_labels:**
  - **description:** Every form input must have a visible label element associated via the for/id attribute pair, or an aria-label/aria-labelledby attribute. Placeholder text alone is not sufficient as a label.

- **modals_trap_focus:**
  - **description:** When a modal dialog is open, keyboard focus must be trapped within the dialog. Tab and Shift+Tab cycle through focusable elements inside the modal. Focus returns to the triggering element when the modal closes.

- **error_messages_linked_via_aria:**
  - **description:** Form validation error messages must be programmatically associated with their input via aria-describedby. Error messages must also be announced to screen readers using aria-live="polite" or role="alert".

- **color_contrast_minimum:**
  - **description:** Normal text must have a contrast ratio of at least 4.5:1 against its background. Large text (18pt or 14pt bold) requires at least 3:1. UI components and graphical objects require at least 3:1.

- **respect_reduced_motion:**
  - **description:** When the user has prefers-reduced-motion: reduce set, all non-essential animations and transitions must be disabled or reduced to simple opacity fades under 200ms.

- **skip_navigation_link:**
  - **description:** Pages must provide a skip link as the first focusable element that jumps to the main content area, bypassing repetitive navigation blocks.

- **live_regions_for_dynamic_content:**
  - **description:** Dynamic content updates (loading states, success/error messages, counters) must use aria-live regions so screen readers announce changes without requiring the user to navigate to the updated area.

- **focus_visible_indicator:**
  - **description:** All focusable elements must have a visible focus indicator that meets WCAG 2.1 focus-visible requirements. The focus ring must have at least 3:1 contrast against adjacent colors.


## Outcomes

### Keyboard_navigation_works (Priority: 1)

**Given:**
- a page contains interactive elements (buttons, links, form controls)
- user navigates using only keyboard (Tab, Shift+Tab, Enter, Space, Escape)

**Then:**
- **set_field** target: `tab_index` — All interactive elements included in logical tab order

**Result:** All interactive elements are reachable and operable via keyboard alone

### Skip_link_bypasses_navigation (Priority: 2)

**Given:**
- a page has repetitive navigation blocks
- skip link is the first focusable element
- user activates the skip link

**Then:**
- **set_field** target: `skip_link_target` — Focus moves to main content area bypassing navigation

**Result:** User can skip repetitive navigation and jump directly to main content

### Modal_focus_trapped (Priority: 3)

**Given:**
- a modal dialog is opened
- `focus_trap_enabled` (input) eq `true`

**Then:**
- **set_field** target: `focus_trap_enabled` value: `true` — Focus confined to modal, Tab/Shift+Tab cycle within dialog
- **emit_event** event: `accessibility.focus.trapped`

**Result:** Focus is trapped within the modal until it is dismissed

### Screen_reader_announces_updates (Priority: 4)

**Given:**
- dynamic content on the page changes (loading, success, error)
- `aria_live` (input) in `polite,assertive`

**Then:**
- **emit_event** event: `accessibility.live_region.updated`

**Result:** Screen reader announces the content change without user navigation

### Form_error_announced (Priority: 5)

**Given:**
- a form field fails validation
- an error message element exists for the field

**Then:**
- **set_field** target: `aria_describedby` — Error message ID linked to input via aria-describedby
- **emit_event** event: `accessibility.error.announced`

**Result:** Validation error is programmatically linked to input and announced by screen reader

### Contrast_ratio_enforced (Priority: 6) — Error: `A11Y_CONTRAST_INSUFFICIENT`

**Given:**
- text or UI component is rendered
- `contrast_ratio` (computed) lt `4.5`

**Result:** Element flagged as failing WCAG AA contrast requirements

### Reduced_motion_respected (Priority: 7)

**Given:**
- user has prefers-reduced-motion: reduce enabled
- `reduced_motion` (system) eq `true`

**Then:**
- **set_field** target: `reduced_motion` value: `true` — Non-essential animations disabled or reduced to opacity fades under 200ms

**Result:** Animations suppressed for users who prefer reduced motion

### Image_missing_alt_text (Priority: 8) — Error: `A11Y_MISSING_ALT_TEXT`

**Given:**
- an image element is rendered
- `alt_text` (input) not_exists

**Result:** Image flagged as missing alternative text for assistive technology

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `A11Y_CONTRAST_INSUFFICIENT` | 400 | Color contrast ratio does not meet WCAG 2.1 AA minimum of 4.5:1 for normal text. | No |
| `A11Y_MISSING_ALT_TEXT` | 400 | Image element is missing alternative text required for screen reader access. | No |
| `A11Y_MISSING_LABEL` | 400 | Form input is missing an associated label element or aria-label attribute. | No |
| `A11Y_FOCUS_TRAP_FAILED` | 500 | Modal dialog failed to trap focus within its boundaries. | No |
| `A11Y_SKIP_LINK_MISSING` | 400 | Page is missing a skip navigation link as the first focusable element. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `accessibility.focus.trapped` | Focus was successfully trapped within a modal dialog | `component_id`, `role` |
| `accessibility.live_region.updated` | A live region announced dynamic content to assistive technology | `component_id`, `aria_live`, `content` |
| `accessibility.error.announced` | A validation error was linked to its input and announced | `component_id`, `error_message` |
| `accessibility.audit.completed` | Automated accessibility audit completed on a page or component | `page_url`, `violations_count`, `warnings_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| form-builder | recommended | Form builder should enforce accessible labels, error linking, and keyboard operation |
| theme-configuration | recommended | Theme system must enforce color contrast ratios for all color combinations |
| responsive-layout | optional | Responsive layouts should maintain focus order and landmark structure across breakpoints |
| dark-mode | optional | Dark mode theme must independently meet WCAG contrast requirements |

## AGI Readiness

### Goals

#### Reliable Accessibility

WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion preferences.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| keyboard_navigation_works | `autonomous` | - | - |
| skip_link_bypasses_navigation | `autonomous` | - | - |
| modal_focus_trapped | `autonomous` | - | - |
| screen_reader_announces_updates | `supervised` | - | - |
| form_error_announced | `autonomous` | - | - |
| contrast_ratio_enforced | `autonomous` | - | - |
| reduced_motion_respected | `autonomous` | - | - |
| image_missing_alt_text | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Accessibility Blueprint",
  "description": "WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "accessibility, wcag, aria, keyboard-navigation, screen-reader, focus-management"
}
</script>
