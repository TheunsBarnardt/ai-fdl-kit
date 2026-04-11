<!-- AUTO-GENERATED FROM accessibility.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Accessibility

> WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion preferences.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** accessibility · wcag · aria · keyboard-navigation · screen-reader · focus-management

## What this does

WCAG 2.1 AA compliance with keyboard navigation, focus management, ARIA attributes, skip links, screen reader support, contrast enforcement, and reduced motion preferences.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **component_id** *(text, required)* — Component ID
- **role** *(select, optional)* — ARIA Role
- **aria_label** *(text, optional)* — ARIA Label
- **aria_describedby** *(text, optional)* — Described By Element ID
- **aria_live** *(select, optional)* — Live Region Politeness
- **tab_index** *(number, optional)* — Tab Index
- **alt_text** *(text, optional)* — Alternative Text
- **contrast_ratio** *(number, optional)* — Contrast Ratio
- **focus_trap_enabled** *(boolean, optional)* — Focus Trap Enabled
- **reduced_motion** *(boolean, optional)* — Respect Reduced Motion
- **skip_link_target** *(text, optional)* — Skip Link Target ID

## What must be true

- **interactive_elements_keyboard_accessible:** All interactive elements (buttons, links, form controls, custom widgets) must be operable via keyboard alone. Elements must be reachable via Tab and activatable via Enter or Space as appropriate for their role.
- **images_require_alt_text:** All img elements and image-role elements must have meaningful alt text. Decorative images must use alt="" or role="presentation" to be hidden from assistive technology.
- **form_inputs_require_labels:** Every form input must have a visible label element associated via the for/id attribute pair, or an aria-label/aria-labelledby attribute. Placeholder text alone is not sufficient as a label.
- **modals_trap_focus:** When a modal dialog is open, keyboard focus must be trapped within the dialog. Tab and Shift+Tab cycle through focusable elements inside the modal. Focus returns to the triggering element when the modal closes.
- **error_messages_linked_via_aria:** Form validation error messages must be programmatically associated with their input via aria-describedby. Error messages must also be announced to screen readers using aria-live="polite" or role="alert".
- **color_contrast_minimum:** Normal text must have a contrast ratio of at least 4.5:1 against its background. Large text (18pt or 14pt bold) requires at least 3:1. UI components and graphical objects require at least 3:1.
- **respect_reduced_motion:** When the user has prefers-reduced-motion: reduce set, all non-essential animations and transitions must be disabled or reduced to simple opacity fades under 200ms.
- **skip_navigation_link:** Pages must provide a skip link as the first focusable element that jumps to the main content area, bypassing repetitive navigation blocks.
- **live_regions_for_dynamic_content:** Dynamic content updates (loading states, success/error messages, counters) must use aria-live regions so screen readers announce changes without requiring the user to navigate to the updated area.
- **focus_visible_indicator:** All focusable elements must have a visible focus indicator that meets WCAG 2.1 focus-visible requirements. The focus ring must have at least 3:1 contrast against adjacent colors.

## Success & failure scenarios

**✅ Success paths**

- **Keyboard Navigation Works** — when a page contains interactive elements (buttons, links, form controls); user navigates using only keyboard (Tab, Shift+Tab, Enter, Space, Escape), then All interactive elements are reachable and operable via keyboard alone.
- **Screen Reader Announces Updates** — when dynamic content on the page changes (loading, success, error); aria_live in ["polite","assertive"], then Screen reader announces the content change without user navigation.
- **Form Error Announced** — when a form field fails validation; an error message element exists for the field, then Validation error is programmatically linked to input and announced by screen reader.
- **Reduced Motion Respected** — when user has prefers-reduced-motion: reduce enabled; reduced_motion eq true, then Animations suppressed for users who prefer reduced motion.

**❌ Failure paths**

- **Skip Link Bypasses Navigation** — when a page has repetitive navigation blocks; skip link is the first focusable element; user activates the skip link, then User can skip repetitive navigation and jump directly to main content. *(error: `A11Y_SKIP_LINK_MISSING`)*
- **Modal Focus Trapped** — when a modal dialog is opened; focus_trap_enabled eq true, then Focus is trapped within the modal until it is dismissed. *(error: `A11Y_FOCUS_TRAP_FAILED`)*
- **Contrast Ratio Enforced** — when text or UI component is rendered; contrast_ratio lt 4.5, then Element flagged as failing WCAG AA contrast requirements. *(error: `A11Y_CONTRAST_INSUFFICIENT`)*
- **Image Missing Alt Text** — when an image element is rendered; alt_text not_exists, then Image flagged as missing alternative text for assistive technology. *(error: `A11Y_MISSING_ALT_TEXT`)*

## Errors it can return

- `A11Y_CONTRAST_INSUFFICIENT` — Color contrast ratio does not meet WCAG 2.1 AA minimum of 4.5:1 for normal text.
- `A11Y_MISSING_ALT_TEXT` — Image element is missing alternative text required for screen reader access.
- `A11Y_MISSING_LABEL` — Form input is missing an associated label element or aria-label attribute.
- `A11Y_FOCUS_TRAP_FAILED` — Modal dialog failed to trap focus within its boundaries.
- `A11Y_SKIP_LINK_MISSING` — Page is missing a skip navigation link as the first focusable element.

## Connects to

- **form-builder** *(recommended)* — Form builder should enforce accessible labels, error linking, and keyboard operation
- **theme-configuration** *(recommended)* — Theme system must enforce color contrast ratios for all color combinations
- **responsive-layout** *(optional)* — Responsive layouts should maintain focus order and landmark structure across breakpoints
- **dark-mode** *(optional)* — Dark mode theme must independently meet WCAG contrast requirements

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/accessibility/) · **Spec source:** [`accessibility.blueprint.yaml`](./accessibility.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
