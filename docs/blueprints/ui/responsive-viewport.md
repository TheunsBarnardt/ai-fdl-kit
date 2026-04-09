---
title: "Responsive Viewport Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering. 10 fields. 7 outcomes. 3 error codes. rules: defaul"
---

# Responsive Viewport Blueprint

> Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering

| | |
|---|---|
| **Feature** | `responsive-viewport` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | viewport, responsive, preview, zoom, iframe, responsive-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/responsive-viewport.blueprint.yaml) |
| **JSON API** | [responsive-viewport.json]({{ site.baseurl }}/api/blueprints/ui/responsive-viewport.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `editor_user` | Editor User | human | Person previewing content at different viewport sizes |
| `zoom_engine` | Zoom Engine | system | System that calculates and applies zoom scaling |
| `style_sync` | Style Synchronizer | system | System that mirrors parent document styles into the preview iframe |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `viewport_width` | number | Yes | Viewport Width |  |
| `viewport_height` | number | No | Viewport Height |  |
| `viewport_label` | text | No | Viewport Label |  |
| `viewport_icon` | text | No | Viewport Icon |  |
| `zoom_level` | number | Yes | Current Zoom | Validations: required |
| `auto_zoom` | number | Yes | Auto Zoom |  |
| `root_height` | number | No | Root Height |  |
| `controls_visible` | boolean | Yes | Controls Visible |  |
| `iframe_enabled` | boolean | Yes | Iframe Enabled |  |
| `wait_for_styles` | boolean | Yes | Wait for Styles |  |

## Rules

- **default_viewports:**
  - **presets:** {"width":360,"height":"auto","icon":"Smartphone","label":"Small"}, {"width":768,"height":"auto","icon":"Tablet","label":"Medium"}, {"width":1280,"height":"auto","icon":"Monitor","label":"Large"}, {"width":"100%","height":"auto","icon":"FullWidth","label":"Full-width"}
- **zoom:**
  - **min_zoom:** 0.25
  - **max_zoom:** 2
  - **presets:** 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2
  - **auto_zoom_max:** 1
  - **zoom_capped_at_auto:** true
- **auto_zoom_algorithm:**
  - **fit_to_container:** true
  - **use_more_aggressive_scale:** true
  - **accounts_for_height:** true
- **auto_zoom_triggers:** sidebar_toggle, sidebar_resize, viewport_change, window_resize, first_load, zoom_change, content_height_change
- **iframe_rendering:**
  - **style_synchronization:** true
  - **mutation_observer:** true
  - **async_stylesheet_loading:** true
  - **isolated_document:** true
  - **custom_frame_wrapper:** true
- **animation:**
  - **viewport_transition_ms:** 150
  - **transition_easing:** ease-out

## Outcomes

### Switch_viewport (Priority: 1)

**Given:**
- user clicks a viewport preset button

**Then:**
- **set_field** target: `viewport_width` — Update current viewport width to preset value
- **set_field** target: `viewport_height` — Update current viewport height (usually 'auto')
- **call_service** target: `zoom_engine` — Recalculate auto-zoom for new viewport dimensions
- **emit_event** event: `viewport.changed`

**Result:** Preview resizes to new viewport with smooth transition

### Change_zoom (Priority: 2)

**Given:**
- user selects a zoom level from dropdown or clicks +/- buttons
- selected zoom is within range and does not exceed auto-zoom

**Then:**
- **set_field** target: `zoom_level` — Update zoom to selected value
- **call_service** target: `zoom_engine` — Recalculate root height for new zoom level
- **emit_event** event: `viewport.zoom.changed`

**Result:** Preview scales to new zoom level with smooth transition

### Auto_zoom_recalculate (Priority: 3)

**Given:**
- an auto-zoom trigger fires (sidebar toggle, window resize, etc.)

**Then:**
- **call_service** target: `zoom_engine` — Compare viewport dimensions to container, compute scale factor using more aggressive of width/height ratios
- **set_field** target: `auto_zoom` — Update auto-zoom value (0 to 1.0)
- **set_field** target: `root_height` — Update calculated container height

**Result:** Preview automatically scales to fit available space

### First_load_viewport_selection (Priority: 4)

**Given:**
- editor loads for the first time

**Then:**
- **call_service** target: `viewport_selector` — Select the viewport preset closest to the current window dimensions
- **call_service** target: `zoom_engine` — Calculate initial auto-zoom

**Result:** Editor starts with the most appropriate viewport for the current screen

### Render_in_iframe (Priority: 5)

**Given:**
- iframe rendering is enabled

**Then:**
- **call_service** target: `iframe_creator` — Create iframe with empty HTML document containing a root container
- **call_service** target: `style_sync` — Copy all parent document styles and stylesheets into iframe head
- **call_service** target: `mutation_observer` — Watch parent styles for changes and sync to iframe automatically
- **emit_event** event: `viewport.iframe.ready`

**Result:** Preview content renders in isolated iframe with synced styles

### Render_without_iframe (Priority: 6)

**Given:**
- iframe rendering is disabled

**Then:**
- **set_field** target: `viewport_width` — Set to 100% (full container width)
- **set_field** target: `zoom_level` — Set to 1.0 (no zoom)

**Result:** Preview content renders directly in the editor DOM without isolation

### Style_sync_update (Priority: 7)

**Given:**
- a stylesheet changes in the parent document
- iframe rendering is active

**Then:**
- **call_service** target: `style_sync` — Detect mutation via observer, update corresponding style in iframe head

**Result:** Iframe preview reflects latest parent styles without reload

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IFRAME_LOAD_FAILED` | 500 | Preview iframe failed to initialize | No |
| `STYLE_SYNC_FAILED` | 500 | Failed to synchronize styles to preview | No |
| `ZOOM_OUT_OF_RANGE` | 400 | Zoom level must be between 25% and 200% | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `viewport.changed` | Viewport preset was switched | `width`, `height`, `label` |
| `viewport.zoom.changed` | Zoom level was changed | `zoom_level`, `auto_zoom` |
| `viewport.iframe.ready` | Iframe preview is fully loaded with synced styles | `iframe_document` |
| `viewport.auto_zoom.recalculated` | Auto-zoom was recalculated due to a trigger event | `auto_zoom`, `trigger` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| editor-state | required | Viewport state and zoom config stored in centralized state |
| plugin-overrides | optional | The iframe override point allows plugins to customize the preview frame |

## AGI Readiness

### Goals

#### Reliable Responsive Viewport

Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `editor_state` | editor-state | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| switch_viewport | `autonomous` | - | - |
| change_zoom | `supervised` | - | - |
| auto_zoom_recalculate | `autonomous` | - | - |
| first_load_viewport_selection | `autonomous` | - | - |
| render_in_iframe | `autonomous` | - | - |
| render_without_iframe | `autonomous` | - | - |
| style_sync_update | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 8
  entry_points:
    - components/ViewportControls/
    - lib/get-zoom-config.ts
    - lib/use-reset-auto-zoom.ts
    - components/AutoFrame/
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Responsive Viewport Blueprint",
  "description": "Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering. 10 fields. 7 outcomes. 3 error codes. rules: defaul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "viewport, responsive, preview, zoom, iframe, responsive-design"
}
</script>
