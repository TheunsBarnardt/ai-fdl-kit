---
name: fdl-extract-code
description: Extract features, rules, and requirements from a codebase (local folder or git repo) into FDL blueprints
user_invocable: true
command: fdl-extract-code
arguments: "<path-or-repo-url> [feature-name] [category]"
---

# FDL Extract Code — Codebase to Blueprint

Analyze an existing codebase (local folder or git repository URL) and reverse-engineer the implemented features, business rules, fields, states, validation, error handling, and workflows into complete FDL blueprint YAML files. The user does NOT need to know YAML — use plain language throughout.

## Core Principle: Plain Language, No YAML Jargon

- NEVER show raw YAML during the conversation
- NEVER use FDL-specific terms with the user (outcomes, flows, events, etc.)
- DO use AskUserQuestion to clarify ambiguities found in the code
- DO present extracted information as plain-English bullet points
- DO generate YAML silently behind the scenes
- DO flag things the code doesn't make clear — ask the user rather than guessing

## Usage

```
/fdl-extract-code ./src/auth login auth
/fdl-extract-code C:/projects/my-app/src checkout payment
/fdl-extract-code https://github.com/org/repo.git payments integration
/fdl-extract-code https://github.com/org/repo checkout payment
/fdl-extract-code ../other-project
```

## Arguments

- `<path-or-repo-url>` — Local folder path OR a git repository URL (HTTPS). If a git URL, the repo will be cloned to a temp directory.
- `[feature-name]` — Optional kebab-case name. If omitted, infer from the folder/repo name and code structure, or ask.
- `[category]` — Optional. One of: auth, data, access, ui, integration, notification, payment, workflow. If omitted, infer or ask.

## Workflow

### Step 0: Resolve Input Source

**If the input is a git URL:**
1. Clone the repo to a temporary directory:
   ```bash
   git clone --depth 1 <url> /tmp/fdl-extract-<repo-name>
   ```
   - Use `--depth 1` for speed — we only need the current state, not history
   - If a specific branch is needed, add `--branch <branch>`
   - For GitHub URLs without `.git` suffix, append `.git` automatically
   - For GitHub URLs with paths (e.g., `github.com/org/repo/tree/main/src`), clone the repo and focus on the subfolder
2. Set the working path to the cloned directory (or subfolder if specified in the URL)

**If the input is a local path:**
1. Verify the path exists using Glob
2. If the path points to a specific subdirectory (e.g., `./src/auth`), focus analysis there but still check the project root for config files, package manifests, and shared utilities

### Step 1: Discover Project Structure

Map the codebase to understand its architecture before diving into details.

1. **Identify the tech stack** — check for project manifests and config files:
   ```
   Glob: package.json, requirements.txt, Pipfile, Cargo.toml, go.mod, pom.xml,
         build.gradle, Gemfile, composer.json, *.csproj, pubspec.yaml,
         tsconfig.json, .eslintrc*, Dockerfile, docker-compose*
   ```

2. **Identify the framework** — check for framework-specific patterns:
   | Framework | Signals |
   |-----------|---------|
   | Express/Fastify/Koa | `app.get()`, `router.post()`, route files |
   | Next.js/Nuxt | `pages/` or `app/` directory, `next.config.*` |
   | Django | `settings.py`, `urls.py`, `models.py`, `views.py` |
   | Rails | `config/routes.rb`, `app/models/`, `app/controllers/` |
   | Spring Boot | `@RestController`, `@Entity`, `application.properties` |
   | Laravel | `routes/web.php`, `app/Models/`, `app/Http/Controllers/` |
   | ASP.NET | `Controllers/`, `Models/`, `Startup.cs`, `Program.cs` |
   | Flask | `@app.route()`, `flask` imports |
   | FastAPI | `@app.get()`, `@router.post()`, Pydantic models |
   | Go (Chi/Gin/Echo) | `r.Get()`, `r.Post()`, handler functions |
   | Rust (Actix/Axum) | `web::get()`, `Router::new()`, handler functions |

3. **Map the directory structure** — use Glob to find key patterns:
   ```
   Glob: **/models/**,  **/entities/**,  **/schemas/**
   Glob: **/routes/**,  **/controllers/**, **/handlers/**,  **/api/**
   Glob: **/middleware/**, **/guards/**, **/interceptors/**, **/policies/**
   Glob: **/validators/**, **/validation/**
   Glob: **/services/**,  **/repositories/**, **/providers/**
   Glob: **/migrations/**, **/seeds/**
   Glob: **/tests/**,  **/specs/**,  **/__tests__/**
   Glob: **/types/**,  **/interfaces/**, **/dto/**
   Glob: **/events/**,  **/listeners/**, **/subscribers/**
   Glob: **/config/**,  **/constants/**
   ```

4. **Build a file inventory** — count files by type and directory to understand scope:
   - If the codebase is very large (200+ source files in scope), ask the user which feature areas to focus on
   - If the path points to a specific feature folder (e.g., `./src/auth`), that's already scoped

### Step 2: Deep Code Analysis

Read the relevant source files and extract FDL constructs. Use the Explore agent for broad searches and Read for targeted file analysis.

#### What to extract from each code layer:

| Code Layer | Files to Read | What to Extract |
|------------|--------------|-----------------|
| **Models / Entities / Schemas** | Model definitions, ORM schemas, database migrations, Prisma/TypeORM/Sequelize/Django models | **Fields** — name, type, required, validation, defaults, relationships. **States** — enum fields that represent lifecycle (status, state). |
| **Routes / Controllers / Handlers** | Route definitions, controller actions, API handlers | **Outcomes** — each route = an outcome. Extract HTTP method, path, preconditions (auth, roles, validation), success response, error responses. |
| **Middleware / Guards / Policies** | Auth middleware, rate limiters, CORS config, role guards, permission checks | **Rules** — security rules, access control, rate limits. Map to `rules.security` and `rules.access`. |
| **Validators / DTOs** | Request validation schemas (Joi, Zod, class-validator, Pydantic, JSON Schema) | **Fields** — validation rules, constraints, patterns, min/max. Refine field definitions from models. |
| **Services / Business Logic** | Service classes, use cases, domain logic | **Rules** — business rules, conditional logic, thresholds. **Outcomes** — complex operations that span multiple steps. |
| **Error Handling** | Custom error classes, error middleware, error constants | **Errors** — error codes, HTTP status codes, error messages. Map to UPPER_SNAKE_CASE codes. |
| **Events / Listeners** | Event emitters, pub/sub, message queue handlers, webhook handlers | **Events** — event names, payloads, triggers. **Actors** — external systems that send/receive events. |
| **Tests / Specs** | Test files, especially integration and e2e tests | **Outcomes** — test descriptions ARE acceptance criteria. "it should reject expired tokens" = an outcome. |
| **Migrations / Seeds** | Database migrations, seed data | **Fields** — column types, constraints, indexes. **States** — enum values defined in migrations. |
| **Config / Constants** | Environment config, feature flags, constants files | **Rules** — configurable thresholds, limits, feature toggles. |
| **Types / Interfaces** | TypeScript interfaces, Go structs, Rust types, Java POJOs | **Fields** — type definitions, optional/required markers. |

#### Language-specific extraction patterns:

**JavaScript / TypeScript:**
```
Grep: "router\.(get|post|put|patch|delete)" — route definitions
Grep: "app\.(get|post|put|patch|delete)" — route definitions
Grep: "@(Get|Post|Put|Patch|Delete|Guard|UseGuards|Middleware)" — NestJS decorators
Grep: "z\.(string|number|boolean|object|array|enum)" — Zod schemas
Grep: "Joi\.(string|number|boolean|object|array)" — Joi validation
Grep: "@(Column|Entity|PrimaryColumn|OneToMany|ManyToOne)" — TypeORM
Grep: "mongoose\.Schema|new Schema" — Mongoose models
Grep: "prisma\.(create|find|update|delete)" — Prisma operations
Grep: "throw new.*Error|createError|HttpException" — error definitions
Grep: "emit\(|on\(|addEventListener" — event patterns
Grep: "status\(4[0-9]{2}\)|status\(5[0-9]{2}\)" — HTTP error responses
```

**Python:**
```
Grep: "@app\.(route|get|post|put|patch|delete)" — Flask/FastAPI routes
Grep: "class.*Model|class.*Schema" — Django/Pydantic/SQLAlchemy models
Grep: "class.*Serializer" — DRF serializers
Grep: "class.*Permission|has_permission" — permission classes
Grep: "raise.*Error|raise.*Exception|HTTPException" — error handling
Grep: "signal\.|@receiver" — Django signals
Grep: "class.*Form" — Django forms (field validation)
```

**Go:**
```
Grep: "func.*Handler|func.*handler|http\.Handle" — handlers
Grep: "type.*struct" — data structures
Grep: "func.*Middleware|func.*middleware" — middleware
Grep: "errors\.New|fmt\.Errorf" — error definitions
```

**Java / Kotlin:**
```
Grep: "@(RestController|Controller|RequestMapping|GetMapping|PostMapping)" — Spring controllers
Grep: "@Entity|@Table|@Column" — JPA entities
Grep: "@Valid|@NotNull|@NotBlank|@Size|@Pattern" — Bean validation
Grep: "@PreAuthorize|@Secured|@RolesAllowed" — security annotations
```

**Ruby:**
```
Grep: "class.*Controller|def (create|update|destroy|index|show)" — Rails controllers
Grep: "validates|validate|has_many|belongs_to" — ActiveRecord models
Grep: "before_action|after_action|around_action" — controller callbacks
```

**C# / .NET:**
```
Grep: "\[Http(Get|Post|Put|Patch|Delete)\]" — API controllers
Grep: "\[Required\]|\[StringLength\]|\[Range\]" — data annotations
Grep: "class.*Entity|class.*Model" — entity models
```

### Step 3: Map Code to FDL Constructs

After reading the code, systematically map what you found:

#### Models/Schemas → Fields
```
Database column / model field → FDL field
  - Column type → FDL type (varchar→text, int→number, bool→boolean, etc.)
  - NOT NULL / required → required: true
  - Default values → note in description
  - Unique constraints → validation rule
  - Foreign keys → relationship (note in related)
  - Enum columns → select type with allowed values, OR states if it's a lifecycle
```

#### Routes/Controllers → Outcomes
```
Each API endpoint → one or more outcomes:
  - Route guard / auth check → given (precondition)
  - Request validation → given (field validation conditions)
  - Success response → result
  - Error responses → error outcomes with error binding
  - Database writes → then (set_field, create_record, etc.)
  - Events emitted → then (emit_event)
  - State changes → then (transition_state)
```

#### Middleware → Rules
```
Auth middleware → rules.security.authentication
Rate limiter → rules.security.rate_limit
CORS config → rules.security.cors
Role/permission checks → rules.access
Input sanitization → rules.security.input_sanitization
```

#### Test Descriptions → Outcomes (supplementary)
```
"it should return 401 when token is expired" → outcome: token_expired (error)
"it should create a new user" → outcome: user_created (success)
"it should not allow duplicate emails" → outcome: duplicate_email (error)
```

#### Error Classes → Errors
```
Custom error class → FDL error entry:
  - Class name → derive UPPER_SNAKE_CASE code
  - HTTP status → status field
  - Error message → message field (ensure user-safe)
  - Error code constant → code field
```

#### Event Emitters → Events
```
event.emit('user.created', payload) → FDL event:
  - Event name → dot.notation name
  - Payload fields → payload array
  - Handler/listener → note what happens on this event
```

### Step 4: Present Extraction Summary

Before generating, show the user what was found **in plain language**:

```
Here's what I found in the codebase at ./src/auth:

TECH STACK:
  Node.js + Express + TypeScript + Prisma + PostgreSQL

FILES ANALYZED:
  14 files — 3 models, 4 routes, 2 middleware, 3 services, 2 test files

DATA THE FEATURE NEEDS:
  8 fields — email, password, first_name, last_name, role, status, last_login, refresh_token

WHAT SHOULD HAPPEN:
  ✓ User registers → account created, verification email sent
  ✓ User logs in → JWT issued, refresh token stored
  ✓ Token refreshed → new access token issued
  ✓ User logs out → refresh token invalidated
  ✗ Invalid credentials → 401 with generic message (no email enumeration)
  ✗ Account locked → 403 after 5 failed attempts
  ✗ Token expired → 401, must re-authenticate

WHO'S INVOLVED:
  2 actors — User (human), Auth Service (system)

LIFECYCLE:
  pending_verification → active → suspended → deactivated

RULES & CONSTRAINTS:
  - Passwords: bcrypt hashed, min 8 chars, must contain uppercase + number
  - Rate limiting: 5 login attempts per 15 minutes per IP
  - JWT: 15-minute access token, 7-day refresh token
  - Sessions: single active session per user (configurable)

FROM THE TESTS:
  12 test cases found — all mapped to success/error scenarios above

⚠ THINGS THE CODE DOESN'T MAKE CLEAR:
  - Password reset flow exists in routes but implementation is incomplete (TODO comment)
  - Role-based access is defined but only "user" and "admin" roles are used
```

**Use AskUserQuestion** to clarify:
1. Ambiguous items found in the code (TODO comments, incomplete implementations)
2. Whether to create one combined blueprint or separate blueprints per feature area
3. Which category best fits (if not provided as argument)
4. Whether to include incomplete/WIP features or skip them

**Two-question maximum** — ask only what you genuinely don't know; use the code as the source of truth for defaults.

Wait for user confirmation before proceeding.

### Step 5: Check Existing Blueprints

1. Glob for `blueprints/**/*.blueprint.yaml`
2. Parse all existing blueprints
3. Check if this feature name already exists (warn if so — offer to merge or create new)
4. Identify relationships:
   - Does any existing blueprint reference this feature?
   - Should this blueprint reference existing ones?
5. Show the dependency graph

### Step 6: Generate the Blueprint(s)

Generate complete `.blueprint.yaml` file(s) following the FDL meta-schema.

#### Single vs Multiple Blueprints

If the codebase covers multiple distinct feature areas (e.g., auth has login, registration, password-reset as separate flows), ask the user:
- **Combined:** One blueprint with all operations as outcomes
- **Separate:** Multiple blueprints, one per feature area, with `related` cross-references

Default to **combined** unless the features are clearly independent (separate models, separate route groups, no shared state).

#### Blueprint Template

```yaml
# ============================================================
# {FEATURE_NAME} — Feature Blueprint
# FDL v0.1.0 | Blueprint v1.0.0
# ============================================================
# Extracted from: {source path or repo URL}
# Tech stack: {framework + language + database}
# Files analyzed: {count}
# ============================================================

feature: {feature-name}
version: "1.0.0"
description: {one-line description}
category: {category}
tags: [{relevant, tags}]

actors:
  # Systems, services, and roles identified in the code

fields:
  # Fields from models/schemas/DTOs with types and validation
  # Include source file as YAML comments

states:
  # Lifecycle enums from models/migrations

rules:
  # Business rules from middleware, services, config
  # Source: {file:line} — description of the rule

sla:
  # Timeouts, TTLs, rate limit windows from config/constants

outcomes:
  # Routes/handlers mapped to given/then/result format
  # Test descriptions used to validate completeness
  # Error responses as error-bound outcomes

flows:
  # Only if the code has multi-step orchestration (sagas, workflows)

errors:
  # UPPER_SNAKE_CASE codes from error classes/constants

events:
  # Event emitters/listeners with payloads

related:
  # Connections to existing blueprints

extensions:
  # Framework-specific details
  tech_stack:
    language: "{language}"
    framework: "{framework}"
    database: "{database}"
    orm: "{ORM if any}"
```

#### Source traceability

Add YAML comments that reference the source file and line:

```yaml
rules:
  security:
    rate_limit:
      max_attempts: 5
      window: "15m"
      # Source: src/middleware/rateLimiter.ts:12
      # RateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })
```

### Step 7: Validate and Summarize

1. Write the file(s) to `blueprints/{category}/{feature}.blueprint.yaml`
2. Run `node scripts/validate.js blueprints/{category}/{feature}.blueprint.yaml`
3. If validation fails, fix the issues and re-validate
4. If cross-reference warnings appear, note them in the output

Output a clean summary:

```
Created: blueprints/auth/login.blueprint.yaml
Source:  ./src/auth (14 files analyzed)
Stack:   Node.js + Express + TypeScript + Prisma

Feature: login v1.0.0
Actors:  2 (user, auth_service)
Fields:  8 (email, password, first_name, last_name, role, status, ...)
States:  4 (pending_verification → active → suspended → deactivated)
Outcomes: 7 (3 success, 4 error scenarios)
Errors:  5
Events:  3

Validation: PASS

Files analyzed:
  ✓ src/auth/models/user.model.ts — fields, states
  ✓ src/auth/routes/auth.routes.ts — outcomes
  ✓ src/auth/middleware/auth.middleware.ts — rules
  ✓ src/auth/services/auth.service.ts — business logic
  ✓ src/auth/tests/auth.test.ts — outcome validation
  ...

⚠ Items that could not be mapped:
  - Password reset flow — incomplete implementation (TODO in code)
  - OAuth providers — config exists but no handler code

💡 Suggested next steps:
  - Create blueprints for incomplete features: password-reset, oauth-login
  - Run /fdl-generate login nextjs to generate a fresh implementation from the blueprint
  - Compare generated code against original to find gaps
```

### Step 8: Cleanup (git repos only)

If a repo was cloned in Step 0:
- Do NOT automatically delete the cloned directory — the user may want to reference it
- Tell the user where the clone lives: "The repo was cloned to `/tmp/fdl-extract-<name>`. You can delete it when you're done."

## Handling Edge Cases

### Codebase has no clear framework
If the code doesn't use a recognizable framework (plain scripts, microservices, CLIs):
1. Focus on the file structure and naming patterns
2. Look for entry points (`main`, `index`, `app`, `server`)
3. Follow imports/requires to map the dependency graph
4. Extract what you can — fields from data structures, rules from conditional logic

### Codebase is a monorepo
If the repo contains multiple services/packages:
1. List all packages/services found
2. Ask the user which one(s) to extract
3. Analyze each selected service independently
4. Create separate blueprints with `related` cross-references

### Codebase has no tests
If there are no test files:
1. Note this in the summary — test descriptions are a valuable source of outcomes
2. Rely more heavily on route definitions and error handling for outcome extraction
3. Suggest the user run `/fdl-generate` from the blueprint, then compare with the original code

### Code is heavily commented
If the code has detailed comments explaining business rules:
1. Extract comments alongside the code they annotate
2. Use comment text for rule descriptions and YAML comments
3. Comments often contain the "why" that pure code doesn't show

### Code has TODO/FIXME/HACK comments
1. Flag these to the user — they indicate incomplete or known-broken features
2. Ask whether to include the intended behavior (from the TODO) or only what's implemented
3. Note TODOs in the "items that could not be mapped" section

### Code uses environment variables for configuration
1. Check `.env.example`, `.env.sample`, or `.env.template` (never `.env` itself)
2. Extract configurable values (thresholds, limits, feature flags)
3. Map to FDL rules with the env var name as a comment

### Multiple languages in one repo (e.g., backend + frontend)
1. Identify each language/framework
2. Ask the user which layer to extract (or both)
3. Backend → focus on API routes, models, business logic
4. Frontend → focus on form fields, validation, state management, API calls

### Private git repos
If the git clone fails due to authentication:
1. Tell the user: "The repo requires authentication. You can either:"
   - Clone it yourself and point me to the local path
   - Ensure your git credentials are configured for this URL
2. Never ask for or handle git credentials directly

## Extraction Quality Checklist

### Accuracy
- [ ] Every extracted rule references its source file and line number
- [ ] Thresholds and limits match the code exactly (don't round or approximate)
- [ ] Field names are derived from the code's actual variable/column names
- [ ] No requirements were invented — only what the code implements
- [ ] Validation rules match the actual validators (Zod schemas, Joi, decorators, etc.)

### Completeness
- [ ] All models/schemas in scope were analyzed
- [ ] All routes/controllers in scope were analyzed
- [ ] All middleware/guards were analyzed
- [ ] Error handling was captured (custom errors, HTTP status codes)
- [ ] Events/listeners were captured
- [ ] Test descriptions were used to validate outcome completeness
- [ ] Config/constants were checked for thresholds and limits
- [ ] Ambiguous or incomplete code was flagged, not silently dropped

### FDL Compliance
- [ ] Feature name: kebab-case
- [ ] Field names: snake_case
- [ ] Error codes: UPPER_SNAKE_CASE
- [ ] Event names: dot.notation
- [ ] Actor IDs: snake_case
- [ ] All required top-level fields present
- [ ] Comments explain WHY, referencing the source file

## Automatic Post-Extraction Workflow

**After Step 7 (blueprints written and validated), this must happen automatically:**

1. **Validate all blueprints:**
   ```bash
   node scripts/validate.js
   ```
   - If validation passes → proceed to Step 2
   - If validation fails → fix issues and re-validate until PASS

2. **Generate documentation and JSON API:**
   ```bash
   npm run generate
   ```
   - Regenerates all `docs/blueprints/**/*.md` files
   - Regenerates all `docs/api/**/*.json` files and `registry.json`
   - Ensures documentation is always in sync with blueprints

3. **Create git commit:**
   ```bash
   git add -A
   git commit -m "Extract/Update [feature-names]: [brief description]

   - [Extracted/Updated] [feature-name] ([category])
   - [Extracted/Updated] [feature-name] ([category])

   [One-line summary of why this change matters]

   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
   ```
   - Update README.md badge (if blueprint count changed)
   - Update llms.txt (if blueprints added/removed)
   - Commit message must reference all extracted features

**THIS MUST HAPPEN AUTOMATICALLY — the user should never need to ask for validation, generation, or commit. The extraction skill completes only when all three steps succeed.**

If validation fails, fix issues silently and re-validate. Do not surface validation errors to the user without attempting fixes first.
