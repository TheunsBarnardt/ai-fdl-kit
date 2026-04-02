---
title: "Accessible Component Library Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Accessible, composable UI component library built on accessible component primitives with variant system, Tailwind CSS styling, and a multi-style design system."
---

# Accessible Component Library Blueprint

> Accessible, composable UI component library built on accessible component primitives with variant system, Tailwind CSS styling, and a multi-style design system

| | |
|---|---|
| **Feature** | `accessible-component-library` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | components, design-system, accessible-primitives, tailwind, accessibility, react |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/shadcn-components.blueprint.yaml) |
| **JSON API** | [accessible-component-library.json]({{ site.baseurl }}/api/blueprints/ui/accessible-component-library.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Consumes components in their application |
| `end_user` | End User | human | Interacts with the rendered UI components |
| `design_system` | Design System | system | CSS custom properties, style presets, and theme configuration |
| `accessible_primitives` | Accessible Component Primitives | external | Unstyled, accessible component primitives providing ARIA compliance |
| `alternative_primitives` | Alternative Accessible Primitives | external | Alternative unstyled component primitives |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `primitive_library` | select | Yes | Primitive Library |  |
| `style` | select | Yes | Design Style |  |
| `icon_library` | select | No | Icon Library |  |
| `border_radius` | number | No | Border Radius |  |
| `font_family` | text | No | Font Family |  |
| `variant` | text | No | Component Variant |  |
| `size` | select | No | Component Size |  |
| `as_child` | boolean | No | Render as Child |  |
| `form_field_name` | text | Yes | Form Field Name |  |
| `form_field_error` | text | No | Field Error Message |  |
| `sidebar_state` | select | No | Sidebar State |  |
| `sidebar_open` | boolean | No | Sidebar Mobile Open |  |

## Rules

- **accessibility:**
  - **aria_compliance:** true
  - **keyboard_navigation:** true
  - **focus_management:** true
  - **screen_reader_labels:** true
- **composition:**
  - **slot_pattern:** true
  - **data_slot_attributes:** true
  - **context_based_state:** true
  - **compound_components:** true
- **styling:**
  - **cva_variants:** true
  - **cn_utility:** true
  - **css_custom_properties:** true
  - **tailwind_v4:** true
  - **multi_theme:** true
- **state_management:**
  - **sidebar_cookie_persistence:** true
  - **jotai_atoms:** true
  - **url_state:** true
- **dependencies:**
  - **react_hook_form:** true
  - **tanstack_table:** true
  - **recharts:** true
  - **embla_carousel:** true

## Outcomes

### Component_renders_with_variants (Priority: 1)

**Given:**
- Developer passes variant and size props to a component
- `variant` (input) exists

**Then:**
- **call_service** target: `cva.resolve_classname` — CVA resolves variant+size to Tailwind className string
- **call_service** target: `cn.merge` — cn() merges variant classes with any custom className prop

**Result:** Component renders with correct visual variant and allows className overrides

### Component_renders_as_child (Priority: 2)

**Given:**
- Developer passes asChild=true to a component
- `as_child` (input) eq `true`

**Then:**
- **call_service** target: `radix.slot` — Radix Slot merges props onto child element instead of rendering wrapper

**Result:** Component behaviour applied to child element without extra DOM node

### Form_field_validates (Priority: 3)

**Given:**
- Form is wrapped in FormProvider with react-hook-form
- FormField is configured with validation rules

**Then:**
- **call_service** target: `react_hook_form.validate` — react-hook-form validates field against schema (Zod resolver)
- **set_field** target: `form_field_error` value: `validation error message`

**Result:** FormMessage displays error, FormControl gets aria-invalid=true and aria-describedby linking to error

### Form_submits_successfully (Priority: 4)

**Given:**
- All form fields pass validation
- User submits the form

**Then:**
- **call_service** target: `react_hook_form.handle_submit` — Form handler receives validated, typed data

**Result:** Developer's onSubmit callback receives strongly-typed form values

### Dialog_opens_with_focus_trap (Priority: 5)

**Given:**
- User clicks DialogTrigger or sheet/drawer trigger

**Then:**
- **call_service** target: `radix.portal` — Overlay content rendered in React Portal
- **call_service** target: `radix.focus_trap` — Focus trapped inside dialog, Tab cycles within content

**Result:** Dialog is visible with backdrop overlay, focus trapped, ESC to close

### Dialog_closes (Priority: 6)

**Given:**
- ANY: User presses Escape key OR User clicks overlay backdrop OR User clicks close button (if showCloseButton=true)

**Then:**
- **call_service** target: `radix.restore_focus` — Focus returned to trigger element

**Result:** Dialog closes and focus returns to the element that opened it

### Sidebar_toggles (Priority: 7)

**Given:**
- ANY: User clicks SidebarTrigger button OR User presses keyboard shortcut

**Then:**
- **set_field** target: `sidebar_state` value: `toggled value`
- **call_service** target: `cookie.persist` — Persist sidebar state in cookie for next page load

**Result:** Sidebar expands or collapses with animation, state persisted across sessions

### Sidebar_mobile_responsive (Priority: 8)

**Given:**
- Viewport width is below mobile breakpoint

**Then:**
- **call_service** target: `sheet.render` — Sidebar renders as a Sheet (slide-in overlay) on mobile

**Result:** Sidebar adapts to mobile as a dismissible sheet overlay

### Table_renders_with_sorting (Priority: 9)

**Given:**
- Developer provides column definitions with sorting enabled
- Data array is passed to useReactTable hook

**Then:**
- **call_service** target: `tanstack.create_table` — @tanstack/react-table creates headless table instance

**Result:** Table renders with sortable columns, click headers to sort

### Theme_switches_light_dark (Priority: 10)

**Given:**
- User changes system colour scheme preference or developer toggles theme

**Then:**
- **set_field** target: `css_custom_properties` value: `light or dark theme values`

**Result:** All components update to light/dark theme via CSS variable cascade

### Style_preset_applied (Priority: 11)

**Given:**
- Design system config has a style value (vega, nova, lyra, maia, mira, luma)

**Then:**
- **set_field** target: `css_custom_properties` value: `style-specific CSS variable overrides`

**Result:** Components render with chosen design style's spacing, radius, typography

### Toast_displays (Priority: 12)

**Given:**
- Developer calls toast() or sonner function

**Then:**
- **call_service** target: `sonner.show` — Toast appears in configured position with auto-dismiss timer

**Result:** Non-intrusive notification shown to user, auto-dismisses after timeout

### Component_import_missing (Priority: 13) — Error: `COMPONENT_NOT_INSTALLED`

**Given:**
- Developer imports a component that hasn't been added via CLI

**Then:**
- **notify** target: `developer` — Build error or module not found error

**Result:** Developer must run 'shadcn add <component>' to install it

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMPONENT_NOT_INSTALLED` | 404 | Component not found. Run 'npx shadcn add <component>' to install it. | No |
| `FORM_VALIDATION_FAILED` | 422 | One or more form fields contain invalid values. | No |
| `INVALID_VARIANT` | 400 | Unknown variant or size value passed to component. | No |
| `MISSING_FORM_CONTEXT` | 500 | useFormField must be used within a FormField component. | No |
| `MISSING_SIDEBAR_CONTEXT` | 500 | useSidebar must be used within a SidebarProvider. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `form.submit.success` | Form submitted with valid data | `form_values`, `form_name` |
| `form.validation.error` | Form validation failed | `field_name`, `error_message` |
| `sidebar.toggle` | Sidebar expanded or collapsed | `new_state`, `is_mobile` |
| `dialog.open` | Dialog or sheet opened | `dialog_id` |
| `dialog.close` | Dialog or sheet closed | `dialog_id`, `close_reason` |
| `toast.show` | Toast notification displayed | `message`, `type`, `duration` |
| `theme.change` | Theme switched between light and dark | `new_theme` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| shadcn-cli | required | The CLI tool that installs and manages these components in developer projects |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
component_pattern: Compound components with subcomponent exports (e.g.,
  Dialog.Trigger, Dialog.Content)
styling_approach: CVA variants + cn() utility + data-slot attributes + Tailwind CSS v4
form_library: react-hook-form with Zod resolver
state_management: React Context for compound components, Jotai atoms for global config
```

</details>

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: React 19 + Next.js 16
  styling: Tailwind CSS v4
  primitives: Radix UI / Base UI
  build: Turborepo + pnpm
components:
  count: 56
  list:
    - accordion
    - alert
    - alert-dialog
    - aspect-ratio
    - avatar
    - badge
    - breadcrumb
    - button
    - button-group
    - calendar
    - card
    - carousel
    - chart
    - checkbox
    - collapsible
    - combobox
    - command
    - context-menu
    - dialog
    - direction
    - drawer
    - dropdown-menu
    - empty
    - field
    - form
    - hover-card
    - input
    - input-group
    - input-otp
    - kbd
    - label
    - menubar
    - native-select
    - navigation-menu
    - pagination
    - popover
    - progress
    - radio-group
    - resizable
    - scroll-area
    - select
    - separator
    - sheet
    - sidebar
    - skeleton
    - slider
    - sonner
    - spinner
    - switch
    - table
    - tabs
    - textarea
    - toggle
    - toggle-group
    - tooltip
design_styles:
  - vega
  - nova
  - lyra
  - maia
  - mira
  - luma
component_bases:
  - radix
  - base
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Accessible Component Library Blueprint",
  "description": "Accessible, composable UI component library built on accessible component primitives with variant system, Tailwind CSS styling, and a multi-style design system.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "components, design-system, accessible-primitives, tailwind, accessibility, react"
}
</script>
