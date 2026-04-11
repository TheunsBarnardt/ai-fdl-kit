<!-- AUTO-GENERATED FROM shadcn-components.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Accessible Component Library

> Accessible, composable UI component library built on accessible component primitives with variant system, Tailwind CSS styling, and a multi-style design system

**Category:** Ui · **Version:** 1.0.0 · **Tags:** components · design-system · accessible-primitives · tailwind · accessibility · react

## What this does

Accessible, composable UI component library built on accessible component primitives with variant system, Tailwind CSS styling, and a multi-style design system

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **primitive_library** *(select, required)* — Primitive Library
- **style** *(select, required)* — Design Style
- **icon_library** *(select, optional)* — Icon Library
- **border_radius** *(number, optional)* — Border Radius
- **font_family** *(text, optional)* — Font Family
- **variant** *(text, optional)* — Component Variant
- **size** *(select, optional)* — Component Size
- **as_child** *(boolean, optional)* — Render as Child
- **form_field_name** *(text, required)* — Form Field Name
- **form_field_error** *(text, optional)* — Field Error Message
- **sidebar_state** *(select, optional)* — Sidebar State
- **sidebar_open** *(boolean, optional)* — Sidebar Mobile Open

## What must be true

- **accessibility → aria_compliance:** true
- **accessibility → keyboard_navigation:** true
- **accessibility → focus_management:** true
- **accessibility → screen_reader_labels:** true
- **composition → slot_pattern:** true
- **composition → data_slot_attributes:** true
- **composition → context_based_state:** true
- **composition → compound_components:** true
- **styling → cva_variants:** true
- **styling → cn_utility:** true
- **styling → css_custom_properties:** true
- **styling → tailwind_v4:** true
- **styling → multi_theme:** true
- **state_management → sidebar_cookie_persistence:** true
- **state_management → jotai_atoms:** true
- **state_management → url_state:** true
- **dependencies → react_hook_form:** true
- **dependencies → tanstack_table:** true
- **dependencies → recharts:** true
- **dependencies → embla_carousel:** true

## Success & failure scenarios

**✅ Success paths**

- **Component Renders With Variants** — when Developer passes variant and size props to a component; variant exists, then Component renders with correct visual variant and allows className overrides.
- **Component Renders As Child** — when Developer passes asChild=true to a component; as_child eq true, then Component behaviour applied to child element without extra DOM node.
- **Form Field Validates** — when Form is wrapped in FormProvider with react-hook-form; FormField is configured with validation rules, then FormMessage displays error, FormControl gets aria-invalid=true and aria-describedby linking to error.
- **Form Submits Successfully** — when All form fields pass validation; User submits the form, then Developer's onSubmit callback receives strongly-typed form values.
- **Dialog Opens With Focus Trap** — when User clicks DialogTrigger or sheet/drawer trigger, then Dialog is visible with backdrop overlay, focus trapped, ESC to close.
- **Dialog Closes** — when User presses Escape key OR User clicks overlay backdrop OR User clicks close button (if showCloseButton=true), then Dialog closes and focus returns to the element that opened it.
- **Sidebar Toggles** — when User clicks SidebarTrigger button OR User presses keyboard shortcut, then Sidebar expands or collapses with animation, state persisted across sessions.
- **Sidebar Mobile Responsive** — when Viewport width is below mobile breakpoint, then Sidebar adapts to mobile as a dismissible sheet overlay.
- **Table Renders With Sorting** — when Developer provides column definitions with sorting enabled; Data array is passed to useReactTable hook, then Table renders with sortable columns, click headers to sort.
- **Theme Switches Light Dark** — when User changes system colour scheme preference or developer toggles theme, then All components update to light/dark theme via CSS variable cascade.
- **Style Preset Applied** — when Design system config has a style value (vega, nova, lyra, maia, mira, luma), then Components render with chosen design style's spacing, radius, typography.
- **Toast Displays** — when Developer calls toast() or sonner function, then Non-intrusive notification shown to user, auto-dismisses after timeout.

**❌ Failure paths**

- **Component Import Missing** — when Developer imports a component that hasn't been added via CLI, then Developer must run 'shadcn add <component>' to install it. *(error: `COMPONENT_NOT_INSTALLED`)*

## Errors it can return

- `COMPONENT_NOT_INSTALLED` — Component not found. Run 'npx shadcn add <component>' to install it.
- `FORM_VALIDATION_FAILED` — One or more form fields contain invalid values.
- `INVALID_VARIANT` — Unknown variant or size value passed to component.
- `MISSING_FORM_CONTEXT` — useFormField must be used within a FormField component.
- `MISSING_SIDEBAR_CONTEXT` — useSidebar must be used within a SidebarProvider.

## Connects to

- **shadcn-cli** *(required)* — The CLI tool that installs and manages these components in developer projects

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/accessible-component-library/) · **Spec source:** [`accessible-component-library.blueprint.yaml`](./accessible-component-library.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
