---
title: "Navigation Menu Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Hierarchical navigation with sidebar, breadcrumb, mega menu, and mobile support. 10 fields. 7 outcomes. 3 error codes. rules: hierarchy, active_state, permissio"
---

# Navigation Menu Blueprint

> Hierarchical navigation with sidebar, breadcrumb, mega menu, and mobile support

| | |
|---|---|
| **Feature** | `navigation-menu` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | navigation, sidebar, breadcrumb, menu, responsive, accessibility, ui |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/navigation-menu.blueprint.yaml) |
| **JSON API** | [navigation-menu.json]({{ site.baseurl }}/api/blueprints/ui/navigation-menu.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `items` | json | Yes | Menu Items | Validations: required |
| `item_id` | text | Yes | Item ID | Validations: required, pattern |
| `item_label` | text | Yes | Item Label | Validations: required, maxLength |
| `item_icon` | text | No | Item Icon |  |
| `item_href` | url | No | Item Link |  |
| `item_children` | json | No | Child Items |  |
| `item_badge` | text | No | Badge |  |
| `item_permission` | text | No | Required Permission |  |
| `type` | select | Yes | Menu Type | Validations: required |
| `collapsed` | boolean | No | Collapsed |  |

## Rules

- **hierarchy:**
  - **max_nesting_levels:** 3
  - **collapse_children_by_default:** true
- **active_state:**
  - **detect_from_url:** true
  - **match_strategy:** prefix
  - **expand_parent_on_active:** true
- **permissions:**
  - **hide_unauthorized:** true
- **badges:**
  - **max_value_display:** 99
  - **refresh_interval_seconds:** 60
- **mobile:**
  - **hamburger_breakpoint_px:** 768
  - **overlay_on_open:** true
  - **close_on_navigation:** true
- **accessibility:**
  - **keyboard_navigable:** true
  - **aria_roles:** true
  - **focus_visible:** true
  - **skip_to_content_link:** true

## Outcomes

### Empty_menu (Priority: 1) — Error: `NAV_NO_ITEMS`

**Given:**
- `items` (input) not_exists

**Result:** render empty navigation landmark with no items

### Permission_filtered (Priority: 2)

**Given:**
- `item_permission` (computed) exists
- `user_permissions` (session) not_in `item_permission`

**Then:**
- **set_field** target: `item_visible` value: `false` — Hide menu item from user without permission

**Result:** item is completely hidden from the DOM (not just visually hidden)

### Nesting_limit_exceeded (Priority: 3) — Error: `NAV_NESTING_EXCEEDED`

**Given:**
- `nesting_depth` (computed) gt `3`

**Result:** flatten items beyond level 3 into the nearest valid parent

### Active_item_detected (Priority: 5)

**Given:**
- `current_url` (request) exists
- `item_href` (input) exists

**Then:**
- **set_field** target: `item_active` value: `true` when: `current_url == item_href` — Mark item as active based on URL prefix match
- **set_field** target: `parent_expanded` value: `true` — Expand all parent items in the active branch

**Result:** active item highlighted with aria-current="page" and parent tree expanded

### Sidebar_collapsed (Priority: 6)

**Given:**
- `type` (input) eq `sidebar`
- `collapsed` (input) eq `true`

**Then:**
- **set_field** target: `show_labels` value: `false` — Hide text labels, show only icons

**Result:** render icon-only sidebar with tooltips on hover

### Mobile_hamburger (Priority: 7)

**Given:**
- `viewport_width` (system) lt `768`

**Then:**
- **set_field** target: `menu_visible` value: `false` — Hide full menu, show hamburger toggle

**Result:** render hamburger icon that toggles full menu as overlay

### Render_menu (Priority: 10)

**Given:**
- `items` (input) exists
- `type` (input) in `sidebar,topbar,breadcrumb,mega`

**Result:** render navigation menu with correct layout, active states, and accessibility attributes

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NAV_NO_ITEMS` | 400 | No navigation items available | No |
| `NAV_NESTING_EXCEEDED` | 400 | Menu nesting exceeds maximum depth | No |
| `NAV_INVALID_TYPE` | 400 | Invalid menu type. Must be sidebar, topbar, breadcrumb, or mega. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `nav.item_clicked` | User clicked a navigation menu item | `item_id`, `item_href`, `menu_type`, `timestamp` |
| `nav.collapsed` | Sidebar navigation collapsed or expanded | `collapsed`, `menu_type`, `timestamp` |
| `nav.mobile_toggled` | Mobile hamburger menu opened or closed | `open`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| responsive-layout | recommended | Navigation adapts to responsive layout breakpoints |
| dashboard-analytics | optional | Dashboard is a common navigation destination |
| theme-configuration | optional | Navigation styling adapts to theme settings |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Navigation Menu Blueprint",
  "description": "Hierarchical navigation with sidebar, breadcrumb, mega menu, and mobile support. 10 fields. 7 outcomes. 3 error codes. rules: hierarchy, active_state, permissio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "navigation, sidebar, breadcrumb, menu, responsive, accessibility, ui"
}
</script>
