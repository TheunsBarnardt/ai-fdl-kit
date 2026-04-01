# Claude Feature Definition Language (FDL)

A framework-agnostic specification for defining software features. Blueprints describe **what** a feature must do — not **how** to build it. AI or developers then generate the implementation for any stack.

## The Problem

Every developer rebuilds the same features (login, signup, CRUD) from scratch. Every time, something gets missed — rate limiting, lockout, email verification, error codes. AI tools guess what "build login" means differently each time.

## The Solution

FDL blueprints are YAML files that define:
- **Fields** — inputs with validation rules
- **Rules** — business logic, security, limits
- **Flows** — user journeys (happy path + edge cases)
- **Events** — signals other features can listen to
- **Relationships** — how features connect to each other
- **Errors** — standardized error codes and messages

## Quick Start

```bash
# Validate all blueprints against the schema
node scripts/validate.js

# Generate code from a blueprint (via Claude Code skill)
# /fdl-generate login nextjs
```

## Project Structure

```
claude-fdl/
  schema/
    blueprint.schema.yaml    # Meta-schema — validates all blueprints
  blueprints/
    auth/
      login.blueprint.yaml
      signup.blueprint.yaml
      password-reset.blueprint.yaml
      email-verification.blueprint.yaml
      logout.blueprint.yaml
    data/
      crud.blueprint.yaml
      search.blueprint.yaml
    access/
      roles.blueprint.yaml
      permissions.blueprint.yaml
  .claude/
    skills/
      fdl-generate/          # Claude Code skill for code generation
  scripts/
    validate.js              # Blueprint validation tool
  tests/
    validate.test.js         # Schema validation tests
  docs/
    SPEC.md                  # Full specification reference
```

## Blueprint Example

```yaml
feature: login
version: "1.0.0"
description: Authenticate a user with email and password
category: auth

fields:
  - name: email
    type: email
    required: true
    validation:
      - type: email
        message: Must be a valid email

rules:
  security:
    max_attempts: 5
    lockout_duration_minutes: 15

flows:
  happy_path:
    1: validate_fields
    2: lookup_user
    3: compare_password
    4: generate_token
    5: redirect:dashboard

related:
  - feature: signup
    type: required
  - feature: password-reset
    type: recommended
```

## Design Principles

1. **Framework-agnostic** — The blueprint defines behavior, not implementation
2. **Composable** — Features reference each other via relationships
3. **Opinionated defaults, overridable everything** — Sensible security out of the box
4. **Human-readable** — YAML with comments that teach best practices
5. **Machine-parseable** — AI reads the spec and generates correct code
6. **Validated** — JSON Schema ensures blueprints are well-formed

## Roadmap

- [x] v0.1.0 — Auth Pack (login, signup, password-reset)
- [ ] v0.2.0 — Data Pack (CRUD, search, file-upload)
- [ ] v0.3.0 — Access Pack (roles, permissions, MFA)
- [ ] v0.4.0 — Claude Code native skill
- [ ] v1.0.0 — Public spec + community blueprints

## License

MIT
