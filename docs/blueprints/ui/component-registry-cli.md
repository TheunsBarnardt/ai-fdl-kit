---
title: "Component Registry Cli Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "CLI tool for initializing projects, adding UI components from registries, managing migrations, and providing MCP server integration for AI assistants. 14 fields"
---

# Component Registry Cli Blueprint

> CLI tool for initializing projects, adding UI components from registries, managing migrations, and providing MCP server integration for AI assistants

| | |
|---|---|
| **Feature** | `component-registry-cli` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | cli, component-registry, code-generation, developer-tools, mcp |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/shadcn-cli.blueprint.yaml) |
| **JSON API** | [component-registry-cli.json]({{ site.baseurl }}/api/blueprints/ui/component-registry-cli.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | End user running CLI commands to add components to their project |
| `cli` | Component Registry CLI | system | The CLI tool that orchestrates component installation |
| `registry` | Component Registry | external | Remote HTTP registry serving component definitions, styles, and metadata |
| `mcp_client` | MCP Client | external | AI assistant (Claude, Cursor, VS Code, Codex) consuming the MCP server |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `style` | select | Yes | Component Style |  |
| `rsc` | boolean | No | React Server Components |  |
| `tsx` | boolean | No | TypeScript JSX |  |
| `base_color` | select | Yes | Base Color |  |
| `css_variables` | boolean | No | CSS Variables |  |
| `tailwind_prefix` | text | No | Tailwind Prefix |  |
| `icon_library` | select | No | Icon Library |  |
| `rtl` | boolean | No | Right-to-Left |  |
| `aliases_components` | text | Yes | Components Alias |  |
| `aliases_utils` | text | Yes | Utils Alias |  |
| `registries` | json | No | Registry Configuration |  |
| `component_type` | select | Yes | Component Type |  |
| `menu_color` | select | No | Menu Color |  |
| `menu_accent` | select | No | Menu Accent |  |

## Rules

- **preflight_checks:**
  - **project_must_exist:** true
  - **config_required_for_add:** true
  - **framework_detection_required_for_init:** true
  - **tailwind_must_be_configured:** true
  - **import_alias_required:** true
- **security:**
  - **safe_target_validation:** true
  - **env_file_protection:** true
  - **registry_auth_via_env_vars:** true
- **registry:**
  - **namespace_must_start_with_at:** true
  - **recursive_dependency_resolution:** true
  - **response_caching:** true
  - **rfc7807_error_parsing:** true
- **file_management:**
  - **backup_before_config_change:** true
  - **overwrite_requires_flag:** true

## Outcomes

### Init_default_project (Priority: 1)

**Given:**
- Developer runs 'shadcn init' in a project directory
- `cwd` (input) exists

**Then:**
- **create_record** target: `components_json` — Write components.json with style, aliases, Tailwind config, and registry settings
- **call_service** target: `registry.fetch_base_style` — Fetch base style and color configuration from registry
- **emit_event** event: `cli.init.completed`

**Result:** Project is initialized with components.json, Tailwind CSS configured, and ready for component installation

### Init_with_template (Priority: 2)

**Given:**
- Developer provides --template flag (next, vite, astro, laravel, react-router, start)
- `template` (input) in `next,vite,astro,laravel,react-router,start`

**Then:**
- **call_service** target: `template.init` — Run template-specific initialization
- **call_service** target: `template.post_init` — Run post-initialization hooks (git init, etc.)

**Result:** New project created from template with shadcn configured

### Init_monorepo (Priority: 3)

**Given:**
- Developer runs init at monorepo root or with --monorepo flag
- pnpm-workspace.yaml or workspace config detected

**Then:**
- **call_service** target: `monorepo.detect_workspaces` — Detect workspace targets for component installation
- **create_record** target: `components_json` — Write config with workspace-aware path resolution

**Result:** Monorepo initialized with workspace detection and shared component config

### Init_unsupported_framework (Priority: 4) — Error: `UNSUPPORTED_FRAMEWORK`

**Given:**
- Framework cannot be detected from project structure
- Developer has not provided --defaults flag

**Then:**
- **notify** target: `developer` — Prompt developer for manual configuration

**Result:** Developer is informed and can provide manual config or use --defaults

### Add_single_component (Priority: 5)

**Given:**
- Developer runs 'shadcn add <component>'
- `components_json` (system) exists

**Then:**
- **call_service** target: `registry.resolve_tree` — Fetch component with all registry dependencies, CSS vars, fonts
- **call_service** target: `updaters.update_files` — Write component files to configured paths
- **call_service** target: `updaters.update_dependencies` — Install npm dependencies via package manager
- **call_service** target: `updaters.update_css` — Add CSS variables to global stylesheet
- **call_service** target: `updaters.update_fonts` — Register Google Fonts if component uses custom fonts
- **emit_event** event: `cli.add.completed`

**Result:** Component and all its dependencies are installed in the project

### Add_from_url (Priority: 6)

**Given:**
- Developer provides a full URL instead of a component name
- URL points to a valid registry item

**Then:**
- **call_service** target: `registry.fetch_from_url` — Fetch component directly from URL without namespace lookup

**Result:** Component installed from arbitrary URL source

### Add_from_custom_registry (Priority: 7)

**Given:**
- Component name includes registry namespace (e.g., @acme/button)
- `registries` (system) exists

**Then:**
- **call_service** target: `registry.build_url_with_headers` — Resolve URL and auth headers from registry config
- **call_service** target: `registry.fetch_with_auth` — Fetch with authentication headers (env var substitution)

**Result:** Component installed from custom authenticated registry

### Add_missing_config (Priority: 8) — Error: `MISSING_CONFIG`

**Given:**
- Developer runs 'shadcn add' without components.json

**Then:**
- **notify** target: `developer` — Prompt to run 'shadcn init' first or interactively initialize

**Result:** Developer is guided to initialize project before adding components

### Search_registry (Priority: 9)

**Given:**
- Developer runs 'shadcn search --query <term>'

**Then:**
- **call_service** target: `registry.search` — Fuzzy search across configured registries with pagination

**Result:** Matching components returned with name, type, description, and add command

### Migrate_icons (Priority: 10)

**Given:**
- Developer runs 'shadcn migrate icons'

**Then:**
- **call_service** target: `migration.scan_imports` — Scan all UI component files for icon imports
- **call_service** target: `migration.replace_imports` — Replace old icon library imports with target library equivalents

**Result:** All icon imports across the project are migrated to the new library

### Migrate_radix (Priority: 11)

**Given:**
- Developer runs 'shadcn migrate radix'

**Then:**
- **call_service** target: `migration.update_radix_imports` — Update component imports from Base UI to Radix primitives

**Result:** Components migrated from Base UI to Radix UI primitives

### Migrate_rtl (Priority: 12)

**Given:**
- Developer runs 'shadcn migrate rtl'

**Then:**
- **call_service** target: `migration.add_rtl_support` — Update CSS, Tailwind config, and component code for RTL

**Result:** Project supports right-to-left languages

### Mcp_list_items (Priority: 13)

**Given:**
- MCP client calls list_items_in_registries tool

**Then:**
- **call_service** target: `registry.get_index` — Fetch full registry index with pagination

**Result:** AI assistant receives component list for recommendation

### Mcp_search_items (Priority: 14)

**Given:**
- MCP client calls search_items_in_registries with a query

**Then:**
- **call_service** target: `registry.search` — Fuzzy search with pagination

**Result:** AI assistant receives matching components

### Mcp_view_items (Priority: 15)

**Given:**
- MCP client calls view_items_in_registries with item names

**Then:**
- **call_service** target: `registry.resolve_items` — Fetch full component details: files, dependencies, metadata

**Result:** AI assistant has complete component info including source code

### Mcp_get_add_command (Priority: 16)

**Given:**
- MCP client calls get_add_command_for_items

**Then:**
- **call_service** target: `mcp.format_command` — Generate npx shadcn@latest add <items> command string

**Result:** AI assistant can suggest exact installation command to user

### Registry_not_found (Priority: 17) — Error: `REGISTRY_NOT_FOUND`

**Given:**
- Requested component or registry returns HTTP 404

**Then:**
- **notify** target: `developer` — Show error with suggestion to check component name or registry URL

**Result:** Developer sees clear error with resolution suggestion

### Registry_unauthorized (Priority: 18) — Error: `REGISTRY_UNAUTHORIZED`

**Given:**
- Registry returns HTTP 401
- Auth headers missing or invalid

**Then:**
- **notify** target: `developer` — Show error with suggestion to configure auth in components.json or set env vars

**Result:** Developer is guided to set up registry authentication

### Registry_missing_env_vars (Priority: 19) — Error: `REGISTRY_MISSING_ENV_VARS`

**Given:**
- Registry config references environment variables that are not set

**Then:**
- **notify** target: `developer` — List missing environment variable names

**Result:** Developer knows which env vars to configure

### Registry_parse_error (Priority: 20) — Error: `REGISTRY_PARSE_ERROR`

**Given:**
- Registry response fails Zod schema validation

**Then:**
- **notify** target: `developer` — Show validation errors with field details from Zod

**Result:** Registry maintainer can fix schema issues

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MISSING_DIR_OR_EMPTY_PROJECT` | 404 | No package.json found. Make sure you're in a valid project directory. | No |
| `MISSING_CONFIG` | 404 | No components.json found. Run 'shadcn init' to set up your project. | No |
| `TAILWIND_NOT_CONFIGURED` | 422 | Tailwind CSS is not configured in this project. | No |
| `IMPORT_ALIAS_MISSING` | 422 | No import alias found in tsconfig.json. Configure path aliases before proceeding. | No |
| `UNSUPPORTED_FRAMEWORK` | 422 | Could not detect a supported framework. Use --defaults for manual configuration. | No |
| `BUILD_MISSING_REGISTRY_FILE` | 404 | registry.json not found. Create a registry file before building. | No |
| `REGISTRY_NOT_FOUND` | 404 | The requested component or registry was not found. | No |
| `REGISTRY_UNAUTHORIZED` | 401 | Authentication required. Configure registry credentials in components.json. | No |
| `REGISTRY_FORBIDDEN` | 403 | Access denied. Check your registry permissions. | No |
| `REGISTRY_PARSE_ERROR` | 422 | Invalid registry response. The component data does not match the expected schema. | No |
| `REGISTRY_MISSING_ENV_VARS` | 500 | Required environment variables are not set for registry authentication. | No |
| `REGISTRY_FETCH_ERROR` | 500 | Failed to fetch from registry. Check your network connection and registry URL. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cli.init.completed` | Project initialized with shadcn configuration | `cwd`, `style`, `base_color`, `framework`, `template` |
| `cli.add.completed` | Component(s) successfully installed | `component_names`, `files_written`, `dependencies_added`, `css_vars_added` |
| `cli.migrate.completed` | Migration applied to project | `migration_name`, `files_modified` |
| `registry.fetch.success` | Successfully fetched item from registry | `registry_name`, `item_name`, `url` |
| `registry.fetch.error` | Failed to fetch from registry | `registry_name`, `item_name`, `error_code`, `status_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| shadcn-components | required | The UI component library that this CLI distributes and installs |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: Commander.js (CLI)
  runtime: Node.js
  validation: Zod
  package_manager: pnpm
  build: Turborepo
mcp:
  tools:
    - get_project_registries
    - list_items_in_registries
    - search_items_in_registries
    - view_items_in_registries
    - get_item_examples_from_registries
    - get_add_command_for_items
    - get_audit_checklist
  clients:
    - claude
    - cursor
    - vscode
    - codex
    - opencode
supported_frameworks:
  - next
  - vite
  - astro
  - laravel
  - react-router
  - start
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Component Registry Cli Blueprint",
  "description": "CLI tool for initializing projects, adding UI components from registries, managing migrations, and providing MCP server integration for AI assistants. 14 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cli, component-registry, code-generation, developer-tools, mcp"
}
</script>
