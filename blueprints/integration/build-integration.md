<!-- AUTO-GENERATED FROM build-integration.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Build Integration

> Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS

**Category:** Integration · **Version:** 1.0.0 · **Tags:** build-tools · bundling · optimization · postcss · cli

## What this does

Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **integration_type** *(select, required)* — How CSS framework integrates with build system
- **config_file_path** *(text, required)* — Path to configuration file
- **input_css_path** *(text, optional)* — Input CSS file path containing @tailwind directives
- **output_css_path** *(text, optional)* — Output CSS file path for generated CSS
- **watch_mode_enabled** *(boolean, optional)* — Whether to watch source files and regenerate CSS on changes
- **content_paths** *(json, required)* — Glob patterns for files to scan for utility class usage
- **template_file_extensions** *(json, optional)* — File extensions to scan for CSS classes
- **minify_output** *(boolean, optional)* — Whether to minify generated CSS
- **source_map_enabled** *(boolean, optional)* — Whether to generate source maps for debugging

## What must be true

- **configuration:** Config file must define content paths so framework knows which files to scan, Config file can be JavaScript (.js), TypeScript (.ts), or ESM (.mjs), For PostCSS plugin, config specified in postcss.config.js under plugins array
- **content_scanning:** Content paths use glob patterns to include template files, Scanner extracts all class names (including arbitrary values) from matched files, Unused classes not found in content are excluded from output CSS (purge), File extensions must be explicitly listed; unmatched extensions are ignored
- **build_output:** Generated CSS contains only utilities used in content files, Default theme and base styles always included (unless explicitly disabled), CSS output is sorted by cascade order (base, layout, components, utilities)
- **watch_mode:** Watch mode monitors source files and regenerates CSS on any change, Debouncing applied to prevent excessive rebuilds on rapid file changes, CSS reloading triggered in browser via live reload or HMR

## Success & failure scenarios

**✅ Success paths**

- **Postcss Plugin Integration** — when Project uses PostCSS build pipeline; postcss.config.js configured with CSS framework plugin, then PostCSS processes CSS framework directives (@tailwind, @layer); output CSS generated.
- **Cli Build Command** — when Project uses CLI for CSS generation; Command: tailwindcss --input src/styles.css --output dist/styles.css, then CSS scanned from content files, generated, and written to output file.
- **Cli Watch Mode** — when Command: tailwindcss --input src/styles.css --output dist/styles.css --watch; File changes detected in content paths, then CSS regenerated automatically; watch process continues until stopped.
- **Vite Plugin Integration** — when Project uses Vite as build tool; Vite config includes CSS framework plugin, then Vite processes CSS; HMR enabled for instant CSS updates during development.
- **Webpack Loader Integration** — when Project uses Webpack as build tool; Webpack config includes CSS framework loader, then Webpack processes CSS files; generated CSS bundled with application.
- **Next Js Integration** — when Project uses Next.js framework; next.config.js or postcss.config.js includes CSS framework plugin, then Next.js build pipeline processes CSS; global styles and component styles scanned.
- **Content Configuration** — when Config specifies content paths: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'], then Scanner includes matching files; only utilities used in scanned files generate CSS.
- **Minified Output** — when Build configuration specifies minification; Command: tailwindcss --input src/styles.css --output dist/styles.css --minify, then Generated CSS minified; whitespace and comments removed.

**❌ Failure paths**

- **Missing Config File** — when Build tool expects config file (tailwind.config.js) but file does not exist, then Build fails; error indicates missing config file. *(error: `CONFIG_NOT_FOUND`)*
- **Invalid Content Paths** — when Content paths misconfigured (e.g., glob pattern invalid or paths do not exist), then Build succeeds but CSS may not include all utilities (false purge). *(error: `INVALID_CONTENT_PATHS`)*
- **Circular Dependency** — when Config or plugin loading causes circular dependency, then Build fails; circular dependency in config/plugin chain. *(error: `CIRCULAR_DEPENDENCY`)*

## Errors it can return

- `CONFIG_NOT_FOUND` — Configuration file not found. Create tailwind.config.js or configure CSS framework in PostCSS config.
- `INVALID_CONTENT_PATHS` — Content paths are invalid or unreachable. Check glob patterns and file paths in config.
- `BUILD_FAILED` — CSS generation failed. Check config file and ensure templates are valid.
- `CIRCULAR_DEPENDENCY` — Circular dependency detected in config or plugins. Check imports and module references.

## Events

**`build.postcss_configured`**
  Payload: `config_file_path`, `plugin_config`

**`build.cli_build_started`**
  Payload: `input_file`, `output_file`

**`build.watch_triggered`**
  Payload: `changed_file`, `timestamp`

**`build.vite_configured`**
  Payload: `vite_config`

**`build.webpack_configured`**
  Payload: `webpack_config`

**`build.nextjs_configured`**
  Payload: `nextjs_config`

**`build.content_paths_configured`**
  Payload: `content_paths`

**`build.minification_enabled`**

**`build.config_error`**
  Payload: `config_file_path`, `error_message`

**`build.content_error`**
  Payload: `content_paths`, `error_message`

**`build.dependency_error`**
  Payload: `error_message`

## Connects to

- **theme-configuration** *(required)* — Build tool reads theme config for CSS generation
- **plugin-development** *(optional)* — Build tool loads and applies plugins

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/build-integration/) · **Spec source:** [`build-integration.blueprint.yaml`](./build-integration.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
