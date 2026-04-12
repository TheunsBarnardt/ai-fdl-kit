<!-- AUTO-GENERATED FROM bot-plugin-framework.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bot Plugin Framework

> Extension framework for bots, apps, and plugins to extend platform behavior through a defined API

**Category:** Integration · **Version:** 1.0.0 · **Tags:** bots · plugins · apps · extensibility · framework · marketplace

## What this does

Extension framework for bots, apps, and plugins to extend platform behavior through a defined API

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **app_id** *(text, required)* — App / Extension ID
- **name** *(text, required)* — Extension Name
- **name_slug** *(text, required)* — Name Slug
- **version** *(text, required)* — Version
- **required_api_version** *(text, required)* — Required API Version
- **description** *(text, required)* — Description
- **author_name** *(text, required)* — Author Name
- **author_email** *(email, optional)* — Author Email
- **status** *(select, required)* — Status
- **permissions** *(multiselect, optional)* — Declared Permissions
- **settings** *(json, optional)* — Configuration Settings

## What must be true

- **general:** An extension must declare a required API version; the platform rejects installation if the version is incompatible, Extensions run in an isolated sandbox — they cannot access platform internals directly; all operations go through read, modify, http, and persistence accessors, The constructor may be called more than once; initialization logic must go in the initialize() lifecycle method, Extensions declare permissions upfront; the platform enforces them at runtime and may block undeclared actions, An extension's bot user is derived from the name slug (e.g. name-slug.bot); the platform creates it automatically on install, Extensions may register slash commands, scheduled jobs, API endpoints, UI components, and message handlers, Settings changes trigger the onSettingUpdated lifecycle hook; extensions must not cache settings values outside this hook, An extension in error state must be explicitly re-enabled by an administrator after the underlying issue is resolved, Extensions may be enabled or disabled dynamically at runtime without restarting the platform, Extensions must not store sensitive data in plain text; use the persistence accessor for encrypted storage, The platform calls onInstall, onUninstall, and onUpdate lifecycle hooks at the appropriate times

## Success & failure scenarios

**✅ Success paths**

- **Extension Uninstalled** — when administrator uninstalls the extension, then Extension is removed; its bot user, registered commands, and stored data are cleaned up.
- **Extension Updated** — when a new version of an installed extension is available; administrator triggers the update, then New version replaces the old one; onUpdate lifecycle hook is called with old and new contexts.
- **Extension Disabled** — when extension is in running state; administrator disables the extension or an error occurs, then Extension is stopped; all registered commands and handlers are deactivated.
- **Extension Enabled** — when extension is installed and in a disabled or initialized state; administrator enables the extension, then Extension enters running state; its slash commands, handlers, and scheduled jobs become active.
- **Extension Installed** — when administrator uploads or selects an extension package; extension's required API version is compatible with the running platform; all declared permissions are accepted by the administrator, then Extension is installed, its bot user is created, and onInstall lifecycle hook is called.

**❌ Failure paths**

- **Incompatible Api Version** — when extension's required API version is higher than the platform's current API version, then Installation is rejected with a version incompatibility error. *(error: `EXTENSION_INCOMPATIBLE_API_VERSION`)*
- **Permission Not Accepted** — when administrator declines one or more required permissions during installation, then Installation is aborted; no extension files are persisted. *(error: `EXTENSION_PERMISSION_DENIED`)*
- **Extension Error** — when extension throws an unhandled exception during a lifecycle hook or message handler, then Extension transitions to error state; administrator is notified and must manually re-enable. *(error: `EXTENSION_RUNTIME_ERROR`)*

## Errors it can return

- `EXTENSION_INCOMPATIBLE_API_VERSION` — This extension requires a newer version of the platform API. Please update the platform before installing.
- `EXTENSION_PERMISSION_DENIED` — Installation was cancelled because required permissions were not accepted.
- `EXTENSION_RUNTIME_ERROR` — The extension encountered an error and has been disabled. Please check the extension logs.

## Connects to

- **slash-commands** *(recommended)* — Extensions commonly register slash commands via the plugin framework
- **role-based-access-control** *(optional)* — Extensions may declare and enforce custom permissions through RBAC
- **webhook-management** *(optional)* — Extensions can register incoming and outgoing webhook handlers

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/bot-plugin-framework/) · **Spec source:** [`bot-plugin-framework.blueprint.yaml`](./bot-plugin-framework.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
