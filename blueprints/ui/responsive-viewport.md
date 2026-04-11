<!-- AUTO-GENERATED FROM responsive-viewport.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Responsive Viewport

> Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering

**Category:** Ui · **Version:** 1.0.0 · **Tags:** viewport · responsive · preview · zoom · iframe · responsive-design

## What this does

Multi-viewport responsive preview with auto-zoom, manual zoom controls, and iframe-based isolated rendering

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **viewport_width** *(number, required)* — Viewport Width
- **viewport_height** *(number, optional)* — Viewport Height
- **viewport_label** *(text, optional)* — Viewport Label
- **viewport_icon** *(text, optional)* — Viewport Icon
- **zoom_level** *(number, required)* — Current Zoom
- **auto_zoom** *(number, required)* — Auto Zoom
- **root_height** *(number, optional)* — Root Height
- **controls_visible** *(boolean, required)* — Controls Visible
- **iframe_enabled** *(boolean, required)* — Iframe Enabled
- **wait_for_styles** *(boolean, required)* — Wait for Styles

## What must be true

- **default_viewports → presets → width:** 360
- **default_viewports → presets → height:** auto
- **default_viewports → presets → icon:** Smartphone
- **default_viewports → presets → label:** Small
- **default_viewports → presets → width:** 768
- **default_viewports → presets → height:** auto
- **default_viewports → presets → icon:** Tablet
- **default_viewports → presets → label:** Medium
- **default_viewports → presets → width:** 1280
- **default_viewports → presets → height:** auto
- **default_viewports → presets → icon:** Monitor
- **default_viewports → presets → label:** Large
- **default_viewports → presets → width:** 100%
- **default_viewports → presets → height:** auto
- **default_viewports → presets → icon:** FullWidth
- **default_viewports → presets → label:** Full-width
- **zoom → min_zoom:** 0.25
- **zoom → max_zoom:** 2
- **zoom → presets:** 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2
- **zoom → auto_zoom_max:** 1
- **zoom → zoom_capped_at_auto:** true
- **auto_zoom_algorithm → fit_to_container:** true
- **auto_zoom_algorithm → use_more_aggressive_scale:** true
- **auto_zoom_algorithm → accounts_for_height:** true
- **auto_zoom_triggers:** sidebar_toggle, sidebar_resize, viewport_change, window_resize, first_load, zoom_change, content_height_change
- **iframe_rendering → style_synchronization:** true
- **iframe_rendering → mutation_observer:** true
- **iframe_rendering → async_stylesheet_loading:** true
- **iframe_rendering → isolated_document:** true
- **iframe_rendering → custom_frame_wrapper:** true
- **animation → viewport_transition_ms:** 150
- **animation → transition_easing:** ease-out

## Success & failure scenarios

**✅ Success paths**

- **Switch Viewport** — when user clicks a viewport preset button, then Preview resizes to new viewport with smooth transition.
- **Change Zoom** — when user selects a zoom level from dropdown or clicks +/- buttons; selected zoom is within range and does not exceed auto-zoom, then Preview scales to new zoom level with smooth transition.
- **Auto Zoom Recalculate** — when an auto-zoom trigger fires (sidebar toggle, window resize, etc.), then Preview automatically scales to fit available space.
- **First Load Viewport Selection** — when editor loads for the first time, then Editor starts with the most appropriate viewport for the current screen.
- **Render In Iframe** — when iframe rendering is enabled, then Preview content renders in isolated iframe with synced styles.
- **Render Without Iframe** — when iframe rendering is disabled, then Preview content renders directly in the editor DOM without isolation.
- **Style Sync Update** — when a stylesheet changes in the parent document; iframe rendering is active, then Iframe preview reflects latest parent styles without reload.

## Errors it can return

- `IFRAME_LOAD_FAILED` — Preview iframe failed to initialize
- `STYLE_SYNC_FAILED` — Failed to synchronize styles to preview
- `ZOOM_OUT_OF_RANGE` — Zoom level must be between 25% and 200%

## Connects to

- **editor-state** *(required)* — Viewport state and zoom config stored in centralized state
- **plugin-overrides** *(optional)* — The iframe override point allows plugins to customize the preview frame

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/responsive-viewport/) · **Spec source:** [`responsive-viewport.blueprint.yaml`](./responsive-viewport.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
