---
name: fdl-generate
description: Generate implementation code from an FDL blueprint for a specific framework
user_invocable: true
command: fdl-generate
arguments: "<feature> <framework>"
---

# FDL Generate — Code Generation from Blueprints

Generate a complete implementation from an FDL blueprint. Your job is to produce code that **satisfies every outcome** in the blueprint. The outcomes tell you WHAT must be true — you decide HOW to implement it for the target framework.

## Usage

```
/fdl-generate login nextjs
/fdl-generate signup laravel
/fdl-generate password-reset express
/fdl-generate login angular
/fdl-generate signup csharp
/fdl-generate expense-approval rust
```

## Arguments

- `<feature>` — The blueprint feature name (e.g., `login`, `signup`, `password-reset`)
- `<framework>` — Target language or framework (e.g., `nextjs`, `express`, `laravel`, `angular`, `csharp`, `rust`, `python`, `go`, `flutter`, or any other)

## How to Think About Code Generation

**DO NOT treat this as a recipe to follow step by step.**

Instead, think of it like this:
1. Read the `outcomes` — these are your acceptance criteria, sorted by `priority` (lower = check first)
2. Read the `rules` — these are your constraints (security, business logic)
3. Read the `fields` — these are your data model
4. Read the `errors` — these are the error responses you must return
5. Now write the code that makes ALL of it true, using the best patterns for the target framework

The blueprint tells you WHAT. You decide HOW based on the framework.

## Handling Structured Outcomes

Outcomes may use structured conditions and side effects. Here's how to translate them to code:

### Priority → execution order
Outcomes with `priority: 1` are checked FIRST (rate limit, validation). `priority: 10` is checked last (success). Generate guard clauses in this order.

### Structured conditions → guard clauses
- `field` + `source` tells you WHERE to get the data (input = request body, db = database query, session = auth state, computed = derived)
- `operator` tells you the comparison (eq → ===, gt → >, matches → regex test, exists → != null)
- `value` is the comparand

### AND/OR groups → logical expressions
- Top-level given[] items are AND (all must pass)
- `any:` groups are OR (at least one must pass)
- `all:` groups are nested AND

```typescript
// any: [user not_exists, password neq stored_hash]
if (!user || !(await bcrypt.compare(password, user.hash))) { ... }

// all: [status eq active, email_verified eq true]  (default AND)
if (user.status === 'active' && user.email_verified) { ... }
```

### Structured side effects → function calls
- `action: set_field` → database update or variable assignment
- `action: emit_event` → event bus / console.log placeholder
- `action: transition_state` → status field update with validation
- `action: notify` → email/push service call
- `action: invalidate` → token/session revocation
- `action: create_record` → database insert
- `action: call_service` → external API call

When `when:` is present on a side effect, wrap it in a conditional.

## Step 0: Load the Blueprint

Before asking any questions, load the blueprint for `<feature>`:

1. **Local first:** Try `Read blueprints/{category}/{feature}.blueprint.yaml` — check common categories: auth, data, access, ui, integration, notification, payment, workflow, trading, infrastructure, observability.
   - If you don't know the category, Glob `blueprints/**/{feature}.blueprint.yaml` to find it.
2. **Remote fallback (no local blueprints):** If the file doesn't exist locally (you're working in a new project outside the FDL repo):
   - First find the category: `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json` — search the array for `feature === "<feature>"` to get its `category`.
   - Then fetch the full blueprint: `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints/{category}/{feature}.json`
3. If the blueprint still can't be found locally or remotely, tell the user: "No blueprint found for '{feature}'. Run `/fdl-create {feature}` first to define it."

**The blueprint JSON from the API has the same structure as the YAML** — same fields, outcomes, rules, errors, events. Use it identically.

**After loading the blueprint**, also check for project config:
- `Read fdl.config.yaml` if it exists — use `stack.*` and `conventions.*` to drive all code generation decisions (framework, database ORM, import style, test framework, etc.)
- Config values answer the "How should I handle the database?" question automatically — skip that question if the answer is in the config.

---

## Conversation with the User (max 2 questions)

Use AskUserQuestion. Only ask what changes the generated code.

**Question 1 — Scope** (if there are related features):
"Generate just {feature}, or include related features?"
- "{feature} only"
- "Include required features too ({list})"
- "Include all related features ({list})"

**Question 2 — Database** (if the feature needs persistence):
"How should I handle the database?"
- "Use mock/demo data (I'll swap in a real database later)"
- "Prisma (PostgreSQL)"
- "Drizzle (PostgreSQL)"
- "MongoDB/Mongoose"

Skip if frontend-only. Don't ask more questions — use smart defaults.

## AGI-Readiness Integration (automatic when `agi` section exists)

After loading the blueprint, check if it has an `agi` section. If it does, **automatically** ask the user plain-English questions using AskUserQuestion. **NEVER use technical terms like autonomy, invariants, acceptance tests, deprecation, tradeoffs, AGI, or monitoring.** Translate everything into simple, human language.

**CRITICAL: The user knows NOTHING about AGI, YAML, or blueprints. Write questions like you're talking to a business owner, not a developer.**

### Step 1: Control question (from `agi.autonomy`)

Read `agi.autonomy` and ask in plain English:

"How much control do you want over this feature?"
- "Handle everything automatically" 
- "Let it run but I want to review important actions like: {rewrite human_checkpoints in plain English}"
- "I want to approve every step"

Example: if `human_checkpoints` says "before disabling an account permanently", the option reads: "Let it run but I want to review things like disabling accounts"

### Step 2: Priority question (from `agi.tradeoffs`)

Combine all tradeoffs into ONE plain-English question. Don't mention "tradeoffs":

"What matters more for your app?"
- For each tradeoff entry, create a plain option. Example:
  - If `prefer: security, over: performance, reason: "constant-time comparison prevents timing attacks"` → option: "Maximum security even if it's slightly slower (recommended)"
  - The other side: "Fastest possible speed, standard security"

### Step 3: Testing question (from `agi.verification`)

Don't say "acceptance tests" or "invariants". Say:

"This feature comes with {N} built-in quality checks. Want me to generate test code to make sure everything works correctly?"
- "Yes — include the tests"
- "No — just build the feature"

### Step 4: Modernization question (from `agi.evolution.deprecation`)

Don't say "deprecation" or "migration". Translate to plain English:

"The '{field}' option is being phased out. The newer approach is: {rewrite migration in plain English}. Want me to use the newer approach?"
- "Yes — use the newer way"
- "No — keep it as is for now"

Example: if `field: remember_me, migration: "use refresh token rotation with configurable TTL instead"` → "The 'remember me' checkbox is being replaced with a smarter system that keeps you logged in automatically. Want me to use the newer approach?"

### Step 5: Safety question (from `agi.safety`)

If the blueprint has `agi.safety.action_permissions`, present a summary and ask:

"Some actions in this feature have special permission levels:"
- For each action_permission, describe it in plain English:
  - If `autonomous`: "{action} — runs automatically"
  - If `supervised`: "{action} — runs but you'll see a log entry"
  - If `human_required`: "{action} — needs your approval every time"
- If there's a cooldown: add "(at most once every {cooldown})"
- If there's max_auto_decisions: add "(auto-approved up to {N} times, then asks you)"

Then ask: "Does this look right?"
- "Looks good" (keep as-is)
- "I want more control" (upgrade all `autonomous` → `supervised`, `supervised` → `human_required`)
- "I want less control" (downgrade all `human_required` → `supervised`, `supervised` → `autonomous`)

### Step 6: Logging question (from `agi.explainability`)

If the blueprint has `agi.explainability`, ask:

"This feature can keep a detailed log of every decision it makes. Want to turn on decision logging?"
- "Yes — log everything" (set `log_decisions: true`, `reasoning_depth: full`)
- "Just the important ones" (use only `audit_events` — generate logging only for those specific decisions)
- "No logging needed" (skip all explainability code)

### How answers shape the code (internal — don't explain this to the user)

- **Control** → Generates approval screens or automated flows based on choice
- **Priority** → Shapes code decisions (e.g., security-first → constant-time everything)
- **Testing** → If yes, generates test files from `acceptance_tests` (each → test case) and `invariants` (each → assertion)
- **Modernization** → Uses new patterns or keeps old ones
- **Safety** → Generates permission checks, approval gates, and cooldown enforcement per action
- **Logging** → Generates audit middleware or decision logging based on `audit_events` schema
- **Additionally, always silently apply:**
  - `agi.verification.monitoring` → generate health-check endpoints
  - `agi.boundaries` → enforce execution order in generated code
  - `agi.capabilities` → document dependencies in code comments
  - `agi.goals` → add goal comments: `// GOAL: {description} — target: {metric} {target}`
  - `agi.evolution.triggers` → add TODO comments: `// TODO: if {condition}, consider {action}`
  - `agi.coordination.exposes` → add interface comments: `// EXPOSES: {capability} — {contract}`
  - `agi.coordination.consumes` → add dependency comments: `// CONSUMES: {capability} from {from} — fallback: {fallback}`
  - `agi.learning.signals` → add monitoring comments: `// MONITOR: {metric} (window: {window}, baseline: {baseline})`
  - `agi.learning.adaptations` → add TODO comments: `// TODO: experiment "{experiment}" when {when}`

**If the blueprint has NO `agi` section, skip all of this silently.**

---

## Code Generation: Outcome-Driven Approach

For each outcome in the blueprint, your generated code must:

1. **Check every `given` condition** — these become guards/validations in your code
2. **Perform every `then` action** — these become the side effects (DB writes, events, notifications)
3. **Produce the `result`** — this becomes the response (redirect, error message, return value)

### Example: Translating a Structured Outcome to Code

**Blueprint outcome (with priority, sources, AND/OR, structured effects):**
```yaml
invalid_credentials:
  priority: 4
  given:
    - any:                              # OR group
        - field: user
          source: db
          operator: not_exists
        - field: password
          source: input
          operator: neq
          value: stored_hash
  then:
    - action: set_field
      target: failed_login_attempts
      value: "increment"
    - action: emit_event
      event: login.failed
      payload: [email, timestamp, ip_address, attempt_count, reason]
    - action: set_field
      target: locked_until
      value: "now + 15 minutes"
      when: "failed_login_attempts >= 5"
  result: show "Invalid email or password" (SAME message for both cases)
```

**Generated code (any language — this example is TypeScript):**
```typescript
// FDL outcome: invalid_credentials (priority: 4)
// Given: any[user not_exists, password neq stored_hash]
if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
  // Then: set_field failed_login_attempts = increment
  const newAttempts = (user?.failed_login_attempts ?? 0) + 1;

  // Then: set_field locked_until (when: attempts >= 5)
  const lockUntil = newAttempts >= 5
    ? new Date(Date.now() + 15 * 60_000)
    : null;
  await updateLoginAttempts(user?.id, newAttempts, lockUntil);

  // Then: emit_event login.failed
  await emitLoginFailed({ email, timestamp: new Date(), ip_address, attempt_count: newAttempts, reason: !user ? "not_found" : "wrong_password" });

  // Result: same error for both cases (enumeration prevention)
  return { success: false, error: AUTH_ERRORS.LOGIN_INVALID_CREDENTIALS };
}
```

**What the code generator did:**
- `any:` group → `||` in the if condition
- `source: db` → looked up via database query earlier in the function
- `source: input` → came from the request body
- `action: set_field` → database update call
- `action: emit_event` → event emitter call with specified payload
- `when:` on a side effect → wrapped in a conditional
- `priority: 4` → this guard runs after rate-limit (1), lock-check (2), and disabled-check (3)

## What to Generate

For each feature, produce these files (adapt to framework conventions):

**Backend:**
- Business logic — the core: every outcome becomes a code path
- Validation — server-side, from `fields[].validation`
- Types — interfaces from `fields`, `errors`, `events`
- Route/action — the entry point that calls business logic

**Frontend (when ui_hints exist):**
- Form component — fields from `fields`, client validation, accessibility
- Page — renders the form with layout from `ui_hints`
- Error handling — maps error codes to user-facing messages

**Don't generate:**
- Tests (unless the user asks)
- Documentation (the blueprint IS the documentation)
- Migration files (the user handles their own DB schema)

## Self-Check: Outcome Coverage

After generating ALL code, verify every outcome is covered. Go through each one:

```
outcomes.successful_login:
  given: email valid? ✓ (validation in validateLoginInput)
  given: user exists? ✓ (lookupUserByEmail check)
  given: password matches? ✓ (bcrypt.compare)
  given: not locked? ✓ (locked_until check)
  given: not disabled? ✓ (status check)
  given: email verified? ✓ (email_verified check)
  then: reset counter? ✓ (updateLoginAttempts(0))
  then: create tokens? ✓ (createSession)
  then: emit event? ✓ (emitLoginSuccess)
  result: redirect /dashboard? ✓ (redirect in action)

outcomes.invalid_credentials:
  given: user not found or wrong password? ✓ (both return same error)
  then: increment counter? ✓
  then: lock if >= 5? ✓
  then: emit event? ✓
  result: same error message? ✓ (LOGIN_INVALID_CREDENTIALS for both)

[...continue for every outcome]
```

If ANY check fails, fix the code before outputting.

Also verify:
- Every `rules.security` constraint is enforced (rate limits, constant-time, etc.)
- Every `errors` entry has a code path that can trigger it
- Every `events` entry is emitted somewhere
- If `states` exists, transitions are enforced
- If `actors` exist, authorization checks match

## Output to User

Show a clean summary (no YAML, no implementation details):

```
Generated: login for Next.js (App Router)

FILES:
  src/app/(auth)/login/page.tsx          — Page
  src/app/(auth)/login/actions.ts        — Server action
  src/lib/auth/login.ts                  — Business logic
  src/lib/auth/types.ts                  — Types
  src/components/auth/LoginForm.tsx       — Form

IMPLEMENTED:
  ✓ Email + password login with "remember me"
  ✓ Account lockout after 5 failed attempts (15 min)
  ✓ Rate limiting (10 req/min per IP)
  ✓ Generic error messages (enumeration prevention)
  ✓ JWT session with 15-min access + 7-day refresh token
  ✓ Secure cookies (httpOnly, secure, sameSite: strict)
  ✓ 4 events emitted (success, failed, locked, unverified)

NEEDS YOUR WORK:
  ⚠ Database queries (using mock data — swap in your ORM)
  ⚠ Rate limiting store (needs Redis or similar)
  ⚠ Email sending (verification emails)

DEMO CREDENTIALS (mock data):
  Email: demo@example.com | Password: Password1
```

## Framework Patterns

Use the target framework's idiomatic file structure. Here are examples — but adapt to whatever the user asks for:

### Next.js (App Router)
```
src/app/{route}/page.tsx           — Server component (page)
src/app/{route}/actions.ts         — Server actions
src/lib/{category}/{feature}.ts    — Business logic
src/lib/{category}/types.ts        — Shared types
src/components/{category}/{Form}.tsx — Client form
```

### Express
```
src/routes/{category}/{feature}.ts     — Route + handler
src/services/{category}/{feature}.ts   — Business logic
src/validators/{category}/{feature}.ts — Zod/Joi validation
src/types/{category}.ts                — Types
```

### Laravel
```
app/Http/Controllers/{Category}/{Feature}Controller.php
app/Http/Requests/{Category}/{Feature}Request.php
app/Services/{Category}/{Feature}Service.php
resources/views/{category}/{feature}.blade.php
routes/{category}.php
```

### C# / ASP.NET
```
Controllers/{Category}/{Feature}Controller.cs
Services/{Category}/{Feature}Service.cs
Models/{Category}/{Feature}Request.cs
Models/{Category}/{Feature}Response.cs
```

### Angular
```
src/app/{category}/{feature}/{feature}.component.ts
src/app/{category}/{feature}/{feature}.component.html
src/app/{category}/{feature}/{feature}.service.ts
src/app/{category}/{feature}/{feature}.model.ts
```

### Rust (Actix / Axum)
```
src/handlers/{category}/{feature}.rs
src/services/{category}/{feature}.rs
src/models/{category}.rs
src/errors/{category}.rs
```

### Python (Django / FastAPI)
```
{category}/views.py or {category}/routes.py
{category}/services/{feature}.py
{category}/models.py
{category}/schemas.py
```

### Any Other Framework
Follow that framework's conventions. The blueprint gives you WHAT to build — you decide the file structure, naming patterns, and idioms that are standard for the target.

## RFC 2119 Rule Strength — MUST / SHOULD / MAY

Rules in blueprints may be prefixed with RFC 2119 strength keywords. Enforce them accordingly:

| Prefix | Meaning | Code generation behaviour |
|--------|---------|--------------------------|
| `MUST:` or `SHALL:` | Absolute requirement | Always implement. Never omit. Fail the generation if you can't satisfy it. |
| `SHOULD:` | Strongly recommended | Implement by default. If skipping, add a `// TODO: [SHOULD] reason` comment. |
| `MAY:` | Optional enhancement | Implement only if the user explicitly asked for it or it's trivially free. |
| *(no prefix)* | Treat as `SHOULD:` | Implement by default. |

**Examples:**
```yaml
rules:
  security:
    - "MUST: Passwords must be hashed with bcrypt (min cost 12)"
    - "MUST: Rate limit login to 5 attempts per 15 minutes per IP"
    - "SHOULD: Log failed login attempts with IP and timestamp"
    - "MAY: Send login notification email to user"
```

Generated code **must** implement both MUST rules above. It **should** implement the SHOULD rule. It **may** skip the MAY rule unless requested.

## Non-Negotiable Rules

1. **Security constraints are mandatory** — `constant_time: true` means bcrypt.compare, not `===`. `generic_message: true` means identical error for wrong-user and wrong-password. No exceptions.
2. **Every outcome must have a code path** — if the blueprint says it can happen, the code must handle it.
3. **Use blueprint values, not your own** — `max_attempts: 5` means 5, not 3 or 10.
4. **Add `// FDL: {path}` comments** — so developers can trace code back to the blueprint.
5. **Outcomes > flows** — when both exist, implement from outcomes. Flows are for documentation.
