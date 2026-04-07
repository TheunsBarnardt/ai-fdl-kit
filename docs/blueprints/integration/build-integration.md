---
title: "Build Integration Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS. 9 fields. 11 outcomes. 4 error "
---

# Build Integration Blueprint

> Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS

| | |
|---|---|
| **Feature** | `build-integration` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | build-tools, bundling, optimization, postcss, cli |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/build-integration.blueprint.yaml) |
| **JSON API** | [build-integration.json]({{ site.baseurl }}/api/blueprints/integration/build-integration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Configures build tool integration |
| `build_tool` | Build Tool | system | Build system (webpack, vite, next.js, esbuild, etc.) |
| `css_processor` | CSS Framework Processor | system | Processes CSS and generates output |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `integration_type` | select | Yes | How CSS framework integrates with build system |  |
| `config_file_path` | text | Yes | Path to configuration file |  |
| `input_css_path` | text | No | Input CSS file path containing @tailwind directives |  |
| `output_css_path` | text | No | Output CSS file path for generated CSS |  |
| `watch_mode_enabled` | boolean | No | Whether to watch source files and regenerate CSS on changes |  |
| `content_paths` | json | Yes | Glob patterns for files to scan for utility class usage |  |
| `template_file_extensions` | json | No | File extensions to scan for CSS classes |  |
| `minify_output` | boolean | No | Whether to minify generated CSS |  |
| `source_map_enabled` | boolean | No | Whether to generate source maps for debugging |  |

## States

**State field:** `build_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `configured` | Yes |  |
| `building` |  |  |
| `generated` |  |  |
| `watching` |  |  |
| `failed` |  |  |

## Rules

- **configuration:** Config file must define content paths so framework knows which files to scan, Config file can be JavaScript (.js), TypeScript (.ts), or ESM (.mjs), For PostCSS plugin, config specified in postcss.config.js under plugins array
- **content_scanning:** Content paths use glob patterns to include template files, Scanner extracts all class names (including arbitrary values) from matched files, Unused classes not found in content are excluded from output CSS (purge), File extensions must be explicitly listed; unmatched extensions are ignored
- **build_output:** Generated CSS contains only utilities used in content files, Default theme and base styles always included (unless explicitly disabled), CSS output is sorted by cascade order (base, layout, components, utilities)
- **watch_mode:** Watch mode monitors source files and regenerates CSS on any change, Debouncing applied to prevent excessive rebuilds on rapid file changes, CSS reloading triggered in browser via live reload or HMR

## Outcomes

### Postcss_plugin_integration (Priority: 1)

**Given:**
- Project uses PostCSS build pipeline
- postcss.config.js configured with CSS framework plugin

**Then:**
- **create_record**
- **emit_event** event: `build.postcss_configured`

**Result:** PostCSS processes CSS framework directives (@tailwind, @layer); output CSS generated

### Cli_build_command (Priority: 2)

**Given:**
- Project uses CLI for CSS generation
- Command: tailwindcss --input src/styles.css --output dist/styles.css

**Then:**
- **emit_event** event: `build.cli_build_started`

**Result:** CSS scanned from content files, generated, and written to output file

### Cli_watch_mode (Priority: 3)

**Given:**
- Command: tailwindcss --input src/styles.css --output dist/styles.css --watch
- File changes detected in content paths

**Then:**
- **transition_state** field: `build_status` from: `generated` to: `watching`
- **emit_event** event: `build.watch_triggered`

**Result:** CSS regenerated automatically; watch process continues until stopped

### Vite_plugin_integration (Priority: 4)

**Given:**
- Project uses Vite as build tool
- Vite config includes CSS framework plugin

**Then:**
- **create_record**
- **emit_event** event: `build.vite_configured`

**Result:** Vite processes CSS; HMR enabled for instant CSS updates during development

### Webpack_loader_integration (Priority: 5)

**Given:**
- Project uses Webpack as build tool
- Webpack config includes CSS framework loader

**Then:**
- **create_record**
- **emit_event** event: `build.webpack_configured`

**Result:** Webpack processes CSS files; generated CSS bundled with application

### Next_js_integration (Priority: 6)

**Given:**
- Project uses Next.js framework
- next.config.js or postcss.config.js includes CSS framework plugin

**Then:**
- **create_record**
- **emit_event** event: `build.nextjs_configured`

**Result:** Next.js build pipeline processes CSS; global styles and component styles scanned

### Content_configuration (Priority: 7)

**Given:**
- Config specifies content paths: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}']

**Then:**
- **set_field** target: `content_paths` value: `['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}']`
- **emit_event** event: `build.content_paths_configured`

**Result:** Scanner includes matching files; only utilities used in scanned files generate CSS

### Minified_output (Priority: 8)

**Given:**
- Build configuration specifies minification
- Command: tailwindcss --input src/styles.css --output dist/styles.css --minify

**Then:**
- **set_field** target: `minify_output` value: `true`
- **emit_event** event: `build.minification_enabled`

**Result:** Generated CSS minified; whitespace and comments removed

### Missing_config_file (Priority: 10) — Error: `CONFIG_NOT_FOUND`

**Given:**
- Build tool expects config file (tailwind.config.js) but file does not exist

**Then:**
- **emit_event** event: `build.config_error`

**Result:** Build fails; error indicates missing config file

### Invalid_content_paths (Priority: 11) — Error: `INVALID_CONTENT_PATHS`

**Given:**
- Content paths misconfigured (e.g., glob pattern invalid or paths do not exist)

**Then:**
- **emit_event** event: `build.content_error`

**Result:** Build succeeds but CSS may not include all utilities (false purge)

### Circular_dependency (Priority: 12) — Error: `CIRCULAR_DEPENDENCY`

**Given:**
- Config or plugin loading causes circular dependency

**Then:**
- **emit_event** event: `build.dependency_error`

**Result:** Build fails; circular dependency in config/plugin chain

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONFIG_NOT_FOUND` | 400 | Configuration file not found. Create tailwind.config.js or configure CSS framework in PostCSS config. | No |
| `INVALID_CONTENT_PATHS` | 400 | Content paths are invalid or unreachable. Check glob patterns and file paths in config. | No |
| `BUILD_FAILED` | 500 | CSS generation failed. Check config file and ensure templates are valid. | No |
| `CIRCULAR_DEPENDENCY` | 400 | Circular dependency detected in config or plugins. Check imports and module references. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `build.postcss_configured` |  | `config_file_path`, `plugin_config` |
| `build.cli_build_started` |  | `input_file`, `output_file` |
| `build.watch_triggered` |  | `changed_file`, `timestamp` |
| `build.vite_configured` |  | `vite_config` |
| `build.webpack_configured` |  | `webpack_config` |
| `build.nextjs_configured` |  | `nextjs_config` |
| `build.content_paths_configured` |  | `content_paths` |
| `build.minification_enabled` |  |  |
| `build.config_error` |  | `config_file_path`, `error_message` |
| `build.content_error` |  | `content_paths`, `error_message` |
| `build.dependency_error` |  | `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| theme-configuration | required | Build tool reads theme config for CSS generation |
| plugin-development | optional | Build tool loads and applies plugins |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript + PostCSS
  build_tools_supported:
    - PostCSS
    - CLI
    - Webpack
    - Vite
    - Next.js
    - Remix
    - Nuxt
    - Astro
  package_managers:
    - npm
    - pnpm
    - yarn
    - bun
source_location: packages/@tailwindcss-*
integration_patterns:
  postcss: Plugin loaded in postcss.config.js
  cli: CLI command in npm scripts or build pipeline
  framework: Plugin provided by framework (Next.js, Vite, etc.)
best_practices:
  - Configure content paths to match all template files in project
  - Keep config file at project root for easy discovery
  - Use watch mode during development; single build for production
  - Enable source maps for development; minify for production
  - Pin CSS framework version to avoid unexpected CSS changes
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Build Integration Blueprint",
  "description": "Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS. 9 fields. 11 outcomes. 4 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "build-tools, bundling, optimization, postcss, cli"
}
</script>
