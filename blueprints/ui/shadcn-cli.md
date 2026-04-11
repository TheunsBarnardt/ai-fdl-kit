<!-- AUTO-GENERATED FROM shadcn-cli.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Component Registry Cli

> CLI tool for initializing projects, adding UI components from registries, managing migrations, and providing MCP server integration for AI assistants

**Category:** Ui · **Version:** 1.0.0 · **Tags:** cli · component-registry · code-generation · developer-tools · mcp

## What this does

CLI tool for initializing projects, adding UI components from registries, managing migrations, and providing MCP server integration for AI assistants

Specifies 20 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **style** *(select, required)* — Component Style
- **rsc** *(boolean, optional)* — React Server Components
- **tsx** *(boolean, optional)* — TypeScript JSX
- **base_color** *(select, required)* — Base Color
- **css_variables** *(boolean, optional)* — CSS Variables
- **tailwind_prefix** *(text, optional)* — Tailwind Prefix
- **icon_library** *(select, optional)* — Icon Library
- **rtl** *(boolean, optional)* — Right-to-Left
- **aliases_components** *(text, required)* — Components Alias
- **aliases_utils** *(text, required)* — Utils Alias
- **registries** *(json, optional)* — Registry Configuration
- **component_type** *(select, required)* — Component Type
- **menu_color** *(select, optional)* — Menu Color
- **menu_accent** *(select, optional)* — Menu Accent

## What must be true

- **preflight_checks → project_must_exist:** true
- **preflight_checks → config_required_for_add:** true
- **preflight_checks → framework_detection_required_for_init:** true
- **preflight_checks → tailwind_must_be_configured:** true
- **preflight_checks → import_alias_required:** true
- **security → safe_target_validation:** true
- **security → env_file_protection:** true
- **security → registry_auth_via_env_vars:** true
- **registry → namespace_must_start_with_at:** true
- **registry → recursive_dependency_resolution:** true
- **registry → response_caching:** true
- **registry → rfc7807_error_parsing:** true
- **file_management → backup_before_config_change:** true
- **file_management → overwrite_requires_flag:** true

## Success & failure scenarios

**✅ Success paths**

- **Init Default Project** — when Developer runs 'shadcn init' in a project directory; Working directory contains a package.json, then Project is initialized with components.json, Tailwind CSS configured, and ready for component installation.
- **Init With Template** — when Developer provides --template flag (next, vite, astro, laravel, react-router, start); template in ["next","vite","astro","laravel","react-router","start"], then New project created from template with shadcn configured.
- **Init Monorepo** — when Developer runs init at monorepo root or with --monorepo flag; pnpm-workspace.yaml or workspace config detected, then Monorepo initialized with workspace detection and shared component config.
- **Add Single Component** — when Developer runs 'shadcn add <component>'; components.json exists and is valid, then Component and all its dependencies are installed in the project.
- **Add From Url** — when Developer provides a full URL instead of a component name; URL points to a valid registry item, then Component installed from arbitrary URL source.
- **Add From Custom Registry** — when Component name includes registry namespace (e.g., @acme/button); Registry namespace is configured in components.json, then Component installed from custom authenticated registry.
- **Search Registry** — when Developer runs 'shadcn search --query <term>', then Matching components returned with name, type, description, and add command.
- **Migrate Icons** — when Developer runs 'shadcn migrate icons', then All icon imports across the project are migrated to the new library.
- **Migrate Radix** — when Developer runs 'shadcn migrate radix', then Components migrated from Base UI to Radix UI primitives.
- **Migrate Rtl** — when Developer runs 'shadcn migrate rtl', then Project supports right-to-left languages.
- **Mcp List Items** — when MCP client calls list_items_in_registries tool, then AI assistant receives component list for recommendation.
- **Mcp Search Items** — when MCP client calls search_items_in_registries with a query, then AI assistant receives matching components.
- **Mcp View Items** — when MCP client calls view_items_in_registries with item names, then AI assistant has complete component info including source code.
- **Mcp Get Add Command** — when MCP client calls get_add_command_for_items, then AI assistant can suggest exact installation command to user.

**❌ Failure paths**

- **Init Unsupported Framework** — when Framework cannot be detected from project structure; Developer has not provided --defaults flag, then Developer is informed and can provide manual config or use --defaults. *(error: `UNSUPPORTED_FRAMEWORK`)*
- **Add Missing Config** — when Developer runs 'shadcn add' without components.json, then Developer is guided to initialize project before adding components. *(error: `MISSING_CONFIG`)*
- **Registry Not Found** — when Requested component or registry returns HTTP 404, then Developer sees clear error with resolution suggestion. *(error: `REGISTRY_NOT_FOUND`)*
- **Registry Unauthorized** — when Registry returns HTTP 401; Auth headers missing or invalid, then Developer is guided to set up registry authentication. *(error: `REGISTRY_UNAUTHORIZED`)*
- **Registry Missing Env Vars** — when Registry config references environment variables that are not set, then Developer knows which env vars to configure. *(error: `REGISTRY_MISSING_ENV_VARS`)*
- **Registry Parse Error** — when Registry response fails Zod schema validation, then Registry maintainer can fix schema issues. *(error: `REGISTRY_PARSE_ERROR`)*

## Errors it can return

- `MISSING_DIR_OR_EMPTY_PROJECT` — No package.json found. Make sure you're in a valid project directory.
- `MISSING_CONFIG` — No components.json found. Run 'shadcn init' to set up your project.
- `TAILWIND_NOT_CONFIGURED` — Tailwind CSS is not configured in this project.
- `IMPORT_ALIAS_MISSING` — No import alias found in tsconfig.json. Configure path aliases before proceeding.
- `UNSUPPORTED_FRAMEWORK` — Could not detect a supported framework. Use --defaults for manual configuration.
- `BUILD_MISSING_REGISTRY_FILE` — registry.json not found. Create a registry file before building.
- `REGISTRY_NOT_FOUND` — The requested component or registry was not found.
- `REGISTRY_UNAUTHORIZED` — Authentication required. Configure registry credentials in components.json.
- `REGISTRY_FORBIDDEN` — Access denied. Check your registry permissions.
- `REGISTRY_PARSE_ERROR` — Invalid registry response. The component data does not match the expected schema.
- `REGISTRY_MISSING_ENV_VARS` — Required environment variables are not set for registry authentication.
- `REGISTRY_FETCH_ERROR` — Failed to fetch from registry. Check your network connection and registry URL.

## Connects to

- **shadcn-components** *(required)* — The UI component library that this CLI distributes and installs

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/component-registry-cli/) · **Spec source:** [`component-registry-cli.blueprint.yaml`](./component-registry-cli.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
