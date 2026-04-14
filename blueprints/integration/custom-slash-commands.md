<!-- AUTO-GENERATED FROM custom-slash-commands.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Custom Slash Commands

> User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and configurable response visibility.

**Category:** Integration · **Version:** 1.0.0 · **Tags:** slash-commands · webhooks · integrations · bots · custom-commands

## What this does

User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and configurable response visibility.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **command_id** *(hidden, required)* — Unique identifier for the slash command
- **trigger** *(text, required)* — Command keyword (without leading slash), 1–128 characters, alphanumeric plus
- **display_name** *(text, optional)* — Human-readable name shown in the command management UI
- **description** *(text, optional)* — Brief explanation of what the command does, shown in command help
- **auto_complete_hint** *(text, optional)* — Usage example displayed in the autocomplete suggestions
- **url** *(url, required)* — HTTP endpoint that receives the command execution payload
- **method** *(select, required)* — HTTP method used when calling the endpoint
- **username** *(text, optional)* — Username shown as the author of in-channel responses from this command
- **icon_url** *(url, optional)* — URL of the icon shown alongside command responses
- **auto_complete** *(boolean, required)* — Whether this command appears in the autocomplete suggestion list
- **token** *(token, required)* — Secret token included in every request to the endpoint for authentication; can b

## What must be true

- **rule_01:** Trigger keywords must not include a leading slash; the slash prefix is implicit.
- **rule_02:** Trigger names are unique per workspace; duplicate triggers within the same team are rejected.
- **rule_03:** The token is auto-generated at creation and is the primary security mechanism; the endpoint must validate it on every request.
- **rule_04:** When the endpoint is called, the payload includes the trigger, command arguments, channel ID, team ID, user ID, and the command token.
- **rule_05:** Responses can be ephemeral (visible only to the command executor) or in_channel (posted publicly to the channel).
- **rule_06:** Responses may include text, attachments, and a goto_location for navigation.
- **rule_07:** A response may include extra_responses to post multiple messages in a single execution.
- **rule_08:** Commands can be created either by workspace members (with the appropriate permission) or by plugins (which set the plugin_id field instead of a creator user ID).
- **rule_09:** Plugin-registered commands and user-created commands cannot coexist with the same trigger; the system deduplicates across all sources.
- **rule_10:** Token and endpoint URL are redacted from command objects returned to non-admin callers.

## Success & failure scenarios

**✅ Success paths**

- **Command Created** — when actor has permission to manage slash commands; trigger is unique within the workspace; url is a valid HTTP endpoint, then Command immediately active; users can invoke it via /<trigger>.
- **Command Executed** — when member types /<trigger> in a channel; command is registered and active for this workspace, then Endpoint response processed; ephemeral or in-channel message posted.
- **Command Response Ephemeral** — when endpoint returns response with response_type = ephemeral, then Only the command executor sees the response; channel is unaffected.
- **Command Response In Channel** — when endpoint returns response with response_type = in_channel, then Response visible to all channel members.

**❌ Failure paths**

- **Command Trigger Conflict** — when new command trigger matches an existing active command in the same workspace, then Creation rejected; trigger must be unique within the workspace. *(error: `COMMAND_TRIGGER_ALREADY_EXISTS`)*
- **Command Endpoint Unreachable** — when command executed; HTTP request to the endpoint times out or returns a non-200 status, then Execution fails gracefully; error shown only to the executor. *(error: `COMMAND_ENDPOINT_FAILED`)*

## Errors it can return

- `COMMAND_TRIGGER_ALREADY_EXISTS` — A command with that trigger already exists in this workspace.
- `COMMAND_INVALID_TRIGGER` — Trigger may only contain letters, numbers, periods, slashes, and hyphens.
- `COMMAND_ENDPOINT_FAILED` — The command service could not be reached. Please try again later.
- `COMMAND_NOT_FOUND` — Slash command not found.
- `COMMAND_PERMISSION_DENIED` — You do not have permission to manage slash commands.

## Events

**`command.created`** — New slash command registered
  Payload: `command_id`, `trigger`, `team_id`, `actor_id`, `timestamp`

**`command.updated`** — Slash command configuration modified
  Payload: `command_id`, `trigger`, `changed_fields`, `actor_id`, `timestamp`

**`command.deleted`** — Slash command removed
  Payload: `command_id`, `trigger`, `actor_id`, `timestamp`

**`command.executed`** — Slash command triggered by a user
  Payload: `command_id`, `trigger`, `channel_id`, `user_id`, `timestamp`

**`command.token_regenerated`** — Command security token was regenerated; old token no longer valid
  Payload: `command_id`, `actor_id`, `timestamp`

## Connects to

- **server-plugin-framework** *(optional)* — Plugins can register slash commands in addition to API-created commands
- **role-based-access-control** *(required)* — Permissions govern who can create, execute, and manage slash commands

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/custom-slash-commands/) · **Spec source:** [`custom-slash-commands.blueprint.yaml`](./custom-slash-commands.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
