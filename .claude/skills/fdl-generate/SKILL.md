---
name: fdl-generate
description: Generate implementation code from an FDL blueprint for a specific framework
user_invocable: true
command: fdl-generate
arguments: "<feature> <framework>"
---

# FDL Generate — Code Generation from Blueprints

Generate a complete implementation of a feature from its FDL blueprint, targeting a specific framework.

## Usage

```
/fdl-generate login nextjs
/fdl-generate signup laravel
/fdl-generate password-reset express
```

## Arguments

- `<feature>` — The blueprint feature name (e.g., `login`, `signup`, `password-reset`)
- `<framework>` — Target framework (e.g., `nextjs`, `express`, `laravel`, `flutter`, `payload_cms`)

## Workflow

### Step 1: Load the Blueprint

1. Find the blueprint file: `blueprints/**/{feature}.blueprint.yaml`
2. Parse the YAML
3. If not found, list available blueprints and ask the user

### Step 2: Load Related Blueprints

1. Read the `related` section
2. For `required` relationships, load those blueprints too
3. Show the user the dependency graph:
   ```
   login
     ├── signup (required)
     ├── password-reset (recommended)
     └── mfa (optional)
   ```
4. Ask: "Generate just login, or include related features?"

### Step 3: Read Framework Extensions

1. Check `extensions.{framework}` in the blueprint
2. If the framework has specific overrides (routes, middleware, etc.), apply them
3. If no extension exists for this framework, use sensible defaults

### Step 4: Generate Code

For each feature, generate ALL of the following:

#### API / Backend
- **Route handler** — Endpoint that processes the feature
- **Validation** — Server-side input validation from `fields[].validation`
- **Business logic** — Implement every flow (happy_path + all error flows)
- **Error responses** — Use the `errors` section for response codes and messages
- **Security rules** — Rate limiting, lockout, constant-time comparison, etc.
- **Events** — Emit events from the `events` section (even if just console.log placeholders)

#### Frontend / UI
- **Form component** — Fields from `fields` section with client-side validation
- **Layout** — Based on `ui_hints` (or sensible defaults if no hints)
- **Error display** — Map error codes to user-facing messages
- **Links** — Related feature links from `ui_hints.links`
- **Loading states** — From `ui_hints.loading`
- **Accessibility** — From `ui_hints.accessibility`

#### Types / Interfaces
- **Input type** — TypeScript interface from `fields`
- **Error type** — Union type from `errors`
- **Event types** — From `events`

### Step 5: Validate Against Blueprint

After generating, self-check:
- [ ] Every field from `fields` is present in the form
- [ ] Every validation rule is implemented (client AND server)
- [ ] Every flow from `flows` is handled
- [ ] Every error from `errors` has a code path that returns it
- [ ] Every security rule from `rules` is implemented
- [ ] Related feature links are present in the UI
- [ ] Events are emitted at the correct points

### Step 6: Output

Show the user:
1. File list with paths
2. The generated code
3. A checklist of what was implemented vs what's in the blueprint
4. Any rules that couldn't be auto-generated (e.g., "CAPTCHA requires a third-party key")

## Framework-Specific Patterns

### Next.js (App Router)
```
src/app/(auth)/login/page.tsx          — Page component
src/app/(auth)/login/actions.ts        — Server actions
src/lib/auth/login.ts                  — Business logic
src/lib/auth/types.ts                  — TypeScript types
src/components/auth/LoginForm.tsx       — Client form component
```

### Express
```
src/routes/auth/login.ts               — Route handler
src/middleware/auth/rate-limit.ts       — Rate limiting
src/services/auth/login.ts             — Business logic
src/validators/auth/login.ts           — Input validation
src/types/auth.ts                      — TypeScript types
```

### Laravel
```
app/Http/Controllers/Auth/LoginController.php
app/Http/Requests/Auth/LoginRequest.php
app/Services/Auth/LoginService.php
resources/views/auth/login.blade.php
routes/auth.php
```

## Important Rules

1. **Never skip security rules** — If the blueprint says `constant_time: true`, the generated code MUST use constant-time comparison
2. **Never leak information** — If `generic_message: true`, the code must return the same error for user-not-found and wrong-password
3. **Implement ALL flows** — Not just happy_path. Every error flow must have a code path
4. **Comments reference the blueprint** — Add `// FDL: rules.security.max_attempts` style comments so developers can trace back to the spec
5. **Don't hardcode values** — Use the blueprint values (max_attempts: 5, lockout_duration: 15, etc.), don't invent your own
