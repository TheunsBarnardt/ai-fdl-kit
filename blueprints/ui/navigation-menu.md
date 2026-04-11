<!-- AUTO-GENERATED FROM navigation-menu.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Navigation Menu

> Hierarchical navigation with sidebar, breadcrumb, mega menu, and mobile support

**Category:** Ui · **Version:** 1.0.0 · **Tags:** navigation · sidebar · breadcrumb · menu · responsive · accessibility · ui

## What this does

Hierarchical navigation with sidebar, breadcrumb, mega menu, and mobile support

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **items** *(json, required)* — Menu Items
- **item_id** *(text, required)* — Item ID
- **item_label** *(text, required)* — Item Label
- **item_icon** *(text, optional)* — Item Icon
- **item_href** *(url, optional)* — Item Link
- **item_children** *(json, optional)* — Child Items
- **item_badge** *(text, optional)* — Badge
- **item_permission** *(text, optional)* — Required Permission
- **type** *(select, required)* — Menu Type
- **collapsed** *(boolean, optional)* — Collapsed

## What must be true

- **hierarchy → max_nesting_levels:** 3
- **hierarchy → collapse_children_by_default:** true
- **active_state → detect_from_url:** true
- **active_state → match_strategy:** prefix
- **active_state → expand_parent_on_active:** true
- **permissions → hide_unauthorized:** true
- **badges → max_value_display:** 99
- **badges → refresh_interval_seconds:** 60
- **mobile → hamburger_breakpoint_px:** 768
- **mobile → overlay_on_open:** true
- **mobile → close_on_navigation:** true
- **accessibility → keyboard_navigable:** true
- **accessibility → aria_roles:** true
- **accessibility → focus_visible:** true
- **accessibility → skip_to_content_link:** true

## Success & failure scenarios

**✅ Success paths**

- **Permission Filtered** — when Menu item has a permission requirement; User does not have the required permission, then item is completely hidden from the DOM (not just visually hidden).
- **Active Item Detected** — when Current URL is available; Menu item has an href, then active item highlighted with aria-current="page" and parent tree expanded.
- **Sidebar Collapsed** — when Menu type is sidebar; Sidebar is in collapsed state, then render icon-only sidebar with tooltips on hover.
- **Mobile Hamburger** — when Viewport is below mobile breakpoint, then render hamburger icon that toggles full menu as overlay.
- **Render Menu** — when Menu items are provided; Valid menu type selected, then render navigation menu with correct layout, active states, and accessibility attributes.

**❌ Failure paths**

- **Empty Menu** — when No menu items provided or all filtered by permissions, then render empty navigation landmark with no items. *(error: `NAV_NO_ITEMS`)*
- **Nesting Limit Exceeded** — when Menu item exceeds 3-level nesting limit, then flatten items beyond level 3 into the nearest valid parent. *(error: `NAV_NESTING_EXCEEDED`)*

## Errors it can return

- `NAV_NO_ITEMS` — No navigation items available
- `NAV_NESTING_EXCEEDED` — Menu nesting exceeds maximum depth
- `NAV_INVALID_TYPE` — Invalid menu type. Must be sidebar, topbar, breadcrumb, or mega.

## Connects to

- **responsive-layout** *(recommended)* — Navigation adapts to responsive layout breakpoints
- **dashboard-analytics** *(optional)* — Dashboard is a common navigation destination
- **theme-configuration** *(optional)* — Navigation styling adapts to theme settings

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/navigation-menu/) · **Spec source:** [`navigation-menu.blueprint.yaml`](./navigation-menu.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
