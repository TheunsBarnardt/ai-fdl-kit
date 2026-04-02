---
name: fdl-extract-code-feature
description: Scan a repo, show selectable feature list, extract only chosen features as portable blueprints
user_invocable: true
command: fdl-extract-code-feature
arguments: "<path-or-repo-url>"
---

# FDL Extract Code Feature — Selective Feature Extraction

Scan an entire repository, identify the discrete **features/capabilities** it implements (not files, not modules — features), present them as a selectable list, and extract only the user-selected features into portable, framework-agnostic FDL blueprints that can be used to rebuild those capabilities in any stack.

## Core Principle: Features, Not Files

This skill extracts **capabilities** — things the system CAN DO — not a file-by-file audit.

- "Drag and drop editor" is a feature. `src/components/DndContext.tsx` is a file.
- "Undo/redo system" is a feature. `src/store/history.ts` is a file.
- "Plugin/extension architecture" is a feature. `src/extensions/registry.ts` is a file.

The user selects features. The skill traces the code paths that implement those features across however many files they span, then produces blueprints that describe the **behavior** without coupling to the source framework.

## Core Principle: Plain Language, No YAML Jargon

- NEVER show raw YAML during the conversation
- NEVER use FDL-specific terms with the user (outcomes, flows, events, etc.)
- DO use AskUserQuestion to present feature selections and clarify ambiguities
- DO present extracted information as plain-English bullet points
- DO generate YAML silently behind the scenes
- DO flag things the code doesn't make clear — ask the user rather than guessing

## How This Differs from `/fdl-extract-code`

|                     | `extract-code`                     | `extract-code-feature`               |
| ------------------- | ---------------------------------- | ------------------------------------ |
| **Input scope**     | A specific path/folder             | An entire repo                       |
| **Discovery**       | Analyze everything in path         | Scan repo → present feature menu     |
| **Selection**       | Extract all                        | User picks which features            |
| **Output focus**    | Document what's implemented        | Extract **portable capabilities**    |
| **Blueprint style** | Framework-aware (notes tech stack) | Framework-agnostic (behavior only)   |
| **Goal**            | Understand existing code           | Steal a feature to rebuild elsewhere |

## Usage

```
/fdl-extract-code-feature https://github.com/puckeditor/puck
/fdl-extract-code-feature https://github.com/webstudio-is/webstudio
/fdl-extract-code-feature https://github.com/microsoft/vscode
/fdl-extract-code-feature C:/projects/some-app
/fdl-extract-code-feature ./src
```

## Arguments

- `<path-or-repo-url>` — Local folder path OR a git repository URL (HTTPS). If a git URL, the repo will be cloned to a temp directory.

## Workflow

### Step 0: Resolve Input Source

**If the input is a git URL:**

1. Clone the repo to a temporary directory:
   ```bash
   git clone --depth 1 <url> /tmp/fdl-extract-<repo-name>
   ```

   - Use `--depth 1` for speed — we only need the current state, not history
   - For GitHub URLs without `.git` suffix, append `.git` automatically
   - For GitHub URLs with paths (e.g., `github.com/org/repo/tree/main/src`), clone the repo and focus on the subfolder
2. Set the working path to the cloned directory

**If the input is a local path:**

1. Verify the path exists using Glob
2. Set the working path

### Step 1: Rapid Repo Reconnaissance

The goal is to understand what the system IS and what it DOES — fast. Do NOT read every file. Skim strategically.

#### 1a. Identify the project

Read these files (if they exist) to understand the project's purpose:

```
Read: README.md (first 100 lines)
Read: package.json OR Cargo.toml OR go.mod OR requirements.txt (name, description, keywords)
Read: CONTRIBUTING.md (first 50 lines — often describes architecture)
```

#### 1b. Map the architecture

```
Glob: src/**/          — top-level source directories (depth 2 only)
Glob: packages/*/      — monorepo packages
Glob: apps/*/          — monorepo apps
```

Use the Explore agent for broad codebase mapping:

- "What are the major modules/packages in this repo?"
- "What does each top-level directory contain?"

#### 1c. Identify the tech stack

```
Glob: package.json, tsconfig.json, next.config.*, vite.config.*,
      requirements.txt, Cargo.toml, go.mod, pom.xml, build.gradle,
      Gemfile, composer.json, *.csproj, pubspec.yaml, Dockerfile
```

Read the main manifest to identify frameworks and key dependencies.

### Step 2: Feature Discovery

This is the critical step. Scan the codebase to identify discrete **features/capabilities** — not modules, not files, not components.

#### 2a. Structural signals

Use the Explore agent to find feature boundaries. Look for:

**Directory-based features:**

```
Glob: src/features/*/       — explicit feature folders
Glob: src/modules/*/        — module-based architecture
Glob: packages/*/           — monorepo packages (each is often a feature)
Glob: plugins/*/            — plugin-based architecture
Glob: src/**/index.ts       — barrel exports often mark feature boundaries
```

**Route/page-based features:**

```
Glob: src/pages/**/*        — each page/route implies a feature
Glob: src/app/**/page.*     — Next.js app router pages
Glob: src/routes/**/*       — SvelteKit/Remix routes
```

**State-based features:**

```
Grep: "createSlice|createStore|createContext|createSignal|atom\(" — state management boundaries
Grep: "useReducer|createReducer" — complex state = complex feature
```

#### 2b. Behavioral signals

Search for high-level feature indicators:

```
Grep: "drag|drop|DndContext|Droppable|Draggable|sortable" — drag-and-drop
Grep: "undo|redo|history|CommandManager|UndoStack" — undo/redo system
Grep: "plugin|extension|addon|register|hook|middleware" — plugin architecture
Grep: "auth|login|session|token|oauth|jwt" — authentication
Grep: "permission|role|access|guard|policy|can\(" — authorization/access control
Grep: "websocket|realtime|subscribe|pubsub|socket\.io" — real-time/collaboration
Grep: "render|canvas|viewport|zoom|pan|transform" — visual canvas/renderer
Grep: "serialize|deserialize|import|export|save|load" — serialization/persistence
Grep: "template|preset|starter|scaffold" — template/preset system
Grep: "theme|style|css|variant|token" — theming/styling system
Grep: "i18n|locale|translate|intl" — internationalization
Grep: "test|spec|mock|fixture|assert" — testing infrastructure
Grep: "cli|command|argv|yargs|commander" — CLI interface
Grep: "api|endpoint|route|handler|controller" — API layer
Grep: "queue|worker|job|task|cron|schedule" — background jobs
Grep: "cache|memo|invalidate|ttl" — caching system
Grep: "search|index|filter|query|fuzzy" — search/filtering
Grep: "upload|file|asset|media|image|blob" — file/asset management
Grep: "notification|toast|alert|snackbar|banner" — notification system
Grep: "form|validate|field|input|schema" — form system
Grep: "modal|dialog|drawer|sheet|overlay" — overlay/modal system
Grep: "table|grid|list|pagination|sort|column" — data display
Grep: "tree|hierarchy|nested|parent|child|depth" — tree/hierarchy
Grep: "shortcut|keybinding|hotkey|accelerator" — keyboard shortcuts
Grep: "settings|preferences|config|option" — settings/configuration
Grep: "version|revision|diff|merge|conflict" — versioning
Grep: "layout|panel|split|resize|dock|tab" — layout management
Grep: "component|block|widget|element" — component registry
```

#### 2c. README/docs signals

The README often lists features explicitly:

```
Grep (in README.md): "feature|support|include|built.in|ship.with|come.with"
```

#### 2d. Build the feature map

From all signals, compile a deduplicated list of **features** (not files). Each feature gets:

- **Name** — short, descriptive (e.g., "Drag-and-drop editor", "Plugin system", "Undo/redo")
- **Description** — one sentence of what it does
- **Confidence** — high (clear code boundary), medium (spread across files), low (inferred from patterns)
- **Estimated complexity** — small (1-5 files), medium (5-20 files), large (20+ files)
- **Key files** — 2-3 entry point files that anchor this feature (internal use, don't show to user)

### Step 3: Present Feature Menu

Show the discovered features to the user using **AskUserQuestion with multiSelect: true**.

Group features into categories for clarity:

```
I scanned the puck repository and found these features:

CORE EDITOR
  [ ] Drag-and-drop composition — drag components from palette onto canvas, reorder, nest
  [ ] Component registry — register, configure, and render pluggable components
  [ ] Inline editing — edit text and properties directly on the canvas
  [ ] Config panel — side panel for editing selected component properties

DATA & STATE
  [ ] Serialization — save/load page data as JSON, import/export
  [ ] Undo/redo — history stack with undo/redo for all editor actions
  [ ] State management — central editor state (selection, hover, drag state)

RENDERING
  [ ] Render engine — render component tree to React output
  [ ] Viewport/preview — preview mode, responsive viewport switching
  [ ] Drop zones — visual insertion indicators and nesting rules

EXTENSIBILITY
  [ ] Plugin API — extend editor behavior via plugins
  [ ] Custom fields — define custom property editor fields
  [ ] Overrides — override default editor UI components

Which features do you want blueprints for?
```

**Rules for the feature menu:**

- Use AskUserQuestion with `multiSelect: true`
- Maximum 10 options per question (AskUserQuestion limit) — so split into multiple questions if there are many features
- Group related features logically
- Show complexity indicators so the user knows what they're selecting
- If there are more than 12 features, present the top-level categories first, then drill down into the selected category

**For very large repos (vscode-scale):**
Present category-level first:

```
This repo has features across many areas. Which areas interest you?
  [ ] Editor core (text editing, cursor, selection, multi-cursor)
  [ ] Extension system (extension host, API, marketplace)
  [ ] Layout (panels, tabs, split views, sidebar, activity bar)
  [ ] Command system (command palette, keybindings, menus)
  [ ] File system (explorer, file operations, search)
  [ ] Debugging (debug adapter, breakpoints, watch)
  [ ] Source control (git integration, diff viewer)
  [ ] Terminal (integrated terminal, shell integration)
```

Then drill into selected areas:

```
You selected "Extension system". Here are the sub-features:
  [ ] Extension host — isolated process for running extensions
  [ ] Extension API — the vscode.* API surface extensions consume
  [ ] Extension marketplace — browse, install, update extensions
  [ ] Extension activation — when/how extensions start and stop
```

### Step 4: Deep Feature Extraction

For EACH selected feature, trace its implementation across the codebase. This is where the heavy reading happens.

#### 4a. Trace the feature boundary

Starting from the key files identified in Step 2, follow imports/exports to map ALL files that participate in this feature:

1. **Read the entry point files** for the feature
2. **Follow imports** — what does this file depend on?
3. **Follow exports** — what consumes this file's API?
4. **Stop at boundaries** — when you hit a file that belongs to a DIFFERENT feature, note the dependency but don't trace further

Use the Explore agent for this:

- "Starting from `src/core/dnd/`, trace all files involved in the drag-and-drop feature"
- "What functions/classes from other modules does the DnD system depend on?"

#### 4b. Extract behavioral constructs

For each feature, read the traced files and extract:

| What to Extract             | Where to Find It                                          | How It Maps to FDL                              |
| --------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| **What data it needs**      | Function parameters, props, state shape, types/interfaces | `fields` — but generalized (no framework types) |
| **What it does on success** | Main code paths, return values, state mutations           | `outcomes` — given/then/result                  |
| **What can go wrong**       | Error handling, edge cases, guard clauses, try/catch      | `outcomes` (error-bound) + `errors`             |
| **What states it has**      | State machines, enums, status fields, mode flags          | `states` — lifecycle/mode definitions           |
| **What rules govern it**    | Validation logic, constraints, thresholds, invariants     | `rules` — business/system rules                 |
| **What it reacts to**       | Event handlers, subscribers, hooks, callbacks             | `events` — triggers and responses               |
| **What it depends on**      | Imports from other features, external services            | `related` — feature dependencies                |
| **Who/what triggers it**    | User interactions, API calls, system events, timers       | `actors` — humans/systems involved              |

#### 4c. Generalize away the framework

This is the KEY difference from `extract-code`. Every extracted construct must be **portable**:

**DO NOT write:**

```yaml
# BAD — coupled to React DnD Kit
given:
  - "DndContext wraps the editor area"
  - "useSortable hook is attached to each component"
then:
  - "onDragEnd fires with active and over IDs"
  - "arrayMove reorders the items array in Zustand store"
```

**DO write:**

```yaml
# GOOD — portable behavior description
given:
  - "user initiates drag on a component in the canvas"
  - "a valid drop target exists at the cursor position"
then:
  - action: transition_state
    field: component_order
    description: "component is moved to the new position in the tree"
  - action: emit_event
    event: editor.component.reordered
    payload: [component_id, old_position, new_position, parent_id]
result: "component appears at the new position, canvas re-renders"
```

**Generalization rules:**

- React hooks → describe the behavior they implement, not the hook name
- Redux/Zustand actions → describe the state change, not the dispatch
- Framework components → describe the UI behavior, not the component tree
- Library calls → describe what the library does, not the API call
- CSS classes → describe the visual behavior, not the class name
- File paths → never reference source paths in the blueprint body (only in header comments)

### Step 5: Present Extraction Summary Per Feature

For each selected feature, show a plain-language summary before generating:

```
FEATURE: Drag-and-Drop Editor
Traced across: 23 files in src/core/dnd/, src/components/DragDropContext/, src/lib/reorder/

HOW IT WORKS:
  1. Components are registered in a palette with metadata (label, icon, default props)
  2. User drags a component from palette → visual ghost follows cursor
  3. Canvas shows drop zone indicators (before, after, inside)
  4. On drop → component is inserted into the content tree at that position
  5. Existing components can be reordered by dragging within the canvas
  6. Nesting rules determine which components can contain which others

DATA IT MANAGES:
  - Content tree (nested array of component instances with props)
  - Drag state (active item, hover target, drop position)
  - Component registry (available component types with schemas)

WHAT CAN GO WRONG:
  - Drop on invalid target → snap back to original position
  - Drop would create circular nesting → rejected
  - Drag cancelled (Escape key) → restore original state

STATES:
  idle → dragging → hovering_target → dropped (+ cancelled branch)

DEPENDS ON:
  - Component registry (to know what's draggable)
  - State management (to persist the content tree)
  - Render engine (to display the result)

Does this look right? Should I adjust anything before creating the blueprint?
```

Use AskUserQuestion: "Does this capture the feature correctly?"

- "Yes, create the blueprint"
- "I want to adjust something"
- "Add more detail about [area]"

### Step 6: Check Existing Blueprints

1. Glob for `blueprints/**/*.blueprint.yaml`
2. Check if a blueprint for this feature already exists
3. If yes — offer to merge, replace, or create with a different name
4. Identify relationships with existing blueprints
5. Determine the best category for each feature:
   - UI capabilities (DnD, canvas, editor) → `ui`
   - Data features (serialization, versioning) → `data`
   - Auth/access features → `auth` / `access`
   - System architecture (plugins, extensions) → `integration`
   - Workflow/process features → `workflow`

### Step 7: Generate Portable Blueprints

Generate one `.blueprint.yaml` per selected feature. Each blueprint must be **framework-agnostic** — describing behavior that could be implemented in React, Vue, Svelte, vanilla JS, or any other stack.

#### Blueprint Template

```yaml
# ============================================================
# {FEATURE_NAME} — Portable Feature Blueprint
# FDL v0.1.0 | Blueprint v1.0.0
# ============================================================
# Extracted from: {repo URL or path}
# Source project: {project name} ({tech stack})
# Files traced: {count}
# ============================================================
# This blueprint describes BEHAVIOR, not implementation.
# It can be used to generate this feature for any framework.
# ============================================================

feature: { feature-name }
version: "1.0.0"
description: { one-line description of the capability }
category: { category }
tags: [{ capability-tags, not framework-tags }]

actors:
  # Who/what interacts with this feature
  # Use generic roles: "user", "editor", "system", "plugin"

fields:
  # Data this feature needs — generic types, no framework types
  # A "content tree" is type: json, not type: ReactNode

states:
  # State machine for the feature's lifecycle/modes
  # e.g., idle → dragging → dropped for a DnD feature

rules:
  # Behavioral rules, constraints, invariants
  # "A component cannot be dropped inside itself" = a rule
  # "Maximum nesting depth is 10" = a rule
  # NOT: "Uses React.memo for performance" (that's implementation)

outcomes:
  # Every behavior path: success + error + edge cases
  # Described as WHAT HAPPENS, not HOW it's coded
  # given: preconditions (user state, system state)
  # then: what changes (state mutations, events emitted)
  # result: what the user sees/gets

errors:
  # Error conditions with user-safe messages

events:
  # Observable events this feature emits
  # Other features/plugins can react to these

related:
  # Dependencies on other features (from this repo or existing blueprints)

extensions:
  # Metadata about the source (for reference, not for code generation)
  source:
    repo: "{repo URL}"
    project: "{project name}"
    tech_stack: "{language + framework}"
    files_traced: { count }
    # Key source files (for humans who want to study the original):
    entry_points:
      - "{relative/path/to/main/file}"
      - "{relative/path/to/another/key/file}"
```

#### Portability checklist for each blueprint:

- [ ] No framework-specific types (no `ReactNode`, `Observable`, `Signal`)
- [ ] No library-specific APIs (no `useDrag`, `createSlice`, `defineStore`)
- [ ] No file path references in rules/outcomes/fields (only in header comments and extensions.source)
- [ ] No CSS/styling details (no colors, spacing, class names)
- [ ] No component names (no `<DndContext>`, `<Sortable>`, `<DropZone>`)
- [ ] Behaviors described in plain English ("component is moved") not code ("arrayMove(items, oldIndex, newIndex)")
- [ ] States described as concepts ("dragging") not implementation ("isDragging === true")
- [ ] A developer reading this blueprint with NO knowledge of the source repo could implement the feature from scratch

### Step 8: Validate and Summarize

1. Write each blueprint to `blueprints/{category}/{feature}.blueprint.yaml`
2. Run `node scripts/validate.js blueprints/{category}/{feature}.blueprint.yaml`
3. If validation fails, fix and re-validate
4. Add `related` cross-references between the generated blueprints

Output a clean summary:

```
Extracted 3 features from puckeditor/puck:

1. blueprints/ui/drag-drop-editor.blueprint.yaml
   Drag-and-drop page composition
   Fields: 6 | States: 4 | Outcomes: 8 | Events: 5
   Validation: PASS

2. blueprints/ui/component-registry.blueprint.yaml
   Pluggable component registration and configuration
   Fields: 5 | States: 2 | Outcomes: 6 | Events: 3
   Validation: PASS

3. blueprints/data/editor-serialization.blueprint.yaml
   Save/load editor content as portable JSON
   Fields: 4 | States: 3 | Outcomes: 5 | Events: 2
   Validation: PASS

Cross-references:
  drag-drop-editor → requires component-registry
  drag-drop-editor → requires editor-serialization
  component-registry ← required by drag-drop-editor

Source: https://github.com/puckeditor/puck (47 files traced)
Clone location: /tmp/fdl-extract-puck (you can delete when done)

Next steps:
  - Run /fdl-generate drag-drop-editor nextjs to build for Next.js
  - Run /fdl-generate drag-drop-editor svelte to build for SvelteKit
  - Extract more features from puck or another repo
```

### Step 9: Cleanup

If a repo was cloned in Step 0:

- Do NOT automatically delete the cloned directory
- Tell the user where the clone lives: "The repo was cloned to `/tmp/fdl-extract-<name>`. You can delete it when you're done."

## Handling Edge Cases

### Repo is a monorepo with many packages

1. List all packages with one-line descriptions
2. Ask which packages to scan for features
3. Scan only selected packages
4. Features may span packages — trace cross-package imports

### Feature is deeply coupled to the framework

Sometimes a feature IS the framework (e.g., React's reconciler). In this case:

1. Extract the **algorithm/behavior** not the framework API
2. Example: React's reconciler → "virtual tree diffing with key-based reconciliation" as a behavioral description
3. Note in the blueprint that the feature is architecturally significant and may require adaptation

### Feature has no clear boundary

If a feature is spread across the entire codebase with no clear entry point:

1. Note this to the user: "The [feature] doesn't have a clean boundary — it's woven throughout the codebase"
2. Ask if they want a best-effort extraction or to skip it
3. If proceeding, extract the behavioral rules and states even if you can't trace every file

### Two features are tightly coupled

If Feature A and Feature B share so much code that they can't be separated:

1. Tell the user: "These two features are tightly coupled in this codebase"
2. Offer options: extract as one combined blueprint, or extract as two with heavy cross-references
3. Note the coupling in the `related` section

### Very large repo (1000+ files)

1. Rely heavily on directory structure and README for feature discovery
2. Use Grep for behavioral signals — don't try to read every file
3. Present top-level categories first, then drill into selected categories
4. For each selected feature, use the Explore agent to trace the boundary — don't manually read hundreds of files

### Source code is poorly structured

If the repo has no clear architecture (everything in one folder, no separation):

1. Rely more on behavioral Grep signals than directory structure
2. Feature boundaries will be fuzzy — flag this to the user
3. Extract what you can and note "Feature boundary is unclear in the source — this blueprint is a best-effort interpretation"

### Feature uses novel patterns not in the signal list

The behavioral signals in Step 2b don't cover everything. If you discover features during README reading or architecture mapping that weren't caught by Grep:

1. Add them to the feature list
2. Use the Explore agent to find the implementation
3. The signal list is a starting point, not exhaustive

## Extraction Quality Checklist

### Portability

- [ ] No framework-specific terms in fields, rules, outcomes, or states
- [ ] No library API references in behavioral descriptions
- [ ] No source file paths in blueprint body (only in header/extensions)
- [ ] A developer unfamiliar with the source repo could implement from this blueprint
- [ ] Blueprint works as input to `/fdl-generate` for ANY framework

### Accuracy

- [ ] Every extracted rule corresponds to actual code behavior
- [ ] States match the actual state machine in the code
- [ ] Outcomes cover both success and error paths observed in the code
- [ ] No invented features — only what the code actually implements
- [ ] Complexity/scope matches the source (don't oversimplify or over-elaborate)

### Completeness

- [ ] All user-selected features were extracted
- [ ] Each feature has: fields, rules, outcomes, and events at minimum
- [ ] Error handling paths were captured
- [ ] Cross-feature dependencies were identified and recorded in `related`
- [ ] Edge cases from the source code were captured as outcomes

### FDL Compliance

- [ ] Feature name: kebab-case
- [ ] Field names: snake_case
- [ ] Error codes: UPPER_SNAKE_CASE
- [ ] Event names: dot.notation
- [ ] Actor IDs: snake_case
- [ ] All required top-level fields present
- [ ] Validates with `node scripts/validate.js`
